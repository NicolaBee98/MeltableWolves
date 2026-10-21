import { eMimoCopiante, conRuolo } from '../../data/assegnazione'
import { roundMorteDiurna, anticoDiventaVillico, propagaUnzione } from '../../data/effettiNotte'
import { conPotere, primaVitaAntico, cavalieriDi } from '../../data/eventiSpeciali'

// patch che riporta in vita un giocatore la cui morte era stata dichiarata
// per errore (un tap sbagliato durante il rogo o un evento speciale).
// Condivisa da GiornoPanel e AlbaPanel. Oltre a vivo/causa/notte ripristina
// ciò che la morte aveva già scritto sul giocatore stesso: la carta del
// Fantasma Onnisciente, il potere "una tantum" speso nel morire (Alchimista,
// Boia) e l'identità dello Scemo del Villaggio, che si rivela solo morendo.
// Le conseguenze su altri giocatori (crepacuore del partner, eredità
// dell'Apprendista...) le disfa annullaMorte di usePartita, se disponibile.
export function patchAnnullaMorte(giocatore) {
  const patch = { vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoGiorno: undefined, mortoDa: undefined, giustiziatoDa: undefined }
  if (!giocatore) return patch
  if (giocatore.eFantasmaOnnisciente) patch.eFantasmaOnnisciente = false
  // il potere del Boia resta su chi ha giustiziato, non sulla vittima (vedi
  // annullaMorteCompleta); solo se si è giustiziato da solo torna a lui
  const poteri = giocatore.poteriUsati ?? []
  const daTogliere = (p) => p === 'alchimista-esplosione' || (p === 'boia-giustizia' && giocatore.giustiziatoDa === giocatore.id)
  if (poteri.some(daTogliere)) patch.poteriUsati = poteri.filter((p) => !daTogliere(p))
  // il Mimo-Scemo ha il ruolo dal setup: non va cancellato (poteriUsati no, lo Scemo non ne ha)
  if (giocatore.ruoloSlug === 'scemo-del-villaggio' && !eMimoCopiante(giocatore)) {
    patch.ruoloSlug = undefined
    patch.storiaRuoli = (giocatore.storiaRuoli ?? []).filter((r) => r !== 'scemo-del-villaggio')
  }
  return patch
}

// annullaMorte (usePartita, opzionale) disfa la catena dalla snapshot; poi
// si applica comunque la patch sul giocatore stesso (idempotente).
export function annullaMorteCompleta(id, giocatori, aggiornaGiocatore, annullaMorte) {
  const g = giocatori.find((x) => x.id === id)
  annullaMorte?.(id)
  aggiornaGiocatore(id, patchAnnullaMorte(g))
  // giustiziato dal Boia: il potere spetta (di nuovo) a lui, non alla vittima
  const boia = g?.giustiziatoDa && g.giustiziatoDa !== id ? giocatori.find((x) => x.id === g.giustiziatoDa) : undefined
  if (boia) aggiornaGiocatore(boia.id, { poteriUsati: (boia.poteriUsati ?? []).filter((p) => p !== 'boia-giustizia') })
}

// Il narratore scopre che il giocatore sbranato stanotte (ruolo ancora
// ignoto) era L'Antico: ha perso solo la prima vita. Torna vivo (annullaMorte
// disfa anche la catena, es. crepacuore), da ora è un Villico e resta
// `anticoSbranatoNotte` = la notte della morte (alla seconda morte muore
// davvero, vedi uccidiPatch). Un solo aggiornaGiocatore: storiaRuoli si
// scrive una volta sola.
export function dichiaraAnticoSbranato(id, giocatori, aggiornaGiocatore, annullaMorte) {
  const g = giocatori.find((x) => x.id === id)
  if (!g) return
  annullaMorte?.(id)
  // morto di giorno (rogo, Boia, esplosione, unzione, crepacuore da questi)
  // l'Antico maledice il villaggio; di notte no
  const giorno = roundMorteDiurna(g)
  aggiornaGiocatore(id, {
    ...patchAnnullaMorte(g),
    ...(giorno !== undefined && { villaggioMaledettoFinoA: giorno }),
    ruoloSlug: 'villico',
    storiaRuoli: [...(g.storiaRuoli ?? []), 'lantico', 'villico'],
    // morto di giorno (Boia, esplosione...): nessuna notte, ma il flag deve
    // restare definito (= prima vita persa); null non coincide mai con un round
    // e quindi non genera l'annuncio dell'alba
    anticoSbranatoNotte: g.mortoNotte ?? null,
  })
}

// Morte "sul colpo" nel giorno (Boia, Scemo, unzione, esplosione dell'Alchimista)
// o all'alba (Boia): `roundGiorno` = round del giorno in corso (= quello
// dell'Alba che lo precede + 1), scritto in `mortoGiorno` così l'Antico morto
// così, ancora ignoto, si può rivelare dagli Eventi speciali. Un Antico già
// noto con la prima vita intera sopravvive da Villico (vale per ogni causa,
// come uccidiPatch di notte). Ritorna true se il giocatore è morto davvero.
export function dichiaraColpo(id, giocatori, aggiornaGiocatore, roundGiorno, extra = {}) {
  const g = giocatori.find((x) => x.id === id)
  if (g && primaVitaAntico(g)) {
    // la prima vita consumata di giorno maledice il villaggio (come al rogo)
    aggiornaGiocatore(id, anticoDiventaVillico(g, roundGiorno))
    return false
  }
  aggiornaGiocatore(id, { ...extra, vivo: false, causaMorte: 'colpo', mortoGiorno: roundGiorno })
  return true
}

// il Boia si rivela solo giustiziando (pag. 8), di giorno o all'alba
export function dichiaraBoiaGiustizia(boiaId, vittimaId, giocatori, aggiornaGiocatore, roundGiorno) {
  const boia = giocatori.find((g) => g.id === boiaId)
  aggiornaGiocatore(boiaId, {
    ruoloSlug: 'boia',
    storiaRuoli: conRuolo(boia?.storiaRuoli, 'boia'),
    poteriUsati: conPotere(boia?.poteriUsati, 'boia-giustizia'),
  })
  dichiaraColpo(vittimaId, giocatori, aggiornaGiocatore, roundGiorno, { mortoDa: 'boia', giustiziatoDa: boiaId })
}

// Eventi speciali comuni a giorno (GiornoPanel) e alba (AlbaPanel): sempre
// con il round del giorno in corso, come dichiaraColpo.

// assegna l'identità di un ruolo a rivelazione diurna solo quando si
// rivela davvero, non preventivamente a inizio partita
export function dichiaraRivelazione(ruoloSlug, id, giocatori, aggiornaGiocatore, roundGiorno, annullaMorte) {
  const target = giocatori.find((g) => g.id === id)
  if (ruoloSlug === 'lantico' && target && !target.vivo) {
    dichiaraAnticoSbranato(id, giocatori, aggiornaGiocatore, annullaMorte)
    return
  }
  // la Suocera si rivela una volta sola (anche già nota: Mimo, o carta
  // data da Cartomante/Medium); il marcatore evita che l'evento si ripresenti
  aggiornaGiocatore(id, {
    ruoloSlug,
    storiaRuoli: conRuolo(target?.storiaRuoli, ruoloSlug),
    ...(ruoloSlug === 'suocera' && { poteriUsati: conPotere(target?.poteriUsati, 'suocera-rivelata') }),
    // l'Innocente (anche il Mimo che lo copia) si rivela una volta sola
    ...(ruoloSlug === 'innocente' && { poteriUsati: conPotere(target?.poteriUsati, 'innocente-rivelato') }),
    // lo Spilungone non muore al primo rogo: il marcatore (con il giorno) resta
    // anche dopo un reload, così l'esito del rogo si ricostruisce dallo stato
    ...(ruoloSlug === 'spilungone' && { spilungoneRivelatoRound: roundGiorno }),
  })
}

export function dichiaraElezioneBorgomastro(id, giocatori, aggiornaGiocatore) {
  giocatori.filter((g) => g.eBorgomastro).forEach((g) => aggiornaGiocatore(g.id, { eBorgomastro: false }))
  aggiornaGiocatore(id, { eBorgomastro: true })
}

// sbagliare la rima rivela e uccide lo Scemo del Villaggio nello stesso
// istante (pag. 20): stessa logica del Boia/Alchimista, identità mai
// assegnata in anticipo
export function dichiaraScemoSbaglia(id, giocatori, aggiornaGiocatore, roundGiorno) {
  const target = giocatori.find((g) => g.id === id)
  dichiaraColpo(id, giocatori, aggiornaGiocatore, roundGiorno, {
    ruoloSlug: 'scemo-del-villaggio',
    mortoDa: 'scemo',
    storiaRuoli: conRuolo(target?.storiaRuoli, 'scemo-del-villaggio'),
  })
}

// l'Unto che dice "sì" o "no" muore sul colpo e trasmette l'unzione ai
// vivi ai suoi due fianchi (pag. 22). Se un Cavaliere lo salva non muore:
// l'unzione non si trasmette
export function dichiaraMorteUnzione(id, giocatori, aggiornaGiocatore, roundGiorno) {
  if (!dichiaraColpo(id, giocatori, aggiornaGiocatore, roundGiorno, { mortoDa: 'unzione' }) || cavalieriDi(giocatori, id).length > 0) return
  for (const [vicinoId, patch] of Object.entries(propagaUnzione(giocatori, id))) {
    aggiornaGiocatore(vicinoId, patch)
  }
}

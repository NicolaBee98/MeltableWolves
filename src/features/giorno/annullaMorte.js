import { eMimoCopiante } from '../../data/assegnazione'

// patch che riporta in vita un giocatore la cui morte era stata dichiarata
// per errore (un tap sbagliato durante il rogo o un evento speciale).
// Condivisa da GiornoPanel e AlbaPanel. Oltre a vivo/causa/notte ripristina
// ciò che la morte aveva già scritto sul giocatore stesso: la carta del
// Fantasma Onnisciente, il potere "una tantum" speso nel morire (Alchimista,
// Boia) e l'identità dello Scemo del Villaggio, che si rivela solo morendo.
// Le conseguenze su altri giocatori (crepacuore del partner, eredità
// dell'Apprendista...) le disfa annullaMorte di usePartita, se disponibile.
export function patchAnnullaMorte(giocatore) {
  const patch = { vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoGiorno: undefined, mortoDa: undefined }
  if (!giocatore) return patch
  if (giocatore.eFantasmaOnnisciente) patch.eFantasmaOnnisciente = false
  const poteri = giocatore.poteriUsati ?? []
  if (poteri.some((p) => p === 'boia-giustizia' || p === 'alchimista-esplosione')) {
    patch.poteriUsati = poteri.filter((p) => p !== 'boia-giustizia' && p !== 'alchimista-esplosione')
  }
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
  annullaMorte?.(id)
  aggiornaGiocatore(id, patchAnnullaMorte(giocatori.find((g) => g.id === id)))
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
  aggiornaGiocatore(id, {
    ...patchAnnullaMorte(g),
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
  if (g?.ruoloSlug === 'lantico' && g.anticoSbranatoNotte === undefined) {
    aggiornaGiocatore(id, { ruoloSlug: 'villico', storiaRuoli: [...(g.storiaRuoli ?? []), 'villico'], anticoSbranatoNotte: null })
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
    storiaRuoli: [...(boia?.storiaRuoli ?? []), 'boia'],
    poteriUsati: [...(boia?.poteriUsati ?? []), 'boia-giustizia'],
  })
  dichiaraColpo(vittimaId, giocatori, aggiornaGiocatore, roundGiorno)
}

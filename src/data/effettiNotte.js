import { eLupo } from './roles'
import { viciniPiuViciniChe, viciniVivi } from './vicinanza'

// Cortigiana, Nano e Criceto Malvagio non possono essere uccisi
// direttamente dai lupi di notte (libretto pag. 12, 12, 18): usata da
// risolviAttaccoBranco per non applicare mai una morte a nessuno dei tre,
// qualunque bersaglio scelga il branco.
export const RUOLI_IMMUNI_AL_BRANCO = ['cortigiana', 'nano', 'criceto-malvagio']

// La Cortigiana non compare tra le chip da scegliere per il branco: la sua
// morte è sempre un effetto indiretto (visita a un lupo, o il suo cliente
// sbranato — mai una scelta diretta del branco). Nano e Criceto Malvagio
// invece restano selezionabili (hanno la stessa passiva: "non può essere
// ucciso di notte", pag. 12/18): i lupi provano a sbranarli e falliscono,
// sceglierli si traduce in "nessuno muore questa notte" con un avviso.
export const RUOLI_NON_SELEZIONABILI_DAL_BRANCO = ['cortigiana']

// Nano e Criceto Malvagio non possono morire di notte per il morso del
// Chupacabra (libretto pag. 12, 18), a differenza della Cortigiana che ne è
// immune solo per il branco: possono comunque morire per la pozione mortale
// della Strega (uccidiPatch non li esclude) o al rogo.
export const RUOLI_IMMUNI_AL_CHUPACABRA = ['nano', 'criceto-malvagio']

// il/i lupi vivi più vicini al Berserker: normalmente uno solo, ma a parità
// di distanza (un lupo a sinistra e uno a destra) ne ritorna due, e tocca al
// narratore scegliere (vedi risolviAttaccoBranco più sotto)
export function berserkerLupiCandidati(giocatori, targetId) {
  return viciniPiuViciniChe(giocatori, targetId, (g) => g.vivo && eLupo(g.ruoloSlug))
}

// Applica il morso del branco a un bersaglio, comprese le reazioni
// speciali di alcuni ruoli quando vengono sbranati. Ritorna una mappa
// {id: patch} da applicare con aggiornaGiocatore, eventualmente vuota se il
// bersaglio è immune o protetto. `berserkerLupoSceltoId` va passato solo
// quando berserkerLupiCandidati ha già segnalato più di un candidato a
// parità di distanza: il chiamante deve averlo chiesto al narratore prima.
export function risolviAttaccoBranco(giocatori, targetId, round, ruoliBranco, berserkerLupoSceltoId) {
  const target = giocatori.find((g) => g.id === targetId)
  if (!target || RUOLI_IMMUNI_AL_BRANCO.includes(target.ruoloSlug)) return {}

  // Mezzosangue: non muore, diventa lupo mannaro (pag. 18) — ma se è protetto
  // il morso non lo raggiunge, quindi non si trasforma
  if (target.ruoloSlug === 'mezzosangue') {
    if (target.condizioni.includes('protetto')) return {}
    return {
      [target.id]: {
        ruoloSlug: 'lupo-mannaro',
        storiaRuoli: [...(target.storiaRuoli ?? []), 'lupo-mannaro'],
      },
    }
  }

  const patchTarget = uccidiPatch(target, round, { mortoDa: 'branco' })
  if (!patchTarget) return {} // protetto: il morso non ha effetto, niente reazioni

  const patches = { [target.id]: patchTarget }

  // Berserker: uccide il lupo vivo più vicino a sé (pag. 10). A parità di
  // distanza la scelta tocca al narratore (berserkerLupoSceltoId).
  if (target.ruoloSlug === 'berserker') {
    const candidati = berserkerLupiCandidati(giocatori, target.id)
    const lupo = candidati.length <= 1 ? candidati[0] : candidati.find((g) => g.id === berserkerLupoSceltoId)
    if (lupo) {
      const patchLupo = uccidiPatch(lupo, round)
      if (patchLupo) patches[lupo.id] = patchLupo
    }
  }

  // Ubriaco: l'alcol nel sangue stordisce il branco la notte successiva (pag. 22)
  if (target.ruoloSlug === 'ubriaco') {
    for (const g of giocatori) {
      if (ruoliBranco.includes(g.ruoloSlug) && g.vivo) {
        patches[g.id] = { brancoStorditoFinoA: round + 1 }
      }
    }
  }

  // Cucciolo di Lupo Mannaro morso dal branco: vedi attivaVendettaCucciolo,
  // che copre anche questo caso (si applica a ogni morte del Cucciolo,
  // qualunque sia la causa, non solo il morso del branco)

  return patches
}

// "Se viene ucciso, i lupi mannari sbranano due persone in una notte per
// vendetta" (pag. 13): il regolamento non limita la causa della morte del
// Cucciolo al morso del branco (a differenza di Berserker/Ubriaco, che
// reagiscono solo se sbranati), quindi va agganciata alla morte generica
// (rogo, Strega, Chupacabra inclusi), non solo alla risoluzione dell'attacco
// notturno del branco.
//
// Con il Mimo che copia il Cucciolo i Cuccioli sono due, ma la vendetta è una
// sola per partita: scatta alla morte del primo (o del Mimo-Cucciolo, o del
// Cucciolo vero) e `vendettaInnescata` sul morto impedisce un secondo innesco
// (es. due Cuccioli morti nella stessa notte). annullaMorte lo ripristina.
export function attivaVendettaCucciolo(giocatori, idAppenaMorto, ruoliBranco) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (morto?.ruoloSlug !== 'cucciolo-di-lupo-mannaro') return giocatori
  if (giocatori.some((g) => g.vendettaInnescata)) return giocatori

  return giocatori.map((g) => {
    if (g.id === idAppenaMorto) return { ...g, vendettaInnescata: true }
    return ruoliBranco.includes(g.ruoloSlug) && g.vivo ? { ...g, vendettaCucciolo: true } : g
  })
}

export function aggiungiCondizionePatch(giocatore, condizione) {
  if (giocatore.condizioni.includes(condizione)) return null
  return { condizioni: [...giocatore.condizioni, condizione] }
}

// Se l'Unto dice "sì" o "no" muore sul colpo, trasmettendo l'unzione ai
// vivi ai suoi due fianchi (pag. 22): ritorna una mappa {id: patch} da
// applicare con aggiornaGiocatore, calcolata sui posti a sedere PRIMA che il
// morto venga rimosso dal giro (viciniVivi lo salta comunque, essendo lui
// stesso morto solo un istante dopo).
export function propagaUnzione(giocatori, idMorto) {
  const { sinistra, destra } = viciniVivi(giocatori, idMorto)
  const patch = {}
  for (const vicino of [sinistra, destra]) {
    if (!vicino) continue
    const p = aggiungiCondizionePatch(vicino, 'unto')
    if (p) patch[vicino.id] = p
  }
  return patch
}

// `mortoDa` distingue chi ha causato la morte notturna (branco, chupacabra,
// strega...), a differenza di causaMorte che resta genericamente 'notte' per
// tutte: serve a chi ha bisogno di sapere il "come", non solo il "quando"
// (es. la Cortigiana muore solo se il cliente è sbranato dal branco o dal
// Chupacabra, non se la Strega lo avvelena, vedi risolviCortigiana).
export function uccidiPatch(giocatore, round, { ignoraProtezione = false, mortoDa } = {}) {
  if (!ignoraProtezione && giocatore.condizioni.includes('protetto')) return null
  // L'Antico ha due vite: se perde la prima di notte sopravvive "senza
  // conseguenze" (pag. 16), ma NON in silenzio: resta 'lantico' con il flag
  // `anticoSbranatoNotte: round` (vivo, vita sola), così annunciAlba lo fa
  // emergere all'alba (vedi alba.js) e la UI lo rivela e lo converte in
  // Villico. Se il flag c'è già, la seconda vita è persa: muore normalmente.
  if (giocatore.ruoloSlug === 'lantico' && giocatore.anticoSbranatoNotte === undefined) {
    return { vivo: true, anticoSbranatoNotte: round }
  }
  return { vivo: false, causaMorte: 'notte', mortoNotte: round, mortoDa }
}

export function resuscitaPatch(giocatore, round) {
  if (giocatore.vivo) return null
  return {
    vivo: true,
    causaMorte: undefined,
    mortoNotte: undefined,
    mortoDa: undefined,
    // la Cortigiana non deve ritrovarsi con una visita di prima della morte
    visitaNotturna: null,
    condizioni: giocatore.condizioni.includes('resuscitato') ? giocatore.condizioni : [...giocatore.condizioni, 'resuscitato'],
    resuscitatoNotte: round,
  }
}

export function usatoStanotte(giocatori, ruoli, potereSlug) {
  return giocatori.some((g) => ruoli.includes(g.ruoloSlug) && (g.usiNotte ?? []).includes(potereSlug))
}

export function segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potereSlug) {
  giocatori
    .filter((g) => ruoli.includes(g.ruoloSlug))
    .forEach((g) => aggiornaGiocatore(g.id, { usiNotte: [...(g.usiNotte ?? []), potereSlug] }))
}

// inverso di segnaUsoStanotte: ripensando una scelta (deselezione) il potere
// torna non usato per questa notte
export function annullaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potereSlug) {
  giocatori
    .filter((g) => ruoli.includes(g.ruoloSlug))
    .forEach((g) => aggiornaGiocatore(g.id, { usiNotte: (g.usiNotte ?? []).filter((p) => p !== potereSlug) }))
}

// Il Mimo assume letteralmente il ruoloSlug del bersaglio imitato (vedi
// AzioneMimo.jsx): da quel momento DUE giocatori condividono lo stesso
// ruoloSlug, ma il regolamento prevede una sola azione condivisa, non due
// indipendenti. Le azioni che scrivono un dato specifico dell'attore (es.
// l'esito di un'indagine) lo applicano quindi a TUTTI i giocatori con quel
// ruoloSlug invece che al primo trovato: qualunque dei due l'app consulti
// in seguito, i dati restano identici e coerenti. `patch` può essere un
// oggetto fisso, o una funzione (giocatore) => patch quando il valore da
// scrivere dipende da un campo che varia per persona (es. poteriUsati, che
// può già contenere marcatori diversi da un ruolo precedente).
export function aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlug, patch) {
  giocatori
    .filter((g) => g.ruoloSlug === ruoloSlug)
    .forEach((g) => aggiornaGiocatore(g.id, typeof patch === 'function' ? patch(g) : patch))
}

// Ogni giocatore innamorato ricorda i propri partner in `innamoratiCon` (le
// coppie sono più d'una se il Mimo copia il Sacerdote): al lutto muoiono solo
// i partner del morto, non tutti gli innamorati. Senza `innamoratiCon` (dati
// vecchi o condizione data a mano) vale la regola semplice: muoiono tutti gli
// innamorati rimasti. I partner morti per crepacuore innescano a loro volta il
// proprio lutto (propagaMorti), quindi una catena tra coppie che si
// sovrappongono (A-X, X-B) arriva fino in fondo.
// Il partner eredita il mortoNotte di chi ha innescato il lutto (compare
// all'alba se il decesso era notturno), tranne per un rogo: il rogo ha
// mortoNotte = round del giorno, e il partner verrebbe riannunciato come
// morto "di notte" (UI: serve che AlbaPanel non mostri causaMorte
// 'crepacuore' con mortoNotte undefined — già così con mortoNotte === round).
export function applicaCrepacuore(giocatori, idAppenaMorto) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (!morto?.condizioni?.includes('innamorato')) return giocatori

  const partner = morto.innamoratiCon ?? []
  const eIlSuoPartner = (g) => (partner.length ? partner.includes(g.id) : g.condizioni.includes('innamorato'))
  return giocatori.map((g) =>
    g.id !== idAppenaMorto && g.vivo && eIlSuoPartner(g)
      ? { ...g, vivo: false, causaMorte: 'crepacuore', mortoNotte: morto.causaMorte === 'rogo' ? undefined : morto.mortoNotte }
      : g,
  )
}

// "unto" (Untore) e "trasformato" (Maga) durano fino al calar della notte
// successiva a quella in cui sono stati inflitti (pag. 17, 22): ritorna solo
// i giocatori che hanno ancora una di queste condizioni, con la condizione
// già ripulita, pronti per essere passati a aggiornaGiocatore uno a uno.
export function daRipulireCambioNotte(giocatori) {
  return giocatori
    .filter((g) => (g.condizioni ?? []).some((c) => c === 'unto' || c === 'trasformato'))
    .map((g) => ({ id: g.id, condizioni: g.condizioni.filter((c) => c !== 'unto' && c !== 'trasformato') }))
}

// chi acceca il Veggente (pag. 20): esportata così sia il resolver di morte
// sia AzioneIndagine.jsx leggono lo stesso slug invece di due letterali
// indipendenti che potrebbero scollegarsi
export const RUOLO_CAUSA_ACCECAMENTO = 'polpo-mannaro'

// il Veggente accecato dal Polpo Mannaro torna a vedere normalmente non
// appena il Polpo muore (pag. 20: "fino alla morte del Polpo")
export function rimuoviAccecamentoSeMortoPolpo(giocatori, idAppenaMorto) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (morto?.ruoloSlug !== RUOLO_CAUSA_ACCECAMENTO) return giocatori
  // con il Mimo-Polpo l'accecamento dura fino alla morte di TUTTI i polpi
  if (giocatori.some((g) => g.vivo && g.ruoloSlug === RUOLO_CAUSA_ACCECAMENTO)) return giocatori

  return giocatori.map((g) =>
    (g.condizioni ?? []).includes('accecato')
      ? { ...g, condizioni: g.condizioni.filter((c) => c !== 'accecato') }
      : g,
  )
}

// "Alla morte del primo lupo, il cucciolo diventa adulto perdendo questo
// potere" (pag. 13): il primo lupo (eLupo, non la fazione) a morire
// (annunciato all'alba o al rogo) fa maturare il Cucciolo in un Lupo
// Mannaro semplice, perdendo la vendetta doppia. Se il morto è il Cucciolo
// stesso non c'è nulla da maturare.
export function maturaCucciolo(giocatori, idAppenaMorto) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (!morto || !eLupo(morto.ruoloSlug)) return giocatori

  return giocatori.map((g) =>
    g.vivo && g.ruoloSlug === 'cucciolo-di-lupo-mannaro'
      ? { ...g, ruoloSlug: 'lupo-mannaro', storiaRuoli: [...(g.storiaRuoli ?? []), 'lupo-mannaro'] }
      : g,
  )
}

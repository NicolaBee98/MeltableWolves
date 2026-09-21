import { ROLES } from './roles'
import { vicinoPiuVicinoChe } from './vicinanza'

function fazioneDi(giocatore) {
  return ROLES.find((r) => r.slug === giocatore.ruoloSlug)?.fazione
}

// Cortigiana, Nano e Criceto Malvagio non possono essere uccisi
// direttamente dai lupi di notte (libretto pag. 12, 12, 18): vengono
// esclusi anche dai candidati in AzioneBrancoLupi.jsx, questo è un
// controllo difensivo nel resolver condiviso.
const RUOLI_IMMUNI_AL_BRANCO = ['cortigiana', 'nano', 'criceto-malvagio']

// Applica il morso del branco a un bersaglio, comprese le reazioni
// speciali di alcuni ruoli quando vengono sbranati. Ritorna una mappa
// {id: patch} da applicare con aggiornaGiocatore, eventualmente vuota se il
// bersaglio è immune o protetto.
export function risolviAttaccoBranco(giocatori, targetId, round, ruoliBranco) {
  const target = giocatori.find((g) => g.id === targetId)
  if (!target || RUOLI_IMMUNI_AL_BRANCO.includes(target.ruoloSlug)) return {}

  // Mezzosangue: non muore, diventa lupo mannaro (pag. 18)
  if (target.ruoloSlug === 'mezzosangue') {
    return {
      [target.id]: {
        ruoloSlug: 'lupo-mannaro',
        storiaRuoli: [...(target.storiaRuoli ?? []), 'lupo-mannaro'],
      },
    }
  }

  const patchTarget = uccidiPatch(target, round)
  if (!patchTarget) return {} // protetto: il morso non ha effetto, niente reazioni

  const patches = { [target.id]: patchTarget }

  // Berserker: uccide il lupo vivo più vicino a sé (pag. 10)
  if (target.ruoloSlug === 'berserker') {
    const lupo = vicinoPiuVicinoChe(giocatori, target.id, (g) => g.vivo && fazioneDi(g) === 'lupi')
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

  // Cucciolo di Lupo Mannaro: il branco sbrana due vittime per vendetta (pag. 13)
  if (target.ruoloSlug === 'cucciolo-di-lupo-mannaro') {
    for (const g of giocatori) {
      if (ruoliBranco.includes(g.ruoloSlug) && g.vivo && g.id !== target.id) {
        patches[g.id] = { vendettaCucciolo: true }
      }
    }
  }

  return patches
}

export function aggiungiCondizionePatch(giocatore, condizione) {
  if (giocatore.condizioni.includes(condizione)) return null
  return { condizioni: [...giocatore.condizioni, condizione] }
}

export function uccidiPatch(giocatore, round, { ignoraProtezione = false } = {}) {
  if (!ignoraProtezione && giocatore.condizioni.includes('protetto')) return null
  // L'Antico ha due vite: se perde la prima di notte, sopravvive e si rivela
  // "senza conseguenze", continuando a giocare da Villico normale (pag. 16)
  if (giocatore.ruoloSlug === 'lantico') {
    return { vivo: true, ruoloSlug: 'villico', storiaRuoli: [...(giocatore.storiaRuoli ?? []), 'villico'] }
  }
  return { vivo: false, causaMorte: 'notte', mortoNotte: round }
}

export function resuscitaPatch(giocatore, round) {
  if (giocatore.vivo) return null
  return { vivo: true, condizioni: [...giocatore.condizioni, 'resuscitato'], resuscitatoNotte: round }
}

export function usatoStanotte(giocatori, ruoli, potereSlug) {
  return giocatori.some((g) => ruoli.includes(g.ruoloSlug) && (g.usiNotte ?? []).includes(potereSlug))
}

export function segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potereSlug) {
  giocatori
    .filter((g) => ruoli.includes(g.ruoloSlug))
    .forEach((g) => aggiornaGiocatore(g.id, { usiNotte: [...(g.usiNotte ?? []), potereSlug] }))
}

// ponytail: assume una sola coppia di innamorati in gioco (nessun partnerId è
// tracciato). Se il narratore ne crea più di una a mano, muoiono tutti insieme
// al primo lutto: da rivedere con un legame per-coppia se servirà davvero.
// ponytail: il partner erdita il mortoNotte di chi ha innescato il lutto, così
// compare all'alba se il decesso scatenante era notturno — ma compare anche se
// era un rogo (causaMorte resta 'crepacuore', non tracciamo il "tipo" del
// trigger): raro, da rivedere se servirà davvero distinguerlo.
export function applicaCrepacuore(giocatori, idAppenaMorto) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (!morto?.condizioni?.includes('innamorato')) return giocatori

  return giocatori.map((g) =>
    g.id !== idAppenaMorto && g.vivo && g.condizioni.includes('innamorato')
      ? { ...g, vivo: false, causaMorte: 'crepacuore', mortoNotte: morto.mortoNotte }
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

// il Veggente accecato dal Polpo Mannaro torna a vedere normalmente non
// appena il Polpo muore (pag. 20: "fino alla morte del Polpo")
export function rimuoviAccecamentoSeMortoPolpo(giocatori, idAppenaMorto) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (morto?.ruoloSlug !== 'polpo-mannaro') return giocatori

  return giocatori.map((g) =>
    (g.condizioni ?? []).includes('accecato')
      ? { ...g, condizioni: g.condizioni.filter((c) => c !== 'accecato') }
      : g,
  )
}

// "Alla morte del primo lupo, il cucciolo diventa adulto perdendo questo
// potere" (pag. 13): il primo membro qualsiasi della fazione lupi a morire
// (annunciato all'alba o al rogo) fa maturare il Cucciolo in un Lupo
// Mannaro semplice, perdendo la vendetta doppia. Se il morto è il Cucciolo
// stesso non c'è nulla da maturare.
export function maturaCucciolo(giocatori, idAppenaMorto) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (!morto || fazioneDi(morto) !== 'lupi') return giocatori

  return giocatori.map((g) =>
    g.vivo && g.ruoloSlug === 'cucciolo-di-lupo-mannaro'
      ? { ...g, ruoloSlug: 'lupo-mannaro', storiaRuoli: [...(g.storiaRuoli ?? []), 'lupo-mannaro'] }
      : g,
  )
}

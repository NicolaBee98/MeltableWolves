import { ruoliAssegnabili, eMimoCopiante } from './assegnazione'
import { RUOLI_RIVELAZIONE_ALLA_MORTE } from './nightSteps'

// Ruoli con un evento tutto loro: Alchimista/Boia/Scemo del
// Villaggio perché la rivelazione diurna coincide con l'uso stesso del
// potere (si rivelano "facendo" l'azione, non prima); l'Innocente perché,
// pur non avendo un'azione a sé (è solo "mostra la carta"), è comunque
// un'iniziativa che il giocatore prende quando vuole — un pulsante dedicato
// evita il doppio passaggio "Rivelazione personaggio" -> unica opzione
// disponibile.
export const RIVELAZIONE_CONTESTUALE_AL_POTERE = ['alchimista', 'boia', 'scemo-del-villaggio', 'innocente']

// Ruoli che non sono mai una carta segreta in mano a un giocatore vivo, in
// nessun momento della partita: Fantasma Onnisciente/Suocera si ricevono
// solo alla morte, il Borgomastro è un titolo elettivo sopra un ruolo già
// posseduto, e i 4 di RIVELAZIONE_CONTESTUALE_AL_POTERE qui sopra si
// rivelano solo tramite il loro evento dedicato. Nessuno dei sette può
// quindi essere la risposta a "che ruolo/carta ha davvero questo
// giocatore?" — usata sia dal Mimo (AzioneMimo.jsx, quando copia
// un'identità ancora ignota) sia dalla Cartomante/Medium (AzioneRivelaRuolo.jsx):
// se uno di questi finisse comunque assegnato per errore da lì, quel
// giocatore diventerebbe per sempre irraggiungibile dal proprio evento
// dedicato (es. un Alchimista "copiato" che non può più far esplodere se
// stesso, pur restando bersaglio valido per l'esplosione di un altro).
export const RUOLI_NON_CARTA_SEGRETA = [...RUOLI_RIVELAZIONE_ALLA_MORTE, 'borgomastro', ...RIVELAZIONE_CONTESTUALE_AL_POTERE]

// Alchimista, Boia, Scemo del Villaggio e Innocente non hanno mai
// un'identità assegnata prima: si rivelano solo tramite il loro evento
// dedicato (rogo/esplosione, giustizia, rima sbagliata, o la semplice
// dichiarazione dell'Innocente — pag. 5, 8, 20). Il titolare è un vivo senza
// ruolo, finché il mazzo li prevede e nessuno li ha già usati (ruoliAssegnabili
// conta su storiaRuoli, mai sottratto). Il Mimo che li copia ha già lo slug ed
// è un attore a sé, con il proprio potere (poteriUsati per giocatore): resta
// candidato finché non l'ha speso. Lo Scemo muore rivelandosi, quindi non ha
// potere da spendere.
const POTERE_RIVELAZIONE = {
  boia: 'boia-giustizia',
  alchimista: 'alchimista-esplosione',
  innocente: 'innocente-rivelato',
}

export function candidatiRivelazione(slug, ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes(slug)) return []
  const titolare = ruoliAssegnabili([slug], giocatori, quantita).length > 0
  return giocatori.filter(
    (g) =>
      g.vivo &&
      ((titolare && !g.ruoloSlug) ||
        (g.ruoloSlug === slug && eMimoCopiante(g) && !(g.poteriUsati ?? []).includes(POTERE_RIVELAZIONE[slug]))),
  )
}

export function rivelazioneContestualeDisponibile(slug, ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes(slug)) return false
  return (
    ruoliAssegnabili([slug], giocatori, quantita).length > 0 ||
    candidatiRivelazione(slug, ruoliSelezionati, giocatori, quantita).length > 0
  )
}

// Bardo e Gallo Mannaro: ogni giocatore ha il proprio uso (il Mimo che li copia
// ne ha uno suo, spec 2.2); il primo vivo che non l'ha ancora speso
export function conPotereDisponibile(giocatori, slug, potere) {
  return giocatori.find((g) => g.ruoloSlug === slug && g.vivo && !(g.poteriUsati ?? []).includes(potere))
}

export function bardoDisponibile(giocatori) {
  return Boolean(conPotereDisponibile(giocatori, 'bardo', 'bardo-salta-notte'))
}

export function galloDisponibile(giocatori) {
  return Boolean(conPotereDisponibile(giocatori, 'gallo-mannaro', 'gallo-salta-giorno'))
}

// "Se viene ucciso, il villaggio dovrà eleggere un nuovo primo cittadino"
// (roles.js): l'elezione è un evento one-shot finché il Borgomastro in
// carica è vivo, si ripropone solo dopo la sua morte
export function borgomastroDisponibile(ruoliSelezionati, giocatori) {
  if (!ruoliSelezionati.includes('borgomastro')) return false
  return !giocatori.some((g) => g.eBorgomastro && g.vivo)
}

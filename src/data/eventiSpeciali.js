import { ruoliAssegnabili } from './assegnazione'
import { RUOLI_RIVELAZIONE_GIORNO } from './nightSteps'

// Ruoli con un evento tutto loro invece del generico "Rivelazione
// personaggio" (vedi ruoliRivelabili sotto): Alchimista/Boia/Scemo del
// Villaggio perché la rivelazione diurna coincide con l'uso stesso del
// potere (si rivelano "facendo" l'azione, non prima); l'Innocente perché,
// pur non avendo un'azione a sé (è solo "mostra la carta"), è comunque
// un'iniziativa che il giocatore prende quando vuole — un pulsante dedicato
// evita il doppio passaggio "Rivelazione personaggio" -> unica opzione
// disponibile.
const RIVELAZIONE_CONTESTUALE_AL_POTERE = ['alchimista', 'boia', 'scemo-del-villaggio', 'innocente']

// Alchimista, Boia, Scemo del Villaggio e Innocente non hanno mai
// un'identità assegnata prima: si rivelano solo tramite il loro evento
// dedicato (rogo/esplosione, giustizia, rima sbagliata, o la semplice
// dichiarazione dell'Innocente — pag. 5, 8, 20). Disponibili finché il
// mazzo li prevede e nessuno li ha già usati una volta (ruoliAssegnabili
// conta su storiaRuoli, mai sottratto, quindi restano "assegnati" per
// sempre dopo).
export function rivelazioneContestualeDisponibile(slug, ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes(slug)) return false
  return ruoliAssegnabili([slug], giocatori, quantita).length > 0
}

// Ruoli assegnabili tramite l'evento generico "Rivelazione personaggio":
// tutti i ruoli a rivelazione diurna tranne il Borgomastro (un titolo
// elettivo, non un'identità, con l'evento dedicato "Elezione Borgomastro")
// e quelli con un evento tutto loro (RIVELAZIONE_CONTESTUALE_AL_POTERE: se
// venissero anche assegnabili qui, un narratore che li rivelasse da questo
// menu per errore li segnerebbe "già assegnati" rendendo per sempre
// indisponibile il loro evento dedicato).
export function ruoliRivelabili(ruoliSelezionati, giocatori, quantita) {
  const candidati = RUOLI_RIVELAZIONE_GIORNO.filter(
    (slug) => !RIVELAZIONE_CONTESTUALE_AL_POTERE.includes(slug) && slug !== 'borgomastro' && ruoliSelezionati.includes(slug),
  )
  return ruoliAssegnabili(candidati, giocatori, quantita)
}

export function bardoDisponibile(giocatori) {
  const bardo = giocatori.find((g) => g.ruoloSlug === 'bardo' && g.vivo)
  return Boolean(bardo) && !(bardo.poteriUsati ?? []).includes('bardo-salta-notte')
}

export function galloDisponibile(giocatori) {
  const gallo = giocatori.find((g) => g.ruoloSlug === 'gallo-mannaro' && g.vivo)
  return Boolean(gallo) && !(gallo.poteriUsati ?? []).includes('gallo-salta-giorno')
}

// "Se viene ucciso, il villaggio dovrà eleggere un nuovo primo cittadino"
// (roles.js): l'elezione è un evento one-shot finché il Borgomastro in
// carica è vivo, si ripropone solo dopo la sua morte
export function borgomastroDisponibile(ruoliSelezionati, giocatori) {
  if (!ruoliSelezionati.includes('borgomastro')) return false
  return !giocatori.some((g) => g.eBorgomastro && g.vivo)
}

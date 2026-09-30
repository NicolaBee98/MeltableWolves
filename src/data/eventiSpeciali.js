import { ruoliAssegnabili } from './assegnazione'
import { RUOLI_RIVELAZIONE_GIORNO, RUOLI_RIVELAZIONE_ALLA_MORTE } from './nightSteps'

// Ruoli con un evento tutto loro invece del generico "Rivelazione
// personaggio" (vedi ruoliRivelabili sotto): Alchimista/Boia/Scemo del
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

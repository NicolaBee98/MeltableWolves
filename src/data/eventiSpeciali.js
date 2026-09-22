import { ruoliAssegnabili } from './assegnazione'
import { RUOLI_RIVELAZIONE_GIORNO } from './nightSteps'

// Ruoli la cui rivelazione diurna coincide con l'uso stesso del potere (si
// rivelano "facendo" l'azione, non prima): hanno un evento dedicato che
// chiede prima "chi è" e poi l'azione, invece di passare dal generico
// "Rivelazione personaggio" (vedi ruoliRivelabili sotto).
const RIVELAZIONE_CONTESTUALE_AL_POTERE = ['alchimista', 'boia']

// L'Alchimista si rivela solo quando viene messo al rogo (pag. 5): la sua
// identità non è mai assegnata prima. Disponibile finché il mazzo lo prevede
// e nessuno l'ha già usato una volta (ruoliAssegnabili conta su storiaRuoli,
// mai sottratto, quindi resta "assegnato" per sempre dopo il primo uso).
export function alchimistaDisponibile(ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes('alchimista')) return false
  return ruoliAssegnabili(['alchimista'], giocatori, quantita).length > 0
}

// Il Boia si rivela solo giustiziando (pag. 8): "può usare il suo potere
// soltanto una volta per partita, rivelandosi" — stessa logica dell'Alchimista.
export function boiaDisponibile(ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes('boia')) return false
  return ruoliAssegnabili(['boia'], giocatori, quantita).length > 0
}

// Ruoli assegnabili tramite l'evento generico "Rivelazione personaggio":
// tutti i ruoli a rivelazione diurna tranne il Borgomastro (un titolo
// elettivo, non un'identità, con l'evento dedicato "Elezione Borgomastro")
// e Alchimista/Boia (si rivelano solo usando il potere, vedi sopra: se
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

export function borgomastroDisponibile(ruoliSelezionati) {
  return ruoliSelezionati.includes('borgomastro')
}

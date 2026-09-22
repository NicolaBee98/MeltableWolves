import { ruoliAssegnabili } from './assegnazione'
import { RUOLI_RIVELAZIONE_GIORNO } from './nightSteps'

// L'Alchimista si rivela solo quando viene messo al rogo (pag. 5): la sua
// identità non è mai assegnata prima. Disponibile finché il mazzo lo prevede
// e nessuno l'ha già usato una volta (ruoliAssegnabili conta su storiaRuoli,
// mai sottratto, quindi resta "assegnato" per sempre dopo il primo uso).
export function alchimistaDisponibile(ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes('alchimista')) return false
  return ruoliAssegnabili(['alchimista'], giocatori, quantita).length > 0
}

// Ruoli assegnabili tramite l'evento generico "Rivelazione personaggio":
// tutti i ruoli a rivelazione diurna tranne il Borgomastro, che non è
// un'identità ma un titolo elettivo che si affianca al ruolo già posseduto
// (pag. 11) e ha il suo evento dedicato "Elezione Borgomastro".
export function ruoliRivelabili(ruoliSelezionati, giocatori, quantita) {
  const candidati = RUOLI_RIVELAZIONE_GIORNO.filter(
    (slug) => slug !== 'borgomastro' && ruoliSelezionati.includes(slug),
  )
  return ruoliAssegnabili(candidati, giocatori, quantita)
}

export function boiaDisponibile(giocatori) {
  const boia = giocatori.find((g) => g.ruoloSlug === 'boia' && g.vivo)
  return Boolean(boia) && !(boia.poteriUsati ?? []).includes('boia-giustizia')
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

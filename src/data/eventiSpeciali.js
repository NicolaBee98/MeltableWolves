import { ruoliAssegnabili } from './assegnazione'
import { RUOLI_RIVELAZIONE_GIORNO } from './nightSteps'

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

export function alchimistaDisponibile(giocatori) {
  const alchimista = giocatori.find((g) => g.ruoloSlug === 'alchimista')
  return (
    Boolean(alchimista) &&
    !alchimista.vivo &&
    alchimista.causaMorte === 'rogo' &&
    !(alchimista.poteriUsati ?? []).includes('alchimista-esplosione')
  )
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

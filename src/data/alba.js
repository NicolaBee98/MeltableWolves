import { eLupo } from './roles'
import { viciniVivi } from './vicinanza'

export function annunciAlba(giocatori, round) {
  const annunci = []

  const pastoriVivi = giocatori.filter((g) => g.vivo && g.ruoloSlug === 'pastore')
  const pastoreConLupoVicino = pastoriVivi.some((pastore) => {
    const { sinistra, destra } = viciniVivi(giocatori, pastore.id)
    return [sinistra, destra].some((vicino) => vicino && eLupo(vicino.ruoloSlug))
  })
  if (pastoreConLupoVicino) {
    annunci.push('Si sentono dei belati.')
  }

  const ambasciatoreVivo = giocatori.some((g) => g.vivo && g.ruoloSlug === 'ambasciatore')
  const veggenteConAuraBenevola = giocatori.some(
    (g) => g.ruoloSlug === 'veggente' && g.ultimaIndagine?.notte === round && g.ultimaIndagine?.esito === 'benevola',
  )
  if (ambasciatoreVivo && veggenteConAuraBenevola) {
    annunci.push("È arrivato un messaggio dall'ambasciatore.")
  }

  // libretto pag. 29: "annuncia se durante la notte ci sono state...
  // giocatori che sono stati resuscitati, unti, trasformati in maiali"
  for (const g of giocatori.filter((g) => g.resuscitatoNotte === round)) {
    annunci.push(`${g.nome} è stato resuscitato.`)
  }
  // "unto"/"trasformato" durano fino al calar della notte successiva a
  // quella in cui sono inflitti: se sono ancora presenti in questa Alba,
  // vengono per forza dalla notte appena conclusa (vedi daRipulireCambioNotte)
  for (const g of giocatori.filter((g) => (g.condizioni ?? []).includes('unto'))) {
    annunci.push(`${g.nome} è stato unto dall'Untore.`)
  }
  for (const g of giocatori.filter((g) => (g.condizioni ?? []).includes('trasformato'))) {
    annunci.push(`${g.nome} è stato trasformato in maiale dalla Maga.`)
  }

  // L'Antico sbranato di notte (flag `anticoSbranatoNotte`, vedi uccidiPatch)
  for (const g of giocatori.filter((g) => g.anticoSbranatoNotte === round)) {
    annunci.push(`${g.nome} si è rivelato: è L'Antico, ha perso la prima vita ma sopravvive (ora gioca da Villico).`)
  }

  for (const g of giocatori.filter((g) => g.causaMorte === 'sacrificio' && g.mortoNotte === round)) {
    annunci.push(`${g.nome} si è rivelato: è il Cavaliere, e si è immolato al posto della vittima.`)
  }

  return annunci
}

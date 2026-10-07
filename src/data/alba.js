import { eLupo, nomeRuolo, ruoloPerDisplay } from './roles'
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
  // vengono per forza dalla notte appena conclusa (vedi daRipulireCambioNotte);
  // un morto non si annuncia (es. il Nano, che di notte non muore ma altrimenti sì)
  for (const g of giocatori.filter((g) => g.vivo && (g.condizioni ?? []).includes('unto'))) {
    annunci.push(`${g.nome} è stato unto dall'Untore.`)
  }
  for (const g of giocatori.filter((g) => g.vivo && (g.condizioni ?? []).includes('trasformato'))) {
    annunci.push(`${g.nome} è stato trasformato in maiale dalla Maga.`)
  }

  // L'Antico sbranato di notte (flag `anticoSbranatoNotte`, vedi uccidiPatch)
  for (const g of giocatori.filter((g) => g.anticoSbranatoNotte === round)) {
    annunci.push(`${g.nome} si è rivelato: è L'Antico, ha perso la prima vita ma sopravvive (ora gioca da Villico).`)
  }

  for (const g of giocatori.filter((g) => g.causaMorte === 'sacrificio' && g.mortoNotte === round)) {
    annunci.push(`${g.nome} si è rivelato: è il Cavaliere, e si è immolato al posto della vittima.`)
  }

  // conseguenze notturne che non lasciano un morto da annunciare: crepacuore
  // del partner, Mezzosangue sbranato, Apprendista/Figlia che ereditano alla
  // morte del maestro (marcatori scritti da effettiNotte/risolviLegami)
  for (const g of giocatori.filter((g) => g.causaMorte === 'crepacuore' && g.mortoNotte === round)) {
    annunci.push(`${g.nome} è morto/a di crepacuore per la morte del partner.`)
  }
  for (const g of giocatori.filter((g) => g.trasformatoNotte === round)) {
    annunci.push(`Il Mezzosangue ${g.nome} è stato sbranato e diventa Lupo Mannaro.`)
  }
  for (const g of giocatori.filter((g) => g.ereditaNotte === round)) {
    const maestro = giocatori.find((x) => x.id === g.ereditaDa)?.nome
    if (g.ereditaIgnota) {
      annunci.push(
        `${g.nome} si rivela: è l'Apprendista${maestro ? ` di ${maestro}` : ''} e prende la sua carta (ruolo ancora ignoto: resta ignoto finché non viene rivelato).`,
      )
      continue
    }
    annunci.push(
      `${g.nome} si rivela: è l'Apprendista${maestro ? ` di ${maestro}` : ''} ed eredita il ruolo di ${nomeRuolo(ruoloPerDisplay(g.ruoloSlug))}.`,
    )
  }
  for (const g of giocatori.filter((g) => g.figliaLupoNotte === round)) {
    annunci.push(`${g.nome} si rivela: è la Figlia dei Lupi e diventa Lupo Mannaro.`)
  }

  return annunci
}

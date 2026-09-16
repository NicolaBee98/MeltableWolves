import { ROLES } from './roles'
import { viciniVivi } from './vicinanza'

function fazioneDi(giocatore) {
  return ROLES.find((r) => r.slug === giocatore.ruoloSlug)?.fazione
}

export function annunciAlba(giocatori, round) {
  const annunci = []

  const pastoriVivi = giocatori.filter((g) => g.vivo && g.ruoloSlug === 'pastore')
  const pastoreConLupoVicino = pastoriVivi.some((pastore) => {
    const { sinistra, destra } = viciniVivi(giocatori, pastore.id)
    return [sinistra, destra].some((vicino) => vicino && fazioneDi(vicino) === 'lupi')
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

  return annunci
}

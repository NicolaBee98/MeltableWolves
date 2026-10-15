import { RUOLI_BRANCO_LUPI, nomeRuolo } from './roles'

// Ruoli che hanno un riconoscimento (nei passi della prima notte) e chi
// riconoscono: chi prende il ruolo a notte avanzata (Addolorata, Apprendista)
// non passa da quel passo, quindi il narratore glielo mostra a mano.
const GUARDIE = ['guardia', 'guardia-mannara']
const GESTI = ['bardo', 'gallo-mannaro']

function compagniDi(g, giocatori) {
  const altri = giocatori.filter((x) => x.vivo && x.id !== g.id)
  const con = (ruoli) => altri.filter((x) => ruoli.includes(x.ruoloSlug))
  if (GUARDIE.includes(g.ruoloSlug)) return con(GUARDIE)
  if (g.ruoloSlug === 'mucca-mannara' || RUOLI_BRANCO_LUPI.includes(g.ruoloSlug)) return con(RUOLI_BRANCO_LUPI)
  if (g.ruoloSlug === 'sacerdote') return altri.filter((x) => (x.condizioni ?? []).includes('innamorato'))
  return []
}

// Promemoria scritto per il narratore (non bloccante), o null se non c'è nulla da mostrare
export function promemoriaCompagni(g, giocatori) {
  if (GESTI.includes(g.ruoloSlug)) return `Mostra a ${g.nome} il gesto segreto del ${nomeRuolo(g.ruoloSlug)}.`
  const nomi = compagniDi(g, giocatori).map((x) => x.nome)
  if (nomi.length === 0) return null
  const chi = g.ruoloSlug === 'mucca-mannara' ? 'i lupi' : 'i suoi compagni'
  return `Mostra a ${g.nome} chi sono ${chi}: ${nomi.join(', ')}.`
}

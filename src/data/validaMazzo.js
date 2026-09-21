import { ROLES } from './roles'

const RAPPORTO_LUPI_CONSIGLIATO = 5
const MAX_INDIPENDENTI = 2
const SOGLIA_NOTTURNI = 0.7

function espandiRuoli(quantita) {
  const ruoli = []
  for (const slug of Object.keys(quantita)) {
    const ruolo = ROLES.find((r) => r.slug === slug)
    if (!ruolo) continue
    for (let i = 0; i < quantita[slug]; i++) {
      ruoli.push(ruolo)
    }
  }
  return ruoli
}

export function validaMazzo(quantita) {
  const avvisi = []
  const ruoli = espandiRuoli(quantita)

  const numLupi = ruoli.filter((r) => r.fazione === 'lupi').length
  if (numLupi === 0) {
    avvisi.push('Nessun lupo mannaro nel mazzo.')
  } else if (numLupi < Math.floor(ruoli.length / RAPPORTO_LUPI_CONSIGLIATO)) {
    avvisi.push(
      `Pochi lupi mannari per ${ruoli.length} giocatori (consigliato circa 1 ogni ${RAPPORTO_LUPI_CONSIGLIATO}).`,
    )
  }

  const numIndipendenti = ruoli.filter((r) => r.fazione === 'indipendente').length
  if (numIndipendenti > MAX_INDIPENDENTI) {
    avvisi.push('Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.')
  }

  const numNotturni = ruoli.filter((r) => r.notturno).length
  if (ruoli.length > 0 && numNotturni / ruoli.length > SOGLIA_NOTTURNI) {
    avvisi.push('Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.')
  }

  if ((quantita['guardia-mannara'] ?? 0) > 0 && (quantita['guardia'] ?? 0) === 0) {
    avvisi.push('Guardia Mannara richiede la presenza delle Guardie nel mazzo.')
  }

  return avvisi
}

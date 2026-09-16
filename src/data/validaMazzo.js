import { ROLES } from './roles'

const RAPPORTO_LUPI_CONSIGLIATO = 5
const MAX_INDIPENDENTI = 2
const SOGLIA_NOTTURNI = 0.7

export function validaMazzo(ruoliSelezionati, numGiocatori) {
  const avvisi = []
  const ruoli = ruoliSelezionati
    .map((slug) => ROLES.find((r) => r.slug === slug))
    .filter(Boolean)

  if (ruoli.length !== numGiocatori) {
    avvisi.push(`Hai selezionato ${ruoli.length} ruoli per ${numGiocatori} giocatori.`)
  }

  const numLupi = ruoli.filter((r) => r.fazione === 'lupi').length
  if (numLupi === 0) {
    avvisi.push('Nessun lupo mannaro nel mazzo.')
  } else if (numLupi < Math.floor(numGiocatori / RAPPORTO_LUPI_CONSIGLIATO)) {
    avvisi.push(
      `Pochi lupi mannari per ${numGiocatori} giocatori (consigliato circa 1 ogni ${RAPPORTO_LUPI_CONSIGLIATO}).`,
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

  return avvisi
}

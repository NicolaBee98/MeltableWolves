import { useEffect, useState } from 'react'
import { ROLES } from '../data/roles'
import { maxQuantita } from '../data/quantitaRuoli'

const STORAGE_KEY = 'meltable-wolves-mazzo'
const DEFAULT_MAZZO = { numGiocatori: 8, quantita: {} }

function loadMazzo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MAZZO
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_MAZZO, ...parsed, quantita: parsed.quantita ?? {} }
  } catch {
    return DEFAULT_MAZZO
  }
}

export function useMazzo() {
  const [mazzo, setMazzo] = useState(loadMazzo)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mazzo))
  }, [mazzo])

  function setNumGiocatori(numGiocatori) {
    setMazzo((prev) => ({ ...prev, numGiocatori }))
  }

  function setQuantita(slug, valore) {
    const clampato = Math.max(0, Math.min(valore, maxQuantita(slug)))
    setMazzo((prev) => ({ ...prev, quantita: { ...prev.quantita, [slug]: clampato } }))
  }

  const ruoliInMazzo = ROLES.filter((ruolo) => (mazzo.quantita[ruolo.slug] ?? 0) > 0)

  return {
    numGiocatori: mazzo.numGiocatori,
    quantita: mazzo.quantita,
    setNumGiocatori,
    setQuantita,
    ruoliInMazzo,
  }
}

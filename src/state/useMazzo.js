import { useEffect, useState } from 'react'
import { ROLES } from '../data/roles'
import { maxQuantita } from '../data/quantitaRuoli'
import { salvaLocale } from './salvaLocale'

const STORAGE_KEY = 'meltable-wolves-mazzo'
const DEFAULT_MAZZO = { quantita: {} }

function loadMazzo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MAZZO
    const parsed = JSON.parse(raw)
    return { quantita: parsed.quantita ?? {} }
  } catch {
    return DEFAULT_MAZZO
  }
}

export function useMazzo() {
  const [mazzo, setMazzo] = useState(loadMazzo)

  useEffect(() => {
    salvaLocale(STORAGE_KEY, JSON.stringify(mazzo))
  }, [mazzo])

  function setQuantita(slug, valore) {
    const clampato = Math.max(0, Math.min(valore, maxQuantita(slug)))
    setMazzo((prev) => {
      const quantita = { ...prev.quantita, [slug]: clampato }
      if (slug === 'guardia' && clampato === 0) {
        // la Guardia Mannara richiede le Guardie: senza non ha senso in mazzo
        quantita['guardia-mannara'] = 0
      }
      return { quantita }
    })
  }

  function resetMazzo() {
    setMazzo(DEFAULT_MAZZO)
  }

  const ruoliInMazzo = ROLES.filter((ruolo) => (mazzo.quantita[ruolo.slug] ?? 0) > 0)

  return {
    quantita: mazzo.quantita,
    setQuantita,
    resetMazzo,
    ruoliInMazzo,
  }
}

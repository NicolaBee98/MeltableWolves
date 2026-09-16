import { useEffect, useState } from 'react'
import { ROLES } from '../data/roles'

const STORAGE_KEY = 'meltable-wolves-mazzo'
const DEFAULT_MAZZO = { numGiocatori: 8, ruoliSelezionati: [] }

function loadMazzo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_MAZZO
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

  function toggleRuolo(slug) {
    setMazzo((prev) => ({
      ...prev,
      ruoliSelezionati: prev.ruoliSelezionati.includes(slug)
        ? prev.ruoliSelezionati.filter((s) => s !== slug)
        : [...prev.ruoliSelezionati, slug],
    }))
  }

  const ruoliInMazzo = ROLES.filter((ruolo) => mazzo.ruoliSelezionati.includes(ruolo.slug))

  return {
    numGiocatori: mazzo.numGiocatori,
    ruoliSelezionati: mazzo.ruoliSelezionati,
    setNumGiocatori,
    toggleRuolo,
    ruoliInMazzo,
  }
}

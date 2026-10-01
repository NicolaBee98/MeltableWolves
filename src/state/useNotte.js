import { useEffect, useState } from 'react'
import { salvaLocale } from './salvaLocale'

const STORAGE_KEY = 'meltable-wolves-notte'
const DEFAULT_NOTTE = { round: 1, stepIndex: 0 }

function loadNotte() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    // validazione minima: dati corrotti o di uno schema vecchio → stato iniziale
    return Number.isInteger(parsed?.round) && Number.isInteger(parsed?.stepIndex) ? parsed : DEFAULT_NOTTE
  } catch {
    return DEFAULT_NOTTE
  }
}

export function useNotte() {
  const [notte, setNotte] = useState(loadNotte)

  useEffect(() => {
    salvaLocale(STORAGE_KEY, JSON.stringify(notte))
  }, [notte])

  function avanti(totalePassi) {
    setNotte((prev) => ({ ...prev, stepIndex: Math.min(prev.stepIndex + 1, totalePassi - 1) }))
  }

  function indietro() {
    setNotte((prev) => ({ ...prev, stepIndex: Math.max(prev.stepIndex - 1, 0) }))
  }

  function nuovaNotte() {
    setNotte((prev) => ({ round: prev.round + 1, stepIndex: 0 }))
  }

  function resetNotte() {
    setNotte(DEFAULT_NOTTE)
  }

  return { round: notte.round, stepIndex: notte.stepIndex, avanti, indietro, nuovaNotte, resetNotte }
}

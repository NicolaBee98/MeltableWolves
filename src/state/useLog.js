import { useEffect, useRef, useState } from 'react'
import { rilevaEventi } from '../data/log'

const STORAGE_KEY = 'meltable-wolves-log'

function loadEventi() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useLog(giocatori, round) {
  const [eventi, setEventi] = useState(loadEventi)
  const precedentiRef = useRef(giocatori)

  useEffect(() => {
    const nuoviEventi = rilevaEventi(precedentiRef.current, giocatori, round)
    if (nuoviEventi.length > 0) {
      setEventi((prev) => [...prev, ...nuoviEventi])
    }
    precedentiRef.current = giocatori
  }, [giocatori, round])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventi))
  }, [eventi])

  return eventi
}

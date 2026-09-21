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
  const precedentiRef = useRef({ giocatori, round })

  useEffect(() => {
    const precedenti = precedentiRef.current
    // se round e giocatori cambiano nello stesso aggiornamento (fine notte:
    // pulizia condizioni + incremento round in un unico batch), la modifica
    // ai giocatori appartiene alla notte appena conclusa, non a quella nuova
    const roundEventi = round !== precedenti.round ? precedenti.round : round
    const nuoviEventi = rilevaEventi(precedenti.giocatori, giocatori, roundEventi)
    if (nuoviEventi.length > 0) {
      setEventi((prev) => [...prev, ...nuoviEventi])
    }
    precedentiRef.current = { giocatori, round }
  }, [giocatori, round])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventi))
  }, [eventi])

  function aggiungiEvento(messaggio) {
    setEventi((prev) => [...prev, { round, messaggio }])
  }

  function resetLog() {
    setEventi([])
  }

  return { eventi, aggiungiEvento, resetLog }
}

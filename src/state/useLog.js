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

export function useLog(giocatori, round, fase = 'notte') {
  const [eventi, setEventi] = useState(loadEventi)
  const precedentiRef = useRef({ giocatori, round })

  useEffect(() => {
    const precedenti = precedentiRef.current
    // se round e giocatori cambiano nello stesso aggiornamento (fine notte:
    // pulizia condizioni + incremento round in un unico batch), la modifica
    // ai giocatori appartiene alla notte appena conclusa, non a quella nuova
    const roundEventi = round !== precedenti.round ? precedenti.round : round
    const nuoviEventi = rilevaEventi(precedenti.giocatori, giocatori, roundEventi, fase)
    if (nuoviEventi.length > 0) {
      setEventi((prev) => [...prev, ...nuoviEventi])
    }
    precedentiRef.current = { giocatori, round }
  }, [giocatori, round, fase])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventi))
  }, [eventi])

  // fase esplicita: per i messaggi registrati "in anticipo" rispetto alla
  // schermata su cui si trova il narratore (es. gli annunci dell'alba,
  // scritti da NightSequencer mentre è ancora sulla notte, vedi App.jsx)
  function aggiungiEvento(messaggio, faseEsplicita) {
    setEventi((prev) => [...prev, { round, fase: faseEsplicita ?? fase, messaggio }])
  }

  function resetLog() {
    setEventi([])
  }

  return { eventi, aggiungiEvento, resetLog }
}

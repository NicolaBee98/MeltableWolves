import { useEffect, useRef, useState } from 'react'
import { rilevaEventi } from '../data/log'
import { salvaLocale } from './salvaLocale'

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
  // resetLog() e il reset di "giocatori"/"round" (Nuova Partita) avvengono
  // nello stesso batch: senza questo, l'effetto qui sotto confronterebbe la
  // partita appena finita con quella azzerata e "rileverebbe" un mucchio di
  // falsi eventi (tutti "tornati in vita", condizioni perse...), ripopolando
  // il log appena svuotato
  const sopprimiProssimoConfrontoRef = useRef(false)

  useEffect(() => {
    if (sopprimiProssimoConfrontoRef.current) {
      sopprimiProssimoConfrontoRef.current = false
      precedentiRef.current = { giocatori, round }
      return
    }
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
    salvaLocale(STORAGE_KEY, JSON.stringify(eventi))
  }, [eventi])

  // fase esplicita: per i messaggi registrati "in anticipo" rispetto alla
  // schermata su cui si trova il narratore (es. gli annunci dell'alba,
  // scritti da NightSequencer mentre è ancora sulla notte, vedi App.jsx)
  function aggiungiEvento(messaggio, faseEsplicita) {
    setEventi((prev) => [...prev, { round, fase: faseEsplicita ?? fase, messaggio }])
  }

  // "Torna alla notte" dall'Alba: toglie tutti gli eventi scritti dopo il
  // punto salvato (annunci dell'alba compresi); i giocatori tornano allo stato
  // di prima, quindi il confronto successivo non deve rilevare nulla
  function troncaLog(lunghezza) {
    setEventi((prev) => prev.slice(0, lunghezza))
    sopprimiProssimoConfrontoRef.current = true
  }

  function resetLog() {
    setEventi([])
    sopprimiProssimoConfrontoRef.current = true
  }

  // Indietro/annullamenti reimpostano i giocatori a uno stato precedente: non
  // sono eventi di partita, il prossimo confronto va saltato
  function sopprimiProssimoConfronto() {
    sopprimiProssimoConfrontoRef.current = true
  }

  return { eventi, aggiungiEvento, resetLog, sopprimiProssimoConfronto, troncaLog }
}

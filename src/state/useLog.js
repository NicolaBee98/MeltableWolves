import { useEffect, useRef, useState } from 'react'
import { rilevaEventi } from '../data/log'
import { salvaLocale } from './salvaLocale'

const STORAGE_KEY = 'meltable-wolves-log'
// ultimo stato dei giocatori "confermato" (già confrontato e registrato):
// persistito per non perdere/duplicare eventi dopo un refresh a metà notte
const STORAGE_KEY_CONFERMATI = 'meltable-wolves-log-confermati'

function loadEventi() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadConfermati(giocatori) {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFERMATI))
    return Array.isArray(parsed) ? parsed : giocatori
  } catch {
    return giocatori
  }
}

// `round` è quello della notte (notte.round): dopo l'alba è già incrementato,
// quindi alba/giorno del ciclo N si etichettano con round-1, insieme alla
// notte N (stesso titolo "Giorno N" nel registro)
const roundEtichetta = (round, fase) => (['alba', 'giorno'].includes(fase) ? round - 1 : round)

export function useLog(giocatori, round, fase = 'notte') {
  const [eventi, setEventi] = useState(loadEventi)
  const confermatiRef = useRef(null)
  if (confermatiRef.current === null) {
    confermatiRef.current = loadConfermati(giocatori)
    salvaLocale(STORAGE_KEY_CONFERMATI, JSON.stringify(confermatiRef.current))
  }
  const giocatoriRef = useRef(giocatori)
  giocatoriRef.current = giocatori
  const faseRef = useRef(fase)
  // passo notturno a cui appartengono le voci scritte adesso (vedi confermaLog)
  const passoRef = useRef(undefined)
  const roundNotteRef = useRef(round)
  // resetLog() e il reset di "giocatori"/"round" (Nuova Partita) avvengono
  // nello stesso batch: senza questo, l'effetto qui sotto confronterebbe la
  // partita appena finita con quella azzerata e "rileverebbe" un mucchio di
  // falsi eventi (tutti "tornati in vita", condizioni perse...), ripopolando
  // il log appena svuotato
  const sopprimiProssimoConfrontoRef = useRef(false)

  function imposta(g) {
    confermatiRef.current = g
    salvaLocale(STORAGE_KEY_CONFERMATI, JSON.stringify(g))
  }

  // confronta i giocatori con l'ultimo stato confermato, registra gli eventi
  // e aggiorna il riferimento
  function registra(g, roundEvento, faseEvento, passo) {
    const nuovi = rilevaEventi(confermatiRef.current, g, roundEvento, faseEvento).map((e) => (passo ? { ...e, passo } : e))
    if (nuovi.length > 0) setEventi((prev) => [...prev, ...nuovi])
    imposta(g)
  }

  useEffect(() => {
    const fasePrecedente = faseRef.current
    faseRef.current = fase
    if (fase === 'notte') roundNotteRef.current = round
    if (sopprimiProssimoConfrontoRef.current) {
      sopprimiProssimoConfrontoRef.current = false
      imposta(giocatori)
      return
    }
    // di notte lo stato dei giocatori cambia anche per anteprime transitorie
    // (scelte non ancora confermate): si registra solo con confermaLog()
    if (fase === 'notte' && fasePrecedente === 'notte') return
    if (fasePrecedente === 'notte') {
      // ingresso nell'alba: ultima conferma della notte appena conclusa
      // (round e giocatori possono cambiare nello stesso batch)
      registra(giocatori, roundNotteRef.current, 'notte')
    } else {
      // il passaggio giorno/alba → notte porta la pulizia delle condizioni:
      // appartiene ancora al giorno che finisce
      const faseEvento = fase === 'notte' ? fasePrecedente : fase
      registra(giocatori, roundEtichetta(round, faseEvento), faseEvento)
    }
  }, [giocatori, round, fase])

  useEffect(() => {
    salvaLocale(STORAGE_KEY, JSON.stringify(eventi))
  }, [eventi])

  // passo (opzionale, es. "2-veggente"): marca le voci scritte all'Avanti di
  // quel passo, così annullaLogPasso le può togliere se si torna indietro
  function confermaLog(passo) {
    passoRef.current = passo
    registra(giocatoriRef.current, roundEtichetta(round, fase), fase, passo)
  }

  // Indietro a `passo`: toglie le voci scritte all'Avanti di quel passo e dei
  // successivi (sono tutte dopo la prima voce marcata). Non persiste tra i
  // refresh dell'app: le voci già salvate restano marcate, e il marcatore
  // passoRef si perde (le nuove voci non sarebbero più annullabili).
  function annullaLogPasso(passo) {
    passoRef.current = undefined
    setEventi((prev) => {
      const i = prev.findIndex((e) => e.passo === passo)
      return i === -1 ? prev : prev.slice(0, i)
    })
  }

  // fase esplicita: per i messaggi registrati "in anticipo" rispetto alla
  // schermata su cui si trova il narratore (es. gli annunci dell'alba,
  // scritti da NightSequencer mentre è ancora sulla notte, vedi App.jsx)
  function aggiungiEvento(messaggio, faseEsplicita) {
    const passo = passoRef.current
    setEventi((prev) => [
      ...prev,
      { round: roundEtichetta(round, fase), fase: faseEsplicita ?? fase, messaggio, ...(passo && { passo }) },
    ])
  }

  function resetLog() {
    setEventi([])
    sopprimiProssimoConfrontoRef.current = true
  }

  // Indietro/annullamenti reimpostano i giocatori a uno stato precedente: non
  // sono eventi di partita, il prossimo stato diventa il nuovo riferimento
  function sopprimiProssimoConfronto() {
    sopprimiProssimoConfrontoRef.current = true
  }

  return { eventi, aggiungiEvento, resetLog, sopprimiProssimoConfronto, confermaLog, annullaLogPasso }
}

import { useEffect, useRef, useState } from 'react'

// la durata si imposta nelle impostazioni di partita, non qui (vedi
// LogImpostazioniPopup): questo componente si limita ad avviarla/fermarla
export function TimerSpareggio({ durataSecondi = 60 }) {
  const [rimanente, setRimanente] = useState(durataSecondi)
  const [attivo, setAttivo] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!attivo) return
    intervalRef.current = setInterval(() => setRimanente((prev) => Math.max(prev - 1, 0)), 1000)
    return () => clearInterval(intervalRef.current)
  }, [attivo])

  // a 0 si ferma (fuori dall'updater di setRimanente, che deve restare
  // puro) e avvisa anche con una vibrazione, se il dispositivo la supporta
  useEffect(() => {
    if (attivo && rimanente === 0) {
      setAttivo(false)
      navigator.vibrate?.([300, 150, 300])
    }
  }, [attivo, rimanente])

  // un solo tasto: avvia/riprende se fermo (ripartendo da capo solo se il
  // tempo è già esaurito), mette in pausa se in corso — "Azzera" resta
  // separato per tornare al tempo pieno
  function toggleAvvioPausa() {
    if (attivo) {
      setAttivo(false)
      return
    }
    if (rimanente <= 0) setRimanente(durataSecondi)
    setAttivo(true)
  }

  function azzera() {
    setAttivo(false)
    setRimanente(durataSecondi)
  }

  const minuti = Math.floor(rimanente / 60)
  const secondi = rimanente % 60
  const tempoFormattato = `${String(minuti).padStart(2, '0')}:${String(secondi).padStart(2, '0')}`

  return (
    <div className={`timer-spareggio${rimanente === 0 ? ' timer-spareggio--scaduto' : ''}`}>
      <p role="timer" aria-live="off">{rimanente === 0 ? 'Tempo scaduto' : tempoFormattato}</p>
      <div className="timer-spareggio__controlli">
        <button type="button" onClick={toggleAvvioPausa}>
          {attivo ? 'Pausa' : 'Avvia'}
        </button>
        <button type="button" onClick={azzera}>
          Azzera
        </button>
      </div>
    </div>
  )
}

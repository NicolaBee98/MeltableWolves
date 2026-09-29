import { useEffect, useRef, useState } from 'react'

// la durata si imposta nelle impostazioni di partita, non qui (vedi
// LogImpostazioniPopup): questo componente si limita ad avviarla/fermarla
export function TimerSpareggio({ durataSecondi = 60 }) {
  const [rimanente, setRimanente] = useState(durataSecondi)
  const [attivo, setAttivo] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!attivo) return
    intervalRef.current = setInterval(() => {
      setRimanente((prev) => {
        if (prev <= 1) {
          setAttivo(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [attivo])

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
    <div className="timer-spareggio">
      <p>{tempoFormattato}</p>
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

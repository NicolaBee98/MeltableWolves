import { useEffect, useRef, useState } from 'react'

export function TimerSpareggio() {
  const [durata, setDurata] = useState(60)
  const [rimanente, setRimanente] = useState(60)
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

  function avvia() {
    setRimanente(durata)
    setAttivo(true)
  }

  function pausa() {
    setAttivo(false)
  }

  function azzera() {
    setAttivo(false)
    setRimanente(durata)
  }

  const minuti = Math.floor(rimanente / 60)
  const secondi = rimanente % 60
  const tempoFormattato = `${String(minuti).padStart(2, '0')}:${String(secondi).padStart(2, '0')}`

  return (
    <div className="timer-spareggio">
      <label htmlFor="durata-timer">Durata (secondi)</label>
      <input
        id="durata-timer"
        type="number"
        min="1"
        value={durata}
        onChange={(event) => setDurata(Number(event.target.value))}
        disabled={attivo}
      />
      <p>{tempoFormattato}</p>
      <button type="button" onClick={avvia}>
        Avvia
      </button>
      <button type="button" onClick={pausa} disabled={!attivo}>
        Pausa
      </button>
      <button type="button" onClick={azzera}>
        Azzera
      </button>
    </div>
  )
}

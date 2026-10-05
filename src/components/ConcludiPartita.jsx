import { useState } from 'react'

// "Concludi partita" porta alla Home e perde la partita: serve una conferma
// esplicita prima di chiamare onConcludi
export function ConcludiPartita({ onConcludi }) {
  const [conferma, setConferma] = useState(false)
  if (!conferma) {
    return (
      <button type="button" className="concludi-partita" onClick={() => setConferma(true)}>
        Concludi partita
      </button>
    )
  }
  return (
    <p className="votazione__conferma concludi-partita">
      Concludere la partita e tornare alla Home?{' '}
      <button type="button" onClick={onConcludi}>
        Sì, concludi
      </button>{' '}
      <button type="button" onClick={() => setConferma(false)}>
        Annulla
      </button>
    </p>
  )
}

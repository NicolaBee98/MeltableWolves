import { useEffect, useRef, useState } from 'react'

export const DURATA_TIENI_MS = 1200

// Pulsante "hold-to-confirm": l'azione parte solo se lo si tiene premuto per
// `durata` ms (mouse/touch/penna, oppure Invio/Spazio da tastiera) mentre uno
// sfondo giallo si riempie da sinistra a destra; rilasciando prima si azzera.
export function PulsanteTieni({ onConferma, children, durata = DURATA_TIENI_MS, disabled, className = '', ...resto }) {
  const [tenendo, setTenendo] = useState(false)
  const timer = useRef(null)

  const annulla = () => {
    clearTimeout(timer.current)
    setTenendo(false)
  }
  const inizia = () => {
    if (disabled || timer.current) return
    setTenendo(true)
    timer.current = setTimeout(() => {
      timer.current = null
      setTenendo(false)
      onConferma()
    }, durata)
  }
  const ferma = () => {
    clearTimeout(timer.current)
    timer.current = null
    setTenendo(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  const eTastoAzione = (e) => e.key === 'Enter' || e.key === ' '

  return (
    <button
      type="button"
      {...resto}
      className={`pulsante-tieni ${className}`.trim()}
      disabled={disabled}
      onPointerDown={inizia}
      onPointerUp={ferma}
      onPointerLeave={ferma}
      onPointerCancel={ferma}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (!eTastoAzione(e)) return
        e.preventDefault() // niente click nativo: conta solo il tempo di pressione
        if (!e.repeat) inizia()
      }}
      onKeyUp={(e) => {
        if (!eTastoAzione(e)) return
        e.preventDefault()
        ferma()
      }}
      onBlur={ferma}
    >
      <span
        className="pulsante-tieni__riempimento"
        aria-hidden="true"
        style={{ width: tenendo ? '100%' : 0, transition: tenendo ? `width ${durata}ms linear` : 'none' }}
      />
      <span className="pulsante-tieni__testo">
        {children} <small>(tieni premuto)</small>
      </span>
    </button>
  )
}

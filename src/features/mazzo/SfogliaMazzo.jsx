import { useState, useRef } from 'react'
import { MAZZO_COMPLETO } from '../../data/mazzoCompleto'

const SOGLIA_SWIPE = 50 // px orizzontali minimi perché un trascinamento conti come swipe

export function SfogliaMazzo({ onChiudi }) {
  const [indice, setIndice] = useState(0)
  const partenzaX = useRef(null)
  const carta = MAZZO_COMPLETO[indice]

  function vai(nuovoIndice) {
    setIndice(Math.max(0, Math.min(MAZZO_COMPLETO.length - 1, nuovoIndice)))
  }

  function onPointerDown(event) {
    partenzaX.current = event.clientX
  }

  function onPointerUp(event) {
    if (partenzaX.current === null) return
    const delta = event.clientX - partenzaX.current
    partenzaX.current = null
    if (delta > SOGLIA_SWIPE) vai(indice - 1)
    else if (delta < -SOGLIA_SWIPE) vai(indice + 1)
  }

  return (
    <div className="sfoglia-mazzo" role="dialog" aria-label="Sfoglia il mazzo">
      <div className="sfoglia-mazzo__header">
        <button type="button" onClick={onChiudi}>
          ✕ Chiudi
        </button>
        <span className="sfoglia-mazzo__contatore">
          {indice + 1} / {MAZZO_COMPLETO.length}
        </span>
      </div>

      <p className="sfoglia-mazzo__etichetta">{carta.etichetta}</p>

      <div className="sfoglia-mazzo__carta-area">
        <button
          type="button"
          className="sfoglia-mazzo__freccia"
          onClick={() => vai(indice - 1)}
          disabled={indice === 0}
          aria-label="Carta precedente"
        >
          ←
        </button>
        <img
          src={carta.path}
          alt={carta.etichetta}
          className="sfoglia-mazzo__immagine"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          draggable={false}
        />
        <button
          type="button"
          className="sfoglia-mazzo__freccia"
          onClick={() => vai(indice + 1)}
          disabled={indice === MAZZO_COMPLETO.length - 1}
          aria-label="Carta successiva"
        >
          →
        </button>
      </div>

      <input
        type="range"
        className="sfoglia-mazzo__scorrimento"
        min={0}
        max={MAZZO_COMPLETO.length - 1}
        value={indice}
        onChange={(event) => vai(Number(event.target.value))}
        aria-label="Scorri velocemente il mazzo"
      />
    </div>
  )
}

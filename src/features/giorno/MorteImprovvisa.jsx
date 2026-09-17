import { useState } from 'react'
import { SceltaGiocatore } from '../../components/SceltaGiocatore'

export function MorteImprovvisa({ giocatori, onDichiara }) {
  const [aperto, setAperto] = useState(false)
  const vivi = giocatori.filter((g) => g.vivo)

  function conferma(id) {
    onDichiara(id)
    setAperto(false)
  }

  return (
    <div className="morte-improvvisa">
      <button type="button" className="morte-improvvisa__icona" onClick={() => setAperto(true)}>
        💀 Morte improvvisa
      </button>
      {aperto && (
        <div className="morte-improvvisa__popup" role="dialog" aria-label="Dichiara morte improvvisa">
          <p>Per esecuzione del Boia, unzione dell'Untore, o rima sbagliata dello Scemo del Villaggio.</p>
          <SceltaGiocatore
            candidati={vivi}
            onConferma={conferma}
            onSalta={() => setAperto(false)}
            etichetta="Chi dichiarare morto"
          />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { ROLES } from '../../data/roles'
import { cartaPath } from '../../data/assetRuoli'
import { SfogliaMazzo } from './SfogliaMazzo'

const FAZIONI_ORDINE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']
const FAZIONE_LABEL = {
  villaggio: 'Villaggio',
  lupi: 'Lupi',
  indipendente: 'Indipendenti',
  sconosciuto: 'Sconosciuti',
}

// Galleria di consultazione di tutte le carte del gioco: una per ruolo (non
// per copia fisica, quindi un solo Villico anche se il mazzo reale ne ha 15).
// "Sfoglia il mazzo" apre invece il vero mazzo, carta fisica per carta fisica.
export function MazzoGalleria({ onTornaAllaHome }) {
  const [sfogliaAperto, setSfogliaAperto] = useState(false)

  if (sfogliaAperto) {
    return <SfogliaMazzo onChiudi={() => setSfogliaAperto(false)} />
  }

  return (
    <section className="mazzo-galleria">
      <div className="mazzo-galleria__header">
        <button type="button" onClick={onTornaAllaHome} className="torna-alla-home">
          ← Torna alla Home
        </button>
        <button type="button" onClick={() => setSfogliaAperto(true)}>
          🎴 Sfoglia il mazzo
        </button>
      </div>
      <h2>Il mazzo</h2>
      {FAZIONI_ORDINE.map((fazione) => {
        const ruoli = ROLES.filter((r) => r.fazione === fazione)
        if (ruoli.length === 0) return null
        return (
          <div key={fazione} className="mazzo-galleria__fazione">
            <h3>{FAZIONE_LABEL[fazione]}</h3>
            <div className="mazzo-galleria__carte">
              {ruoli.map((ruolo) => (
                <img key={ruolo.slug} src={cartaPath(ruolo.slug)} alt={ruolo.nome} className="mazzo-galleria__carta" loading="lazy" />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

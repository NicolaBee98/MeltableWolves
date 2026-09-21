import { useEffect, useState } from 'react'
import { ROLES } from '../data/roles'
import { maxQuantita } from '../data/quantitaRuoli'

const STORAGE_KEY = 'meltable-wolves-mazzo'
// scartoLadro: le due carte "in più" che il regolamento richiede di
// aggiungere al mazzo quando c'è il Ladro (pag. 15) — non vengono mai
// distribuite a un giocatore, quindi restano fuori da "quantita" (che
// rappresenta solo le carte davvero assegnate) per non alterare il
// confronto "numero giocatori vs ruoli nel mazzo" in App.jsx.
const DEFAULT_MAZZO = { quantita: {}, scartoLadro: [] }

function loadMazzo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MAZZO
    const parsed = JSON.parse(raw)
    return { quantita: parsed.quantita ?? {}, scartoLadro: parsed.scartoLadro ?? [] }
  } catch {
    return DEFAULT_MAZZO
  }
}

export function useMazzo() {
  const [mazzo, setMazzo] = useState(loadMazzo)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mazzo))
  }, [mazzo])

  function setQuantita(slug, valore) {
    const clampato = Math.max(0, Math.min(valore, maxQuantita(slug)))
    setMazzo((prev) => {
      const quantita = { ...prev.quantita, [slug]: clampato }
      if (slug === 'guardia' && clampato === 0) {
        // la Guardia Mannara richiede le Guardie: senza non ha senso in mazzo
        quantita['guardia-mannara'] = 0
      }
      // senza Ladro le due carte di scarto non hanno senso
      const scartoLadro = slug === 'ladro' && clampato === 0 ? [] : prev.scartoLadro
      return { quantita, scartoLadro }
    })
  }

  function setScartoLadro(indice, slug) {
    setMazzo((prev) => {
      const scartoLadro = [...prev.scartoLadro]
      scartoLadro[indice] = slug
      return { ...prev, scartoLadro }
    })
  }

  function resetMazzo() {
    setMazzo(DEFAULT_MAZZO)
  }

  const ruoliInMazzo = ROLES.filter((ruolo) => (mazzo.quantita[ruolo.slug] ?? 0) > 0)

  return {
    quantita: mazzo.quantita,
    setQuantita,
    resetMazzo,
    ruoliInMazzo,
    scartoLadro: mazzo.scartoLadro,
    setScartoLadro,
  }
}

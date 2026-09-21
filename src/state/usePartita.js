import { useEffect, useState } from 'react'
import { applicaCrepacuore } from '../data/effettiNotte'

const STORAGE_KEY = 'meltable-wolves-partita'

function loadGiocatori() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function usePartita() {
  const [giocatori, setGiocatori] = useState(loadGiocatori)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(giocatori))
  }, [giocatori])

  function addGiocatore(nome) {
    setGiocatori((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nome,
        ruoloSlug: undefined,
        vivo: true,
        condizioni: [],
        poteriUsati: [],
        usiNotte: [],
        storiaRuoli: [],
      },
    ])
  }

  function removeGiocatore(id) {
    setGiocatori((prev) => prev.filter((g) => g.id !== id))
  }

  function aggiornaGiocatore(id, patch) {
    setGiocatori((prev) => {
      const aggiornati = prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
      return patch.vivo === false ? applicaCrepacuore(aggiornati, id) : aggiornati
    })
  }

  function resetPartita() {
    setGiocatori([])
  }

  function impostaGiocatori(nuovi) {
    setGiocatori(nuovi)
  }

  return {
    giocatori,
    addGiocatore,
    removeGiocatore,
    aggiornaGiocatore,
    resetPartita,
    impostaGiocatori,
  }
}

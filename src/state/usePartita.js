import { useEffect, useState } from 'react'
import { applicaCrepacuore, rimuoviAccecamentoSeMortoPolpo, maturaCucciolo } from '../data/effettiNotte'
import { risolviLegami, applicaPatchMap } from '../data/risoluzioneNotte'

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
      let aggiornati = prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
      if (patch.vivo === false) {
        // reazioni a catena a una morte, ovunque avvenga (notte o rogo): il
        // partner innamorato, l'accecamento del Veggente legato al Polpo
        // Mannaro, e i legami di Apprendista/Cavaliere/Figlia dei Lupi.
        // Vanno risolte qui e non solo a fine notte, altrimenti una morte
        // al rogo le rimanda all'intera notte successiva (vedi audit).
        aggiornati = applicaCrepacuore(aggiornati, id)
        aggiornati = rimuoviAccecamentoSeMortoPolpo(aggiornati, id)
        aggiornati = maturaCucciolo(aggiornati, id)
        aggiornati = applicaPatchMap(aggiornati, risolviLegami(aggiornati))
      }
      return aggiornati
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

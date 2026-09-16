import { useEffect, useState } from 'react'

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

  function addGiocatore(nome, ruoloSlug) {
    setGiocatori((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome, ruoloSlug, vivo: true, condizioni: [], note: '', poteriUsati: [] },
    ])
  }

  function toggleVivo(id) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, vivo: !g.vivo } : g)))
  }

  function setCondizioni(id, condizioni) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, condizioni } : g)))
  }

  function setNote(id, note) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, note } : g)))
  }

  function aggiornaGiocatore(id, patch) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  return { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore }
}

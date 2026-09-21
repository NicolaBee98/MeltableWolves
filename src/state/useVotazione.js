import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-votazione'
const DEFAULT_STATO = { voti: {}, fase: 'voto', candidatiEsito: [] }

function loadStato() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_STATO
  } catch {
    return DEFAULT_STATO
  }
}

export function useVotazione() {
  const [stato, setStato] = useState(loadStato)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stato))
  }, [stato])

  function incrementaVoto(id) {
    setStato((prev) => ({ ...prev, voti: { ...prev.voti, [id]: (prev.voti[id] ?? 0) + 1 } }))
  }

  function decrementaVoto(id) {
    setStato((prev) => ({ ...prev, voti: { ...prev.voti, [id]: Math.max((prev.voti[id] ?? 0) - 1, 0) } }))
  }

  function ricominciaVotazione() {
    setStato({ voti: {}, fase: 'voto' })
  }

  function vaiAEsito(candidatiIds) {
    setStato((prev) => ({ ...prev, fase: 'esito', candidatiEsito: candidatiIds }))
  }

  function tornaAlVoto() {
    setStato((prev) => ({ ...prev, fase: 'voto' }))
  }

  return {
    voti: stato.voti,
    fase: stato.fase,
    candidatiEsito: stato.candidatiEsito ?? [],
    incrementaVoto,
    decrementaVoto,
    ricominciaVotazione,
    vaiAEsito,
    tornaAlVoto,
  }
}

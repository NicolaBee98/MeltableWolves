import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-votazione'

function loadVoti() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useVotazione() {
  const [voti, setVoti] = useState(loadVoti)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voti))
  }, [voti])

  function incrementaVoto(id) {
    setVoti((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }

  function decrementaVoto(id) {
    setVoti((prev) => ({ ...prev, [id]: Math.max((prev[id] ?? 0) - 1, 0) }))
  }

  function ricominciaVotazione() {
    setVoti({})
  }

  return { voti, incrementaVoto, decrementaVoto, ricominciaVotazione }
}

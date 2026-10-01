import { useEffect, useState } from 'react'
import { salvaLocale } from './salvaLocale'

const STORAGE_KEY = 'meltable-wolves-votazione'
const DEFAULT_STATO = { voti: {}, fase: 'voto', candidatiEsito: [] }

function loadStato() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    // validazione minima: dati corrotti o di uno schema vecchio → stato iniziale
    const valido =
      parsed?.voti && typeof parsed.voti === 'object' && !Array.isArray(parsed.voti) && ['voto', 'esito'].includes(parsed.fase)
    return valido ? parsed : DEFAULT_STATO
  } catch {
    return DEFAULT_STATO
  }
}

export function useVotazione() {
  const [stato, setStato] = useState(loadStato)

  useEffect(() => {
    salvaLocale(STORAGE_KEY, JSON.stringify(stato))
  }, [stato])

  function incrementaVoto(id) {
    setStato((prev) => ({ ...prev, voti: { ...prev.voti, [id]: (prev.voti[id] ?? 0) + 1 } }))
  }

  function decrementaVoto(id) {
    setStato((prev) => ({ ...prev, voti: { ...prev.voti, [id]: Math.max((prev.voti[id] ?? 0) - 1, 0) } }))
  }

  function ricominciaVotazione() {
    setStato({ voti: {}, fase: 'voto', candidatiEsito: [] })
  }

  // un giocatore rimosso a partita in corso non deve restare tra voti e candidati
  function rimuoviGiocatoreDaVotazione(id) {
    setStato((prev) => {
      const { [id]: _rimosso, ...voti } = prev.voti
      return { ...prev, voti, candidatiEsito: (prev.candidatiEsito ?? []).filter((c) => c !== id) }
    })
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
    rimuoviGiocatoreDaVotazione,
  }
}

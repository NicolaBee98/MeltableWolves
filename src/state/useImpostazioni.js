import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-impostazioni'
// nascosti di default: in una sala stretta altri giocatori potrebbero
// sbirciare lo schermo del narratore e vedere i ruoli a colpo d'occhio
const DEFAULT_MOSTRA_RUOLI = false

function loadMostraRuoli() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return DEFAULT_MOSTRA_RUOLI
  }
}

export function useImpostazioni() {
  const [mostraRuoliInVotazione, setMostraRuoliInVotazione] = useState(loadMostraRuoli)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(mostraRuoliInVotazione))
  }, [mostraRuoliInVotazione])

  return { mostraRuoliInVotazione, setMostraRuoliInVotazione }
}

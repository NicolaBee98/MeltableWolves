import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-fase-app'
const DEFAULT_FASE = 'home'

function loadFase() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_FASE
  } catch {
    return DEFAULT_FASE
  }
}

export function useFaseApp() {
  const [faseApp, setFaseApp] = useState(loadFase)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, faseApp)
  }, [faseApp])

  return [faseApp, setFaseApp]
}

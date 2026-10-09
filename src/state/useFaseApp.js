import { useEffect, useRef, useState } from 'react'
import { salvaLocale } from './salvaLocale'

const STORAGE_KEY = 'meltable-wolves-fase-app'
const DEFAULT_FASE = 'home'

function loadFase() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_FASE
  } catch {
    return DEFAULT_FASE
  }
}

// Tasto Indietro del telefono: dalle schermate fuori partita torna alla
// schermata precedente; in partita le fasi notte/alba/giorno restano dove
// sono, invece di uscire dall'app o saltare indietro nel flusso. Dalla Home
// esce normalmente.
const INDIETRO = { mazzo: 'home', 'mazzo-galleria': 'home', libretto: 'home', offline: 'home', giocatori: 'mazzo' }
const IN_PARTITA = ['notte', 'alba', 'giorno']

export function useFaseApp() {
  const [faseApp, setFaseApp] = useState(loadFase)
  const faseRef = useRef(faseApp)
  faseRef.current = faseApp

  useEffect(() => {
    salvaLocale(STORAGE_KEY, faseApp)
    // una voce di cronologia "cuscinetto" fuori dalla Home: il Back la consuma
    // (popstate qui sotto) invece di lasciare la pagina. Anche dopo un refresh.
    if (faseApp !== 'home' && !window.history.state?.cuscinetto) window.history.pushState({ cuscinetto: true }, '')
  }, [faseApp])

  useEffect(() => {
    function onIndietro() {
      const fase = faseRef.current
      if (INDIETRO[fase]) setFaseApp(INDIETRO[fase])
      else if (IN_PARTITA.includes(fase)) window.history.pushState({ cuscinetto: true }, '')
    }
    window.addEventListener('popstate', onIndietro)
    return () => window.removeEventListener('popstate', onIndietro)
  }, [])

  return [faseApp, setFaseApp]
}

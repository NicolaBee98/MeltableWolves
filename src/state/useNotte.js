import { useEffect, useState } from 'react'
import { salvaLocale } from './salvaLocale'

const STORAGE_KEY = 'meltable-wolves-notte'
const DEFAULT_NOTTE = { round: 1, stepIndex: 0 }

function loadNotte() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    // validazione minima: dati corrotti o di uno schema vecchio → stato iniziale
    return Number.isInteger(parsed?.round) && Number.isInteger(parsed?.stepIndex) ? parsed : DEFAULT_NOTTE
  } catch {
    return DEFAULT_NOTTE
  }
}

export function useNotte() {
  const [notte, setNotte] = useState(loadNotte)

  useEffect(() => {
    salvaLocale(STORAGE_KEY, JSON.stringify(notte))
  }, [notte])

  function avanti(totalePassi) {
    setNotte((prev) => ({ ...prev, stepIndex: Math.min(prev.stepIndex + 1, totalePassi - 1) }))
  }

  function indietro() {
    setNotte((prev) => ({ ...prev, stepIndex: Math.max(prev.stepIndex - 1, 0) }))
  }

  // fotografia (round, stepIndex, ingresso nel passo) del passo corrente: dopo
  // un ricaricamento a metà passo permette di riaprirlo con lo stato d'ingresso
  // (titolari, giocatori) invece di ricostruirlo da quello già modificato
  function salvaIngresso(ingresso) {
    setNotte((prev) => ({ ...prev, ingresso }))
  }

  // si perde con la nuova notte: vale solo per il passo in corso. `fineNotte`
  // invece sopravvive (serve all'Alba per "Torna alla notte")
  function nuovaNotte() {
    setNotte((prev) => ({ round: prev.round + 1, stepIndex: 0, fineNotte: prev.fineNotte }))
  }

  // snapshot dell'ultimo passo della notte appena conclusa ({ round, stepIndex,
  // ingresso, giocatori, quantita, lunghezzaLog }): permette all'Alba di
  // tornare indietro. Persistito come il resto; null quando non serve più
  // (voto, nuova notte vera e propria)
  function salvaFineNotte(fineNotte) {
    setNotte((prev) => ({ ...prev, fineNotte }))
  }

  function svuotaFineNotte() {
    setNotte((prev) => ({ ...prev, fineNotte: undefined }))
  }

  // riporta round e passo a quelli dell'ultimo passo della notte conclusa
  function tornaAllaNotte() {
    setNotte((prev) =>
      prev.fineNotte
        ? { round: prev.fineNotte.round, stepIndex: prev.fineNotte.stepIndex, ingresso: prev.fineNotte.ingresso }
        : prev,
    )
  }

  function resetNotte() {
    setNotte(DEFAULT_NOTTE)
  }

  return {
    round: notte.round,
    stepIndex: notte.stepIndex,
    ingressoSalvato: notte.ingresso,
    fineNotte: notte.fineNotte,
    avanti,
    indietro,
    nuovaNotte,
    resetNotte,
    salvaIngresso,
    salvaFineNotte,
    svuotaFineNotte,
    tornaAllaNotte,
  }
}

import { useEffect, useState } from 'react'
import { salvaLocale } from './salvaLocale'

const STORAGE_KEY = 'meltable-wolves-impostazioni'
const STORAGE_KEY_VARIANTI = 'meltable-wolves-varianti-faccia'
const STORAGE_KEY_NOME_RUOLO = 'meltable-wolves-mostra-nome-ruolo'
const STORAGE_KEY_DURATA_TIMER = 'meltable-wolves-durata-timer'
const STORAGE_KEY_PROMEMORIA_MORTI = 'meltable-wolves-promemoria-ruoli-morti'
const STORAGE_KEY_VARIANTE_MEDIUM = 'meltable-wolves-variante-medium'
// nascosti di default: in una sala stretta altri giocatori potrebbero
// sbirciare lo schermo del narratore e vedere i ruoli a colpo d'occhio
const DEFAULT_MOSTRA_RUOLI = false
const DEFAULT_VARIANTI_FACCIA = true
const DEFAULT_MOSTRA_NOME_RUOLO = false
const DEFAULT_DURATA_TIMER = 60
const DEFAULT_PROMEMORIA_MORTI = true

function loadBooleano(key, default_) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? default_ : raw === 'true'
  } catch {
    return default_
  }
}

function loadDurataTimer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DURATA_TIMER)
    const numero = Number(raw)
    return raw !== null && numero > 0 ? numero : DEFAULT_DURATA_TIMER
  } catch {
    return DEFAULT_DURATA_TIMER
  }
}

export function useImpostazioni() {
  const [mostraRuoliInVotazione, setMostraRuoliInVotazione] = useState(() =>
    loadBooleano(STORAGE_KEY, DEFAULT_MOSTRA_RUOLI),
  )
  // varianti di faccia per Villico/Lupo Mannaro (vedi assetRuoli.js): alcuni
  // narratori preferiscono la stessa faccia per tutti, per non dare
  // involontariamente indizi visivi ai giocatori che sbirciano lo schermo
  const [variantiFaccia, setVariantiFaccia] = useState(() => loadBooleano(STORAGE_KEY_VARIANTI, DEFAULT_VARIANTI_FACCIA))
  // mostra il nome del ruolo tra parentesi accanto al nome del giocatore,
  // oltre all'icona (che da sola può essere ambigua a colpo d'occhio)
  const [mostraNomeRuolo, setMostraNomeRuolo] = useState(() =>
    loadBooleano(STORAGE_KEY_NOME_RUOLO, DEFAULT_MOSTRA_NOME_RUOLO),
  )
  // durata di default del timer per l'arringa difensiva allo spareggio
  const [durataTimer, setDurataTimer] = useState(loadDurataTimer)
  // durante la notte, richiama comunque i ruoli morti con potere ricorrente
  // (tranne Guaritore/Sciacallo Mannaro, che agiscono anche da morti): un
  // passo "promemoria" con la sola icona del teschio, per non far notare ai
  // giocatori che un passo è stato saltato in silenzio
  const [promemoriaRuoliMorti, setPromemoriaRuoliMorti] = useState(() =>
    loadBooleano(STORAGE_KEY_PROMEMORIA_MORTI, DEFAULT_PROMEMORIA_MORTI),
  )
  // variante del Medium (testoRegole in roles.js): percepisce solo l'aura
  // benevola/malvagia del defunto invece del suo ruolo esatto
  const [varianteMedium, setVarianteMedium] = useState(() => loadBooleano(STORAGE_KEY_VARIANTE_MEDIUM, false))

  useEffect(() => {
    salvaLocale(STORAGE_KEY, String(mostraRuoliInVotazione))
  }, [mostraRuoliInVotazione])

  useEffect(() => {
    salvaLocale(STORAGE_KEY_VARIANTI, String(variantiFaccia))
  }, [variantiFaccia])

  useEffect(() => {
    salvaLocale(STORAGE_KEY_NOME_RUOLO, String(mostraNomeRuolo))
  }, [mostraNomeRuolo])

  useEffect(() => {
    salvaLocale(STORAGE_KEY_DURATA_TIMER, String(durataTimer))
  }, [durataTimer])

  useEffect(() => {
    salvaLocale(STORAGE_KEY_PROMEMORIA_MORTI, String(promemoriaRuoliMorti))
  }, [promemoriaRuoliMorti])

  useEffect(() => {
    salvaLocale(STORAGE_KEY_VARIANTE_MEDIUM, String(varianteMedium))
  }, [varianteMedium])

  return {
    mostraRuoliInVotazione,
    setMostraRuoliInVotazione,
    variantiFaccia,
    setVariantiFaccia,
    mostraNomeRuolo,
    setMostraNomeRuolo,
    durataTimer,
    setDurataTimer,
    promemoriaRuoliMorti,
    setPromemoriaRuoliMorti,
    varianteMedium,
    setVarianteMedium,
  }
}

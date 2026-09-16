# Mazzo con Quantità e Vincoli Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Il mazzo supporta quantità per ruolo invece di semplice presenza/assenza: Villico fino a 12 copie, Lupo Mannaro fino a 5, Guardia inseribile solo in coppia (0 o 2), Guardia Mannara selezionabile solo se le Guardie sono già presenti. Primo sotto-progetto della revisione UX concordata (mazzo → giocatori → notte con assegnazione dal vivo → alba → voto → home/macchina a stati → log/impostazioni → redesign visivo).

**Architecture:** `useMazzo` passa da un array di slug unici (`ruoliSelezionati`) a una mappa quantità (`quantita: {[slug]: number}`), con un nuovo file di configurazione `QUANTITA_RUOLI` che definisce il massimo per ruolo (default 1 per i ruoli non elencati). `validaMazzo` viene adattato per "espandere" la mappa quantità in una lista ripetuta prima di applicare gli stessi controlli di bilanciamento già esistenti. `ruoliInMazzo` (lista di ruoli unici presenti) resta invariato nella forma per non impattare `PlayerTracker`/`NightSequencer`.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- Villico: 0-12 copie. Lupo Mannaro: 0-5 copie. Guardia: solo 0 o 2 (mai 1). Guardia Mannara: selezionabile solo se `quantita.guardia > 0`; se le Guardie vengono rimosse, la Guardia Mannara si azzera automaticamente. Tutti gli altri ruoli: 0 o 1, come oggi.
- `ruoliInMazzo` (usato da `PlayerTracker` e come base per `NightSequencer`) resta la lista dei ruoli **unici** con quantità > 0 — non replica i ruoli per quantità, dato che un dropdown/riferimento ruoli non deve mostrare "Villico" dodici volte.

---

### Task 1: Configurazione `QUANTITA_RUOLI`

**Files:**
- Create: `src/data/quantitaRuoli.js`
- Create: `src/data/quantitaRuoli.test.js`

**Interfaces:**
- Produces: `maxQuantita(slug: string) => number`.

- [ ] **Step 1: Scrivi il test fallente `src/data/quantitaRuoli.test.js`**

```js
import { maxQuantita } from './quantitaRuoli'

test('villico ha un massimo di 12', () => {
  expect(maxQuantita('villico')).toBe(12)
})

test('lupo mannaro ha un massimo di 5', () => {
  expect(maxQuantita('lupo-mannaro')).toBe(5)
})

test('guardia ha un massimo di 2 (va inserita in coppia)', () => {
  expect(maxQuantita('guardia')).toBe(2)
})

test('un ruolo non elencato ha un massimo di 1', () => {
  expect(maxQuantita('paladino')).toBe(1)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- quantitaRuoli`
Expected: FAIL — `Cannot find module './quantitaRuoli'`

- [ ] **Step 3: Scrivi `src/data/quantitaRuoli.js`**

```js
export const QUANTITA_RUOLI = {
  villico: { max: 12 },
  'lupo-mannaro': { max: 5 },
  guardia: { max: 2 },
}

export function maxQuantita(slug) {
  return QUANTITA_RUOLI[slug]?.max ?? 1
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- quantitaRuoli`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/data/quantitaRuoli.js src/data/quantitaRuoli.test.js
git commit -m "feat: add per-role quantity limits config"
```

---

### Task 2: `useMazzo` con quantità

**Files:**
- Modify: `src/state/useMazzo.js`
- Modify: `src/state/useMazzo.test.js`

**Interfaces:**
- Modifica: `useMazzo()` ritorna `{ numGiocatori, quantita: {[slug]: number}, setNumGiocatori, setQuantita(slug, valore), ruoliInMazzo }` invece di `{ ruoliSelezionati, toggleRuolo, ... }`.

- [ ] **Step 1: Riscrivi `src/state/useMazzo.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { useMazzo } from './useMazzo'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: 8 giocatori, nessuna quantità impostata', () => {
  const { result } = renderHook(() => useMazzo())

  expect(result.current.numGiocatori).toBe(8)
  expect(result.current.quantita).toEqual({})
  expect(result.current.ruoliInMazzo).toEqual([])
})

test('setNumGiocatori aggiorna il numero di giocatori', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setNumGiocatori(12)
  })

  expect(result.current.numGiocatori).toBe(12)
})

test('setQuantita imposta la quantità e aggiorna ruoliInMazzo', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', 5)
  })

  expect(result.current.quantita.villico).toBe(5)
  expect(result.current.ruoliInMazzo.map((r) => r.slug)).toEqual(['villico'])
})

test('setQuantita rimuove il ruolo da ruoliInMazzo se impostata a zero', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', 3)
    result.current.setQuantita('villico', 0)
  })

  expect(result.current.ruoliInMazzo).toEqual([])
})

test('setQuantita rispetta il massimo del ruolo (villico max 12)', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', 20)
  })

  expect(result.current.quantita.villico).toBe(12)
})

test('setQuantita rispetta il massimo di un ruolo unico (default 1)', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('paladino', 5)
  })

  expect(result.current.quantita.paladino).toBe(1)
})

test('setQuantita non scende sotto zero', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', -3)
  })

  expect(result.current.quantita.villico).toBe(0)
})

test('lo stato persiste in localStorage tra due montaggi', () => {
  const { result, unmount } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('lupo-mannaro', 2)
  })
  unmount()

  const { result: result2 } = renderHook(() => useMazzo())
  expect(result2.current.quantita['lupo-mannaro']).toBe(2)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useMazzo`
Expected: FAIL — `quantita`/`setQuantita` non esistono ancora

- [ ] **Step 3: Riscrivi `src/state/useMazzo.js`**

```js
import { useEffect, useState } from 'react'
import { ROLES } from '../data/roles'
import { maxQuantita } from '../data/quantitaRuoli'

const STORAGE_KEY = 'meltable-wolves-mazzo'
const DEFAULT_MAZZO = { numGiocatori: 8, quantita: {} }

function loadMazzo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MAZZO
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_MAZZO, ...parsed, quantita: parsed.quantita ?? {} }
  } catch {
    return DEFAULT_MAZZO
  }
}

export function useMazzo() {
  const [mazzo, setMazzo] = useState(loadMazzo)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mazzo))
  }, [mazzo])

  function setNumGiocatori(numGiocatori) {
    setMazzo((prev) => ({ ...prev, numGiocatori }))
  }

  function setQuantita(slug, valore) {
    const clampato = Math.max(0, Math.min(valore, maxQuantita(slug)))
    setMazzo((prev) => ({ ...prev, quantita: { ...prev.quantita, [slug]: clampato } }))
  }

  const ruoliInMazzo = ROLES.filter((ruolo) => (mazzo.quantita[ruolo.slug] ?? 0) > 0)

  return {
    numGiocatori: mazzo.numGiocatori,
    quantita: mazzo.quantita,
    setNumGiocatori,
    setQuantita,
    ruoliInMazzo,
  }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useMazzo`
Expected: PASS — 8 test

- [ ] **Step 5: Commit**

```bash
git add src/state/useMazzo.js src/state/useMazzo.test.js
git commit -m "feat: switch useMazzo from unique role list to per-role quantities"
```

---

### Task 3: `validaMazzo` con quantità

**Files:**
- Modify: `src/data/validaMazzo.js`
- Modify: `src/data/validaMazzo.test.js`

**Interfaces:**
- Modifica: `validaMazzo(quantita: {[slug]: number}, numGiocatori: number) => string[]` invece di `validaMazzo(ruoliSelezionati: string[], numGiocatori)`.

- [ ] **Step 1: Riscrivi `src/data/validaMazzo.test.js`**

```js
import { validaMazzo } from './validaMazzo'

test('mazzo vuoto genera avviso di conteggio e avviso nessun lupo', () => {
  const avvisi = validaMazzo({}, 8)
  expect(avvisi).toContain('Hai selezionato 0 ruoli per 8 giocatori.')
  expect(avvisi).toContain('Nessun lupo mannaro nel mazzo.')
})

test('mazzo bilanciato (10 giocatori, 2 lupi, 8 villici) non genera avvisi', () => {
  const quantita = { 'lupo-mannaro': 2, villico: 8 }
  expect(validaMazzo(quantita, 10)).toEqual([])
})

test('troppe fazioni indipendenti genera avviso dedicato', () => {
  const quantita = {
    'lupo-mannaro': 2,
    chupacabra: 1,
    'criceto-malvagio': 1,
    pifferaio: 1,
    villico: 5,
  }
  const avvisi = validaMazzo(quantita, 10)
  expect(avvisi).toContain('Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.')
})

test('troppi ruoli notturni genera avviso dedicato', () => {
  const quantita = { veggente: 1, paladino: 1, strega: 1, guaritore: 1, villico: 1 }
  const avvisi = validaMazzo(quantita, 5)
  expect(avvisi).toContain('Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.')
})

test('conta le quantità multiple nel totale ruoli', () => {
  const avvisi = validaMazzo({ villico: 3 }, 3)
  expect(avvisi).not.toContain('Hai selezionato 1 ruoli per 3 giocatori.')
  expect(avvisi).toContain('Nessun lupo mannaro nel mazzo.')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/validaMazzo`
Expected: FAIL — `validaMazzo({...})` riceve una mappa ma il codice si aspetta ancora un array

- [ ] **Step 3: Riscrivi `src/data/validaMazzo.js`**

```js
import { ROLES } from './roles'

const RAPPORTO_LUPI_CONSIGLIATO = 5
const MAX_INDIPENDENTI = 2
const SOGLIA_NOTTURNI = 0.7

function espandiRuoli(quantita) {
  const ruoli = []
  for (const slug of Object.keys(quantita)) {
    const ruolo = ROLES.find((r) => r.slug === slug)
    if (!ruolo) continue
    for (let i = 0; i < quantita[slug]; i++) {
      ruoli.push(ruolo)
    }
  }
  return ruoli
}

export function validaMazzo(quantita, numGiocatori) {
  const avvisi = []
  const ruoli = espandiRuoli(quantita)

  if (ruoli.length !== numGiocatori) {
    avvisi.push(`Hai selezionato ${ruoli.length} ruoli per ${numGiocatori} giocatori.`)
  }

  const numLupi = ruoli.filter((r) => r.fazione === 'lupi').length
  if (numLupi === 0) {
    avvisi.push('Nessun lupo mannaro nel mazzo.')
  } else if (numLupi < Math.floor(numGiocatori / RAPPORTO_LUPI_CONSIGLIATO)) {
    avvisi.push(
      `Pochi lupi mannari per ${numGiocatori} giocatori (consigliato circa 1 ogni ${RAPPORTO_LUPI_CONSIGLIATO}).`,
    )
  }

  const numIndipendenti = ruoli.filter((r) => r.fazione === 'indipendente').length
  if (numIndipendenti > MAX_INDIPENDENTI) {
    avvisi.push('Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.')
  }

  const numNotturni = ruoli.filter((r) => r.notturno).length
  if (ruoli.length > 0 && numNotturni / ruoli.length > SOGLIA_NOTTURNI) {
    avvisi.push('Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.')
  }

  return avvisi
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/validaMazzo`
Expected: PASS — 5 test

- [ ] **Step 5: Commit**

```bash
git add src/data/validaMazzo.js src/data/validaMazzo.test.js
git commit -m "feat: adapt validaMazzo to per-role quantities"
```

---

### Task 4: `MazzoBuilder` con stepper, coppia e gating

**Files:**
- Modify: `src/features/mazzo/MazzoBuilder.jsx`
- Modify: `src/features/mazzo/MazzoBuilder.test.jsx`

**Interfaces:**
- Modifica: `MazzoBuilder({ numGiocatori, quantita, setNumGiocatori, setQuantita })` invece di `{ numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo }`.

- [ ] **Step 1: Riscrivi `src/features/mazzo/MazzoBuilder.test.jsx`**

```jsx
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MazzoBuilder } from './MazzoBuilder'

function setup(overrides = {}) {
  const props = {
    numGiocatori: 8,
    quantita: {},
    setNumGiocatori: vi.fn(),
    setQuantita: vi.fn(),
    ...overrides,
  }
  render(<MazzoBuilder {...props} />)
  return props
}

test('mostra avviso "nessun lupo mannaro" quando il mazzo è vuoto', () => {
  setup()
  expect(screen.getByText('Nessun lupo mannaro nel mazzo.')).toBeInTheDocument()
})

test('lo stepper del Villico incrementa e decrementa la quantità', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { villico: 3 } })

  const riga = screen.getByText('Villico').closest('div')
  await user.click(within(riga).getByText('+'))
  expect(setQuantita).toHaveBeenCalledWith('villico', 4)

  await user.click(within(riga).getByText('-'))
  expect(setQuantita).toHaveBeenCalledWith('villico', 2)
})

test('lo stepper del Villico ha il pulsante "-" disabilitato a zero', () => {
  setup({ quantita: { villico: 0 } })
  const riga = screen.getByText('Villico').closest('div')
  expect(within(riga).getByText('-')).toBeDisabled()
})

test('la Guardia si aggiunge in coppia con una checkbox', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup()

  await user.click(screen.getByRole('checkbox', { name: /guardia \(coppia\)/i }))
  expect(setQuantita).toHaveBeenCalledWith('guardia', 2)
})

test('rimuovere la coppia di Guardie azzera anche la Guardia Mannara', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { guardia: 2, 'guardia-mannara': 1 } })

  await user.click(screen.getByRole('checkbox', { name: /guardia \(coppia\)/i }))

  expect(setQuantita).toHaveBeenCalledWith('guardia', 0)
  expect(setQuantita).toHaveBeenCalledWith('guardia-mannara', 0)
})

test('la Guardia Mannara è disabilitata finché non ci sono le Guardie', () => {
  setup()
  expect(screen.getByRole('checkbox', { name: /guardia mannara/i })).toBeDisabled()
})

test('la Guardia Mannara si abilita quando le Guardie sono presenti', () => {
  setup({ quantita: { guardia: 2 } })
  expect(screen.getByRole('checkbox', { name: /guardia mannara/i })).not.toBeDisabled()
})

test('click su un ruolo normale chiama setQuantita con 1', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup()

  await user.click(screen.getByRole('checkbox', { name: 'Paladino' }))

  expect(setQuantita).toHaveBeenCalledWith('paladino', 1)
})

test('cambiare il numero giocatori chiama setNumGiocatori', () => {
  const { setNumGiocatori } = setup()
  const input = screen.getByLabelText('Numero giocatori')
  fireEvent.change(input, { target: { value: '12' } })
  expect(setNumGiocatori).toHaveBeenCalledWith(12)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- MazzoBuilder`
Expected: FAIL — `MazzoBuilder` usa ancora `ruoliSelezionati`/`toggleRuolo`, niente stepper/coppia

- [ ] **Step 3: Riscrivi `src/features/mazzo/MazzoBuilder.jsx`**

```jsx
import { ROLES } from '../../data/roles'
import { validaMazzo } from '../../data/validaMazzo'

const FAZIONI_ORDINE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']
const FAZIONE_LABEL = {
  villaggio: 'Villaggio',
  lupi: 'Lupi',
  indipendente: 'Indipendenti',
  sconosciuto: 'Sconosciuti',
}
const RUOLI_A_QUANTITA = ['villico', 'lupo-mannaro']

export function MazzoBuilder({ numGiocatori, quantita, setNumGiocatori, setQuantita }) {
  const avvisi = validaMazzo(quantita, numGiocatori)
  const guardiePresenti = (quantita.guardia ?? 0) > 0

  function toggleGuardie(valoreAttuale) {
    if (valoreAttuale === 2) {
      setQuantita('guardia', 0)
      setQuantita('guardia-mannara', 0)
    } else {
      setQuantita('guardia', 2)
    }
  }

  return (
    <section className="mazzo-builder">
      <label htmlFor="numero-giocatori">Numero giocatori</label>
      <input
        id="numero-giocatori"
        type="number"
        min="1"
        value={numGiocatori}
        onChange={(event) => setNumGiocatori(Number(event.target.value))}
      />

      {avvisi.length > 0 && (
        <ul className="mazzo-builder__avvisi">
          {avvisi.map((avviso) => (
            <li key={avviso}>{avviso}</li>
          ))}
        </ul>
      )}

      {FAZIONI_ORDINE.map((fazione) => (
        <fieldset key={fazione}>
          <legend>{FAZIONE_LABEL[fazione]}</legend>
          {ROLES.filter((ruolo) => ruolo.fazione === fazione).map((ruolo) => {
            const valore = quantita[ruolo.slug] ?? 0

            if (RUOLI_A_QUANTITA.includes(ruolo.slug)) {
              return (
                <div key={ruolo.slug} className="mazzo-builder__stepper">
                  <span>{ruolo.nome}</span>
                  <button type="button" onClick={() => setQuantita(ruolo.slug, valore - 1)} disabled={valore === 0}>
                    -
                  </button>
                  <span>{valore}</span>
                  <button type="button" onClick={() => setQuantita(ruolo.slug, valore + 1)}>
                    +
                  </button>
                </div>
              )
            }

            if (ruolo.slug === 'guardia') {
              return (
                <label key={ruolo.slug} className="mazzo-builder__ruolo">
                  <input type="checkbox" checked={valore === 2} onChange={() => toggleGuardie(valore)} />
                  {ruolo.nome} (coppia)
                </label>
              )
            }

            if (ruolo.slug === 'guardia-mannara') {
              return (
                <label key={ruolo.slug} className="mazzo-builder__ruolo">
                  <input
                    type="checkbox"
                    checked={valore > 0}
                    disabled={!guardiePresenti}
                    onChange={() => setQuantita(ruolo.slug, valore > 0 ? 0 : 1)}
                  />
                  {ruolo.nome}
                  {!guardiePresenti && ' (richiede le Guardie)'}
                </label>
              )
            }

            return (
              <label key={ruolo.slug} className="mazzo-builder__ruolo">
                <input
                  type="checkbox"
                  checked={valore > 0}
                  onChange={() => setQuantita(ruolo.slug, valore > 0 ? 0 : 1)}
                />
                {ruolo.nome}
              </label>
            )
          })}
        </fieldset>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- MazzoBuilder`
Expected: PASS — 9 test

- [ ] **Step 5: Commit**

```bash
git add src/features/mazzo/MazzoBuilder.jsx src/features/mazzo/MazzoBuilder.test.jsx
git commit -m "feat: add stepper, pair toggle, and gating to MazzoBuilder"
```

---

### Task 5: Integrazione in App

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useMazzo` aggiornato (Task 2), `MazzoBuilder` aggiornato (Task 4).

- [ ] **Step 1: Aggiorna `src/App.jsx`**

Sostituisci la destrutturazione di `useMazzo()`:

```jsx
const { numGiocatori, quantita, setNumGiocatori, setQuantita, ruoliInMazzo } = useMazzo()
```

Sostituisci il blocco `MazzoBuilder`:

```jsx
{tab === 'mazzo' && (
  <MazzoBuilder
    numGiocatori={numGiocatori}
    quantita={quantita}
    setNumGiocatori={setNumGiocatori}
    setQuantita={setQuantita}
  />
)}
```

Sostituisci `ruoliSelezionati={ruoliSelezionati}` nel blocco `NightSequencer` con:

```jsx
ruoliSelezionati={ruoliInMazzo.map((r) => r.slug)}
```

- [ ] **Step 2: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 3: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 4: Verifica manuale rapida**

Run: `npm run dev`, apri l'app, vai su "Mazzo": incrementa Villico e Lupo Mannaro con lo stepper, aggiungi/rimuovi la coppia di Guardie, verifica che la Guardia Mannara sia disabilitata finché non aggiungi le Guardie.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire quantity-based mazzo into App"
```

---

## Fuori scope per questo piano

Setup giocatori a chip con ordine di seduta, assegnazione ruolo dal vivo durante la notte, alba con annunci derivati, macchina a stati unica, popup log/impostazioni, redesign visivo — restano i prossimi sotto-progetti concordati.

# Sequencer Notte — Motore (5a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guidare il narratore, notte per notte, nell'ordine di chiamata corretto dei ruoli effettivamente presenti nel mazzo — filtrando i passi solo-prima-notte dopo la notte 1 — senza ancora automatizzare alcuna azione sui giocatori (quello è il piano 5b).

**Architecture:** Dati statici ordinati (`NIGHT_STEPS`, trascritti dalle pagine 27-28 del regolamento) + funzione pura di filtro (`passiNotte`) che, dato il mazzo, la notte corrente e i giocatori, ritorna la lista ordinata di passi applicabili. Un hook `useNotte` (stesso pattern di `useMazzo`/`usePartita`) tiene lo stato di avanzamento (notte corrente, passo corrente) con persistenza `localStorage`. Per evitare la stessa "doppia istanza di hook" già incontrata con `useMazzo`, questo piano solleva anche `usePartita` a livello di `App` (finora era interno a `PlayerTracker`) così che sia `PlayerTracker` sia il nuovo `NightSequencer` condividano la stessa lista di giocatori.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato dai piani precedenti).
- Nessuna azione automatica sui giocatori in questo piano: ogni passo è solo informativo/di promemoria (selezione bersaglio e applicazione effetti sono il piano 5b).
- Un passo può comparire più volte per lo stesso ruolo se il regolamento lo prevede (es. Cucciolo di Lupo Mannaro compare sia nel promemoria "potere passivo" alla notte 1, sia ogni notte come parte del Branco dei Lupi) — non è un bug, è fedele al testo.
- I passi legati a una condizione (`innamorato`, `ipnotizzato`) invece che a un ruolo compaiono solo se almeno un giocatore ha già quella condizione impostata (anche manualmente dal tracker); questo è corretto perché l'automazione che le imposta arriva nel piano 5b.

---

### Task 1: Dati ordine di chiamata e funzione di filtro

**Files:**
- Create: `src/data/nightSteps.js`
- Create: `src/data/nightSteps.test.js`

**Interfaces:**
- Consumes: nessuna dipendenza da altri hook/componenti.
- Produces: `NIGHT_STEPS` (array ordinato, ogni elemento `{ id, titolo, tipo: 'azione'|'informativo', primaNotteSolo: bool, ruoli?: string[], condizione?: string }`); `passiNotte(ruoliSelezionati: string[], round: number, giocatori: Array<{ruoloSlug, condizioni}>) => NIGHT_STEPS[]` filtrato e nello stesso ordine di `NIGHT_STEPS`.

- [ ] **Step 1: Scrivi il test fallente `src/data/nightSteps.test.js`**

```js
import { passiNotte } from './nightSteps'

const NESSUN_GIOCATORE = []

test('mazzo senza ruoli con azione notturna non genera passi', () => {
  expect(passiNotte(['villico'], 1, NESSUN_GIOCATORE)).toEqual([])
})

test('mimo compare solo alla notte 1', () => {
  const passiNotte1 = passiNotte(['mimo'], 1, NESSUN_GIOCATORE)
  const passiNotte2 = passiNotte(['mimo'], 2, NESSUN_GIOCATORE)

  expect(passiNotte1.map((p) => p.id)).toContain('mimo')
  expect(passiNotte2.map((p) => p.id)).not.toContain('mimo')
})

test('paladino compare a ogni notte', () => {
  expect(passiNotte(['paladino'], 1, NESSUN_GIOCATORE).map((p) => p.id)).toContain('paladino')
  expect(passiNotte(['paladino'], 5, NESSUN_GIOCATORE).map((p) => p.id)).toContain('paladino')
})

test('i ruoli del branco dei lupi attivano il passo "branco-lupi"', () => {
  expect(passiNotte(['lupo-mannaro'], 1, NESSUN_GIOCATORE).map((p) => p.id)).toContain('branco-lupi')
})

test("rispetta l'ordine del regolamento tra le categorie", () => {
  const ruoli = ['fattucchiera', 'veggente', 'strega']
  const ordine = passiNotte(ruoli, 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['fattucchiera', 'veggente', 'strega'])
})

test('cucciolo di lupo mannaro compare sia nel promemoria potere-passivo sia nel branco', () => {
  const ordine = passiNotte(['cucciolo-di-lupo-mannaro'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['potere-passivo', 'branco-lupi'])
})

test('il passo "innamorati" compare solo se un giocatore ha la condizione innamorato', () => {
  const giocatoriSenzaCondizione = [
    { id: '1', nome: 'Anna', ruoloSlug: 'sacerdote', vivo: true, condizioni: [], note: '' },
  ]
  const giocatoriConCondizione = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['innamorato'], note: '' },
  ]

  expect(passiNotte(['sacerdote'], 1, giocatoriSenzaCondizione).map((p) => p.id)).not.toContain('innamorati')
  expect(passiNotte(['villico'], 1, giocatoriConCondizione).map((p) => p.id)).toContain('innamorati')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- nightSteps`
Expected: FAIL — `Cannot find module './nightSteps'`

- [ ] **Step 3: Scrivi `src/data/nightSteps.js`**

```js
export const NIGHT_STEPS = [
  // --- Solo prima notte, nell'ordine del regolamento (pag. 27) ---
  { id: 'mimo', titolo: 'Mimo', tipo: 'azione', primaNotteSolo: true, ruoli: ['mimo'] },
  { id: 'ladro', titolo: 'Ladro', tipo: 'azione', primaNotteSolo: true, ruoli: ['ladro'] },
  {
    id: 'potere-passivo',
    titolo: 'Promemoria: ruoli con potere passivo',
    tipo: 'informativo',
    primaNotteSolo: true,
    ruoli: [
      'lupo-mannaro-capobranco', 'criceto-malvagio', 'cucciolo-di-lupo-mannaro',
      'eremita', 'nano', 'nonna', 'pastore', 'polpo-mannaro', 'ubriaco',
    ],
  },
  {
    id: 'gesti-segreti',
    titolo: 'Promemoria: gesti segreti di Bardo e Gallo Mannaro',
    tipo: 'informativo',
    primaNotteSolo: true,
    ruoli: ['bardo', 'gallo-mannaro'],
  },
  { id: 'apprendista', titolo: 'Apprendista', tipo: 'azione', primaNotteSolo: true, ruoli: ['apprendista'] },
  { id: 'cavaliere', titolo: 'Cavaliere', tipo: 'azione', primaNotteSolo: true, ruoli: ['cavaliere'] },
  { id: 'figlia-dei-lupi', titolo: 'Figlia dei Lupi', tipo: 'azione', primaNotteSolo: true, ruoli: ['figlia-dei-lupi'] },
  { id: 'sacerdote', titolo: 'Sacerdote', tipo: 'azione', primaNotteSolo: true, ruoli: ['sacerdote'] },
  { id: 'guardia', titolo: 'Guardie (si riconoscono)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia'] },
  { id: 'guardia-mannara', titolo: 'Guardia Mannara (riconosce le Guardie)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia-mannara'] },
  { id: 'innamorati', titolo: 'Innamorati si riconoscono', tipo: 'informativo', primaNotteSolo: true, condizione: 'innamorato' },
  { id: 'mucca-mannara', titolo: 'Mucca Mannara (riconosce il branco)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['mucca-mannara'] },

  // --- Ogni notte, poteri non mortali (pag. 28) ---
  { id: 'fattucchiera', titolo: 'Fattucchiera', tipo: 'azione', primaNotteSolo: false, ruoli: ['fattucchiera'] },
  { id: 'addolorata', titolo: 'Addolorata', tipo: 'azione', primaNotteSolo: false, ruoli: ['addolorata'] },
  { id: 'cortigiana', titolo: 'Cortigiana', tipo: 'azione', primaNotteSolo: false, ruoli: ['cortigiana'] },
  { id: 'maga', titolo: 'Maga', tipo: 'azione', primaNotteSolo: false, ruoli: ['maga'] },
  { id: 'paladino', titolo: 'Paladino', tipo: 'azione', primaNotteSolo: false, ruoli: ['paladino'] },
  { id: 'pifferaio', titolo: 'Pifferaio', tipo: 'azione', primaNotteSolo: false, ruoli: ['pifferaio'] },
  { id: 'untore', titolo: 'Untore', tipo: 'azione', primaNotteSolo: false, ruoli: ['untore'] },
  { id: 'cartomante', titolo: 'Cartomante', tipo: 'informativo', primaNotteSolo: false, ruoli: ['cartomante'] },
  { id: 'inquisitore', titolo: 'Inquisitore', tipo: 'informativo', primaNotteSolo: false, ruoli: ['inquisitore'] },
  { id: 'medium', titolo: 'Medium', tipo: 'informativo', primaNotteSolo: false, ruoli: ['medium'] },
  { id: 'veggente', titolo: 'Veggente', tipo: 'informativo', primaNotteSolo: false, ruoli: ['veggente'] },
  { id: 'veggente-mannaro', titolo: 'Veggente Mannaro', tipo: 'informativo', primaNotteSolo: false, ruoli: ['veggente-mannaro'] },
  { id: 'guaritore', titolo: 'Guaritore', tipo: 'azione', primaNotteSolo: false, ruoli: ['guaritore'] },
  { id: 'sciacallo-mannaro', titolo: 'Sciacallo Mannaro', tipo: 'azione', primaNotteSolo: false, ruoli: ['sciacallo-mannaro'] },

  // --- Ogni notte, poteri mortali, per ultimi (pag. 28) ---
  { id: 'strega', titolo: 'Strega', tipo: 'azione', primaNotteSolo: false, ruoli: ['strega'] },
  {
    id: 'branco-lupi',
    titolo: 'Branco dei Lupi',
    tipo: 'azione',
    primaNotteSolo: false,
    ruoli: [
      'cucciolo-di-lupo-mannaro', 'lupo-mannaro', 'lupo-mannaro-capobranco',
      'lupo-mannaro-progenitore', 'nonna',
    ],
  },
  { id: 'chupacabra', titolo: 'Chupacabra', tipo: 'azione', primaNotteSolo: false, ruoli: ['chupacabra'] },
  { id: 'ipnotizzati', titolo: 'Sveglia gli ipnotizzati dal Pifferaio', tipo: 'informativo', primaNotteSolo: false, condizione: 'ipnotizzato' },
]

export function passiNotte(ruoliSelezionati, round, giocatori) {
  return NIGHT_STEPS.filter((step) => {
    if (step.primaNotteSolo && round > 1) return false

    if (step.condizione) {
      return giocatori.some((giocatore) => giocatore.condizioni.includes(step.condizione))
    }

    return step.ruoli.some((slug) => ruoliSelezionati.includes(slug))
  })
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- nightSteps`
Expected: PASS — 7 test

- [ ] **Step 5: Commit**

```bash
git add src/data/nightSteps.js src/data/nightSteps.test.js
git commit -m "feat: add night call-order data and passiNotte filter"
```

---

### Task 2: Hook `useNotte` (avanzamento notte/passo)

**Files:**
- Create: `src/state/useNotte.js`
- Create: `src/state/useNotte.test.js`

**Interfaces:**
- Consumes: nessuna.
- Produces: `useNotte()` che ritorna `{ round, stepIndex, avanti(totalePassi), indietro(), nuovaNotte() }`.

- [ ] **Step 1: Scrivi il test fallente `src/state/useNotte.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { useNotte } from './useNotte'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: notte 1, passo 0', () => {
  const { result } = renderHook(() => useNotte())
  expect(result.current.round).toBe(1)
  expect(result.current.stepIndex).toBe(0)
})

test('avanti incrementa stepIndex senza superare il totale passi', () => {
  const { result } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(2)
  })
  expect(result.current.stepIndex).toBe(1)

  act(() => {
    result.current.avanti(2)
  })
  expect(result.current.stepIndex).toBe(1)
})

test('indietro decrementa stepIndex senza scendere sotto zero', () => {
  const { result } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(3)
    result.current.avanti(3)
  })
  expect(result.current.stepIndex).toBe(2)

  act(() => {
    result.current.indietro()
    result.current.indietro()
    result.current.indietro()
  })
  expect(result.current.stepIndex).toBe(0)
})

test('nuovaNotte incrementa round e azzera stepIndex', () => {
  const { result } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(3)
    result.current.nuovaNotte()
  })

  expect(result.current.round).toBe(2)
  expect(result.current.stepIndex).toBe(0)
})

test('lo stato persiste in localStorage tra due montaggi dell\'hook', () => {
  const { result, unmount } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(3)
  })
  unmount()

  const { result: result2 } = renderHook(() => useNotte())
  expect(result2.current.stepIndex).toBe(1)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useNotte`
Expected: FAIL — `Cannot find module './useNotte'`

- [ ] **Step 3: Scrivi `src/state/useNotte.js`**

```js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-notte'
const DEFAULT_NOTTE = { round: 1, stepIndex: 0 }

function loadNotte() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_NOTTE
  } catch {
    return DEFAULT_NOTTE
  }
}

export function useNotte() {
  const [notte, setNotte] = useState(loadNotte)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notte))
  }, [notte])

  function avanti(totalePassi) {
    setNotte((prev) => ({ ...prev, stepIndex: Math.min(prev.stepIndex + 1, totalePassi - 1) }))
  }

  function indietro() {
    setNotte((prev) => ({ ...prev, stepIndex: Math.max(prev.stepIndex - 1, 0) }))
  }

  function nuovaNotte() {
    setNotte((prev) => ({ round: prev.round + 1, stepIndex: 0 }))
  }

  return { round: notte.round, stepIndex: notte.stepIndex, avanti, indietro, nuovaNotte }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useNotte`
Expected: PASS — 5 test

- [ ] **Step 5: Commit**

```bash
git add src/state/useNotte.js src/state/useNotte.test.js
git commit -m "feat: add useNotte hook for night/step progression"
```

---

### Task 3: Solleva `usePartita` in App, adatta `PlayerTracker` a riceverlo via props

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/features/players/PlayerTracker.jsx`
- Modify: `src/features/players/PlayerTracker.test.jsx`

**Interfaces:**
- Modifica: `PlayerTracker` passa da chiamare `usePartita()` internamente a ricevere `{ ruoliDisponibili, giocatori, addGiocatore, toggleVivo, setCondizioni, setNote }` tutti come props (stessa forma già esposta da `usePartita`).
- Motivo: il prossimo task aggiunge `NightSequencer`, che deve leggere la stessa lista `giocatori` di `PlayerTracker`. Chiamare `usePartita()` in due punti diversi creerebbe due istanze di stato indipendenti (stesso bug già preso con `useMazzo` nel piano precedente).

- [ ] **Step 1: Riscrivi `src/features/players/PlayerTracker.test.jsx` con props esplicite**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'
import { ROLES } from '../../data/roles'

function setup(overrides = {}) {
  const props = {
    ruoliDisponibili: ROLES,
    giocatori: [],
    addGiocatore: vi.fn(),
    toggleVivo: vi.fn(),
    setCondizioni: vi.fn(),
    setNote: vi.fn(),
    ...overrides,
  }
  render(<PlayerTracker {...props} />)
  return props
}

test('senza ruoli disponibili mostra un messaggio invece del form', () => {
  setup({ ruoliDisponibili: [] })
  expect(screen.getByText(/seleziona almeno un ruolo/i)).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Nome giocatore')).not.toBeInTheDocument()
})

test('aggiungere un giocatore chiama addGiocatore con nome e ruolo', async () => {
  const user = userEvent.setup()
  const { addGiocatore } = setup()

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(addGiocatore).toHaveBeenCalledWith('Giulia', ROLES[0].slug)
})

test('mostra i giocatori esistenti come card', () => {
  setup({
    giocatori: [
      { id: '1', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [], note: '' },
    ],
  })
  expect(screen.getByText('Marco')).toBeInTheDocument()
})

test('click sul pulsante stato chiama toggleVivo con id del giocatore', async () => {
  const user = userEvent.setup()
  const { toggleVivo } = setup({
    giocatori: [
      { id: '1', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [], note: '' },
    ],
  })

  await user.click(screen.getByRole('button', { name: 'Vivo' }))

  expect(toggleVivo).toHaveBeenCalledWith('1')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- PlayerTracker`
Expected: FAIL — `PlayerTracker` ignora ancora le props `giocatori`/`addGiocatore`/ecc. e usa il proprio `usePartita()` interno

- [ ] **Step 3: Aggiorna `src/features/players/PlayerTracker.jsx`**

```jsx
import { ROLES } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

export function PlayerTracker({ ruoliDisponibili, giocatori, addGiocatore, toggleVivo, setCondizioni, setNote }) {
  return (
    <section className="player-tracker">
      {ruoliDisponibili.length === 0 ? (
        <p>Seleziona almeno un ruolo nella scheda Mazzo per iniziare ad aggiungere giocatori.</p>
      ) : (
        <AddPlayerForm roles={ruoliDisponibili} onAdd={addGiocatore} />
      )}
      <div className="player-tracker__list">
        {giocatori.map((giocatore) => (
          <PlayerCard
            key={giocatore.id}
            giocatore={giocatore}
            ruolo={ROLES.find((r) => r.slug === giocatore.ruoloSlug)}
            condizioniDisponibili={CONDIZIONI}
            onToggleVivo={toggleVivo}
            onChangeCondizioni={setCondizioni}
            onChangeNote={setNote}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- PlayerTracker`
Expected: PASS — 4 test

- [ ] **Step 5: Aggiorna `src/App.jsx` per sollevare `usePartita` e passarlo a `PlayerTracker`**

```jsx
import { useState } from 'react'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'

export default function App() {
  const [tab, setTab] = useState('mazzo')
  const { numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote } = usePartita()

  return (
    <main className="app">
      <h1>Meltable Wolves — Narratore</h1>
      <nav className="app__tabs">
        <button type="button" aria-pressed={tab === 'mazzo'} onClick={() => setTab('mazzo')}>
          Mazzo
        </button>
        <button type="button" aria-pressed={tab === 'giocatori'} onClick={() => setTab('giocatori')}>
          Giocatori
        </button>
      </nav>
      {tab === 'mazzo' && (
        <MazzoBuilder
          numGiocatori={numGiocatori}
          ruoliSelezionati={ruoliSelezionati}
          setNumGiocatori={setNumGiocatori}
          toggleRuolo={toggleRuolo}
        />
      )}
      {tab === 'giocatori' && (
        <PlayerTracker
          ruoliDisponibili={ruoliInMazzo}
          giocatori={giocatori}
          addGiocatore={addGiocatore}
          toggleVivo={toggleVivo}
          setCondizioni={setCondizioni}
          setNote={setNote}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 6: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test esistenti (il terzo tab "Notte" arriva nel Task 5)

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/features/players/PlayerTracker.jsx src/features/players/PlayerTracker.test.jsx
git commit -m "refactor: lift usePartita to App so it can be shared with the night sequencer"
```

---

### Task 4: Componente `NightSequencer`

**Files:**
- Create: `src/features/notte/NightSequencer.jsx`
- Create: `src/features/notte/NightSequencer.test.jsx`

**Interfaces:**
- Consumes: `passiNotte` (Task 1), `useNotte` (Task 2). Riceve come props `ruoliSelezionati: string[]` (da `useMazzo`) e `giocatori` (da `usePartita`, sollevato in Task 3).
- Produces: componente `NightSequencer({ ruoliSelezionati, giocatori })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/NightSequencer.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NightSequencer } from './NightSequencer'

beforeEach(() => {
  localStorage.clear()
})

test('senza ruoli con azione notturna mostra un messaggio', () => {
  render(<NightSequencer ruoliSelezionati={['villico']} giocatori={[]} />)
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('mostra il primo passo e i giocatori assegnati a quel ruolo', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' },
  ]
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={giocatori} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()
  expect(screen.getByText('Sara')).toBeInTheDocument()
})

test('il pulsante Avanti passa al passo successivo', async () => {
  const user = userEvent.setup()
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test('sull\'ultimo passo il pulsante diventa "Notte successiva" e fa ripartire dal primo passo con la notte incrementata', async () => {
  const user = userEvent.setup()
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} />)

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByText('Paladino')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Notte successiva' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(screen.getByText('Notte 2')).toBeInTheDocument()
  expect(screen.getByText('Paladino')).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `Cannot find module './NightSequencer'`

- [ ] **Step 3: Scrivi `src/features/notte/NightSequencer.jsx`**

```jsx
import { passiNotte } from '../../data/nightSteps'
import { useNotte } from '../../state/useNotte'

export function NightSequencer({ ruoliSelezionati, giocatori }) {
  const { round, stepIndex, avanti, indietro, nuovaNotte } = useNotte()
  const steps = passiNotte(ruoliSelezionati, round, giocatori)

  if (steps.length === 0) {
    return <p>Nessun ruolo con azione notturna nel mazzo attuale.</p>
  }

  const indiceValido = Math.min(stepIndex, steps.length - 1)
  const step = steps[indiceValido]
  const ultimoPasso = indiceValido === steps.length - 1

  const giocatoriCoinvolti = step.condizione
    ? giocatori.filter((g) => g.condizioni.includes(step.condizione))
    : giocatori.filter((g) => step.ruoli.includes(g.ruoloSlug))

  return (
    <section className="night-sequencer">
      <p className="night-sequencer__notte">Notte {round}</p>
      <p className="night-sequencer__passo">
        Passo {indiceValido + 1} di {steps.length}
      </p>
      <h2>{step.titolo}</h2>
      <p className="night-sequencer__tipo">
        {step.tipo === 'informativo' ? 'Nessuna azione richiesta' : 'Possibile azione'}
      </p>

      {giocatoriCoinvolti.length === 0 ? (
        <p>Nessun giocatore assegnato a questo ruolo per ora.</p>
      ) : (
        <ul>
          {giocatoriCoinvolti.map((g) => (
            <li key={g.id}>
              {g.nome}
              {g.vivo ? '' : ' (morto)'}
            </li>
          ))}
        </ul>
      )}

      <div className="night-sequencer__nav">
        <button type="button" onClick={indietro} disabled={indiceValido === 0}>
          Indietro
        </button>
        {ultimoPasso ? (
          <button type="button" onClick={nuovaNotte}>
            Notte successiva
          </button>
        ) : (
          <button type="button" onClick={() => avanti(steps.length)}>
            Avanti
          </button>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- NightSequencer`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/NightSequencer.jsx src/features/notte/NightSequencer.test.jsx
git commit -m "feat: add NightSequencer component"
```

---

### Task 5: Integrazione — terzo tab "Notte" in App

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `NightSequencer` (Task 4).

- [ ] **Step 1: Aggiungi il test fallente in `src/App.test.jsx`**

```jsx
test('scheda Notte mostra un messaggio se il mazzo non ha ruoli con azione notturna', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Notte' }))

  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})
```

(Aggiungi questo test nel file esistente, dopo gli altri due `test(...)` già presenti.)

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- App.test`
Expected: FAIL — non esiste ancora un bottone "Notte"

- [ ] **Step 3: Aggiorna `src/App.jsx` per aggiungere il tab "Notte"**

```jsx
import { useState } from 'react'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'

export default function App() {
  const [tab, setTab] = useState('mazzo')
  const { numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote } = usePartita()

  return (
    <main className="app">
      <h1>Meltable Wolves — Narratore</h1>
      <nav className="app__tabs">
        <button type="button" aria-pressed={tab === 'mazzo'} onClick={() => setTab('mazzo')}>
          Mazzo
        </button>
        <button type="button" aria-pressed={tab === 'giocatori'} onClick={() => setTab('giocatori')}>
          Giocatori
        </button>
        <button type="button" aria-pressed={tab === 'notte'} onClick={() => setTab('notte')}>
          Notte
        </button>
      </nav>
      {tab === 'mazzo' && (
        <MazzoBuilder
          numGiocatori={numGiocatori}
          ruoliSelezionati={ruoliSelezionati}
          setNumGiocatori={setNumGiocatori}
          toggleRuolo={toggleRuolo}
        />
      )}
      {tab === 'giocatori' && (
        <PlayerTracker
          ruoliDisponibili={ruoliInMazzo}
          giocatori={giocatori}
          addGiocatore={addGiocatore}
          toggleVivo={toggleVivo}
          setCondizioni={setCondizioni}
          setNote={setNote}
        />
      )}
      {tab === 'notte' && <NightSequencer ruoliSelezionati={ruoliSelezionati} giocatori={giocatori} />}
    </main>
  )
}
```

- [ ] **Step 4: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 5: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: wire NightSequencer into a third App tab"
```

---

## Fuori scope per questo piano

Selezione bersaglio e applicazione automatica degli effetti (piano 5b), e i ruoli con legami persistenti (piano 5c, vedi spec).

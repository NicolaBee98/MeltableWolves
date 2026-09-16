# Creazione Mazzo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettere al narratore di comporre il mazzo di ruoli per la partita (numero giocatori + selezione ruoli) con avvisi di bilanciamento non bloccanti, e limitare il tracker giocatori ai soli ruoli effettivamente in gioco.

**Architecture:** Nuovo hook `useMazzo` (stato + `localStorage`, stesso pattern di `usePartita`) sollevato in `App.jsx` e passato come props sia a `MazzoBuilder` sia a `PlayerTracker`, per avere un'unica fonte di verità condivisa senza introdurre Context/router per due sole schermate.

**Tech Stack:** Invariato rispetto al piano precedente (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first: layout a colonna singola, bottoni con area di tocco minima 44x44px (invariato dal piano precedente).
- Nessun backend: persistenza solo `localStorage`.
- Tutte le etichette UI in italiano.
- Solo componenti funzionali React con hook.
- I consigli di bilanciamento del regolamento sono avvisi non bloccanti: il narratore può sempre confermare/usare il mazzo anche se un avviso è presente.
- Il form "Aggiungi giocatore" nel tracker deve mostrare solo i ruoli selezionati nel mazzo corrente, non l'intero catalogo.

---

### Task 1: Hook `useMazzo` con persistenza

**Files:**
- Create: `src/state/useMazzo.js`
- Create: `src/state/useMazzo.test.js`

**Interfaces:**
- Consumes: `ROLES` da `src/data/roles.js` (Task 2 del piano precedente, già esistente).
- Produces: `useMazzo()` che ritorna `{ numGiocatori, ruoliSelezionati, setNumGiocatori(n), toggleRuolo(slug), ruoliInMazzo }`, dove `ruoliInMazzo` è l'array di oggetti `ROLES` i cui `slug` sono in `ruoliSelezionati`.

- [ ] **Step 1: Scrivi il test fallente `src/state/useMazzo.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { useMazzo } from './useMazzo'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: 8 giocatori, nessun ruolo selezionato', () => {
  const { result } = renderHook(() => useMazzo())

  expect(result.current.numGiocatori).toBe(8)
  expect(result.current.ruoliSelezionati).toEqual([])
  expect(result.current.ruoliInMazzo).toEqual([])
})

test('setNumGiocatori aggiorna il numero di giocatori', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setNumGiocatori(12)
  })

  expect(result.current.numGiocatori).toBe(12)
})

test('toggleRuolo aggiunge e rimuove uno slug da ruoliSelezionati e ruoliInMazzo', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.toggleRuolo('villico')
  })
  expect(result.current.ruoliSelezionati).toEqual(['villico'])
  expect(result.current.ruoliInMazzo.map((r) => r.slug)).toEqual(['villico'])

  act(() => {
    result.current.toggleRuolo('villico')
  })
  expect(result.current.ruoliSelezionati).toEqual([])
  expect(result.current.ruoliInMazzo).toEqual([])
})

test('lo stato persiste in localStorage tra due montaggi dell\'hook', () => {
  const { result, unmount } = renderHook(() => useMazzo())

  act(() => {
    result.current.setNumGiocatori(10)
    result.current.toggleRuolo('lupo-mannaro')
  })
  unmount()

  const { result: result2 } = renderHook(() => useMazzo())
  expect(result2.current.numGiocatori).toBe(10)
  expect(result2.current.ruoliSelezionati).toEqual(['lupo-mannaro'])
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useMazzo`
Expected: FAIL — `Cannot find module './useMazzo'`

- [ ] **Step 3: Scrivi `src/state/useMazzo.js`**

```js
import { useEffect, useState } from 'react'
import { ROLES } from '../data/roles'

const STORAGE_KEY = 'meltable-wolves-mazzo'
const DEFAULT_MAZZO = { numGiocatori: 8, ruoliSelezionati: [] }

function loadMazzo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_MAZZO
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

  function toggleRuolo(slug) {
    setMazzo((prev) => ({
      ...prev,
      ruoliSelezionati: prev.ruoliSelezionati.includes(slug)
        ? prev.ruoliSelezionati.filter((s) => s !== slug)
        : [...prev.ruoliSelezionati, slug],
    }))
  }

  const ruoliInMazzo = ROLES.filter((ruolo) => mazzo.ruoliSelezionati.includes(ruolo.slug))

  return {
    numGiocatori: mazzo.numGiocatori,
    ruoliSelezionati: mazzo.ruoliSelezionati,
    setNumGiocatori,
    toggleRuolo,
    ruoliInMazzo,
  }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useMazzo`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/state/useMazzo.js src/state/useMazzo.test.js
git commit -m "feat: add useMazzo hook with localStorage persistence"
```

---

### Task 2: Validazione bilanciamento mazzo

**Files:**
- Create: `src/data/validaMazzo.js`
- Create: `src/data/validaMazzo.test.js`

**Interfaces:**
- Consumes: `ROLES` da `src/data/roles.js`.
- Produces: `validaMazzo(ruoliSelezionati: string[], numGiocatori: number) => string[]` (array di messaggi di avviso, vuoto se nessun avviso).

- [ ] **Step 1: Scrivi il test fallente `src/data/validaMazzo.test.js`**

```js
import { validaMazzo } from './validaMazzo'

test('mazzo vuoto genera avviso di conteggio e avviso nessun lupo', () => {
  const avvisi = validaMazzo([], 8)
  expect(avvisi).toContain('Hai selezionato 0 ruoli per 8 giocatori.')
  expect(avvisi).toContain('Nessun lupo mannaro nel mazzo.')
})

test('mazzo bilanciato (10 giocatori, 2 lupi, 8 villici) non genera avvisi', () => {
  const ruoli = [
    'lupo-mannaro', 'lupo-mannaro',
    'villico', 'villico', 'villico', 'villico',
    'villico', 'villico', 'villico', 'villico',
  ]
  expect(validaMazzo(ruoli, 10)).toEqual([])
})

test('troppe fazioni indipendenti genera avviso dedicato', () => {
  const ruoli = [
    'lupo-mannaro', 'lupo-mannaro',
    'chupacabra', 'criceto-malvagio', 'pifferaio',
    'villico', 'villico', 'villico', 'villico', 'villico',
  ]
  const avvisi = validaMazzo(ruoli, 10)
  expect(avvisi).toContain('Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.')
})

test('troppi ruoli notturni genera avviso dedicato', () => {
  const ruoli = ['veggente', 'paladino', 'strega', 'guaritore', 'villico']
  const avvisi = validaMazzo(ruoli, 5)
  expect(avvisi).toContain('Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- validaMazzo`
Expected: FAIL — `Cannot find module './validaMazzo'`

- [ ] **Step 3: Scrivi `src/data/validaMazzo.js`**

```js
import { ROLES } from './roles'

const RAPPORTO_LUPI_CONSIGLIATO = 5
const MAX_INDIPENDENTI = 2
const SOGLIA_NOTTURNI = 0.7

export function validaMazzo(ruoliSelezionati, numGiocatori) {
  const avvisi = []
  const ruoli = ruoliSelezionati
    .map((slug) => ROLES.find((r) => r.slug === slug))
    .filter(Boolean)

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

Run: `npm test -- validaMazzo`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/data/validaMazzo.js src/data/validaMazzo.test.js
git commit -m "feat: add validaMazzo balance-warning function"
```

---

### Task 3: Componente `MazzoBuilder`

**Files:**
- Create: `src/features/mazzo/MazzoBuilder.jsx`
- Create: `src/features/mazzo/MazzoBuilder.test.jsx`

**Interfaces:**
- Consumes: `ROLES` (Task 2 del piano precedente), `validaMazzo` (Task 2 di questo piano). Riceve come props `numGiocatori`, `ruoliSelezionati`, `setNumGiocatori`, `toggleRuolo` (stessa forma ritornata da `useMazzo`, Task 1).
- Produces: componente `MazzoBuilder({ numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo })` (nessun task successivo in questo piano dipende dalla sua interfaccia oltre al montaggio in App).

- [ ] **Step 1: Scrivi il test fallente `src/features/mazzo/MazzoBuilder.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MazzoBuilder } from './MazzoBuilder'

function setup(overrides = {}) {
  const props = {
    numGiocatori: 8,
    ruoliSelezionati: [],
    setNumGiocatori: vi.fn(),
    toggleRuolo: vi.fn(),
    ...overrides,
  }
  render(<MazzoBuilder {...props} />)
  return props
}

test('mostra avviso "nessun lupo mannaro" quando il mazzo è vuoto', () => {
  setup()
  expect(screen.getByText('Nessun lupo mannaro nel mazzo.')).toBeInTheDocument()
})

test('non mostra avvisi lupi quando un ruolo lupi è selezionato in numero sufficiente', () => {
  setup({ numGiocatori: 1, ruoliSelezionati: ['lupo-mannaro'] })
  expect(screen.queryByText('Nessun lupo mannaro nel mazzo.')).not.toBeInTheDocument()
})

test('click su un ruolo chiama toggleRuolo con lo slug corretto', async () => {
  const user = userEvent.setup()
  const { toggleRuolo } = setup()

  await user.click(screen.getByRole('checkbox', { name: 'Villico' }))

  expect(toggleRuolo).toHaveBeenCalledWith('villico')
})

test('cambiare il numero giocatori chiama setNumGiocatori', async () => {
  const user = userEvent.setup()
  const { setNumGiocatori } = setup()

  const input = screen.getByLabelText('Numero giocatori')
  await user.clear(input)
  await user.type(input, '12')

  expect(setNumGiocatori).toHaveBeenLastCalledWith(12)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- MazzoBuilder`
Expected: FAIL — `Cannot find module './MazzoBuilder'`

- [ ] **Step 3: Scrivi `src/features/mazzo/MazzoBuilder.jsx`**

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

export function MazzoBuilder({ numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo }) {
  const avvisi = validaMazzo(ruoliSelezionati, numGiocatori)

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
          {ROLES.filter((ruolo) => ruolo.fazione === fazione).map((ruolo) => (
            <label key={ruolo.slug} className="mazzo-builder__ruolo">
              <input
                type="checkbox"
                checked={ruoliSelezionati.includes(ruolo.slug)}
                onChange={() => toggleRuolo(ruolo.slug)}
              />
              {ruolo.nome}
            </label>
          ))}
        </fieldset>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- MazzoBuilder`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/features/mazzo/MazzoBuilder.jsx src/features/mazzo/MazzoBuilder.test.jsx
git commit -m "feat: add MazzoBuilder component"
```

---

### Task 4: Integrazione in App — tab navigation e tracker filtrato sul mazzo

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/features/players/PlayerTracker.jsx`
- Modify: `src/features/players/PlayerTracker.test.jsx`

**Interfaces:**
- Consumes: `useMazzo` (Task 1), `MazzoBuilder` (Task 3).
- Modifies: `PlayerTracker` da nessuna prop a `PlayerTracker({ ruoliDisponibili })`, dove `ruoliDisponibili` è l'array di ruoli (stessa forma di `ROLES`) da offrire nel form "Aggiungi giocatore". Se vuoto, il tracker mostra un messaggio invece del form.

- [ ] **Step 1: Aggiorna il test `src/features/players/PlayerTracker.test.jsx` per passare `ruoliDisponibili` e verificare il messaggio a vuoto**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'
import { ROLES } from '../../data/roles'

beforeEach(() => {
  localStorage.clear()
})

test('senza ruoli disponibili mostra un messaggio invece del form', () => {
  render(<PlayerTracker ruoliDisponibili={[]} />)
  expect(screen.getByText(/seleziona almeno un ruolo/i)).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Nome giocatore')).not.toBeInTheDocument()
})

test('aggiungere un giocatore lo mostra subito nella lista', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker ruoliDisponibili={ROLES} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(screen.getByText('Giulia')).toBeInTheDocument()
})

test('cambiare stato vivo/morto aggiorna la card', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker ruoliDisponibili={ROLES} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))
  await user.click(screen.getByRole('button', { name: /vivo/i }))

  expect(screen.getByRole('button', { name: 'Morto' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- PlayerTracker`
Expected: FAIL — il primo test non trova il messaggio (il componente non lo produce ancora); gli altri due falliscono perché `PlayerTracker` non accetta ancora `ruoliDisponibili`.

- [ ] **Step 3: Aggiorna `src/features/players/PlayerTracker.jsx`**

```jsx
import { ROLES } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { usePartita } from '../../state/usePartita'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

export function PlayerTracker({ ruoliDisponibili }) {
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote } = usePartita()

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
Expected: PASS — 3 test

- [ ] **Step 5: Aggiorna `src/App.test.jsx` per il nuovo tab "Mazzo" di default**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('renders app heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /meltable wolves/i })).toBeInTheDocument()
})

test('parte sulla scheda Mazzo e permette di passare a Giocatori', async () => {
  const user = userEvent.setup()
  render(<App />)

  expect(screen.getByLabelText('Numero giocatori')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Giocatori' }))

  expect(screen.getByText(/seleziona almeno un ruolo/i)).toBeInTheDocument()
})
```

- [ ] **Step 6: Esegui il test e verifica che fallisca**

Run: `npm test -- App.test`
Expected: FAIL — `App` non ha ancora tab né `MazzoBuilder` montato

- [ ] **Step 7: Aggiorna `src/App.jsx`**

```jsx
import { useState } from 'react'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { useMazzo } from './state/useMazzo'

export default function App() {
  const [tab, setTab] = useState('mazzo')
  const { numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo, ruoliInMazzo } = useMazzo()

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
      {tab === 'mazzo' ? (
        <MazzoBuilder
          numGiocatori={numGiocatori}
          ruoliSelezionati={ruoliSelezionati}
          setNumGiocatori={setNumGiocatori}
          toggleRuolo={toggleRuolo}
        />
      ) : (
        <PlayerTracker ruoliDisponibili={ruoliInMazzo} />
      )}
    </main>
  )
}
```

- [ ] **Step 8: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test, incluso questo piano

- [ ] **Step 9: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 10: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/features/players/PlayerTracker.jsx src/features/players/PlayerTracker.test.jsx
git commit -m "feat: wire MazzoBuilder and mazzo-filtered tracker into App"
```

---

## Fuori scope per questo piano

Sequencer fase notte, fase giorno/voto e log partita restano i passi 5-7 della roadmap (vedi spec), ciascuno con un proprio piano successivo.

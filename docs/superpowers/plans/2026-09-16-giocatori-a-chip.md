# Setup Giocatori a Chip con Ordine di Seduta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un giocatore richiede solo un nome (invio o pulsante), senza scegliere un ruolo — il ruolo si assegnerà durante la notte (prossimo sotto-progetto). L'ordine di inserimento nell'array `giocatori` rappresenta l'ordine di seduta in senso orario dal Narratore; una nuova funzione pura calcola i vicini di ciascun giocatore "a cerchio", base per gli annunci d'alba futuri (es. Pastore).

**Architecture:** `usePartita.addGiocatore` perde il parametro ruolo (il giocatore nasce con `ruoloSlug: undefined`). `AddPlayerForm` perde la select dei ruoli. `PlayerTracker` perde il gate "seleziona almeno un ruolo nel mazzo" (non più necessario) e la prop `ruoliDisponibili`. Una nuova funzione pura `vicini(giocatori, id)` in `src/data/vicinanza.js` calcola i vicini di sinistra/destra trattando l'array come un cerchio.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- L'ordine dell'array `giocatori` è l'ordine di seduta: nessun campo posizione separato, i giocatori vanno inseriti nell'ordine in cui il narratore li registra (in senso orario a partire da se stesso).
- Un giocatore senza ruolo assegnato mostra "Ruolo non ancora assegnato" (non "Ruolo sconosciuto", per non confondersi con la fazione "Sconosciuto" del regolamento).
- Questo piano non tocca l'aspetto visivo della lista giocatori (resta `PlayerCard` come oggi) — il vero "chip" cliccabile per assegnare ruoli dal vivo è il prossimo sotto-progetto.

---

### Task 1: Funzione pura `vicini`

**Files:**
- Create: `src/data/vicinanza.js`
- Create: `src/data/vicinanza.test.js`

**Interfaces:**
- Produces: `vicini(giocatori: Array<{id}>, id: string) => { sinistra: giocatore|null, destra: giocatore|null }`.

- [ ] **Step 1: Scrivi il test fallente `src/data/vicinanza.test.js`**

```js
import { vicini } from './vicinanza'

test('ritorna il vicino di sinistra e destra nel mezzo del cerchio', () => {
  const giocatori = [{ id: '1' }, { id: '2' }, { id: '3' }]
  expect(vicini(giocatori, '2')).toEqual({ sinistra: { id: '1' }, destra: { id: '3' } })
})

test("il primo giocatore ha come vicino di sinistra l'ultimo (cerchio)", () => {
  const giocatori = [{ id: '1' }, { id: '2' }, { id: '3' }]
  expect(vicini(giocatori, '1')).toEqual({ sinistra: { id: '3' }, destra: { id: '2' } })
})

test("l'ultimo giocatore ha come vicino di destra il primo (cerchio)", () => {
  const giocatori = [{ id: '1' }, { id: '2' }, { id: '3' }]
  expect(vicini(giocatori, '3')).toEqual({ sinistra: { id: '2' }, destra: { id: '1' } })
})

test('ritorna null per un id non presente', () => {
  const giocatori = [{ id: '1' }, { id: '2' }]
  expect(vicini(giocatori, 'x')).toEqual({ sinistra: null, destra: null })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- vicinanza`
Expected: FAIL — `Cannot find module './vicinanza'`

- [ ] **Step 3: Scrivi `src/data/vicinanza.js`**

```js
export function vicini(giocatori, id) {
  const indice = giocatori.findIndex((g) => g.id === id)
  if (indice === -1) return { sinistra: null, destra: null }

  const sinistra = giocatori[(indice - 1 + giocatori.length) % giocatori.length] ?? null
  const destra = giocatori[(indice + 1) % giocatori.length] ?? null

  return { sinistra, destra }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- vicinanza`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/data/vicinanza.js src/data/vicinanza.test.js
git commit -m "feat: add vicini pure function for circular seating adjacency"
```

---

### Task 2: `usePartita.addGiocatore` senza ruolo richiesto

**Files:**
- Modify: `src/state/usePartita.js`
- Modify: `src/state/usePartita.test.js`

**Interfaces:**
- Modifica: `addGiocatore(nome)` invece di `addGiocatore(nome, ruoloSlug)` — il giocatore nasce con `ruoloSlug: undefined`.

- [ ] **Step 1: Riscrivi `src/state/usePartita.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { usePartita } from './usePartita'

beforeEach(() => {
  localStorage.clear()
})

test('addGiocatore aggiunge un giocatore vivo senza ruolo assegnato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori).toHaveLength(1)
  expect(result.current.giocatori[0]).toMatchObject({
    nome: 'Anna',
    ruoloSlug: undefined,
    vivo: true,
    condizioni: [],
    note: '',
  })
})

test('toggleVivo inverte lo stato vivo/morto del giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.toggleVivo(id)
  })

  expect(result.current.giocatori[0].vivo).toBe(false)
})

test('setCondizioni e setNote aggiornano il giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.setCondizioni(id, ['ipnotizzato'])
    result.current.setNote(id, 'ha votato per Marco')
  })

  expect(result.current.giocatori[0].condizioni).toEqual(['ipnotizzato'])
  expect(result.current.giocatori[0].note).toBe('ha votato per Marco')
})

test('lo stato persiste in localStorage tra due montaggi dell\'hook', () => {
  const { result, unmount } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  unmount()

  const { result: result2 } = renderHook(() => usePartita())
  expect(result2.current.giocatori).toHaveLength(1)
  expect(result2.current.giocatori[0].nome).toBe('Anna')
})

test('addGiocatore inizializza poteriUsati vuoto', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori[0].poteriUsati).toEqual([])
})

test('aggiornaGiocatore applica una patch parziale al giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.aggiornaGiocatore(id, { vivo: false, poteriUsati: ['guaritore-resuscita'] })
  })

  expect(result.current.giocatori[0].vivo).toBe(false)
  expect(result.current.giocatori[0].poteriUsati).toEqual(['guaritore-resuscita'])
})

test('aggiornaGiocatore può assegnare il ruolo a un giocatore già esistente', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.aggiornaGiocatore(id, { ruoloSlug: 'paladino' })
  })

  expect(result.current.giocatori[0].ruoloSlug).toBe('paladino')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- state/usePartita`
Expected: FAIL — `giocatori[0].ruoloSlug` risulta `'villico'` (l'argomento extra viene ancora usato) invece di `undefined`, dato che `addGiocatore` non è ancora stata modificata

Nota: dato che JavaScript ignora silenziosamente gli argomenti extra, l'unico modo per vedere il fallimento reale è eseguire questo step prima di toccare `usePartita.js` — la vecchia implementazione richiede ancora `ruoloSlug` come secondo parametro e lo userà se passato, ma qui non lo passiamo più, quindi `ruoloSlug` risulterà `undefined` per via del parametro mancante anche con il vecchio codice. Verifica comunque che gli altri test passino invariati prima di procedere, poi prosegui allo Step 3 per allineare esplicitamente l'implementazione.

- [ ] **Step 3: Aggiorna `src/state/usePartita.js`**

```js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-partita'

function loadGiocatori() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function usePartita() {
  const [giocatori, setGiocatori] = useState(loadGiocatori)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(giocatori))
  }, [giocatori])

  function addGiocatore(nome) {
    setGiocatori((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome, ruoloSlug: undefined, vivo: true, condizioni: [], note: '', poteriUsati: [] },
    ])
  }

  function toggleVivo(id) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, vivo: !g.vivo } : g)))
  }

  function setCondizioni(id, condizioni) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, condizioni } : g)))
  }

  function setNote(id, note) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, note } : g)))
  }

  function aggiornaGiocatore(id, patch) {
    setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  return { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- state/usePartita`
Expected: PASS — 8 test

- [ ] **Step 5: Commit**

```bash
git add src/state/usePartita.js src/state/usePartita.test.js
git commit -m "feat: drop role requirement from addGiocatore, assign later via aggiornaGiocatore"
```

---

### Task 3: `AddPlayerForm` senza selezione ruolo

**Files:**
- Modify: `src/features/players/AddPlayerForm.jsx`
- Modify: `src/features/players/AddPlayerForm.test.jsx`

**Interfaces:**
- Modifica: `AddPlayerForm({ onAdd })` invece di `AddPlayerForm({ roles, onAdd })`; `onAdd(nome)` invece di `onAdd(nome, ruoloSlug)`.

- [ ] **Step 1: Riscrivi `src/features/players/AddPlayerForm.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPlayerForm } from './AddPlayerForm'

test('digitare un nome e premere Invio chiama onAdd con il nome', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm onAdd={onAdd} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Marco{Enter}')

  expect(onAdd).toHaveBeenCalledWith('Marco')
})

test("svuota il campo dopo l'aggiunta", async () => {
  const user = userEvent.setup()
  render(<AddPlayerForm onAdd={() => {}} />)

  const input = screen.getByPlaceholderText('Nome giocatore')
  await user.type(input, 'Marco{Enter}')

  expect(input).toHaveValue('')
})

test('non chiama onAdd se il nome è vuoto', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm onAdd={onAdd} />)

  await user.click(screen.getByRole('button', { name: 'Aggiungi' }))

  expect(onAdd).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AddPlayerForm`
Expected: FAIL — il componente attuale chiama `onAdd(nome, ruoloSlug)` e richiede la prop `roles`

- [ ] **Step 3: Riscrivi `src/features/players/AddPlayerForm.jsx`**

```jsx
import { useState } from 'react'

export function AddPlayerForm({ onAdd }) {
  const [nome, setNome] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!nome.trim()) return
    onAdd(nome.trim())
    setNome('')
  }

  return (
    <form onSubmit={handleSubmit} className="add-player-form">
      <input
        type="text"
        placeholder="Nome giocatore"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
      />
      <button type="submit">Aggiungi</button>
    </form>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AddPlayerForm`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/features/players/AddPlayerForm.jsx src/features/players/AddPlayerForm.test.jsx
git commit -m "feat: simplify AddPlayerForm to name-only chip entry"
```

---

### Task 4: `PlayerCard` — testo per ruolo non assegnato

**Files:**
- Modify: `src/features/players/PlayerCard.jsx`
- Modify: `src/features/players/PlayerCard.test.jsx`

**Interfaces:**
- Invariata: `PlayerCard({ giocatore, ruolo, condizioniDisponibili, onToggleVivo, onChangeCondizioni, onChangeNote })`. Cambia solo il testo di fallback quando `ruolo` è `undefined`.

- [ ] **Step 1: Aggiungi il test fallito in `src/features/players/PlayerCard.test.jsx`** (in coda al file, verifica prima il contenuto esistente per riusare le stesse costanti `giocatore`/`condizioniDisponibili` già definite in cima al file)

```jsx
test('mostra "Ruolo non ancora assegnato" se il ruolo non è ancora noto', () => {
  render(
    <PlayerCard
      giocatore={{ ...giocatore, ruoloSlug: undefined }}
      ruolo={undefined}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={() => {}}
      onChangeNote={() => {}}
    />,
  )
  expect(screen.getByText('Ruolo non ancora assegnato')).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- PlayerCard`
Expected: FAIL — il componente mostra ancora "Ruolo sconosciuto"

- [ ] **Step 3: Aggiorna `src/features/players/PlayerCard.jsx`**

Cambia la riga:

```jsx
{ruolo?.nome ?? 'Ruolo sconosciuto'}
```

in:

```jsx
{ruolo?.nome ?? 'Ruolo non ancora assegnato'}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- PlayerCard`
Expected: PASS — tutti i test del file (quelli esistenti più il nuovo)

- [ ] **Step 5: Commit**

```bash
git add src/features/players/PlayerCard.jsx src/features/players/PlayerCard.test.jsx
git commit -m "feat: clarify unassigned-role label on PlayerCard"
```

---

### Task 5: `PlayerTracker` senza gate sul mazzo

**Files:**
- Modify: `src/features/players/PlayerTracker.jsx`
- Modify: `src/features/players/PlayerTracker.test.jsx`

**Interfaces:**
- Modifica: `PlayerTracker({ giocatori, addGiocatore, toggleVivo, setCondizioni, setNote })` — rimuove `ruoliDisponibili`.

- [ ] **Step 1: Riscrivi `src/features/players/PlayerTracker.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'

function setup(overrides = {}) {
  const props = {
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

test('aggiungere un giocatore chiama addGiocatore con il nome', async () => {
  const user = userEvent.setup()
  const { addGiocatore } = setup()

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia{Enter}')

  expect(addGiocatore).toHaveBeenCalledWith('Giulia')
})

test('mostra i giocatori esistenti come card, con ruolo non assegnato se assente', () => {
  setup({
    giocatori: [{ id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [], note: '' }],
  })
  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.getByText('Ruolo non ancora assegnato')).toBeInTheDocument()
})

test('click sul pulsante stato chiama toggleVivo con id del giocatore', async () => {
  const user = userEvent.setup()
  const { toggleVivo } = setup({
    giocatori: [{ id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [], note: '' }],
  })

  await user.click(screen.getByRole('button', { name: 'Vivo' }))

  expect(toggleVivo).toHaveBeenCalledWith('1')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- PlayerTracker`
Expected: FAIL — il componente richiede ancora `ruoliDisponibili` e mostra il gate

- [ ] **Step 3: Riscrivi `src/features/players/PlayerTracker.jsx`**

```jsx
import { ROLES } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

export function PlayerTracker({ giocatori, addGiocatore, toggleVivo, setCondizioni, setNote }) {
  return (
    <section className="player-tracker">
      <AddPlayerForm onAdd={addGiocatore} />
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

- [ ] **Step 5: Commit**

```bash
git add src/features/players/PlayerTracker.jsx src/features/players/PlayerTracker.test.jsx
git commit -m "feat: remove mazzo gate from PlayerTracker, drop ruoliDisponibili prop"
```

---

### Task 6: Integrazione in App e verifica finale

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `PlayerTracker` aggiornato (Task 5).

- [ ] **Step 1: Aggiorna il test in `src/App.test.jsx`**

Sostituisci il test `'parte sulla scheda Mazzo e permette di passare a Giocatori'`:

```jsx
test('parte sulla scheda Mazzo e permette di passare a Giocatori', async () => {
  const user = userEvent.setup()
  render(<App />)

  expect(screen.getByLabelText('Numero giocatori')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Giocatori' }))

  expect(screen.getByPlaceholderText('Nome giocatore')).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- App.test`
Expected: FAIL — `PlayerTracker` in `App.jsx` riceve ancora `ruoliDisponibili` e mostra il vecchio gate invece del form

- [ ] **Step 3: Aggiorna `src/App.jsx`**

Nel blocco `{tab === 'giocatori' && (...)}`, rimuovi la prop `ruoliDisponibili`:

```jsx
{tab === 'giocatori' && (
  <PlayerTracker
    giocatori={giocatori}
    addGiocatore={addGiocatore}
    toggleVivo={toggleVivo}
    setCondizioni={setCondizioni}
    setNote={setNote}
  />
)}
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
git commit -m "feat: wire chip-based player setup into App"
```

---

## Fuori scope per questo piano

Assegnazione del ruolo dal vivo durante la notte (click su un giocatore per assegnargli il ruolo chiamato), uso della funzione `vicini` per annunci d'alba (Pastore, ecc.), restyling della lista giocatori in chip minimali — restano i prossimi sotto-progetti concordati.

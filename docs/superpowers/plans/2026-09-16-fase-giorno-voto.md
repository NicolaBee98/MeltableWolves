# Fase Giorno/Voto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un quarto tab "Giorno" con: conteggio voti (un pulsante +1/-1 per ogni giocatore vivo), rilevazione automatica di vittima singola o spareggio, un timer a conto alla rovescia configurabile per l'arringa in caso di spareggio, la possibilità di dichiarare la morte sul rogo del vincitore, e — sempre disponibile, indipendentemente dallo stato della votazione — la possibilità di dichiarare una morte sul colpo (Boia, Untore, Scemo del Villaggio).

**Architecture:** Nuovo hook `useVotazione` (stesso pattern di `useMazzo`/`usePartita`/`useNotte`) che tiene solo il conteggio voti per giocatore, sollevato in `App` come gli altri hook di stato. Una funzione pura `risultatoVotazione` determina se c'è un vincitore singolo o uno spareggio. Il timer e la dichiarazione di morte sul colpo sono componenti indipendenti dalla votazione stessa, coerentemente con la regola che le votazioni proseguono indisturbate anche se qualcuno muore sul colpo nel frattempo. Il componente generico `SceltaGiocatore` (creato nel piano 5b per il sequencer notte) viene spostato in `src/components/` perché ora serve anche a questa nuova feature, non solo alla notte.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- I pulsanti di voto sono uno per ogni giocatore **vivo** (i morti non sono candidati).
- La morte sul rogo e la morte sul colpo impostano `vivo: false` **senza** `causaMorte: 'notte'` (a differenza delle uccisioni automatiche del sequencer notte) — è una distinzione voluta: i resolver di Cavaliere e Cortigiana (piano 5c) trattano correttamente qualsiasi morte non taggata `'notte'` come "non sbranato dal branco", che è esattamente il comportamento corretto per rogo/colpo.
- La morte sul colpo è sempre disponibile, indipendentemente dallo stato della votazione, e non la altera in alcun modo (le votazioni "proseguono indisturbate").
- Lo spareggio mostra solo i nomi dei pareggiati e un timer; la risoluzione effettiva (voto per alzata di mano, decisione del Borgomastro, sorteggio) resta a carico del narratore, non è automatizzata.
- Il timer è un conto alla rovescia con durata configurabile in secondi (default 60), non un cronometro che sale.
- Ogni candidato ha sia +1 sia -1 per correggere un voto senza dover ricominciare da capo.

---

### Task 1: Sposta `SceltaGiocatore` in `src/components/`

**Files:**
- Create: `src/components/SceltaGiocatore.jsx`
- Create: `src/components/SceltaGiocatore.test.jsx`
- Delete: `src/features/notte/azioni/SceltaGiocatore.jsx`
- Delete: `src/features/notte/azioni/SceltaGiocatore.test.jsx`
- Modify: `src/features/notte/azioni/AzioneCondizioneSingola.jsx`
- Modify: `src/features/notte/azioni/AzioneBrancoLupi.jsx`
- Modify: `src/features/notte/azioni/AzioneChupacabra.jsx`
- Modify: `src/features/notte/azioni/AzioneResuscita.jsx`
- Modify: `src/features/notte/azioni/AzioneStrega.jsx`
- Modify: `src/features/notte/azioni/AzioneLegame.jsx`
- Modify: `src/features/notte/azioni/AzioneCortigiana.jsx`

**Interfaces:**
- Invariata: `SceltaGiocatore({ candidati, onConferma, onSalta, etichetta })`, solo la posizione del file cambia.

- [ ] **Step 1: Crea `src/components/SceltaGiocatore.jsx` con lo stesso contenuto del file esistente**

```jsx
import { useState } from 'react'

export function SceltaGiocatore({ candidati, onConferma, onSalta, etichetta }) {
  const [selezionato, setSelezionato] = useState(candidati[0]?.id ?? '')

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <label>
        {etichetta}
        <select value={selezionato} onChange={(event) => setSelezionato(event.target.value)}>
          {candidati.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => onConferma(selezionato)}>
        Conferma
      </button>
      <button type="button" onClick={onSalta}>
        Salta
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Crea `src/components/SceltaGiocatore.test.jsx` con lo stesso contenuto del file esistente**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceltaGiocatore } from './SceltaGiocatore'

const candidati = [
  { id: '1', nome: 'Anna' },
  { id: '2', nome: 'Marco' },
]

test("conferma chiama onConferma con l'id selezionato", async () => {
  const user = userEvent.setup()
  const onConferma = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={onConferma} onSalta={() => {}} etichetta="Scegli" />)

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onConferma).toHaveBeenCalledWith('2')
})

test('salta chiama onSalta', async () => {
  const user = userEvent.setup()
  const onSalta = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={() => {}} onSalta={onSalta} etichetta="Scegli" />)

  await user.click(screen.getByRole('button', { name: 'Salta' }))

  expect(onSalta).toHaveBeenCalled()
})

test('senza candidati mostra un messaggio', () => {
  render(<SceltaGiocatore candidati={[]} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli" />)
  expect(screen.getByText(/nessun bersaglio disponibile/i)).toBeInTheDocument()
})
```

- [ ] **Step 3: Elimina i vecchi file**

```bash
rm src/features/notte/azioni/SceltaGiocatore.jsx src/features/notte/azioni/SceltaGiocatore.test.jsx
```

- [ ] **Step 4: Aggiorna l'import in ciascuno dei 7 file che usano `SceltaGiocatore`**

In `src/features/notte/azioni/AzioneCondizioneSingola.jsx`, `AzioneBrancoLupi.jsx`, `AzioneChupacabra.jsx`, `AzioneResuscita.jsx`, `AzioneStrega.jsx`, `AzioneLegame.jsx`, `AzioneCortigiana.jsx`, sostituisci in ciascuno:

```js
import { SceltaGiocatore } from './SceltaGiocatore'
```

con:

```js
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
```

(in `AzioneChupacabra.jsx` questa riga è la seconda import, dopo `import { ROLES } from '../../../data/roles'` — lascia l'ordine delle altre import invariato)

- [ ] **Step 5: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto (nessun conteggio cambia, solo la posizione del file)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: move SceltaGiocatore to shared src/components/"
```

---

### Task 2: Hook `useVotazione`

**Files:**
- Create: `src/state/useVotazione.js`
- Create: `src/state/useVotazione.test.js`

**Interfaces:**
- Produces: `useVotazione()` che ritorna `{ voti: { [giocatoreId]: number }, incrementaVoto(id), decrementaVoto(id), ricominciaVotazione() }`.

- [ ] **Step 1: Scrivi il test fallente `src/state/useVotazione.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { useVotazione } from './useVotazione'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: nessun voto', () => {
  const { result } = renderHook(() => useVotazione())
  expect(result.current.voti).toEqual({})
})

test('incrementaVoto aumenta il conteggio di un candidato', () => {
  const { result } = renderHook(() => useVotazione())

  act(() => {
    result.current.incrementaVoto('1')
    result.current.incrementaVoto('1')
  })

  expect(result.current.voti['1']).toBe(2)
})

test('decrementaVoto non scende sotto zero', () => {
  const { result } = renderHook(() => useVotazione())

  act(() => {
    result.current.decrementaVoto('1')
  })

  expect(result.current.voti['1']).toBe(0)
})

test('ricominciaVotazione azzera tutti i voti', () => {
  const { result } = renderHook(() => useVotazione())

  act(() => {
    result.current.incrementaVoto('1')
    result.current.ricominciaVotazione()
  })

  expect(result.current.voti).toEqual({})
})

test('lo stato persiste in localStorage tra due montaggi', () => {
  const { result, unmount } = renderHook(() => useVotazione())

  act(() => {
    result.current.incrementaVoto('1')
  })
  unmount()

  const { result: result2 } = renderHook(() => useVotazione())
  expect(result2.current.voti['1']).toBe(1)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useVotazione`
Expected: FAIL — `Cannot find module './useVotazione'`

- [ ] **Step 3: Scrivi `src/state/useVotazione.js`**

```js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-votazione'

function loadVoti() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useVotazione() {
  const [voti, setVoti] = useState(loadVoti)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voti))
  }, [voti])

  function incrementaVoto(id) {
    setVoti((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }

  function decrementaVoto(id) {
    setVoti((prev) => ({ ...prev, [id]: Math.max((prev[id] ?? 0) - 1, 0) }))
  }

  function ricominciaVotazione() {
    setVoti({})
  }

  return { voti, incrementaVoto, decrementaVoto, ricominciaVotazione }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useVotazione`
Expected: PASS — 5 test

- [ ] **Step 5: Commit**

```bash
git add src/state/useVotazione.js src/state/useVotazione.test.js
git commit -m "feat: add useVotazione hook with localStorage persistence"
```

---

### Task 3: `risultatoVotazione`

**Files:**
- Create: `src/data/votazione.js`
- Create: `src/data/votazione.test.js`

**Interfaces:**
- Produces: `risultatoVotazione(voti: {[id]: number}, candidatiIds: string[]) => { vincitori: string[], maxVoti: number }`.

- [ ] **Step 1: Scrivi il test fallente `src/data/votazione.test.js`**

```js
import { risultatoVotazione } from './votazione'

test('nessun vincitore se tutti i voti sono a zero', () => {
  expect(risultatoVotazione({}, ['1', '2'])).toEqual({ vincitori: [], maxVoti: 0 })
})

test('un solo vincitore con il massimo dei voti', () => {
  expect(risultatoVotazione({ 1: 3, 2: 1 }, ['1', '2'])).toEqual({ vincitori: ['1'], maxVoti: 3 })
})

test('più vincitori in caso di parità', () => {
  expect(risultatoVotazione({ 1: 2, 2: 2, 3: 1 }, ['1', '2', '3'])).toEqual({ vincitori: ['1', '2'], maxVoti: 2 })
})

test('ignora candidati non presenti nella lista', () => {
  expect(risultatoVotazione({ 1: 5, 9: 100 }, ['1', '2'])).toEqual({ vincitori: ['1'], maxVoti: 5 })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- votazione`
Expected: FAIL — `Cannot find module './votazione'`

- [ ] **Step 3: Scrivi `src/data/votazione.js`**

```js
export function risultatoVotazione(voti, candidatiIds) {
  const maxVoti = Math.max(0, ...candidatiIds.map((id) => voti[id] ?? 0))
  if (maxVoti === 0) return { vincitori: [], maxVoti: 0 }

  const vincitori = candidatiIds.filter((id) => (voti[id] ?? 0) === maxVoti)
  return { vincitori, maxVoti }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- votazione`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/data/votazione.js src/data/votazione.test.js
git commit -m "feat: add risultatoVotazione pure function"
```

---

### Task 4: Componente `TimerSpareggio`

**Files:**
- Create: `src/features/giorno/TimerSpareggio.jsx`
- Create: `src/features/giorno/TimerSpareggio.test.jsx`

**Interfaces:**
- Produces: `TimerSpareggio()` (nessuna prop: gestisce tutto il proprio stato internamente).

- [ ] **Step 1: Scrivi il test fallente `src/features/giorno/TimerSpareggio.test.jsx`**

```jsx
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TimerSpareggio } from './TimerSpareggio'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('mostra la durata di default come 01:00', () => {
  render(<TimerSpareggio />)
  expect(screen.getByText('01:00')).toBeInTheDocument()
})

test('avvia fa scendere il tempo rimanente ogni secondo', () => {
  render(<TimerSpareggio />)

  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }))
  act(() => {
    vi.advanceTimersByTime(3000)
  })

  expect(screen.getByText('00:57')).toBeInTheDocument()
})

test('pausa ferma il conto alla rovescia', () => {
  render(<TimerSpareggio />)

  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }))
  act(() => {
    vi.advanceTimersByTime(2000)
  })
  fireEvent.click(screen.getByRole('button', { name: 'Pausa' }))
  act(() => {
    vi.advanceTimersByTime(5000)
  })

  expect(screen.getByText('00:58')).toBeInTheDocument()
})

test('cambiare la durata e azzerare aggiorna il tempo rimanente', () => {
  render(<TimerSpareggio />)

  fireEvent.change(screen.getByLabelText('Durata (secondi)'), { target: { value: '30' } })
  fireEvent.click(screen.getByRole('button', { name: 'Azzera' }))

  expect(screen.getByText('00:30')).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- TimerSpareggio`
Expected: FAIL — `Cannot find module './TimerSpareggio'`

- [ ] **Step 3: Scrivi `src/features/giorno/TimerSpareggio.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react'

export function TimerSpareggio() {
  const [durata, setDurata] = useState(60)
  const [rimanente, setRimanente] = useState(60)
  const [attivo, setAttivo] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!attivo) return
    intervalRef.current = setInterval(() => {
      setRimanente((prev) => {
        if (prev <= 1) {
          setAttivo(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [attivo])

  function avvia() {
    setRimanente(durata)
    setAttivo(true)
  }

  function pausa() {
    setAttivo(false)
  }

  function azzera() {
    setAttivo(false)
    setRimanente(durata)
  }

  const minuti = Math.floor(rimanente / 60)
  const secondi = rimanente % 60
  const tempoFormattato = `${String(minuti).padStart(2, '0')}:${String(secondi).padStart(2, '0')}`

  return (
    <div className="timer-spareggio">
      <label htmlFor="durata-timer">Durata (secondi)</label>
      <input
        id="durata-timer"
        type="number"
        min="1"
        value={durata}
        onChange={(event) => setDurata(Number(event.target.value))}
        disabled={attivo}
      />
      <p>{tempoFormattato}</p>
      <button type="button" onClick={avvia}>
        Avvia
      </button>
      <button type="button" onClick={pausa} disabled={!attivo}>
        Pausa
      </button>
      <button type="button" onClick={azzera}>
        Azzera
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- TimerSpareggio`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/features/giorno/TimerSpareggio.jsx src/features/giorno/TimerSpareggio.test.jsx
git commit -m "feat: add TimerSpareggio countdown component"
```

---

### Task 5: Componente `Votazione`

**Files:**
- Create: `src/features/giorno/Votazione.jsx`
- Create: `src/features/giorno/Votazione.test.jsx`

**Interfaces:**
- Consumes: `risultatoVotazione` (Task 3), `TimerSpareggio` (Task 4).
- Produces: `Votazione({ giocatori, voti, incrementaVoto, decrementaVoto, ricominciaVotazione, onRogo })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/giorno/Votazione.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Votazione } from './Votazione'

const giocatori = [
  { id: '1', nome: 'Anna', vivo: true },
  { id: '2', nome: 'Marco', vivo: true },
  { id: '3', nome: 'Luca', vivo: false },
]

function setup(overrides = {}) {
  const props = {
    giocatori,
    voti: {},
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    onRogo: vi.fn(),
    ...overrides,
  }
  render(<Votazione {...props} />)
  return props
}

test('mostra un pulsante per ogni giocatore vivo, non per i morti', () => {
  setup()
  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})

test("+1 chiama incrementaVoto con l'id del giocatore", async () => {
  const user = userEvent.setup()
  const { incrementaVoto } = setup()
  await user.click(screen.getAllByRole('button', { name: '+1' })[0])
  expect(incrementaVoto).toHaveBeenCalledWith('1')
})

test("-1 chiama decrementaVoto con l'id del giocatore", async () => {
  const user = userEvent.setup()
  const { decrementaVoto } = setup()
  await user.click(screen.getAllByRole('button', { name: '-1' })[0])
  expect(decrementaVoto).toHaveBeenCalledWith('1')
})

test("mostra la vittima designata quando c'è un solo massimo", () => {
  setup({ voti: { 1: 2, 2: 1 } })
  expect(screen.getByText(/vittima designata: anna/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Dichiara morte sul rogo' })).toBeInTheDocument()
})

test('mostra lo spareggio quando ci sono più massimi', () => {
  setup({ voti: { 1: 2, 2: 2 } })
  expect(screen.getByText(/spareggio tra: anna, marco/i)).toBeInTheDocument()
})

test("il pulsante rogo chiama onRogo con l'id del vincitore", async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2 } })
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- Votazione`
Expected: FAIL — `Cannot find module './Votazione'`

- [ ] **Step 3: Scrivi `src/features/giorno/Votazione.jsx`**

```jsx
import { risultatoVotazione } from '../../data/votazione'
import { TimerSpareggio } from './TimerSpareggio'

export function Votazione({ giocatori, voti, incrementaVoto, decrementaVoto, ricominciaVotazione, onRogo }) {
  const vivi = giocatori.filter((g) => g.vivo)
  const { vincitori, maxVoti } = risultatoVotazione(voti, vivi.map((g) => g.id))

  return (
    <section className="votazione">
      <ul>
        {vivi.map((g) => (
          <li key={g.id}>
            <span>{g.nome}</span>
            <span>{voti[g.id] ?? 0} voti</span>
            <button type="button" onClick={() => decrementaVoto(g.id)}>
              -1
            </button>
            <button type="button" onClick={() => incrementaVoto(g.id)}>
              +1
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={ricominciaVotazione}>
        Ricomincia votazione
      </button>

      {maxVoti > 0 && vincitori.length === 1 && (
        <div className="votazione__esito">
          <p>Vittima designata: {giocatori.find((g) => g.id === vincitori[0])?.nome}</p>
          <button type="button" onClick={() => onRogo(vincitori[0])}>
            Dichiara morte sul rogo
          </button>
        </div>
      )}

      {maxVoti > 0 && vincitori.length > 1 && (
        <div className="votazione__spareggio">
          <p>Spareggio tra: {vincitori.map((id) => giocatori.find((g) => g.id === id)?.nome).join(', ')}</p>
          <TimerSpareggio />
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- Votazione`
Expected: PASS — 6 test

- [ ] **Step 5: Commit**

```bash
git add src/features/giorno/Votazione.jsx src/features/giorno/Votazione.test.jsx
git commit -m "feat: add Votazione component with tie detection"
```

---

### Task 6: Componente `MorteSulColpo`

**Files:**
- Create: `src/features/giorno/MorteSulColpo.jsx`
- Create: `src/features/giorno/MorteSulColpo.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (`src/components/SceltaGiocatore.jsx`, Task 1).
- Produces: `MorteSulColpo({ giocatori, onDichiara })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/giorno/MorteSulColpo.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MorteSulColpo } from './MorteSulColpo'

test("conferma chiama onDichiara con l'id del giocatore scelto", async () => {
  const user = userEvent.setup()
  const onDichiara = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true },
    { id: '2', nome: 'Marco', vivo: false },
  ]
  render(<MorteSulColpo giocatori={giocatori} onDichiara={onDichiara} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onDichiara).toHaveBeenCalledWith('1')
})

test('mostra solo i giocatori vivi come candidati', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true },
    { id: '2', nome: 'Marco', vivo: false },
  ]
  render(<MorteSulColpo giocatori={giocatori} onDichiara={() => {}} />)
  expect(screen.queryByText('Marco')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- MorteSulColpo`
Expected: FAIL — `Cannot find module './MorteSulColpo'`

- [ ] **Step 3: Scrivi `src/features/giorno/MorteSulColpo.jsx`**

```jsx
import { SceltaGiocatore } from '../../components/SceltaGiocatore'

export function MorteSulColpo({ giocatori, onDichiara }) {
  const vivi = giocatori.filter((g) => g.vivo)

  return (
    <section className="morte-sul-colpo">
      <h3>Morte sul colpo</h3>
      <p>Per esecuzione del Boia, unzione dell'Untore, o rima sbagliata dello Scemo del Villaggio.</p>
      <SceltaGiocatore
        candidati={vivi}
        onConferma={onDichiara}
        onSalta={() => {}}
        etichetta="Chi dichiarare morto sul colpo"
      />
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- MorteSulColpo`
Expected: PASS — 2 test

- [ ] **Step 5: Commit**

```bash
git add src/features/giorno/MorteSulColpo.jsx src/features/giorno/MorteSulColpo.test.jsx
git commit -m "feat: add MorteSulColpo component"
```

---

### Task 7: `GiornoPanel` e integrazione del quarto tab in App

**Files:**
- Create: `src/features/giorno/GiornoPanel.jsx`
- Create: `src/features/giorno/GiornoPanel.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `Votazione` (Task 5), `MorteSulColpo` (Task 6), `useVotazione` (Task 2).
- Produces: `GiornoPanel({ giocatori, voti, incrementaVoto, decrementaVoto, ricominciaVotazione, aggiornaGiocatore })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/giorno/GiornoPanel.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GiornoPanel } from './GiornoPanel'

function setup(overrides = {}) {
  const props = {
    giocatori: [{ id: '1', nome: 'Anna', vivo: true }],
    voti: {},
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    aggiornaGiocatore: vi.fn(),
    ...overrides,
  }
  render(<GiornoPanel {...props} />)
  return props
}

test('dichiarare una morte sul colpo chiama aggiornaGiocatore con vivo:false', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
})

test('dichiarare morte sul rogo chiama aggiornaGiocatore con vivo:false', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup({ voti: { 1: 3 } })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- GiornoPanel`
Expected: FAIL — `Cannot find module './GiornoPanel'`

- [ ] **Step 3: Scrivi `src/features/giorno/GiornoPanel.jsx`**

```jsx
import { Votazione } from './Votazione'
import { MorteSulColpo } from './MorteSulColpo'

export function GiornoPanel({ giocatori, voti, incrementaVoto, decrementaVoto, ricominciaVotazione, aggiornaGiocatore }) {
  function dichiaraMorte(id) {
    aggiornaGiocatore(id, { vivo: false })
  }

  return (
    <section className="giorno-panel">
      <Votazione
        giocatori={giocatori}
        voti={voti}
        incrementaVoto={incrementaVoto}
        decrementaVoto={decrementaVoto}
        ricominciaVotazione={ricominciaVotazione}
        onRogo={dichiaraMorte}
      />
      <MorteSulColpo giocatori={giocatori} onDichiara={dichiaraMorte} />
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- GiornoPanel`
Expected: PASS — 2 test

- [ ] **Step 5: Aggiungi il test fallente in `src/App.test.jsx`** (in coda al file)

```jsx
test('scheda Giorno mostra i controlli di votazione', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Giorno' }))

  expect(screen.getByRole('button', { name: 'Ricomincia votazione' })).toBeInTheDocument()
})
```

- [ ] **Step 6: Esegui il test e verifica che fallisca**

Run: `npm test -- App.test`
Expected: FAIL — non esiste ancora un bottone "Giorno"

- [ ] **Step 7: Aggiorna `src/App.jsx`**

```jsx
import { useState } from 'react'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { GiornoPanel } from './features/giorno/GiornoPanel'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'
import { useVotazione } from './state/useVotazione'

export default function App() {
  const [tab, setTab] = useState('mazzo')
  const { numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore } = usePartita()
  const { voti, incrementaVoto, decrementaVoto, ricominciaVotazione } = useVotazione()

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
        <button type="button" aria-pressed={tab === 'giorno'} onClick={() => setTab('giorno')}>
          Giorno
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
      {tab === 'notte' && (
        <NightSequencer ruoliSelezionati={ruoliSelezionati} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />
      )}
      {tab === 'giorno' && (
        <GiornoPanel
          giocatori={giocatori}
          voti={voti}
          incrementaVoto={incrementaVoto}
          decrementaVoto={decrementaVoto}
          ricominciaVotazione={ricominciaVotazione}
          aggiornaGiocatore={aggiornaGiocatore}
        />
      )}
    </main>
  )
}
```

- [ ] **Step 8: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 9: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 10: Commit**

```bash
git add src/features/giorno/GiornoPanel.jsx src/features/giorno/GiornoPanel.test.jsx src/App.jsx src/App.test.jsx
git commit -m "feat: wire GiornoPanel into a fourth App tab"
```

---

## Fuori scope per questo piano

Il log partita (passo 7 della roadmap) resta un piano successivo. Addolorata (piano 5c, rimandata) potrebbe ora essere riconsiderata visto che questo piano introduce la morte sul rogo — ma non è incluso qui, sarebbe un piano a sé.

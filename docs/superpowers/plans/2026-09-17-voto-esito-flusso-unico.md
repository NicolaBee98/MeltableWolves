# Voto ed Esito nel Flusso Unico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La fase di voto diventa un piccolo flusso a due schermate consecutive invece di mostrare lista voti ed esito insieme: prima "voto" (+1/-1 per giocatore vivo), poi "esito" (vittima designata al rogo oppure spareggio). Entrambe le varianti della schermata di esito hanno in fondo un'icona "Morte improvvisa" sempre raggiungibile che apre un popup per dichiarare una morte istantanea (Boia, Untore, Scemo del Villaggio). Quinto sotto-progetto della revisione UX.

**Architecture:** `useVotazione` guadagna un campo `fase: 'voto' | 'esito'` accanto ai voti esistenti, con `vaiAEsito()`/`tornaAlVoto()` per transitare e `ricominciaVotazione()` che ora resetta anche la fase. `Votazione` si biforca sul valore di `fase`: in `'voto'` mostra la lista con i pulsanti +1/-1 e, appena c'è un massimo di voti, un pulsante "Vai all'esito"; in `'esito'` mostra solo la vittima designata o lo spareggio, un pulsante "Torna al voto" e il nuovo componente `MorteImprovvisa` (icona + popup, sostituisce il vecchio pannello sempre visibile `MorteSulColpo`). La logica di risoluzione voti (`risultatoVotazione`) e il tag `causaMorte` (`'rogo'` / `'colpo'`) restano invariati: cambia solo dove e quando l'interfaccia li mostra. Non viene costruita una vera macchina a stati Notte→Alba→Voto→Esito unica: quella integrazione resta del sotto-progetto 6.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- `causaMorte: 'rogo'` (con `mortoNotte: round`) e `causaMorte: 'colpo'` restano i tag usati per le due dichiarazioni di morte diurne — nessuna rinomina nel modello dati, solo nell'etichetta UI ("Morte improvvisa" al posto di "Morte sul colpo").
- Il popup "Morte improvvisa" propone solo giocatori vivi, esattamente come il vecchio `MorteSulColpo` che sostituisce.
- `MorteSulColpo.jsx`/`MorteSulColpo.test.jsx` vengono eliminati a fine piano: nessun codice morto lasciato in giro.

---

### Task 1: `useVotazione` guadagna la fase voto/esito

**Files:**
- Modify: `src/state/useVotazione.js`
- Modify: `src/state/useVotazione.test.js`

**Interfaces:**
- Modifica: `useVotazione()` ritorna in aggiunta `{ fase: 'voto' | 'esito', vaiAEsito(), tornaAlVoto() }`. `ricominciaVotazione()` ora azzera anche `fase` a `'voto'`. La forma di `voti` e le funzioni esistenti (`incrementaVoto`, `decrementaVoto`) restano identiche per chi le consuma già.

- [ ] **Step 1: Aggiungi i test falliti in coda a `src/state/useVotazione.test.js`**

```js
test('fase iniziale è voto', () => {
  const { result } = renderHook(() => useVotazione())
  expect(result.current.fase).toBe('voto')
})

test('vaiAEsito passa la fase a esito', () => {
  const { result } = renderHook(() => useVotazione())
  act(() => {
    result.current.vaiAEsito()
  })
  expect(result.current.fase).toBe('esito')
})

test('tornaAlVoto riporta la fase a voto', () => {
  const { result } = renderHook(() => useVotazione())
  act(() => {
    result.current.vaiAEsito()
    result.current.tornaAlVoto()
  })
  expect(result.current.fase).toBe('voto')
})

test('ricominciaVotazione riporta la fase a voto', () => {
  const { result } = renderHook(() => useVotazione())
  act(() => {
    result.current.vaiAEsito()
    result.current.ricominciaVotazione()
  })
  expect(result.current.fase).toBe('voto')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useVotazione`
Expected: FAIL — `result.current.fase` è `undefined`

- [ ] **Step 3: Riscrivi `src/state/useVotazione.js`**

```js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-votazione'
const DEFAULT_STATO = { voti: {}, fase: 'voto' }

function loadStato() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_STATO
  } catch {
    return DEFAULT_STATO
  }
}

export function useVotazione() {
  const [stato, setStato] = useState(loadStato)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stato))
  }, [stato])

  function incrementaVoto(id) {
    setStato((prev) => ({ ...prev, voti: { ...prev.voti, [id]: (prev.voti[id] ?? 0) + 1 } }))
  }

  function decrementaVoto(id) {
    setStato((prev) => ({ ...prev, voti: { ...prev.voti, [id]: Math.max((prev.voti[id] ?? 0) - 1, 0) } }))
  }

  function ricominciaVotazione() {
    setStato({ voti: {}, fase: 'voto' })
  }

  function vaiAEsito() {
    setStato((prev) => ({ ...prev, fase: 'esito' }))
  }

  function tornaAlVoto() {
    setStato((prev) => ({ ...prev, fase: 'voto' }))
  }

  return {
    voti: stato.voti,
    fase: stato.fase,
    incrementaVoto,
    decrementaVoto,
    ricominciaVotazione,
    vaiAEsito,
    tornaAlVoto,
  }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useVotazione`
Expected: PASS — 9 test (5 esistenti + 4 nuovi)

- [ ] **Step 5: Commit**

```bash
git add src/state/useVotazione.js src/state/useVotazione.test.js
git commit -m "feat: add voto/esito fase state machine to useVotazione"
```

---

### Task 2: `MorteImprovvisa` — icona e popup per la morte istantanea

**Files:**
- Create: `src/features/giorno/MorteImprovvisa.jsx`
- Create: `src/features/giorno/MorteImprovvisa.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (`src/components/SceltaGiocatore.jsx`).
- Produces: `MorteImprovvisa({ giocatori, onDichiara })`. Mostra un bottone icona sempre visibile; al click apre un popup (`role="dialog"`) con `SceltaGiocatore` filtrato sui soli giocatori vivi; confermare chiama `onDichiara(id)` e richiude il popup.

- [ ] **Step 1: Scrivi il test fallente `src/features/giorno/MorteImprovvisa.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MorteImprovvisa } from './MorteImprovvisa'

const giocatori = [
  { id: '1', nome: 'Anna', vivo: true },
  { id: '2', nome: 'Marco', vivo: false },
]

test('il popup è chiuso di default', () => {
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={vi.fn()} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test("cliccando l'icona si apre il popup con solo i giocatori vivi", async () => {
  const user = userEvent.setup()
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={vi.fn()} />)

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.queryByText('Marco')).not.toBeInTheDocument()
})

test('confermare una scelta chiama onDichiara e chiude il popup', async () => {
  const user = userEvent.setup()
  const onDichiara = vi.fn()
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={onDichiara} />)

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onDichiara).toHaveBeenCalledWith('1')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('il pulsante Salta chiude il popup senza chiamare onDichiara', async () => {
  const user = userEvent.setup()
  const onDichiara = vi.fn()
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={onDichiara} />)

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))
  await user.click(screen.getByRole('button', { name: 'Salta' }))

  expect(onDichiara).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- MorteImprovvisa`
Expected: FAIL — `Cannot find module './MorteImprovvisa'`

- [ ] **Step 3: Scrivi `src/features/giorno/MorteImprovvisa.jsx`**

```jsx
import { useState } from 'react'
import { SceltaGiocatore } from '../../components/SceltaGiocatore'

export function MorteImprovvisa({ giocatori, onDichiara }) {
  const [aperto, setAperto] = useState(false)
  const vivi = giocatori.filter((g) => g.vivo)

  function conferma(id) {
    onDichiara(id)
    setAperto(false)
  }

  return (
    <div className="morte-improvvisa">
      <button type="button" className="morte-improvvisa__icona" onClick={() => setAperto(true)}>
        💀 Morte improvvisa
      </button>
      {aperto && (
        <div className="morte-improvvisa__popup" role="dialog" aria-label="Dichiara morte improvvisa">
          <p>Per esecuzione del Boia, unzione dell'Untore, o rima sbagliata dello Scemo del Villaggio.</p>
          <SceltaGiocatore
            candidati={vivi}
            onConferma={conferma}
            onSalta={() => setAperto(false)}
            etichetta="Chi dichiarare morto"
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- MorteImprovvisa`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/features/giorno/MorteImprovvisa.jsx src/features/giorno/MorteImprovvisa.test.jsx
git commit -m "feat: add MorteImprovvisa popup for instant death declaration"
```

---

### Task 3: `Votazione` si biforca su voto/esito

**Files:**
- Modify: `src/features/giorno/Votazione.jsx`
- Modify: `src/features/giorno/Votazione.test.jsx`

**Interfaces:**
- Consumes: `MorteImprovvisa` (Task 2), `fase`/`vaiAEsito`/`tornaAlVoto` (Task 1).
- Modifica: `Votazione` accetta le nuove prop `fase`, `vaiAEsito`, `tornaAlVoto`, `onMorteImprovvisa`. In fase `'voto'` mostra solo la lista votanti + pulsante "Vai all'esito" (visibile solo con un massimo di voti). In fase `'esito'` mostra solo l'esito (vittima o spareggio) + "Torna al voto" + `MorteImprovvisa` in fondo.

- [ ] **Step 1: Riscrivi `src/features/giorno/Votazione.test.jsx`**

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
    fase: 'voto',
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    vaiAEsito: vi.fn(),
    tornaAlVoto: vi.fn(),
    onRogo: vi.fn(),
    onMorteImprovvisa: vi.fn(),
    ...overrides,
  }
  render(<Votazione {...props} />)
  return props
}

test('in fase voto mostra un pulsante per ogni giocatore vivo, non per i morti', () => {
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

test("senza un massimo di voti non mostra il pulsante per andare all'esito", () => {
  setup()
  expect(screen.queryByRole('button', { name: /vai all.esito/i })).not.toBeInTheDocument()
})

test("con un massimo di voti il pulsante per andare all'esito chiama vaiAEsito", async () => {
  const user = userEvent.setup()
  const { vaiAEsito } = setup({ voti: { 1: 2 } })
  await user.click(screen.getByRole('button', { name: /vai all.esito/i }))
  expect(vaiAEsito).toHaveBeenCalled()
})

test('in fase esito con un solo massimo mostra la vittima designata e dichiara il rogo', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.getByText(/vittima designata: anna/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
})

test('in fase esito con più massimi mostra lo spareggio', () => {
  setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })
  expect(screen.getByText(/spareggio tra: anna, marco/i)).toBeInTheDocument()
})

test('in fase esito il pulsante Torna al voto chiama tornaAlVoto', async () => {
  const user = userEvent.setup()
  const { tornaAlVoto } = setup({ voti: { 1: 2 }, fase: 'esito' })
  await user.click(screen.getByRole('button', { name: 'Torna al voto' }))
  expect(tornaAlVoto).toHaveBeenCalled()
})

test("in fase esito è sempre presente l'icona Morte improvvisa", () => {
  setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.getByRole('button', { name: /morte improvvisa/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- Votazione`
Expected: FAIL — la vecchia `Votazione` mostra sempre lista ed esito insieme, non esiste `fase`/`vaiAEsito`/`tornaAlVoto`/icona Morte improvvisa

- [ ] **Step 3: Riscrivi `src/features/giorno/Votazione.jsx`**

```jsx
import { risultatoVotazione } from '../../data/votazione'
import { TimerSpareggio } from './TimerSpareggio'
import { MorteImprovvisa } from './MorteImprovvisa'

export function Votazione({
  giocatori,
  voti,
  fase,
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  onRogo,
  onMorteImprovvisa,
}) {
  const vivi = giocatori.filter((g) => g.vivo)
  const { vincitori, maxVoti } = risultatoVotazione(voti, vivi.map((g) => g.id))

  if (fase === 'esito') {
    return (
      <section className="votazione votazione--esito">
        {vincitori.length === 1 ? (
          <div className="votazione__esito">
            <p>Vittima designata: {giocatori.find((g) => g.id === vincitori[0])?.nome}</p>
            <button type="button" onClick={() => onRogo(vincitori[0])}>
              Dichiara morte sul rogo
            </button>
          </div>
        ) : (
          <div className="votazione__spareggio">
            <p>Spareggio tra: {vincitori.map((id) => giocatori.find((g) => g.id === id)?.nome).join(', ')}</p>
            <TimerSpareggio />
          </div>
        )}
        <button type="button" onClick={tornaAlVoto}>
          Torna al voto
        </button>
        <MorteImprovvisa giocatori={giocatori} onDichiara={onMorteImprovvisa} />
      </section>
    )
  }

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
      {maxVoti > 0 && (
        <button type="button" onClick={vaiAEsito}>
          Vai all'esito
        </button>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- Votazione`
Expected: PASS — 9 test

- [ ] **Step 5: Commit**

```bash
git add src/features/giorno/Votazione.jsx src/features/giorno/Votazione.test.jsx
git commit -m "feat: split Votazione into sequential voto/esito screens"
```

---

### Task 4: Collega `GiornoPanel`/`App`, rimuovi `MorteSulColpo`

**Files:**
- Modify: `src/features/giorno/GiornoPanel.jsx`
- Modify: `src/features/giorno/GiornoPanel.test.jsx`
- Modify: `src/App.jsx`
- Delete: `src/features/giorno/MorteSulColpo.jsx`
- Delete: `src/features/giorno/MorteSulColpo.test.jsx`

**Interfaces:**
- Consumes: `fase`, `vaiAEsito`, `tornaAlVoto` da `useVotazione` (Task 1); `Votazione` con le nuove prop (Task 3).
- Modifica: `GiornoPanel` non usa più `MorteSulColpo`: la morte istantanea passa da `Votazione`/`MorteImprovvisa`, con `GiornoPanel` che fornisce `onMorteImprovvisa` (stessa logica che prima era `dichiaraColpo`, causaMorte invariato).

- [ ] **Step 1: Riscrivi `src/features/giorno/GiornoPanel.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GiornoPanel } from './GiornoPanel'

function setup(overrides = {}) {
  const props = {
    giocatori: [{ id: '1', nome: 'Anna', vivo: true }],
    voti: { 1: 2 },
    fase: 'esito',
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    vaiAEsito: vi.fn(),
    tornaAlVoto: vi.fn(),
    aggiornaGiocatore: vi.fn(),
    round: 3,
    ...overrides,
  }
  render(<GiornoPanel {...props} />)
  return props
}

test('dichiarare una morte improvvisa dal popup chiama aggiornaGiocatore con causaMorte:colpo', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'colpo' })
})

test('dichiarare morte sul rogo chiama aggiornaGiocatore con causaMorte:rogo e la notte corrente', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'rogo', mortoNotte: 3 })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- GiornoPanel`
Expected: FAIL — `GiornoPanel` attuale non passa `fase` a `Votazione` e mostra ancora la vecchia sezione `MorteSulColpo` sempre visibile

- [ ] **Step 3: Riscrivi `src/features/giorno/GiornoPanel.jsx`**

```jsx
import { Votazione } from './Votazione'

export function GiornoPanel({
  giocatori,
  voti,
  fase,
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  aggiornaGiocatore,
  round,
}) {
  function dichiaraRogo(id) {
    aggiornaGiocatore(id, { vivo: false, causaMorte: 'rogo', mortoNotte: round })
  }

  function dichiaraColpo(id) {
    aggiornaGiocatore(id, { vivo: false, causaMorte: 'colpo' })
  }

  return (
    <section className="giorno-panel">
      <Votazione
        giocatori={giocatori}
        voti={voti}
        fase={fase}
        incrementaVoto={incrementaVoto}
        decrementaVoto={decrementaVoto}
        ricominciaVotazione={ricominciaVotazione}
        vaiAEsito={vaiAEsito}
        tornaAlVoto={tornaAlVoto}
        onRogo={dichiaraRogo}
        onMorteImprovvisa={dichiaraColpo}
      />
    </section>
  )
}
```

- [ ] **Step 4: Elimina i file del vecchio pannello sempre visibile**

```bash
git rm src/features/giorno/MorteSulColpo.jsx src/features/giorno/MorteSulColpo.test.jsx
```

- [ ] **Step 5: Esegui i test di `GiornoPanel` e verifica che passino**

Run: `npm test -- GiornoPanel`
Expected: PASS — 2 test

- [ ] **Step 6: Aggiorna `src/App.jsx`**

Sostituisci:

```jsx
const { voti, incrementaVoto, decrementaVoto, ricominciaVotazione } = useVotazione()
```

con:

```jsx
const { voti, fase, incrementaVoto, decrementaVoto, ricominciaVotazione, vaiAEsito, tornaAlVoto } = useVotazione()
```

Nel blocco `<GiornoPanel ...>`, aggiungi le prop:

```jsx
fase={fase}
vaiAEsito={vaiAEsito}
tornaAlVoto={tornaAlVoto}
```

- [ ] **Step 7: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 8: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 9: Commit**

```bash
git add src/features/giorno/GiornoPanel.jsx src/features/giorno/GiornoPanel.test.jsx src/App.jsx
git commit -m "feat: wire voto/esito flow into GiornoPanel, drop always-visible MorteSulColpo panel"
```

---

## Fuori scope per questo piano

Una vera macchina a stati Notte→Alba→Voto→Esito unificata resta il sotto-progetto 6. Home page, popup log/impostazioni e redesign visivo restano rispettivamente i sotto-progetti 6, 7 e 8.

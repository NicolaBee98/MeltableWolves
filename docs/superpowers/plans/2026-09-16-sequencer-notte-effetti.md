# Sequencer Notte — Effetti Automatici (5b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per i ruoli con logica semplice e ben definita (Paladino, Strega, Branco dei Lupi, Chupacabra, Untore, Fattucchiera, Pifferaio, Maga, Sacerdote, Guaritore, Sciacallo Mannaro), permettere al narratore di selezionare il bersaglio direttamente nel passo del sequencer e applicare automaticamente l'effetto (morte, protezione, condizione, resurrezione) al tracker giocatori.

**Architecture:** Funzioni pure di effetto (`src/data/effettiNotte.js`) che calcolano una "patch" da applicare a un giocatore, applicate tramite un nuovo metodo generico `aggiornaGiocatore(id, patch)` su `usePartita`. Due componenti generici di selezione bersaglio (singolo/doppio) riutilizzati da piccoli componenti "azione" specifici per ruolo, mappati al passo del sequencer tramite un lookup `AZIONI_NOTTURNE` keyed by step id. `NightSequencer` (dal piano 5a) monta il componente azione corretto quando il passo corrente ne ha uno e almeno un titolare del ruolo è vivo.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- L'azione di un passo è mostrata solo se il passo è `tipo: 'azione'`, esiste una voce in `AZIONI_NOTTURNE` per quel passo, e almeno uno dei giocatori coinvolti in quel passo è vivo. Altrimenti il passo resta puramente informativo (comportamento del piano 5a).
- I poteri "una volta a partita" (pozioni della Strega, resurrezione di Guaritore/Sciacallo Mannaro) si tracciano con `giocatore.poteriUsati: string[]`, marcato sul giocatore che detiene il ruolo attore, non sul bersaglio.
- Il pulsante "Notte successiva" rimuove automaticamente le condizioni `protetto` e `inibito` da tutti i giocatori (sono valide una sola notte); le altre condizioni restano finché il narratore non le rimuove manualmente dal tracker.
- I ruoli fuori dalla prima fetta (Apprendista, Cavaliere, Figlia dei Lupi, Guardie, Mucca Mannara, Addolorata, Cortigiana — piano 5c) restano passi puramente informativi: nessun errore, nessuna selezione bersaglio, comportamento invariato dal piano 5a.

---

### Task 1: Estendi `usePartita` con `aggiornaGiocatore` e `poteriUsati`

**Files:**
- Modify: `src/state/usePartita.js`
- Modify: `src/state/usePartita.test.js`

**Interfaces:**
- Modifica: `addGiocatore` inizializza anche `poteriUsati: []`.
- Aggiunge: `aggiornaGiocatore(id: string, patch: object)` che unisce (shallow merge) `patch` nel giocatore con quell'id.

- [ ] **Step 1: Aggiungi i test falliti in `src/state/usePartita.test.js`** (in coda al file esistente)

```js
test('addGiocatore inizializza poteriUsati vuoto', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna', 'villico')
  })

  expect(result.current.giocatori[0].poteriUsati).toEqual([])
})

test('aggiornaGiocatore applica una patch parziale al giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna', 'villico')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.aggiornaGiocatore(id, { vivo: false, poteriUsati: ['guaritore-resuscita'] })
  })

  expect(result.current.giocatori[0].vivo).toBe(false)
  expect(result.current.giocatori[0].poteriUsati).toEqual(['guaritore-resuscita'])
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- usePartita`
Expected: FAIL — `poteriUsati` è `undefined`, `aggiornaGiocatore` non esiste

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

  function addGiocatore(nome, ruoloSlug) {
    setGiocatori((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome, ruoloSlug, vivo: true, condizioni: [], note: '', poteriUsati: [] },
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

Run: `npm test -- usePartita`
Expected: PASS — 6 test (4 esistenti + 2 nuovi)

- [ ] **Step 5: Commit**

```bash
git add src/state/usePartita.js src/state/usePartita.test.js
git commit -m "feat: add aggiornaGiocatore and poteriUsati to usePartita"
```

---

### Task 2: Funzioni pure di effetto

**Files:**
- Create: `src/data/effettiNotte.js`
- Create: `src/data/effettiNotte.test.js`

**Interfaces:**
- Produces: `aggiungiCondizionePatch(giocatore, condizione) => object|null`, `uccidiPatch(giocatore) => object|null`, `resuscitaPatch(giocatore) => object|null`. Ognuna ritorna la patch da passare ad `aggiornaGiocatore`, o `null` se l'azione non ha effetto.

- [ ] **Step 1: Scrivi il test fallente `src/data/effettiNotte.test.js`**

```js
import { aggiungiCondizionePatch, uccidiPatch, resuscitaPatch } from './effettiNotte'

test('aggiungiCondizionePatch aggiunge la condizione se non presente', () => {
  const giocatore = { condizioni: [] }
  expect(aggiungiCondizionePatch(giocatore, 'unto')).toEqual({ condizioni: ['unto'] })
})

test('aggiungiCondizionePatch ritorna null se la condizione è già presente', () => {
  const giocatore = { condizioni: ['unto'] }
  expect(aggiungiCondizionePatch(giocatore, 'unto')).toBeNull()
})

test('uccidiPatch ritorna vivo:false se il giocatore non è protetto', () => {
  expect(uccidiPatch({ condizioni: [] })).toEqual({ vivo: false })
})

test('uccidiPatch ritorna null se il giocatore è protetto', () => {
  expect(uccidiPatch({ condizioni: ['protetto'] })).toBeNull()
})

test('resuscitaPatch riporta in vita un giocatore morto', () => {
  expect(resuscitaPatch({ vivo: false, condizioni: [] })).toEqual({ vivo: true, condizioni: ['resuscitato'] })
})

test('resuscitaPatch ritorna null se il giocatore è già vivo', () => {
  expect(resuscitaPatch({ vivo: true, condizioni: [] })).toBeNull()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- effettiNotte`
Expected: FAIL — `Cannot find module './effettiNotte'`

- [ ] **Step 3: Scrivi `src/data/effettiNotte.js`**

```js
export function aggiungiCondizionePatch(giocatore, condizione) {
  if (giocatore.condizioni.includes(condizione)) return null
  return { condizioni: [...giocatore.condizioni, condizione] }
}

export function uccidiPatch(giocatore) {
  if (giocatore.condizioni.includes('protetto')) return null
  return { vivo: false }
}

export function resuscitaPatch(giocatore) {
  if (giocatore.vivo) return null
  return { vivo: true, condizioni: [...giocatore.condizioni, 'resuscitato'] }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- effettiNotte`
Expected: PASS — 6 test

- [ ] **Step 5: Commit**

```bash
git add src/data/effettiNotte.js src/data/effettiNotte.test.js
git commit -m "feat: add pure night-effect functions"
```

---

### Task 3: Componenti generici di selezione bersaglio

**Files:**
- Create: `src/features/notte/azioni/SceltaGiocatore.jsx`
- Create: `src/features/notte/azioni/SceltaGiocatore.test.jsx`
- Create: `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx`
- Create: `src/features/notte/azioni/SceltaDoppiaGiocatore.test.jsx`

**Interfaces:**
- Produces: `SceltaGiocatore({ candidati: {id,nome}[], onConferma(id), onSalta(), etichetta })`.
- Produces: `SceltaDoppiaGiocatore({ candidati: {id,nome}[], onConferma(idA, idB), onSalta(), etichetta })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/SceltaGiocatore.test.jsx`**

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

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- SceltaGiocatore`
Expected: FAIL — `Cannot find module './SceltaGiocatore'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/SceltaGiocatore.jsx`**

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

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- SceltaGiocatore`
Expected: PASS — 3 test

- [ ] **Step 5: Scrivi il test fallente `src/features/notte/azioni/SceltaDoppiaGiocatore.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceltaDoppiaGiocatore } from './SceltaDoppiaGiocatore'

const candidati = [
  { id: '1', nome: 'Anna' },
  { id: '2', nome: 'Marco' },
  { id: '3', nome: 'Luca' },
]

test('il pulsante Conferma è disabilitato finché non sono selezionati due bersagli', async () => {
  const user = userEvent.setup()
  render(<SceltaDoppiaGiocatore candidati={candidati} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli due" />)

  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()

  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  expect(screen.getByRole('button', { name: 'Conferma' })).not.toBeDisabled()
})

test('conferma chiama onConferma con i due id selezionati', async () => {
  const user = userEvent.setup()
  const onConferma = vi.fn()
  render(<SceltaDoppiaGiocatore candidati={candidati} onConferma={onConferma} onSalta={() => {}} etichetta="Scegli due" />)

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onConferma).toHaveBeenCalledWith('1', '2')
})

test('non è possibile selezionare più di due bersagli', async () => {
  const user = userEvent.setup()
  render(<SceltaDoppiaGiocatore candidati={candidati} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli due" />)

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  await user.click(screen.getByRole('checkbox', { name: 'Luca' }))

  expect(screen.getByRole('checkbox', { name: 'Luca' })).not.toBeChecked()
})
```

- [ ] **Step 6: Esegui il test e verifica che fallisca**

Run: `npm test -- SceltaDoppiaGiocatore`
Expected: FAIL — `Cannot find module './SceltaDoppiaGiocatore'`

- [ ] **Step 7: Scrivi `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx`**

```jsx
import { useState } from 'react'

export function SceltaDoppiaGiocatore({ candidati, onConferma, onSalta, etichetta }) {
  const [selezionati, setSelezionati] = useState([])

  function toggleSelezione(id) {
    setSelezionati((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  if (candidati.length < 2) {
    return <p>Servono almeno due bersagli disponibili.</p>
  }

  return (
    <div className="scelta-doppia-giocatore">
      <p>{etichetta}</p>
      <ul>
        {candidati.map((g) => (
          <li key={g.id}>
            <label>
              <input type="checkbox" checked={selezionati.includes(g.id)} onChange={() => toggleSelezione(g.id)} />
              {g.nome}
            </label>
          </li>
        ))}
      </ul>
      <button type="button" disabled={selezionati.length !== 2} onClick={() => onConferma(selezionati[0], selezionati[1])}>
        Conferma
      </button>
      <button type="button" onClick={onSalta}>
        Salta
      </button>
    </div>
  )
}
```

- [ ] **Step 8: Esegui i test e verifica che passino**

Run: `npm test -- SceltaDoppiaGiocatore`
Expected: PASS — 3 test

- [ ] **Step 9: Commit**

```bash
git add src/features/notte/azioni/SceltaGiocatore.jsx src/features/notte/azioni/SceltaGiocatore.test.jsx src/features/notte/azioni/SceltaDoppiaGiocatore.jsx src/features/notte/azioni/SceltaDoppiaGiocatore.test.jsx
git commit -m "feat: add generic single/double target picker components"
```

---

### Task 4: `AzioneCondizioneSingola` (Paladino, Untore, Fattucchiera, Maga)

**Files:**
- Create: `src/features/notte/azioni/AzioneCondizioneSingola.jsx`
- Create: `src/features/notte/azioni/AzioneCondizioneSingola.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (Task 3), `aggiungiCondizionePatch` (Task 2).
- Produces: `AzioneCondizioneSingola({ giocatori, aggiornaGiocatore, condizione, etichetta })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneCondizioneSingola.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneCondizioneSingola } from './AzioneCondizioneSingola'

const giocatori = [
  { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
]

test('conferma applica la condizione al bersaglio scelto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneSingola
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="unto"
      etichetta="Chi ungere"
    />,
  )

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['unto'] })
})

test('mostra solo i giocatori vivi come candidati', () => {
  const conMorto = [...giocatori, { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: false, condizioni: [], note: '' }]
  render(
    <AzioneCondizioneSingola giocatori={conMorto} aggiornaGiocatore={() => {}} condizione="unto" etichetta="Chi ungere" />,
  )
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneCondizioneSingola`
Expected: FAIL — `Cannot find module './AzioneCondizioneSingola'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneCondizioneSingola.jsx`**

```jsx
import { SceltaGiocatore } from './SceltaGiocatore'
import { aggiungiCondizionePatch } from '../../../data/effettiNotte'

export function AzioneCondizioneSingola({ giocatori, aggiornaGiocatore, condizione, etichetta }) {
  const vivi = giocatori.filter((g) => g.vivo)

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const patch = aggiungiCondizionePatch(target, condizione)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta={etichetta} />
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneCondizioneSingola`
Expected: PASS — 2 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneCondizioneSingola.jsx src/features/notte/azioni/AzioneCondizioneSingola.test.jsx
git commit -m "feat: add AzioneCondizioneSingola for single-target condition roles"
```

---

### Task 5: `AzioneCondizioneDoppia` (Pifferaio, Sacerdote)

**Files:**
- Create: `src/features/notte/azioni/AzioneCondizioneDoppia.jsx`
- Create: `src/features/notte/azioni/AzioneCondizioneDoppia.test.jsx`

**Interfaces:**
- Consumes: `SceltaDoppiaGiocatore` (Task 3), `aggiungiCondizionePatch` (Task 2).
- Produces: `AzioneCondizioneDoppia({ giocatori, aggiornaGiocatore, condizione, etichetta })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneCondizioneDoppia.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneCondizioneDoppia } from './AzioneCondizioneDoppia'

const giocatori = [
  { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
]

test('conferma applica la condizione a entrambi i bersagli scelti', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
    />,
  )

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['ipnotizzato'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['ipnotizzato'] })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneCondizioneDoppia`
Expected: FAIL — `Cannot find module './AzioneCondizioneDoppia'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneCondizioneDoppia.jsx`**

```jsx
import { SceltaDoppiaGiocatore } from './SceltaDoppiaGiocatore'
import { aggiungiCondizionePatch } from '../../../data/effettiNotte'

export function AzioneCondizioneDoppia({ giocatori, aggiornaGiocatore, condizione, etichetta }) {
  const vivi = giocatori.filter((g) => g.vivo)

  function confermaScelta(idA, idB) {
    for (const id of [idA, idB]) {
      const target = giocatori.find((g) => g.id === id)
      if (!target) continue
      const patch = aggiungiCondizionePatch(target, condizione)
      if (patch) {
        aggiornaGiocatore(id, patch)
      }
    }
  }

  return <SceltaDoppiaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta={etichetta} />
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneCondizioneDoppia`
Expected: PASS — 1 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneCondizioneDoppia.jsx src/features/notte/azioni/AzioneCondizioneDoppia.test.jsx
git commit -m "feat: add AzioneCondizioneDoppia for double-target condition roles"
```

---

### Task 6: `AzioneBrancoLupi` e `AzioneChupacabra`

**Files:**
- Create: `src/features/notte/azioni/AzioneBrancoLupi.jsx`
- Create: `src/features/notte/azioni/AzioneBrancoLupi.test.jsx`
- Create: `src/features/notte/azioni/AzioneChupacabra.jsx`
- Create: `src/features/notte/azioni/AzioneChupacabra.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (Task 3), `uccidiPatch` (Task 2), `ROLES` (`src/data/roles.js`, per leggere la fazione del bersaglio).
- Produces: `AzioneBrancoLupi({ giocatori, aggiornaGiocatore })`, `AzioneChupacabra({ giocatori, aggiornaGiocatore })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneBrancoLupi.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneBrancoLupi } from './AzioneBrancoLupi'

test('conferma uccide il bersaglio scelto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' }]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
})

test('non uccide un bersaglio protetto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto'], note: '' }]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneBrancoLupi`
Expected: FAIL — `Cannot find module './AzioneBrancoLupi'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneBrancoLupi.jsx`**

```jsx
import { SceltaGiocatore } from './SceltaGiocatore'
import { uccidiPatch } from '../../../data/effettiNotte'

export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore }) {
  const vivi = giocatori.filter((g) => g.vivo)

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const patch = uccidiPatch(target)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta="Il branco sbrana" />
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneBrancoLupi`
Expected: PASS — 2 test

- [ ] **Step 5: Scrivi il test fallente `src/features/notte/azioni/AzioneChupacabra.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneChupacabra } from './AzioneChupacabra'

test('uccide un bersaglio di fazione lupi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' }]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
})

test('non ha effetto su un bersaglio non-lupo se ci sono ancora lupi vivi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('uccide chiunque se non ci sono più lupi vivi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: false, condizioni: [], note: '' },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
})
```

- [ ] **Step 6: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneChupacabra`
Expected: FAIL — `Cannot find module './AzioneChupacabra'`

- [ ] **Step 7: Scrivi `src/features/notte/azioni/AzioneChupacabra.jsx`**

```jsx
import { ROLES } from '../../../data/roles'
import { SceltaGiocatore } from './SceltaGiocatore'
import { uccidiPatch } from '../../../data/effettiNotte'

function fazioneDi(giocatore) {
  return ROLES.find((r) => r.slug === giocatore.ruoloSlug)?.fazione
}

export function AzioneChupacabra({ giocatori, aggiornaGiocatore }) {
  const vivi = giocatori.filter((g) => g.vivo)
  const nessunLupoVivo = !vivi.some((g) => fazioneDi(g) === 'lupi')

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const puoUccidere = fazioneDi(target) === 'lupi' || nessunLupoVivo
    if (!puoUccidere) return
    const patch = uccidiPatch(target)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta="Il Chupacabra caccia" />
}
```

- [ ] **Step 8: Esegui i test e verifica che passino**

Run: `npm test -- AzioneChupacabra`
Expected: PASS — 3 test

- [ ] **Step 9: Commit**

```bash
git add src/features/notte/azioni/AzioneBrancoLupi.jsx src/features/notte/azioni/AzioneBrancoLupi.test.jsx src/features/notte/azioni/AzioneChupacabra.jsx src/features/notte/azioni/AzioneChupacabra.test.jsx
git commit -m "feat: add AzioneBrancoLupi and AzioneChupacabra"
```

---

### Task 7: `AzioneResuscita` (Guaritore, Sciacallo Mannaro)

**Files:**
- Create: `src/features/notte/azioni/AzioneResuscita.jsx`
- Create: `src/features/notte/azioni/AzioneResuscita.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (Task 3), `resuscitaPatch` (Task 2).
- Produces: `AzioneResuscita({ giocatori, aggiornaGiocatore, potereSlug, ruoloSlugAttore })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneResuscita.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneResuscita } from './AzioneResuscita'

test("resuscita il bersaglio morto e marca il potere come usato sull'attore", async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], note: '', poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], note: '' },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
    />,
  )

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: true, condizioni: ['resuscitato'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['guaritore-resuscita'] })
})

test('mostra un messaggio se il potere è già stato usato', () => {
  const giocatori = [
    {
      id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], note: '',
      poteriUsati: ['guaritore-resuscita'],
    },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], note: '' },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
    />,
  )
  expect(screen.getByText(/già utilizzato/i)).toBeInTheDocument()
})

test('mostra solo i giocatori morti come candidati', () => {
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], note: '', poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
    />,
  )
  expect(screen.queryByText('Anna')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneResuscita`
Expected: FAIL — `Cannot find module './AzioneResuscita'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneResuscita.jsx`**

```jsx
import { SceltaGiocatore } from './SceltaGiocatore'
import { resuscitaPatch } from '../../../data/effettiNotte'

export function AzioneResuscita({ giocatori, aggiornaGiocatore, potereSlug, ruoloSlugAttore }) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const poteriUsatiAttore = attore?.poteriUsati ?? []
  const giaUsato = poteriUsatiAttore.includes(potereSlug)
  const morti = giocatori.filter((g) => !g.vivo)

  if (giaUsato) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !attore) return
    const patch = resuscitaPatch(target)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
    aggiornaGiocatore(attore.id, { poteriUsati: [...poteriUsatiAttore, potereSlug] })
  }

  return <SceltaGiocatore candidati={morti} onConferma={confermaScelta} onSalta={() => {}} etichetta="Chi resuscitare" />
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneResuscita`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneResuscita.jsx src/features/notte/azioni/AzioneResuscita.test.jsx
git commit -m "feat: add AzioneResuscita for Guaritore and Sciacallo Mannaro"
```

---

### Task 8: `AzioneStrega`

**Files:**
- Create: `src/features/notte/azioni/AzioneStrega.jsx`
- Create: `src/features/notte/azioni/AzioneStrega.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (Task 3), `aggiungiCondizionePatch`/`uccidiPatch` (Task 2).
- Produces: `AzioneStrega({ giocatori, aggiornaGiocatore })` (nessuna prop aggiuntiva: la Strega è identificata internamente cercando `ruoloSlug === 'strega'`).

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneStrega.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneStrega } from './AzioneStrega'

const giocatori = [
  { id: '1', nome: 'Strega', ruoloSlug: 'strega', vivo: true, condizioni: [], note: '', poteriUsati: [] },
  { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
]

test('la pozione vitale protegge il bersaglio e marca il potere come usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  const [selectVitale] = screen.getAllByRole('combobox')
  const [confermaVitale] = screen.getAllByRole('button', { name: 'Conferma' })

  await user.selectOptions(selectVitale, '2')
  await user.click(confermaVitale)

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['protetto'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['strega-pozione-vitale'] })
})

test('la pozione mortale uccide il bersaglio e marca il potere come usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  const [, selectMortale] = screen.getAllByRole('combobox')
  const [, confermaMortale] = screen.getAllByRole('button', { name: 'Conferma' })

  await user.selectOptions(selectMortale, '2')
  await user.click(confermaMortale)

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: false })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['strega-pozione-mortale'] })
})

test('nasconde la pozione già usata', () => {
  const giocatoriConPozioneUsata = [{ ...giocatori[0], poteriUsati: ['strega-pozione-vitale'] }, giocatori[1]]
  render(<AzioneStrega giocatori={giocatoriConPozioneUsata} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/pozione vitale già utilizzata/i)).toBeInTheDocument()
  expect(screen.getAllByRole('combobox')).toHaveLength(1)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneStrega`
Expected: FAIL — `Cannot find module './AzioneStrega'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneStrega.jsx`**

```jsx
import { SceltaGiocatore } from './SceltaGiocatore'
import { aggiungiCondizionePatch, uccidiPatch } from '../../../data/effettiNotte'

export function AzioneStrega({ giocatori, aggiornaGiocatore }) {
  const strega = giocatori.find((g) => g.ruoloSlug === 'strega')
  const poteriUsati = strega?.poteriUsati ?? []
  const vivi = giocatori.filter((g) => g.vivo)

  function usaPozioneVitale(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !strega) return
    const patch = aggiungiCondizionePatch(target, 'protetto')
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriUsati, 'strega-pozione-vitale'] })
  }

  function usaPozioneMortale(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !strega) return
    const patch = uccidiPatch(target)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriUsati, 'strega-pozione-mortale'] })
  }

  return (
    <div className="azione-strega">
      <div>
        <h3>Pozione vitale</h3>
        {poteriUsati.includes('strega-pozione-vitale') ? (
          <p>Pozione vitale già utilizzata.</p>
        ) : (
          <SceltaGiocatore candidati={vivi} onConferma={usaPozioneVitale} onSalta={() => {}} etichetta="Chi proteggere" />
        )}
      </div>
      <div>
        <h3>Pozione mortale</h3>
        {poteriUsati.includes('strega-pozione-mortale') ? (
          <p>Pozione mortale già utilizzata.</p>
        ) : (
          <SceltaGiocatore candidati={vivi} onConferma={usaPozioneMortale} onSalta={() => {}} etichetta="Chi uccidere" />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneStrega`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneStrega.jsx src/features/notte/azioni/AzioneStrega.test.jsx
git commit -m "feat: add AzioneStrega with independent vital/mortal potions"
```

---

### Task 9: Lookup `AZIONI_NOTTURNE`, integrazione in `NightSequencer` e pulizia condizioni a notte successiva

**Files:**
- Create: `src/features/notte/azioni/index.js`
- Modify: `src/features/notte/NightSequencer.jsx`
- Modify: `src/features/notte/NightSequencer.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `AZIONI_NOTTURNE: { [stepId]: { Componente, props } }`.
- Modifica: `NightSequencer` accetta una prop aggiuntiva `aggiornaGiocatore`; monta `AZIONI_NOTTURNE[step.id].Componente` quando il passo è `tipo:'azione'`, esiste una voce nel lookup, e almeno un giocatore coinvolto è vivo. Il pulsante "Notte successiva" ora rimuove `protetto`/`inibito` da tutti i giocatori prima di chiamare `nuovaNotte()`.

- [ ] **Step 1: Scrivi `src/features/notte/azioni/index.js`**

```js
import { AzioneCondizioneSingola } from './AzioneCondizioneSingola'
import { AzioneCondizioneDoppia } from './AzioneCondizioneDoppia'
import { AzioneBrancoLupi } from './AzioneBrancoLupi'
import { AzioneChupacabra } from './AzioneChupacabra'
import { AzioneResuscita } from './AzioneResuscita'
import { AzioneStrega } from './AzioneStrega'

export const AZIONI_NOTTURNE = {
  paladino: { Componente: AzioneCondizioneSingola, props: { condizione: 'protetto', etichetta: 'Chi proteggere' } },
  untore: { Componente: AzioneCondizioneSingola, props: { condizione: 'unto', etichetta: 'Chi ungere' } },
  fattucchiera: { Componente: AzioneCondizioneSingola, props: { condizione: 'inibito', etichetta: 'Chi inibire' } },
  maga: { Componente: AzioneCondizioneSingola, props: { condizione: 'trasformato', etichetta: 'Chi trasformare' } },
  pifferaio: { Componente: AzioneCondizioneDoppia, props: { condizione: 'ipnotizzato', etichetta: 'Chi ipnotizzare (due giocatori)' } },
  sacerdote: { Componente: AzioneCondizioneDoppia, props: { condizione: 'innamorato', etichetta: 'Chi unire (due giocatori)' } },
  'branco-lupi': { Componente: AzioneBrancoLupi, props: {} },
  chupacabra: { Componente: AzioneChupacabra, props: {} },
  guaritore: { Componente: AzioneResuscita, props: { potereSlug: 'guaritore-resuscita', ruoloSlugAttore: 'guaritore' } },
  'sciacallo-mannaro': { Componente: AzioneResuscita, props: { potereSlug: 'sciacallo-mannaro-resuscita', ruoloSlugAttore: 'sciacallo-mannaro' } },
  strega: { Componente: AzioneStrega, props: {} },
}
```

- [ ] **Step 2: Aggiorna `src/features/notte/NightSequencer.test.jsx`** (sostituisci l'intero file: aggiunge `aggiornaGiocatore` alle chiamate esistenti e nuovi test per l'integrazione delle azioni)

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NightSequencer } from './NightSequencer'

beforeEach(() => {
  localStorage.clear()
})

test('senza ruoli con azione notturna mostra un messaggio', () => {
  render(<NightSequencer ruoliSelezionati={['villico']} giocatori={[]} aggiornaGiocatore={() => {}} />)
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('mostra il primo passo e i giocatori assegnati a quel ruolo', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()
  expect(screen.getByText('Sara')).toBeInTheDocument()
})

test('il pulsante Avanti passa al passo successivo', async () => {
  const user = userEvent.setup()
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test('sull\'ultimo passo il pulsante diventa "Notte successiva" e fa ripartire dal primo passo con la notte incrementata', async () => {
  const user = userEvent.setup()
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByText('Paladino')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Notte successiva' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(screen.getByText('Notte 2')).toBeInTheDocument()
  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test("mostra la selezione bersaglio quando il passo ha un'azione automatizzata e il titolare è vivo", () => {
  const giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: [], note: '', poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  ]
  render(<NightSequencer ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('combobox')).toBeInTheDocument()
})

test('non mostra la selezione bersaglio se il titolare del ruolo è morto', () => {
  const giocatori = [{ id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: false, condizioni: [], note: '', poteriUsati: [] }]
  render(<NightSequencer ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('non mostra alcuna selezione bersaglio per ruoli senza automazione (5c)', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencer ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('"Notte successiva" rimuove le condizioni protetto e inibito da tutti i giocatori', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto', 'unto'], note: '' }]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencer ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['unto'] })
})
```

- [ ] **Step 3: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `NightSequencer` non usa ancora `aggiornaGiocatore` né monta le azioni

- [ ] **Step 4: Aggiorna `src/features/notte/NightSequencer.jsx`**

```jsx
import { passiNotte } from '../../data/nightSteps'
import { useNotte } from '../../state/useNotte'
import { AZIONI_NOTTURNE } from './azioni'

export function NightSequencer({ ruoliSelezionati, giocatori, aggiornaGiocatore }) {
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

  const azione = AZIONI_NOTTURNE[step.id]
  const qualcunoVivo = giocatoriCoinvolti.some((g) => g.vivo)
  const mostraAzione = step.tipo === 'azione' && azione && qualcunoVivo

  function passaAllaNotteSuccessiva() {
    giocatori.forEach((g) => {
      const condizioniRipulite = g.condizioni.filter((c) => c !== 'protetto' && c !== 'inibito')
      if (condizioniRipulite.length !== g.condizioni.length) {
        aggiornaGiocatore(g.id, { condizioni: condizioniRipulite })
      }
    })
    nuovaNotte()
  }

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

      {mostraAzione && <azione.Componente giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} {...azione.props} />}

      <div className="night-sequencer__nav">
        <button type="button" onClick={indietro} disabled={indiceValido === 0}>
          Indietro
        </button>
        {ultimoPasso ? (
          <button type="button" onClick={passaAllaNotteSuccessiva}>
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

- [ ] **Step 5: Esegui i test e verifica che passino**

Run: `npm test -- NightSequencer`
Expected: PASS — 7 test

- [ ] **Step 6: Aggiorna `src/App.jsx` per passare `aggiornaGiocatore` a `NightSequencer`**

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
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore } = usePartita()

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
      {tab === 'notte' && (
        <NightSequencer ruoliSelezionati={ruoliSelezionati} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />
      )}
    </main>
  )
}
```

- [ ] **Step 7: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 8: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 9: Commit**

```bash
git add src/features/notte/azioni/index.js src/features/notte/NightSequencer.jsx src/features/notte/NightSequencer.test.jsx src/App.jsx
git commit -m "feat: wire automatic night-action resolution into the sequencer"
```

---

## Fuori scope per questo piano

Apprendista, Cavaliere, Figlia dei Lupi, Guardie/Guardia Mannara/Mucca Mannara, Addolorata, Cortigiana restano passi puramente informativi (piano 5c, vedi spec) — richiedono un modello di legami persistenti tra giocatori non ancora progettato.

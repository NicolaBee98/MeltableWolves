# Sequencer Notte — Legami e Cortigiana (5c) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatizzare Apprendista, Cavaliere, Figlia dei Lupi (che legano la prima notte a un bersaglio, con conseguenze quando il bersaglio muore) e Cortigiana (che ogni notte visita un cliente, con conseguenze legate alla sorte del cliente). Guardie, Guardia Mannara e Mucca Mannara sono già coperti dal passo informativo del piano 5a (si riconoscono, nessun bersaglio) — nessun lavoro necessario. Addolorata resta fuori scope: il suo potere dipende da chi è stato mandato al rogo, informazione che esisterà solo con la fase giorno/voto (passo 6).

**Architecture:** Un nuovo campo opzionale `giocatore.legame: { tipo, targetId } | undefined` per Apprendista/Cavaliere/Figlia dei Lupi, e `giocatore.visitaNotturna: string | undefined` per la Cortigiana. Le conseguenze non si applicano nell'istante della scelta ma vengono risolte al momento di "Notte successiva" (stesso punto in cui il piano 5b già ripulisce `protetto`/`inibito`) — coerente con come un narratore umano annuncia gli esiti all'alba. Per distinguere "morto sbranato di notte" da "morto per altra causa" (necessario per Cavaliere e Cortigiana), le uccisioni automatiche del piano 5b vengono taggate con `causaMorte: 'notte'`.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- Le conseguenze di legami e Cortigiana si risolvono solo quando il narratore preme "Notte successiva", non nell'istante della scelta — evita di dover distinguere "ordine relativo" fra passi diversi nella stessa notte.
- **Limite noto**: per Cavaliere e Cortigiana, "morto di notte" è approssimato con `causaMorte === 'notte'`, impostato solo dalle azioni automatiche del piano 5b (Branco dei Lupi, Chupacabra, pozione mortale della Strega). Una morte registrata a mano nel tracker (es. per rappresentare un rogo, dato che la fase giorno/voto non esiste ancora) non ha questo tag, e viene quindi trattata come "non di notte" — per il Cavaliere questo significa "si immola comunque, ma il bersaglio non resuscita" (il comportamento corretto per un rogo); per la Cortigiana significa "sopravvive" a meno che il cliente non fosse un lupo. Quando la fase giorno/voto (passo 6) esisterà, si potrà eventualmente raffinare.
- Apprendista, Cavaliere, Figlia dei Lupi scelgono il bersaglio solo alla notte 1 (già garantito da `primaNotteSolo` nei passi esistenti); se il legame è già stabilito, il passo mostra solo un promemoria, non permette di ripetere la scelta.

---

### Task 1: Tagga le uccisioni automatiche con `causaMorte: 'notte'`

**Files:**
- Modify: `src/data/effettiNotte.js`
- Modify: `src/data/effettiNotte.test.js`
- Modify: `src/features/notte/azioni/AzioneBrancoLupi.test.jsx`
- Modify: `src/features/notte/azioni/AzioneChupacabra.test.jsx`
- Modify: `src/features/notte/azioni/AzioneStrega.test.jsx`

**Interfaces:**
- Modifica: `uccidiPatch(giocatore)` ritorna `{ vivo: false, causaMorte: 'notte' }` invece di `{ vivo: false }`.

- [ ] **Step 1: Aggiorna l'asserzione in `src/data/effettiNotte.test.js`**

```js
test('uccidiPatch ritorna vivo:false e causaMorte:notte se il giocatore non è protetto', () => {
  expect(uccidiPatch({ condizioni: [] })).toEqual({ vivo: false, causaMorte: 'notte' })
})
```

(sostituisce il test esistente con lo stesso nome/scopo)

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- effettiNotte`
Expected: FAIL — riceve `{ vivo: false }`, atteso `{ vivo: false, causaMorte: 'notte' }`

- [ ] **Step 3: Aggiorna `src/data/effettiNotte.js`**

```js
export function uccidiPatch(giocatore) {
  if (giocatore.condizioni.includes('protetto')) return null
  return { vivo: false, causaMorte: 'notte' }
}
```

(le altre due funzioni, `aggiungiCondizionePatch` e `resuscitaPatch`, restano invariate)

- [ ] **Step 4: Aggiorna le asserzioni nei tre file di test che usano `uccidiPatch` indirettamente**

In `src/features/notte/azioni/AzioneBrancoLupi.test.jsx`, sostituisci:
```js
expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
```
con:
```js
expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'notte' })
```

In `src/features/notte/azioni/AzioneChupacabra.test.jsx`, sostituisci le due occorrenze:
```js
expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
```
con:
```js
expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'notte' })
```

In `src/features/notte/azioni/AzioneStrega.test.jsx`, nel test "la pozione mortale uccide il bersaglio...", sostituisci:
```js
expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: false })
```
con:
```js
expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: false, causaMorte: 'notte' })
```

- [ ] **Step 5: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 6: Commit**

```bash
git add src/data/effettiNotte.js src/data/effettiNotte.test.js src/features/notte/azioni/AzioneBrancoLupi.test.jsx src/features/notte/azioni/AzioneChupacabra.test.jsx src/features/notte/azioni/AzioneStrega.test.jsx
git commit -m "feat: tag automatic night kills with causaMorte for bond resolution"
```

---

### Task 2: `risolviLegami` — conseguenze di Apprendista, Cavaliere, Figlia dei Lupi

**Files:**
- Create: `src/data/risoluzioneNotte.js`
- Create: `src/data/risoluzioneNotte.test.js`

**Interfaces:**
- Produces: `risolviLegami(giocatori) => { [giocatoreId]: patch }` — ritorna solo le patch dei giocatori effettivamente coinvolti; oggetto vuoto se nessun legame si attiva.

- [ ] **Step 1: Scrivi il test fallente `src/data/risoluzioneNotte.test.js`**

```js
import { risolviLegami } from './risoluzioneNotte'

test('apprendista eredita il ruolo del maestro quando muore', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toEqual({ ruoloSlug: 'veggente', legame: null })
})

test('cavaliere muore al posto del bersaglio se ucciso di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte' },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toEqual({ vivo: true })
  expect(patch['1']).toEqual({ vivo: false, legame: null })
})

test('cavaliere si immola se il bersaglio muore senza essere sbranato di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toBeUndefined()
  expect(patch['1']).toEqual({ vivo: false, legame: null })
})

test('figlia dei lupi diventa lupo mannaro quando il genitore muore', () => {
  const giocatori = [
    { id: '1', nome: 'Elsa', ruoloSlug: 'figlia-dei-lupi', vivo: true, condizioni: [], legame: { tipo: 'figlia-dei-lupi', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toEqual({ ruoloSlug: 'lupo-mannaro', legame: null })
})

test('nessun effetto se il bersaglio del legame è ancora vivo', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  expect(risolviLegami(giocatori)).toEqual({})
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- risoluzioneNotte`
Expected: FAIL — `Cannot find module './risoluzioneNotte'`

- [ ] **Step 3: Scrivi `src/data/risoluzioneNotte.js`**

```js
export function risolviLegami(giocatori) {
  const patch = {}

  for (const attore of giocatori) {
    if (!attore.legame) continue
    const target = giocatori.find((g) => g.id === attore.legame.targetId)
    if (!target || target.vivo) continue

    if (attore.legame.tipo === 'apprendista') {
      patch[attore.id] = { ruoloSlug: target.ruoloSlug, legame: null }
    }

    if (attore.legame.tipo === 'cavaliere') {
      if (target.causaMorte === 'notte') {
        patch[target.id] = { vivo: true }
      }
      patch[attore.id] = { vivo: false, legame: null }
    }

    if (attore.legame.tipo === 'figlia-dei-lupi') {
      patch[attore.id] = { ruoloSlug: 'lupo-mannaro', legame: null }
    }
  }

  return patch
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- risoluzioneNotte`
Expected: PASS — 5 test

- [ ] **Step 5: Commit**

```bash
git add src/data/risoluzioneNotte.js src/data/risoluzioneNotte.test.js
git commit -m "feat: add risolviLegami for Apprendista, Cavaliere, Figlia dei Lupi"
```

---

### Task 3: `AzioneLegame` — componente per stabilire il legame

**Files:**
- Create: `src/features/notte/azioni/AzioneLegame.jsx`
- Create: `src/features/notte/azioni/AzioneLegame.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (dal piano 5b).
- Produces: `AzioneLegame({ giocatori, aggiornaGiocatore, ruoloSlugAttore, tipoLegame, etichetta })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneLegame.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneLegame } from './AzioneLegame'

test("conferma stabilisce il legame sul giocatore attore", async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneLegame
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoloSlugAttore="apprendista"
      tipoLegame="apprendista"
      etichetta="Chi seguire"
    />,
  )

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: { tipo: 'apprendista', targetId: '2' } })
})

test('mostra un messaggio se il legame è già stabilito', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneLegame
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoloSlugAttore="apprendista"
      tipoLegame="apprendista"
      etichetta="Chi seguire"
    />,
  )
  expect(screen.getByText(/legame già stabilito con Marco/i)).toBeInTheDocument()
})

test("non mostra l'attore stesso tra i candidati", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneLegame
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoloSlugAttore="apprendista"
      tipoLegame="apprendista"
      etichetta="Chi seguire"
    />,
  )
  expect(screen.queryByText('Sara')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneLegame`
Expected: FAIL — `Cannot find module './AzioneLegame'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneLegame.jsx`**

```jsx
import { SceltaGiocatore } from './SceltaGiocatore'

export function AzioneLegame({ giocatori, aggiornaGiocatore, ruoloSlugAttore, tipoLegame, etichetta }) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => g.vivo && g.id !== attore?.id)

  if (attore?.legame) {
    const bersaglio = giocatori.find((g) => g.id === attore.legame.targetId)
    return <p>Legame già stabilito con {bersaglio?.nome ?? 'un giocatore'}.</p>
  }

  function confermaScelta(targetId) {
    if (!attore) return
    aggiornaGiocatore(attore.id, { legame: { tipo: tipoLegame, targetId } })
  }

  return <SceltaGiocatore candidati={candidati} onConferma={confermaScelta} onSalta={() => {}} etichetta={etichetta} />
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneLegame`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneLegame.jsx src/features/notte/azioni/AzioneLegame.test.jsx
git commit -m "feat: add AzioneLegame for Apprendista/Cavaliere/Figlia dei Lupi"
```

---

### Task 4: `risolviCortigiana` — conseguenze della visita notturna

**Files:**
- Modify: `src/data/risoluzioneNotte.js`
- Modify: `src/data/risoluzioneNotte.test.js`

**Interfaces:**
- Consumes: `ROLES` (`src/data/roles.js`).
- Produces: `risolviCortigiana(giocatori) => { [giocatoreId]: patch }`.

- [ ] **Step 1: Aggiungi i test falliti in `src/data/risoluzioneNotte.test.js`** (in coda al file)

```js
import { risolviCortigiana } from './risoluzioneNotte'

test('la cortigiana muore se il cliente scelto è un lupo', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ vivo: false, visitaNotturna: null })
})

test('la cortigiana muore se il cliente è stato sbranato di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte' },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ vivo: false, visitaNotturna: null })
})

test('la cortigiana sopravvive se il cliente è vivo e non è un lupo', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ visitaNotturna: null })
})

test('nessuna patch se la cortigiana non ha visitato nessuno', () => {
  const giocatori = [{ id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] }]
  expect(risolviCortigiana(giocatori)).toEqual({})
})
```

(Aggiungi anche l'import in cima al file: `import { risolviLegami, risolviCortigiana } from './risoluzioneNotte'`, sostituendo l'import esistente di solo `risolviLegami`.)

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- risoluzioneNotte`
Expected: FAIL — `risolviCortigiana` non è esportato

- [ ] **Step 3: Aggiorna `src/data/risoluzioneNotte.js`** (aggiungi in cima l'import e in coda la nuova funzione)

```js
import { ROLES } from './roles'

export function risolviLegami(giocatori) {
  // ... invariato dal Task 2 ...
}

export function risolviCortigiana(giocatori) {
  const cortigiana = giocatori.find((g) => g.ruoloSlug === 'cortigiana')
  if (!cortigiana || !cortigiana.vivo || !cortigiana.visitaNotturna) return {}

  const cliente = giocatori.find((g) => g.id === cortigiana.visitaNotturna)
  if (!cliente) return { [cortigiana.id]: { visitaNotturna: null } }

  const clienteFazione = ROLES.find((r) => r.slug === cliente.ruoloSlug)?.fazione
  const clienteELupo = clienteFazione === 'lupi'
  const clienteMortoDiNotte = !cliente.vivo && cliente.causaMorte === 'notte'

  if (clienteELupo || clienteMortoDiNotte) {
    return { [cortigiana.id]: { vivo: false, visitaNotturna: null } }
  }

  return { [cortigiana.id]: { visitaNotturna: null } }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- risoluzioneNotte`
Expected: PASS — 9 test (5 del Task 2 + 4 nuovi)

- [ ] **Step 5: Commit**

```bash
git add src/data/risoluzioneNotte.js src/data/risoluzioneNotte.test.js
git commit -m "feat: add risolviCortigiana for nightly client visits"
```

---

### Task 5: `AzioneCortigiana` — componente per scegliere il cliente

**Files:**
- Create: `src/features/notte/azioni/AzioneCortigiana.jsx`
- Create: `src/features/notte/azioni/AzioneCortigiana.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore`.
- Produces: `AzioneCortigiana({ giocatori, aggiornaGiocatore })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneCortigiana.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneCortigiana } from './AzioneCortigiana'

test('conferma imposta la visita notturna sulla cortigiana', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneCortigiana giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { visitaNotturna: '2' })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneCortigiana`
Expected: FAIL — `Cannot find module './AzioneCortigiana'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneCortigiana.jsx`**

```jsx
import { SceltaGiocatore } from './SceltaGiocatore'

export function AzioneCortigiana({ giocatori, aggiornaGiocatore }) {
  const cortigiana = giocatori.find((g) => g.ruoloSlug === 'cortigiana')
  const candidati = giocatori.filter((g) => g.vivo && g.id !== cortigiana?.id)

  function confermaScelta(targetId) {
    if (!cortigiana) return
    aggiornaGiocatore(cortigiana.id, { visitaNotturna: targetId })
  }

  return (
    <SceltaGiocatore candidati={candidati} onConferma={confermaScelta} onSalta={() => {}} etichetta="Chi visita la Cortigiana" />
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneCortigiana`
Expected: PASS — 1 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneCortigiana.jsx src/features/notte/azioni/AzioneCortigiana.test.jsx
git commit -m "feat: add AzioneCortigiana component"
```

---

### Task 6: Integrazione nel lookup e risoluzione a "Notte successiva"

**Files:**
- Modify: `src/features/notte/azioni/index.js`
- Modify: `src/features/notte/NightSequencer.jsx`
- Modify: `src/features/notte/NightSequencer.test.jsx`

**Interfaces:**
- Modifica: `AZIONI_NOTTURNE` aggiunge le voci `apprendista`, `cavaliere`, `figlia-dei-lupi`, `cortigiana`.
- Modifica: `passaAllaNotteSuccessiva` in `NightSequencer` applica anche le patch di `risolviLegami` e `risolviCortigiana`, oltre alla pulizia di `protetto`/`inibito` già esistente.

- [ ] **Step 1: Aggiungi i test falliti in `src/features/notte/NightSequencer.test.jsx`** (in coda al file)

```jsx
test('"Notte successiva" applica le conseguenze dei legami (apprendista eredita il ruolo del maestro)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencer ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', legame: null })
})

test("mostra la selezione bersaglio per l'Apprendista alla prima notte", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<NightSequencer ruoliSelezionati={['apprendista']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('combobox')).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `apprendista` non ha ancora un'azione mappata, `passaAllaNotteSuccessiva` non risolve ancora i legami

- [ ] **Step 3: Aggiorna `src/features/notte/azioni/index.js`**

```js
import { AzioneCondizioneSingola } from './AzioneCondizioneSingola'
import { AzioneCondizioneDoppia } from './AzioneCondizioneDoppia'
import { AzioneBrancoLupi } from './AzioneBrancoLupi'
import { AzioneChupacabra } from './AzioneChupacabra'
import { AzioneResuscita } from './AzioneResuscita'
import { AzioneStrega } from './AzioneStrega'
import { AzioneLegame } from './AzioneLegame'
import { AzioneCortigiana } from './AzioneCortigiana'

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
  apprendista: { Componente: AzioneLegame, props: { ruoloSlugAttore: 'apprendista', tipoLegame: 'apprendista', etichetta: 'Chi seguire come maestro' } },
  cavaliere: { Componente: AzioneLegame, props: { ruoloSlugAttore: 'cavaliere', tipoLegame: 'cavaliere', etichetta: 'Per chi sacrificarsi' } },
  'figlia-dei-lupi': { Componente: AzioneLegame, props: { ruoloSlugAttore: 'figlia-dei-lupi', tipoLegame: 'figlia-dei-lupi', etichetta: 'Chi scegliere come genitore' } },
  cortigiana: { Componente: AzioneCortigiana, props: {} },
}
```

- [ ] **Step 4: Aggiorna `src/features/notte/NightSequencer.jsx`**

```jsx
import { passiNotte } from '../../data/nightSteps'
import { useNotte } from '../../state/useNotte'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviLegami, risolviCortigiana } from '../../data/risoluzioneNotte'

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

    const patchRisoluzione = { ...risolviLegami(giocatori), ...risolviCortigiana(giocatori) }
    for (const [id, patch] of Object.entries(patchRisoluzione)) {
      aggiornaGiocatore(id, patch)
    }

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

- [ ] **Step 5: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 6: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 7: Commit**

```bash
git add src/features/notte/azioni/index.js src/features/notte/NightSequencer.jsx src/features/notte/NightSequencer.test.jsx
git commit -m "feat: wire Apprendista/Cavaliere/Figlia dei Lupi/Cortigiana into the sequencer"
```

---

## Fuori scope per questo piano

Addolorata resta rimandata: il suo potere dipende da chi è stato mandato al rogo, dato che esisterà solo con la fase giorno/voto (passo 6 della roadmap).

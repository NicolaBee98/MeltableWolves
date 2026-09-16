# Notte con Assegnazione Ruolo dal Vivo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quando un passo della notte coinvolge un ruolo non ancora assegnato a nessun giocatore, il narratore può cliccare sul giocatore che si rivela per assegnargli quel ruolo lì per lì (invece di sceglierlo in anticipo). Terzo sotto-progetto della revisione UX.

**Architecture:** Un nuovo componente `AssegnaRuolo` mostra, per il passo corrente, i giocatori vivi ancora senza ruolo, e assegna il ruolo al click (`aggiornaGiocatore(id, { ruoloSlug })`). Non serve modificare la logica esistente di `NightSequencer` che calcola "chi è coinvolto" e "mostra l'azione": è già basata su `giocatori.filter(g => g.ruoloSlug === ...)`, quindi appena un ruolo viene assegnato il re-render fa comparire a cascata sia l'elenco coinvolti sia l'azione automatica. La capacità di assegnazione rispetta la quantità scelta nel mazzo (es. Lupo Mannaro fino a 5, Guardia sempre 2). I passi "solo promemoria" (`potere-passivo`, `gesti-segreti`) restano esclusi dall'assegnazione: non rappresentano un vero risveglio in cui il giocatore si rivela al narratore.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- Un ruolo è "assegnabile" finché il numero di giocatori che già lo detengono è inferiore alla quantità di quel ruolo nel mazzo (default 1 se il ruolo non è quantificato).
- Solo i giocatori vivi e senza ruolo già assegnato compaiono come candidati da cliccare.
- Se un passo ha più ruoli possibili ancora liberi (es. Branco dei Lupi), il narratore sceglie prima quale carta specifica mostra il giocatore, poi clicca il suo nome.
- I passi `potere-passivo` e `gesti-segreti` non offrono assegnazione: sono promemoria per il narratore, non rappresentano un risveglio in cui il giocatore si identifica.
- `NightSequencer` riceve una nuova prop opzionale `quantita` (default `{}`, che equivale a "ogni ruolo ha capacità 1") — nessuna modifica necessaria ai test esistenti che non la passano.

---

### Task 1: Funzioni pure di assegnazione

**Files:**
- Create: `src/data/assegnazione.js`
- Create: `src/data/assegnazione.test.js`

**Interfaces:**
- Produces: `contaAssegnati(giocatori, slug) => number`, `ruoliAssegnabili(ruoli: string[], giocatori, quantita: {[slug]: number}) => string[]`.

- [ ] **Step 1: Scrivi il test fallente `src/data/assegnazione.test.js`**

```js
import { contaAssegnati, ruoliAssegnabili } from './assegnazione'

test('contaAssegnati conta i giocatori con quel ruolo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro' },
    { id: '2', ruoloSlug: 'lupo-mannaro' },
    { id: '3', ruoloSlug: 'paladino' },
  ]
  expect(contaAssegnati(giocatori, 'lupo-mannaro')).toBe(2)
  expect(contaAssegnati(giocatori, 'paladino')).toBe(1)
  expect(contaAssegnati(giocatori, 'veggente')).toBe(0)
})

test('ruoliAssegnabili esclude i ruoli già al completo rispetto alla quantità nel mazzo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro' },
    { id: '2', ruoloSlug: 'lupo-mannaro' },
  ]
  const quantita = { 'lupo-mannaro': 2, nonna: 1 }
  expect(ruoliAssegnabili(['lupo-mannaro', 'nonna'], giocatori, quantita)).toEqual(['nonna'])
})

test('un ruolo senza quantità nel mazzo ha capacità di default 1', () => {
  expect(ruoliAssegnabili(['paladino'], [], {})).toEqual(['paladino'])

  const giocatoriConPaladino = [{ id: '1', ruoloSlug: 'paladino' }]
  expect(ruoliAssegnabili(['paladino'], giocatoriConPaladino, {})).toEqual([])
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/assegnazione`
Expected: FAIL — `Cannot find module './assegnazione'`

- [ ] **Step 3: Scrivi `src/data/assegnazione.js`**

```js
export function contaAssegnati(giocatori, slug) {
  return giocatori.filter((g) => g.ruoloSlug === slug).length
}

export function ruoliAssegnabili(ruoli, giocatori, quantita) {
  return ruoli.filter((slug) => contaAssegnati(giocatori, slug) < (quantita[slug] ?? 1))
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/assegnazione`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/data/assegnazione.js src/data/assegnazione.test.js
git commit -m "feat: add pure functions for quantity-aware role assignment"
```

---

### Task 2: Escludi i passi promemoria dall'assegnazione

**Files:**
- Modify: `src/data/nightSteps.js`
- Modify: `src/data/nightSteps.test.js`

**Interfaces:**
- Modifica: le voci `potere-passivo` e `gesti-segreti` di `NIGHT_STEPS` guadagnano `assegnabile: false`. Le altre voci restano invariate (assegnabili per default, assenza del campo equivale a `true`).

- [ ] **Step 1: Aggiungi il test fallito in `src/data/nightSteps.test.js`** (in coda al file)

```js
test('i passi di solo promemoria non sono assegnabili', () => {
  const potere = NIGHT_STEPS.find((s) => s.id === 'potere-passivo')
  const gesti = NIGHT_STEPS.find((s) => s.id === 'gesti-segreti')
  expect(potere.assegnabile).toBe(false)
  expect(gesti.assegnabile).toBe(false)
})

test('un passo normale non ha assegnabile impostato a false', () => {
  const paladino = NIGHT_STEPS.find((s) => s.id === 'paladino')
  expect(paladino.assegnabile).not.toBe(false)
})
```

(Aggiungi anche `NIGHT_STEPS` all'import esistente in cima al file: `import { NIGHT_STEPS, passiNotte } from './nightSteps'`.)

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/nightSteps`
Expected: FAIL — `potere.assegnabile` è `undefined`, non `false`

- [ ] **Step 3: Aggiorna `src/data/nightSteps.js`**

Aggiungi `assegnabile: false,` alle due voci indicate:

```js
  {
    id: 'potere-passivo',
    titolo: 'Promemoria: ruoli con potere passivo',
    tipo: 'informativo',
    primaNotteSolo: true,
    assegnabile: false,
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
    assegnabile: false,
    ruoli: ['bardo', 'gallo-mannaro'],
  },
```

(tutte le altre voci di `NIGHT_STEPS` restano identiche)

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/nightSteps`
Expected: PASS — 9 test (7 esistenti + 2 nuovi)

- [ ] **Step 5: Commit**

```bash
git add src/data/nightSteps.js src/data/nightSteps.test.js
git commit -m "feat: mark potere-passivo and gesti-segreti as non-assignable"
```

---

### Task 3: Componente `AssegnaRuolo`

**Files:**
- Create: `src/features/notte/AssegnaRuolo.jsx`
- Create: `src/features/notte/AssegnaRuolo.test.jsx`

**Interfaces:**
- Consumes: `ROLES` (`src/data/roles.js`).
- Produces: `AssegnaRuolo({ ruoli: string[], giocatori, aggiornaGiocatore })`. Non renderizza nulla se `ruoli` è vuoto.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/AssegnaRuolo.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssegnaRuolo } from './AssegnaRuolo'

test('con un solo ruolo pendente, click su un giocatore lo assegna direttamente', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined }]
  render(<AssegnaRuolo ruoli={['paladino']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'paladino' })
})

test('con più ruoli pendenti, un selettore permette di scegliere quale ruolo assegnare', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined }]
  render(<AssegnaRuolo ruoli={['lupo-mannaro', 'nonna']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), 'nonna')
  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'nonna' })
})

test('non mostra giocatori già con un ruolo assegnato o morti', () => {
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: 'veggente' },
    { id: '2', nome: 'Anna', vivo: false, ruoloSlug: undefined },
    { id: '3', nome: 'Marco', vivo: true, ruoloSlug: undefined },
  ]
  render(<AssegnaRuolo ruoli={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('button', { name: 'Steve' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('non renderizza nulla se non ci sono ruoli da assegnare', () => {
  const { container } = render(<AssegnaRuolo ruoli={[]} giocatori={[]} aggiornaGiocatore={() => {}} />)
  expect(container).toBeEmptyDOMElement()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AssegnaRuolo`
Expected: FAIL — `Cannot find module './AssegnaRuolo'`

- [ ] **Step 3: Scrivi `src/features/notte/AssegnaRuolo.jsx`**

```jsx
import { useState } from 'react'
import { ROLES } from '../../data/roles'

export function AssegnaRuolo({ ruoli, giocatori, aggiornaGiocatore }) {
  const opzioni = ruoli.map((slug) => ROLES.find((r) => r.slug === slug)).filter(Boolean)
  const [ruoloScelto, setRuoloScelto] = useState(opzioni[0]?.slug ?? '')
  const candidati = giocatori.filter((g) => g.vivo && !g.ruoloSlug)

  if (opzioni.length === 0) return null

  function assegna(giocatoreId) {
    aggiornaGiocatore(giocatoreId, { ruoloSlug: ruoloScelto })
  }

  return (
    <div className="assegna-ruolo">
      {opzioni.length > 1 && (
        <label>
          Che ruolo mostra la carta?
          <select value={ruoloScelto} onChange={(event) => setRuoloScelto(event.target.value)}>
            {opzioni.map((ruolo) => (
              <option key={ruolo.slug} value={ruolo.slug}>
                {ruolo.nome}
              </option>
            ))}
          </select>
        </label>
      )}
      <p>Chi ha questa carta? Clicca per assegnare.</p>
      {candidati.length === 0 ? (
        <p>Nessun giocatore disponibile da assegnare.</p>
      ) : (
        <ul>
          {candidati.map((g) => (
            <li key={g.id}>
              <button type="button" onClick={() => assegna(g.id)}>
                {g.nome}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AssegnaRuolo`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/AssegnaRuolo.jsx src/features/notte/AssegnaRuolo.test.jsx
git commit -m "feat: add AssegnaRuolo component for live role assignment"
```

---

### Task 4: Integrazione in `NightSequencer`

**Files:**
- Modify: `src/features/notte/NightSequencer.jsx`
- Modify: `src/features/notte/NightSequencer.test.jsx`

**Interfaces:**
- Modifica: `NightSequencer` accetta una nuova prop opzionale `quantita` (default `{}`). Monta `<AssegnaRuolo key={step.id} .../>` quando il passo ha ruoli ancora assegnabili.

**Nota importante**: `key={step.id}` sul componente `AssegnaRuolo` è essenziale — forza React a rimontarlo (stato interno azzerato) ogni volta che si cambia passo, evitando che una scelta di ruolo di un passo precedente resti "appiccicata" a quello successivo.

- [ ] **Step 1: Aggiungi i test falliti in `src/features/notte/NightSequencer.test.jsx`** (in coda al file)

```jsx
test('mostra AssegnaRuolo per un passo con un ruolo non ancora assegnato', () => {
  const giocatori = [{ id: '1', nome: 'Steve', ruoloSlug: undefined, vivo: true, condizioni: [] }]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['paladino']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ paladino: 1 }}
    />,
  )
  expect(screen.getByRole('button', { name: 'Steve' })).toBeInTheDocument()
})

test('assegnare il ruolo tramite AssegnaRuolo fa comparire subito la selezione bersaglio', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Steve', ruoloSlug: undefined, vivo: true, condizioni: [], poteriUsati: [] }]
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori[0] = { ...giocatori[0], ...patch }
  })
  const { rerender } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['paladino']}
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      quantita={{ paladino: 1 }}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Steve' }))
  rerender(
    <NightSequencerConNotte
      ruoliSelezionati={['paladino']}
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      quantita={{ paladino: 1 }}
    />,
  )

  expect(screen.getByRole('combobox')).toBeInTheDocument()
})

test('non mostra AssegnaRuolo per i passi di solo promemoria (potere-passivo)', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: undefined, vivo: true, condizioni: [] }]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['eremita']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ eremita: 1 }}
    />,
  )
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `AssegnaRuolo` non è ancora montato in `NightSequencer`

- [ ] **Step 3: Aggiorna `src/features/notte/NightSequencer.jsx`**

```jsx
import { passiNotte } from '../../data/nightSteps'
import { ruoliAssegnabili } from '../../data/assegnazione'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviLegami, risolviCortigiana } from '../../data/risoluzioneNotte'
import { AssegnaRuolo } from './AssegnaRuolo'

export function NightSequencer({
  ruoliSelezionati,
  giocatori,
  aggiornaGiocatore,
  quantita = {},
  round,
  stepIndex,
  avanti,
  indietro,
  nuovaNotte,
}) {
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

  const ruoliPendenti =
    step.ruoli && step.assegnabile !== false ? ruoliAssegnabili(step.ruoli, giocatori, quantita) : []

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

      {ruoliPendenti.length > 0 && (
        <AssegnaRuolo key={step.id} ruoli={ruoliPendenti} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />
      )}

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

      {mostraAzione && (
        <azione.Componente giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={round} {...azione.props} />
      )}

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

- [ ] **Step 4: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto, inclusi quelli esistenti di `NightSequencer` (che non passano `quantita` e continuano a funzionare grazie al default `{}`)

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/NightSequencer.jsx src/features/notte/NightSequencer.test.jsx
git commit -m "feat: wire live role assignment into NightSequencer"
```

---

### Task 5: Integrazione in App e verifica finale

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `NightSequencer` aggiornato (Task 4), `quantita` (già disponibile da `useMazzo`).

- [ ] **Step 1: Aggiorna `src/App.jsx`**

Nel blocco `<NightSequencer ...>`, aggiungi la prop `quantita`:

```jsx
{tab === 'notte' && (
  <NightSequencer
    ruoliSelezionati={ruoliInMazzo.map((r) => r.slug)}
    giocatori={giocatori}
    aggiornaGiocatore={aggiornaGiocatore}
    quantita={quantita}
    round={notte.round}
    stepIndex={notte.stepIndex}
    avanti={notte.avanti}
    indietro={notte.indietro}
    nuovaNotte={notte.nuovaNotte}
  />
)}
```

- [ ] **Step 2: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 3: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: pass mazzo quantities into NightSequencer for live assignment"
```

---

## Fuori scope per questo piano

Annunci d'alba derivati (Pastore, Ambasciatore), voto ed esito nel flusso unico, home e macchina a stati, popup log/impostazioni, redesign visivo — restano i prossimi sotto-progetti concordati.

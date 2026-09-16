# Log Partita (7) e Addolorata (completamento 5c) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un quinto tab "Registro" con la cronologia degli eventi di partita (morti, condizioni, cambi di ruolo), derivata automaticamente dallo stato esistente senza alcun nuovo input del narratore. Completare il piano 5c automatizzando Addolorata, ora possibile perché il passo 6 (rogo) fornisce il dato che le manca: chi è stato mandato al rogo e quando.

**Architecture:** Un hook `useLog(giocatori, round)` confronta lo stato dei giocatori a ogni render con quello del render precedente (tramite un `ref`) e genera automaticamente le voci di cronologia per le differenze rilevanti (morte, resurrezione, condizione ottenuta/persa, cambio di ruolo) — nessuna delle azioni esistenti viene modificata per "scrivere" nel log, il log si limita a osservare lo stato che già esiste. Per permettere questo (e per taggare correttamente il rogo con la notte in cui avviene, necessario ad Addolorata), `useNotte` viene sollevato in `App` con lo stesso pattern già usato per `usePartita` — evitando la stessa "doppia istanza di hook" già incontrata due volte nei piani precedenti.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- Il log è puramente derivato: nessun input nuovo del narratore, nessuna modifica alle azioni esistenti (Azioni notte, Votazione, ecc.) per "registrare" eventi — solo osservazione passiva dello stato.
- Rogo e colpo ora si distinguono esplicitamente: `causaMorte: 'rogo'` (con `mortoNotte: <round>` per Addolorata) oppure `causaMorte: 'colpo'`, invece del generico `vivo: false` non taggato usato nel piano 6.
- **Assunzione della sequenza di gioco**: si assume che il narratore prema "Notte successiva" (che porta il round alla notte in arrivo) prima di passare alla scheda Giorno per gestire voto/rogo di quella giornata — coerente con come "Notte successiva" già risolve protetto/inibito/legami "all'alba". Se il narratore usasse le schede in un ordine diverso, il controllo "vittima del rogo di questa notte" di Addolorata potrebbe non allinearsi; è un'assunzione documentata, non un bug bloccante.
- Addolorata: se il potere è già stato usato o non c'è una vittima del rogo taggata con la notte corrente, il passo resta informativo (nessun crash).

---

### Task 1: Solleva `useNotte` in App, adatta `NightSequencer` a riceverlo via props

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/features/notte/NightSequencer.jsx`
- Modify: `src/features/notte/NightSequencer.test.jsx`

**Interfaces:**
- Modifica: `NightSequencer` passa da chiamare `useNotte()` internamente a ricevere `{ round, stepIndex, avanti, indietro, nuovaNotte }` come props (stessa forma già esposta da `useNotte`).

- [ ] **Step 1: Aggiorna `src/features/notte/NightSequencer.test.jsx`** — sostituisci l'intero file: introduce un piccolo wrapper che chiama il vero `useNotte()` e lo passa a `NightSequencer`, così tutte le asserzioni esistenti restano identiche

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NightSequencer } from './NightSequencer'
import { useNotte } from '../../state/useNotte'

function NightSequencerConNotte(props) {
  const notte = useNotte()
  return <NightSequencer {...props} {...notte} />
}

beforeEach(() => {
  localStorage.clear()
})

test('senza ruoli con azione notturna mostra un messaggio', () => {
  render(<NightSequencerConNotte ruoliSelezionati={['villico']} giocatori={[]} aggiornaGiocatore={() => {}} />)
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('mostra il primo passo e i giocatori assegnati a quel ruolo', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()
  expect(screen.getByText('Sara')).toBeInTheDocument()
})

test('il pulsante Avanti passa al passo successivo', async () => {
  const user = userEvent.setup()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test('sull\'ultimo passo il pulsante diventa "Notte successiva" e fa ripartire dal primo passo con la notte incrementata', async () => {
  const user = userEvent.setup()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

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
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('combobox')).toBeInTheDocument()
})

test('non mostra la selezione bersaglio se il titolare del ruolo è morto', () => {
  const giocatori = [{ id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: false, condizioni: [], note: '', poteriUsati: [] }]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('non mostra alcuna selezione bersaglio per ruoli senza automazione (5c)', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('"Notte successiva" rimuove le condizioni protetto e inibito da tutti i giocatori', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto', 'unto'], note: '' }]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['unto'] })
})

test('"Notte successiva" applica le conseguenze dei legami (apprendista eredita il ruolo del maestro)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', legame: null })
})

test("mostra la selezione bersaglio per l'Apprendista alla prima notte", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['apprendista']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('combobox')).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `NightSequencer` chiama ancora `useNotte()` internamente, quindi con lo stesso `localStorage` condiviso il wrapper e il componente avrebbero due istanze divergenti (i test di navigazione falliscono)

- [ ] **Step 3: Aggiorna `src/features/notte/NightSequencer.jsx`**

```jsx
import { passiNotte } from '../../data/nightSteps'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviLegami, risolviCortigiana } from '../../data/risoluzioneNotte'

export function NightSequencer({ ruoliSelezionati, giocatori, aggiornaGiocatore, round, stepIndex, avanti, indietro, nuovaNotte }) {
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

- [ ] **Step 4: Aggiorna `src/App.jsx` per sollevare `useNotte` e passarlo a `NightSequencer`**

```jsx
import { useState } from 'react'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { GiornoPanel } from './features/giorno/GiornoPanel'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'
import { useVotazione } from './state/useVotazione'
import { useNotte } from './state/useNotte'

export default function App() {
  const [tab, setTab] = useState('mazzo')
  const { numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore } = usePartita()
  const { voti, incrementaVoto, decrementaVoto, ricominciaVotazione } = useVotazione()
  const notte = useNotte()

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
        <NightSequencer
          ruoliSelezionati={ruoliSelezionati}
          giocatori={giocatori}
          aggiornaGiocatore={aggiornaGiocatore}
          round={notte.round}
          stepIndex={notte.stepIndex}
          avanti={notte.avanti}
          indietro={notte.indietro}
          nuovaNotte={notte.nuovaNotte}
        />
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

(Il tab "Giorno" riceverà anche `round` nel Task 2; il tab "Registro" verrà aggiunto nel Task 6.)

- [ ] **Step 5: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test esistenti

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/features/notte/NightSequencer.jsx src/features/notte/NightSequencer.test.jsx
git commit -m "refactor: lift useNotte to App so its round is shared with GiornoPanel and the log"
```

---

### Task 2: Distingui rogo e colpo in `GiornoPanel`

**Files:**
- Modify: `src/features/giorno/GiornoPanel.jsx`
- Modify: `src/features/giorno/GiornoPanel.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Modifica: `GiornoPanel` accetta una nuova prop `round`. La morte per rogo diventa `{ vivo: false, causaMorte: 'rogo', mortoNotte: round }`; la morte sul colpo diventa `{ vivo: false, causaMorte: 'colpo' }`.

- [ ] **Step 1: Aggiorna `src/features/giorno/GiornoPanel.test.jsx`**

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
    round: 3,
    ...overrides,
  }
  render(<GiornoPanel {...props} />)
  return props
}

test('dichiarare una morte sul colpo chiama aggiornaGiocatore con causaMorte:colpo', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'colpo' })
})

test('dichiarare morte sul rogo chiama aggiornaGiocatore con causaMorte:rogo e la notte corrente', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup({ voti: { 1: 3 } })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'rogo', mortoNotte: 3 })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- GiornoPanel`
Expected: FAIL — riceve ancora `{ vivo: false }` per entrambe le dichiarazioni

- [ ] **Step 3: Aggiorna `src/features/giorno/GiornoPanel.jsx`**

```jsx
import { Votazione } from './Votazione'
import { MorteSulColpo } from './MorteSulColpo'

export function GiornoPanel({ giocatori, voti, incrementaVoto, decrementaVoto, ricominciaVotazione, aggiornaGiocatore, round }) {
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
        incrementaVoto={incrementaVoto}
        decrementaVoto={decrementaVoto}
        ricominciaVotazione={ricominciaVotazione}
        onRogo={dichiaraRogo}
      />
      <MorteSulColpo giocatori={giocatori} onDichiara={dichiaraColpo} />
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- GiornoPanel`
Expected: PASS — 2 test

- [ ] **Step 5: Aggiorna `src/App.jsx` per passare `round` a `GiornoPanel`**

Nel blocco `{tab === 'giorno' && (...)}`, aggiungi la prop:

```jsx
{tab === 'giorno' && (
  <GiornoPanel
    giocatori={giocatori}
    voti={voti}
    incrementaVoto={incrementaVoto}
    decrementaVoto={decrementaVoto}
    ricominciaVotazione={ricominciaVotazione}
    aggiornaGiocatore={aggiornaGiocatore}
    round={notte.round}
  />
)}
```

- [ ] **Step 6: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 7: Commit**

```bash
git add src/features/giorno/GiornoPanel.jsx src/features/giorno/GiornoPanel.test.jsx src/App.jsx
git commit -m "feat: distinguish causaMorte rogo/colpo and tag rogo with the current night"
```

---

### Task 3: `rilevaEventi` — diff puro tra due stati di giocatori

**Files:**
- Create: `src/data/log.js`
- Create: `src/data/log.test.js`

**Interfaces:**
- Produces: `rilevaEventi(precedenti, correnti, round) => Array<{ round: number, messaggio: string }>`.

- [ ] **Step 1: Scrivi il test fallente `src/data/log.test.js`**

```js
import { rilevaEventi } from './log'

test('rileva una morte e ne include la causa se nota', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico', causaMorte: 'rogo' }]
  expect(rilevaEventi(precedenti, correnti, 2)).toEqual([{ round: 2, messaggio: 'Anna è morto/a al rogo' }])
})

test('rileva una morte senza causa nota', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(precedenti, correnti, 2)).toEqual([{ round: 2, messaggio: 'Anna è morto/a' }])
})

test('rileva una resurrezione', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(precedenti, correnti, 3)).toEqual([{ round: 3, messaggio: 'Anna è tornato/a in vita' }])
})

test('rileva una condizione ottenuta e una persa', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['inibito'], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['unto'], ruoloSlug: 'villico' }]
  const eventi = rilevaEventi(precedenti, correnti, 1)
  expect(eventi).toContainEqual({ round: 1, messaggio: 'Anna ha ottenuto la condizione "unto"' })
  expect(eventi).toContainEqual({ round: 1, messaggio: 'Anna ha perso la condizione "inibito"' })
})

test('rileva un cambio di ruolo', () => {
  const precedenti = [{ id: '1', nome: 'Sara', vivo: true, condizioni: [], ruoloSlug: 'apprendista' }]
  const correnti = [{ id: '1', nome: 'Sara', vivo: true, condizioni: [], ruoloSlug: 'veggente' }]
  expect(rilevaEventi(precedenti, correnti, 2)).toEqual([{ round: 2, messaggio: 'Sara ha assunto il ruolo di veggente' }])
})

test('nessun evento se nulla è cambiato', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(giocatori, giocatori, 1)).toEqual([])
})

test('ignora i giocatori nuovi (non presenti prima)', () => {
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi([], correnti, 1)).toEqual([])
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/log`
Expected: FAIL — `Cannot find module './log'`

- [ ] **Step 3: Scrivi `src/data/log.js`**

```js
const ETICHETTA_CAUSA = { notte: ' di notte', rogo: ' al rogo', colpo: ' sul colpo' }

export function rilevaEventi(precedenti, correnti, round) {
  const eventi = []
  const mappaPrecedenti = new Map(precedenti.map((g) => [g.id, g]))

  for (const giocatore of correnti) {
    const prima = mappaPrecedenti.get(giocatore.id)
    if (!prima) continue

    if (prima.vivo && !giocatore.vivo) {
      eventi.push({ round, messaggio: `${giocatore.nome} è morto/a${ETICHETTA_CAUSA[giocatore.causaMorte] ?? ''}` })
    }
    if (!prima.vivo && giocatore.vivo) {
      eventi.push({ round, messaggio: `${giocatore.nome} è tornato/a in vita` })
    }

    const condizioniPrima = prima.condizioni ?? []
    const condizioniDopo = giocatore.condizioni ?? []
    for (const condizione of condizioniDopo) {
      if (!condizioniPrima.includes(condizione)) {
        eventi.push({ round, messaggio: `${giocatore.nome} ha ottenuto la condizione "${condizione}"` })
      }
    }
    for (const condizione of condizioniPrima) {
      if (!condizioniDopo.includes(condizione)) {
        eventi.push({ round, messaggio: `${giocatore.nome} ha perso la condizione "${condizione}"` })
      }
    }

    if (prima.ruoloSlug !== giocatore.ruoloSlug) {
      eventi.push({ round, messaggio: `${giocatore.nome} ha assunto il ruolo di ${giocatore.ruoloSlug}` })
    }
  }

  return eventi
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/log`
Expected: PASS — 7 test

- [ ] **Step 5: Commit**

```bash
git add src/data/log.js src/data/log.test.js
git commit -m "feat: add rilevaEventi pure diff function for the match log"
```

---

### Task 4: Hook `useLog`

**Files:**
- Create: `src/state/useLog.js`
- Create: `src/state/useLog.test.js`

**Interfaces:**
- Consumes: `rilevaEventi` (Task 3).
- Produces: `useLog(giocatori, round) => Array<{ round, messaggio }>`.

- [ ] **Step 1: Scrivi il test fallente `src/state/useLog.test.js`**

```js
import { renderHook } from '@testing-library/react'
import { useLog } from './useLog'

beforeEach(() => {
  localStorage.clear()
})

test('nessun evento al primo montaggio', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 1))
  expect(result.current).toEqual([])
})

test('rileva un cambiamento tra due render successivi', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })

  const morto = [{ ...vivo[0], vivo: false }]
  rerender({ giocatori: morto, round: 1 })

  expect(result.current).toEqual([{ round: 1, messaggio: 'Anna è morto/a' }])
})

test('lo stato persiste in localStorage tra due montaggi', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { rerender, unmount } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })
  const morto = [{ ...vivo[0], vivo: false }]
  rerender({ giocatori: morto, round: 1 })
  unmount()

  const { result: result2 } = renderHook(() => useLog(morto, 1))
  expect(result2.current).toEqual([{ round: 1, messaggio: 'Anna è morto/a' }])
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useLog`
Expected: FAIL — `Cannot find module './useLog'`

- [ ] **Step 3: Scrivi `src/state/useLog.js`**

```js
import { useEffect, useRef, useState } from 'react'
import { rilevaEventi } from '../data/log'

const STORAGE_KEY = 'meltable-wolves-log'

function loadEventi() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useLog(giocatori, round) {
  const [eventi, setEventi] = useState(loadEventi)
  const precedentiRef = useRef(giocatori)

  useEffect(() => {
    const nuoviEventi = rilevaEventi(precedentiRef.current, giocatori, round)
    if (nuoviEventi.length > 0) {
      setEventi((prev) => [...prev, ...nuoviEventi])
    }
    precedentiRef.current = giocatori
  }, [giocatori, round])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventi))
  }, [eventi])

  return eventi
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useLog`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/state/useLog.js src/state/useLog.test.js
git commit -m "feat: add useLog hook deriving match history from state changes"
```

---

### Task 5: Componente `LogPartita`

**Files:**
- Create: `src/features/log/LogPartita.jsx`
- Create: `src/features/log/LogPartita.test.jsx`

**Interfaces:**
- Produces: `LogPartita({ eventi: Array<{ round, messaggio }> })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/log/LogPartita.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import { LogPartita } from './LogPartita'

test('mostra un messaggio se non ci sono eventi', () => {
  render(<LogPartita eventi={[]} />)
  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})

test('mostra gli eventi con il numero di notte', () => {
  render(<LogPartita eventi={[{ round: 2, messaggio: 'Anna è morto/a' }]} />)
  expect(screen.getByText('Notte 2: Anna è morto/a')).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- LogPartita`
Expected: FAIL — `Cannot find module './LogPartita'`

- [ ] **Step 3: Scrivi `src/features/log/LogPartita.jsx`**

```jsx
export function LogPartita({ eventi }) {
  if (eventi.length === 0) {
    return <p>Nessun evento registrato finora.</p>
  }

  return (
    <section className="log-partita">
      <h2>Registro partita</h2>
      <ul>
        {eventi.map((evento, indice) => (
          <li key={indice}>
            Notte {evento.round}: {evento.messaggio}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- LogPartita`
Expected: PASS — 2 test

- [ ] **Step 5: Commit**

```bash
git add src/features/log/LogPartita.jsx src/features/log/LogPartita.test.jsx
git commit -m "feat: add LogPartita read-only history view"
```

---

### Task 6: Quinto tab "Registro" in App

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `useLog` (Task 4), `LogPartita` (Task 5).

- [ ] **Step 1: Aggiungi il test fallito in `src/App.test.jsx`** (in coda al file)

```jsx
test('scheda Registro mostra un messaggio se non ci sono eventi', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Registro' }))

  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- App.test`
Expected: FAIL — non esiste ancora un bottone "Registro"

- [ ] **Step 3: Aggiorna `src/App.jsx`**

```jsx
import { useState } from 'react'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { GiornoPanel } from './features/giorno/GiornoPanel'
import { LogPartita } from './features/log/LogPartita'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'
import { useVotazione } from './state/useVotazione'
import { useNotte } from './state/useNotte'
import { useLog } from './state/useLog'

export default function App() {
  const [tab, setTab] = useState('mazzo')
  const { numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore } = usePartita()
  const { voti, incrementaVoto, decrementaVoto, ricominciaVotazione } = useVotazione()
  const notte = useNotte()
  const eventi = useLog(giocatori, notte.round)

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
        <button type="button" aria-pressed={tab === 'registro'} onClick={() => setTab('registro')}>
          Registro
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
        <NightSequencer
          ruoliSelezionati={ruoliSelezionati}
          giocatori={giocatori}
          aggiornaGiocatore={aggiornaGiocatore}
          round={notte.round}
          stepIndex={notte.stepIndex}
          avanti={notte.avanti}
          indietro={notte.indietro}
          nuovaNotte={notte.nuovaNotte}
        />
      )}
      {tab === 'giorno' && (
        <GiornoPanel
          giocatori={giocatori}
          voti={voti}
          incrementaVoto={incrementaVoto}
          decrementaVoto={decrementaVoto}
          ricominciaVotazione={ricominciaVotazione}
          aggiornaGiocatore={aggiornaGiocatore}
          round={notte.round}
        />
      )}
      {tab === 'registro' && <LogPartita eventi={eventi} />}
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
git commit -m "feat: wire LogPartita into a fifth App tab"
```

---

### Task 7: `AzioneAddolorata`

**Files:**
- Create: `src/features/notte/azioni/AzioneAddolorata.jsx`
- Create: `src/features/notte/azioni/AzioneAddolorata.test.jsx`

**Interfaces:**
- Produces: `AzioneAddolorata({ giocatori, aggiornaGiocatore, round })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneAddolorata.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneAddolorata } from './AzioneAddolorata'

test('propone lo scambio con la vittima del rogo della notte corrente', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Scambia' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', poteriUsati: ['addolorata-scambio'] })
})

test('mostra un messaggio se nessuno è morto al rogo questa notte', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] }]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)
  expect(screen.getByText(/nessuna vittima al rogo/i)).toBeInTheDocument()
})

test('mostra un messaggio se il potere è già stato usato', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: ['addolorata-scambio'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)
  expect(screen.getByText(/già utilizzato/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneAddolorata`
Expected: FAIL — `Cannot find module './AzioneAddolorata'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneAddolorata.jsx`**

```jsx
export function AzioneAddolorata({ giocatori, aggiornaGiocatore, round }) {
  const addolorata = giocatori.find((g) => g.ruoloSlug === 'addolorata')
  const poteriUsati = addolorata?.poteriUsati ?? []
  const giaUsato = poteriUsati.includes('addolorata-scambio')
  const vittima = giocatori.find((g) => g.causaMorte === 'rogo' && g.mortoNotte === round)

  if (giaUsato) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  if (!vittima) {
    return <p>Nessuna vittima al rogo questa notte: nessuna azione disponibile.</p>
  }

  function scambia() {
    if (!addolorata) return
    aggiornaGiocatore(addolorata.id, {
      ruoloSlug: vittima.ruoloSlug,
      poteriUsati: [...poteriUsati, 'addolorata-scambio'],
    })
  }

  return (
    <div className="azione-addolorata">
      <p>Scambiare il ruolo con quello di {vittima.nome} (vittima del rogo)?</p>
      <button type="button" onClick={scambia}>
        Scambia
      </button>
      <button type="button" onClick={() => {}}>
        Salta
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneAddolorata`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneAddolorata.jsx src/features/notte/azioni/AzioneAddolorata.test.jsx
git commit -m "feat: add AzioneAddolorata role-swap component"
```

---

### Task 8: Integra Addolorata nel lookup e verifica finale

**Files:**
- Modify: `src/features/notte/azioni/index.js`
- Modify: `src/features/notte/NightSequencer.test.jsx`

**Interfaces:**
- Modifica: `AZIONI_NOTTURNE` aggiunge la voce `addolorata`.

- [ ] **Step 1: Aggiungi il test fallito in `src/features/notte/NightSequencer.test.jsx`** (in coda al file)

```jsx
test("mostra lo scambio per Addolorata quando c'è una vittima al rogo della notte corrente", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 1 },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['addolorata']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('button', { name: 'Scambia' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `addolorata` non ha ancora un'azione mappata

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
import { AzioneAddolorata } from './AzioneAddolorata'

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
  addolorata: { Componente: AzioneAddolorata, props: {} },
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
git add src/features/notte/azioni/index.js src/features/notte/NightSequencer.test.jsx
git commit -m "feat: wire Addolorata into the sequencer, completing plan 5c"
```

---

## Fuori scope per questo piano

Nessuno — questo piano chiude sia il passo 7 (log partita) sia l'ultimo ruolo rimasto del piano 5c (Addolorata). La roadmap dell'MVP originale (passi 1-7) è così completa.

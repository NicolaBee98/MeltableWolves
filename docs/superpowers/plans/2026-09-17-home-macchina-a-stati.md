# Home e Macchina a Stati Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire la barra a tab (Mazzo/Giocatori/Notte/Giorno/Registro, tutti sempre raggiungibili indipendentemente) con un vero flusso a stati: Home (con "Nuova Partita", più "Regolamento" e "Mazzo" come placeholder disabilitati, e un'icona impostazioni placeholder) → composizione mazzo → giocatori → notte → **alba** (nuova schermata: chi è morto stanotte + annunci derivati) → voto → esito → di nuovo notte. Sesto sotto-progetto della revisione UX.

**Architecture:** Un nuovo `faseApp` (persistito in `localStorage` come le altre fasi di partita) guida quale schermata `App` mostra: `'home' | 'mazzo' | 'giocatori' | 'notte' | 'alba' | 'giorno'`. Nessuna macchina a stati esterna (XState ecc.): un semplice `useState`/hook dedicato basta, seguendo lo stesso pattern di `useNotte`/`useVotazione`. `NightSequencer` guadagna un'unica nuova callback `onNotteConclusa()` (nessun nuovo parametro: gli annunci e le morti si ricalcolano a partire da `giocatori`, non servono nuovi campi di stato transitori). La schermata Alba è una funzione pura del round appena concluso: `round = notte.round - 1` perché `nuovaNotte()` (già esistente, invariato) incrementa il round PRIMA che Alba venga mostrata — esattamente come già succede oggi passando alla schermata Giorno, quindi nessuna assunzione temporale cambia per Addolorata & co. Per individuare "chi è morto stanotte" senza un nuovo meccanismo di diff, i decessi notturni guadagnano lo stesso tag `mortoNotte: round` già usato per il rogo (Task 1): `giocatori.filter(g => !g.vivo && g.mortoNotte === round)`. Il Registro resta raggiungibile con un semplice pulsante "Registro" sempre visibile durante la partita che mostra `LogPartita` al posto dello schermo corrente — un vero popup con tab "impostazioni"/"log" arriva con il sotto-progetto 7, qui basta non perdere l'accesso alla funzione già esistente.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- Il timing dell'incremento di `round` (`nuovaNotte()`, chiamato dentro `NightSequencer.passaAllaNotteSuccessiva` prima ancora di questo piano) NON cambia: resta cruciale che resti invariato, perché `AzioneAddolorata` già confronta `mortoNotte === round` assumendo che il round sia già stato incrementato quando si arriva al Giorno corrispondente. Questo piano aggiunge solo una tappa intermedia (Alba) fra Notte e Giorno, senza toccare quella logica.
- `Home`, `AlbaPanel` e la nuova fase `faseApp` non introducono nessuna nuova persistenza multi-partita: restano nello stesso `localStorage` "sopravvivi al refresh" di tutto il resto.
- "Regolamento", "Mazzo" (pulsante Home) e l'icona impostazioni restano placeholder disabilitati: nessuna funzionalità dietro, solo il posto riservato in UI.

---

### Task 1: `uccidiPatch` tagga `mortoNotte`

**Files:**
- Modify: `src/data/effettiNotte.js`
- Modify: `src/data/effettiNotte.test.js`
- Modify: `src/features/notte/azioni/AzioneBrancoLupi.jsx`
- Modify: `src/features/notte/azioni/AzioneBrancoLupi.test.jsx`
- Modify: `src/features/notte/azioni/AzioneChupacabra.jsx`
- Modify: `src/features/notte/azioni/AzioneChupacabra.test.jsx`
- Modify: `src/features/notte/azioni/AzioneStrega.jsx`
- Modify: `src/features/notte/azioni/AzioneStrega.test.jsx`

**Interfaces:**
- Modifica: `uccidiPatch(giocatore, round)` (nuovo secondo parametro) ritorna `{ vivo: false, causaMorte: 'notte', mortoNotte: round }` invece di `{ vivo: false, causaMorte: 'notte' }`.
- I tre componenti che chiamano `uccidiPatch` ricevono già `round` come prop (passata da `NightSequencer` a ogni `azione.Componente`): basta destrutturarla e inoltrarla.

- [ ] **Step 1: Aggiorna `src/data/effettiNotte.test.js`**

Sostituisci i due test di `uccidiPatch` con:

```js
test('uccidiPatch ritorna vivo:false, causaMorte:notte e la notte corrente se il giocatore non è protetto', () => {
  expect(uccidiPatch({ condizioni: [] }, 3)).toEqual({ vivo: false, causaMorte: 'notte', mortoNotte: 3 })
})

test('uccidiPatch ritorna null se il giocatore è protetto', () => {
  expect(uccidiPatch({ condizioni: ['protetto'] }, 3)).toBeNull()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/effettiNotte`
Expected: FAIL — il valore ritornato non contiene ancora `mortoNotte`

- [ ] **Step 3: Aggiorna `uccidiPatch` in `src/data/effettiNotte.js`**

```js
export function uccidiPatch(giocatore, round) {
  if (giocatore.condizioni.includes('protetto')) return null
  return { vivo: false, causaMorte: 'notte', mortoNotte: round }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/effettiNotte`
Expected: PASS — 6 test

- [ ] **Step 5: Aggiorna `src/features/notte/azioni/AzioneBrancoLupi.jsx`** — aggiungi `round` alla firma e passalo a `uccidiPatch`

```jsx
export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore, round }) {
  const vivi = giocatori.filter((g) => g.vivo)

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const patch = uccidiPatch(target, round)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta="Il branco sbrana" />
}
```

- [ ] **Step 6: Aggiorna `src/features/notte/azioni/AzioneBrancoLupi.test.jsx`** — passa `round={2}` nel render e aggiorna l'assert

```jsx
test('conferma uccide il bersaglio scelto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' }]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'notte', mortoNotte: 2 })
})
```

(il secondo test, "non uccide un bersaglio protetto", resta invariato: può restare senza `round` o con `round={2}`, il risultato atteso è comunque nessuna chiamata)

- [ ] **Step 7: Aggiorna `src/features/notte/azioni/AzioneChupacabra.jsx`** — aggiungi `round` alla firma e passalo a `uccidiPatch` (in entrambi i punti in cui viene chiamato)

```jsx
export function AzioneChupacabra({ giocatori, aggiornaGiocatore, round }) {
  const vivi = giocatori.filter((g) => g.vivo)
  const nessunLupoVivo = !vivi.some((g) => fazioneDi(g) === 'lupi')

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const puoUccidere = fazioneDi(target) === 'lupi' || nessunLupoVivo
    if (!puoUccidere) return
    const patch = uccidiPatch(target, round)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta="Il Chupacabra caccia" />
}
```

- [ ] **Step 8: Aggiorna `src/features/notte/azioni/AzioneChupacabra.test.jsx`** — passa `round={2}` nei render dei due test che si aspettano un'uccisione e aggiorna gli assert a `{ vivo: false, causaMorte: 'notte', mortoNotte: 2 }`

- [ ] **Step 9: Aggiorna `src/features/notte/azioni/AzioneStrega.jsx`** — aggiungi `round` alla firma e passalo a `uccidiPatch` in `usaPozioneMortale`

```jsx
export function AzioneStrega({ giocatori, aggiornaGiocatore, round }) {
  // ... invariato ...

  function usaPozioneMortale(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !strega) return
    const patch = uccidiPatch(target, round)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriUsati, 'strega-pozione-mortale'] })
  }

  // ... resto invariato (usaPozioneVitale, render) ...
}
```

- [ ] **Step 10: Aggiorna `src/features/notte/azioni/AzioneStrega.test.jsx`** — nel test "la pozione mortale uccide il bersaglio...", passa `round={2}` nel render e aggiorna l'assert a `{ vivo: false, causaMorte: 'notte', mortoNotte: 2 }`

- [ ] **Step 11: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 12: Commit**

```bash
git add src/data/effettiNotte.js src/data/effettiNotte.test.js src/features/notte/azioni/AzioneBrancoLupi.jsx src/features/notte/azioni/AzioneBrancoLupi.test.jsx src/features/notte/azioni/AzioneChupacabra.jsx src/features/notte/azioni/AzioneChupacabra.test.jsx src/features/notte/azioni/AzioneStrega.jsx src/features/notte/azioni/AzioneStrega.test.jsx
git commit -m "feat: tag night kills with mortoNotte, mirroring the rogo convention"
```

---

### Task 2: `Home`

**Files:**
- Create: `src/features/home/Home.jsx`
- Create: `src/features/home/Home.test.jsx`

**Interfaces:**
- Produces: `Home({ onNuovaPartita })`. Tre pulsanti ("Nuova Partita" attivo, "Regolamento" e "Mazzo" disabilitati) più un pulsante icona "Impostazioni" disabilitato.

- [ ] **Step 1: Scrivi il test fallente `src/features/home/Home.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Home } from './Home'

test('mostra i tre pulsanti principali e l\'icona impostazioni', () => {
  render(<Home onNuovaPartita={() => {}} />)
  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Regolamento' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mazzo' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Impostazioni' })).toBeInTheDocument()
})

test('Regolamento, Mazzo e Impostazioni sono disabilitati (non ancora implementati)', () => {
  render(<Home onNuovaPartita={() => {}} />)
  expect(screen.getByRole('button', { name: 'Regolamento' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Mazzo' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Impostazioni' })).toBeDisabled()
})

test('cliccare Nuova Partita chiama onNuovaPartita', async () => {
  const user = userEvent.setup()
  const onNuovaPartita = vi.fn()
  render(<Home onNuovaPartita={onNuovaPartita} />)
  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  expect(onNuovaPartita).toHaveBeenCalled()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- Home`
Expected: FAIL — `Cannot find module './Home'`

- [ ] **Step 3: Scrivi `src/features/home/Home.jsx`**

```jsx
export function Home({ onNuovaPartita }) {
  return (
    <section className="home">
      <button type="button" onClick={onNuovaPartita}>
        Nuova Partita
      </button>
      <button type="button" disabled title="Prossimamente">
        Regolamento
      </button>
      <button type="button" disabled title="Prossimamente">
        Mazzo
      </button>
      <button type="button" className="home__impostazioni" disabled title="Prossimamente" aria-label="Impostazioni">
        ⚙️
      </button>
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- Home`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/features/home/Home.jsx src/features/home/Home.test.jsx
git commit -m "feat: add Home screen with Nuova Partita and placeholder buttons"
```

---

### Task 3: `AlbaPanel`

**Files:**
- Create: `src/features/alba/AlbaPanel.jsx`
- Create: `src/features/alba/AlbaPanel.test.jsx`

**Interfaces:**
- Consumes: `annunciAlba` (`src/data/alba.js`, già esistente).
- Produces: `AlbaPanel({ giocatori, round, onVaiAlVoto })`. Mostra i giocatori con `!vivo && mortoNotte === round`, poi gli annunci di `annunciAlba(giocatori, round)`, poi il pulsante "Vai al voto".

- [ ] **Step 1: Scrivi il test fallente `src/features/alba/AlbaPanel.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlbaPanel } from './AlbaPanel'

test('mostra i giocatori morti nella notte appena conclusa, non quelli di notti precedenti', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, mortoNotte: 2, ruoloSlug: 'villico' },
    { id: '2', nome: 'Marco', vivo: false, mortoNotte: 1, ruoloSlug: 'villico' },
    { id: '3', nome: 'Luca', vivo: true, ruoloSlug: 'villico' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} onVaiAlVoto={() => {}} />)

  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.queryByText('Marco')).not.toBeInTheDocument()
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})

test('mostra un messaggio se nessuno è morto questa notte', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' }]
  render(<AlbaPanel giocatori={giocatori} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.getByText(/nessuno è morto questa notte/i)).toBeInTheDocument()
})

test('mostra gli annunci derivati (es. belati del pastore)', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'pastore' },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'lupo-mannaro' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.getByText('Si sentono dei belati.')).toBeInTheDocument()
})

test('il pulsante Vai al voto chiama onVaiAlVoto', async () => {
  const user = userEvent.setup()
  const onVaiAlVoto = vi.fn()
  render(<AlbaPanel giocatori={[]} round={1} onVaiAlVoto={onVaiAlVoto} />)
  await user.click(screen.getByRole('button', { name: 'Vai al voto' }))
  expect(onVaiAlVoto).toHaveBeenCalled()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AlbaPanel`
Expected: FAIL — `Cannot find module './AlbaPanel'`

- [ ] **Step 3: Scrivi `src/features/alba/AlbaPanel.jsx`**

```jsx
import { annunciAlba } from '../../data/alba'

export function AlbaPanel({ giocatori, round, onVaiAlVoto }) {
  const morti = giocatori.filter((g) => !g.vivo && g.mortoNotte === round)
  const annunci = annunciAlba(giocatori, round)

  return (
    <section className="alba-panel">
      <h2>Alba</h2>
      {morti.length === 0 ? (
        <p>Nessuno è morto questa notte.</p>
      ) : (
        <ul className="alba-panel__morti">
          {morti.map((g) => (
            <li key={g.id}>{g.nome}</li>
          ))}
        </ul>
      )}
      {annunci.length > 0 && (
        <ul className="alba-panel__annunci">
          {annunci.map((testo) => (
            <li key={testo}>{testo}</li>
          ))}
        </ul>
      )}
      <button type="button" onClick={onVaiAlVoto}>
        Vai al voto
      </button>
    </section>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AlbaPanel`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/features/alba/AlbaPanel.jsx src/features/alba/AlbaPanel.test.jsx
git commit -m "feat: add AlbaPanel dawn summary screen"
```

---

### Task 4: `NightSequencer` guadagna `onNotteConclusa`

**Files:**
- Modify: `src/features/notte/NightSequencer.jsx`
- Modify: `src/features/notte/NightSequencer.test.jsx`

**Interfaces:**
- Modifica: `NightSequencer` accetta una nuova prop `onNotteConclusa = () => {}`, chiamata (senza argomenti) dentro `passaAllaNotteSuccessiva`, subito prima di `nuovaNotte()`.

- [ ] **Step 1: Aggiungi il test fallito in coda a `src/features/notte/NightSequencer.test.jsx`**

```jsx
test('"Notte successiva" chiama onNotteConclusa', async () => {
  const user = userEvent.setup()
  const onNotteConclusa = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['mimo']}
      giocatori={[]}
      aggiornaGiocatore={() => {}}
      onNotteConclusa={onNotteConclusa}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(onNotteConclusa).toHaveBeenCalled()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `onNotteConclusa` non viene ancora chiamata

- [ ] **Step 3: Aggiorna `src/features/notte/NightSequencer.jsx`**

Aggiungi la prop (con default no-op) alla firma e la chiamata in `passaAllaNotteSuccessiva`:

```jsx
export function NightSequencer({
  ruoliSelezionati,
  giocatori,
  aggiornaGiocatore,
  quantita = {},
  registraEvento = () => {},
  onNotteConclusa = () => {},
  round,
  stepIndex,
  avanti,
  indietro,
  nuovaNotte,
}) {
  // ... invariato fino a passaAllaNotteSuccessiva ...

  function passaAllaNotteSuccessiva() {
    // ... invariato (pulizia condizioni, risoluzione legami/cortigiana) ...

    for (const messaggio of annunciAlba(giocatori, round)) {
      registraEvento(messaggio)
    }

    onNotteConclusa()
    nuovaNotte()
  }

  // ... resto invariato ...
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- NightSequencer`
Expected: PASS — 16 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/NightSequencer.jsx src/features/notte/NightSequencer.test.jsx
git commit -m "feat: NightSequencer calls onNotteConclusa when a night ends"
```

---

### Task 5: `Votazione`/`GiornoPanel` guadagnano "Prosegui alla notte"

**Files:**
- Modify: `src/features/giorno/Votazione.jsx`
- Modify: `src/features/giorno/Votazione.test.jsx`
- Modify: `src/features/giorno/GiornoPanel.jsx`
- Modify: `src/features/giorno/GiornoPanel.test.jsx`

**Interfaces:**
- Modifica: `Votazione` accetta una nuova prop `onProsegui`, con un pulsante "Prosegui alla notte" nella fase `'esito'` (subito dopo "Torna al voto", prima di `MorteImprovvisa` così l'icona resta l'ultima cosa in fondo). `GiornoPanel` inoltra `onProsegui` invariata.

- [ ] **Step 1: Aggiungi il test fallito in coda a `src/features/giorno/Votazione.test.jsx`** e aggiungi `onProsegui: vi.fn()` alle props di default in `setup()`

```jsx
test('in fase esito il pulsante Prosegui alla notte chiama onProsegui', async () => {
  const user = userEvent.setup()
  const { onProsegui } = setup({ voti: { 1: 2 }, fase: 'esito' })
  await user.click(screen.getByRole('button', { name: 'Prosegui alla notte' }))
  expect(onProsegui).toHaveBeenCalled()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- Votazione`
Expected: FAIL — il pulsante "Prosegui alla notte" non esiste ancora

- [ ] **Step 3: Aggiorna `src/features/giorno/Votazione.jsx`**

Aggiungi `onProsegui` alla firma e il pulsante nel blocco `fase === 'esito'`, fra "Torna al voto" e `<MorteImprovvisa .../>`:

```jsx
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
  onProsegui,
}) {
  // ... invariato fino al blocco fase === 'esito' ...

  if (fase === 'esito') {
    return (
      <section className="votazione votazione--esito">
        {/* ... vittima designata / spareggio, invariato ... */}
        <button type="button" onClick={tornaAlVoto}>
          Torna al voto
        </button>
        <button type="button" onClick={onProsegui}>
          Prosegui alla notte
        </button>
        <MorteImprovvisa giocatori={giocatori} onDichiara={onMorteImprovvisa} />
      </section>
    )
  }

  // ... resto invariato ...
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- Votazione`
Expected: PASS — 10 test

- [ ] **Step 5: Aggiorna `src/features/giorno/GiornoPanel.jsx`** — inoltra `onProsegui` a `Votazione`

```jsx
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
  onProsegui,
}) {
  // ... dichiaraRogo/dichiaraColpo invariati ...

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
        onProsegui={onProsegui}
      />
    </section>
  )
}
```

- [ ] **Step 6: Aggiungi il test fallito in coda a `src/features/giorno/GiornoPanel.test.jsx`** e aggiungi `onProsegui: vi.fn()` alle props di default in `setup()`

```jsx
test('il pulsante Prosegui alla notte chiama onProsegui', async () => {
  const user = userEvent.setup()
  const { onProsegui } = setup()
  await user.click(screen.getByRole('button', { name: 'Prosegui alla notte' }))
  expect(onProsegui).toHaveBeenCalled()
})
```

- [ ] **Step 7: Esegui i test e verifica che passino**

Run: `npm test -- GiornoPanel`
Expected: PASS — 3 test

- [ ] **Step 8: Commit**

```bash
git add src/features/giorno/Votazione.jsx src/features/giorno/Votazione.test.jsx src/features/giorno/GiornoPanel.jsx src/features/giorno/GiornoPanel.test.jsx
git commit -m "feat: add Prosegui alla notte button to close the day/night loop"
```

---

### Task 6: `useFaseApp` e riscrittura di `App.jsx` come macchina a stati

**Files:**
- Create: `src/state/useFaseApp.js`
- Create: `src/state/useFaseApp.test.js`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `Home` (Task 2), `AlbaPanel` (Task 3), `onNotteConclusa` (Task 4), `onProsegui` (Task 5).
- Produces: `useFaseApp()` ritorna `[faseApp, setFaseApp]` con `faseApp` iniziale `'home'`, persistito in `localStorage` come stringa semplice.

Questo task dipende da tutti i precedenti (1-5) ed è l'integrazione finale: va eseguito per ultimo, non in parallelo.

- [ ] **Step 1: Scrivi il test fallente `src/state/useFaseApp.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { useFaseApp } from './useFaseApp'

beforeEach(() => {
  localStorage.clear()
})

test('fase iniziale è home', () => {
  const { result } = renderHook(() => useFaseApp())
  expect(result.current[0]).toBe('home')
})

test('setFaseApp aggiorna la fase', () => {
  const { result } = renderHook(() => useFaseApp())
  act(() => {
    result.current[1]('notte')
  })
  expect(result.current[0]).toBe('notte')
})

test('la fase persiste in localStorage tra due montaggi', () => {
  const { result, unmount } = renderHook(() => useFaseApp())
  act(() => {
    result.current[1]('giorno')
  })
  unmount()

  const { result: result2 } = renderHook(() => useFaseApp())
  expect(result2.current[0]).toBe('giorno')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useFaseApp`
Expected: FAIL — `Cannot find module './useFaseApp'`

- [ ] **Step 3: Scrivi `src/state/useFaseApp.js`**

```js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meltable-wolves-fase-app'
const DEFAULT_FASE = 'home'

function loadFase() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_FASE
  } catch {
    return DEFAULT_FASE
  }
}

export function useFaseApp() {
  const [faseApp, setFaseApp] = useState(loadFase)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, faseApp)
  }, [faseApp])

  return [faseApp, setFaseApp]
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useFaseApp`
Expected: PASS — 3 test

- [ ] **Step 5: Riscrivi `src/App.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('parte dalla home', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()
})

test('Nuova Partita porta alla composizione del mazzo, poi ai giocatori, poi alla notte', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  expect(screen.getByLabelText('Numero giocatori')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Continua' }))
  expect(screen.getByPlaceholderText('Nome giocatore')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('completare la notte porta alla schermata Alba, poi al voto', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByLabelText('Mimo'))
  await user.click(screen.getByRole('button', { name: 'Continua' }))
  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))
  expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Vai al voto' }))
  expect(screen.getByRole('button', { name: 'Ricomincia votazione' })).toBeInTheDocument()
})

test('il pulsante Registro mostra il log anche a partita in corso', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Registro' }))

  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})
```

Verifica prima con `Read` che il ruolo "Mimo" in `src/data/roles.js` abbia esattamente `nome: 'Mimo'` (la checkbox in `MazzoBuilder` usa `ruolo.nome` come label): se il nome esatto è diverso, usa quello nel test invece di "Mimo".

- [ ] **Step 6: Esegui il test e verifica che fallisca**

Run: `npm test -- src/App.test.jsx`
Expected: FAIL — `App` mostra ancora la vecchia barra a tab, non la Home

- [ ] **Step 7: Riscrivi `src/App.jsx`**

```jsx
import { useState } from 'react'
import { Home } from './features/home/Home'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { AlbaPanel } from './features/alba/AlbaPanel'
import { GiornoPanel } from './features/giorno/GiornoPanel'
import { LogPartita } from './features/log/LogPartita'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'
import { useVotazione } from './state/useVotazione'
import { useNotte } from './state/useNotte'
import { useLog } from './state/useLog'
import { useFaseApp } from './state/useFaseApp'

export default function App() {
  const [faseApp, setFaseApp] = useFaseApp()
  const [mostraRegistro, setMostraRegistro] = useState(false)
  const { numGiocatori, quantita, setNumGiocatori, setQuantita, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore } = usePartita()
  const { voti, fase, incrementaVoto, decrementaVoto, ricominciaVotazione, vaiAEsito, tornaAlVoto } = useVotazione()
  const notte = useNotte()
  const { eventi, aggiungiEvento } = useLog(giocatori, notte.round)

  function proseguiAllaNotte() {
    ricominciaVotazione()
    setFaseApp('notte')
  }

  return (
    <main className="app">
      <h1>Meltable Wolves — Narratore</h1>

      {faseApp !== 'home' && (
        <button type="button" className="app__registro-toggle" onClick={() => setMostraRegistro((prev) => !prev)}>
          Registro
        </button>
      )}

      {mostraRegistro ? (
        <LogPartita eventi={eventi} />
      ) : (
        <>
          {faseApp === 'home' && <Home onNuovaPartita={() => setFaseApp('mazzo')} />}

          {faseApp === 'mazzo' && (
            <section>
              <MazzoBuilder
                numGiocatori={numGiocatori}
                quantita={quantita}
                setNumGiocatori={setNumGiocatori}
                setQuantita={setQuantita}
              />
              <button type="button" onClick={() => setFaseApp('giocatori')}>
                Continua
              </button>
            </section>
          )}

          {faseApp === 'giocatori' && (
            <section>
              <PlayerTracker
                giocatori={giocatori}
                addGiocatore={addGiocatore}
                toggleVivo={toggleVivo}
                setCondizioni={setCondizioni}
                setNote={setNote}
              />
              <button type="button" onClick={() => setFaseApp('notte')}>
                Inizia la notte
              </button>
            </section>
          )}

          {faseApp === 'notte' && (
            <NightSequencer
              ruoliSelezionati={ruoliInMazzo.map((r) => r.slug)}
              giocatori={giocatori}
              aggiornaGiocatore={aggiornaGiocatore}
              quantita={quantita}
              registraEvento={aggiungiEvento}
              round={notte.round}
              stepIndex={notte.stepIndex}
              avanti={notte.avanti}
              indietro={notte.indietro}
              nuovaNotte={notte.nuovaNotte}
              onNotteConclusa={() => setFaseApp('alba')}
            />
          )}

          {faseApp === 'alba' && (
            <AlbaPanel giocatori={giocatori} round={notte.round - 1} onVaiAlVoto={() => setFaseApp('giorno')} />
          )}

          {faseApp === 'giorno' && (
            <GiornoPanel
              giocatori={giocatori}
              voti={voti}
              fase={fase}
              incrementaVoto={incrementaVoto}
              decrementaVoto={decrementaVoto}
              ricominciaVotazione={ricominciaVotazione}
              vaiAEsito={vaiAEsito}
              tornaAlVoto={tornaAlVoto}
              aggiornaGiocatore={aggiornaGiocatore}
              round={notte.round}
              onProsegui={proseguiAllaNotte}
            />
          )}
        </>
      )}
    </main>
  )
}
```

- [ ] **Step 8: Esegui i test di `App` e verifica che passino**

Run: `npm test -- src/App.test.jsx`
Expected: PASS — 4 test

- [ ] **Step 9: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 10: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 11: Commit**

```bash
git add src/state/useFaseApp.js src/state/useFaseApp.test.js src/App.jsx src/App.test.jsx
git commit -m "feat: replace tab navigation with a Home-to-night-to-day state machine"
```

---

## Fuori scope per questo piano

Il vero popup "Registro"/"Impostazioni" con le due tab richieste dall'utente (sotto-progetto 7) resta un pulsante semplice per ora. Le pagine "Regolamento" e "Mazzo" della Home restano disabilitate: nessun contenuto dietro. Il redesign visivo (colori, font, icone del libretto) resta il sotto-progetto 8.

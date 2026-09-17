# Popup Log + Impostazioni Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire il pulsante testuale "Registro" (che oggi rimpiazza tutto lo schermo con `LogPartita`) con un'icona sempre visibile durante la partita che apre un popup con due tab: "Impostazioni partita" e "Log partita". Settimo sotto-progetto della revisione UX.

**Architecture:** Un solo nuovo componente `LogImpostazioniPopup` (icona + popup, stesso pattern overlay già usato da `MorteImprovvisa`: un `div` con `role="dialog"`, non un `<dialog>` nativo) sostituisce sia il pulsante "Registro" sia lo `stato mostraRegistro`/lo swap a schermo intero in `App.jsx`. La tab "Log partita" mostra `LogPartita` (già esistente, invariato). La tab "Impostazioni partita" resta un placeholder testuale: l'utente ha esplicitamente rimandato la scelta dei default (es. durata timer) a più avanti, quindi non c'è nessuna funzionalità reale da collegare ora — stesso trattamento già dato ai pulsanti "Regolamento"/"Mazzo"/ingranaggio nella Home (sotto-progetto 6). Il popup resta sempre raggiungibile finché `faseApp !== 'home'`, sovrapposto al contenuto della fase corrente (non lo sostituisce), a differenza del vecchio comportamento "Registro".

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- La tab "Impostazioni partita" è un placeholder: nessuna funzionalità reale dietro, per lo stesso motivo per cui l'icona ingranaggio della Home è disabilitata.
- Il popup segue lo stesso pattern di `MorteImprovvisa` (`div` con `role="dialog"`), per coerenza in tutta l'app.

---

### Task 1: `LogImpostazioniPopup`

**Files:**
- Create: `src/features/log/LogImpostazioniPopup.jsx`
- Create: `src/features/log/LogImpostazioniPopup.test.jsx`

**Interfaces:**
- Consumes: `LogPartita` (`src/features/log/LogPartita.jsx`, invariato).
- Produces: `LogImpostazioniPopup({ eventi })`. Icona sempre visibile; al click apre un popup con due tab ("Impostazioni partita", "Log partita", quest'ultima attiva di default) e un pulsante "Chiudi".

- [ ] **Step 1: Scrivi il test fallente `src/features/log/LogImpostazioniPopup.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogImpostazioniPopup } from './LogImpostazioniPopup'

test('il popup è chiuso di default', () => {
  render(<LogImpostazioniPopup eventi={[]} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test("cliccando l'icona si apre il popup, di default sulla tab Log partita", async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})

test('mostra gli eventi nella tab Log partita', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[{ round: 1, messaggio: 'Anna è morto/a' }]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByText(/anna è morto\/a/i)).toBeInTheDocument()
})

test('la tab Impostazioni partita mostra un placeholder e nasconde il log', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Impostazioni partita' }))

  expect(screen.getByText(/impostazioni in arrivo/i)).toBeInTheDocument()
  expect(screen.queryByText(/nessun evento registrato/i)).not.toBeInTheDocument()
})

test('il pulsante Chiudi chiude il popup', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Chiudi' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- LogImpostazioniPopup`
Expected: FAIL — `Cannot find module './LogImpostazioniPopup'`

- [ ] **Step 3: Scrivi `src/features/log/LogImpostazioniPopup.jsx`**

```jsx
import { useState } from 'react'
import { LogPartita } from './LogPartita'

export function LogImpostazioniPopup({ eventi }) {
  const [aperto, setAperto] = useState(false)
  const [tab, setTab] = useState('log')

  return (
    <div className="log-impostazioni">
      <button
        type="button"
        className="log-impostazioni__icona"
        onClick={() => setAperto(true)}
      >
        📜 Registro e impostazioni
      </button>
      {aperto && (
        <div className="log-impostazioni__popup" role="dialog" aria-label="Registro e impostazioni">
          <div className="log-impostazioni__tabs">
            <button type="button" aria-pressed={tab === 'impostazioni'} onClick={() => setTab('impostazioni')}>
              Impostazioni partita
            </button>
            <button type="button" aria-pressed={tab === 'log'} onClick={() => setTab('log')}>
              Log partita
            </button>
          </div>
          {tab === 'log' ? <LogPartita eventi={eventi} /> : <p>Impostazioni in arrivo.</p>}
          <button type="button" onClick={() => setAperto(false)}>
            Chiudi
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- LogImpostazioniPopup`
Expected: PASS — 5 test

- [ ] **Step 5: Commit**

```bash
git add src/features/log/LogImpostazioniPopup.jsx src/features/log/LogImpostazioniPopup.test.jsx
git commit -m "feat: add LogImpostazioniPopup with Log partita and Impostazioni partita tabs"
```

---

### Task 2: Collega il popup in `App.jsx`, rimuovi il vecchio pulsante Registro

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Modifica: `App` non usa più lo stato locale `mostraRegistro` né importa direttamente `LogPartita`: entrambi sostituiti da `<LogImpostazioniPopup eventi={eventi} />`, mostrato ogni volta che `faseApp !== 'home'` accanto (sopra) al contenuto della fase corrente, che ora è SEMPRE renderizzato (il popup si sovrappone, non sostituisce più lo schermo).

- [ ] **Step 1: Aggiorna il test in `src/App.test.jsx`**

Sostituisci il test `'il pulsante Registro mostra il log anche a partita in corso'` con:

```jsx
test("l'icona Registro e impostazioni apre il popup con log e impostazioni", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Impostazioni partita' }))
  expect(screen.getByText(/impostazioni in arrivo/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- src/App.test.jsx`
Expected: FAIL — non esiste ancora un pulsante "Registro e impostazioni"

- [ ] **Step 3: Aggiorna `src/App.jsx`**

Rimuovi l'import di `LogPartita` e aggiungi quello di `LogImpostazioniPopup`:

```jsx
import { LogImpostazioniPopup } from './features/log/LogImpostazioniPopup'
```

Rimuovi lo stato `mostraRegistro` (`const [mostraRegistro, setMostraRegistro] = useState(false)`) e l'import `useState` se non serve più altrove (verifica: non è usato altrove in questo file, quindi va rimosso).

Sostituisci l'intero blocco JSX che va da `{faseApp !== 'home' && (...)}` fino alla chiusura di `{mostraRegistro ? (...) : (<>...</>)}` con:

```jsx
      {faseApp !== 'home' && <LogImpostazioniPopup eventi={eventi} />}

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
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- src/App.test.jsx`
Expected: PASS — 4 test

- [ ] **Step 5: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 6: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: wire LogImpostazioniPopup into App, drop the full-screen Registro toggle"
```

---

## Fuori scope per questo piano

Contenuto reale della tab "Impostazioni partita" (es. durata di default del timer di spareggio): resta un placeholder finché l'utente non deciderà i default. Il redesign visivo (colori, font, icone del libretto) resta il sotto-progetto 8.

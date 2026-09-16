# Alba con Annunci Derivati Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al momento di "Notte successiva", l'app calcola annunci derivati dallo stato di gioco (belati del Pastore se ha un lupo vivo vicino, messaggio dell'Ambasciatore se il Veggente ha percepito un'aura benevola questa notte ed è vivo) e li registra nel Registro partita. Il Veggente guadagna un'azione automatica che registra l'esito della propria indagine (necessaria per l'annuncio dell'Ambasciatore). Quarto sotto-progetto della revisione UX.

**Architecture:** L'aura di un ruolo è una lista esplicita di 6 ruoli "malvagi" dal regolamento (non derivata dalla fazione: la Nonna è lupo ma appare benevola, l'Eremita è villico ma appare malvagio). `viciniVivi(giocatori, id)` estende `vicinanza.js` trovando il primo vicino vivo saltando i morti. `annunciAlba(giocatori, round)` è una funzione pura che combina le due regole. `useLog` guadagna `aggiungiEvento(messaggio)` per registrare eventi non derivabili da un semplice diff di stato. Non viene costruita una schermata "Alba" dedicata: è compito del sotto-progetto 6 (macchina a stati); per ora gli annunci finiscono nel Registro già esistente.

**Tech Stack:** Invariato (Vite, React 18, Vitest + @testing-library/react).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first, bottoni ≥44px, etichette in italiano, solo componenti funzionali (invariato).
- L'aura di un ruolo è determinata dalla lista esplicita `AURA_MALVAGIA` (Lupo Mannaro, Cucciolo di Lupo Mannaro, Lupo Mannaro Capobranco, Lupo Mannaro Progenitore, Chupacabra, Eremita) — mai dalla fazione.
- Un Veggente con la condizione `accecato` percepisce sempre aura benevola, qualunque sia il bersaglio.
- L'indagine del Veggente si registra con la notte in cui avviene (`notte: round`), stesso pattern già usato per il rogo (`mortoNotte`) — l'annuncio dell'Ambasciatore controlla che l'indagine sia della notte appena conclusa, non di una notte precedente.
- Gli annunci d'alba si registrano nel log tramite `aggiungiEvento`, non tramite una nuova schermata: la vera fase "Alba" arriva con la macchina a stati (sotto-progetto 6).

---

### Task 1: `auraDi` — aura esplicita per ruolo

**Files:**
- Create: `src/data/aura.js`
- Create: `src/data/aura.test.js`

**Interfaces:**
- Produces: `auraDi(ruoloSlug: string) => 'benevola' | 'malvagia'`.

- [ ] **Step 1: Scrivi il test fallente `src/data/aura.test.js`**

```js
import { auraDi } from './aura'

test('i ruoli della lista aura malvagia ritornano malvagia', () => {
  expect(auraDi('lupo-mannaro')).toBe('malvagia')
  expect(auraDi('chupacabra')).toBe('malvagia')
  expect(auraDi('eremita')).toBe('malvagia')
})

test('la nonna ha aura benevola nonostante sia un lupo', () => {
  expect(auraDi('nonna')).toBe('benevola')
})

test('un ruolo qualsiasi non elencato ha aura benevola', () => {
  expect(auraDi('paladino')).toBe('benevola')
  expect(auraDi('villico')).toBe('benevola')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/aura`
Expected: FAIL — `Cannot find module './aura'`

- [ ] **Step 3: Scrivi `src/data/aura.js`**

```js
const AURA_MALVAGIA = [
  'lupo-mannaro',
  'cucciolo-di-lupo-mannaro',
  'lupo-mannaro-capobranco',
  'lupo-mannaro-progenitore',
  'chupacabra',
  'eremita',
]

export function auraDi(ruoloSlug) {
  return AURA_MALVAGIA.includes(ruoloSlug) ? 'malvagia' : 'benevola'
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/aura`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/data/aura.js src/data/aura.test.js
git commit -m "feat: add explicit per-role aura data (not derived from fazione)"
```

---

### Task 2: `viciniVivi` — primo vicino vivo saltando i morti

**Files:**
- Modify: `src/data/vicinanza.js`
- Modify: `src/data/vicinanza.test.js`

**Interfaces:**
- Produces: `viciniVivi(giocatori, id) => { sinistra: giocatore|null, destra: giocatore|null }` (aggiunta accanto alla `vicini` esistente, non la sostituisce).

- [ ] **Step 1: Aggiungi i test falliti in `src/data/vicinanza.test.js`** (in coda al file; aggiorna l'import in cima aggiungendo `viciniVivi`)

```js
test('viciniVivi trova i vicini vivi più prossimi saltando i morti', () => {
  const giocatori = [
    { id: '1', vivo: false },
    { id: '2', vivo: true },
    { id: '3', vivo: false },
    { id: '4', vivo: true },
    { id: '5', vivo: false },
  ]
  expect(viciniVivi(giocatori, '5')).toEqual({ sinistra: giocatori[3], destra: giocatori[1] })
})

test('viciniVivi ritorna il vicino immediato se è vivo', () => {
  const giocatori = [{ id: '1', vivo: true }, { id: '2', vivo: true }, { id: '3', vivo: true }]
  expect(viciniVivi(giocatori, '2')).toEqual({ sinistra: giocatori[0], destra: giocatori[2] })
})

test('viciniVivi ritorna null se non ci sono altri giocatori vivi', () => {
  const giocatori = [{ id: '1', vivo: true }, { id: '2', vivo: false }]
  expect(viciniVivi(giocatori, '1')).toEqual({ sinistra: null, destra: null })
})

test('viciniVivi ritorna null per un id non presente', () => {
  const giocatori = [{ id: '1', vivo: true }]
  expect(viciniVivi(giocatori, 'x')).toEqual({ sinistra: null, destra: null })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/vicinanza`
Expected: FAIL — `viciniVivi` non è esportata

- [ ] **Step 3: Aggiungi `viciniVivi` in `src/data/vicinanza.js`** (in coda al file, `vicini` resta invariata)

```js
export function viciniVivi(giocatori, id) {
  const indice = giocatori.findIndex((g) => g.id === id)
  if (indice === -1) return { sinistra: null, destra: null }

  const n = giocatori.length

  function trovaVivo(direzione) {
    for (let passo = 1; passo < n; passo++) {
      const posizione = (((indice + direzione * passo) % n) + n) % n
      const candidato = giocatori[posizione]
      if (candidato.vivo) return candidato
    }
    return null
  }

  return { sinistra: trovaVivo(-1), destra: trovaVivo(1) }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/vicinanza`
Expected: PASS — 8 test (4 esistenti + 4 nuovi)

- [ ] **Step 5: Commit**

```bash
git add src/data/vicinanza.js src/data/vicinanza.test.js
git commit -m "feat: add viciniVivi to find nearest living circular neighbors"
```

---

### Task 3: `annunciAlba`

**Files:**
- Create: `src/data/alba.js`
- Create: `src/data/alba.test.js`

**Interfaces:**
- Consumes: `ROLES` (`src/data/roles.js`), `viciniVivi` (Task 2).
- Produces: `annunciAlba(giocatori, round) => string[]`.

- [ ] **Step 1: Scrivi il test fallente `src/data/alba.test.js`**

```js
import { annunciAlba } from './alba'

test('annuncia i belati se un pastore vivo ha un lupo come vicino vivo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'pastore', vivo: true },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true },
  ]
  expect(annunciAlba(giocatori, 1)).toContain('Si sentono dei belati.')
})

test('non annuncia i belati se il pastore non ha lupi vicini', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'pastore', vivo: true },
    { id: '2', ruoloSlug: 'villico', vivo: true },
  ]
  expect(annunciAlba(giocatori, 1)).not.toContain('Si sentono dei belati.')
})

test("annuncia il messaggio dell'ambasciatore se vivo e il veggente ha percepito aura benevola questa notte", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'ambasciatore', vivo: true },
    { id: '2', ruoloSlug: 'veggente', vivo: true, ultimaIndagine: { targetId: '1', esito: 'benevola', notte: 2 } },
  ]
  expect(annunciAlba(giocatori, 2)).toContain("È arrivato un messaggio dall'ambasciatore.")
})

test("non annuncia il messaggio dell'ambasciatore se è morto", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'ambasciatore', vivo: false },
    { id: '2', ruoloSlug: 'veggente', vivo: true, ultimaIndagine: { targetId: '1', esito: 'benevola', notte: 2 } },
  ]
  expect(annunciAlba(giocatori, 2)).not.toContain("È arrivato un messaggio dall'ambasciatore.")
})

test("non annuncia il messaggio dell'ambasciatore se l'indagine è di una notte diversa", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'ambasciatore', vivo: true },
    { id: '2', ruoloSlug: 'veggente', vivo: true, ultimaIndagine: { targetId: '1', esito: 'benevola', notte: 1 } },
  ]
  expect(annunciAlba(giocatori, 2)).not.toContain("È arrivato un messaggio dall'ambasciatore.")
})

test('nessun annuncio se non ci sono condizioni particolari', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'villico', vivo: true }]
  expect(annunciAlba(giocatori, 1)).toEqual([])
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data/alba`
Expected: FAIL — `Cannot find module './alba'`

- [ ] **Step 3: Scrivi `src/data/alba.js`**

```js
import { ROLES } from './roles'
import { viciniVivi } from './vicinanza'

function fazioneDi(giocatore) {
  return ROLES.find((r) => r.slug === giocatore.ruoloSlug)?.fazione
}

export function annunciAlba(giocatori, round) {
  const annunci = []

  const pastoriVivi = giocatori.filter((g) => g.vivo && g.ruoloSlug === 'pastore')
  const pastoreConLupoVicino = pastoriVivi.some((pastore) => {
    const { sinistra, destra } = viciniVivi(giocatori, pastore.id)
    return [sinistra, destra].some((vicino) => vicino && fazioneDi(vicino) === 'lupi')
  })
  if (pastoreConLupoVicino) {
    annunci.push('Si sentono dei belati.')
  }

  const ambasciatoreVivo = giocatori.some((g) => g.vivo && g.ruoloSlug === 'ambasciatore')
  const veggenteConAuraBenevola = giocatori.some(
    (g) => g.ruoloSlug === 'veggente' && g.ultimaIndagine?.notte === round && g.ultimaIndagine?.esito === 'benevola',
  )
  if (ambasciatoreVivo && veggenteConAuraBenevola) {
    annunci.push("È arrivato un messaggio dall'ambasciatore.")
  }

  return annunci
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- data/alba`
Expected: PASS — 6 test

- [ ] **Step 5: Commit**

```bash
git add src/data/alba.js src/data/alba.test.js
git commit -m "feat: add annunciAlba pure function for pastore/ambasciatore announcements"
```

---

### Task 4: `AzioneIndagine` — il Veggente registra l'esito

**Files:**
- Create: `src/features/notte/azioni/AzioneIndagine.jsx`
- Create: `src/features/notte/azioni/AzioneIndagine.test.jsx`

**Interfaces:**
- Consumes: `SceltaGiocatore` (`src/components/SceltaGiocatore.jsx`), `auraDi` (Task 1).
- Produces: `AzioneIndagine({ giocatori, aggiornaGiocatore, round })`.

- [ ] **Step 1: Scrivi il test fallente `src/features/notte/azioni/AzioneIndagine.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneIndagine } from './AzioneIndagine'

test('indagare un bersaglio con aura malvagia registra esito malvagia', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} />)

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 3 } })
})

test('indagare un bersaglio con aura benevola registra esito benevola', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'paladino', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={1} />)

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 1 } })
})

test('un veggente accecato percepisce sempre aura benevola', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: ['accecato'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 2 } })
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AzioneIndagine`
Expected: FAIL — `Cannot find module './AzioneIndagine'`

- [ ] **Step 3: Scrivi `src/features/notte/azioni/AzioneIndagine.jsx`**

```jsx
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { auraDi } from '../../../data/aura'

export function AzioneIndagine({ giocatori, aggiornaGiocatore, round }) {
  const veggente = giocatori.find((g) => g.ruoloSlug === 'veggente')
  const candidati = giocatori.filter((g) => g.vivo && g.id !== veggente?.id)

  function confermaScelta(targetId) {
    if (!veggente) return
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return

    const accecato = veggente.condizioni?.includes('accecato')
    const esito = accecato ? 'benevola' : auraDi(target.ruoloSlug)

    aggiornaGiocatore(veggente.id, { ultimaIndagine: { targetId, esito, notte: round } })
  }

  return (
    <SceltaGiocatore candidati={candidati} onConferma={confermaScelta} onSalta={() => {}} etichetta="Chi indagare" />
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AzioneIndagine`
Expected: PASS — 3 test

- [ ] **Step 5: Commit**

```bash
git add src/features/notte/azioni/AzioneIndagine.jsx src/features/notte/azioni/AzioneIndagine.test.jsx
git commit -m "feat: add AzioneIndagine for Veggente investigation tracking"
```

---

### Task 5: Collega il Veggente nel sequencer

**Files:**
- Modify: `src/data/nightSteps.js`
- Modify: `src/features/notte/azioni/index.js`

**Interfaces:**
- Modifica: la voce `veggente` di `NIGHT_STEPS` passa da `tipo: 'informativo'` a `tipo: 'azione'` (ora ha un effetto automatico da registrare). `AZIONI_NOTTURNE` aggiunge `veggente: { Componente: AzioneIndagine, props: {} }`.

- [ ] **Step 1: Aggiorna `src/data/nightSteps.js`**

Cambia la voce `veggente` da:

```js
{ id: 'veggente', titolo: 'Veggente', tipo: 'informativo', primaNotteSolo: false, ruoli: ['veggente'] },
```

a:

```js
{ id: 'veggente', titolo: 'Veggente', tipo: 'azione', primaNotteSolo: false, ruoli: ['veggente'] },
```

- [ ] **Step 2: Esegui la suite di `nightSteps` per verificare che nessun test esistente si rompa**

Run: `npm test -- data/nightSteps`
Expected: PASS — 9 test (nessuno di questi verificava il `tipo` di `veggente` specificamente)

- [ ] **Step 3: Aggiorna `src/features/notte/azioni/index.js`**

Aggiungi l'import e la voce nel lookup:

```js
import { AzioneIndagine } from './AzioneIndagine'
```

(subito dopo l'import di `AzioneAddolorata`, se presente, o in fondo agli import esistenti)

```js
veggente: { Componente: AzioneIndagine, props: {} },
```

(aggiungi questa riga dentro l'oggetto `AZIONI_NOTTURNE`, dopo `addolorata`)

- [ ] **Step 4: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto (il Veggente ora mostra un selettore bersaglio in `NightSequencer` invece di essere puramente informativo, ma nessun test esistente asserisce il contrario per lo specifico passo veggente)

- [ ] **Step 5: Commit**

```bash
git add src/data/nightSteps.js src/features/notte/azioni/index.js
git commit -m "feat: wire Veggente investigation into the night sequencer"
```

---

### Task 6: `useLog` con `aggiungiEvento`

**Files:**
- Modify: `src/state/useLog.js`
- Modify: `src/state/useLog.test.js`

**Interfaces:**
- Modifica: `useLog(giocatori, round)` ritorna `{ eventi, aggiungiEvento(messaggio) }` invece del solo array `eventi`.

- [ ] **Step 1: Riscrivi `src/state/useLog.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { useLog } from './useLog'

beforeEach(() => {
  localStorage.clear()
})

test('nessun evento al primo montaggio', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 1))
  expect(result.current.eventi).toEqual([])
})

test('rileva un cambiamento tra due render successivi', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })

  const morto = [{ ...vivo[0], vivo: false }]
  rerender({ giocatori: morto, round: 1 })

  expect(result.current.eventi).toEqual([{ round: 1, messaggio: 'Anna è morto/a' }])
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
  expect(result2.current.eventi).toEqual([{ round: 1, messaggio: 'Anna è morto/a' }])
})

test('aggiungiEvento aggiunge una voce manuale al log', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 4))

  act(() => {
    result.current.aggiungiEvento('Si sentono dei belati.')
  })

  expect(result.current.eventi).toEqual([{ round: 4, messaggio: 'Si sentono dei belati.' }])
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- useLog`
Expected: FAIL — `result.current.eventi` è `undefined` (l'hook ritorna ancora direttamente l'array)

- [ ] **Step 3: Aggiorna `src/state/useLog.js`**

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

  function aggiungiEvento(messaggio) {
    setEventi((prev) => [...prev, { round, messaggio }])
  }

  return { eventi, aggiungiEvento }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- useLog`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/state/useLog.js src/state/useLog.test.js
git commit -m "feat: add aggiungiEvento to useLog for non-diffable events"
```

---

### Task 7: Integrazione finale in `NightSequencer` e App

**Files:**
- Modify: `src/features/notte/NightSequencer.jsx`
- Modify: `src/features/notte/NightSequencer.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Modifica: `NightSequencer` accetta una nuova prop `registraEvento` (default no-op) e la chiama per ogni annuncio calcolato da `annunciAlba` al momento di "Notte successiva", prima di `nuovaNotte()`.

- [ ] **Step 1: Aggiungi il test fallito in `src/features/notte/NightSequencer.test.jsx`** (in coda al file)

```jsx
test('"Notte successiva" registra gli annunci dell\'alba nel log', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'pastore', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const registraEvento = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['mimo']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      registraEvento={registraEvento}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(registraEvento).toHaveBeenCalledWith('Si sentono dei belati.')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- NightSequencer`
Expected: FAIL — `registraEvento` non viene ancora chiamata

- [ ] **Step 3: Aggiorna `src/features/notte/NightSequencer.jsx`**

Aggiungi l'import e la nuova prop, poi la chiamata dentro `passaAllaNotteSuccessiva`:

```jsx
import { passiNotte } from '../../data/nightSteps'
import { ruoliAssegnabili } from '../../data/assegnazione'
import { annunciAlba } from '../../data/alba'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviLegami, risolviCortigiana } from '../../data/risoluzioneNotte'
import { AssegnaRuolo } from './AssegnaRuolo'

export function NightSequencer({
  ruoliSelezionati,
  giocatori,
  aggiornaGiocatore,
  quantita = {},
  registraEvento = () => {},
  round,
  stepIndex,
  avanti,
  indietro,
  nuovaNotte,
}) {
  // ... invariato fino a passaAllaNotteSuccessiva ...

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

    for (const messaggio of annunciAlba(giocatori, round)) {
      registraEvento(messaggio)
    }

    nuovaNotte()
  }

  // ... resto invariato ...
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- NightSequencer`
Expected: PASS — 15 test

- [ ] **Step 5: Aggiorna `src/App.jsx`**

Sostituisci la riga `const eventi = useLog(giocatori, notte.round)` con:

```jsx
const { eventi, aggiungiEvento } = useLog(giocatori, notte.round)
```

Nel blocco `<NightSequencer ...>`, aggiungi la prop:

```jsx
registraEvento={aggiungiEvento}
```

- [ ] **Step 6: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test del progetto

- [ ] **Step 7: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori

- [ ] **Step 8: Commit**

```bash
git add src/features/notte/NightSequencer.jsx src/features/notte/NightSequencer.test.jsx src/App.jsx
git commit -m "feat: register alba announcements in the match log at dawn"
```

---

## Fuori scope per questo piano

Una vera schermata "Alba" dedicata, voto ed esito nel flusso unico, home e macchina a stati, popup log/impostazioni, redesign visivo — restano i prossimi sotto-progetti concordati. Veggente Mannaro, Cartomante, Inquisitore e Medium restano puramente informativi: solo il Veggente è servito per l'annuncio dell'Ambasciatore.

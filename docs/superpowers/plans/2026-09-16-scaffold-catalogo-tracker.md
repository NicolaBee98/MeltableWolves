# Scaffold + Catalogo Ruoli + Tracker Giocatori Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire una SPA React mobile-first che permetta al narratore di Meltable Wolves di tenere traccia dei giocatori in partita (ruolo, vivo/morto, condizioni attive, note), coprendo i passi 1-3 della roadmap (scaffold progetto, catalogo ruoli, tracker giocatori).

**Architecture:** SPA client-side pura con Vite + React, nessun backend. Stato di partita in un hook React (`usePartita`) sincronizzato con `localStorage` per sopravvivere a un refresh. Struttura a componenti piccoli e focalizzati: dati di gioco separati dalla UI, UI separata dallo stato.

**Tech Stack:** Vite, React 18, Vitest + @testing-library/react per i test (nessuna dipendenza di test aggiuntiva oltre a queste, coerenti col resto dello stack).

**Spec:** [docs/superpowers/specs/2026-09-16-narratore-app-design.md](../specs/2026-09-16-narratore-app-design.md)

## Global Constraints

- Mobile-first: layout a colonna singola, max-width ~480px centrato, bottoni con area di tocco minima 44x44px.
- Nessun backend, nessun account: unica persistenza è `localStorage` del browser.
- Tutte le etichette UI in italiano (coerente con il regolamento e il pubblico del gioco).
- Solo componenti funzionali React con hook, niente class component.
- Niente asset immagine reali per ora (arriveranno in una fase futura): i ruoli si distinguono con etichetta di fazione testuale/emoji, non con icone immagine.

---

### Task 1: Scaffold progetto Vite + React + Vitest

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.jsx`
- Create: `src/index.css`
- Create: `src/App.jsx`
- Create: `src/App.test.jsx`
- Create: `src/test/setup.js`

**Interfaces:**
- Produces: `App` (default export da `src/App.jsx`), componente radice montato in `src/main.jsx`.

- [ ] **Step 1: Crea `package.json`**

```json
{
  "name": "meltable-wolves-narratore",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "vite": "^5.4.1",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Crea `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
})
```

- [ ] **Step 3: Crea `index.html`**

```html
<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meltable Wolves — Narratore</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Crea `.gitignore`**

```
node_modules
dist
```

- [ ] **Step 5: Crea `src/test/setup.js`**

```js
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Crea `src/index.css`**

```css
:root {
  color-scheme: light dark;
  font-family: system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

.app {
  max-width: 480px;
  margin: 0 auto;
  padding: 1rem;
}

button {
  min-height: 44px;
  min-width: 44px;
}
```

- [ ] **Step 7: Crea `src/App.jsx`**

```jsx
export default function App() {
  return (
    <main className="app">
      <h1>Meltable Wolves — Narratore</h1>
    </main>
  )
}
```

- [ ] **Step 8: Crea `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Scrivi il test di smoke `src/App.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders app heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /meltable wolves/i })).toBeInTheDocument()
})
```

- [ ] **Step 10: Installa le dipendenze**

Run: `npm install`

- [ ] **Step 11: Esegui il test e verifica che passi**

Run: `npm test`
Expected: PASS — `renders app heading`

- [ ] **Step 12: Verifica manuale in dev server**

Run: `npm run dev`
Apri l'URL mostrato nel browser (o nel device tool mobile) e verifica che appaia il titolo "Meltable Wolves — Narratore".

- [ ] **Step 13: Verifica che la build statica funzioni**

Run: `npm run build`
Expected: cartella `dist/` creata senza errori.

- [ ] **Step 14: Commit**

```bash
git add package.json vite.config.js index.html .gitignore src/
git commit -m "chore: scaffold Vite + React + Vitest project"
```

---

### Task 2: Dati di gioco — catalogo ruoli e condizioni

**Files:**
- Create: `src/data/roles.js`
- Create: `src/data/conditions.js`
- Create: `src/data/data.test.js`

**Interfaces:**
- Produces: `ROLES` (array esportato da `src/data/roles.js`), ogni elemento `{ slug, nome, fazione, notturno, testoRegole }` dove `fazione` ∈ `'villaggio' | 'lupi' | 'indipendente' | 'sconosciuto'`.
- Produces: `CONDIZIONI` (array esportato da `src/data/conditions.js`), ogni elemento `{ slug, nome, descrizione }`.

- [ ] **Step 1: Scrivi il test di integrità dati `src/data/data.test.js` (fallirà finché non esistono i file dati)**

```js
import { ROLES } from './roles'
import { CONDIZIONI } from './conditions'

const FAZIONI_VALIDE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']

test('ROLES ha 51 ruoli con campi validi e slug unici', () => {
  expect(ROLES).toHaveLength(51)

  const slugs = new Set()
  for (const ruolo of ROLES) {
    expect(typeof ruolo.slug).toBe('string')
    expect(ruolo.slug.length).toBeGreaterThan(0)
    expect(slugs.has(ruolo.slug)).toBe(false)
    slugs.add(ruolo.slug)

    expect(typeof ruolo.nome).toBe('string')
    expect(ruolo.nome.length).toBeGreaterThan(0)
    expect(FAZIONI_VALIDE).toContain(ruolo.fazione)
    expect(typeof ruolo.notturno).toBe('boolean')
    expect(typeof ruolo.testoRegole).toBe('string')
    expect(ruolo.testoRegole.length).toBeGreaterThan(0)
  }
})

test('CONDIZIONI ha slug unici e campi validi', () => {
  const slugs = new Set()
  for (const condizione of CONDIZIONI) {
    expect(typeof condizione.slug).toBe('string')
    expect(slugs.has(condizione.slug)).toBe(false)
    slugs.add(condizione.slug)
    expect(typeof condizione.nome).toBe('string')
    expect(typeof condizione.descrizione).toBe('string')
  }
  expect(CONDIZIONI.length).toBeGreaterThanOrEqual(10)
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- data.test`
Expected: FAIL — `Cannot find module './roles'` (o simile)

- [ ] **Step 3: Crea `src/data/roles.js`**

```js
export const ROLES = [
  { slug: 'addolorata', nome: 'Addolorata', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte sceglie se scambiare permanentemente il proprio ruolo con quello della vittima del rogo del giorno precedente. Può farlo solo una volta per partita. Se al rogo nessuno viene ucciso non può utilizzare il proprio potere." },
  { slug: 'alchimista', nome: 'Alchimista', fazione: 'villaggio', notturno: false,
    testoRegole: "Se viene messo al rogo dal villaggio, si rivela e sceglie un'altra persona da portare con sé nell'aldilà con una grande esplosione pirotecnica. Se viene sbranato di notte non accade nulla." },
  { slug: 'ambasciatore', nome: 'Ambasciatore', fazione: 'villaggio', notturno: false,
    testoRegole: "Finché è in vita, il narratore annuncerà all'alba se durante la notte precedente il veggente ha percepito un'aura benevola. Se l'ambasciatore è morto o il veggente indaga un cittadino benevolo il narratore non farà nessun annuncio." },
  { slug: 'apprendista', nome: 'Apprendista', fazione: 'villaggio', notturno: true,
    testoRegole: "La prima notte sceglie un maestro da seguire. Quando il maestro muore, l'apprendista si rivela e ne prende la carta, assumendone il ruolo." },
  { slug: 'bardo', nome: 'Bardo', fazione: 'villaggio', notturno: true,
    testoRegole: "Grazie alla sua musica tiene sveglio tutto il villaggio, facendo saltare una notte. La prima notte mostra al narratore un gesto segreto; dopo un rogo, solo una volta per partita, esegue il gesto per attivare il proprio potere." },
  { slug: 'berserker', nome: 'Berserker', fazione: 'villaggio', notturno: false,
    testoRegole: "Se questo feroce guerriero viene sbranato dal branco uccide il lupo che si trova più vicino a lui. Il narratore all'alba comunicherà la morte di entrambi." },
  { slug: 'boia', nome: 'Boia', fazione: 'villaggio', notturno: false,
    testoRegole: "Durante il giorno può giustiziare una persona al proprio grido di battaglia. Può usare il suo potere soltanto una volta per partita, rivelandosi." },
  { slug: 'borgomastro', nome: 'Borgomastro', fazione: 'villaggio', notturno: false,
    testoRegole: "È il primo cittadino del villaggio: il suo voto vale doppio. Viene eletto dal villaggio all'alba del primo giorno. Se muore, il villaggio elegge un nuovo borgomastro." },
  { slug: 'cartomante', nome: 'Cartomante', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte indica una persona in vita per scoprirne il ruolo (il narratore le mostra la carta di chi ha indicato). Utilizzabile come alternativa al Veggente." },
  { slug: 'cavaliere', nome: 'Cavaliere', fazione: 'villaggio', notturno: true,
    testoRegole: "La prima notte sceglie una persona per cui è disposto a sacrificarsi. Se questa persona viene sbranata di notte il Cavaliere muore al suo posto; se invece viene messa al rogo il Cavaliere si rivela immolandosi." },
  { slug: 'chupacabra', nome: 'Chupacabra', fazione: 'indipendente', notturno: true,
    testoRegole: "Ogni notte si sveglia e va a caccia cercando di sbranare un lupo: se lo trova lo uccide, altrimenti la sua caccia fallisce. Quando tutti i lupi sono stati uccisi, inizia a uccidere ogni notte un abitante qualsiasi. Vince se rimane l'ultimo sopravvissuto. Il villaggio non può vincere finché il Chupacabra è in vita." },
  { slug: 'cortigiana', nome: 'Cortigiana', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte sceglie un cliente da cui farsi visita. Durante la notte non può essere uccisa direttamente dai lupi, ma lo sarà se la visita è a un lupo mannaro o se il cliente scelto viene sbranato dal branco. Viene protetta dal Paladino solo se il suo cliente è protetto." },
  { slug: 'criceto-malvagio', nome: 'Criceto Malvagio', fazione: 'indipendente', notturno: false,
    testoRegole: "Non è un alleato dei lupi ma non può essere ucciso da loro di notte. Vince se rimane l'ultimo sopravvissuto." },
  { slug: 'cucciolo-di-lupo-mannaro', nome: 'Cucciolo di Lupo Mannaro', fazione: 'lupi', notturno: true,
    testoRegole: "Ogni notte si sveglia e uccide assieme al branco. Se viene ucciso, i lupi mannari sbranano due persone in una notte per vendetta. Alla morte del primo lupo, il cucciolo diventa adulto perdendo questo potere." },
  { slug: 'eremita', nome: 'Eremita', fazione: 'villaggio', notturno: false,
    testoRegole: "Nonostante si tratti di un normale villico, il Veggente leggendo la sua aura lo vedrà sempre come malvagio." },
  { slug: 'fantasma-onnisciente', nome: 'Fantasma Onnisciente', fazione: 'villaggio', notturno: true,
    testoRegole: "Carta non distribuita all'inizio: viene consegnata al primo morto della partita. Da allora può tenere gli occhi aperti la notte e a ogni alba dire una lettera dell'alfabeto (non le iniziali dei giocatori). Perde il diritto di voto ai ballottaggi. Vince secondo il ruolo che aveva in vita." },
  { slug: 'fattucchiera', nome: 'Fattucchiera', fazione: 'villaggio', notturno: true,
    testoRegole: "Infligge un sortilegio che blocca i poteri di una persona a sua scelta di notte (vedi condizione Inibito)." },
  { slug: 'figlia-dei-lupi', nome: 'Figlia dei Lupi', fazione: 'sconosciuto', notturno: true,
    testoRegole: "Durante la prima notte sceglie un genitore, di qualunque fazione. Se questo muore, lei diventa Lupo Mannaro e si sveglia col resto del branco dalla notte seguente." },
  { slug: 'gallo-mannaro', nome: 'Gallo Mannaro', fazione: 'lupi', notturno: true,
    testoRegole: "Può decidere di non cantare, lasciando tutti addormentati per un giorno intero e favorendo così i lupi mannari. La prima notte mostra al narratore un gesto segreto; all'alba, solo una volta per partita, esegue il gesto per attivare il proprio potere." },
  { slug: 'guardia', nome: 'Guardia', fazione: 'villaggio', notturno: true,
    testoRegole: "Durante la prima notte conosce il suo collega (o colleghi). Le Guardie sono a conoscenza della loro reciproca onestà. Va sempre inserita nel mazzo in coppia." },
  { slug: 'guardia-mannara', nome: 'Guardia Mannara', fazione: 'lupi', notturno: true,
    testoRegole: "Durante la prima notte conosce i suoi colleghi. Segretamente patteggia per il branco e vince se vincono i lupi mannari. Va inserita nel mazzo solo se sono già presenti le Guardie." },
  { slug: 'guaritore', nome: 'Guaritore', fazione: 'villaggio', notturno: true,
    testoRegole: "Grazie al suo potere può riportare in vita un defunto. Può utilizzare questo potere soltanto una volta per partita, sia da vivo che da morto. Può scegliere di usarlo anche verso sé stesso." },
  { slug: 'innocente', nome: 'Innocente', fazione: 'villaggio', notturno: false,
    testoRegole: "L'unico villico che, nel momento in cui il giocatore lo ritiene più opportuno, può dimostrare al villaggio la sua innocenza mostrando la propria carta." },
  { slug: 'inquisitore', nome: 'Inquisitore', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte ha la possibilità (ma non l'obbligo) di interrogare qualcuno di cui sospetta e sapere se si tratta di un lupo. Se indaga inutilmente un personaggio con aura positiva perde permanentemente il suo potere." },
  { slug: 'ladro', nome: 'Ladro', fazione: 'sconosciuto', notturno: true,
    testoRegole: "Nel creare il mazzo vanno aggiunte due carte extra. La prima notte il Ladro guarda le due carte rimaste e sceglie se assumere il ruolo di una di queste o diventare un semplice Villico. Se le due carte rappresentano entrambe Lupi Mannari è necessario scambiare la propria carta." },
  { slug: 'lantico', nome: "L'Antico", fazione: 'villaggio', notturno: false,
    testoRegole: "È dotato di due vite. Se perde la sua prima vita al rogo, si rivela e infligge una maledizione al villaggio bloccando tutti i poteri notturni per una notte (vedi Maledetto). Se invece perde la sua prima vita di notte, si rivela all'alba senza conseguenze. Continua poi a giocare come un normale Villico." },
  { slug: 'lupo-mannaro', nome: 'Lupo Mannaro', fazione: 'lupi', notturno: true,
    testoRegole: "Ogni notte si sveglia e insieme al branco sceglie una vittima da sbranare. I Lupi Mannari vincono se rimangono in numero pari o superiore al villaggio." },
  { slug: 'lupo-mannaro-capobranco', nome: 'Lupo Mannaro Capobranco', fazione: 'lupi', notturno: true,
    testoRegole: "Il suo obiettivo è rimanere l'ultimo giocatore in vita. Durante la notte caccia con gli altri lupi ma può scegliere di uccidere anche i suoi fratelli. In caso di indecisione tra i lupi nella scelta della vittima, ha l'ultima parola." },
  { slug: 'lupo-mannaro-progenitore', nome: 'Lupo Mannaro Progenitore', fazione: 'lupi', notturno: true,
    testoRegole: "Caccia con il branco dei lupi. Una sola volta per partita può decidere di trasformare in Lupo Mannaro la vittima del branco. Quando ciò avviene il narratore sveglierà segretamente la vittima permettendole di individuare gli altri lupi." },
  { slug: 'maga', nome: 'Maga', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte lancia un incantesimo su una persona, trasformandola in maiale per una giornata. Il malcapitato dovrà parlare solo tramite grugniti fino al calar della notte (vedi Trasformato)." },
  { slug: 'medium', nome: 'Medium', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte può interrogare un membro del villaggio defunto in merito alla sua vita passata e scoprire quale fosse il suo 'vecchio' ruolo guardandone la carta." },
  { slug: 'mezzosangue', nome: 'Mezzosangue', fazione: 'villaggio', notturno: false,
    testoRegole: "A causa del suo sangue misto, se viene sbranato dai lupi non muore ma diventa Lupo Mannaro. Se non viene sbranato rimane un normale Villico che vince assieme al villaggio." },
  { slug: 'mimo', nome: 'Mimo', fazione: 'sconosciuto', notturno: true,
    testoRegole: "La prima notte sceglie un giocatore e ne imita il ruolo per tutta la partita. Se il ruolo scelto compie azioni di notte (Lupo Mannaro, Veggente, Paladino, ecc.) il Mimo si sveglia assieme ad esso e si accorda sull'agire." },
  { slug: 'mucca-mannara', nome: 'Mucca Mannara', fazione: 'lupi', notturno: true,
    testoRegole: "La prima notte si sveglia e identifica segretamente i membri del branco (tutti i lupi mannari alzeranno il pollice). Vince assieme ai lupi mannari; essendo erbivora, non uccide e non partecipa alle cacce." },
  { slug: 'nano', nome: 'Nano', fazione: 'villaggio', notturno: false,
    testoRegole: "Data la sua statura, non viene notato dai lupi durante la notte, quindi non può essere ucciso da loro. Può comunque morire al rogo." },
  { slug: 'nonna', nome: 'Nonna', fazione: 'lupi', notturno: true,
    testoRegole: "Sotto le sue vesti si nasconde un Lupo Mannaro qualsiasi. Nonostante ciò il Veggente, leggendo la sua aura, lo vedrà sempre come benevolo." },
  { slug: 'paladino', nome: 'Paladino', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte può scegliere qualcuno a cui offrire la sua protezione, impedendo che venga sbranato dai lupi mannari. Può proteggere anche sé stesso (vedi Protetto)." },
  { slug: 'pastore', nome: 'Pastore', fazione: 'villaggio', notturno: false,
    testoRegole: "Se il primo giocatore vivo alla sua destra o alla sua sinistra è un lupo mannaro, le sue pecore si agiteranno e all'alba il narratore annuncerà che si sentono dei belati." },
  { slug: 'pifferaio', nome: 'Pifferaio', fazione: 'indipendente', notturno: true,
    testoRegole: "Ogni notte ipnotizza due persone. Quando tutti i giocatori in vita saranno ipnotizzati, avrà vinto il gioco (vedi Ipnotizzato)." },
  { slug: 'polpo-mannaro', nome: 'Polpo Mannaro', fazione: 'lupi', notturno: false,
    testoRegole: "Quando il Veggente indaga l'aura del Polpo Mannaro viene accecato: da allora, fino alla morte del Polpo, il Veggente vedrà chiunque come benevolo (vedi Accecato)." },
  { slug: 'sacerdote', nome: 'Sacerdote', fazione: 'villaggio', notturno: true,
    testoRegole: "La prima notte sceglie due persone, unendole con un sigillo d'amore: se una delle due morirà, uccisa o mandata al rogo, anche l'altra la seguirà nella tomba (vedi Innamorato)." },
  { slug: 'scemo-del-villaggio', nome: 'Scemo del Villaggio', fazione: 'villaggio', notturno: false,
    testoRegole: "Un sortilegio opprime questo ruolo: per esprimersi deve parlare in rima. Se la sua rima fallisce, lo sfortunato perisce all'istante." },
  { slug: 'sciacallo-mannaro', nome: 'Sciacallo Mannaro', fazione: 'lupi', notturno: true,
    testoRegole: "Ha il potere di far resuscitare, una volta per partita, un altro giocatore. Non conosce chi sono i Lupi Mannari e non caccia con loro." },
  { slug: 'spilungone', nome: 'Spilungone', fazione: 'villaggio', notturno: false,
    testoRegole: "Essendo troppo alto per qualsiasi patibolo, non può essere messo al rogo del villaggio durante il giorno. Se viene favorito al rogo, svela la propria carta e la notte cala senza vittime." },
  { slug: 'strega', nome: 'Strega', fazione: 'villaggio', notturno: true,
    testoRegole: "Ha a disposizione due pozioni: una dose di pozione vitale (che protegge un giocatore dalla morte durante quella notte) e una dose di pozione mortale. Ogni notte si sveglia e può decidere se utilizzare o meno ciascuna delle dosi." },
  { slug: 'suocera', nome: 'Suocera', fazione: 'villaggio', notturno: false,
    testoRegole: "Per lei non c'è differenza tra vita e morte. Quando muore si rivela e può continuare a parlare durante il giorno. Non è considerata in vita per le condizioni di vittoria." },
  { slug: 'ubriaco', nome: 'Ubriaco', fazione: 'villaggio', notturno: false,
    testoRegole: "Se muore sbranato dai lupi mannari, la gran quantità di alcol nel suo sangue li stordisce, impedendo loro di uccidere la notte successiva." },
  { slug: 'untore', nome: 'Untore', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte unge una vittima, che per il giorno successivo non potrà dire né 'sì' né 'no', altrimenti morirà trasmettendo l'unzione alle persone ai suoi fianchi (vedi Unto)." },
  { slug: 'veggente', nome: 'Veggente', fazione: 'villaggio', notturno: true,
    testoRegole: "Ogni notte può leggere l'aura di un altro componente del villaggio ancora in vita e sapere se è dalla parte del villaggio o dalla parte dei lupi." },
  { slug: 'veggente-mannaro', nome: 'Veggente Mannaro', fazione: 'lupi', notturno: true,
    testoRegole: "Ogni notte può leggere l'aura di una persona in vita e sapere se è dalla parte del villaggio o dai lupi. Pur non conoscendo il branco, parteggia per loro." },
  { slug: 'villico', nome: 'Villico', fazione: 'villaggio', notturno: false,
    testoRegole: "Un umile contadino senza alcun potere. Il suo obiettivo è difendere il proprio villaggio dai lupi mannari, votando i cittadini sospetti di licantropia e mandandoli al rogo. Il villaggio vince se riesce a uccidere tutti i Lupi Mannari." },
]
```

**Nota per il narratore:** la classificazione di fazione per `untore`, `sciacallo-mannaro`, `nonna`, `mezzosangue` e `apprendista` (stato iniziale) è stata dedotta dal testo del regolamento in assenza delle icone originali (non disponibili ora); vale la pena ricontrollarla contro le carte fisiche appena disponibili.

- [ ] **Step 4: Crea `src/data/conditions.js`**

```js
export const CONDIZIONI = [
  { slug: 'accecato', nome: 'Accecato',
    descrizione: "Solo il Veggente può essere accecato dal Polpo Mannaro. Il narratore dirà sempre 'no' a ogni indagine, anche se il Veggente indaga un Lupo Mannaro." },
  { slug: 'inibito', nome: 'Inibito',
    descrizione: "Il giocatore inibito dalla Fattucchiera non potrà compiere le proprie azioni notturne. Quando il giocatore viene svegliato di notte, il narratore fa un'X con le mani per indicare che il suo potere è stato inibito." },
  { slug: 'innamorato', nome: 'Innamorato',
    descrizione: "I due giocatori uniti dal Sacerdote diventano innamorati. Quando uno dei due muore, anche l'altro morirà per crepacuore. Un innamorato vince se è ancora in vita quando vince la sua fazione, oppure se gli innamorati sono gli unici giocatori rimasti." },
  { slug: 'ipnotizzato', nome: 'Ipnotizzato',
    descrizione: "Un giocatore apprende di essere sotto ipnosi durante l'azione del Pifferaio. Non influisce sui poteri o sulle azioni del ruolo." },
  { slug: 'maledetto', nome: 'Maledetto',
    descrizione: "Si applica quando il villaggio manda al rogo L'Antico. La notte successiva il narratore non sveglia alcun ruolo con potere attivo; l'effetto non si applica ai poteri passivi." },
  { slug: 'trasformato', nome: 'Trasformato',
    descrizione: "All'alba il narratore annuncia quale giocatore è stato trasformato in maiale dalla Maga. Per il giorno successivo potrà esprimersi solo con grugniti e gesti. Non perde il diritto di voto." },
  { slug: 'morto-sul-colpo', nome: 'Morto sul colpo',
    descrizione: "Un giocatore può morire sul colpo per l'esecuzione del Boia, l'unzione dell'Untore, o se lo Scemo del Villaggio sbaglia la rima. Se la morte avviene durante le votazioni, queste proseguono indisturbate." },
  { slug: 'protetto', nome: 'Protetto',
    descrizione: "Il giocatore protetto dal Paladino o dalla pozione vitale della Strega non può morire quella notte per i morsi del branco o del Chupacabra. La protezione non blocca la pozione mortale né altri poteri." },
  { slug: 'resuscitato', nome: 'Resuscitato',
    descrizione: "Se durante la notte il Guaritore o lo Sciacallo Mannaro usano i propri poteri, il giocatore torna in vita a tutti gli effetti." },
  { slug: 'unto', nome: 'Unto',
    descrizione: "All'alba il narratore annuncia chi è stato colpito dai poteri dell'Untore. Da quel momento il giocatore non potrà dire 'sì' né 'no'; se lo farà morirà all'istante, infettando il vicino alla sua destra e quello alla sua sinistra." },
]
```

- [ ] **Step 5: Esegui i test e verifica che passino**

Run: `npm test -- data.test`
Expected: PASS — entrambi i test

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: add roles and conditions catalog data"
```

---

### Task 3: Hook di stato partita con persistenza localStorage

**Files:**
- Create: `src/state/usePartita.js`
- Create: `src/state/usePartita.test.js`

**Interfaces:**
- Consumes: nessuna dipendenza da altri task (usa solo `localStorage` e `crypto.randomUUID`, API native del browser).
- Produces: `usePartita()` che ritorna `{ giocatori, addGiocatore(nome, ruoloSlug), toggleVivo(id), setCondizioni(id, condizioni), setNote(id, note) }`, dove `giocatore = { id, nome, ruoloSlug, vivo, condizioni, note }`.

- [ ] **Step 1: Scrivi il test fallente `src/state/usePartita.test.js`**

```js
import { renderHook, act } from '@testing-library/react'
import { usePartita } from './usePartita'

beforeEach(() => {
  localStorage.clear()
})

test('addGiocatore aggiunge un giocatore vivo senza condizioni', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna', 'villico')
  })

  expect(result.current.giocatori).toHaveLength(1)
  expect(result.current.giocatori[0]).toMatchObject({
    nome: 'Anna',
    ruoloSlug: 'villico',
    vivo: true,
    condizioni: [],
    note: '',
  })
})

test('toggleVivo inverte lo stato vivo/morto del giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna', 'villico')
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
    result.current.addGiocatore('Anna', 'villico')
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
    result.current.addGiocatore('Anna', 'villico')
  })
  unmount()

  const { result: result2 } = renderHook(() => usePartita())
  expect(result2.current.giocatori).toHaveLength(1)
  expect(result2.current.giocatori[0].nome).toBe('Anna')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- usePartita`
Expected: FAIL — `Cannot find module './usePartita'`

- [ ] **Step 3: Scrivi `src/state/usePartita.js`**

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
      { id: crypto.randomUUID(), nome, ruoloSlug, vivo: true, condizioni: [], note: '' },
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

  return { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- usePartita`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/state/
git commit -m "feat: add usePartita hook with localStorage persistence"
```

---

### Task 4: Form aggiungi giocatore

**Files:**
- Create: `src/features/players/AddPlayerForm.jsx`
- Create: `src/features/players/AddPlayerForm.test.jsx`

**Interfaces:**
- Consumes: array di ruoli con forma `{ slug, nome }` (sottoinsieme di `ROLES` da Task 2).
- Produces: componente `AddPlayerForm({ roles, onAdd })` dove `onAdd(nome: string, ruoloSlug: string)` viene chiamato al submit.

- [ ] **Step 1: Scrivi il test fallente `src/features/players/AddPlayerForm.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPlayerForm } from './AddPlayerForm'

const roles = [
  { slug: 'villico', nome: 'Villico' },
  { slug: 'veggente', nome: 'Veggente' },
]

test('invia nome e ruolo selezionato al submit', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm roles={roles} onAdd={onAdd} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Marco')
  await user.selectOptions(screen.getByRole('combobox'), 'veggente')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(onAdd).toHaveBeenCalledWith('Marco', 'veggente')
})

test('non invia se il nome è vuoto', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm roles={roles} onAdd={onAdd} />)

  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(onAdd).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- AddPlayerForm`
Expected: FAIL — `Cannot find module './AddPlayerForm'`

- [ ] **Step 3: Scrivi `src/features/players/AddPlayerForm.jsx`**

```jsx
import { useState } from 'react'

export function AddPlayerForm({ roles, onAdd }) {
  const [nome, setNome] = useState('')
  const [ruoloSlug, setRuoloSlug] = useState(roles[0]?.slug ?? '')

  function handleSubmit(event) {
    event.preventDefault()
    if (!nome.trim()) return
    onAdd(nome.trim(), ruoloSlug)
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
      <select value={ruoloSlug} onChange={(event) => setRuoloSlug(event.target.value)}>
        {roles.map((ruolo) => (
          <option key={ruolo.slug} value={ruolo.slug}>
            {ruolo.nome}
          </option>
        ))}
      </select>
      <button type="submit">Aggiungi</button>
    </form>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- AddPlayerForm`
Expected: PASS — 2 test

- [ ] **Step 5: Commit**

```bash
git add src/features/players/AddPlayerForm.jsx src/features/players/AddPlayerForm.test.jsx
git commit -m "feat: add AddPlayerForm component"
```

---

### Task 5: Card giocatore (stato, condizioni, note)

**Files:**
- Create: `src/features/players/PlayerCard.jsx`
- Create: `src/features/players/PlayerCard.test.jsx`

**Interfaces:**
- Consumes: `giocatore = { id, nome, ruoloSlug, vivo, condizioni, note }` (da `usePartita`, Task 3), `ruolo = { slug, nome, fazione, notturno, testoRegole } | undefined` (da `ROLES`, Task 2), `condizioniDisponibili` (array `CONDIZIONI`, Task 2).
- Produces: componente `PlayerCard({ giocatore, ruolo, condizioniDisponibili, onToggleVivo, onChangeCondizioni, onChangeNote })`, dove `onToggleVivo(id)`, `onChangeCondizioni(id, condizioni[])`, `onChangeNote(id, note)`.

- [ ] **Step 1: Scrivi il test fallente `src/features/players/PlayerCard.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerCard } from './PlayerCard'

const giocatore = { id: '1', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [], note: '' }
const ruolo = { slug: 'veggente', nome: 'Veggente', fazione: 'villaggio', notturno: true, testoRegole: '...' }
const condizioniDisponibili = [{ slug: 'ipnotizzato', nome: 'Ipnotizzato', descrizione: '...' }]

test('mostra nome e ruolo del giocatore', () => {
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={() => {}}
      onChangeNote={() => {}}
    />,
  )
  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.getByText('Veggente')).toBeInTheDocument()
})

test('click sul pulsante stato chiama onToggleVivo con l\'id del giocatore', async () => {
  const user = userEvent.setup()
  const onToggleVivo = vi.fn()
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={onToggleVivo}
      onChangeCondizioni={() => {}}
      onChangeNote={() => {}}
    />,
  )
  await user.click(screen.getByRole('button', { name: /vivo/i }))
  expect(onToggleVivo).toHaveBeenCalledWith('1')
})

test('click su una condizione la aggiunge alla lista', async () => {
  const user = userEvent.setup()
  const onChangeCondizioni = vi.fn()
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={onChangeCondizioni}
      onChangeNote={() => {}}
    />,
  )
  await user.click(screen.getByRole('button', { name: /ipnotizzato/i }))
  expect(onChangeCondizioni).toHaveBeenCalledWith('1', ['ipnotizzato'])
})

test('scrivere nella textarea chiama onChangeNote', async () => {
  const user = userEvent.setup()
  const onChangeNote = vi.fn()
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={() => {}}
      onChangeNote={onChangeNote}
    />,
  )
  await user.type(screen.getByPlaceholderText('Note...'), 'x')
  expect(onChangeNote).toHaveBeenCalledWith('1', 'x')
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- PlayerCard`
Expected: FAIL — `Cannot find module './PlayerCard'`

- [ ] **Step 3: Scrivi `src/features/players/PlayerCard.jsx`**

```jsx
const FAZIONE_LABEL = {
  villaggio: '👤 Villaggio',
  lupi: '🐺 Lupi',
  indipendente: '⭐ Indipendente',
  sconosciuto: '❓ Sconosciuto',
}

export function PlayerCard({ giocatore, ruolo, condizioniDisponibili, onToggleVivo, onChangeCondizioni, onChangeNote }) {
  function toggleCondizione(slug) {
    const next = giocatore.condizioni.includes(slug)
      ? giocatore.condizioni.filter((c) => c !== slug)
      : [...giocatore.condizioni, slug]
    onChangeCondizioni(giocatore.id, next)
  }

  return (
    <article className={`player-card${giocatore.vivo ? '' : ' player-card--morto'}`}>
      <header className="player-card__header">
        <h3>{giocatore.nome}</h3>
        <button type="button" onClick={() => onToggleVivo(giocatore.id)}>
          {giocatore.vivo ? 'Vivo' : 'Morto'}
        </button>
      </header>
      <p className="player-card__ruolo">
        {ruolo?.nome ?? 'Ruolo sconosciuto'}
        {ruolo && <span className="player-card__fazione"> — {FAZIONE_LABEL[ruolo.fazione]}</span>}
      </p>
      <div className="player-card__condizioni">
        {condizioniDisponibili.map((condizione) => (
          <button
            key={condizione.slug}
            type="button"
            aria-pressed={giocatore.condizioni.includes(condizione.slug)}
            onClick={() => toggleCondizione(condizione.slug)}
          >
            {condizione.nome}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Note..."
        value={giocatore.note}
        onChange={(event) => onChangeNote(giocatore.id, event.target.value)}
      />
    </article>
  )
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `npm test -- PlayerCard`
Expected: PASS — 4 test

- [ ] **Step 5: Commit**

```bash
git add src/features/players/PlayerCard.jsx src/features/players/PlayerCard.test.jsx
git commit -m "feat: add PlayerCard component"
```

---

### Task 6: Integrazione tracker giocatori in App

**Files:**
- Create: `src/features/players/PlayerTracker.jsx`
- Create: `src/features/players/PlayerTracker.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `ROLES` (Task 2), `CONDIZIONI` (Task 2), `usePartita` (Task 3), `AddPlayerForm` (Task 4), `PlayerCard` (Task 5).
- Produces: componente `PlayerTracker` (nessun altro task futuro in questo piano dipende da questa interfaccia).

- [ ] **Step 1: Scrivi il test fallente `src/features/players/PlayerTracker.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'

beforeEach(() => {
  localStorage.clear()
})

test('aggiungere un giocatore lo mostra subito nella lista', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(screen.getByText('Giulia')).toBeInTheDocument()
})

test('cambiare stato vivo/morto aggiorna la card', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))
  await user.click(screen.getByRole('button', { name: /vivo/i }))

  expect(screen.getByRole('button', { name: /morto/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `npm test -- PlayerTracker`
Expected: FAIL — `Cannot find module './PlayerTracker'`

- [ ] **Step 3: Scrivi `src/features/players/PlayerTracker.jsx`**

```jsx
import { ROLES } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { usePartita } from '../../state/usePartita'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

export function PlayerTracker() {
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote } = usePartita()

  return (
    <section className="player-tracker">
      <AddPlayerForm roles={ROLES} onAdd={addGiocatore} />
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
Expected: PASS — 2 test

- [ ] **Step 5: Aggiorna `src/App.jsx` per montare il tracker**

```jsx
import { PlayerTracker } from './features/players/PlayerTracker'

export default function App() {
  return (
    <main className="app">
      <h1>Meltable Wolves — Narratore</h1>
      <PlayerTracker />
    </main>
  )
}
```

- [ ] **Step 6: Aggiorna `src/App.test.jsx` per ripulire localStorage tra i test**

```jsx
import { render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('renders app heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /meltable wolves/i })).toBeInTheDocument()
})
```

- [ ] **Step 7: Esegui l'intera suite di test**

Run: `npm test`
Expected: PASS — tutti i test dei task 1-6

- [ ] **Step 8: Verifica manuale mobile**

Run: `npm run dev`, apri l'URL nel browser con gli strumenti sviluppatore in modalità mobile (o da un telefono sulla stessa rete). Verifica: aggiungere un giocatore, cambiarne lo stato, attivare una condizione, scrivere una nota, ricaricare la pagina e controllare che i dati siano ancora presenti (persistenza localStorage).

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/features/players/PlayerTracker.jsx src/features/players/PlayerTracker.test.jsx
git commit -m "feat: integrate player tracker into App"
```

---

## Fuori scope per questo piano

Creazione mazzo, sequencer fase notte, fase giorno/voto e log partita sono i passi 4-7 della roadmap (vedi spec) e avranno ciascuno un proprio piano successivo, una volta completato e verificato questo.

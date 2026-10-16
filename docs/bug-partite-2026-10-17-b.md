# Verifica finale in browser delle correzioni UI/PWA di a55b561 (2026-10-17, b)

Chromium reale (Playwright, 390x844 salvo dove indicato; 360x640/844 e 768x1024 per Sfoglia mazzo e voto). Dev server porta 5662 sul working tree; PWA su build di produzione di `git archive a55b561` (costruita fuori dal repo, servita da un piccolo server statico mio su porta 5663 con `Vary: Origin` su ogni risposta). Nessuna modifica a `src/` né ai docs esistenti, nessun `dist/` creato nel repo. I miei PID (vite 5662, server 5663) sono fermati.

Nota di metodo: il working tree aveva modifiche non committate di altri (NightSequencer.jsx, AzioneBrancoLupi.jsx + test), quindi il dev server non è esattamente a55b561; le verifiche CSS/UI qui sotto non toccano quei file, la PWA è invece verificata sul commit pulito. Contrasto: formula WCAG sui colori computati reali (fondo composto lungo gli antenati, testo grande 24px o 18.66px bold = 3:1, controlli disabilitati esclusi). Partite giocate dalla UI (6-9 giocatori, notti, alba, voto, rogo, Diario).

## Scenari

### 1. Voto/esito: "Ricomincia votazione" e "Vai all'esito" - OK
- 390 e 360: pulsanti 44px di altezza, distanza orizzontale 12px (Ricomincia x16..202, Vai all'esito x214..335 a 390 e 360), nessun overflow (scrollWidth = viewport). Stato senza voti: solo "Ricomincia votazione" (186x44). Con pareggio G01=G02: stessi pulsanti, gap 12px. Spareggio vero (clic su "Vai all'esito" con pareggio): "Avvia" 79x44, "Azzera" 87x44, G01/G02 58x44, "Torna al voto" 358x44, nessun overflow. Esito con vittima unica a 360: "Dichiara morte sul rogo" 292x44, "Torna al voto" 328x44.
- Conferma "Azzerare tutti i voti?": testo e "Sì, ricomincia" sulla prima riga, "Annulla" a capo (altezza 44), "Vai all'esito" 12px sotto: nessun overflow. Annulla e Sì sono a contatto in verticale (0px) ma sfalsati in orizzontale, non sovrapposti; nessun problema reale.

### 2. Logo notturno - OK, esteticamente accettabile
In notte il logo inline ha `filter: brightness(0) invert(1)` (200x35): silhouette bianca, perfettamente leggibile su blu notte (bianco su rgb(49,71,97) = 9.53:1 per il testo bianco della stessa pagina; il rosso originale era 1.8:1). Si perde la bicromia ("Meltable" rosso / "Wolves" a contorno diventa pieno bianco) ma resta riconoscibile e coerente con il resto del tema scuro; l'icona ingranaggio viola resta a colori. Alba e giorno: filtro `none`, logo originale invariato. Home usa il logo grande (nessun filtro). Screenshot letti: header in notte/alba/giorno. Proposta facoltativa (non necessaria): nessuna, l'effetto è accettabile.
Nota: il contorno di "Wolves" nel logo di giorno (blu-grigio su azzurro) è a basso contrasto, ma è logo/decorativo (esente WCAG).

### 3. Contrasti
Valori misurati (calcolati dai colori reali):

| Testo | Fase / schermata | Rapporto | Soglia |
|---|---|---|---|
| "NOTTE N" (night-sequencer__notte, 16px bold) | notte (fondo 49,71,97) | 5.69 | 4.5 ok |
| "ALBA N" (28.8px) | alba (fondo 203,150,91) | 6.36 | 3 ok |
| "GIORNO N" / "ROGO N" (16px) | giorno/esito (fondo 140,166,198) | 4.88 | 4.5 ok |
| "Round N" nel Diario | popup in giorno/alba | 4.88 | 4.5 ok |
| "Round N" nel Diario | popup in notte | 5.69 | 4.5 ok |
| nomi dei morti all'alba (li) | alba | 5.37 | 4.5 ok |
| titoli dei gruppi del Mazzo (`legend`) | mazzo (fondo 230,205,197) | 5.43 | 4.5 ok |
| "(tieni premuto)" (13px, SMALL) | notte | 16.58 (nero su bianco) | 4.5 ok |
| "Morti" (h3) | giorno | 4.91 | ok |

Scansione automatica di tutti i nodi di testo visibili (circa 25 stati: Home, Libretto, Galleria, Scarica offline, Mazzo vuoto/pieno, Giocatori, notte (assegnazione, selezione, Branco, notte 2 con morti, Veggente), alba, Eventi speciali, giorno, conferma ricomincia, esito, post-rogo, popup Impostazioni e Diario in giorno e in notte, Sfoglia mazzo a 360/390/768): tutto >= soglia, tranne il BUG 1.

**BUG 1 (certo, contrasto, già presente prima del commit): chip del mazzo selezionate in 3 fazioni sotto 4.5:1.**
Nel pannello "Nel mazzo", le chip con `aria-pressed="true"` prendono testo bianco dalla regola `.chip[aria-pressed='true']` (specificità più alta di `button.chip--fazione-*`), che prevale sul `color` scuro previsto:
- fazione villaggio (azzurro rgb(140,166,198)): bianco = 2.5:1 ("Veggente", "Villico 1", "Guardia 1", e le ✕);
- fazione sconosciuto/variabili (ambra rgb(203,150,91)): bianco = 2.61:1 (es. "Mimo");
- non-distribuita (Fantasma Onnisciente, viola rgb(174,128,176)): bianco = 3.22:1.
Visibile a occhio nello screenshot (testo bianco su azzurro chiaro). Passi: Nuova Partita, aggiungere Veggente/Villico/Mimo/Fantasma Onnisciente al mazzo. Causa: `src/index.css` righe ~918 (`.chip[aria-pressed='true']`) vs ~996-1015 (`button.chip--fazione-villaggio`, `--fazione-sconosciuto`, `--non-distribuita`). Lo stesso problema era già stato risolto per `.chip--benevola` (riga ~968): estendere la stessa regola `.chip.chip--fazione-villaggio[aria-pressed='true'] { color: var(--pal-inchiostro) }` (idem sconosciuto, e non-distribuita con un viola più scuro o testo scuro). Lupi (rosso) e indipendenti (verde scuro) con testo bianco sono ok.

### 4. Sfoglia mazzo (a 390 salvo diversa indicazione)
- OK: apertura da tastiera (Invio sul pulsante) porta il focus sul dialogo (`DIV.sfoglia-mazzo`); ArrowRight/ArrowLeft cambiano carta (1/75 -> 3/75 -> 2/75), si fermano ai limiti (1 e 75); dallo slider le frecce e End funzionano (una sola carta per pressione, nessun doppio passo); Esc chiude dal dialogo e dallo slider; Esc dopo un clic dentro il dialogo chiude; dopo Shift+Tab il focus rientra nello slider (nessuna fuga verso elementi sottostanti: sotto non c'è nulla nel DOM). Clic sulla freccia "Carta successiva" + ArrowRight avanza.
- Frecce "←"/"→": 44x44 a 360 (x16 e x300, right 344), 390 (x16 e x330), 768; `scrollWidth` documento e dialogo = viewport su prima e ultima carta; immagine 224/254/287px di larghezza, slider 44px di altezza. Nessun overflow, nessun testo troncato, contrasto ok.
- **BUG 2 (certo, a11y minore): alla chiusura il focus non torna al pulsante "Sfoglia il mazzo", finisce su BODY.** Passi: Galleria, Sfoglia il mazzo (da tastiera o clic), Esc o "✕ Chiudi": `document.activeElement` = BODY. Causa: `MazzoGalleria.jsx:20-21` sostituisce l'intera schermata con `<SfogliaMazzo/>` (`return`), quindi il pulsante apritore viene smontato; il cleanup di `SfogliaMazzo.jsx:13-17` (`prima?.isConnected && prima.focus()`) trova `isConnected=false` e non fa nulla. Fix minimo: in MazzoGalleria rendere il dialogo sopra la schermata (senza smontarla) oppure dare al nuovo pulsante `autoFocus`/ref e rifocalizzarlo quando `sfogliaAperto` torna false.
- **DUBBIO 1 (a11y minore): nessun focus trap; Esc non chiude se il focus è fuori dal dialogo.** Con Tab dall'ultimo elemento (slider) il focus esce su BODY e a quel punto Esc non chiude (il listener è sul dialogo, `SfogliaMazzo.jsx:onKeyDown`). Un clic dentro il dialogo ripristina la funzione. Proposta: listener `keydown` su `document` finché il dialogo è montato, oppure trap del Tab. Basso impatto (uso da telefono).

### 5. `meltable-wolves-fase-app` con valori non validi - OK
Con `localStorage.setItem` + ricarica: 'boh', '', 'null', 'undefined', '5', '{"a":1}', '[1,2]', '"notte"', '{x', '__proto__', 'constructor', 'toString', 'NOTTE', ' notte' (maiuscole/spazi) e chiave assente: sempre Home (`data-fase="home"`, titolo "Meltable Wolves — Narratore"), e il valore salvato viene riscritto a 'home'. Nessun errore/warning in console. Fasi valide con le altre chiavi vuote/`{}`/`[]` (notte, alba, giorno, giocatori, mazzo, libretto, offline, mazzo-galleria): nessuna schermata bianca; notte mostra "NOTTE 1 / Nessun ruolo con azione notturna nel mazzo attuale" con "Vai all'alba", alba "ALBA 0 ... Non è rimasto nessun giocatore in vita", giorno "GIORNO 0 ... nessun voto possibile". L'uscita esiste (Diario e impostazioni -> Nuova Partita -> "Sì, ricomincia" porta alla Home). Gli schermi "ALBA 0"/"GIORNO 0" sono cosmeticamente strani ma solo con storage inconsistente (non raggiungibile giocando).

### 6. PWA su build di produzione con `Vary: Origin` - OK
- Server: ogni risposta con `Vary: Origin`. Prima installazione: SW `activated`, cache `meltable-wolves-<hash>` con 270 voci (273 nel manifest, duplicate delle icone). Subito dopo `serviceWorker.ready`, senza altre visite online, `context.setOffline(true)` + reload: l'app si apre (Home, titolo corretto, testo 76 caratteri, nessuna schermata bianca). Offline si gioca: Nuova Partita, Mazzo, giocatori, notte 1, Indietro; 0 immagini rotte; `goto('/')` e URL sconosciuto offline tornano all'app (stato Giocatori conservato).
- Manifest: `lang: "it"`, icone 192, 512 (any), 512 maskable, 1024 tutte 200 `image/png`.
- Aggiornamento (build v2 con titolo "MazzoV2" sullo stesso server): ricarica con scheda aperta: il vecchio SW resta attivo; nuova scheda: la nuova versione è in `installed`/waiting (come previsto da `registerType: 'prompt'` e nessun `skipWaiting`), compare la nuova cache `meltable-wolves-1jtcxut` accanto alla vecchia, il contenuto è già v2 (stale-while-revalidate: la risposta di rete aggiorna la cache attiva al giro successivo), offline sulla v2 funziona, lo stato della partita in localStorage resta. Non verificata l'attivazione del nuovo SW con cancellazione della cache vecchia (richiede chiusura completa del browser).
- Console: solo `net::ERR_FAILED` sul CSS di Google Fonts in modalità offline senza font in cache (nel mio ambiente senza accesso a Internet i font non sono mai stati scaricati/cache-ati, quindi non so se con rete il SW li salva e offline li serve: vedi NON COPERTO). Nessun altro errore.

### 7. document.title - OK
Home "Meltable Wolves — Narratore"; Galleria, Mazzo, Giocatori, Notte, Alba, Giorno, Libretto, Offline: "<Fase> — Meltable Wolves" (`App.jsx` TITOLI_FASE). Il titolo segue le transizioni (notte -> alba -> giorno; l'esito/rogo resta "Giorno") e torna a quello della Home con Nuova Partita. Con fase non valida: titolo Home.

### 8. Regressioni generali a 390x844 - OK
Home, Libretto (inizio e fondo), Galleria, Sfoglia mazzo, Scarica offline, Mazzo vuoto e con 12 carte (anche a fondo pagina), Giocatori con nomi lunghi ("Giovanni Battista Rossi", "Bartolomeo-Maria"), notte (8 passi tra cui Mimo, Ladro, Lupi, Paladino, Cartomante, Veggente, Branco, Chupacabra), alba, Eventi speciali (alba e giorno, sotto-vista "Annulla morte" e "Elezione Borgomastro"), giorno, esito, spareggio, popup Impostazioni e Diario: console senza errori né warning (tolto il solo errore dei font in offline), overflow orizzontale 0 su tutte, 0 elementi oltre il bordo, 0 testi troncati (ellipsis/overflow nascosto).
- Un piccolo trattino bianco a circa (257-272, 637) comparso in due screenshot della notte con 9 giocatori non è un elemento DOM (`elementFromPoint` = MAIN, nessun elemento in quel rettangolo) e non si ripresenta con altri setup: artefatto di rasterizzazione dello screenshot, non lo considero un bug.

## BUG CERTI (riepilogo)
1. Chip del mazzo selezionate con testo bianco sotto 4.5:1 per villaggio (2.5), ambra/variabili (2.61), non distribuite (3.22). `src/index.css` ~918 vs ~996-1015. Fix: regola `.chip.chip--fazione-*[aria-pressed='true']` come già per `--benevola`.
2. Sfoglia mazzo: alla chiusura il focus va su BODY invece che sul pulsante apritore. `src/features/mazzo/MazzoGalleria.jsx:20-21` + `SfogliaMazzo.jsx:13-17`.

## DUBBI
1. Sfoglia mazzo: Esc non funziona se il focus è uscito dal dialogo con Tab (nessun focus trap, handler solo sul dialogo). Proposta: handler su `document` mentre è montato.

## NON COPERTO
- Font di Google (`fonts.googleapis.com`) offline: ambiente senza rete, non so se vengono messi in cache al primo avvio online e serviti offline.
- Attivazione effettiva del nuovo service worker dopo chiusura completa del browser (e cancellazione della cache vecchia); l'aggiornamento è verificato solo fino allo stato "waiting" + contenuto v2.
- `vite preview` reale (ho usato un server statico con lo stesso header), Safari/iOS e installazione effettiva come PWA.
- Modalità scura di sistema/altri viewport per le schermate di gioco (360/768 solo voto, esito, Sfoglia mazzo).
- Eventi speciali con eventi di ruolo (Boia, Innocente, Scemo, Suocera, ecc.) e sotto-viste dell'Alchimista/Spilungone: non aperti in questo giro (coperti dai report precedenti per la logica, non rivisti per contrasto).
- Il dev server girava sul working tree con modifiche altrui non committate (notte/Branco lupi).

## Coppie di ruoli
Nessuna coppia di ruoli testata in questo giro (tema: UI/PWA).

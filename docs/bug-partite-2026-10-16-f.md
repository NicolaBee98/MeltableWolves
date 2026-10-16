# Audit finale UI/UX, accessibilita' e robustezza (2026-10-16, f)

Chromium reale (Playwright, codice a aee5f52), dev server porta 5636 e build di produzione servita con `vite preview` porta 5637. Viewport 390x844 (principale), 360x640, 768x1024 e 1280x800 dove indicato. Nessuna modifica a `src/` ne' ai docs esistenti. Contrasto calcolato con formula WCAG sui colori computati reali (testo vs fondo composto lungo gli antenati; esclusi i controlli disabilitati, esenti da WCAG). Console: nessun errore/warning in tutte le sessioni di gioco; nessun overflow orizzontale del documento in nessuna schermata/viewport. Partite giocate dalla UI (6 giocatori con notte, alba, voto, spareggio, rogo; 20 giocatori e 15 ruoli per le prestazioni); localStorage seminato solo per stati di partenza (giorno con 20 giocatori, alba con vittoria, notte con 22 giocatori/21 ruoli, Diario con 3000 voci).

## Premessa: "modalita' scura e chiara"
L'app NON reagisce a `prefers-color-scheme` (`src/index.css:17` ha `color-scheme: light` fisso; nessuna media query): con `colorScheme: dark` e `light` lo screenshot della Home e' identico byte per byte. Il tema cambia per fase (`data-fase`: Home/Mazzo/Giocatori chiari, notte blu, alba ambra, giorno/rogo azzurro). "Chiaro/scuro" qui significa quindi fasi chiare e fasi notturne; sono state verificate tutte. Non e' un difetto (scelta di prodotto), segnalato solo per completezza (DUBBIO 9).

## Esito per area

### 1. Contrasto, icone, bordi (tutte le schermate)
Verificate: Home, Libretto (a 4 viewport), Galleria, Sfoglia mazzo, Mazzo, Giocatori, Scarica offline, notte (assegnazione + ogni passo d'azione, round 1 e 2, 22 giocatori), alba (con morti, vittoria, Concludi), giorno/voto/spareggio/rogo, Eventi speciali (incluso Elezione), popup Impostazioni e Diario. Pulito: Home, Libretto, Galleria, Offline, tutti i passi notturni d'azione (nessun testo sotto soglia, ombre e bordi coerenti). Difetti reali (testo abilitato) elencati nei BUG 4-7.

### 2. Tap target, distanze, overflow, safe-area
- Nessun controllo abilitato sotto 44x44 (chip, hold-to-delete ✕, pulsanti, tab, righe interruttore 350x45, input timer 52x32 ma dentro riga cliccabile di 45px). Unica eccezione di testo: `(tieni premuto)` a 11.4px (BUG 8).
- Safe-area: presente (`env(safe-area-inset-*)`) su header, barra nav notte (`position: fixed`), popup. Nessuna sovrapposizione della barra fissa con l'ultimo contenuto (scroll ok a 360x640 con 20 giocatori).
- "Ricomincia votazione" e "Vai all'esito" sono affiancati con distanza 0px (BUG 3).
- Eventi speciali si apre in fondo alla pagina e (con 20 giocatori) porta in vista i pulsanti: ok.
- Sfoglia mazzo: la freccia "→" sborda di 7px a destra (right=397 su 390) (BUG 9).

### 3. Tastiera / focus / ARIA
- Focus visibile ovunque: outline giallo 3px (`:focus-visible` globale, `index.css:1541`). Ordine di tab coerente (Diario, bersagli, Indietro, Avanti); dopo "Avanti" il focus va al blocco "NOTTE N / Passo" (ok).
- Popup Diario/Impostazioni: `role=dialog aria-modal`, Esc chiude, focus trap, il focus torna al pulsante-ingranaggio (verificato). Pulsanti-icona con nome (`Diario e impostazioni`, `Chiudi`, `Carta precedente/successiva`, `Tieni premuto per rimuovere X`). Chip con `role=group` etichettato e `aria-pressed` coerente (verificato dopo refresh).
- Difetti: BUG 1/2 (voti senza nome), DUBBI 5-7 (titolo pagina, tablist, Sfoglia senza Esc).

### 4. Testi
Confrontati Libretto e testi ruoli con `src/data/roles.js` e `docs/testi-ui.md` (900 voci): `node scripts/testi-ui.mjs applica` => 0 modifiche, doc e codice allineati. Nel Libretto reso non ci sono asterischi, `\n` letterali, doppi spazi, parole doppie. Refusi/incoerenze: BUG 10, DUBBI 3-4.

### 5. Robustezza
- Doppio tap su Avanti (assegnazione): avanza esattamente di 1 passo. Doppio Indietro: arretra di 2 e il secondo e' no-op sul primo passo, ok. Nessun doppio avanzamento osservato.
- Refresh a meta' passo in ogni schermata: selezione chip, branco, alba, voti conservati. Si perdono (innocuo) il tempo del timer di spareggio (torna a 01:00 e fermo) e la chip "Condanna" non ancora confermata; popup/Eventi speciali si chiudono.
- localStorage corrotto: chiavi `notte`, `votazione`, `mazzo`, `partita`, `log`, `impostazioni`, `varianti-faccia`, `mostra-nome-ruolo`, `durata-timer`, `promemoria-ruoli-morti`, `variante-medium`, `addolorata-eredita-scelte` con JSON non valido, `null`, `"x"`, `[1,2]`, `{"a":1}`, `-5` (72 combinazioni, in fase notte): nessuna schermata bianca, nessun errore. UNICA eccezione: `fase-app` (BUG 1).
- localStorage che lancia su setItem (quota) o inaccessibile (SecurityError): l'app gioca normalmente, al refresh riparte dalla Home, senza alcun avviso (DUBBIO 1).
- Tab multiple: ultima scrittura vince, l'altra scheda non si aggiorna (DUBBIO 2).
- Tasto Indietro del telefono: notte resta in notte (ok, due Indietro consecutivi restano in `notte`); coerente con la decisione.
- PWA (build prod): manifest valido (`application/manifest+json`), 4 icone 200 e di tipo corretto, SW attivo con cache `meltable-wolves-<hash>` di 270 voci, uso offline ok dopo il primo giro, percorso sconosciuto offline torna alla shell, immagini di Galleria/Libretto offline senza rotture (verificato scorrendo tutta la pagina). Difetti: BUG 2 (offline subito dopo l'installazione con host che manda `Vary: Origin`), DUBBI 8, 10.
- Prestazioni: 20 giocatori/15 ruoli: ogni "Avanti" in notte 109-229 ms (click + 2 frame), aggiunta giocatore e chip rapide. Popup Diario: apertura 233 ms; render del tab Diario 1.9 s con 3000 voci (12k nodi DOM), una partita reale ne ha poche centinaia: ~200 ms stimati (DUBBIO 11).

### 6. Coerenza visiva
Stessi stili tra schermate per pulsante primario (rosso, bordo+ombra), secondario (chiaro), pericoloso (outline rosso: "Elimina tutti i giocatori"), conferma (rosso scuro), chip, avvisi (card ambra con barra laterale), vittoria (card verde). Fase notte: primario viola per tema. Incoerenze: BUG 11, DUBBI 12-13.

## BUG CERTI

Gravita': **[BLOCCA]** blocca la partita, **[FASTIDIOSO]**, **[COSMETICO]**.

1. **[BLOCCA, solo con dato corrotto]** Schermata bianca irrecuperabile se `meltable-wolves-fase-app` contiene un valore non valido.
   Passi: nella console `localStorage.setItem('meltable-wolves-fase-app','{x')` (o `null`, `"x"`, `[1,2]`, anche un nome di fase di una vecchia versione) e ricarica. Resta solo l'header (`<main data-fase="{x">` senza alcun pannello, nemmeno la Home); l'unica uscita e' cancellare manualmente lo storage.
   Causa: `src/state/useFaseApp.js:9-15` `loadFase` ritorna qualsiasi stringa non vuota senza validarla contro l'elenco delle fasi (le altre chiavi invece validano).
   Proposta: `const FASI = ['home','mazzo','mazzo-galleria','libretto','offline','giocatori','notte','alba','giorno']; return FASI.includes(v) ? v : DEFAULT_FASE`.

2. **[FASTIDIOSO / puo' bloccare l'uso offline]** Subito dopo la prima installazione l'app NON si apre offline se l'host serve i file con `Vary: Origin` (lo fa `vite preview`; succede anche con alcuni CDN/host con CORS).
   Passi (preview 5637): primo caricamento online, attendi SW `activated` (270 voci in cache), vai offline, ricarica: pagina bianca (richieste di `assets/index-*.js` e `.css` falliscono). Dopo un secondo caricamento online funziona, perche' il SW riscrive in cache le risposte con la richiesta reale. E' esattamente lo scenario dell'istruzione "Scarica offline: apri una volta online ... da ora funziona anche offline".
   Causa: `src/sw.js:48` e `:67` `caches.match(...)` rispetta `Vary`: la risposta precaricata via `cache.addAll` (senza Origin) non corrisponde alla richiesta del modulo `<script type=module crossorigin>` (con Origin).
   Verifica della correzione: copia di `dist/` servita con `Vary: Origin` e `caches.match(request, {ignoreVary: true})` (anche sul fallback `/index.html` e `/`) => offline ok al primo giro; senza => bianco.
   Proposta: aggiungere `{ ignoreVary: true }` ai tre `caches.match`.

3. **[FASTIDIOSO]** Giorno/voto: "Ricomincia votazione" e "Vai all'esito" sono attaccati (distanza 0px: box 16-202 e 202-323 sulla stessa riga, nessun margine). Due azioni diverse (una azzera i voti, anche se con conferma) a un tap di distanza sul punto piu' usato della partita.
   Causa: `src/features/giorno/Votazione.jsx:608-625`: pulsanti inline consecutivi senza gap (la conferma usa `{' '}`, questi no).
   Proposta: contenitore flex con `gap: .75rem` o `margin-bottom` come gli altri pulsanti di colonna ("Eventi speciali" e' invece separato di 16px).

4. **[COSMETICO]** Titoli di fase con contrasto insufficiente: "GIORNO N" / "ROGO N" rosso #971228 su azzurro #8ca6c6 = 3.45:1 (richiesto 4.5, 16px non e' "large"), "Round N" nel Diario (stesso colore su fondo azzurro del popup) 3.45:1; nomi dei morti all'Alba (`.alba-panel__morti li`, `--danger` su ambra) 4.14:1.
   Causa: `src/index.css:1051-1063` (`color: var(--accent)`), `index.css:1189-1192`.
   Proposta: per `[data-fase=giorno]`/popup usare `--text` o un rosso piu' scuro (#6d0c1c => > 6:1); alba: `--danger` piu' scuro.

5. **[COSMETICO]** "NOTTE N" in notte (`p.night-sequencer__notte`) viola #8a5a8c su blu #314761 = 1.78:1: quasi illeggibile (ed e' il numero di notte). Stessa regola `index.css:1051`, `--accent` viola nel tema notte.
   Proposta: in notte usare l'azzurro chiaro del "Passo N di M" (o `--pal-acqua`) per l'etichetta.

6. **[COSMETICO]** Titoli dei gruppi del Mazzo ("VILLAGGIO", "LUPI", "INDIPENDENTI", "VARIABILI", `legend`) verde #587a2c su pelle = 3.28:1 a 16px. Causa: `legend` in `index.css:136/299`. Proposta: verde piu' scuro o `--text`.

7. **[COSMETICO]** Il logo "Meltable" (rosso scuro) su fondo notte blu ha contrasto bassissimo (immagine `Titolo_in_linea.svg`, decorativa con alt). Proposta: variante chiara del logo nelle fasi notturne.

8. **[COSMETICO]** `(tieni premuto)` sul pulsante di fine notte e' a 11.4px (`<small>` in `PulsanteTieni.jsx:63`), sotto la soglia leggibile; e a 360px il pulsante va su due righe ("È giorno nel villaggio" + piccolo).
   Proposta: `font-size: .8rem` minimo.

9. **[COSMETICO]** Sfoglia mazzo (390px): la freccia "→" arriva a x=397 (7px fuori schermo) e le frecce si sovrappongono alla carta; slider nativo azzurro non tematizzato. Causa: `.sfoglia-mazzo__carta-area`/`__freccia` in `index.css`. Proposta: frecce sotto la carta o `inset` interno di 8px, `accent-color` sullo slider.

10. **[COSMETICO]** Refuso nel Libretto: "sè stessi" (accento errato, deve essere "sé stessi") in `src/data/libretto.js:62` (`**ruoli che rivelano**** ****sè stessi**`; i marcatori `** **` sparsi producono anche `<strong>` vuoti/adiacenti, innocui alla resa). Altro: `src/features/mazzo/MazzoBuilder.jsx:135` "Il Ladro richiede inserire due carte" => "richiede di inserire"; manca il punto finale nella nota del Borgomastro/Fantasma ("...che i giocatori possono avere").

11. **[COSMETICO]** Chip della "Condanna" nello spareggio: bordo/riempimento chiaro grigio (non selezionata) diverso dalle chip scure di notte e dagli altri avvisi; sembra disabilitata ma non lo e'. Solo stile (la selezionata diventa rossa). Proposta: stesso stile di `.chip` standard.

## DUBBI (con proposta)

1. **Salvataggio fallito invisibile.** Con quota piena o storage disabilitato (modalita' privata) l'app prosegue ma al refresh la partita sparisce senza preavviso. Proposta: `salvaLocale` registra l'errore e mostra una volta un avviso non bloccante "Salvataggio non disponibile: non ricaricare la pagina".
2. **Due schede aperte**: nessun listener `storage`; l'ultima scheda che scrive sovrascrive la lista giocatori dell'altra (provato: Anna aggiunta in A, Bruno in B => salvato solo Bruno, A mostra ancora Anna). Raro; proposta minima: `window.addEventListener('storage', () => location.reload())`.
3. **Genere e forme miste** nei messaggi: "e' stato resuscitato" (Alba, maschile) vs "e' stato/a resuscitato/a" vs "e' tornato/a in vita" vs "e' stato colpito" (maschile) vs "morto/a". Proposta: una convenzione (la slash-form ovunque o la forma neutra "ha perso la vita").
4. **Terminologia**: Diario "Round N" (inglese) mentre il resto usa "Notte/Giorno/Alba N" (`LogPartita.jsx:40`): proposta "Giorno N". "Nuova Partita" in Title Case vs "Concludi partita", "Ricomincia votazione" in sentence case. Libretto: Ambasciatore usa "veggente"/"ambasciatore" minuscoli mentre gli altri ruoli sono in corsivo/maiuscolo.
5. **Titolo pagina fisso**: `document.title` e' sempre "Meltable Wolves — Narratore" in ogni schermata; in tutte le schermate l'unico h1 e' il logo (alt "Meltable Wolves") e Mazzo/Giocatori hanno h3 senza h2 (salto di livello). Per screen reader la navigazione tra schermate non viene annunciata. Proposta: aggiornare `document.title` per fase ("Notte 1 - ...") e dare a "Nuova Partita"/"Giocatori" un h2.
6. **-1/+1 del voto senza nome**: ogni riga ha pulsanti "-1" e "+1" con identico nome accessibile (`Votazione.jsx:584/587`, non c'e' `aria-label`). Per VoiceOver sono 10 pulsanti identici. Proposta: `aria-label={`Togli un voto a ${g.nome}`}` / `Aggiungi un voto a ...` e il segno meno tipografico "−1".
7. **Sfoglia mazzo non e' un dialog completo**: `SfogliaMazzo.jsx:27` ha `role=dialog` senza `aria-modal`, Esc non chiude, le frecce della tastiera non cambiano carta, il focus non entra nel dialog (activeElement = body) e non torna a "Sfoglia il mazzo" alla chiusura; `useDialogA11y` esiste e non e' usato qui (lo usano popup e CartaSchermoIntero). Anche il tablist del popup (`LogImpostazioniPopup.jsx:76-79`) non ha `aria-controls`/`tabpanel` ne' frecce.
8. **Font di Google non in precache** (`index.html`): offline, una famiglia/peso mai richiesto online (es. Baloo 2 `error` nel test) cade su system-ui: titoli diversi dall'online. Proposta: self-host dei woff2 in `public/` (entrano nel precache gia' configurato).
9. **Nessuna reazione a `prefers-color-scheme`** (vedi premessa) e controlli nativi (slider, select) in schema chiaro. Solo se volete un tema scuro generale.
10. **Manifest `lang: "en"`** (generato dal plugin, l'app e' `it`) e SW module-less ok; aggiungere `lang: 'it'` in `vite.config.js` manifest. Aggiornamento versione: la logica (nessun `skipWaiting`, cache col hash, `clients.claim`) e' coerente con `registerType: 'prompt'`, ma non provata con due build successive (vedi NON COPERTO).
11. **Diario con migliaia di voci** lento (1.9 s a 3000 voci): irrilevante in partita reale; se si vuole, rendere solo il round corrente + "Mostra precedenti".
12. **Home mid-partita**: dalla schermata Giocatori raggiunta da "Torna ai giocatori" (oppure col tasto Indietro del telefono Giocatori -> Mazzo -> Home), la Home non ha "Riprendi partita" e "Nuova Partita" (`App.jsx:98-101` `iniziaNuovaPartitaDaHome`) azzera subito ruoli, notte e Diario senza la conferma che invece ha "Nuova Partita" nel popup. Proposta: confermare quando `partitaAvviata`.
13. **"Passo N di M" non coincide col numero di passi reali**: in una notte con 22 giocatori/21 ruoli il contatore mostrava "Passo 14 di 23" ma i passi erano 21; con 20 giocatori "di 15" diventava "di 14" a meta' assegnazione. Causa probabile: `NightSequencer.jsx:979` usa `totalePassi` comprensivo di passi poi omessi (ruoli morti/non assegnati). Cosmetico; proposta: calcolare il totale sui passi effettivamente mostrati.
14. **Alba**: l'elenco dei morti mostra solo il nome in rosso senza intestazione ("Morti questa notte"), mentre il caso vuoto dice "Nessuno è morto questa notte." Proposta: intestazione o frase "Questa notte è morto/a: ...". Eventi speciali ha due chiusure (✕ e "Chiudi") ridondanti.

## NON COPERTO
- Aggiornamento di versione del SW con due build diverse (letto da codice, non provato); installazione reale su iOS/Android e tasto Indietro in standalone (provato solo history in Chromium desktop).
- Zoom di sistema/testo grande (200%), High Contrast / forced-colors, lettori di schermo reali (solo albero ARIA di Chromium).
- Trascinamento per riordinare i giocatori con touch, hold-to-delete con touch reale (provato con mouse e tastiera).
- ErrorBoundary non provocato (nessun modo di far lanciare un render senza toccare `src/`).
- Eventi speciali: solo Elezione Borgomastro aperta a viewport diversi; le altre sotto-form (Boia, Alchimista, Scemo, Unzione...) non riverificate (coperte dai report precedenti).
- Passi notturni con carta ignota/Mimo/Ladro con menu aperti in tutte le varianti (solo avvio e contrasto) e Libretto riletto integralmente a 768/1280 (solo audit automatico + screenshot a 390).
- Safari/Firefox (solo Chromium 1246).

## Coppie ruoloA x ruoloB
(Non applicabile: questo audit non valuta coppie di ruoli.)

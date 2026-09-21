# Bug report — 2026-09-17

## Stato: tutti corretti — 2026-09-17

Tutti gli 11 bug elencati sotto (i 10 della review statica + il #11 trovato
dal vivo) sono stati corretti, con test aggiornati/aggiunti e verifica dal
vivo in browser per i casi più a rischio (#1, #2, #4, #8, #11). Suite: 250
test, tutti verdi. Riepilogo dei fix:

1. **Pozione mortale ignora la protezione**: `uccidiPatch` accetta ora
   `{ ignoraProtezione: true }`, usato solo da `AzioneStrega` per la pozione
   mortale. Branco Lupi e Chupacabra restano bloccati da `protetto`, come da
   regole.
2. **Crepacuore degli innamorati**: `usePartita.aggiornaGiocatore` applica
   `applicaCrepacuore` ogni volta che un patch mette `vivo:false` — ogni altro
   giocatore vivo con condizione `innamorato` muore con `causaMorte:
   'crepacuore'`. Semplificazione dichiarata (ponytail) in `effettiNotte.js`:
   assume una sola coppia in gioco.
3. **Reset/uscita da partita**: nuovi `resetPartita`/`resetMazzo`/
   `resetNotte`/`resetLog` più un pulsante "Nuova Partita" (con conferma)
   nel tab Impostazioni del popup Registro, sempre raggiungibile da qualsiasi
   schermata di gioco.
4. **Anti-doppio-uso azioni notturne**: nuovo campo `usiNotte` (azzerato ad
   ogni "Notte successiva") con helper `usatoStanotte`/`segnaUsoStanotte` in
   `effettiNotte.js`, applicati a Paladino/Untore/Fattucchiera/Maga,
   Pifferaio/Sacerdote, Branco Lupi, Chupacabra, Veggente e — bonus, stesso
   bug — Cortigiana. "Salta" ora marca l'azione come usata invece di essere
   un no-op.
5. *(non ancora verificato dal vivo — solo review statica)* legami risolti
   un ciclo tardi se il bersaglio muore di rogo: non modificato in questa
   sessione, resta da affrontare.
6. **Log con round sbagliato**: `useLog` ora attribuisce gli eventi al round
   precedente quando `round` e `giocatori` cambiano nello stesso batch (fine
   notte), invece del round appena incrementato.
7. **Pozione sprecata senza avviso**: `AzioneStrega` mostra un avviso
   inline quando `aggiungiCondizionePatch`/`uccidiPatch` non hanno effetto.
8. **Morte improvvisa non indipendente dalla votazione**: il componente è
   ora renderizzato anche in `NightSequencer` e `AlbaPanel`, non solo in
   `Votazione`.
9. **Passi notturni di ruoli morti non rimossi**: `passiNotte` salta un
   passo di ruolo quando non ci sono più posti da assegnare per quel ruolo
   e nessun titolare è vivo.
10. **Guardia Mannara senza Guardie solo lato UI**: `useMazzo.setQuantita`
    azzera `guardia-mannara` quando `guardia` scende a 0; `validaMazzo`
    avvisa se lo stato è comunque incoerente (es. dati vecchi in
    localStorage).
11. *(trovato dal vivo, non nella review statica)* nessuna validazione
    giocatori/ruoli mazzo, nessun avviso se un ruolo resta permanentemente
    non assegnato: aggiunti avvisi non bloccanti in `App.jsx` e
    `NightSequencer.jsx` (senza bloccare il flusso, per non rompere i
    workflow esistenti). Corretto anche un bug collaterale scoperto durante
    il fix: `ruoliPendenti` in `NightSequencer` considerava "da assegnare"
    anche varianti di ruolo (es. Nonna, Capobranco) non presenti nel mazzo,
    per via del default `?? 1` di `ruoliAssegnabili`.

Non toccato in questa sessione, fuori scope rispetto ai bug segnalati:
Nano/Ubriaco/Eremita/Pastore non sono mai assegnabili a un giocatore tramite
l'UI (esistono solo nel promemoria "potere-passivo") — non è un bug
segnalato, ma una lacuna strutturale del sistema di assegnazione ruoli.


Trovati con code review statica (letta tutta l'app, tutti i 211 test unitari
passano — questi bug sono edge case/integrazione non coperti dai test).
Test dal vivo nel browser (Playwright) ancora da fare: bloccato da
MCP Playwright non riconnesso con `--browser chromium` (vedi `.mcp.json`).

## Severità alta

1. **Pozione mortale Strega/morsi Branco/Chupacabra bloccati da `protetto`, contro le regole.**
   `src/data/effettiNotte.js:6-9` (`uccidiPatch`) ritorna `null` se il bersaglio
   ha `protetto`. Ma `src/data/conditions.js:17` dice esplicitamente: "La
   protezione non blocca la pozione mortale né altri poteri". Scenario:
   Paladino protegge X, Strega avvelena X → nessun effetto (sbagliato).

2. **Innamorati non muoiono mai per "crepacuore".**
   La condizione `innamorato` viene solo assegnata
   (`src/features/notte/azioni/index.js:18`), ma non esiste nessuna logica
   (in `risoluzioneNotte.js`, `NightSequencer.jsx`, `Votazione.jsx`) che
   uccida il secondo innamorato quando muore il primo. Richiesto sia da
   `src/data/conditions.js:7` sia dalla spec di design.

3. **Nessun reset di stato su "Nuova Partita", nessuna via di ritorno a Home.**
   `src/App.jsx:37` passa da Home a Mazzo ma nessun punto richiama più
   `setFaseApp('home')`. `usePartita`, `useMazzo`, `useNotte`, `useVotazione`,
   `useLog` persistono ciascuno su `localStorage` senza mai essere azzerati:
   iniziare una nuova partita mescola dati della partita precedente.

4. **Azioni notturne a bersaglio singolo senza blocco anti-doppio-uso.**
   `src/components/SceltaGiocatore.jsx:22` +
   `src/features/notte/azioni/AzioneCondizioneSingola.jsx`: il bottone
   "Conferma" resta sempre cliccabile, nessun controllo se l'azione è già
   stata usata quella notte. Riguarda Paladino, Untore, Fattucchiera, Maga,
   Branco Lupi, Chupacabra: si può applicare l'effetto più volte nella stessa
   notte con bersagli diversi. `AzioneIndagine.jsx` sovrascrive silenziosamente
   l'esito precedente allo stesso modo.

## Severità media

5. **Legami persistenti risolti con un ciclo di ritardo in più se il
   bersaglio muore per rogo invece che di notte.**
   Cavaliere/Apprendista/Figlia dei Lupi: `risoluzioneNotte.js`, chiamato da
   `src/features/notte/NightSequencer.jsx:50` solo a fine notte. Se il
   bersaglio muore per rogo durante il giorno, la risoluzione scatta una
   notte dopo il previsto.

6. **Eventi di fine-notte loggati con il round sbagliato (già incrementato).**
   `src/state/useLog.js` + `src/features/notte/NightSequencer.jsx:42-53`:
   pulizia condizioni, risoluzione legami e `nuovaNotte()` avvengono nello
   stesso batch sincrono, quindi il log registra questi eventi come
   appartenenti alla notte N+1 invece che N.

7. **`AzioneStrega.jsx` marca le pozioni come "usate" anche se il patch è
   `null`** (nessun effetto reale, es. bersaglio già protetto) — pozione
   sprecata senza alcun avviso al narratore.

8. **"Morte improvvisa" raggiungibile solo da Voto/Esito, non da Notte/Alba**,
   contro la spec che la vuole "sempre disponibile e indipendente dalla
   votazione" (Boia, Untore, Scemo del Villaggio).

## Severità bassa

9. **`src/data/nightSteps.js` non salta i passi dei ruoli i cui titolari sono
   morti** — restano nel sequencer per tutta la partita invece di sparire.

10. **`src/state/useMazzo.js:30-33`**: il vincolo "Guardia Mannara richiede
    Guardie" è applicato solo lato UI (disabled sulla checkbox in
    `MazzoBuilder.jsx:81`), non nello state — lo stato non è auto-consistente
    se manipolato da altrove.

## Conferme dal vivo (Playwright, browser Chromium) — 2026-09-17

Partita di prova: 8 ruoli nel mazzo (2 Lupo Mannaro, Paladino, Strega,
Veggente, 3 Villico), 9 giocatori aggiunti. Flusso completo Home → Mazzo →
Giocatori → Notte 1 → Alba → Voto → Esito → Notte 2.

- **Bug #1 (pozione mortale bloccata da `protetto`) — CONFERMATO dal vivo.**
  Strega ha usato "Pozione vitale" su Elena (che imposta anch'essa la
  condizione `protetto`, vedi `AzioneStrega.jsx:12`) e poi "Pozione mortale"
  sulla stessa Elena: nessun effetto, Elena resta viva
  (`vivo: true, condizioni: ["protetto"]` in localStorage). Riproducibile
  anche solo con le due pozioni della Strega, senza bisogno del Paladino.

- **Bug #7 (pozione marcata "usata" senza avviso) — CONFERMATO.** Dopo la
  pozione mortale sprecata su Elena, la UI mostra solo "Pozione mortale già
  utilizzata", nessun avviso che non ha avuto effetto.

- **Bug #4 (nessun blocco anti-doppio-uso) — CONFERMATO due volte.**
  - Veggente (Bruno): confermata un'indagine su Anna, poi senza alcun blocco
    è stato possibile cambiare bersaglio e confermare di nuovo su Dario nello
    stesso passo notturno. Il registro non riporta nessuna delle due
    indagini (solo l'assegnazione ruolo), quindi il narratore non ha
    riscontro di chi sia stato davvero indagato.
  - Branco dei Lupi: con 2 Lupi Mannari nel mazzo, dopo aver confermato
    "Il branco sbrana" su Giulia il controllo è rimasto pienamente attivo;
    confermando di nuovo su Hugo **entrambi** sono morti nella stessa notte
    (`Giulia` e `Hugo` con `causaMorte: "notte"` nello stesso round) — un
    branco dovrebbe poter uccidere una sola vittima a notte.

- **Bug #6 (log con round sbagliato) — CONFERMATO.** Nel registro compare
  "Notte 2: Elena ha perso la condizione 'protetto'" mentre l'app era ancora
  nell'Alba della Notte 1 (Notte 2 non era ancora iniziata quando l'evento è
  stato generato).

- **Bug #9 (passi di ruoli morti non rimossi) — CONFERMATO.** Bruno
  (Veggente) è stato dichiarato morto con "Morte improvvisa" in Esito. Alla
  Notte 2 il passo "Veggente" si presenta comunque (Passo 2 di 4), mostra
  "Bruno (morto)" e richiede comunque un click su "Avanti" per essere
  superato, senza alcuna azione utile.

- **Bug #3 (nessuna via di ritorno a Home) — CONFERMATO.** Una volta usciti
  da `faseApp === 'home'` non esiste più, in nessuna schermata (Notte, Alba,
  Voto, Esito, popup "Registro e impostazioni"), un modo per tornare alla
  Home o iniziare una nuova partita: il tab "Impostazioni partita" del popup
  mostra solo il placeholder "Impostazioni in arrivo." Confermato anche nel
  codice: in `src/App.jsx` `setFaseApp('home')` non viene mai richiamato
  dopo il click iniziale su "Nuova Partita".

- **Bug #2 (innamorati non muoiono per crepacuore) — CONFERMATO.** Impostata
  la condizione `innamorato` su Carlo e Dario, poi dichiarata la morte di
  Carlo con "Morte improvvisa" in Esito: Carlo risulta `vivo: false`, Dario
  resta `vivo: true` con `condizioni: ["innamorato"]` ancora presente —
  nessuna cascata di morte per il partner. (La UI per assegnare
  manualmente `innamorato` esiste solo in `PlayerCard`/`PlayerTracker`,
  visibile esclusivamente nella fase "giocatori" prima dell'inizio della
  notte: una volta avviata la partita non c'è più alcun modo, nemmeno per
  il narratore, di vedere o modificare le condizioni di un giocatore al di
  fuori delle azioni notturne che le assegnano — coerente con il bug #3,
  nessuna via per tornare a quella schermata.)

- **Bug #10 (vincolo Guardia Mannara solo lato UI) — CONFERMATO.** Impostato
  direttamente lo stato del mazzo a `{ 'guardia-mannara': 1 }` (senza alcuna
  Guardia): il Mazzo Builder si carica comunque, `validaMazzo` non produce
  alcun avviso sull'incoerenza, e la checkbox "Guardia Mannara" appare
  **checked + disabled**, quindi il narratore non può più deselezionarla da
  UI in quello stato. Continuando la partita non si verifica un crash: il
  passo notturno "Guardia Mannara (riconosce le Guardie)" compare come
  "Nessuna azione richiesta" e non ha mai alcun effetto per l'intera
  partita — una carta silenziosamente morta nel mazzo, senza che nessun
  avviso lo segnali al narratore in fase di composizione.

### Nuovo bug trovato dal vivo (non nella review statica)

11. **Nessuna validazione tra numero di giocatori aggiunti e ruoli nel
    mazzo, né tra ruoli del mazzo e ruoli effettivamente assegnati.**
    - `PlayerTracker`/`AddPlayerForm`: è stato possibile aggiungere 9
      giocatori pur avendo composto un mazzo da 8 ruoli; "Inizia la notte"
      resta cliccabile senza alcun avviso di mismatch.
    - `NightSequencer`: per ogni passo di assegnazione ruolo il bottone
      "Avanti" resta sempre cliccabile anche con "Nessun giocatore assegnato
      a questo ruolo per ora" — cliccandolo (testato con Paladino) il
      sequencer passa al passo successivo lasciando quel ruolo del mazzo
      permanentemente non assegnato a nessun giocatore, senza nessun
      avviso né modo di tornare indietro per assegnarlo (il round è ormai
      passato al passo successivo). Con 9 giocatori per 8 ruoli, un
      giocatore (Nono) resta anche lui senza ruolo per l'intera partita.

## Da fare nella prossima sessione

- Bug confermati dal vivo: #1, #2, #3, #4, #6, #7, #9, #10 e il nuovo #11
  sono ora verificati end-to-end, non solo da code review statica — pronti
  per essere pianificati come fix.
- Ancora da verificare dal vivo: solo il bug #5 (legami/Cavaliere-
  Apprendista-Figlia dei Lupi risolti un ciclo tardi se il bersaglio muore
  di rogo) — richiede un mazzo con uno di quei ruoli e un decesso da
  votazione anziché notturno, non ancora provato in sessione.
- Stato del browser: localStorage azzerato a fine sessione (`localStorage.
  clear()`), app tornata alla schermata Home pulita; dev server Vite già
  attivo su `localhost:5173`.

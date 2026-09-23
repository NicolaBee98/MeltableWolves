# Revisione estesa del codice — 2026-09-23

Revisione mirata a bug, edge case e manutenibilità del codice, **non** al regolamento (per quello vedi `docs/audit-ruoli-2026-09-22.md`). Metodo: tre analisi indipendenti in parallelo (livello stato/logica dati, componenti azione notturna, livello giorno/UI/app), poi verifica e correzione di quanto emerso. 443 test passano, build pulita, 8 commit (`c6d0658`…`9bf341d` più questo).

## Bug corretti

1. **Morte della Cortigiana invisibile all'alba.** `risolviCortigiana` impostava solo `vivo:false`, senza `causaMorte`/`mortoNotte`: l'annuncio dell'alba (che filtra su questi campi) non la citava mai come morta, pur essendo morta a tutti gli effetti nello stato.
2. **Il Boia poteva giustiziare se stesso.** Il secondo passo dell'evento non escludeva l'id del Boia dai candidati (a differenza del flusso gemello dell'Alchimista, che già lo faceva).
3. **"Elezione Borgomastro" restava sempre proponibile.** Anche con un Borgomastro vivo e in carica, un tap per sbaglio lo sostituiva silenziosamente. Ora l'evento ricompare solo dopo la sua morte, come dice il testo del ruolo stesso.
4. **Il Ladro poteva scartare una carta già in mano ad altri.** Le due tendine "carte rimaste fuori dal mazzo" non escludevano i ruoli già assegnati (es. dal Mimo un passo prima), né impedivano di scegliere la stessa carta in entrambe le tendine — in quel caso la quantità nel mazzo veniva decrementata una volta sola invece di due.
5. **Il Mimo produceva dati incoerenti sul ruolo imitato.** Diventando letteralmente il ruolo del bersaglio (comportamento voluto), l'app aveva due giocatori con lo stesso `ruoloSlug`; le azioni che scrivono un esito specifico dell'attore (indagini, visite, interrogatori) lo scrivevano solo sul primo dei due trovati nell'array, lasciando l'altro "vuoto". Ora questi dati si sincronizzano su entrambi (Veggente, Veggente Mannaro, Cartomante, Medium, Inquisitore, Cortigiana).
6. **Crash potenziale su dati salvati da uno schema precedente.** Molte funzioni leggono `giocatore.condizioni.includes(...)` senza controllare che sia un array. I dati caricati da localStorage ora vengono normalizzati una volta sola al caricamento, invece di richiedere un controllo sparso in ogni funzione.

## Edge case corretti

- **Vicoli ciechi negli Eventi speciali.** Scemo del Villaggio, Morte per unzione, Boia, Alchimista, Elezione Borgomastro e Fantasma Onnisciente non avevano un modo per uscire a metà flusso senza completare la dichiarazione o ricaricare la pagina. Aggiunto un "Annulla" a ciascuno.
- **Vicoli ciechi nel branco.** Le schermate di parità del Berserker e di trasformazione del Progenitore (`AzioneBrancoLupi`) non avevano un'uscita: ora un pulsante annulla e torna alla scelta del bersaglio.
- **Riordino giocatori inaffidabile su touch/tastiera.** Il drag & drop nativo HTML5 (aggiunto la sessione scorsa) non è garantito su iOS Safari e non è operabile da tastiera. Aggiunti pulsanti ▲/▼ come meccanismo che funziona sempre, mantenendo il trascinamento come scorciatoia comoda su desktop.
- **Drop con target non più esistente** in `PlayerTracker` ora è ignorato invece di corrompere l'ordine.
- **Timer con decimali** ora viene arrotondato invece di essere accettato così com'è.
- **Pulsanti "Salta" che non facevano nulla** (Strega, Addolorata) rimossi: erano poteri facoltativi che non richiedono conferma.

## Pulizia (manutenibilità)

- `fazioneDi()` e `nomeRuolo()` erano ridichiarate identiche in 6 file diversi; ora vivono una sola volta in `roles.js` e vengono importate.
- Rimosso codice morto: `vicini()`/`vicinoPiuVicinoChe()` (sostituite da tempo da `viciniVivi`/`viciniPiuViciniChe`, zero chiamate in produzione) e l'export inutilizzato di `QUANTITA_RUOLI`.
- `AzioneBrancoLupi`'s `usiStanotte()` non si fida più del primo lupo trovato nell'array per contare gli usi della notte.
- Corretto un commento fuorviante in `NightSequencer.jsx` sullo stato "stale" di `giocatori` dopo `autoAssegnaVillici()` (oggi innocuo, ma il commento indicava la cosa sbagliata).

## Cosa NON ho toccato, e perché

Le tre analisi hanno segnalato anche una serie di miglioramenti strutturali legittimi che **non ho applicato**, perché sono giudizi di priorità/gusto più che bug, e per un'app di queste dimensioni un refactoring non richiesto rischia di essere over-engineering. Li elenco così puoi decidere se vale la pena:

- **`EventiSpeciali.jsx` (327 righe) moltiplica 10 tipi di evento** attraverso due schemi ripetuti copiati e incollati ("chi è / chi fa" a due passi, e "scegli un giocatore + conferma"). È probabilmente il punto dove sono scivolati sia il bug del Boia (punto 2) sia i vicoli ciechi — una tabella dichiarativa `{chiave, etichetta, disponibile, render}` o un piccolo wrapper riutilizzabile eliminerebbe la duplicazione. Non l'ho fatto perché tocca l'intero file e non è un bug in sé.
- **`NightSequencer.jsx` (389 righe) fa troppe cose**: rilevamento notte bloccata, calcolo dei passi, uno stack di undo non banale, il pattern delle selezioni pendenti, l'auto-assegnazione dei Villici, la pulizia di fine notte, la risoluzione della Cortigiana e gli annunci dell'alba. Lo stack di undo e il blocco di fine notte sarebbero candidati naturali per essere estratti (un hook `useUndoStorico`, una funzione dati `risolviFineNotte()`), ma è un componente che funziona e ha una suite di test consistente: non l'ho toccato senza una ragione concreta.
- **Duplicazione minore tra `GiornoPanel.jsx` e `AlbaPanel.jsx`** (`dichiaraRivelazione` e `dichiaraElezioneBorgomastro` identiche in entrambi): 7 righe in due posti, basso rischio ma da tenere a mente se cambiano.
- **`varianteMedium`/`onCambiaQuantita` passati a tutti i componenti azione** anche se solo 1-2 li usano: funziona (i prop extra vengono ignorati), ma è un accoppiamento implicito.

## Copertura test

Ho aggiunto test per ogni bug/edge-case corretto sopra, più: `propagaUnzione` (non aveva test diretti, solo indiretti), `aggiornaTuttiConRuolo`, e un test end-to-end che verifica la sincronizzazione dei dati quando due giocatori condividono un ruolo per via del Mimo.

Aree ancora scoperte, segnalate ma non colmate (richiederebbero più tempo che il bug in sé non giustifica): interazione "Indietro" globale del `NightSequencer` con lo stato locale di `AzioneBrancoLupi` (mitigata dai nuovi "Annulla" in-componente, ma non testata end-to-end); combinazione Berserker-in-parità + Progenitore-può-trasformare sullo stesso bersaglio nella stessa notte.

## Appendice — dubbi aperti (da rivedere tu)

**A. Chi può bersagliare se stesso di notte?** Il codice è incoerente: Veggente, Veggente Mannaro, Cartomante, Medium, Inquisitore, Cortigiana e i ruoli con "legame" (Apprendista, Cavaliere, Figlia dei Lupi) escludono esplicitamente se stessi dai candidati; Paladino, Fattucchiera, Maga, Strega (entrambe le pozioni) e Chupacabra no. Per alcuni ha senso ovviamente (il Paladino può proteggere se stesso, è nel regolamento), ma per altri non è chiaro se sia una scelta deliberata o una svista. Vuoi che uniformi tutti secondo una policy esplicita? Se sì, dimmi ruolo per ruolo (o per categoria) chi può/non può.

**B. Il branco può sbranare un proprio membro?** `AzioneBrancoLupi` non esclude i lupi stessi (incluso il Progenitore) dai bersagli proponibili. È molto probabile che sia solo una dimenticanza (fuoco amico non ha senso), ma prima di escluderli a codice volevo conferma che non ci sia qualche variante di regolamento in cui è previsto (es. un lupo "tradito" da un compagno).

Se confermi che sono semplici sviste, li sistemo subito senza bisogno di altro.

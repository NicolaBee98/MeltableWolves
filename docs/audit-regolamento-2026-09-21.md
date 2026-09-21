# Audit regolamento vs implementazione — 2026-09-21

Confronto sistematico tra `Impaginazione libretto bozza 2.pdf` (32 pagine) e il
codice in `src/`. Aggiornato progressivamente mentre le correzioni vengono
applicate: ogni voce ha uno stato.

Stati usati:
- ✅ **OK** — corrisponde al regolamento, nessuna azione necessaria.
- 🔧 **FIX** — bug non ambiguo, corretto in questo giro (vedi commit/file).
- 🟡 **GAP APERTO** — funzionalità mancante o incompleta, non risolta in questo
  giro (troppo ampia per il tempo disponibile, o richiede una decisione di
  design). Ha una raccomandazione ma non è stata implementata.
- ❓ **DOMANDA** — il regolamento è ambiguo o silente; serve una risposta
  dell'utente prima di poter decidere come implementare/correggere.

## ⚠️ Scoperta più importante dell'audit (letta dal vivo in browser, non solo dal codice)

**I ruoli senza alcuna azione o riconoscimento notturno (a partire dal
Villico, il più comune di ogni mazzo!) non venivano MAI assegnati a nessun
giocatore.** La notte era costruita come una sequenza di "passi" (uno per
ogni ruolo con qualcosa da fare o da riconoscere di notte); qualunque ruolo
assente da quella lista — Villico, Spilungone, Boia, Ambasciatore,
Berserker, Mezzosangue, Borgomastro, Alchimista, Innocente, Suocera,
L'Antico, Scemo del Villaggio — semplicemente non compariva mai in nessuno
step, quindi `ruoloSlug` restava `undefined` per quei giocatori per tutta
la partita. Effetto pratico: in un mazzo tipico (dove i Villici sono spesso
la maggioranza), la maggior parte dei giocatori non aveva mai un'identità
di ruolo registrata nell'app — rendendo inutilizzabili in pratica anche
funzionalità corrette a livello di codice (es. l'annuncio dell'Ambasciatore,
o i fix per Spilungone/Berserker/Mezzosangue appena scritti in questo
stesso giro). L'ho scoperto **solo** costruendo una partita di prova dal
vivo (non sarebbe emerso da una lettura del codice a compartimenti
stagni). 🔧 **Corretto**: nuovo passo "Assegna i ruoli rimanenti" a fine
prima notte (vedi punto 0 più sotto), verificato dal vivo end-to-end
(assegnazione → morso del branco su un Berserker → reazione sul lupo più
vicino → annuncio di vittoria all'alba).

## 🆕 Giro 2 (stesso giorno, a seguito delle tue precisazioni)

Hai corretto un'assunzione sbagliata del giro 1: i ruoli che si rivelano
**di giorno** (Boia, Spilungone, Alchimista, Innocente, L'Antico, Scemo del
Villaggio) non vanno forzati in un passo notturno fisso, perché il
narratore potrebbe non sapere ancora chi si rivelerà. Ho quindi:

- Tolto questi ruoli dal passo automatico "Assegna i ruoli rimanenti"
  (che ora copre solo Villico, Ambasciatore, Berserker, Mezzosangue,
  Suocera — ruoli il cui meccanismo richiede che l'app sappia chi sono
  PRIMA che si rivelino, o che non si rivelano mai spontaneamente).
- Trasformato il menu "💀 Morte improvvisa" in **"🎭 Eventi speciali"**
  (`EventiSpeciali.jsx`), con: Morte improvvisa (invariata), Rivelazione
  personaggio (assegna uno dei ruoli sopra quando si rivela davvero), Il
  Boia giustizia, L'Alchimista esplode, Il Bardo salta la notte, Il Gallo
  Mannaro salta il giorno, Elezione Borgomastro. Ogni voce compare solo se
  il ruolo è nel mazzo e nella fase giusta (☀️ giorno o 🌅 alba).
- Implementato **tutti** i ruoli rimanenti tranne il Fantasma Onnisciente
  (come richiesto): L'Antico (due vite + Maledetto), Bardo/Gallo Mannaro
  (saltano notte/giorno), Borgomastro (elezione — voto doppio **non**
  automatizzato, vedi domanda), Alchimista, Boia, Ladro (due carte di
  scarto nel mazzo), Mimo (si risveglia col ruolo imitato), maturazione
  del Cucciolo, vittoria del Pifferaio da ultimo sopravvissuto.
- Aggiunto icone di condizione/ruolo nella lista di voto, ruolo
  nascondibile da un'impostazione (delegato a un agente in parallelo,
  poi unito a mano).
- **Trovato e corretto dal vivo un secondo bug reale**: quando il Ladro
  assumeva un ruolo (es. Veggente) da una delle sue carte di scarto,
  quel ruolo non generava mai i suoi passi notturni successivi, perché
  non faceva parte del mazzo originale. Vedi punto 24 più sotto.

## Sommario rapido

| # | Argomento | Stato |
|---|---|---|
| 0 | Ruoli senza azione notturna (Villico compreso) mai assegnabili a un giocatore | 🔧 FIX (scoperta più rilevante dell'audit) |
| 1 | Cortigiana: immunità al bersaglio diretto dei lupi | 🔧 FIX |
| 2 | Nano: immunità totale ai lupi di notte | 🔧 FIX |
| 3 | Criceto Malvagio: immunità totale ai lupi di notte | 🔧 FIX |
| 4 | Polpo Mannaro → Veggente "accecato" | 🔧 FIX |
| 5 | Condizioni "unto"/"trasformato" mai rimosse | 🔧 FIX |
| 6 | Apprendista/Cavaliere/Figlia dei Lupi: risoluzione ritardata di un giorno se il "maestro" muore al rogo | 🔧 FIX |
| 7 | Berserker: uccide il lupo più vicino se sbranato | 🔧 FIX (verificato dal vivo) |
| 8 | Ubriaco: se sbranato, blocca i lupi la notte successiva | 🔧 FIX |
| 9 | Mezzosangue: se sbranato diventa lupo invece di morire | 🔧 FIX |
| 10 | Cucciolo di Lupo Mannaro: vendetta doppia se ucciso + maturazione | 🔧 FIX (vedi tua precisazione, punto 5) |
| 11 | Cartomante, Inquisitore, Medium, Veggente Mannaro: nessuna azione interattiva | 🔧 FIX (verificato dal vivo) |
| 12 | Bardo / Gallo Mannaro: potere di saltare notte/giorno mai attivabile | 🔧 FIX (verificato dal vivo, vedi nota su Bardo) |
| 13 | L'Antico: due vite + condizione "Maledetto" | 🔧 FIX |
| 14 | Borgomastro: voto doppio + elezione | 🔧 FIX (parziale: elezione sì, voto doppio no — vedi domanda) |
| 15 | Spilungone: immunità al rogo | 🔧 FIX |
| 16 | Alchimista: esplosione al rogo | 🔧 FIX |
| 17 | Ladro: due carte extra nel mazzo | 🔧 FIX (verificato dal vivo) |
| 18 | Mimo: imita un ruolo per tutta la partita | 🔧 FIX (vedi nota su cosa è stato semplificato) |
| 19 | Fantasma Onnisciente: carta consegnata al primo morto | 🟡 non implementato su tua esplicita richiesta |
| 20 | Alba: annunci mancanti per resuscitati/unti/trasformati | 🔧 FIX |
| 21 | Ordine "identifica-branco" nella prima notte | 🔧 FIX (riordino, cosmetico) |
| 22 | Pifferaio: vittoria se resta l'unico vivo | 🔧 FIX (confermato: vince comunque) |
| 23 | Innocente, Guardia, Guardia Mannara, Mucca Mannara, Suocera | ✅ OK |
| 24 | Ruolo assunto dal Ladro invisibile ai passi notturni successivi | 🔧 FIX (bug trovato dal vivo in questo giro) |
| 25 | Icone condizione/ruolo in votazione, ruolo nascondibile | 🔧 FIX |

Le sezioni seguenti dettagliano ogni voce.

---

## 🔧 Fix applicati in questo giro

### 0. Ruoli senza azione notturna mai assegnabili a un giocatore

Vedi la sezione "Scoperta più importante" in cima al documento per il
contesto. **Fix**: `nightSteps.js` calcola ora l'insieme di tutti i ruoli
che non compaiono in nessuno step dedicato (a partire da `ROLES`, la lista
completa dei 51 ruoli) e aggiunge un passo `assegna-restanti` subito dopo
l'ultimo passo "solo prima notte" esistente (dopo "Mucca Mannara" si
riconosce, prima delle azioni "ogni notte" come Fattucchiera/Branco dei
Lupi/ecc.) — così un ruolo come Berserker o Mezzosangue ha già un'identità
nota quando il branco decide chi sbranare quella stessa notte, e Villico,
Spilungone, Boia, Ambasciatore, Borgomastro, Alchimista, Innocente,
Suocera, L'Antico e Scemo del Villaggio vengono finalmente assegnati come
qualsiasi altro ruolo (stesso componente `AssegnaRuolo` già usato altrove,
col menu a tendina per scegliere quale variante di carta sta assegnando).
Il Fantasma Onnisciente è escluso di proposito da questo passo, perché per
regolamento (pag. 13) la sua carta non va distribuita all'inizio ma
consegnata al primo giocatore che muore (gap #19, non gestito da questa
app: il narratore lo assegna a mano quando succede).

Verificato dal vivo in un browser reale: mazzo Lupo Mannaro + Spilungone +
Berserker + 2 Villico, tutti i ruoli assegnati correttamente al passo
"Assegna i ruoli rimanenti", poi il branco ha sbranato il Berserker e ha
automaticamente ucciso il lupo più vicino (punto 7-9 qui sotto), fino
all'annuncio di vittoria del villaggio in Alba.

### 1-3. Immunità dirette/indirette ai lupi non applicate

Regolamento:
- Cortigiana (pag. 12): "Durante la notte non può essere uccisa direttamente
  dai lupi, ma lo sarà se la visita è a un lupo mannaro o se il cliente
  scelto viene sbranato dal branco."
- Nano (pag. 18): "non viene notato dai lupi durante la notte, quindi non
  può venire ucciso da loro. Può comunque morire al rogo."
- Criceto Malvagio (pag. 12): "non può essere ucciso da loro [i lupi] di
  notte."

Bug: `AzioneBrancoLupi.jsx` proponeva tutti i giocatori vivi come bersaglio,
Cortigiana/Nano/Criceto Malvagio inclusi, e li uccideva normalmente se
scelti. **Fix**: i tre ruoli sono esclusi dai candidati del branco (la
Cortigiana muore comunque, indirettamente, tramite `risolviCortigiana` se la
sua visita lo richiede — quel meccanismo era già corretto e resta invariato).

### 4. Polpo Mannaro → Veggente "accecato"

Regolamento (pag. 20): "Quando il Veggente indaga l'aura del Polpo Mannaro
viene accecato: da allora, fino alla morte del Polpo, il Veggente vedrà
chiunque come benevolo."

Bug: la condizione `accecato` era **letta** in `AzioneIndagine.jsx` ma non
veniva **mai impostata** da nessuna parte, né mai rimossa alla morte del
Polpo Mannaro. **Fix**: investigare il Polpo Mannaro marca il Veggente come
`accecato`; la morte del Polpo Mannaro rimuove la condizione (hook generico
sulla morte, stesso punto usato per il crepacuore).

### 5. Condizioni "unto"/"trasformato" mai rimosse

Regolamento: entrambe durano "per il giorno successivo... fino al calar
della notte" (Untore, pag. 22) / "fino al calar della notte" (Maga, pag.
17) — cioè dalla notte in cui vengono inflitte fino all'inizio della notte
**seguente** (attraversano un intero giorno).

Bug: nessun punto del codice rimuoveva mai queste due condizioni. Una volta
unto o trasformato, un giocatore restava marcato per sempre. **Fix**:
rimosse al passaggio giorno→notte (quando il narratore preme "Prosegui alla
notte" da `GiornoPanel`), che è esattamente il momento di "calar della
notte" successivo a quando sono state inflitte.

### 6. Apprendista/Cavaliere/Figlia dei Lupi: risoluzione ritardata

Bug: `risolviLegami` (che trasforma l'Apprendista, uccide il Cavaliere,
trasforma la Figlia dei Lupi quando il loro bersaglio muore) veniva
applicata solo a fine notte in `NightSequencer`. Se il bersaglio moriva al
**rogo** (di giorno), l'effetto restava sospeso fino alla fine della notte
**successiva** — un ritardo di un giorno intero, durante il quale ad
esempio il Cavaliere restava vivo e votava normalmente invece di essere
già morto "immolandosi", o l'Apprendista non riceveva in tempo i poteri
del maestro per usarli quella notte. **Fix**: `risolviLegami` è ora
applicata nello stesso punto generico di `applicaCrepacuore` (dentro
`aggiornaGiocatore`, ogni volta che un giocatore muore, notte o rogo che
sia), quindi si risolve immediatamente.

### 7-9. Reazioni speciali al morso dei lupi

Regolamento:
- Berserker (pag. 10): "Se questo feroce guerriero viene sbranato dal
  branco uccide il lupo che si trova più vicino a lui."
- Ubriaco (pag. 22): "Se muore sbranato dai lupi mannari... impedendo loro
  di uccidere la notte successiva."
- Mezzosangue (pag. 18): "se viene sbranato dai lupi non muore ma diventa
  Lupo Mannaro."

Bug: nessuna di queste tre reazioni era implementata; il branco uccideva
questi ruoli come chiunque altro, senza conseguenze aggiuntive. **Fix**:
nuova funzione centralizzata `risolviAttaccoBranco` in `effettiNotte.js`
che, oltre a uccidere il bersaglio, applica la reazione corretta in base al
suo ruolo:
- Berserker → cerca il lupo vivo più vicino per posizione a sedere (in
  entrambe le direzioni, prendendo il più vicino; a parità di distanza la
  scelta ricade sulla destra — caso raro, il narratore può correggere a
  mano) e lo uccide a sua volta.
- Ubriaco → imposta sul branco un blocco che impedisce la prossima azione
  di caccia (un solo utilizzo, si consuma alla notte successiva anche se
  quella notte i lupi non erano comunque disponibili a colpire).
- Mezzosangue → invece di morire, cambia `ruoloSlug` in `lupo-mannaro` e si
  sveglia dalla notte successiva col branco (coerente con come la Figlia
  dei Lupi diventa lupo).

### 10. Cucciolo di Lupo Mannaro: vendetta doppia (parziale)

Regolamento (pag. 13): "Se viene ucciso, i lupi mannari sbranano due
persone in una notte per vendetta. Alla morte del primo lupo, il cucciolo
diventa adulto perdendo questo potere."

**Implementato**: se il Cucciolo muore (per qualunque causa: rogo, Strega,
Chupacabra — non solo di notte), il branco ottiene una seconda vittima
utilizzabile alla prossima occasione di caccia.

**Non implementato** (vedi domanda aperta più sotto): la clausola "alla
morte del primo lupo, il cucciolo diventa adulto perdendo questo potere" è
ambigua su cosa significhi "il primo lupo" — vedi punto 22 nelle domande.
Il potere di vendetta resta quindi sempre attivo per il Cucciolo, senza mai
"scadere": è la lettura più prudente in attesa di chiarimento, perché non
rimuove funzionalità che potrebbe servire.

### 11. Cartomante, Inquisitore, Medium, Veggente Mannaro: azione interattiva implementata

Erano `tipo: 'informativo'` senza nessun componente, quindi la notte
mostrava solo "nessuna azione richiesta" e il narratore doveva gestirli a
memoria. **Fix**:
- `AzioneIndagine.jsx` generalizzata (accetta `ruoloSlugAttore` invece di
  avere 'veggente' fisso) e riusata anche per il **Veggente Mannaro**;
  l'accecamento dal Polpo Mannaro resta specifico del solo Veggente, come
  da libretto.
- Nuovo `AzioneRivelaRuolo.jsx`, condiviso da **Cartomante** (bersaglio
  vivo, rivela il ruolo intero) e **Medium** (bersaglio morto, rivela il
  "vecchio ruolo" leggendo `ruoloSlug`, mai toccato dopo la morte di un
  giocatore in nessun punto del codice).
- Nuovo `AzioneInquisitore.jsx`: interrogatorio binario lupo/non-lupo,
  **opzionale** ("Salta" presente, coerente con l'eccezione già prevista
  per lui nel giro precedente), e se indaga inutilmente un'aura benevola
  marca un flag permanente che disabilita il potere per il resto della
  partita.

Verificato dal vivo: Cartomante rivela "Lupo Mannaro" su un lupo,
Inquisitore perde il potere dopo un'indagine su un'aura benevola, Medium
mostra "Nessun bersaglio disponibile" quando nessuno è ancora morto,
Veggente Mannaro legge l'aura senza subire l'accecamento del Polpo
Mannaro.

### 15. Spilungone: immunità al rogo

Regolamento (pag. 21): "Essendo troppo alto per qualsiasi patibolo, non
può essere messo al rogo del villaggio durante il giorno. Nel caso in cui
sia favorito al rogo, svela la propria carta e la notte cala senza
vittime."

Bug: `Votazione.jsx` permetteva di dichiarare la morte sul rogo
indipendentemente dal ruolo del designato. **Fix**: se il designato (sia
nel caso di maggioranza singola, sia scelto in uno spareggio) è lo
Spilungone, confermare non lo uccide: mostra invece il messaggio di
rivelazione ("... si rivela: è lo Spilungone... La notte cala senza
vittime") e sblocca comunque "Prosegui alla notte", senza mai chiamare
`onRogo`.

### 20. Alba: annunci per resuscitati/unti/trasformati

Regolamento (pag. 29): "Al mattino devi annunciare... se durante la notte
ci sono state uccisioni **o altri fatti particolari (giocatori che sono
stati resuscitati, unti, trasformati in maiali...)**."

`annunciAlba` copriva solo Pastore e Ambasciatore. **Fix**: aggiunti tre
controlli — un nuovo campo `resuscitatoNotte` (passato da
`resuscitaPatch`, analogo a `mortoNotte`) per sapere se la resurrezione è
di questa notte; "unto"/"trasformato" invece bastano da soli, perché per
costruzione (punto 5) possono essere presenti a questa Alba solo se
inflitti la notte appena conclusa.

### 21. Ordine "il branco si riconosce" nella prima notte

Regolamento (pag. 27): l'elenco dei ruoli a potere passivo da annotare
(L.M. Capobranco, Criceto M., Nano, Eremita, Nonna, Pastore, Polpo M.,
Ubriaco) viene **prima** dei gesti segreti di Bardo/Gallo Mannaro, che a
loro volta vengono prima dei ruoli che scelgono altri personaggi
(Apprendista, Cavaliere, ecc.).

Il passo "Il branco si riconosce" (che identifica anche L.M. Capobranco,
Progenitore e Nonna, essendo tutte varianti della carta lupo) era invece
posizionato dopo i gesti di Bardo/Gallo Mannaro. **Fix**: spostato prima,
insieme agli altri ruoli a potere passivo, per rispecchiare l'ordine del
libretto. Effetto puramente cosmetico (sono tutti passi senza azione, non
c'è dipendenza tra loro), ma la sequenza ora coincide col libretto passo
per passo.

---

## 🔧 Dettaglio implementazioni del Giro 2

### 12. Bardo / Gallo Mannaro: poteri di salto implementati

**Gallo Mannaro** ("salta il giorno", disponibile solo in Alba): il salto è
un vero cambio di fase, riusa `proseguiAllaNotte` (la stessa funzione che
"Prosegui alla notte" chiama normalmente) — Alba passa direttamente a
Notte, saltando per intero `GiornoPanel`/Votazione. Verificato dal vivo:
da Alba a Notte 2 senza passare dal voto.

**Bardo** ("salta la notte", disponibile solo in Giorno, dopo un rogo):
qui ho fatto una scelta diversa, apposta per non toccare la state machine
principale (troppo rischioso per i numerosi punti dell'app che confrontano
il numero della notte, es. `mortoNotte === round`). Invece di saltare
davvero la fase Notte, la notte **si presenta normalmente ma nessun passo
di tipo "azione" viene mostrato** (riuso lo stesso meccanismo della
condizione Maledetto de L'Antico, campo `notteBloccataFinoA`). L'effetto
per i giocatori è identico (nessun potere si usa quella notte), ma il
narratore vede comunque la sequenza notturna passare (con soli eventuali
passi informativi/di riconoscimento, se presenti). **Domanda per te più
sotto** su questa asimmetria.

### 13. L'Antico: due vite + Maledetto — implementato senza contatore vite

Invece di aggiungere un campo "vite: 2" al modello dati, ho sfruttato che
"perde la sua prima vita... continua poi a giocare come un normale
Villico": la prima volta che morirebbe (rogo o notte), invece sopravvive
e il suo `ruoloSlug` diventa `'villico'`. Da quel momento è
indistinguibile da un Villico qualsiasi (compresa una seconda morte
normale). Per la notte: se muore di notte l'effetto è automatico (in
`uccidiPatch`, come l'immunità di Mezzosangue); se muore al rogo, oltre a
sopravvivere imposta anche `notteBloccataFinoA` (Maledetto) per la notte
successiva. Verificato con test dedicati; non ancora rigiocato dal vivo
fino in fondo (solo le sue parti unitarie).

### 14. Borgomastro: elezione fatta, voto doppio no — vedi domanda 26

### 16. Alchimista: esplosione al rogo implementata

Evento dedicato "L'Alchimista esplode" nel menu Eventi speciali, disponibile
solo quando l'Alchimista (già rivelato tramite "Rivelazione personaggio")
risulta morto con `causaMorte: 'rogo'` e non ha ancora usato il potere:
sceglie chi trascinare con sé (morte "sul colpo", stessa meccanica di
Morte improvvisa).

### 17. Ladro: implementato, con un bug trovato e corretto dal vivo

Le due carte di scarto si scelgono nella composizione del mazzo (due
select dedicati, visibili solo se il Ladro è nel mazzo), tenute
volutamente **fuori** da `quantita` per non alterare il conteggio
giocatori/ruoli. La prima notte (il Ladro agisce per primo, come da
libretto) mostra le due carte e lascia scegliere: una delle due, o
"Resta Villico" (nascosto se sono entrambe varianti di Lupo Mannaro,
forzando lo scambio). **Bug trovato giocando dal vivo**: il ruolo assunto
(es. Veggente) non generava più i suoi passi notturni, perché non faceva
parte del mazzo originale — corretto con `ruoliAttivi()` (punto 24),
verificato di nuovo dal vivo con successo.

### 18. Mimo: implementato come promemoria a schermo, non come potere autonomo

La prima notte sceglie chi imitare (riusando `AzioneLegame`, lo stesso
componente di Apprendista/Cavaliere/Figlia dei Lupi, ma senza reazione
alla morte del bersaglio: il legame `tipo: 'mimo'` resta per sempre).
Da lì, `NightSequencer` mostra il Mimo nell'elenco dei coinvolti di
qualunque passo appartenga al ruolo **attuale** del suo bersaglio (letto
dinamicamente ogni volta, non congelato alla scelta — necessario perché il
Mimo agisce per primo nella notte, quando il ruolo del bersaglio non è
ancora quasi mai assegnato). Non gli ho dato un'azione indipendente
nell'app: "si accorda sull'agire" col titolare del ruolo imitato resta una
cosa che narratore e giocatori fanno a voce, l'app si limita a ricordare
al narratore di richiamarlo. Verificato con test, non dal vivo per tempo.

### 19. Fantasma Onnisciente: non implementato su tua richiesta esplicita

Nessuna modifica. Resta gestito a voce dal narratore se capita in partita.

### 24. Il ruolo assunto dal Ladro non generava i suoi passi notturni (bug trovato dal vivo)

`passiNotte` filtrava i passi in base ai soli ruoli presenti nel mazzo
originale (`ruoliSelezionati`). Se il Ladro assumeva un ruolo (es.
Veggente) da una delle sue carte di scarto — un ruolo mai stato "nel
mazzo" in senso stretto — quel ruolo restava invisibile per sempre: il
Ladro diventava Veggente sulla carta ma non poteva mai indagare. **Fix**:
nuova `ruoliAttivi(ruoliMazzo, giocatori)` in `nightSteps.js`, che unisce i
ruoli del mazzo con i ruoli che i giocatori hanno effettivamente in questo
momento; usata al posto del semplice elenco del mazzo ovunque nell'app.
Verificato dal vivo: dopo la correzione il Veggente assunto dal Ladro
indaga regolarmente la notte stessa.

### 25. Icone di condizione/ruolo in votazione, ruolo nascondibile

Fatto da un agente in background con istruzioni dettagliate, poi unito a
mano ai file nel frattempo modificati da me (per evitare che lavorasse in
parallelo sugli stessi file). Badge emoji per ogni condizione attiva
(sempre visibili) e per il ruolo (nascosto di default, attivabile da
Impostazioni → "Mostra i ruoli durante la votazione"). Icona ruolo per
fazione (villaggio/lupi/indipendente/sconosciuto), non una per ciascuno
dei 51 ruoli — il nome esatto resta comunque leggibile passandoci sopra
(title/aria-label). **Nota**: il titolo di Borgomastro (che non è un
ruolo ma un flag `eBorgomastro` separato) non ha ancora un'icona propria;
lo si vede solo aprendo "Eventi speciali" o dal Registro.

---

## ❓ Domande aperte per l'utente

### 26. Borgomastro: il voto doppio non è automatizzato

Ho implementato l'elezione (evento dedicato, assegna un titolo
`eBorgomastro` a un giocatore, indipendente dal suo ruolo segreto — coerente
col libretto, dove la carta è "scoperta" e chi la riceve **mantiene il
proprio ruolo assegnato all'inizio della partita"). Il voto doppio invece
no: `Votazione.jsx` conta i voti come un semplice contatore per candidato
(+1/-1 cliccato dal narratore), non registra "chi ha votato chi" — non c'è
un posto dove "raddoppiare" automaticamente il voto del Borgomastro senza
prima cambiare tutto il modello della votazione (tracciare il voto di ogni
singolo giocatore, non solo il totale ricevuto da ogni candidato). Per ora
il narratore deve ricordarsi di cliccare **due volte** "+1" quando il
Borgomastro vota qualcuno (l'icona di ruolo, quando riattivi la sua
visibilità, non lo segnala neanche perché non è un ruolo). **Vuoi che
investa nel rifacimento del modello di voto per automatizzarlo davvero,**
oppure preferisci che aggiunga almeno un'icona/promemoria visivo accanto al
nome del Borgomastro nella lista di voto (soluzione via di mezzo, poco
lavoro) e lasci il resto manuale?

### 27. Bardo: "salta la notte" neutralizza i poteri invece di saltare davvero la fase

Per il Gallo Mannaro ho implementato un salto di fase vero (Alba → Notte
successiva, bypassando tutto il giorno). Per il Bardo ho scelto una via
più prudente: la notte si presenta comunque al narratore, ma nessun passo
di tipo "azione" viene mostrato (stesso meccanismo della maledizione de
L'Antico). L'effetto pratico per il villaggio è identico (nessun potere si
usa quella notte), ma il narratore vede comunque scorrere gli eventuali
passi informativi invece di passare direttamente al giorno successivo. Ho
evitato il salto di fase vero qui perché la notte "saltata" dal Bardo può
capitare a **qualsiasi** numero di notte (non solo alla prima, come per
ora capita più naturalmente col Gallo Mannaro all'alba), e più punti
dell'app confrontano il numero della notte corrente con quello registrato
su un giocatore (`mortoNotte`, `brancoStorditoFinoA`, ecc.): saltare
davvero l'incremento del contatore notte rischiava di disallineare questi
confronti in modi difficili da verificare tutti a mente. **Ti va bene
questa semplificazione**, o preferisci che investa il tempo per capire se
un salto di fase vero è sicuro anche per il Bardo?

### 28. Priorità per il prossimo giro

Con questo giro considero implementati tutti i ruoli richiesti (tutti tranne
il Fantasma Onnisciente, come da tua indicazione). Gli unici punti
davvero aperti sono le due domande sopra (26, 27) e piccoli affinamenti
possibili se vuoi: un'icona per il Borgomastro nella lista di voto, o
un secondo giro di partite simulate più lungo per stanare altri bug non
ancora emersi (il Ladro ne aveva uno, magari altri ruoli meno comuni ne
hanno). Fammi sapere se vuoi che continui a testare/rifinire in autonomia
o se preferisci giocare tu una partita vera con la build attuale prima di
procedere oltre.

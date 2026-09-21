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
| 10 | Cucciolo di Lupo Mannaro: vendetta doppia se ucciso | 🔧 FIX (parziale, vedi nota) |
| 11 | Cartomante, Inquisitore, Medium, Veggente Mannaro: nessuna azione interattiva | 🔧 FIX (verificato dal vivo) |
| 12 | Bardo / Gallo Mannaro: potere di saltare notte/giorno mai attivabile | 🟡 GAP APERTO |
| 13 | L'Antico: due vite + condizione "Maledetto" | 🟡 GAP APERTO |
| 14 | Borgomastro: voto doppio + elezione | 🟡 GAP APERTO |
| 15 | Spilungone: immunità al rogo | 🔧 FIX |
| 16 | Alchimista: esplosione al rogo | 🟡 GAP APERTO |
| 17 | Ladro: due carte extra nel mazzo | 🟡 GAP APERTO |
| 18 | Mimo: imita un ruolo per tutta la partita | 🟡 GAP APERTO |
| 19 | Fantasma Onnisciente: carta consegnata al primo morto | 🟡 GAP APERTO (esplicitamente escluso dal fix del punto 0) |
| 20 | Alba: annunci mancanti per resuscitati/unti/trasformati | 🔧 FIX |
| 21 | Ordine "identifica-branco" nella prima notte | 🔧 FIX (riordino, cosmetico) |
| 22 | Pifferaio: vittoria se resta l'unico vivo senza aver ipnotizzato nessuno | ❓ DOMANDA |
| 23 | Innocente, Guardia, Guardia Mannara, Mucca Mannara, Suocera | ✅ OK |

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

## 🟡 Gap aperti (non risolti in questo giro)

Elenco in ordine di impatto stimato sulla giocabilità. Ognuno è una
funzionalità di regolamento assente o solo parzialmente supportata
dall'app. Nessuno di questi impedisce di giocare (il narratore può sempre
gestirli a voce/a mano), ma l'app non li supporta né li ricorda.

### 12. Bardo / Gallo Mannaro: il potere di saltare non è mai attivabile

Regolamento: il Bardo (pag. 10) e il Gallo Mannaro (pag. 14) mostrano un
gesto segreto la prima notte, e in seguito — **una sola volta per
partita** — possono ripetere il gesto per attivare il potere: il Bardo
dopo un rogo per far saltare una notte, il Gallo Mannaro all'alba per far
saltare un giorno intero.

Nell'app questi ruoli hanno solo il passo "mostra il gesto" della prima
notte (puramente informativo). Non esiste alcun modo per il narratore di
dichiarare "il Bardo/Gallo Mannaro ha fatto il gesto" e non esiste nessuna
logica per "saltare" una fase dell'app (la macchina a stati
notte→alba→giorno→notte non ha un concetto di fase saltata).

**Raccomandazione**: è la funzionalità mancante più grande dell'intero
audit, perché tocca la state machine principale, non solo una singola
azione. Prima di implementarla servirebbe decidere l'interazione UX (un
pulsante "il gesto è stato mostrato" visibile dove il libretto lo prevede,
che salta la fase successiva mantenendo `poteriUsati` per il limite "una
volta per partita"). Priorità alta per la coerenza col regolamento, ma è
un lavoro a sé.

### 13. L'Antico: due vite + condizione "Maledetto"

Regolamento (pag. 16): due vite; se perde la prima al rogo, si rivela e
blocca tutti i poteri notturni attivi per una notte (Maledetto); se la
perde di notte, si rivela senza conseguenze; poi gioca da Villico normale.

Non implementato: il modello dati attuale ha solo `vivo: true/false`,
nessun concetto di "vite multiple". La condizione `maledetto` esiste nel
glossario (`conditions.js`) ma non viene mai impostata né controllata da
nessuna parte (nessun passo notturno verifica se blocare i poteri).

**Raccomandazione**: L'Antico avrebbe bisogno di un campo tipo `vite: 2`
scalato invece di `vivo: boolean`, e la condizione Maledetto dovrebbe
sopprimere temporaneamente `passiNotte` per i ruoli con potere attivo.
Impatto medio (ruolo singolo, poco usato probabilmente), ma tocca il
modello dati di base: da valutare se vale la pena vs. gestirlo a voce dal
narratore.

### 14. Borgomastro: voto doppio + elezione

Regolamento (pag. 11): eletto dal villaggio all'alba del primo giorno, il
suo voto vale doppio; se muore, il villaggio elegge un nuovo Borgomastro.

Non implementato: `Votazione.jsx` conta ogni voto come 1, non c'è concetto
di "voto pesato" né un flusso di elezione. **Raccomandazione**: aggiungere
un flag `pesoVoto` sul giocatore Borgomastro e sommarlo in
`risultatoVotazione`; l'elezione stessa (chi diventa Borgomastro) può
restare una scelta manuale del narratore tramite un piccolo picker nella
prima Alba. Priorità media.

### 16. Alchimista: esplosione al rogo

Regolamento (pag. 9): se il villaggio lo manda al rogo, si rivela e sceglie
un'altra persona da portare con sé nell'aldilà.

Non implementato: nessuna UI per questa scelta quando l'Alchimista muore al
rogo. **Raccomandazione**: un piccolo componente analogo a
`AzioneAddolorata.jsx` (che già gestisce "reagisci alla vittima del rogo"),
mostrato nella fase Alba o subito dopo la conferma del rogo. Priorità
media.

### 17. Ladro: due carte extra nel mazzo

Regolamento (pag. 15): nel creare il mazzo vanno aggiunte due carte extra
rispetto al numero di giocatori; il Ladro le guarda la prima notte e
sceglie se diventare una di quelle o un semplice Villico.

Non implementato, e **incompatibile con l'attuale modello del mazzo**: dal
Gruppo A del giro precedente, il numero di giocatori è derivato
direttamente dal totale delle carte nel mazzo (una carta = un giocatore).
Il concetto di "due carte in più di quante servono" non esiste più
nell'architettura attuale. **Raccomandazione**: richiede di reintrodurre
uno scarto mazzo/giocatori limitatamente al caso "Ladro nel mazzo", una
modifica non banale al builder. Priorità bassa (ruolo raro da usare, il
narratore può gestirlo interamente a mano con due carte fisiche vere).

### 18. Mimo: imita un ruolo per tutta la partita

Regolamento (pag. 18): la prima notte sceglie un giocatore e ne imita il
ruolo per tutta la partita, svegliandosi insieme a lui se il ruolo scelto
agisce di notte.

Non implementato: il passo "Mimo" esiste in `nightSteps.js` come
`tipo: 'azione'` ma non ha nessun componente in `AZIONI_NOTTURNE`, quindi
non mostra nessuna UI (incoerenza minore: un passo `azione` che di fatto si
comporta come `informativo`). **Raccomandazione**: servirebbe un
meccanismo per "duplicare" dinamicamente i passi notturni del ruolo
imitato — un cambiamento strutturale a `passiNotte`, non una singola
azione. Priorità bassa-media, complessità alta.

### 19. Fantasma Onnisciente: carta consegnata al primo morto

Regolamento (pag. 13): non distribuita all'inizio, va al primo giocatore
che muore; da lì tiene gli occhi aperti la notte.

Non implementato: nessun meccanismo per assegnare questo ruolo "a runtime"
al primo morto della partita (il mazzo attuale assegna tutti i ruoli
all'inizio). **Raccomandazione**: priorità bassa, ruolo di nicchia; da
gestire a mano dal narratore finché non emerge una richiesta esplicita.

---

## ❓ Domande aperte per l'utente

### 22. Pifferaio: vittoria se resta l'unico sopravvissuto senza aver ipnotizzato nessuno

Il regolamento dice "Quando **tutti i giocatori in vita** saranno
ipnotizzati, avrà vinto il gioco." Il caso limite: se il Pifferaio resta
l'**unico** sopravvissuto (tutti gli altri morti per altre cause, nessuno
mai ipnotizzato), la frase "tutti i giocatori in vita sono ipnotizzati" è
vacuamente vera (non c'è nessun altro vivo da controllare), e
l'implementazione attuale annuncerebbe la sua vittoria. Non è chiaro se sia
l'intenzione del libretto o un caso limite non previsto.

**Come vorresti gestirlo?**
- (A) Lasciare così (vince comunque, come ultimo sopravvissuto di fatto).
- (B) Richiedere che almeno un altro giocatore sia stato effettivamente
  ipnotizzato prima che questa vittoria possa scattare (il Pifferaio da
  solo, per morte naturale altrui, non vince).

Non ho scelto in autonomia perché cambia l'esito di una partita reale e
non è un bug "di implementazione" ma un'interpretazione del regolamento.

### 23'. Cucciolo di Lupo Mannaro: cosa significa "alla morte del primo lupo"

Vedi punto 10. "Alla morte del primo lupo, il cucciolo diventa adulto
perdendo questo potere [la vendetta doppia]." Possibili letture:
- (A) Il primo membro **qualsiasi** della fazione lupi (Lupo Mannaro,
  Capobranco, Progenitore, Nonna, lo stesso Cucciolo) a morire nel corso
  della partita, chiunque sia.
- (B) Specificamente un Lupo Mannaro "semplice" (carta base), non le
  varianti.
- (C) Il Cucciolo stesso, cioè la frase descrive semplicemente "se il
  Cucciolo muore, perde il potere" (ma questo è già ovvio essendo morto, e
  ridondante con la prima frase della stessa voce — lettura meno
  probabile).

Se confermi la lettura (A) o (B) implemento la "maturazione" (il Cucciolo
smette di generare vendetta doppia dopo quella morte, pur restando nel
branco).

### 24. Priorità per il prossimo giro

Tutti i fix a basso rischio e alto valore individuati in questo giro sono
stati completati (punto 0 su tutti). Restano aperti solo gap che
richiedono più tempo o toccano la state machine principale. La mia
raccomandazione, in ordine: (1) Bardo/Gallo Mannaro salta-notte/giorno
(grande, ma è l'unico gap rimasto che tocca meccaniche di gioco vistose
durante una partita reale), (2) Borgomastro voto doppio + elezione
(piccolo-medio, incide sull'esito dei voti), (3) L'Antico due vite +
Maledetto, (4) Alchimista esplosione al rogo, (5) Ladro/Mimo/Fantasma
Onnisciente (bassa priorità, ruoli di nicchia, gestibili a voce dal
narratore nel frattempo).

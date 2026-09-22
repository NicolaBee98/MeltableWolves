# Audit ruoli — regole, gameplay, implementazione, edge case (2026-09-22)

Documento sistematico: per ciascuno dei 51 ruoli, quattro punti — (1) le
regole della carta, (2) cosa cambia rispetto al gameplay base (un Villico
senza poteri), (3) come la web app li attua in pratica (file/funzioni), (4)
quali edge case possono presentarsi. Scritto **dopo** aver corretto i bug non
ambigui trovati durante la stesura (vedi "Correzioni applicate in questo
giro" e i changelog nei singoli punti); i dubbi restanti sono in fondo, in
appendice.

Continua il lavoro di `docs/audit-regolamento-2026-09-21.md` (due giri
precedenti, letto e tenuto per riferimento storico: non lo sostituisce, lo
estende con un formato più sistematico e la copertura di tutti i 51 ruoli,
non solo quelli con bug).

## Come leggere questo documento

- "Implementazione pratica" nomina i file reali (`src/...`) e le funzioni
  chiave, non solo il comportamento — per poter verificare o modificare il
  codice partendo dal documento.
- "Edge case" elenca sia quelli già gestiti correttamente (per chiarezza su
  cosa NON serve ricontrollare) sia quelli non gestiti o gestiti in modo
  ambiguo (rimandati all'appendice se richiedono una decisione tua).
- I meccanismi trasversali (condizioni, aura, vicinanza, vittoria) sono
  descritti una volta sola nella sezione "Meccanismi condivisi" e poi solo
  richiamati per nome dai singoli ruoli.

---

## 🔧 Correzioni applicate in questo giro

Trovate confrontando ogni riga di `roles.js` col codice che dovrebbe
attuarla, poi corrette prima di scrivere il documento (così descrive lo
stato vero, non quello con i bug):

1. **Cucciolo di Lupo Mannaro**: la vendetta doppia sul branco scattava solo
   se il Cucciolo moriva sbranato *dal branco stesso* (dentro
   `risolviAttaccoBranco`). Il regolamento non limita la causa ("se viene
   ucciso"): ora `attivaVendettaCucciolo` (nuova funzione in
   `effettiNotte.js`) è agganciata alla catena generica di morte in
   `usePartita.js`, quindi scatta anche se il Cucciolo muore al rogo, per la
   Strega o per il Chupacabra.
2. **Guaritore / Sciacallo Mannaro**: entrambi "possono usare il potere
   anche da morti" per regolamento, ma il gate generico
   `qualcunoVivo` in `NightSequencer.jsx` nascondeva la loro azione appena
   morivano — e il loro passo notturno spariva del tutto da `passiNotte()`
   per lo stesso motivo. Aggiunto un flag `puoAgireDaMorto` sui due step in
   `nightSteps.js`, letto da entrambi i punti.
3. **Spilungone / L'Antico**: la loro immunità speciale al rogo in
   `Votazione.jsx` richiedeva che l'app conoscesse già il loro `ruoloSlug`
   — ma sono ruoli a rivelazione diurna, quasi mai pre-assegnati. Un
   narratore che non li avesse rivelati in anticipo da "Eventi speciali" li
   vedeva morire come un designato qualsiasi. Ora, se il designato ha ruolo
   ancora ignoto e quel ruolo è nel mazzo e non ancora preso da nessuno,
   compaiono i pulsanti "Si rivela: è lo Spilungone/L'Antico" accanto a
   "Dichiara morte sul rogo".
4. **Boia**: stesso bug di pattern già trovato per l'Alchimista nel giro
   precedente — "Il Boia giustizia" richiedeva un `ruoloSlug` mai assegnato
   in pratica (il Boia è a rivelazione diurna). Ora, come l'Alchimista,
   chiede prima "Chi è il Boia" e poi "Chi giustizia". Boia e Alchimista
   sono stati anche tolti dall'elenco del generico "Rivelazione
   personaggio": se un narratore li rivelasse da lì per errore, il loro
   evento dedicato risulterebbe "già usato" per sempre senza che l'azione
   sia mai avvenuta.

---

## Meccanismi condivisi

**Condizioni** (`src/data/conditions.js`, badge in `Votazione.jsx`):
protetto, inibito, innamorato, ipnotizzato, maledetto, trasformato,
morto-sul-colpo, resuscitato, unto, accecato. Ognuna è un tag su
`giocatore.condizioni`; alcune si puliscono da sole a fine notte
(`daRipulireCambioNotte`: unto, trasformato; la pulizia di protetto/inibito è
in `NightSequencer.passaAllaNotteSuccessiva`), altre restano finché un altro
evento le rimuove (accecato: `rimuoviAccecamentoSeMortoPolpo`) o per sempre
(innamorato, morto-sul-colpo). **Nessuna condizione blocca attivamente
un'azione nell'interfaccia** (es. un giocatore inibito può comunque essere
scelto come attore in teoria) — l'enforcement è lasciato al narratore, la
condizione è solo un promemoria visivo. Vedi dubbio in appendice.

**Aura** (`src/data/aura.js`): whitelist statica `AURA_MALVAGIA` (Lupo
Mannaro, Cucciolo, Capobranco, Progenitore, Chupacabra, Eremita) — chi non è
in lista è sempre "benevola" di default, il che gestisce correttamente anche
le eccezioni (Nonna appare benevola pur essendo lupo, semplicemente perché
non è nella lista).

**Vittoria** (`src/data/vittoria.js`): calcolata da zero a ogni render
dell'Alba, non è uno stato salvato. Considera "vivo" chiunque abbia
`vivo:true` tranne la Suocera (esclusa esplicitamente).

**Morso del branco** (`src/data/effettiNotte.js`, `risolviAttaccoBranco`):
punto centrale unico per tutte le reazioni speciali a un morso (Berserker,
Ubriaco, Mezzosangue); usato solo da `AzioneBrancoLupi.jsx`. Chupacabra e
Strega hanno la propria logica di uccisione separata (`uccidiPatch`
direttamente), quindi **non** attivano le reazioni speciali legate
specificamente al morso del branco (es. Berserker non uccide il lupo più
vicino se la Strega lo avvelena) — coerente col testo delle regole, che
parla esplicitamente di "sbranato dal branco".

**Catena di morte generica** (`src/state/usePartita.js`, dentro
`aggiornaGiocatore`): ogni volta che un giocatore muore (notte o rogo),
scattano in sequenza `applicaCrepacuore` (innamorati),
`rimuoviAccecamentoSeMortoPolpo`, `maturaCucciolo`, `attivaVendettaCucciolo`,
`risolviLegami` (Apprendista/Cavaliere/Figlia dei Lupi). Qualunque nuovo
effetto "quando un giocatore muore, indipendentemente da come" va aggiunto
qui, non nei singoli resolver di azione.

---

## I 51 ruoli

### Addolorata (villaggio, notturno)
- **Regole**: ogni notte può scambiare per sempre il proprio ruolo con
  quello della vittima dell'ultimo rogo; una sola volta a partita; niente
  scambio se nessuno è morto al rogo.
- **Modifiche**: può trasformarsi in un ruolo qualunque, incluso uno con
  poteri notturni attivi, utilizzabili da quella stessa notte.
- **Implementazione**: `AzioneAddolorata.jsx`. Cerca la vittima con
  `causaMorte==='rogo' && mortoNotte===round`: l'allineamento numerico
  funziona perché `round` si incrementa quando si lascia una notte (prima
  dell'Alba), quindi durante il Giorno rappresenta già "il numero della
  notte successiva", lo stesso con cui il rogo viene timbrato.
- **Edge case**: lo scambio copia solo `ruoloSlug`, **non**
  `poteriUsati`/`usiNotte`/`condizioni` della vittima — l'Addolorata che
  diventa Strega parte con pozioni "fresche" anche se la Strega originale ne
  aveva già usata una. Vedi dubbio in appendice (condiviso con Apprendista e
  Mimo). Se nessuno muore al rogo (Spilungone/L'Antico si rivelano) il
  potere resta bloccato quella notte, correttamente.

### Alchimista (villaggio, rivelazione diurna)
- **Regole**: se mandato al rogo si rivela e sceglie chi trascinare con sé
  in un'esplosione; se sbranato di notte non succede nulla.
- **Modifiche**: la sua "morte al rogo" in realtà uccide **due** persone
  (lui e la scelta), invece che una.
- **Implementazione**: evento dedicato "L'Alchimista esplode"
  (`EventiSpeciali.jsx`, `eventiSpeciali.js#alchimistaDisponibile`,
  `GiornoPanel.jsx#dichiaraAlchimistaEsplode`) — due passi impilati: "Chi è
  l'Alchimista" poi "Chi trascina con sé", entrambi tra i vivi. La sua morte
  è registrata come `causaMorte:'rogo'` nello stesso momento della
  rivelazione (sostituisce "Dichiara morte sul rogo", non si accumula con
  esso). Escluso dal generico "Rivelazione personaggio" (vedi correzioni).
- **Edge case**: se sbranato di notte prima di essere mai rivelato, non c'è
  alcun evento speciale da attivare: muore come un Villico qualsiasi, che è
  esattamente "non accade nulla" per regolamento. ✅.

### Ambasciatore (villaggio, non notturno)
- **Regole**: finché vivo, il narratore annuncia all'alba se il Veggente ha
  percepito un'aura benevola la notte precedente.
- **Modifiche**: nessuna azione propria; aggiunge un annuncio pubblico
  condizionato all'esito di un altro ruolo.
- **Implementazione**: `src/data/alba.js#annunciAlba`, controlla
  `ambasciatoreVivo` e un Veggente con `ultimaIndagine.notte===round &&
  esito==='benevola'`.
- **Edge case**: controlla solo `ruoloSlug==='veggente'` (non Veggente
  Mannaro, corretto — il regolamento dice esplicitamente "il Veggente"). Se
  il Veggente è **accecato** dal Polpo Mannaro, ogni sua indagine risulta
  "benevola" anche su un lupo: l'Ambasciatore annuncerà comunque, riportando
  fedelmente la percezione (falsata) del Veggente — coerente col
  regolamento, non un bug, ma un'interazione da tenere a mente giocando.

### Apprendista (villaggio, notturno, solo prima notte)
- **Regole**: sceglie un maestro la prima notte; alla sua morte, ne assume
  il ruolo.
- **Modifiche**: la sua identità di ruolo può cambiare a metà partita.
- **Implementazione**: `AzioneLegame.jsx` (scelta del maestro) +
  `risoluzioneNotte.js#risolviLegami`, agganciata alla catena di morte
  generica: `patch[apprendista.id] = { ruoloSlug: target.ruoloSlug, legame:
  null }`.
- **Edge case**: come l'Addolorata, non eredita `poteriUsati`/`usiNotte`
  del maestro (vedi dubbio in appendice). Se il maestro muore prima di
  avere mai un ruolo assegnato (raro, solo nella finestra primissima notte)
  l'Apprendista erediterebbe `ruoloSlug: undefined` — non osservato in
  pratica perché il maestro va scelto tra i giocatori vivi, che a quel
  punto della notte hanno quasi sempre già un ruolo (passo
  "assegna-restanti" viene prima).

### Bardo (villaggio, notturno, solo prima notte + trigger diurno)
- **Regole**: la prima notte mostra un gesto segreto al narratore; dopo un
  rogo, una sola volta a partita, rifà il gesto per far saltare la notte
  successiva.
- **Modifiche**: può neutralizzare un'intera notte di poteri attivi.
- **Implementazione**: evento "Il Bardo salta la notte"
  (`EventiSpeciali.jsx`, solo in fase `esito`) → `notteBloccataFinoA` sul
  Bardo, stesso meccanismo della maledizione de L'Antico. **Non** è un vero
  salto di fase (a differenza del Gallo Mannaro): la notte si presenta
  comunque, ma nessun passo di tipo "azione" viene mostrato
  (`notteBloccata()` in `nightSteps.js`, letta da `NightSequencer.jsx`).
- **Edge case**: 🟡 vedi dubbio in appendice (semplificazione voluta invece
  di un salto di fase reale — già segnalata nel giro precedente, mai
  confermata).

### Berserker (villaggio, non notturno)
- **Regole**: se sbranato dal branco, uccide il lupo vivo più vicino.
- **Modifiche**: un morso del branco su di lui può costare **due** lupi.
- **Implementazione**: `effettiNotte.js#risolviAttaccoBranco`, usa
  `vicinoPiuVicinoChe` (`vicinanza.js`) che scandisce i posti a sedere in
  entrambe le direzioni in parallelo.
- **Edge case**: a parità di distanza destra/sinistra vince la destra
  (scelta arbitraria, documentata nel codice); se non c'è nessun lupo vivo
  raggiungibile, non succede nulla oltre alla sua morte. Non scatta se
  ucciso da Strega/Chupacabra/rogo (per regolamento: solo "se sbranato dal
  branco").

### Boia (villaggio, rivelazione diurna)
- **Regole**: può giustiziare chiunque durante il giorno, rivelandosi; una
  sola volta a partita.
- **Modifiche**: una seconda "esecuzione" al giorno, indipendente dal rogo.
- **Implementazione**: vedi "Correzioni applicate" punto 4. Evento "Il Boia
  giustizia" in due passi (chi è → chi giustizia),
  `GiornoPanel.jsx#dichiaraBoiaGiustizia`.
- **Edge case**: la selezione "chi giustizia" non esclude il Boia stesso dai
  candidati (potrebbe giustiziare sé stesso — il regolamento non lo vieta
  esplicitamente, lasciato possibile).

### Borgomastro (villaggio, rivelazione diurna/elezione)
- **Regole**: primo cittadino, voto doppio in ogni votazione e ballottaggio;
  eletto all'alba del primo giorno con carta scoperta (o distribuito già
  scoperto, variante); se muore se ne elegge un altro.
- **Modifiche**: altera il peso dei voti, non l'identità/potere del
  giocatore.
- **Implementazione**: evento "Elezione Borgomastro"
  (`AlbaPanel.jsx`/`EventiSpeciali.jsx`) imposta un flag `eBorgomastro`
  indipendente dal ruolo segreto; promemoria automatico quando nessuno vivo
  ha il titolo (`borgomastroDaEleggere` in `AlbaPanel.jsx`).
- **Edge case**: 🟡 **il voto doppio non è automatizzato** — `Votazione.jsx`
  conta voti aggregati per candidato (+1/-1), non "chi ha votato chi": non
  c'è un punto dove raddoppiare il voto del Borgomastro senza rifare il
  modello di voto. Il narratore deve ricordarsi di premere +1 due volte.
  Vedi dubbio in appendice (aperto dal giro precedente, mai confermato).

### Cartomante (villaggio, notturno)
- **Regole**: ogni notte scopre il ruolo esatto di un vivo (alternativa al
  Veggente).
- **Modifiche**: indagine più forte del Veggente (ruolo esatto, non solo
  fazione), ma senza le variabili di Veggente Mannaro/accecamento.
- **Implementazione**: `AzioneRivelaRuolo.jsx` (condiviso con Medium),
  `bersaglio:'vivo'`.
- **Edge case**: nessuno — semplice indagine diretta, senza casi speciali di
  regolamento da gestire.

### Cavaliere (villaggio, notturno, solo prima notte)
- **Regole**: la prima notte sceglie per chi sacrificarsi; se il bersaglio
  muore (sbranato di notte O mandato al rogo di giorno) il Cavaliere si
  rivela e muore al suo posto, il bersaglio sopravvive.
- **Modifiche**: trasferisce una morte da un giocatore a un altro.
- **Implementazione**: `AzioneLegame.jsx` + `risoluzioneNotte.js#risolviLegami`
  — **corretto in questo giro** (vedi changelog turno precedente): ora
  copre sia `causaMorte==='notte'` sia `'rogo'`, ripulisce la `causaMorte`
  del bersaglio salvato, e marca la propria morte con `causaMorte:
  'sacrificio'` (annunciata in log/alba, vedi `log.js#ETICHETTA_CAUSA` e
  `alba.js`).
- **Edge case**: se il bersaglio muore per una causa diversa da
  notte/rogo (es. "morte sul colpo"), il Cavaliere si immola comunque ma il
  bersaglio **non** viene salvato (fedele al regolamento: la protezione
  vale solo per sbranamento e rogo, non per ogni tipo di morte).

### Chupacabra (indipendente, notturno)
- **Regole**: ogni notte caccia; se punta un lupo lo uccide, altrimenti la
  caccia fallisce; quando tutti i lupi sono morti, uccide chiunque ogni
  notte; vince da ultimo sopravvissuto; il villaggio non vince finché è
  vivo.
- **Modifiche**: un secondo "cacciatore" notturno che neutralizza i lupi
  senza essere lui stesso un lupo.
- **Implementazione**: `AzioneChupacabra.jsx`, `nessunLupoVivo` decide se
  colpisce chiunque; `vittoria.js` lo blocca esplicitamente
  (`lupiVivi.length===0 && !chupacabraVivo`) e gli dà la vittoria da ultimo
  sopravvissuto.
- **Edge case**: la sua uccisione passa da `uccidiPatch` quindi **rispetta**
  la protezione del Paladino/Strega (il regolamento non dice che la
  ignora — assunzione ragionevole, non confermata esplicitamente nel testo).

### Cortigiana (villaggio, notturno)
- **Regole**: ogni notte visita un cliente; non può essere uccisa
  direttamente dai lupi; muore solo se visita un lupo o se il cliente scelto
  viene sbranato dal branco.
- **Modifiche**: immune al bersaglio diretto del branco, ma vulnerabile
  indirettamente in base a chi visita.
- **Implementazione**: `AzioneCortigiana.jsx` (imposta `visitaNotturna`);
  `RUOLI_IMMUNI_AL_BRANCO` la esclude dai candidati del branco;
  `risoluzioneNotte.js#risolviCortigiana` (chiamata a fine notte da
  `NightSequencer`) applica la morte se il cliente è un lupo o è morto di
  notte.
- **Edge case**: 🟡 `risolviCortigiana` considera "cliente morto di notte"
  qualunque `causaMorte==='notte'`, non solo "sbranato dal branco" come dice
  il testo letterale — quindi se il cliente muore per la pozione mortale
  della Strega o per il Chupacabra, la Cortigiana muore comunque. Vedi
  dubbio in appendice.

### Criceto Malvagio (indipendente, non notturno)
- **Regole**: non alleato dei lupi, ma non può essere ucciso da loro di
  notte; vince da ultimo sopravvissuto.
- **Modifiche**: ruolo puramente passivo, la sua unica interazione è
  l'immunità.
- **Implementazione**: `RUOLI_IMMUNI_AL_BRANCO`; vittoria da ultimo
  sopravvissuto in `vittoria.js`.
- **Edge case**: 🟡 come Nano (vedi sotto), il testo non specifica se è
  immune anche a Strega/Chupacabra — attualmente non lo è. Vedi dubbio in
  appendice.

### Cucciolo di Lupo Mannaro (lupi, notturno)
- **Regole**: caccia col branco; se ucciso, il branco sbrana due vittime per
  vendetta; alla morte del primo lupo, matura e perde questo potere.
- **Modifiche**: la sua morte raddoppia temporaneamente la capacità di
  uccisione del branco.
- **Implementazione**: identificato singolarmente tra i poteri passivi
  (`nightSteps.js`, step dedicato prima che "il branco si riconosce");
  `attivaVendettaCucciolo` (**corretto in questo giro**, vedi "Correzioni
  applicate"); maturazione in `maturaCucciolo` (attivata alla morte di
  *qualunque* membro di fazione lupi, lui compreso se non è il primo).
- **Edge case**: se il Cucciolo stesso è il primo lupo a morire, non c'è
  nessuno da "maturare" (controllo `g.vivo && g.ruoloSlug===...`, si salta
  da solo); se muore prima ANCORA di essere identificato come Cucciolo
  (impossibile nel flusso attuale, l'identificazione è il suo primissimo
  passo) non ci sarebbe vendetta — scenario non raggiungibile.

### Eremita (villaggio, non notturno)
- **Regole**: Villico normale, ma il Veggente lo vede sempre malvagio.
- **Modifiche**: nessuna azione, solo un depistaggio per chi investiga.
- **Implementazione**: incluso direttamente in `AURA_MALVAGIA`
  (`aura.js`) — nessun codice speciale necessario, l'indagine generica lo
  gestisce automaticamente.
- **Edge case**: nessuno.

### Fantasma Onnisciente (villaggio, notturno — non distribuito)
- **Regole**: non distribuito all'inizio; consegnato al primo morto sul
  rogo; da lì tiene gli occhi aperti di notte, dice una lettera dell'alfabeto
  ogni alba, perde il voto ai ballottaggi, vince secondo il ruolo che aveva
  in vita.
- **Modifiche**: cambia identità a metà partita per un meccanismo che
  l'app non traccia affatto.
- **Implementazione**: **nessuna**, per richiesta esplicita tua nel giro
  precedente. Escluso da `RUOLI_SENZA_STEP_DEDICATO` apposta, così non
  interferisce con l'assegnazione automatica degli altri ruoli.
- **Edge case**: se il mazzo lo include, il narratore deve gestirlo
  interamente a voce/carta fisica: l'app non sa distinguerlo da un Villico
  normale, non applica la perdita di voto ai ballottaggi né la vittoria "col
  ruolo che aveva in vita". Gap noto e voluto.

### Fattucchiera (villaggio, notturno)
- **Regole**: ogni notte inibisce i poteri di una persona.
- **Modifiche**: può neutralizzare in anticipo l'azione di un altro ruolo.
- **Implementazione**: `AzioneCondizioneSingola.jsx` (condizione
  `inibito`), ripulita a fine notte in `NightSequencer.jsx`.
- **Edge case**: 🟡 l'inibizione è **solo un badge visivo**: l'app non
  impedisce fisicamente al giocatore inibito di essere comunque scelto come
  attore nel proprio passo notturno. Il narratore deve ricordarsene (col
  gesto della X, come da regolamento) e semplicemente non applicare
  l'effetto. Stesso limite generale di tutte le condizioni (vedi
  "Meccanismi condivisi").

### Figlia dei Lupi (sconosciuto, notturno, solo prima notte)
- **Regole**: la prima notte sceglie un genitore di qualunque fazione; se
  muore, lei diventa Lupo Mannaro dalla notte seguente.
- **Modifiche**: la sua fazione reale resta indeterminata fino alla morte
  del genitore.
- **Implementazione**: `AzioneLegame.jsx` + `risolviLegami` →
  `ruoloSlug:'lupo-mannaro'`. Da quel momento è indistinguibile da un lupo
  normale in ogni meccanismo (aura, vittoria, branco che sbrana, vendetta
  del Cucciolo).
- **Edge case**: non passa mai dal passo "il branco si riconosce" (già
  avvenuto prima della sua conversione, quasi sempre) — nessun annuncio
  esplicito del suo ingresso nel branco, puramente cosmetico.

### Gallo Mannaro (lupi, notturno, solo prima notte + trigger alba)
- **Regole**: la prima notte mostra un gesto segreto; può decidere di non
  cantare, facendo saltare l'intero giorno (una volta a partita).
- **Modifiche**: unico ruolo che salta un'intera **fase** (non solo dei
  passi), portando da Alba direttamente a Notte.
- **Implementazione**: evento "Il Gallo Mannaro salta il giorno"
  (`AlbaPanel.jsx`/`EventiSpeciali.jsx`, solo contesto `alba`) → riusa
  `proseguiAllaNotte` di `App.jsx`, lo stesso path di "È notte nel
  villaggio".
- **Edge case**: a differenza del Bardo, qui il salto di fase è reale
  (round incrementa, Giorno non si vede mai) — asimmetria voluta, vedi
  dubbio Bardo in appendice.

### Guardia (villaggio, notturno, solo prima notte)
- **Regole**: la prima notte conosce il/i collega/i; vanno sempre in
  coppia nel mazzo.
- **Modifiche**: nessuna azione, solo informazione reciproca tra due
  giocatori.
- **Implementazione**: passo puramente informativo (nessun componente
  Azione); `MazzoBuilder.jsx` le tratta come coppia fissa (`toggleGuardie`).
- **Edge case**: nessuno — l'app non deve tracciare "chi sa cosa", è
  interamente un fatto tra narratore e giocatori.

### Guardia Mannara (lupi, notturno, solo prima notte)
- **Regole**: la prima notte conosce le Guardie; patteggia in segreto per
  il branco; va inserita solo se le Guardie sono già presenti.
- **Modifiche**: una spia nel campo delle Guardie, vince coi lupi senza
  cacciare con loro.
- **Implementazione**: fazione `'lupi'` in `roles.js` (conta per la
  vittoria automaticamente), ma **esclusa** da `RUOLI_BRANCO_LUPI` (non
  caccia); `useMazzo.js#setQuantita` la azzera insieme alla Guardia se
  questa scende a zero; `MazzoBuilder.jsx` disabilita la sua chip finché non
  ci sono Guardie.
- **Edge case**: nessuno — vincolo di composizione già applicato sia in
  fase di costruzione mazzo sia nel modello dati.

### Guaritore (villaggio, notturno)
- **Regole**: può far resuscitare un giocatore, una sola volta a partita,
  anche da morto; può curare anche sé stesso.
- **Modifiche**: annulla una morte, anche con un solo utilizzo per l'intera
  partita.
- **Implementazione**: `AzioneResuscita.jsx` (`resuscitaPatch` in
  `effettiNotte.js`, imposta `condizioni:['resuscitato']` +
  `resuscitatoNotte`, annunciato all'alba). **Corretto in questo giro**:
  ora agisce anche da morto (`puoAgireDaMorto`, vedi "Correzioni
  applicate").
- **Edge case**: può scegliere sé stesso tra i candidati (`morti` include
  tutti i morti, lui compreso se morto) — coerente col regolamento ("può
  scegliere di usare il proprio potere anche verso sé stesso", anche se
  quella frase si riferisce letteralmente a quando è vivo; da morto,
  resuscitare sé stesso è l'unico modo sensato di leggerla).

### Innocente (villaggio, rivelazione diurna volontaria)
- **Regole**: può mostrare la propria carta quando lo ritiene opportuno per
  dimostrare la propria innocenza.
- **Modifiche**: nessuna meccanica, solo informazione pubblica volontaria.
- **Implementazione**: evento generico "Rivelazione personaggio"
  (`ruoliRivelabili` lo include, non ha un evento dedicato perché non
  richiede altro che assegnargli il ruolo quando il giocatore lo decide).
- **Edge case**: nessuno — a differenza di Boia/Alchimista/Spilungone/
  L'Antico, qui la rivelazione **non** è legata a nessun'altra azione
  automatica, quindi il percorso generico è quello corretto.

### Inquisitore (villaggio, notturno)
- **Regole**: ogni notte può (non deve) interrogare qualcuno; se indaga
  inutilmente un'aura benevola, perde il potere per sempre.
- **Modifiche**: indagine binaria opzionale con un costo permanente in caso
  di errore.
- **Implementazione**: `AzioneInquisitore.jsx`, usa `auraDi()`; flag
  `poteriUsati` include `'inquisitore-potere-perso'` quando l'esito è
  benevolo, controllato a ogni render successivo.
- **Edge case**: nessuno — l'opzione "Salta" è esplicitamente prevista
  (`mostraSalta`), coerente col "non deve" del regolamento.

### Ladro (sconosciuto, notturno, solo prima notte)
- **Regole**: si aggiungono due carte extra al mazzo; la prima notte guarda
  le due carte rimaste (quelle non distribuite) e sceglie una delle due o
  resta Villico; se sono entrambe Lupo Mannaro, deve scambiare.
- **Modifiche**: la composizione finale dei ruoli in gioco si decide a
  runtime, non alla costruzione del mazzo.
- **Implementazione**: **riprogettato in questa sessione** (vedi commit
  precedente). Le due carte si scelgono al suo turno
  (`AzioneLadro.jsx`, campo `ladro.scartoLadro` sul giocatore stesso, non
  più uno state separato nel mazzo); la carta non scelta riduce
  `quantita[ruolo]` di 1 tramite `onCambiaQuantita` (passato da `App.jsx`
  → `NightSequencer.jsx` → l'azione). Il ruolo assunto genera i suoi
  passi notturni tramite `ruoliAttivi()` (bug storico già corretto nel
  giro precedente).
- **Edge case**: se sceglie una delle due carte, l'altra riduce
  `quantita` di 1 anche se quel ruolo era già completamente assegnato
  altrove (`Math.max(0, ...)` evita valori negativi, ma non impedisce
  "consumare" una copia già distribuita in scenari di mazzo inconsistenti —
  situazione anomala non prevista dal flusso normale).

### L'Antico (villaggio, rivelazione diurna)
- **Regole**: due vite; se perde la prima al rogo, si rivela e maledice il
  villaggio (nessun potere si sveglia la notte successiva), poi gioca da
  Villico; se la perde di notte, si rivela senza conseguenze e gioca da
  Villico.
- **Modifiche**: sopravvive alla prima "morte" cambiando permanentemente
  fazione/ruolo, e può bloccare un'intera notte di poteri.
- **Implementazione**: morte di notte gestita in `effettiNotte.js#uccidiPatch`
  (uno dei pochi punti dove la morte viene **intercettata prima** di
  accadere, non dopo); morte al rogo tramite
  `GiornoPanel.jsx#dichiaraAnticoRivelazione` (imposta `notteBloccataFinoA`)
  — ora raggiungibile anche senza pre-assegnazione (vedi "Correzioni
  applicate" punto 3, gestito insieme allo Spilungone in `Votazione.jsx`).
- **Edge case**: non ha un contatore "vite" esplicito — la seconda morte lo
  uccide semplicemente come un Villico qualsiasi, perché il suo `ruoloSlug`
  è già cambiato. Se muore di notte E al rogo nella stessa sequenza (non
  possibile nel flusso reale, una morte esclude l'altra nello stesso ciclo)
  non c'è ambiguità perché il primo evento già lo trasforma in Villico.

### Lupo Mannaro (lupi, notturno)
- **Regole**: ogni notte sceglie con gli altri lupi una vittima; vince se i
  lupi sono pari o superiori al resto del villaggio.
- **Modifiche**: il "motore" principale della fazione lupi.
- **Implementazione**: `AzioneBrancoLupi.jsx`, `RUOLI_BRANCO_LUPI` in
  `nightSteps.js`; identificazione collettiva nel passo "il branco si
  riconosce" (dopo che Cucciolo/Capobranco/Progenitore sono già stati
  identificati singolarmente, vedi sessione corrente); vittoria in
  `vittoria.js`.
- **Edge case**: candidati esclusi dal morso: Cortigiana, Nano, Criceto
  Malvagio (`RUOLI_IMMUNI_AL_BRANCO`); un bersaglio protetto non muore
  (`uccidiPatch` rispetta `protetto`); limite di un morso a notte, due se
  vendetta del Cucciolo attiva (`AzioneBrancoLupi.jsx#limite`).

### Lupo Mannaro Capobranco (lupi, notturno)
- **Regole**: obiettivo personale di restare l'ultimo vivo; caccia col
  branco ma può scegliere di uccidere anche i propri fratelli; decide lui in
  caso di indecisione sulla vittima.
- **Modifiche**: introduce un conflitto di interesse interno al branco
  (non modellato come regola forzata, solo come possibilità narrativa).
- **Implementazione**: identificato singolarmente tra i poteri passivi
  (`nightSteps.js`, come Cucciolo/Progenitore); conta come `RUOLI_BRANCO_LUPI`
  per aura/vittoria/candidati; "uccidere i fratelli" e "decidere in caso di
  indecisione" **non sono meccaniche applicate dal codice** — il branco ha
  un solo target scelto dal narratore in `AzioneBrancoLupi.jsx`, che può già
  scegliere chiunque, fratelli inclusi, senza bisogno di un permesso
  speciale del Capobranco.
- **Edge case**: nessun vincolo tecnico impedisce a un narratore di far
  scegliere al branco una vittima anche senza il Capobranco presente o vivo
  — la regola "ha lui l'ultima parola in caso di indecisione" è puramente
  di tavolo (il gruppo di giocatori decide chi propone, l'app non arbitra
  disaccordi tra giocatori).

### Lupo Mannaro Progenitore (lupi, notturno)
- **Regole**: caccia col branco; una volta a partita può trasformare in
  Lupo Mannaro la vittima del branco invece di ucciderla, svegliandola
  segretamente per fargli conoscere gli altri lupi.
- **Modifiche**: può convertire un morso in un reclutamento.
- **Implementazione**: identificato singolarmente tra i poteri passivi
  (come Cucciolo/Capobranco). **Il potere di trasformazione non è
  implementato**: `AzioneBrancoLupi.jsx` applica sempre `uccidiPatch`
  (morte), non c'è un'opzione "trasforma invece di uccidere". Gap non
  segnalato nei giri precedenti.
- **Edge case**: 🟡 gap reale, non solo ambiguità — vedi appendice.

### Maga (villaggio, notturno)
- **Regole**: ogni notte trasforma qualcuno in maiale per un giorno (parla
  solo a grugniti fino al calar della notte).
- **Modifiche**: condizione puramente narrativa/di ruolo-play, nessun
  effetto meccanico oltre al vincolo di comportamento.
- **Implementazione**: `AzioneCondizioneSingola.jsx` (condizione
  `trasformato`), ripulita da `daRipulireCambioNotte` al calare della notte
  successiva.
- **Edge case**: nessuno — il "parla solo a grugniti" non è (e non deve
  essere) applicato dall'app, è un vincolo di comportamento tra giocatori.

### Medium (villaggio, notturno)
- **Regole**: ogni notte interroga un membro defunto sul suo "vecchio
  ruolo", guardandone la carta.
- **Modifiche**: indagine sui morti invece che sui vivi.
- **Implementazione**: `AzioneRivelaRuolo.jsx` (condiviso con Cartomante),
  `bersaglio:'morto'`.
- **Edge case**: la variante regolamento ("percepisce solo se l'aura era
  benevola o malvagia", non il ruolo esatto) **non è implementata** — il
  Medium mostrato dall'app rivela sempre il ruolo esatto. Non segnalato nei
  giri precedenti; da considerare un gap se la variante è quella
  effettivamente in uso al tuo tavolo (vedi appendice).

### Mezzosangue (villaggio, non notturno)
- **Regole**: se sbranato dai lupi non muore ma diventa Lupo Mannaro; se
  mai sbranato resta Villico normale.
- **Modifiche**: capovolge l'esito di un morso specifico.
- **Implementazione**: `effettiNotte.js#risolviAttaccoBranco`, ramo
  dedicato prima del calcolo standard di morte.
- **Edge case**: come la Figlia dei Lupi, la conversione lo rende
  indistinguibile da un lupo normale in ogni meccanismo successivo. Solo il
  morso del branco lo converte (Strega/Chupacabra lo ucciderebbero
  normalmente) — fedele al testo, che dice "se viene sbranato dai lupi".

### Mimo (sconosciuto, notturno, solo prima notte)
- **Regole**: la prima notte sceglie un giocatore e ne imita il ruolo per
  tutta la partita; se il ruolo imitato agisce di notte, il Mimo si sveglia
  insieme a lui (un'unica azione condivisa).
- **Modifiche**: la sua identità reale non è "mimo" per il resto della
  partita, ma una copia esatta di un altro ruolo (fazione/vittoria incluse).
- **Implementazione**: **riprogettato in questa sessione**
  (`AzioneMimo.jsx`). Sceglie il bersaglio; se il bersaglio ha già un ruolo
  noto lo assume subito, altrimenti il narratore sceglie la carta del
  bersaglio da un elenco (ruoli nel mazzo + Villico sempre disponibile) e
  **entrambi** — Mimo e bersaglio — ricevono quel `ruoloSlug`. Da quel
  momento compaiono insieme nel passo del ruolo condiviso
  (`giocatoriCoinvolti` li trova entrambi per lo stesso `ruoloSlug`), con
  una singola azione visibile (l'azione stessa non distingue chi dei due
  clicca).
- **Edge case**: se imita un ruolo a copia unica (es. Veggente) e sia lui
  sia il bersaglio finiscono per avere `storiaRuoli` che include
  `'veggente'`, `contaAssegnati` conterebbe 2 invece di 1 — non blocca
  nulla (nessuna validazione rigida sulle quantità), ma un'eventuale
  seconda assegnazione "reale" di quel ruolo a un terzo giocatore
  risulterebbe già "esaurita" secondo `ruoliAssegnabili`. Scenario raro
  (richiede un ruolo a copia unica sia imitato dal Mimo sia già nel mazzo
  per un altro giocatore, cosa che non dovrebbe succedere in un mazzo ben
  composto).

### Mucca Mannara (lupi, notturno, solo prima notte)
- **Regole**: la prima notte identifica segretamente i membri del branco
  (pollice alzato); vince coi lupi ma non uccide, non caccia.
- **Modifiche**: solo informazione, nessuna azione o effetto su altri.
- **Implementazione**: fazione `'lupi'` in `roles.js` (vittoria
  automatica); passo puramente informativo; esclusa da
  `RUOLI_BRANCO_LUPI`.
- **Edge case**: nessuno.

### Nano (villaggio, non notturno)
- **Regole**: non notato dai lupi di notte, quindi non può essere ucciso da
  loro; può morire solo al rogo.
- **Modifiche**: ruolo passivo, unica interazione è l'immunità.
- **Implementazione**: `RUOLI_IMMUNI_AL_BRANCO`.
- **Edge case**: 🟡 il testo dice "può morire *solo* al rogo" (frase più
  ampia della semplice immunità ai lupi) — attualmente Strega e Chupacabra
  possono comunque ucciderlo di notte. Vedi dubbio in appendice (stesso
  punto per Criceto Malvagio).

### Nonna (lupi, notturno)
- **Regole**: un lupo mannaro qualsiasi sotto mentite spoglie; il Veggente
  la vede sempre benevola.
- **Modifiche**: un lupo "invisibile" alle indagini di aura.
- **Implementazione**: identificata insieme al branco generico nel passo
  "il branco si riconosce" (non ha un passo dedicato come Cucciolo/
  Capobranco/Progenitore, perché non ha un potere/identità distinta da
  tracciare in anticipo); **non** inclusa in `AURA_MALVAGIA`, quindi
  `auraDi()` la classifica benevola per costruzione, senza codice
  dedicato.
- **Edge case**: nessuno.

### Paladino (villaggio, notturno)
- **Regole**: ogni notte protegge qualcuno (anche sé stesso) dal morso dei
  lupi.
- **Modifiche**: rende immune un bersaglio per una notte.
- **Implementazione**: `AzioneCondizioneSingola.jsx` (condizione
  `protetto`), letta da `uccidiPatch` (blocca la morte, a meno che
  `ignoraProtezione`, usato solo dalla pozione mortale della Strega).
  Ripulita a fine notte.
- **Edge case**: protegge anche dal Chupacabra (passa per `uccidiPatch`
  come i lupi) — coerente con "protetto... non può morire quella notte per
  i morsi del branco **o del Chupacabra**" (testo di `conditions.js`).

### Pastore (villaggio, non notturno)
- **Regole**: se il primo vivo alla sua destra o sinistra è un lupo, le
  pecore si agitano e all'alba si sentono belati.
- **Modifiche**: nessuna azione, solo un annuncio pubblico condizionato
  alla disposizione dei posti a sedere.
- **Implementazione**: `alba.js#annunciAlba`, usa `viciniVivi()`
  (`vicinanza.js`) per trovare il primo vivo in ciascuna direzione,
  saltando i morti.
- **Edge case**: con 2 o meno giocatori vivi, "sinistra" e "destra"
  potrebbero coincidere con lo stesso giocatore (`viciniVivi` gestisce il
  wraparound su `n` giocatori, non testato esplicitamente per n molto
  piccolo — improbabile in una partita reale che arrivi a quel punto col
  Pastore ancora vivo).

### Pifferaio (indipendente, notturno)
- **Regole**: ogni notte ipnotizza due persone; vince quando tutti i vivi
  sono ipnotizzati; gli ipnotizzati si riconoscono ogni notte.
- **Modifiche**: condizione che si accumula fino a coprire l'intera
  popolazione viva.
- **Implementazione**: `AzioneCondizioneDoppia.jsx` (condizione
  `ipnotizzato`, mai rimossa — corretto, è permanente); passo informativo
  "Sveglia gli ipnotizzati dal Pifferaio" per ultimo nell'ordine notturno
  (`condizione:'ipnotizzato'` in `nightSteps.js`); vittoria in
  `vittoria.js` (`vivi.every(pifferaio||ipnotizzato)`, con guardia per non
  duplicare l'annuncio quando resta lui solo).
- **Edge case**: nessuno — il conteggio "tutti ipnotizzati" si ricalcola a
  ogni render, sempre coerente con lo stato corrente.

### Polpo Mannaro (lupi, non notturno)
- **Regole**: quando il Veggente lo indaga, viene accecato (vedrà tutti
  benevoli finché il Polpo non muore); il Veggente Mannaro non può essere
  accecato.
- **Modifiche**: disattiva silenziosamente il ruolo investigativo
  principale del villaggio.
- **Implementazione**: `AzioneIndagine.jsx` (`puoEssereAccecato =
  ruoloSlugAttore==='veggente'`, esclude esplicitamente il Veggente
  Mannaro); rimozione alla morte del Polpo in
  `effettiNotte.js#rimuoviAccecamentoSeMortoPolpo`, agganciata alla catena
  generica di morte.
- **Edge case**: nessuno — gestito con precisione anche nel dettaglio "solo
  il Veggente, non il Veggente Mannaro".

### Sacerdote (villaggio, notturno, solo prima notte)
- **Regole**: la prima notte unisce due persone in un legame d'amore; se
  una muore, l'altra muore di crepacuore.
- **Modifiche**: collega il destino di due giocatori.
- **Implementazione**: `AzioneCondizioneDoppia.jsx` (condizione
  `innamorato`); `effettiNotte.js#applicaCrepacuore`, agganciata alla
  catena generica di morte.
- **Edge case**: `applicaCrepacuore` assume **una sola coppia** di
  innamorati in gioco per partita (nessun `partnerId` tracciato: alla morte
  di uno, muoiono *tutti* gli altri giocatori ancora "innamorati", non solo
  il partner specifico). Con una sola coppia per partita (fisiologico, un
  solo Sacerdote nel mazzo) non è un problema in pratica, ma è un limite
  di modello noto (commentato nel codice) se mai si permettessero più
  legami contemporanei.

### Scemo del Villaggio (villaggio, rivelazione diurna)
- **Regole**: deve parlare solo in rima; se sbaglia, muore sul colpo.
- **Modifiche**: vincolo di comportamento con una penalità di morte
  immediata, entrambi giudicati dal narratore.
- **Implementazione**: nessun controllo automatico "ha rimato o no" (non
  automatizzabile): la sua morte passa dal generico evento "Morte
  improvvisa" (`causaMorte:'colpo'`), come Boia/Untore.
- **Edge case**: nessuno oltre all'ovvio: l'app non sa distinguere questa
  morte da un'esecuzione del Boia o un'unzione — tutte finiscono con lo
  stesso `causaMorte:'colpo'`, indistinguibili nel log. Non un problema
  pratico (il narratore sa sempre il perché), ma da tenere presente se mai
  servisse un log più dettagliato.

### Sciacallo Mannaro (lupi, notturno)
- **Regole**: può far resuscitare un altro giocatore una volta a partita,
  anche da morto; non conosce i lupi e non caccia con loro.
- **Modifiche**: come il Guaritore, ma nella fazione lupi.
- **Implementazione**: `AzioneResuscita.jsx` (stesso componente del
  Guaritore, `potereSlug` diverso). **Corretto in questo giro**: agisce
  anche da morto (`puoAgireDaMorto`).
- **Edge case**: non è in `RUOLI_BRANCO_LUPI` (non caccia, coerente); la
  sua fazione `'lupi'` lo fa comunque contare per la vittoria dei lupi.

### Spilungone (villaggio, rivelazione diurna)
- **Regole**: troppo alto per il rogo, non può essere giustiziato; se
  favorito al rogo si rivela e la notte cala senza vittime.
- **Modifiche**: immunità totale al rogo, con un effetto collaterale (nessun
  morso quella notte).
- **Implementazione**: gestito interamente in `Votazione.jsx`. **Corretto
  in questo giro** (vedi "Correzioni applicate" punto 3): rivelabile anche
  senza pre-assegnazione.
- **Edge case**: "la notte cala senza vittime" è testuale nel messaggio
  mostrato al narratore, ma **non blocca davvero i poteri notturni** (a
  differenza del Maledetto de L'Antico o del Bardo) — è il narratore a
  dover interpretare la frase, l'app non impedisce ai lupi di sbranare
  quella notte. 🟡 Vedi dubbio in appendice: potrebbe essere un'incoerenza
  di implementazione, o una lettura intenzionalmente lasca del testo (la
  frase potrebbe riferirsi solo al fatto che "nessuno muore *per il rogo*",
  non che l'intera notte sia neutralizzata).

### Strega (villaggio, notturno)
- **Regole**: due pozioni, una vitale (protegge per la notte) e una
  mortale (uccide), ciascuna usabile una volta a partita, indipendentemente
  l'una dall'altra.
- **Modifiche**: unico ruolo con due poteri distinti nello stesso passo.
- **Implementazione**: `AzioneStrega.jsx`, due `SceltaGiocatore` separate
  con stato indipendente (`poteriUsati` include entrambe le chiavi
  separatamente). La pozione mortale usa `ignoraProtezione:true` in
  `uccidiPatch` — l'unico potere che scavalca la protezione del Paladino.
- **Edge case**: può usare entrambe le pozioni nella stessa notte, anche
  sullo stesso bersaglio (proteggerlo e poi ucciderlo comunque con la
  mortale, dato che quest'ultima ignora la protezione) — non vietato dal
  regolamento, comportamento coerente.

### Suocera (villaggio, rivelazione diurna automatica)
- **Regole**: nessuna differenza tra vita e morte per lei; quando muore, si
  rivela e continua a parlare; non conta come viva per le condizioni di
  vittoria.
- **Modifiche**: rimane "attiva" nel gioco (può parlare, influenzare la
  discussione) anche da morta, ma non pesa nel conteggio vittoria.
- **Implementazione**: `vittoria.js#contaComeVivo` la esclude
  esplicitamente da ogni calcolo; la sua rivelazione passa dal generico
  "Rivelazione personaggio" (nessun evento dedicato necessario, la morte
  stessa è già gestita come qualunque altra).
- **Edge case**: nessuno — l'unica specificità (l'esclusione dal conteggio
  vittoria) è implementata con un solo controllo esplicito, difficile da
  dimenticare o rompere accidentalmente.

### Ubriaco (villaggio, non notturno)
- **Regole**: se sbranato dai lupi, l'alcol nel sangue li stordisce,
  impedendo loro di uccidere la notte successiva.
- **Modifiche**: la sua morte "punisce" il branco con un salto di caccia.
- **Implementazione**: `effettiNotte.js#risolviAttaccoBranco`, imposta
  `brancoStorditoFinoA: round+1` su ogni membro vivo del branco; letto da
  `AzioneBrancoLupi.jsx` per bloccare l'azione quella notte.
- **Edge case**: come Berserker/Mezzosangue, scatta solo se sbranato *dal
  branco* — Strega/Chupacabra non attivano lo stordimento (fedele al
  testo).

### Untore (villaggio, notturno)
- **Regole**: ogni notte unge qualcuno; il giorno dopo, se dice sì o no,
  muore sul colpo e unge chi ha ai fianchi.
- **Modifiche**: crea una trappola verbale che può propagarsi.
- **Implementazione**: `AzioneCondizioneSingola.jsx` (condizione `unto`),
  ripulita al calare della notte successiva; annunciata all'alba
  (`alba.js`).
- **Edge case**: 🟡 **la propagazione ("infetta chi ha ai fianchi") non è
  implementata** — l'app applica solo la condizione al primo bersaglio; se
  quel giocatore "parla" e dovrebbe morire e infettare i vicini, tutto va
  gestito a mano dal narratore (morte con evento generico "Morte
  improvvisa", nessuna unzione automatica dei vicini). Gap non segnalato
  nei giri precedenti — vedi appendice.

### Veggente (villaggio, notturno)
- **Regole**: ogni notte legge l'aura di un vivo (benevola/malvagia).
- **Modifiche**: la principale fonte di informazione del villaggio.
- **Implementazione**: `AzioneIndagine.jsx` (`ruoloSlugAttore:'veggente'`
  di default), `auraDi()`; può subire l'accecamento del Polpo Mannaro.
- **Edge case**: nessuno oltre a quanto già coperto per Polpo Mannaro/
  Ambasciatore.

### Veggente Mannaro (lupi, notturno)
- **Regole**: come il Veggente, ma non conosce il branco e patteggia per
  loro; non può essere accecato dal Polpo Mannaro.
- **Modifiche**: una seconda fonte di indagine, ma allineata ai lupi.
- **Implementazione**: `AzioneIndagine.jsx` riusata con
  `ruoloSlugAttore:'veggente-mannaro'`; esplicitamente escluso
  dall'accecamento (`puoEssereAccecato`); non è in `RUOLI_BRANCO_LUPI`
  ("non conosce il branco", coerente — non caccia né viene identificato con
  loro).
- **Edge case**: la sua aura personale non è nella whitelist
  `AURA_MALVAGIA` (coerente: il regolamento non lo elenca tra le aure
  malvagie, solo Lupo Mannaro/Cucciolo/Capobranco/Progenitore/Chupacabra/
  Eremita lo sono), quindi un altro Veggente che lo indagasse lo vedrebbe
  benevolo — fedele al testo.

### Villico (villaggio, non notturno)
- **Regole**: nessun potere, vota per mandare al rogo i sospetti.
- **Modifiche**: nessuna — è il "default" del gioco.
- **Implementazione**: **non assegnabile a mano** (`RUOLI_NON_ASSEGNABILI_MANUALMENTE`,
  aggiunto in questa sessione): chi resta senza ruolo a fine notte lo
  diventa in automatico (`NightSequencer.jsx#autoAssegnaVillici`, corretto
  in questo giro per scattare sempre a fine notte, non solo quando il
  passo "assegna-restanti" esiste — vedi bug #1 della sessione precedente).
- **Edge case**: nessuno rimasto — era la fonte del bug più importante di
  tutta la sessione (giocatori mai assegnati), ora coperta da un fallback
  incondizionato.

---

## ❓ Appendice — dubbi aperti per la tua revisione

### A. Bardo: "salta la notte" neutralizza i poteri invece di saltare la fase (riproposto dal giro precedente)

Per il Gallo Mannaro il salto è un vero cambio di fase (Alba → Notte
successiva, il round incrementa, il Giorno non si vede mai). Per il Bardo la
notte si presenta comunque al narratore, ma nessun passo di tipo "azione"
viene mostrato (stesso meccanismo del Maledetto de L'Antico). L'effetto per
i giocatori è identico (nessun potere si usa), ma il narratore vede
comunque scorrere gli eventuali passi informativi. Il giro precedente
motivava la scelta con la complessità di sincronizzare `round` in più punti
dell'app (`mortoNotte`, `brancoStorditoFinoA`, ecc.) se il salto del Bardo
— che può capitare a qualunque notte, non solo alla prima — disallineasse
quei contatori. **Non hai mai risposto a questa domanda**: vuoi che
investa nel salto di fase reale anche per il Bardo, o va bene tenere questa
semplificazione?

### B. Borgomastro: voto doppio non automatizzato (riproposto dal giro precedente)

`Votazione.jsx` conta voti come un totale per candidato (pulsanti +1/-1),
non registra "chi ha votato chi": non c'è un punto dove raddoppiare
automaticamente il voto del Borgomastro senza cambiare il modello di voto
(tracciare il voto di ogni singolo giocatore). Per ora il narratore deve
ricordarsi di premere +1 due volte quando vota il Borgomastro. **Vuoi che
investa nel rifacimento del modello di voto**, o preferisci un
promemoria visivo (es. un'icona accanto al suo nome nella lista di voto,
soluzione via di mezzo, poco lavoro) e lasci il resto manuale?

### C. Immunità di Nano / Criceto Malvagio: solo dai lupi, o da ogni potere mortale notturno?

Nano: "non può venire ucciso da loro [lupi]... può morire solo durante il
rogo". Criceto Malvagio: "non può essere ucciso da loro [lupi] di notte".
Entrambi attualmente immuni **solo** al branco (`RUOLI_IMMUNI_AL_BRANCO`):
Strega e Chupacabra possono ancora ucciderli di notte. La frase di Nano
("può morire solo al rogo") è più ampia e potrebbe implicare un'immunità
totale ai poteri notturni, non solo al branco. **Vuoi che estenda
l'immunità a Strega/Chupacabra per questi due ruoli**, o l'attuale lettura
(immuni solo ai lupi) è quella corretta?

### D. Cortigiana: "sbranata dal branco" letteralmente, o "morta di notte" in generale?

`risolviCortigiana` uccide la Cortigiana se il suo cliente muore con
`causaMorte==='notte'`, qualunque sia la causa reale (branco, Strega,
Chupacabra). Il testo dice specificamente "se il cliente scelto viene
sbranato **dal branco**". **Vuoi che restringa il controllo al solo
morso del branco** (es. aggiungendo un flag alla morte per distinguere
"chi" ha ucciso), lasciando la Cortigiana immune se il cliente muore per
mano di Strega/Chupacabra? È un cambiamento un po' più invasivo (serve
propagare "chi ha ucciso" nei vari resolver, non solo "quando").

### E. Ruoli che "diventano" un altro ruolo non ereditano lo stato di quel ruolo

Addolorata (scambio col morto al rogo), Apprendista (eredita il maestro) e
Mimo (imita il bersaglio) copiano solo `ruoloSlug`, mai `poteriUsati` /
`usiNotte` / `condizioni` del ruolo di provenienza. Esempio concreto: se il
maestro dell'Apprendista era una Strega che aveva già usato la pozione
vitale, l'Apprendista che eredita "Strega" riparte con **entrambe** le
pozioni disponibili. **È il comportamento che vuoi** (ogni "nuovo titolare"
riparte fresco, più semplice da spiegare a un tavolo) **o preferisci che
erediti anche i poteri già consumati**? Cambierebbe le tre implementazioni
in modo simile (copiare più campi invece di uno solo).

### F. Lupo Mannaro Progenitore: il potere di trasformazione non è implementato

"Una sola volta per partita può decidere di trasformare in Lupo Mannaro la
vittima del branco" — attualmente `AzioneBrancoLupi.jsx` uccide sempre la
vittima, non c'è un'opzione per il Progenitore di trasformarla invece.
Gap reale, non solo ambiguità di interpretazione. **Vuoi che lo
implementi** (richiede: un'opzione aggiuntiva nella scelta della vittima,
solo se il Progenitore è vivo e non ha già usato il potere; la vittima
trasformata diventerebbe `ruoloSlug:'lupo-mannaro'` invece di morire, come
già avviene per Mezzosangue/Figlia dei Lupi)?

### G. Medium: variante regolamento (percepisce solo l'aura, non il ruolo esatto)

Il testo del Medium include una "Variante" opzionale: percepisce solo se il
vecchio ruolo aveva aura benevola o malvagia, non il ruolo esatto.
L'app implementa solo la versione base (ruolo esatto, condivisa con
Cartomante). **Giochi con la variante?** Se sì, andrebbe reso configurabile
(come già fatto per la variante del Borgomastro con carta scoperta fin
dall'inizio, gestita fuori dall'app perché non cambia la logica).

### H. Untore: la propagazione dell'unto ai vicini non è implementata

"Se lo farà [parlare] morirà all'istante, infettando il vicino alla sua
destra e quello alla sua sinistra" — l'app applica la condizione `unto` al
solo bersaglio scelto dall'Untore; se quel giocatore muore per aver
parlato, l'unzione dei due vicini è interamente a carico del narratore
(nessuna azione automatica). **Vuoi che automatizzi la propagazione**
(richiederebbe un nuovo evento "L'Unto ha parlato", simile a "Morte
improvvisa", che oltre a uccidere il giocatore applichi `unto` ai due
vicini tramite `vicini()` già presente in `vicinanza.js`)?

### I. Spilungone: "la notte cala senza vittime" non blocca davvero i poteri notturni

Il messaggio mostrato al narratore lo dice testualmente, ma l'app non
imposta alcun `notteBloccataFinoA` per questo caso (a differenza del
Maledetto de L'Antico o del salto del Bardo) — i lupi possono comunque
cacciare quella notte se lo Spilungone si rivela. **È voluto** (la frase si
riferisce solo a "nessuno muore per il rogo", non a un blocco totale dei
poteri) **o va allineato** al comportamento di Maledetto/Bardo?

### J. Fantasma Onnisciente

Confermato dal giro precedente: non implementato su tua richiesta esplicita.
Lo ripropongo solo per completezza del documento, non serve una nuova
risposta a meno che tu non abbia cambiato idea.

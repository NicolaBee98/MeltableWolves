# Audit del Mimo, 2 ottobre 2026

Revisione in **sola lettura** del comportamento del Mimo in tutte le fasi (setup, notti, alba, giorno, morti, vittoria, registro, refresh), pensata per permetterti di rivedere le logiche di un ruolo complesso. Nessun file di codice è stato modificato.

**Come leggere il documento.** Ogni punto distingue la *regola del gioco* (come la intende il libretto) dal *comportamento dell'app*. I riferimenti sono nel formato `file:riga`. Ogni affermazione ha un livello di affidabilità:

- **CERTO**: verificato eseguendo il codice (test usa-e-getta, vedi Appendice A) o leggendo un percorso privo di ambiguità.
- **PROBABILE**: dedotto dalla lettura del codice, non riprodotto con un test, o dipendente da una tua scelta di regola.
- **DUBBIO**: il libretto non dice abbastanza; serve una tua decisione (raccolte nella sezione 4.3).

Stato analizzato: ramo `main` a partire dal commit `6f08328` **più le modifiche non ancora committate** presenti nell'albero di lavoro (tra cui `azioni/index.js`, che rimuove `perAttore` dalle azioni di ogni notte, `AzioneCondizioneSingola/Doppia.jsx`, `GiornoPanel.jsx`, `Votazione.jsx`, `annullaMorte.js`). La suite del progetto passa per intero (58 file, 669 test) prima delle mie prove.

---

## 0. Sintesi (le cose da sapere in 30 secondi)

1. **Esistono due percorsi di identità, e solo uno è "sano".** Se il narratore sceglie la carta del bersaglio nel passo Mimo, il Mimo diventa a tutti gli effetti quel ruolo (percorso 1). Se preme *Avanti* senza sceglierla, il Mimo resta `ruoloSlug: 'mimo'` per sempre e "segue" il bersaglio solo come promemoria a schermo (percorso 2). Il commento nel codice dice che nel percorso 2 il Mimo "adotterà" il ruolo più avanti: **non lo fa mai** (CERTO). Nessun controllo impedisce di finire nel percorso 2 per dimenticanza, e un refresh della pagina nel passo Mimo lo causa silenziosamente (sezione 1.4).
2. **Percorso 2, conseguenze verificate:** se il bersaglio muore il Mimo smette di svegliarsi; non conta come lupo se imita un lupo (il villaggio vince anche se il Mimo "è" un lupo); aura sempre benevola; non ha una scelta autonoma per Sacerdote/Apprendista/Cavaliere/Figlia dei Lupi; non partecipa a Pastore, Ambasciatore, Cucciolo (CERTO).
3. **Bug certo sulla Guardia Mannara:** quando il Mimo imita una Guardia, l'app assegna a caso la "traditrice" anche tra i Mimi che copiano la Guardia (1 volta su 4 nel mio test), e poiché il Mimo non occupa un posto, l'assegnazione non viene mai conteggiata e a ogni conferma di ruolo successiva nella prima notte **ne viene scelta un'altra** (due traditrici). Vedi B2.
4. **Cambiando bersaglio nel passo Mimo la carta già scelta resta selezionata** e viene applicata al *nuovo* bersaglio (CERTO, vedi B3).
5. **Bardo e Gallo Mannaro sono riutilizzabili tramite il Mimo**: se il Bardo che ha già usato il potere muore, il Mimo-Bardo vivo lo ritrova disponibile (CERTO, vedi B4).
6. **Boia, Alchimista, Scemo, Innocente, Suocera, Fantasma, Borgomastro non possono essere scelti come carta imitata** e un Mimo che resta `'mimo'` non compare mai negli eventi diurni (che elencano solo i giocatori *senza* ruolo): imitare questi ruoli è strutturalmente non supportato (CERTO, vedi B5).
7. Molte scelte di regola sono aperte (aura, vittoria, Cartomante/Medium, poteri "una volta per partita" condivisi o separati, Mimo che imita Addolorata, ecc.): 17 domande nella sezione 4.3.

---

## 1. Regola del gioco e modello dati

### 1.1 La regola (testo del libretto)

`src/data/roles.js:66-67`:

> "La prima notte sceglie un giocatore e ne imita il ruolo per tutta la partita. Se il ruolo scelto compie delle azioni di notte (*Lupo Mannaro, Veggente, Paladino* etc.) il *Mimo* si sveglia assieme ad esso e si accorda sull'agire."

Altre indicazioni del libretto:

- Ordine della prima notte: "Fai agire *Mimo* e poi il *Ladro*" (`src/data/libretto.js:126`). L'app lo rispetta: il passo `mimo` è il primo in `src/data/nightSteps.js:17`, seguito dal Ladro.
- Fazione: *sconosciuto* (`roles.js:66`); caratteristiche: solo prima notte + "necessario toccare il giocatore" (`roles.js:148`), cioè il Mimo tocca il bersaglio.
- Nel mazzo è **una sola carta** (`quantitaRuoli.js:60-62`, massimo 1): è una carta fisica che occupa un giocatore. Il ruolo imitato non aggiunge carte né giocatori.

Il libretto **non dice** (domande nella sezione 4.3): se i poteri "una volta per partita" del ruolo imitato sono condivisi o separati; se il Mimo continua a imitare quando il bersaglio muore o cambia ruolo; che aura abbia il Mimo; se conti come lupo; cosa veda la Cartomante/il Medium guardando la sua carta; come imiti i ruoli che si rivelano solo di giorno.

### 1.2 Modello dati dell'app

Tutto vive nei giocatori (`usePartita.js`, salvati in `localStorage` chiave `meltable-wolves-partita`).

| Campo | Significato per il Mimo | Dove si scrive |
|---|---|---|
| `ruoloSlug` | Identità corrente. È `'mimo'` finché non sceglie la carta (percorso 2: per sempre); dopo la scelta della carta è il ruolo imitato (percorso 1) | assegnazione nel passo Mimo (`AssegnaRuolo`), poi `NightSequencer.jsx:289-301` |
| `legame` | `{tipo:'mimo', targetId}`: chi sta imitando. Resta per tutta la partita ma `risolviLegami` lo ignora (`risoluzioneNotte.js:48`) | `AzioneMimo.jsx:51` |
| `legameMimo` | Il Mimo ha `legame` già occupato; se imita Apprendista/Cavaliere/Figlia dei Lupi il legame **di quel ruolo** sta qui | `AzioneLegame.jsx:11` (`campo`) |
| `storiaRuoli` | Elenco append-only dei ruoli avuti. Il Mimo che copia ha `['mimo', 'X']`. `contaAssegnati` non conta **mai** chi ha `'mimo'` in storia (salvo per lo slug `mimo`): è così che "non occupa un posto" (`assegnazione.js:16`) | commit del Mimo, assegnazioni |
| `sceltaNotte` | Scelta del Sacerdote per attore, ripulita a fine notte (`NightSequencer.jsx:749-753`) | `AzioneCondizioneDoppia.jsx:61-` |
| `poteriUsati` / `usiNotte` | Poteri una tantum / usati questa notte, per persona fisica; vedi sezione 3 per cosa significa col Mimo | azioni |
| `condizioni` | Per persona (protetto, inibito, innamorato, ipnotizzato...) | azioni |

Funzioni chiave:
- `eMimoCopiante(g)` (`assegnazione.js:4-6`): vero se `ruoloSlug !== 'mimo'` e storia contiene `'mimo'` **o** `legame.tipo==='mimo'`. **Falso per il Mimo del percorso 2** (che ha ancora slug `mimo`).
- `mimoDiQuestoPasso` (`NightSequencer.jsx:28-32`): "il Mimo è coinvolto nel passo se il ruolo **attuale** del suo bersaglio è tra i ruoli del passo". Serve al percorso 2 (e come aggiunta visiva nel percorso 1).
- `aggiornaTuttiConRuolo` (`effettiNotte.js:181-185`): scrive un dato di "ruolo" su **tutti** gli slug uguali (titolare + Mimo).

### 1.3 Percorso 1: il bersaglio ha una carta scelta dal narratore

Flusso verificato (`AzioneMimo.jsx`, `NightSequencer.jsx:289-301`):

1. Passo `Mimo`: il narratore indica chi ha la carta Mimo (`AssegnaRuolo`) e poi "Chi imitare" (`AzioneMimo.jsx:44-57`). Il legame `{tipo:'mimo', targetId}` si scrive subito sul Mimo (`AzioneMimo.jsx:51`).
2. Se il bersaglio non ha ruolo (caso quasi sempre vero: il passo Mimo è il primo), compare "Che carta ha davvero X?" con l'elenco `ruoliAssegnabili(mazzo senza mimo e senza ruoli non-carta-segreta) + villico` (`AzioneMimo.jsx:78-87`).
3. La scelta resta **solo locale** (`mimoRuoloScelto`, stato React in `NightSequencer.jsx:279`) finché non si preme *Avanti*; appena applicata cambierebbe lo slug del Mimo e il passo `mimo` sparirebbe dall'elenco a metà scelta (motivazione scritta in `AzioneMimo.jsx:13-20`).
4. Con *Avanti* (`commitMimoSeSelezionato`, `NightSequencer.jsx:289-301`): **entrambi** (Mimo e bersaglio) ricevono `ruoloSlug = X` e `storiaRuoli += X`. La storia del Mimo diventa `['mimo','X']`, quella del bersaglio `['X']`.

Perché così: i due giocatori hanno lo stesso slug, quindi *tutta* la logica esistente (passi notturni, branco, aura, vittoria, immunità, Pastore...) funziona senza codice speciale. Il Mimo "è" il ruolo. Il Mimo non consuma una carta del mazzo grazie a `contaAssegnati`.

Esempio (Mimo Sara imita il Veggente Marco, bersaglio ignoto): dopo Avanti `Sara: veggente, storia [mimo, veggente]`, `Marco: veggente, storia [veggente]`; nel passo Veggente compare "Veggente (Sara, Marco)" con una sola riga di scelta condivisa (provato).

### 1.4 Percorso 2: il Mimo resta `'mimo'`

Succede quando *Avanti* viene premuto **senza aver scelto la carta** (`AzioneMimo.jsx:78-107`: nessun vincolo); il codice lo prevede come "il bersaglio ha già un ruolo noto" (`AzioneMimo.jsx:64-73`), ma nella pratica il bersaglio ha un ruolo noto al passo Mimo quasi mai (il passo è il primo; "Indietro" ripristina lo stato d'ingresso, quindi neanche lì). Quindi:

**Si arriva al percorso 2 praticamente solo per omissione**: carta non scelta; elenco carte che non contiene quella vera (Boia, Alchimista, Scemo, Innocente...: vedi B5); **refresh della pagina** nel passo Mimo (`mimoRuoloScelto` non è persistito: il legame sì, la carta no; poi basta *Avanti*).

Cosa succede da lì (verificato):

- Il Mimo ha `ruoloSlug:'mimo'` per tutta la partita (nessun codice lo cambia più: `mimoDiQuestoPasso` è puramente di presentazione, `NightSequencer.jsx:25-27`).
- Nei passi del ruolo del bersaglio il Mimo compare tra i coinvolti perché `mimoDiQuestoPasso` legge lo slug **attuale** del bersaglio (`NightSequencer.jsx:28-32`, `filtraCoinvolti` righe 37-41).
- Ma qualunque cosa che guardi `ruoloSlug` (aura, vittoria, branco, immunità, Pastore, Cortigiana, azioni dei ruoli, eventi diurni) vede un Mimo e non il ruolo imitato.

Test (A, B, H dell'Appendice): bersaglio Veggente morto, notte 2: `passiNotte` ritorna `[]` per il percorso 2 e `['veggente']` per il percorso 1; bersaglio Lupo: il percorso 1 fa vincere i lupi nel conteggio e l'aura è malvagia, il percorso 2 non conta il Mimo come lupo e l'aura è benevola; al morire del lupo originale il percorso 1 continua, il percorso 2 fa vincere il villaggio.

**Raccomandazione sintetica**: rendere la carta obbligatoria (o rimuovere il percorso 2) oppure far "adottare" davvero il ruolo. Dettagli nella sezione 5.

---

## 2. Tabella fase per fase

Legenda "Coerente?": **SI** = coerente con la regola; **PARZ.** = coerente solo in parte o solo in un percorso; **NO** = incoerente; **?** = regola non chiara (domanda in sezione 4.3).
"P1"/"P2" = percorso 1 / percorso 2 della sezione 1.

### 2.1 Setup, mazzo, prima notte

| Fase | Comportamento attuale | Coerente? | Rischi / note |
|---|---|---|---|
| Mazzo (conteggio giocatori attesi) | La carta Mimo vale 1 e il Mimo è 1 giocatore; il ruolo imitato non aggiunge posti: `totaleRuoliMazzo` (`App.jsx:57-61`) somma le quantità, tolti Ladro (-2), Borgomastro, Fantasma. Nessuna validazione dedicata al Mimo in `validaMazzo.js`. Massimo 1 Mimo nel mazzo (`quantitaRuoli.js:60`) | SI | Due Mimo e "Mimo che copia il Mimo" sono impossibili: la quantità è bloccata a 1 e l'elenco carte esclude `mimo` (`AzioneMimo.jsx:81`). Chi imita un Mimo non esiste |
| Prima notte: ordine | Passo `mimo` primo, poi Ladro (`nightSteps.js:17-18`) | SI | Coerente col libretto |
| Prima notte: chi è il Mimo | "Chi ha questa carta?" come ogni ruolo (`AssegnaRuolo.jsx`); capacità 1 | SI | |
| Prima notte: scelta del bersaglio | `SceltaGiocatore` tra tutti i vivi tranne il Mimo (`AzioneMimo.jsx:32,44-57`); riclic sulla chip lo deseleziona e annulla anche la carta (`AzioneMimo.jsx:39-42,48-51`) | SI | Può scegliere chiunque, compreso il Ladro |
| Prima notte: scelta della carta quando il bersaglio è ignoto | Elenco = ruoli assegnabili del mazzo (senza `mimo`, senza `RUOLI_NON_CARTA_SEGRETA`) + Villico sempre (`AzioneMimo.jsx:78-87`, `eventiSpeciali.js:25`) | PARZ. | Mancano Boia, Alchimista, Scemo, Innocente, Suocera, Fantasma, Borgomastro (B5). Offre "Guardia Mannara" come voce separata da "Guardia", contro il principio che le due carte sono indistinguibili (`roles.js:196-204`). **Nessun obbligo di scegliere** (B1) |
| Prima notte: bersaglio cambiato dopo aver scelto la carta | `onConferma` cambia solo il legame (`AzioneMimo.jsx:48-52`); `mimoRuoloScelto` resta (B3) | NO | La carta del vecchio bersaglio finisce al nuovo, provato |
| Prima notte: assegnazione ruoli (commit) | Con *Avanti*: Mimo e bersaglio `ruoloSlug=X`, storia +X (`NightSequencer.jsx:289-301`). Il commit usa `giocatori` reali, non i "pendenti" | SI (P1) | `mimoRuoloScelto` non sopravvive al refresh (P4) |
| Conteggio titolari/quantità | `contaAssegnati` ignora chi ha `'mimo'` in storia (`assegnazione.js:16`); `AssegnaRuolo` esclude il Mimo copiante dai titolari e dal conteggio posti (`AssegnaRuolo.jsx:54-60`) e ne mostra comunque la figura nella riga collettiva (`AssegnaRuolo.jsx:122-125`). Test esistente: Mimo che copia 2 lupi lascia i 2 posti liberi | SI (P1) | P2: `eMimoCopiante` è falso, ma il Mimo ha slug `mimo` quindi non interferisce nemmeno lì: coerente per sbaglio |
| "Torna ai giocatori" / Indietro nel passo Mimo | Indietro riapre il passo da zero con lo snapshot d'ingresso (`NightSequencer.jsx:311-330`) e azzera `mimoRuoloScelto` | SI | |
| Deselezione del bersaglio al passo del **ruolo imitato** | Se nel passo (es. Veggente) si toglie la carta al bersaglio, `rimuoviAssegnazione` (`NightSequencer.jsx:584-625`) ripristina lo snapshot dei titolari d'ingresso: **il Mimo resta Veggente** mentre il bersaglio torna senza ruolo | PROB. | Il Mimo non viene riallineato; per correggere bisogna andare Indietro fino al passo Mimo (P3) |

### 2.2 Prima notte, passi successivi (i ruoli "prima notte solo")

| Ruolo imitato | Comportamento attuale | Coerente? | Rischi / note |
|---|---|---|---|
| Apprendista | `perAttore` (`index.js:62`): due scelte indipendenti, "Scelta di Anna" / "Scelta di Mia (Mimo)" (`NightSequencer.jsx:886-898`). Il legame del Mimo va in `legameMimo` (`AzioneLegame.jsx:11`) e `legame:{mimo}` non si tocca | SI (P1) | **P2**: il Mimo ha slug `mimo`, quindi `attoriAzione` (`NightSequencer.jsx:504-511`) non lo include: **una sola scelta, per il titolare**, il Mimo non ne ha una sua (provato con il Sacerdote) |
| Cavaliere | Come sopra. `risolviLegami` esamina entrambi i campi (`risoluzioneNotte.js:13,22,46`) | SI (P1) | Stesso limite P2 |
| Figlia dei Lupi | Come sopra; se il genitore muore, il Mimo-Figlia diventa `lupo-mannaro` (`risoluzioneNotte.js:46-57`) | SI (P1) | Lo slug cambia ma `storiaRuoli` non si aggiorna (comportamento generale, non solo Mimo) |
| Sacerdote | `perAttore` (`index.js:53-55`): coppia per attore, salvata in `sceltaNotte` (`AzioneCondizioneDoppia.jsx:61-`); sciogliere la propria coppia non tocca quella dell'altro (test esistente) | SI (P1) | Le condizioni `innamorato` restano per sempre; la coppia del Mimo è indipendente. P2: una sola scelta (provato). Nota: `crepacuore` ipotizza una sola coppia (`effettiNotte.js`, commento `ponytail`) |
| Ruoli passivi (Berserker, Nano, Ubriaco, Pastore, Ambasciatore, Eremita, Criceto, Mezzosangue, Polpo, Nonna, Cucciolo, Capobranco) | Lo slug copiato fa tutto: immunità al branco (`effettiNotte.js:8`), Ubriaco stordisce il branco se sbranato, Berserker uccide il lupo vicino, Mezzosangue sbranato diventa lupo (storia aggiornata), ecc. | SI (P1) | P2: nessun effetto (il Mimo è un abitante qualsiasi). Casi dubbi: Q11, Q12 |
| Bardo / Gallo Mannaro (gesto segreto) | Il Mimo-Bardo ha la sua riga; ma `bardoDisponibile`/`galloDisponibile` cercano **il primo Bardo vivo** (`eventiSpeciali.js:39-47`) e il flag `poteriUsati` va su quello | NO | B4: riutilizzo dopo la morte di chi l'ha usato |
| Guardia / Guardia Mannara | Passo di riconoscimento: figure attese per copia + una figura "Mimo" in più (`NightSequencer.jsx:106-121`). La traditrice è scelta a caso tra tutti gli slug `guardia` (`assegnazione.js:42-53`) | NO | B2 (Mimo può diventare traditrice, doppia assegnazione). P2: la figura del Mimo manca (usa `eMimoCopiante`, `NightSequencer.jsx:117-119`) |
| Mucca Mannara, Criceto Malvagio, Eremita... (informativi) | Passo informativo, Mimo mostrato come figura "Mimo" (`NightSequencer.jsx:89`) | SI | |
| Ladro | Il Mimo che imita il Ladro è un "attore" insieme al Ladro (`AzioneLadro.jsx:17-19`): **una sola scelta**, scritta su entrambi (`AzioneLadro.jsx:61-73`), incluse storia, `poteriUsati` e le carte di scarto. Provato: Marco(Ladro)+Sara(Mimo) scelgono Veggente, entrambi `veggente`, storie `[ladro,veggente]` e `[mimo,ladro,veggente]`, quantità del Paladino scartato scese a 0, nel passo dopo compare "Veggente (Sara, Marco)" | PARZ. | Q8: il Mimo deve scegliere la **stessa** carta del Ladro o una sua? Con lo stesso slug il Ruolo scelto è raddoppiato (due persone Veggente) |
| Elenco "Chi ha questa carta" nei ruoli imitati | Il bersaglio è già titolare con chip evidenziata; il Mimo no (`AssegnaRuolo.jsx:54-59`) | SI (P1) | |
| Fine prima notte | `autoAssegnaRuoliRimasti` assegna Villico ai senza ruolo (`NightSequencer.jsx:676-697`) | SI | Un Mimo con carta "villico" ha storia `[mimo, villico]` e non occupa un posto Villico |

### 2.3 Ogni notte: ruoli che scelgono/agiscono

Principio in vigore (modifica non committata in `index.js:18-21`): **le azioni di ogni notte sono una sola, condivisa** tra titolare e Mimo ("si accorda sull'agire"). `perAttore` resta solo per le scelte della prima notte. Le azioni cercano "il" titolare con `giocatori.find(ruoloSlug===...)` (il **primo** nell'elenco giocatori) e scrivono i dati d'esito su tutti gli slug uguali (`aggiornaTuttiConRuolo`).

| Ruolo imitato | Comportamento attuale (P1) | Coerente? | Rischi |
|---|---|---|---|
| Paladino, Untore, Maga | Una sola scelta (`AzioneCondizioneSingola.jsx:15,19`); `usiNotte` segnato su tutti i titolari (`segnaUsoStanotte`, `effettiNotte.js:157`). Il Mimo-Paladino non protegge "due volte" | SI | P7: con `escludiAttore` solo il **primo** titolare è escluso dai bersagli; se il Mimo copia una Fattucchiera/Pifferaio, il secondo titolare può essere scelto come bersaglio (dipende dall'ordine dell'elenco) |
| Fattucchiera | Idem. Il passo Fattucchiera non è mai saltato per inibizione (`NightSequencer.jsx:496-499`) | SI | La Fattucchiera può inibire il Mimo-Fattucchiera (secondo titolare non escluso): effetto nullo ma insensato |
| Pifferaio | Una scelta condivisa (due bersagli), `escludiAttore` solo sul primo (`AzioneCondizioneDoppia.jsx:20-21`). I Mimi-Pifferaio sono "pifferai" nel controllo vittoria (`vittoria.js:44-49`): non devono essere ipnotizzati per vincere | PARZ. | Q15. Se il Pifferaio muore e resta solo il Mimo-Pifferaio, "pifferaioVivo" è vero: continua a poter vincere |
| Strega | Pozioni uniche condivise: lo stato `poteriUsati` vive sul **primo** Strega trovato, vivo o morto (`AzioneStrega.jsx:13`) | SI (se condivise) | Q5: due Streghe (titolare e Mimo) hanno **un solo** set di pozioni: è la lettura "si accorda" |
| Veggente | Esito `ultimaIndagine` scritto su tutti i Veggenti (`AzioneIndagine.jsx:64-66`); l'aura letta è quella dello **slug** del bersaglio (`aura.js:10-12`). Candidati: tutti i vivi tranne il **primo** Veggente (`AzioneIndagine.jsx:22`): il secondo (Mimo o titolare) è indagabile | PARZ. | Aura del Mimo (Q2, Q3). Il secondo Veggente indagabile dipende dall'ordine dell'elenco (P7) |
| Veggente Mannaro | Come il Veggente, senza accecamento | SI | |
| Inquisitore | Esito e perdita permanente del potere scritti su tutti (`AzioneInquisitore.jsx`, `aggiornaTuttiConRuolo`) | SI | Se il titolare perde il potere, lo perde anche il Mimo (condiviso) |
| Cortigiana | Visita scritta su tutte le Cortigiane (`AzioneCortigiana.jsx`); risolta **per ciascuna** (`risoluzioneNotte.js:68-`): se il cliente è un lupo, **muoiono entrambe** | PARZ. | Il Mimo-Cortigiana è anch'esso immune al branco (`effettiNotte.js:8`) e non selezionabile dai lupi |
| Cartomante | Il Mimo imita: una sola scelta; il ruolo "rivelato" è lo slug del bersaglio (`AzioneRivelaRuolo.jsx:72,151`) | ? | Se il bersaglio è un Mimo (P1) l'app mostra il ruolo **copiato**, non "Mimo" (Q4) |
| Medium | Idem su morti; con variante, aura (`AzioneMedium.jsx`) | ? | Q4; Mimo morto mostra il ruolo copiato |
| Guaritore / Sciacallo | Potere unico condiviso, stato sul primo titolare (`AzioneResuscita.jsx:12`) | SI (se condiviso) | Q5 |
| Chupacabra | Una caccia; il Mimo-Chupacabra non è un lupo ma il cacciatore può puntarlo (solo il primo titolare è escluso, `AzioneChupacabra.jsx:21`) | PARZ. | Vittoria e "ultimo sopravvissuto" con due Chupacabra: Q15 |
| Branco / lupi | Il Mimo-lupo (P1) è in `RUOLI_BRANCO_LUPI` e partecipa: coinvolto nel passo, conta come lupo nel conteggio vittoria e per Pastore/Cortigiana/Berserker/Chupacabra | SI (se conta come lupo: Q3) | P2: il Mimo con bersaglio lupo non si sveglia più col branco se il bersaglio muore |
| Ladro | Vedi 2.2 | PARZ. | |
| Addolorata | `scambia()` usa `aggiornaTuttiConRuolo('addolorata')` (`AzioneAddolorata.jsx:42-47`): **titolare e Mimo ricevono entrambi il ruolo della vittima**, la vittima diventa Addolorata. Provato: vittima Lupo, Mimo e Addolorata diventano entrambi `lupo-mannaro` e i lupi vincono | PARZ. | Il ruolo della vittima passa a due persone: Q8 |
| Guardie | Notte 1 soltanto | SI | B2 |
| Pastore | `annunciAlba` considera **ogni** Pastore vivo (`alba.js:7-14`): il Mimo-Pastore ha le sue pecore | SI (P1) | P2: nessun effetto |
| Ambasciatore | Annuncio se **qualunque** Ambasciatore vivo e un Veggente ha avuto aura benevola (`alba.js:16-20`) | SI | Un Veggente morto nella stessa notte conta ancora (non controlla `vivo`), indipendente dal Mimo |

Inibito (Fattucchiera) e condizioni sul Mimo (`NightSequencer.jsx:496-499`): un passo è bloccato solo se **tutti** i coinvolti (titolare + Mimo) sono inibiti; se solo uno lo è, l'azione resta disponibile. Per il branco (più ruoli) l'inibizione non blocca mai (`step.ruoli.length === 1`). Lettura plausibile ("il Mimo inibito non agisce, il titolare sì"), ma è una tua decisione: Q12.

### 2.4 Ruoli passivi e a rivelazione diurna

| Caso | Comportamento attuale | Coerente? | Rischi |
|---|---|---|---|
| Passivi copiati (P1) | Vedi 2.2 | SI | |
| Spilungone, L'Antico copiati dal Mimo | Sono ammessi come carta (`RUOLI_NON_CARTA_SEGRETA` non li esclude). Il Mimo diventa `spilungone`/`lantico` e quindi non è bruciabile (Spilungone, `Votazione.jsx:215-216`) / ha due vite (Antico, `effettiNotte.js:126-138`) | PARZ. | Due Antichi: ognuno la sua prima vita; rivelazione e maledizione per ciascuno (Q13) |
| Boia, Alchimista, Scemo, Innocente | **Non scegliibili** come carta del bersaglio (`eventiSpeciali.js:25`). Gli eventi diurni listano solo `!ruoloSlug` (`EventiSpeciali.jsx:122,292,307`): il Mimo con slug `mimo` o copiato non compare mai | NO | B5. Un Mimo che imita davvero uno di questi non ha modo di agire |
| Borgomastro | Titolo `eBorgomastro` per giocatore (`GiornoPanel.jsx:125-128`): il Mimo non lo eredita; il Mimo del Borgomastro imita la carta sottostante | ? | Q14 |
| Suocera, Fantasma | Non sono carte in mano a vivi: Mimo non può imitarli. Il Fantasma segue `eFantasmaOnnisciente`, indipendente | SI | Un Mimo morto al rogo per primo può ricevere il Fantasma: "vince secondo il ruolo che aveva": il ruolo è lo slug corrente (copiato) |

### 2.5 Alba

| Fase | Comportamento | Coerente? | Note |
|---|---|---|---|
| Morti della notte | `AlbaPanel.jsx:28-33` elenca per nome, senza ruolo | SI | |
| Annunci | Pastore, Ambasciatore, resuscitati, unti, trasformati, Antico, Cavaliere (`alba.js`) | SI | Mimo: vedi 2.3 |
| Rivelazione dell'Antico (sbranato) | `AlbaPanel.jsx:69-77`, per slug `lantico`: si applica anche al Mimo-Antico | PARZ. | Il testo dell'alba dice "è L'Antico": cosa mostra il Mimo-Antico quando "si rivela"? Q13 |
| Boia all'alba | `EventiSpeciali.jsx`: attore tra i `nonAssegnati` | NO | B5 |
| Annulla morte | `annullaMorteCompleta` (`annullaMorte.js:26-29`) ripristina dallo snapshot l'intera catena | SI | Generico |

### 2.6 Giorno, voto, rogo, eventi speciali

| Fase | Comportamento | Coerente? | Note |
|---|---|---|---|
| Voto, rogo | `dichiaraRogo` (`GiornoPanel.jsx:32-35`): generico. `confermaMorte` (`Votazione.jsx:215-231`) legge lo slug: un Mimo con slug `spilungone`/`alchimista`/`lantico` ha l'esito speciale (P1) | PARZ. | P2: il Mimo muore sempre "normale" anche se il bersaglio è Spilungone |
| Rivelazione diurna del bersaglio ignoto | `puoEssere...` solo se `!target.ruoloSlug` (`Votazione.jsx:317-319`) | PARZ. | Un Mimo (slug `mimo`) non può mai rivelarsi come Alchimista/Spilungone/Antico (stesso limite B5) |
| Boia/Scemo/Unzione/Alchimista | Eventi in `EventiSpeciali.jsx`: attore tra `nonAssegnati` | NO | B5 |
| Bardo/Gallo | `bardoDisponibile`/`galloDisponibile` | NO | B4 |
| Elenco morti con ruolo | `BadgeRuolo` usa `ruoloIconaGiocatore(g)` (`roles.js:209-212`): un Mimo P1 si mostra come il ruolo copiato; P2 come "Mimo" | ? | Incoerenza tra i due percorsi; Q4 |

### 2.7 Morti, catene, annullamenti

| Caso | Comportamento attuale | Coerente? | Note |
|---|---|---|---|
| Crepacuore, Sacerdote | Per persona (`applicaCrepacuore`, `effettiNotte.js`): indipendente dal Mimo | SI | Una sola coppia supposta in tutta la partita (nota `ponytail` nel codice) |
| Vendetta del Cucciolo | `attivaVendettaCucciolo` (`effettiNotte.js:91-`) scatta se muore **qualunque** `cucciolo-di-lupo-mannaro`, quindi anche il Mimo-Cucciolo (P1: provato, `Cucciolo`+`Lupo` ricevono la vendetta) | ? | Q11. P2: la morte del Mimo non innesca nulla |
| Maturazione del Cucciolo | `maturaCucciolo` (`effettiNotte.js:239-`): al primo `eLupo` morto, tutti i Cuccioli vivi (anche il Mimo-Cucciolo) diventano lupi | ? | Un Mimo-lupo che muore per primo fa maturare il Cucciolo vero |
| Apprendista che eredita | `risolviLegami` (`risoluzioneNotte.js:46-`): prende `target.ruoloSlug`. Maestro Mimo **P1**: eredita il ruolo copiato (es. Veggente); maestro Mimo **P2**: eredita `'mimo'` (provato), cioè un Mimo senza legame né potere | NO | P5, Q10 |
| Cavaliere (bersaglio = Mimo) | Indipendente dal ruolo (`risoluzioneNotte.js:22-40`) | SI | |
| Figlia (genitore = Mimo) | Indipendente | SI | |
| Mimo morto | Nessun trattamento speciale | SI | I dati copiati restano |
| Mimo resuscitato | `resuscitaPatch` (`effettiNotte.js:139-`): non tocca ruolo né legami | SI (P1) | |
| Annullamenti | `annullaMorte` (`usePartita.js:145-`) ripristina dallo snapshot, `legame`/`legameMimo`/`storiaRuoli` inclusi | SI | |

### 2.8 Vittoria, aura, registro, icone, persistenza

| Aspetto | Comportamento | Coerente? | Note |
|---|---|---|---|
| Vittoria lupi | `lupiVivi = vivi.filter(eLupo(slug))` (`vittoria.js:33`): un Mimo-lupo P1 **conta come lupo**; un Mimo P2 conta come abitante | ? | Q3. Il villaggio non può vincere finché il Mimo-lupo vive (P1) |
| Ultimo sopravvissuto (Chupacabra, Pifferaio) | Il flag `vinceUltimoSopravvissuto` è del ruolo dello slug (`vittoria.js:52-55`): se rimane solo un Mimo-Chupacabra, "vince il Chupacabra" | ? | Q15 |
| Criceto | `cricetoVivo` per slug: un Mimo-Criceto vivo ruba la vittoria | ? | Q15 |
| Aura (Veggente/Inquisitore) | `auraDi(slug)` (`aura.js:10-12`): Mimo P1 con lupo/Chupacabra/Eremita = malvagia; Mimo P2 = benevola; Mimo-Nonna benevola | ? | Q2 |
| Illustrazioni | Il Mimo è sempre la figura "Mimo" nei passi dove si sveglia col ruolo copiato (`NightSequencer.jsx:86-97`); mai la figura del ruolo copiato. La riga delle figure attese (lupi/guardie) include il Mimo solo in P1 (`:117-119`) | PARZ. | Differenza P1/P2 |
| Nomi mostrati | Nel titolo del passo compaiono i nomi dei coinvolti, Mimo compreso (`NightSequencer.jsx`: titolo `step.titolo (nomi)`) | SI | Solo schermata del narratore |
| Registro | `rilevaEventi` (`log.js:51-53`) registra "X ha assunto il ruolo di Y" quando lo slug cambia: P1 registra il cambio del Mimo (`mimo` -> `X`) ma **non il legame di imitazione**; P2 non registra nulla; il bersaglio che riceve la carta la prima volta non genera evento | PARZ. | P1 (registro) |
| Persistenza | `giocatori` (incluso `legame`, `legameMimo`, `storiaRuoli`, `sceltaNotte`) in `localStorage` (`usePartita.js:14-20,123`); `ingresso` del passo salvato in `meltable-wolves-notte` (`useNotte.js`). Non persistito: `mimoRuoloScelto`, `selezioniRuolo`, `storico` | PARZ. | P4: un refresh nel passo Mimo perde la carta scelta; *Avanti* porta in P2 senza avvisi |

---

## 3. Casi particolari

1. **Mimo che imita Ladro.** Provato (Appendice A, test "Ladro"): una sola scelta applicata a entrambi; il ruolo scelto è ora in mano a **due** persone (Ladro e Mimo); `contaAssegnati` conta 1 (il Mimo non conta); le quantità scartate calano una volta. Problema aperto: regola (Q8). Rischio tecnico: `attori[0]` è il "Ladro" per `scartoLadro`/`usato` (`AzioneLadro.jsx:17-22`): coerente perché le carte di scarto sono scritte su entrambi.
2. **Mimo che imita Addolorata** (identità che cambia). Provato: lo scambio avviene su **tutti** gli `addolorata` (`AzioneAddolorata.jsx:42-47`): Mimo e titolare ricevono il ruolo della vittima del rogo; la vittima diventa Addolorata. Il marcatore `addolorata-scambio` finisce su entrambi, quindi il potere risulta usato. Se la vittima era un lupo, il villaggio ne guadagna due; se era il Mimo P2, l'Addolorata prende `mimo` (ruolo fantasma). Q8.
3. **Il titolare del ruolo imitato muore/cambia.** P1: nessun effetto sul Mimo (copia congelata); è l'interpretazione "per tutta la partita". P2: il Mimo si addormenta (provato) o segue i cambi dinamicamente (Ladro/Addolorata cambiano il bersaglio, il Mimo "segue" lo slug attuale: comportamento diverso dal P1 per la stessa situazione). Q6.
4. **Mimo che imita un ruolo a più copie.** Lupi (provato nel test esistente): il Mimo non occupa un posto, compare come figura "Mimo" nel branco. Guardie: B2. Villici: il Mimo "villico" ha storia `[mimo, villico]`, non occupa un posto Villico; il `autoAssegnaRuoliRimasti` non lo vede. Q9.
5. **Mimo che imita il Mimo.** Impossibile: unica carta e `mimo` escluso dalle carte. Due Mimo: impossibile col mazzo (max 1). Se un Apprendista eredita `mimo` (P5) si ottiene un secondo slug `mimo` senza legame né azione.
6. **Mimo morto o resuscitato.** Nessun trattamento speciale: coerente con "il ruolo è lo slug".
7. **Mimo inibito / ipnotizzato / innamorato / protetto.** Le condizioni sono per persona e indipendenti; l'inibizione blocca il passo solo se tutti i coinvolti sono inibiti. Q12.
8. **Mimo come bersaglio di Cavaliere/Apprendista/Figlia.** Indipendente dal ruolo; l'unico caso problematico è l'Apprendista (sopra, P5).
9. **Mimo che imita Boia/Alchimista/Scemo/Innocente.** Esclusi dalla scelta della carta e dagli eventi; B5. (Verificato nel codice: `RUOLI_NON_CARTA_SEGRETA`, `eventiSpeciali.js:25`.)
10. **Mimo che imita Cartomante/Medium.** Una sola scelta condivisa; se il bersaglio è il Mimo, l'app mostra "Mostra a Cartomante la carta: Veggente" (ruolo copiato, P1) o "Mimo" (P2), non la carta fisica. Q4.
11. **Mimo che imita un ruolo ancora ignoto e poi il titolare si rivela.** Con Boia/Scemo/Alchimista/Innocente il Mimo resta in P2 ("mimo") e il bersaglio si rivela più tardi con il suo evento: il Mimo **non** diventa mai Boia/Scemo/ecc. (B5). Con altri ruoli, il percorso corretto è scegliere subito la carta.
12. **Mimo che imita Borgomastro/Fantasma.** Borgomastro: Q14. Fantasma non è una carta di un vivo, non imitabile.
13. **Mimo e Pastore/Ambasciatore.** P1: ognuno col suo vicino (Pastore); Ambasciatore multiplo basta uno vivo. P2: nulla.
14. **Mimo e Antico.** P1: due Antichi indipendenti. P2: il Mimo muore al primo colpo mentre il bersaglio sopravvive. Q13.

---

## 4. Elenco finale ordinato

### 4.1 Bug certi (riproducibili)

**B1. La carta del bersaglio non è obbligatoria e un refresh nel passo Mimo la cancella: il Mimo finisce nel percorso 2 senza avvisi.**
Riproduzione: notte 1, passo Mimo, scegli chi è il Mimo, scegli il bersaglio, **non** scegliere la carta, premi *Avanti* (provato: `Sara: mimo`, bersaglio senza ruolo; poi nel passo Sacerdote Marco->Sacerdote e il passo mostra "Sacerdote (Sara, Marco)" con **una sola** riga "Chi unire"). In alternativa: scegli la carta, ricarica la pagina, premi *Avanti*. Conseguenze (verificate): sezione 1.4. Il commento in `AzioneMimo.jsx:61-63` ("lo scoprirà/adotterà quando quel ruolo si sveglierà") non è realizzato da nessun codice. File: `AzioneMimo.jsx:64-73`, `NightSequencer.jsx:289-301`.

**B2. Guardia Mannara: la traditrice può essere il Mimo e viene assegnata più volte.**
Riproduzione: mazzo con Guardie (2), Guardia Mannara (1) e Mimo; il Mimo imita una Guardia (carta "Guardia"); al passo "Le Guardie si riconoscono" si seleziona il gruppo. `assegnaGuardiaMannaraCasuale` (`assegnazione.js:42-53`) sceglie a caso tra **tutti** gli slug `guardia`, Mimo incluso (test: 49 volte su 200). Se tocca al Mimo, la sua storia perde `guardia` e diventa `[mimo, guardia-mannara]`, ma `contaAssegnati` ignora chi ha `mimo`: il conteggio resta 0 (provato). La funzione è richiamata a **ogni** commit di selezioni (`NightSequencer.jsx:574`), quindi alla prossima assegnazione (es. Mucca Mannara) ne sceglie una **seconda** (provato: la seconda chiamata assegna ancora). Rimedio: escludere `eMimoCopiante` da quel filtro.

**B3. Cambiare bersaglio dopo aver scelto la carta applica la carta al nuovo bersaglio.**
Riproduzione: passo Mimo, scegli Marco, scegli la carta Veggente, scegli Nina come nuovo bersaglio: il tasto Veggente resta premuto, *Avanti* assegna Veggente a Nina (provato: `Sara: veggente`, `Nina: veggente`, `Marco`: nessun ruolo). `AzioneMimo.jsx:48-52` non azzera `mimoRuoloScelto`; solo la deselezione (`:39-42`) lo fa. Gravità media: la chip premuta è visibile, ma è facile non accorgersene.

**B4. Bardo e Gallo Mannaro si "ricaricano" grazie al Mimo.**
Riproduzione: Bardo e Mimo-Bardo vivi; il Bardo usa il gesto e muore; `bardoDisponibile` ritorna `true` (provato: con Bardo vivo che l'ha usato `false`, dopo la sua morte `true`) perché prende il primo Bardo **vivo** (`eventiSpeciali.js:39-47`), il Mimo, che non ha il flag. Stessa cosa per il Gallo. È un bug se i poteri una tantum sono condivisi (Q5); se sono separati, il difetto è l'inverso (il Mimo non può usare il suo finché l'altro vive e l'ha usato).

**B5. Il Mimo non può imitare Boia, Alchimista, Scemo, Innocente (né eventi diurni su un Mimo `'mimo'`).**
Questi ruoli sono esclusi dalla carta del Mimo (`eventiSpeciali.js:25`) e gli eventi diurni elencano solo giocatori senza ruolo (`EventiSpeciali.jsx:122,292,307`, `Votazione.jsx:317-319`): un Mimo con slug `mimo` o già copiato non è un candidato. Se il bersaglio è il Boia, il Mimo non diventa Boia e non può giustiziare. Un Mimo che imita l'Antico o lo Spilungone invece funziona (non esclusi).

### 4.2 Bug probabili o incoerenze di minor gravità

**P1. Il registro non scrive mai l'imitazione** (chi imita chi). P1 scrive solo "X ha assunto il ruolo di Y" (`log.js:51-53`), P2 niente. Per rivedere una partita il narratore non trova traccia del bersaglio.

**P2. Riga delle figure attese (lupi, guardie) senza il Mimo del percorso 2** perché usa `eMimoCopiante` (`NightSequencer.jsx:117-119`); nel titolo però il nome c'è.

**P3. Toccare la carta del bersaglio dal passo del ruolo imitato** (deselezione) non riallinea il Mimo (`NightSequencer.jsx:584-625`): il Mimo resta con il ruolo di prima.

**P4. `mimoRuoloScelto` non persistito**: da solo non è un bug, ma amplifica B1.

**P5. Apprendista con maestro Mimo (P2)**: eredita `'mimo'` (`risoluzioneNotte.js:46-`): ruolo fantasma senza scelte; P1: eredita il ruolo copiato. Verificato con test dati.

**P6. L'Addolorata che scambia dà il ruolo della vittima a due persone** (titolare e Mimo): conseguenze di bilanciamento (lupi che raddoppiano). Verificato.

**P7. Escludere "il titolare" dai bersagli** (Veggente, Inquisitore, Cartomante, Cortigiana, Chupacabra, Pifferaio, Fattucchiera) toglie solo il **primo** della lista (`find`), quindi il secondo (titolare o Mimo, a seconda dell'ordine) resta bersagliabile.

**P8. Pifferaio: il Mimo-Pifferaio è esentato dall'ipnosi** nel controllo vittoria (`vittoria.js:44-49`): provato con Pifferaio+Mimo+1 ipnotizzato.

**P9. Il Polpo (accecamento) si rimuove alla morte di *qualunque* Polpo** (`effettiNotte.js:223-`) anche se ne resta un secondo (il Mimo-Polpo).


### 4.3 Domande di regolamento (dubbi)

Le domande hanno opzioni, con l'effetto di ciascuna. La decisione di fondo (**Q1**) condiziona quasi tutte le altre.

**Q1. Cos'è il Mimo dopo la copia?**
- (a) *Ruolo copiato a tutti gli effetti* (oggi, P1). Pro: la logica esistente funziona da sola. Contro: aura, vittoria, Cartomante, icone e registro mostrano un ruolo che sul tavolo (la carta fisica) è "Mimo".
- (b) *Resta il Mimo, "agisce come" il ruolo*. Richiede di rendere esplicite aura, vittoria, immunità e quante altre proprietà sono "ereditate".

**Q2. Aura del Mimo** per Veggente/Inquisitore: (a) quella del ruolo copiato (oggi in P1); (b) sempre benevola; (c) sempre quella del Mimo (benevola) finché il bersaglio è vivo, poi copia.

**Q3. Un Mimo che imita un lupo conta come lupo nelle condizioni di vittoria?** (a) Sì (oggi in P1: il villaggio non può vincere finché il Mimo-lupo vive e i lupi vincono col pareggio contando anche lui); (b) No, resta un abitante che si sveglia con il branco ma non conta nel pareggio.

**Q4. Cartomante/Medium su un Mimo:** (a) mostrano la carta fisica "Mimo" (alla lettera "il narratore le mostrerà la carta"); (b) mostrano il ruolo imitato (oggi in P1). Vale anche per l'elenco dei morti con ruolo e il registro.

**Q5. Poteri "una volta per partita" quando due persone hanno lo stesso ruolo** (Strega pozioni, Guaritore, Sciacallo, Addolorata, Bardo, Gallo, Boia, Alchimista, Inquisitore che perde il potere): (a) **condivisi**, un solo uso per i due (lettura "si accorda sull'agire", ciò che fanno oggi Strega/Guaritore/Sciacallo/Addolorata/Inquisitore); (b) **separati**, ognuno ha il suo (richiederebbe flag per persona anche per Strega, Guaritore, Sciacallo, e il fix di B4 e di bardo/gallo/boia/alchimista).

**Q6. Se il bersaglio muore o cambia ruolo, il Mimo?** (a) Resta con il ruolo imitato per sempre (P1, "per tutta la partita"); (b) segue il bersaglio nei cambi (Ladro, Addolorata, Apprendista che eredita...) ma continua anche dopo la sua morte; (c) imita solo finché il bersaglio è vivo.

**Q7. Mimo che imita Boia, Alchimista, Scemo, Innocente (Suocera, Borgomastro):** ammessi? Se sì il Mimo ha un uso separato? Come si rappresenta un ruolo che si rivela solo agendo (il narratore non può sceglierne la carta al passo Mimo)?

**Q8. Mimo che imita Ladro / Addolorata / Apprendista / Cavaliere / Figlia:** (a) Ladro: il Mimo sceglie **la stessa** carta del Ladro (oggi) o una carta propria? (b) Addolorata: il Mimo scambia con la **stessa** vittima (oggi: entrambi ricevono il ruolo, la vittima diventa Addolorata) o la scelta è unica e solo uno dei due scambia? (c) Apprendista/Cavaliere/Figlia: oggi ognuno sceglie il suo (`perAttore`): confermi che il Mimo può scegliere un maestro/protetto/genitore **diverso**?

**Q9. Mimo che imita un ruolo con più copie (lupi, Guardie, Villici):** occupa una "copia" del ruolo? Oggi no (posti liberi per i veri titolari). La Guardia: il Mimo-Guardia viene riconosciuto dalle altre Guardie? Può essere la Guardia Mannara (oggi sì per B2, e il narratore può anche sceglierla come carta)?

**Q10. Apprendista con maestro Mimo:** eredita (a) il ruolo imitato dal Mimo (P1) o (b) la carta del Mimo (con quale scelta di imitazione?)

**Q11. Mimo che imita il Cucciolo:** la sua morte causa la vendetta del branco (oggi sì in P1), e la sua morte conta come "primo lupo morto" per la maturazione del vero Cucciolo?

**Q12. Mimo inibito dalla Fattucchiera:** (a) perde i suoi poteri ma il titolare agisce normalmente; il titolare inibito e il Mimo no: il Mimo agisce da solo (oggi: il passo resta se non sono tutti e due inibiti); (b) inibizione condivisa (se uno è inibito, il passo è bloccato per entrambi).

**Q13. Mimo che imita L'Antico (o lo Spilungone):** due Antichi indipendenti con due vite proprie (oggi) o vita condivisa? Cosa mostra il Mimo quando "si rivela"?

**Q14. Mimo che imita il Borgomastro:** il titolo (voto doppio) è del giocatore, non della carta. Il Mimo lo eredita?

**Q15. Mimo che imita Criceto / Chupacabra / Pifferaio:** il Mimo vince insieme al ruolo imitato, vince da solo, o non conta come vincitore autonomo? (Oggi: il Mimo-Chupacabra è "ultimo sopravvissuto" come il Chupacabra; il Mimo-Criceto ruba la vittoria; il Mimo-Pifferaio è esentato dall'ipnosi.)

**Q16. Bersaglio ignoto e carta non nell'elenco.** Se il bersaglio ha davvero una carta non selezionabile (Boia ecc.), cosa fa il narratore? Oggi: premere *Avanti* senza scegliere (percorso 2).

**Q17. Ordine "Mimo prima del Ladro":** il libretto lo fissa. Oggi il Ladro non può scartare carte già assegnate (compresa quella scelta dal Mimo per il bersaglio, `AzioneLadro.jsx:29-40`): confermi che è la lettura voluta?

---

## 5. Raccomandazioni (in ordine di priorità)

1. **Chiudere il percorso 2** (B1): rendere obbligatoria la scelta della carta (disabilitare *Avanti* finché non c'è una carta, con un'eccezione esplicita "carta non nell'elenco"), oppure far adottare davvero il ruolo del bersaglio quando viene assegnato. Un solo percorso rende simili aura, vittoria, icone, Pastore, scelte autonome e morte del bersaglio.
2. **Escludere i Mimi copianti dalla traditrice Guardia Mannara** (B2): in `assegnaGuardiaMannaraCasuale` filtrare `!eMimoCopiante(g)` (e valutare di non offrire "Guardia Mannara" separata nella lista carte del Mimo).
3. **Azzerare `mimoRuoloScelto` quando cambia il bersaglio** (B3).
4. **Decidere Q5 e allineare Bardo/Gallo/Boia/Alchimista** (B4): oggi la logica è mista (Strega/Guaritore condivisi, Bardo "primo vivo").
5. **Decidere come il Mimo imita i ruoli diurni** (B5): o includerli nell'elenco con un segnaposto, o consentire la rivelazione a un Mimo `'mimo'`.
6. **Persistere la scelta pendente** (o applicarla subito con un marcatore) per eliminare l'effetto-refresh (P4).
7. **Registrare l'imitazione nel registro** (P1: "Sara imita Marco") e il suo ruolo effettivo; utile anche per rivedere una partita.
8. **Escludere tutti i titolari "stesso ruolo" dai bersagli** quando è un'azione condivisa (P7), indipendentemente dall'ordine dell'elenco.
9. **Riallineare il Mimo se si toglie la carta al bersaglio** dal passo del ruolo imitato (P3), o avvisare.
10. **Aggiungere test** per: percorso 2 (almeno documentare), Guardia Mannara+Mimo, cambio bersaglio, Bardo/Gallo condivisi, Apprendista con maestro Mimo.

---

## Appendice A. Come ho verificato

Test usa-e-getta in una cartella temporanea (scratchpad `/tmp/claude-1000/.../scratchpad`, `t_dati.test.js`, `t_dati2.test.js`, `t_ui.test.jsx`, `t_ui2.test.jsx`), eseguiti con la configurazione di vitest del progetto puntata a quei file; **nulla è stato aggiunto al repository**. Esito dei principali:

| Prova | Esito |
|---|---|
| Passi notte 2 con Mimo `'mimo'` e Veggente bersaglio morto | `[]` (P2) contro `['veggente']` (P1) |
| Vittoria e aura con bersaglio lupo | P1: "lupi vincono", aura malvagia; P2: nessun messaggio, aura benevola; lupo originale morto: P1 nessun messaggio, P2 "vince il Villaggio" |
| Guardia Mannara casuale con un Mimo-Guardia | Mimo scelto 49/200; dopo che il Mimo è GM `contaAssegnati(GM) = 0`; seconda chiamata assegna ancora un'altra Guardia |
| Apprendista con maestro Mimo morto | P2 eredita `mimo`; P1 eredita `veggente` |
| UI: cambio bersaglio dopo la carta | Carta Veggente resta premuta; dopo *Avanti* `Nina: veggente`, `Marco`: senza ruolo |
| UI: *Avanti* senza carta, poi Sacerdote al bersaglio | Mimo resta `mimo`; il passo mostra "Sacerdote (Sara, Marco)" con una sola riga di scelta |
| UI: Mimo imita Ladro | Entrambi `veggente`; quantità del Paladino scartato a 0; contaAssegnati veggente=1, ladro=1; passo successivo "Veggente (Sara, Marco)" |
| UI: Addolorata copiata dal Mimo | Titolare e Mimo `lupo-mannaro`, vittima `addolorata`, lupi vincono |
| UI: Veggente+Mimo | Un solo gruppo "Chi indagare", candidati: Marco, Nina, Olga (il Mimo è escluso, il titolare no, per l'ordine dell'elenco) |
| `bardoDisponibile` | Bardo vivo che ha usato: `false`; dopo la sua morte con Mimo-Bardo: `true` |
| Cucciolo copiato dal Mimo, muore | Vendetta attivata per Cucciolo e Lupo |
| Pifferaio+Mimo-Pifferaio, un ipnotizzato | "vince il Pifferaio" |
| Veggente morto la stessa notte con aura benevola | L'Ambasciatore annuncia comunque |

Suite del progetto prima delle prove: 58 file, 669 test, tutti verdi.

## Appendice B. Mappa dei file letti

`src/data/{roles,libretto,assegnazione,nightSteps,risoluzioneNotte,effettiNotte,alba,aura,vittoria,log,eventiSpeciali,quantitaRuoli,validaMazzo,vicinanza}.js`, `src/state/{usePartita,useNotte,useMazzo}.js`, `src/features/notte/{NightSequencer,AssegnaRuolo}.jsx`, `src/features/notte/azioni/*` (tutte), `src/features/giorno/{Votazione,GiornoPanel,EventiSpeciali,annullaMorte}`, `src/features/alba/AlbaPanel.jsx`, `src/App.jsx`, `docs/audit-ruoli-2026-09-22.md` (la sezione Mimo e l'appendice E sono ormai superate: `contaAssegnati` non conta più il Mimo e il Mimo non è più "solo promemoria" nel P1), `docs/audit-regolamento-2026-09-21.md` (punto 18, progetto originale del Mimo come promemoria: oggi sopravvive come P2).

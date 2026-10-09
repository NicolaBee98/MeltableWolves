# Settimo batch di partite di prova (Addolorata incrociata con legami, ipnotizzati, morti a catena, Borgomastro) - 2026-10-09

Chromium reale (Playwright, 390x844, dev server porta 5541), nessuna modifica al codice. Mazzo, giocatori, notti, alba, voto, rogo ed eventi speciali giocati dalla UI (scorciatoia usata solo per impostare la variante Medium in una partita). Scenari con 5-11 giocatori. Console: nessun errore ne' warning in tutte le partite; nessun overflow orizzontale; nessun softlock. Il pulsante di inizio notte ora si chiama "E' notte nel villaggio" (testi rivisti).

Convenzione dati osservata: un rogo del giorno N scrive `mortoNotte: N+1` (il round dell'Alba/Notte successiva) e il Boia/crepacuore/esplosione del giorno N scrivono `mortoGiorno: N+1`. E' il "mortoNotte errato" gia' aperto in matrice; l'Addolorata lo usa in modo coerente (`mortoNotte === round` della notte dopo il rogo), quindi qui non produce errori.

## Scenario 1 - Addolorata x Cavaliere (8 giocatori: Addolorata, Cavaliere, Veggente, 2 Lupi, 3 Villici)
- Cavaliere protegge G06, G06 al rogo: "Il Cavaliere G03 lo protegge: si immola al suo posto", G06 sopravvive. Notte 2: l'Addolorata (G04) propone lo scambio con G03 (Cavaliere immolato, `sacrificioDa: rogo`). Dopo lo scambio G04 e' Cavaliere "scarico" (`legame-ereditato`, legame vuoto: voluto, mai il legame dal Cavaliere immolato), G03 e' morto con carta Addolorata. Registro: "G03 ha assunto il ruolo di Addolorata", "G04 ha assunto il ruolo di Cavaliere". **ok**
- Cavaliere bruciato lui stesso (protetto G07 vivo): l'Addolorata eredita il legame (setting "eredita le scelte" attivo); notte 2 il branco attacca G07: muore G04 (ex Addolorata, ora Cavaliere) al suo posto, alba "G04 si e' rivelato: e' il Cavaliere". Il Cavaliere morto (G03, ora carta Addolorata) non protegge piu'. **ok**
- Cavaliere con protetto = Addolorata (G07) che scambia con un Villico: il legame segue la PERSONA (G07, ora Villico), il Cavaliere si immola ancora per lei quando il branco la attacca. **ok / dubbio** (vedi DUBBI 3).
- Registro: l'eredita' del legame appare come una scelta del nuovo titolare, "Il Cavaliere G04 sceglie di proteggere G07" in R2, scritta PRIMA di "G04 ha assunto il ruolo di Cavaliere" (vedi BUG 6).

## Scenario 2 - Addolorata x Apprendista x Figlia dei Lupi x Sacerdote x Medium x Cartomante (11 giocatori)
- Sacerdote unisce G09 e G10, Figlia ha genitore G09, Apprendista segue il Sacerdote G05. Rogo di G09 (innamorato e genitore): "Morira' anche G10 (crepacuore). La Figlia dei Lupi G04 diventa Lupo Mannaro", conferma poi "E' morto anche G10", G04 lupo-mannaro con storia [figlia, lupo]. Poi l'Addolorata (G06) scambia con G09: G06 diventa Villico, G09 (morto) e' Addolorata, la condizione `innamorato` resta sul cadavere (segue la persona). **ok**
- Cartomante interroga G06 (appena scambiata, ora Villico): mostra "Addolorata". **BUG 2** (stessa notte Veggente/branco vedono il ruolo corrente).
- Medium interroga G09 (cadavere ora con carta Addolorata): mostra "Villico" (carta iniziale). **dubbio** (DUBBI 1).
- Figlia che si trasforma: nel Branco compare "Vivi: G01, G02, G04" dalla notte 2. **ok**
- Registro rogo: "G04 (Figlia dei Lupi) si rivela e diventa Lupo Mannaro" compare PRIMA di "G09 e' morto/a al rogo" (vedi BUG 5).

## Scenario 3 - Addolorata x Fantasma Onnisciente x Borgomastro x Pifferaio x Chupacabra x Medium x Cartomante x Veggente (11 giocatori)
- Notte 1: Pifferaio ipnotizza G01 (lupo) e G09, Chupacabra caccia un non lupo (fallisce, ok). Alba: avviso "Il villaggio deve eleggere un Borgomastro"; elezione di G01 (il lupo che sara' bruciato). Rogo di G01: "G01 era il Borgomastro: il villaggio dovra' eleggerne uno nuovo", avviso Fantasma ("al primo morto", candidati = tutti i morti, anche quello notturno G10: la regola dice "primo morto sul rogo", vedi DUBBI 4); Fantasma assegnato a G01.
- Notte 2: l'Addolorata G03 scambia con G01 (Fantasma + Borgomastro + ipnotizzato + lupo): G03 diventa Lupo Mannaro, compare nel Branco ("Vivi: G02, G03"); G01 morto con carta Addolorata; i flag `eBorgomastro`, `eFantasmaOnnisciente` e la condizione `ipnotizzato` restano sulla persona (cadavere). Il Veggente su G03: "Aura malvagia"; il Cartomante su G03: "Mostra a Cartomante la carta: Addolorata" (**BUG 2**); il Medium su G01: "Lupo Mannaro".
- Il Chupacabra puo' puntare G03 come lupo e la uccide ("mortoDa: chupacabra"). Alba 2: "Il villaggio deve eleggere un Borgomastro" correttamente ripresentato. **ok**
- Fantasma: dopo lo scambio il cadavere G01 con Fantasma ha ruolo Addolorata (villaggio), mentre in vita era lupo: "Vince secondo il ruolo che aveva in vita" non e' definito (DUBBI 2).

## Scenario 4 - Addolorata x Alchimista x Boia x Sacerdote x Apprendista x Cavaliere x Borgomastro (11 giocatori)
Giorno 1: Boia (G08, ruolo ignoto, rivelato dall'evento) giustizia G10, suo innamorato: "Morira' anche G08 (crepacuore)", "E' morto anche G08" (G08 `boia` morto, `causaMorte: crepacuore`, `mortoGiorno: 2`). Rogo di G07 (Borgomastro, maestro dell'Apprendista, Alchimista): avviso "L'Apprendista G03 erediterà il suo ruolo", esplosione verso G09 (protetto dal Cavaliere): "Il Cavaliere G04 lo protegge: si immola al suo posto", G09 sopravvive, G04 muore (`sacrificioDa: colpo`), G03 eredita Alchimista (`poteriUsati: alchimista-esplosione`). Notte 2: l'Addolorata G06 scambia con G07: G06 diventa Alchimista (con esplosione usata), G07 Addolorata. Alba 2: solo G05 (notturno), nessun morto diurno riannunciato (mortoGiorno/mortoNotte coerenti), avviso Borgomastro. Refresh e Indietro ok.
- Il Cavaliere salva il bersaglio anche dall'esplosione dell'Alchimista, che non e' ne' "sbranato di notte" ne' "rogo": scelta gia' dichiarata nel codice (`risoluzioneNotte.js:35-38`, "salva da QUALSIASI causa di morte"). **dubbio** (DUBBI 6).
- Dopo la notte 2 G03 (Apprendista) e G06 (Addolorata) hanno ENTRAMBI la carta Alchimista, nessun avviso (DUBBI 5).
- Registro: "G06 e' morto/a di crepacuore" scritto prima del rogo che la causa (BUG 5).

## Scenario 5 - Addolorata x Pifferaio x Chupacabra x Medium (8 giocatori)
- Pifferaio ipnotizza l'Addolorata G03 e G07. Rogo del Pifferaio G04: l'Addolorata scambia e diventa Pifferaio mantenendo la condizione `ipnotizzato`. Passo "Pifferaio" mostra G03 come attore con candidati G02, G05, G06 (esclude se' stessa e gli ipnotizzati); il passo finale "Ipnotizzati" elenca "Vivi: G03, G07" (ipnotizzata dal suo stesso ruolo: innocuo, nessun errore). Il Medium su G04: "Pifferaio" (carta iniziale). Il Chupacabra caccia G03 (ora Pifferaio): fallisce correttamente se non e' un lupo. **ok**
- **BUG 1** (Pifferaio non puo' ipnotizzare piu' nessuno quando i morti ipnotizzati sono pari al massimo della scelta), emerso qui e riprodotto in partite minime (scenario 9).

## Scenario 6 - Legami che seguono la persona (Addolorata come maestro, genitore, protetta e innamorata; 10 giocatori)
- G07 (Addolorata) e' maestro dell'Apprendista, genitore della Figlia, protetta del Cavaliere e innamorata di G09. Scambia con un Villico (G08 bruciato). Poi G09 al rogo: crepacuore su G07 (ora Villico): "Morira' anche G07", "L'Apprendista G03 erediterà il suo ruolo" e la Figlia diventa lupo. L'Apprendista eredita **Villico** (la carta che G07 ha ora), non l'Addolorata. Il legame segue la persona, la carta Addolorata e' sul cadavere di G08. **ok / dubbio** (DUBBI 3).

## Scenario 7 - Figlia bruciata, Boia/Sacerdote, Cartomante (10 giocatori)
- Figlia G03 innamorata di G08, genitore G09. Rogo di G03 (G08 muore di crepacuore). L'Addolorata G05 scambia: diventa Figlia con il legame verso G09 (eredita la scelta); notte 2 il branco sbrana G09: all'alba "G05 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro" (`figliaLupoNotte`), storia [addolorata, figlia, lupo]. Banner vittoria lupi corretto (3 contro 3). Cartomante su G05: "Addolorata" (**BUG 2**). **ok**

## Scenario 8 - Morti a catena con Borgomastro (Boia + Alchimista innamorati, 10 giocatori)
- Sacerdote lega Boia G06 e Alchimista G07; G06 eletto Borgomastro. Giorno 1: il Boia G06 giustizia G09 (alba), poi rogo di G07: avviso "Morira' anche G06 (crepacuore)", evento Alchimista che trascina G10: in un solo giorno muoiono G09 (Boia), G07 (rogo), G06 (crepacuore, Borgomastro), G10 (esplosione). Le conferme sono chiare e i campi (`mortoGiorno`, `mortoDa`, `giustiziatoDa`) coerenti. Alba 2: avviso Borgomastro. Notte 2: l'Addolorata G04 scambia con G07 e prende Alchimista con esplosione gia' usata (`alchimista-esplosione` ereditato). Il Medium su G10 (ruolo ignoto) chiede la carta e offre solo "Villico" (Boia e Alchimista sono gia' noti): corretto. **ok**
- Banner dopo la morte di G03: vittoria lupi insieme all'avviso "Il villaggio deve eleggere un Borgomastro" nella stessa schermata (partita gia' decisa): cosmetico.

## Scenario 9 - Pifferaio con ipnotizzati morti (riproduzioni minime)
- Mazzo Pifferaio, Lupo, 5 Villici. Notte 1: ipnotizzati G03 e G04, il branco sbrana G03; rogo G04. Notte 2 (4 candidati): il passo Pifferaio mostra "Puoi scegliere al massimo 2 giocatori: deseleziona qualcuno per cambiare la scelta" e le chip non registrano nessun click: nessun nuovo ipnotizzato. **BUG 1**.
- Mazzo Pifferaio, Lupo, 3 Villici: ipnotizzati G03 e G04, G03 al rogo; notte 2 rimane un solo candidato (G01, massimo 1): stesso comportamento ("massimo 1", G01 non ipnotizzato). **BUG 1**.

## Scenario 10 - Addolorata x Medium x Cartomante x Apprendista: quale carta si mostra
- Apprendista che eredita il Veggente (maestro sbranato): la Cartomante su di lui mostra "Apprendista" mentre agisce da Veggente (`AzioneRivelaRuolo.jsx:17,93`). **BUG 2**.
- Variante Medium attiva (aura): burned lupo G01 scambiato dall'Addolorata, il Medium vede "Aura benevola" (`auraDi(ruoloSlug)` corrente = Addolorata) mentre senza variante lo stesso cadavere mostra "Lupo Mannaro". Incoerenza fra le due modalita' (DUBBI 1). Il gruppo chip ha `aria-label="Chi indagare"` mentre il testo dice "Chi interrogare (defunto)".

## Scenario 11 - Addolorata x Chupacabra, Guaritore, Apprendista-erede
- Chupacabra bruciato: l'Addolorata diventa Chupacabra e il passo mostra lei come attore (G02) con candidati G01, G04, G05; alba senza banner del villaggio finche' vive. **ok**
- Guaritore che resuscita il cadavere dello scambio: G05 torna vivo con carta Addolorata e `poteriUsati` vuoto, mentre l'ex Addolorata G04 (ora Villico) ha il marcatore `addolorata-scambio`. Dopo un nuovo rogo (G07) la notte 3 al resuscitato viene offerto di nuovo "Scambiare il ruolo con quello di G07": il potere "una sola volta per partita" della carta viene speso due volte (DUBBI 7).
- Apprendista che ha ereditato l'Addolorata dal maestro bruciato (G04): nella notte 2 il passo Addolorata propone a G03 di "Scambiare il ruolo con quello di G04" (la carta che ha appena preso). Premendo Scambia non cambia nulla ma consuma `addolorata-scambio` e non scrive nessuna voce di registro. **BUG 4**.

## Stabilita'
Refresh a meta' del passo Addolorata dopo lo scambio: il passo diventa vuoto (nessun "Annulla scambio", nessun testo) e mostra "Vivi: G02" con G02 gia' Villico; Indietro disfa lo scambio e ripristina il passo (**BUG 3**). Console pulita, nessun overflow.

## BUG CERTI
1. **Pifferaio bloccato dagli ipnotizzati morti (grave).** Passi: Pifferaio, Lupo, 5 Villici; notte 1 ipnotizza G03 e G04, il branco sbrana G03, rogo di G04; notte 2 passo Pifferaio, clic su un qualunque candidato: appare "Puoi scegliere al massimo 2 giocatori: deseleziona qualcuno" e non viene ipnotizzato nessuno. Stessa cosa con 1 solo candidato rimasto (massimo 1) e 1 ipnotizzato morto. Causa: `src/features/notte/azioni/AzioneCondizioneDoppia.jsx:51`, `nuovi` filtra su `giocatori` (anche morti) invece che su `viviTutti`: i morti ipnotizzati in numero pari a `massimo` diventano la "coppia gia' scelta in questa sessione" e riempiono `selezionati` (chip invisibili). Residuo della correzione del batch 4 (candidati < 2). Conseguenza: il Pifferaio non puo' piu' vincere ne' continuare a ipnotizzare dopo la morte di 1-2 ipnotizzati.
2. **Cartomante (e Medium) mostrano la carta iniziale anche quando la carta e' cambiata fisicamente.** Dopo scambio Addolorata (ex Addolorata ora Lupo/Figlia/Villico/Pifferaio/Cavaliere), eredita dell'Apprendista (Veggente) il Cartomante legge "Addolorata" / "Apprendista" mentre il giocatore gioca (e per il Veggente risulta) col ruolo nuovo: es. G03 lupo dopo lo scambio, Veggente "Aura malvagia", Cartomante "Addolorata". Causa: `src/features/notte/azioni/AzioneRivelaRuolo.jsx:17` `cartaIniziale = storiaRuoli[0]`, introdotta in 59de201 per Cucciolo e Mimo, ma storiaRuoli[0] e' sbagliata per ogni cambio di carta reale (Addolorata, Apprendista; da verificare Ladro). Proposta: usare la carta "in mano" (`ruoloSlug`) tranne per i ruoli che non cambiano carta (Cucciolo cresciuto, Mimo, Figlia diventata lupo, Mezzosangue, trasformato da Progenitore), ad es. con un campo `cartaFisica` scritto solo da questi casi.
3. **Passo Addolorata vuoto dopo refresh con scambio gia' fatto.** Passi: notte con vittima del rogo, Scambia, ricarica la pagina: il passo mostra solo "Vivi: G02 | Morti: G04" senza "Annulla scambio" ne' messaggio, quindi lo scambio non si puo' piu' annullare da li' (solo con Indietro). Causa: `AzioneAddolorata.jsx:24`, `attoriIds` si calcola su `ruoloSlug === 'addolorata'` all'ingresso, ma dopo il refresh l'attore ha gia' il nuovo ruolo (`attori` vuoto). Basso.
4. **Scambio con una vittima che ha lo stesso ruolo (no-op che brucia il potere).** Apprendista erede dell'Addolorata bruciata: il passo propone "Scambiare il ruolo con quello di G04" (ruolo identico gia' ereditato). Scambia segna `addolorata-scambio`, non cambia nulla, nessuna voce di registro. Causa: `AzioneAddolorata.jsx:19-24,75` nessun controllo `vittima.ruoloSlug === attore.ruoloSlug`. Proposta: nascondere/segnalare ("la carta e' gia' tua").
5. **Registro: effetto prima della causa.** Le morti/trasformazioni a catena sono scritte in ordine di posizione del giocatore, non causale: "G06 e' morto/a di crepacuore" e "G06 era il Borgomastro" prima di "G07 e' morto/a al rogo"; "G04 (Figlia dei Lupi) si rivela e diventa Lupo Mannaro" prima di "G09 e' morto/a al rogo"; "G08 e' morto/a di crepacuore" prima di "Il Boia G08 giustizia G10". Causa probabile: il ciclo per giocatore in `src/data/log.js` (intorno alle righe 100-135) emette gli eventi di ogni giocatore nell'ordine della lista. Cosmetico.
6. **Registro: legame ereditato scritto come scelta.** "Il Cavaliere G04 sceglie di proteggere G07" in notte 2 dopo lo scambio (era il legame del Cavaliere bruciato), prima di "G04 ha assunto il ruolo di Cavaliere" (`log.js:40`). Cosmetico.

## DUBBI (con proposta)
1. **Che carta vede il Medium su un cadavere scambiato?** Il testo dice "scoprire quale fosse il suo vecchio ruolo guardandone la carta". Dopo lo scambio il cadavere tiene fisicamente la carta Addolorata. Oggi: Medium normale mostra la carta iniziale (G09 "Villico", G04 "Pifferaio"), Medium con variante aura usa il ruolo corrente (lupo bruciato scambiato: "Aura benevola"). Le due modalita' sono incoerenti. Proposta: decidere una sola lettura (ruolo in vita, che e' lo spirito del "vecchio ruolo") e applicarla a entrambe, tenendo il ruolo in vita in un campo dedicato.
2. **Fantasma Onnisciente dopo lo scambio.** "Vince secondo il ruolo che aveva in vita" (roles.js, Fantasma): se la vittima del rogo e' il Fantasma (primo morto sul rogo) e l'Addolorata scambia, il Fantasma ha in mano la carta Addolorata (villaggio) ma in vita era, per esempio, lupo. Proposta: usare il ruolo al momento della morte (storiaRuoli prima dello scambio); nessuna logica di vittoria per il Fantasma esiste oggi.
3. **Legami: persona o carta?** Maestro/protetto/genitore/innamorato restano sulla persona che scambia (G07 gia' Villico, il Cavaliere la protegge ancora, l'Apprendista eredita "Villico" alla sua morte, la Figlia diventa lupo). Alla lettera "il maestro muore" riguarda la persona, ma la carta Addolorata e' gia' sul cadavere. Proposta: lasciare e scriverlo nella nota di regolamento.
4. **Fantasma: "primo morto sul rogo".** Il menu propone tutti i morti (anche i notturni, qui G10) mentre il testo (roles.js) dice "primo morto sul rogo". Proposta: limitare i candidati ai morti al rogo (o avvisare).
5. **Carta unica con due titolari.** Alchimista, Apprendista (eredita al rogo) e Addolorata (scambia la notte dopo) possono avere la stessa carta (G03 e G06 entrambi Alchimista; Apprendista Addolorata che scambia con la vittima che ha lo stesso ruolo). Proposta: avviso nel passo Addolorata "Il ruolo di G07 e' gia' stato ereditato dall'Apprendista G03" e scambio impedito.
6. **Cavaliere e esplosione dell'Alchimista.** Il Cavaliere si immola anche contro l'esplosione (non e' rogo ne' sbranamento nel testo). Intenzionale per codice; da confermare con il proprietario.
7. **Resurrezione del cadavere dello scambio.** Il resuscitato torna Addolorata con il potere non usato (il marcatore `addolorata-scambio` e' sull'ex titolare): puo' scambiare una seconda volta. Proposta: segnare l'uso anche sulla carta/sul cadavere, o dichiarare in regole che lo scambio e' per carta.
8. **Eredita' di `poteriUsati` non pertinenti.** L'Apprendista che eredita Villico dall'Addolorata riceve `addolorata-scambio` (marcatore innocuo ma sporco nello stato).

## NON COPERTO
- Addolorata con Sacerdote bruciato e Sacerdote erede (solo analisi del codice: il passo Sacerdote e' solo prima notte).
- Addolorata x Boia con il Boia bruciato e mai rivelato (vittima di ruolo ignoto: gia' trattata nel batch 10-07, scambio in Villico).
- Annulla morte (menu Eventi speciali) sulla vittima di un rogo gia' scambiata; Medium con Fantasma gia' assegnato; Mimo di Addolorata.
- Vittoria Pifferaio "tutti ipnotizzati" non raggiunta a causa del BUG 1: provata solo con 1 candidato che non si puo' selezionare.
- Cartomante su Ladro che ha cambiato carta (sospetto stesso BUG 2, non provato).

## Coppie valutate (JSON-friendly)
```json
[
  "addolorata x cavaliere: si, nessun bug (legame ereditato/scarico ok); dubbio legame persona-vs-carta e Cavaliere vs esplosione",
  "addolorata x apprendista: si, dubbio carta duplicata e scambio inutile con carta gia' ereditata (BUG 4); legame segue la persona",
  "addolorata x figlia-dei-lupi: si, ok (legame ereditato, diventa lupo orfana); registro ordine (BUG 5)",
  "addolorata x sacerdote: si, ok (innamorato resta alla persona, crepacuore corretto)",
  "addolorata x alchimista: si, ok; carta duplicata con Apprendista erede (dubbio), esplosione ereditata come usata",
  "addolorata x boia: si, ok (catena crepacuore, mortoGiorno coerente); vittima ignota gia' coperta",
  "addolorata x chupacabra: si, ok (nuovo Chupacabra attore, blocca la vittoria del villaggio)",
  "addolorata x pifferaio: si, ok; BUG 1 (Pifferaio bloccato dai morti ipnotizzati) emerso nella stessa partita",
  "addolorata x fantasma-onnisciente: si, dubbio (vittoria 'ruolo in vita' dopo lo scambio; flag resta sulla persona)",
  "addolorata x medium: si, BUG 2/dubbio (Medium vede carta iniziale, variante aura vede ruolo corrente)",
  "addolorata x cartomante: si, BUG 2 (carta iniziale al posto della carta attuale)",
  "addolorata x borgomastro: si, ok (flag eBorgomastro resta sul cadavere, rielezione richiesta all'alba)",
  "addolorata x guaritore: si, dubbio (potere ricaricato al resuscitato)",
  "apprendista x cartomante: si, BUG 2 (mostra Apprendista per l'erede del Veggente)",
  "boia x borgomastro: si, ok (morti a catena, conferme chiare, registro ordine BUG 5)",
  "alchimista x borgomastro: si, ok",
  "cavaliere x alchimista: parziale, dubbio (Cavaliere salva dall'esplosione)",
  "pifferaio x pifferaio (morti ipnotizzati): si, BUG 1"
]
```

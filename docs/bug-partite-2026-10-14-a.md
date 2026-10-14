# Batch di partite del 2026-10-14 (a): coppie ancora senza evidenza "si" nella matrice

Chromium reale (Playwright, 390x844, dev server porta 5591, codice a 41e11ea), nessuna modifica al codice. Mazzo, giocatori, assegnazione ruoli, notti, alba, voto, rogo ed eventi speciali giocati dalla UI (nessuna scorciatoia su localStorage). 17 partite da 5 a 13 giocatori (alcune mini per isolare una coppia), con refresh a meta' passo, Indietro dell'app e Indietro del telefono (page.goBack) in notte. Console: nessun errore ne' warning in tutte le partite; nessun overflow orizzontale; nessun softlock. Elenco di partenza: 90 coppie; provate con interazione reale 53, "parziale" 37 (ruoli presenti insieme, nessuna interazione provata o possibile), nessuna senza almeno una partita insieme.

Nessun BUG CERTO emerso in questo batch: i punti sotto sono tutti dubbi di regolamento o di UX da decidere. Le decisioni gia' prese dal proprietario (Borgomastro non e' una carta, banner dei lupi ritardato, Mimo, Diario, "i lupi" = 5 ruoli, ecc.) non sono riproposte.

## Scenari

### 1 - Alchimista x Bardo x Inquisitore x Boia x Maga (10 giocatori, 2 lupi, 3 Villici)
- Borgomastro eletto all'alba 1; Boia (rivelato dall'evento) giustizia un Villico; rogo di un lupo; "Il Bardo salta la notte": notte 2 mostra solo "Questa notte non si svolge per i poteri del Bardo", nessun passo Maga/Inquisitore/Branco; alba "Nessuno e' morto".
- Notte 3: la Maga trasforma l'Alchimista, l'Inquisitore lo indaga ("no (aura benevola)"): all'alba "G01 e' stato trasformato in maiale", rogo dell'Alchimista trasformato, esplosione sulla Maga, la condizione "trasformato" cade con la morte. Notte 4: passo Inquisitore "Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola" (promemoria dei morti attivo per la Maga). Vittoria lupi (1 contro 1) dopo refresh stabile. **ok**
- Diario corretto e ordinato; non registra ne' l'indagine ne' la perdita del potere dell'Inquisitore (DUBBI 8).

### 2 - Capobranco x Nano x Scemo x Ubriaco x Paladino x Guaritore x Boia (10 giocatori)
- N1 il branco morde il Nano: "Il morso non ha effetto su G03: il Nano non puo' essere sbranato". Giorno: rima sbagliata dello Scemo (morte), Boia giustizia il Capobranco, rogo del Nano (muore solo al rogo).
- N2: Paladino protegge il lupo G02 (il branco puo' sceglierlo come vittima anche senza Capobranco: DUBBI 4), "Il morso non ha effetto su G02: e' protetto/a"; Guaritore resuscita il Capobranco, all'alba "G01 e' stato resuscitato" ma nel passo Branco di quella notte compare tra i "Morti" (DUBBI 5). N3: il Capobranco morde l'Ubriaco: "il branco sara' stordito la prossima notte", N4: "Il branco e' ancora stordito dall'alcol dell'Ubriaco" anche dopo refresh. Rogo del Boia e vittoria lupi: banner corretto all'alba 5. **ok**

### 3 - Eremita x Veggente Mannaro x Fattucchiera x Scemo x Polpo x Suocera x Nano x Spilungone x Mezzosangue (12 giocatori)
- N1 il branco sbrana la Suocera (ignota), "La Suocera si rivela" al mattino. Rogo dello Spilungone: "troppo alto per qualsiasi patibolo. La notte cala senza vittime".
- N2: la Fattucchiera inibisce l'Eremita, il Veggente Mannaro lo indaga: "Aura malvagia" (l'inibizione non cambia l'aura). Il Mezzosangue sbranato diventa lupo. N3: Fattucchiera inibisce il Veggente Mannaro ("Il potere e' inibito questa notte"); morso sul Nano senza effetto. **ok**

### 4 - Ladro (3 partite): x Ubriaco, x Eremita, x Scemo, x Fattucchiera
- Ladro prende l'Ubriaco (discard Ubriaco + Scemo): il passo Ubriaco ha gia' G01 preselezionato, il branco morde il Ladro-Ubriaco: stordimento la notte dopo. Lo Scemo scartato non e' proponibile come carta della rima (eventi). **ok**
- Ladro prende l'Eremita: la Fattucchiera lo inibisce, il Veggente lo vede "Aura malvagia". **ok**
- Ladro prende lo Scemo: la rima sbagliata ha come unico candidato il Ladro (carta presa). **ok**

### 5 - Pifferaio x Boia x Innocente x Berserker x Mezzosangue x Gallo x Progenitore x Paladino x Sacerdote (12 giocatori)
- N1 il Progenitore trasforma una vittima (Villico) in lupo; il Gallo "salta il giorno" dall'alba: va diretto alla notte 2. N2: il Pifferaio ipnotizza Berserker e Mezzosangue, il branco morde il Mezzosangue (ipnotizzato): diventa lupo e resta ipnotizzato. Boia giustizia il Progenitore (potere gia' usato). L'Innocente si rivela mentre e' il bersaglio del voto: "Torna al voto", il rogo resta sul designato fino al nuovo voto ("Ricomincia votazione" chiede conferma). Rogo di un innamorato (Sacerdote): il Paladino partner muore di crepacuore. N3: Berserker ipnotizzato sbranato: "uccide lottando G05" (il lupo piu' vicino, anche ipnotizzato). **ok**

### 6 - Pifferaio x Boia x Innocente x Guaritore x Cucciolo x Criceto x Polpo (10 giocatori)
- N1: morso sul Criceto senza effetto, poi sull'Innocente (ignoto, muore). All'alba l'Innocente morto non e' tra i candidati alla rivelazione; il Guaritore lo resuscita (N2) e torna candidato. N2: Pifferaio ipnotizza G09 e G07. Giorno 2: Boia giustizia il Pifferaio; notte 3: il passo Ipnotizzati compare ancora per l'ipnotizzato vivo (DUBBI 2). **ok / dubbio**

### 7 - Guardie x Guardia Mannara x Mucca x Sciacallo x Cucciolo x Bardo x Berserker x Ambasciatore x Addolorata x Veggente (13 giocatori)
- N1 morso al Berserker: avviso corretto "G07 (il lupo piu' vicino) morira' con lui", il Cucciolo diventa adulto. Rogo di un Villico e Bardo: notte 2 saltata. Rogo di una Guardia: l'Addolorata scambia e diventa Guardia ("Aura benevola" al Veggente), nessun passo di riconoscimento del collega (DUBBI 7). Sciacallo resuscita il Berserker; il branco morde l'Ambasciatore nella stessa notte in cui il Veggente indaga: nessun messaggio dell'Ambasciatore all'alba (e' morto). N4: Berserker risbranato: muore il lupo piu' vicino, ignorando Guardia Mannara/Mucca/Sciacallo. Vince il villaggio con Guardia Mannara, Mucca e Sciacallo ancora vivi (coerente con "i lupi sono 5 ruoli"). **ok**

### 8 - Pastore x Mucca x Nonna x Figlia x Guaritore x Medium x Apprendista x Nano x Mezzosangue (12 giocatori)
- N1: Mezzosangue (vicino del Pastore) diventa lupo: all'alba 1 "Si sentono dei belati." + "Il Mezzosangue G12 e' stato bersaglio dei lupi...". Figlia Borgomastro con genitore Nonna: rogo della Nonna, "La Figlia dei Lupi G04 e' diventata Lupo Mannaro" (resta Borgomastro). N2: Medium su Nonna "Mostra a Medium la carta: Nonna"; Guaritore resuscita la Nonna (resta viva, la Figlia resta lupa); il branco sbrana il Pastore: "G07 si rivela: e' l'Apprendista di G01 ed eredita il ruolo di Pastore". N3: Medium sulla ex Figlia morta mostra "Lupo Mannaro" (DUBBI 1). **ok / dubbio**

### 9 - Pastore x Cavaliere x Cartomante x Inquisitore x L'Antico x Gallo x Sacerdote x Progenitore x Untore x Suocera (13 giocatori)
- N1 il Progenitore trasforma la Suocera ignota (DUBBI 6). Rogo della Cartomante: "Il Cavaliere G03 si sacrifica al posto di G04". N2: Untore unge l'Antico; la Cartomante lo vede ("quale ruolo mostra?": L'Antico, Suocera, Villico), l'Inquisitore lo indaga (benevola), il branco sbrana l'Inquisitore: crepacuore del partner. Rogo dell'Antico riconosciuto: "sopravvive (prima vita) ma il villaggio e' maledetto"; notte 3 solo Branco, belati comunque all'alba (Pastore passivo). N4: Borgomastro-Untore sbranato nella stessa notte in cui ha unto: l'unzione si annuncia lo stesso. **ok**

### 10 - Fantasma x Sacerdote x Inquisitore x Ambasciatore x Veggente x Boia x Guardie x Berserker x Mucca (12 giocatori)
- Sacerdote unisce un lupo e un Villico; il branco morde il Berserker: muoiono anche il lupo (innamorato) e, per crepacuore, il Villico. Elezione Borgomastro della Mucca, rogo di una Guardia: avviso "Assegna la carta del Fantasma al primo morto"; Fantasma al lupo morto (candidati: tutti i morti, DUBBI gia' noto). N2: Veggente su Guardia benevola: "E' arrivato un messaggio dall'ambasciatore"; Mucca-Borgomastro sbranata (rielezione); Boia giustizia l'Ambasciatore: la notte dopo nessun messaggio. **ok**

### 11 - Alchimista x Criceto x Berserker x Boia x Mezzosangue x Paladino x Innocente (11 giocatori)
- Boia giustizia il Mezzosangue (muore Mezzosangue). Rogo dell'Alchimista: esplosione sul Criceto, che muore (immune solo di notte). Berserker-Borgomastro protetto dal Paladino (morso senza effetto), poi sbranato: muore con il lupo piu' vicino, avviso di rielezione. **ok**

### 12 - Addolorata x Fattucchiera x Guaritore x Eremita x Veggente x Cortigiana x Progenitore x Figlia (12 giocatori)
- Figlia con genitore Villico: rogo del genitore e' una lupa. N2: Fattucchiera inibisce l'Addolorata: passo "Il potere e' inibito" (nessuno scambio possibile con la vittima del rogo). La Cortigiana visita il Borgomastro, il Progenitore lo trasforma in lupo: la Cortigiana muore ("cliente-lupo", DUBBI 3); il Borgomastro trasformato resta Borgomastro. Eremita bruciato, resuscitato dal Guaritore: il Veggente lo vede ancora "Aura malvagia". **ok / dubbio**

### 13 - Pastore x Suocera x Bardo x Untore x Inquisitore x Alchimista x Boia (12 giocatori)
- La Suocera sbranata e rivelata non conta come vicina del Pastore (belati dal lupo oltre). L'Inquisitore indaga un Villico ignoto: "no (aura benevola)". L'Untore unge il Borgomastro: "Morte per unzione" passa ai due vicini vivi saltando i morti (G09, G01). Il Boia giustizia il Bardo: dopo un rogo l'evento "Il Bardo salta la notte" non e' piu' offerto. **ok**

### 14 - Apprendista x Nano / Medium / Cucciolo x Guardia (2 partite)
- Apprendista erede del Nano (rogo del maestro): morso senza effetto. Fattucchiera inibisce il Medium. Rogo del Cucciolo: vendetta, due morsi (Guardia e Medium) con testo "vittima 2 di 2". **ok**
- Apprendista erede del Medium (maestro sbranato): interroga la Suocera rivelata e il Medium morto ("Mostra a Medium la carta: Suocera"). Dopo refresh e Indietro del telefono il passo conserva la selezione. **ok**

### 15 - Alchimista x Bardo x Berserker (mini)
- Rogo dell'Alchimista con esplosione sul Berserker (nessun effetto speciale), poi il Bardo salta la notte; "Indietro" nella notte saltata annulla il gesto e riporta alla notte normale (verificato con refresh). **ok**

### 16 - Gallo x L'Antico (mini)
- Rogo dell'Antico, notte maledetta (solo Branco), alba: il Gallo "salta il giorno" e la notte 3 e' normale; nessun conflitto tra i due poteri. **ok**

## BUG CERTI
Nessuno.

## DUBBI (con proposta)
1. **Carta mostrata da Cartomante/Medium per Figlia dei Lupi diventata lupa, Mezzosangue diventato lupo, giocatore trasformato dal Progenitore.** Oggi `cartaInMano` (`src/data/assegnazione.js:120`) restituisce il ruolo corrente ("Lupo Mannaro"), con eccezioni solo per Cucciolo cresciuto e Mimo; ma l'eccezione del Cucciolo ha la stessa ragione (la carta fisica non cambia) che vale anche per Figlia, Mezzosangue e trasformati (il narratore non consegna nessuna carta nuova: roles.js "diventa Lupo Mannaro e si sveglia con il branco"). Visto: Medium su ex Figlia morta mostra "Lupo Mannaro". Proposta: confermare con il proprietario; se la regola e' "carta fisica", estendere le eccezioni (ad es. con un campo `cartaFisica` scritto solo da Figlia/Mezzosangue/Progenitore).
2. **Pifferaio morto: gli ipnotizzati si svegliano ancora?** roles.js: "Gli ipnotizzati si identificano ogni notte". Dopo il Boia sul Pifferaio il passo "Ipnotizzati (dal Pifferaio)" continua a comparire finche' c'e' un ipnotizzato vivo. Proposta: lasciarlo (nessuna regola lo toglie) o toglierlo alla morte del Pifferaio: decidere e scriverlo nelle note.
3. **Cortigiana con cliente trasformato dal Progenitore.** Il cliente non e' sbranato ma diventa lupo: la Cortigiana muore con causa "cliente-lupo" (regola: "uccisa solo se fa visita ad un lupo mannaro o se il cliente viene sbranato"). Prima di premere "trasforma" l'avviso dice "entrambi moriranno", dopo la trasformazione il testo sparisce e non spiega la morte. Proposta: confermare che e' voluto (lupo "a fine notte") e mantenere l'avviso anche dopo il click.
4. **Il branco puo' scegliere come vittima un compagno di branco anche senza Capobranco in vita.** roles.js: solo il Capobranco "puo' scegliere di uccidere anche i suoi fratelli". Visto: con Capobranco morto (giustiziato) il lupo rimasto ha se stesso tra le chip e, protetto dal Paladino, il morso "non ha effetto"; in un'altra partita un lupo solitario puo' bersagliare se stesso. Proposta: escludere dai candidati i membri del branco se nessun Capobranco (o Mimo-Capobranco) e' attivo; oppure lasciare libero (il narratore sa) e dichiararlo.
5. **Resuscitato dal Guaritore la stessa notte non si sveglia col branco.** Il Capobranco resuscitato tra i "Morti" nel passo Branco di quella notte, "resuscitato" all'alba (AlbaPanel). Coerente con la scelta "i morti si scoprono all'alba", ma regola non scritta per Capobranco/Cucciolo/altri lupi. Proposta: lasciare e annotare.
6. **Suocera trasformata dal Progenitore (non riprodotto).** Se il Progenitore trasforma la Suocera ignota, G11 diventa `lupo-mannaro` ma `suoceraNascosta` (`src/data/vittoria.js:39-41`, `quantita.suocera > 0` e nessun giocatore con quel ruolo) toglie comunque un abitante: soglia di vittoria dei lupi sfalsata di 1 (solo con nessun morto ignoto). Non l'ho riprodotto fino al banner (in partita c'erano morti ignoti), e' un ragionamento sul codice. Proposta: se serve, bloccare la trasformazione della Suocera o contarla come lupo anche in `suoceraNascosta`.
7. **L'Addolorata che diventa Guardia (o Guardia Mannara) non conosce il collega.** La prima notte e' passata: nessun passo per farle riconoscere le altre Guardie. Proposta: nota di regolamento ("solo la prima notte") oppure avviso al narratore nel passo Addolorata.
8. **Diario: nessuna voce per l'indagine dell'Inquisitore ne' per la perdita del potere.** Solo il passo notturno lo dice. Coerente con "meno rumore" (nemmeno il Veggente e' registrato), ma la perdita permanente del potere e' un fatto di stato: proposta una voce "L'Inquisitore G03 ha perso il potere" (cosmetico).

## NON COPERTO
- Interazioni passive senza possibile effetto reciproco (Eremita x Suocera/Spilungone/Nano/Mezzosangue/Ubriaco, Innocente x Paladino/Mezzosangue/Criceto/Cucciolo/Polpo/Pifferaio, Nano x Villico/Suocera, Fattucchiera x Villico/Scemo, ecc.): segnate "parziale" (presenti insieme).
- Fantasma Onnisciente x Inquisitore/Villico (assegnato una sola volta per partita), Boia x Inquisitore/Paladino/Gallo (una sola esecuzione per partita).
- Vittoria con Suocera trasformata (DUBBI 6), Mimo di un ruolo di questo batch, Ladro con due carte uguali nel batch successivo, dark mode.

## Coppie valutate (JSON-friendly)
```json
[
  "bardo x inquisitore: si, ok (Bardo salta la notte: nessun passo Inquisitore/Maga, l'indagine non si perde)",
  "fantasma-onnisciente x sacerdote: si, ok (Fantasma a un innamorato morto con il Berserker, crepacuore del partner, nessun conflitto di flag)",
  "borgomastro x mucca-mannara: si, ok (Borgomastro-Mucca sbranata: avviso e rielezione richiesti)",
  "ambasciatore x boia: si, ok (Boia giustizia l'Ambasciatore: nessun messaggio alla notte seguente)",
  "lupo-mannaro-capobranco x nano: si, ok (morso senza effetto sul Nano, avviso chiaro)",
  "lupo-mannaro-capobranco x scemo-del-villaggio: parziale (Scemo muore per la rima, nessuna interazione col Capobranco)",
  "bardo x boia: si, ok (Bardo giustiziato: evento 'Bardo salta la notte' non offerto)",
  "alchimista x maga: si, ok (Alchimista trasformato in maiale al rogo: esplosione su Maga, trasformazione scade)",
  "figlia-dei-lupi x medium: si, dubbio (Medium sulla ex Figlia mostra 'Lupo Mannaro', carta fisica e' Figlia: DUBBI 1)",
  "alchimista x inquisitore: si, ok (Inquisitore indaga l'Alchimista benevolo: perde il potere, passo 'ha perso il proprio potere')",
  "fattucchiera x scemo-del-villaggio: parziale (nessuna interazione provata)",
  "eremita x ladro: si, ok (Ladro che prende l'Eremita: Veggente vede aura malvagia anche con Fattucchiera)",
  "ladro x scemo-del-villaggio: si, ok (Scemo scartato non proponibile; Ladro-Scemo e' l'unico candidato della rima)",
  "fantasma-onnisciente x lupo-mannaro: si, ok/dubbio (Fantasma assegnato a un lupo morto: nessuna logica di vittoria, noto)",
  "boia x pifferaio: si, dubbio (Pifferaio giustiziato: gli ipnotizzati si svegliano ancora: DUBBI 2)",
  "nano x suocera: parziale (nessuna interazione provata)",
  "cartomante x cavaliere: si, ok (Cavaliere si immola per la Cartomante al rogo)",
  "apprendista x medium: si, ok (Apprendista erede del Medium interroga morti, anche la Suocera)",
  "bardo x guardia-mannara: parziale (Bardo salta la notte con Guardia Mannara in gioco, nessuna interazione)",
  "scemo-del-villaggio x veggente-mannaro: parziale (nessuna interazione provata)",
  "alchimista x bardo: si, ok (esplosione poi Bardo salta la notte)",
  "inquisitore x villico: si, ok (Villico ignoto: risposta 'no (aura benevola)')",
  "cucciolo-di-lupo-mannaro x guardia: si, ok (vendetta del Cucciolo: due vittime, una Guardia)",
  "ladro x ubriaco: si, ok (Ladro-Ubriaco sbranato: branco stordito la notte dopo, anche con refresh)",
  "addolorata x fattucchiera: si, ok (Addolorata inibita: nessuno scambio possibile, messaggio dedicato)",
  "eremita x suocera: parziale (nessuna interazione provata)",
  "figlia-dei-lupi x nonna: si, ok (genitore Nonna al rogo: Figlia lupa; Nonna resuscitata resta viva, Figlia resta lupa)",
  "eremita x spilungone: parziale (nessuna interazione provata)",
  "lupo-mannaro-progenitore x suocera: si, dubbio (Suocera trasformata: conteggio vittoria con Suocera nascosta, DUBBI 6)",
  "apprendista x pastore: si, ok (maestro Pastore sbranato: l'Apprendista eredita e annuncio all'alba)",
  "berserker x borgomastro: si, ok (Borgomastro-Berserker protetto poi sbranato: muore con il lupo piu' vicino, rielezione)",
  "innocente x paladino: parziale (nessuna interazione provata)",
  "lupo-mannaro-capobranco x ubriaco: si, ok (Ubriaco sbranato dal branco con Capobranco: stordimento la notte dopo)",
  "guardia-mannara x mucca-mannara: parziale (presenti, passo Mucca elenca solo i lupi del branco)",
  "gallo-mannaro x lantico: si, ok (notte maledetta: il Gallo agisce normalmente, poi salta il giorno senza conflitti)",
  "boia x inquisitore: parziale (entrambi in gioco, nessuna interazione provata)",
  "guardia-mannara x sciacallo-mannaro: parziale (Sciacallo resuscita un Berserker, Guardia Mannara presente)",
  "mezzosangue x pastore: si, ok (Mezzosangue sbranato diventa lupo: belati gia' all'alba)",
  "eremita x guaritore: si, ok (Eremita resuscitato: Veggente continua a vedere aura malvagia)",
  "alchimista x berserker: si, ok (esplosione su Berserker: nessun effetto speciale)",
  "guaritore x innocente: si, ok (Innocente morto di notte e resuscitato: torna candidato alla rivelazione)",
  "guardia x villico: parziale (Villico bruciato con Guardie in gioco)",
  "innocente x mezzosangue: parziale (nessuna interazione provata)",
  "berserker x guardia: parziale (Berserker sbranato con Guardie in gioco: ignorate come 'lupo')",
  "ambasciatore x guardia: si, ok (Veggente su Guardia: messaggio dell'Ambasciatore; Ambasciatore morto: nessun messaggio)",
  "criceto-malvagio x innocente: parziale (nessuna interazione provata)",
  "apprendista x nano: si, ok (Apprendista erede del Nano: morso senza effetto)",
  "innocente x polpo-mannaro: parziale (nessuna interazione provata)",
  "addolorata x guardia: si, ok/dubbio (Addolorata diventa Guardia: nessun passo di riconoscimento col collega)",
  "lupo-mannaro-capobranco x paladino: si, ok/dubbio (Paladino protegge un lupo; i compagni di branco restano bersagli anche senza Capobranco: DUBBI 4)",
  "eremita x nano: parziale (nessuna interazione provata)",
  "mezzosangue x suocera: parziale (Mezzosangue sbranato con Suocera morta: nessun effetto)",
  "boia x lupo-mannaro-capobranco: si, ok (Boia giustizia il Capobranco; Guaritore lo resuscita)",
  "guaritore x lupo-mannaro-capobranco: si, ok/dubbio (resuscitato all'alba, non si sveglia col branco la stessa notte)",
  "borgomastro x lupo-mannaro-progenitore: si, ok (Borgomastro trasformato in lupo resta Borgomastro)",
  "eremita x ubriaco: parziale (nessuna interazione provata)",
  "cucciolo-di-lupo-mannaro x innocente: parziale (nessuna interazione provata)",
  "criceto-malvagio x villico: parziale (morso al Criceto senza effetto, nessuna interazione col Villico)",
  "mezzosangue x nano: parziale (nessuna interazione provata)",
  "nano x villico: parziale (nessuna interazione provata)",
  "lantico x pastore: si, ok (belati anche nella notte maledetta e dopo: potere passivo)",
  "berserker x pifferaio: si, ok (Berserker ipnotizzato sbranato: muore anche il lupo ipnotizzato piu' vicino)",
  "borgomastro x untore: si, ok (Borgomastro unto e morto per unzione: vicini vivi unti saltando i morti)",
  "boia x mezzosangue: si, ok (Mezzosangue giustiziato muore da Mezzosangue)",
  "alchimista x criceto-malvagio: si, ok (esplosione uccide il Criceto: immune solo di notte)",
  "figlia-dei-lupi x guaritore: si, ok (resurrezione del genitore non annulla la trasformazione)",
  "figlia-dei-lupi x pastore: parziale (nessuna interazione provata)",
  "fattucchiera x ladro: si, ok (Ladro-Eremita inibito: il Veggente lo vede malvagio ugualmente)",
  "fantasma-onnisciente x villico: parziale (nessuna interazione provata)",
  "boia x paladino: parziale (Paladino in gioco, nessuna interazione provata)",
  "bardo x suocera: parziale (Suocera rivelata, poi Bardo salta la notte: nessuna interazione)",
  "figlia-dei-lupi x mucca-mannara: parziale (Mucca non riconosce la Figlia diventata lupa: nessun passo)",
  "figlia-dei-lupi x villico: si, ok (genitore Villico al rogo: la Figlia diventa lupa)",
  "inquisitore x lantico: si, ok (Antico riconosciuto dalla Cartomante: aura benevola, rogo 'sopravvive prima vita')",
  "paladino x sacerdote: si, ok (Paladino innamorato: crepacuore al rogo del partner)",
  "boia x lupo-mannaro-progenitore: si, ok (Boia giustizia il Progenitore a potere gia' usato)",
  "fattucchiera x villico: parziale (nessuna interazione provata)",
  "mezzosangue x mucca-mannara: parziale (Mucca non riconosce il Mezzosangue diventato lupo)",
  "borgomastro x figlia-dei-lupi: si, ok (Figlia Borgomastro diventa lupa e resta Borgomastro)",
  "innocente x pifferaio: parziale (Innocente rivelato con ipnotizzati in gioco)",
  "cortigiana x villico: si, dubbio (cliente trasformato dal Progenitore: la Cortigiana muore 'cliente-lupo': DUBBI 3)",
  "polpo-mannaro x scemo-del-villaggio: parziale (nessuna interazione provata)",
  "eremita x fattucchiera: si, ok (Eremita inibito: aura sempre malvagia)",
  "boia x gallo-mannaro: parziale (Gallo salta il giorno: Boia non usato quel giorno)",
  "gallo-mannaro x sacerdote: parziale (nessuna interazione provata)",
  "fantasma-onnisciente x inquisitore: parziale (nessuna interazione provata)",
  "pastore x suocera: si, ok (la Suocera morta non e' vicina del Pastore: belati dal lupo oltre)",
  "borgomastro x lupo-mannaro: parziale (nessuna interazione provata)",
  "eremita x veggente-mannaro: si, ok (Eremita sempre 'Aura malvagia' anche inibito)",
  "eremita x mezzosangue: parziale (nessuna interazione provata)"
]
```

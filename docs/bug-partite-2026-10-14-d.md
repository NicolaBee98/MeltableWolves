# Batch partite 2026-10-14 (d): coppie ancora senza "si" (elenco /tmp/coppie-3.txt, ~90 coppie)

Chromium reale (Playwright, 390x844, dev server porta 5594, codice a 41e11ea). Nessuna modifica a `src/` ne' ai documenti esistenti. Script e checkpoint in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad/d` (checkpoint `ck-d*.json`, `ck-e*.json` ecc. nella cartella superiore). I passi oggetto del test sono stati giocati dalla UI (Mazzo -> Giocatori -> notti -> alba -> voto -> rogo -> Eventi speciali). Flag `vivo` modificati solo per le vittorie finali (dichiarato nello scenario D). Decisioni del proprietario dei batch precedenti non riproposte. Console: nessun errore ne' warning in tutte le partite; nessun overflow orizzontale (mazzo, giocatori, notte, alba) nelle schermate controllate; refresh a meta' notte e Indietro/Indietro del telefono ok (vedi O1).

Partite (giocatori nell'ordine dei posti Anna, Bruno, Carla...):
- **A** (12): Lupo, Capobranco, Progenitore, Gallo, Apprendista, Berserker, Veggente, Cortigiana, Innocente, Sciacallo, Villico x2. 4 notti fino a "vincono i Lupi".
- **B** (11): Lupo, Polpo, Veggente Mannaro, Suocera, Figlia dei Lupi, Cavaliere, Sacerdote, Fattucchiera, Maga, Antico, Villico. 4 notti fino a "vincono i Lupi".
- **C** (12): Lupo, Cucciolo, Nonna, Sciacallo, Gallo, Scemo, Pastore, Paladino, Maga, Medium, Strega, Villico. 3 notti.
- **D** (11): Lupo, Polpo, Bardo, Criceto, Sacerdote, Chupacabra, Guaritore, Mezzosangue, Pastore, Addolorata, Villico. 3 notti + vittoria del Criceto (flag `vivo`).
- **E** (13): Lupo, Nonna, Mucca, Sciacallo, Addolorata, Cortigiana, Maga, Cartomante, Sacerdote, Nano, Pastore, Inquisitore, Polpo. 3 notti.
- **F** (11): Lupo, Progenitore, Sciacallo, Apprendista, Spilungone, Figlia, Boia, Eremita, Paladino, Maga, Villico. 2 notti.
- **G** (12): Lupo, Progenitore, Apprendista, Fantasma, Nano, Strega, Cavaliere, Chupacabra, Paladino, Eremita, Boia, Maga, Villico. 3 notti (+ replay con flag `vivo` per BUG 1).
- **H** (14): Lupo, Progenitore, Polpo, Sciacallo, Pifferaio, Guardie + Guardia Mannara, Pastore, Antico, Eremita, Cortigiana, Ubriaco, Villico. 2 notti.
- **I** (15): Lupo, Cucciolo, Mucca, Polpo, Ubriaco, Fattucchiera, Alchimista, Mezzosangue, Medium, Ambasciatore, Veggente, Innocente, Sacerdote, Inquisitore, Chupacabra. 3 notti.
- **J** (12): Lupo, Cucciolo, Polpo, Sciacallo, Scemo, Gallo, Paladino, Maga, Strega, Innocente, Mucca, Villico. 3 notti.
- **K** (7, mazzo da 9 carte): Ladro, Lupo, Sciacallo, Maga, Villico x5; due run (Ladro prende Maga / Ladro prende Sciacallo).
- **L** (13): Lupo, Polpo, Criceto, Figlia, Antico, Eremita, Veggente, Berserker, Mezzosangue, Cortigiana, Sacerdote, Suocera, Fattucchiera. 2 notti.
- **M** (15): Lupo, Cucciolo, Sciacallo, Scemo, Strega, Gallo, Berserker, Veggente, Innocente, Mucca, Mezzosangue, Antico, Eremita, Polpo, Villico. 2 notti + refresh/Indietro.

## Scenari

### S1 - Capobranco con Apprendista, Berserker, Cortigiana, Sciacallo, Gallo, Innocente (A)
- N1: Apprendista segue il Capobranco, il branco morde il Berserker (seduto accanto al Capobranco): avviso "Se il Berserker sara' sbranato, Giulia (il lupo piu' vicino) morira' con lui", all'alba "Fabio | Giulia" e "Elena si rivela: e' l'Apprendista di Giulia ed eredita il ruolo di Lupo Mannaro Capobranco". **ok**
- Gallo: "Il Gallo Mannaro salta il giorno" (Conferma) porta dritto alla notte 2 con il Capobranco ereditato in gioco; nessuna interferenza. **ok**
- N2: Sciacallo resuscita il vecchio Capobranco (Giulia): alba "Giulia e' stato resuscitato", ora due Capobranco vivi (l'erede e il resuscitato), nessuna incoerenza; la Cortigiana che visita il Capobranco (erede) muore ("Hugo" all'alba). Il passo Branco con i due Capobranco permette di sbranare anche un "fratello" (Anna, lupo semplice). **ok**
- Innocente rivelato poi sbranato (N4); vittoria dei Lupi (3 lupi contro 2). Refresh sul passo Branco ripristina la scelta. **ok**

### S2 - Suocera con Figlia, Cavaliere, Sacerdote, Maga, Fattucchiera, Antico, Polpo, Veggente Mannaro (B)
- N1: Figlia sceglie genitore la Suocera, Cavaliere si sacrifica per la Suocera, Sacerdote unisce Suocera e un Villico, Maga trasforma la Suocera, Veggente Mannaro legge la Suocera ("Aura benevola"), il branco la morde: "Il Cavaliere si immola al posto di Dario: muore Fabio, Dario si salva". **ok**
- Rogo della Suocera (trasformata e innamorata): "E' morto anche Marta (crepacuore). La Figlia dei Lupi Elena e' diventata Lupo Mannaro."; poi Eventi speciali -> "La Suocera si rivela" (solo morti ignoti) -> "Dario si e' rivelato/a: era la Suocera"; la condizione trasformato sparisce. **ok**
- Fattucchiera: inibisce il Veggente Mannaro ("Il potere e' inibito questa notte dalla Fattucchiera: nessuna azione disponibile") e N1 la Figlia (vedi D5). **ok / dubbio**
- Rogo dell'Antico con la Suocera morta: Maledizione, in notte 3 agiscono solo Veggente Mannaro e Branco (Maga/Fattucchiera spariti, banner "Il villaggio e' maledetto da L'Antico"). Vittoria dei Lupi: Polpo e Veggente Mannaro contano come resto del villaggio, la Suocera morta non conta (4 vs 2 senza banner, 2 vs 2 banner). **ok**

### S3 - Scemo, Pastore, Medium, Cucciolo, Nonna, Paladino, Sciacallo, Maga (C, J, M)
- Paladino protegge lo Scemo e il branco lo morde: "Il morso non ha effetto su Nico: e' protetto/a"; Maga trasforma lo Scemo; "Lo Scemo del Villaggio sbaglia la rima" (voce nel menu del voto, non all'alba): muore anche da trasformato, "Fabio si e' rivelato/a: e' lo Scemo...". **ok**
- Pastore con la Nonna seduta al posto del primo vivo a sinistra: con lo Scemo (non lupo) in mezzo non ci sono belati; dopo la morte dello Scemo e del rogo della Nonna nessun belato; dopo che lo Sciacallo resuscita la Nonna "Si sentono dei belati" all'alba. **ok**
- Medium su Scemo morto: "Mostra a Medium la carta: Scemo del Villaggio". **ok**
- Rogo della Nonna con Cucciolo vivo: "Morto un lupo: il Cucciolo e' diventato Lupo Mannaro adulto", poi il rogo del Cucciolo ormai adulto non produce vendetta (un solo morso). **ok**
- Rogo del Cucciolo non cresciuto: "Vendetta del Cucciolo: i lupi sbraneranno due persone", Branco "vittima 1 di 2 / 2 di 2": con Paladino su una vittima e Strega sull'altra "Nessuno e' morto". **ok**
- Sciacallo resuscita lo Scemo (J, "Elena e' stato resuscitato", torna `scemo-del-villaggio`). **ok**

### S4 - Bardo con Addolorata, Sacerdote, Pastore, Chupacabra, Guaritore, Criceto (D)
- Dopo il rogo: "Il Bardo salta la notte" (Conferma, Ok), notte 2: "Questa notte non si svolge per i poteri del Bardo" con Indietro e "Vai all'alba (tieni premuto)"; alba 2: "Nessuno e' morto questa notte. Si sentono dei belati." (la Pastora ha il lupo accanto: coerente). **ok**
- Addolorata: dopo la notte saltata il passo notte 3 propone lo scambio con la vittima del rogo del giorno 2 (non con quella del giorno 1): "Scambiare il ruolo con quello di Elena (vittima del rogo)?" -> Luca diventa Sacerdote, Elena Addolorata. **ok**
- Bardo innamorato (Sacerdote) sbranato in notte 3: "Marta e' morto/a di crepacuore"; Chupacabra caccia il lupo ("Hugo"); Guaritore resuscita il Criceto. **ok**
- Vittoria (flag `vivo` sui morti): "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui." **ok**

### S5 - Addolorata con Mucca, Maga, Sciacallo, Cortigiana; Cartomante, Sacerdote con Nano e Nonna, Pastore (E)
- N1: Cartomante su Cortigiana "Mostra a Cartomante la carta: Cortigiana"; Cortigiana visita la Cartomante e il branco la morde: "A casa di Hugo c'e' anche la Cortigiana Fabio: entrambi moriranno". Sacerdote unisce Nonna e Nano. **ok**
- Rogo della Mucca: Addolorata (trasformata dalla Maga) scambia, diventa `mucca-mannara`; Sciacallo resuscita la Mucca: torna con ruolo `addolorata`. **ok / vedi D7**
- Rogo della Nonna: "E' morto anche Luca (crepacuore)" (Nano al rogo del partner) e il Pastore non sente piu' belati. **ok**

### S6 - Spilungone con Apprendista, Figlia, Boia, Eremita, Paladino, Maga, Sciacallo (F)
- Rogo dello Spilungone: "L'Apprendista Dario ereditera' il suo ruolo. La Figlia dei Lupi Fabio diventa Lupo Mannaro." nel riepilogo di esito, poi "Si rivela: e' lo Spilungone" -> "La notte cala senza vittime" e nessun effetto su Apprendista/Figlia. **ok**
- Boia (trasformato dalla Maga) "giustizia" lo Spilungone gia' rivelato: muore, l'Apprendista eredita Spilungone, la Figlia diventa lupo (vedi D4). Sciacallo lo resuscita: due Spilungone vivi. **ok / dubbio**
- Paladino su Eremita: "Il morso non ha effetto su Hugo: e' protetto/a". **ok**

### S7 - Fantasma Onnisciente con Cavaliere, Nano, Strega, Paladino, Chupacabra, Apprendista/Progenitore, Boia, Eremita (G)
- Apprendista del Progenitore: il Chupacabra uccide il Progenitore, "Carla si rivela: e' l'Apprendista di Bruno ed eredita il ruolo di Lupo Mannaro Progenitore"; la notte dopo il passo Branco propone "Il Progenitore trasforma ..." per l'erede. **ok**
- Rogo del Nano con il Cavaliere protettore: "Il Cavaliere Fabio si sacrifica al posto di Dario: Dario sopravvive al rogo"; compare "Assegna la carta del Fantasma Onnisciente al primo morto": chip Bruno (morto di notte) e Fabio (morto sul rogo); assegnato a Fabio. Strega, Paladino, Chupacabra, Maga: nessuna chip per il Fantasma (morto). **ok**
- Boia giustizia l'Eremita (rivelato "e' il Boia e giustizia Irene"). **ok**
- **BUG 1** alla fine della notte 3 (vedi sotto).

### S8 - Guardie con Progenitore, Pastore, Pifferaio, Antico, Cortigiana, Polpo, Sciacallo (H)
- Il Progenitore trasforma una Guardia ("Sbrana normalmente" disponibile): alba "Si sentono dei belati" (la Guardia, ora lupo, e' accanto alla Pastora), la Guardia trasformata resta ipnotizzata. La Guardia Mannara a caso era proprio la trasformata: ora "Hugo:guardia, Irene:guardia" senza piu' Mannara (coerente). **ok**
- Cortigiana in visita alla Guardia trasformata: muore (vedi D3).
- Rogo dell'Antico: Maledizione, passi di notte 2 = solo Pifferaio, Sciacallo, Branco, Ipnotizzati (Pastore/Guardia/Cortigiana/Eremita non hanno passi comunque). Pifferaio ipnotizza Polpo e Guardia. **ok**

### S9 - Borgomastro con Ubriaco, Medium, Ambasciatore, Fattucchiera; Alchimista, Mezzosangue, Inquisitore, Sacerdote, Polpo (I)
- Alba 1 "E' arrivato un messaggio dall'ambasciatore" (il Veggente accecato dal Polpo legge benevolo); elezione Elena (Ubriaco) Borgomastro; rogo dell'Alchimista (inibita la notte prima dalla Fattucchiera, vedi D6): "trascina con se' Hugo" (Mezzosangue) e Hugo muore. **ok**
- N2: il branco morde il Borgomastro Ubriaco: "Elena e' l'Ubriaco: il branco sara' stordito la prossima notte"; alba "Anna | Elena" e il banner "Il villaggio deve eleggere un Borgomastro"; Medium sul Borgomastro morto: "Mostra a Medium la carta: Ubriaco"; elezione di Luca (Ambasciatore). Notte 3: "Il branco e' ancora stordito dall'alcol dell'Ubriaco: questa notte non puo' cacciare", alba "Nessuno e' morto". **ok**
- Rogo del Polpo (innamorato dell'Inquisitore): "E' morto anche Paolo (crepacuore)"; notte 3 il Veggente torna a leggere correttamente ("Aura malvagia") perche' il Polpo e' morto; Inquisitore ha perso il potere per un'indagine inutile su aura benevola (passo "Ha perso il proprio potere"). **ok**
- Cucciolo cresciuto dal Chupacabra ("Morto un lupo, il Cucciolo Bruno diventa adulto"). **ok**

### S10 - Cucciolo con Polpo, Maga, Paladino (J) - vedi D1
- Rogo del Polpo con Cucciolo vivo: nessun messaggio "Cucciolo diventa adulto", Cucciolo resta tale; al rogo del Cucciolo: vendetta (due morsi). **ok / dubbio**

### S11 - Ladro con Sciacallo e Maga (K)
- Ladro sceglie Maga: il passo Sciacallo mostra "Carta non assegnata a nessun giocatore: chiama comunque il ruolo."; la Ladra e' `maga` e agisce. Ladro sceglie Sciacallo: passo Maga "Carta non assegnata ... chiama comunque", la Ladra resuscita al passo Sciacallo (N1 "Nessun defunto: chiamalo comunque", N2 "Chi resuscitare"). **ok**

### S12 - Criceto, Figlia, Cortigiana, Sacerdote, Berserker, Suocera, Fattucchiera, Mezzosangue (L)
- Sacerdote unisce Cortigiana e Berserker: la Cortigiana visita il Lupo e muore, il Berserker muore di crepacuore ("Hugo e' morto/a di crepacuore"). Figlia con genitore Criceto: rogo del Criceto -> "La Figlia dei Lupi Dario e' diventata Lupo Mannaro" (il Criceto non e' sbranabile, quindi puo' morire solo al rogo). Mezzosangue sbranato diventa lupo. Fattucchiera inibisce il Veggente (cieco). **ok**

### S13 - Gallo, Scemo, Strega, Berserker, Cucciolo, Veggente (M) - vedi D2, O1
- Strega protegge lo Scemo dal morso ("Il morso non ha effetto"); Gallo salta il giorno 1 (Eventi speciali) e quindi il voto/Scemo non e' raggiungibile fino al giorno 2, poi "Dario si e' rivelato/a: e' lo Scemo del Villaggio, ha sbagliato la rima". **ok**
- Berserker + Cucciolo: vedi D2.

## BUG CERTI

1. **Fantasma Onnisciente assegnato come ruolo all'ultimo giocatore ignoto (media, dati sbagliati).** Passi: mazzo con Fantasma Onnisciente + ruoli noti dal primo giro (G: Lupo, Progenitore, Apprendista, Nano, Strega, Cavaliere, Chupacabra, Paladino, Eremita, Boia, Maga, Villico; 12 giocatori), il Boia si rivela di giorno (Eventi speciali), Fantasma consegnato (eFantasmaOnnisciente su un morto), un solo giocatore resta "?" (il Villico). Alla fine della notte successiva (passaggio all'alba) il Villico ignoto diventa `ruoloSlug: 'fantasma-onnisciente'` (verificato anche con il giocatore vivo: flag `vivo` rimesso a true, checkpoint dg2c). Causa probabile: `autoAssegnaRuoliRimasti` (`src/features/notte/NightSequencer.jsx:825-846`): `ruoliNonVillicoPendenti` esclude solo `villico` e `borgomastro`, ma il Fantasma non e' una carta del mazzo (`RUOLO_NON_CARTA_DISTRIBUITA`, `MazzoBuilder.jsx:31`) e non viene mai contato in `contaAssegnati` (il Fantasma e' un flag, non uno slug) quindi risulta sempre "pendente" con capacita' 1: con un solo ignoto rimasto `capacitaResidua === senzaRuolo.length` e l'ignoto prende il Fantasma invece del Villico. Effetti: Cartomante/Medium/Diario mostrano "Fantasma Onnisciente" per un Villico. Correzione minima: escludere anche `fantasma-onnisciente` in quel filtro. Stessa radice per `ignotiSonoVillici` (`assegnazione.js:42-47`): con il Fantasma nel mazzo (`quantita['fantasma-onnisciente']` mai assegnato) `residui` contiene sempre il Fantasma e la funzione non scatta mai (solo visualizzazione "Villico" al posto di "?" nel voto): da verificare insieme.

## DUBBI DI REGOLAMENTO

D1. **Cucciolo e Polpo Mannaro: la morte del Polpo non fa maturare il Cucciolo.** Rogo del Polpo (J): nessun avviso, il Cucciolo resta cucciolo e il suo rogo successivo da' la vendetta dei due morsi. Regola (roles.js, Cucciolo): "Alla morte del primo lupo il cucciolo diventa adulto". Il Polpo ha fazione `lupi` ma non e' tra i "lupi" (Lupo, Capobranco, Progenitore, Cucciolo, Nonna). Proposta: confermare (coerente con le altre decisioni sui "lupi") e magari scriverlo nei testi.
D2. **Berserker che uccide il Cucciolo: vendetta nella stessa notte.** Notte 2 (M): il branco morde il Berserker, il lupo piu' vicino e' il Cucciolo: dopo la prima scelta compare "Vendetta del Cucciolo: il branco sbrana due vittime questa notte (vittima 2 di 2)" e si puo' scegliere un secondo morso: all'alba tre morti (Cucciolo, Berserker, un terzo). Regola: "Se viene ucciso, i lupi mannari sbranano due persone in una notte per la sua vendetta"; il Berserker "all'alba comunichera' la morte di entrambi". Proposta: o la vendetta slitta alla notte successiva (il Cucciolo muore "all'alba"), o si conferma e si spiega all'avviso del Berserker (`AzioneBrancoLupi.jsx`, campo `vendettaCucciolo`, `effettiNotte.js:203`).
D3. **Cortigiana e vittima trasformata dal Progenitore.** H: Cortigiana in visita alla Guardia, il branco la morde e il Progenitore la trasforma: la Cortigiana muore comunque (avviso "entrambi moriranno" non cambia premendo "Il Progenitore trasforma ..."), mentre la Guardia vive. Regola: "viene uccisa ... se il cliente scelto viene sbranato dal branco". Proposta: decidere se la trasformazione conta come "sbranato" (oggi si') e aggiornare l'avviso.
D4. **Il Boia puo' giustiziare lo Spilungone gia' rivelato.** F: dopo "Elena e' lo Spilungone, la notte cala senza vittime", il Boia la giustizia (muore, Apprendista eredita, Figlia diventa lupo). Regola (Spilungone): "non puo' essere messo al rogo dal villaggio". Il Boia non e' un rogo, quindi plausibile; chiedere conferma al proprietario.
D5. **Fattucchiera e i poteri "di prima notte" (Figlia, Cavaliere, Sacerdote, Apprendista).** Nella sequenza il passo Fattucchiera (`nightSteps.js`, `primaNotteSolo: false`) viene dopo Cavaliere/Figlia/Sacerdote/Apprendista, quindi inibire la Figlia (B) o un Cavaliere nella notte 1 non ha alcun effetto e nessun avviso lo dice (la Figlia inibita ha comunque scelto il genitore ed e' poi diventata Lupo). Regola: "blocca i poteri di una persona a sua scelta per una notte". Proposta: avviso nel passo Fattucchiera della notte 1 oppure ordine invertito per la sola notte 1.
D6. **Alchimista inibito dalla Fattucchiera esplode comunque al rogo.** I: Fattucchiera inibisce l'Alchimista la notte 1; al rogo il giorno dopo l'esplosione funziona. Coerente con "per una notte" (il giorno non e' coperto): confermare.
D7. **Addolorata che scambia con la Mucca Mannara non riconosce il branco** (stesso nodo di `bug-partite-2026-10-14-a.md` DUBBI 7 per la Guardia): la nuova Mucca non ha un passo di riconoscimento nelle notti successive. Proposta: decidere se il narratore deve ricevere un promemoria (Mucca, Guardie) al momento dello scambio.

## OSSERVAZIONI MINORI

O1. Dopo un refresh sul passo Branco il banner "Il morso non ha effetto su Dario: e' protetto/a" diventa "Il branco ha gia' sbranato una vittima questa notte." (lo stato e' corretto: all'alba "Nessuno e' morto"). Solo testo, gravita' bassa.

## NON COPERTO

Eremita x Guardia, Eremita x Antico (nessun Veggente in condizioni di leggere sotto Maledizione), Innocente x Mucca/Sciacallo/Ubriaco (ruoli presenti insieme, nessuna interazione provata), Cucciolo x Sciacallo (resurrezione del Cucciolo), Mezzosangue x Polpo (Veggente cieco su un Mezzosangue trasformato: il Veggente era inibito), Guardia Mannara x Ubriaco, Boia x Villico, vittoria del Pifferaio con questi ruoli (gia' coperta nei batch precedenti), Mimo.

## Coppie valutate (slug di src/data/roles.js)

```json
[
  "gallo-mannaro x lupo-mannaro-capobranco: si, ok (salto del giorno col Capobranco in gioco, nessuna interazione)",
  "apprendista x lupo-mannaro-capobranco: si, ok (eredita il ruolo dopo la morte del maestro per Berserker)",
  "berserker x lupo-mannaro-capobranco: si, ok (muore il Capobranco piu' vicino, avviso corretto)",
  "cortigiana x lupo-mannaro-capobranco: si, ok (visita al Capobranco: muore)",
  "lupo-mannaro-capobranco x sciacallo-mannaro: si, ok (Capobranco resuscitato accanto all'erede)",
  "innocente x lupo-mannaro-capobranco: parziale, ok (Innocente rivelato e poi sbranato)",
  "figlia-dei-lupi x suocera: si, ok (genitore Suocera al rogo: Figlia lupo)",
  "cavaliere x suocera: si, ok (si immola per la Suocera sbranata)",
  "sacerdote x suocera: si, ok (crepacuore del partner, rivelazione dopo il rogo)",
  "maga x suocera: si, ok (trasformata, condizione persa alla rivelazione)",
  "lantico x suocera: si, ok (Maledizione con Suocera morta, nessuna interferenza)",
  "polpo-mannaro x suocera: si, ok (conteggio vittoria: la Suocera morta non conta, il Polpo e' resto del villaggio)",
  "suocera x veggente-mannaro: si, ok (Aura benevola)",
  "fattucchiera x figlia-dei-lupi: si, dubbio D5 (inibizione di prima notte senza effetto ne' avviso)",
  "fattucchiera x suocera: parziale, ok (inibita senza effetti visibili)",
  "pastore x scemo-del-villaggio: si, ok (la morte dello Scemo cambia il vicino, belati dopo la resurrezione della Nonna)",
  "medium x scemo-del-villaggio: si, ok (carta Scemo mostrata)",
  "cucciolo-di-lupo-mannaro x nonna: si, ok (morte della Nonna matura il Cucciolo, nessuna vendetta dopo)",
  "addolorata x bardo: si, ok (notte saltata: scambio con la vittima del rogo del giorno dopo)",
  "bardo x sacerdote: si, ok (Bardo innamorato sbranato: crepacuore)",
  "bardo x pastore: si, ok (belati anche all'alba della notte saltata)",
  "bardo x chupacabra: parziale, ok (notte saltata, caccia la notte dopo)",
  "bardo x guaritore: parziale, ok",
  "bardo x criceto-malvagio: parziale, ok (Criceto resuscitato, vittoria del Criceto a fine partita)",
  "bardo x mezzosangue: parziale, ok",
  "bardo x polpo-mannaro: parziale, ok",
  "addolorata x mucca-mannara: si, dubbio D7 (nessun riconoscimento del branco dopo lo scambio)",
  "addolorata x maga: si, ok (Addolorata trasformata scambia lo stesso)",
  "addolorata x sciacallo-mannaro: si, ok (resuscitata la vittima dello scambio: torna Addolorata)",
  "addolorata x cortigiana: parziale, ok",
  "cartomante x cortigiana: si, ok (carta Cortigiana, visita alla Cartomante e morsi)",
  "nonna x sacerdote: si, ok (rogo della Nonna: crepacuore del Nano)",
  "nano x sacerdote: si, ok",
  "pastore x sacerdote: si, ok (la morte dei due innamorati cambia i vicini e i belati)",
  "cortigiana x sacerdote: si, ok (Cortigiana muore da un lupo, il Berserker innamorato muore di crepacuore)",
  "apprendista x spilungone: si, ok (rogo senza vittima: nessuna eredita'; poi eredita dopo il Boia)",
  "figlia-dei-lupi x spilungone: si, ok",
  "boia x spilungone: si, dubbio D4 (il Boia puo' giustiziare lo Spilungone rivelato)",
  "boia x maga: si, ok (Boia trasformato giustizia lo stesso)",
  "eremita x paladino: si, ok",
  "boia x sciacallo-mannaro: si, ok (resuscitata la vittima del Boia)",
  "apprendista x lupo-mannaro-progenitore: si, ok (eredita il potere di trasformare)",
  "apprendista x maga: si, ok (Apprendista trasformato eredita comunque)",
  "cavaliere x fantasma-onnisciente: si, ok (Cavaliere immolato primo morto del rogo riceve il Fantasma)",
  "fantasma-onnisciente x paladino: si, ok (nessuna chip per il Fantasma)",
  "fantasma-onnisciente x strega: si, ok",
  "fantasma-onnisciente x nano: parziale, ok",
  "chupacabra x fantasma-onnisciente: parziale, ok",
  "apprendista x fantasma-onnisciente: parziale, BUG 1 collaterale (auto-assegnazione del Fantasma al Villico ignoto)",
  "boia x eremita: si, ok",
  "guardia x lupo-mannaro-progenitore: si, ok (Guardia trasformata, belati, Mannara casuale sostituita)",
  "guardia x pastore: si, ok",
  "guardia x pifferaio: si, ok (Guardia ipnotizzata poi trasformata)",
  "pifferaio x polpo-mannaro: si, ok",
  "pifferaio x sciacallo-mannaro: si, ok",
  "cortigiana x guardia: si, dubbio D3 (Cortigiana muore se il cliente e' trasformato dal Progenitore)",
  "guardia x lantico: si, ok (Maledizione: nessun passo Guardia, nessuna interferenza)",
  "borgomastro x ubriaco: si, ok (Borgomastro Ubriaco sbranato: branco stordito, nuova elezione)",
  "borgomastro x medium: si, ok (carta del Borgomastro morto: Ubriaco)",
  "ambasciatore x borgomastro: si, ok",
  "borgomastro x fattucchiera: parziale, ok (Borgomastro inibito, nessun effetto)",
  "alchimista x fattucchiera: si, dubbio D6 (esplode comunque dopo l'inibizione)",
  "alchimista x mezzosangue: si, ok (il Mezzosangue muore per l'esplosione)",
  "inquisitore x sacerdote: si, ok",
  "polpo-mannaro x sacerdote: si, ok (rogo del Polpo: crepacuore dell'Inquisitore, fine della cecita')",
  "chupacabra x innocente: parziale, ok",
  "innocente x ubriaco: parziale, ok",
  "ladro x sciacallo-mannaro: si, ok (carta scartata: 'chiama comunque'; carta presa: resuscita)",
  "ladro x maga: si, ok",
  "cucciolo-di-lupo-mannaro x paladino: si, ok (due morsi, uno protetto)",
  "cucciolo-di-lupo-mannaro x maga: si, ok",
  "cucciolo-di-lupo-mannaro x polpo-mannaro: si, dubbio D1 (la morte del Polpo non matura il Cucciolo)",
  "cucciolo-di-lupo-mannaro x scemo-del-villaggio: parziale, ok",
  "scemo-del-villaggio x sciacallo-mannaro: si, ok",
  "paladino x scemo-del-villaggio: si, ok",
  "maga x scemo-del-villaggio: si, ok (Scemo trasformato sbaglia la rima: muore)",
  "scemo-del-villaggio x strega: si, ok (Strega protegge lo Scemo dal morso)",
  "gallo-mannaro x scemo-del-villaggio: parziale, ok (il salto del giorno rende irraggiungibile l'evento dello Scemo)",
  "criceto-malvagio x figlia-dei-lupi: si, ok (genitore Criceto al rogo: Figlia lupo)",
  "criceto-malvagio x lantico: parziale, ok",
  "berserker x veggente: parziale, ok",
  "guardia-mannara x ubriaco: parziale, ok",
  "berserker x cucciolo-di-lupo-mannaro: si, dubbio D2 (non nell'elenco: vendetta del Cucciolo nella stessa notte)",
  "bug: fantasma-onnisciente x villico (auto-assegnazione dell'ultimo ignoto): BUG 1"
]
```

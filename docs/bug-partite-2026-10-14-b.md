# Batch di partite 2026-10-14 (b): coppie ancora senza evidenza "si" (elenco coppie-1)

Chromium reale (Playwright, 390x844, dev server porta 5592), nessuna modifica al codice (stato 41e11ea). 16 partite da 4-10 giocatori, giocate dalla UI (mazzo, giocatori, passi di notte, alba, voto, rogo, Eventi speciali); checkpoint di `localStorage` solo per saltare notti gia' giocate e, per le vittorie finali, per cambiare i flag `vivo`. Script e screenshot nello scratchpad `.../92cc28b2-.../scratchpad/k`. Console (error/warning) vuota in tutte le partite; nessun overflow orizzontale; nessun softlock. Le decisioni gia' prese (brief) non sono riproposte.

## Scenario A - Apprendista, Ubriaco, Polpo, Alchimista, Veggente, Ambasciatore (9 giocatori, 4 notti)
- Apprendista sceglie come maestro l'Ubriaco; branco sbrana l'Ubriaco: alba "Carla si rivela: e' l'Apprendista di Dario ed eredita il ruolo di Ubriaco", notte 2 branco stordito ("Il branco e' ancora stordito..."). Poi sbranata Carla (ora Ubriaco): notte 3 branco stordito di nuovo (il potere ereditato funziona). **ok**
- Veggente sul Polpo: "Accecato dal Polpo Mannaro", Ambasciatore: "messaggio" (Veggente cieco vede benevolo, noto). Rogo dell'Alchimista (rivela e trascina il Veggente, accecato): "Fabio e' morto/a: morto/a per l'esplosione dell'Alchimista"; dalla notte dopo il passo Veggente e' "chiama comunque". **ok** (UX: doppio "morto/a", vedi UX 1)
- Mini partita Apprendista -> Polpo (7 giocatori): rogo del Polpo, l'Apprendista eredita Polpo ("L'Apprendista Carla ha ereditato il suo ruolo"); il Veggente resta `accecato` perche' esiste ancora un Polpo vivo (coerente con la regola), Veggente su Carla-Polpo "aura benevola". Ambasciatore annuncia. **ok**

## Scenario B - Guardie, Guardia Mannara, Nonna, Untore, Spilungone, Mezzosangue, Criceto, Lupo (10 giocatori)
- Passo "Guardie (si riconoscono)" con 3 titolari; Criceto: "Il morso non ha effetto su Irene: il Criceto Malvagio non puo' essere sbranato". Untore unge il Mezzosangue ("Bruno e' stato unto dall'Untore"). **ok**
- Giorno 1, Eventi speciali (compare solo di giorno) > "Morte per unzione": Mezzosangue unto muore, l'unzione passa a Anna (Guardia Mannara) e Carla (Guardia); Carla muore a sua volta e l'unzione arriva all'Untore Dario (anche l'Untore diventa unto). Alla notte l'unzione scade (Hugo, Guardia sbranato, resta con `unto` solo perche' morto). **ok**
- Spilungone al rogo: "Elena rivela la propria carta: e' lo Spilungone... La notte cala senza vittime"; poi i lupi sbranano comunque la notte 2 (nessun blocco: "senza vittime" vale per il rogo, non per la notte, gia' deciso nei batch precedenti). **ok**
- Vittoria: Anna, Dario, Luca morti con Elena/Fabio/Giulia/Irene: "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari" anche con la Guardia Mannara viva. **ok**

## Scenario C - Cucciolo, Guardie + Guardia Mannara, Inquisitore, Veggente, Nano, Suocera, Ambasciatore, Fantasma (10 giocatori)
- Notte 1: Inquisitore e Veggente sul Cucciolo: "sì (aura malvagia)" / "Aura malvagia"; Ambasciatore: nessun messaggio (Veggente ha visto un malvagio). Branco sul Nano: morso senza effetto. **ok**
- Rogo del Cucciolo: "Vendetta del Cucciolo: i lupi sbraneranno due persone", notte 2 "vittima 1 di 2 / 2 di 2" (Suocera e Veggente), alba con due morti e messaggio dell'Ambasciatore (Inquisitore su Veggente: aura benevola, poi "Ha perso il proprio potere"). Fantasma assegnato al Cucciolo (primo morto sul rogo): nessun passo dedicato (voluto). **ok**
- Vendetta con il Nano come una delle due vittime (g3e): muore solo l'altra vittima, il Nano e' immune e non viene segnalato nella schermata finale "Il branco ha gia' sbranato le sue vittime" (nessun avviso "morso senza effetto" al secondo morso, solo prima della scelta). **ok / nota minore**
- Rogo della Guardia Mannara (che per i tavoli e' una "Guardia") PRIMA di qualunque lupo: il Cucciolo non matura. Poi rogo del Lupo Mannaro: "Morto un lupo: il Cucciolo e' diventato Lupo Mannaro adulto". **ok**
- Suocera sbranata (non rivelata) e poi rivelata dall'evento: muore come "suocera", non conta come in vita. **ok**

## Scenario D - Berserker, Cortigiana, Scemo, Antico, Criceto, Spilungone, Suocera, 2 Lupi, Villico, Fantasma (10 giocatori)
- Cortigiana visita l'Antico (ignoto, '?') e il branco lo sbrana: "A casa di Elena c'e' anche la Cortigiana Carla: entrambi moriranno". Alba: muoiono Carla e Elena; l'evento "L'Antico si rivela" su Elena la riporta in vita ("perde la prima vita e sopravvive") ma **la Cortigiana resta morta** ("La Cortigiana Carla muore: il suo cliente Elena e' stato sbranato"). **dubbio** (vedi DUBBI 1)
- Cortigiana con cliente la Suocera sbranata (scenario gemello): muore anche lei, registro corretto. **ok**
- "Lo Scemo del Villaggio sbaglia la rima": Dario muore, rivelato nel registro. Rogo Criceto/Berserker con assegnazione del Fantasma (carta data a Giulia-Criceto e a Bruno-Berserker in due varianti): Fantasma accettato, nessun effetto sul Berserker bruciato (non uccide al rogo). **ok**
- Berserker sbranato (notte 2): avviso "Se il Berserker sara' sbranato, Anna (il lupo piu' vicino) morira' con lui", all'alba "Anna | Bruno" e registro "Il Berserker Bruno e' stato sbranato e uccide lottando Anna". **ok**
- Notte con Cortigiana morta: "Chiama comunque Carla per il suo turno". **ok**

## Scenario E - Pastore, Eremita, Strega, Innocente, Boia, Figlia dei Lupi, Lupo, Capobranco, Villico (9 giocatori)
- Pastore con vicino Capobranco: "Si sentono dei belati" (notte 1). Strega: vitale su Hugo (morso inutile) e mortale sull'Eremita (muore); notte 2 passo Strega con entrambe le pozioni "gia' utilizzate". **ok**
- Figlia dei Lupi sceglie il Capobranco come genitore; rogo del Capobranco: "La Figlia dei Lupi Fabio e' diventata Lupo Mannaro" (al rogo, subito); notte 2 il branco la comprende. Notte 2 senza belati (nessun lupo vicino vivo). **ok**
- Innocente si rivela da Eventi speciali (anche dopo un Veggente non presente): registro e stato `innocente`. Boia (evento: "Chi e' il Boia" poi "Chi giustizia il Boia") giustizia la Figlia gia' Lupo: "Elena si e' rivelato/a: e' il Boia e giustizia Fabio". Rogo dell'ultimo lupo: banner Villaggio, "Concludi partita" con conferma. **ok**

## Scenario F - Progenitore, Gallo, Figlia, Guardie + Guardia Mannara, Innocente, Eremita, Sacerdote, Antico (10 giocatori)
- Sacerdote lega Innocente (Giulia, ignota) + Eremita; branco sbrana Giulia senza usare il Progenitore: "Hugo e' morto/a di crepacuore per la morte del partner". **ok**
- Stesso set con il Progenitore: il bottone "Il Progenitore trasforma X in Lupo Mannaro" e' un toggle (va premuto, altrimenti X muore normalmente): con toggle Giulia vive come `lupo-mannaro` ancora `innamorato` (legame intatto, il partner non muore); il testo dice "Svegliane segretamente il giocatore". **ok**
- Progenitore su un giocatore senza ruolo assegnato dall'app (Innocente o Antico): la carta originale viene persa, `ruoloSlug` diventa lupo-mannaro e nel menu "L'Innocente si rivela" compare ancora l'altro '?' (che e' in realta' l'Antico). **dubbio** (vedi DUBBI 2)
- Rogo del Progenitore: la Figlia (genitore Progenitore) diventa Lupo. Evento "Il Gallo Mannaro salta il giorno" > Conferma: da alba 2 si passa direttamente a notte 3 (solo passo Branco). **ok**

## Scenario G - Pifferaio, Nonna, Mucca Mannara, Sacerdote, Alchimista, Antico, Lupo, 2 Villici, Fantasma (9 giocatori)
- Notte 1: "Mucca Mannara (riconosce il branco)" con "Lupi mannari: Bruno, Giulia" (Nonna inclusa); Sacerdote lega Mucca e Lupo (passo "Innamorati (si riconoscono)"); Pifferaio ipnotizza Nonna e Mucca. Branco sbrana l'Antico ('?'): serve l'evento "L'Antico si rivela" per salvarlo (nessun automatismo, come in D). **ok**
- Rogo dell'Alchimista che trascina la Mucca innamorata e ipnotizzata: "E' morto anche Giulia (crepacuore)". Fantasma assegnato all'Alchimista (primo morto al rogo): il Pifferaio non puo' ipnotizzarlo (solo vivi nella lista). **ok**
- Notte 3: un solo ipnotizzabile rimasto, Avanti premibile; alba: "Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui" (Nonna morta al rogo, ipnotizzata). **ok**

## Scenario H - Bardo, Gallo, Paladino, Strega, Nonna, Innocente, Ambasciatore, Suocera, Veggente, Lupo (10 giocatori)
- Passi Bardo e Gallo con "ti mostra il suo gesto segreto". Veggente su Nonna: benevola, Ambasciatore annuncia. Paladino protegge Irene, branco inutile. Innocente si rivela, rogo del Lupo. Notte 2: Veggente su Luca (ultimo ignoto = Suocera, assegnata dall'app): benevola; branco sbrana la Suocera. **ok**
- Giorno 2: rogo della Nonna, "Il Bardo salta la notte" > Conferma (popup "Il Bardo ha dato il segnale") > notte 3: "Questa notte non si svolge per i poteri del Bardo" con "Indietro annulla il gesto" e "Vai all'alba"; alba 3: "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio" nonostante il Gallo Mannaro vivo (decisione gia' nota: i lupi sono solo il branco). Ambasciatore silenzioso nella notte saltata. **ok**

## Scenario I - Ladro con carte extra (Nano, Lupo, Spilungone, Villico, Pastore, Inquisitore, Alchimista) (8 giocatori, 3 varianti)
- Il passo Ladro chiede le due carte "rimaste fuori" (due select), poi "Nano / Lupo Mannaro / Resta Villico". Variante 1 (Ladro prende Lupo): Lupo assegnato, il Nano scartato compare come passo "Nano: carta non assegnata a nessun giocatore: chiama comunque il ruolo". Inquisitore sul Ladro-lupo: "sì (aura malvagia)"; il Pastore vicino al Ladro-lupo: "Si sentono dei belati"; rogo dell'Alchimista che trascina il Ladro-lupo: "Anna e' morto/a: morto/a per l'esplosione". **ok**
- Variante 2 (Ladro prende il Nano): branco sul Ladro-Nano: "Il morso non ha effetto su Anna: il Nano non puo' essere sbranato". **ok**
- Variante 3 (Ladro prende lo Spilungone, g16): al rogo l'esito dice "Lo Spilungone si rivela e non muore" ma offre solo "Dichiara morte sul rogo"; premendolo "Anna rivela la propria carta: e' lo Spilungone... La notte cala senza vittime", Anna viva (`spilungoneRivelatoRound`). Funziona, ma l'etichetta e' fuorviante (vedi UX 2). **ok / UX**
- Indietro dopo Avanti dal passo Ladro azzera sia l'assegnazione sia la scelta (coerente con "Indietro annulla"); refresh nel passo Ladro conserva le due carte e la scelta (select e bottone). Indietro del telefono nel passo di notte resta nel passo. **ok**

## Scenario J - Addolorata, Veggente Mannaro, Pastore, Lupo, Nano, Cavaliere, 2 Villici (8 giocatori, 3 varianti)
- Notte 1: Cavaliere (gruppo "Per chi sacrificarsi") protegge un Villico sbranato: "Fabio si e' rivelato: e' il Cavaliere, e si e' immolato al posto della vittima". Pastore con vicino lupo: belati. **ok**
- Rogo del giorno 1 e Addolorata notte 2 (passo con "Scambia"/"Annulla scambio"): con il Nano bruciato, Anna diventa Nano e il branco non puo' sbranarla (morso senza effetto); con il Lupo bruciato Anna entra nel branco (Pastore: belati dal nuovo vicino); con il Veggente Mannaro bruciato Anna diventa Veggente Mannaro e il passo cambia nome/titolare. Registro: "L'Addolorata Anna scambia la carta con X (morto al rogo): ora e' ... e X ha la carta Addolorata". **ok**
- Refresh dopo "Scambia" conserva lo scambio; Indietro al passo successivo e ritorno: lo scambio si annulla (torna "Scambia"). **ok**

## Scenario K - Maga, Polpo, Eremita, Nano, Lupo, Veggente, Guaritore, Suocera, Villico + Borgomastro (9 giocatori)
- Evento "Elezione Borgomastro" (gruppo "Chi sara' il nuovo Borgomastro?") su Dario (Nano) poi su Bruno (Polpo) e Carla (Eremita): registro "Dario e' stato/a eletto/a Borgomastro"; alla morte "Dario era il Borgomastro: il villaggio dovra' eleggerne uno nuovo" (anche per il Polpo bruciato dopo che i lupi erano gia' tutti morti). La Maga trasforma anche il Borgomastro-Nano senza effetti collaterali; Nano Borgomastro: morso senza effetto. **ok**
- Veggente sull'Eremita: "Aura malvagia". Veggente sul Polpo: "Accecato"; quando il Polpo muore al rogo la cecita' e' tolta ("Fabio ha perso la condizione accecato"). **ok**
- Guaritore: passo "Chi resuscitare" con i morti (Hugo-Suocera, poi Dario); resuscitata la Suocera (rivelata da evento): `suocera` viva `resuscitato`, e al conteggio vittoria **non conta come in vita** (con lupo + Veggente: 1 contro 1 -> "vincono i Lupi", con lupo + Suocera sola -> "vincono i Lupi"). **ok**
- Se la Suocera morta non viene rivelata prima del Guaritore, l'app non puo' piu' saperlo: dopo la resurrezione Hugo e' un '?' vivo e l'evento "La Suocera si rivela" propone solo gli altri morti ignoti. E' conseguenza del flusso (la Suocera "si rivela morendo"), nessun bug.

## Scenario L - Boia, Chupacabra, Fattucchiera, Innocente, Medium, Sacerdote, Ubriaco, Untore, Lupo, Villico (10 giocatori)
- Notte 1: Sacerdote lega Ubriaco e Villico; Fattucchiera inibisce l'Innocente; Untore unge il Sacerdote; Chupacabra caccia il Lupo (muore); branco sbrana l'Ubriaco la stessa notte (il Lupo e' gia' morto ma il morso conta, decisione nota). Alba: "Giulia | Irene | Luca", "Fabio e' stato unto dall'Untore", "Luca e' morto/a di crepacuore"; avviso "Giulia e' l'Ubriaco: il branco sara' stordito" a lupi gia' morti (innocuo). **ok**
- Giorno 1: Boia giustizia il Chupacabra; rogo dell'Untore. Notte 2: Fattucchiera sull'Innocente (inibito e poi tolto all'alba), Medium sull'Ubriaco morto innamorato: "Mostra a Medium la carta: Ubriaco". Giorno 2: l'Innocente si rivela anche se inibito il giorno prima. **ok**

## Scenario M - Veggente, Eremita, Nonna, Innocente, Apprendista, Guardie, Ambasciatore, Lupo (9 giocatori)
- Apprendista segue una Guardia, sbranata: "Elena si rivela: e' l'Apprendista di Fabio ed eredita il ruolo di Guardia". Veggente su Eremita: malvagia, nessun messaggio dell'Ambasciatore; su Guardia: benevola, messaggio. Innocente rivelato e poi sbranato; rogo della Nonna. **ok** (nota: l'alba non ricorda al narratore di presentare i colleghi all'Apprendista-Guardia, vedi UX 3)

## Scenario N - Capobranco, Gallo, Figlia, Guardie + Guardia Mannara, Spilungone, Suocera, Mezzosangue, Nonna (10 giocatori)
- Figlia sceglie una Guardia come genitore. Il Mezzosangue sbranato non muore: "Il Mezzosangue Irene e' stato bersaglio dei lupi e diventa perciò Lupo Mannaro" (poi compare nella lista dei vivi nel passo Branco). Capobranco puo' scegliere un lupo (la Nonna Luca) come vittima. Rogo della Guardia-genitore: "La Figlia dei Lupi Carla e' diventata Lupo Mannaro". Spilungone al rogo: rivela e la notte cala senza vittime. **ok**

## Scenario O - Progenitore, Cucciolo, Criceto, Guardie + Guardia Mannara, Alchimista, Pastore, 2 Villici (10 giocatori)
- Progenitore trasforma una Guardia sbranata (Dario): diventa Lupo, le altre due Guardie restano (una e' la Mannara, passo `guardia-mannara` morto in seguito). Pastore con vicini non lupo: nessun belato. Rogo del Cucciolo, notte 2 con vendetta (due vittime): Criceto e Guardia Mannara scelti, muore solo la Guardia Mannara (Criceto inattaccabile). Rogo dell'Alchimista che trascina un Villico. **ok**

## Scenario P - Ladro, Apprendista, Ambasciatore, Antico, Nano, Mucca, Lupo, Spilungone (7 giocatori)
- Antico auto-assegnato come ultimo ignoto e sbranato in notte 1: ruolo `lantico` morto fino all'evento "L'Antico si rivela" (poi `villico`, "perde la prima vita e sopravvive"); al rogo successivo muore come un normale Villico, senza maledizione. Apprendista di un Ambasciatore sbranato: "Bruno si rivela... eredita il ruolo di Ambasciatore". **ok**

## BUG CERTI
Nessun bug certo trovato in questo batch (nessun errore in console, nessuno stato incoerente riproducibile). Solo dubbi di regolamento e rifiniture UX qui sotto.

## DUBBI (con proposta)
1. **Cortigiana con cliente l'Antico sbranato**: la Cortigiana muore ("il suo cliente ... e' stato sbranato"), poi l'evento "L'Antico si rivela" salva l'Antico ma la Cortigiana resta morta (D: Carla/Elena; riproducibile anche con l'Antico auto-assegnato, solo l'ordine cambia). Regola (roles.js, Cortigiana): "viene uccisa solo se fa visita ad un lupo mannaro o se il cliente scelto viene sbranato dal branco"; l'Antico sbranato di notte sopravvive ("Se invece perde la sua prima vita di notte, si rivela all'alba senza conseguenze"), quindi il cliente non e' morto. Il codice (`src/data/risoluzioneNotte.js:159`) decide su `mortoDa === 'branco'` quando il cliente e' ancora ignoto. Proposta: considerare il cliente "sbranato" solo se non e' l'Antico alla prima vita; con l'Antico ignoto, far rivivere la Cortigiana all'evento "L'Antico si rivela" (stessa logica del Cavaliere) o avvisare il narratore.
2. **Progenitore che trasforma un giocatore senza ruolo assegnato (Innocente, Antico, Spilungone...)**: la carta originale va persa e il menu degli eventi continua a proporre l'altro '?' come titolare (es. "L'Innocente si rivela" propone l'Antico). Regola (roles.js, Progenitore): "trasformare in Lupo Mannaro la vittima del branco". Proposta: lasciare (il narratore sa chi e'), ma segnare nel registro/diario la carta persa o chiedere "che carta aveva?" al momento della trasformazione per tenere coerenti `ruoliAssegnabili`.
3. **Banner "vincono i Lupi" prematuro con l'Antico sbranato non ancora rivelato**: partita Lupo + Cortigiana + Antico + Villico (4 giocatori), branco sbrana l'Antico ('?'): all'alba compare il banner dei Lupi (1 contro 1) mentre se la vittima e' l'Antico sopravvive e il banner dovrebbe sparire; sparisce infatti dopo "L'Antico si rivela". E' lo stesso caso gia' accettato per la Suocera (41e11ea), ma l'Antico non e' coperto. Proposta: ritardare/avvisare il banner finche' esiste un morto di notte con ruolo ignoto e l'Antico e' nel mazzo.
4. **Cucciolo: vendetta con una vittima inattaccabile (Nano/Criceto)**: l'app consente di scegliere il Nano come una delle due vittime e la schermata finale non avvisa che quella vittima e' sprecata (l'avviso "il morso non ha effetto" compare solo all'atto della scelta). Proposta: lasciare; eventualmente ricordare le immuni anche nel riepilogo.
5. **Apprendista che eredita la Guardia**: eredita la carta ma il flusso non mostra "presenta i colleghi" (le Guardie si riconoscono solo alla prima notte, roles.js: "Durante la prima notte conosce il suo collega"). Proposta: aggiungere nell'alba dell'eredita' una riga "ora conosce le altre Guardie" oppure lasciare al narratore (decisione di regolamento da confermare).

## UX / rifiniture
1. Registro: "Fabio e' morto/a: morto/a per l'esplosione dell'Alchimista" ha il "morto/a" ripetuto (`src/data/log.js:20`, `ETICHETTA_MORTE_DA.alchimista` va dopo "e' morto/a" costruito altrove). Proposta: ": per l'esplosione dell'Alchimista".
2. Spilungone noto (preso dal Ladro, ereditato o Mimo): l'esito del rogo dice "Lo Spilungone si rivela e non muore" ma il bottone e' "Dichiara morte sul rogo" (che poi non uccide). Proposta: nome del bottone coerente ("Lo Spilungone si rivela") come per lo Spilungone ignoto ("Si rivela: e' lo Spilungone" + Conferma).
3. Progenitore: il toggle "Il Progenitore trasforma X in Lupo Mannaro" non e' evidente come interruttore (se non premuto, X muore normalmente); il testo di conferma compare solo dopo il click.
4. Eventi speciali nel giorno elenca solo "Elezione Borgomastro" fino a "Vai al voto" (unzione, Boia, Scemo, Fantasma, Suocera, Innocente, Antico appaiono dopo): coerente ma da sapere quando si cerca la "Morte per unzione" di alba.

## NON COPERTO
- Innocente/Strega con pozione mortale sull'Innocente rivelato; Strega x Bardo con pozione vitale su un Bardo che salta la notte; Paladino durante la notte del Bardo (solo il passo saltato).
- Gallo Mannaro con Suocera/Guardia Mannara dopo il "salta il giorno" (solo l'evento, non l'interazione); Figlia dei Lupi con Gallo.
- Berserker vicino a una Cortigiana lupo-visitata; Berserker/Cortigiana/Criceto con lo Scemo oltre la compresenza.
- Capobranco che sbrana lo Spilungone al rogo (non applicabile) e Capobranco con Spilungone rivelato di notte; Antico con Nano e Mucca oltre la compresenza.
- Guardia con Nonna/Mezzosangue/Spilungone: solo compresenza (nessuna regola le lega).
- Mimo, Medium variante aura, Paladino su Cortigiana, PWA su telefono.

## Coppie valutate (JSON-friendly)
```json
[
  "apprendista x guardia: si, ok (eredita Guardia, nessun hint ai colleghi: DUBBI 5)",
  "apprendista x ubriaco: si, ok (potere ereditato: branco stordito due volte)",
  "apprendista x polpo-mannaro: si, ok (eredita Polpo, cecita' del Veggente persiste finche' un Polpo vive)",
  "ambasciatore x apprendista: si, ok (Apprendista eredita Ambasciatore)",
  "ambasciatore x villico: parziale, ok",
  "ambasciatore x cucciolo-di-lupo-mannaro: si, ok (Veggente su Cucciolo = nessun messaggio)",
  "ambasciatore x bardo: si, ok (notte saltata, nessun messaggio)",
  "addolorata x veggente-mannaro: si, ok (scambio con il VM bruciato, passo cambia titolare)",
  "addolorata x pastore: si, ok (belati dal nuovo lupo vicino)",
  "addolorata x lupo-mannaro: si, ok (entra nel branco)",
  "addolorata x nano: si, ok (diventa Nano, morso senza effetto)",
  "alchimista x veggente: si, ok (trascina il Veggente accecato)",
  "alchimista x ladro: si, ok (trascina il Ladro-lupo)",
  "alchimista x mucca-mannara: si, ok (Mucca innamorata, crepacuore del lupo)",
  "alchimista x villico: si, ok",
  "berserker x fantasma-onnisciente: si, ok (Fantasma al Berserker bruciato, nessun effetto)",
  "berserker x cortigiana: parziale, ok",
  "berserker x scemo-del-villaggio: parziale, ok",
  "boia x figlia-dei-lupi: si, ok (giustizia la Figlia gia' Lupo)",
  "boia x pastore: parziale, ok",
  "boia x chupacabra: si, ok",
  "bardo x innocente: parziale, ok",
  "bardo x paladino: parziale, ok",
  "bardo x nonna: si, ok (rogo della Nonna e notte saltata, vittoria Villaggio)",
  "bardo x strega: parziale, ok",
  "borgomastro x polpo-mannaro: si, ok (Polpo eletto, avviso alla morte)",
  "borgomastro x maga: si, ok (Borgomastro trasformato)",
  "borgomastro x eremita: parziale, ok",
  "borgomastro x nano: si, ok (Nano Borgomastro immune al morso)",
  "cavaliere x villico: si, ok (si immola per un Villico)",
  "cortigiana x lantico: si, dubbio (Cortigiana resta morta con l'Antico che sopravvive: DUBBI 1)",
  "cortigiana x suocera: si, ok",
  "cortigiana x scemo-del-villaggio: parziale, ok",
  "criceto-malvagio x guardia: si, ok (ruba la vittoria anche con Guardia Mannara viva)",
  "criceto-malvagio x cucciolo-di-lupo-mannaro: si, ok (vendetta: Criceto inattaccabile)",
  "criceto-malvagio x fantasma-onnisciente: si, ok (Fantasma al Criceto bruciato)",
  "criceto-malvagio x scemo-del-villaggio: parziale, ok",
  "cucciolo-di-lupo-mannaro x guardia-mannara: si, ok (la morte della Mannara non fa maturare il Cucciolo)",
  "cucciolo-di-lupo-mannaro x inquisitore: si, ok (aura malvagia)",
  "cucciolo-di-lupo-mannaro x veggente: si, ok",
  "cucciolo-di-lupo-mannaro x fantasma-onnisciente: si, ok",
  "cucciolo-di-lupo-mannaro x suocera: si, ok (Suocera vittima della vendetta)",
  "cucciolo-di-lupo-mannaro x nano: si, ok (vittima immune, bite sprecato: DUBBI 4)",
  "eremita x figlia-dei-lupi: parziale, ok",
  "eremita x lupo-mannaro-progenitore: parziale, ok",
  "eremita x pastore: parziale, ok",
  "eremita x strega: si, ok (pozione mortale sull'Eremita)",
  "eremita x nonna: si, ok (Veggente: Eremita malvagio, Nonna benevola)",
  "fantasma-onnisciente x pifferaio: si, ok (il Fantasma non e' ipnotizzabile)",
  "fattucchiera x innocente: si, ok (inibito, si rivela comunque)",
  "figlia-dei-lupi x gallo-mannaro: parziale, ok",
  "figlia-dei-lupi x guardia-mannara: si, ok (genitore Guardia, diventa Lupo al rogo)",
  "figlia-dei-lupi x lupo-mannaro-capobranco: si, ok",
  "figlia-dei-lupi x lupo-mannaro-progenitore: si, ok (genitore Progenitore bruciato)",
  "gallo-mannaro x guardia-mannara: parziale, ok",
  "gallo-mannaro x suocera: parziale, ok",
  "guardia x nonna: parziale, ok",
  "guardia x mezzosangue: parziale, ok",
  "guardia x spilungone: parziale, ok",
  "guardia x untore: si, ok (l'unzione passa alla Guardia vicina)",
  "guardia-mannara x lupo-mannaro-progenitore: si, ok (Progenitore trasforma una Guardia, restano gli altri colleghi)",
  "guardia-mannara x nano: parziale, ok",
  "guaritore x suocera: si, ok (resuscitata non conta in vita)",
  "innocente x lupo-mannaro-progenitore: si, dubbio (carta originale persa: DUBBI 2)",
  "innocente x nonna: parziale, ok",
  "innocente x spilungone: parziale, ok",
  "innocente x strega: parziale, ok",
  "inquisitore x ladro: si, ok (aura malvagia del Ladro-lupo)",
  "ladro x nano: si, ok (Ladro-Nano immune)",
  "ladro x pastore: si, ok (Ladro-lupo fa belare le pecore)",
  "ladro x spilungone: si, ok (UX 2 sull'etichetta del rogo)",
  "lantico x lupo-mannaro-progenitore: si, ok (Antico trasformato in lupo, nessun Antico residuo)",
  "lantico x mucca-mannara: parziale, ok",
  "lantico x nano: parziale, ok",
  "lupo-mannaro-capobranco x pastore: si, ok (belati)",
  "lupo-mannaro-capobranco x spilungone: parziale, ok",
  "lupo-mannaro-progenitore x sacerdote: si, ok (innamorata trasformata viva, il legame resta)",
  "mezzosangue x untore: si, ok (Mezzosangue unto, muore, unzione ai vicini)",
  "mucca-mannara x pifferaio: si, ok",
  "mucca-mannara x sacerdote: si, ok (innamorata, crepacuore)",
  "medium x sacerdote: si, ok (carta mostrata Ubriaco innamorato)",
  "nonna x pifferaio: si, ok",
  "pastore x villico: si, ok (nessun belato con vicini non lupi)",
  "polpo-mannaro x villico: parziale, ok",
  "sacerdote x ubriaco: si, ok",
  "sacerdote x untore: si, ok (Sacerdote unto)",
  "sacerdote x villico: si, ok",
  "scemo-del-villaggio x spilungone: parziale, ok",
  "spilungone x suocera: parziale, ok",
  "suocera x veggente: si, ok (aura benevola)"
]
```

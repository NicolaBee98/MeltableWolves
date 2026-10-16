# Verifica in browser del commit aee5f52 + casi non coperti + salvataggi vecchi (2026-10-16, e)

Chromium reale (Playwright, 390x844, dev server porta 5635, codice a aee5f52). Nessuna modifica a `src/` né ai docs esistenti. Partite giocate dalla UI; localStorage usato solo per partire da setup banali (numero giocatori, mazzo, assegnazione dell'Antico che non ha un passo) e per la parte C (salvataggi vecchi). Console: nessun errore/warning in tutti gli scenari; nessun overflow orizzontale (assegnazione, branco con trasformazione, alba, Eventi speciali, voto, esito).

## (A) Verifica delle correzioni di aee5f52

### ok
1. **Progenitore inibito**: Fattucchiera inibisce il Progenitore (round 1, con un Lupo semplice): dopo il morso su una chip non compare "Il Progenitore trasforma ..."; senza inibizione compare. Capobranco unico lupo inibito: "Tutti i lupi vivi sono inibiti ...: il branco non può sbranare", nessuna chip, "È giorno" disponibile; dopo refresh uguale.
2. **Vendetta del Cucciolo** (marcatore numerico):
   - Cucciolo ucciso dalla Strega la notte 1: stessa notte una sola vittima (nessun avviso di vendetta), notte 2 "vittima 1 di 2" e due morsi; refresh a metà ok; Indietro a metà notte 2 azzera i due morsi, ripristina la vendetta (`vendettaCucciolo=1`) e lascia i due bersagli vivi.
   - Cucciolo sbranato dal branco la notte 1: avviso "la prossima notte il branco sbranerà due persone"; stessa notte nessun secondo morso; refresh ok; notte 2 due vittime.
   - Cucciolo al rogo (marcatore `true`): notte 2 due vittime.
   - Slitta col Bardo: morte notte 1, rogo con "Il Bardo salta la notte", notte 2 saltata, notte 3 "vittima 1 di 2" (notte 2 alba "Nessuno è morto").
   - Persa con l'Ubriaco: Cucciolo ucciso notte 1 e Ubriaco sbranato nella stessa notte: notte 2 branco stordito (`vendettaCucciolo=false`), notte 3 una vittima sola.
   - Sprecata su Nano/Criceto: con vendetta attiva, morso su Nano => "il Nano non può essere sbranato" e subito "vittima 2 di 2"; Criceto come secondo morso => "già sbranato le sue vittime"; sostituire il secondo con un villico lo uccide, il primo morso resta sprecato. Coerente con la decisione.
3. **Apprendista erede dell'Inquisitore**: l'Inquisitore interroga un benevolo e perde il potere, muore sbranato; all'alba l'Apprendista eredita, `poteriUsati=[]`, la notte dopo ha "Chi interrogare" attivo; Diario coerente ("perde il potere" per G02, poi G03 interroga e perde il suo).
4. **Avviso Cortigiana col Progenitore**: cliente morso -> "entrambi moriranno"; dopo "Il Progenitore trasforma ..." -> "morirà comunque, perché i lupi hanno visitato quella casa"; stesso avviso dopo refresh; "Sbrana normalmente" lo riporta all'avviso del morso. Cortigiana muore con "il suo cliente G05 era un lupo".
5. **Chip senza Fantasma/Borgomastro/Cartomante**: Mimo ("Che carta ha davvero ...": Lupo Mannaro, Medium, Veggente, Villico, con Fantasma e Cartomante nel mazzo) e Cartomante su "?" (Medium, Veggente, Villico) non propongono Fantasma/Borgomastro/Cartomante/Mimo. Medium su un morto "?" idem (non riprovato separatamente, stesso componente).
6. **Cartomante/Medium su trasformato dal Progenitore con carta ignota** (mazzo con Boia/Alchimista non assegnati): chiede "è stato trasformato dal Progenitore: la sua carta originale è ancora sconosciuta"; scelta salva `cartaOriginale` (il giocatore resta `lupo-mannaro`); cambio scelta ok; "Annulla (cambia bersaglio)" azzera `cartaOriginale`; refresh a carta scelta: mostra "Mostra a Cartomante la carta: Boia"; Indietro dopo refresh e Avanti+Indietro azzerano la scelta; la carta scelta non è più proponibile per altri "?" (Alchimista, Villico). Medium su trasformato morto al rogo: stessa cosa. Con carta nota (Cartomante ha visto "Villico" prima della trasformazione) mostra "Villico" senza chiedere.
7. **Mucca non inibibile**: round 1 e round 2 avviso "Non può inibire Mucca Mannara: non può essere inibita", nessuna condizione scritta, ok dopo refresh.
8. **Antico di crepacuore**: coppia Antico + altro (Sacerdote). Partner sbranato di notte: all'alba "G04 si è rivelato: è L'Antico, ha perso la prima vita ma sopravvive" (con conferma), partner resta morto; Diario ok. Partner al rogo di giorno: rivelazione "perde la prima vita e sopravvive", partner resta morto, notte successiva "maledetto" (vedi DUBBIO 2).
9. **Diario**: Cortigiana una voce sola nei casi cliente visitato (Antico: "è stato visitato dai lupi"), Mezzosangue sbranato ("era un lupo") e Chupacabra su lupo cliente ("era un lupo"); Ladro con Avanti senza scelta "Il Ladro G01 resta Villico"; Ladro che sceglie Innocente: "sceglie Innocente: scarta Boia", poi "Alba: G01 si è rivelato/a: è Innocente" dopo la voce del Ladro; Suocera rivelata all'alba dopo "Ladro resta Villico" nell'ordine giusto; Boia/Spilungone/Alchimista offerti negli Eventi speciali (Boia e Innocente non offerti se scartati dal Ladro; non completati fino in fondo Boia/Alchimista/Spilungone, vedi NON COPERTO). Strega: "usa la pozione mortale su G01" e "usa la pozione vitale su G05" con bersaglio.

## BUG CERTI
1. **Vendetta del Cucciolo azzerata dal branco stordito nella stessa notte in cui il Cucciolo muore.**
   Passi: mazzo Strega, Cucciolo, Lupo, Ubriaco, 4 Villici (8 giocatori). Notte 1: il branco sbrana l'Ubriaco. Rogo di un villico. Notte 2: la Strega uccide il Cucciolo (marcatore `vendettaCucciolo=2` sul Lupo), poi al passo Branco compare "il branco è ancora stordito". Stato: `vendettaCucciolo=false` sul Lupo. Notte 3: il branco sbrana UNA sola vittima, senza il banner di vendetta (atteso: due, perché il Cucciolo è morto nella notte 2 e la vendetta slitta alla notte 3; lo stordimento blocca solo la caccia della notte 2).
   Causa: `src/features/notte/azioni/AzioneBrancoLupi.jsx:172`: l'effetto sullo stordimento azzera ogni `vendettaCucciolo` truthy, compreso il marcatore appena scritto per la notte corrente (`2`), non solo quello già attivo (`vendettaAttivaIn(g, round)`). Rimedio: filtrare con `vendettaAttivaIn(g, round)`. Stesso schema, ma non riproducibile con un solo Cucciolo, nelle righe 192 e 299 (azzerano `vendettaCucciolo` di tutti i lupi senza controllare il marcatore).

## DUBBI
1. **Popup e tasto Indietro del telefono**: con "Diario e impostazioni" o "Eventi speciali" aperti, `page.goBack()` non fa nulla e non chiude il popup (resta nella fase, come deciso, ma l'utente Android si aspetta di chiudere il popup). Proposta: se c'è un popup aperto, il Back lo chiude.
2. **Crepacuore dell'Antico di giorno (partner al rogo)**: la notte dopo il villaggio è "maledetto dall'Antico" come per la prima vita persa al rogo. Il regolamento dice maledizione solo se perde la prima vita al rogo; qui la perde per il partner morto al rogo. Probabilmente voluto (la rivelazione diurna), ma da confermare.
3. **Vendetta persa con l'Ubriaco senza traccia**: nessun avviso a schermo né voce nel Diario che la vendetta è stata annullata; il narratore vede solo "il branco è stordito". Proposta: una riga nel Diario/avviso.
4. **Indietro dopo refresh sull'ultimo passo**: resta disabilitato (anche con branco inibito), già accettato nei report precedenti; qui riconfermato.
5. **Indietro dal passo di Strega/ruolo appena assegnato**: oltre ad annullare la scelta azzera anche l'assegnazione del titolare ("Seleziona 1 giocatore in più"): comportamento noto.

## (B) Casi non coperti prima
- **Ladro/Addolorata/Apprendista davanti a Cartomante e Medium**: ok. Ladro che prende Innocente: Cartomante su di lui "Innocente", Medium su di lui morto "Innocente". Addolorata che scambia con la vittima del rogo (Veggente): Cartomante su Addolorata "Veggente", Medium sulla vittima "Addolorata". Apprendista erede di Veggente: Cartomante su di lui "Veggente"; Medium sul maestro "Veggente".
- **Mimo davanti a Cartomante e Medium**: ok. Mimo che copia il Veggente: Cartomante "Mimo", Medium sul Mimo morto "Mimo". Il Veggente "vero" (target) è già assegnato dalla scelta del Mimo: il suo passo non va ricliccato.
- **Fantasma Onnisciente con Mucca, Veggente, Veggente Mannaro, Guardia**: assegnato al rogo, `eFantasmaOnnisciente=true`, ruolo conservato. Veggente e Veggente Mannaro morti: solo promemoria "Chiama comunque G02" (nessuna azione). Mucca e Guardia morte: nessun passo. Il branco non viene toccato. Ok.
- **Bardo con Mucca, Criceto e Borgomastro**: ok. Morso sul Criceto senza effetto, Borgomastro eletto e arso, Bardo salta la notte, alba 2 chiede un nuovo Borgomastro; Diario "G05 era il Borgomastro", "G04 fa saltare la notte".
- **Criceto con Innocente**: ok, le chip dell'Innocente escludono Criceto e lupi noti.
- **Guaritore con `visitatoDaiLupi`**: Cortigiana morta notte 1 per cliente sbranato; notte 2 il Guaritore la resuscita: resta viva (il marcatore del round 1 non la riuccide). Resuscitando invece il cliente (marcatore 1 residuo): torna in vita, la Cortigiana resta morta. Diario ok.
- **Pozione vitale**: protegge il bersaglio ("Il morso non ha effetto su G05: è protetto/a"), la Cortigiana cliente muore comunque con avviso (coerente con la decisione), refresh ok; Diario con bersaglio; Indietro dal branco ripulisce `visitatoDaiLupi`.
- **Tasto Indietro del telefono (goBack)**: in assegnazione, passo con scelta pendente (Cartomante con carta in sospeso), branco con morso, alba, Eventi speciali (popup resta aperto, vedi DUBBIO 1), Diario (idem), voto, esito, rogo dichiarato: sempre nella stessa schermata, stato invariato, `history.length` costante (3), anche dopo reload a metà notte e con tre Back di fila.

## (C) Salvataggi vecchi
Iniettati in localStorage: mazzo con `borgomastro:1`, giocatori senza `sceltaNotte`/`visitatoDaiLupi`/`cartaOriginale`/`scambioAddolorata`, un giocatore con `ruoloSlug: 'borgomastro'` e storia `['borgomastro']`, `vendettaCucciolo: true` sul lupo con Cucciolo morto (`mortoNotte:1`, senza `mortoGiorno`), `ultimaIndagine` senza `esito` (Veggente, Inquisitore, Cartomante, Medium), `notte` `{round:2, stepIndex:0}` senza `ingresso`, nessun `log-confermati`. L'app carica, mostra la notte 2 e prosegue passo per passo: vendetta attiva con due vittime (il `true` vale sempre), morti e Cortigiana nel Diario, alba, voto. Nessun errore in console. Il Borgomastro nel mazzo viene scartato; il giocatore con carta `borgomastro` è trattato come un giocatore qualsiasi senza crash. Veggente con `ultimaIndagine` senza `esito`: nessuna selezione mostrata, nessun crash. Unica nota: un salvataggio vecchio salvato a metà della notte della morte del Cucciolo applicherebbe la vendetta nella stessa notte (semantica vecchia), accettabile.

## NON COPERTO
- Boia, Alchimista e Spilungone completati fino all'ultimo passo (offerti negli Eventi speciali e nell'esito, ma non portati a termine con Diario).
- Spilungone/Alchimista/Suocera con il Ladro in notti successive; Medium su "?" con Fantasma non riprovato separatamente dopo le chip.
- Salvataggi vecchi: nessun test di `scambioAddolorata`/`cartaOriginale` assenti nel mezzo di un passo Addolorata/Cartomante già commesso; nessun salvataggio con Diario scritto da versioni precedenti.
- Dark mode, contrasto, tap target; solo overflow orizzontale controllato.
- Nota di metodo: lo scratchpad era condiviso con altri agenti (alcuni file `m/` sono stati sovrascritti); i risultati sopra vengono dagli script rieseguiti in una cartella propria.

## Coppie (JSON-friendly)
progenitore x fattucchiera: si, inibito non trasforma e Capobranco unico inibito non caccia
lupo-mannaro-capobranco x fattucchiera: si, caccia inibita se unico lupo
cucciolo-di-lupo-mannaro x ubriaco: parziale, vendetta persa ok ma BUG azzerata anche se il Cucciolo muore nella notte dello stordimento
cucciolo-di-lupo-mannaro x bardo: si, vendetta slitta di una notte
cucciolo-di-lupo-mannaro x nano: si, vendetta consumata sul morso senza effetto
cucciolo-di-lupo-mannaro x criceto-malvagio: si, vendetta consumata sul morso senza effetto
cucciolo-di-lupo-mannaro x strega: si, morte notturna e vendetta dalla notte dopo, Indietro la ripristina
apprendista x inquisitore: si, erede riparte da zero
cortigiana x lupo-mannaro-progenitore: si, avviso "morirà comunque" con la trasformazione, voce unica nel Diario
cortigiana x chupacabra: si, voce unica nel Diario
cortigiana x mezzosangue: si, voce unica nel Diario
cortigiana x lantico: si, voce unica nel Diario
cortigiana x guaritore: si, resuscitata non muore di nuovo per il marcatore del round precedente
cortigiana x strega: si, pozione vitale sul cliente non salva la Cortigiana, avviso ok
cartomante x lupo-mannaro-progenitore: si, carta originale ignota scelta dal narratore (annulla, cambia, refresh, Indietro), carta nota mostrata
medium x lupo-mannaro-progenitore: si, stessa gestione su trasformato morto
cartomante x mimo: si, mostra Mimo
medium x mimo: si, mostra Mimo
cartomante x ladro: si, mostra la carta presa
medium x ladro: si, mostra la carta presa
cartomante x addolorata: si, mostra la carta presa
medium x addolorata: si, la vittima scambiata mostra Addolorata
cartomante x apprendista: si, mostra la carta presa
medium x apprendista: si, maestro mostra la sua carta
mimo x fantasma-onnisciente: si, Fantasma non proponibile al Mimo
cartomante x fantasma-onnisciente: si, Fantasma non proponibile
medium x fantasma-onnisciente: si, Fantasma non proponibile
fattucchiera x mucca-mannara: si, avviso non bloccante, nessuna condizione
lantico x sacerdote: si, crepacuore: si rivela e sopravvive, partner morto resta morto (notte e giorno), notte maledetta dopo il rogo del partner (dubbio)
ladro x innocente: si, rivelazione dopo Ladro nel Diario
ladro x boia: si, scartato non offerto, altrimenti offerto
ladro x suocera: si, rivelazione all'alba dopo la voce del Ladro
fantasma-onnisciente x mucca-mannara: si, nessun passo per la morta
fantasma-onnisciente x veggente: si, solo promemoria
fantasma-onnisciente x veggente-mannaro: si, solo promemoria
fantasma-onnisciente x guardia: si, nessun passo
bardo x mucca-mannara: si
bardo x criceto-malvagio: si
bardo x borgomastro: si, Borgomastro arso, nuova elezione dopo la notte saltata
criceto-malvagio x innocente: si, chip Innocente senza Criceto
guaritore x cortigiana: si, vedi sopra
strega x cortigiana: si, vedi sopra
strega x mezzosangue: no, non provata

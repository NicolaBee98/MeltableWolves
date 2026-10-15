# Batch di partite del 2026-10-15 (a): coppie ancora senza evidenza "si" nella matrice (elenco coppie2-0)

Chromium reale (Playwright, 390x844, dev server porta 5611, codice a 7543ddb), nessuna modifica al codice. Mazzo, giocatori, assegnazione ruoli, notti, alba, voto, rogo ed eventi speciali giocati dalla UI (nessuna scorciatoia su localStorage; ogni passo e' una nuova apertura del browser sulla stessa partita, quindi ricarica a meta' passo verificata di continuo). 14 partite: 8 grandi (12-15 giocatori, 2-5 notti, scelte in modo da far stare insieme tutte le 153 coppie dell'elenco) e 6 mini (5-12 giocatori) per isolare casi puntuali. Console: nessun errore ne' warning nelle partite controllate. Nessun overflow orizzontale visto, nessun softlock.

Elenco di partenza: 153 coppie. Tutte e 153 sono state giocate con i due ruoli presenti nella stessa partita; **77 con interazione reale provata**, 76 senza interazione possibile per regolamento (ruoli passivi tra loro o poteri che non possono toccarsi) lasciate come "parziale" (presenti insieme, nessuna anomalia). Le decisioni gia' prese (brief) non sono riproposte.

## BUG CERTI
1. **Un Progenitore inibito dalla Fattucchiera puo' ancora trasformare la vittima.** Riprodotto due volte (P5 notte 3, P9 notte 1): la Fattucchiera inibisce il Progenitore (il Diario scrive "G09 ha ottenuto la condizione inibito"), il branco ha altri lupi non inibiti quindi il passo Branco resta attivo, ma scegliendo una vittima compare comunque "Il Progenitore trasforma G07 in Lupo Mannaro" (non ho premuto il pulsante: basta che sia offerto). Causa: `NightSequencer.jsx` (circa riga 627) blocca il branco solo se TUTTI i titolari vivi sono inibiti, e `AzioneBrancoLupi.jsx` non guarda `inibito` quando costruisce `trasformabili`. Proposta: passare al componente l'id dei lupi inibiti e togliere il pulsante del Progenitore (anche del Mimo che lo copia) se il Progenitore e' inibito (con riga "Il Progenitore e' inibito: non puo' trasformare"); i lupi inibiti restano comunque conteggiabili come bersagli. Test da aggiungere in `AzioneBrancoLupi.test.jsx`.

## DUBBI (con proposta)
1. **La vendetta del Cucciolo scatta nella stessa notte se il Cucciolo muore prima o durante il passo Branco.** La decisione e' "la vendetta si attua la notte dopo", ma: (P9 notte 1) la Strega avvelena il Cucciolo, che nel passo Branco compare tra i Morti e il branco mostra subito "Vendetta del Cucciolo: il branco sbrana due vittime questa notte (vittima 1 di 2)", scelte entrambe le vittime muoiono nella stessa alba; (P2 notte 3) il branco sbrana il Cucciolo come prima vittima e subito compare "(vittima 2 di 2)" e si potrebbe scegliere una seconda vittima (non ho scelto: la vendetta e' rimasta attiva e si e' consumata alla notte 5 in P2, anche dopo una notte senza vittima). In gioco fisico i lupi non sanno ancora che il Cucciolo e' morto fino all'alba (stessa logica della decisione "ogni morto di notte si scopre all'alba"). Proposta: se il Cucciolo muore nella notte in corso, attivare la vendetta dalla notte successiva (flag con round), come per il rogo.
2. **Inibizione della Fattucchiera sui ruoli passivi non e' segnalata.** Inibire Nano, Spilungone, Mucca, Eremita (P3, P5, P9) non mostra avvisi: e' un'azione inutile, ma innocua (gli avvisi esistono solo per i ruoli diurni e di prima notte con scelta, `NON_INIBIBILI` in `azioni/index.js`). Proposta: lasciare (cosmetico).
3. **La Fattucchiera non puo' inibire nella stessa notte la Mucca, ma il passo Mucca precede quello della Fattucchiera** (P5 notte 1, passi 8 e 9): l'inibizione sulla Mucca non ha alcun effetto, in linea con "la Mucca agisce solo la prima notte", ma l'ordine dei passi e' la vera ragione. Nessuna azione, solo da sapere.
4. **Aura del Veggente Mannaro / della Mucca / della Guardia Mannara: benevola** (`aura.js`: malvagi solo i 5 ruoli lupo + Chupacabra + Eremita). Coerente con "i lupi sono 5 ruoli"; segnalato solo perche' l'Inquisitore che indaga una Mucca o un VM perde il potere. Nessuna azione.

## SCENARI (riassunto delle partite, dal registro di gioco)
### Partita 1 (13 giocatori, 4 notti): Pastore G01, Progenitore G02, Veggente G03, Medium G04, Inquisitore G05, Paladino G06, Ubriaco G07, Nano G08, Scemo G09, Mucca G10, Criceto G11, Ambasciatore G12(Borgomastro), Villico G13
N1 branco sbrana Ubriaco; alba: belati (Pastore accanto al Progenitore). Giorno1: Borgomastro G12, rima sbagliata Scemo, rogo Criceto.
N2: Paladino protegge G13; Inquisitore indaga Medium (benevola) -> N3/N4 'ha perso il potere'; Medium su Scemo mostra carta Scemo; Veggente su Progenitore malvagia (no messaggio); branco 'ancora stordito dall'alcol dell'Ubriaco' (Progenitore unico lupo).
Giorno2: rogo Nano. N3: Paladino protegge G13, Progenitore trasforma G13 'anche se protetto' -> alba 'Nessuno è morto', belati (G13 vicino del Pastore, lupo); Veggente su Mucca 'aura benevola' -> alba 'messaggio dall'ambasciatore'; Medium su Nano -> carta Nano.
Giorno3 rogo Mucca. N4: Medium su Criceto ok; Veggente su G13 trasformato 'malvagia'; Paladino protegge Pastore, morso senza effetto, belati.

### Partita 2 (13 giocatori, 5 notti): Capobranco G01, Cucciolo G02, VeggenteMannaro G03, Mucca G04, Maga G05, Strega G06, Alchimista G07, Mezzosangue G08, Spilungone G09, Suocera G10, Ambasciatore G11, Guardie G12 G13 + Fantasma in mazzo
N1: Maga trasforma Mezzosangue; VM indaga Ambasciatore (benevola): alba nessun messaggio ambasciatore (vivo) -> solo Veggente; branco sbrana Suocera ignota -> morta, evento Suocera. Borgomastro Spilungone. Rogo Alchimista G07 -> esplosione su VM; Fantasma a Alchimista.
N2: Maga trasforma Spilungone (Borgomastro) + Strega pozione mortale su Spilungone -> muore, rielezione; branco sbrana Mezzosangue trasformato(maiale): diventa Lupo (Diario ok). VM morto chiamato 'comunque' (promemoria).
N3: Strega vitale (protegge Guardia G12 - rimpiazza scelta su G02 perche' un solo gruppo chip); branco sbrana il Cucciolo (Capobranco/Cucciolo/Mezzo-lupo): Cucciolo muore e subito il passo mostra 'Vendetta... questa notte (vittima 2 di 2)' dopo il primo morso (la notte stessa), ma poi la vendetta e' ancora attiva in N4 'vittima 1 di 2' (non consumata). [DUBBIO: testo/stato incoerente con 'vendetta la notte dopo'; da riprodurre]
N4: nessuna vittima scelta (alba 'Nessuno è morto'); N5 vendetta 'vittima 1 di 2' ancora attiva, scelta 2 vittime -> vittoria lupi all'alba 5 (Mucca morta).
Il Diario non registra VM (morto), ok.

### Partita 3 (14 giocatori, 3 notti): Berserker G01, Nonna G02, Polpo G03, Eremita G04, Fattucchiera G05, Cavaliere G06, Boia G07, Nano G08, Spilungone G09, Suocera G10, Guardie G11 G12 + GuardiaMannara G13, Villico G14
N1: Cavaliere lega Polpo; Fattucchiera inibisce Nonna (unico lupo cacciatore): 'Tutti i lupi vivi sono inibiti... il branco non può sbranare'. Borgomastro Suocera (ignota). Rogo Polpo -> 'Il Cavaliere G06 protegge G03: si immola' (G03 sopravvive).
N2: Fattucchiera inibisce Nano; branco sbrana Suocera-Borgomastro: alba muore, evento Suocera, rielezione richiesta; elezione Eremita. Boia giustizia Villico G14 (evento a due passi: attore, Conferma, bersaglio). Rogo Eremita (Borgomastro) .
N3: Fattucchiera inibisce Spilungone; Berserker sbranato: avviso 'G02 (lupo piu vicino) morira'; alba: muoiono Berserker+Nonna -> 'Non ci sono più Lupi Mannari in vita: vince il Villaggio' con Polpo e Guardia Mannara ancora vivi (coerente con 5 ruoli).

### Partita 4 (13 giocatori, 3 notti): Untore G01, Lupo G02, Gallo G03, Polpo G04, Veggente G05, Cartomante G06, Guaritore G07, Paladino G08, Sacerdote G09, Ubriaco G10, Pifferaio G11, Apprendista G12, Addolorata G13
N1: Sacerdote lega Veggente+Ubriaco; Apprendista maestro=Untore; Paladino protegge Polpo; Untore unge Polpo; Cartomante su Sacerdote 'Mostra la carta: Sacerdote'; Pifferaio ipnotizza Untore+Veggente; Veggente indaga Lupo (malvagia); branco sbrana Veggente -> Ubriaco muore di crepacuore (non sbranato: nessuno stordimento visto in N2 - il Paladino e' stato sbranato normalmente). Passo 'Ipnotizzati' mostra morti.
Rogo Untore: 'L'Apprendista G12 ha ereditato il suo ruolo' (Untore). N2: Addolorata 'La carta di G01 (Untore) è già stata presa da un Apprendista: nessuno scambio possibile'. Guaritore resuscita Ubriaco (partner Veggente resta morto, nessuna nuova morte). Branco sbrana Paladino ipnotizzato. Cartomante su Lupo.
Gallo salta il giorno 2: l'unzione di G11 non e' piu' tra i candidati all'unzione in N3 (solo G09, unto in N3). N3: Cartomante su Ubriaco 'carta: Ubriaco'; Guaritore 'Potere già utilizzato'.
Day3 unzione su G09 (Sacerdote) + rogo Gallo: da verificare esito.
N4: Addolorata avanti; unzione G09 'passa ai due vicini vivi G07 e G10'; rogo Gallo. N4: Untore(Apprendista) sbranato nella stessa notte in cui ha unto: unzione annunciata comunque. Rogo Ubriaco: N5 Addolorata 'Scambia' -> diventa Ubriaco; branco sbrana G13: avviso 'G13 è l'Ubriaco: il branco sarà stordito'. N5 Pifferaio ipnotizza l'ultimo: alba 5 'Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui' (con Lupo e Polpo vivi ipnotizzati).

### Partita 5 (12 giocatori, 3 notti): Bardo G01, Chupacabra G02, Fattucchiera G03, Guardie G04 G05 + GM G06, Innocente G07, Ladro G08 (extra: Criceto, Nonna; sceglie Nonna), Progenitore G09, Mezzosangue G10, Mucca G11, Sciacallo G12
N1: Ladro 'sceglie Nonna: scarta Criceto' -> Mucca mostra 'Lupi mannari: G08, G09' (Nonna del Ladro inclusa); Chupacabra su GM: 'G06 non è un lupo: la caccia fallisce'; branco morde Mezzosangue -> lupo (opzione Progenitore trasforma proposta comunque); Fattucchiera inibisce Mucca ma Mucca agisce prima (passo 8) della Fattucchiera (passo 9): nessun effetto. Giorno 1: Borgomastro Sciacallo; voto su Innocente: 'Si rivela Innocente' -> rogo ancora dichiarabile ('Torna al voto'), poi rogo Mucca; evento Bardo -> N2 saltata ('Questa notte non si svolge...'), Chupacabra non caccia.
N3: Fattucchiera inibisce Progenitore G09 (Diario: G09 ha ottenuto 'inibito'), Sciacallo resuscita Mucca, branco: il pulsante 'Il Progenitore trasforma G07' e' comunque offerto con Progenitore inibito [BUG probabile: AzioneBrancoLupi non guarda 'inibito']; Chupacabra caccia Ladro-Nonna: muore (alba). Branco sbrana Innocente.

### Partita 6 (12 giocatori, 3 notti): Berserker G01, Lupo G02, Capobranco G03, Figlia G04 (genitore Untore G06), Strega G05, Untore G06, Inquisitore G07, Veggente G08, Cavaliere G09 (protegge Veggente), Boia G10, Innocente G11, Villico G12 + Fantasma
N1: Inquisitore e Veggente su Figlia (benevola); Strega pozione mortale sul genitore Untore -> alba 'G04 è la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro'; unzione annunciata anche con Untore avvelenato; branco morde Veggente -> 'Il Cavaliere si immola al posto di G08' (avviso nel passo e all'alba). Rogo Figlia (lupo): promemoria 'Assegna la carta del Fantasma' -> Fantasma a G04.
N2: Inquisitore 'ha perso il potere'; Veggente su Capobranco malvagia; Capobranco sbrana il Lupo G02 (fratello): morto. Boia giustizia Capobranco.

### Partita 7 (15 giocatori, 4 notti): Lupo G01, Gallo G02, Guardie G03 G04 + GM G05, Antico G06, Eremita G07, Ambasciatore G08, Cortigiana G09, Mezzosangue G10, Nano G11, Scemo G12, Sciacallo G13, Ubriaco G14, VeggenteMannaro G15
N1: Cortigiana visita Nano e il branco morde il Nano (nessun effetto): avviso 'A casa di G11 c'è anche la Cortigiana: morirà comunque' -> Cortigiana muore all'alba (come da decisione). VM indaga Eremita 'Aura malvagia'. Borgomastro Ambasciatore; rogo Antico: 'Confermi: G06 è L'Antico?' -> notte 2 'maledetta': agiscono solo VM, Sciacallo, Branco; VM indaga Ambasciatore: nessun messaggio (solo Veggente). Sciacallo resuscita Cortigiana; branco sbrana Ubriaco -> avviso stordimento; N3 'ancora stordito'. Rogo Eremita. Gallo salta il giorno 3. N4: Cortigiana visita Mezzosangue, branco lo morde: avviso 'morirà comunque'; alba: Cortigiana morta e Mezzosangue diventa lupo.

### Partita 8 (14 giocatori, 3 notti): Pastore G01, Lupo G02, Maga G03, Bardo G04, Cartomante G05, Cavaliere G06 (protegge Pastore), Pifferaio G07, Spilungone G08, Ambasciatore G09, Addolorata G10, Criceto G11, Nano G12, Strega G13, VM G14
N1: Maga trasforma Pastore, Pifferaio ipnotizza Spilungone+Pastore, Cartomante su Criceto 'carta: Criceto Malvagio', branco morde Pastore -> 'Il Cavaliere si immola' (muore Cavaliere, Pastore salvo), alba: belati comunque (Pastore trasformato in maiale, lupo vicino). Rogo Ambasciatore; N2 Addolorata scambia (diventa Ambasciatore); Maga su Spilungone; Pifferaio ipnotizza altri 2.
Rogo Nano; Bardo: N3 saltata.

### Partita 9 (10 giocatori, 2 notti, mini): Capobranco G01, Cucciolo G02, Progenitore G03, Mucca G04, Strega G05, Fattucchiera G06, Veggente G07, Inquisitore G08, Villici G09 G10 + Fantasma
N1: (errore mio di indice) Strega pozione MORTALE sul Cucciolo: il Cucciolo muore di notte PRIMA del passo Branco e il branco ha subito 'Vendetta del Cucciolo: due vittime questa notte (vittima 1 di 2)' [DUBBIO: vendetta lo stesso turno]; Fattucchiera inibisce Progenitore G03: nel passo Branco il pulsante 'Il Progenitore trasforma G07 in Lupo Mannaro' e' offerto comunque [BUG]. Veggente indaga Capobranco malvagia.
Rogo Inquisitore -> Fantasma a G08 (promemoria 'Assegna la carta'). N2: Fattucchiera su Mucca: nessun avviso visibile. Strega vitale su Capobranco: Capobranco puo' scegliersi come vittima: 'Il morso non ha effetto su G01: è protetto/a'.

### Partita 10 (7 giocatori, mini): Lupo G01, Cortigiana G02, VM G03, Scemo G04, Nano G05, Villici
N1: Cortigiana visita Scemo, branco sbrana Villico: Cortigiana viva. Rima sbagliata Scemo (muore). N2: Cortigiana visita VM (non e' lupo): viva; morso Nano senza effetto.

### Partita 11 (7 giocatori, mini): Boia G01, Berserker G02, Lupo G03, Fattucchiera G04, Nonna G05, Villici
N1: Fatt su G01 (Boia): nessun avviso (ruolo non assegnato); branco sbrana Villico. Borgomastro Nonna G05. Boia giustizia Berserker: muore solo lui (nessun lupo morto: il Berserker agisce solo se sbranato). Rogo Nonna-Borgomastro. N2 Fatt inibisce l'unico Lupo.

### Partita 12 (12 giocatori, 4 notti): Capobranco G01, Lupo G02, Boia G03, Strega G04, Medium G05, Ambasciatore G06, Criceto G07, Scemo G08, Ubriaco G09, Villici G10 G11, Veggente G12
N1: Strega vitale su Villico G11, branco (Capobranco) morde G11: 'Il morso non ha effetto: è protetto/a'; Veggente su Villico: messaggio ambasciatore. Scemo rima sbagliata, Boia giustizia Lupo, rogo Criceto. N2: Strega mortale su Villico G10 (muore), Veggente aveva indagato G10: messaggio ambasciatore lo stesso; Medium su Scemo 'carta Scemo'; branco sbrana Ubriaco -> avviso stordimento; N3 stordito; Medium su Ubriaco 'carta: Ubriaco'. N4 Medium su Villico.


## MATRICE DELLE COPPIE

### Coppie con interazione provata (77)

- figlia-dei-lupi x strega: P6: pozione mortale sul genitore -> Figlia diventa lupa
- lupo-mannaro-capobranco x strega: P9: pozione vitale su Capobranco, il morso (scelto da lui) non ha effetto
- berserker x boia: P11: Boia giustizia il Berserker, nessun lupo muore
- lupo-mannaro-capobranco x villico: P12: morso su Villico protetto
- boia x villico: P3: il Boia giustizia un Villico
- chupacabra x guardia-mannara: P5: caccia su GM fallisce (non e' un lupo)
- criceto-malvagio x ladro: P5: il Ladro scarta il Criceto tra le due carte
- fantasma-onnisciente x figlia-dei-lupi: P6: Fantasma assegnato alla Figlia-lupa bruciata
- nonna x suocera: P3: il branco con Nonna sbrana la Suocera ignota
- figlia-dei-lupi x untore: P6: genitore Untore
- borgomastro x sciacallo-mannaro: P5: Sciacallo Borgomastro, poi al rogo
- addolorata x untore: P4: carta Untore gia' presa dall'Apprendista: nessuno scambio
- addolorata x ubriaco: P4: scambio con l'Ubriaco al rogo, poi stordimento al morso
- boia x lupo-mannaro: P12: Boia giustizia il Lupo
- borgomastro x nonna: P11: Nonna Borgomastro al rogo, rielezione
- addolorata x ambasciatore: P8: scambia con l'Ambasciatore bruciato
- lupo-mannaro-capobranco x suocera: P2: Suocera sbranata
- lupo-mannaro-progenitore x villico: P1: trasforma un Villico protetto
- alchimista x veggente-mannaro: P2: esplosione sul VM
- borgomastro x mezzosangue: P5: Mezzosangue-lupo eletto Borgomastro
- pifferaio x spilungone: P8: Spilungone ipnotizzato
- ladro x nonna: P5: Ladro sceglie Nonna: Mucca la vede nel branco
- figlia-dei-lupi x inquisitore: P6: indagata (benevola)
- apprendista x untore: P4: eredita l'Untore dal maestro bruciato
- pastore x pifferaio: P8: Pastore ipnotizzato
- cartomante x lupo-mannaro: P4: mostra la carta Lupo Mannaro
- inquisitore x medium: P1: Inquisitore indaga il Medium, perde il potere
- strega x villico: P12: vitale e mortale su Villici
- boia x suocera: P13: Boia giustizia la Suocera ignota
- maga x mezzosangue: P2: Mezzosangue trasformato, poi sbranato diventa lupo
- paladino x villico: P1: Paladino protegge Villico
- guardia x strega: P2: pozione vitale sulla Guardia
- fantasma-onnisciente x inquisitore: P9: Fantasma all'Inquisitore bruciato
- paladino x pifferaio: P4: Paladino ipnotizzato, agisce regolarmente
- lupo-mannaro-progenitore x mezzosangue: P5: il morso sul Mezzosangue lo rende lupo
- guaritore x ubriaco: P4: resuscita l'Ubriaco
- fattucchiera x nano: P3: inibizione del Nano (nessun effetto)
- sacerdote x veggente: P4: Veggente sbranato, partner muore di crepacuore
- lupo-mannaro x lupo-mannaro-capobranco: P6: Capobranco sbrana il Lupo
- fattucchiera x nonna: P3: Nonna unico lupo inibita: branco bloccato
- maga x spilungone: P2: Spilungone trasformato (Borgomastro), poi avvelenato
- lupo-mannaro x untore: P4: Untore sbranato dopo aver unto
- maga x pastore: P8: Pastore trasformato, belati comunque
- paladino x pastore: P1: Paladino protegge il Pastore
- pifferaio x untore: P4: Untore ipnotizzato
- pifferaio x veggente: P4: Veggente ipnotizzato
- fattucchiera x lupo-mannaro-progenitore: P5/P9: BUG il Progenitore inibito puo' ancora trasformare
- paladino x polpo-mannaro: P4: Paladino protegge Polpo
- lupo-mannaro-progenitore x ubriaco: P1: il Progenitore (unico lupo) e' stordito
- cartomante x sacerdote: P4: mostra la carta Sacerdote
- cortigiana x scemo-del-villaggio: P10: visita Scemo, sopravvive
- ambasciatore x veggente-mannaro: P2/P7/P8: il VM indaga l'Ambasciatore (benevola): nessun messaggio all'alba (solo il Veggente)
- fattucchiera x mucca-mannara: P5: inibizione Mucca, passo precedente alla Fattucchiera
- cortigiana x mezzosangue: P7: cliente Mezzosangue morso: muore
- cavaliere x polpo-mannaro: P3: Cavaliere si immola al rogo per il Polpo
- mucca-mannara x sciacallo-mannaro: P5: Sciacallo resuscita la Mucca
- borgomastro x eremita: P3: Eremita Borgomastro al rogo
- ambasciatore x maga: P2: Ambasciatore trasformato
- cortigiana x veggente-mannaro: P10: visita VM, sopravvive
- spilungone x strega: P2: veleno uccide lo Spilungone
- cavaliere x veggente: P6: il Cavaliere si immola per il Veggente
- cartomante x criceto-malvagio: P8: mostra la carta Criceto
- lupo-mannaro-capobranco x mezzosangue: P2: il branco sbrana il Mezzosangue
- alchimista x suocera: P14: esplosione sulla Suocera ignota
- cortigiana x nano: P7: cliente Nano, lupi in visita: muore
- medium x ubriaco: P12: carta Ubriaco
- alchimista x fantasma-onnisciente: P2: Fantasma all'Alchimista bruciato
- lupo-mannaro-progenitore x veggente: P1: Veggente indaga il Progenitore
- polpo-mannaro x untore: P4: Polpo unto
- medium x villico: P12: carta Villico
- bardo x chupacabra: P5: notte saltata, Chupacabra non caccia
- cucciolo-di-lupo-mannaro x mezzosangue: P2: il branco (col Cucciolo) sbrana il Mezzosangue
- cavaliere x pastore: P8: si immola per il Pastore
- borgomastro x suocera: P3: Suocera Borgomastro sbranata, rielezione
- gallo-mannaro x untore: P4: il Gallo salta il giorno e l'unzione di quella notte non vale piu'
- cartomante x ubriaco: P4: mostra la carta Ubriaco
- bardo x maga: P8: notte saltata, Maga non agisce

### Coppie senza interazione possibile, provate presenti insieme (parziale) (76)

- fantasma-onnisciente x mucca-mannara (partite P2, P9)
- berserker x eremita (partite P3)
- nano x scemo-del-villaggio (partite P1, P7, P10)
- eremita x lantico (partite P7)
- bardo x mucca-mannara (partite P5)
- fantasma-onnisciente x veggente (partite P6, P9)
- gallo-mannaro x guardia (partite P7)
- mucca-mannara x scemo-del-villaggio (partite P1)
- innocente x mucca-mannara (partite P5)
- ambasciatore x lantico (partite P7)
- berserker x innocente (partite P6)
- alchimista x ambasciatore (partite P2)
- fantasma-onnisciente x veggente-mannaro (partite P2)
- boia x fattucchiera (partite P3)
- eremita x guardia-mannara (partite P3, P7)
- berserker x guardia-mannara (partite P3)
- guardia-mannara x spilungone (partite P3)
- nano x pastore (partite P1, P8)
- innocente x nonna (partite P5)
- bardo x criceto-malvagio (partite P5, P8)
- scemo-del-villaggio x villico (partite P1, P10)
- fantasma-onnisciente x guardia (partite P2)
- mucca-mannara x paladino (partite P1)
- guardia-mannara x sciacallo-mannaro (partite P5, P7)
- maga x mucca-mannara (partite P2)
- spilungone x veggente-mannaro (partite P2, P8)
- scemo-del-villaggio x ubriaco (partite P1, P7)
- mezzosangue x mucca-mannara (partite P2, P5)
- cucciolo-di-lupo-mannaro x mucca-mannara (partite P2, P9)
- criceto-malvagio x pastore (partite P1, P8)
- eremita x spilungone (partite P3)
- criceto-malvagio x inquisitore (partite P1)
- eremita x villico (partite P3)
- medium x veggente (partite P1)
- eremita x gallo-mannaro (partite P7)
- fattucchiera x spilungone (partite P3)
- guardia-mannara x nonna (partite P3, P5)
- lupo-mannaro-capobranco x spilungone (partite P2)
- medium x paladino (partite P1)
- guardia-mannara x scemo-del-villaggio (partite P7)
- ambasciatore x ubriaco (partite P1, P7)
- ambasciatore x paladino (partite P1)
- chupacabra x innocente (partite P5)
- mezzosangue x suocera (partite P2)
- guaritore x polpo-mannaro (partite P4)
- guardia x spilungone (partite P2, P3)
- criceto-malvagio x ubriaco (partite P1)
- pastore x veggente (partite P1)
- ubriaco x veggente-mannaro (partite P7)
- ambasciatore x sciacallo-mannaro (partite P7)
- berserker x inquisitore (partite P6)
- nano x suocera (partite P3)
- inquisitore x pastore (partite P1)
- criceto-malvagio x scemo-del-villaggio (partite P1)
- cartomante x guaritore (partite P4)
- cavaliere x fattucchiera (partite P3)
- nonna x polpo-mannaro (partite P3)
- mezzosangue x ubriaco (partite P7)
- polpo-mannaro x villico (partite P3)
- apprendista x paladino (partite P4)
- gallo-mannaro x guaritore (partite P4)
- bardo x borgomastro (partite P5)
- guardia x mezzosangue (partite P2, P5, P7)
- gallo-mannaro x paladino (partite P4)
- criceto-malvagio x mucca-mannara (partite P1, P5)
- paladino x veggente (partite P1, P4)
- ambasciatore x villico (partite P1)
- inquisitore x nano (partite P1)
- ambasciatore x criceto-malvagio (partite P1, P8)
- guardia-mannara x nano (partite P3, P7)
- criceto-malvagio x innocente (partite P5)
- ambasciatore x suocera (partite P2)
- inquisitore x veggente (partite P1, P6, P9)
- gallo-mannaro x scemo-del-villaggio (partite P7)
- mucca-mannara x nano (partite P1)
- cavaliere x guardia-mannara (partite P3)

## NON COPERTO
- Interazioni solo-passive (Eremita, Nano, Spilungone, Suocera, Pastore con altri ruoli passivi, Scemo, Ambasciatore con ruoli senza indagine): giocate solo come coesistenza ("parziale").
- Fantasma Onnisciente con Mucca, Veggente, Veggente Mannaro, Guardia (assegnato una sola volta per partita; il Fantasma e' andato all'Alchimista, alla Figlia e all'Inquisitore).
- Bardo x Mucca/Criceto/Borgomastro, Criceto x Innocente/Ladro con carta presa (nelle partite il Criceto era tra le carte scartate del Ladro).
- Indietro del telefono in notte (page.goBack non cambia pagina: l'app resta sullo stesso passo), ricarica in passo con selezione a meta' ok; dark mode.

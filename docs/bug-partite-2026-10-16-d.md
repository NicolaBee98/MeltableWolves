# Batch di partite del 2026-10-16 (d): 115 coppie ancora senza evidenza "si" (elenco coppie3-3)

Chromium reale (Playwright, 390x844, dev server porta 5643, codice a aee5f52), nessuna modifica a `src/` ne' ai docs esistenti. Giocate dalla UI: assegnazione ruoli di prima notte, notti, alba, voto, rogo, Eventi speciali, refresh a meta' passo; localStorage toccato solo per assegnare i ruoli "?" (Suocera, Spilungone, Antico, Scemo, Innocente, Boia, Alchimista, Villico) via checkpoint e per posizionare i giocatori. Il report e' stato scritto a mano a mano che gli scenari sono completati. Esito: tutte le 115 coppie "si" (nessuna "parziale"): interazione reale o assenza di interazione provata in scenario mirato (le coppie passive sono indicate in NON COPERTO). Nuovi: 1 bug cosmetico certo, 2 dubbi (uno gia' noto). Console: nessun errore ne' warning in nessuna delle 15 partite (rigiocate in sweep finale); nessun overflow orizzontale. Le decisioni gia' prese del brief non sono riproposte.

## SCENARI

### Mazzo 1 (14 giocatori: Lupo G01 e G09, Suocera G02 [checkpoint], Berserker G03, Maga G04, Mezzosangue G05, Ubriaco G06, Bardo G07, Veggente Mannaro G08, 5 Villici G10-G14)
- N1: Maga trasforma il Mezzosangue, il VM indaga l'Ubriaco ("Aura benevola"), il branco sbrana il Mezzosangue: "G05 diventa Lupo Mannaro" (nessun morto; alba: maiale + trasformazione in lupo, dopo refresh identico). Giorno 1: rogo Villico, Bardo "salta la notte" -> N2 "Questa notte non si svolge per i poteri del Bardo" (Maga/VM/branco non agiscono, alba "Nessuno e' morto").
- N3: Maga trasforma il Bardo (G07), VM indaga la Maga, il branco sbrana il Berserker: l'app chiede quale dei due lupi alla stessa distanza (G01, G05 ex-Mezzosangue) muore lottando; la Suocera adiacente (non lupo) non e' proposta; muoiono Berserker e il lupo scelto (Diario: "Il Berserker G03 e' stato sbranato e uccide lottando G05").
- N4: il branco sbrana l'Ubriaco: avviso "G06 e' l'Ubriaco: il branco sara' stordito la prossima notte"; N5 "Il branco e' ancora stordito dall'alcol dell'Ubriaco" (nessuna vittima selezionabile). Rogo dei Villici nei giorni.
- Vittoria con Suocera viva (carta assegnata via checkpoint): all'alba 6 restano 2 lupi, Maga, VM e la Suocera (Bardo sbranato): banner "I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro" (2 contro 2, la Suocera non conta come viva). Console pulita.

### Mazzo 2 (13 giocatori: Cucciolo G01, Lupo G02, Untore G03, 2 Inquisitori G04-G05, Veggente Mannaro G06, Paladino G07, Spilungone G08 e Innocente G09 [carta via checkpoint prima della notte], 4 Villici)
- N1: Inquisitore G04 interroga lo Spilungone e G05 il VM (entrambi "no (aura benevola)", Diario: "perde il potere dopo un'indagine inutile"); VM indaga lo Spilungone (benevola); Untore unge lo Spilungone; Paladino protegge lo Spilungone e il branco lo morde: "Il morso non ha effetto su G08: e' protetto/a".
- Giorno 1: Elezione Borgomastro = Spilungone (G08); "Morte per unzione" di G08: muore (unto che parla), l'unzione passa a G07 e G09, Diario "era il Borgomastro: il villaggio dovra' eleggerne uno nuovo"; elezione del Cucciolo G01 a Borgomastro; "L'Innocente si rivela" (G09). N2: Untore unge il Cucciolo (Borgomastro), Paladino protegge l'Innocente rivelato e il morso non ha effetto.
- Giorno 2: "Morte per unzione" del Cucciolo-Borgomastro: promemoria "Vendetta del Cucciolo: i lupi sbraneranno due persone la prossima notte", unzione ai vicini, rielezione (Paladino G07). N3: vendetta, Paladino protegge se stesso: il branco sbrana G07 (protetto, nessun effetto) e l'Innocente rivelato G09 (muore). N4: Paladino protegge il VM, morso senza effetto. Giorno 4: rogo del Paladino-Borgomastro -> rielezione del VM (G06); N5 il VM Borgomastro indaga un Villico (benevola) e il branco sbrana un Inquisitore. Console pulita.

### Mazzo 3 (14 giocatori: Lupo G01, Nonna G02, Polpo G03, Apprendista G04, Nano G05, Fattucchiera G06, 2 Inquisitori G07-G08, 2 Addolorate G09-G10, Strega G11, 3 Villici)
- N1: Apprendista sceglie la Nonna come maestro; Fattucchiera inibisce il Polpo (Diario "inibito", tolto a fine notte); Inquisitore G07 interroga il Polpo e G08 la Strega: entrambi "no (aura benevola)" e perdono il potere (vedi DUBBIO 1); il branco (Lupo + Nonna) sbrana il Nano: "Il morso non ha effetto su G05: il Nano non puo' essere sbranato". Rogo del Polpo.
- N2: due Addolorate: la prima scambia con il Polpo bruciato (Diario "ora e' Polpo Mannaro e G03 ha la carta Addolorata"), la seconda mostra "gia' scambiato da un'altra Addolorata"; Fattucchiera inibisce la Nonna e la Strega la uccide con la pozione mortale: all'alba "G04 si rivela: e' l'Apprendista di G02 ed eredita il ruolo di Nonna. Mostra a G04 chi sono i suoi compagni: G01". Rogo dell'Inquisitore G07.
- N3: Fattucchiera inibisce la Nonna ereditata (il branco con il Lupo resta attivo), la seconda Addolorata scambia con l'Inquisitore bruciato: diventa Inquisitore con il potere intero (G08, che l'aveva perso, resta "ha perso il potere"); N4: Fattucchiera inibisce il Nano e il branco (Lupo + Nonna ex-Apprendista) lo sceglie: "il Nano non puo' essere sbranato". Console pulita.

### Mazzo 4 (12 giocatori: Progenitore G01, Lupo G02, Eremita G03 [checkpoint], Berserker G04, Cartomante G05, Sacerdote G06, Veggente Mannaro G07, Figlia dei Lupi G08, Nano G09, 3 Villici)
- N1: Figlia sceglie il Nano come genitore, Sacerdote lega due Villici, Cartomante su Progenitore ("Mostra a Cartomante la carta: Lupo Mannaro Progenitore"), VM su Figlia ("Aura benevola"), il branco sceglie il Berserker (Eremita e Cartomante adiacenti): avviso "Se il Berserker sara' sbranato, G02 (il lupo piu vicino) morira' con lui", muoiono Berserker e il Lupo, l'Eremita non e' toccato. Rogo del Nano (immune ai lupi): "La Figlia dei Lupi G08 e' diventata Lupo Mannaro".
- N2: Cartomante su Sacerdote ("carta: Sacerdote"), VM su Figlia ora lupa ("Aura malvagia"), il branco (Progenitore + Figlia) sceglie l'Eremita e il Progenitore lo trasforma ("anche se protetto/a o immune"): refresh e alba "Nessuno e' morto", G03 lupo. Rogo di un innamorato: crepacuore del partner. N3: Cartomante su VM ("carta: Veggente Mannaro"), branco sbrana un Villico: vittoria dei lupi. Console pulita.

### Mazzo 5 (18 giocatori: Lupo G01, Nonna G02, 2 Ambasciatori G03-G04, 3 Addolorate G05-G07, 2 Eremiti G08-G09 [checkpoint], 4 Sciacalli G10-G13, Criceto G14, Scemo G15 [checkpoint], 3 Villici)
- N1: il branco sbrana l'Ambasciatore G04. Giorno 1: evento "Lo Scemo del Villaggio sbaglia la rima" (G15 muore, Diario "per aver sbagliato la rima") e rogo dell'Ambasciatore G03. N2: la prima Addolorata scambia con G03 (Diario "ora e' Ambasciatore e G03 ha la carta Addolorata"; le altre due: "gia' scambiato da un'altra Addolorata"); Sciacallo 1 resuscita l'Ambasciatore G04 (alba "G04 e' stato resuscitato"); il branco sbrana un Eremita.
- N3 (dopo rogo del Criceto): seconda Addolorata scambia: diventa Criceto Malvagio; lo Sciacallo 1 mostra "Potere gia' utilizzato"; Sciacallo 2 resuscita l'Eremita. N4 (dopo rogo della Nonna): Sciacallo 3 resuscita la Nonna (torna nel branco), il branco sceglie la ex-Addolorata ora Criceto: "il Criceto Malvagio non puo' essere sbranato". N5 (dopo rogo dell'Eremita G08): terza Addolorata scambia: diventa Eremita; Sciacallo 4 resuscita un Villico sbranato in N3. Console pulita, refresh non necessario ma Diario completo.

### Mazzo 6 (14 giocatori: Lupi G01 e G14, 2 Guardie G03-G04, Guardia Mannara G02 [con le Guardie], Chupacabra G05, Guaritore G06, Medium G07, Maga G08, Bardo G09, Inquisitore G10, 3 Villici)
- N1: Chupacabra caccia la Guardia Mannara: "G04 non e' un lupo: la caccia del Chupacabra fallisce" (la Guardia Mannara e' scelta a caso dall'app tra le tre Guardie: qui G02); Inquisitore interroga il Medium ("no (aura benevola)", perde il potere), la Maga trasforma il Medium. Giorno 1: Borgomastro = Guardia Mannara G02, rogo di un Villico, "Il Bardo salta la notte" (solo dopo un rogo): N2 non si svolge (Guardia Mannara e tutti i poteri fermi). Giorno 2: rogo della Guardia Mannara-Borgomastro (Diario "era il Borgomastro: il villaggio dovra' eleggerne uno nuovo"): rielezione, il Chupacabra diventa Borgomastro.
- N3: Medium trasformato (da N1) interroga un Villico bruciato ("Mostra a Medium la carta: Villico"), il Chupacabra uccide il Lupo G01 (alba: muoiono G01 e il Medium sbranato dal branco nello stesso passo). N4: Medium morto "Chiama comunque G07", Guaritore lo resuscita ("G07 e' stato resuscitato"), il Chupacabra caccia l'ultimo Lupo e lo uccide. Console pulita.

### Mazzo 7 (18 giocatori: Progenitore G01, Capobranco G02, Mucca G03, Ubriaco G04 e G16, Criceto G05, Fattucchiera G06, Mezzosangue G07, Antico G08 [checkpoint], Berserker G09, Bardo G10, 7 Villici) + mini (7 giocatori: Progenitore, Lupo, Mezzosangue, Paladino, 3 Villici)
- N1: Fattucchiera inibisce il Progenitore: nel passo Branco non e' piu' offerto "Il Progenitore trasforma ..." (correzione aee5f52 verificata), il branco con il Capobranco sbrana un Villico; Diario "inibito" scritto e tolto a fine notte. N2: Fattucchiera inibisce il Criceto (inutile, innocuo); il Progenitore trasforma l'Ubriaco G04 (resta vivo, diventa Lupo). N3: il branco (Progenitore, Capobranco e l'ex-Ubriaco; la Mucca non e' nella lista dei cacciatori) caccia normalmente (nessun stordimento dall'Ubriaco trasformato) e sbrana il secondo Ubriaco G16: avviso, N4 "Il branco e' ancora stordito dall'alcol dell'Ubriaco". Giorno 4: Bardo salta la notte 5 con Mucca viva.
- N6: il branco sbrana l'Antico: all'alba "ha perso la prima vita ma sopravvive", "Conferma la rivelazione", ruolo diventa Villico. N7: morso sul Criceto: "il Criceto Malvagio non puo' essere sbranato". N8: morso sul Berserker (Antico-Villico adiacente): "G04 (il lupo piu' vicino) morira' con lui" (muore l'ex-Ubriaco lupo, non l'Antico). N9: il Capobranco sbrana il Mezzosangue (scelta tra G01, G02, G05, G07 incluse): diventa Lupo; con Mucca, Antico e Criceto vivi: "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui".
- Mini: Paladino protegge il Mezzosangue, il branco col Progenitore lo sceglie: "Il morso non ha effetto: e' protetto/a" senza opzione di trasformazione (decisione); il Mezzosangue non protetto sbranato con il Progenitore: "verra' trasformato in Lupo Mannaro, anche se protetto/a o immune".

### Mazzo 8 (14 giocatori: Lupi G01 e G13, Capobranco G02, 2 Cavalieri G03 e G14, Sacerdote G04, Ambasciatore G05, Veggente G06, Innocente G07 [checkpoint], Untore G08, Figlia G09, 3 Villici)
- N1: Cavaliere G03 si lega all'Ambasciatore e G14 al Veggente; la Figlia sceglie G03 come genitore; il Sacerdote lega il Capobranco e un Villico; l'Untore unge il Lupo G13; il Veggente indaga l'Innocente ("Aura benevola"); il branco (Capobranco) sbrana l'Ambasciatore: avviso "Il Cavaliere si immola al posto di G05: muore G03", alba (anche dopo refresh): messaggio dall'ambasciatore, G13 unto, G03 si rivela e si immola, "G09 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro". Giorno 1: "L'Innocente si rivela".
- N2: Veggente indaga la Figlia ora lupa ("Aura malvagia"), il Capobranco sbrana il Lupo G01 (fratello). Giorno 2: "Morte per unzione" del Lupo G13 (unzione ai vicini), rogo del Veggente: il Cavaliere G14 si immola. Giorno 3: rogo dell'innamorato: "Morira' anche G02 (crepacuore)" e il Capobranco muore. Console pulita.

### Mazzo 9 (12 giocatori: Lupo G01, Nano G02, Pastore G03 [accanto al Nano e al Pifferaio], Pifferaio G04, Maga G05, Innocente G06 e Scemo G08 [checkpoint], Mezzosangue G07, Chupacabra G09, 3 Villici)
- N1: Pifferaio ipnotizza Pastore e Mezzosangue, Maga trasforma il Pastore, il branco sbrana il Mezzosangue (diventa Lupo), il Chupacabra caccia lo Scemo: "G08 non e' un lupo: la caccia del Chupacabra fallisce". Alba 1: nessun belato (il Nano vivo sta tra il Pastore e il lupo). Giorno 1: "L'Innocente si rivela", rogo del Nano.
- N2: Maga trasforma il Pastore, alba 2: "Si sentono dei belati." (ora il primo vivo a sinistra del Pastore e' il Lupo) insieme a "G03 e' stato trasformato in maiale". Giorno 2: lo Scemo sbaglia la rima (muore). N3: Pifferaio e Maga ancora attivi, il Chupacabra uccide il Lupo G01. Console pulita.

### Mazzo 10 (19 giocatori: Lupo G01, 2 Galli G02 e G15, 4 Guaritori G03 G14 G16 G19, Addolorata G04, Veggente G05, Cortigiana G06, Boia G07 [checkpoint], Ubriaco G08, Polpo G09, 2 Guardie, 4 Villici)
- N1: la Cortigiana visita il Lupo e muore all'alba, il branco (solo il Lupo: il Polpo non e' tra i cacciatori) sbrana l'Ubriaco: avviso stordimento; alba 1: "Il Gallo Mannaro salta il giorno" -> si passa direttamente alla notte 2 senza voto. N2 (stordita): due Guaritori resuscitano Ubriaco e Cortigiana, il Veggente indaga il Polpo e resta "accecato"; "Il branco e' ancora stordito dall'alcol dell'Ubriaco" anche con l'Ubriaco gia' resuscitato.
- Giorno 2: rogo del secondo Gallo; N3: l'Addolorata scambia con il Gallo bruciato e il passo mostra "Mostra a G04 il gesto segreto del Gallo Mannaro"; branco sbrana il primo Gallo. Giorno 3: "Il Boia giustizia" il Veggente ("G05 (giustiziato/a dal Boia)" all'alba) e subito "Il Gallo Mannaro salta il giorno" della ex-Addolorata (il Gallo ora c'e'). N4: due Guaritori resuscitano il Gallo e il Veggente (resta accecato); giorno 4: nessun evento Gallo ne' Boia (poteri gia' spesi, la resurrezione non li ricarica). Console pulita.

### Mazzo 11 (12 giocatori: Lupo G01, Nonna G02, Progenitore G03, Sciacallo G04, Polpo G05, Spilungone G06, Suocera G07 e Scemo G08 [checkpoint], 4 Villici) + mini (6 giocatori: Lupo, Spilungone, 4 Villici)
- N1: il branco (Lupo, Nonna, Progenitore; il Polpo non e' tra i cacciatori) sbrana la Suocera: all'alba "La Suocera si rivela" (evento) e Borgomastro G09. Giorno 1: rogo dello Spilungone: "Lo Spilungone si rivela e non muore durante il rogo" / "La notte cala senza vittime". N2: il Progenitore trasforma lo Spilungone rivelato (diventa Lupo, alba "Nessuno e' morto"). Giorno 2: rogo del Borgomastro (rielezione del Lupo G01), lo Scemo sbaglia la rima. N3: lo Sciacallo resuscita l'ex-Borgomastro (nessun avviso di elezione perche' c'e' gia' G01), il Lupo G01 resta Borgomastro; giorno 3: rogo dell'ex-Spilungone-lupo: muore.
- Mini: Spilungone rivelato al giorno 1 e rimesso al rogo al giorno 2: muore (vedi DUBBIO 2).

### Mazzo 12 (12 giocatori: Lupo G01, Apprendista G02, Pifferaio G03, Untore G04, Medium G05, Strega G06, Paladino G07, Ambasciatore G08, 4 Villici)
- N1: Apprendista sceglie un Villico come maestro; il Pifferaio ipnotizza Untore e Paladino; l'Untore unge il Pifferaio; il Paladino protegge l'Ambasciatore e il branco lo sceglie ("Il morso non ha effetto su G08: e' protetto/a"); la Strega uccide il Villico-maestro: alba "G02 si rivela: e' l'Apprendista di G09 e prende la sua carta (ruolo ancora ignoto: resta ignoto finche' non viene rivelato)". Giorno 1: rogo del Pifferaio.
- N2: Medium interroga il Pifferaio bruciato ("Mostra a Medium la carta: Pifferaio"); l'Untore ipnotizzato unge il Paladino ipnotizzato; la Strega usa la pozione vitale sul Medium, il branco lo sceglie: "Il morso non ha effetto su G05: e' protetto/a". Giorno 2: rogo della Strega; N3: Medium interroga la Strega ("carta: Strega"); N4: Medium interroga il Villico-maestro ("carta: Villico"). Console pulita.

### Mini Ladro (6 giocatori, 2 carte extra: Veggente Mannaro e Villico)
- N1: il Ladro sceglie il Veggente Mannaro ("Il Ladro sceglie Veggente Mannaro: scarta Villico"), il passo VM lo chiama con il Ladro come titolare: indaga un Villico ("Aura benevola"); refresh all'alba identico. N2: indaga il Lupo ("Aura malvagia"). Console pulita.

## BUG CERTI
1. **"Morte per unzione" di uno Spilungone mostra il testo del rogo.** Mazzo 2: Spilungone G08 unto, evento "Morte per unzione" su G08: il riepilogo dice "G08 e' morto/a per l'unzione: l'unzione passa ai due vicini vivi, G07 e G09. Lo Spilungone si rivela e non muore durante il rogo." (e G08 risulta davvero morto, Diario "e' morto/a per l'unzione"). L'immunita' dello Spilungone vale solo per il rogo: la seconda riga e' contraddittoria. Causa: `conseguenze()` in `src/data/eventiSpeciali.js:129` (`primo && ruoloSlug === 'spilungone' && spilungoneRivelatoRound === undefined`) non distingue il tipo di morte; `applica()` in `src/features/giorno/EventiSpeciali.jsx:145` la chiama per ogni "morte sul colpo" (unzione, Alchimista, Boia, Scemo). Proposta: passare il contesto (`rogo: true`) a `conseguenzeMorte` e emettere la riga dello Spilungone (e quella dell'Antico) solo per il rogo.

## DUBBI (con proposta)
1. **Aura del Polpo Mannaro benevola per l'Inquisitore.** `aura.js` (solo i 5 ruoli lupo + Chupacabra + Eremita sono malvagi): un Inquisitore che interroga il Polpo (fazione lupi) perde il potere. Coerente con le decisioni gia' prese (lupi = 5 ruoli, Nonna benevola), segnalato solo per completezza. Nessuna azione.
2. **Spilungone gia' rivelato rimesso al rogo: muore.** Mini: giorno 1 rogo dello Spilungone ("si rivela, la notte cala senza vittime"), giorno 2 di nuovo al rogo: "Dichiara morte sul rogo" lo uccide (`Votazione.jsx:230`, immunita' solo per `spilungoneRivelatoRound === undefined`; coerente con il codice di `conseguenze()`). La regola dice "non puo' essere messo al rogo dal villaggio" senza distinguere prima/seconda volta; il Boia puo' giustiziarlo (decisione). Non e' tra le decisioni gia' prese. Proposta: confermare con il proprietario se l'immunita' e' permanente (allora anche il secondo rogo lascia la notte senza vittime) o solo la prima volta (come ora).


## NON COPERTO
- Le coppie tra ruoli passivi (Bardo con Suocera/Villico/Mucca/Guardia Mannara, Ambasciatore con Villico/Scemo/Paladino senza Veggente, Criceto con Villico, Nano con Polpo, Pastore con Pifferaio, Polpo/Scemo/Suocera con Spilungone, Gallo con Guardia, Mezzosangue/Ubriaco con Villico, Innocente con Nano/Mezzosangue) sono "si" come assenza di interazione provata in uno scenario mirato (i due ruoli presenti nella stessa partita con i loro eventi giocati e Diario/alba/vittoria controllati), non come interazione reale: per regolamento non ce n'e'.
- Ogni coppia e' provata in un solo scenario: non ho variato inibizione/protezione/trasformazione/ipnosi della coppia in tutti i modi (es. Mezzosangue protetto dal Paladino + Progenitore solo nel mini, Spilungone rivelato poi trasformato una volta).
- La Guardia Mannara e' scelta a caso dall'app (Math.random seminato nel mio browser: nel Mazzo 6 era G02): provato solo quel caso, non le altre due Guardie.
- Ruoli "?" assegnati per checkpoint (Suocera, Spilungone, Antico, Scemo, Innocente, Boia, Eremita): il flusso reale in cui il narratore li scopre solo dai loro eventi/dalla vittoria non e' stato rigiocato oltre agli eventi dedicati (Suocera si rivela, rogo/Spilungone, Antico sbranato, Scemo che sbaglia la rima, Innocente si rivela, Boia giustizia); Alchimista, Mimo, Fantasma Onnisciente e il resto del perimetro 2 non fanno parte di questo elenco.
- Verifiche trasversali fatte solo a campione: overflow orizzontale (390x844) su assegnazione, alba, rogo, Eventi speciali, notte con due Addolorate (nessuno), tasto Indietro del telefono in notte (resta nel passo), refresh a meta' passo (stato identico). Non rifatte: altri viewport, offline, accessibilita'.

## Coppie ruoloA x ruoloB
addolorata x eremita: si, Mazzo5: Addolorata scambia con l'Eremita bruciato (carta via checkpoint) e diventa Eremita
borgomastro x veggente-mannaro: si, Mazzo2: VM eletto Borgomastro dopo il rogo del Paladino; il VM indaga normalmente (aura benevola), nessun conflitto
pastore x pifferaio: si, Mazzo9: Pastore ipnotizzato dal Pifferaio (suo vicino): nessuna interferenza con i belati
addolorata x polpo-mannaro: si, Mazzo3: Addolorata scambia con il Polpo bruciato: diventa Polpo (Diario ok), nessun problema
sciacallo-mannaro x villico: si, Mazzo5: lo Sciacallo resuscita un Villico sbranato (alba "e' stato resuscitato")
berserker x eremita: si, Mazzo4: Berserker sbranato con l'Eremita adiacente: l'Eremita (non lupo) non e' proposto ne' muore, muore il lupo piu' vicino
ubriaco x villico: si, Mazzo1: Ubriaco sbranato e Villici bruciati: nessun effetto incrociato
borgomastro x sciacallo-mannaro: si, Mazzo11: lo Sciacallo resuscita l'ex-Borgomastro bruciato dopo la rielezione: torna come semplice giocatore, il Borgomastro in carica resta tale, nessun avviso spurio
lupo-mannaro-capobranco x sacerdote: si, Mazzo8: Capobranco legato dal Sacerdote a un Villico: al rogo del partner "Morira' anche G02 (crepacuore)", muore
innocente x nano: si, Mazzo9: Innocente rivelato e rogo del Nano nello stesso giorno: due eventi indipendenti, Diario ok
cucciolo-di-lupo-mannaro x untore: si, Mazzo2: l'Untore unge il Cucciolo, "Morte per unzione": vendetta annunciata e attuata la notte dopo, unzione ai vicini
borgomastro x spilungone: si, Mazzo2: Spilungone eletto Borgomastro muore per unzione (solo il rogo lo risparmia): "era il Borgomastro: il villaggio dovra' eleggerne uno nuovo" (ma vedi BUG 1: riga del rogo nel riepilogo dell'unzione)
borgomastro x cucciolo-di-lupo-mannaro: si, Mazzo2: il Cucciolo eletto Borgomastro muore per unzione: rielezione richiesta e Vendetta (due vittime la notte dopo) proposte; Diario ok
addolorata x inquisitore: si, Mazzo3: Addolorata scambia con l'Inquisitore bruciato (Diario ok), diventa Inquisitore con potere intero e interroga regolarmente (l'Inquisitore morto che l'aveva perso non conta)
figlia-dei-lupi x nano: si, Mazzo4: la Figlia sceglie il Nano come genitore, il Nano resiste ai lupi e muore al rogo: la Figlia diventa Lupo (Diario, si sveglia col branco la notte dopo)
innocente x veggente: si, Mazzo8: il Veggente indaga l'Innocente (carta via checkpoint): "Aura benevola"; poi l'Innocente si rivela
bardo x mucca-mannara: si, Mazzo7: il Bardo fa saltare la notte 5 con la Mucca viva (che si sveglia solo la prima notte): nessuna interazione
apprendista x nonna: si, Mazzo3: maestro Nonna uccisa dalla Strega: all'alba l'Apprendista eredita Nonna e gli si mostrano i compagni; entra nel branco e la Fattucchiera puo' inibirlo
addolorata x ambasciatore: si, Mazzo5: Addolorata scambia con l'Ambasciatore bruciato (Diario ok, le altre Addolorate vedono "gia' scambiato"), diventa Ambasciatore
ambasciatore x scemo-del-villaggio: si, Mazzo5: Scemo muore per la rima con gli Ambasciatori vivi: nessun annuncio dell'Ambasciatore, Diario ok
apprendista x villico: si, Mazzo12: maestro Villico ucciso dalla Strega: all'alba "G02 si rivela: e' l'Apprendista di G09 e prende la sua carta (ruolo ancora ignoto...)", nessuna anomalia
addolorata x criceto-malvagio: si, Mazzo5: Addolorata scambia con il Criceto bruciato e diventa Criceto: il branco non puo' sbranarlo (avviso immunita')
gallo-mannaro x guardia: si, Mazzo10: Gallo salta il giorno 1 con le Guardie vive: si passa alla notte 2 senza interferenze
chupacabra x guardia-mannara: si, Mazzo6: il Chupacabra caccia la Guardia Mannara: "G02 non e' un lupo: la caccia del Chupacabra fallisce"
nonna x suocera: si, Mazzo11: il branco con la Nonna sbrana la Suocera: all'alba "La Suocera si rivela", Suocera non conta come viva nei conteggi
addolorata x gallo-mannaro: si, Mazzo10: l'Addolorata scambia con il Gallo bruciato: promemoria "Mostra il gesto segreto del Gallo" e puo' usare "Il Gallo Mannaro salta il giorno" il giorno dopo
ladro x veggente-mannaro: si, Mini Ladro: il Ladro prende il Veggente Mannaro dalle due carte extra e indaga regolarmente (aura benevola/malvagia), Diario "sceglie Veggente Mannaro: scarta Villico"
berserker x suocera: si, Mazzo1: Berserker sbranato con la Suocera (non lupo) adiacente: non e' proposta ne' muore, muore il lupo piu' vicino scelto (G05, a pari distanza con G01 viene chiesto quale)
ambasciatore x villico: si, Mazzo5: Ambasciatore (anche resuscitato o ex-Addolorata) e Villici bruciati/sbranati/resuscitati: nessuna interazione
cucciolo-di-lupo-mannaro x innocente: si, Mazzo2: Innocente rivelato prima, poi sbranato come seconda vittima della vendetta del Cucciolo: muore, Diario ok
inquisitore x spilungone: si, Mazzo2: l'Inquisitore interroga lo Spilungone: "no (aura benevola)" e perde il potere (Diario)
inquisitore x veggente-mannaro: si, Mazzo2: l'Inquisitore interroga il VM: "no (aura benevola)" e perde il potere (Diario)
strega x villico: si, Mazzo12: pozione mortale su un Villico: muore di notte, Diario ok
lantico x mezzosangue: si, Mazzo7: Antico sbranato alla prima vita (sopravvive da Villico) e, notti dopo, Mezzosangue sbranato diventa Lupo: nessuna interferenza
spilungone x suocera: si, Mazzo11: Suocera sbranata e rivelata, Spilungone al rogo il giorno dopo: nessuna interazione
boia x veggente: si, Mazzo10: il Boia giustizia il Veggente: "G05 (giustiziato/a dal Boia)" all'alba; Veggente poi resuscitato dal Guaritore
criceto-malvagio x ubriaco: si, Mazzo7: Ubriaco sbranato (stordimento solo la notte dopo) e morso sul Criceto "non puo' essere sbranato": nessuna interferenza
ambasciatore x cavaliere: si, Mazzo8: Cavaliere legato all'Ambasciatore sbranato: si immola, l'Ambasciatore sopravvive e l'alba riporta comunque il messaggio dall'ambasciatore (Veggente su Innocente)
criceto-malvagio x villico: si, Mazzo5: morso sul Criceto senza effetto, Villici sbranati normalmente e resuscitati
nonna x sciacallo-mannaro: si, Mazzo5: Nonna bruciata e poi resuscitata dallo Sciacallo: torna nel branco (Vivi: G01, G02 in N5)
lupo-mannaro-progenitore x spilungone: si, Mazzo11: il Progenitore trasforma lo Spilungone gia' rivelato (non muore, diventa Lupo); al rogo dopo muore come lupo (vedi DUBBIO 2 per il secondo rogo)
cavaliere x veggente: si, Mazzo8: Cavaliere legato al Veggente, rogo del Veggente: "il Cavaliere G14 lo protegge: si immola al suo posto", il Veggente sopravvive
lupo-mannaro x lupo-mannaro-capobranco: si, Mazzo8: il Capobranco sbrana un Lupo fratello (muore, nessun avviso anomalo)
eremita x sciacallo-mannaro: si, Mazzo5: lo Sciacallo resuscita l'Eremita sbranato (alba "e' stato resuscitato")
lupo-mannaro-progenitore x mucca-mannara: si, Mazzo7: il Progenitore trasforma l'Ubriaco, la Mucca non compare tra i lupi cacciatori del passo Branco; nessun effetto reciproco
inquisitore x medium: si, Mazzo6: l'Inquisitore interroga il Medium: "no (aura benevola)" e perde il potere
cartomante x veggente-mannaro: si, Mazzo4: la Cartomante indaga il VM: carta Veggente Mannaro
chupacabra x scemo-del-villaggio: si, Mazzo9: il Chupacabra caccia lo Scemo (carta via checkpoint): "non e' un lupo: la caccia fallisce"; poi lo Scemo muore per la rima
medium x pifferaio: si, Mazzo12: il Medium interroga il Pifferaio bruciato: "Mostra a Medium la carta: Pifferaio"
cartomante x lupo-mannaro-progenitore: si, Mazzo4: la Cartomante indaga il Progenitore: "Mostra a Cartomante la carta: Lupo Mannaro Progenitore"
cortigiana x guaritore: si, Mazzo10: Cortigiana morta per visita al lupo, resuscitata dal Guaritore (alba "e' stato resuscitato")
bardo x maga: si, Mazzo1: Bardo salta la notte (N2: Maga e VM non agiscono), poi la Maga trasforma il Bardo in N3 (Diario "trasformato", perso a fine giorno); nessun conflitto
maga x veggente-mannaro: si, Mazzo1: VM indaga la Maga e un lupo trasformato in maiale: aure normali, nessun effetto sul VM
medium x strega: si, Mazzo12: il Medium interroga la Strega bruciata ("carta: Strega") e la Strega protegge il Medium con la pozione vitale dal morso del branco
maga x medium: si, Mazzo6: la Maga trasforma il Medium (maiale, perso a fine giorno); il Medium trasformato continua a interrogare i morti
bardo x guaritore: si, Mazzo6: dopo la notte saltata dal Bardo il Guaritore resuscita regolarmente il Medium (notte 4); il Bardo trasformato dalla Maga in N4 non cambia nulla
nonna x scemo-del-villaggio: si, Mazzo5: Scemo muore per la rima con la Nonna viva: nessun effetto sul branco
mezzosangue x suocera: si, Mazzo1: Mezzosangue morso diventa lupo e conta nel branco/vittoria, Suocera viva non conta (vittoria lupi 2 contro 2 con Suocera viva)
mucca-mannara x ubriaco: si, Mazzo7: Ubriaco sbranato con la Mucca viva: "il branco e' ancora stordito" la notte dopo, la Mucca non partecipa
polpo-mannaro x spilungone: si, Mazzo11: Spilungone rivelato al rogo con il Polpo vivo (non tra i cacciatori del branco): nessuna interazione
fattucchiera x nonna: si, Mazzo3: Fattucchiera inibisce la Nonna (poi uccisa dalla Strega) e la Nonna ereditata dall'Apprendista: inibizione scritta e tolta nel Diario, il branco col Lupo resta attivo
innocente x mezzosangue: si, Mazzo9: Innocente rivelato nello stesso giorno in cui il Mezzosangue, sbranato la notte prima, e' diventato Lupo: nessuna interazione
mezzosangue x villico: si, Mazzo1: Mezzosangue morso diventa lupo, Villici bruciati: nessuna interazione
guaritore x medium: si, Mazzo6: Medium sbranato e chiamato comunque da morto ("Chiama comunque G07"), il Guaritore lo resuscita (alba "G07 e' stato resuscitato")
nano x nonna: si, Mazzo3: il branco con la Nonna (poi la Nonna ereditata) sceglie il Nano: "il Nano non puo' essere sbranato"
polpo-mannaro x ubriaco: si, Mazzo10: Ubriaco sbranato con il Polpo in gioco: stordimento solo del branco di caccia (il Polpo non e' tra i cacciatori)
nonna x strega: si, Mazzo3: pozione mortale della Strega sulla Nonna: muore di notte, Diario e alba ok (eredita l'Apprendista)
borgomastro x guardia-mannara: si, Mazzo6: la Guardia Mannara eletta Borgomastro viene bruciata: "era il Borgomastro: il villaggio dovra' eleggerne uno nuovo", rielezione ok
cavaliere x lupo-mannaro-capobranco: si, Mazzo8: il branco col Capobranco sbrana il protetto del Cavaliere: "Il Cavaliere si immola al posto di G05"
ambasciatore x sciacallo-mannaro: si, Mazzo5: lo Sciacallo resuscita l'Ambasciatore sbranato: "G04 e' stato resuscitato", condizione resuscitato, nessun annuncio
criceto-malvagio x lantico: si, Mazzo7: il Criceto vivo mentre l'Antico perde la prima vita e poi conta come villaggio; con i lupi in vantaggio vince solo il Criceto
berserker x lantico: si, Mazzo7: Antico (poi Villico) adiacente al Berserker sbranato: non e' lupo, muore il lupo piu' vicino
paladino x veggente-mannaro: si, Mazzo2: Paladino protegge il VM (notte 4), il branco lo sceglie: nessun effetto
mezzosangue x ubriaco: si, Mazzo1: Mezzosangue sbranato non muore -> nessun stordimento; Ubriaco sbranato dopo -> stordimento solo allora
fattucchiera x polpo-mannaro: si, Mazzo3: Fattucchiera inibisce il Polpo (inibito scritto e tolto a fine notte), nessun effetto collaterale
ubriaco x veggente-mannaro: si, Mazzo1: VM indaga l'Ubriaco ("Aura benevola"); poi Ubriaco sbranato: il branco e' stordito (N5), nessun legame con il VM
maga x mezzosangue: si, Mazzo1: Maga trasforma il Mezzosangue e il branco lo sbrana in N1: diventa Lupo, maiale all'alba, trasformato tolto a fine giorno
inquisitore x strega: si, Mazzo3: l'Inquisitore interroga la Strega: "no (aura benevola)" e perde il potere
spilungone x untore: si, Mazzo2: Untore unge lo Spilungone, "Morte per unzione" lo uccide e unge i vicini (BUG 1: testo del rogo nel riepilogo)
figlia-dei-lupi x veggente-mannaro: si, Mazzo4: il VM indaga la Figlia: "Aura benevola" prima dell'orfanezza, "Aura malvagia" dopo
fattucchiera x lupo-mannaro-progenitore: si, Mazzo7: Fattucchiera inibisce il Progenitore: il passo Branco non offre piu' la trasformazione (fix aee5f52 verificato); inibizione tolta a fine notte
lupo-mannaro-progenitore x mezzosangue: si, Mini: Mezzosangue protetto: morso senza effetto e nessuna trasformazione offerta; non protetto: "verra' trasformato in Lupo Mannaro, anche se protetto/a o immune" e diventa Lupo
nano x polpo-mannaro: si, Mazzo3: Nano bersaglio del branco con il Polpo in gioco: nessun effetto, il Polpo (non lupo) non cambia nulla
guaritore x veggente: si, Mazzo10: il Guaritore resuscita il Veggente giustiziato: torna in gioco, condizione accecato conservata
bardo x guardia-mannara: si, Mazzo6: il Bardo fa saltare la notte 2 con la Guardia Mannara viva (poi bruciata): nessuna interazione, Diario ok
criceto-malvagio x fattucchiera: si, Mazzo7: la Fattucchiera inibisce il Criceto (nessun avviso, innocuo); condizione scritta e tolta nel Diario
bardo x suocera: si, Mazzo1: Bardo salta la notte con la Suocera (carta via checkpoint) viva: nessuna interazione; la Suocera viva non cambia la vittoria all'alba 6
guaritore x ubriaco: si, Mazzo10: Ubriaco sbranato e resuscitato nella notte stordita: "il branco e' ancora stordito" resta, nessuna anomalia
paladino x spilungone: si, Mazzo2: Paladino protegge lo Spilungone e il branco lo morde: nessun effetto
gallo-mannaro x guaritore: si, Mazzo10: il Gallo che aveva usato il potere viene resuscitato: il potere non si ricarica (nessun evento Gallo il giorno dopo)
borgomastro x paladino: si, Mazzo2: Paladino eletto Borgomastro si protegge, il branco lo sceglie come vittima della vendetta: morso senza effetto; poi rogo del Paladino-Borgomastro con rielezione
cartomante x sacerdote: si, Mazzo4: la Cartomante indaga il Sacerdote: carta Sacerdote mostrata, legame degli innamorati non toccato
mezzosangue x scemo-del-villaggio: si, Mazzo9: Mezzosangue sbranato diventa Lupo, Scemo muore per la rima il giorno dopo: nessuna interazione
lupo-mannaro-capobranco x mezzosangue: si, Mazzo7: il Capobranco col branco sbrana il Mezzosangue (anche tra i bersagli i fratelli): "Il Mezzosangue sbranato non muore: diventa Lupo Mannaro"
ambasciatore x paladino: si, Mazzo12: il Paladino protegge l'Ambasciatore e il branco lo sceglie: morso senza effetto, nessun annuncio dell'Ambasciatore
lupo-mannaro-progenitore x ubriaco: si, Mazzo7: il Progenitore trasforma l'Ubriaco G04 (non muore): nessuno stordimento la notte dopo (notte 3 normale); un secondo Ubriaco sbranato stordisce regolarmente
bardo x villico: si, Mazzo1: Bardo salta la notte dopo il rogo di un Villico; nessuna interazione, Diario corretto
cavaliere x figlia-dei-lupi: si, Mazzo8: la Figlia ha il Cavaliere come genitore: il Cavaliere muore immolandosi, all'alba la Figlia orfana diventa Lupo
spilungone x veggente-mannaro: si, Mazzo2: il VM indaga lo Spilungone: "Aura benevola"
eremita x lupo-mannaro-progenitore: si, Mazzo4: il Progenitore trasforma l'Eremita sbranato (vivo, diventa lupo, refresh ok); il VM lo legge malvagio
nano x pastore: si, Mazzo9: il Nano tra il Pastore e il lupo: nessun belato; dopo il rogo del Nano all'alba "Si sentono dei belati"
borgomastro x lupo-mannaro: si, Mazzo11: il Lupo eletto Borgomastro dopo il rogo del precedente (elezione nel Diario) e il branco continua a cacciare; nessun conflitto
scemo-del-villaggio x spilungone: si, Mazzo11: Spilungone rivelato (giorno 1) e Scemo che sbaglia la rima (giorno 2): eventi indipendenti, Diario ok
berserker x ubriaco: si, Mazzo1: Berserker sbranato in N3 (muore anche il lupo), Ubriaco sbranato in N4: stordimento solo in N5, nessuna interferenza
borgomastro x chupacabra: si, Mazzo6: dopo la rielezione il Chupacabra e' Borgomastro e caccia normalmente (uccide un lupo nelle notti 3 e 4)
pifferaio x untore: si, Mazzo12: il Pifferaio ipnotizza l'Untore e viene unto da lui nella stessa notte; l'Untore ipnotizzato continua a ungere
inquisitore x polpo-mannaro: si, Mazzo3: l'Inquisitore interroga il Polpo: "no (aura benevola)" e perde il potere (Polpo non e' tra le auree malvagie, vedi DUBBIO 1)
criceto-malvagio x mucca-mannara: si, Mazzo7: lupi in numero pari o superiore con Mucca e Criceto vivi: "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui"
paladino x pifferaio: si, Mazzo12: il Pifferaio ipnotizza il Paladino, che continua a proteggere (morso senza effetto in notte 1 e 2)
lupo-mannaro x untore: si, Mazzo8: l'Untore unge un Lupo; "Morte per unzione" del Lupo: unzione ai vicini vivi
bardo x mezzosangue: si, Mazzo1: Mezzosangue sbranato in N1 diventa lupo; il Bardo fa saltare N2 e la notte seguente il branco (con ex-Mezzosangue) caccia normalmente
fattucchiera x nano: si, Mazzo3: Fattucchiera inibisce il Nano (nessun avviso, innocuo) e il morso resta senza effetto
suocera x ubriaco: si, Mazzo1: Ubriaco sbranato con la Suocera viva: avviso stordimento e N5 stordita, Suocera non coinvolta
maga x pastore: si, Mazzo9: Maga trasforma il Pastore: all'alba "Si sentono dei belati" e "G03 e' stato trasformato in maiale", entrambi gli annunci
innocente x paladino: si, Mazzo2: Innocente rivelato, protetto dal Paladino: il morso non ha effetto

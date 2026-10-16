# Batch di partite del 2026-10-16 (a): 115 coppie ancora senza evidenza "si" (elenco coppie3-0)

Chromium reale (Playwright, 390x844, dev server porta 5641, codice a aee5f52), nessuna modifica a src/. Il report viene scritto a mano a mano che gli scenari sono completati. Metodo: una partita "BIG" a 50 giocatori con quasi tutti i ruoli (checkpoint di localStorage a fine alba 1: ruoli "?" Spilungone, Antico, Suocera, Scemo, Villico, Innocente, Boia, Alchimista assegnati dal checkpoint, notte 1 gia' giocata dalla UI), ripristinata ad ogni scenario; mini-partite (6-12 giocatori) per i ruoli con scelta di prima notte diversa (Cavaliere, Figlia, Apprendista, Ladro, Bardo). Tutti i passi oggetto del test (notti, rogo, eventi speciali, eventi dei ruoli "?") giocati dalla UI.

## SCENARI

### BIG-A1 (Mezzosangue Borgomastro, Polpo, Cortigiana, Inquisitore)
Giorno 1: elezione Borgomastro il Mezzosangue G13. N2: Cortigiana visita G13, Veggente indaga il Polpo (accecato), branco sbrana G13: avvisi "Il Mezzosangue sbranato non muore: diventa Lupo" e "A casa di G13 c'e' anche la Cortigiana: morira' comunque"; alba: Cortigiana morta, G13 lupo, nessuna rielezione, messaggio dell'ambasciatore (aura benevola del Polpo). N3: Inquisitore interroga G13 (ora lupo): "si (aura malvagia)"; Veggente accecato legge l'Eremita: "Aura benevola" + messaggio ambasciatore. N4: Veggente accecato legge G13 lupo: benevola; Inquisitore su Eremita: "si (aura malvagia)", non perde il potere. Nessun errore di console. Il Diario scrive "il suo cliente G13 era un lupo" per il Mezzosangue morso (voce gia' decisa in 16-e, punto 9), mentre per un Nano/Innocente sbranato scrive "e' stato visitato/sbranato dai lupi": nessuna azione.

### BIG-B1 (Inquisitore su sette bersagli benevoli)
Sette ripartenze dal checkpoint: N2 l'Inquisitore interroga Mucca, Veggente, Scemo ('?'), Suocera ('?'), Criceto, Berserker, Figlia (genitore vivo): sempre "no (aura benevola)" e alla notte 3 "Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola" (Diario ok). Un '?' viene trattato come benevolo (corretto per Scemo/Suocera). Nessun problema.

### BIG-C (Veggente / Veggente Mannaro / Ambasciatore)
Ripartenze dal checkpoint, una notte ciascuna: Veggente su Scemo, Spilungone, Suocera ('?') e Nano (branco sul Nano senza effetto): "Aura benevola" + messaggio ambasciatore; Veggente e VM sul Capobranco: "Aura malvagia", nessun messaggio, branco sbrana il VM (N3 "Chiama comunque G11 per il suo turno, anche se morto/a"); VM sul Criceto: benevola. Untore unge l'Ambasciatore: messaggio presente la notte stessa, morte per unzione di giorno (vicini G18/G20 unti), N3 lettura benevola senza messaggio. Rogo Ambasciatore + Medium: "Mostra a Medium la carta: Ambasciatore". Rogo Antico (Conferma): notte 2 con soli Pifferaio, VM, Sciacallo, Branco, Chupacabra (banner "maledetto"), nessun messaggio ambasciatore; N3 Veggente sull'Eremita "malvagia", N4 sull'Antico "benevola" + messaggio. Nessun problema.

### BIG-D (Fantasma Onnisciente al primo morto sul rogo)
Quattro ripartenze (rogo di Figlia, VM, Untore, Guardia con Fantasma assegnato a lui/lei dal menu Eventi speciali) + rogo del Borgomastro. Figlia: Medium vede "Figlia dei Lupi". VM e Untore morti: passo notturno "Chiama comunque G.. per il suo turno, anche se morto/a" senza scelte (il Fantasma non attiva il potere del ruolo). Guardia: il Medium chiede "Guardia o Guardia Mannara?". Borgomastro rogato: Diario "era il Borgomastro: il villaggio dovra' eleggerne uno nuovo" mentre nella schermata del giorno non compare alcun avviso (l'avviso c'e' solo all'alba successiva, `AlbaPanel.jsx:169`): coerente con "si elegge all'alba", segnalo solo come dubbio cosmetico (nessuna azione). Nessun problema.

### MINI-E (Cavaliere, mazzi con piu' Cavalieri)
Il mazzo accetta piu' Cavalieri (un gruppo "Per chi sacrificarsi" per ciascuno). M1 (11 giocatori: 3 Cavalieri che proteggono VM, Inquisitore, Gallo): N2 branco sul VM, rogo dell'Inquisitore, N3 branco sul Gallo: ogni volta "Il Cavaliere si immola al posto di G..", il protetto si salva (alba "si e' rivelato: e' il Cavaliere", Diario "(colpito dal branco)" / "al posto di G04 e muore" per il rogo). M2 (9 giocatori): un Cavaliere protegge il Cucciolo, uno la Maga; N2 Fattucchiera inibisce il secondo Cavaliere e la Maga trasforma il primo: branco sulla Maga, il Cavaliere inibito si immola comunque; N3 Maga di nuovo sul primo (maiale), branco sul Cucciolo: si immola comunque, il Cucciolo vive e non scatta nessuna vendetta. Nessun problema. Osservazione: il Cavaliere inibito/trasformato agisce normalmente (e' un potere passivo; coerente con "la Fattucchiera non inibisce ruoli di prima notte").

### BIG-F/G e MINI-F (Berserker, Pastore, Figlia: posti riordinati dal checkpoint)
Posti riordinati (localStorage) per controllare le adiacenze, tutto il resto dalla UI. Berserker (BIG, N3): con Innocente, Nano e Guardia Mannara adiacenti e il lupo G01 a distanza 2: avviso "G01 (il lupo piu' vicino) morira' con lui", alba "G01, G21", Diario ok, anche con il Berserker inibito; Pastore accanto al lupo G01 sente i belati in N2 ma non dopo la morte di G01. Pastore: l'Ubriaco adiacente sbranato non fa sparire i belati (primo vivo oltre l'Ubriaco, G01), N3 branco stordito; Veggente sul lupo vicino "malvagia" in parallelo; Strega mortale sul lupo vicino (alba senza belati); Untore sul Pastore (morte per unzione, vicini G01 e G16 unti, N3 senza belati). MINI-F (12 giocatori, 3 Figlie con genitori G09 villico, Mezzosangue, Gallo, Pastore accanto alla prima): orfana accanto al Pastore subito "belati"; genitore Mezzosangue morso: la Figlia non diventa lupo; genitore Gallo sbranato: "rimasta orfana diventa Lupo". Nessun problema.

### BIG-H/I/J (Strega, Chupacabra, Innocente, Boia)
Strega: vitale sul Capobranco che il branco sceglie ("Il morso non ha effetto su G03: e' protetto/a", poi mortale: muore); mortale sull'Untore che ha appena unto (unzione annunciata e morte per unzione comunque); mortale sullo Spilungone ('?', innamorato di G33): crepacuore di G33; mortale sul genitore (Mucca): "rimasta orfana diventa Lupo". Chupacabra: caccia su Guardia, Innocente, Eremita: "G.. non e' un lupo: la caccia del Chupacabra fallisce" (nessuna morte). Innocente: si rivela dal menu Eventi speciali (nel pannello esito del voto compaiono solo Spilungone, Antico, Alchimista), Cortigiana che lo visita muore col cliente sbranato (avviso "entrambi moriranno"); Ubriaco sbranato -> branco stordito anche con l'Innocente rivelato. Boia (giustizia da evento: attore, Conferma, bersaglio, Conferma): su lupo e Nonna "Morto un lupo: il Cucciolo e' diventato Lupo Mannaro adulto"; su Innocente, Inquisitore (N2 "Chiama comunque G31"), Scemo: Diario "Il Boia G22 giustizia G..". Nessun problema.

### BIG-K (Cucciolo, Sciacallo, Alchimista, Mucca, Mezzosangue)
- Rogo del Cucciolo (banner "Vendetta del Cucciolo: i lupi sbraneranno due persone la prossima notte"), N2 lo Sciacallo lo resuscita: alba "G05 e' stato resuscitato". Nel passo Branco di quella notte G05 e' ancora tra i "Morti" e la vendetta e' attiva (dopo la prima scelta "vittima 2 di 2"). Se le due vittime non vengono scelte la vendetta resta pendente alla notte 3 ("vittima 1 di 2") con il Cucciolo ormai vivo. DUBBIO (non bug certo): se il Cucciolo e' stato resuscitato la vendetta andrebbe azzerata al momento della resurrezione (alba) oppure documentata; proposta: azzerare `vendettaCucciolo` quando il Cucciolo torna in vita.
- Alchimista al rogo che trascina il Cucciolo: "morto per l'esplosione", vendetta alla notte dopo (due vittime G47+G48), N3 branco normale; sul VM: "Chiama comunque G11" in N2. Rogo della Mucca: il Cucciolo non matura (non e' un lupo), la Figlia (genitore Mucca) diventa lupo. Mezzosangue morso e poi bruciato da lupo: Cucciolo adulto.

### BIG-L/M (Paladino, vittoria, Spilungone, Gallo)
Paladino sulla Guardia Mannara ("Il morso non ha effetto su G14: e' protetto/a") e sul Criceto ("il Criceto Malvagio non puo' essere sbranato"); Medium su Paladino e Criceto bruciati ("Mostra la carta"). Scenari di vittoria (checkpoint con `setVivi` a pochi vivi, morso e alba giocati dalla UI): Nonna+Criceto+villico -> "Il Criceto Malvagio ruba la vittoria"; lupo+Mucca+Mezzosangue morso -> lupi vincono (Mucca contata col villaggio); due lupi con GM/Guardia + Polpo/Spilungone/Villico -> morso sul villico: lupi vincono (GM, Polpo e Spilungone contati con il villaggio).
Spilungone: rivelato al primo voto ("troppo alto per qualsiasi patibolo. La notte cala senza vittime"), poi Maga lo trasforma, Cartomante vede "Spilungone", Nano sbranato senza effetto, Eremita e Nano bruciati nei giorni seguenti (Apprendista eredita), Gallo salta il giorno.
**DUBBIO (regola Spilungone)**: dal secondo giorno in cui lo Spilungone gia' rivelato e' il piu' votato, l'esito offre "Dichiara morte sul rogo" ("Morira' anche G33 (crepacuore)") e premendolo muore davvero (G41 + G33). La regola dice "troppo alto per qualsiasi patibolo, non puo' essere messo al rogo dal villaggio" (nessuna eccezione per i giorni successivi). Causa: `Votazione.jsx:230` (`spilungoneRivelatoRound === undefined`, commento "solo il primo rogo") ed `eventiSpeciali.js:129`. Proposta: se la scelta e' voluta (rogo solo al primo tentativo) documentarlo in `testoRegole`; altrimenti rendere lo Spilungone sempre immune al rogo (come per il Boia che puo' giustiziarlo) con l'etichetta "Lo Spilungone si rivela e non muore". Da decidere dal proprietario.

### BIG-N/O/P/Q (Nano, Mucca, Ubriaco, Cartomante, Gallo, Guaritore, Maga, Polpo)
- Nano: branco sul Nano "non puo' essere sbranato" (ripetuto 5 volte); Cortigiana che lo visita muore ("il suo cliente G35 e' stato visitato dai lupi"); Scemo sbaglia la rima e muore con il Nano vivo; N3 il Villico G47 sbranato normalmente; Veggente legge Eremita "malvagia" e poi il Nano "benevola" + messaggio ambasciatore.
- Mucca: Untore la unge, morte per unzione (vicini G07/G09 unti) e la Figlia (genitore Mucca) diventa lupo; Fattucchiera sulla Mucca: avviso "Non puo' inibire Mucca Mannara: non puo' essere inibita", Avanti abilitato (non bloccante, come da decisione).
- Ubriaco: Maga + Untore + branco sullo stesso Ubriaco (trasformato, poi morto): "il branco sara' stordito", N3 "ancora stordito", alba "Nessuno e' morto"; Medium "carta: Ubriaco"; Addolorata che prende la carta dell'Ubriaco bruciato e viene sbranata: stesso avviso/stordimento.
- Cartomante: su Lupo ("Lupo Mannaro"), Criceto ("Criceto Malvagio"), Maga ("Maga", anche se la Maga la trasforma nella stessa notte).
- Gallo: resuscitato dallo Sciacallo puo' ancora far saltare il giorno; Gallo morto per unzione non e' piu' offerto; Veggente sul Gallo "benevola"; Medium "carta: Gallo Mannaro".
- Maga su Lupo (resta nel passo Branco e caccia), Maga sul Polpo (Veggente indaga lo stesso e viene accecato), Guaritore che resuscita il Mezzosangue (poi morso: diventa lupo) e il Polpo (la cecita' del Veggente non si riattiva senza una nuova lettura del Polpo). Pastore con VM e Polpo adiacenti: nessun belato.
- Vittoria con Mezzosangue/Mucca e con Nonna/Criceto: vedi BIG-L.

### MINI-R/S/T/U (Ladro, Bardo, Apprendista, Mucca)
- Ladro (4 giocatori + 2 carte extra Criceto e Villico): sceglie il Criceto, branco senza effetto sul Criceto, all'alba "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui". Il banner arriva solo all'alba (dopo il rogo che porta lupo + Criceto la schermata del giorno non lo mostra: comportamento gia' noto "vittoria solo all'alba").
- Bardo (12 giocatori con Guardie, Chupacabra, Criceto, Paladino, Scemo): gesto N1, "Il Bardo salta la notte" dopo il rogo, notte 2 "non si svolge per i poteri del Bardo" (tasto "Vai all'alba"), Scemo sbaglia rima al giorno 2, N3 Paladino sul Criceto con branco senza effetto e Chupacabra che uccide il lupo G01.
- Apprendista (9 giocatori, due Apprendisti: maestro Lupo e maestro Mezzosangue): il primo eredita Lupo Mannaro e compare nel passo Branco; il secondo, con il Mezzosangue gia' morso e bruciato da lupo, eredita "Lupo Mannaro" (vedi DUBBIO 3).
- Mucca (11 giocatori con Nano, Mezzosangue, Polpo, GM, Guardie): "Lupi mannari: G01, G02" senza Polpo/Mezzosangue/GM; branco sul Nano senza effetto.

### Controlli trasversali
Console senza errori ne' warning in tutti gli scenari (la libreria stampa ogni error/warning: nessuna riga). Overflow orizzontale controllato (390 px) su alba, eventi, voto, esito, dopo rogo, passi notturni con avvisi, alba: nessuno. Ricarica a meta' passo (scelta Cartomante e scelta del branco con avviso): selezione e avvisi mantenuti. Tasto Indietro del telefono nel passo Branco: resta nel passo, scelta mantenuta (come da decisione). "Indietro" nel passo Cartomante con scelta fatta annulla la scelta restando sul passo (non un bug noto; segnalato solo come osservazione).

## BUG CERTI
Nessuno nuovo: tutte le 115 coppie dell'elenco hanno mostrato il comportamento atteso del regolamento e delle decisioni gia' prese.

## DUBBI (con proposta)
1. **Spilungone gia' rivelato: dal secondo giorno il rogo lo uccide.** Passi: BIG, giorno 1 voto su G41 (Spilungone '?') "Si rivela: e' lo Spilungone" Conferma ("troppo alto per qualsiasi patibolo. La notte cala senza vittime"); notte 2 e 3 qualsiasi; giorno 3 voto su G41: esito "Vittima designata G41 - Morira' anche G33 (crepacuore)", "Dichiara morte sul rogo" -> muore (e il partner del Sacerdote). Causa: `src/features/giorno/Votazione.jsx:230` (`spilungoneRivelatoRound === undefined`, commento "solo il primo rogo") ed `src/data/eventiSpeciali.js:129`. Regola: "non puo' essere messo al rogo dal villaggio durante il giorno" senza eccezioni; la decisione "Boia puo' giustiziare lo Spilungone" non riguarda il rogo. Proposta: lo Spilungone noto resta immune al rogo ogni volta (esito "Lo Spilungone si rivela e non muore"), oppure, se la scelta e' voluta, scriverlo in `testoRegole`.
2. **Vendetta del Cucciolo ancora pendente dopo la resurrezione del Cucciolo.** Passi: BIG, rogo del Cucciolo, N2 lo Sciacallo lo resuscita (alba "G05 e' stato resuscitato"), nel passo Branco di quella notte il Cucciolo e' ancora "Morto" e la vendetta e' attiva ("vittima 2 di 2" dopo la prima scelta); se non si scelgono le due vittime la vendetta resta alla notte 3 ("vittima 1 di 2") col Cucciolo ormai vivo. Proposta: azzerare `vendettaCucciolo` quando il Cucciolo viene resuscitato (all'alba) o, in alternativa, consumarla comunque ma non farla riportare alla notte successiva.
3. **Apprendista di un Mezzosangue gia' trasformato eredita "Lupo Mannaro".** MINI-T: maestro Mezzosangue morso (lupo) poi bruciato: Diario "eredita il ruolo di Lupo Mannaro dal maestro G05" mentre Cartomante/Medium sul maestro vedono la carta fisica "Mezzosangue" (decisione sulle carte fisiche). Coerente con "l'Apprendista prende il ruolo attuale"; proposta: lasciare e annotare nel Diario "(Mezzosangue gia' lupo)" oppure farlo ereditare la carta Mezzosangue. Basso impatto.

## NON COPERTO
- Mimo e Mimo-Medium (fuori elenco). Ladro solo con Criceto (altre carte coperte da 16-b/16-e).
- Le partite "BIG" partono da un checkpoint di localStorage a fine alba 1 (notte 1 giocata dalla UI con Apprendista->Eremita, Cavaliere->Sciacallo, Figlia->Mucca, Sacerdote Maga+Spilungone); i ruoli "?" (Spilungone, Antico, Suocera, Scemo, Villico, Innocente, Boia, Alchimista) sono assegnati dal checkpoint e i loro eventi giocati dalla UI (Spilungone/Antico/Alchimista al voto, Innocente/Scemo/Boia/Suocera da Eventi speciali).
- Gli scenari di vittoria (BIG-L) usano `setVivi` (localStorage) per ridurre i vivi; morso, alba e banner sono giocati dalla UI.
- Non provati: Antico sbranato di notte con queste coppie, Boia su protetto da Cavaliere/Paladino, Alchimista che trascina il Cavaliere/protetto (gia' in altri report), Chupacabra dopo la morte dei lupi con queste coppie, timer di spareggio.

## LISTA COPPIE

```
eremita x polpo-mannaro: si, BIG N2-N3: il Veggente accecato dal Polpo (aura benevola alla prima lettura) legge poi l'Eremita: 'Aura benevola' invece che malvagia, e arriva il messaggio dell'ambasciatore
chupacabra x guardia: si, BIG N2: Chupacabra caccia una Guardia: 'G15 non e' un lupo: la caccia del Chupacabra fallisce'
fantasma-onnisciente x figlia-dei-lupi: si, BIG: rogo della Figlia (genitore vivo): Fantasma assegnato a lei (Diario), il Medium alla notte vede 'carta Figlia dei Lupi'
ambasciatore x lantico: si, BIG: rogo dell'Antico (Conferma), N2 maledetta: passi solo Pifferaio, VM, Sciacallo, Branco, Chupacabra (niente Veggente, niente messaggio ambasciatore); N4 Veggente legge l'Antico: benevola + messaggio
boia x lupo-mannaro: si, BIG: Boia giustizia un lupo da evento: 'Morto un lupo: il Cucciolo e' diventato Lupo Mannaro adulto', Diario ok
lupo-mannaro-capobranco x veggente-mannaro: si, BIG N2: VM e Veggente leggono il Capobranco: 'Aura malvagia'; il branco sbrana il VM (G11): muore, N3 passo VM 'Chiama comunque G11, anche se morto'
inquisitore x mezzosangue: si, BIG N3: Inquisitore interroga il Mezzosangue gia' lupo: 'si (aura malvagia)', non perde il potere (N4 interroga ancora)
fantasma-onnisciente x veggente-mannaro: si, BIG: rogo del VM e Fantasma a lui: N2 passo VM 'Chiama comunque G11 per il suo turno, anche se morto/a', nessuna scelta; Medium vede 'Veggente Mannaro'
fantasma-onnisciente x untore: si, BIG: rogo dell'Untore e Fantasma a lui: N2 passo Untore 'Chiama comunque G45', nessuna unzione, alba senza unti
criceto-malvagio x ladro: si, MINI: il Ladro (G02) sceglie il Criceto Malvagio fra le due carte lasciate fuori (Diario 'Il Ladro G02 sceglie Criceto Malvagio: scarta Villico'); lupo+Criceto superstiti, morso senza effetto sul Criceto, all'alba 'Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui'
berserker x guardia-mannara: si, assenza di interazione provata: BIG N3 (posti: G01 lupo, G30, G21 Berserker, G35, G14 GM...): branco sbrana il Berserker: avviso 'G01 (il lupo piu' vicino) morira' con lui', GM adiacente ignorata, alba G01+G21 morti, Diario ok
eremita x lantico: si, BIG: dopo la notte maledetta N3 il Veggente legge l'Eremita: 'Aura malvagia' (nessun messaggio), N4 legge l'Antico: benevola; in N2 maledetta il Veggente non puo' leggere nessuno
cucciolo-di-lupo-mannaro x sciacallo-mannaro: si, BIG K1: rogo del Cucciolo (banner vendetta), N2 Sciacallo lo resuscita: alba 'G05 e' stato resuscitato'; DUBBIO: durante la notte il Cucciolo e' ancora tra i Morti e la vendetta resta attiva (vittima 2 di 2 dopo la prima scelta), se non consumata resta pendente anche con il Cucciolo vivo (N3 'vittima 1 di 2')
inquisitore x scemo-del-villaggio: si, BIG N2: Inquisitore interroga G40 Scemo ('?'): 'no (aura benevola)'; N3 'Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola'
guardia-mannara x paladino: si, BIG N2: Paladino protegge la Guardia Mannara, il branco la sceglie: 'Il morso non ha effetto su G14: e' protetto/a', alba 'Nessuno e' morto'; N4 senza protezione il branco la sbrana (G14 morta)
figlia-dei-lupi x inquisitore: si, BIG N2: Inquisitore interroga G50 Figlia (genitore vivo): 'no (aura benevola)'; N3 'Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola'
nano x scemo-del-villaggio: si, assenza di interazione provata: BIG N2: branco sul Nano 'non puo' essere sbranato'; giorno: lo Scemo ('?') sbaglia la rima e muore ('ha sbagliato la rima ed e' morto/a'), Nano vivo
borgomastro x mezzosangue: si, BIG: Mezzosangue eletto Borgomastro e morso: diventa lupo, nessuna richiesta di rielezione, resta Borgomastro
inquisitore x suocera: si, BIG N2: Inquisitore interroga G43 Suocera ('?'): 'no (aura benevola)'; N3 'Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola'
guardia-mannara x polpo-mannaro: si, assenza di interazione provata: BIG (2 lupi, GM, Polpo, villico; morso sul villico): vittoria lupi, GM e Polpo contati con il villaggio
addolorata x ubriaco: si, BIG: rogo Ubriaco G44, N2 Addolorata scambia (ora Ubriaco), N3 il branco sbrana G17: avviso 'G17 e' l'Ubriaco: il branco sara' stordito', Diario ok
boia x nonna: si, BIG: Boia giustizia la Nonna: conta come lupo (Cucciolo adulto), Diario ok
lupo-mannaro-capobranco x strega: si, BIG N2: pozione vitale su Capobranco e branco lo sceglie: 'Il morso non ha effetto su G03: e' protetto/a', alba 'Nessuno e' morto'; N3 pozione mortale su di lui: muore (la vitale non si ripete)
cortigiana x innocente: si, BIG: Innocente rivelato (evento) N2 Cortigiana visita G30 e il branco lo sbrana: avviso 'entrambi moriranno', alba G26+G30 morti, Diario 'La Cortigiana muore: il suo cliente G30 e' stato sbranato'
alchimista x veggente-mannaro: si, BIG K4: Alchimista trascina il VM (G11): Diario 'morto per l'esplosione', N2 passo VM 'Chiama comunque G11, anche se morto/a'
berserker x innocente: si, assenza di interazione provata: BIG N3: Innocente adiacente al Berserker ignorato, muore il lupo piu' vicino G01
figlia-dei-lupi x strega: si, BIG N2: pozione mortale sul genitore della Figlia (Mucca G08): alba 'G50 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro'
mezzosangue x polpo-mannaro: si, BIG N2-N4: Mezzosangue sbranato diventa lupo; il Veggente accecato dal Polpo lo legge benevolo anche da lupo (N4)
guardia-mannara x villico: si, assenza di interazione provata: BIG stessa partita: Villico sbranato, 2 lupi vs GM+Polpo: vincono i lupi; GM conta tra gli abitanti
chupacabra x innocente: si, BIG N3: Chupacabra caccia l'Innocente: 'G30 non e' un lupo: la caccia fallisce' (Innocente non morto)
boia x innocente: si, BIG: Boia giustizia l'Innocente (non rivelato): morto, Diario 'Il Boia G22 giustizia G30'
ambasciatore x lupo-mannaro-capobranco: si, BIG N2: Veggente legge il Capobranco: 'Aura malvagia', all'alba nessun messaggio dell'ambasciatore
innocente x lupo-mannaro: si, BIG: Innocente rivelato di giorno poi rogo del lupo G01 (Diario 'G30 si e' rivelato: e' Innocente', 'G01 e' morto al rogo', Cucciolo adulto); poi il branco sbrana l'Innocente rivelato N2: muore normalmente
gallo-mannaro x sciacallo-mannaro: si, BIG: rogo del Gallo, N2 lo Sciacallo lo resuscita ('G09 e' stato resuscitato'): all'alba il menu Eventi speciali offre di nuovo 'Il Gallo Mannaro salta il giorno' e la notte 3 parte direttamente
ambasciatore x medium: si, BIG: rogo dell'Ambasciatore; N2 il Medium lo interroga: 'Mostra a Medium la carta: Ambasciatore'; Veggente legge benevolo: nessun messaggio all'alba
berserker x pastore: si, BIG N2: Pastore accanto al lupo G01: alba 'Si sentono dei belati'; N3 Berserker sbranato uccide G01: alba senza belati (il Pastore non ha piu' lupi vicini)
guardia x villico: si, assenza di interazione provata: BIG stessa partita: Villico sbranato con la Guardia viva: nessuna interazione, vittoria lupi
gallo-mannaro x spilungone: si, BIG: Spilungone rivelato D1, alba 2 Gallo salta il giorno (notte 3 diretta), D3 voto sullo Spilungone gia' rivelato: l'esito offre 'Dichiara morte sul rogo' e muore (G41 + G33 per crepacuore): DUBBIO sulla regola 'non puo' essere messo al rogo dal villaggio' (Votazione.jsx:230 'solo il primo rogo')
pastore x strega: si, BIG N2 belati con G01 vicino; N3 pozione mortale su G01: alba G01 morto e nessun belato
cavaliere x maga: si, M2: Cavaliere trasformato in maiale dalla Maga (N3) si immola comunque al posto del protetto; un altro Cavaliere protegge la Maga e si immola (N2)
eremita x spilungone: si, assenza di interazione provata: BIG: Spilungone rivelato D1; D2 rogo dell'Eremita: Apprendista G20 eredita Eremita (Diario), Spilungone indifferente
cavaliere x veggente-mannaro: si, M1: Cavaliere protegge il VM, branco lo sbrana: 'Il Cavaliere si immola al posto di G03', VM salvo; alba e Diario ok
ambasciatore x suocera: si, assenza di interazione provata: BIG N2: Veggente indaga la Suocera ('?'): 'Aura benevola', messaggio ambasciatore all'alba
polpo-mannaro x villico: si, assenza di interazione provata: BIG stessa partita: Polpo conta come abitante con il Villico (non e' un lupo): vittoria lupi solo dopo il morso del Villico
mucca-mannara x nano: si, assenza di interazione provata: MINI-U N1: passo Mucca 'Lupi mannari: G01, G02' (Nano, Polpo, Mezzosangue, GM non elencati), branco sul Nano 'non puo' essere sbranato' (Nessuno e' morto), Nano poi bruciato
mucca-mannara x untore: si, BIG N2: Untore unge la Mucca; giorno: morte per unzione della Mucca, unzione ai vicini G07/G09, 'La Figlia dei Lupi G50 e' diventata Lupo Mannaro' (genitore Mucca)
strega x untore: si, BIG N2: Untore unge G47 e la Strega avvelena l'Untore: Untore morto, 'G47 e' stato unto' all'alba e morte per unzione di giorno (Diario ok)
bardo x guardia: si, assenza di interazione provata: MINI-S (12 giocatori): Guardie presenti, Bardo mostra il gesto N1, Bardo fa saltare la notte 2 ('Questa notte non si svolge per i poteri del Bardo'), nessuna interferenza con le Guardie
alchimista x cucciolo-di-lupo-mannaro: si, BIG K2/K3: Alchimista al rogo trascina il Cucciolo: 'morto per l'esplosione', banner vendetta, N2 branco sbrana due vittime (vittima 2 di 2, alba G47+G48), N3 branco normale
cortigiana x mezzosangue: si, BIG N2: Cortigiana visita il Mezzosangue e il branco lo morde: avviso 'morira' comunque', all'alba Cortigiana morta e Mezzosangue lupo (Diario 'il suo cliente G13 era un lupo')
cartomante x spilungone: si, BIG N2: Cartomante su Spilungone gia' rivelato: 'Mostra a Cartomante la carta: Spilungone'
pastore x veggente-mannaro: si, assenza di interazione provata: BIG N2 (posti: VM e Polpo adiacenti al Pastore): nessun belato (non sono lupi)
eremita x gallo-mannaro: si, BIG N2 Veggente legge l'Eremita: malvagia; alba 2 il Gallo salta il giorno; N3 Veggente legge il Gallo: 'Aura benevola' + messaggio ambasciatore
cortigiana x nano: si, BIG N2: Cortigiana visita il Nano e il branco lo sceglie: Cortigiana muore ('il suo cliente G35 e' stato visitato dai lupi'), Nano illeso
guardia-mannara x ubriaco: si, assenza di interazione provata: BIG N2/N3: Ubriaco sbranato con la GM viva: branco stordito N3 (GM non e' nel branco, nessun effetto su di lei)
inquisitore x mucca-mannara: si, BIG N2: Inquisitore interroga G08 Mucca: 'no (aura benevola)'; N3 'Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola'
boia x scemo-del-villaggio: si, BIG: Boia giustizia lo Scemo ('?'): morto, Diario ok
berserker x inquisitore: si, BIG N2: Inquisitore interroga G21 Berserker: 'no (aura benevola)'; N3 'Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola'
cartomante x maga: si, BIG N2: Maga trasforma la Cartomante ('G23 e' stato trasformato in maiale') e la Cartomante vede 'carta: Maga' (agisce normalmente)
cartomante x lupo-mannaro: si, BIG N2: Cartomante sul Lupo: 'Mostra a Cartomante la carta: Lupo Mannaro'
apprendista x lupo-mannaro: si, MINI-T: Apprendista G03 segue il Lupo G01; rogo di G01: Diario 'L'Apprendista G03 eredita il ruolo di Lupo Mannaro dal maestro G01'; N2 passo Branco 'Vivi: G02, G03' (l'Apprendista caccia con il branco)
ambasciatore x untore: si, BIG N2: Untore unge l'Ambasciatore, Veggente legge benevolo (messaggio all'alba); giorno: morte per unzione dell'Ambasciatore, unzione ai vicini G18/G20; N3 stessa lettura benevola ma nessun messaggio (Ambasciatore morto)
figlia-dei-lupi x pastore: si, MINI-F N2: Figlia (genitore villico G09) accanto al Pastore: genitore sbranato, alba 'si sentono dei belati' + 'G06 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro'
cavaliere x inquisitore: si, M1: Cavaliere protegge l'Inquisitore, rogo: 'Il Cavaliere G07 lo protegge: si immola al suo posto', Inquisitore sopravvive
bardo x chupacabra: si, MINI-S: N2 saltata (nessuna caccia), N3 il Chupacabra caccia il lupo G01: alba 'G01' morto
cucciolo-di-lupo-mannaro x mezzosangue: si, BIG K5: Mezzosangue sbranato diventa lupo, poi rogo del Mezzosangue-lupo: Diario 'G05 ha assunto il ruolo di Lupo Mannaro' (Cucciolo adulto)
mucca-mannara x spilungone: si, assenza di interazione provata: BIG: Spilungone rivelato D1 ('La notte cala senza vittime'), Mucca viva; D4 rogo della Mucca: nessuna interferenza, la Figlia (genitore Mucca) diventa lupo
mezzosangue x mucca-mannara: si, assenza di interazione provata: BIG: sopravvivono lupo, Mucca, Mezzosangue; morso sul Mezzosangue: diventa lupo e subito 'I Lupi sono in numero pari o superiore al resto del villaggio: vincono loro' (Mucca contata col villaggio)
chupacabra x eremita: si, BIG N4: Chupacabra caccia l'Eremita: 'G27 non e' un lupo: la caccia del Chupacabra fallisce'
boia x inquisitore: si, BIG: Boia giustizia l'Inquisitore: N2 passo Inquisitore 'Chiama comunque G31, anche se morto/a'
maga x spilungone: si, BIG N2: Maga trasforma lo Spilungone rivelato: 'G41 e' stato trasformato in maiale', resta vivo (il rogo successivo e' DUBBIO, vedi sotto)
inquisitore x veggente: si, BIG N2: Inquisitore interroga G46 Veggente: 'no (aura benevola)'; N3 'Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola'
criceto-malvagio x paladino: si, BIG N3: Paladino protegge il Criceto e il branco lo sceglie: avviso 'Il morso non ha effetto su G12: il Criceto Malvagio non puo' essere sbranato', alba 'Nessuno e' morto'
bardo x criceto-malvagio: si, assenza di interazione provata: MINI-S: notte 2 saltata con il Criceto vivo; N3 morso sul Criceto: 'non puo' essere sbranato'
criceto-malvagio x medium: si, BIG: rogo del Criceto, N2 Medium: 'Mostra a Medium la carta: Criceto Malvagio'
nano x villico: si, assenza di interazione provata: BIG N2 branco sul Nano: nessun effetto; N3 branco sul Villico G47: muore (alba G47)
figlia-dei-lupi x mezzosangue: si, MINI-F N3: genitore Mezzosangue sbranato non muore ma diventa lupo: la Figlia (G07) resta Figlia, non diventa lupo, Branco Vivi senza di lei
scemo-del-villaggio x veggente: si, BIG N2: Veggente indaga lo Scemo ('?'): 'Aura benevola' + messaggio ambasciatore all'alba
borgomastro x fantasma-onnisciente: si, BIG: Borgomastro G20 al rogo: Diario 'era il Borgomastro: ... eleggerne uno nuovo', Fantasma a G20, rielezione G19 dal menu, alba senza avviso
spilungone x strega: si, BIG N2: pozione mortale sullo Spilungone ('?', innamorato di G33 per il Sacerdote): muore di notte, G33 muore di crepacuore (alba 'morto di crepacuore')
innocente x ubriaco: si, assenza di interazione provata: BIG N2: branco sbrana l'Ubriaco (avviso 'sara' stordito'), giorno: Innocente si rivela (evento) e rogo di un altro; N3 'stordito dall'alcol', alba 'Nessuno e' morto'
bardo x scemo-del-villaggio: si, assenza di interazione provata: MINI-S: dopo la notte saltata lo Scemo ('?') sbaglia la rima e muore (Diario 'Giorno: G09 e' morto/a per aver sbagliato la rima')
medium x paladino: si, BIG: rogo del Paladino, N2 Medium: 'Mostra a Medium la carta: Paladino'
criceto-malvagio x nonna: si, BIG: sopravvivono Nonna, Criceto e un villico, morso sul villico: 'Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui'
berserker x nano: si, assenza di interazione provata: BIG N3: Nano adiacente ignorato, muore il lupo G01
cucciolo-di-lupo-mannaro x mucca-mannara: si, BIG K5: rogo della Mucca (non e' un lupo): il Cucciolo NON diventa adulto (Diario senza 'assunto il ruolo'), la Figlia (genitore Mucca) diventa lupo
pastore x untore: si, BIG N2: Untore unge il Pastore (belati + 'unto' all'alba); giorno: morte per unzione del Pastore, unzione ai vicini vivi G01 e G16; N3 alba senza belati
nano x spilungone: si, assenza di interazione provata: BIG: Spilungone rivelato D1; N2 branco sul Nano 'Il morso non ha effetto: il Nano non puo' essere sbranato'; D3 rogo del Nano: muore (come da regola), Spilungone vivo
guardia x polpo-mannaro: si, assenza di interazione provata: BIG (2 lupi, Guardia, Polpo, villico; morso sul villico): vittoria lupi, Polpo e Guardia contati con il villaggio
cavaliere x cucciolo-di-lupo-mannaro: si, M2: Cavaliere protegge il Cucciolo, branco lo sceglie: 'Il Cavaliere si immola al posto di G02', il Cucciolo si salva (nessuna vendetta)
figlia-dei-lupi x gallo-mannaro: si, MINI-F N4: genitore Gallo sbranato: alba 'G08 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro'
criceto-malvagio x inquisitore: si, BIG N2: Inquisitore interroga G12 Criceto: 'no (aura benevola)'; N3 'Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola'
pastore x ubriaco: si, BIG N2 (posti G01 lupo, G44 Ubriaco, G37 Pastore): branco sbrana l'Ubriaco, alba 'Si sentono dei belati' (il Pastore guarda oltre l'Ubriaco morto, primo vivo G01), N3 branco stordito
spilungone x veggente: si, BIG N2: Veggente indaga lo Spilungone ('?'): 'Aura benevola' + messaggio ambasciatore
eremita x nano: si, assenza di interazione provata: BIG N2 Veggente legge l'Eremita (malvagia); N3 Veggente legge il Nano (benevola, messaggio ambasciatore) mentre il branco lo sceglie: Nessuno e' morto
gallo-mannaro x untore: si, BIG N2: Untore unge il Gallo; giorno: morte per unzione; alba 3: l'evento 'Il Gallo Mannaro salta il giorno' non e' piu' offerto
maga x polpo-mannaro: si, BIG N2: Maga trasforma il Polpo e il Veggente lo indaga: 'Accecato dal Polpo Mannaro', 'Aura benevola' + messaggio ambasciatore, alba 'G07 e' stato trasformato in maiale'
cavaliere x gallo-mannaro: si, M1: Cavaliere protegge il Gallo, branco lo sbrana: Cavaliere si immola, Gallo salvo
medium x ubriaco: si, assenza di interazione provata: BIG N3: Medium sull'Ubriaco sbranato: 'Mostra a Medium la carta: Ubriaco'
guaritore x mezzosangue: si, BIG: rogo del Mezzosangue, N2 il Guaritore lo resuscita ('G13 e' stato resuscitato'), N3 il branco lo sceglie: 'e' stato bersaglio dei lupi e diventa Lupo Mannaro'
lupo-mannaro x maga: si, BIG N2: Maga trasforma un Lupo: il passo Branco lo elenca ancora tra i vivi e il branco sbrana G47 (alba 'G47' + 'G01 e' stato trasformato in maiale')
maga x ubriaco: si, BIG N2: Maga trasforma l'Ubriaco e il branco lo sbrana: 'G44 e' l'Ubriaco: il branco sara' stordito', Diario trasformato, N3 'stordito dall'alcol', alba 'Nessuno e' morto'
fantasma-onnisciente x guardia: si, BIG: rogo di una Guardia e Fantasma a lei: il Medium chiede 'Guardia o Guardia Mannara?' (carta fisica indistinguibile), Diario ok
guardia x spilungone: si, assenza di interazione provata: BIG (2 lupi, Guardia, Spilungone '?', villico; morso sul villico): vittoria lupi, Guardia e Spilungone contati con il villaggio
guaritore x polpo-mannaro: si, BIG: Polpo bruciato (Veggente non piu' accecato: 'ha perso la condizione accecato'), N4 il Guaritore lo resuscita; N5 il Veggente legge 'Aura malvagia' correttamente (la cecita' non si riattiva senza una nuova lettura del Polpo)
ubriaco x untore: si, BIG N2: Untore unge l'Ubriaco sbranato la stessa notte: Ubriaco morto, nessuna unzione residua, N3 branco stordito
apprendista x mezzosangue: si, MINI-T: Apprendista G04 segue il Mezzosangue G05; N2 il Mezzosangue morso diventa lupo, giorno: rogo di G05: 'L'Apprendista G04 eredita il ruolo di Lupo Mannaro dal maestro G05' (ruolo attuale, non la carta fisica Mezzosangue: vedi DUBBIO), N3 Branco 'Vivi: G02, G03, G04'
criceto-malvagio x veggente-mannaro: si, BIG N2: il Veggente Mannaro indaga il Criceto: 'Aura benevola'
ambasciatore x nano: si, assenza di interazione provata: BIG N2: Veggente legge il Nano (benevola) e il branco lo sceglie: nessuna morte, messaggio ambasciatore all'alba
bardo x paladino: si, MINI-S: N2 saltata (nessun passo Paladino), N3 il Paladino protegge il Criceto e il branco lo sceglie: nessun effetto
fattucchiera x mucca-mannara: si, BIG N2: Fattucchiera sceglie la Mucca: avviso 'Non puo' inibire Mucca Mannara: non puo' essere inibita', Avanti resta abilitato (non bloccante)
cavaliere x fattucchiera: si, M2 N2: Cavaliere inibito dalla Fattucchiera, branco sbrana il protetto: il Cavaliere si immola comunque (potere passivo non bloccato)
berserker x fattucchiera: si, BIG N3: Fattucchiera inibisce il Berserker (Diario 'inibito'), branco lo sbrana: uccide comunque G01 (potere passivo)
cartomante x criceto-malvagio: si, BIG N2: Cartomante sul Criceto: 'carta: Criceto Malvagio'
gallo-mannaro x medium: si, BIG: rogo del Gallo, N2 Medium: 'Mostra a Medium la carta: Gallo Mannaro'
```

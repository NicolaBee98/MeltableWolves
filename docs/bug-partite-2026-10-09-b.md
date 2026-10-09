# Batch di partite di prova (Ladro x ruoli della prima notte, Cartomante/Medium x Ladro) - 2026-10-09 (b)

Chromium reale (Playwright, 390x844, dev server porta 5542), nessuna modifica al codice. Mazzi piccoli (5-8 giocatori, G01 sempre il Ladro), i passi oggetto del test giocati dalla UI (mazzo, giocatori, assegnazione, scelta delle due carte extra, azioni notturne, alba, rogo, Eventi speciali, Diario). Console: nessun errore/warning in tutte le partite. Nessun overflow orizzontale.

## Scenario 1 - Ladro prende un ruolo con scelta di prima notte
- **Ladro -> Sacerdote** (mazzo 9 carte: Ladro, Sacerdote, Cavaliere, 2 Lupi, 4 Villici; extra Sacerdote + Villico): il passo Sacerdote compare dopo Lupo e Cavaliere (ordine del libretto) con G01 gia' titolare; coppia G01+G02 (lupo) -> passo "Innamorati (si riconoscono)" -> rogo di G02: "Morira' anche G01 (crepacuore)", "E' morto anche G01"; stato e registro corretti. **ok**. Con il Sacerdote scartato (Ladro prende Cavaliere o resta Villico) il passo "Sacerdote" compare comunque con "Carta non assegnata a nessun giocatore: chiama comunque il ruolo". **ok**
- **Ladro -> Cavaliere**: G01 sceglie il protetto G05, il branco sbrana G05: "Il Cavaliere si immola al posto di G05: muore G01", all'alba "G01 si e' rivelato: e' il Cavaliere...". **ok** (nel Diario lo stesso evento compare 3 volte con testi diversi: vedi dubbio 6).
- **Ladro -> Figlia dei Lupi**: genitore G04 sbranato -> all'alba "G01 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro"; notte 2 "Vivi: G01, G02, G03" nel Branco. **ok**
- **Ladro -> Pifferaio**: passo Pifferaio + "Ipnotizzati" nello stesso giro, 2 notti (G02,G03 poi G04,G05) -> all'alba 2 "Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui". Il Ladro-Pifferaio non e' ipnotizzato e conta come Pifferaio. **ok**
- **Ladro -> Strega**: notte 1 pozione vitale su G07 + mortale su G04: all'alba muore solo G04. Notte 2: "Pozione vitale/mortale gia' utilizzata in questa partita", poteriUsati sul Ladro-Strega. Refresh a meta' notte 2 ok. **ok**
- **Ladro -> Chupacabra**: caccia G02 (lupo) riuscita, notte 2 G03, poi non ci sono piu' lupi e il Chupacabra caccia i villici; all'alba 3 "Il Chupacabra e' l'ultimo sopravvissuto: vince lui". **ok** (vedi dubbio 5 sul momento dell'annuncio).
- **Ladro -> Cortigiana**: cliente G05 sbranato -> muoiono G05 e G01 ("cliente-sbranato"); visita al lupo G02 con G01 sbranato -> muore G01 ("cliente-lupo"), non e' morta di morso. **ok**
- **Ladro -> Berserker**: sbranato G01 -> muore con il lupo piu' vicino G02, avviso "Se il Berserker sara' sbranato, G02 (il lupo piu' vicino) morira' con lui" gia' prima del morso. **ok**
- **Ladro -> Cucciolo (extra Cucciolo + Progenitore)**: il Cucciolo e' G01, "Vivi: G01, G02" nel Branco; il Progenitore scartato viene chiamato ("Carta non assegnata..."); rogo di G01: "Vendetta del Cucciolo..." e notte 2 "vittima 1 di 2". La regola "entrambe Lupi: devi scambiare" funziona (nasconde "Resta Villico") ma solo con due ruoli lupo DIVERSI: vedi BUG 3. **ok** con riserva
- **Ladro -> Progenitore**: G01 progenitore, trasforma G05 (chip "Il Progenitore trasforma G05 in Lupo Mannaro"); all'alba G05 e' lupo, notte 2 "Vivi: G01, G02, G05", poteri "progenitore-trasforma" gia' usato (niente secondo uso). **ok** (la trasformazione non lascia voce nel Diario ne' nell'alba: gia' noto, batch3).
- **Ladro -> Bardo**: dopo il rogo "Il Bardo salta la notte" disponibile solo perche' il Ladro-Bardo ha il potere; Conferma -> notte 2 "Questa notte non si svolge per i poteri del Bardo", Indietro annulla. Se il Bardo e' scartato l'evento non c'e' (richiede un titolare). **ok**
- **Ladro -> L'Antico**: nessun passo notturno (rivelazione diurna), G01 sbranato la notte 1 -> "e' L'Antico: ha perso la prima vita ma sopravvive"; al rogo il giorno 1 muore (seconda vita). **ok** (non ho confermato la rivelazione prima del rogo).
- **Ladro -> Guardia** e **-> Guardia Mannara**: vedi BUG 2 (passo duplicato) e dubbio 3 (Cartomante). Con la Guardia Mannara presa dal Ladro il passo "Guardie (si riconoscono)" mostra G01 + le due Guardie (tre titolari); la GM del Ladro non viene riassegnata a caso (la carta e' gia' scelta). **ok**

## Scenario 2 - Cartomante x Ladro e Medium x Ladro ("Mostra carta")
- **Cartomante indaga il Ladro che ha preso Strega (notte 1)**: l'etichetta dice "Mostra a Cartomante la carta: Ladro" e "Mostra carta" apre `/assets/carte/Ladro.svg`, ma G01 oggi e' Strega (ruoloSlug strega, storiaRuoli [ladro, strega]). **BUG/dubbio (BUG 1)**.
- **Medium interroga il Ladro-Strega morto (notte 2)**: stesso risultato, "Mostra a Medium la carta: Ladro". Stesso BUG 1.
- Cartomante su un Ladro che e' diventato Guardia Mannara: la domanda "G01 e' una Guardia: la carta e' una Guardia o la Guardia Mannara?" viene fatta anche se il Ladro ha scelto esplicitamente la GM; rispondere "Guardia" riscrive G01 come Guardia e promuove G04 a GM, contro la scelta registrata (scartoLadro [guardia-mannara, villico]). **dubbio 3**
- Chip stabili alla scelta del bersaglio, "Mostra carta" subito disponibile, refresh: ok.

## Scenario 3 - Indietro, refresh, conteggi
- **Refresh a meta' passo Ladro** (solo le due carte scelte; poi con scelta fatta; poi al passo 2; poi nel passo Sacerdote con coppia a meta'): select, chip e coppia ripristinati, quantita' del mazzo coerenti (carta scartata a 0). **ok**
- **Indietro fino al passo Ladro** dalla fine della notte 1: ogni Indietro annulla il passo precedente; quando si torna al passo 1 il Ladro e' di nuovo non assegnato, le quantita' del mazzo tornano originali (villico 4), nessun residuo su G01/G02/G04 (condizioni, legame, innamoratiCon). **ok**
- **Cambi di scelta nello stesso passo** (Sacerdote -> Strega -> Resta Villico -> Sacerdote, deselezione, cambio carta extra dopo la scelta): quantita' e storiaRuoli coerenti a ogni cambio. **ok**
- **Conteggio giocatori** con Ladro (9 giocatori su mazzo da 7 carte: "Servono 5 giocatori, ce ne sono 9 (escluse le 2 carte extra del Ladro...)"), con Fantasma Onnisciente il testo e' "esclusi il Fantasma Onnisciente, che non sono giocatori in piu'" (plurale su un solo ruolo, banale). "E' notte nel villaggio" disabilitato finche' il numero non torna. **ok**
- **Contatore passi**: con il Sacerdote non usato (scartato o coppia non scelta) si vede "Passo 4 di 6" poi "Passo 5 di 5" (innamorati stimati e poi assenti); idem Pifferaio senza scelta. Gia' noto (bassa).

## BUG CERTI
1. **Cartomante/Medium mostrano la carta "Ladro" per un Ladro che ha cambiato ruolo (media, regressione di 59de201).** `cartaIniziale = (g) => g.storiaRuoli?.[0] ?? g.ruoloSlug` (`AzioneRivelaRuolo.jsx:17`, usata a riga 93) assume che la carta fisica in mano sia sempre quella di partenza (giusto per Cucciolo cresciuto, Mimo), ma il Ladro SCAMBIA la propria carta con quella scelta (regola: "e' necessario scambiare la propria carta", `roles.js` Ladro). Risultato: etichetta e immagine a schermo intero dicono "Ladro" per un giocatore che e' Strega/Sacerdote/ecc. (anche per "Resta Villico"). Passi: mazzo Ladro+Cartomante+Strega+2 Lupi+3 Villici, G01 Ladro che prende Strega, G04 Cartomante, "Chi indagare" G01 -> "Mostra a Cartomante la carta: Ladro" + "Mostra carta" apre Ladro.svg. Idem Medium sul Ladro morto. Causa: stessa assunzione per ogni ruolo che "prende" la carta altrui (probabilmente anche Apprendista che eredita e Addolorata che scambia: non provati). Proposta: `cartaIniziale` deve ripiegare su `ruoloSlug` quando `poteriUsati` ha `ladro-scelta` (o piu' in generale, quando il cambio e' uno scambio fisico).
2. **Passo "Guardie (si riconoscono)" duplicato quando nel mazzo ci sono le Guardie senza la Guardia Mannara (media, riproducibile senza Ladro).** Mazzo Guardie (x2) + 2 Lupi + 3 Villici: dopo l'assegnazione appaiono due passi consecutivi identici ("Passo 2 di 4" e "Passo 3 di 4", stesso titolo e stessi "Vivi: G03, G04"). Con la Guardia Mannara nel mazzo il passo e' uno solo. Causa: `nightSteps.js:66` (`guardia`, escluso solo se 'guardia-mannara' e' selezionata) e `:70` (`guardia-mannara`, con `ruoli: ['guardia-mannara','guardia']`, compare anche per la sola 'guardia'): `passoEscluso` (`nightSteps.js:226`) non esclude il secondo quando manca la GM. Proposta: escludere `guardia-mannara` se non e' selezionata, o unire i due passi.
3. **Le due carte extra del Ladro non possono essere dello stesso ruolo (media).** In `AzioneLadro.jsx:46-47` `opzioniPrimaCarta` filtra `slug !== carta2` e `opzioniSecondaCarta` filtra `slug !== carta1`: scelto "Lupo Mannaro" come prima carta la seconda offre solo "Villico" (mazzo con 3 Lupi e 4 Villici); scelto "Villico" offre solo "Lupo Mannaro". Quindi due Lupi Mannari (il caso esplicito della regola "se le due carte sono entrambe Lupi Mannari devi scambiare", e il piu' comune con piu' lupi generici) o due Villici (il caso piu' comune in assoluto) non si possono registrare; e la regola `entrambiLupi` (`AzioneLadro.jsx:~69`) scatta solo con due lupi di slug diverso (es. Lupo + Cucciolo). Proposta: ammettere lo stesso slug se la quantita' disponibile e' >= 2.
4. **Il Ladro puo' scegliere Fantasma Onnisciente (e Suocera) tra le carte extra (bassa/media).** `AzioneLadro.jsx:39` esclude solo `borgomastro`; con mazzo Ladro+Fantasma+Suocera+2 Lupi+4 Villici le select offrono "fantasma-onnisciente" e "suocera". Scegliendo il Fantasma G01 diventa Fantasma Onnisciente da vivo e, dopo il primo rogo, l'app avvisa ancora "Assegna la carta del Fantasma Onnisciente al primo morto": due Fantasmi (uno vivo). Per regola (`roles.js`) il Fantasma "non viene distribuita all'inizio". Proposta: escludere `RUOLI_RIVELAZIONE_ALLA_MORTE` come il Borgomastro (per la Suocera e' un dubbio, vedi sotto).
5. **Registro (Diario) senza la scelta del Ladro (media, gia' segnalato in batch3 #9, ancora presente).** In tutte le partite del batch (Ladro assegnato e scelta nello stesso passo) il Diario non contiene mai "Il Ladro G01 sceglie X: scarta Y" (es. Notte 1: solo "Il Cavaliere G04 sceglie...", "Il Sacerdote unisce..."). `log.js:208` genererebbe la voce, ma `confermaLog` (`useLog.js:96`) usa `giocatoriRef.current` allo stato di prima della selezione pendente. Un Ladro che e' diventato lupo/Sacerdote compare quindi nel Diario senza spiegazione (es. "G01 e' morto/a di crepacuore" per uno che non era Sacerdote).

## DUBBI (con proposta)
1. **Carta fisica del Ladro che "resta Villico".** Regola (`roles.js` Ladro): "sceglie se assumere il ruolo di una di queste o diventare un semplice Villico". Non e' chiaro se il Ladro tenga la sua carta Ladro (e quindi a Cartomante/Medium vada mostrata "Ladro") o ne prenda una di Villico. Proposta: decidere con il proprietario; se tiene la carta Ladro, `cartaIniziale` e' giusta solo in questo caso e va corretta per le scelte di ruolo (BUG 1).
2. **Carta fisica di Apprendista e Addolorata** (non provati qui): stessa assunzione di `cartaIniziale` (storiaRuoli[0]); l'Apprendista "ne prende la carta" (`roles.js`), l'Addolorata "scambia permanentemente". Da verificare insieme al BUG 1.
3. **Cartomante su Ladro-Guardia Mannara.** `guardiaIncerta` (`assegnazione.js:85`) tratta come "incerta" anche la GM scelta dal Ladro (poteriUsati `ladro-scelta`), chiede la carta e puo' riscrivere G01 come Guardia scambiando con un'altra Guardia (stato in contrasto con scartoLadro e con quanto detto al Ladro). Proposta: non considerare incerta una Guardia/GM con `ladro-scelta` (l'app la conosce), oppure far prevalere la risposta del narratore anche sul log.
4. **Suocera tra le carte extra del Ladro**: il Ladro-Suocera e' vivo ma non conta come vivo per la vittoria (`vittoria.js` contaComeVivo). Coerente con il testo, ma e' un giocatore "morto per le condizioni" fin dalla prima notte. Proposta: escluderla come il Borgomastro, o dichiarare il caso.
5. **Chupacabra ultimo sopravvissuto dopo un rogo.** La vittoria si valuta solo all'alba (`AlbaPanel.jsx:46`): se il rogo lascia solo il Chupacabra (Ladro-Chupacabra G01 e G04, G04 bruciato) non c'e' nessun annuncio al rogo e serve una notte (senza bersagli: "Nessun bersaglio disponibile") per vedere "vince lui". Vale per ogni vittoria dopo un rogo (documentato in `Votazione.jsx:157`), ma qui la notte e' priva di senso.
6. **Diario ridondante con il Cavaliere che si immola**: 3 righe per un solo evento ("G01 e' morto/a: il Cavaliere si e' rivelato...", "G05 e' stato colpito dal branco ma il Cavaliere G01 si immola...", "Alba: G01 si e' rivelato: e' il Cavaliere..."). Proposta: una sola voce.
7. **Ladro che prende la Guardia (extra Guardia + Villico) con la Guardia Mannara nel mazzo**: `assegnaGuardiaMannaraCasuale` sceglie a caso tra tutte le Guardie, compreso il Ladro-Guardia (che avrebbe preso una carta Guardia dichiarata). Non riprodotto con certezza; proposta: escludere chi ha `ladro-scelta`.

## NON COPERTO
- Ladro x Apprendista/Addolorata/Gallo/Mezzosangue/Polpo/Veggente (gia' coperti in batch3 come "ok", non rigiocati). Ladro x Mimo (altro batch).
- Vittoria con Ladro-Guardia Mannara / Ladro-Cucciolo che diventa adulto alla morte del primo lupo.
- Cartomante/Medium sul Ladro che prende Cucciolo o Mezzosangue/Figlia (carta fisica dopo la trasformazione); variante Medium (solo aura).
- Ladro che prende Cortigiana con Paladino/Strega sul cliente; Ladro-Chupacabra con Cortigiana come bersaglio.
- Ladro che sceglie con meno di 2 carte extra disponibili o con carte extra non nel mazzo (select vuote, Avanti abilitato: il Ladro resta "Ladro" senza scelta, non verificato oltre).

## Coppie valutate (JSON-friendly)
```
ladro x sacerdote: si, ok (passo gia' titolare, coppia, crepacuore, carta scartata chiamata); registro senza la scelta del Ladro (BUG 5)
ladro x cavaliere: si, ok; Diario ridondante (dubbio 6)
ladro x figlia-dei-lupi: si, ok
ladro x pifferaio: si, ok (vittoria da ipnosi)
ladro x strega: si, ok (pozioni, refresh)
ladro x chupacabra: si, ok; vittoria solo all'alba (dubbio 5)
ladro x cortigiana: si, ok
ladro x berserker: si, ok
ladro x cucciolo-di-lupo-mannaro: si, ok; due Lupi non selezionabili (BUG 3)
ladro x lupo-mannaro-progenitore: si, ok (trasformazione, uso unico)
ladro x bardo: si, ok (salta notte, scartato non attivabile)
ladro x lantico: si, ok
ladro x guardia: si, problemi: passo Guardie duplicato (BUG 2), Guardia Mannara casuale puo' toccare il Ladro (dubbio 7)
ladro x guardia-mannara: si, problemi: Cartomante chiede/riscrive la carta (dubbio 3)
ladro x cartomante: si, problemi: carta mostrata "Ladro" invece del ruolo preso (BUG 1)
ladro x medium: si, problemi: idem BUG 1
ladro x fantasma-onnisciente: parziale, BUG 4 (selezionabile come carta extra, doppio Fantasma)
ladro x suocera: parziale, dubbio 4
cartomante x guardia-mannara: parziale, dubbio 3
guardia x guardia-mannara: parziale, BUG 2 (passo duplicato senza la GM, riprodotto senza Ladro)
```

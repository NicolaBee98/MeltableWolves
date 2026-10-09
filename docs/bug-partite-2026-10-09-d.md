# Batch partite 2026-10-09 (d): verifica in browser dei fix b2102ae e 094225d e del Diario

Chromium reale (Playwright, 390x844). La porta 5561 era occupata da un altro processo, quindi il mio dev server e' girato sulla 5563 (poi fermato con `kill` del solo PID avviato da me). Script in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad`. Nessuna modifica a `src/` ne' ai documenti esistenti. Console: nessun errore ne' warning in tutti gli scenari; nessun overflow orizzontale (controllato su Pifferaio e Diario). Dove indicato ho pre-caricato localStorage (ruoli di partenza, notte 2); i passi oggetto del test sono stati giocati dalla UI. Il Diario si apre da "Diario e impostazioni" > "Diario".

Nota: le voci del Diario di scelta (Ladro, Apprendista, Cavaliere, Strega) compaiono quando si preme Avanti sul passo, non alla selezione; Indietro le toglie correttamente.

## Tema 1 - Verifica dei fix di b2102ae

### 1.1 Pifferaio (9 giocatori: Pifferaio, 2 Lupi, 6 Villici)
- Notte 1 ipnotizza G04, G05; i lupi sbranano G09; rogo di G04 (ipnotizzato). Notte 2: le chip del passo Pifferaio contengono solo vivi non ipnotizzati (G02, G03, G06, G07, G08); il passo "Ipnotizzati" elenca "Morti: G04". **ok**
- Notte 3 con rimasti non ipnotizzati solo G02/G03: chip [G02, G03]; Avanti con una sola scelta e' consentito (nessun obbligo di due). **ok** (vedi dubbio D1).
- Tutti ipnotizzati all'alba 3 (nessun morto): "Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui", "Concludi partita" + "Vai al voto". Proseguendo (voto, rogo di G06, notte 4): il passo Pifferaio e' solo "Nessun giocatore da ipnotizzare: premi Avanti." (nessuna chip, Avanti funziona), 3 passi totali, refresh a meta' ok. **ok**
- Parita' lupi + tutti ipnotizzati (stesso alba, i lupi sbranano G06): banner solo "I Lupi Mannari sono in numero pari o superiore...", nessun doppio banner; dopo refresh uguale; "Concludi partita" chiede conferma. **ok** (precedenza ai lupi come da fix).
- Ordine dei passi notte 1: Lupo, Pifferaio, Branco, Ipnotizzati (lupi prima del Pifferaio). **ok**

### 1.2 Cavaliere che protegge Antico / Spilungone / Alchimista al rogo (ruolo ignoto, mazzo Cavaliere + ruolo + 2 Lupi + 3 Villici)
- Per tutti e tre: all'esito del rogo di G05 nessun bottone "Si rivela" (verificato per nome); compare l'avviso del Cavaliere; "Dichiara morte sul rogo" -> "Il Cavaliere G01 si sacrifica al posto di G05: G05 sopravvive al rogo"; muore solo il Cavaliere (`causaMorte: sacrificio`). Refresh ok. **ok**
- Giorno 2 (Cavaliere morto): rogo di G05 -> riappare il bottone "Si rivela: e' L'Antico / lo Spilungone / l'Alchimista". **ok**
- Stesso scenario con il ruolo gia' noto (pre-caricato): Antico e Spilungone mostrano un testo contraddittorio, vedi BUG 1. Alchimista corretto ("L'Alchimista esplode" resta disponibile in Eventi speciali anche dopo il sacrificio: vedi dubbio D2).
- Con il Cavaliere eredi dell'Apprendista (il maestro Cavaliere muore): l'erede si immola correttamente al rogo successivo. **ok**

### 1.3 Addolorata
- Notte 2: "Scambia" -> G01 villico / G04 addolorata, "Annulla scambio" disponibile; refresh: resta "Annulla scambio" e lo stato e' invariato; "Annulla scambio" ripristina (G01 addolorata, G04 villico, `poteriUsati` pulito); "Scambia" di nuovo -> Avanti. **ok**
- Cartomante sulla ex-Addolorata (ora Villico): "Mostra a Cartomante la carta: Villico" (ruolo corrente). **ok**
- Vittima gia' presa da un Apprendista: "La carta di G02 (Cavaliere) e' gia' stata presa da un Apprendista: nessuno scambio possibile", nessuno scambio duplicato. **ok**
- Indietro dal passo Cartomante dopo lo scambio e refresh successivo: stato coerente. **ok**

### 1.4 Ladro
- Due carte uguali "Lupo Mannaro" x2 (mazzo con 3 Lupi): una sola chip "Lupo Mannaro", niente "Resta Villico"; scelta -> G01 lupo-mannaro, quantita' Lupi 3 -> 2, passo successivo "Seleziona 1 giocatore in piu'". Refresh ok. **ok**
- Due Villici: chip [Villico, Resta Villico] (equivalenti, vedi D3); scelta/deselezione/cambio della seconda carta mantengono le quantita' (villico 3/4/3). **ok**
- Con Suocera tra le carte (Suocera + Villico): la Suocera e' selezionabile, G01 diventa `suocera`; alba 1 con 2 Lupi contro G05, G06 + Suocera: vincono i Lupi (la Suocera non conta). Diario: "Il Ladro G01 sceglie Suocera: scarta Villico". **ok**

### 1.5 Passo Guardie
- Mazzo con 2 Guardie senza Guardia Mannara e con Guardia Mannara: un solo passo "Guardie (si riconoscono)" (3 passi totali in entrambi i casi); con la Mannara "Seleziona 3 giocatori". **ok**

### 1.6 Carta mostrata da Cartomante/Medium
- Apprendista che ha ereditato (Cavaliere): "Mostra a Cartomante la carta: Cavaliere". Cucciolo cresciuto in Lupo Mannaro: "Cucciolo di Lupo Mannaro". Mimo: "Mimo". Ladro che ha scelto Cartomante/Villico e Addolorata scambiata: ruolo corrente. **ok**
- Apprendista con maestro a ruolo ignoto: vedi D4.

## Tema 2 - Diario in partite di 3-4 notti

### 2.1 Partita 12 giocatori (Ladro->Strega, Mezzosangue, Cortigiana, Cavaliere, Apprendista, Cartomante, 2 Lupi), 2 notti piu' giorni
- Ladro: "Il Ladro G01 sceglie Strega: scarta Villico" (primo della notte); Indietro fino al Ladro lo toglie (0 voci) e ripristina G01 `ladro`. **ok**
- Mezzosangue sbranato: una sola voce "Il Mezzosangue G04 e' stato sbranato e diventa Lupo Mannaro." (in alba compare l'altra formulazione, solo nell'annuncio). **ok**
- Cavaliere sbranato al posto del protetto: "Il Cavaliere G06 si immola al posto di G07 e muore (colpito dal branco)." una sola voce (niente piu' "si e' rivelato" duplicato nel Diario). **ok**
- Cortigiana che visita un lupo: "La Cortigiana G05 muore: il suo cliente G02 era un lupo." una sola voce. **ok**
- Strega (vitale su G07, mortale su G012): "usa la pozione vitale su G07", "usa la pozione mortale su G012", "G012 e' morto/a di notte", poi "G07 ha perso la condizione protetto"; niente piu' "ha ottenuto protetto". Cambiando le scelte dopo Indietro le voci vecchie spariscono (totale 0) e si riscrivono quelle nuove. Pozioni gia' usate: notte 3 "gia' utilizzata". **ok** (vedi D5 sul "ha perso la condizione").
- Refresh a meta' notte (passo Branco dopo scelte della Strega): le voci restano uguali, nessun doppione. **ok**
- Rogo del Cavaliere maestro: "G06 e' morto/a al rogo" poi "L'Apprendista G08 eredita il ruolo di Cavaliere dal maestro G06" (causa prima dell'effetto). **ok** (ma vedi BUG 2).
- Chupacabra (lupi morti, pre-caricato): Cortigiana col cliente G03 ucciso: "G03 e' morto/a di notte", poi "La Cortigiana G02 muore: il suo cliente G03 e' stato ucciso." (verbo "ucciso", non "sbranato", un solo doppione assorbito). Chupacabra che uccide direttamente la Cortigiana: "G02 e' morto/a di notte". **ok**
- Annulla morte giocatore (Cavaliere erede immolato): aggiunge "G04 e' tornato/a in vita" senza togliere le voci precedenti (storico, non errore).
- Diario aperto: nessun overflow, sezioni "Round 1/2" con prefisso Notte/Alba/Rogo/Giorno.

### 2.2 Addolorata che scambia con il Cavaliere bruciato (8 giocatori)
- Voci all'alba 2: "G01 ha assunto il ruolo di Cavaliere", "G02 ha assunto il ruolo di Addolorata", "G01 eredita il legame: protegge G07", "G06 e' morto/a di notte". Il nuovo Cavaliere si immola poi al rogo di G07. **ok** (lo scambio non ha una voce propria "L'Addolorata scambia": solo i due "ha assunto il ruolo", D6).
- Con Annulla scambio e riscambio: nessuna voce duplicata. **ok**

## BUG CERTI

1. **Rogo con Cavaliere sul bersaglio Antico/Spilungone di ruolo noto: l'anteprima e il riepilogo dopo la conferma contraddicono il sacrificio** (gravita' bassa, solo testo). Passi: partita con Cavaliere (protegge G05) e G05 `lantico` (o `spilungone`) gia' assegnato; voto G05 -> esito. Sopra "Dichiara morte sul rogo" compare "L'Antico sopravvive (prima vita) ma il villaggio e' maledetto: la notte i poteri del villaggio non si sveglieranno." (per lo Spilungone: "Lo Spilungone si rivela e non muore durante il rogo.") e sotto l'avviso del Cavaliere "si immola prima che G05 possa rivelarsi (... non perderebbe la vita ne' la maledizione)". Dopo la conferma entrambi i testi restano insieme a "Il Cavaliere G01 si sacrifica al posto di G05". Lo stato e' corretto (la notte 3 non e' maledetta: il Veggente si sveglia; l'Antico resta vivo senza prima vita persa), quindi e' solo la frase maledizione/rivelazione che inganna il narratore. Causa probabile: il blocco di anteprima per ruolo noto in `src/features/giorno/Votazione.jsx` (testo Antico/Spilungone) non considera `cavalieriDi(giocatori, id)`, mentre il fix b2102ae lo ha aggiunto solo a `confermaMorte` (riga ~230) e alle rivelazioni per ruolo ignoto (riga ~371). Proposta: nascondere la frase quando `protettori.length > 0`. Inoltre con il ruolo ignoto l'esito mostra due frasi quasi uguali ("lo protegge: si immola al suo posto" + "protegge ... si immola prima che ... possa rivelarsi"): si potrebbe fondere.

2. **Diario: manca "eredita il legame" quando un Apprendista eredita un Cavaliere (o Figlia/Apprendista) dal maestro** (gravita' bassa). Passi: Apprendista G08 con maestro Cavaliere G06 (protegge G07). Il maestro muore (al rogo, o sbranato di notte): le voci sono "L'Apprendista G08 eredita il ruolo di Cavaliere dal maestro G06" (o l'annuncio d'alba "G08 si rivela..."), ma nessuna "G08 eredita il legame: protegge G07", mentre G08 poi protegge davvero G07 (si immola). La voce c'e' solo per l'Addolorata (partita 2.2). Causa probabile: `src/data/log.js:218`, la condizione `(!l0 || l0.tipo === l1.tipo)` esclude il caso dell'Apprendista, che ha `l0.tipo === 'apprendista'` e `l1.tipo === 'cavaliere'`; il ramo `arrivatoConRuolo` (riga 220) richiede `!l0`. Proposta: trattare come "ereditato" anche `l0.tipo === 'apprendista'` con ruolo cambiato.

3. **Diario: l'Addolorata genera una voce spuria per il suo "partner" di scambio** (gravita' media, informazione falsa). Passi: Apprendista G02 con maestro G07 (o Figlia dei Lupi con genitore G07), il rogo la elimina, l'Addolorata G01 scambia con lei. Alba successiva: oltre alle voci di G01, compare "**L'Apprendista G02 eredita il ruolo di Addolorata dal maestro G07**" (o "**La Figlia dei Lupi G02 si rivela e diventa Lupo Mannaro**"), ma G02 e' solo la morta che ha ricevuto la carta dell'Addolorata: non eredita nulla e non diventa Lupo. Causa probabile: `src/data/log.js:223-236`: la condizione `(!l1 || l1.tipo !== l0?.tipo) && l0 && prima.ruoloSlug !== giocatore.ruoloSlug && giocatore.ruoloSlug` interpreta la perdita del legame dovuta allo scambio come ereditarieta'/trasformazione. Proposta: escludere quando `giocatore.ruoloSlug === 'addolorata'` (o quando il ruolo precedente di G02 compare come nuovo ruolo di un altro giocatore nello stesso diff).

4. **Diario: ordine effetto prima della causa per il Cucciolo cresciuto** (gravita' bassa). Passi: Cucciolo G02 + Lupo G03; rogo di G03. Diario: "G02 ha assunto il ruolo di Lupo Mannaro" compare PRIMA di "G03 e' morto/a al rogo" (stesso giro, giorno 1). Il riordino di 094225d assegna `tier` solo a morti (1), crepacuore (2) e a Apprendista/Figlia (3); la voce generica "ha assunto il ruolo di" ha tier 0 e finisce davanti alle morti (`src/data/log.js`, sort sui `tier` in fondo alla funzione). Proposta: dare tier 3 (o 2) alla voce "ha assunto il ruolo di" quando e' il Cucciolo (e in generale ai cambi ruolo dovuti a una morte).

## DUBBI

D1. **Pifferaio: Avanti con una sola persona ipnotizzata quando ne restano due** (passo "Chi ipnotizzare (due giocatori)"). Il testo dice "due persone" (Pifferaio, roles.js "ipnotizza due persone"); l'app lascia proseguire con una. Proposta: lasciare (il narratore potrebbe sbagliarsi) ma mostrare un avviso come per il maestro dell'Apprendista.

D2. **Alchimista protetto dal Cavaliere**: dopo il sacrificio il bottone "L'Alchimista esplode" resta in Eventi speciali (ruolo noto) anche se l'Alchimista non e' morto. Regola: "Se viene messo al rogo dal villaggio si rivela" (roles.js); non essendo morto non esplode. Proposta: nascondere l'esplosione per chi non e' morto al rogo corrente.

D3. **Ladro con due carte uguali non-Lupo (due Villici)**: chip "Villico" e "Resta Villico" equivalenti. Proposta: un solo pulsante.

D4. **Apprendista con maestro a ruolo "ignoto" ma dedotto**: il maestro G07 e' stato sbranato quando il suo ruolo era ignoto, poi a fine notte l'app lo ha segnato `villico` (restavano solo Villici nel mazzo) ma l'Apprendista G02 resta "ruolo ancora ignoto"; la Cartomante chiede quale ruolo mostrare. Proposta: ricalcolare l'erede quando il ruolo del maestro viene dedotto.

D5. **Diario: "G07 ha perso la condizione protetto" all'alba** dopo ogni pozione vitale e' rumore (la protezione dura una notte). Proposta: non registrarlo quando la voce della Strega copre la protezione.

D6. **Diario: lo scambio dell'Addolorata non ha una voce propria** ("L'Addolorata G01 scambia il ruolo con G02 (Cavaliere)"): ci sono solo "ha assunto il ruolo di" per i due giocatori. Inoltre il Mimo senza carta scelta produce due voci ridondanti ("non ha scelto la carta da imitare: diventa Villico." + "imita Villico").

## NON COPERTO
- Cartomante/Medium su Ladro/Apprendista con Mimo che li copia; Guardia/Guardia Mannara tramite Mimo.
- Diario con Guaritore/Sciacallo, Boia, Bardo/Gallo e con 4 notti piene (le partite lunghe erano di 2 notti piu' giorni).
- Cavaliere che protegge Antico/Spilungone al rogo con Strega vitale o Guaritore nella stessa notte; Cavaliere con piu' protetti.
- Mezzosangue sbranato con Chupacabra nel Diario; legame ereditato di Figlia dei Lupi tramite Apprendista.
- Impostazione "L'Addolorata eredita le scelte dei legami" (testata solo il valore di default).

## Coppie valutate (JSON-friendly)
```json
[
  "pifferaio x lupo-mannaro: si, ok (parita' + tutti ipnotizzati: vincono i lupi)",
  "pifferaio x villico: si, ok (morti ipnotizzati, tutti ipnotizzati solo Avanti)",
  "cavaliere x lantico: si, bug 1 (testo maledizione con ruolo noto)",
  "cavaliere x spilungone: si, bug 1 (testo rivelazione con ruolo noto)",
  "cavaliere x alchimista: si, dubbio D2 (esplosione resta)",
  "cavaliere x apprendista: si, bug 2 (manca voce legame ereditato)",
  "cavaliere x addolorata: si, ok (eredita il legame, nessun duplicato)",
  "addolorata x apprendista: si, bug 3 (voce spuria 'eredita il ruolo')",
  "addolorata x figlia-dei-lupi: si, bug 3 (voce spuria 'diventa Lupo Mannaro')",
  "addolorata x cartomante: si, ok (carta = ruolo corrente)",
  "ladro x lupo-mannaro: si, ok (due Lupi, scambio obbligato)",
  "ladro x villico: si, dubbio D3 (chip duplicata)",
  "ladro x suocera: si, ok",
  "ladro x strega: si, ok (voce Diario)",
  "ladro x cartomante: si, ok",
  "guardia x guardia-mannara: si, ok (passo unico)",
  "cartomante x apprendista: parziale, dubbio D4 (maestro ignoto)",
  "cartomante x cucciolo-di-lupo-mannaro: si, ok (carta iniziale)",
  "cartomante x mimo: si, ok",
  "cucciolo-di-lupo-mannaro x lupo-mannaro: si, bug 4 (ordine Diario)",
  "mezzosangue x lupo-mannaro: si, ok (voce unica)",
  "cortigiana x chupacabra: si, ok (verbo ucciso, voce unica)",
  "cortigiana x lupo-mannaro: si, ok (cliente lupo)",
  "strega x cavaliere: si, ok",
  "strega x mezzosangue: si, ok (nessuna trasformazione se protetto)",
  "strega x apprendista: si, ok (mortale su erede)"
]
```

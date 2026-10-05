# Matrice delle interazioni tra ruoli

Traccia quali coppie di ruoli sono state valutate (bug, interazioni problematiche, dubbi di regolamento) e quali no. Dati in `docs/matrice-ruoli.json`, vista interattiva in `docs/matrice-ruoli.html` (autonoma, funziona offline, tema chiaro e scuro).

## Come aggiornare

1. Modificare `docs/matrice-ruoli.json`: ogni cella non vuota e' `{a, b, valutata, problemi:[{testo, stato}], fonti:[...]}` con `a` e `b` come slug (di `src/data/roles.js`, nell'ordine in cui compaiono in `ruoli`; `a === b` e' la diagonale). Le coppie assenti sono "no" (non valutate).
2. Rigenerare la vista: `node scripts/matrice-ruoli.mjs` (nessuna dipendenza, riscrive `docs/matrice-ruoli.html` e stampa le statistiche).
3. Regola di onesta': una cella e' "si" solo con una fonte verificabile (test con file e riga, sezione di un documento, commit).

## Legenda

Valutata:

- **si**: valutata esplicitamente, con un test dedicato in cui i due ruoli interagiscono, o un'analisi/audit che li incrocia, o uno scenario di partita mirato. Un dubbio di regolamento documentato per la coppia conta come valutazione.
- **parziale**: toccata di passaggio (presenti insieme in una partita di prova o in una fixture di test senza focus sulla coppia; test che citano entrambi i ruoli ma senza interazione tra loro; elenchi di ruoli trattati in blocco).
- **no**: nessuna evidenza (cella vuota nella vista).

Colori nella vista: vuota = non valutata; grigio = parziale; verde = valutata senza problemi; arancio = valutata con problemi tutti risolti; rosso = almeno un problema aperto o un dubbio di regolamento.

Stato dei problemi: **risolto** (corretto, con test o commit), **aperto** (noto e non corretto), **dubbio** (decisione di regolamento o verifica ancora da fare).

Convenzioni: la diagonale e' "il ruolo da solo" (o due copie dello stesso ruolo); `docs/audit-ruoli-2026-09-22.md` analizza ciascuno dei 51 ruoli, quindi tutte le diagonali sono "si". Il Mimo e' un ruolo a se' e le sue coppie provengono da `audit-mimo-2026-10-02.md` e `spec-mimo-2026-10-02.md`. Le fonti sono scritte in forma sintetica: `test:percorso:riga` (sotto `src/`), `commit:hash`, nome del documento con numero o sezione, `fixture:file` (solo parziale). Le righe dei test sono quelle al momento della generazione e possono spostarsi.

## Riepilogo statistico

| | |
|---|---|
| Ruoli | 51 |
| Coppie (incluse 51 diagonali) | 1326 |
| Valutate (si + parziale) | 319 (24.1%) |
| di cui si | 206 (15.5%) |
| di cui parziale | 113 |
| Non valutate | 1007 (75.9%) |
| "si" senza problemi (verde) | 46 |
| "si" con problemi tutti risolti (arancio) | 115 |
| Celle con problemi aperti o dubbi (rosso) | 45 |
| Diagonali valutate | 51 / 51 |
| Coppie con il Mimo valutate | 50 / 51 |

Le valutazioni sono molto concentrate: il Mimo da solo copre 50 coppie. Escluso il Mimo, le coppie valutate scendono a 269 su 1275 non-Mimo (21.1%).

## Ruoli con piu' coppie valutate (su 51 possibili, diagonale inclusa)

1. Mimo (50/51)
2. Lupo Mannaro (33/51)
3. Veggente (24/51)
4. Chupacabra (20/51)
5. Strega (18/51)
6. Borgomastro (17/51)
7. Ladro (17/51)
8. L'Antico (17/51)
9. Apprendista (16/51)
10. Cucciolo di Lupo Mannaro (16/51)

Senza il Mimo: Lupo Mannaro (33/51), Veggente (24/51), Chupacabra (20/51), Strega (18/51), Borgomastro (17/51), Ladro (17/51).

## Ruoli meno valutati

1. Maga (2/51)
2. Untore (3/51)
3. Nonna (4/51)
4. Fattucchiera (4/51)
5. Ubriaco (5/51)
6. Polpo Mannaro (5/51)
7. Guardia (5/51)
8. Ambasciatore (5/51)
9. Sciacallo Mannaro (6/51)
10. Lupo Mannaro Progenitore (6/51)

Il tratto comune e' che quasi tutte le coppie valutate riguardano il branco dei lupi, il Mimo o ruoli di vittoria; i ruoli "di legame" e di scambio di carta sono incrociati quasi solo con il Mimo.

## Problemi ancora aperti o dubbi (45 celle)

- **Addolorata (da solo)**: [aperto] Dati: mortoNotte errato dopo un rogo del giorno 1 (mortoNotte:2); [dubbio] Scambio non eredita i poteri usati del ruolo di provenienza (appendice E)
- **Addolorata x Strega**: [dubbio] L'Addolorata che diventa Strega riparte con pozioni fresche (non eredita i poteri usati)
- **Ambasciatore x Mimo**: [dubbio] Mimo con Pastore/Ambasciatore e aura non provato in browser
- **Ambasciatore x Veggente**: [dubbio] Annuncio anche se il Veggente muore la stessa notte (non controlla vivo)
- **Bardo (da solo)**: [aperto] Notte saltata dal Bardo: layout schiacciato e nessun feedback dopo il Conferma; [dubbio] "Salta la notte" neutralizza i poteri invece di saltare la fase (semplificazione mai confermata)
- **Bardo x Mimo**: [dubbio] Bardo + Mimo-Bardo: potere riproposto dopo un uso se resta il morto non usato (caso da chiarire)
- **Boia (da solo)**: [aperto] Dati: mortoGiorno errato dopo Boia all'alba, storiaRuoli con duplicati ("boia","boia")
- **Borgomastro (da solo)**: [dubbio] Voto doppio non automatizzato: solo promemoria visivo
- **Cartomante x Mimo**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Chupacabra (da solo)**: [dubbio] Chupacabra rispetta la protezione (assunzione non confermata dal testo)
- **Chupacabra x Lupo Mannaro**: [dubbio] Chupacabra + Lupo 1 contro 1: vincono i Lupi anche con il Chupacabra vivo
- **Chupacabra x Mimo**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Cortigiana (da solo)**: [dubbio] "Sbranato dal branco" o "morto di notte" in generale: lettura ampia mantenuta
- **Cortigiana x Mimo**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Cortigiana x Strega**: [dubbio] Cortigiana sopravvive se il cliente muore per la pozione mortale (lettura "sbranato dal branco")
- **Criceto Malvagio x Strega**: [dubbio] Criceto immune solo ai lupi: la Strega puo' ucciderlo (immunita' totale?)
- **Cucciolo di Lupo Mannaro (da solo)**: [dubbio] Cucciolo resuscitato dal Guaritore la notte della vendetta: i lupi sbranano comunque due vittime
- **Cucciolo di Lupo Mannaro x Guaritore**: [dubbio] Cucciolo resuscitato dal Guaritore la notte della vendetta: i lupi sbranano comunque due vittime
- **Fattucchiera x Mimo**: [dubbio] Mimo inibito dalla Fattucchiera: inibizione condivisa o per persona (Q12); [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Gallo Mannaro (da solo)**: [dubbio] Gallo che salta il giorno provato solo come dialog, non end-to-end
- **Guardia Mannara (da solo)**: [dubbio] Sbranando la Guardia Mannara una volta "Nessuno e' morto" (non riprodotto)
- **Guardia Mannara x Veggente**: [dubbio] Veggente su Guardia Mannara: "Aura benevola"
- **Guaritore x Mimo**: [dubbio] Poteri unici separati (Q5=B): implementazione per Guaritore senza test dedicato
- **Innocente x Mimo**: [dubbio] Mimo-Scemo/Innocente non provati in partita
- **L'Antico x Medium**: [dubbio] Medium indaga l'ex Antico come "villico"
- **Lupo Mannaro x Spilungone**: [dubbio] "La notte cala senza vittime" ma i lupi possono sbranare
- **Lupo Mannaro Progenitore (da solo)**: [aperto] Dopo "trasforma" il bottone "Sbrana normalmente" risulta evidenziato (ambiguo)
- **Maga x Mimo**: [dubbio] Azione di ogni notte unica e condivisa; escluso solo il primo titolare dai bersagli
- **Medium (da solo)**: [dubbio] Medium indaga l'ex Antico come "villico"
- **Mimo x Paladino**: [dubbio] Azione di ogni notte unica e condivisa; escluso solo il primo titolare dai bersagli
- **Mimo x Pastore**: [dubbio] Mimo con Pastore/Ambasciatore e aura non provato in browser
- **Mimo x Pifferaio**: [dubbio] Il Pifferaio puo' ri-ipnotizzare chi lo e' gia'; [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Mimo x Scemo del Villaggio**: [dubbio] Mimo-Scemo/Innocente non provati in partita
- **Mimo x Sciacallo Mannaro**: [dubbio] Poteri unici separati (Q5=B): implementazione per Sciacallo senza test dedicato
- **Mimo x Untore**: [dubbio] Azione di ogni notte unica e condivisa; escluso solo il primo titolare dai bersagli
- **Mimo x Veggente**: [aperto] Togliere il Mimo dagli indagabili: non fondamentale (spec)
- **Mimo x Veggente Mannaro**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Nano (da solo)**: [dubbio] Nano e Criceto immuni solo ai lupi: la frase "puo' morire solo al rogo" potrebbe valere per ogni potere
- **Nano x Strega**: [dubbio] Nano immune solo ai lupi: la Strega puo' ucciderlo (immunita' totale?)
- **Pastore (da solo)**: [dubbio] Pastore con piu' lupi non coperto
- **Pifferaio (da solo)**: [aperto] Totale passi sovrastimato se il Pifferaio non ipnotizza
- **Sacerdote x Sciacallo Mannaro**: [dubbio] Sciacallo resuscita anche gli amanti: il partner morto resta morto senza avviso
- **Sciacallo Mannaro (da solo)**: [dubbio] Sciacallo resuscita anche gli amanti: il partner morto resta morto senza avviso
- **Spilungone (da solo)**: [dubbio] "La notte cala senza vittime" non blocca i poteri notturni
- **Strega (da solo)**: [dubbio] "Richiama i morti": Strega chiamata con entrambe le pozioni usate

## Prime 40 coppie non valutate piu' rischiose

Ordinate per priorita' (ruoli con piu' stato e piu' meccanismi che toccano morti, carte e legami: Mimo, Ladro, Addolorata, Cavaliere, Apprendista, Figlia dei Lupi, Sacerdote, Pifferaio, Strega, Chupacabra, Cortigiana, Antico, Alchimista, Boia ecc.). Tutte le coppie sono "no" nella matrice al momento della generazione.

| # | Coppia | Perche' e' rischiosa |
|---|---|---|
| 1 | Mimo x Lupo Mannaro Progenitore | Unico ruolo che il Mimo non ha mai incrociato: copia del potere di trasformazione "una volta per partita" (condiviso o separato dal Progenitore vero?) e del branco con vittima trasformata. |
| 2 | Addolorata x Cavaliere | L'Addolorata scambia carta con la vittima del rogo: se e' il Cavaliere (o il suo protetto) il legame si sposta, si perde o si duplica? |
| 3 | Addolorata x Apprendista | Vittima del rogo = maestro o Apprendista: l'ereditarieta' del ruolo scatta sul ruolo prima o dopo lo scambio? |
| 4 | Addolorata x Figlia dei Lupi | Genitore o Figlia dei Lupi al rogo e poi scambio: il legame segue la carta o la persona (la Figlia diventa lupo?). |
| 5 | Addolorata x Sacerdote | Vittima del rogo innamorata: la condizione "innamorato" e il crepacuore restano alla persona o passano con la carta? |
| 6 | Addolorata x Alchimista | Alchimista al rogo trascina qualcuno e l'Addolorata ne prende la carta gia' rivelata: due esplosioni o potere perso? |
| 7 | Addolorata x Boia | Vittime di Boia e rogo nello stesso giorno: mortoGiorno/mortoNotte sono gia' incoerenti (bug aperto) e l'Addolorata li legge per scegliere la vittima. |
| 8 | Addolorata x Chupacabra | Scambio con un Chupacabra morto al rogo: ruolo indipendente con vittoria propria che passa a un villico. |
| 9 | Addolorata x Pifferaio | Scambio con un Pifferaio o con un ipnotizzato: condizioni "ipnotizzato" e vittoria cumulativa del Pifferaio. |
| 10 | Addolorata x Fantasma Onnisciente | Il Fantasma riceve la carta del primo morto: stessa vittima dello scambio dell'Addolorata, chi ottiene cosa? |
| 11 | Addolorata x Medium | Il Medium legge il ruolo "vecchio" del morto: dopo lo scambio il cadavere ha un ruolo diverso (storiaRuoli). |
| 12 | Ladro x Sacerdote | Il Ladro assume il Sacerdote: la coppia di innamorati va scelta nello stesso passo, nell'ordine giusto rispetto agli altri ruoli della prima notte. |
| 13 | Ladro x Cavaliere | Il Ladro assume il Cavaliere: legame da scegliere dopo il cambio di carta; il bersaglio puo' essere un ruolo ancora non assegnato. |
| 14 | Ladro x Figlia dei Lupi | Il Ladro assume la Figlia dei Lupi: il genitore potrebbe essere una carta ancora in mano al narratore. |
| 15 | Ladro x Pifferaio | Il Ladro assume il Pifferaio: nuova condizione di vittoria indipendente e conteggi del mazzo. |
| 16 | Ladro x Strega | Il Ladro assume la Strega: pozioni "fresche" e passi notturni di un ruolo che non era nel mazzo. |
| 17 | Ladro x Chupacabra | Il Ladro assume il Chupacabra: un indipendente nato dopo la composizione del mazzo, con vittoria da ultimo sopravvissuto. |
| 18 | Ladro x Cortigiana | Il Ladro assume la Cortigiana: immunita' al branco e morte per cliente lupo applicate a un ruolo cambiato. |
| 19 | Ladro x Berserker | Il Ladro assume il Berserker: ruolo passivo che l'app deve conoscere prima del primo morso. |
| 20 | Ladro x Cucciolo di Lupo Mannaro | Il Ladro assume il Cucciolo: vendetta e maturazione con un lupo apparso dopo il setup. |
| 21 | Ladro x Lupo Mannaro Progenitore | Il Ladro assume il Progenitore: ruolo di branco con potere trasformazione acquisito alla prima notte. |
| 22 | Cavaliere x Sacerdote | Il Cavaliere si sacrifica per un innamorato: catena di morti (Cavaliere, crepacuore del partner) in un solo passaggio. |
| 23 | Cavaliere x L'Antico | Il Cavaliere protegge l'Antico: la prima vita dell'Antico assorbe il colpo e il Cavaliere si immola comunque? |
| 24 | Cavaliere x Pifferaio | Il Cavaliere protegge un Pifferaio: sacrificio al rogo con vittoria indipendente in gioco. |
| 25 | Cavaliere x Mezzosangue | Mezzosangue sbranato non muore ma si trasforma: il Cavaliere si immola ugualmente senza motivo? |
| 26 | Apprendista x L'Antico | Maestro = Antico: alla prima vita l'Antico diventa Villico, l'Apprendista eredita Antico o Villico? |
| 27 | Apprendista x Boia | Il Boia giustizia il maestro: morte "sul colpo" e riassegnazione immediata del ruolo. |
| 28 | Apprendista x Cortigiana | L'Apprendista eredita la Cortigiana: visita e immunita' diventano sue; cliente della notte corrente. |
| 29 | Apprendista x Pifferaio | L'Apprendista eredita il Pifferaio: ipnotizzati gia' fatti e vittoria cumulativa. |
| 30 | Alchimista x Cavaliere | L'Alchimista trascina il protetto di un Cavaliere: il sacrificio e' automatico o resta a carico del narratore? |
| 31 | Alchimista x Sacerdote | L'Alchimista trascina un innamorato: la morte "sul colpo" scatta crepacuore e promemoria? |
| 32 | Alchimista x Apprendista | L'Alchimista trascina un maestro: l'Apprendista eredita nello stesso passaggio del rogo. |
| 33 | Boia x Cavaliere | Il Boia giustizia il protetto del Cavaliere: il Cavaliere si immola ma non salva (morte sul colpo), caso non provato con entrambi. |
| 34 | Boia x Sacerdote | Il Boia giustizia un innamorato: crepacuore del partner e promemoria delle conseguenze. |
| 35 | Strega x Sacerdote | La pozione mortale colpisce un innamorato: protezione ignorata ma crepacuore da annunciare all'alba. |
| 36 | Guaritore x Sacerdote | Il Guaritore resuscita un innamorato: il partner morto per crepacuore resta morto senza avviso (stesso dubbio dello Sciacallo). |
| 37 | Guaritore x L'Antico | Il Guaritore resuscita l'Antico: la prima vita e' gia' consumata, torna Villico o Antico? |
| 38 | Cortigiana x Figlia dei Lupi | La Figlia dei Lupi diventa lupo dopo che la Cortigiana l'ha scelta come cliente: ordine di risoluzione. |
| 39 | Cartomante x Ladro | La Cartomante mostra il ruolo reale del Ladro dopo lo scambio di carta o quello di partenza (storiaRuoli)? |
| 40 | Bardo x Ladro | Il Ladro assume il Bardo: gesto segreto della prima notte e uso del potere dopo il rogo. |

Per il resto, 1007 coppie sono ancora non valutate: guardare la vista HTML e filtrare per ruolo per vedere i partner mancanti.

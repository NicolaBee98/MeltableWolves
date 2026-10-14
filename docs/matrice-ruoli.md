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

_Aggiornato dopo i commit di correzione b2102ae, 094225d e b35d5fc e le decisioni del proprietario del 2026-10-09 (report `bug-partite-2026-10-09-{a..h}.md` e `bug-partite-2026-10-14-{a..e}.md`). I numeri si ricalcolano dal JSON con `node scripts/matrice-ruoli.mjs --md`._

| | |
|---|---|
| Ruoli | 51 |
| Coppie (incluse 51 diagonali) | 1326 |
| Valutate (si + parziale) | 1159 (87.4%) |
| di cui si | 716 (54.0%) |
| di cui parziale | 443 |
| Non valutate | 167 (12.6%) |
| "si" senza problemi (verde) | 456 |
| "si" con problemi tutti risolti (arancio) | 140 |
| Celle con problemi aperti o dubbi (rosso) | 120 |
| Diagonali valutate | 51 / 51 |
| Coppie con il Mimo valutate | 51 / 51 |

Escluso il Mimo, le coppie valutate sono 1108 su 1275 non-Mimo (86.9%). Molte celle "parziale" sono di passaggio, da partite complete.

## Ruoli con piu' coppie valutate (su 51 possibili, diagonale inclusa)

1. Mimo (51/51)
2. Chupacabra (44/51)
3. Cartomante (43/51)
4. Veggente (43/51)
5. Cavaliere (42/51)
6. Guaritore (41/51)
7. Strega (41/51)
8. Lupo Mannaro (41/51)
9. Paladino (36/51)
10. Gallo Mannaro (36/51)

Senza il Mimo: Chupacabra (44/51), Cartomante (43/51), Veggente (43/51), Cavaliere (42/51), Guaritore (41/51), Strega (41/51).

## Ruoli meno valutati

1. Eremita (7/51)
2. Guardia (7/51)
3. Bardo (11/51)
4. Innocente (11/51)
5. Fantasma Onnisciente (15/51)
6. Suocera (15/51)
7. Villico (16/51)
8. Guardia Mannara (16/51)
9. Lupo Mannaro Capobranco (16/51)
10. Figlia dei Lupi (16/51)

I ruoli meno incrociati sono quelli passivi o con poche interazioni (Eremita, Guardia, Bardo, Innocente) e le carte "speciali" come Fantasma Onnisciente e Suocera.

## Problemi ancora aperti o dubbi (97 celle)

Elenco di tutte le celle con almeno un problema non risolto (comprese quelle "parziale", che nella vista non sono rosse: le rosse sono 94).

- **Addolorata (da solo)**: [aperto] Dati: mortoNotte errato dopo un rogo del giorno 1 (mortoNotte:2); [dubbio] Scambio non eredita i poteri usati del ruolo di provenienza (appendice E); [aperto] storiaRuoli dell'Addolorata che scambia non riceve il nuovo ruolo; scambio con ruolo ignoto lascia ruoloSlug undefined e nessuna voce in registro
- **Addolorata x Alchimista**: [aperto] Alchimista al rogo non imposta mortoNotte: l'Addolorata non trova la vittima (GiornoPanel dichiaraAlchimistaEsplode)
- **Addolorata x Apprendista**: [dubbio] nuovo Apprendista senza maestro e inerte; eredita il marcatore addolorata-scambio dal maestro Addolorata (innocuo) (D1)
- **Addolorata x Boia**: [dubbio] Addolorata-Boia con potere giustizia fresco, non ereditato (D2)
- **Addolorata x Cavaliere**: [dubbio] nuova Cavaliere senza protetto/inerte; Cavaliere che si immola non e' vittima del rogo per lo scambio (dubbio D1/D3)
- **Addolorata x Cucciolo di Lupo Mannaro**: [dubbio] vendetta non rinnovata alla nuova Cucciola (D5); banner "il Cucciolo diventa adulto" fuori luogo
- **Addolorata x Fantasma Onnisciente**: [dubbio] dopo lo scambio il Fantasma ha ruolo Addolorata (ruolo in vita per la vittoria? D4); candidati propongono anche morti notturni; [dubbio] dubbio (vittoria 'ruolo in vita' dopo lo scambio; flag resta sulla persona)
- **Addolorata x Figlia dei Lupi**: [dubbio] nuova Figlia senza genitore e inerte (D1)
- **Addolorata x Guaritore**: [dubbio] dubbio (potere ricaricato al resuscitato)
- **Addolorata x Medium**: [dubbio] il Medium vede Addolorata invece del ruolo in vita; aura di un lupo bruciato diventa benevola (D4)
- **Addolorata x Strega**: [dubbio] L'Addolorata che diventa Strega riparte con pozioni fresche (non eredita i poteri usati); [dubbio] nuova Strega con pozioni fresche (D2); undo pulito
- **Alchimista x Apprendista**: [aperto] riepilogo senza l'eredità dell'Apprendista (eredita Alchimista con potere già usato, ok)
- **Alchimista x Guaritore**: [dubbio] Alchimista resuscitato e bruciato esplode una seconda volta: "Dichiara morte" apre la scelta con potere gia usato mentre "Si rivela" e nascosto, anteprima dice "esplode"; poteriUsati duplicato (dubbio di regolamento)
- **Alchimista x L'Antico**: [aperto] maledizione ok; il riepilogo del rogo dice ancora "trascina con se G08" dopo la rivelazione dell'Antico che sopravvive
- **Ambasciatore x Mimo**: [dubbio] Mimo con Pastore/Ambasciatore e aura non provato in browser
- **Ambasciatore x Veggente**: [dubbio] Annuncio anche se il Veggente muore la stessa notte (non controlla vivo)
- **Apprendista x Guaritore**: [dubbio] maestro resuscitato dopo l'eredità: due titolari (D6); erede e maestro morto condividono un solo uso
- **Apprendista x L'Antico**: [dubbio] erede di un ex Antico riceve Villico (domanda D4); [aperto] Registro con voci stantie ("G03 e' morto/a di notte", "G04 si rivela") dopo la rivelazione dell'Antico; riepilogo alba corretto
- **Apprendista x Scemo del Villaggio**: [aperto] riepilogo senza l'eredità quando muore lo Scemo; annulla morte ripristina tutto
- **Apprendista x Suocera**: [aperto] L'Apprendista erede di una Suocera sbranata non puo' essere rivelato come Suocera (candidatiSuocera solo morti), resta ignoto e conta come Villico
- **Bardo (da solo)**: [aperto] Notte saltata dal Bardo: layout schiacciato e nessun feedback dopo il Conferma; [dubbio] "Salta la notte" neutralizza i poteri invece di saltare la fase (semplificazione mai confermata)
- **Bardo x Mimo**: [dubbio] Bardo + Mimo-Bardo: potere riproposto dopo un uso se resta il morto non usato (caso da chiarire); [dubbio] Potere del Bardo riproposto dopo l'uso del Mimo se il Bardo vero e' morto non usato
- **Boia (da solo)**: [aperto] Dati: mortoGiorno errato dopo Boia all'alba, storiaRuoli con duplicati ("boia","boia")
- **Boia x Cavaliere**: [dubbio] Cavaliere salva dal Boia (dubbio regolamento D1); riepilogo dice che è morto ma è vivo; residui mortoDa/giustiziatoDa
- **Boia x L'Antico**: [dubbio] Boia su Antico: sopravvive, nessuna maledizione (D3); [aperto] testo di rivelazione "perde la prima vita e da ora gioca da Villico" senza menzione della maledizione (il villaggio e maledetto davvero)
- **Boia x Nano**: [dubbio] Il Boia puo giustiziare il Nano (testo: puo morire solo al rogo) (dubbio)
- **Boia x Sacerdote**: [aperto] Boia all'alba su innamorato: partner non elencato tra i morti dell'Alba; riepilogo senza crepacuore; annulla morte non restituisce il potere al Boia
- **Borgomastro (da solo)**: [dubbio] Voto doppio non automatizzato: solo promemoria visivo
- **Cartomante x Mimo**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Cavaliere x Sacerdote**: [aperto] anteprima rogo "Morirà anche X (crepacuore)" insieme a "il Cavaliere lo protegge"; sacrificio di notte ok
- **Cavaliere x Scemo del Villaggio**: [dubbio] Cavaliere salva lo Scemo dalla rima (D1); riepilogo "è morto/a" errato
- **Chupacabra (da solo)**: [dubbio] Chupacabra rispetta la protezione (assunzione non confermata dal testo)
- **Chupacabra x Cortigiana**: [dubbio] dubbio testo 'sbranato' e doppione nel registro
- **Chupacabra x Lupo Mannaro**: [dubbio] Chupacabra + Lupo 1 contro 1: vincono i Lupi anche con il Chupacabra vivo; [aperto] Chupacabra non ancora assegnato (notte 1) ucciso dal branco: lo step Chupacabra non e' completabile (chip senza il morto, Avanti disabilitato) salvo Indietro
- **Chupacabra x Mezzosangue**: [dubbio] dubbio muore
- **Chupacabra x Mimo**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Chupacabra x Nonna**: [dubbio] dubbio noto (1 a 1)
- **Cortigiana (da solo)**: [dubbio] "Sbranato dal branco" o "morto di notte" in generale: lettura ampia mantenuta
- **Cortigiana x Figlia dei Lupi**: [dubbio] Cortigiana muore se visita la Figlia che diventa lupo la stessa notte (D8); [dubbio] dubbio (sopravvive)
- **Cortigiana x Mimo**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Cortigiana x Strega**: [dubbio] Cortigiana sopravvive se il cliente muore per la pozione mortale (lettura "sbranato dal branco")
- **Cucciolo di Lupo Mannaro (da solo)**: [dubbio] Cucciolo resuscitato dal Guaritore la notte della vendetta: i lupi sbranano comunque due vittime
- **Cucciolo di Lupo Mannaro x Guaritore**: [dubbio] Cucciolo resuscitato dal Guaritore la notte della vendetta: i lupi sbranano comunque due vittime
- **Cucciolo di Lupo Mannaro x Sacerdote**: [aperto] riepilogo del rogo senza la vendetta quando il Cucciolo muore di crepacuore
- **Fantasma Onnisciente x Guaritore**: [dubbio] Il Fantasma resuscitato conserva la carta Fantasma da vivo e non si puo riassegnare (dubbio di regolamento)
- **Fantasma Onnisciente x Sciacallo Mannaro**: [dubbio] Come Guaritore: resuscitato conserva eFantasmaOnnisciente (dubbio)
- **Fattucchiera x Lupo Mannaro**: [dubbio] inibire un lupo non ha effetto sul Branco (D10)
- **Fattucchiera x Mimo**: [dubbio] Mimo inibito dalla Fattucchiera: inibizione condivisa o per persona (Q12); [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Fattucchiera x Strega**: [aperto] primo Avanti non avanza sul passo inibito appena assegnato; blocco pozioni ok
- **Gallo Mannaro (da solo)**: [dubbio] Gallo che salta il giorno provato solo come dialog, non end-to-end
- **Gallo Mannaro x Pifferaio**: [aperto] Dopo refresh la coppia scelta dal Pifferaio resta ipnotizzata ma non e evidenziata (reselezione sostituisce); giorno saltato ok
- **Guardia Mannara (da solo)**: [dubbio] Sbranando la Guardia Mannara una volta "Nessuno e' morto" (non riprodotto)
- **Guardia Mannara x Veggente**: [dubbio] Veggente su Guardia Mannara: "Aura benevola"
- **Guardia x Ladro**: [aperto] problemi: passo Guardie duplicato (BUG 2), Guardia Mannara casuale puo' toccare il Ladro (dubbio 7)
- **Guardia x Mimo**: [dubbio] Mimo-guardia incluso tra i vivi del passo, senza etichetta (non verificato quale carta imita)
- **Guaritore x L'Antico**: [dubbio] ex Antico resuscitato con una sola vita (D7)
- **Guaritore x Mimo**: [dubbio] Poteri unici separati (Q5=B): implementazione per Guaritore senza test dedicato
- **Guaritore x Pifferaio**: [aperto] Con un solo giocatore non ipnotizzato rimasto (o dopo un conteggio dispari) il Pifferaio non puo ipnotizzarlo: "Servono almeno due bersagli disponibili" e Chiudi senza effetto, vittoria irraggiungibile; l'ultimo non ipnotizzato bruciato al rogo non da vittoria subito ma solo all'alba dopo (dubbio); resuscitato non ipnotizzato blocca correttamente la vittoria
- **Guaritore x Sacerdote**: [dubbio] partner morto di crepacuore resta morto senza avviso (D5); [dubbio] dubbio partner resta morto senza avviso
- **Innocente x Mimo**: [dubbio] Mimo-Scemo/Innocente non provati in partita
- **Inquisitore x Nonna**: [dubbio] risponde benevola e fa perdere il potere (D9); [dubbio] L'Inquisitore perde il potere sulla Nonna (aura benevola, noto)
- **Inquisitore x Pifferaio**: [dubbio] Aura del Pifferaio benevola: l'Inquisitore perde il potere interrogandolo (dubbio di regolamento)
- **Inquisitore x Sciacallo Mannaro**: [dubbio] Aura benevola dei mannari non-branco (Sciacallo, Polpo, Mucca, Gallo): Inquisitore perde il potere (dubbio, come Guardia Mannara)
- **L'Antico x Medium**: [dubbio] Medium indaga l'ex Antico come "villico"
- **L'Antico x Sacerdote**: [dubbio] Antico innamorato: rogo ok; crepacuore consuma la prima vita (D2); [aperto] crepacuore: Antico sopravvive, maledizione ok, partner morto; il riepilogo dice ancora "E morto anche G08" dopo la rivelazione
- **L'Antico x Spilungone**: [dubbio] Il Branco e' chiamato comunque dopo "notte senza vittime" (noto)
- **Ladro x Lupo Mannaro Capobranco**: [dubbio] vittoria Capobranco + lupo semplice contro un villico: vincono i lupi, obiettivo individuale del Capobranco non applicato
- **Ladro x Mimo**: [aperto] registro: "scarta" del Mimo e ordine delle voci invertito (cosmetico)
- **Ladro x Suocera**: [dubbio] dubbio 4
- **Lupo Mannaro Capobranco x Lupo Mannaro Progenitore**: [aperto] Il Progenitore puo "trasformare" un lupo (fratello sbranato): potere consumato senza effetto
- **Lupo Mannaro Capobranco x Nonna**: [dubbio] Il branco senza Capobranco puo' sbranare anche i lupi (anche la Nonna): chip dei lupi presenti
- **Lupo Mannaro Progenitore (da solo)**: [aperto] Dopo "trasforma" il bottone "Sbrana normalmente" risulta evidenziato (ambiguo)
- **Lupo Mannaro Progenitore x Mimo**: [aperto] potere di trasformazione condiviso: se si consuma quello del Mimo il Progenitore vero non può più trasformare (spec Q7: usi separati)
- **Lupo Mannaro x Spilungone**: [dubbio] "La notte cala senza vittime" ma i lupi possono sbranare
- **Lupo Mannaro x Untore**: [aperto] unzione: riepilogo senza nomi dei vicini
- **Maga x Mimo**: [dubbio] Azione di ogni notte unica e condivisa; escluso solo il primo titolare dai bersagli; [dubbio] Mimo inibito con Maga vera libera: azione unica condivisa ancora disponibile (dubbio Q12 confermato)
- **Medium (da solo)**: [dubbio] Medium indaga l'ex Antico come "villico"
- **Medium x Polpo Mannaro**: [dubbio] Il Medium interroga anche defunti della fazione lupi (testo: membro del villaggio) (dubbio)
- **Mimo x Paladino**: [dubbio] Azione di ogni notte unica e condivisa; escluso solo il primo titolare dai bersagli
- **Mimo x Pastore**: [dubbio] Mimo con Pastore/Ambasciatore e aura non provato in browser
- **Mimo x Pifferaio**: [dubbio] Il Pifferaio puo' ri-ipnotizzare chi lo e' gia'; [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile); [dubbio] Gruppo unico di 2 ipnotizzati per notte per Pifferaio e Mimo-Pifferaio, conforme alla spec; il passo non dice chi agisce
- **Mimo x Scemo del Villaggio**: [dubbio] Mimo-Scemo/Innocente non provati in partita
- **Mimo x Sciacallo Mannaro**: [dubbio] Poteri unici separati (Q5=B): implementazione per Sciacallo senza test dedicato
- **Mimo x Untore**: [dubbio] Azione di ogni notte unica e condivisa; escluso solo il primo titolare dai bersagli; [aperto] Condizione "unto" rimane sul morto per unzione fino a fine giorno (dati)
- **Mimo x Veggente**: [aperto] Togliere il Mimo dagli indagabili: non fondamentale (spec)
- **Mimo x Veggente Mannaro**: [dubbio] Escludere "il titolare" dai bersagli toglie solo il primo della lista (secondo titolare bersagliabile)
- **Mucca Mannara x Polpo Mannaro**: [dubbio] Il branco puo sbranare Polpo/Mucca/Sciacallo senza alcun avviso (dubbio di regolamento)
- **Nano (da solo)**: [dubbio] Nano e Criceto immuni solo ai lupi: la frase "puo' morire solo al rogo" potrebbe valere per ogni potere
- **Nano x Strega**: [dubbio] Nano immune solo ai lupi: la Strega puo' ucciderlo (immunita' totale?)
- **Pastore (da solo)**: [dubbio] Pastore con piu' lupi non coperto
- **Pifferaio (da solo)**: [aperto] Totale passi sovrastimato se il Pifferaio non ipnotizza
- **Sacerdote x Scemo del Villaggio**: [aperto] anteprima con crepacuore anche se il Cavaliere salva; senza Cavaliere ok
- **Sacerdote x Sciacallo Mannaro**: [dubbio] Sciacallo resuscita anche gli amanti: il partner morto resta morto senza avviso
- **Sciacallo Mannaro (da solo)**: [dubbio] Sciacallo resuscita anche gli amanti: il partner morto resta morto senza avviso
- **Spilungone (da solo)**: [dubbio] "La notte cala senza vittime" non blocca i poteri notturni
- **Strega (da solo)**: [dubbio] "Richiama i morti": Strega chiamata con entrambe le pozioni usate
- **Strega x Suocera**: [aperto] Dato: mortoDa non impostato per la vittima della pozione mortale (solo dato)

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

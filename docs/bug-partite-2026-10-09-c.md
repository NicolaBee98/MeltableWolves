# Batch partite 2026-10-09 (c): Cartomante/Medium "Mostra carta" e coppie di ruoli non valutate

Chromium reale (Playwright, 390x844, dev server porta 5543), nessuna modifica a `src/` ne' ai documenti esistenti. Script e screenshot in `/tmp/claude-1000/sp` (es. `t1e-ov.png` per l'overlay). Dove indicato ho pre-caricato localStorage (stati di notte 2 con ruoli gia' assegnati o giocatori morti) per saltare setup banali; i passi oggetto del test sono stati giocati dalla UI. Console: nessun errore ne' warning in tutti gli scenari; nessun overflow orizzontale (controllato su Cartomante/Medium, overlay incluso).

## Tema 1 - Cartomante e Medium con "Mostra carta"

### Scenario 1.1 - Cartomante su bersaglio ignoto (mazzo Cartomante, Medium, Cucciolo, Lupo, 3 Villici; notte 1)
- Selezione di G05 (ruolo ignoto): compaiono le chip "Che ruolo era" = [Medium, Villico]. Scegliendo Villico l'ordine resta [Medium, Villico]; riscegliendo Medium e poi deselezionando (stessa chip) l'ordine resta identico in tutti i passaggi. **ok** (chip stabili).
- Il pulsante "Mostra carta" e la riga "Mostra a Cartomante la carta: Villico" compaiono subito dopo la prima scelta, anche mentre il pannello di scelta della carta e' ancora aperto. **ok**
- Overlay: schermo intero con la carta (`/assets/carte/Villico_1.svg`) e ✕ in alto a destra; si chiude con ✕ e con Esc. Dopo refresh a overlay aperto l'overlay e' chiuso e "Mostra carta" e' di nuovo disponibile. **ok**
- Deselezione (stessa chip): torna a "nessuna scelta", sparisce la riga e il pulsante. **ok**
- "Annulla (cambia bersaglio)" e "Indietro" riportano G05 senza ruolo (verificato in localStorage: `ruoloSlug` nullo, `storiaRuoli` vuota). **ok**
- Refresh dopo la scelta: la schermata torna a "Chi indagare" con G05 selezionato e la riga "Mostra a Cartomante la carta: Villico" + "Mostra carta". **ok**, ma vedi BUG 2.

### Scenario 1.2 - Guardia / Guardia Mannara (Cartomante e Medium; notte 2, G05 Guardia, G07 Guardia Mannara, G010 Guardia morta)
- Cartomante su G05: "G05 e' una Guardia: la carta e' una Guardia o la Guardia Mannara?", chip [Guardia, Guardia Mannara] con ordine invariato a ogni scelta. Scegliendo "Guardia Mannara" l'app scambia il ruolo con la Guardia che prima era la Mannara (G05 diventa guardia-mannara con `guardiaDistinta`, G07 torna guardia); cambiando in "Guardia" lo scambio si rifa'; "Annulla" ripristina lo stato originale. **ok**
- "Mostra carta" presente subito dopo la scelta; con Guardia Mannara mostra `Guardia_Mannara.svg` (carta vera, "patteggia per i lupi"), overlay a schermo intero con ✕. **ok**
- Medium su Guardia morta (G010): stessa domanda e stessa carta; refresh a meta' mantiene riga + pulsante e stato; Indietro ripristina tutto. **ok**

### Scenario 1.3 - carta mostrata = carta iniziale (Cartomante, notte 2)
- Cucciolo cresciuto (ruolo lupo-mannaro, storia [cucciolo, lupo]): mostra **Cucciolo di Lupo Mannaro**. Verificato in partita vera (rogo del lupo, notte 2). **ok**
- Mimo che ha copiato un Lupo (partita vera, Mimo che imita G04 = Lupo Mannaro): la Cartomante su G01 vede **Mimo** (`Mimo.svg`), su G04 vede Lupo Mannaro. **ok**
- Ladro che ha preso Cavaliere (storia [ladro, cavaliere], stato pre-caricato): mostra **Ladro**. **dubbio** (DUBBIO 1)
- Apprendista che ha ereditato Boia (storia [apprendista, boia], pre-caricato): mostra **Apprendista**. **dubbio** (DUBBIO 1)
- Addolorata dopo lo scambio (storia [addolorata, villico], pre-caricato): mostra **Addolorata**. **dubbio** (DUBBIO 1)

### Scenario 1.4 - Medium su morti (notte 2)
- Medium su Cucciolo morto al rogo (cresciuto): "Mostra a Medium la carta: Cucciolo di Lupo Mannaro". **ok**
- Passando da un morto con carta nota (G09) a uno da distinguere (G010, Guardia) l'esito del precedente resta visibile: **BUG 1**.

## Tema 2 - coppie non valutate

### Scenario 2.1 - Cavaliere x Sacerdote, x Antico, x Mezzosangue, x Pifferaio (partite vere 7-10 giocatori)
- Cavaliere protegge l'Antico (ruolo ignoto), il branco morde l'Antico: avviso "Il Cavaliere si immola al posto di G05: muore G01, G05 si salva"; all'alba muore solo il Cavaliere, l'Antico non perde la prima vita. Con il Cavaliere innamorato di G09 (Sacerdote), all'alba muore anche G09 per crepacuore, registro senza doppioni. **ok / dubbio** (DUBBIO 2)
- Cavaliere protegge il Mezzosangue sbranato: il Mezzosangue non muore e diventa Lupo, il Cavaliere non si immola, nessun avviso di sacrificio. **ok** (registro con due righe quasi uguali, DUBBIO 9)
- Cavaliere protegge il Pifferaio, rogo del Pifferaio: l'esito dice "Il Cavaliere G01 lo protegge: si immola al suo posto"; dopo "Dichiara morte sul rogo" muore solo il Cavaliere, il Pifferaio resta vivo e gli ipnotizzati restano tali; il Sacerdote (Pifferaio innamorato di G09) non innesca crepacuore. **ok**
- Cavaliere protegge l'Antico, rogo dell'Antico (esito con "Si rivela: e' L'Antico"): scegliendo la rivelazione l'Antico sopravvive, **il Cavaliere non si immola** e resta vivo, villaggio maledetto la notte dopo. **dubbio** (DUBBIO 2)
- Cavaliere che protegge il Criceto morso: nessun sacrificio. **ok**

### Scenario 2.2 - Antico x Sacerdote x Guaritore x Strega (9 giocatori, partita vera, 3 notti)
- Antico innamorato, sbranato di notte: all'alba "G06 morto, G07 crepacuore"; da Eventi speciali "L'Antico si rivela" (G06) riporta in vita G06 da Villico e anche il partner G07, registro corretto. **ok**
- Antico innamorato al rogo: l'esito avvisa "Morira' anche G07 (crepacuore)"; dopo "Dichiara morte sul rogo" G06 e G07 muoiono e dagli Eventi speciali la rivelazione dell'Antico non e' piu' offerta per G06; "Annulla morte giocatore" (G06) riporta all'esito con "Si rivela: e' L'Antico" e annulla anche il crepacuore. Poi G06 sopravvive da Villico, G07 vivo, villaggio maledetto. **ok** (usabilita': DUBBIO 10)
- Notte maledetta: appare solo il passo Branco (Guaritore, Strega, Sacerdote non chiamati), banner "Il villaggio e' maledetto da L'Antico: questa notte agiscono solo i poteri malvagi". **ok**
- Secondo rogo dell'ex Antico: muore (nessuna rivelazione offerta), crepacuore del partner. Notte 3: il Guaritore resuscita G06: torna Villico "resuscitato", perde "innamorato", **G07 resta morto** senza avviso. **ok / dubbio** (DUBBIO 3)
- Strega vitale su Antico sbranato (preload notte 2): "Il morso non ha effetto su G03: e' protetto/a", l'Antico non perde la prima vita. **ok**

### Scenario 2.3 - Strega x Sacerdote / Guaritore x Sacerdote
- Strega pozione mortale su un innamorato (G07) nella stessa notte in cui il branco morde l'Antico (G06): all'alba muoiono G07, G06 e per crepacuore G08; registro con le tre morti, senza la causa (DUBBIO 8). **ok**
- Guaritore su innamorato morto di notte (G07): resuscita, perde "innamorato", il partner G08 (crepacuore) **resta morto senza avviso**. **dubbio** (DUBBIO 3, gia' in matrice)
- Strega vitale su Mezzosangue sbranato (preload): il morso non ha effetto e il Mezzosangue **non** si trasforma. **ok / dubbio** (DUBBIO 7)

### Scenario 2.4 - Chupacabra (partita vera 10 giocatori + preload)
- Notte 1, il Chupacabra punta un non lupo (l'Antico): "G04 non e' un lupo: la caccia del Chupacabra fallisce". **ok**
- Notte 2: il Chupacabra caccia l'ultimo lupo (l'altro era al rogo): muore, all'alba nessun banner (il villaggio non vince finche' il Chupacabra e' in vita). **ok**
- Notte 3 (lupi morti): uccide G04 (Antico, ruolo ignoto): all'alba "G04 e' morto/a di notte"; da Eventi speciali "L'Antico si rivela" funziona (G04 sopravvive da Villico). **ok**
- Notte 4: uccide il Mezzosangue: muore (nessuna trasformazione). **ok / dubbio** (DUBBIO 6)
- Notte 5: uccide G07 (innamorato): crepacuore di G08 all'alba. **ok**
- Rogo del Sacerdote, notte 6 ("Nessun bersaglio disponibile"): solo all'alba 6 il banner "Il Chupacabra e' l'ultimo sopravvissuto: vince lui" (una notte dopo essere rimasto solo). **ok** (gia' noto: vittoria solo all'alba)
- Chupacabra che uccide il cliente della Cortigiana (lupi morti): avviso "A casa di G03 c'e' anche la Cortigiana G02: entrambi moriranno"; muoiono entrambi; registro con due righe per la Cortigiana e testo "sbranato" anche se e' il Chupacabra. **ok / dubbio** (DUBBIO 9)
- Chupacabra che uccide direttamente la Cortigiana: muore. **ok** (la regola protegge solo dai lupi)
- Chupacabra x Figlia dei Lupi: uccide il genitore-lupo; all'alba "G02 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro", i lupi restano in gioco. **ok**

### Scenario 2.5 - Criceto Malvagio (selezionabile dal branco, mai ucciso)
- Branco sceglie il Criceto (notte 1 e preload notte 2): "Il morso non ha effetto su G03: il Criceto Malvagio non puo' essere sbranato", all'alba "Nessuno e' morto questa notte". **ok**
- Vittoria: 2 Lupi + Criceto + 1 Villico, morso al Villico: "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui", un solo banner con "Concludi partita". **ok**
- Lupi tutti morti con Criceto e Villici vivi: "vince il Villaggio". **dubbio** (DUBBIO 4)
- Lupi morti e solo il Criceto vivo: "Il Criceto Malvagio e' l'ultimo sopravvissuto: vince lui". **dubbio** (DUBBIO 4)
- 1 Lupo, 1 Criceto, 1 Villico: nessuna vittoria dei lupi (il Criceto conta nel "resto del villaggio"). **dubbio** (DUBBIO 4)

### Scenario 2.6 - Pifferaio, Cortigiana, Figlia dei Lupi
- Pifferaio ipnotizza gli ultimi due vivi (lupo + villico): all'alba "Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui". Con 2 lupi in parita' contro il solo Pifferaio, che ipnotizza i due lupi: banner solo del Pifferaio. **ok / dubbio** (DUBBIO 5)
- Cortigiana visita la Figlia dei Lupi nella notte in cui muore il genitore (villico sbranato): la Figlia diventa Lupo, la Cortigiana **sopravvive**. **ok / dubbio** (DUBBIO 11)

### Console / stabilita'
Nessun errore ne' warning; nessun softlock; refresh a meta' passo tenuto nei casi provati (salvo BUG 2).

## BUG CERTI

1. **Cartomante/Medium: l'esito del bersaglio precedente resta visibile mentre si sceglie la carta del nuovo bersaglio** (gravita' bassa, UI fuorviante).
   Passi: notte 2 con Medium e due defunti, G09 (Cucciolo, ruolo noto) e G010 (Guardia). Nel passo Medium selezionare G09: "Mostra a Medium la carta: Cucciolo di Lupo Mannaro" + "Mostra carta". Selezionare poi G010: compare "G010 e' una Guardia: la carta e' una Guardia o la Guardia Mannara?" ma sotto restano la riga di G09 e il pulsante "Mostra carta" (che apre la carta di G09). Vale anche col bersaglio ignoto e per la Cartomante. Lo stato interno e' coerente (l'indagine di G09 viene sostituita alla scelta della carta di G010).
   Causa probabile: `src/features/notte/azioni/AzioneRivelaRuolo.jsx:83-94` (`confermaScelta` apre la scelta senza liberare l'`indagineStanotte` precedente) e `:181` (la diramazione "in attesa di ruolo" rende `{esito}`, calcolato sul vecchio bersaglio, `:125-143`). Proposta: mostrare `{esito}` li' solo se `indagineStanotte.targetId === targetInAttesaDiRuolo`, oppure `liberaIndagine()` prima di aprire la scelta.

2. **Cartomante/Medium: dopo un refresh la carta assegnata a un bersaglio ignoto non si disfa piu' dalla chip** (gravita' bassa).
   Passi: notte 1, Cartomante su G05 ignoto, scegliere "Villico"; refresh; deselezionare G05. Il pannello torna a "Chi indagare" ma G05 resta `ruoloSlug: villico` / `storiaRuoli: [villico]` (verificato in localStorage) e, riselezionandolo, la Cartomante vede subito "Villico" senza piu' chiedere la carta; il mazzo considera quel Villico assegnato. Solo "Indietro" riporta G05 senza ruolo (verificato).
   Causa probabile: `AzioneRivelaRuolo.jsx:41` (`assegnato`, con lo stato "prima", e' uno `useState` locale perso al refresh) usato da `disfaAssegnazione` (`:76-81`); `confermaScelta` (`:84`) dopo il refresh fa solo `liberaIndagine`. Proposta: salvare lo stato "prima" nello stato persistito (es. dentro `ultimaIndagine`) oppure documentare che serve Indietro.

Nessun altro bug certo nelle coppie del tema 2.

## DUBBI (con proposta)

1. **Carta mostrata per Ladro, Apprendista e Addolorata dopo il cambio di ruolo** (`AzioneRivelaRuolo.jsx:17`, `cartaIniziale = storiaRuoli[0]`). Mostra la carta di partenza, ma per regola il giocatore ha preso fisicamente un'altra carta: Ladro "scambiare la propria carta" / "assumere il ruolo di una di queste" (roles.js, Ladro), Apprendista "ne prende la carta" (Apprendista), Addolorata "scambiare permanentemente il proprio ruolo con quello della vittima" (Addolorata). Il commit 59de201 giustifica `storiaRuoli[0]` con Cucciolo e Mimo, che tengono la carta. Proposta: carta iniziale solo per Cucciolo cresciuto e Mimo, ultima della storia per gli altri (o decidere esplicitamente). Nota: stati pre-caricati, non giocati la prima notte dalla UI.

2. **Cavaliere x Antico: notte e rogo non coerenti.** Di notte (Antico morso, Cavaliere lo protegge) il Cavaliere muore e l'Antico NON perde la prima vita; al rogo ("Si rivela: e' L'Antico") il Cavaliere NON si immola e l'Antico perde la prima vita. Regole: Cavaliere "se viene sbranata di notte il Cavaliere muore al suo posto; se... al rogo... si immola" (roles.js, Cavaliere); Antico "se perde la sua prima vita..." (L'Antico). Proposta: una sola lettura (consiglio: il Cavaliere si immola sempre e la prima vita resta intatta) e togliere "Si rivela" dall'esito quando c'e' un Cavaliere, oppure documentare la differenza.

3. **Guaritore (e Sciacallo) che riporta in vita un innamorato**: il partner morto di crepacuore resta morto senza avvisare il narratore e il resuscitato perde "innamorato". Gia' in matrice per Guaritore x Sacerdote; confermato (anche su ex Antico). Proposta: avviso all'alba ("G08 e' ancora morto: il legame con G07 si e' sciolto") o ripristino di entrambi.

4. **Criceto Malvagio**: (a) con tutti i lupi morti e il Criceto vivo coi Villici "vince il Villaggio"; (b) col solo Criceto vivo "vince lui" come ultimo sopravvissuto (non scritto: roles.js "Se i Lupi Mannari vincono, lui gli ruba la vittoria"); (c) nel conteggio dei lupi il Criceto sta nel "resto del villaggio" (1 lupo vs Criceto + 1 Villico: nessuna vittoria). Proposta: confermare (a) e (c) come regole di casa, e dichiarare o togliere (b).

5. **Pifferaio e Lupi che vincono nello stesso istante**: banner solo del Pifferaio anche con i lupi in parita'. Regole: Lupo Mannaro "pari o superiore" vs Pifferaio "avra' vinto il gioco". Proposta: tenere la precedenza del Pifferaio e scriverlo, o mostrare entrambi i banner.

6. **Chupacabra che uccide il Mezzosangue**: muore (la trasformazione vale "se viene sbranato dai lupi", Mezzosangue). Lettura letterale coerente; da confermare.

7. **Strega vitale su Mezzosangue morso**: il morso non ha effetto e il Mezzosangue non si trasforma (pozione "protegge un giocatore dalla morte", Strega, ma il Mezzosangue non morirebbe). Proposta: decidere se la trasformazione e' effetto del morso (annullato dalla protezione, come ora).

8. **Registro: manca l'uso della Strega** (pozione vitale e mortale): compaiono solo "ha ottenuto/perso la condizione protetto" e "e' morto/a di notte", mentre per il Guaritore c'e' "sceglie di resuscitare" (`src/data/log.js:106`, solo poteri di resurrezione). Proposta: "La Strega usa la pozione vitale/mortale su G0x".

9. **Doppioni nel registro**: Mezzosangue ("... e' stato sbranato e diventa Lupo Mannaro." + "... e' stato bersaglio dei lupi e diventa perciò Lupo Mannaro."); Cortigiana con cliente ucciso ("La Cortigiana G02 muore: il suo cliente G03 e' stato sbranato." + "G02 e' morto/a: il suo cliente e' stato sbranato"), con "sbranato" anche se e' il Chupacabra. Proposta: una voce sola e "ucciso" per il Chupacabra.

10. **Antico al rogo gia' dichiarato morto**: dopo "Dichiara morte sul rogo" la rivelazione dagli Eventi speciali non e' piu' offerta per il condannato (candidati solo morti di notte/colpo: `src/features/giorno/EventiSpeciali.jsx:174-179`); la via e' "Annulla morte giocatore" (funziona). Proposta: suggerirlo nel testo o ammettere anche il condannato del rogo corrente.

11. **Cortigiana x Figlia dei Lupi**: la Cortigiana che visita la Figlia nella notte in cui diventa Lupo sopravvive (visita valutata sul ruolo a inizio notte). Regola: "uccisa solo se fa visita ad un lupo mannaro" (Cortigiana). Proposta: lasciare ma dichiararlo.

## NON COPERTO
- Cavaliere x Antico/Mezzosangue/Pifferaio al rogo con Strega vitale o Guaritore nella stessa notte; Cavaliere con piu' protetti.
- Sacerdote x Pifferaio/Chupacabra/Criceto in partita completa; Sacerdote x Cortigiana (cliente lupo con partner).
- Mezzosangue x Antico/Pifferaio/Sacerdote (innamorato morso e trasformato), Mezzosangue x Criceto; Figlia dei Lupi x Sacerdote/Antico; Pifferaio x Antico (maledizione) e x Guaritore.
- Criceto x Cucciolo (vendetta con il Criceto tra i bersagli), Criceto x Strega/Guaritore (gia' in matrice), vincitori contemporanei (Pifferaio, Chupacabra, Criceto).
- Medium con variante (aura) e Mimo che copia Cartomante/Medium (due blocchi) col pulsante "Mostra carta"; Guardia/Guardia Mannara via Mimo; Ladro, Apprendista e Addolorata solo con stato pre-caricato.
- "Concludi partita" dopo i banner dei nuovi vincitori (solo verificata la presenza del pulsante).

## Coppie valutate (JSON-friendly)
```json
[
  "cartomante x medium: si, bug 1-2 su Mostra carta",
  "cartomante x guardia: si, ok",
  "cartomante x guardia-mannara: si, ok (carta vera)",
  "cartomante x cucciolo-di-lupo-mannaro: si, ok (carta iniziale)",
  "cartomante x mimo: si, ok (Mimo, non il ruolo copiato)",
  "cartomante x ladro: parziale, dubbio carta iniziale (pre-caricato)",
  "cartomante x apprendista: parziale, dubbio carta iniziale (pre-caricato)",
  "cartomante x addolorata: parziale, dubbio carta iniziale (pre-caricato)",
  "medium x cucciolo-di-lupo-mannaro: si, ok",
  "medium x guardia: si, ok",
  "medium x guardia-mannara: si, ok",
  "cavaliere x sacerdote: si, ok (crepacuore dopo l'immolazione)",
  "cavaliere x lantico: si, dubbio incoerenza notte/rogo",
  "cavaliere x mezzosangue: si, ok (nessun sacrificio)",
  "cavaliere x pifferaio: si, ok",
  "cavaliere x criceto-malvagio: si, ok (nessun sacrificio)",
  "guaritore x sacerdote: si, dubbio partner resta morto senza avviso",
  "guaritore x lantico: si, ok (torna Villico, resuscitato)",
  "strega x sacerdote: si, ok (registro senza causa)",
  "strega x lantico: si, ok (vitale protegge)",
  "strega x mezzosangue: si, dubbio protezione impedisce trasformazione",
  "sacerdote x lantico: si, ok (catena annullata dalla rivelazione)",
  "sacerdote x chupacabra: si, ok",
  "sacerdote x pifferaio: parziale, rogo con Cavaliere ok",
  "lantico x chupacabra: si, ok",
  "mezzosangue x chupacabra: si, dubbio muore",
  "chupacabra x cortigiana: si, dubbio testo 'sbranato' e doppione nel registro",
  "chupacabra x figlia-dei-lupi: si, ok",
  "cortigiana x figlia-dei-lupi: si, dubbio (sopravvive)",
  "pifferaio x lupo-mannaro: si, dubbio precedenza vittoria",
  "criceto-malvagio x lupo-mannaro: si, dubbio conteggio e vittoria",
  "criceto-malvagio x pifferaio: no",
  "figlia-dei-lupi x sacerdote: no"
]
```

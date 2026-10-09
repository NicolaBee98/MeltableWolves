# Batch partite 2026-10-09 (h): ruoli poco coperti (Eremita, Innocente, Bardo, Guardie, Fantasma, Villico, Suocera, Scemo, Ambasciatore, Ubriaco, Maga) e punti "NON COPERTO" di -e/-f

Chromium reale (Playwright, 390x844, dev server porta 5582, codice a b35d5fc). Nessuna modifica a `src/` ne' ai documenti esistenti. Script e screenshot in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad/h` (checkpoint `ck-*.json` nella cartella superiore). Tutti i passi oggetto del test sono stati giocati dalla UI (Mazzo -> Giocatori -> notti -> alba -> voto -> rogo -> Eventi speciali -> Concludi). Per le sole vittorie finali ho modificato i flag `vivo` di un checkpoint (dichiarato per scenario). Console: nessun errore ne' warning in tutti gli scenari; nessun overflow orizzontale nelle schermate controllate (mazzo, giocatori, notte, notte saltata dal Bardo, alba, voto, rogo, Diario, popup Concludi). Decisioni del proprietario (batch a-g) non riproposte.

Partite (tutte con nomi Anna, Bruno, Carla... nell'ordine dei posti):
- **H1** (14 giocatori): Lupo, Nonna, Polpo, Veggente, Ambasciatore, Eremita, Innocente, Suocera, Ubriaco, Maga, Guardia x2 + Guardia Mannara, Villico. 5 notti fino a "vincono i Lupi".
- **M-x** (7-9 giocatori, una partita per ruolo copiato): Mimo che copia Maga, Untore, Paladino, Veggente Mannaro, Progenitore, Gallo Mannaro, Ubriaco, Eremita, Ambasciatore, Innocente, Medium, Nonna (come unica lupa).
- **H3** (10): Lupo x2, Gallo, Veggente Mannaro, Bardo, Fantasma, Scemo, Medium, Villico x3 (Gallo/Veggente Mannaro morti al rogo senza aver usato il potere, Bardo, Fantasma).
- **C** (10): Lupo, Maga, Untore, Fattucchiera, Polpo, Chupacabra, Criceto, Veggente, Villico x2 fino a "Chupacabra ultimo sopravvissuto".
- **E** (13): Lupo, Figlia dei Lupi, Sacerdote, Pifferaio, Antico, Ambasciatore, Veggente, Eremita, Innocente, Scemo, Ubriaco, Maga, Villico fino alla vittoria del Pifferaio; **N** (11): Figlia/Sacerdote/Pifferaio/Antico dopo la Maledizione.
- **F** (17): Lupo, Cucciolo, Guardie + GM, Bardo, Eremita, Innocente, Suocera, Scemo, Ambasciatore, Ubriaco, Maga, Fantasma, Berserker, Mezzosangue, Villico x2.
- **J** (12): Guardie + GM con Cavaliere, Sacerdote, Guaritore, Boia, Alchimista, Strega. **U** (9): Ubriaco con Paladino, Strega, Cavaliere. **G** (9): Eremita/Inquisitore/Cartomante/Medium con Mimo.

## Scenari

### S1 - Prima notte con i ruoli "di passaggio" (H1, F, E)
- Passi: Nonna, Lupo ("Seleziona i lupi rimanenti"), Eremita, Polpo, Ubriaco, Ambasciatore, Guardie (si riconoscono, 3 selezioni con la Mannara), Maga, Veggente, Branco; Innocente, Suocera, Villico, Scemo non hanno passo e restano "?". Il passo Bardo/Gallo mostra "ti mostra il suo gesto segreto". **ok**
- La Guardia Mannara e' scelta a caso tra le tre selezioni (stato interno), il display la mostra "Guardia" (rogo, Morti, alba). **ok**
- Veggente su Eremita: "Aura malvagia"; su Nonna: "Aura benevola" (Ambasciatore annuncia all'alba); su Polpo: "Accecato dal Polpo Mannaro" + "Aura benevola", dopo cieco tutti benevoli. Ambasciatore: nessun annuncio quando la lettura e' malvagia (Eremita), annuncio negli altri casi, anche con il Veggente cieco (noto). **ok**
- Maga: "Giulia e' stato trasformato in maiale" (grammatica maschile, noto), condizione persiste fino al rogo e si perde al "giorno" (log "ha perso la condizione"). Maga su Berserker / Guardia / Ambasciatore / Innocente: nessuna interferenza. **ok**

### S2 - Innocente, Suocera, Scemo, Fantasma in giorno (H1, F, H3)
- "L'Innocente si rivela" (elenco dei soli ignoti): dopo la rivelazione il giocatore resta "innocente" anche se trasformato dalla Maga; poi messo al rogo senza nessun effetto speciale. **ok**
- Suocera: dopo la morte (rogo) compare "La Suocera si rivela" in Eventi speciali (solo se c'e' un morto ignoto); rivelata, il suo slug diventa `suocera` e non conta piu' per la vittoria. **ok** (ma vedi BUG 2).
- Scemo: elenco = ignoti vivi (Innocente, Suocera, Scemo, Villico non ancora rivelati), uccide e registra ruolo; Innocente dopo che lo Scemo e' morto resta proponibile. **ok**
- Fantasma Onnisciente: "Assegna la carta ... al primo morto" compare dopo il primo rogo, e sparisce dopo l'assegnazione; assegnato a un ex Gallo/Eremita, il Medium vede ancora la carta del ruolo in vita. Nessun passo notturno extra. **ok**
- Gallo Mannaro e Veggente Mannaro morti al rogo senza usare il potere (NON COPERTO di -e): la voce "Il Gallo Mannaro salta il giorno" sparisce dal menu all'alba successiva; il Veggente Mannaro morto compare come "Chiama comunque Dario". **ok**

### S3 - Bardo (H3, F)
- Dopo un rogo, "Il Bardo salta la notte" -> conferma ("la notte successiva tutti rimarranno svegli") -> "Il Bardo ha dato il segnale: la notte successiva sara' saltata". La notte successiva mostra "Questa notte non si svolge per i poteri del Bardo" con Indietro e "Vai all'alba (tieni premuto)"; dopo refresh resta uguale; layout pulito, nessun overflow (la riga "layout schiacciato" della matrice non si riproduce). **ok**
- Bardo morto di notte prima del potere (F, notte 2): la voce non compare nel menu del rogo successivo. Bardo con Gallo, Veggente Mannaro, Medium, Fantasma nella stessa partita: nessuna interferenza. **ok**

### S4 - Ubriaco (H1, E, F, U, M)
- Ubriaco sbranato: avviso "Irene e' l'Ubriaco: il branco sara' stordito la prossima notte"; la notte dopo il passo Branco dice "ancora stordito dall'alcol: non puo' cacciare" e nessuno muore; due notti dopo i lupi cacciano. **ok**
- Ubriaco al rogo: nessuno stordimento. **ok**
- Ubriaco protetto da Paladino e da Cavaliere: "Il morso non ha effetto" / il Cavaliere si immola, nessuno stordimento (verificato anche con la Strega: la pozione mortale sull'Ubriaco e' assorbita dal Cavaliere). **ok**
- Ubriaco + Maledizione dell'Antico la stessa notte (E): passo Branco "stordito" e poi Pifferaio e Ipnotizzati agiscono. Mimo-Ubriaco sbranato: stordisce. Figlia dei Lupi con genitore Ubriaco sbranato: stordimento + "Bruno e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro" nello stesso alba. **ok**

### S5 - Mimo che copia i ruoli non coperti (M-x)
- Mimo-Maga, Mimo-Untore, Mimo-Paladino, Mimo-Veggente Mannaro: il passo mostra "Vivi: Bruno, Carla (Mimo)" con un solo gruppo di scelta (azione unica e condivisa, decisione gia' presa); titolare sbranato la notte 1 (Maga, Untore, Veggente Mannaro) o messo al rogo (Paladino): la notte 2 il Mimo agisce da solo, "Morti: Bruno". La scelta resta dopo refresh. **ok**
- Mimo-Progenitore: l'opzione "Il Progenitore trasforma X in Lupo Mannaro" e' proposta anche la notte 2 (potere separato per il Mimo, coerente con Q5=B); il Mimo conta come lupo per la vittoria. **ok**
- Mimo-Gallo: dopo aver usato "Il Gallo Mannaro salta il giorno" l'alba 2 propone di nuovo la voce (potere separato del Mimo). **ok**
- Mimo-Eremita: Veggente "Aura malvagia", Inquisitore "si' (aura malvagia)"; Cartomante su Mimo-Eremita mostra la carta "Mimo", sul vero Eremita la carta "Eremita". **ok**
- Mimo-Ambasciatore: un solo messaggio all'alba anche con due titolari, resta finche' ne vive uno. **ok**
- Mimo-Innocente: "L'Innocente si rivela" propone entrambi i titolari. Il Mimo-Nonna conta come lupo: banner "Lupi" con Mimo-Nonna sola contro un villico. **ok**
- Mimo-Medium (NON COPERTO di -e): passo "Vivi: Bruno, Carla (Mimo)" con un solo blocco "Chi interrogare (defunto)" e un solo "Mostra carta" per i due titolari. **ok / dubbio lieve** (D4).
- La chip "Che carta ha davvero X?" per un bersaglio ignoto offre ora Innocente, Scemo, Suocera, Lupo, Villico (carte "a rivelazione" incluse). **ok**

### S6 - Maga/Untore/Fattucchiera/Polpo con Chupacabra e Criceto fino alla vittoria (C)
- Notte 1: Fattucchiera su Maga -> "Il potere e' inibito questa notte dalla Fattucchiera: nessuna azione disponibile"; Untore unge, Veggente su Polpo "Accecato", Branco su Criceto "Il morso non ha effetto: il Criceto Malvagio non puo' essere sbranato", Chupacabra su Polpo "Elena non e' un lupo: la caccia fallisce". **ok**
- Fattucchiera su Chupacabra: caccia bloccata, "Anna" salva. Notte 3: caccia su Anna (lupo) la uccide; Chupacabra sul Criceto "Nessuno e' morto" (D2 di -f, gia' deciso come noto). Notte 5: senza lupi il Chupacabra uccide anche il Polpo. **ok**
- Dopo il rogo del Criceto: banner "Il Chupacabra e' l'ultimo sopravvissuto" solo all'alba dopo 6 passi "Chiama comunque ..." (gia' noto). Con Chupacabra + Criceto vivi nessun banner e il Criceto e' inattaccabile di notte (stallo di notte, si esce solo con il rogo). **ok / noto**
- Unzione: "Morte per unzione" -> "l'unzione passa ai due vicini vivi, Dario e Fabio"; l'unto scompare al cambio notte. **ok**

### S7 - Figlia dei Lupi, Sacerdote, Pifferaio, Antico oltre alla Maledizione (E, N)
- Figlia con genitore Antico (N): al rogo l'Antico si rivela e sopravvive, la Figlia resta Figlia; quando l'Antico muore di notte (seconda vita) escono insieme "Fabio e' morto di crepacuore" (partner innamorato) e "Carla e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro". Innamorato che e' anche Antico: nessun crepacuore alla prima vita. **ok**
- Antico ipnotizzato: la Maledizione lascia agire solo Pifferaio, Branco e Ipnotizzati; l'ipnosi resta anche dopo la rivelazione (`villico[innamorato,ipnotizzato]`). **ok**
- Innamorata Ambasciatore al rogo: la Maga innamorata muore di crepacuore, il passo Maga e' "Chiama comunque". **ok**
- Vittoria del Pifferaio (checkpoint con 2 morti notturni aggiunti): "Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui." anche con 2 lupi vivi ipnotizzati; il banner resta dopo refresh. **ok**

### S8 - Guardie con Cavaliere, Sacerdote, Boia, Guaritore (J)
- Cavaliere protegge una Guardia sbranata: "Il Cavaliere si immola al posto di Bruno" (alba: "si e' rivelato: e' il Cavaliere"). **ok**
- Sacerdote che unisce Guardia + Guardia Mannara: passo "Innamorati (si riconoscono)"; il Boia (ignoto) giustizia la Mannara: "e' morto anche Carla (crepacuore)", Morti la mostra "Guardia". Guaritore resuscita la Mannara: torna viva senza `innamorato`, il partner resta morto. Sbranando la Mannara innamorata: "Carla | Dario" all'alba con crepacuore (il "Nessuno e' morto" di -a non si e' riprodotto). **ok**
- Vittoria "Lupi": Lupo + Guardia Mannara resuscitata vs un villico: banner "I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro" (la Mannara conta come resto: decisione gia' presa; il banner non nomina chi vince con i lupi, D3). **ok / dubbio**

### S9 - Indietro, refresh, Indietro del telefono, Concludi (H1, d, u1, z1)
- Indietro al passo Maga cancella la scelta (chip di nuovo non premuto) e si puo' riscegliere. Refresh sul passo Veggente cieco ripristina "Accecato dal Polpo Mannaro: Dario" + aura. Refresh nel passo Maga/Medium conserva la selezione. Alba, voto, rogo dopo refresh: invariati. **ok**
- Tasto Indietro del telefono (history): Mazzo -> Home; Giocatori -> Mazzo; Notte, Alba, Voto restano nella fase (anche con piu' Indietro). **ok**
- Concludi: popup "Concludere la partita e tornare alla Home?" con "Si', concludi"/"Annulla"; torna alla Home, log azzerato, "Nuova Partita" riapre il mazzo (9 carte) senza Borgomastro. **ok**
- Diario (H1, 4 round): ordine causale corretto (Notte -> Alba -> Rogo -> Giorno), rivelazioni di Innocente e Suocera, trasformazioni e perdite di condizione; senza voci sulle indagini (gia' deciso). **ok**

## BUG CERTI

1. **L'ultimo giocatore "ignoto" diventa Borgomastro (ruolo `borgomastro`) invece di Villico.** Gravita' media (informazioni sbagliate al narratore).
   Passi: Mazzo = Lupo Mannaro, Cartomante, Veggente, Villico (4 giocatori Anna..Dario). Notte 1: Anna=Lupo, Bruno=Cartomante, Carla=Veggente, branco su Carla. Alba 1: in `localStorage` `meltable-wolves-partita` Dario ha `ruoloSlug:'borgomastro'` (e `storiaRuoli:['borgomastro']`). Giorno 1: rogo di Anna; notte 2: Cartomante su Dario -> "Mostra a Cartomante la carta: Borgomastro" (doveva essere Villico). Stesso effetto in H1 (Paolo, dopo la rivelazione della Suocera) e con il Medium sui morti. L'avviso "Il villaggio deve eleggere un Borgomastro" resta anche con un "Borgomastro" in gioco. Non succede con 2+ Villici ignoti (la capacita' non coincide).
   Causa probabile: `src/features/notte/NightSequencer.jsx:830` (`ruoliNonVillicoPendenti` filtra `ruoliSelezionati`, a cui `src/App.jsx:78-81` aggiunge sempre `'borgomastro'` anche se non e' una carta del mazzo, vedi commento "il Borgomastro non e' una carta"): con un solo giocatore senza ruolo la capacita' residua `(quantita['borgomastro'] ?? 1) - 0 = 1` coincide e `autoAssegnaRuoliRimasti` (`:825-855`) gli assegna `borgomastro`. Proposta: escludere `'borgomastro'` da `ruoliNonVillicoPendenti` (o non dedurre mai ruoli non presenti in `quantita`).

2. **Banner "vincono i Lupi" prematuro quando muore (non ancora rivelata) la Suocera.** Gravita' bassa/media.
   Passi: F (17 giocatori) ridotta a Bruno e Nico (lupi), Elena, Hugo, Sara, Tino, Olga vivi, Suocera = Tino non rivelata (`ruoloSlug` assente). Notte: branco su Tino. Alba: "Lupi in numero pari o superiore" mentre ci sono 3 abitanti (Elena, Hugo, Sara) contro 2 lupi. Dopo "La Suocera si rivela -> Tino" il banner sparisce (screen `f5` nello scratchpad).
   Causa probabile: `src/data/vittoria.js:30-38` (`suoceraNascosta` toglie dagli abitanti un vivo che in realta' e' gia' morto tra i "?"). Il narratore puo' concludere la partita per errore. Proposta: finche' esiste un morto con ruolo ignoto e la Suocera e' nel mazzo non mostrare il banner (o avvisare "se la Suocera e' morta, rivelala prima").

## DUBBI (con proposta)

D1. **Cavaliere che si immola anche per la pozione mortale della Strega** (U, notte 2: Strega mortale su Bruno protetto dal Cavaliere: muore Elena, Bruno vive). Regola (roles.js, Cavaliere): "Se questa persona viene sbranata di notte il Cavaliere muore al suo posto". La pozione non e' "sbranata". Gia' accennato in -f D1 (protezione per ogni colpo). Proposta: confermare o limitare ai morsi.

D2. **Il Cucciolo che matura per la morte di un lupo causata dal Berserker non viene annunciato all'alba** (F, notte 1: sbranato il Berserker, muoiono Marta e Anna: l'alba mostra solo "Anna | Marta", il Diario dice "Bruno ha assunto il ruolo di Lupo Mannaro"). Con la caccia del Chupacabra l'avviso c'e' (`effettiNotte.js:171`). Proposta: stesso avviso "Morto un lupo, il Cucciolo Bruno diventa adulto" nell'alba.

D3. **Il banner di vittoria dei Lupi non nomina chi vince con loro** (Guardia Mannara, Polpo, Veggente Mannaro, Gallo...; roles.js, Guardia Mannara: "vince se vincono i lupi mannari"). Proposta: aggiungere "con la Guardia Mannara X" quando e' viva o, almeno, un'indicazione nel banner.

D4. **Mimo-Medium/Mimo-Cartomante hanno un solo blocco e una sola carta mostrata per i due titolari** (azione unica condivisa, decisione gia' presa): il Medium e il Mimo-Medium interrogano quindi lo stesso defunto. Se la decisione include "poteri unici separati" (Q5=B) va chiarito che la scelta del bersaglio e' comune.

D5. **Chupacabra + Criceto**: il Criceto e' inattaccabile di notte, il Chupacabra non puo' vincere se non al rogo (D2 di -f, solo conferma: provata la sequenza fino a "ultimo sopravvissuto" dopo il rogo del Criceto).

## UX

1. Dopo il banner di vittoria resta "Il villaggio deve eleggere un Borgomastro (menu "Eventi speciali")" e "Vai al voto" (visto in tutte le vittorie: Lupi, Pifferaio, Chupacabra) (gia' segnalato in -f UX2, ancora presente).
2. Dopo un rogo che chiude la partita (es. Chupacabra rimasto solo) il banner arriva solo dopo 6 passi "Chiama comunque ..." della notte (noto).
3. "Giulia e' stato trasformato in maiale", "Marta e' stato trasformato" e "si e' rivelato/a" usano il maschile o l'ambiguo (noto).

## NON COPERTO
- Mimo che copia Fattucchiera, Sciacallo, Cucciolo, Capobranco in partita (solo Maga, Untore, Paladino, Veggente Mannaro, Progenitore, Gallo, Ubriaco, Eremita, Ambasciatore, Innocente, Medium, Nonna); Mimo-Suocera e Mimo-Scemo al rogo.
- Maga con Fattucchiera inibita al rogo, Untore con Cortigiana/Cavaliere (gia' in -e).
- Guardia/Guardia Mannara con Ladro, Addolorata, Apprendista (altri batch); Fantasma assegnato a una Guardia o a un Bardo morto.
- Innocente o Suocera mostrati/uccisi dall'Alchimista; Scemo con Cartomante su ignoti (-f D5).
- Medium variante aura (impostazione non toccata), riordino con touch reale, PWA su telefono.

## Coppie valutate (JSON-friendly)
```json
[
  "ambasciatore x veggente: si, ok (silenzio con Eremita malvagio, annuncio con Nonna e Polpo)",
  "ambasciatore x nonna: si, ok",
  "ambasciatore x polpo-mannaro: si, ok (annuncio anche col Veggente cieco: noto)",
  "ambasciatore x eremita: si, ok",
  "ambasciatore x maga: parziale, ok",
  "ambasciatore x sacerdote: si, ok (innamorata muore al rogo, crepacuore)",
  "ambasciatore x pifferaio: parziale, ok",
  "ambasciatore x mimo: si, ok (un solo messaggio, vale finche' vive un titolare)",
  "eremita x veggente: si, ok (aura malvagia)",
  "eremita x mimo: si, ok (Mimo-Eremita malvagio per Veggente e Inquisitore, Cartomante mostra Mimo)",
  "eremita x inquisitore: si, ok (nessuna perdita del potere)",
  "eremita x cartomante: si, ok",
  "eremita x fantasma-onnisciente: si, ok (primo morto al rogo)",
  "eremita x pifferaio: si, ok",
  "eremita x maga: parziale, ok",
  "innocente x maga: si, ok (trasformato persiste dopo la rivelazione)",
  "innocente x suocera: si, ok",
  "innocente x scemo-del-villaggio: si, ok",
  "innocente x mimo: si, ok",
  "innocente x borgomastro: parziale, ok",
  "innocente x lupo-mannaro: parziale, ok",
  "suocera x lupo-mannaro: si, bug 2 (banner Lupi prematuro con Suocera non rivelata)",
  "suocera x villico: si, bug 1 (ultimo ignoto -> borgomastro)",
  "suocera x scemo-del-villaggio: si, ok (elenco degli ignoti)",
  "suocera x borgomastro: parziale, ok",
  "suocera x ubriaco: parziale, ok",
  "suocera x ambasciatore: parziale, ok",
  "villico x borgomastro: si, bug 1 (Villico ultimo ignoto assegnato al Borgomastro)",
  "villico x cartomante: si, bug 1 (Cartomante mostra la carta Borgomastro)",
  "villico x veggente: si, bug 1",
  "villico x medium: parziale, ok",
  "ubriaco x lupo-mannaro: si, ok (stordimento solo se sbranato)",
  "ubriaco x nonna: parziale, ok",
  "ubriaco x maga: parziale, ok",
  "ubriaco x veggente: parziale, ok",
  "ubriaco x paladino: si, ok (protetto: nessuno stordimento)",
  "ubriaco x cavaliere: si, ok",
  "ubriaco x strega: parziale, ok (pozione assorbita dal Cavaliere, dubbio D1)",
  "ubriaco x mimo: si, ok",
  "ubriaco x lantico: si, ok (Maledizione + stordimento nella stessa notte)",
  "ubriaco x figlia-dei-lupi: si, ok",
  "ubriaco x pifferaio: si, ok",
  "ubriaco x berserker: parziale, ok",
  "maga x veggente: si, ok",
  "maga x guardia: si, ok",
  "maga x guardia-mannara: parziale, ok",
  "maga x nonna: parziale, ok",
  "maga x mimo: si, ok (azione condivisa, titolare morto la notte 1)",
  "maga x berserker: si, ok",
  "maga x pifferaio: si, ok",
  "maga x sacerdote: parziale, ok",
  "maga x chupacabra: si, ok (fino alla vittoria)",
  "maga x criceto-malvagio: si, ok",
  "maga x fantasma-onnisciente: parziale, ok",
  "maga x fattucchiera: si, ok (inibita)",
  "maga x polpo-mannaro: parziale, ok",
  "untore x mimo: si, ok",
  "untore x chupacabra: si, ok",
  "untore x criceto-malvagio: si, ok",
  "untore x veggente: parziale, ok",
  "untore x fattucchiera: parziale, ok",
  "untore x polpo-mannaro: parziale, ok",
  "fattucchiera x chupacabra: si, ok (caccia bloccata)",
  "fattucchiera x polpo-mannaro: parziale, ok",
  "fattucchiera x criceto-malvagio: parziale, ok",
  "chupacabra x polpo-mannaro: si, ok (il Polpo non e' un lupo: caccia fallisce; senza lupi lo uccide)",
  "chupacabra x veggente: si, ok",
  "polpo-mannaro x veggente: si, ok (accecato, cieco benevolo)",
  "polpo-mannaro x criceto-malvagio: parziale, ok",
  "polpo-mannaro x nonna: parziale, ok",
  "guardia x guardia-mannara: si, ok (display sempre Guardia)",
  "guardia x cavaliere: si, ok",
  "guardia x sacerdote: si, ok (Guardia + Mannara innamorate)",
  "guardia x boia: si, ok",
  "guardia x guaritore: si, ok",
  "guardia x strega: parziale, ok",
  "guardia x alchimista: parziale, ok",
  "guardia x lupo-mannaro: si, ok",
  "guardia x fantasma-onnisciente: parziale, ok",
  "guardia x innocente: parziale, ok",
  "guardia x suocera: parziale, ok",
  "guardia x scemo-del-villaggio: parziale, ok",
  "guardia x bardo: parziale, ok",
  "guardia-mannara x guaritore: si, ok (resuscitata senza innamorato)",
  "guardia-mannara x sacerdote: si, ok",
  "guardia-mannara x boia: si, ok",
  "guardia-mannara x cavaliere: parziale, ok",
  "guardia-mannara x lupo-mannaro: si, ok (vittoria, dubbio D3 banner)",
  "guardia-mannara x nonna: parziale, ok",
  "bardo x gallo-mannaro: si, ok",
  "bardo x veggente-mannaro: si, ok",
  "bardo x medium: si, ok",
  "bardo x fantasma-onnisciente: si, ok (Bardo morto prima del potere: voce assente)",
  "bardo x lupo-mannaro: si, ok",
  "bardo x scemo-del-villaggio: parziale, ok",
  "bardo x eremita: parziale, ok",
  "bardo x ubriaco: parziale, ok",
  "bardo x maga: parziale, ok",
  "bardo x berserker: parziale, ok",
  "bardo x guardia: parziale, ok",
  "fantasma-onnisciente x gallo-mannaro: si, ok",
  "fantasma-onnisciente x medium: si, ok",
  "fantasma-onnisciente x scemo-del-villaggio: parziale, ok",
  "fantasma-onnisciente x suocera: parziale, ok",
  "gallo-mannaro x mimo: si, ok (potere separato riproposto)",
  "gallo-mannaro x veggente-mannaro: si, ok (morti al rogo senza potere)",
  "veggente-mannaro x mimo: si, ok",
  "veggente-mannaro x polpo-mannaro: si, ok (non accecato: aura benevola)",
  "lupo-mannaro-progenitore x mimo: si, ok (potere ripresentato al Mimo)",
  "paladino x mimo: si, ok",
  "nonna x mimo: si, ok (lupa unica + Mimo-Nonna, vittoria Lupi)",
  "nonna x veggente: si, ok",
  "nonna x medium: parziale, ok",
  "nonna x cartomante: si, ok (Cartomante su Mimo-Nonna: carta Mimo)",
  "medium x mimo: si, ok (blocco unico, dubbio D4)",
  "medium x cartomante: parziale, ok",
  "cartomante x mimo: si, ok",
  "inquisitore x mimo: si, ok",
  "figlia-dei-lupi x lantico: si, ok (genitore Antico: prima vita non conta)",
  "figlia-dei-lupi x sacerdote: si, ok",
  "figlia-dei-lupi x pifferaio: si, ok",
  "figlia-dei-lupi x maga: parziale, ok",
  "sacerdote x lantico: si, ok (partner non muore alla prima vita)",
  "sacerdote x pifferaio: si, ok",
  "pifferaio x lantico: si, ok (Maledizione: Pifferaio agisce, ipnosi resta)",
  "pifferaio x veggente: parziale, ok",
  "pifferaio x scemo-del-villaggio: parziale, ok",
  "berserker x cucciolo-di-lupo-mannaro: si, dubbio D2 (maturazione non annunciata)",
  "berserker x mezzosangue: parziale, ok",
  "mezzosangue x ubriaco: parziale, ok",
  "mezzosangue x maga: parziale, ok",
  "scemo-del-villaggio x fantasma-onnisciente: parziale, ok",
  "scemo-del-villaggio x ubriaco: parziale, ok",
  "scemo-del-villaggio x eremita: parziale, ok",
  "cavaliere x strega: si, dubbio D1 (si immola anche per la pozione mortale)"
]
```

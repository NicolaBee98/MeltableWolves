# Batch di partite 2026-10-14 (c): coppie ancora senza evidenza "si" - 2026-10-14

Chromium reale (Playwright, 390x844, dev server porta 5593, commit 41e11ea), nessuna modifica al codice. 12 partite da 9 a 12 giocatori, con mazzi da 3-5 ruoli dell'elenco `/tmp/coppie-2.txt` (90 coppie) piu' varianti ripartendo da checkpoint di localStorage (stato salvato dopo ogni notte/alba/rogo e ripristinato con refresh). Ruoli, scelte, rogo, eventi speciali e vittorie giocati dalla UI; ho solo (a) forzato i flag `vivo` per le vittorie finali (Criceto, Pifferaio) e (b) scambiato in localStorage quale delle tre Guardie e' la Guardia Mannara (l'app lo assegna a caso, vedi DUBBI 8). Console: nessun errore ne' warning in tutte le partite; nessun overflow orizzontale; nessun softlock. Refresh a meta' (checkpoint) e Indietro provati piu' volte senza problemi.

Legenda esito: **ok** / **BUG** / **dubbio**.

## Partita 1 - Addolorata con Inquisitore, Ambasciatore, Polpo, Untore, Criceto, Ubriaco (10: Lupo, Polpo, Criceto, Ambasciatore, Veggente, Inquisitore, Untore, Addolorata, Ubriaco, Villico)
- Notte 1: Veggente sul Polpo -> "Accecato dal Polpo" + "Aura benevola"; alba "messaggio dall'ambasciatore"; branco sbrana l'Ubriaco (avviso "stordito la prossima notte"); notte 2 branco "ancora stordito". **ok**
- **Addolorata x Inquisitore**: bruciato l'Inquisitore che aveva gia' perso il potere (indagine su un villico), la notte 2 l'Addolorata diventa Inquisitore e il passo mostra "Ha perso il proprio potere" (il potere perso segue la carta, coerente con le decisioni: i legami seguono la carta). Il morto ha la carta Addolorata. Diario: "ora e' Inquisitore e G06 ha la carta Addolorata". **ok**
- **Addolorata x Ambasciatore**: bruciato l'Ambasciatore (anche Borgomastro), l'Addolorata diventa Ambasciatore; il Veggente cieco indaga G10 (benevolo) e all'alba 2 compare "messaggio dall'ambasciatore" (avviso nuova elezione Borgomastro presente). **ok**
- **Addolorata x Polpo**: bruciato il Polpo, l'Addolorata diventa Polpo; l'accecamento del Veggente cade con la morte del Polpo originale (notte 2 senza avviso) ma alla notte 3 il Veggente indaga la nuova Polpo e viene riaccecato. **ok / dubbio** (vedi DUBBI 1).
- **Addolorata x Untore**: bruciato l'Untore, la notte 2 il passo Untore e' attivo per G08 (ex Addolorata) nella stessa notte e unge. **ok**
- **Addolorata x Criceto**: bruciato il Criceto, l'Addolorata diventa Criceto; con soli lupo + lei vivi, banner "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari". **ok**
- **Addolorata x Ubriaco**: bruciato l'Ubriaco, l'Addolorata diventa Ubriaco; sbranata la notte 2 -> notte 3 "branco ancora stordito". **ok**

## Partita 2 - Guardie/Guardia Mannara con Capobranco, Paladino, Veggente Mannaro, Mezzosangue, Eremita, Pifferaio, Antico (10)
- **Guardia Mannara x Paladino**: il Paladino protegge la Guardia Mannara, il Capobranco la sbrana: "Il morso non ha effetto su G09: e' protetto/a", alba "Nessuno e' morto". **ok**
- **Guardia Mannara x Pifferaio**: Pifferaio ipnotizza GM e Antico; il passo "Ipnotizzati" li elenca vivi; alla fine con GM ipnotizzata e Capobranco ipnotizzato "Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui" (la GM conta come "resto del villaggio" nel pareggio lupi). **ok**
- **Antico x Paladino**: bruciato l'Antico (conferma "Si rivela"), notte 2 maledetta: banner "agiscono solo i poteri malvagi", il Paladino non compare, restano Pifferaio, Veggente Mannaro, Branco. **ok**
- **Veggente Mannaro x Mezzosangue**: VM sul Mezzosangue "Aura benevola"; branco lo sbrana -> "diventa Lupo Mannaro" (alba), resta ipnotizzato; il Capobranco lo sbrana a sua volta la notte 3 (fratello) e il morto e' registrato. **ok**
- VM sulla Guardia Mannara: "Aura benevola"; VM sull'Eremita: "Aura malvagia". **ok**
- Vittoria simultanea Pifferaio + lupi: vedi DUBBI 2.

## Partita 3 - Apprendista con Berserker, Nonna, Untore, Eremita, Villico; Boia, Cortigiana, Cartomante (11: 2 Lupi, Nonna, Apprendista, Berserker, Boia, Cortigiana, Eremita, Cartomante, Untore, Villico)
- **Apprendista x Berserker**: maestro il Berserker sbranato: muoiono Berserker e la Nonna (lupo piu' vicino, Nonna conta come lupo); l'Apprendista "si rivela ... eredita il ruolo di Berserker". **ok**
- **Apprendista x Nonna**: maestro la Nonna (uccisa dal Berserker): eredita la Nonna e dalla notte 2 il branco ha "Vivi: G01, G02, G04". **ok**
- **Apprendista x Untore**: maestro l'Untore sbranato: eredita e il passo Untore della notte 2 e' attivo per l'Apprendista. **ok**
- **Apprendista x Eremita**: maestro l'Eremita (unto) sbranato: eredita l'Eremita. **ok**
- **Apprendista x Villico**: maestro un Villico sbranato: "prende la sua carta (ruolo ancora ignoto: resta ignoto finche' non viene rivelato)" (`ereditaIgnota`). **ok**
- **Berserker x Boia**: il Boia giustizia l'Apprendista-Berserker: morto senza vendetta (`mortoDa: boia`). **ok**
- **Boia x Lupo Mannaro / Boia x Cortigiana**: giustiziati un lupo e la Cortigiana via Eventi speciali: ok; "Il Boia giustizia" sparisce dal menu dopo l'uso. **ok** (per la Cortigiana: assenza di interazione provata)
- **Cortigiana + Berserker**: Cortigiana in visita a un lupo che il Berserker uccide la stessa notte: muoiono G01, G04 (Berserker sbranato), G07 (Cortigiana, "cliente lupo"); vittoria Villaggio all'alba. **ok**
- Cartomante sul Berserker prima del morso: nessun problema nello stato (il testo della carta non ispezionato): **parziale**.

## Partita 4 - Figlia dei Lupi, Inquisitore, Suocera, Sciacallo, Medium, Mezzosangue, Veggente Mannaro, Scemo, Untore (11)
- **Figlia x Inquisitore**: dopo il rogo del genitore (Lupo) "La Figlia dei Lupi G02 e' diventata Lupo Mannaro"; notte 2 l'Inquisitore su di lei: "Rispondi all'Inquisitore: si (aura malvagia)", branco con "Vivi: G02". **ok**
- **Medium x Suocera**: Suocera sbranata (si rivela dal menu Eventi speciali "La Suocera si rivela"), il Medium la interroga: "Mostra a Medium la carta: Suocera". **ok**
- **Sciacallo x Suocera**: resuscitata dallo Sciacallo (`resuscitato`, `suocera-rivelata` mantenuto), alba "G04 e' stato resuscitato". **ok**
- **Borgomastro x Inquisitore**: Borgomastro G03 (Inquisitore) sbranato: alba con avviso di nuova elezione. **ok**
- **Borgomastro x Sciacallo**: dopo la rielezione di G11, lo Sciacallo resuscita l'Inquisitore: `eBorgomastro` false (resta G11). **ok**
- **Borgomastro x Mezzosangue**: Borgomastro Mezzosangue sbranato -> Lupo Mannaro, resta Borgomastro. **ok**
- **Medium x Mezzosangue**: Mezzosangue trasformato e bruciato: al Medium la carta "Lupo Mannaro" (ruolo corrente). **ok**
- **Scemo x Untore**: Scemo unto, poi bruciato il giorno dopo: nessuna interazione nell'app. **parziale** (assenza di interazione).

## Partita 5 - Cucciolo, Nonna, Pastore, Bardo, Progenitore, Spilungone, Veggente, Untore, Pifferaio, Fantasma, Villico (10)
- **Progenitore x Bardo**: il Progenitore trasforma il Bardo sbranato; in una seconda partita il Bardo (non trasformato) usa "Il Bardo salta la notte" dal menu Eventi speciali del giorno (notte 2 "non si svolge per i poteri del Bardo", Indietro annulla il gesto). **ok**
- **Bardo x Cucciolo**: Cucciolo bruciato il giorno 1 + Bardo che salta la notte 2: la "Vendetta del Cucciolo" slitta alla notte 3 ("vittima 1 di 2"). **ok**
- **Cucciolo x Pastore / Cucciolo x Borgomastro**: Cucciolo bruciato, notte 2 vendetta: sbranati il Borgomastro (Spilungone) e il Pastore ("vittima 1 di 2" poi passa da solo a "2 di 2", "Il branco ha gia' sbranato le sue vittime"); alba con avviso elezione. Il passaggio automatico alla seconda vittima e' ok ma, con Avanti subito dopo la prima, la seconda vittima resta vuota senza avviso (dubbio minimo, vedi DUBBI 7). **ok**
- **Borgomastro x Spilungone**: Spilungone eletto Borgomastro: al rogo il menu offre "Si rivela: e' lo Spilungone" (Conferma): la notte cala senza vittime e resta Borgomastro. **ok**
- **Pifferaio x Spilungone**: Spilungone ipnotizzato e poi rivelato al rogo: resta ipnotizzato. **ok**
- **Borgomastro x Nonna**: Nonna eletta Borgomastro e bruciata: "Morto un lupo: il Cucciolo e' diventato adulto", avviso nuova elezione. **ok**
- **Fantasma x Pastore / Fantasma x Veggente**: carta Fantasma data al Pastore bruciato e (altra partita) al Veggente morto di notte (`eFantasmaOnnisciente`). **ok**
- **Cucciolo x Villico / Nonna x Villico**: Villico (senza ruolo noto) sbranato dal branco: ok. **ok** (assenza di interazione)
- Pastore: "Si sentono dei belati" coerente (Nonna a fianco), anche con notte saltata dal Bardo (vedi DUBBI 6).

## Partita 6 - Alchimista, Nano, Innocente, Sacerdote, Cortigiana, Capobranco, Mucca, Gallo, Cavaliere (10)
- Notte 1: Sacerdote lega Innocente+Cortigiana, Cavaliere si sacrifica per l'Innocente, Cortigiana in visita all'Innocente, branco sbrana l'Innocente: "Il Cavaliere si immola al posto di G07", la Cortigiana NON muore (il cliente non e' stato sbranato). **ok** (Cavaliere x Innocente, Cortigiana x Innocente, Innocente x Sacerdote)
- **Innocente**: "L'Innocente si rivela" e' nel menu Eventi speciali (non nel rogo, che offre solo "Si rivela: e' l'Alchimista"); dopo la rivelazione "Dichiara morte sul rogo" resta cliccabile e i 3 voti restano: il narratore deve usare "Torna al voto" (voluto: la decisione di non bruciarlo e' del villaggio). Spareggio G05/G07 con "Condanna" ok. **ok**
- **Alchimista x Nano**: l'Alchimista puo' portare con se' il Nano (G06 e' tra i candidati): morto, `mortoDa: alchimista`. **ok / dubbio** (DUBBI 4).
- **Alchimista x Cortigiana**: trascina la Cortigiana, muore anche l'innamorato (crepacuore). **ok**
- **Alchimista x Gallo**: trascina il Gallo: dall'alba la voce "Il Gallo Mannaro salta il giorno" sparisce. **ok**
- Branco che sbrana il Nano: "Nessuno e' morto questa notte". **ok**
- **Capobranco x Mucca**: il Capobranco con il branco sbrana la Mucca (fratello): muore. **ok**
- Cortigiana in visita al Capobranco: muore (`cliente-lupo`), crepacuore dell'Innocente, vittoria lupi per parita'. **ok**
- **Capobranco x Sacerdote**: Capobranco innamorato bruciato: il partner non muore perche' il Cavaliere si immola "al posto di G07 (crepacuore)". **dubbio** (DUBBI 3).
- Innocente x Nano, Gallo x Innocente: coesistono senza interazione: **parziale**.

## Partita 7 - Ladro con Ambasciatore, Veggente, Antico, Alchimista, Medium, Progenitore, Veggente Mannaro, Figlia, Eremita, Criceto (10 giocatori + 2 carte del Ladro)
- Ladro: due menu "Prima/Seconda carta" (carte fuori dal mazzo, tra quelle non assegnate), bottoni di scelta e "Resta Villico". **ok**
- **Ambasciatore x Figlia**: Ambasciatore sbranato -> Figlia orfana diventa lupo ("G03 e' la Figlia dei Lupi e rimasta orfana"). **ok**
- **Ambasciatore x Ladro**: il Ladro prende l'Ambasciatore (carta extra): G10 storia [ladro, ambasciatore], il Veggente indaga un benevolo e all'alba arriva "il messaggio dall'ambasciatore". **ok**
- **Ambasciatore x Antico**: Antico bruciato, notte maledetta: il Veggente non agisce, nessun messaggio. **ok**
- **Alchimista x Medium / Progenitore / Veggente Mannaro**: Alchimista bruciato trascina ciascuno (tre varianti dallo stesso checkpoint): ok. **ok**
- **Ladro x Veggente Mannaro**: il Ladro prende il VM e indaga gia' la notte 1 ("Aura benevola"); il Veggente indaga il Ladro-VM. **ok**
- **Criceto x Ladro**: il Ladro prende il Criceto: immune al branco ("Nessuno e' morto"), con soli lui e il Progenitore vivi "Il Criceto Malvagio ruba la vittoria". **ok**
- **Eremita x Medium** (variante Medium attiva da prima): Eremita defunto "Aura malvagia". **ok**. **BUG minore** (vedi BUG CERTI 1): attivando la variante dalle impostazioni a passo gia' avviato con un defunto selezionato compare "Aura benevola" per un Eremita.
- Figlia con genitore Eremita sbranato: diventa lupo. **ok**

## Partita 8 - Guardie/GM, Addolorata, Apprendista, Cortigiana, Eremita, Capobranco, Gallo, Ubriaco, Polpo (11)
- **Apprendista x Guardia Mannara**: maestro la GM sbranata: eredita la carta, mostrata come "Guardia" (ruoloPerDisplay), storia [apprendista, guardia-mannara]. **ok**
- **Cortigiana x Guardia Mannara**: la Cortigiana in visita alla GM (non lupo del branco) sopravvive alla visita ma il branco sbrana la GM: "A casa di G05 c'e' anche la Cortigiana: entrambi moriranno" (`cliente-sbranato`). **ok**
- **Addolorata x Eremita**: Eremita bruciato, Addolorata diventa Eremita. **ok**
- Gallo "salta il giorno" da alba 2: si passa direttamente alla notte 3; Ubriaco sbranato notte 2 -> notte 3 branco stordito; passi promemoria per Addolorata morta (G10, carta gia' usata) e Cortigiana. **ok / dubbio** (DUBBI 5).
- Gallo x Guardia, Guardia x Ubriaco: presenti insieme senza interazione: **parziale**.

## Partita 9 - Guardie/GM, Addolorata, Eremita, Mezzosangue, Figlia, Paladino, Berserker, Capobranco, Sacerdote (11)
- Sacerdote lega Eremita + GM, Figlia con genitore il Berserker, Paladino protegge una Guardia, branco sbrana il Berserker: muoiono Berserker e Capobranco (lupo piu' vicino); la Figlia non conta come lupo prima di trasformarsi, poi diventa lupo. **ok** (Figlia x Berserker)
- **Eremita x Sacerdote / Eremita x Guardia Mannara**: GM bruciata, l'Eremita muore di crepacuore. **ok**
- **Addolorata x Guardia Mannara**: la notte 2 l'Addolorata scambia con la GM bruciata, Diario "ora e' Guardia e G05 ha la carta Addolorata" (la GM mostrata come Guardia). **ok**
- **Guardia x Figlia / Guardia x Capobranco**: Guardia genitore della Figlia sbranata dal branco (Paladino su altra Guardia): la Figlia diventa lupo. **ok**
- **Guardia x Paladino**: Paladino protegge la Guardia, il branco la morde: "Il morso non ha effetto", nessun morto. **ok**
- Mezzosangue x GM: **parziale** (nessuna interazione specifica).

## Partita 10 - Capobranco, Polpo, Strega, Untore, Boia, Fattucchiera, Berserker, Eremita, Inquisitore, Scemo, Suocera, Veggente Mannaro (12)
- **Capobranco x Strega**: Strega con pozione vitale su se stessa, branco la morde: "Il morso non ha effetto". **ok**
- **Boia x Fattucchiera**: Fattucchiera inibisce G05 (Boia, ruolo non assegnato); il Boia giustizia comunque il giorno dopo (l'inibizione vale solo per le azioni notturne, conditions.js). **ok** (assenza di interazione)
- **Boia x Veggente Mannaro**: giustiziato il VM: ok.
- **Capobranco x Untore**: Capobranco unto, "Morte per unzione": l'unzione passa ai due vicini vivi (G11 e G02, saltando il VM gia' morto). **ok**
- **Berserker x Eremita**: Berserker sbranato con Eremita e Polpo accanto: uccide il Capobranco (lupo piu' vicino), non l'Eremita ne' il Polpo; poi "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio" con il Polpo vivo (definizione di "lupo" gia' decisa). **ok**
- Capobranco x Polpo: **parziale**.

## Partita 11 - Gallo, Veggente Mannaro, Figlia, Guardie, Nano, Innocente, Ambasciatore, Alchimista, Ubriaco, Lupo (11)
- **Figlia x Nano**: genitore il Nano: non muore di notte; bruciato il giorno 2 la Figlia diventa lupo. **ok**
- **Alchimista x Ambasciatore**: trascina l'Ambasciatore (Borgomastro): avviso di nuova elezione. **ok**
- **Guardia x Veggente Mannaro**: VM sulla Guardia "Aura benevola"; il VM non genera il messaggio dell'Ambasciatore (solo il Veggente). **ok**
- Guardia x Ubriaco, Ambasciatore x Innocente, Innocente x Nano: nessuna interazione specifica. **parziale**

## Partita 12 - Inquisitore, Suocera, Scemo, Apprendista, Criceto, Sciacallo, Ubriaco, Pastore, 2 Villici, 2 Lupi (12)
- **Inquisitore x Suocera**: indagine sulla Suocera (ruolo non assegnato nell'app, quindi benevolo): "perde il potere". **ok / dubbio** (DUBBI 9).
- **Inquisitore x Scemo**: indagine sullo Scemo e successivo rogo dello Scemo: perdita del potere, ok. **ok**
- **Apprendista x Criceto**: Criceto bruciato, l'Apprendista "ha ereditato il suo ruolo"; con lupo + Criceto vivi "Il Criceto Malvagio ruba la vittoria". **ok**
- **Sciacallo x Villico**: lo Sciacallo resuscita il Villico sbranato: `resuscitato`, alba "G11 e' stato resuscitato". **ok**
- Borgomastro x Pastore: Pastore eletto Borgomastro, belati coerenti con il lupo accanto: **parziale** (mai morto).
- Ubriaco x Villico: Ubriaco sbranato, branco stordito la notte successiva con i Villici vivi: **parziale**.

## Partita 13 (mini) - Guardie/GM, Mezzosangue, Antico, Lupo, 3 Villici (9)
- **Guardia Mannara x Antico**: notte maledetta senza passo Guardie (solo la prima notte) e senza effetti sulla GM; **Guardia Mannara x Mezzosangue**: Mezzosangue sbranato diventa lupo, nessuna interazione con la GM. **parziale** (assenza di interazione provata).

## BUG CERTI
1. **Variante Medium attivata a passo gia' aperto mostra un'aura sbagliata (minore, riproducibile)**. Passi: partita con Medium e un Eremita morto; notte, passo Medium (variante spenta), selezionare il defunto Eremita ("Mostra a Medium la carta: Eremita"); aprire Impostazioni e attivare "Variante Medium: percepisce solo l'aura"; chiudere: il passo mostra con il defunto ancora selezionato "Aura benevola" invece di "Aura malvagia" (se si deseleziona e riseleziona esce correttamente "Aura malvagia"). Causa probabile: `AzioneMedium.jsx:9-14` cambia componente (AzioneRivelaRuolo -> AzioneIndagine) ma la selezione resta nello stato condiviso del passo e `AzioneIndagine.jsx` (etichetta esito, ~riga 103) non ha `ultimaIndagine` per quel bersaglio, quindi ripiega su "benevola". Poco realistico a tavolo; correzione facile: mostrare l'esito solo se `ultimaIndagine` esiste o azzerare la scelta al cambio variante.

Nessun altro bug certo.

## DUBBI (con proposta)
1. **Accecamento del Veggente e Addolorata-Polpo.** Regola (roles.js, Polpo): "Da allora fino alla morte del Polpo, il Veggente vedra' ognuno come benevolo". Se il Polpo viene bruciato e l'Addolorata ne prende la carta (e ora e' lei il Polpo), l'accecamento cade subito (notte 2 senza avviso) ma torna se il Veggente la indaga (notte 3). Proposta: lasciare (la "morte del Polpo" e' avvenuta), oppure far durare l'accecamento finche' esiste un Polpo vivo; documentarlo comunque.
2. **Vittoria simultanea Pifferaio + lupi.** Alba in cui il Pifferaio ha appena ipnotizzato tutti i vivi (esclusa lui) e contemporaneamente i lupi sono in pari (1 Capobranco contro il solo Pifferaio): il banner mostra solo "I Lupi Mannari sono in numero pari o superiore...". Nessuna regola in roles.js (Pifferaio: "Quando tutti i giocatori in vita saranno ipnotizzati, egli avra' vinto il gioco"). Proposta: dare priorita' esplicita (es. al Pifferaio, che vince "subito") o mostrare entrambe le righe e lasciare decidere al narratore.
3. **Cavaliere che si immola per il crepacuore del protetto.** Se il protetto del Cavaliere morirebbe di crepacuore (innamorato del bruciato), l'app fa morire il Cavaliere al suo posto ("Il Cavaliere G10 si immola al posto di G07 (crepacuore)"). Regola (Cavaliere): solo "sbranata di notte" o "messa al rogo". Coerente con la decisione sulla pozione mortale della Strega, ma qui il testo dice proprio "crepacuore". Proposta: tenere come accettato oppure escludere il crepacuore (la morte per amore non e' ne' sbranamento ne' rogo).
4. **Alchimista che porta con se' il Nano.** Nano: "Puo' morire solo durante il rogo"; l'esplosione dell'Alchimista avviene al rogo e il Nano e' tra i candidati. Proposta: lasciare (lo ritengo coerente), eventualmente una riga nel promemoria del Nano.
5. **Notte con Addolorata morta con carta ormai usata**: dopo lo scambio la morta tiene la carta Addolorata e ogni notte compare "Chiama comunque G10 per il suo turno" (promemoria bluff). Va bene come bluff ma il potere e' consumato (sta sull'ex Addolorata). Proposta: lasciare (il promemoria dei morti e' attivo per scelta).
6. **Belati dopo notte saltata dal Bardo**: "Si sentono dei belati" compare all'alba successiva a una notte saltata. Il Pastore e' passivo e la posizione dei lupi non cambia, quindi e' coerente; segnalo solo per completezza.
7. **Vendetta del Cucciolo: Avanti con la seconda vittima vuota.** Dopo aver scelto la prima vittima il passo passa a "vittima 2 di 2" e Avanti e' abilitato anche senza scegliere nessuno (nessun avviso "manca la seconda vittima"). Proposta: avviso come per il maestro dell'Apprendista ("Non hai scelto..."), anche se a volte il branco puo' non avere altra vittima.
8. **Guardia Mannara assegnata a caso**: il narratore non sceglie quale tra i titolari delle Guardie e' la GM (nota gia' in 2026-10-07b DUBBI 6): per testare coppie con la GM ho dovuto forzare localStorage. Proposta come allora: far scegliere la GM nel passo "Guardie (si riconoscono)".
9. **Suocera e Scemo senza ruolo assegnato**: Suocera/Scemo non hanno passo dedicato, quindi l'app non sa chi sono finche' non sono rivelati; l'Inquisitore su di loro e il Veggente/VM li trattano come "ruolo ignoto" = benevolo (corretto per la Suocera, che e' benevola). Nessun problema, ma se la Suocera viene indagata da un Cartomante/Medium la carta mostrata dipende dalla rivelazione. Proposta: lasciare.
10. **Ladro: Avanti senza scelta.** Con le due carte scartate indicate ma senza premere una delle tre scelte (carta A, carta B, "Resta Villico") Avanti e' abilitato: il Ladro resta con ruolo "ladro" e il passo successivo chiede di assegnare a un giocatore anche una carta che e' tra le due scartate (es. "Criceto Malvagio: seleziona 1 giocatore"). Proposta: richiedere la scelta del Ladro prima di Avanti (stessa questione di 2026-10-07b DUBBI 1 per la Cartomante) e togliere dagli assegnabili le due carte scartate.
11. **Fantasma Onnisciente: avviso senza candidati.** Dopo un rogo senza morti (Spilungone che si rivela) resta "Assegna la carta del Fantasma Onnisciente al primo morto (menu Eventi speciali)" ma la voce "Assegna il Fantasma" non esiste ancora nel menu (nessun morto) e l'avviso scompare solo dopo l'assegnazione. Proposta: mostrare l'avviso solo se esiste almeno un morto assegnabile.

## NON COPERTO
- Cartomante sul Berserker (testo della carta mostrata): solo lo stato e' stato controllato.
- Pastore Borgomastro morto; Capobranco x Polpo e Mezzosangue x Guardia Mannara oltre la coesistenza; Gallo con Guardie/Innocente (il gesto del Gallo e' stato usato solo con Guardie in partita 8).
- Ubriaco x Villico con vittime del branco il giorno dopo; Innocente x Nano e Ambasciatore x Innocente nello stesso scenario.
- Ladro che prende il Progenitore o un lupo (solo VM, Criceto, Ambasciatore).
- Suocera indagata dall'Inquisitore con la Suocera gia' rivelata.

## COPPIE VALUTATE (JSON-friendly)
```
"addolorata x inquisitore": "si, erediti il potere perso: ok",
"addolorata x ambasciatore": "si, ok",
"addolorata x polpo-mannaro": "si, dubbio accecamento (DUBBI 1)",
"addolorata x untore": "si, ok",
"addolorata x criceto-malvagio": "si, ok",
"addolorata x ubriaco": "si, ok",
"addolorata x eremita": "si, ok",
"addolorata x guardia-mannara": "si, ok (mostrata come Guardia)",
"guardia-mannara x paladino": "si, ok",
"guardia-mannara x pifferaio": "si, ok",
"lantico x paladino": "si, ok",
"mezzosangue x veggente-mannaro": "si, ok",
"apprendista x berserker": "si, ok",
"apprendista x nonna": "si, ok",
"apprendista x untore": "si, ok",
"apprendista x eremita": "si, ok",
"apprendista x villico": "si, ok (ruolo ignoto)",
"apprendista x guardia-mannara": "si, ok",
"apprendista x criceto-malvagio": "si, ok",
"berserker x boia": "si, ok",
"berserker x eremita": "si, ok",
"berserker x figlia-dei-lupi": "si, ok",
"berserker x cartomante": "parziale, carta non ispezionata",
"boia x lupo-mannaro": "si, ok",
"boia x cortigiana": "si, assenza di interazione",
"boia x fattucchiera": "si, assenza di interazione",
"boia x veggente-mannaro": "si, ok",
"cortigiana x innocente": "si, ok",
"cortigiana x guardia-mannara": "si, ok",
"innocente x sacerdote": "si, ok",
"cavaliere x innocente": "si, ok",
"alchimista x nano": "si, dubbio lieve (DUBBI 4)",
"alchimista x cortigiana": "si, ok",
"alchimista x gallo-mannaro": "si, ok",
"alchimista x medium": "si, ok",
"alchimista x lupo-mannaro-progenitore": "si, ok",
"alchimista x veggente-mannaro": "si, ok",
"alchimista x ambasciatore": "si, ok",
"lupo-mannaro-capobranco x mucca-mannara": "si, ok",
"lupo-mannaro-capobranco x sacerdote": "si, dubbio Cavaliere/crepacuore (DUBBI 3)",
"lupo-mannaro-capobranco x strega": "si, ok",
"lupo-mannaro-capobranco x untore": "si, ok",
"lupo-mannaro-capobranco x polpo-mannaro": "parziale, coesistenza",
"guardia x lupo-mannaro-capobranco": "si, ok",
"guardia x figlia-dei-lupi": "si, ok",
"guardia x paladino": "si, ok",
"guardia x veggente-mannaro": "si, ok",
"guardia x ubriaco": "parziale, coesistenza",
"gallo-mannaro x guardia": "parziale, coesistenza",
"gallo-mannaro x innocente": "parziale, coesistenza",
"eremita x guardia-mannara": "si, ok",
"eremita x sacerdote": "si, ok",
"eremita x medium": "si, BUG minore variante Medium a passo aperto",
"eremita x lupo-mannaro-capobranco": "parziale, coesistenza",
"figlia-dei-lupi x inquisitore": "si, ok",
"figlia-dei-lupi x nano": "si, ok",
"figlia-dei-lupi x veggente-mannaro": "parziale, coesistenza",
"ambasciatore x figlia-dei-lupi": "si, ok",
"ambasciatore x ladro": "si, ok",
"ambasciatore x lantico": "si, ok",
"ambasciatore x innocente": "parziale, coesistenza",
"criceto-malvagio x ladro": "si, ok",
"ladro x veggente-mannaro": "si, ok",
"medium x suocera": "si, ok",
"medium x mezzosangue": "si, ok",
"sciacallo-mannaro x suocera": "si, ok",
"sciacallo-mannaro x villico": "si, ok",
"borgomastro x inquisitore": "si, ok",
"borgomastro x sciacallo-mannaro": "si, ok",
"borgomastro x mezzosangue": "si, ok",
"borgomastro x cucciolo-di-lupo-mannaro": "si, ok",
"borgomastro x spilungone": "si, ok",
"borgomastro x nonna": "si, ok",
"borgomastro x pastore": "parziale, Pastore mai morto",
"cucciolo-di-lupo-mannaro x pastore": "si, ok",
"cucciolo-di-lupo-mannaro x villico": "si, assenza di interazione",
"nonna x villico": "si, assenza di interazione",
"ubriaco x villico": "parziale, coesistenza",
"bardo x lupo-mannaro-progenitore": "si, ok",
"bardo x cucciolo-di-lupo-mannaro": "si, ok (vendetta rimandata)",
"pifferaio x spilungone": "si, ok",
"fantasma-onnisciente x pastore": "si, ok (dubbio avviso DUBBI 11)",
"fantasma-onnisciente x veggente": "si, ok",
"fantasma-onnisciente x untore": "parziale, nessuna interazione specifica",
"inquisitore x scemo-del-villaggio": "si, ok",
"inquisitore x suocera": "si, ok (ruolo ignoto, DUBBI 9)",
"scemo-del-villaggio x untore": "parziale, assenza di interazione",
"guardia-mannara x mezzosangue": "parziale, coesistenza",
"guardia-mannara x lantico": "parziale, assenza di interazione",
"innocente x nano": "parziale, coesistenza"
```
Conteggio: tutte le 90 coppie dell'elenco hanno una valutazione: 75 "si" (alcune con dubbio o bug minore indicati) e 15 "parziale" (coesistenza senza interazione provata). Le coppie con "assenza di interazione" marcate "si" sono state giocate in scenari mirati (entrambi i ruoli attivi nella stessa partita con azioni sull'altro o sul suo bersaglio).

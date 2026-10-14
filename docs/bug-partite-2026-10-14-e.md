# Batch di partite di prova 2026-10-14 (e): coppie senza evidenza "si" (Boia, Alchimista, Fantasma, Capobranco, Guardie, Bardo/Apprendista/Figlia, Eremita, Addolorata/Suocera, Ladro, Mezzosangue)

Chromium reale (Playwright, 390x844, dev server porta 5595, codice a 41e11ea), nessuna modifica a `src/` ne' ai docs esistenti. 14 partite da 6-11 giocatori giocate dalla UI (mazzo, giocatori, assegnazione, notti, alba, voto, rogo, eventi speciali); checkpoint di localStorage usati solo per ripartire da un'alba o per forzare i flag "vivo" nei finali. Refresh a meta' (alba, passo di notte con scelta pendente) e Indietro provati; il tasto Indietro del telefono (history.back) resta nella fase. Console: nessun errore/warning in nessuna partita; nessun overflow orizzontale. Script e snapshot in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad/f`.

## Scenario 1 - Boia, Medium, Untore, Innocente, Ubriaco, Criceto, Mucca (9 giocatori)
- Boia (G01) rivelato dagli Eventi speciali ("Il Boia giustizia": prima "Chi e' il Boia" + Conferma, poi "Chi giustizia il Boia" + Conferma): giustizia il Criceto (notte 1), poi in varianti la Mucca, l'Ubriaco vivo, l'Untore, il Polpo. Il Boia che giustizia l'Ubriaco vivo non stordisce il branco (notte 2 normale); l'Ubriaco sbranato stordisce ("Il branco e' ancora stordito dall'alcol dell'Ubriaco"). **ok**
- Medium: nessun defunto in notte 1 ("chiamalo comunque"); notte 2 elenco defunti (G06, G07, G09) e "Mostra a Medium la carta: Criceto Malvagio / Ubriaco / Innocente / Lupo Mannaro" (carta corrente). Su un defunto con carta ignota chiede "quale ruolo mostra?" (Innocente/Villico). **ok** (il Medium interroga anche il Criceto, fazione indipendente: gia' noto, batch 2026-10-05-batch4)
- Innocente unto dall'Untore che si rivela: "G04 si e' rivelato/a: e' l'Innocente", l'unzione resta fino all'alba successiva. Innocente sbranato e interrogato dal Medium: carta "Innocente". **ok**
- Boia unto dall'Untore: Boia giustizia il Criceto, poi (dopo "Vai al voto") "Morte per unzione" su G01: muore e l'unzione passa ai due vicini vivi (G08, G02); il menu del Boia morto non offre piu' l'evento. **ok** (causaMorte dell'unzione e' "colpo", come per il Boia: solo interno)
- Boia giustizia l'Untore: notte 2 "Chiama comunque G03 per il suo turno, anche se morto/a", nessuna unzione. **ok**
- Rogo del Lupo (unico lupo, Mucca viva): notte 2 il Medium vede "Lupo Mannaro", poi all'alba 2 "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio" (Mucca e Criceto in vita non contano: decisione gia' presa). **ok**
- Nota: "Morte per unzione" e "Lo Scemo sbaglia la rima" compaiono solo dopo "Vai al voto" (contesto voto/esito), non nella schermata di alba; "Il Boia" e "L'Innocente" invece gia' all'alba. Vedi DUBBI 4.

## Scenario 2 - Alchimista, Pifferaio, Paladino, Polpo, Spilungone, Ubriaco, Untore, Nonna, Pastore, Lupo (10 giocatori)
- Notte 1: Pastore accanto a Nonna/Lupo: "Si sentono dei belati". Pifferaio ipnotizza G01 (Alchimista) e G05 (Spilungone), Untore unge l'Alchimista, branco sbrana il Paladino. Il passo "Passo 1 di 10 ... 9 di 9" cala di uno se il Pifferaio non sceglie nessuno (passo Ipnotizzati non piu' atteso): non e' un problema in partita normale.
- Rogo di G01 + "Si rivela: e' l'Alchimista" + "Chi trascina con se'" (7 varianti da checkpoint): trascina il Pifferaio (notte 2 "Chiama comunque G02", il passo Ipnotizzati resta con G01 tra i morti e il Pifferaio morto), il Polpo, lo Spilungone (carta ignota "?" e poi spilungone: muore per l'esplosione, l'esplosione non e' un rogo), l'Ubriaco (nessuno stordimento), l'Untore, la Nonna (notte 2 "Vivi: G10 | Morti: G08"), il Pastore (belati sparisce). Paladino: protegge l'Alchimista sbranato (nessun morto), poi l'Alchimista trascina il Paladino: muore ("Chiama comunque G03"); l'esplosione ignora la protezione. Alchimista sbranato di notte: "G01 e' morto/a di notte", nessuna esplosione, nessun evento. **ok**
- Spilungone (G05) favorito al rogo: "Confermi: G05 e' lo Spilungone?" -> "La notte cala senza vittime"; notte 2 con branco che sbrana l'Ubriaco (avviso "il branco sara' stordito"); refresh all'alba 2: stato identico; poi l'Alchimista trascina lo Spilungone gia' rivelato. **ok**
- Lo Spilungone non rivelato resta "?" fino al passo che lo assegna per esclusione ("G05:spilungone" alla notte 2): corretto.

## Scenario 3 - Fantasma Onnisciente con Fattucchiera, Polpo, Nonna, Spilungone, Capobranco, Progenitore, Ambasciatore, Ubriaco, Veggente (10 giocatori + carta Fantasma)
- Il Fantasma va messo nel mazzo (eventi speciali: "Assegna il Fantasma Onnisciente" solo con la carta nel mazzo e dopo "Vai al voto"). Dopo il rogo compare l'avviso "Assegna la carta del Fantasma Onnisciente al primo morto". Candidati: il morto al rogo e il morto notturno (decisione gia' presa).
- 7 varianti da checkpoint (rogo + Fantasma a Fattucchiera, Polpo, Nonna, Capobranco, Progenitore, Ambasciatore, Ubriaco): nessun passo notturno per il Fantasma (corretto: solo lettere all'alba); il suo ex ruolo non agisce piu' ("Chiama comunque G01..."); Nonna/Capobranco/Progenitore bruciati: il branco passa a "Vivi: G05, G06 | Morti: G03" e l'opzione "Il Progenitore trasforma..." sparisce solo se muore il Progenitore; Ambasciatore bruciato: all'alba 2 niente "messaggio dall'ambasciatore"; con Ambasciatore vivo il messaggio c'e' dopo "Aura benevola". Polpo bruciato: il Veggente non e' piu' accecato. **ok**
- Spilungone favorito al rogo con Fantasma in mazzo: il candidato del Fantasma e' solo il morto notturno; lo Spilungone non e' mai candidato. **ok**
- **BUG 1** (vedi sotto): nella variante con Spilungone rivelato il morto notturno G10 e' diventato Fantasma Onnisciente da solo all'alba 2.

## Scenario 4 - Capobranco, Lupo, Medium, Inquisitore, Bardo, 2 Guardie + Guardia Mannara, Borgomastro (10 giocatori)
- Passo "Guardie (si riconoscono)": 3 titolari selezionati, l'app sceglie a caso chi e' la Guardia Mannara (cambia a ogni partita: G07 o G08; gia' noto, batch 2026-10-07b DUBBI 6).
- Elezione Borgomastro (G06 Guardia): "G06 e' il nuovo Borgomastro: il suo voto vale doppio", icona nella lista voti; spareggio 2-2: timer "Spareggio tra G01, G02" con "Condanna". Rogo del Borgomastro: "G06 era il Borgomastro: il villaggio dovra' eleggerne uno nuovo" e avviso all'alba (anche per il Capobranco eletto e bruciato). **ok**
- Bardo: "Il Bardo salta la notte" dopo il rogo, notte 2 "Questa notte non si svolge per i poteri del Bardo", nessun passo (Capobranco non caccia). **ok**. Con Indietro: vedi BUG 2.
- Notte 3: Capobranco sceglie come vittima un proprio lupo (G02 e' tra i bersagli): muore, "G02 e' morto/a di notte"; il Medium (notte 4) vede "Lupo Mannaro" sul lupo ucciso dal Capobranco; il Capobranco sbrana poi il Medium. **ok**
- Inquisitore: sul Capobranco "Rispondi all'Inquisitore: si (aura malvagia)" (mantiene il potere); sulla Guardia e sulla Guardia Mannara "no (aura benevola)" e nella notte dopo "Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola". **ok**
- Vittoria: Capobranco + Guardia Mannara vivi (gli altri morti): "I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro" (la GM conta come resto del villaggio, il banner non nomina l'obiettivo di "ultimo in vita" del Capobranco: DUBBI 2). Con il Capobranco morto e la GM in vita: "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio" (decisione gia' presa).

## Scenario 5 - Guardie, Guardia Mannara, Fattucchiera, Sciacallo, Polpo, Untore, Veggente, Veggente Mannaro, Ambasciatore, Lupo (11 giocatori)
- Veggente su una Guardia: "Aura benevola" + "E' arrivato un messaggio dall'ambasciatore". Fattucchiera inibisce la Guardia / la Guardia Mannara: nessun effetto ne' passo (nessun potere attivo). Untore sulla Guardia: unzione, "Morte per unzione" della Guardia passa ai vicini (G05, G07); Guardia Mannara unta: morte per unzione, vicini G03 e G05. **ok**
- Sciacallo (morto di notte, agisce comunque: "G11 e' morto/a, ma agisce comunque") resuscita una Guardia bruciata: "G05 e' stato resuscitato", `[resuscitato]` sulla Guardia; potere poi "gia' utilizzato". **ok**
- Veggente Mannaro sulla Guardia Mannara: "Aura benevola"; con il Veggente inibito dalla Fattucchiera il messaggio dell'Ambasciatore NON compare (il Veggente Mannaro non lo innesca); con il Veggente libero che indaga la Guardia Mannara il messaggio compare. **ok**
- Polpo: il Veggente che indaga il Polpo diventa cieco ("Accecato dal Polpo Mannaro: G09"), poi su una Guardia "Aura benevola": nessuna interazione particolare con le Guardie. **ok/parziale** per guardia x polpo.

## Scenario 6 - Bardo, Apprendista, Figlia dei Lupi, Fattucchiera, Cartomante, Nano, Innocente, Lupo (10 giocatori)
- Apprendista (maestro Bardo) con Bardo sbranato: alba "G04 si rivela: e' l'Apprendista di G03 ed eredita il ruolo di Bardo", poi il nuovo Bardo puo' far saltare la notte (poteri non usati). Cartomante sull'Apprendista in notte 1 mostra "Apprendista" (carta del momento). **ok**
- Bardo + notte saltata: Fattucchiera e Cartomante non agiscono (nessun passo); Branco sbrana il Nano nella notte seguente: "Il morso non ha effetto su G02: il Nano non puo' essere sbranato". **ok**
- Figlia dei Lupi con genitore Cartomante (bruciata): "La Figlia dei Lupi G05 e' diventata Lupo Mannaro", notte seguente "Vivi: G01, G05" nel Branco; con genitore Bardo sbranato: "G05 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro". **ok**
- Apprendista con maestro Innocente (anche genitore della Figlia): Innocente si rivela, poi sbranato: alba "G04 si rivela: ... eredita il ruolo di Innocente" + "G05 ... diventa Lupo Mannaro"; l'erede non ha piu' "L'Innocente si rivela" nel menu (carta gia' mostrata). **ok / dubbio** (DUBBI 6)
- Apprendista con maestro Fattucchiera (bruciata): "L'Apprendista G04 ha ereditato il suo ruolo", notte 2 passo Fattucchiera per G04 con "Vivi: G04 | Morti: G06"; Cartomante sul nuovo Fattucchiera: "Fattucchiera". **ok**

## Scenario 7 - Scemo, Veggente, Nonna, Mezzosangue, Progenitore, Pifferaio, Villici (8 giocatori)
- Mezzosangue sbranato: "Il Mezzosangue sbranato non muore: G04 diventa Lupo Mannaro", all'alba "Il Mezzosangue G04 e' stato bersaglio dei lupi e diventa percio' Lupo Mannaro". Con il Progenitore: l'opzione "Il Progenitore trasforma G04 in Lupo Mannaro" e' offerta anche sul Mezzosangue e consuma il potere senza effetto: DUBBI 1.
- Progenitore su un ipnotizzato: diventa Lupo Mannaro e resta ipnotizzato, il branco passa a "Vivi: G03, G04, G05, G07". **ok**
- Scemo sbaglia la rima (dopo "Vai al voto"): "G01 si e' rivelato/a: e' lo Scemo del Villaggio, ha sbagliato la rima ed e' morto/a"; ipnotizzato: resta tra i morti dell'elenco Ipnotizzati. Scemo sbranato con Progenitore: trasformato in Lupo Mannaro (non e' piu' Scemo). Vittoria lupi (3 lupi contro 2). **ok**

## Scenario 8 - Eremita, Untore, Mucca, Gallo, Cucciolo, Criceto, Cavaliere, Veggente Mannaro, Villico (9 giocatori)
- Cavaliere protegge l'Eremita (gruppo "Per chi sacrificarsi"), Eremita unto e sbranato dal Cucciolo: "Il Cavaliere G07 si immola al posto di G01 e muore (colpito dal branco)"; Eremita resta unto, Veggente Mannaro lo vede "Aura malvagia", il Cucciolo "Aura malvagia". Notte 2 branco sbrana l'Eremita: "G01 e' morto/a di notte".
- Gallo Mannaro "salta il giorno" dopo il voto-alba: passa a notte 2 senza voto; unzione scaduta. Rogo dell'unico lupo (Cucciolo): "Vendetta del Cucciolo: i lupi sbraneranno due persone la prossima notte" (DUBBI 3), poi "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio" con Mucca e Criceto vivi. **ok**

## Scenario 9 - Ladro, Guaritore, Untore, Suocera, Paladino, Maga, Chupacabra, Lupo, 3 Villici (9 giocatori)
- Ladro con due carte extra Guaritore+Untore, sceglie Guaritore: "Il Ladro G01 sceglie Guaritore: scarta Untore", il passo Untore resta come "Carta non assegnata a nessun giocatore: chiama comunque il ruolo". Guaritore (ex Ladro) resuscita il Villico G09 bruciato: "G09 e' stato resuscitato". Maga trasforma un Villico ("?" poi villico): "e' stato trasformato in maiale dalla Maga". Chupacabra sul Lupo (notte 1) lo uccide; poi su un Villico protetto dal Paladino: "G06 e' protetto/a: la caccia non ha alcun effetto" (gia' valutato: Chupacabra rispetta il Paladino). **ok**
- Ladro con Untore+Villico: sceglie Untore, il Ladro-Untore unge un Villico: normale (vedi scenario 12). **ok**

## Scenario 10 - Suocera, Addolorata, Berserker, Innocente, Paladino, Untore, 2 Lupi, Villico (9 giocatori)
- Paladino protegge la Suocera ("?" non ancora rivelata) mentre il branco la sbrana: "Il morso non ha effetto su G01: e' protetto/a"; unta dall'Untore e poi "Morte per unzione" + "La Suocera si rivela" (menu dopo "Vai al voto"; gruppo "Chi era la Suocera"): unzione ai vicini, Suocera registrata dopo la morte. **ok**
- Addolorata scambia con la vittima del rogo (passo "Scambiare il ruolo con quello di G01 (vittima del rogo)?" + bottone "Scambia", poi "Annulla scambio"): con Suocera -> G02 diventa Suocera (viva), G01 Addolorata; con Berserker -> G02 Berserker, poi sbranato uccide il lupo piu' vicino ("Se il Berserker sara' sbranato, G08 (il lupo piu' vicino) morira' con lui", poi "uccide lottando G08"); con Innocente rivelato -> G02 Innocente. Diario: "L'Addolorata G02 scambia la carta con G01 (morto al rogo): ora e' Suocera e G01 ha la carta Addolorata". Con ruolo ignoto il passo avvisa "chi scambia diventa Villico". **ok** (Suocera viva ex Addolorata: vittoria lupi calcolata senza contarla, coerente col testo "non e' considerata in vita")

## Scenario 11 - Apprendista, Mucca/Veggente Mannaro, Figlia, Polpo, Cartomante, Veggente, Scemo, Sacerdote, Pifferaio (due mazzi da 9-10)
- Mazzo A: Apprendista (maestro Mucca bruciata) eredita "Mucca Mannara" ma non riceve nessun passo di riconoscimento del branco (passo solo prima notte): DUBBI 5. Figlia con genitore Scemo ("?") che sbaglia la rima: "La Figlia dei Lupi G03 si rivela e diventa Lupo Mannaro"; Cartomante sulla Figlia: notte 1 "Figlia dei Lupi", notte 2 "Lupo Mannaro" (carta corrente); Veggente sulla Figlia trasformata "Aura malvagia". **ok**
- Mazzo B: Sacerdote unisce il Veggente Mannaro e un Villico, passo "Innamorati (si riconoscono)"; Pifferaio ipnotizza il Veggente Mannaro e la Cartomante; il Villico sbranato -> all'alba "G02 e' morto/a di crepacuore per la morte del partner" + "G01 si rivela: e' l'Apprendista di G02 ed eredita il ruolo di Veggente Mannaro" (il Veggente Mannaro erede agisce dalla notte 2, aura benevola). Veggente accecato dal Polpo (Cartomante sul Polpo non e' accecata, carta "Polpo Mannaro"); Polpo (genitore della Figlia) bruciato: Figlia "diventata Lupo Mannaro" e Veggente di nuovo vedente. **ok**

## Scenario 12 - Mezzosangue, Spilungone, Sciacallo, Fattucchiera, Scemo, Nonna, Lupo, Figlia, Paladino, Villico (10 giocatori)
- Mezzosangue inibito dalla Fattucchiera e sbranato: diventa comunque Lupo Mannaro (l'inibizione blocca solo "azioni notturne": coerente con la descrizione della condizione). Spilungone rivelato al rogo, poi sbranato: muore normalmente. Figlia con genitore Paladino sbranato: "G08 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro". Vittoria dei lupi con 4 lupi (Mezzosangue convertito, Nonna) contro Sciacallo+Villico. **ok**
- Mezzosangue bruciato e resuscitato dallo Sciacallo (`[resuscitato]`), poi sbranato: "Il Mezzosangue sbranato non muore: G01 diventa Lupo Mannaro" (nessuna memoria del rogo: torna Mezzosangue). **ok**

## Scenario 13 - Boia, Polpo, L'Antico, Veggente, Scemo, Progenitore, Lupo, 2 Villici (9 giocatori) e Antico+Polpo+Veggente (7 giocatori)
- Veggente accecato dal Polpo, Boia giustizia il Polpo: notte seguente "Aura malvagia" sul lupo (vista ripristinata). **ok**
- L'Antico al rogo ("Si rivela: e' L'Antico" -> "sopravvive perdendo la sua prima vita. Il villaggio e' maledetto"): notte 2 un solo passo "Il villaggio e' maledetto da L'Antico: questa notte agiscono solo i poteri malvagi" con il Branco; notte 3 il Veggente torna e indagando il Polpo viene accecato. **ok**

## Scenario 14 - Ladro, Untore, Cortigiana, Bardo, Lupo, Villici (6 giocatori)
- Ladro prende l'Untore (scarta Villico): il passo Untore e' per G01, unge G05 ("G05 e' stato unto"). Cortigiana eletta Borgomastro, visita il lupo: "La Cortigiana G03 muore: il suo cliente G02 era un lupo." + "G03 era il Borgomastro: il villaggio dovra' eleggerne uno nuovo" (nel Diario; a partita vinta niente avviso: decisione presa). Bardo: con la notte saltata nessun passo (l'Untore non agisce). **ok**
- Bardo + Indietro: BUG 2.

## Refresh / Indietro / tasto del telefono
- Refresh a meta' passo con scelta pendente (Paladino, "G05" selezionato): selezione ripristinata; refresh all'alba 2, a notte con Ladro e a giorno 1: stato identico. history.back() in notte/alba/giorno resta nella fase (nessuna uscita). "Indietro" con una scelta pendente la annulla senza cambiare passo.

## Console / stabilita'
Nessun errore ne' warning in console in tutte le partite; nessun overflow orizzontale; nessun softlock.

## BUG CERTI
1. **Il Fantasma Onnisciente (carta non distribuita) viene assegnato d'ufficio a un giocatore "?" come "ultimo ruolo rimasto"; con il Fantasma nel mazzo i Villici restano "?" per sempre.** Passi (partita minima): mazzo Lupo, Veggente, Villico + Fantasma Onnisciente, 3 giocatori; notte 1: G01 Lupo, G02 Veggente (indaga G01, il branco sbrana G02), alba. Risultato: G03 (vivo, mai morto) risulta `fantasma-onnisciente`. Caso piu' realistico (partita da 10, mazzo con 1 Villico + Fantasma, tutto il resto assegnato): il morto notturno G10 "?" diventa Fantasma da solo all'alba 2, e il menu "Assegna il Fantasma" sparisce; se i Villici sono 2 o piu' restano "?" (G03, G04 con mazzo Lupo, Veggente, 2 Villici + Fantasma), quindi Medium/Cartomante chiedono "quale ruolo mostra?" e `ignotiSonoVillici` e' falso. Causa probabile: `autoAssegnaRuoliRimasti` (`src/features/notte/NightSequencer.jsx:830-841`) include `fantasma-onnisciente` in `ruoliNonVillicoPendenti` (quantita 1, mai assegnato), quindi con un solo "?" a bordo la capacita' residua coincide e gli assegna il Fantasma; con 2+ "?" non assegna nessuno. Stessa radice in `ignotiSonoVillici` (`src/data/assegnazione.js:42-47`, il Fantasma e' un residuo > 0). Correzione: escludere `fantasma-onnisciente` (carta senza casella, vedi `App.jsx:60-72`) da entrambi i conteggi.
2. **Indietro sul gesto del Bardo annulla il potere ma lascia nel Diario "Il Bardo G04 inizia a suonare: tutti restano svegli e la notte salta".** Passi: giorno, rogo, "Il Bardo salta la notte" + Conferma + Ok, "E' notte nel villaggio", premere "Indietro" nella schermata "Questa notte non si svolge per i poteri del Bardo". Risultato: `poteriUsati` del Bardo vuoto e notte normale (passo Cortigiana), ma la voce `bardo-salta-notte` (round 1, fase giorno) resta nel registro (anche dopo reload); se il Bardo ripete il gesto in un altro giorno ci saranno due voci. Causa probabile: `annullaBardo` (`src/features/notte/NightSequencer.jsx:403-410`) toglie blocco e potere ma non la voce di registro scritta all'evento (`src/data/log.js:28` via `GiornoPanel.jsx:134-140`).

## DUBBI (con proposta)
1. **Progenitore sul Mezzosangue non protetto: opzione offerta e potere consumato senza effetto.** Il Mezzosangue sbranato diventa gia' Lupo Mannaro, ma "Il Progenitore trasforma G04 in Lupo Mannaro" resta selezionabile (`AzioneBrancoLupi.jsx:352` lo toglie solo per il Mezzosangue protetto) e segna `progenitore-trasforma` come usato (notte 2: opzione sparita). Regola `roles.js` Progenitore "una sola volta per partita". Proposta: nascondere l'opzione (o avvisare "gia' diventera' Lupo") quando la vittima e' un Mezzosangue non protetto.
2. **Capobranco: l'obiettivo "ultimo giocatore in vita" non e' mai considerato.** Con Capobranco + Guardia Mannara ultimi vivi il banner dice solo "vincono i lupi" (regola `roles.js` Capobranco: obiettivo rimanere l'ultimo; Guardia Mannara: vince coi lupi). Proposta: lasciare (Capobranco non e' tracciato) oppure aggiungere una riga nel banner con il Capobranco in vita.
3. **"Vendetta del Cucciolo" annunciata anche se il Cucciolo era l'ultimo lupo** (rogo del solo lupo: "i lupi sbraneranno due persone la prossima notte", subito dopo vince il Villaggio / la notte e' vuota). Sorgente `eventiSpeciali.js:164`. Proposta: mostrarla solo se resta almeno un lupo in vita.
4. **Menu "Morte per unzione" e "Lo Scemo sbaglia la rima" non disponibili nella schermata di alba** (solo dopo "Vai al voto"), mentre Boia, Innocente, Borgomastro e Bardo si' (`EventiSpeciali.jsx:190`, `inGiorno`). Il Boia unto che dice "si" durante la discussione dell'alba non puo' essere registrato finche' non si apre il voto. Proposta: abilitarli anche all'alba (il giorno inizia li').
5. **Apprendista che eredita un ruolo con riconoscimento solo di prima notte (Mucca Mannara, Guardia, Gallo, Bardo, Cavaliere...) non riceve nessun promemoria**: l'Apprendista-Mucca non vede mai "Lupi mannari: G08" (passo `primaNotteSolo`). Regola `roles.js` Apprendista "ne prende la carta, assumendone il ruolo", Mucca "la prima notte si sveglia e identifica...". Proposta: al momento dell'eredita' mostrare nel Diario/alba la stessa informazione (lupi per la Mucca, colleghi per la Guardia) o un avviso al narratore.
6. **Innocente gia' rivelato ereditato (Apprendista o Addolorata)**: l'erede non ha piu' "L'Innocente si rivela" nel menu (potere considerato usato). Coerente con la decisione sul Boia ereditato, ma qui la carta e' gia' scoperta; proposta: lasciare (nessuna azione utile) e documentarlo.

## NON COPERTO
- Fantasma Onnisciente: lettere dell'alfabeto e perdita del voto ai ballottaggi (nessun supporto UI); vittoria "secondo il ruolo in vita" per un Fantasma ex lupo.
- Alchimista che trascina il Cavaliere o un protetto; Borgomastro che vota nel ballottaggio (il doppio voto non e' contato dall'app, solo l'icona).
- Eremita con Mucca, Gallo, Criceto: solo presenti insieme (nessuna interazione diretta costruibile); Criceto con Eremita in una vittoria dei lupi.
- Scemo con Veggente, Nonna e Villico; Mezzosangue con Spilungone, Scemo e Villico; Guardia con Polpo; Bardo con Nano e Villico: presenti insieme, nessuna interazione diretta provata.
- Ladro + Untore/Guaritore con carta mostrata da Cartomante/Medium (gia' coperto in batch 2026-10-09 b).

## Coppie valutate (JSON-friendly)
```json
[
  "boia x medium: si, ok (Medium vede la carta del giustiziato)",
  "innocente x medium: si, ok",
  "boia x untore: si, ok (Boia unto muore per unzione; Boia giustizia l'Untore)",
  "innocente x untore: si, ok (Innocente unto che si rivela)",
  "lupo-mannaro x medium: si, ok",
  "boia x ubriaco: si, ok (giustiziato vivo non stordisce il branco)",
  "boia x criceto-malvagio: si, ok",
  "boia x mucca-mannara: si, ok",
  "boia x polpo-mannaro: si, ok (Veggente torna a vedere)",
  "alchimista x pifferaio: si, ok",
  "alchimista x paladino: si, ok (l'esplosione ignora la protezione)",
  "alchimista x polpo-mannaro: si, ok",
  "alchimista x spilungone: si, ok (l'esplosione non e' un rogo)",
  "alchimista x ubriaco: si, ok",
  "alchimista x untore: si, ok",
  "alchimista x nonna: si, ok",
  "alchimista x pastore: si, ok",
  "fantasma-onnisciente x fattucchiera: si, ok",
  "fantasma-onnisciente x polpo-mannaro: si, ok",
  "fantasma-onnisciente x nonna: si, ok",
  "fantasma-onnisciente x spilungone: si, ok",
  "fantasma-onnisciente x lupo-mannaro-capobranco: si, ok",
  "fantasma-onnisciente x lupo-mannaro-progenitore: si, ok",
  "fantasma-onnisciente x ambasciatore: si, ok",
  "fantasma-onnisciente x ubriaco: si, BUG 1 (Fantasma assegnato d'ufficio con la carta nel mazzo)",
  "lupo-mannaro-capobranco x medium: si, ok",
  "lupo-mannaro-capobranco x inquisitore: si, ok",
  "lupo-mannaro-capobranco x bardo: si, ok",
  "lupo-mannaro-capobranco x guardia-mannara: si, dubbio (obiettivo ultimo in vita non considerato)",
  "lupo-mannaro-capobranco x borgomastro: si, ok",
  "borgomastro x guardia: si, ok",
  "borgomastro x cortigiana: si, ok",
  "guardia x inquisitore: si, ok",
  "guardia-mannara x inquisitore: si, ok (aura benevola, perde il potere)",
  "guardia x sciacallo-mannaro: si, ok",
  "guardia x fattucchiera: si, ok",
  "guardia x polpo-mannaro: parziale, ok",
  "guardia-mannara x untore: si, ok",
  "guardia-mannara x ambasciatore: si, ok",
  "guardia-mannara x fattucchiera: si, ok",
  "guardia-mannara x veggente-mannaro: si, ok (Veggente Mannaro non innesca l'Ambasciatore)",
  "bardo x figlia-dei-lupi: si, ok",
  "apprendista x bardo: si, ok",
  "bardo x fattucchiera: si, ok (notte saltata)",
  "bardo x cartomante: si, ok (notte saltata)",
  "bardo x untore: si, BUG 2 (voce di registro rimasta dopo Indietro sul gesto)",
  "bardo x nano: parziale, ok",
  "bardo x villico: parziale, ok",
  "apprendista x innocente: si, dubbio (erede senza evento Innocente)",
  "apprendista x fattucchiera: si, ok",
  "apprendista x mucca-mannara: si, dubbio (erede non riconosce il branco)",
  "apprendista x veggente-mannaro: si, ok",
  "figlia-dei-lupi x cartomante: si, ok",
  "figlia-dei-lupi x innocente: si, ok",
  "figlia-dei-lupi x polpo-mannaro: si, ok",
  "figlia-dei-lupi x paladino: si, ok",
  "figlia-dei-lupi x scemo-del-villaggio: si, ok",
  "cartomante x veggente: si, ok (Cartomante sul Polpo non e' accecata)",
  "sacerdote x veggente-mannaro: si, ok",
  "pifferaio x veggente-mannaro: si, ok",
  "lupo-mannaro-progenitore x pifferaio: si, ok (ipnotizzato trasformato resta ipnotizzato)",
  "lupo-mannaro-progenitore x scemo-del-villaggio: si, ok",
  "mezzosangue x nonna: si, dubbio (Progenitore sul Mezzosangue consuma il potere)",
  "mezzosangue x sciacallo-mannaro: si, ok",
  "mezzosangue x fattucchiera: si, ok (inibito si trasforma comunque)",
  "mezzosangue x spilungone: parziale, ok",
  "mezzosangue x villico: parziale, ok",
  "mezzosangue x scemo-del-villaggio: parziale, ok",
  "scemo-del-villaggio x veggente: parziale, ok",
  "scemo-del-villaggio x nonna: parziale, ok",
  "scemo-del-villaggio x villico: parziale, ok",
  "lantico x polpo-mannaro: si, ok (notte maledetta, poi Veggente accecato)",
  "paladino x suocera: si, ok",
  "addolorata x suocera: si, ok",
  "addolorata x berserker: si, ok",
  "addolorata x innocente: si, dubbio (Innocente ereditato non riattivabile)",
  "untore x suocera: si, ok",
  "guaritore x ladro: si, ok",
  "ladro x untore: si, ok",
  "guaritore x villico: si, ok",
  "chupacabra x villico: si, ok",
  "maga x villico: si, ok",
  "eremita x untore: si, ok",
  "eremita x cavaliere: si, ok",
  "cucciolo-di-lupo-mannaro x eremita: si, ok",
  "cucciolo-di-lupo-mannaro x veggente-mannaro: si, ok (aura malvagia)",
  "eremita x mucca-mannara: parziale, ok",
  "eremita x gallo-mannaro: parziale, ok",
  "criceto-malvagio x eremita: parziale, ok",
  "eremita x villico: parziale, ok"
]
```

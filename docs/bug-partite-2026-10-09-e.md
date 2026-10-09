# Batch partite 2026-10-09 (e): ruoli meno valutati della matrice incrociati tra loro e con Veggente, Cartomante, Strega, Cavaliere, Cortigiana, Berserker, Chupacabra, Criceto, Mimo

Chromium reale (Playwright, 390x844, dev server porta 5562), nessuna modifica a `src/` ne' ai documenti esistenti. Script, snapshot di localStorage e screenshot in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad/e`. Le prime notti di 3 mazzi (12, 13 e 10 giocatori) sono giocate dalla UI (mazzo -> giocatori -> assegnazioni -> azioni -> alba -> voto/rogo -> notti seguenti); per gli scenari "mirati" ho pre-caricato localStorage (stato di notte 2 con ruoli assegnati/morti) e giocato dalla UI i passi oggetto del test. Console: nessun errore ne' warning in tutti gli scenari; nessun overflow orizzontale. Decisioni del proprietario gia' prese (Criceto = resto del villaggio, innamoramento sciolto alla morte, pozioni della Strega nel Diario, Fantasma assegnabile ai morti notturni, legami che seguono la carta) non riproposte; non riproposti nemmeno i dubbi gia' in matrice (Ambasciatore con Veggente accecato = "percezione falsata", Gallo/Guardia Mannara non sono lupi per Berserker/Chupacabra, Spilungone con notte che prosegue, aura benevola dei mannari non-branco per l'Inquisitore, Nano/Criceto immuni solo di notte, Strega che uccide Nano).

## Scenario 1 - Prima notte e giorno con Nonna, Polpo, Pastore, Ambasciatore, Ubriaco, Nano, Fattucchiera, Maga, Untore, Veggente (12 giocatori)
- Mazzo: Maga, Untore, Fattucchiera, Veggente, Nonna, Polpo Mannaro, Pastore, Ambasciatore, Ubriaco, Nano, Lupo, Villico. "Passo X di 12" coerente con i 12 passi realmente mostrati (Nonna, Lupo, Nano, Pastore, Polpo, Ubriaco, Ambasciatore, Fattucchiera, Maga, Untore, Veggente, Branco); il Villico si assegna da solo a fine notte. **ok**
- Fattucchiera inibisce il Veggente nella stessa notte: il passo del Veggente mostra "Il potere e' inibito questa notte dalla Fattucchiera: nessuna azione disponibile." e Avanti funziona. Maga (Nano) e Untore: condizioni "trasformato"/"unto" applicate subito, annunciate all'alba. **ok**
- Branco sbrana l'Ubriaco: avviso "G06 e' l'Ubriaco: il branco sara' stordito la prossima notte"; Pastore con la Nonna a fianco (Nonna conta come lupo): "Si sentono dei belati" (verificato: Pastore messo accanto alla Nonna, nessun belato quando il lupo e' lontano). **ok**
- Giorno 1: "Morte per unzione" di G05 (unto): "l'unzione passa ai due vicini vivi, G04 e G07" (salta il morto G06). Il morto resta con la condizione "unto" in dati (nessun effetto visibile; il Diario scrive poi "G05 ha perso la condizione unto" dopo la morte: rumore, vedi DUBBI 8). **ok**
- Notte 2: stordimento del branco ("Il branco e' ancora stordito dall'alcol dell'Ubriaco: questa notte non puo' cacciare"), Alba "Nessuno e' morto questa notte". Fattucchiera inibisce la Maga: passo con "nessuna azione". Veggente indaga il Polpo: "Accecato dal Polpo Mannaro" + "Aura benevola", Ambasciatore annuncia (gia' deciso). **ok**
- Notte 3: Maga morta al rogo: il passo compare comunque con "Chiama comunque G09 per il suo turno, anche se morto/a" e "Passo X di N" non cambia. Veggente cieco su un lupo: "Aura benevola". Nonna: "Aura benevola" anche dopo la cecita'. **ok**
- Rogo del Polpo: il Veggente torna a vedere (notte 4: lupo = "Aura malvagia", Nonna = "Aura benevola"); branco che sceglie il Nano: "Il morso non ha effetto su G04: il Nano non puo' essere sbranato", Alba "Nessuno e' morto". **ok**
- Polpo ucciso di notte (pozione mortale della Strega, mazzo dedicato): il Veggente ritorna a vedere la notte seguente (aura malvagia sul Chupacabra); con due Polpi resta cieco finche' ne vive uno. **ok**

## Scenario 2 - Prima notte con Progenitore, Gallo, Mucca, Cavaliere, Paladino, Veggente Mannaro, Inquisitore, Medium, Guaritore, Sciacallo, Spilungone (13 giocatori)
- "Passo 1 di 12 ... 12 di 12" coerente. Cavaliere sceglie il protetto (chip "Per chi sacrificarsi"), Paladino, Inquisitore (lupo: "Rispondi all'Inquisitore: si' (aura malvagia)"), Veggente Mannaro (Progenitore: "Aura malvagia"). Medium, Guaritore e Sciacallo di prima notte: "Nessun bersaglio disponibile." (nessun morto). **ok** (testi: vedi DUBBI 7)
- Branco sbrana il Medium con trasformazione del Progenitore: "G09 verra' trasformato in Lupo Mannaro" + "Sbrana normalmente". Alba "Nessuno e' morto questa notte" (nessun cenno alla trasformazione). Il Medium diventa Lupo Mannaro (`storiaRuoli` [medium, lupo-mannaro]), il passo del Medium sparisce dalla notte 2 ("Passo 1 di 6"). Il potere del Progenitore resta usato; dalla notte 2 il bottone non c'e' piu'. **ok** (vedi DUBBI 2)
- Gallo Mannaro: Eventi speciali > "Il Gallo Mannaro salta il giorno" > Conferma: si passa direttamente alla notte 2, potere segnato usato; a inizio notte "Indietro" e' disabilitato (la scelta non e' piu' annullabile da li'). **ok**
- Notte 2: branco sbrana il protetto del Cavaliere: "Il Cavaliere si immola al posto di G013: muore G05, G013 si salva", annuncio all'alba. Notte con Guaritore e Sciacallo senza morti: "Nessun bersaglio disponibile." **ok**
- Rogo del Villico che era in realta' lo Spilungone: "Si rivela: e' lo Spilungone" > Conferma: "La notte cala senza vittime"; la notte 3 si svolge comunque per intero, branco compreso (gia' noto). Secondo rogo dello stesso giocatore: muore normalmente. **ok**
- Guaritore resuscita il Cavaliere (notte 3): "G05 e' stato resuscitato", Cavaliere vivo con `legame: null` (nessun nuovo protetto: DUBBI 6). Sciacallo nella stessa notte: "Nessun bersaglio disponibile" se l'unico morto e' gia' stato scelto dal Guaritore. **ok**
- Sciacallo morto di notte il giorno prima: la notte dopo il passo compare con "G011 e' morto/a, ma agisce comunque", chip dei morti (rogo incluso) e puo' resuscitare lo Spilungone; all'alba "G012 e' stato resuscitato". Il Guaritore dopo l'uso: "Potere gia' utilizzato in questa partita." **ok** (lo Sciacallo puo' scegliere se stesso: DUBBI 4)
- Diario: "Il Progenitore G01 trasforma G09" preceduto da "G09 ha assunto il ruolo di Lupo Mannaro" (doppione), "Il Cavaliere G05 si immola ...", "Il Guaritore G010 sceglie di resuscitare G05", "G012 si e' rivelato/a: e' Spilungone", Gallo registrato. **ok** (nessuna voce per Inquisitore/Veggente Mannaro/Medium: informazioni, coerente col resto)

## Scenario 3 - Strega, Paladino, Fattucchiera, Cortigiana, Berserker, Chupacabra, Criceto, Nano, Ubriaco, Untore, Maga, Veggente (14 giocatori, da notte 2)
- Notte 2: Fattucchiera inibisce la Strega (passo "inibito", nessuna pozione), Paladino protegge il cliente della Cortigiana (G11), branco: "Il morso non ha effetto su G11: e' protetto/a"; Chupacabra uccide il lupo G02; Untore sul Criceto (annunciato all'alba), Maga sulla Cortigiana. Passi in ordine corretto (Fattucchiera, Cortigiana, Maga, Paladino, Untore, Veggente, Strega, Branco, Chupacabra). **ok**
- Notte 3: Fattucchiera inibisce il Paladino; branco sbrana il cliente della Cortigiana (che e' l'Ubriaco): avvisi "G11 e' l'Ubriaco: il branco sara' stordito" + "A casa di G11 c'e' anche la Cortigiana G06: entrambi moriranno"; Strega con pozione mortale sul Berserker (non sbranato: nessun lupo muore con lui, corretto); Chupacabra uccide l'ultimo lupo. Alba: muoiono G01, G06, G07, G11. Nessun banner di vittoria con il Chupacabra vivo e nessun lupo (coerente con la regola). **ok**
- Notte 4 (nessun lupo): "Chiama comunque G01, G02 per il loro turno, anche se morti"; Chupacabra sul Criceto/Nano: "non puo' morire di notte: la caccia non ha alcun effetto". Diario con "La Strega G03 usa la pozione mortale su G07", "La Cortigiana G06 muore: il suo cliente G11 e' stato sbranato", "L'Ubriaco G11 e' stato sbranato". **ok**

## Scenario 4 - Medium, Cartomante, Veggente, Inquisitore con Nonna, Polpo, Eremita, Mucca, Nano, Spilungone, Sciacallo, Veggente Mannaro, Cavaliere
- Cartomante sulla Nonna: "Mostra a Cartomante la carta: Nonna". Inquisitore sulla Nonna: "Rispondi all'Inquisitore: no (aura benevola)" (noto). Medium su un defunto: carta del ruolo ("Mucca Mannara"). Veggente: Eremita "malvagia", Polpo "benevola" + accecato. **ok**
- Variante Medium (aura): Nonna, Polpo, Mucca, Spilungone, Nano, Sciacallo, Veggente Mannaro, Cavaliere "Aura benevola", Eremita "Aura malvagia". **ok** (vedi DUBBI 5)
- Fattucchiera su Guaritore, Medium, Sciacallo, Veggente Mannaro, Cartomante, Inquisitore (uno per volta): sempre "Il potere e' inibito questa notte dalla Fattucchiera: nessuna azione disponibile." e Avanti attivo. Inquisitore inibito: non perde il potere. **ok**
- Fattucchiera inibisce Ambasciatore o Pastore: l'annuncio dell'Ambasciatore e i belati si sentono comunque. Coerente con il testo di "Inibito" (`src/data/conditions.js:5`: "non potra' compiere le proprie azioni notturne. Quando il giocatore viene svegliato di notte ...", un ruolo passivo non viene svegliato). **ok**
- Fattucchiera inibisce l'unico lupo vivo: "Tutti i lupi vivi sono inibiti dalla Fattucchiera: il branco non puo' sbranare questa notte". **ok**

## Scenario 5 - Maledizione dell'Antico con ruoli del tema
- Antico al rogo (notte successiva): banner "Il villaggio e' maledetto da L'Antico: questa notte agiscono solo i poteri malvagi", restano solo Veggente Mannaro, Sciacallo Mannaro e Branco ("Passo 1 di 3"); Maga, Untore, Fattucchiera, Veggente, Inquisitore, Medium, Guaritore non vengono chiamati. **ok**

## Scenario 6 - Mimo con Pastore, Ambasciatore, Sciacallo
- Mimo (G01) imita G02 e sceglie la carta Pastore: il passo Pastore mostra "G01 (Mimo)" e G02 gia' preselezionato (non va riselezionato); con un lupo accanto al Mimo-Pastore (G010) e nessuno accanto al Pastore vero: "Si sentono dei belati". **ok**
- Mimo-Ambasciatore con Ambasciatore vero morto al rogo: all'alba "E' arrivato un messaggio dall'ambasciatore" (Veggente su un villico). **ok**
- Mimo-Sciacallo (due titolari): due blocchi "Chi resuscitare" indipendenti, ciascuno con il proprio potere usato; il bersaglio scelto da un blocco sparisce dall'altro; all'alba due resurrezioni. **ok**

## Scenario 7 - Berserker, Ubriaco, Progenitore e immunita' contro Cavaliere, Paladino, Strega, Nano, Criceto, Mezzosangue
- Berserker con Paladino/pozione vitale sul bersaglio: nessun lupo muore. Ubriaco con Paladino o vitale: branco non stordito. Ubriaco ucciso dalla Strega: nessuno stordimento. **ok**
- **Ubriaco salvato dal Cavaliere: il branco e' comunque stordito la notte dopo** (BUG 2). **Berserker salvato dal Cavaliere: muore comunque il lupo piu' vicino** (BUG 3). Cucciolo salvato dal Cavaliere: nessuna vendetta (corretto).
- Progenitore su vittima protetta, protetta dal Cavaliere, Nano, Criceto, Mezzosangue: la trasformazione avviene sempre (DUBBI 1).
- Cortigiana in visita a Polpo, Mucca, Veggente Mannaro o Sciacallo: sopravvive; in visita alla Nonna: muore (DUBBI 4). Berserker sbranato con Polpo (adiacente a sinistra), Mucca e Veggente Mannaro piu' vicini: muore la Nonna, che e' piu' lontana (DUBBI 4).
- Cavaliere con Nano: il Nano di notte non puo' essere sbranato e il Cavaliere non muore; al rogo il Cavaliere si sacrifica. Cavaliere con Untore: "Morte per unzione" di un protetto: "G04 doveva morire per l'unzione ma sopravvive: l'unzione non si trasmette" (il Cavaliere muore). **ok**

## Scenario 8 - Indietro e refresh a meta' passo (nuovi ruoli)
- Fattucchiera, Maga, Untore, Paladino: scelta, refresh, cambio bersaglio, deselezione: la condizione passa correttamente da un bersaglio all'altro e sparisce. "Indietro" annulla l'azione del passo precedente (inibito, trasformato...) uno per volta. **ok**
- Veggente + Polpo: scelta del Polpo, "Indietro" ripristina; **dopo un refresh con il Polpo gia' scelto la cecita' non e' piu' annullabile cambiando bersaglio** (BUG 1).
- Guaritore, Sciacallo, Strega, Inquisitore: **dopo un refresh a meta' passo il pannello dice "Potere gia' utilizzato" / "Pozione ... gia' utilizzata" nascondendo la scelta fatta stanotte** (BUG 4); "Indietro" ripristina tutto.
- Progenitore: scelta + "trasforma" + refresh: stato e UI identici; "Indietro" ripristina il villico e il potere. **ok**

## Scenario 9 - Coerenza della vittoria (stati pre-caricati, alba dopo notte senza vittime)
- Lupo + Nonna contro 2 villici: vincono i lupi (la Nonna conta come lupo). Lupo + Nonna contro villico + Polpo + Mucca + villico: nessun banner. Lupo + Polpo contro villico: nessun banner. Lupo contro Veggente Mannaro (1 a 1): vincono i lupi. **ok**
- Solo mannari non-branco (Polpo, Mucca, Sciacallo, Gallo, Veggente Mannaro) + villico con lupi morti: "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio" (gia' deciso). Nonna + Mucca: vincono i lupi. Progenitore + Mucca contro Veggente: nessun banner. **ok**
- Nonna contro Chupacabra (1 a 1): vincono i lupi (gia' in matrice come dubbio). Criceto + Lupo + Villico: nessun banner (decisione del proprietario). Chupacabra + Criceto (ultimi due): nessun banner e il Chupacabra non puo' ucciderlo di notte: stallo fino al rogo del Criceto (coerente con le regole, solo da sapere). **ok**

## BUG CERTI

1. **Veggente: dopo un refresh a meta' passo la cecita' non si annulla piu'.** Passi: notte con Veggente e Polpo vivo, scegliere il Polpo (chip "Chi indagare": "Accecato dal Polpo Mannaro", "Aura benevola") -> ricaricare la pagina -> scegliere un lupo (o ri-cliccare il Polpo per deselezionare): la condizione `accecato` resta, l'esito e' "Aura benevola" anche sul lupo (senza refresh invece cambiare bersaglio dal Polpo a un lupo da' "Aura malvagia" e la deselezione toglie la cecita'). Causa probabile: `src/features/notte/azioni/AzioneIndagine.jsx:39-40` — `accecatoAllIngresso` si calcola al montaggio (dopo il refresh e' gia' true perche' la cecita' e' stata scritta dal click) e `accecatoDaQuestaScelta` riparte da false, quindi `togliAccecamento` (righe 43-46, 49-51, 59) non scatta e `confermaScelta` (riga 60) usa "gia' cieco". Workaround: "Indietro" funziona anche dopo il refresh. Proposta: derivare "accecato da questa scelta" dallo stato salvato (es. `ultimaIndagine.notte === round` con bersaglio Polpo e cecita' assente in `ultimaIndagine`/marcatore su `ultimaIndagine`).
2. **Ubriaco salvato dal Cavaliere stordisce comunque il branco.** Passi: Cavaliere con protetto = Ubriaco, notte 2 il branco sceglie l'Ubriaco: avviso "Il Cavaliere si immola al posto di G02" (nessun avviso Ubriaco), muore il Cavaliere, l'Ubriaco e' vivo; alla notte 3 il passo Branco dice "Il branco e' ancora stordito dall'alcol dell'Ubriaco: questa notte non puo' cacciare". Regola: "Se muore sbranato dai lupi mannari" (Ubriaco): non e' morto. Causa: `src/data/effettiNotte.js:78-83` (`risolviAttaccoBranco`) scrive `brancoStorditoFinoA` appena il bersaglio e' l'Ubriaco e `uccidiPatch` non e' null; il Cavaliere si risolve dopo (`risoluzioneNotte.js:risolviLegami`) e annulla solo la morte. L'avviso a video e' coerente (`effettiNotte.js:131`, `cavalieri.length === 0`), lo stato no. Fix: non applicare lo stordimento se `cavalieriDi(giocatori, target.id)` e' non vuoto (o ripulirlo in risolviLegami).
3. **Berserker salvato dal Cavaliere: muore comunque il lupo piu' vicino.** Passi: Cavaliere con protetto = Berserker, il branco sbrana il Berserker: l'avviso mostra insieme "Il Cavaliere si immola al posto di G02: muore G01" e "Se il Berserker sara' sbranato, G03 (il lupo piu' vicino) morira' con lui"; all'alba G01 (Cavaliere) e G03 (lupo) sono morti, il Berserker e' vivo. Regola: "Se questo feroce guerriero viene sbranato dal branco ucciderà ..." (Berserker). Causa: `src/data/effettiNotte.js:66-75` genera la patch del lupo prima/indipendentemente dal Cavaliere (`avvisiColpo` a riga 105-114 tratta il Cavaliere solo come avviso). Stessa famiglia del bug 2: l'effetto "se sbranato" va escluso quando c'e' un Cavaliere legato al bersaglio (nessun effetto analogo trovato per Cucciolo/Mezzosangue/Cortigiana).
4. **Dopo un refresh a meta' passo "Potere gia' utilizzato" nasconde la scelta fatta stanotte (Guaritore, Sciacallo, Strega, Inquisitore).** Passi: Guaritore, scegliere G06 -> ricaricare: il pannello diventa "Potere gia' utilizzato in questa partita." senza chip (non si vede ne' si puo' cambiare il bersaglio; resta marcato `resuscitaAllAlba`); stesso per Sciacallo, per la Strega ("Pozione vitale gia' utilizzata in questa partita" / "Pozione mortale gia' utilizzata") e per l'Inquisitore che ha perso il potere ("Ha perso il proprio potere dopo un'indagine inutile", sparisce la risposta "no (aura benevola)"). Causa: lo "gia' usato" e' catturato una volta al montaggio con `useState` (`AzioneResuscita.jsx:15` e riga 30; `AzioneStrega.jsx:20-21` e righe 104, 128; `AzioneInquisitore.jsx:17`), quindi dopo il remount il potere usato stanotte sembra usato in una notte precedente. "Indietro" ripristina correttamente (workaround). Proposta: distinguere "usato prima di stanotte" da "usato in questo passo" (es. `resuscitaAllAlba === round` sul bersaglio, `usiNotte` del titolare) e mostrare le chip con il bersaglio gia' scelto, come per l'Addolorata dopo la correzione del 2026-10-09 (b).

## DUBBI (con proposta)

1. **Progenitore su vittima protetta o non sbranabile: la trasformazione avviene lo stesso.** L'avviso dice "Il morso non ha effetto su G04: e' protetto/a" (Paladino, pozione vitale) o "il Nano/il Criceto Malvagio non puo' essere sbranato", e subito sotto compare "Il Progenitore trasforma G04 in Lupo Mannaro"; cliccando, G04 diventa lupo (anche Nano e Criceto, che cosi' perdono l'immunita' notturna / lo status indipendente). Con il Cavaliere legato alla vittima, il Cavaliere non muore ma la vittima si trasforma. Per il Mezzosangue la decisione era opposta: protetto = "il morso non lo raggiunge, quindi non si trasforma" (`effettiNotte.js:51-54`). Regola: "puo' decidere di trasformare in Lupo Mannaro la vittima del branco" (Progenitore). Proposta: stessa regola del Mezzosangue (protetto o immune = nessuna trasformazione, bottone disabilitato) oppure dichiarare esplicitamente che la trasformazione supera la protezione.
2. **Progenitore: nessun promemoria per svegliare la vittima trasformata.** Il testo dice "il narratore svegliera' segretamente la vittima permettendole di individuare gli altri lupi", ma ne' il passo Branco ("G09 verra' trasformato in Lupo Mannaro.") ne' l'Alba ("Nessuno e' morto questa notte") lo ricordano; il Diario scrive due voci per lo stesso fatto ("G09 ha assunto il ruolo di Lupo Mannaro" + "Il Progenitore G01 trasforma G09 in Lupo Mannaro."). Proposta: nel passo, riga "Sveglia G09 e mostragli i lupi"; una sola voce nel Diario.
3. **Sciacallo Mannaro puo' resuscitare se stesso**: il testo dice "far resuscitare ... un altro giocatore" (Sciacallo Mannaro, `roles.js:86-87`), il codice lo permette per scelta dichiarata (commento di `AzioneResuscita.jsx`, "sia il Guaritore sia lo Sciacallo possono resuscitare se stessi"): per il Guaritore e' esplicito nel regolamento ("anche verso sé stesso"), per lo Sciacallo no. Proposta: escludere lo Sciacallo dai propri bersagli o confermare esplicitamente nel testo.
4. **Chi e' "lupo" per Cortigiana e Berserker (e Pastore)**: Cortigiana in visita a Polpo, Mucca, Veggente Mannaro, Sciacallo sopravvive, alla Nonna muore; il Berserker uccide la Nonna ma salta Polpo/Mucca/Veggente Mannaro anche se piu' vicini (come gia' deciso per il Gallo); il Pastore sente belati per la Nonna. Regole: "visita ad un lupo mannaro" (Cortigiana), "il lupo che si trova piu' vicino" (Berserker), "e' un lupo mannaro" (Pastore). Proposta: dichiarare nel regolamento sintetico che per questi tre ruoli "lupo" = solo chi caccia con il branco (come per le condizioni di vittoria).
5. **Aura di Veggente/Veggente Mannaro/Medium (variante) sui mannari non-branco e sul Veggente Mannaro**: Veggente e Veggente Mannaro vedono "benevola" Polpo, Mucca, Gallo, Sciacallo e Veggente Mannaro stesso, e il Veggente Mannaro vede "benevola" anche la Nonna, mentre il suo testo dice "sapere se e' dalla parte del villaggio o dalla parte dei lupi" (Veggente Mannaro). Per l'Inquisitore e' gia' un dubbio in matrice. Proposta: per il Veggente Mannaro leggere l'aura "di fazione" (lupi = malvagia, Nonna inclusa) oppure confermare che le auree sono quelle del Veggente.
6. **Cavaliere resuscitato dal Guaritore resta senza protetto** (`legame: null`, perche' "la prima notte sceglie"): nessun avviso al narratore, e il ruolo resta "scarico". Proposta: promemoria nell'Alba della resurrezione o nuova scelta.
7. **Testi/istruzioni al narratore**: (a) passi Bardo e Gallo Mannaro di prima notte mostrano solo "Chi ha questa carta?": nessun promemoria "chiedi il gesto segreto" (regola: "La prima notte mostra al narratore un gesto segreto"); (b) passo "Mucca Mannara (riconosce il branco)" non elenca i lupi da indicare (il passo Lupo mostra "Vivi: ..."); (c) Guaritore/Sciacallo/Medium senza morti: "Nessun bersaglio disponibile." e' ambiguo (meglio "Nessun defunto: chiamalo comunque"); (d) titolo "Bardo " con spazio finale (`src/data/nightSteps.js:54`); (e) alba dopo il Progenitore e dopo la Mucca che non cambiano nulla non dicono nulla di "silenzioso" (vedi DUBBI 2). Nessun errore trovato in "Passo X di N": totale corretto in 3 prime notti (12, 13 e 9 passi) e nelle notti successive anche con titolari morti ("Chiama comunque ...").
8. **Diario**: dopo "Morte per unzione" il morto riceve anche "ha perso la condizione unto" e Maga/Untore morti lasciano il passo; indagini di Veggente/Veggente Mannaro/Inquisitore/Cartomante/Medium non registrate (solo le condizioni). Proposta: non scrivere la perdita di condizione dei morti; decidere se registrare le indagini.

## NON COPERTO
- Mimo che copia Maga/Untore/Paladino/Veggente Mannaro/Progenitore/Gallo (solo Pastore, Ambasciatore, Sciacallo); Mimo con Fattucchiera in partita completa.
- Polpo, Maga, Untore, Fattucchiera con Chupacabra e Criceto in partite complete fino alla vittoria; Medium con Mimo; Cartomante con Veggente cieco in alternativa.
- Guardia / Guardia Mannara, Ladro, Apprendista, Addolorata (altri batch); Sacerdote, Pifferaio, Figlia dei Lupi, Antico oltre alla Maledizione.
- Nonna come unica "lupa" con Mimo; Gallo e Veggente Mannaro morti al rogo prima di usare il potere.

## Coppie valutate (JSON-friendly)
```json
[
  "maga x untore: si, ok",
  "maga x fattucchiera: si, ok (inibita: nessuna azione)",
  "maga x nano: si, ok",
  "maga x cortigiana: si, ok",
  "maga x veggente: parziale",
  "maga x ubriaco: parziale",
  "maga x strega: parziale",
  "maga x paladino: parziale",
  "maga x chupacabra: parziale",
  "maga x criceto-malvagio: parziale",
  "maga x berserker: parziale",
  "maga x cartomante: parziale",
  "maga x cavaliere: parziale",
  "maga x lantico: si, ok (maledizione blocca la Maga)",
  "untore x criceto-malvagio: si, ok",
  "untore x cavaliere: si, ok (unzione non trasmessa se il Cavaliere si immola)",
  "untore x nano: si, ok",
  "untore x fattucchiera: si, ok",
  "untore x ambasciatore: parziale",
  "untore x ubriaco: parziale",
  "untore x veggente: parziale",
  "untore x strega: parziale",
  "untore x cortigiana: parziale",
  "untore x berserker: parziale",
  "untore x chupacabra: parziale",
  "untore x cartomante: parziale",
  "nonna x veggente: si, ok (aura benevola)",
  "nonna x veggente-mannaro: si, dubbio (aura benevola)",
  "nonna x berserker: si, ok (conta come lupo)",
  "nonna x cortigiana: si, ok",
  "nonna x pastore: si, ok (belati)",
  "nonna x cartomante: si, ok",
  "nonna x medium: si, ok (variante aura benevola)",
  "nonna x mucca-mannara: si, ok (conteggio vittoria)",
  "nonna x chupacabra: si, dubbio noto (1 a 1)",
  "nonna x criceto-malvagio: parziale",
  "nonna x strega: parziale",
  "nonna x cavaliere: parziale",
  "ubriaco x cavaliere: si, BUG 2 (stordimento senza morte)",
  "ubriaco x paladino: si, ok",
  "ubriaco x strega: si, ok",
  "ubriaco x cortigiana: si, ok (cliente sbranato: doppia morte e stordimento)",
  "ubriaco x berserker: parziale",
  "ubriaco x chupacabra: parziale",
  "ubriaco x criceto-malvagio: parziale",
  "ubriaco x fattucchiera: parziale",
  "ubriaco x maga: parziale",
  "ubriaco x nonna: parziale",
  "ubriaco x veggente: parziale",
  "ubriaco x cartomante: parziale",
  "ubriaco x untore: parziale",
  "polpo-mannaro x strega: si, ok (Polpo ucciso di notte toglie la cecita')",
  "polpo-mannaro x veggente-mannaro: si, ok (non accecabile)",
  "polpo-mannaro x medium: si, ok (variante aura benevola)",
  "polpo-mannaro x cortigiana: si, dubbio (visita non letale)",
  "polpo-mannaro x berserker: si, dubbio (non e' il lupo piu' vicino)",
  "polpo-mannaro x paladino: parziale",
  "polpo-mannaro x maga: parziale",
  "polpo-mannaro x untore: parziale",
  "polpo-mannaro x nonna: parziale",
  "polpo-mannaro x fattucchiera: parziale",
  "polpo-mannaro x ubriaco: parziale",
  "polpo-mannaro x cavaliere: parziale",
  "polpo-mannaro x criceto-malvagio: parziale",
  "ambasciatore x fattucchiera: si, ok (passivo non inibito)",
  "ambasciatore x pastore: si, ok",
  "ambasciatore x mimo: si, ok (Mimo-Ambasciatore con titolare morto)",
  "ambasciatore x cavaliere: parziale",
  "ambasciatore x strega: parziale",
  "ambasciatore x maga: parziale",
  "ambasciatore x untore: parziale",
  "ambasciatore x ubriaco: parziale",
  "ambasciatore x nonna: parziale",
  "ambasciatore x cartomante: parziale",
  "ambasciatore x cortigiana: parziale",
  "ambasciatore x chupacabra: parziale",
  "ambasciatore x criceto-malvagio: parziale",
  "pastore x fattucchiera: si, ok (passivo non inibito)",
  "pastore x mimo: si, ok (belati col Mimo-Pastore)",
  "pastore x ambasciatore: si, ok",
  "pastore x veggente: parziale",
  "pastore x ubriaco: parziale",
  "pastore x maga: parziale",
  "pastore x untore: parziale",
  "pastore x strega: parziale",
  "pastore x cavaliere: parziale",
  "pastore x berserker: parziale",
  "pastore x chupacabra: parziale",
  "pastore x criceto-malvagio: parziale",
  "pastore x cartomante: parziale",
  "paladino x cavaliere: si, ok (protetto = niente sacrificio)",
  "paladino x berserker: si, ok",
  "paladino x ubriaco: si, ok",
  "paladino x lupo-mannaro-progenitore: si, dubbio (trasformazione di un protetto)",
  "paladino x nano: parziale",
  "paladino x criceto-malvagio: parziale",
  "paladino x nonna: parziale",
  "paladino x polpo-mannaro: parziale",
  "paladino x ambasciatore: parziale",
  "paladino x pastore: parziale",
  "paladino x cartomante: parziale",
  "veggente-mannaro x fattucchiera: si, ok",
  "veggente-mannaro x lupo-mannaro-progenitore: si, ok (malvagia)",
  "veggente-mannaro x mucca-mannara: si, dubbio (aura benevola)",
  "veggente-mannaro x sciacallo-mannaro: si, dubbio (aura benevola)",
  "veggente-mannaro x gallo-mannaro: si, dubbio (aura benevola)",
  "veggente-mannaro x lantico: si, ok (agisce con la maledizione)",
  "veggente-mannaro x paladino: parziale",
  "veggente-mannaro x strega: parziale",
  "veggente-mannaro x cavaliere: parziale",
  "veggente-mannaro x cortigiana: parziale",
  "veggente-mannaro x berserker: si, dubbio (non e' il lupo piu' vicino)",
  "veggente-mannaro x chupacabra: parziale",
  "veggente-mannaro x criceto-malvagio: parziale",
  "veggente-mannaro x maga: parziale",
  "veggente-mannaro x untore: parziale",
  "veggente-mannaro x ubriaco: parziale",
  "veggente-mannaro x ambasciatore: parziale",
  "veggente-mannaro x pastore: parziale",
  "sciacallo-mannaro x guaritore: si, ok (bersaglio condiviso escluso)",
  "sciacallo-mannaro x spilungone: si, ok",
  "sciacallo-mannaro x lupo-mannaro-progenitore: si, ok",
  "sciacallo-mannaro x fattucchiera: si, ok",
  "sciacallo-mannaro x mimo: si, ok (poteri separati)",
  "sciacallo-mannaro x lantico: si, ok (non bloccato dalla maledizione)",
  "sciacallo-mannaro x cavaliere: parziale",
  "sciacallo-mannaro x veggente: parziale",
  "sciacallo-mannaro x veggente-mannaro: parziale",
  "sciacallo-mannaro x mucca-mannara: parziale",
  "sciacallo-mannaro x gallo-mannaro: parziale",
  "sciacallo-mannaro x paladino: parziale",
  "sciacallo-mannaro x strega: parziale",
  "sciacallo-mannaro x cortigiana: parziale",
  "sciacallo-mannaro x berserker: parziale",
  "sciacallo-mannaro x criceto-malvagio: parziale",
  "sciacallo-mannaro x cartomante: parziale",
  "sciacallo-mannaro x maga: parziale",
  "sciacallo-mannaro x untore: parziale",
  "sciacallo-mannaro x nonna: parziale",
  "sciacallo-mannaro x polpo-mannaro: parziale",
  "sciacallo-mannaro x ambasciatore: parziale",
  "lupo-mannaro-progenitore x medium: si, ok (trasformato, passo Medium sparisce)",
  "lupo-mannaro-progenitore x cavaliere: si, dubbio (vittima protetta trasformata)",
  "lupo-mannaro-progenitore x nano: si, dubbio",
  "lupo-mannaro-progenitore x criceto-malvagio: si, dubbio",
  "lupo-mannaro-progenitore x strega: parziale",
  "lupo-mannaro-progenitore x gallo-mannaro: si, ok",
  "lupo-mannaro-progenitore x mucca-mannara: parziale",
  "lupo-mannaro-progenitore x inquisitore: si, ok",
  "lupo-mannaro-progenitore x veggente: parziale",
  "lupo-mannaro-progenitore x cartomante: parziale",
  "lupo-mannaro-progenitore x cortigiana: parziale",
  "lupo-mannaro-progenitore x chupacabra: parziale",
  "lupo-mannaro-progenitore x maga: parziale",
  "lupo-mannaro-progenitore x untore: parziale",
  "lupo-mannaro-progenitore x fattucchiera: parziale",
  "lupo-mannaro-progenitore x ubriaco: parziale",
  "lupo-mannaro-progenitore x polpo-mannaro: parziale",
  "lupo-mannaro-progenitore x ambasciatore: parziale",
  "mucca-mannara x cortigiana: si, dubbio (visita non letale)",
  "mucca-mannara x berserker: si, dubbio (non e' il lupo piu' vicino)",
  "mucca-mannara x veggente: si, ok (aura benevola)",
  "mucca-mannara x medium: si, ok",
  "mucca-mannara x guaritore: parziale",
  "mucca-mannara x cavaliere: parziale",
  "mucca-mannara x strega: parziale",
  "mucca-mannara x cartomante: parziale",
  "mucca-mannara x criceto-malvagio: parziale",
  "mucca-mannara x maga: parziale",
  "mucca-mannara x untore: parziale",
  "mucca-mannara x fattucchiera: parziale",
  "mucca-mannara x ubriaco: parziale",
  "mucca-mannara x ambasciatore: parziale",
  "mucca-mannara x paladino: parziale",
  "mucca-mannara x veggente-mannaro: parziale",
  "mucca-mannara x sciacallo-mannaro: parziale",
  "mucca-mannara x lupo-mannaro-progenitore: parziale",
  "gallo-mannaro x spilungone: parziale",
  "gallo-mannaro x cavaliere: parziale",
  "gallo-mannaro x guaritore: parziale",
  "gallo-mannaro x veggente: parziale",
  "gallo-mannaro x cartomante: parziale",
  "gallo-mannaro x strega: parziale",
  "gallo-mannaro x criceto-malvagio: parziale",
  "gallo-mannaro x maga: parziale",
  "gallo-mannaro x untore: parziale",
  "gallo-mannaro x fattucchiera: parziale",
  "gallo-mannaro x ubriaco: parziale",
  "gallo-mannaro x paladino: parziale",
  "gallo-mannaro x veggente-mannaro: parziale",
  "gallo-mannaro x sciacallo-mannaro: parziale",
  "gallo-mannaro x lupo-mannaro-progenitore: si, ok (Gallo e Progenitore in alba/notte)",
  "gallo-mannaro x polpo-mannaro: parziale",
  "gallo-mannaro x ambasciatore: parziale",
  "gallo-mannaro x nonna: parziale",
  "spilungone x sciacallo-mannaro: si, ok",
  "spilungone x guaritore: parziale",
  "spilungone x paladino: parziale",
  "spilungone x inquisitore: parziale",
  "spilungone x medium: si, ok (variante aura benevola)",
  "spilungone x veggente-mannaro: parziale",
  "spilungone x lupo-mannaro-progenitore: parziale",
  "spilungone x mucca-mannara: parziale",
  "spilungone x gallo-mannaro: parziale",
  "spilungone x veggente: parziale",
  "spilungone x cartomante: parziale",
  "spilungone x strega: parziale",
  "spilungone x cortigiana: parziale",
  "spilungone x criceto-malvagio: parziale",
  "spilungone x maga: parziale",
  "spilungone x untore: parziale",
  "spilungone x fattucchiera: parziale",
  "spilungone x ubriaco: parziale",
  "spilungone x polpo-mannaro: parziale",
  "spilungone x ambasciatore: parziale",
  "spilungone x pastore: parziale",
  "spilungone x nonna: parziale",
  "nano x maga: si, ok",
  "nano x untore: si, ok",
  "nano x cavaliere: si, ok (immune di notte, sacrificio al rogo)",
  "nano x criceto-malvagio: si, ok",
  "nano x medium: si, ok (variante aura benevola)",
  "nano x paladino: parziale",
  "nano x ubriaco: parziale",
  "nano x pastore: parziale",
  "nano x fattucchiera: parziale",
  "nano x veggente: parziale",
  "nano x cartomante: parziale",
  "nano x berserker: parziale",
  "nano x nonna: parziale",
  "nano x polpo-mannaro: parziale",
  "nano x ambasciatore: parziale",
  "nano x veggente-mannaro: parziale",
  "nano x sciacallo-mannaro: parziale",
  "nano x lupo-mannaro-progenitore: si, dubbio (trasformabile)",
  "nano x mucca-mannara: parziale",
  "nano x gallo-mannaro: parziale",
  "nano x spilungone: parziale",
  "inquisitore x fattucchiera: si, ok (inibito, non perde il potere)",
  "inquisitore x paladino: parziale",
  "inquisitore x veggente-mannaro: parziale",
  "inquisitore x medium: parziale",
  "inquisitore x guaritore: parziale",
  "inquisitore x sciacallo-mannaro: parziale",
  "inquisitore x polpo-mannaro: parziale",
  "inquisitore x veggente: parziale",
  "inquisitore x strega: parziale",
  "inquisitore x cavaliere: parziale",
  "inquisitore x cortigiana: parziale",
  "inquisitore x berserker: parziale",
  "inquisitore x criceto-malvagio: parziale",
  "inquisitore x ubriaco: parziale",
  "inquisitore x pastore: parziale",
  "inquisitore x mucca-mannara: parziale",
  "inquisitore x gallo-mannaro: parziale",
  "inquisitore x spilungone: parziale",
  "inquisitore x nano: parziale",
  "medium x fattucchiera: si, ok (inibito)",
  "medium x lantico: si, ok (maledizione: non chiamato)",
  "medium x cavaliere: si, ok (variante aura benevola)",
  "medium x sciacallo-mannaro: si, ok (variante aura benevola)",
  "medium x veggente-mannaro: si, ok (variante aura benevola)",
  "medium x gallo-mannaro: parziale",
  "medium x ambasciatore: parziale",
  "medium x pastore: parziale",
  "medium x strega: parziale",
  "medium x cortigiana: parziale",
  "medium x berserker: parziale",
  "medium x chupacabra: parziale",
  "medium x criceto-malvagio: parziale",
  "medium x maga: parziale",
  "medium x untore: parziale",
  "medium x ubriaco: parziale",
  "guaritore x fattucchiera: si, ok (inibito)",
  "guaritore x cavaliere: si, dubbio (resuscitato senza protetto)",
  "guaritore x spilungone: parziale",
  "guaritore x paladino: parziale",
  "guaritore x inquisitore: parziale",
  "guaritore x medium: parziale",
  "guaritore x strega: parziale",
  "guaritore x cortigiana: parziale",
  "guaritore x berserker: parziale",
  "guaritore x criceto-malvagio: parziale",
  "guaritore x untore: parziale",
  "guaritore x nonna: parziale",
  "guaritore x ubriaco: parziale",
  "guaritore x polpo-mannaro: parziale",
  "guaritore x ambasciatore: parziale",
  "guaritore x pastore: parziale",
  "guaritore x veggente: parziale",
  "guaritore x cartomante: parziale",
  "guaritore x veggente-mannaro: parziale",
  "guaritore x lupo-mannaro-progenitore: parziale",
  "guaritore x mucca-mannara: parziale",
  "guaritore x gallo-mannaro: parziale",
  "guaritore x nano: parziale",
  "fattucchiera x cartomante: si, ok (inibito)",
  "fattucchiera x lantico: si, ok",
  "fattucchiera x cavaliere: parziale",
  "fattucchiera x berserker: parziale",
  "fattucchiera x chupacabra: parziale",
  "fattucchiera x criceto-malvagio: parziale",
  "fattucchiera x ubriaco: parziale",
  "fattucchiera x polpo-mannaro: parziale",
  "fattucchiera x nonna: parziale",
  "cavaliere x berserker: si, BUG 3 (muore comunque il lupo piu' vicino)",
  "cavaliere x criceto-malvagio: parziale",
  "cavaliere x nonna: parziale",
  "cortigiana x veggente: parziale",
  "cortigiana x cavaliere: parziale",
  "berserker x criceto-malvagio: parziale",
  "berserker x chupacabra: parziale",
  "berserker x strega: si, ok (pozione mortale: nessun lupo muore)",
  "chupacabra x criceto-malvagio: si, ok (immune, stallo fino al rogo)",
  "chupacabra x veggente: si, ok (aura malvagia)",
  "chupacabra x strega: parziale",
  "criceto-malvagio x strega: parziale",
  "criceto-malvagio x veggente: parziale",
  "mimo x pastore: si, ok",
  "mimo x ambasciatore: si, ok",
  "mimo x sciacallo-mannaro: si, ok (poteri separati)"
]
```

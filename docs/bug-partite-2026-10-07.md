# Quinto batch di partite di prova (ruoli e coppie poco valutati) - 2026-10-07

Partite guidate in Chromium reale (Playwright, viewport 390x844, dev server su porta 5511) senza modificare il codice. Screenshot in `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite`. Le sezioni sono scritte man mano; "BUG CERTI", "DUBBI" e "NON COPERTO" in fondo.

## Scenario 1 - Apprendista con maestro a ruolo ignoto (Scemo, Boia, Suocera)
Mazzi di 9 giocatori (Apprendista, Scemo/Boia/Suocera, 2 Lupi, Villici).
- Maestro Scemo sbranato di notte: all'alba "G04 si rivela: è l'Apprendista di G03 e prende la sua carta (ruolo ancora ignoto...)". Stato: G04 senza ruoloSlug, `ereditaIgnota`. Di giorno, Eventi speciali > "Lo Scemo del Villaggio sbaglia la rima" (solo in voto/esito, non all'alba: coerente col codice) elenca G04 tra i candidati (G03 morto e i lupi noti esclusi); confermando G04 muore e riceve ruolo Scemo. Registro e refresh corretti. **ok**
- Maestro Boia (sbranato di notte e anche bruciato al rogo): all'alba/al rogo l'Apprendista prende la carta; l'evento "Il Boia giustizia" lo propone come attore ("Chi è il Boia": G04...), poi "Chi giustizia". Dopo la conferma G04 è `boia`, `poteriUsati: boia-giustizia`, storiaRuoli [apprendista, boia]. Registro/refresh ok. **ok**
- Nessun auto-Villico a fine notte: dopo notte 2 con maestro sbranato G04 resta senza ruoloSlug; dopo refresh il riepilogo dell'alba resta. **ok**
- Indietro nel passo Apprendista: il primo Indietro annulla la vittima del branco, il secondo torna all'assegnazione dell'Apprendista (selezione svuotata); rifatta la scelta del maestro, il registro riporta solo l'ultima scelta (nessun duplicato). **ok**
- Maestro Suocera sbranato di notte: **BUG** (vedi sotto n.1): l'Apprendista non può essere scelto come Suocera.
- Rogo con maestro ignoto: testo "L'Apprendista G04 ha ereditato il suo ruolo." senza dire che il ruolo è ignoto (nel caso notturno il testo è chiaro); inoltre al rogo lo stato non porta `ereditaIgnota`/`ereditaDa` (solo `apprendistaRivelatoDa`). Basso.

## Scenario 2 - Maga, Untore, Fattucchiera, Nonna con i ruoli di contorno
Due mazzi da 14 (Maga, Untore, Fattucchiera, Nonna, Lupo, Paladino, Veggente, Cartomante, Medium, Guaritore, Strega, Cortigiana, 2 Villici; e Maga, Untore, Fattucchiera, Nonna, Lupo, Veggente Mannaro, Inquisitore, Sciacallo Mannaro, Pifferaio, Chupacabra, Paladino, Strega, Guaritore, Villico). 2 notti piene piu' un giorno con unzione e rogo.
- Fattucchiera su Veggente e su Maga: il passo del bersaglio mostra "Il potere e' inibito questa notte dalla Fattucchiera: nessuna azione disponibile"; la condizione sparisce all'alba. **ok**
- Maga su Paladino (potere del Paladino resta usabile), su Nonna: alba "G06 e' stato trasformato in maiale dalla Maga", condizione persa a fine giorno. **ok**
- Untore su Fattucchiera/Nonna/Veggente: "G03 e' stato unto dall'Untore"; "Morte per unzione" di G03 passa l'unzione ai due vicini VIVI (salta la Cortigiana morta). **ok**
- Paladino protegge l'Untore sbranato: sopravvive; la Strega protegge/uccide; Guaritore che resuscita e muore la stessa notte per la Strega: il resuscitato torna comunque (vedi dubbi).
- Nonna: Cartomante la vede "Nonna", Veggente e Veggente Mannaro "Aura benevola", Inquisitore riceve "no (aura benevola)" (e perde il potere: noto). Nonna sbranata/uccisa dal Chupacabra: muore come lupo (mortoDa chupacabra). Come lupo: appare negli "Vivi" del Branco e nel passo "Lupo Mannaro" (seleziona i lupi rimanenti). **ok**
- Pifferaio con Paladino/Strega/Chupacabra: ipnotizza 2, "Sveglia gli ipnotizzati dal Pifferaio" come ultimo passo; Chupacabra che punta un non-lupo fallisce, su Nonna la uccide. **ok**
- Cortigiana con cliente Lupo: muore all'alba, nessun annuncio di causa (solo "G04" nei morti). **ok** (coerente col testo)
- Nota di metodo: due clic quasi simultanei sui chip del Pifferaio (stesso tick) registrano un solo bersaglio e la scelta viene ignorata in silenzio all'Avanti; con clic distanziati funziona. Non riproducibile da un utente umano; da tenere presente (vedi NON COPERTO).

## Scenario 3 - Mimo e ruoli di branco/legame (copie, Bardo, Cavaliere, Progenitore, Ladro, Addolorata, Pastore, Ubriaco, Polpo, Ambasciatore, Sciacallo, Guardie)
- Mimo copia l'Antico (mazzo 8): Mimo-Antico sbranato di notte, "Nessuno e' morto", rivelazione con conferma, resta in vita da Villico; il vero Antico (G05) ha la sua prima vita separata nella notte 2. **ok**
- Mimo copia l'Alchimista: al rogo "L'Alchimista esplode" lo propone come unico attore (condannato), la vittima scelta puo' essere il vero Alchimista (G05) che muore (l'Alchimista del mazzo non ha potere finche' non e' al rogo). Nota: il menu eventi mostra "Il Boia giustizia" anche nello schermo del rogo. **ok**
- Mimo copia il Pifferaio con Pifferaio vero: un solo passo "Pifferaio" con "Vivi: G01 (Mimo), G04" e un solo gruppo da due ipnotizzati per notte (coerente con spec 2.3: 2 per notte in totale). Totale passi mostrato "Passo 3 di 6" ma le notti reali sono 5 passi (noto: totale sovrastimato).  **ok / nota**
- Mimo-Cavaliere con sacrificio effettivo (mazzo 11): il Mimo sceglie "Per chi sacrificarsi" (gruppo separato "Scelta di G01"), il Veggente protetto viene sbranato, G01 muore per sacrificio; alba "G01 si e' rivelato: e' il Cavaliere, e si e' immolato"; il Cavaliere vero non e' toccato; registro corretto. **ok**
- Bardo + Mimo-Bardo (mazzo 8): primo uso da Mimo dopo il rogo del Bardo vero. Il potere viene segnato su G01 (primo titolare vivo). Al rogo successivo "Il Bardo salta la notte" e' ripresentato (vedi DUBBI 1).
- Progenitore + Mimo-Progenitore + Capobranco + Nonna: il Branco mostra "Il Progenitore trasforma G06 in Lupo Mannaro", poi "Sbrana normalmente" evidenziato (noto); alba "Nessuno e' morto" e vittoria dei lupi corretta (5 contro 4). Poteri separati tra Progenitore e Mimo. **ok**
- Ladro che prende il Progenitore + Addolorata (mazzo 12, 10 giocatori): il Ladro scambiato con il rogo, Addolorata G04 prende Progenitore ("addolorata-scambio" + "progenitore-trasforma" ereditati: nessun secondo potere), entra nel Branco ("Vivi: G02, G03, G04, G06"). **ok**
- Pastore con Lupo adiacente: "Si sentono dei belati" ogni alba; Ambasciatore con Veggente accecato dal Polpo Mannaro: "E' arrivato un messaggio dall'ambasciatore" (il Polpo risulta benevolo), dopo la morte dell'Ambasciatore niente piu' annunci; Ubriaco sbranato: log "il branco sara' stordito", notte 2 "Il branco e' ancora stordito dall'alcol: questa notte non puo' cacciare". Sciacallo Mannaro resuscita l'Ubriaco in notte 3: "G05 e' stato resuscitato", potere usato. **ok**
- Guardie/Guardia Mannara: il passo "Le Guardie si riconoscono" elenca 3 giocatori (2 Guardie + Guardia Mannara). **ok**

## Scenario 4 - Combinazioni ancora vuote tra ruoli complessi
- Borgomastro x Antico: Antico sbranato (rivelato Villico) puo' essere eletto Borgomastro, poi bruciato: "G03 era il Borgomastro: il villaggio dovra' eleggerne uno nuovo", nessuna maledizione (ex Antico). **ok**; log con voce "G03 e' morto/a di notte" per un Antico sopravvissuto (vedi BUG 3).
- Borgomastro x Boia / Scemo: il Boia (G04) giustizia, poi G06 Borgomastro eletto e Scemo muore: "era il Borgomastro" + nuova elezione, due voci di log. **ok**
- Fantasma x Ladro x Addolorata: Fantasma assegnato al primo morto della notte (G05); Addolorata scambia con la vittima del rogo ignota (G06) e diventa Villico, l'avviso e' chiaro; il Fantasma resta su G05. **ok**
- Gallo/Bardo x Pifferaio x Cortigiana: Cortigiana visita G07 sbranato (muore), Pifferaio ipnotizza G07 e G08, "Gallo salta il giorno" all'alba: notte 2 con Cortigiana ☠️ "Chiama comunque", ipnotizzati conservati. **ok**
- Spilungone x Antico: Spilungone al rogo, "Si rivela" chiede conferma ("Confermi: G04 e' lo Spilungone?"), poi la notte 2 chiama comunque il Branco (noto). Il click diretto su "E' notte" durante la conferma non e' disponibile. Dopo refresh nella schermata di conferma si torna al rogo pre-conferma (coerente con bug 5 del batch 4). **ok / noto**

## Scenario 5 - Verifiche aggiuntive
- Mimo-Maga con Fattucchiera che inibisce il Mimo: il passo "Maga" ("Vivi: G01 (Mimo), G05") resta con un'unica scelta (azione condivisa), l'inibizione del solo Mimo non la blocca: **dubbio Q12 confermato** (DUBBI 3 e matrice).
- Mimo-Suocera: la Suocera vera e' marcata con ruolo noto dal passo del Mimo; "La Suocera si rivela" per il Mimo morto sbranato funziona (poteriUsati suocera-rivelata). **ok**
- Apprendista + Strega (maestro e Apprendista morti la stessa notte): nessuna rivelazione, registro corretto. **ok**
- Apprendista con maestro Antico sbranato (prima vita): l'ereditarieta' viene annullata alla rivelazione dell'Antico e il legame torna a G03; **ok** nello stato, voci stantie nel registro (BUG 3).
- Polpo Mannaro bruciato: il Veggente riottiene l'aura reale ("Aura malvagia") la notte dopo. **ok**
- Cortigiana: inibita dalla Fattucchiera la visita a un lupo non la uccide; cliente protetto dal Paladino e sbranato: sopravvive. **ok** (conforme al testo)

## Controlli trasversali
- Nessun errore di console ne' pageerror in tutte le partite (circa 45 scenari). Nessun overflow orizzontale a 390x844, illustrazioni presenti.
- Principio "conseguenze solo dopo Avanti": rispettato in tutti i passi provati (le condizioni protetto/inibito/unto/ipnotizzato compaiono nello stato solo dopo Avanti; i messaggi di aura/accecato nel passo stesso sono informazioni al narratore).
- Persistenza dopo refresh: ok in alba, giorno, rogo (dopo Dichiara), notte (passo corrente conservato).
- Vittoria: dichiarata solo all'alba (lupi 5 contro 4 con Progenitore/Mimo; lupi 4 contro 4 con Addolorata-Progenitore), corretta.

## BUG CERTI (per gravita')
**Media**
1. **Apprendista con maestro Suocera: l'Apprendista non puo' essere rivelato come Suocera.** Passi: mazzo Apprendista, Suocera, 2 Lupi, 4 Villici (8 giocatori); notte 1: G04 Apprendista sceglie G03 come maestro, il branco sbrana G03; all'alba G04 "prende la sua carta (ruolo ancora ignoto)"; Eventi speciali > "La Suocera si rivela" offre solo il morto G03 come "Chi era la Suocera". Confermando G03, G04 resta senza ruolo (ereditaIgnota) e continua a contare come Villico vivo per la vittoria, e non c'e' piu' nessun evento per rivelarlo (la Suocera e' consumata). Atteso (decisione del proprietario): la rivelazione dell'evento speciale scegliendo l'Apprendista come attore. Causa: `candidatiSuocera` in `src/features/giorno/EventiSpeciali.jsx` considera solo i morti. Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite/s1i-suocera.png`.

**Bassa**
2. **Rogo con maestro a ruolo ignoto: testo e dati meno chiari del caso notturno.** "L'Apprendista G04 ha ereditato il suo ruolo." (anteprima "erediterà") senza dire che il ruolo e' ignoto, e lo stato porta solo `apprendistaRivelatoDa` (niente `ereditaIgnota`/`ereditaDa`). Il comportamento resta corretto (G04 e' candidato Boia). Passi: Apprendista (G04) segue G03, G03 bruciato, "Dichiara morte sul rogo". Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite/s1e-rogo.png`.
3. **Registro con voci false/stantie dopo la rivelazione dell'Antico:** per un Antico sbranato (anche Mimo-Antico o Antico eletto Borgomastro) il registro mantiene "G03 e' morto/a di notte" e, con l'Apprendista, "G04 si rivela: e' l'Apprendista di G03 e prende la sua carta" anche dopo che l'Antico si e' rivelato ed e' sopravvissuto; viene aggiunta poi "L'Apprendista G04 sceglie G03 come maestro" (ripetuta). Il riepilogo dell'alba e' invece corretto. Passi: Apprendista + Antico maestro, branco sbrana l'Antico, "L'Antico si rivela". Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite/s5a-antico.png`.
4. **Menu "Eventi speciali" aperto: il pulsante diventa una pillola alta e stretta accanto al pannello** (all'alba e in votazione, 390x844), invece di restare un pulsante a larghezza piena con il pannello sotto/sopra. Solo estetico. Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite/s1c-eventi-voto.png`, `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite/s1c-eventi.png`.
5. **Morto con condizione "unto" conservata:** dopo "Morte per unzione" il morto resta con `condizioni:["unto"]` e "ha perso la condizione unto" compare solo a fine giorno (dati/registro, nessun effetto visibile). Passi: scenario 2, Untore ungi la Fattucchiera, Eventi speciali > Morte per unzione.

## DUBBI DI REGOLAMENTO (con proposta predefinita)
1. **Bardo + Mimo-Bardo (gia' noto, riprodotto):** dopo che il Bardo vero e' morto senza usare il potere e il Mimo-Bardo l'ha usato, "Il Bardo salta la notte" viene riproposto al rogo successivo (basta un titolare vivo e uno non-usato, anche se sono due persone diverse). Proposta: il potere e' usabile solo da un titolare VIVO che non l'ha ancora usato (conPotereDisponibile sul medesimo titolare), cosi' il morto non usato non "risorge" nel Mimo.
2. **Guaritore che muore la stessa notte (Strega) mentre resuscita:** il resuscitato torna comunque all'alba. Proposta: lasciare cosi' (la resurrezione e' un effetto della notte), annotare nel testo del Guaritore.
3. **Maga, Untore ammessi su se stessi, Fattucchiera no:** nei passi la Maga puo' trasformare e l'Untore ungere se stessi; la Fattucchiera non puo' inibirsi. Proposta: lasciare (nessun testo lo vieta), o coerenza con la Fattucchiera.
4. **Branco senza Capobranco puo' sbranare un altro lupo (anche la Nonna):** i chip del branco includono i lupi vivi. Proposta predefinita: lasciare liberi (narratore responsabile), oppure togliere i lupi dai chip se non c'e' il Capobranco.
5. **Apprendista che eredita Suocera (ruolo senza "morte"):** la Suocera e' un ruolo che "e' sempre morta/viva": se l'Apprendista ne eredita la carta, e' vivo ma non conta per la vittoria. Proposta: rivelazione tramite "La Suocera si rivela" con attore l'Apprendista (che resta vivo, non conteggiato), il maestro resta ruolo ignoto. (vedi BUG 1)
6. **Pifferaio + Mimo-Pifferaio:** gruppo unico da due ipnotizzati per notte (conforme alla spec 2.3), ma il passo non mostra chi dei due titolari agisce. Proposta: lasciare.
7. **Inquisitore su Nonna (aura benevola):** perde il potere (noto per Pifferaio, Sciacallo, Polpo, Mucca...). Proposta confermata: in linea col testo ("aura benevola").
8. **Spilungone: "la notte cala senza vittime" ma il Branco e' comunque chiamato e uccide** (anche un Antico ex-prima-vita): gia' noto. Proposta: se il narratore conferma lo Spilungone, saltare solo il passo del Branco.

## NON COPERTO
- Mimo che copia Inquisitore (doppio fallimento), Mimo-Boia (al giorno), Mimo-Cortigiana con cliente comune, Mimo-Cartomante/Medium: non provati in questo batch (solo Antico, Alchimista, Pifferaio, Suocera, Cavaliere, Bardo, Progenitore, Maga).
- Guardia/Guardia Mannara con Veggente e vittoria della fazione dei lupi per la Guardia Mannara; Pastore con piu' lupi vicini.
- Fantasma Onnisciente resuscitato o scambiato dall'Addolorata dopo averlo ricevuto; Ladro che prende Fantasma/Borgomastro (non nel mazzo del Ladro per regola).
- Partite complete fino alla vittoria con i mazzi di questo batch (si e' arrivati alla vittoria dei lupi solo in 2 casi).
- Due clic nello stesso tick sui chip del Pifferaio non vengono registrati (artefatto di test, non riproducibile a mano).

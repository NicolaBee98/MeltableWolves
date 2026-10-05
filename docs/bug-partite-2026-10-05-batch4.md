# Quarto batch di partite di prova — 2026-10-05

Tre scenari in Chromium reale: **G** verifica delle correzioni del terzo batch, **H** 36 coppie rischiose non valutate, **I** circa 40 partite complete con mazzi casuali (RNG con seed registrato, narratore "cieco"). Nessun errore di console, nessun overflow, illustrazioni tutte presenti. Matrice: 436 coppie valutate su 1326.

## Verifica correzioni (G): quasi tutte risolte
Risolti: Cavaliere + Alchimista, Cavaliere e crepacuore, vittoria solo all'alba (con "Concludi partita" confermato), Addolorata (Boia, Apprendista, Cavaliere immolato, impostazione attiva/disattiva), Mimo × Progenitore, Fattucchiera sul branco, Cortigiana con la Figlia dei Lupi, Apprendista con Cavaliere e Antico, maledizione dell'Antico per le morti diurne, Boia all'alba su un innamorato, unzione con i nomi, Avanti sul ruolo inibito, Guardie con Mimo.

## Bug certi
**Alta**
1. **Pifferaio non può ipnotizzare l'ultimo giocatore (H):** con un solo non ipnotizzato rimasto (o numero dispari) la scelta è bloccata ("Servono almeno due bersagli disponibili", Chiudi non fa nulla): la vittoria è irraggiungibile. `SceltaDoppiaGiocatore.jsx` (candidati < 2).
2. **Softlock prima notte con il Chupacabra non assegnato e sbranato dal branco (I):** al passo Chupacabra le chip escludono il morto, Avanti disabilitato, l'unica uscita è Indietro.

**Media**
3. **Alchimista resuscitato con potere già usato (H):** "Dichiara morte sul rogo" apre comunque la scelta e il secondo trascinato muore; `alchimista-esplosione` duplicato in `poteriUsati`; l'anteprima dice ancora "L'Alchimista esplode".
4. **Refresh nello spareggio (I):** dopo "Dichiara morte sul rogo" e F5, "Vittima designata:" resta vuoto.
5. **Refresh con Spilungone al rogo (I):** si torna alla schermata pre-conferma ("Dichiara morte sul rogo" di nuovo, senza "È notte"); dopo refresh spariscono anche il riepilogo dell'esplosione dell'Alchimista e la nota sulla vendetta del Cucciolo.
6. **"← Torna ai giocatori" compare dopo un refresh nella notte 1 (I):** dopo il passo Mimo o una carta del Ladro in mano, mentre prima del refresh non c'era.

**Bassa**
7. Riepilogo stantio dopo la rivelazione dell'Antico successiva a una morte diurna: "trascina con sé G08" / "È morto anche G08 (crepacuore)" con G08 vivo (G). Il testo di rivelazione dell'Antico giustiziato dal Boia non dice che il villaggio è maledetto e il registro non lo riporta (G).
8. Pifferaio dopo refresh: la coppia resta ipnotizzata ma non evidenziata (H).
9. Progenitore può "trasformare" un lupo (anche sé stesso) se il Capobranco sceglie un fratello: potere consumato senza effetto (H).
10. Dati: pozione mortale della Strega senza `mortoDa`; "G04 è stato unto" per un Nano già morto; `mortoGiorno` errato per un Boia dell'Alba (H).
11. Dopo uno scambio dell'Addolorata il passo "Addolorata" è ancora chiamato nelle notti successive ("Chiama comunque ☠️"): probabile cadavere titolare (G, non ispezionato).
12. Testo: "esclusi le 2 carte extra del Ladro, il Fantasma Onnisciente…" sgrammaticato (escluse, manca la "e") (I).

## Dubbi di regolamento
- Pifferaio vince appena i vivi sono tutti ipnotizzati, anche se è il rogo a togliere l'ultimo non ipnotizzato? Oggi il banner arriva solo all'alba seguente. Il Pifferaio deve poter ipnotizzare anche 1 solo bersaglio, o ripescare un già ipnotizzato?
- Dopo il rogo dell'ultimo lupo la notte seguente mostra comunque il passo Branco "Chiama comunque G01 ☠️" prima dell'alba che dichiara la vittoria (richiama i morti attivo).
- Aura per l'Inquisitore: Pifferaio, Sciacallo, Polpo, Mucca, Gallo, Guardia Mannara risultano benevoli (e fanno perdere il potere).
- Il branco può sbranare Polpo, Mucca, Sciacallo senza avviso; il Medium può interrogare defunti della fazione dei lupi (il testo dice "membro del villaggio").
- Nano: "può morire solo durante il rogo" ma il Boia lo giustizia: va esteso ad Alchimista e Scemo?
- Fantasma resuscitato conserva la carta e non si può riassegnare: torna al ruolo di prima? Il Fantasma si può assegnare anche ai morti notturni (oggi sì).
- Alchimista resuscitato esplode una seconda volta (oggi sì, con UI incoerente).
- Innamorato resuscitato con il partner ancora morto resta "innamorato" per tutta la partita.
- Capobranco: per l'app è un lupo normale (nessun obiettivo individuale).
- Ruolo nascosto bruciato senza rivelarsi resta "?": gli eventi dedicati restano nel menu anche a titolare morto ("Nessun bersaglio disponibile").
- Il Mimo che imita la Guardia compare nell'elenco delle Guardie (G01 (Mimo) nei "Vivi"): oggi sì.
- "L'Apprendista erediterà" appare nell'anteprima del rogo anche prima di sapere se la vittima è un Antico.

## Note di processo
Il batch I ha usato per errore, all'inizio, una porta del daemon di un altro agente (3-4 comandi di setup/clear localStorage): possibile partita azzerata a quell'agente.

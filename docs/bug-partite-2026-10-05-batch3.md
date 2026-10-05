# Terzo batch di partite di prova — 2026-10-05 (interazioni tra ruoli)

Tre scenari mirati sulle coppie non valutate della matrice (`docs/matrice-ruoli.md`), in Chromium reale (390x844): **D** Addolorata e scambi, **E** Ladro e carte cambiate (+ Mimo × Progenitore), **F** legami e morti a catena (+ Maga, Untore, Nonna, Fattucchiera). Nessun errore di console. Coperte 78 nuove coppie (matrice: 397 valutate su 1326).

## Bug certi
1. **Cavaliere + Alchimista al rogo (F, alta):** il Cavaliere si immola per l'Alchimista ma "Si rivela: è l'Alchimista" fa esplodere comunque l'Alchimista, che resta vivo, e muore la vittima scelta: 2 morti per un rogo.
2. **Alchimista bruciato non scambiabile dall'Addolorata (D, media):** `dichiaraAlchimistaEsplode` (`GiornoPanel.jsx` ~119) imposta `causaMorte:'rogo'` ma non `mortoNotte:round`, l'Addolorata dice "Nessuna vittima al rogo".
3. **Mimo × Progenitore (E, media):** il potere di trasformazione è condiviso (`AzioneBrancoLupi.jsx` prende il primo Progenitore vivo): se si consuma quello del Mimo, il Progenitore vero non può più trasformare. Spec: usi separati.
4. **Anteprima/riepilogo incoerenti col sacrificio del Cavaliere (F):** `conseguenzeMorte` (`eventiSpeciali.js` ~110) elenca crepacuore/eredità/Figlia/vendetta anche quando il Cavaliere salva il bersaglio ("Morirà anche G07" con "il Cavaliere lo protegge"); dopo l'Alchimista "È morto anche G12" con G12 vivo; per lo Scemo salvato "è morto/a" ma è vivo.
5. **Annulla morte della vittima del Boia (F):** il potere `boia-giustizia` resta sul Boia, che non può più giustiziare (`patchAnnullaMorte` lo toglie alla vittima, va usato `giustiziatoDa`).
6. **Boia all'alba su un innamorato (F):** il partner morto di crepacuore non compare tra i morti dell'Alba né nel riepilogo.
7. **Riepiloghi senza le conseguenze di seconda generazione (F):** eredità dell'Apprendista (maestro morto per Alchimista, sacrificio del Cavaliere, rima dello Scemo), vendetta del Cucciolo morto di crepacuore.
8. **`storiaRuoli` dell'Addolorata che scambia non riceve il nuovo ruolo (D):** `AzioneAddolorata.scambia` aggiorna solo la vittima.
9. **Registro senza la scelta del Ladro (E):** non scrive "Il Ladro sceglie X: scarta Y" quando il Ladro è assegnato nello stesso passo in cui sceglie (`confermaLog` legge lo stato prima della selezione pendente).
10. **Bassa:** scambio con vittima di ruolo ignoto: l'Addolorata passa a `ruoloSlug` undefined e il registro non scrive lo scambio (D); Avanti sul passo di un ruolo inibito appena assegnato non avanza al primo click (F); riepilogo dell'unzione senza i nomi dei vicini (F); `mortoGiorno`/`giustiziatoDa`/`mortoDa` restano su chi è stato salvato dal Cavaliere (F); la trasformazione del Progenitore non lascia voce nel registro (E); "Passo X di N" stimato in eccesso con il Ladro (E); registro del Mimo-Ladro con "scarta" sbagliato e voci in ordine invertito (E); nell'illustrazione del Branco il Mimo-Lupo manca (E).

## Dubbi di regolamento (domande per il proprietario)
**Addolorata**
- D1. Ruoli con scelta della prima notte (Apprendista, Cavaliere, Figlia, Sacerdote) acquisiti con lo scambio: l'Addolorata sceglie ora il legame/le coppie, o resta inerte come oggi?
- D2. I poteri "una volta per partita" già usati dal morto (Boia, Strega, Guaritore...) passano all'Addolorata, come per l'Apprendista? Oggi no (potere fresco).
- D3. Il Cavaliere che si immola al rogo è "vittima del rogo" per lo scambio? Oggi no.
- D4. Dopo lo scambio il cadavere vale per Medium, aura e Fantasma come Addolorata (carta) o come il ruolo in vita? Il Fantasma vince con quale?
- D5. La nuova Cucciola dopo una vendetta già consumata ha di nuovo la vendetta? (Oggi no; il banner "il Cucciolo diventa adulto" appare anche quando muore lei.)
- D6. Se l'ultimo lupo muore al rogo il banner "vince il Villaggio" compare subito anche se l'Addolorata potrebbe riprendere la carta: accettabile?

**Legami e morti**
- Il Cavaliere salva da QUALSIASI morte (deciso), compreso il crepacuore: ok anche quando salva la Figlia dei Lupi dalla morte di coppia (l'alba parla di "vittima")?
- Il crepacuore consuma la prima vita dell'Antico (oggi sì: sopravvive, il partner resta morto)? Il Boia che giustizia l'Antico è maledizione (oggi no)?
- Apprendista di un Antico: dopo la prima vita l'erede riceve "Villico", non Antico: corretto?
- Guaritore/Sciacallo su un innamorato: il partner morto di crepacuore resta morto senza avviso; Guaritore sul maestro già ereditato: due titolari della stessa carta; Guaritore sull'ex Antico: una sola vita.
- Cortigiana in visita alla Figlia dei Lupi che diventa lupo la stessa notte: la Cortigiana muore senza spiegazione all'alba.
- Inquisitore su Nonna: "no, aura benevola" e potere perso (la Nonna è benevola solo per il Veggente); Fattucchiera su un lupo del Branco: nessun effetto.
- Protezione (Paladino/pozione vitale) non protegge dal crepacuore del partner; Apprendista con maestro Cavaliere: l'erede ha il legame vuoto.

**Ladro/Capobranco**
- Capobranco e un lupo semplice contro un solo villico: vincono i lupi in blocco (oggi) o il Capobranco da solo?
- Il Ladro che prende la Guardia Mannara conta come Guardia nel passo "Le Guardie si riconoscono" (oggi sì, tre titolari)?

## Esiti positivi (verificati in browser)
Ladro × Sacerdote, Cavaliere, Figlia dei Lupi, Apprendista, Pifferaio, Strega, Chupacabra, Cortigiana, Berserker, Cucciolo, Progenitore, Capobranco, Bardo, Gallo, Cartomante, Medium, Guardia Mannara, Mezzosangue, Polpo, Veggente, Addolorata, Mimo: il ruolo preso agisce già dalla notte stessa, nell'ordine del libretto; la carta scartata è chiamata ogni notte; Indietro e refresh ok. Addolorata × Chupacabra, Pifferaio, Cartomante, Mimo, Antico, Sacerdote, Apprendista (eredità prima dello scambio): ok. Cavaliere × Antico, Pifferaio, Mezzosangue; Apprendista × Boia, Cortigiana; Alchimista × Sacerdote; Sacerdote × Berserker, Mezzosangue; Antico × Strega, Chupacabra: ok. Maga, Untore, Nonna, Fattucchiera con vari ruoli: nessun conflitto (coppie "parziali").

## Non provato
Mimo con Maga, Untore, Nonna, Fattucchiera (il passo Mimo richiede il ruolo già assegnato); Maga e Untore con interazioni di danno.

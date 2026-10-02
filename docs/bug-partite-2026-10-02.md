# Errori trovati nelle partite di prova — 2026-10-02

Tre partite in browser reale (Chromium, 390x844): **A** Mimo e legami, **B** giorno/rivelazioni/morti, **C** notte/branco/vittorie. Nessun errore di console, nessun overflow orizzontale. Screenshot e script nello scratchpad delle sessioni. Stato: da correggere, salvo dove indicato.

## Alta
1. **Cavaliere al rogo (B):** dopo "Dichiara morte sul rogo" sul protetto il Cavaliere muore ma l'UI non cambia (nessun messaggio, niente "È notte"); un secondo click uccide anche il protetto. `Votazione.jsx:194` cerca `mortoNotte===round`, ma per il rogo `risolviLegami` lascia `mortoNotte` undefined.
2. **Refresh a metà passo Sacerdote (A):** la coppia scelta è nello stato ma la UI mostra zero chip; riselezionando restano 4 innamorati da un solo Sacerdote.
3. **Carta del Ladro in mano al narratore non svegliata se la quantità scende a 0 (C):** `AzioneLadro` azzera `quantita[slug]`, `App.jsx` costruisce `ruoliSelezionati` con quantità > 0 e `passiNotte` filtra `ruoliInMano` per `ruoliSelezionati`. Con "Resta Villico" spariscono entrambe le carte.
4. **Branco: "Il Progenitore trasforma X" poi "Sbrana normalmente" (C):** valuta il bersaglio col ruolo già trasformato (`toggleTrasformazione` chiama `procediConAttacco` prima di disfare la trasformazione): salta parità Berserker e avviso, compare un avviso falso sul Cucciolo.

## Media
5. **Boia: secondo passo "Chi giustizia" (B):** il Boia è preselezionato e "Conferma" abilitato; si giustizia da solo.
6. **Vittorie contraddittorie (C):** Pifferaio solo / innamorati soli mostrano anche "Non ci sono più Lupi Mannari: vince il Villaggio". Criceto da solo: "vince il Villaggio" (dubbio regolamento).
7. **Branco dopo refresh (A, C):** chip sparite o "vittima 1 di 2" con il primo morso già registrato; non si deseleziona, Indietro azzera il passo e poi si disabilita.
8. **Notte saltata dal Bardo (A):** "Vai all'alba (tieni premuto)" schiacciato (55px) e "Indietro" enorme.
9. **Registro non si ripulisce con Indietro (A):** voci duplicate dopo Avanti-Indietro-Avanti.
10. **Registro impreciso (A, B):** "imita Veggente (G02)" mostra il ruolo finale e non quello imitato (Mimo-Ladro); mancano Ladro, Bardo, Gallo, Sacerdote, legami, rivelazioni di Apprendista/Figlia; Boia/Alchimista/Scemo senza causa; etichette "Giorno N" senza Notte/Alba.
11. **Riepilogo conseguenze scompare dopo la conferma (A):** Figlia/Apprendista/Cucciolo nel rogo e all'alba non lasciano riepilogo; l'alba non annuncia crepacuore, trasformazione del Mezzosangue, rivelazione dell'Apprendista (C).

## Bassa
12. **"Passo X di N" instabile (A, B, C):** il totale cresce quando compare il primo lupo, il Pifferaio ipnotizza, il Chupacabra compare, i due innamorati vengono scelti; numeri saltati quando un ruolo non è in gioco.
13. **Conseguenze mostrate prima di Avanti (A, C):** Mimo/legami (righe 🔗), chip del Ladro che applica subito `ruoloSlug 'mimo'`, sottotitolo "Vivi:" con il nuovo lupo trasformato.
14. **"Innamorati si riconoscono" con due coppie (A):** mostra tutti e 4 insieme; icona del titolo "?".
15. **Mimo-Ladro (A):** riassegnando la chip del Mimo il Ladro-Mimo resta senza ruolo; `storiaRuoli` con duplicati.
16. **Apprendista/Mimo-Apprendista che eredita (A):** Cavaliere ereditato con legame null senza chiedere chi proteggere; `storiaRuoli` senza il ruolo ereditato.
17. **Addolorata (C):** il morto con cui si scambia ha `storiaRuoli` senza il ruolo precedente e `mortoNotte` errato per un rogo del giorno 1.
18. **Popup "Nuova Partita" (B):** dice che i giocatori andranno persi ma restano.
19. **Avviso conteggio giocatori (B):** "esclusi le 2 carte extra del Ladro, il Borgomastro e il Fantasma" compare anche senza questi ruoli.
20. **Illustrazioni ipnotizzati (C):** ruolo reale invece di Villico se già assegnato; il Criceto è visibilmente più grosso del Villico.
21. **Testi:** "1 voti"; "Seleziona 1 giocatore in più" con "Nessun giocatore disponibile"; "Chiama comunque G02, G03... per il suo turno"; Avanti del passo Mimo senza avviso "diventerà Villico".
22. **Riempimento "È giorno" (C):** testo poco contrastato sull'ambra; commento CSS incoerente con il bottone scuro.
23. **Box "Nel mazzo" su desktop (C):** ultima riga di chip tagliata dallo scroll interno.
24. **Ubriaco sbranato (C):** nessun log né avviso all'alba.
25. **Mazzo (B):** la Cortigiana resta nell'elenco (disabilitata) dopo la selezione, a differenza degli altri ruoli.

## Dubbi di regolamento (da decidere)
- Mimo "Chi imitare" propone solo giocatori con ruolo già assegnato: le 2 carte extra del Ladro non sono imitabili (spec 2.1: "carte non assegnate").
- Mimo-Cavaliere e Cavaliere sullo stesso giocatore: vincolo o indipendenza?
- Veggente su Guardia Mannara: "Aura benevola"; Mimo che copia la Guardia Mannara la rende mannara.
- Con "richiama i morti" attivo si chiama il Branco anche con tutti i lupi morti e la Strega con entrambe le pozioni usate.
- Spilungone: "la notte cala senza vittime" ma i lupi possono sbranare (noto).
- Medium indaga l'ex Antico come "villico".
- Una volta "Nessuno è morto" sbranando la Guardia Mannara (non riprodotto).
- "← Torna ai giocatori" esiste solo a notte 1 passo 0: la conferma di aggiunta/rimozione a partita avviata non è raggiungibile.

## Non coperto
Mimo che copia Antico/Boia/Alchimista/Suocera/Pifferaio/Inquisitore; Bardo+Mimo-Bardo con morte di uno; Mimo-Cavaliere con sacrificio effettivo; Capobranco e Nonna; Gallo/Mucca/Veggente Mannaro nei finali; Pastore con più lupi; PWA offline; contrasti misurati.

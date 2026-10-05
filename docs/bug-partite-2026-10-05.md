# Secondo batch di partite di prova — 2026-10-05

Tre scenari in Chromium reale (390x844 + desktop): **A** Mimo (varianti), **B** giorno/rogo/eventi, **C** notte/branco/Ladro/PWA. Nessun errore di console, nessun overflow orizzontale.

## Verifica dei bug del primo batch
Risolti (verificati in browser): Cavaliere al rogo e di notte, Boia, vittorie esclusive (Villaggio, Lupi, Criceto, Pifferaio, innamorati, Chupacabra), notte saltata dal Bardo, registro senza duplicati dopo Indietro (un caso provato), riepiloghi dopo il rogo e annunci all'alba, contatore passi stabile, popup Nuova Partita, avviso conteggio, plurali, contrasto tasto giorno, Antico (rivelazione, due vite, icona), Alchimista con conferma, carte del Ladro in mano chiamate ogni notte anche con "Resta Villico", Progenitore con vendetta del Cucciolo, refresh a metà passo (Sacerdote, Branco, Pifferaio, Veggente), ipnotizzati uniformi, avvisi del Branco, Pastore con Gallo/Mucca (nessun belato), resurrezioni all'alba, Cavaliere e Mimo-Cavaliere su persone diverse, Cucciolo+Mimo una sola vendetta, Cortigiana+Mimo, Polpo su Veggente+Mimo, Cortigiana nel mazzo.
Ancora presenti: Alchimista che trascina la Figlia dei Lupi (nessun riepilogo dopo il Conferma); "Torna ai giocatori" non raggiungibile a partita avviata (deciso: va bene).

## Nuovi problemi
**Alta**
1. **PWA offline non funziona (C): CORRETTO** — `cache.addAll` rifiutava l'elenco per richieste duplicate (le icone 192/512 compaiono due volte in `__WB_MANIFEST`), quindi il service worker non si installava mai. Fix: `Set` in `src/sw.js`. Da riverificare offline in browser.
2. **Passo Branco della notte 1 saltato (A, C)** quando "Lupo Mannaro" è l'ultimo passo (mazzo Lupo + Villici, o Lupo + Chupacabra): il Branco non compare, "È giorno" chiude la notte, "Passo 1 di 2" errato. Causa: `vaiAvanti` usa `steps[indiceValido+1]` calcolato prima del commit delle selezioni; il Branco entra in lista solo dopo l'assegnazione dei lupi (`NightSequencer.jsx:467`).

**Media**
3. Apprendista con maestro senza ruolo noto (es. Suocera sbranata e poi rivelata): non eredita mai (`risoluzioneNotte.js:59`), nessun avviso.
4. Scelta del legame facoltativa (Apprendista, Cavaliere, Figlia) e Sacerdote con coppia incompleta: Avanti abilitato senza avviso; il legame si può perdere in silenzio.
5. Bardo + Mimo-Bardo: con Bardo morto non usato e Mimo vivo, dopo un uso il potere viene riproposto (`conPotereDisponibile`). Regola decisa: disponibile se almeno uno è vivo e almeno uno non ha usato; il caso "uso del vivo, poi resta il morto non usato" va chiarito.
6. Berserker con due lupi alla stessa distanza: la scelta non è vincolante, "È giorno" porta all'alba con "Nessuno è morto"; dopo refresh il prompt sparisce.
7. Mimo assegnato col chip ma senza "Chi imitare": a fine notte torna al passo Mimo, poi Lupo/Veggente/Branco ricompaiono, contatore 4/7→4/6→4/5, log "diventa Villico" + "imita Villico".
8. Strega + Mimo-Strega condividono un solo set di pozioni (spec: Q5 B "poteri unici separati" vs "Strega: interpretazione dell'audit corretta"): da chiarire.

**Bassa**
9. Fantasma solo manuale, candidati includono morti non da rogo (deciso: ok tutti i morti); nessun promemoria dopo il primo rogo.
10. "Concludi partita" porta alla Home senza conferma, subito sopra "È notte".
11. Registro: "è tornato in vita" per l'Antico che sopravvive; voci ridondanti (resuscitato); Mezzosangue/crepacuore 2-3 volte (Notte+Alba); mancano scelta Guaritore/Sciacallo e morte del Borgomastro; "Giorno N" raggruppa anche le notti; evento del giorno etichettato "Alba:"; log dei Boia senza chi ha giustiziato.
12. Bardo che salta la notte: nessun feedback dopo il Conferma.
13. Dati: `mortoGiorno` errato dopo Boia all'alba/resurrezione; `mortoNotte:2` per un rogo del giorno 1; `storiaRuoli` con duplicati ("boia","boia").
14. La vittima del Boia all'alba non compare tra i morti della pagina Alba.
15. Addolorata + Mimo-Addolorata possono scambiare con la stessa vittima; il morto diventa Addolorata e non "mimo-villico".
16. Pifferaio + Mimo-Pifferaio: una sola scelta condivisa di 2 ipnotizzati; il Pifferaio può ri-ipnotizzare chi lo è già.
17. Indietro disabilitato al primo passo di ogni notte successiva e dopo un refresh (tooltip invisibile su touch).
18. Passo Ladro+Mimo: dopo il Ladro si torna al passo Mimo (stessa etichetta "Passo 2 di N") anche se nessuno ha preso la carta Mimo.
19. Icona "?" nel titolo "Sveglia gli ipnotizzati dal Pifferaio"; totale passi sovrastimato se il Pifferaio non ipnotizza.
20. Progenitore: dopo "trasforma" il bottone "Sbrana normalmente" risulta evidenziato (ambiguo); ordine chip parità Berserker non ordinato.
21. Desktop: "Nel mazzo" scorre internamente senza indicatore; l'info "(come le 2 carte extra del Ladro)" compare anche senza Ladro.
22. Cosmetici: doppio bordo nel banner di vittoria; "Concludi partita" e "Vai al voto" vicinissimi; l'ex-Antico mostrato "(Villico)" senza segno della prima vita; banner Chupacabra+Mimo parla del "Mimo che lo imita"; sorteggio spareggio senza messaggio.

## Dubbi di regolamento
- Con i lupi veri morti ma Mucca/Gallo/Sciacallo/Veggente Mannaro/Guardia Mannara vivi si annuncia "vince il Villaggio" (deciso), ma roles.js dice che la Mucca "vince assieme ai lupi".
- Cucciolo resuscitato dal Guaritore la notte della vendetta: i lupi sbranano comunque due vittime.
- Chupacabra + Lupo 1 contro 1: vincono i Lupi anche con il Chupacabra vivo.
- Capobranco + Mimo-Capobranco ultimi due: "vincono i Lupi" a 2 contro 2.
- Sciacallo resuscita anche gli amanti: il partner morto resta morto senza avviso.
- Mimo-Suocera: si può scegliere ma non rivela nulla alla morte.
- Il Branco viene chiamato con tutti i lupi morti (deciso: va bene).

## Non coperto
Mimo-Scemo/Innocente, Mimo-Capobranco di notte, Mimo con Pastore/Ambasciatore e aura, Gallo che salta il giorno (solo dialog), Nonna, Pastore con più lupi, Fantasma di notte, Borgomastro che muore al rogo, timer a 0, contrasti misurati, Spazio su chip.

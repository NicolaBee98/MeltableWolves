# Batch partite 2026-10-09 (f): partite complete con mazzi grandi (15-19 giocatori), vittorie multiple, UX 390x844

Chromium reale (Playwright, 390x844, dev server porta 5563; build di produzione servita su 5564 solo per la prova offline). Nessuna modifica a `src/` ne' ai documenti esistenti. Script e screenshot in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad` (es. `a1-alba.png`, `g2n1-last.png`, `g3n4-branco.png`, `w-innamorati.png`). Tutti i passi oggetto del test sono stati giocati dalla UI (Home, Mazzo, composizione, Giocatori, notti, alba, voto, spareggio, rogo, Eventi speciali, Concludi, Nuova Partita). Per saltare setup lunghi ho riusato istantanee del localStorage prese a meta' partita (checkpoint) e, per le sole vittorie finali, modificato i flag `vivo` di un checkpoint. Console: nessun errore ne' warning in tutti gli scenari; nessun overflow orizzontale su nessuna schermata.

Tre partite:
- **P1** (15 giocatori): Lupo x2, Cucciolo, Veggente, Cartomante, Cavaliere, Sacerdote, Apprendista, Alchimista, Boia, Scemo, Guaritore, Pifferaio, Chupacabra, Villico + Borgomastro. Finita con vittoria del Pifferaio, poi Concludi e Nuova Partita.
- **P2** (19 giocatori, nome lungo "Massimiliano Bartolomeo"): Lupo x2, Capobranco, Criceto, Mezzosangue, Antico, Sacerdote, Cavaliere, Apprendista, Alchimista, Boia, Scemo, Guaritore, Veggente, Strega, Cartomante, Villico x2, Chupacabra + Borgomastro. 4 notti, 3 rogo, fino a "Chupacabra solo contro i villici".
- **P3** (14 giocatori): Lupo, Capobranco, Cucciolo, Mezzosangue, Antico, Veggente, Cartomante, Guaritore, Strega, Sacerdote, Cavaliere, Apprendista, Scemo, Pifferaio + Borgomastro. 4 notti (notte maledetta dall'Antico, vendetta del Cucciolo).

## Scenari

### S1 - Primo avvio: Home, Regolamento, Mazzo, composizione, Giocatori, riordino
- Home: 4 pulsanti + ingranaggio. Regolamento (Libretto) e galleria Mazzo senza overflow; "Sfoglia il mazzo" con frecce e slider ok. La galleria "Il mazzo" mostra solo le immagini (non sono toccabili: nessun ingrandimento al tap, solo "Sfoglia il mazzo"). **ok**
- Dopo un refresh nel Regolamento la app riapre il Regolamento (la vista e' persistita); stesso per "Scarica offline". Coerente. **ok**
- Composizione: ogni tap su una chip aggiunge una carta (Lupo Mannaro 1/2, Villico 1/2, i ruoli unici spariscono dall'elenco). "Guardia Mannara" disabilitata senza Guardie. Avvisi del mazzo e conteggio giocatori attesi corretti. **ok** (vedi UX 5, 6, 7)
- Giocatori: 12-19 nomi con Invio, nome vuoto/spazi ignorato, duplicato (anche con maiuscole diverse) bloccato con avviso, nome lungo "Massimiliano Bartolomeo" resta in una sola chip senza troncarsi, riordino per trascinamento col mouse (Vera da ultima a prima) ok, "Elimina tutti" chiede conferma. **ok**
- "È notte nel villaggio" disabilitato finche' il numero non torna; il pulsante disabilitato e' molto sbiadito (contrasto basso) ma il motivo e' scritto sopra. **ok**

### S2 - Prima notte con mazzi grandi (P1 13 passi, P2 14, P3 15)
- Ordine passi coerente col libretto; i ruoli non notturni (Boia, Alchimista, Scemo, Villico, Antico) non vengono assegnati e restano "?" fino alla rivelazione. I passi Sacerdote/Pifferaio aggiungono ciascuno un passo ("Innamorati (si riconoscono)", "Ipnotizzati (dal Pifferaio)") e il totale "di N" cambia in funzione delle scelte (noto, matrice: Pifferaio da solo). **ok / gia' noto**
- Apprendista (maestro), Cavaliere (protetto), Sacerdote (coppia), Pifferaio (due), Cartomante, Veggente: chip, avvisi e "Mostra carta" ok. Cartomante su Mezzosangue: carta Mezzosangue; Veggente su Criceto/Antico: "Aura benevola"; Veggente su Capobranco/lupo: "Aura malvagia". **ok**
- Strega vitale + Cavaliere sullo stesso bersaglio morso (Antico): "Il morso non ha effetto", nessuna morte e il Cavaliere non muore. **ok**
- Refresh a meta' passo (Cavaliere, Cartomante, Veggente, Pifferaio): chip e esito identici. **ok**. Branco e Strega dopo refresh: la scelta non e' piu' mostrata ma compare "Il branco ha gia' sbranato una vittima" / "Pozione vitale gia' utilizzata": coerente. **ok**. Chupacabra dopo refresh: vedi BUG 1.
- Indietro al passo successivo (Branco -> Chupacabra -> Indietro): torna al Branco e annulla il morso (Rita viva), poi si puo' ririscegliere; Indietro nell'ultimo passo annulla la caccia. **ok**. Dopo un refresh nell'ultimo passo "Indietro" e' disabilitato (stato di annullamento perso): accettabile.

### S3 - Alba, Borgomastro, voto, spareggio con timer, rogo
- Alba 1: "Hugo si rivela: e' l'Apprendista di Nico ed eredita il ruolo di Guaritore" (maestro sbranato) con avviso Borgomastro. Elezione da Eventi speciali (scelta -> Conferma -> messaggio "Elena e' il nuovo Borgomastro: il suo voto vale doppio" -> Ok); icona Borgomastro accanto al nome nel voto (alt "il suo voto vale doppio"; il doppio voto resta solo promemoria, noto). **ok**
- Voto: 14-18 righe con -1/+1 a 58x40 (>= 44 solo in altezza dove serve), "Ricomincia votazione" chiede conferma, "Torna al voto" dall'esito conserva i voti. Parita' a 2 e a 3 -> "Spareggio tra ..." con timer 01:00, Avvia/Pausa/Azzera, "Tempo scaduto" a zero (durata cambiabile da impostazioni, provata a 6 s). **ok**. Il timer in corsa dopo un refresh riparte da capo e fermo (non persistito): coerente ma da sapere.
- Rogo: "Dichiara morte sul rogo" / "Si rivela: e' ..." (Antico, Alchimista) con conferma; dopo refresh il pannello di scelta dell'Alchimista si chiude e si riapre dal pulsante. **ok**. Con Apprendista in vita il rogo del maestro mostra "L'Apprendista X erediterà il suo ruolo" gia' nell'esito (anche per un Antico ancora alla prima vita: l'avviso e' prematuro, vedi UX 8).
- Dopo il rogo dell'ultimo lupo/Chupacabra nessun banner finche' non si fa la notte (solo all'alba): gia' noto e accettato nei report precedenti.

### S4 - Eventi speciali con conferma
- Boia: due passi (Chi e' il Boia -> Chi giustizia -> Conferma). Boia sul partner di un innamorato (Boia x Sacerdote): "Luca si e' rivelato/a: e' il Boia e giustizia Dario. E' morto anche Luca (crepacuore)". **ok**
- Alchimista al rogo che trascina un lupo (Carla, Massimiliano): morte e registro corretti; Alchimista che trascina l'ultimo lupo. **ok**
- Scemo: "Lo Scemo del Villaggio sbaglia la rima" -> sceglie fra i ruoli ignoti (offre anche chi e' un Villico non registrato, es. Ugo) -> morto con ruolo registrato. **ok**
- Elezione Borgomastro dopo la morte del Borgomastro (rogo di Hugo, anche Guaritore e innamorato): Paolo muore di crepacuore; l'elezione e' nel menu e all'alba successiva compare l'avviso. **ok**
- Antico al rogo (Elena): "Elena rivela la propria carta: e' L'Antico, ma sopravvive...", notte successiva "Il villaggio e' maledetto" con soli 3 passi (Pifferaio, Branco, Ipnotizzati); l'Apprendista non eredita. **ok**

### S5 - Interazioni di ruoli provate (P1-P3)
- Apprendista x Guaritore: maestro sbranato la notte 1, l'Apprendista diventa Guaritore gia' prima dell'alba e lo annuncia. **ok**
- Apprendista x Boia (maestro ignoto che si rivela Boia, poi bruciato): Irene eredita Boia e il potere "boia-giustizia" gia' usato (non puo' giustiziare di nuovo). **ok, dubbio** (vedi D4).
- Apprendista x Antico: maestro Antico alla prima vita, nessuna eredita'. **ok**
- Boia x Cavaliere: Boia giustizia il protetto del Cavaliere -> il Cavaliere si immola e il protetto sopravvive. **dubbio** (D1).
- Cavaliere resuscitato dal Guaritore: legame azzerato (`legame:null`), non protegge piu' e non c'e' passo per sceglierne un altro. **dubbio** (D3).
- Strega x Criceto: pozione mortale su Criceto "non ha alcun effetto"; Chupacabra senza lupi su Criceto: idem. **dubbio** (D2).
- Strega mortale su Cavaliere nella stessa notte in cui il Mezzosangue (suo protetto) viene morso: Cavaliere muore per la pozione, il Mezzosangue diventa Lupo; ordine corretto. **ok**
- Guaritore morto (anche Borgomastro) resuscita il Pifferaio morto di crepacuore: il Pifferaio torna in vita senza essere piu' innamorato, gli ipnotizzati restano tali. **ok**
- Mezzosangue morso con Cavaliere sul Mezzosangue: nessun sacrificio. **ok**
- Pifferaio x Chupacabra: Chupacabra ipnotizzato; ultimo non ipnotizzato ucciso dal branco, banner subito all'alba. **ok**
- Cucciolo: dopo Chupacabra che uccide un lupo "il Cucciolo Anna diventa adulto"; vendetta del Cucciolo al rogo: "vittima 1 di 2" nel Branco. **ok**
- Cartomante su un giocatore ignoto: tra le chip ci sono solo ruoli con carta segreta (Villico, Antico...), mai Alchimista/Scemo/Boia/Innocente. **dubbio** (D5).

### S6 - Vittorie multiple e Concludi partita
Provate dall'ultimo passo di notte (UI) su checkpoint modificati; ogni banner e' stato verificato anche dopo refresh.
- Pifferaio (giocata dall'inizio in P1): "Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui." **ok**
- Lupi (1 lupo + 2 villici, morso): "I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro." **ok**
- Criceto (1 lupo + Criceto + Villico, morso): "Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui." **ok**
- Chupacabra (Chupacabra + 1 villico, caccia): "Il Chupacabra e' l'ultimo sopravvissuto: vince lui." **ok**
- Innamorati (solo i due innamorati vivi): "Gli innamorati sono gli unici superstiti: vincono loro." **ok**
- Villaggio (nessun lupo e nessun Chupacabra): "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio." **ok**
- Concludi partita: chiede conferma ("Si, concludi" / "Annulla"), torna alla Home, localStorage azzerato per giocatori/log/notte; "Nuova Partita" riapre il mazzo con le carte precedenti e i giocatori con ruoli azzerati. **ok** (vedi UX 1)

### S7 - Offline (build di produzione, service worker)
SW attivo dopo il primo caricamento; con rete spenta ricarica ok, Home, Nuova Partita (57 icone, 0 rotte), galleria Mazzo (53 immagini, 0 rotte) e Sfoglia il mazzo funzionano. Pagina "Scarica offline" con istruzioni iOS/Android chiare. **ok**

### S8 - Passi per notte (numero di tap da inizio notte ad alba)
| Partita/notte | Passi | Tap totali (azioni incluse) | Note |
|---|---|---|---|
| P1 N1 | 13 | 34 | assegnazione + scelte |
| P1 N2 | 7 | 13 | Veggente morto: passo di copertura |
| P1 N3 | 7 | 8 | |
| P2 N1 | 14 | ~40 | 8 ruoli con scelta |
| P2 N2 / N3 / N4 | 6 | 12 / 11 / 6 | N4: 5 passi su 6 senza scelta |
| P3 N2 (notte maledetta) | 3 | 6 | |
| P3 N3 | 7 | 12 | |
| Fine partita (fixture, N5) | 6 | 5-6 | 4-5 passi "Chiama comunque X" / "Potere gia' utilizzato" |

Nelle ultime notti la maggior parte dei passi e' di sola copertura (Cartomante/Veggente/Strega/Branco morti, Guaritore con potere gia' usato): e' voluto (bluff) e il promemoria e' disattivabile, ma 5 tap su 6 senza scelta e' lungo; proposta in DUBBI D6.

## BUG CERTI

1. **Chupacabra: dopo un refresh nel passo la caccia gia' registrata non si vede piu' e riscegliendo un altro bersaglio si uccidono due lupi.** Gravita' media.
   Passi: P2 notte 2, passo Chupacabra, scegliere Anna (lupo): Anna muore subito (applicato nello stato); ricaricare la pagina: nessuna chip premuta, nessun avviso, nessun messaggio; scegliere Carla (Capobranco): all'alba "Anna, Carla" morti entrambe (poi Cucciolo/Branco ridotto a 1). Non succede senza refresh (la seconda scelta annulla la prima) e non succede per Branco/Strega/Guaritore, che dopo refresh mostrano "gia' sbranato / gia' utilizzata".
   Causa probabile: `src/features/notte/azioni/AzioneChupacabra.jsx:16-18` (`target`, `colpito` in `useState` locale persi al refresh) e `confermaScelta` `:54-58` (`if (target && colpito) annullaColpo(...)` non scatta con `target` nullo). Proposta: dopo il reload, se `usiNotte` contiene gia' 'chupacabra-caccia' mostrare "La caccia di questa notte e' gia' stata fatta" come nel Branco, oppure ricostruire `target` dal morto con `mortoDa:'chupacabra'` del round.

2. **Istruzione di Giocatori con asterischi letterali.** Gravita' bassa (testo).
   Passi: Nuova Partita -> Avanti: "Aggiungi i giocatori *nell'ordine in cui siedono al tavolo*. Tieni premuta la ✕ ..." con gli asterischi visibili.
   Causa: `src/features/players/PlayerTracker.jsx:52` (testo grezzo, non passa da `TestoFormattato`). Proposta: rendere con il formattatore o togliere gli asterischi.

3. **Avviso conteggio lupi nel Mazzo conta il Borgomastro come giocatore.** Gravita' bassa.
   Passi: mazzo di 19 ruoli + Borgomastro: "Pochi lupi mannari per 20 giocatori" mentre la schermata Giocatori chiede 19 ("esclusi il Borgomastro").
   Causa: `src/data/validaMazzo.js:27-29` usa `ruoli.length` (carte) senza togliere Borgomastro/Fantasma Onnisciente (cfr. `src/App.jsx:72-76`).

4. **Diario / Impostazioni: la scheda attiva non e' distinguibile.** Gravita' bassa (UX).
   Passi: ingranaggio -> "Impostazioni partita" e "Diario" hanno lo stesso aspetto (bianco/bianco) in entrambi gli stati; solo `aria-pressed` cambia. Verificato con computed style (`rgb(255,255,255)` per entrambe). Proposta: stile `aria-pressed=true` (sfondo `--accent`).

## DUBBI (con proposta)

D1. **Boia che giustizia il protetto del Cavaliere: il Cavaliere si immola e il protetto sopravvive** (P2 giorno 1: "Marta ... giustizia Fabio, che pero' sopravvive. Il Cavaliere Hugo si e' immolato"). Regola (roles.js, Cavaliere): "Se questa persona viene sbranata di notte il Cavaliere muore al suo posto; se invece viene messa al rogo di giorno il Cavaliere rivela la propria carta immolandosi". Il Boia ("giustiziare una persona al proprio grido") non e' ne' notte ne' rogo; in matrice la coppia Boia x Cavaliere era descritta come "il Cavaliere si immola ma non salva". Nel codice la protezione vale per ogni "colpo" (`sopravvive`, `EventiSpeciali.jsx:156-160`, vale anche per Scemo, unzione, Alchimista). Proposta: decidere; se la lettura e' "solo notte e rogo", escludere i colpi di giorno da `cavalieriDi`.

D2. **Criceto immune anche alla Strega e al Chupacabra.** Regola (roles.js, Criceto): "non puo' essere ucciso da loro [i lupi] di notte". L'app avvisa "Il Criceto Malvagio non puo' morire di notte: ... nessun effetto" per pozione mortale e caccia del Chupacabra. Conseguenza: in una partita con Criceto e Chupacabra senza lupi, il Criceto e' inattaccabile di notte. Gia' in matrice come "Criceto x Strega"; qui confermato anche col Chupacabra. Proposta: scrivere la decisione (immunita' totale) nel testo del ruolo.

D3. **Cavaliere resuscitato non ha piu' un protetto** (legame azzerato alla resurrezione, nessun passo per sceglierne un altro; poi al rogo del vecchio protetto non si immola). Regola: "La prima notte sceglie una persona". Proposta: lasciare e dichiararlo, oppure far riscegliere al passo Cavaliere della notte della resurrezione.

D4. **Apprendista che eredita il Boia ma il potere risulta gia' usato** (`poteriUsati:['boia-giustizia']` copiato dal maestro). Coerente con "una volta per partita" (come l'eredita' dei poteri dell'Addolorata, appendice E) ma non e' scritto nell'avviso "L'Apprendista X ha ereditato il suo ruolo". Proposta: aggiungere "(potere gia' usato)" nell'avviso.

D5. **Cartomante/Medium su un giocatore ignoto: le chip non comprendono Alchimista, Scemo, Boia, Innocente (`RUOLI_NON_CARTA_SEGRETA`)**, quindi se il bersaglio e' davvero lo Scemo il narratore puo' solo scegliere "Villico" (e il giocatore diventa Villico per sempre, perdendo l'evento Scemo) oppure non scegliere nulla e premere Avanti. Provato: Avanti senza scelta e' ammesso e lascia il giocatore "?". Proposta: avviso "se e' lo Scemo/Alchimista/... non registrarlo, premi Avanti" oppure includere queste carte nella lista solo per la Cartomante.

D6. **Notti finali con quasi tutti passi di copertura** (vedi S8). Proposta: opzione per raggruppare in un unico passo "Chiama comunque: Sara, Paolo, Olga, Rita" quando piu' di 2 passi consecutivi non hanno azioni.

D7. **Chupacabra sbranato dai lupi la stessa notte non caccia** (P1 notte 3: lupi su Paolo, passo Chupacabra "Chiama comunque Paolo..."). Il branco agisce prima del Chupacabra (ordine libretto) e le morti sono applicate subito. Regola Chupacabra: "ogni notte si sveglia e va a caccia". Le azioni notturne dovrebbero essere simultanee? Proposta: confermare; altrimenti far agire il Chupacabra anche se sbranato nella stessa notte.

D8. **Browser Back / tasto indietro del telefono esce dalla app** (nessuna history interna: dopo `goBack()` si lascia la pagina). Lo stato e' persistito, quindi niente si perde, ma su Android il tasto Indietro a meta' partita chiude la PWA. Proposta: documentare o gestire `popstate` con una conferma.

## UX (non bug di regolamento)
1. "Sì, concludi" e "Annulla" nel popup Concludi sono due pulsanti rossi identici, impilati con ~0 px di spazio (`f1-c.png`): rischio di tap sbagliato su una azione distruttiva. Anche "Concludi partita" e "Vai al voto" (stesso stile) sono adiacenti: noto dai batch precedenti, ancora non separato.
2. Sotto il banner di vittoria resta l'avviso "Il villaggio deve eleggere un Borgomastro" (es. innamorati, Chupacabra, Criceto vincitore) e "Vai al voto": rumore a partita finita.
3. Schermata Chupacabra della prima notte: la chip-lista "Chi ha questa carta?" e quella "Il Chupacabra caccia" sono identiche e una sotto l'altra; con 19 giocatori l'ultima riga di chip finisce sotto la barra fissa "È giorno nel villaggio" (serve scorrere) (`g2n1-last.png`).
4. Spareggio: le chip dei pari merito non hanno titolo ("Chi mettere al rogo?"); solo dopo il tap compare "Dichiara morte sul rogo" (`a3-es.png`).
5. Nel Mazzo il Borgomastro resta nell'elenco delle carte disponibili anche dopo averlo scelto (le altre carte uniche spariscono) e un secondo tap non fa nulla senza feedback.
6. Frasi: "Seleziona 1 giocatore in più" (in più di cosa?), "esclusi il Borgomastro, che non sono giocatori in più" (singolare/plurale), "si e' rivelato/a", "e' stato/a eletto/a Borgomastro", "Si rivela: è L'Antico" (L maiuscola dentro la frase).
7. Target piccoli: pulsante chiusura Eventi speciali 36x36, "← Torna alla Home / ai giocatori / al mazzo" 36 px di altezza, campo nome giocatore 42 px; tutto il resto >= 44 px.
8. L'esito del voto mostra "L'Apprendista X erediterà il suo ruolo" anche quando il designato potrebbe essere l'Antico alla prima vita (non muore): avviso prematuro.
9. Diario: la morte per caccia del Chupacabra e per pozione mortale compare come "e' morto/a di notte" senza causa; manca l'uso della Strega e le indagini (gia' segnalato in batch c per la Strega).

## NON COPERTO
- Ladro, Addolorata, Mimo, Guardie e Medium (gia' coperti da altri batch) non inclusi nei mazzi.
- Vittoria "Pifferaio + lupi nello stesso istante" e vittoria multipla Chupacabra+Mimo non ripetute (gia' in batch c).
- Sacerdote x Veggente/Cartomante su un innamorato indagato; Cavaliere x Cartomante; Alchimista x Veggente (aura dopo l'esplosione); Guaritore x Strega (resurrezione e pozione vitale sullo stesso bersaglio nella stessa notte).
- Capobranco che sceglie un fratello come vittima; Capobranco con Mimo.
- Doppio voto del Borgomastro nel ballottaggio (solo promemoria, noto).
- Riordino con touch reale (provato solo con mouse).
- Installazione PWA vera su telefono (provati solo SW e uso offline in Chromium).

## Coppie valutate (JSON-friendly)
```json
[
  "apprendista x guaritore: si, ok (eredita prima dell'alba)",
  "apprendista x boia: si, dubbio potere gia' usato ereditato",
  "apprendista x lantico: si, ok (nessuna eredita' alla prima vita)",
  "apprendista x pifferaio: parziale, ok",
  "apprendista x scemo-del-villaggio: parziale, ok",
  "boia x sacerdote: si, ok (crepacuore)",
  "boia x cavaliere: si, dubbio il Cavaliere si immola per il Boia",
  "boia x apprendista: si, ok",
  "boia x scemo-del-villaggio: parziale, ok",
  "borgomastro x sacerdote: si, ok (Borgomastro innamorato muore, partner crepacuore, nuova elezione)",
  "borgomastro x guaritore: si, ok",
  "borgomastro x lantico: parziale, ok",
  "borgomastro x apprendista: parziale, ok",
  "borgomastro x pifferaio: si, ok (Borgomastro morto per crepacuore, Pifferaio resuscitato)",
  "borgomastro x cavaliere: parziale, ok",
  "borgomastro x chupacabra: parziale, ok",
  "borgomastro x criceto-malvagio: parziale, ok (Borgomastro ucciso e banner Criceto)",
  "alchimista x lupo-mannaro: si, ok (trascina lupo e ultimo lupo)",
  "alchimista x lupo-mannaro-capobranco: si, ok",
  "alchimista x chupacabra: parziale, ok",
  "alchimista x cavaliere: parziale, ok",
  "alchimista x veggente: no",
  "scemo-del-villaggio x guaritore: parziale, ok",
  "scemo-del-villaggio x pifferaio: si, ok (Scemo ipnotizzato morto)",
  "scemo-del-villaggio x cartomante: si, dubbio chip senza Scemo",
  "scemo-del-villaggio x lupo-mannaro: parziale, ok",
  "scemo-del-villaggio x chupacabra: parziale, ok",
  "veggente x lantico: si, ok (aura benevola)",
  "veggente x lupo-mannaro-capobranco: si, ok (aura malvagia)",
  "veggente x criceto-malvagio: si, ok (aura benevola)",
  "veggente x pifferaio: parziale, ok",
  "veggente x mezzosangue: parziale, ok",
  "cartomante x lupo-mannaro-capobranco: si, ok (mostra la carta)",
  "cartomante x mezzosangue: si, ok",
  "cartomante x lantico: si, ok (ex Antico mostrato come Villico)",
  "cartomante x chupacabra: parziale, ok",
  "cartomante x criceto-malvagio: parziale, ok",
  "cartomante x strega: parziale, ok",
  "guaritore x pifferaio: si, ok (resuscitato, ipnotizzati invariati)",
  "guaritore x cavaliere: si, dubbio legame azzerato alla resurrezione",
  "guaritore x criceto-malvagio: parziale, ok",
  "guaritore x lupo-mannaro: parziale, ok",
  "guaritore x strega: parziale, ok",
  "strega x criceto-malvagio: si, dubbio immunita' totale",
  "strega x cavaliere: si, ok",
  "strega x lantico: si, ok (vitale + Cavaliere sullo stesso bersaglio)",
  "strega x mezzosangue: si, ok",
  "chupacabra x criceto-malvagio: si, dubbio immune anche al Chupacabra",
  "chupacabra x lupo-mannaro: si, bug 1 (refresh nel passo, doppia uccisione)",
  "chupacabra x lupo-mannaro-capobranco: si, bug 1",
  "chupacabra x cucciolo-di-lupo-mannaro: si, ok (diventa adulto)",
  "chupacabra x pifferaio: si, ok (ipnotizzato, vittoria Pifferaio)",
  "chupacabra x lupo-mannaro: si, dubbio sbranato dal branco prima di cacciare",
  "pifferaio x lantico: parziale, ok (notte maledetta, Pifferaio e lupi agiscono)",
  "pifferaio x mezzosangue: si, ok (ipnotizzato che diventa lupo resta ipnotizzato)",
  "pifferaio x lupo-mannaro-capobranco: si, ok",
  "pifferaio x cucciolo-di-lupo-mannaro: si, ok",
  "lantico x mezzosangue: parziale, ok",
  "lantico x lupo-mannaro-capobranco: parziale, ok",
  "criceto-malvagio x lantico: no",
  "criceto-malvagio x mezzosangue: parziale, ok",
  "criceto-malvagio x cucciolo-di-lupo-mannaro: no",
  "mezzosangue x lupo-mannaro-capobranco: parziale, ok",
  "mezzosangue x cucciolo-di-lupo-mannaro: parziale, ok",
  "sacerdote x lupo-mannaro: si, ok (vittoria innamorati con lupi morti)",
  "sacerdote x cartomante: parziale, ok",
  "sacerdote x veggente: parziale, ok",
  "cavaliere x lupo-mannaro-capobranco: parziale, ok",
  "cavaliere x guaritore: si, dubbio legame azzerato"
]
```

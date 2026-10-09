# Batch partite 2026-10-09 (g): verifica in browser delle correzioni di b35d5fc (e precedenti)

Chromium reale (Playwright, 390x844, dev server porta 5581, fermato a fine lavoro). Nessuna modifica a `src/` ne' ai documenti esistenti. Script in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad/g` (`a*.mjs` refresh, `b*` Cavaliere, `c1` Chupacabra, `d*` Progenitore, `e*` carte proponibili, `f*` Diario, `g*`/`h1` UX). Dove indicato ho pre-caricato localStorage (notte 2 con ruoli assegnati/morti); i passi oggetto del test sono giocati dalla UI. Console: nessun errore ne' warning; nessun overflow orizzontale su nessuna schermata provata.

## Esiti per tema

### (a) Refresh a meta' passo
- Chupacabra: selezione lupo / non lupo, refresh, cambio bersaglio, deseleziona: la chip resta premuta, un solo morto all'alba (mai due). **ok**. Vedi DUBBIO 1 (avviso perso al refresh).
- Guaritore (anche morto, anche su se stesso): refresh, cambio G07->G06: all'alba solo G06 resuscitato. **ok**
- Sciacallo (morto, su G07 poi su se' stesso dopo refresh): all'alba solo lo Sciacallo e' resuscitato, G07 resta morto. **ok**
- Strega (mortale e vitale, refresh e cambio): un solo morto dalla Strega, la pozione vitale si sposta; il branco dopo refresh mostra ancora la chip premuta. **ok**
- Inquisitore: risposta sì/no coerente dopo refresh, cambio bersaglio e deseleziona. **ok**
- Veggente accecato dal Polpo: selezionando il Polpo compare "Accecato dal Polpo Mannaro" e `accecato` sul Veggente; dopo refresh resta; cambiando bersaglio o deselezionando la condizione sparisce (verificata in localStorage) e l'aura successiva e' quella vera. **ok**

### (b) Ubriaco e Berserker protetti dal Cavaliere (notte 1 giocata dalla UI)
- Cavaliere su Ubriaco, branco morde l'Ubriaco: avviso di immolazione, muore solo il Cavaliere, notte 2 Branco senza "stordito". **ok**
- Cavaliere su Berserker, morso: muore solo il Cavaliere, nessun lupo muore. **ok**
- Controlli senza Cavaliere: Ubriaco morso -> "il branco sara' stordito", notte 2 "Il branco e' ancora stordito"; Berserker morso -> muore anche un lupo. **ok**

### (c) Chupacabra sbranato la stessa notte
Il passo Chupacabra c'e' ("G03 ☠️ e' stato colpito stanotte, ma caccia comunque"); caccia su lupo: all'alba muoiono entrambi (anche dopo refresh); su non lupo muore solo il Chupacabra; senza caccia idem. **ok**

### (d) Progenitore
Pulsante "Il Progenitore trasforma X" per vittima normale, protetta (Strega), Nano, Criceto: tutti diventano Lupo Mannaro (Criceto compreso), promemoria "Svegliane segretamente il giocatore e fagli riconoscere gli altri lupi" e "Sbrana normalmente" per tornare indietro; il toggle sopravvive al refresh. Mezzosangue non protetto: avviso di trasformazione e diventa Lupo; Mezzosangue protetto: nessun pulsante, resta Mezzosangue. **ok**. Vedi DUBBIO 2 (morso senza effetto dopo refresh).

### (e) Cartomante / Medium / Mimo con bersaglio ignoto
- Cartomante: chip = Alchimista, Boia, Fantasma Onnisciente, Innocente, L'Antico, Scemo, Suocera, Villico; con Borgomastro nel mazzo non compare; compaiono Mimo, Apprendista, Berserker, Ubriaco, Cucciolo ecc. se ancora assegnabili. **ok**
- Per ciascun ruolo assegnato cosi' (e per il Mimo che lo imita su un ignoto) l'evento dedicato (Boia giustizia, Innocente si rivela, Scemo sbaglia la rima al voto, Alchimista esplode all'esito, Suocera, Fantasma) offre solo il giocatore giusto (G05; col Mimo: Mimo e G05, due attori distinti), nessun doppione di ignoti. **ok**
- Mimo: chip = Alchimista, Boia, Cartomante, Fantasma, Innocente, Lupo Mannaro, Scemo, Suocera, Villico; Borgomastro e Mimo esclusi. Vedi DUBBIO 3 (Cartomante presente).

### (f) Diario
Scambio Addolorata ("scambia la carta con G07 (morto al rogo): ora e' Cavaliere e G07 ha la carta Addolorata" + "G09 eredita il legame: protegge G08", voce comparsa all'Avanti, sparisce con Indietro); Apprendista che eredita il Cavaliere ("eredita il ruolo ... / eredita il legame: protegge G08"); Cucciolo cresciuto ("G03 ha assunto il ruolo di Lupo Mannaro", una sola voce); Mimo senza carta ("diventa Villico"); Progenitore (una voce, niente "ha assunto il ruolo"); nessuna voce su protetto. Strega: voce della pozione vitale (decisione presa). **ok**. Vedi DUBBIO 4 (voce "unto").

### (g) UX
- Concludi partita: pulsante rosso come "Vai al voto"; conferma con "Sì, concludi" (rosso scuro, bianco) e "Annulla" (contorno), 44px di altezza; torna alla Home. **ok** (DUBBIO 5)
- Spareggio: titolo "Condanna" sopra le chip. **ok**
- Diario: la scheda attiva e' marcata (aria-selected) e il Diario si apre dal popup. **ok**
- Mazzo con salvataggio vecchio (`borgomastro:1`, `lupo-mannaro:5`, `villico:12`): il Borgomastro viene tolto dal salvataggio (quantita' riscritta senza), nessuna chip per Lupo (5) e Villico (12) ne' per le carte gia' al massimo. **ok**
- Promemoria: Bardo "Il Bardo ti mostra il suo gesto segreto.", Gallo idem, Mucca "Tutti i lupi mannari alzano il pollice." + "Lupi mannari: G01, G02, G03." (anche dopo l'assegnazione). **ok**
- Indietro del telefono (page.goBack()): Home esce (about:blank); galleria, libretto, offline tornano alla Home; Giocatori torna al Mazzo, Mazzo alla Home (selezioni conservate); notte, alba, giorno, rogo restano nella fase. **ok**. Vedi DUBBIO 6 (dialog).
- Messaggi "Nessun giocatore da scegliere." (Veggente, Inquisitore, Cortigiana, Chupacabra soli) e "Nessun defunto: chiamalo comunque." (Medium, Guaritore, Sciacallo senza morti). **ok**
- Tap target < 44px: ✕ del popup Diario/Impostazioni 36x36, checkbox 48x28, campo numerico durata timer 80x42, campo nome giocatore 225x42, scorrevole "Scorri velocemente il mazzo" 358x16. Le altre schermate (Home, galleria, libretto, Mazzo, notte, alba, voto, rogo, Eventi speciali) nessun elemento < 44px. **dubbio minore** (DUBBIO 7)

## BUG CERTI
Nessun bug certo riprodotto: tutte le correzioni verificate funzionano. Difetti minori in DUBBI.

## DUBBI
1. **Avviso del Chupacabra perso dopo refresh.** Passi: Chupacabra su un non lupo (G06) -> compare "G06 non e' un lupo: la caccia fallisce"; refresh: la chip resta premuta ma l'avviso sparisce (con un lupo non c'e' nulla da dire). Il registro non e' alterato. Proposta: derivare l'avviso dallo stato invece che dall'ultimo click (AzioneChupacabra.jsx).
2. **Branco: morso senza effetto dopo refresh.** Morso su vittima protetta/Nano/Criceto, refresh: il passo mostra solo "Il branco ha gia' sbranato una vittima questa notte." senza chip ne' avviso (AzioneBrancoLupi.jsx:165-167, `colpi` ricostruiti da stato che non cambia); si puo' correggere solo con Indietro (che funziona e ripristina le chip). Coerente con quanto gia' annotato in 09-f, ma qui il narratore perde anche il Progenitore/avviso. Proposta: tracciare il bersaglio anche se il morso e' nullo.
3. **Mimo: "Cartomante" tra le carte proponibili.** Il Mimo con bersaglio ignoto elenca anche Cartomante (AzioneMimo.jsx:9 esclude solo mimo e borgomastro), mentre per Cartomante/Medium la decisione la esclude. Il Mimo imita una carta altrui quindi potrebbe essere voluto; da confermare.
4. **Diario: "Alba: G014 e' stato unto dall'Untore."** La decisione "niente voci su protetto/unto" e' rispettata per le condizioni, ma l'annuncio dell'alba viene comunque registrato come voce di Diario. Da confermare se sia voluto.
5. **Dopo la vittoria** (alba con banner "vincono i Lupi") restano il banner "Il villaggio deve eleggere un Borgomastro", "Vai al voto" ed "Eventi speciali", e "Concludi partita" ha lo stesso stile primario di "Vai al voto": rumore a partita finita. Proposta: nascondere il banner del Borgomastro a partita finita e distinguere Concludi.
6. **Indietro del telefono con un dialog aperto** (overlay "Mostra carta", Eventi speciali, popup Diario): il tasto non chiude il dialog, resta aperto nella stessa fase. Coerente con "resta nella fase", ma ci si aspetterebbe che chiuda il dialog.
7. **Tap target** < 44px elencati sopra (✕ 36x36 del popup, checkbox, campi di testo/numero, slider della galleria).
8. Il banner "Il villaggio deve eleggere un Borgomastro" compare anche se il mazzo non contiene il Borgomastro (ora non e' piu' nell'elenco del Mazzo): coerente con la nuova scelta, ma verificare che sia l'intento.

## NON COPERTO
Medium su bersaglio ignoto defunto (solo elenco chip verificato sul Cartomante); Chupacabra con Cavaliere/Cortigiana; secondo uso del Progenitore; resurrezione dopo refresh in notte 3+; dark mode; Concludi su schermi in cui il banner di vittoria e' al rogo.

## Coppie valutate
```json
[
  "chupacabra x lupo-mannaro: si, ok (refresh, caccia dopo sbranamento, muoiono entrambi)",
  "chupacabra x strega: parziale, ok",
  "guaritore x strega: parziale, ok (refresh a meta' passo)",
  "guaritore x sciacallo-mannaro: si, ok (refresh, auto-resurrezione)",
  "sciacallo-mannaro x strega: parziale, ok",
  "inquisitore x polpo-mannaro: parziale, ok",
  "veggente x polpo-mannaro: si, ok (accecamento annullato al cambio bersaglio dopo refresh)",
  "veggente x inquisitore: parziale, ok",
  "cavaliere x ubriaco: si, ok (nessuno stordimento)",
  "cavaliere x berserker: si, ok (nessun lupo muore)",
  "ubriaco x lupo-mannaro: si, ok",
  "berserker x lupo-mannaro: si, ok",
  "lupo-mannaro-progenitore x nano: si, ok (trasforma)",
  "lupo-mannaro-progenitore x criceto-malvagio: si, ok (trasforma)",
  "lupo-mannaro-progenitore x mezzosangue: si, ok (protetto non trasformabile)",
  "lupo-mannaro-progenitore x strega: si, ok (vittima protetta trasformata)",
  "cartomante x alchimista: si, ok",
  "cartomante x boia: si, ok",
  "cartomante x scemo-del-villaggio: si, ok",
  "cartomante x innocente: si, ok",
  "cartomante x suocera: si, ok",
  "cartomante x fantasma-onnisciente: si, ok",
  "cartomante x mimo: si, ok",
  "cartomante x borgomastro: si, ok (non proposto)",
  "mimo x alchimista: si, ok",
  "mimo x boia: si, ok",
  "mimo x scemo-del-villaggio: si, ok",
  "mimo x innocente: si, ok",
  "mimo x suocera: si, ok",
  "mimo x fantasma-onnisciente: si, ok",
  "mimo x cartomante: si, dubbio (Cartomante imitabile)",
  "suocera x fantasma-onnisciente: si, ok (primo morto puo' avere entrambe)",
  "addolorata x cavaliere: si, ok (legame ereditato nel Diario)",
  "apprendista x cavaliere: si, ok (legame ereditato nel Diario)",
  "mimo x apprendista: parziale, ok",
  "cucciolo-di-lupo-mannaro x lupo-mannaro: si, ok (Diario)",
  "untore x addolorata: parziale, dubbio (voce 'unto' nel Diario)",
  "bardo x gallo-mannaro: parziale, ok (promemoria)",
  "mucca-mannara x lupo-mannaro-capobranco: si, ok (elenco lupi)"
]
```

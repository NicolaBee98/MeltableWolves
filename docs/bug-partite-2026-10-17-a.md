# Verifica finale in browser del commit a55b561 (2026-10-17, a)

Chromium reale (Playwright, 390x844, dev server porta 5661, codice a a55b561). Nessuna modifica a `src/` ne' ai docs esistenti. Partite giocate dalla UI (assegnazione, notti, alba, voto, rogo, Eventi speciali, Diario); localStorage usato solo per ripartire da checkpoint (salvati dopo passi giocati dalla UI) e, in due punti dichiarati sotto, per assegnare un ruolo. Refresh e Indietro provati nei punti critici. Console: nessun errore/warning in nessuno scenario; nessun overflow orizzontale sulle schermate controllate (Branco stordito). Script e checkpoint in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad/f17`.

## Esiti per tema

### 1. Spilungone rivelato: ok
- Sacerdote unisce Spilungone e G04. Giorno 1: "Si rivela: è lo Spilungone" + Conferma -> "La notte cala senza vittime", Diario "G03 si è rivelato/a: è Spilungone". Giorni 2 e 3: l'esito mostra gia' "Lo Spilungone si rivela e non muore durante il rogo." e il solo "Dichiara morte sul rogo" (nessuna nuova conferma/scelta ruolo), poi "G03 rivela la propria carta ... La notte cala senza vittime". Dopo refresh (sia prima sia dopo la dichiarazione) l'esito si ricostruisce identico. Il partner G04 resta vivo, nessuna riga "Morira' anche G04 (crepacuore)", nessuna condizione tolta.
- Morte per unzione (G03 unto dall'Untore, gia' rivelato): muore, unzione passa ai vicini, testo "G03 è morto/a per l'unzione: l'unzione passa ai due vicini vivi", nessun "non muore durante il rogo". Boia ("G04 si è rivelato/a: è il Boia e giustizia G03"): muore. Alchimista (rogo di G05 -> trascina G03): muore ("G03 è morto/a per l'esplosione dell'Alchimista"). Dopo refresh tutto coerente.
- Antico alla prima vita per unzione (ruolo assegnato con patch a localStorage, non via UI): "G04 doveva morire per l'unzione ma sopravvive ... L'Antico sopravvive (prima vita) ma il villaggio è maledetto", testo invariato.

### 2. Cucciolo resuscitato: ok
- Cucciolo bruciato al giorno 1 (vendetta innescata), notte 2 il Guaritore lo resuscita, il branco ne sbrana una sola: all'alba "G01 è stato resuscitato.", `ruoloSlug` lupo-mannaro con storia [cucciolo, lupo], Diario "Alba: G01 è stato/a resuscitato/a" + "G01 ha assunto il ruolo di Lupo Mannaro", `vendettaCucciolo` dei lupi azzerato: notte 3 un solo bersaglio, nessun avviso di vendetta. Stesso esito (anche dopo refresh) con lo Sciacallo Mannaro.
- Cartomante notte 3 sul resuscitato: "Mostra a Cartomante la carta: Cucciolo di Lupo Mannaro" (carta fisica originale, coerente con la decisione sul Cucciolo cresciuto).
- "Annulla morte" sul Cucciolo bruciato, nella stessa sessione: torna vivo come Cucciolo, `vendettaInnescata` e `vendettaCucciolo` ripuliti. Dopo un ricaricamento della pagina vedi DUBBIO 1.

### 3. Vendetta con l'Ubriaco, Bardo, Berserker: ok (un bug su Indietro, vedi BUG 1)
- Ubriaco sbranato N1; N2 branco stordito e la Strega uccide il Cucciolo: nessuna nota di vendetta persa in N2 (corretto, vendetta dalla notte dopo); N3 "vittima 1 di 2" -> "2 di 2", due morti all'alba (G07 e G08). Refresh a meta' passo (con un colpo dato) mantiene "vittima 2 di 2"; Indietro disfa entrambi i colpi (ripristino completo).
- Vendetta gia' attiva (Cucciolo bruciato giorno 1) e branco stordito in N2: "La vendetta del Cucciolo è andata persa: il branco era stordito." (anche dopo refresh), alba "Nessuno è morto", N3 un solo bersaglio e nessun avviso di vendetta.
- Bardo salta la notte 2 (dichiarato dopo il rogo del Cucciolo): N2 "non si svolge per i poteri del Bardo", `vendettaCucciolo` resta true, N3 "vittima 1 di 2".
- Cucciolo ucciso durante il passo Branco (Berserker sbranato, il lupo piu' vicino e' il Cucciolo): nella stessa notte il limite resta 1 (nessun "vittima 2 di 2"), morti Berserker + Cucciolo all'alba, `vendettaCucciolo: 1` (round della notte di morte), N2 "vittima 1 di 2". Indietro nel passo ripulisce marcatore e morti.

### 4. Avviso Fantasma: ok
Strega protegge la vittima del branco (alba "Nessuno è morto"), rogo dello Spilungone giorno 1: nessun avviso, Eventi speciali senza "Assegna il Fantasma". Giorno 2 con un morto notturno: compare "Assegna la carta del Fantasma Onnisciente al primo morto" e la voce nel menu; assegnazione al morto, Diario "G07 riceve la carta del Fantasma Onnisciente".

### 5. Apprendista erede da Mezzosangue lupo: ok
Mezzosangue sbranato N1 (diventa Lupo, annuncio all'alba), poi ucciso dalla Strega N2: all'alba "G03 si rivela: è l'Apprendista di G02 ed eredita il ruolo di Lupo Mannaro." + "Mostra a G03 chi sono i suoi compagni: G01." (il Mezzosangue morto e' escluso), uguale dopo refresh e nel Diario.

### 6. Regressioni: ok
- Cavaliere protegge l'Ubriaco sbranato: si immola, l'Ubriaco vive, nessuno stordimento in N2 (il branco puo' cacciare).
- Cucciolo ucciso dal rogo: vendetta in N2 (vedi tema 2/3). Berserker che uccide il Cucciolo: vedi tema 3.
- Cortigiana con cliente sbranato: avviso nel passo ("entrambi moriranno"), Diario "Il Cavaliere G03 si immola ... muore (colpito dal branco)" in N1 e "La Cortigiana G04 muore: il suo cliente G06 è stato sbranato." in N2, una sola voce.

## BUG CERTI
1. **"Indietro" bloccato nel passo Branco stordito quando la vendetta e' andata persa.** Passi: Ubriaco sbranato N1; giorno 1 rogo del Cucciolo (vendetta attiva); N2 Strega (qualsiasi) -> Avanti -> passo Branco: "branco ancora stordito" + "La vendetta ... è andata persa". Premere "Indietro" (abilitato): resta sul Branco, ripetuto 3 volte nessun effetto (si puo' solo proseguire; senza vendetta persa Indietro torna alla Strega). Causa probabile: `src/features/notte/azioni/AzioneBrancoLupi.jsx:170-174`, l'effetto su `[storditi]` riscrive `vendettaCucciolo:false` a ogni montaggio; `modificato` in `src/features/notte/NightSequencer.jsx:~255` risulta vero, `vaiIndietro` (~367) riapre il passo con `riapriDa(ingresso)` (ripristina `true`), il passo si rimonta e l'effetto lo azzera di nuovo. Proposta: non scrivere in questo effetto (la vendetta persa si puo' derivare in lettura: `vendettaAttivaIn` va ignorata se il branco e' stordito) oppure consumare il flag solo all'Avanti del passo.

## DUBBI
1. **"Annulla morte" dopo un ricaricamento lascia vendetta stale.** Cucciolo bruciato giorno 1, refresh, "Annulla morte" sul Cucciolo: tornato Cucciolo vivo ma con `vendettaInnescata` e `vendettaCucciolo: true` sui lupi (lo snapshot di `usePartita.annullaMorte` e' solo in memoria: ripiega su "semplice resurrezione", documentato nel commento di `src/state/usePartita.js:~157`). Effetti: N2 vendetta con Cucciolo vivo e promemoria errato "Morte di un lupo: il Cucciolo diventa Lupo Mannaro adulto." sul rogo ridichiarato (`eventiSpeciali.js:161-163`, per `vendettaInnescata` stale). Proposta: nel fallback senza snapshot ripulire anche `vendettaInnescata`/`vendettaCucciolo` se l'annullato e' un Cucciolo.
2. **Diario non registra i rogo inutile dello Spilungone gia' rivelato** (giorni 2-3: nessuna riga; solo "si è rivelato/a" una volta) e non registra la "vendetta persa": scelta forse voluta, per la ricostruzione della partita puo' mancare.
3. **Esito del rogo dopo morte dello Spilungone per unzione/Boia lo stesso giorno:** il riquadro in alto continua a dire "rivela la propria carta ... La notte cala senza vittime" mentre G03 compare tra i Morti. Solo estetico.
4. **Testo Fantasma:** "Il primo morto sul rogo riceve la carta" / avviso "al primo morto" anche quando il morto e' notturno (assegnabile per decisione): testo da neutralizzare ("al primo morto").
5. **Diario con Antico forzato via localStorage** ha mostrato due volte "G04 si è rivelato/a: è L'Antico, perde la prima vita e sopravvive": non riprodotto da gioco naturale (ruolo assegnato con patch), quindi non e' un bug certo.

## NON COPERTO
Spilungone con Cavaliere che si immola al rogo; Spilungone non ancora rivelato ucciso da Boia/unzione (ruolo ignoto); Indietro/refresh in ogni sottopasso della vendetta con Bardo (solo N2/N3 base); Sciacallo resuscita un Cucciolo con vendetta gia' consumata dal branco; Mimo-Cucciolo con vendetta; screenshot/contrasti (fuori perimetro).

## Coppie (formato JSON-friendly)
spilungone x sacerdote: si, rogo ripetuto g2-g3 senza crepacuore del partner innamorato, refresh ok
spilungone x untore: si, rivelato muore per unzione normalmente, testo senza "non muore durante il rogo"
spilungone x boia: si, rivelato giustiziato dal Boia, muore
spilungone x alchimista: si, esplosione di altro condannato lo trascina e muore
lantico x untore: parziale, prima vita per unzione ok (testo invariato) ma ruolo assegnato con patch
cucciolo-di-lupo-mannaro x guaritore: si, resuscitato diventa Lupo Mannaro adulto, vendetta pendente azzerata, annuncio e Diario coerenti
cucciolo-di-lupo-mannaro x sciacallo-mannaro: si, stesso esito del Guaritore
cucciolo-di-lupo-mannaro x cartomante: si, vede "Cucciolo di Lupo Mannaro" (carta fisica) sul resuscitato
cucciolo-di-lupo-mannaro x ubriaco: parziale, N+1 due morti ok, vendetta persa con nota ok, BUG: Indietro bloccato nel passo Branco stordito con vendetta persa
cucciolo-di-lupo-mannaro x strega: si, morte N con branco stordito -> N+1 vittime 2 di 2 e due morti all'alba
cucciolo-di-lupo-mannaro x bardo: si, la vendetta slitta alla notte dopo la notte saltata
cucciolo-di-lupo-mannaro x berserker: si, Cucciolo ucciso nel passo Branco: vendetta dalla notte dopo, non nella stessa
fantasma-onnisciente x spilungone: si, nessun avviso dopo rogo senza morti, avviso e voce Eventi speciali con un morto
fantasma-onnisciente x strega: si, notte senza morti per pozione vitale, nessun avviso
apprendista x mezzosangue: si, erede di un Mezzosangue lupo: promemoria compagni all'alba
ubriaco x cavaliere: si, Ubriaco protetto non sbranato, nessuno stordimento
cortigiana x cavaliere: si, Diario senza voci doppie

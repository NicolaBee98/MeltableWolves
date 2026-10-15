# Batch di partite di prova 2026-10-15 (c): coppie senza evidenza "si" (Cortigiana, Innocente, Alchimista, Berserker, Fattucchiera, Veggente/Veggente Mannaro, Gallo, Maga, Bardo, Chupacabra, Fantasma)

Chromium reale (Playwright, 390x844, dev server porta 5613, codice a 7543ddb), nessuna modifica a `src/` ne' ai docs esistenti. 11 scenari da 7-15 giocatori (circa 45 varianti ripartendo da checkpoint di localStorage), giocati dalla UI: assegnazione dei ruoli e azioni notturne della prima notte (le scelte compaiono nello stesso passo dell'assegnazione), branco, alba, voto, rogo, Eventi speciali, notti successive. I checkpoint servono solo per ripetere lo stesso passo con una scelta diversa (visita, morso, bersaglio). Refresh a meta' passo ad ogni variante (il passo e la scelta pendente tornano identici). Console: nessun errore/warning; nessun overflow orizzontale. Script in `/tmp/claude-1000/-home-nicola-personale-my-web-app/92cc28b2-a98d-40b9-9f6f-75ed2a552ed5/scratchpad/s`.

Nota di metodo: i ruoli senza passo di assegnazione (Innocente, Spilungone, Antico, Suocera, Scemo, Villico) restano "?" per l'app finche' non si rivelano; le coppie con questi ruoli sono contate solo se il ruolo e' stato davvero rivelato/assegnato, altrimenti "parziale".

## Scenario 1 - Cortigiana con Eremita, Cucciolo, Criceto, Progenitore, Medium, Sciacallo, Veggente, Ambasciatore, Bardo, Cavaliere, Lupo (12 giocatori)
- Notte 1: Cavaliere sceglie "Per chi sacrificarsi" la Cortigiana, la Cortigiana visita l'Eremita, il Veggente lo indaga, il branco morde varie vittime (snapshot al passo del branco, 12+ varianti `visita x morso`).
- Senza Cavaliere (legame tolto): visita Medium + morso Medium: muoiono entrambi (avviso "entrambi moriranno" corretto). Visita Eremita + morso Eremita: muoiono entrambi. Visita Veggente + morso Veggente: entrambi. Visita Ambasciatore + morso Ambasciatore: entrambi. Visita Cucciolo (gia' in una prima partita) / Progenitore / Lupo e morso altrove: la Cortigiana muore da sola (visita a un lupo). Visita Criceto + morso Criceto: "Il morso non ha effetto: il Criceto non puo' essere sbranato" e la Cortigiana muore comunque (decisione gia' presa). Visita Sciacallo Mannaro con morso altrove: la Cortigiana sopravvive (lo Sciacallo non e' un lupo del branco). Visita Bardo/Veggente senza morso: nessun effetto. **ok**
- Ambasciatore: all'alba "E' arrivato un messaggio dall'ambasciatore" quando il Veggente indaga un benevolo (anche con la Cortigiana morta). **ok**
- Bardo + Cortigiana: dopo il rogo "Il Bardo salta la notte" -> Conferma -> notte 2 "Questa notte non si svolge per i poteri del Bardo"; la visita della notte 1 non viene riportata. **ok**
- **DUBBIO 1** (Cavaliere x Cortigiana): con il Cavaliere legato alla Cortigiana, quando la Cortigiana sarebbe morta per la visita ai lupi (non e' "sbranata dal branco") il Cavaliere si immola comunque ("si e' immolato al posto della vittima", muore lui, la Cortigiana vive). Succede per tutte le cause (cliente morso, cliente Criceto immune, visita a un lupo). Il testo del Cavaliere dice "se questa persona viene sbranata di notte"; la morte per visita non e' uno sbranamento. Da decidere se il Cavaliere debba salvarla.

## Scenario 2 - Innocente, Inquisitore, Sacerdote, Sciacallo, Veggente Mannaro, Spilungone, Mezzosangue, Antico, Villico, Nano, Cavaliere, Capobranco, Nonna (13 giocatori)
- Sacerdote lega Innocente e Antico (entrambi "?"). Inquisitore interroga l'Innocente: "Rispondi: no (aura benevola)" (anche da "?"); la notte dopo "Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola". Veggente Mannaro sull'Innocente: "Aura benevola"; sul Mezzosangue trasformato in lupo: "Aura malvagia". **ok**
- Branco morde l'Innocente: il partner muore di crepacuore all'alba. Sciacallo resuscita l'Innocente: torna vivo, non piu' innamorato, il partner resta morto; poi "L'Innocente si rivela" lo propone (candidato unico tra i vivi senza ruolo). **ok**
- Elezione Borgomastro (Villico G13, protetto dal Cavaliere): al rogo del Borgomastro "Il Cavaliere G05 lo protegge: si immola al suo posto", il Borgomastro sopravvive. **ok**
- Spilungone favorito al rogo ("Si rivela: e' lo Spilungone"): la notte cala senza vittime, diventa "spilungone". **ok**
- Osservazione: un morto/partner con ruolo "?" (qui l'Antico) non puo' beneficiare della prima vita: il crepacuore lo uccide come un villico. E' coerente con il fatto che l'app non sa chi e' l'Antico finche' non lo si rivela, ma il narratore deve ricordarsene.

## Scenario 3 - Alchimista con Nano, Progenitore, Lupo, Eremita, 2 Guardie + Guardia Mannara, Ubriaco, Villico (10 giocatori)
- Alchimista al rogo ("Si rivela: e' l'Alchimista" -> "Chi trascina con se'"), 6 varianti da checkpoint: trascina il Nano (muore, il Nano di giorno e' mortale), il Progenitore (poi "Vivi: G04 | Morti: G03"), l'Eremita, una Guardia, la Guardia Mannara (individuata dallo stato: nessun problema, la notte dopo il branco e' normale), l'Ubriaco (nessuno stordimento). **ok**

## Scenario 4 - Berserker con Criceto, Guaritore, Guardia, Guardia Mannara, Lupo, Ubriaco (+ Suocera, Antico, Spilungone, Villico "?") (12 giocatori)
- Morso al Berserker: avviso "G08 (il lupo piu' vicino) morira' con lui": il lupo a distanza 5 muore, la Guardia Mannara a distanza minore NON e' scelta (non e' del branco), il Criceto adiacente neppure. Banner "vince il Villaggio" con la Guardia Mannara viva (decisione gia' presa: i mannari fuori branco non fanno numero). Il Guaritore resuscita il Berserker nella notte dopo: "G01 e' stato resuscitato", il lupo resta morto. **ok**

## Scenario 5 - Fattucchiera con Polpo, Scemo, Pifferaio, Criceto, Mucca, Untore, Lupo, Pastore, Ambasciatore, Guaritore, Suocera, Spilungone, Ubriaco (14 giocatori)
- Fattucchiera inibisce il Pifferaio nel passo di assegnazione: "Il potere e' inibito questa notte dalla Fattucchiera: nessuna azione disponibile". Con lo Scemo assegnato: "Non puo' inibire Scemo del Villaggio: agisce di giorno" (avviso). Polpo, Criceto, Pastore inibiti: nessun avviso, nessun effetto (passivi). **ok**
- Pastore accanto al lupo: "Si sentono dei belati". Untore unge un "?" (Spilungone): "G13 e' stato unto"; "Morte per unzione" -> G13 muore, unzione ai due vicini vivi saltando il morto (G12 e G01). Ubriaco sbranato: notte 2 "Il branco e' ancora stordito dall'alcol dell'Ubriaco". **ok**
- Nota: "Morte per unzione" e rogo di un "?" non chiedono il ruolo del morto: la Suocera/lo Spilungone morto per unzione restano "?".

## Scenario 6 - Veggente e Veggente Mannaro con Nano, Ubriaco, 2 Guardie, Apprendista, Bardo, Sciacallo, Mezzosangue, Strega, Capobranco, Lupo, Pastore, Scemo (15 giocatori)
- Checkpoint all'inizio della notte 2, 11 bersagli del Veggente e 8 del Veggente Mannaro: Capobranco e Lupo "Aura malvagia"; Nano, Ubriaco, Guardia, Apprendista, Bardo, Sciacallo, Mezzosangue (non ancora trasformato), Strega, Veggente Mannaro, Veggente: "Aura benevola" (Sciacallo/Mannari fuori branco benevoli: gia' noto). Nessuna differenza tra Veggente e Veggente Mannaro. **ok**

## Scenario 7 - Gallo con Apprendista (maestro Gallo), Maga, Ambasciatore, Nano, Polpo, Criceto, 2 Guardie + Guardia Mannara, Villico, Lupo, Veggente (13 giocatori)
- Notte 1: Maga trasforma il Nano, Veggente indaga il Polpo, branco sbrana il Gallo. All'alba: "G02 si rivela: e' l'Apprendista di G01 ed eredita il ruolo di Gallo Mannaro. Mostra a G02 il gesto segreto" (promemoria compagni); messaggio dell'Ambasciatore (aura benevola del Polpo). "Il Gallo Mannaro salta il giorno" (usato dall'erede) -> notte 2 diretta: il Nano non e' piu' trasformato, il Veggente resta accecato dal Polpo. **ok**

## Scenario 8 - Maga con Sciacallo, Ubriaco, Figlia dei Lupi, Nonna, Lupo, Villico (7 giocatori)
- Maga trasforma lo Sciacallo (notte 1) e poi la Figlia (notte 2): lo Sciacallo trasformato resuscita comunque l'Ubriaco. L'Ubriaco sbranato in notte 1: notte 2 il branco (Lupo + Nonna) "ancora stordito". Maga sbranata in notte 3: "G04 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro". Vittoria dei lupi corretta (Sciacallo e Ubriaco contano come resto). **ok**

## Scenario 9 - Bardo con Pifferaio, Strega, Suocera, Ubriaco, Eremita, Nano, Progenitore, Sciacallo, Lupo, Villico (11 giocatori)
- Pifferaio ipnotizza Eremita e Nano in notte 1; Ubriaco sbranato; rogo; "Il Bardo salta la notte". Notte 2 saltata (nessun potere di Strega/Sciacallo/Progenitore/Pifferaio); notte 3: Pifferaio ripropone solo i non ipnotizzati, Strega con entrambe le pozioni, Sciacallo/Progenitore invariati. **ok**
- **DUBBIO 2** (Bardo x Ubriaco): lo stordimento del branco dura solo la notte 2, saltata dal Bardo; la notte 3 il branco caccia normalmente. In pratica l'alcol dell'Ubriaco viene "sprecato" se la notte dopo e' quella del Bardo. Probabilmente accettabile (la notte dopo non si uccide comunque), ma da confermare.

## Scenario 10 - Chupacabra con Apprendista (maestro Chupacabra), Cartomante, Progenitore, Medium, Lupo, Villico, Fantasma (7 giocatori)
- Notte 1: Chupacabra caccia il Progenitore (muore, "lupo"), branco sbrana il Medium. Rogo del Chupacabra: "L'Apprendista G02 ha ereditato il suo ruolo", avviso Fantasma, "Assegna il Fantasma Onnisciente" -> il morto al rogo. Notte 2: Cartomante sul nuovo Chupacabra "Mostra la carta: Chupacabra"; Medium morto "chiama comunque"; il Chupacabra erede uccide l'ultimo lupo; nessun banner (il Chupacabra impedisce la vittoria del villaggio). **ok**
- **DUBBIO 3** (Cartomante x Fantasma, minore): per una carta ancora sconosciuta di un giocatore VIVO la Cartomante propone anche "Fantasma Onnisciente" (carta nel mazzo ma assegnabile solo a un morto). Probabilmente da escludere dalle proposte per i vivi.

## Scenario 11 - Fantasma con Pastore, Nano, Medium, Chupacabra, Lupo (+ Antico, Suocera, Scemo "?") (8 giocatori)
- Chupacabra su un non-lupo: "G02 non e' un lupo: la caccia del Chupacabra fallisce". Rogo del Nano / rogo del Pastore con "Assegna il Fantasma Onnisciente" a quel morto: corretto, nessun passo notturno per lui, notte 2 normale (Medium sbranato, Chupacabra uccide il lupo). **ok**

## Coppie valutate (JSON-friendly)
```json
[
  "cortigiana x eremita: si, ok",
  "cortigiana x cucciolo-di-lupo-mannaro: si, ok",
  "cortigiana x criceto-malvagio: si, ok (muore anche se il Criceto e' immune)",
  "cortigiana x lupo-mannaro-progenitore: si, ok (visita a un lupo)",
  "cortigiana x medium: si, ok",
  "cortigiana x sciacallo-mannaro: si, ok (visita senza morte: non e' un lupo del branco)",
  "cortigiana x veggente: si, ok",
  "ambasciatore x cortigiana: si, ok",
  "cavaliere x cortigiana: si, dubbio (il Cavaliere salva la Cortigiana morta per visita)",
  "bardo x cortigiana: si, ok",
  "innocente x inquisitore: si, ok",
  "innocente x veggente-mannaro: si, ok",
  "innocente x sacerdote: si, ok (crepacuore)",
  "innocente x sciacallo-mannaro: si, ok",
  "borgomastro x cavaliere: si, ok",
  "mezzosangue x veggente-mannaro: si, ok",
  "alchimista x nano: si, ok",
  "alchimista x lupo-mannaro-progenitore: si, ok",
  "alchimista x eremita: si, ok",
  "alchimista x guardia: si, ok",
  "alchimista x guardia-mannara: si, ok",
  "berserker x criceto-malvagio: si, ok",
  "berserker x guardia: si, ok (la Guardia Mannara non e' scelta come lupo piu' vicino)",
  "berserker x guaritore: si, ok",
  "berserker x ubriaco: parziale, ok",
  "fattucchiera x pifferaio: si, ok",
  "fattucchiera x scemo-del-villaggio: si, ok (avviso ruolo diurno)",
  "fattucchiera x polpo-mannaro: parziale, ok",
  "criceto-malvagio x fattucchiera: parziale, ok",
  "ubriaco x veggente: si, ok",
  "nano x veggente: si, ok",
  "guardia x veggente: si, ok",
  "apprendista x veggente: si, ok",
  "bardo x veggente: si, ok",
  "sciacallo-mannaro x veggente: si, ok",
  "strega x veggente-mannaro: si, ok",
  "nano x veggente-mannaro: si, ok",
  "apprendista x gallo-mannaro: si, ok (erede del Gallo)",
  "ambasciatore x gallo-mannaro: si, ok",
  "gallo-mannaro x nano: si, ok (il Gallo toglie il maiale)",
  "gallo-mannaro x maga: si, ok",
  "gallo-mannaro x polpo-mannaro: si, ok (accecamento mantenuto)",
  "criceto-malvagio x gallo-mannaro: parziale, ok",
  "gallo-mannaro x guardia-mannara: parziale, ok",
  "gallo-mannaro x villico: parziale, ok",
  "maga x sciacallo-mannaro: si, ok",
  "figlia-dei-lupi x maga: si, ok",
  "nonna x ubriaco: si, ok (stordita insieme al branco)",
  "bardo x ubriaco: si, dubbio (stordimento sprecato dalla notte saltata)",
  "bardo x pifferaio: si, ok",
  "bardo x eremita: si, ok",
  "bardo x nano: si, ok",
  "bardo x strega: si, ok",
  "bardo x sciacallo-mannaro: si, ok",
  "bardo x lupo-mannaro-progenitore: si, ok",
  "cartomante x chupacabra: si, dubbio (propone il Fantasma per un vivo)",
  "chupacabra x lupo-mannaro-progenitore: si, ok",
  "apprendista x chupacabra: si, ok",
  "chupacabra x fantasma-onnisciente: si, ok",
  "chupacabra x medium: parziale, ok",
  "fantasma-onnisciente x nano: si, ok",
  "fantasma-onnisciente x pastore: si, ok"
]
```

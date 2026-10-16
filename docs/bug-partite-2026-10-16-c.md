# Coppie rimaste (gruppo c, 115 coppie) in browser (2026-10-16, c)

Chromium reale (Playwright, 390x844, dev server porta 5642, codice a aee5f52). Nessuna modifica a `src/` né ai docs esistenti. Partite giocate dalla UI; localStorage usato solo per partire da setup banali (numero giocatori, mazzo, ruolo dei "?" come Villico/Suocera/Spilungone... tramite checkpoint) e per ripristinare checkpoint a metà partita. Un mazzo per gruppo di 4-6 ruoli; gli scenari sono scritti man mano. File di lavoro in scratchpad, report aggiornato dopo ogni gruppo.

## Scenari

### G1 - Mucca, Maga, Strega, Guardia x2, Suocera (setRole), Capobranco + Lupo, Villico x2 (10 giocatori)
Notte 1: Maga sulla Mucca (alba "trasformato in maiale"), branco sbrana la Suocera (G08, ruolo "?" assegnato da checkpoint): evento "La Suocera si rivela" ok, Diario ok. Giorno 1: rogo di una Guardia. Notte 2: vitale sulla Guardia rimasta (morso del branco senza effetto), mortale sulla Mucca (muore). Notte 3 (Strega con pozioni azzerate da checkpoint): Maga trasforma la Strega, la Strega uccide un Villico, il branco sbrana la Guardia: alba "vincono i lupi" (Suocera non conta). Console pulita. **Esito: ok, nessun bug.**

### G2 - Lupo, Nonna, Gallo, Veggente, Berserker, Paladino, Villico x3 (9 giocatori)
Notte 1: Veggente sul Gallo ("Aura benevola", dubbio già noto), branco sbrana un Villico. Notte 2: Paladino sul Veggente/Villico, Veggente sul Berserker o sulla Nonna, il branco morde il protetto ("Il morso non ha effetto su G..: è protetto/a"; alba "Nessuno è morto"). Variante: Berserker sbranato, avviso "G02 (il lupo più vicino) morirà con lui", alba con due morti. Eventi speciali "Il Gallo salta il giorno" con la Nonna viva: si passa alla notte 2 senza giorno. Rogo del Gallo. Note: il Diario non riporta la protezione del Paladino (solo la Strega ha le pozioni nel Diario, per decisione): non è un bug. Console pulita. **Esito: ok.**

### G3 - 2 Lupi, Veggente Mannaro, Untore, Addolorata, Cortigiana, Berserker, Guaritore, Nano, Paladino, Scemo ("?") (11 giocatori)
Partito dallo stesso checkpoint dopo la notte 1 (morso sul Nano senza effetto) e giocato in 5 rami: (A) Scemo muore di rima in giorno 1 + rogo dell'Untore, Addolorata diventa Untore e unge il Berserker, Cortigiana visita il VM, Guaritore resuscita l'ex Untore, Berserker muore per unzione senza uccidere lupi; (B) rogo del "?" Scemo: l'Addolorata prende la carta Scemo, che diventa candidata di rima/unzione, Berserker sbranato con Cortigiana cliente e due lupi equidistanti (scelta del narratore); (C) rogo Cortigiana con scambio e visita a un lupo, Paladino ucciso e poi resuscitato che protegge; (D) Nano al rogo e resuscitato, Cortigiana cliente del "?" sbranato; (E) VM al rogo e resuscitato, indaga la notte dopo. Console pulita. **Esito: ok, nessun bug.** Osservazione minore (non è un bug nuovo): la condizione "unto" resta sul morto per unzione ("G07 berserker(X)[unto]"), irrilevante per l'esito.

### G4 - Lupo, Guardia x2 + Guardia Mannara, Mucca, Sciacallo, Cavaliere, Paladino, Polpo, Cartomante, Villico (11 giocatori)
Assegnazione dalla UI (il passo Guardie con tre giocatori assegna da solo la GM; il Cavaliere sceglie il protetto nello stesso passo). Rami: Cavaliere->Polpo: rogo del Polpo (immolazione), Sciacallo resuscita il Cavaliere (legame azzerato, dubbio già noto), rogo del Polpo di nuovo senza immolazione; Paladino che protegge Mucca/Polpo: "Il morso non ha effetto"; Cartomante su Mucca (anche dopo resurrezione) e Paladino; Cavaliere->GM (legame spostato via checkpoint) con rogo della GM, poi la GM resuscitata dallo Sciacallo; Mucca al rogo e resuscitata. Il passo Mucca elenca solo i lupi del branco. Console pulita. **Esito: ok, nessun bug nuovo.**

### G5 - 2 Lupi, Eremita, Mucca, Medium, Figlia dei Lupi, Apprendista, Fantasma Onnisciente (nel mazzo), Villico x2 (9 giocatori)
Notte 1: Apprendista maestro=Mucca, Figlia genitore=Eremita, il branco sbrana un "?" (Villico). Rogo della Mucca: l'Apprendista eredita, "Assegna il Fantasma" proposto (candidati i due morti), Fantasma alla Mucca; notte 2 il Medium interroga la Mucca/Fantasma ("Mucca Mannara") e il Villico ("?": "Villico"); il branco sbrana l'Eremita e la Figlia diventa lupa (alba, Diario), banner lupi al pari; notte 3 il Medium vede "Eremita". Varianti da checkpoint (legame spostato): Apprendista->Eremita (rogo Eremita, Apprendista erede + Figlia lupa insieme), Figlia->Mucca (rogo Mucca). Il Fantasma non ha passo notturno e la Mucca non ha passo dopo la prima notte. Console pulita. **Esito: ok, nessun bug.**

### G6 - Lupo, Capobranco, Polpo, Addolorata, Gallo, Scemo ("?"), Innocente ("?"), Villico x2 (9 giocatori)
Notte 1: il branco sbrana un "?"; alba 1: "L'Innocente si rivela" (candidati i "?" vivi) e "Il Gallo salta il giorno" (notte 2 con l'Addolorata "Nessuna vittima al rogo"); ramo B: Scemo sbaglia la rima con il Polpo vivo, rogo del Polpo; ramo C: rogo del Capobranco, l'Addolorata scambia e diventa Capobranco (promemoria compagni, branco "Vivi: G01, G04"), il branco sbrana il Polpo. Console pulita. **Esito: ok, nessun bug.**

### G7 - Lupo, Capobranco, Fattucchiera, Berserker, Pastore, Spilungone ("?"), Boia ("?"), Villico x2 (9 giocatori)
Rami dallo stesso checkpoint dopo la notte 1: (A) rogo del "?" favorito = Spilungone ("Si rivela: è lo Spilungone", notte senza vittime), notte 2 Fattucchiera sullo Spilungone e branco lo sbrana; (B) evento "Il Boia giustizia" sul Berserker (nessun lupo muore); (C) rogo della Fattucchiera, Berserker sbranato (muore il lupo più vicino), Pastore con un lupo vicino "belati", il Boia giustizia l'ultimo lupo: vittoria del Villaggio; (D) Fattucchiera sul Capobranco con Berserker sbranato, poi sul "?" Villico. Console pulita. **Esito: ok.** Nota (non bug): la Fattucchiera su Spilungone/"?" non mostra avviso (lo Spilungone non è in NON_INIBIBILI, ma non ha poteri notturni: l'inibizione è senza effetto).

### G8 - Lupo, Nonna, Guardia x2 + Guardia Mannara, Mezzosangue, Addolorata, Fantasma (nel mazzo), Spilungone ("?"), Innocente ("?"), Villico (10 giocatori)
Dal checkpoint al passo Branco della notte 1: (A) Mezzosangue sbranato (diventa lupo), Innocente si rivela, rogo della Nonna, l'Addolorata diventa Nonna, l'Innocente sbranato riceve il Fantasma; (B) rogo del Mezzosangue + Fantasma, l'Addolorata prende la carta e viene morsa (diventa lupa); (C) Spilungone favorito al rogo e sbranato in notte 2 dal branco con la Nonna. Console pulita. **Esito: ok.** Osservazione minore: dopo "Si rivela: è lo Spilungone" (rogo senza vittime) compare comunque "Assegna la carta del Fantasma al primo morto" se c'è un morto notturno: coerente con la decisione (il narratore può assegnarlo anche ai morti notturni), ma l'avviso parla di "primo morto" e il rogo non ha ucciso nessuno.

### G9 - Lupo, Progenitore, Inquisitore, Untore, Maga, Apprendista, Sacerdote, Pastore, Villico x2 (10 giocatori)
Notte 1: Apprendista maestro=Untore, Sacerdote unisce Apprendista e Villico, Maga trasforma il Progenitore che trasforma comunque la vittima. Rogo dell'Untore: l'Apprendista eredita. Notte 2: Maga sul Sacerdote, Inquisitore sulla Maga (perde il potere) o sull'ex Untore o sul Pastore, il branco morde il partner innamorato: crepacuore dell'Apprendista e belati del Pastore. Console pulita. **Esito: ok.**

### G10 - Lupo, Ambasciatore, Berserker, Strega, Chupacabra, Veggente, Alchimista ("?"), Scemo ("?"), Villico x2 (10 giocatori)
Notte 1: Veggente sul Berserker (alba: messaggio dell'Ambasciatore), Chupacabra su un non lupo (fallisce). Rami da alba 1: Alchimista al rogo trascina l'Ambasciatore (niente più messaggi), la Strega, o lo Scemo "?"; Scemo che sbaglia la rima in alba 1; Veggente sul Chupacabra ("Aura malvagia", nessun messaggio). Console pulita. **Esito: ok.**

**DUBBIO (UX minore, G10):** dopo che l'Alchimista ha trascinato l'ultimo "?" vivo, "Eventi speciali" offre ancora "Lo Scemo del Villaggio sbaglia la rima" ma la selezione è "Nessun giocatore da scegliere." (vicolo cieco, si chiude con Chiudi). Proposta: nascondere l'evento (e Boia/Innocente/Suocera analoghi) quando non ci sono "?" vivi candidati.

### G11 - 2 Lupi, Pastore, Criceto, Gallo, Veggente, Mezzosangue, Paladino, Chupacabra, Villico (10 giocatori)
Pastore tra un lupo e il Criceto. Notte 1: Paladino sul Pastore morso (nessun effetto), Chupacabra uccide il lupo vicino (belati dal lupo successivo). Alba 1: Gallo salta il giorno. Notte 2: Veggente sul Mezzosangue (benevola) o sul Pastore, il Mezzosangue morso diventa lupo. Notte 3: morso sul Criceto senza effetto, Chupacabra uccide l'ultimo lupo "vecchio", niente belati. Console pulita. **Esito: ok.**

### G12 - Lupo, Nonna, Antico (checkpoint), Innocente ("?"), Guaritore, Chupacabra, Borgomastro (nel mazzo), Inquisitore, Villico x2 (9 giocatori)
Notte 1: Chupacabra uccide il Lupo, il branco sbrana un Villico. Alba 1: Nonna eletta Borgomastro, Innocente rivelato; rogo dell'Antico (prima vita, maledizione): notte 2 solo Branco (Nonna) e Chupacabra, il Chupacabra uccide la Nonna Borgomastro; alba 2 nuova elezione (Inquisitore); notte 3 Inquisitore, Guaritore resuscita la Nonna, Chupacabra (nessun lupo vivo) uccide un abitante. Console pulita. **Esito: ok.**

### G13 - Lupo, Guardia x2 + Guardia Mannara, Apprendista, Criceto, Scemo ("?"), Ubriaco, Inquisitore, Cartomante (10 giocatori)
Due rami: (A) Ubriaco sbranato (avviso stordimento), Scemo di rima, rogo della GM (maestro dell'Apprendista), notte 2 Cartomante sull'ex Apprendista ("Guardia o Guardia Mannara?"), Inquisitore sul Criceto, branco stordito; (B) Cartomante e Inquisitore sull'Ubriaco vivo in notte 1, morso sul Criceto senza effetto, Scemo di rima, rogo dell'Ubriaco: il branco non è stordito. Console pulita. **Esito: ok.**

### G14 - Lupo, Veggente Mannaro, Paladino, Sacerdote, Eremita, Mezzosangue, Boia ("?"), Spilungone ("?"), Villico, Borgomastro e Fantasma (nel mazzo) (9 giocatori)
Notte 1: VM sull'Eremita ("Aura malvagia"), Sacerdote unisce due "?", branco morde il Mezzosangue. Alba 1: Eremita eletto Borgomastro, "Il Boia giustizia" sul VM (ramo: sul Paladino), Fantasma assegnato al giustiziato; rogo del "?" Spilungone (nessun crepacuore), notte 2 il branco sbrana lo Spilungone e muore anche il partner. Console pulita. **Esito: ok.**

### G15 - Cucciolo, Progenitore, Polpo, Strega, Guaritore, Maga, Medium, Untore, Pifferaio, Veggente, Innocente ("?"), Villico x2 (13 giocatori)
Notte 1: Maga sul Guaritore, Untore sul Medium, Pifferaio sul Veggente e sull'Innocente, Veggente sul Pifferaio, branco con Progenitore trasforma il Polpo. Rogo del Cucciolo, Innocente rivelato; notte 2: vendetta a due vittime (due Villici), Strega uccide l'Innocente, Guaritore (trasformato dalla Maga) resuscita il Cucciolo; rogo dell'Untore e notte 3 il Medium lo interroga. Il passo di "retromarcia" (Indietro) annulla prima la scelta del passo e poi torna indietro (comportamento noto). Console pulita. **Esito: ok.**

## BUG CERTI
Nessuno nuovo in questo gruppo (115 coppie, 15 mazzi, circa 45 rami giocati dalla UI). Console senza errori/warning e nessun overflow orizzontale (390 px) in tutti gli scenari controllati.

## DUBBI
1. **UX minore, evento senza candidati**: "Lo Scemo del Villaggio sbaglia la rima" (e per analogia Boia/Innocente/Suocera) resta in "Eventi speciali" anche quando tutti i "?" sono morti: la selezione mostra "Nessun giocatore da scegliere." (G10). Proposta: nascondere l'evento se non ci sono "?" vivi candidati.
2. **Testo del Fantasma**: "Assegna la carta del Fantasma Onnisciente al primo morto" resta visibile dopo "Si rivela: è lo Spilungone" (rogo senza vittime) se c'è già un morto notturno, e l'evento è proposto solo in Giorno (voto/esito), non in Alba (G8, G14). Coerente con la decisione (assegnabile anche ai morti notturni e ai giustiziati dal Boia), ma il testo parla di "primo morto sul rogo".
3. Già noti, rivisti: Gallo benevolo al Veggente (G2); Cavaliere resuscitato senza protetto (G4, `legame` azzerato).

## NON COPERTO
- Cartomante/Medium "Mostra carta" non cliccato (l'avanzamento funziona senza); non verificato il contenuto della schermata a tutto schermo.
- Diario scritto da salvataggi vecchi, dark mode, contrasto, tap target.
- Alcune situazioni "?" sono state completate dal checkpoint (Suocera, Antico) o con il legame di Cavaliere/Apprendista/Figlia spostato a mano nel checkpoint (G4, G5): il passo oggetto (rogo, immolazione, eredità) è giocato dalla UI, ma la voce Diario "sceglie di proteggere/seguire" spuria è un artefatto della modifica manuale.
- Più combinazioni tra tre ruoli (es. Fantasma + Apprendista + Figlia sulla stessa morte) sono state provate solo una volta.

## Coppie (JSON-friendly)
maga x mucca-mannara: si, G1: Maga trasforma la Mucca (notte 1, alba "G03 e' stato trasformato in maiale"), notte 2 la Strega la uccide: nessun passo notturno per la Mucca ne' interferenza, Diario ok
maga x strega: si, G1 notte 3: Maga trasforma la Strega e nella stessa notte la Strega (pozione mortale non spesa, checkpoint) uccide G10: la trasformazione non blocca i poteri notturni; Diario e alba ok
mucca-mannara x strega: si, G1 notte 2: pozione mortale della Strega sulla Mucca: muore, alba e Diario corretti
guardia x strega: si, G1 notte 2: pozione vitale sulla Guardia G07 e morso del branco su di lei: sopravvive; notte 3 senza pozione sulla Guardia il morso la uccide
guardia x suocera: si, G1: Suocera sbranata in notte 1 con le due Guardie vive (nessun effetto), una Guardia al rogo il giorno dopo con la Suocera morta/rivelata: nessuna interazione
lupo-mannaro-capobranco x suocera: si, G1 notte 1: il branco col Capobranco sbrana la Suocera (carta ignota), evento "La Suocera si rivela" e Diario ok; la Suocera morta non conta nel banner vittoria lupi (alba 3: lupi 2 vs villaggio 2, vincono)
guardia x lupo-mannaro-capobranco: si, G1 notte 3: il branco col Capobranco sbrana l'ultima Guardia viva; vittoria lupi segnalata in alba, nessun passo per la Guardia
guardia x mucca-mannara: si, G1: Mucca e Guardie nello stesso mazzo: passi di assegnazione indipendenti (la Mucca riconosce solo G01,G02, non le Guardie); la Mucca muore per Strega con le Guardie vive, nessun effetto
mucca-mannara x suocera: si, G1: la Mucca vede solo i lupi in notte 1 (G01,G02, non la Suocera); Suocera sbranata e Mucca avvelenata in notti diverse senza effetti incrociati
paladino x veggente: si, G2 notte 2: Paladino protegge il Veggente, il Veggente indaga il Paladino (aura benevola) e il branco morde il Veggente: "Il morso non ha effetto su G04: e' protetto/a", alba "Nessuno e' morto"
gallo-mannaro x veggente: si, G2 notte 1: Veggente indaga il Gallo: "Aura benevola" (dubbio gia' noto, aura malvagia solo per lupi/Chupacabra/Eremita); dopo "Il Gallo salta il giorno" il Veggente indaga normalmente in notte 2
berserker x veggente: si, G2 notte 2: Veggente indaga il Berserker (aura benevola), il branco lo sbrana: avviso "G02 (lupo piu' vicino) morira' con lui", alba con entrambi morti, Diario ok
gallo-mannaro x nonna: si, G2: Gallo salta il giorno in alba 1 con la Nonna viva nel branco: notte 2 il branco (Lupo + Nonna) sceglie normalmente, nessuna interferenza; Nonna vista dal Veggente "benevola"
nonna x paladino: si, G2 notte 2: branco con la Nonna morde la vittima protetta dal Paladino: "Il morso non ha effetto su G09: e' protetto/a"; Diario/alba "Nessuno e' morto"
gallo-mannaro x villico: si, G2: Gallo salta il giorno con Villici vivi (checkpoint), notte successiva normale; Gallo poi bruciato al rogo (voto) senza effetti sui Villici
berserker x villico: si, G2 notte 2: Berserker sbranato, il Villico (ruolo assegnato da checkpoint) resta vivo e non interferisce; muore il lupo piu' vicino (Nonna G02)
paladino x villico: si, G2 notte 2: Paladino protegge il Villico G09 (ruolo da checkpoint), il branco con la Nonna lo morde: nessun effetto, "Nessuno e' morto"
addolorata x scemo-del-villaggio: si, G3: rogo del "?" (Scemo non ancora rivelato) e notte 2: l'Addolorata scambia con la vittima, diventa Scemo del Villaggio (Diario "ora e' Scemo..., G11 ha la carta Addolorata"); il suo titolo Scemo e' poi candidato dell'evento "Lo Scemo sbaglia la rima" (G05) e della Morte per unzione. Variante: Scemo morto di rima di giorno senza rogo: nessuno scambio
addolorata x untore: si, G3 notte 2: rogo dell'Untore, l'Addolorata scambia ("ora e' Untore e G04 ha la carta Addolorata") e nella stessa notte unge G07 (alba "G07 e' stato unto"); Diario ok
scemo-del-villaggio x untore: si, G3: Scemo (carta presa dall'Addolorata) unto, "Morte per unzione" di G05: l'unzione passa ai due vicini vivi (G04 Untore, G08), Diario ok; la rima errata resta evento a parte
guaritore x nano: si, G3: Nano al rogo, notte 2 il Guaritore lo resuscita ("G09 e' stato resuscitato", resuscitato dal rogo); notte 1 il morso sul Nano "non puo' essere sbranato"
berserker x untore: si, G3 notte 2: Untore unge il Berserker, "Morte per unzione" di giorno: muore senza uccidere alcun lupo (solo lo sbranamento attiva il Berserker), l'unzione passa ai vicini G06/G08
cortigiana x veggente-mannaro: si, G3 notte 2: la Cortigiana visita il Veggente Mannaro (non e' un lupo: sopravvive), il Veggente Mannaro indaga la Cortigiana: "Aura benevola"
guaritore x untore: si, G3 notte 2: il Guaritore resuscita l'ex Untore morto al rogo (dopo lo scambio ha la carta Addolorata: legami seguono la carta, "G04 e' stato resuscitato"), la nuova Untore (ex Addolorata) unge regolarmente; Diario ok
guaritore x paladino: si, G3: Paladino ucciso in notte 2 dal branco, notte 3 il Guaritore lo resuscita; notte 4 il Paladino resuscitato ha il suo passo e protegge: "Il morso non ha effetto"
addolorata x cortigiana: si, G3 notte 2: rogo della Cortigiana, l'Addolorata scambia (ora e' Cortigiana) e nello stesso passo visita un lupo: "La Cortigiana G05 muore: il suo cliente G01 era un lupo"; il morto G06 con la carta Addolorata e' un promemoria nelle notti dopo
cortigiana x scemo-del-villaggio: si, G3 notte 2: la Cortigiana visita il "?" G11 (Scemo non rivelato) e il branco lo sbrana: avviso "A casa di G11 c'e' anche la Cortigiana: entrambi moriranno", muoiono entrambi
guaritore x veggente-mannaro: si, G3: VM al rogo, il Guaritore lo resuscita in notte 2, in notte 3 il VM ha il suo passo e indaga normalmente
berserker x cortigiana: si, G3 notte 2: Cortigiana cliente del Berserker, il branco sbrana il Berserker: muoiono Berserker, il lupo piu' vicino (con due equidistanti il narratore sceglie quale muore) e la Cortigiana (cliente sbranato)
cavaliere x sciacallo-mannaro: si, G4: Cavaliere si immola al rogo per il Polpo (notte 2) e lo Sciacallo lo resuscita: Cavaliere vivo senza protetto (legame azzerato, dubbio gia' noto D3 di guaritore x cavaliere): il secondo rogo del Polpo non attiva piu' l'immolazione
cavaliere x polpo-mannaro: si, G4 giorno 1: Cavaliere legato al Polpo, rogo del Polpo: "Il Cavaliere G07 lo protegge: si immola al suo posto", Polpo sopravvive, Diario ok
guardia-mannara x sciacallo-mannaro: si, G4: Guardia Mannara al rogo (notte 3) e lo Sciacallo la resuscita ("G03 e' stato resuscitato", tra i candidati con ruolo ignoto/Guardia); nessun effetto sul riconoscimento della prima notte
guardia-mannara x mucca-mannara: si, G4/micro: il passo della Mucca elenca solo i lupi del branco ("Lupi mannari: G01") e non la Guardia Mannara; Mucca e GM coesistono e muoiono/resuscitano indipendenti
mucca-mannara x paladino: si, G4 notte 2: il Paladino protegge la Mucca, il branco la morde: "Il morso non ha effetto su G05: e' protetto/a", alba "Nessuno e' morto"
mucca-mannara x sciacallo-mannaro: si, G4: Mucca al rogo (giorno 1), lo Sciacallo la resuscita in notte 2 (alba "G05 e' stato resuscitato"); nessun passo di Mucca dopo la prima notte
cartomante x mucca-mannara: si, G4 notte 1 e notte 3: la Cartomante indaga la Mucca (anche dopo la resurrezione): "Mostra a Cartomante la carta: Mucca Mannara"
cavaliere x guardia-mannara: si, G4 (legame del Cavaliere spostato a mano sulla GM nel checkpoint): rogo della Guardia Mannara, il Cavaliere si immola ("G07 protegge G03"), GM sopravvive; la notte dopo la GM puo' morire normalmente al rogo. Nota: il checkpoint ha prodotto una voce Diario spuria "Il Cavaliere sceglie di proteggere G03" (solo artefatto della modifica manuale)
paladino x polpo-mannaro: si, G4 notte 2: Paladino protegge il Polpo e il branco lo morde: "Il morso non ha effetto su G08: e' protetto/a"
cartomante x paladino: si, G4 notte 2: la Cartomante indaga il Paladino: "Mostra a Cartomante la carta: Paladino" (mentre il Paladino protegge la Mucca)
apprendista x eremita: si, G5: Apprendista con maestro Eremita (legame spostato da checkpoint), rogo dell'Eremita: "L'Apprendista G07 erediterà il suo ruolo" e poi "ha ereditato", G07 diventa Eremita (Diario "eredita il ruolo di Eremita dal maestro G03")
eremita x medium: si, G5 notte 3: il Medium interroga l'Eremita sbranato: "Mostra a Medium la carta: Eremita"
fantasma-onnisciente x mucca-mannara: si, G5: Mucca al rogo (primo morto sul rogo), "Assegna il Fantasma Onnisciente" con G04/G08 candidati, "G04 riceve la carta"; il Medium la vede ancora Mucca Mannara; nessun passo notturno per la Mucca/Fantasma
apprendista x fantasma-onnisciente: si, G5: il maestro dell'Apprendista (Mucca) e' il primo morto al rogo: l'Apprendista eredita Mucca ("ha ereditato il suo ruolo") e subito dopo l'avviso "Assegna il Fantasma al primo morto" resta a carico del narratore; il Fantasma va al maestro G04
mucca-mannara x villico: si, G5: la Mucca vede solo i due lupi in notte 1; il Villico ("?") sbranato in notte 1, poi il Medium lo interroga ("Mostra la carta: Villico"); nessun effetto incrociato
figlia-dei-lupi x mucca-mannara: si, G5: genitore della Figlia = Mucca (legame spostato da checkpoint): rogo della Mucca "La Figlia dei Lupi G06 diventa Lupo Mannaro", Apprendista eredita Mucca; nel mazzo originale la Mucca in notte 1 non elenca la Figlia tra i lupi
eremita x mucca-mannara: si, G5: Eremita e Mucca coesistono in notte 1 (la Mucca vede solo i lupi, l'Eremita non e' un lupo), la Mucca muore al rogo con Eremita vivo: nessuna interazione
medium x villico: si, G5 notte 2: il Medium interroga il Villico "?" sbranato: "Mostra a Medium la carta: Villico"
eremita x figlia-dei-lupi: si, G5 notte 2: genitore = Eremita sbranato: alba "G06 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro"; anche al rogo dell'Eremita
eremita x villico: si, G5: Eremita e Villici vivi insieme; il Medium vede Eremita ed e' Villico sui rispettivi morti; nessun effetto reciproco
addolorata x lupo-mannaro-capobranco: si, G6: rogo del Capobranco, notte 2 l'Addolorata scambia e diventa Capobranco: promemoria "Mostra a G04 chi sono i suoi compagni: G01", il branco ("Vivi: G01, G04") sceglie la vittima con l'ex Addolorata; il morto G02 ha la carta Addolorata
lupo-mannaro x polpo-mannaro: si, G6: il branco (Lupo + Capobranco) sbrana il Polpo (non e' un lupo, muore normalmente), alba/Diario ok
lupo-mannaro-capobranco x polpo-mannaro: si, G6 notte 2: il Capobranco (anche l'ex Addolorata Capobranco) morde il Polpo: muore normalmente
gallo-mannaro x innocente: si, G6: Innocente si rivela in alba 1 (Eventi speciali, candidati i "?" vivi) e subito "Il Gallo salta il giorno": notte 2 passo Addolorata "Nessuna vittima al rogo" e Innocente ancora rivelato; Diario ok
polpo-mannaro x scemo-del-villaggio: si, G6: Scemo sbaglia la rima (alba 1) con il Polpo vivo, poi il Polpo e' bruciato: nessun effetto incrociato, Diario ok
lupo-mannaro x scemo-del-villaggio: si, G6: Scemo muore di rima con il branco vivo (il branco continua a cacciare in notte 2, G06 non piu' tra le chip)
innocente x polpo-mannaro: si, G6: Innocente rivelato (alba 1) e Polpo poi al rogo / sbranato: nessuna interazione
fattucchiera x lupo-mannaro-capobranco: si, G7 notte 2: la Fattucchiera inibisce il Capobranco (Diario "G02 ha ottenuto la condizione inibito" e tolta all'alba), il branco con l'altro lupo caccia comunque (Berserker sbranato uccide comunque il lupo inibito G02, il piu' vicino)
berserker x boia: si, G7: il Boia (rivelato dall'evento "Il Boia giustizia", candidati i "?") giustizia il Berserker: muore senza uccidere alcun lupo (solo lo sbranamento attiva il Berserker), Diario "Il Boia G07 giustizia G04"
spilungone x villico: si, G7: Spilungone favorito al rogo ("Si rivela: e' lo Spilungone", notte senza vittime), poi Villico ("?") candidato dell'evento Boia e sbranato/ivo: nessuna interferenza; secondo rogo dello Spilungone muore normalmente (gia' accettato)
boia x pastore: si, G7 alba 2: dopo la morte di Berserker, lupo vicino e Fattucchiera, il Pastore ha un lupo come primo vicino vivo: "Si sentono dei belati"; il Boia giustizia quel lupo (G01): "Non ci sono piu' Lupi Mannari: vince il Villaggio", Diario ok
berserker x spilungone: si, G7: Berserker sbranato con lo Spilungone gia' rivelato vivo: muore solo il lupo piu' vicino (G02), nessun effetto sullo Spilungone
fattucchiera x villico: si, G7 notte 3: la Fattucchiera inibisce un "?" (Villico): nessun avviso (ruolo ignoto), condizione inibito applicata e tolta all'alba senza effetti
lupo-mannaro-capobranco x spilungone: si, G7 notte 2: il branco (Capobranco) sbrana lo Spilungone rivelato: muore normalmente (immune solo al rogo)
fattucchiera x spilungone: si, G7 notte 2: la Fattucchiera inibisce lo Spilungone: nessun avviso (non e' in NON_INIBIBILI, non ha poteri notturni), condizione tolta all'alba; il rogo successivo funziona normalmente (rivelazione)
guardia-mannara x mezzosangue: si, G8 notte 1: il branco sbrana il Mezzosangue ("non muore: G06 diventa Lupo Mannaro", alba/Diario ok) con la Guardia Mannara viva; il passo Guardie assegna la GM tra 3 giocatori e non riguarda il Mezzosangue
addolorata x mezzosangue: si, G8: rogo del Mezzosangue, l'Addolorata scambia ("ora e' Mezzosangue") e in notte 2 il branco la morde: "Il Mezzosangue sbranato non muore: G07 diventa Lupo Mannaro" (legame con la carta); G06 resta morto con la carta Addolorata
fantasma-onnisciente x mezzosangue: si, G8: il Mezzosangue al rogo e' il primo morto: "Assegna il Fantasma" (evento in giorno/voto/esito), "G06 riceve la carta del Fantasma Onnisciente"; poi l'Addolorata prende la sua carta di Mezzosangue (Fantasma resta sul giocatore); Diario ok
innocente x nonna: si, G8: Innocente si rivela in alba 1 (candidati i "?" vivi) e la Nonna e' al rogo il giorno stesso: muore, l'Addolorata scambia diventando Nonna (compagni G01,G06 mostrati); poi il branco sbrana l'Innocente rivelato
fantasma-onnisciente x innocente: si, G8 giorno 2: l'Innocente rivelato e sbranato e il primo morto al rogo (Addolorata) sono entrambi candidati del Fantasma; assegnata all'Innocente: "G08 riceve la carta". Nota: l'evento Fantasma compare solo in giorno (voto/esito), non in alba
guardia-mannara x nonna: si, G8: Nonna al rogo con la Guardia Mannara viva e GM che non e' tra i compagni mostrati alla nuova Nonna (solo lupi); nessun effetto sul riconoscimento della prima notte
nonna x spilungone: si, G8 notte 2: il branco con la Nonna sbrana lo Spilungone gia' rivelato: muore normalmente
apprendista x untore: si, G9: Apprendista con maestro Untore, rogo dell'Untore: "L'Apprendista G06 erediterà/ha ereditato il suo ruolo", in notte 2 G06 ha il passo Untore e unge G09 (Diario "eredita il ruolo di Untore dal maestro G04")
inquisitore x maga: si, G9 notte 2: la Maga trasforma il Sacerdote e l'Inquisitore interroga la Maga: "Rispondi: no (aura benevola)", Diario "perde il potere dopo un'indagine inutile"; trasformazione e indagine indipendenti
inquisitore x untore: si, G9 notte 2 (ramo): l'Inquisitore interroga l'ex Apprendista con carta Untore: "no (aura benevola)", perde il potere
maga x sacerdote: si, G9: Sacerdote unisce Apprendista e Villico (innamorati), notte 2 la Maga trasforma il Sacerdote ("G07 e' stato trasformato in maiale"): il legame resta; il Villico muore (morso) e l'Apprendista muore di crepacuore ("G06 e' morto/a di crepacuore"), Diario ok
inquisitore x pastore: si, G9 notte 2: l'Inquisitore interroga il Pastore ("no, aura benevola"); morto il Villico vicino il Pastore ha come primo vicino il lupo trasformato dal Progenitore: "Si sentono dei belati" in alba
apprendista x sacerdote: si, G9: il Sacerdote unisce l'Apprendista (G06) e G09; il maestro Untore e' al rogo, l'Apprendista eredita (resta innamorato), poi il partner muore e l'Apprendista (con carta Untore) muore di crepacuore
lupo-mannaro-progenitore x maga: si, G9 notte 1: la Maga trasforma il Progenitore (maiale) e nella stessa notte il Progenitore trasforma la vittima G10 in Lupo Mannaro (nessun blocco); trasformazione tolta a fine giorno, Diario ok
alchimista x ambasciatore: si, G10: Alchimista al rogo ("Si rivela: e' l'Alchimista") trascina l'Ambasciatore; notte 2 il Veggente indaga un benevolo e in alba 2 nessun messaggio dell'Ambasciatore (era arrivato in alba 1); Diario ok
alchimista x strega: si, G10: l'Alchimista (rogo) trascina la Strega: "G04 e' morto/a per l'esplosione", notte 2 la Strega non ha passo pozioni (promemoria morto), Diario ok
alchimista x scemo-del-villaggio: si, G10: lo Scemo muore di rima in alba 1 poi l'Alchimista trascina un "?" ; in un altro ramo l'Alchimista trascina il "?" Scemo vivo: resta l'evento "Lo Scemo sbaglia la rima" senza candidati vivi ("Nessun giocatore da scegliere", vedi dubbio)
ambasciatore x chupacabra: si, G10 notte 2: Veggente indaga il Chupacabra ("Aura malvagia") e il Chupacabra caccia l'Ambasciatore ("G02 non e' un lupo: la caccia fallisce"): nessun messaggio dell'Ambasciatore in alba 2
ambasciatore x berserker: si, G10 notte 1: Veggente indaga il Berserker (benevolo): "E' arrivato un messaggio dall'ambasciatore" in alba 1
scemo-del-villaggio x villico: si, G10: Scemo ("?" dall'evento, candidati i "?" vivi) muore di rima in alba 1, i Villici "?" restano candidati degli altri eventi e sbranati nelle notti dopo
criceto-malvagio x gallo-mannaro: si, G11: Gallo salta il giorno (notte 2 senza giorno 1) con il Criceto vivo; notte 3 il branco morde il Criceto: "Il morso non ha effetto su G04: il Criceto Malvagio non puo' essere sbranato"; nessun effetto reciproco
criceto-malvagio x pastore: si, G11: il Criceto confina con il Pastore e non viene contato come lupo: i belati si sentono solo per i lupi (G02/G01 vicini), nessun belato in alba 3 quando restano Criceto e un lupo lontano; morso sul Criceto senza effetto
paladino x pastore: si, G11 notte 1: il Paladino protegge il Pastore e il branco lo morde: "Il morso non ha effetto su G03: e' protetto/a"; belati regolari in alba
mezzosangue x veggente: si, G11 notte 2: il Veggente indaga il Mezzosangue ("Aura benevola") e poi il branco lo morde: "non muore: G07 diventa Lupo Mannaro" (alba/Diario ok); da lupo risulta come tale
chupacabra x pastore: si, G11 notte 1: il Chupacabra uccide il lupo G02 vicino al Pastore: in alba "Si sentono dei belati" per il lupo successivo G01 (primo vivo a sinistra); morto G01 in notte 3 i belati cessano
pastore x veggente: si, G11 notte 2 (ramo): il Veggente indaga il Pastore: "Aura benevola"; i belati in alba dipendono solo dai lupi vicini, non dall'indagine
borgomastro x nonna: si, G12: la Nonna eletta Borgomastro in alba 1 (voto doppio), uccisa dal Chupacabra in notte 2: Diario "G02 era il Borgomastro: il villaggio dovra' eleggerne uno nuovo", avviso di elezione in alba 2; resuscitata dal Guaritore non riprende il titolo (nuovo Borgomastro gia' eletto)
borgomastro x inquisitore: si, G12: Inquisitore eletto Borgomastro in alba 2; in notte 3 interroga il Chupacabra ("si, aura malvagia") normalmente; Diario "G05 e' stato eletto Borgomastro"
lantico x nonna: si, G12: rogo dell'Antico (prima vita): "il villaggio e' maledetto", notte 2 con soli poteri malvagi: passo Branco con la Nonna ("Vivi: G02") e Chupacabra attivi, Guaritore e Inquisitore non chiamati; Nonna poi uccisa dal Chupacabra
innocente x lantico: si, G12: Innocente rivelato in alba 1 e Antico al rogo nello stesso giorno: due rivelazioni indipendenti, Diario ok; l'Antico rivelato continua come Villico
chupacabra x guaritore: si, G12: il Chupacabra uccide la Nonna (notte 2); notte 3 il Guaritore la resuscita ("G02 e' stato resuscitato"); in notte 3 il Chupacabra (tutti i lupi morti) uccide un abitante; ordine passi ok con il Branco chiamato "anche se morto"
guaritore x nonna: si, G12 notte 3: il Guaritore resuscita la Nonna (G02 tra i candidati con G01, G07, G08, G09); alba "G02 e' stato resuscitato", torna Nonna viva
apprendista x guardia-mannara: si, G13: Apprendista con maestro Guardia Mannara; rogo della GM: "L'Apprendista G06 ha ereditato il suo ruolo" (Diario "eredita il ruolo di Guardia"); in notte 2 la Cartomante su di lui deve scegliere "Guardia o Guardia Mannara?" (carta indistinguibile)
criceto-malvagio x guardia-mannara: si, G13 notte 1: il branco morde il Criceto con la Guardia Mannara viva: "il Criceto Malvagio non puo' essere sbranato"; nessun legame con la GM
scemo-del-villaggio x ubriaco: si, G13: Scemo muore di rima in alba 1 con l'Ubriaco vivo (poi al rogo: nessuno stordimento in notte 2); in altro ramo Ubriaco sbranato e Scemo di rima in alba 1: il branco e' stordito solo in notte 2
guardia x scemo-del-villaggio: si, G13: Scemo muore di rima (evento, candidati i "?" vivi) con le tre Guardie vive (due Guardie + GM): nessun effetto
inquisitore x ubriaco: si, G13 notte 1: l'Inquisitore interroga l'Ubriaco: "no (aura benevola)", perde il potere; l'Ubriaco sbranato in altro ramo stordisce il branco
guardia-mannara x scemo-del-villaggio: si, G13: Scemo di rima in alba 1 con la Guardia Mannara viva e dopo la morte della GM al rogo: nessuna interazione
cartomante x ubriaco: si, G13 notte 1: la Cartomante indaga l'Ubriaco: "Mostra a Cartomante la carta: Ubriaco" (poi non stordisce se non sbranato)
boia x veggente-mannaro: si, G14: il Boia ("?" rivelato dall'evento) giustizia il Veggente Mannaro in alba 1: "G09 si e' rivelato/a: e' il Boia e giustizia G02"; notte 2 il VM morto ha solo il promemoria "Chiama comunque G02"
boia x fantasma-onnisciente: si, G14: il morto per giustizia del Boia (non rogo) e' candidato di "Assegna il Fantasma Onnisciente" (evento visibile in Giorno/voto): "G02 riceve la carta del Fantasma Onnisciente", Diario ok. Nota: il testo dice "primo morto sul rogo" ma qui il morto e' per giustizia (gia' consentito dalla decisione)
boia x paladino: si, G14 (ramo): il Boia giustizia il Paladino (nessuna protezione vale contro il Boia); in notte 2 il Paladino morto ha solo promemoria
sacerdote x spilungone: si, G14: Sacerdote unisce due "?"; uno e' lo Spilungone: al rogo "Si rivela: e' lo Spilungone" nessun crepacuore (non muore), poi il branco lo sbrana in notte 2: alba "G08 e' morto/a di crepacuore per la morte del partner"
borgomastro x eremita: si, G14: Eremita eletto Borgomastro in alba 1 ("G05 e' il nuovo Borgomastro"), il Veggente Mannaro lo aveva indagato in notte 1: "Aura malvagia"; l'elezione non cambia l'aura
eremita x mezzosangue: si, G14: notte 1 il VM indaga l'Eremita ("Aura malvagia") e il branco morde il Mezzosangue (diventa lupo); Eremita e Mezzosangue indipendenti, Diario ok
cucciolo-di-lupo-mannaro x villico: si, G15: Cucciolo al rogo (avviso "Vendetta del Cucciolo"), notte 2 vittima 1 e 2 di 2: il branco sbrana due Villici "?" (G12, G13), alba con entrambi morti; il Cucciolo resuscitato dal Guaritore nella stessa notte non altera le due vittime
innocente x strega: si, G15: Innocente rivelato in alba 1 e ucciso in notte 2 dalla pozione mortale della Strega: sparisce dalle chip del branco, Diario "La Strega usa la pozione mortale su G11"
guaritore x maga: si, G15: la Maga trasforma il Guaritore (notte 1 e 2) e nella notte 2 il Guaritore trasformato resuscita comunque il Cucciolo: "G01 e' stato resuscitato", trasformazione persa a fine giorno
lupo-mannaro-progenitore x polpo-mannaro: si, G15 notte 1: il Progenitore trasforma il Polpo morso ("G03 verra' trasformato in Lupo Mannaro"), il Polpo diventa lupo (Lupo Mannaro, branco "Vivi: G01, G02" poi G03 in notte 2)
medium x untore: si, G15: Untore al rogo, notte 3 il Medium lo interroga: "Mostra a Medium la carta: Untore" (il passo Untore resta con promemoria "chiama comunque"); in notte 1 l'Untore aveva unto il Medium ("G07 e' stato unto")
pifferaio x veggente: si, G15 notte 1: il Pifferaio ipnotizza il Veggente e il Veggente indaga il Pifferaio ("Aura benevola"); il Veggente ipnotizzato conserva la sua azione

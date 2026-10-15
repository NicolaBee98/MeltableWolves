# Batch di partite di prova 2026-10-15 (b): 153 coppie senza evidenza "si"

Chromium reale (Playwright, 390x844, dev server porta 5612, codice a 7543ddb), nessuna modifica a `src/` ne' ai docs esistenti. 12 partite da 7-14 giocatori giocate dalla UI (passi notturni, alba, Eventi speciali, voto, rogo); le partite partono da un checkpoint di localStorage con i ruoli gia' distribuiti (i ruoli di rivelazione diurna e la Suocera restano "?"), poi ogni passo e' giocato dall'interfaccia. Refresh e Indietro del telefono provati all'alba e al voto (stato identico). Console: nessun errore applicativo (solo il 404 di favicon.ico del dev server). Script in `.playwright-mcp/` (ignorato da git).

Esito: **nessun bug nuovo**, 5 dubbi/osservazioni (in fondo). Tutte le 153 coppie dell'elenco sono state presenti insieme in almeno una partita giocata; per **58** c'e' stata un'interazione provata (colonna "si"), per le altre 95 una verifica di assenza di interazione (ruoli passivi o disgiunti, "parziale" forte).

## Partite
1. G1 (12+Fantasma): Inquisitore, Spilungone, Villico, Guardia/Guardia Mannara, Bardo, Polpo, Mezzosangue, Apprendista, Addolorata. Borgomastro = Spilungone favorito al rogo; Apprendista eredita l'Inquisitore; Addolorata scambia con il Polpo bruciato; Fantasma assegnato. ok
2. G2 (11+Fantasma): Innocente, Capobranco, Addolorata, Cortigiana, Scemo, Boia, Inquisitore, Veggente Mannaro, Guaritore, Paladino. Boia giustizia l'Innocente rivelato, rima dello Scemo, Cortigiana da un lupo muore, Paladino salva il Guaritore, Addolorata scambia con lupo bruciato. ok
3. G3 (13): Medium, Strega, Untore, Pifferaio, Mezzosangue, Suocera, Eremita, Alchimista, Maga, Guaritore, Cartomante. Medium su 4 defunti (carte corrette), Guaritore resuscita l'Alchimista, Strega vitale sul Medium e mortale sull'Untore: l'unzione dell'alba resta. ok
4. G4 (13): Cavaliere, Ambasciatore, Chupacabra, Spilungone, Cortigiana, Eremita, Medium, Maga, Inquisitore, Guaritore, Bardo. Cavaliere si immola per un protetto trasformato in maiale, Chupacabra uccide un lupo, Guaritore lo resuscita. ok
5. G5 (12): Chupacabra, Pastore, Nonna, Paladino, Bardo, Guardie, Boia, Polpo, Scemo, Cucciolo. Caccia sul Pastore fallisce, Boia giustizia il Cucciolo, vendetta la notte dopo, Chupacabra caccia anche se sbranato. ok
6. G6 (12): Sacerdote, Maga, L'Antico, Criceto, Veggente Mannaro, Capobranco, Cartomante, Strega, Spilungone, Mucca, Mezzosangue. Antico (con Spilungone entrambi "?") bruciato: crepacuore sul Mezzosangue-lupo legato, maledizione che lascia agire solo i lupi. ok
7. G7 (12): Berserker, Nano, Figlia, Veggente, Innocente, Cavaliere, Boia, Nonna, Villico, Fattucchiera, Guaritore. Figlia diventa lupa al rogo del Nano, Cavaliere si immola per lei, Guaritore resuscita il Nano, Fattucchiera inibisce il Guaritore. ok
8. G8 (14): Gallo, Mucca, Mezzosangue, Figlia, Nonna, Sciacallo, Cucciolo, Cavaliere, Innocente, Cartomante, Paladino, Ubriaco, Addolorata, Criceto. Mezzosangue sbranato non fa immolare il Cavaliere, Figlia diventa lupa col rogo della Mucca, Sciacallo la resuscita, Gallo salta il giorno. ok
9. G9 (14): Berserker, Pastore, Capobranco, Untore, Fattucchiera, Cortigiana, Bardo, Strega, Innocente, Ubriaco, Cartomante, Apprendista, Eremita, Nonna. Berserker + Cortigiana nella stessa casa, Apprendista eredita la Nonna, Bardo salta la notte, Ubriaco sbranato stordisce. ok
10. G10 (13): Progenitore, Spilungone, Veggente, Suocera, Inquisitore, Ubriaco, Nano, Sciacallo, Alchimista, Cucciolo, Scemo, Eremita. Progenitore trasforma lo Spilungone "?", Alchimista trascina il Cucciolo, vendetta sprecata sul Nano. ok
11. G11 (9): Guardie, Mucca, Villico, Innocente, Pifferaio, Inquisitore. Innocente ipnotizzato che si rivela, Pifferaio ipnotizza anche l'Inquisitore. ok
12. G12 (10+Fantasma): Cavaliere, Veggente Mannaro, Guaritore, Mucca, Sciacallo, Strega, Untore, Cucciolo. Cavaliere si immola, "morte per unzione" del Cucciolo, vendetta, Sciacallo e Guaritore resuscitano nella stessa notte. ok

## Coppie (si = interazione provata; ass = assenza di interazione verificata)
| coppia | esito | nota |
|---|---|---|
| borgomastro x inquisitore | ass | co-presenti, nessun passo/effetto collegato osservato |
| cortigiana x innocente | ass | co-presenti, nessun passo/effetto collegato osservato |
| berserker x cartomante | si | G9: Cartomante vede la carta Berserker |
| fantasma-onnisciente x untore | ass | co-presenti, nessun passo/effetto collegato osservato |
| alchimista x strega | si | G3: Alchimista resuscitato non e' bersaglio della Strega la stessa notte |
| medium x suocera | si | G3: Medium sulla Suocera morta |
| borgomastro x spilungone | si | G1: Borgomastro = Spilungone favorito al rogo, si rivela e non muore; G4 idem |
| boia x nonna | ass | co-presenti, nessun passo/effetto collegato osservato |
| addolorata x inquisitore | ass | co-presenti, nessun passo/effetto collegato osservato |
| alchimista x medium | si | G3: Medium interroga l'Alchimista morto |
| chupacabra x guardia | ass | co-presenti, nessun passo/effetto collegato osservato |
| figlia-dei-lupi x nano | si | G7: genitore = Nano bruciato |
| bardo x cavaliere | ass | co-presenti, nessun passo/effetto collegato osservato |
| nonna x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| boia x veggente-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| guardia x mucca-mannara | si | G11: Guardie e Mucca nella stessa prima notte |
| fantasma-onnisciente x mezzosangue | ass | co-presenti, nessun passo/effetto collegato osservato |
| borgomastro x cucciolo-di-lupo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| inquisitore x scemo-del-villaggio | ass | co-presenti, nessun passo/effetto collegato osservato |
| apprendista x eremita | ass | co-presenti, nessun passo/effetto collegato osservato |
| innocente x veggente | ass | co-presenti, nessun passo/effetto collegato osservato |
| bardo x spilungone | ass | co-presenti, nessun passo/effetto collegato osservato |
| cucciolo-di-lupo-mannaro x untore | si | G12: unzione, "morte per unzione" del Cucciolo, vendetta |
| inquisitore x suocera | si | G10: Inquisitore sulla Suocera: aura benevola, perde il potere |
| addolorata x lupo-mannaro-capobranco | si | G2: scambio con lupo bruciato, "compagni: G02" mostrato |
| eremita x medium | si | G3: Medium sulla carta Eremita |
| apprendista x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| fattucchiera x lupo-mannaro-capobranco | si | G9: Capobranco inibito, nessun effetto ne avviso nel passo del branco (DUBBIO 1) |
| mezzosangue x polpo-mannaro | si | G1: Mezzosangue sbranato mentre il Polpo e' in gioco |
| lupo-mannaro-capobranco x untore | ass | co-presenti, nessun passo/effetto collegato osservato |
| gallo-mannaro x innocente | ass | co-presenti, nessun passo/effetto collegato osservato |
| apprendista x nonna | si | G9: Berserker uccide la Nonna, Apprendista eredita Nonna e vede i compagni |
| addolorata x criceto-malvagio | ass | co-presenti, nessun passo/effetto collegato osservato |
| inquisitore x mezzosangue | si | G1: Inquisitore vs Polpo/Mezzosangue (lupo dopo morso) |
| guardia-mannara x polpo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| addolorata x polpo-mannaro | si | G1: scambio con il Polpo bruciato (poi ruolo passivo, nessun passo) |
| addolorata x gallo-mannaro | si | G8: Gallo salta il giorno, Addolorata senza rogo "nessuna azione" |
| addolorata x scemo-del-villaggio | ass | co-presenti, nessun passo/effetto collegato osservato |
| cucciolo-di-lupo-mannaro x sciacallo-mannaro | si | G12: Sciacallo resuscita il Cucciolo durante la vendetta |
| guardia-mannara x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| medium x mezzosangue | si | G3: Medium sul Mezzosangue morto |
| lupo-mannaro-capobranco x sacerdote | si | G6: Capobranco + Sacerdote, innamorati e branco |
| innocente x lupo-mannaro-capobranco | ass | co-presenti, nessun passo/effetto collegato osservato |
| berserker x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| maga x medium | si | G3: Medium trasformato in maiale |
| pastore x strega | ass | co-presenti, nessun passo/effetto collegato osservato |
| fantasma-onnisciente x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| ambasciatore x spilungone | ass | co-presenti, nessun passo/effetto collegato osservato |
| addolorata x cortigiana | ass | co-presenti, nessun passo/effetto collegato osservato |
| boia x veggente | si | G7: Boia + Veggente giorno/notte |
| berserker x nano | ass | co-presenti, nessun passo/effetto collegato osservato |
| cavaliere x chupacabra | si | G4: Chupacabra e Cavaliere nella stessa notte (immolazione + caccia), nessun conflitto |
| maga x sacerdote | si | G6: Maga trasforma il Sacerdote |
| criceto-malvagio x lantico | ass | co-presenti, nessun passo/effetto collegato osservato |
| cortigiana x guaritore | ass | co-presenti, nessun passo/effetto collegato osservato |
| ambasciatore x cavaliere | ass | co-presenti, nessun passo/effetto collegato osservato |
| medium x untore | si | G3: Medium unto |
| boia x scemo-del-villaggio | si | G2: Boia e rima sbagliata dello Scemo nello stesso giorno |
| guaritore x mezzosangue | ass | co-presenti, nessun passo/effetto collegato osservato |
| borgomastro x fantasma-onnisciente | si | G1: Fantasma assegnato con Borgomastro eletto in partita |
| suocera x ubriaco | ass | co-presenti, nessun passo/effetto collegato osservato |
| inquisitore x spilungone | ass | co-presenti, nessun passo/effetto collegato osservato |
| cucciolo-di-lupo-mannaro x scemo-del-villaggio | ass | co-presenti, nessun passo/effetto collegato osservato |
| borgomastro x chupacabra | ass | co-presenti, nessun passo/effetto collegato osservato |
| polpo-mannaro x spilungone | ass | co-presenti, nessun passo/effetto collegato osservato |
| cavaliere x sciacallo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| nonna x paladino | ass | co-presenti, nessun passo/effetto collegato osservato |
| strega x untore | si | G3: Strega uccide l'Untore, unzione dell'alba resta |
| mucca-mannara x strega | ass | co-presenti, nessun passo/effetto collegato osservato |
| bardo x paladino | ass | co-presenti, nessun passo/effetto collegato osservato |
| nano x nonna | ass | co-presenti, nessun passo/effetto collegato osservato |
| guardia x polpo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| lantico x mucca-mannara | ass | co-presenti, nessun passo/effetto collegato osservato |
| guaritore x veggente-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| figlia-dei-lupi x gallo-mannaro | si | G8: Gallo e Figlia lupa nel branco |
| pastore x ubriaco | ass | co-presenti, nessun passo/effetto collegato osservato |
| berserker x pastore | si | G9: Pastore avvisa, Berserker accanto, Strega uccide il Pastore |
| gallo-mannaro x mucca-mannara | ass | co-presenti, nessun passo/effetto collegato osservato |
| lupo-mannaro-capobranco x scemo-del-villaggio | ass | co-presenti, nessun passo/effetto collegato osservato |
| cavaliere x maga | si | G4: il protetto trasformato in maiale e salvato dal Cavaliere |
| chupacabra x pastore | si | G5: caccia sul Pastore fallisce |
| cavaliere x inquisitore | si | G4: protetto = Inquisitore |
| boia x fantasma-onnisciente | si | G2: Fantasma assegnato al giustiziato dal Boia |
| guaritore x nano | si | G7: Guaritore resuscita il Nano |
| cartomante x veggente-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| lupo-mannaro-progenitore x spilungone | si | G10: Progenitore trasforma lo Spilungone non rivelato |
| cavaliere x figlia-dei-lupi | si | G7: Cavaliere si immola per la Figlia diventata lupa |
| berserker x untore | si | G9: Berserker unto e sbranato |
| guaritore x paladino | ass | co-presenti, nessun passo/effetto collegato osservato |
| nano x sciacallo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| bardo x guardia-mannara | ass | co-presenti, nessun passo/effetto collegato osservato |
| boia x innocente | si | G2: Boia giustizia l'Innocente rivelato |
| guaritore x nonna | ass | co-presenti, nessun passo/effetto collegato osservato |
| polpo-mannaro x scemo-del-villaggio | ass | co-presenti, nessun passo/effetto collegato osservato |
| borgomastro x fattucchiera | ass | co-presenti, nessun passo/effetto collegato osservato |
| figlia-dei-lupi x mezzosangue | si | G8: Mezzosangue sbranato mentre la Figlia ha scelto il genitore |
| borgomastro x guardia-mannara | ass | co-presenti, nessun passo/effetto collegato osservato |
| innocente x strega | ass | co-presenti, nessun passo/effetto collegato osservato |
| boia x inquisitore | ass | co-presenti, nessun passo/effetto collegato osservato |
| gallo-mannaro x mezzosangue | ass | co-presenti, nessun passo/effetto collegato osservato |
| cartomante x spilungone | ass | co-presenti, nessun passo/effetto collegato osservato |
| bardo x berserker | si | G9: Bardo salta la notte con il Berserker vivo |
| bardo x guardia | ass | co-presenti, nessun passo/effetto collegato osservato |
| spilungone x veggente | si | G10: Veggente legge lo Spilungone |
| inquisitore x maga | ass | co-presenti, nessun passo/effetto collegato osservato |
| cartomante x mucca-mannara | ass | co-presenti, nessun passo/effetto collegato osservato |
| cartomante x strega | si | G3: Cartomante vede la Strega |
| figlia-dei-lupi x veggente | ass | co-presenti, nessun passo/effetto collegato osservato |
| mucca-mannara x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| chupacabra x eremita | ass | co-presenti, nessun passo/effetto collegato osservato |
| mezzosangue x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| maga x strega | ass | co-presenti, nessun passo/effetto collegato osservato |
| gallo-mannaro x nonna | ass | co-presenti, nessun passo/effetto collegato osservato |
| cavaliere x veggente-mannaro | si | G12: VM legge il Cavaliere (aura benevola), il Cavaliere si immola |
| lantico x lupo-mannaro-capobranco | si | G6: maledizione, il Capobranco agisce |
| cortigiana x spilungone | ass | co-presenti, nessun passo/effetto collegato osservato |
| borgomastro x lupo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| fantasma-onnisciente x innocente | ass | co-presenti, nessun passo/effetto collegato osservato |
| fattucchiera x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| borgomastro x paladino | ass | co-presenti, nessun passo/effetto collegato osservato |
| alchimista x cucciolo-di-lupo-mannaro | si | G10: trascinato il Cucciolo, vendetta annunciata, sprecata sul Nano |
| guardia x innocente | ass | co-presenti, nessun passo/effetto collegato osservato |
| mucca-mannara x ubriaco | ass | co-presenti, nessun passo/effetto collegato osservato |
| medium x strega | si | G3: Strega vitale sul Medium, morso senza effetto |
| guaritore x medium | si | G3/G4: Guaritore dopo il Medium nella stessa notte |
| innocente x paladino | ass | co-presenti, nessun passo/effetto collegato osservato |
| spilungone x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| apprendista x mezzosangue | ass | co-presenti, nessun passo/effetto collegato osservato |
| innocente x pifferaio | si | G11: Innocente ipnotizzato che si rivela |
| lantico x mezzosangue | si | G6: Antico e Mezzosangue (ora lupo) legati dal Sacerdote: crepacuore |
| ambasciatore x chupacabra | ass | co-presenti, nessun passo/effetto collegato osservato |
| maga x veggente-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| bardo x villico | ass | co-presenti, nessun passo/effetto collegato osservato |
| guaritore x mucca-mannara | si | G12: Guaritore + Mucca sbranata, vitale |
| berserker x fattucchiera | ass | co-presenti, nessun passo/effetto collegato osservato |
| gallo-mannaro x sciacallo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| alchimista x scemo-del-villaggio | ass | co-presenti, nessun passo/effetto collegato osservato |
| criceto-malvagio x veggente-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| innocente x ubriaco | ass | co-presenti, nessun passo/effetto collegato osservato |
| medium x pifferaio | si | G3: Medium ipnotizzato |
| figlia-dei-lupi x mucca-mannara | si | G8: genitore = Mucca bruciata, Figlia diventa lupa |
| berserker x cortigiana | si | G9: sbranato il Berserker a casa con la Cortigiana, muoiono entrambi, il lupo piu vicino cade |
| chupacabra x guaritore | si | G4: Guaritore resuscita il lupo ucciso dal Chupacabra |
| cavaliere x cucciolo-di-lupo-mannaro | si | G8: Cavaliere + Cucciolo nel branco (nessuna immolazione: protetto = Mezzosangue) |
| sciacallo-mannaro x strega | si | G12: Sciacallo e Strega nella stessa notte |
| cartomante x gallo-mannaro | si | G8: Cartomante vede il Gallo |
| inquisitore x veggente-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| cartomante x paladino | ass | co-presenti, nessun passo/effetto collegato osservato |
| boia x paladino | ass | co-presenti, nessun passo/effetto collegato osservato |
| inquisitore x mucca-mannara | ass | co-presenti, nessun passo/effetto collegato osservato |
| eremita x scemo-del-villaggio | ass | co-presenti, nessun passo/effetto collegato osservato |
| cavaliere x gallo-mannaro | ass | co-presenti, nessun passo/effetto collegato osservato |
| bardo x guaritore | ass | co-presenti, nessun passo/effetto collegato osservato |

## Dubbi e osservazioni
1. **Fattucchiera su Capobranco (G9)**: la Fattucchiera puo' inibire il Capobranco ma il passo del branco non cambia (nessun avviso, il Capobranco inibito caccia con gli altri). Da decidere se inibire un lupo del branco debba segnalare almeno che il Capobranco non puo' scegliere fratelli.
2. **Guaritore e Fantasma (G2)**: il giocatore con la carta del Fantasma (giustiziato dal Boia, notte seguente) non compare tra i resuscitabili del Guaritore (solo gli altri morti). Verificare se e' voluto.
3. **Apprendista che eredita l'Inquisitore (G1)**: eredita anche "ha perso il potere dopo un'indagine inutile" (passo senza scelte). Coerente con i poteri ereditati ma da confermare.
4. **Alba senza causa (G2)**: la schermata di alba elenca solo i morti (Cortigiana e Guaritore) senza dire che la Cortigiana e' morta per la visita a un lupo; la causa e' solo nel Diario.
5. **Progenitore su Spilungone "?" (G10)**: al rogo successivo l'opzione "Si rivela: e' lo Spilungone" resta offerta (incertezza fino a fine partita, gia' decisa).

Verificati come corretti senza dubbi: Mezzosangue sbranato non fa immolare il Cavaliere; vendetta del Cucciolo sprecata su vittima immune e consumata anche se il Cucciolo viene resuscitato; Figlia lupa se il genitore (anche resuscitato dopo) muore; Strega non vede come bersaglio chi viene resuscitato quella notte; unzione dell'alba valida anche se l'Untore muore nella notte; Chupacabra sbranato caccia comunque; Gallo e Bardo saltano giorno/notte con l'Addolorata senza rogo.

# Batch di partite di prova 2026-10-15 (d): coppie senza evidenza "si" (Ambasciatore/Berserker/Figlia, Gallo/Fattucchiera/Ubriaco, Strega/Guaritore/Veggente, Maga/Capobranco/Ladro, Guardie/Addolorata/Progenitore, Bardo/Cucciolo, Nano/Paladino/Sciacallo, Cavaliere/Chupacabra/Boia, Fantasma)

Chromium reale (Playwright, 390x844, dev server porta 5614, codice a 7543ddb), nessuna modifica a `src/` ne' ai docs esistenti. Il file `/tmp/brief.txt` conteneva solo le "AGGIUNTE" (nessuna istruzione estesa): le decisioni elencate non sono state riproposte come dubbi. 9 mazzi diversi (13-17 giocatori, 8 per il Fantasma) giocati dalla UI (assegnazione notte per notte, scelte dei passi, alba, voto, rogo, Eventi speciali); per ogni mazzo i checkpoint di localStorage (snapshot dopo la notte 1) sono serviti a provare 2-6 varianti di giorno/notte 2-3 (circa 40 sequenze notte/giorno in totale, quindi piu' delle 12-16 "partite" chieste ma con meno ruoli per sessione di una partita vera). Refresh non ripetuto (gia' coperto nei batch precedenti). Console: nessun errore ne' warning in nessuna sequenza; nessun softlock.

Risultato: delle 152 coppie dell'elenco, **95 con valutazione "si"** (interazione reale provata o assenza di interazione provata in uno scenario mirato), 56 "parziale" (presenti insieme nella stessa partita, nessuna interazione diretta) e 1 non valutata (cartomante x maga). Trovati **3 bug minori, tutti del Diario** (nessun bug di logica di gioco).

## Mazzi e scenari
1. **Ambasciatore, Figlia, Berserker, Apprendista, Medium, Cartomante, Sciacallo, Criceto, Suocera, Eremita, Mezzosangue, 2 Guardie, 2 Lupi, Veggente (16)**: Apprendista maestro Berserker/Criceto/Figlia; Berserker sbranato uccide il lupo piu' vicino (anche Figlia trasformata e Mezzosangue trasformato, il piu' vicino dopo la trasformazione); Sciacallo resuscita il Berserker (muore di nuovo uccidendo l'ultimo lupo -> vince il Villaggio) e la Suocera; Criceto con Eremita/Mezzosangue/Sciacallo/Suocera/Polpo vivi nella vittoria dei lupi (il Criceto conta tra gli abitanti, ruba la vittoria); Veggente: Eremita aura malvagia, Guardia benevola + messaggio dell'Ambasciatore; Cartomante su Ambasciatore: nessun messaggio; Figlia con genitore Guardia che muore (rogo o branco) diventa lupa. Apprendista erede della Figlia: ruolo scarico, nessun genitore (decisione gia' presa, `patchEredita`).
2. **Gallo, Alchimista, Fattucchiera, Sacerdote, Ubriaco, Eremita, Cucciolo, Innocente, Pastore, Apprendista, Polpo, Lupo, Borgomastro (12)**: Sacerdote lega Eremita e Ubriaco inibito dalla Fattucchiera: Ubriaco sbranato stordisce comunque il branco (potere passivo, come per il Mezzosangue), Eremita muore di crepacuore, vendetta del Cucciolo che slitta di una notte (branco stordito) e poi si attua; avvisi della Fattucchiera su Sacerdote ("sceglie altri la prima notte") e Gallo ("agisce di giorno"); Cucciolo unico lupo inibito: "Tutti i lupi vivi sono inibiti"; Gallo salta il giorno col branco stordito; Gallo legato al Polpo bruciato muore di crepacuore (Apprendista del Polpo eredita il Polpo); Apprendista del Cucciolo (e Borgomastro) eredita da adulto e la vendetta parte; Alchimista trascina Gallo/Innocente; Innocente Borgomastro rivelato e bruciato (avviso nuova elezione); Pastore Borgomastro bruciato; belati col Cucciolo e, a Cucciolo morto, col lupo successivo.
3. **Guaritore, Pastore, Spilungone, Scemo, 2 Lupi, Strega, Veggente, Gallo, Medium, Inquisitore, Cortigiana, Cartomante (13)**: Cortigiana muore col cliente Pastore/Inquisitore sbranato; Inquisitore su Cartomante/Cortigiana: aura benevola e potere perso (poi "Ha perso il proprio potere"); Spilungone favorito al rogo: "notte cala senza vittime"; Guaritore resuscita Pastore (belati tornano), Scemo (morto per la rima), Spilungone sbranato, lupo ucciso dalla Strega; Strega: vitale sul Guaritore, mortale su Gallo/lupo; Veggente sul lupo: aura malvagia; Medium vede Pastore/Scemo.
4. **Ladro, Maga, Capobranco, Progenitore, Lupo, Mucca, Polpo, Eremita, Ambasciatore, Guaritore, Innocente, 2 Guardie + Guardia Mannara (12 con le 2 carte extra del Ladro)**: il Ladro dichiara le due carte extra con i menu a tendina; Ladro->Capobranco (Capobranco assegnato in automatico, Maga lo trasforma in maiale, la Mucca lo elenca tra i lupi, il Polpo no), Ladro->Innocente (rivelazione poi senza traccia nel Diario, BUG 2), Ladro->Ambasciatore (poi resuscitato dal Guaritore); Progenitore trasforma il Guaritore che ha appena resuscitato (anche con la vitale); Maga trasforma Eremita e Guardia Mannara.
5. **2 Guardie + Guardia Mannara, Paladino, Veggente Mannaro, Untore, Addolorata, Nonna, Ubriaco, Pifferaio, Strega, Progenitore, Cortigiana, Mezzosangue, Veggente, Villico (16)**: la Guardia Mannara e' casuale, gli scenari la leggono dallo stato; Cortigiana in visita alla Guardia Mannara protetta dal Paladino muore (decisione 2026-10-14) ma vedi BUG 1; Addolorata scambia col rogo di Guardia Mannara ("ora e' Guardia"), Nonna (entra nel branco), Paladino, Veggente, Villico; Pifferaio ipnotizza la Guardia Mannara; Paladino protegge un Mezzosangue sbranato (nessuna trasformazione); Strega uccide la Guardia Mannara; Progenitore trasforma l'Untore sbranato anche con vitale/Paladino; Veggente Mannaro su Guardia/Villico: aura benevola, unto dall'Untore.
6. **Bardo, Cucciolo, Capobranco, Scemo, Polpo, Mezzosangue, Innocente, Berserker, Guardie, Nonna, Spilungone, Antico, Villico, Suocera, Gallo (17)**: Berserker sbranato uccide la Nonna e il Cucciolo matura ("diventa adulto: e' morto il lupo G03"); Antico bruciato: notte maledetta con Cucciolo e Capobranco che cacciano; Mezzosangue sbranato nella notte maledetta diventa lupo; il branco sbrana il suo Cucciolo e la vendetta sopravvive alla notte saltata dal Bardo; Scemo sbaglia la rima, Suocera rivelata al rogo, Gallo salta il giorno, Spilungone favorito al rogo.
7. **Nano, Paladino (o Ladro), Sciacallo, Untore, Inquisitore, Cartomante, Ambasciatore, Pifferaio, Polpo, Spilungone, Criceto, Guaritore, 2 Lupi (13-14)**: Paladino protegge Nano/Sciacallo, il Nano sbranato "non puo' essere sbranato"; Pifferaio ipnotizza Nano e Ambasciatore; Sciacallo e Guaritore resuscitano Untore e Criceto nella stessa notte; Inquisitore su Paladino/Untore perde il potere; Cartomante su Nano; Ladro->Paladino; Criceto+Polpo+lupi: il Polpo conta come abitante.
8. **Cavaliere, Mucca, Chupacabra, Veggente Mannaro, Alchimista, Cortigiana, Boia, Gallo, Figlia, Veggente, 2 Lupi (12)**: Cavaliere si immola per la Mucca sbranata (Figlia col Cavaliere genitore diventa lupa; Cortigiana del cliente "morira' comunque"); Chupacabra su Veggente Mannaro: "non e' un lupo: la caccia fallisce"; Boia giustizia Cortigiana/Gallo; Alchimista trascina Cortigiana/Chupacabra; Veggente Borgomastro bruciato.
9. **Fantasma, Scemo, 2 Guardie + Guardia Mannara, Maga, Cortigiana, 2 Lupi (8)**: Fantasma assegnabile a Guardia Mannara bruciata, Scemo o Cortigiana morti di notte (candidati: i morti del giro); nessun passo notturno per il Fantasma.

## BUG CERTI (tutti minori, Diario)
1. **Voce doppia nel Diario per la Cortigiana che muore perche' i lupi hanno visitato la casa del cliente (cliente protetto o salvato dal Cavaliere).** Passi (mazzo 5): Cortigiana visita la Guardia Mannara, il Paladino la protegge, il branco la sbrana. Diario: "Notte: La Cortigiana G09 muore: il suo cliente G05 e' stato visitato dai lupi." e piu' in basso, dopo l'Alba, "Notte: La Cortigiana G09 muore: i lupi hanno visitato il suo cliente G05." Stesso con il Cavaliere che si immola (mazzo 8). Causa: `assorbe()` in `src/data/log.js:326-329` unisce solo la variante "ucciso|sbranato" della voce dell'effetto (`effettiNotte.js:158-161`) con quella del confronto di stati (`log.js:94-96`); la variante "visitato dai lupi" non e' coperta. Correzione: aggiungere in `assorbe` il caso `muore: il suo cliente X e' stato visitato dai lupi.` -> assorbe `muore: i lupi hanno visitato il suo cliente X.` (o uniformare i due testi).
2. **Rivelazione diurna non scritta nel Diario se il ruolo e' stato preso con il Ladro (Innocente, e per costruzione Boia/Alchimista/Spilungone/Scemo/Suocera).** Passi (mazzo 4): Ladro prende l'Innocente (extra Innocente + Guaritore), all'alba "Eventi speciali" > "L'Innocente si rivela" > G01 > Conferma > Ok: il potere e' consumato (`innocente-rivelato`) ma il Diario non ha nessuna riga "si e' rivelato/a" (con un Innocente assegnato normalmente la riga c'e'). Causa: `log.js:162-167` scrive la rivelazione solo quando `storiaRuoli` guadagna il ruolo (`nuoviInStoria`), ma per il Ladro lo ha gia' dalla notte 1. Correzione: usare la comparsa di `<slug>-rivelato` in `poteriUsati` (o il flag dell'evento) al posto del confronto di `storiaRuoli`.
3. **Pozione vitale della Strega senza bersaglio nel Diario quando il bersaglio e' gia' protetto dal Paladino** (stessa persona). Mazzo 5: Paladino e Strega proteggono G12: "La Strega G15 usa la pozione vitale" (di norma "... su G12"). Causa: il bersaglio non e' salvato, `log.js:129-137` lo deduce dal passaggio a `protetto`, che non avviene due volte. Lo stesso per la pozione mortale su chi non muore (Nano, Antico, Criceto). Correzione: salvare il bersaglio nel potere (come per Guaritore/Sciacallo) o registrare la scelta nel passo.

## DUBBI (con proposta)
1. **Cortigiana con pozione vitale della Strega su se stessa**: la vitale non la salva se il cliente viene sbranato (`risoluzioneNotte.js:161-163`: "la protezione sulla Cortigiana stessa non conta, non e' in casa"). Coerente col commento, ma il testo della Strega dice "protegge un giocatore dalla morte durante quella notte". Proposta: lasciare e annotarlo, oppure far valere la vitale sulla Cortigiana.
2. **Vendetta del Cucciolo con branco stordito o notte saltata dal Bardo**: la vendetta slitta alla prima notte in cui il branco caccia (osservato: notte 2 stordita/saltata, notte 3 "vittima 1 di 2"). Coerente con "si attua la notte dopo"; proposta: lasciare.
3. **Apprendista erede della Figlia dei Lupi**: la nuova Figlia non ha genitore e non puo' sceglierne uno (ruolo "scarico" per decisione). Se il genitore del maestro muore dopo l'ereditarieta' nessuno diventa lupo; proposta: lasciare, oppure far scegliere un genitore all'erede alla prima notte utile.
4. **Criceto conta tra gli abitanti per la parita' dei lupi** (con Criceto + Polpo contro 1 lupo non vince nessuno): gia' deciso ("Criceto in vita non conta" vale solo come condizione di vittoria propria); proposta: documentare.

## NON COPERTO
- cartomante x maga (non valutata); molte coppie "parziale" con ruoli passivi (Eremita, Ubriaco, Nano, Spilungone, Polpo, Pastore, Innocente) senza nessuna interazione diretta costruibile oltre alla presenza.
- Fantasma: lettere dell'alfabeto, voto ai ballottaggi e vittoria "secondo il ruolo in vita" (nessun supporto UI, gia' noto).
- Il Mimo non e' stato usato.

## Coppie valutate (JSON-friendly)
```json
[
  "apprendista x criceto-malvagio: si, ok (Apprendista di maestro Criceto brucia: diventa Criceto e ruba la vittoria)",
  "guardia-mannara x strega: si, ok (Pozione mortale sulla Guardia Mannara)",
  "fattucchiera x sacerdote: si, ok (Avviso 'sceglie altri la prima notte')",
  "criceto-malvagio x suocera: si, ok (vittoria dei lupi con il ruolo in vita: il Criceto ruba la vittoria, il ruolo non cambia il conteggio)",
  "cucciolo-di-lupo-mannaro x pastore: si, ok (Belati col Cucciolo vicino e, dopo la sua morte, col lupo successivo)",
  "cortigiana x fantasma-onnisciente: si, ok (Cortigiana morta di notte candidata al Fantasma)",
  "eremita x guardia: si, ok (Veggente: Eremita aura malvagia, Guardia benevola)",
  "cucciolo-di-lupo-mannaro x ubriaco: si, ok (Ubriaco sbranato stordisce il branco; la vendetta slitta di una notte)",
  "addolorata x guardia-mannara: si, ok (Addolorata scambia con la Guardia Mannara: 'ora e' Guardia')",
  "innocente x pastore: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "eremita x sacerdote: si, ok (Eremita innamorato: crepacuore alla morte del partner)",
  "guardia x veggente-mannaro: si, ok (Veggente Mannaro sulla Guardia: aura benevola)",
  "eremita x innocente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "figlia-dei-lupi x veggente-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "figlia-dei-lupi x guardia: si, ok (Genitore Guardia muore (rogo o branco): la Figlia diventa lupa)",
  "alchimista x cortigiana: si, ok (Alchimista trascina la Cortigiana)",
  "innocente x ladro: si, ok (Ladro prende l'Innocente (BUG minore Diario: rivelazione non registrata))",
  "ambasciatore x figlia-dei-lupi: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "cucciolo-di-lupo-mannaro x villico: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro-capobranco x polpo-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "bardo x cucciolo-di-lupo-mannaro: si, ok (La vendetta del Cucciolo sopravvive alla notte saltata dal Bardo)",
  "eremita x lupo-mannaro-capobranco: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro-capobranco x mucca-mannara: si, ok (La Mucca vede il Capobranco tra i lupi)",
  "lupo-mannaro-capobranco x maga: si, ok (Maga trasforma il Capobranco)",
  "ambasciatore x lupo-mannaro-capobranco: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "guardia x paladino: si, ok (Paladino protegge una Guardia)",
  "boia x cortigiana: si, ok (Boia giustizia la Cortigiana)",
  "addolorata x nonna: si, ok (Addolorata scambia con la Nonna: entra nel branco)",
  "apprendista x berserker: si, ok (Apprendista eredita il Berserker sbranato e il Berserker uccide il lupo piu' vicino)",
  "eremita x sciacallo-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "cortigiana x guardia-mannara: si, ok (Cortigiana muore se i lupi visitano la casa della Guardia Mannara protetta (BUG minore Diario: voce doppia))",
  "guardia-mannara x pifferaio: si, ok (Pifferaio ipnotizza la Guardia Mannara)",
  "cucciolo-di-lupo-mannaro x fattucchiera: si, ok (Cucciolo unico lupo inibito: 'tutti i lupi inibiti')",
  "guardia x ubriaco: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "borgomastro x pastore: si, ok (Pastore Borgomastro bruciato: avviso e belati cessano)",
  "alchimista x gallo-mannaro: si, ok (Alchimista trascina il Gallo)",
  "sciacallo-mannaro x suocera: si, ok (Sciacallo resuscita la Suocera morta di notte)",
  "ambasciatore x innocente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "ambasciatore x ladro: si, ok (Ladro prende l'Ambasciatore)",
  "berserker x figlia-dei-lupi: si, ok (Berserker sbranato uccide la Figlia diventata lupa)",
  "veggente-mannaro x villico: si, ok (Veggente Mannaro su un Villico: aura benevola)",
  "mezzosangue x paladino: si, ok (Mezzosangue protetto: il morso non ha effetto)",
  "gallo-mannaro x spilungone: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "eremita x mucca-mannara: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "gallo-mannaro x suocera: si, ok (Gallo salta il giorno dopo la rivelazione della Suocera)",
  "pastore x spilungone: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "ladro x lupo-mannaro-capobranco: si, ok (Ladro prende il Capobranco e viene trasformato in maiale)",
  "guaritore x maga: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "cartomante x maga: non valutata",
  "cartomante x inquisitore: si, ok (Inquisitore su Cartomante: aura benevola, perde il potere)",
  "guaritore x scemo-del-villaggio: si, ok (Guaritore resuscita lo Scemo morto per la rima)",
  "berserker x mezzosangue: si, ok (Berserker sbranato uccide il Mezzosangue trasformato (lupo piu' vicino))",
  "bardo x scemo-del-villaggio: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "maga x polpo-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "criceto-malvagio x mezzosangue: si, ok (vittoria dei lupi con il ruolo in vita: il Criceto ruba la vittoria, il ruolo non cambia il conteggio)",
  "cucciolo-di-lupo-mannaro x lantico: si, ok (Notte maledetta: il Cucciolo caccia normalmente)",
  "inquisitore x untore: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "ambasciatore x pifferaio: si, ok (Ambasciatore ipnotizzato: nessun effetto)",
  "guaritore x veggente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "guaritore x strega: si, ok (Strega protegge il Guaritore mentre resuscita)",
  "berserker x scemo-del-villaggio: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "guaritore x pastore: si, ok (Pastore resuscitato: i belati tornano)",
  "paladino x veggente-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro-progenitore x maga: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "addolorata x villico: si, ok (Addolorata scambia con un Villico)",
  "ambasciatore x cartomante: si, ok (Cartomante su Ambasciatore: nessun messaggio (solo il Veggente lo innesca))",
  "criceto-malvagio x guaritore: si, ok (Guaritore resuscita il Criceto bruciato)",
  "bardo x polpo-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "cartomante x sciacallo-mannaro: si, ok (Cartomante indaga lo Sciacallo senza anomalie)",
  "criceto-malvagio x eremita: si, ok (vittoria dei lupi con il ruolo in vita: il Criceto ruba la vittoria, il ruolo non cambia il conteggio)",
  "cucciolo-di-lupo-mannaro x lupo-mannaro-capobranco: si, ok (Il branco (Capobranco) sbrana il Cucciolo: vendetta)",
  "cavaliere x mucca-mannara: si, ok (Cavaliere si immola per la Mucca sbranata)",
  "ladro x paladino: si, ok (Ladro prende il Paladino e protegge)",
  "eremita x ubriaco: si, ok (Ubriaco innamorato dell'Eremita sbranato: Eremita muore di crepacuore)",
  "fantasma-onnisciente x scemo-del-villaggio: si, ok (Scemo morto di notte candidato)",
  "spilungone x suocera: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "guardia x suocera: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro-progenitore x untore: si, ok (Progenitore trasforma l'Untore sbranato)",
  "berserker x medium: si, ok (Medium vede la carta Berserker del morto)",
  "bardo x mezzosangue: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "gallo-mannaro x sacerdote: si, ok (Gallo innamorato muore di crepacuore)",
  "lupo-mannaro-progenitore x mucca-mannara: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro x maga: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "untore x veggente-mannaro: si, ok (Veggente Mannaro unto)",
  "medium x pastore: si, ok (Medium vede la carta Pastore)",
  "guaritore x lupo-mannaro: si, ok (Guaritore resuscita un lupo ucciso dalla Strega)",
  "alchimista x chupacabra: si, ok (Alchimista trascina il Chupacabra)",
  "berserker x sciacallo-mannaro: si, ok (Sciacallo resuscita il Berserker; poi muore di nuovo uccidendo il lupo)",
  "bardo x innocente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "mezzosangue x veggente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "berserker x veggente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "gallo-mannaro x ubriaco: si, ok (Gallo salta il giorno con il branco stordito)",
  "addolorata x paladino: si, ok (Addolorata scambia con il Paladino)",
  "cartomante x nano: si, ok (Cartomante vede la carta Nano)",
  "borgomastro x veggente: si, ok (Veggente Borgomastro bruciato)",
  "eremita x suocera: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "gallo-mannaro x inquisitore: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "criceto-malvagio x polpo-mannaro: si, ok (Con Criceto e Polpo vivi il Polpo conta come abitante)",
  "guardia-mannara x innocente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "gallo-mannaro x medium: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "addolorata x veggente: si, ok (Addolorata scambia con il Veggente)",
  "guardia x scemo-del-villaggio: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro x scemo-del-villaggio: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "fantasma-onnisciente x guardia-mannara: si, ok (GM bruciata riceve il Fantasma)",
  "guaritore x lupo-mannaro-progenitore: si, ok (Progenitore trasforma il Guaritore dopo che ha resuscitato)",
  "ambasciatore x nano: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "ambasciatore x berserker: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "paladino x sciacallo-mannaro: si, ok (Paladino protegge lo Sciacallo)",
  "polpo-mannaro x ubriaco: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "sciacallo-mannaro x untore: si, ok (Sciacallo resuscita l'Untore)",
  "gallo-mannaro x veggente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "scemo-del-villaggio x spilungone: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "nano x polpo-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "ambasciatore x lupo-mannaro-progenitore: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "mucca-mannara x polpo-mannaro: si, ok (Il Polpo non e' nell'elenco della Mucca)",
  "eremita x mezzosangue: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "borgomastro x innocente: si, ok (Innocente Borgomastro rivelato e bruciato: avviso nuova elezione)",
  "cartomante x untore: si, ok (Cartomante unta; Cartomante su Untore)",
  "boia x gallo-mannaro: si, ok (Boia giustizia il Gallo)",
  "cortigiana x inquisitore: si, ok (Cortigiana in visita all'Inquisitore sbranato muore; Inquisitore su Cortigiana benevola)",
  "gallo-mannaro x strega: si, ok (Pozione mortale sul Gallo)",
  "cartomante x pastore: si, ok (Cartomante vede la carta del Pastore)",
  "inquisitore x paladino: si, ok (Inquisitore su Paladino: aura benevola, perde il potere)",
  "guardia-mannara x maga: si, ok (Maga trasforma la Guardia Mannara)",
  "fattucchiera x ubriaco: si, ok (Ubriaco inibito sbranato stordisce comunque il branco (potere passivo))",
  "nonna x spilungone: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro x veggente: si, ok (Veggente sul lupo: aura malvagia)",
  "inquisitore x strega: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "eremita x maga: si, ok (Maga trasforma l'Eremita)",
  "innocente x lupo-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "apprendista x figlia-dei-lupi: si, ok (Apprendista erede della Figlia: ruolo scarico (nessun genitore), come da decisione)",
  "criceto-malvagio x sciacallo-mannaro: si, ok (vittoria dei lupi con il ruolo in vita: il Criceto ruba la vittoria, il ruolo non cambia il conteggio)",
  "ambasciatore x medium: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "nonna x scemo-del-villaggio: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "nano x pifferaio: si, ok (Nano ipnotizzato)",
  "lupo-mannaro x strega: si, ok (Pozione mortale sul lupo)",
  "cortigiana x pastore: si, ok (Cortigiana in visita al Pastore sbranato muore)",
  "alchimista x innocente: si, ok (Alchimista trascina un '?' (Innocente) senza anomalie)",
  "innocente x polpo-mannaro: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "lupo-mannaro-progenitore x strega: si, ok (Progenitore trasforma anche chi ha la pozione vitale)",
  "cucciolo-di-lupo-mannaro x innocente: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "guardia-mannara x suocera: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "ambasciatore x mucca-mannara: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "fantasma-onnisciente x maga: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "nano x spilungone: parziale, ok (presenti insieme, nessuna interazione diretta provata)",
  "apprendista x cucciolo-di-lupo-mannaro: si, ok (Apprendista di maestro Cucciolo: eredita da adulto, vendetta del Cucciolo attivata)",
  "guaritore x spilungone: si, ok (Guaritore resuscita lo Spilungone sbranato)",
  "apprendista x borgomastro: si, ok (Apprendista eletto Borgomastro eredita il Cucciolo senza anomalie)",
  "chupacabra x veggente-mannaro: si, ok (Caccia del Chupacabra fallita sul Veggente Mannaro)",
  "fattucchiera x gallo-mannaro: si, ok (Avviso 'agisce di giorno')",
  "nano x paladino: si, ok (Paladino protegge il Nano; morso senza effetto per il Nano)",
  "ambasciatore x guaritore: si, ok (Guaritore resuscita l'Ambasciatore)"
]
```

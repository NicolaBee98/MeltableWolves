# Sesto batch di partite di prova (Mimo, Guardia Mannara, partite complete) - 2026-10-07

Chromium reale (Playwright, 390x844, dev server porta 5521), nessuna modifica al codice. Screenshot in `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2`. Sezioni scritte man mano; in fondo BUG CERTI, DUBBI, NON COPERTO.

## Scenario 1 - Mimo che copia Inquisitore, Boia, Cortigiana
- **Mimo-Inquisitore (mazzo 10: Mimo, Inquisitore, Boia, Cortigiana, 2 Lupi, 4 Villici)**: il passo mostra due blocchi indipendenti "G01 (Mimo)" e "G05", ciascuno con "Chi interrogare". Entrambi interrogano un Villico (G10): per ciascuno compare "Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola" (il Mimo mostra anche "Rispondi all'Inquisitore: no (aura benevola)"). Notte 2: il passo mostra la perdita per entrambi i titolari. Il potere fallisce quindi due volte, una per titolare. **ok**
- **Mimo-Boia (mazzo 8)**: Eventi speciali > "Il Boia giustizia" propone G01 (Mimo) e G02 come attori; G01 giustizia G07 ("G01 si e' rivelato/a: e' il Boia e giustizia G07"), poteriUsati solo su G01; riaprendo il menu resta come unico attore G02, che giustizia G03 con il proprio potere. Rivelazioni e poteri indipendenti, registro con 2 voci corrette, G01 ha storiaRuoli [mimo, boia]. **ok** (nota: G02 riceve ruoloSlug boia gia' alla scelta dell'imitazione, prima di rivelarsi: dato, non visibile).
- **Mimo-Cortigiana con cliente lupo**: un solo gruppo "Chi visita la Cortigiana" (visita in branco, come da Q1 della spec); cliente G03 (lupo) + G05 sbranato: all'alba muoiono G01 (Mimo), G02 e G05. Registro: "G01 (Mimo) e' morto/a di notte", "G02 e' morto/a di notte", nessuna voce duplicata; refresh ok. **ok** (nessuna indicazione della causa "visita a un lupo": coerente con il batch precedente).
- Console: nessun errore/warning. Nessun softlock.

## Scenario 2 - Guardia Mannara con Veggente e Cartomante (mazzo 9: 2 Guardie, Guardia Mannara, Veggente, Cartomante, 2 Lupi, 2 Villici)
- "Le Guardie si riconoscono" elenca i 3 titolari (G03, G04, G05); il ruolo reale e' distribuito dall'app (G04 = Guardia Mannara) senza che il narratore lo scelga: il passo non puo' distinguere le due carte.
- Veggente su Guardia Mannara (e su una Guardia): "Aura benevola" in entrambi i casi (la Guardia Mannara non e' un lupo vero). **ok**
- Cartomante su Guardia Mannara e su Guardia: chiede "G0x e' una Guardia: la carta e' una Guardia o la Guardia Mannara?" (scelta del narratore), sia notte 1 che notte 2; dopo la risposta Avanti prosegue. Notte 2: nessun passo Guardie. Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/e3-cartomante.png`, `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/e4-cart2.png`. **ok / dubbio** (vedi DUBBI 1: in notte 1 Avanti e' abilitato anche senza rispondere alla domanda).
- Conteggio vittoria: alba 2 (2 lupi vs 4) nessun banner; alba 3 con 2 lupi vs Guardia Mannara + Cartomante: "I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro." Quindi la Guardia Mannara e' contata come "resto del villaggio" (vedi DUBBI 2). Registro senza voci duplicate. **ok / dubbio**

## Scenario 3a - partita completa, vittoria lupi (partita dello scenario 2, 3 notti)
- Banner unico all'alba 3 (🏆 una sola volta), accanto "Concludi partita" e "Vai al voto". "Concludi partita" apre la conferma "Concludere la partita e tornare alla Home?" con "Sì, concludi"/"Annulla"; Annulla torna alla schermata dell'alba e il banner resta anche dopo refresh. Con "Sì, concludi" si torna alla Home; stato: tutti i 9 giocatori restano ma azzerati (nessun ruolo, vivi, poteri e storia vuoti), log svuotato, notte e votazione azzerate. "Nuova Partita" mostra il mazzo vuoto "Nel mazzo (0)" (mazzo svuotato: vedi DUBBI 3). Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/e6-alba3.png`, `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/f1-concludi.png`, `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/f2-home.png`. **ok / dubbio**

## Scenario 3b - partita completa, vittoria lupi (9 giocatori: 2 Lupi, Veggente, 6 Villici; 4 notti)
- Dopo "Concludi partita" > "Nuova Partita": i 9 giocatori restano (G01..G09) senza ruolo e vivi, "Inizia la notte" parte pulito (nessuno stato/log/voti residui). Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/g1-giocatori.png`.
- Notte 1 sbranato G04, rogo G05, notte 2 sbranato G06, rogo G07; notte 3 il branco non sceglie nessuno ("Nessuno e' morto questa notte", nessuna conferma richiesta); rogo di G08 porta a 2 lupi contro 2 villici: **nessun banner al rogo/esito** (vittoria solo all'alba); notte 4 senza vittima: all'alba 4 banner unico "I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro." con "Concludi partita". Persistenza dopo refresh ok. Registro: 5 voci corrette (notte/rogo), nessun duplicato. Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/g3-rogo.png`, `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/g3-alba4.png`. **ok**

## Scenario 3c - partita completa, vittoria villaggio (9 giocatori: 2 Lupi, 7 Villici; 3 notti)
- Concludi (con conferma) e Nuova Partita: giocatori tenuti e azzerati, mazzo da rifare. Notte 1 sbranato G04, rogo del lupo G01; notte 2 sbranato G05, rogo dell'ultimo lupo G02: nessun banner al rogo (corretto, solo all'alba). Notte 3: il passo Branco mostra "Chiama comunque G01, G02 per il loro turno, anche se morti" (bluff), poi all'alba 3 un solo banner "Non ci sono piu' Lupi Mannari in vita: vince il Villaggio.", persistente dopo refresh. Registro con 4 voci corrette. Screenshot: `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/h1-rogo2.png`, `/tmp/claude-1000/-home-nicola-personale-my-web-app/16557db9-ecf2-47b3-a746-12148aae50a3/scratchpad/partite2/h2-alba3.png`. **ok**

## Extra - Mimo-Cortigiana con cliente sbranato (non lupo)
- Cliente G05 (villico) sbranato, visita unica del gruppo Cortigiana: muoiono G01 (Mimo) e G02; registro "La Cortigiana G01 muore: il suo cliente G05 e' stato sbranato." e analoga per G02, piu' le due voci "e' morto/a di notte". **ok** (qui la causa e' registrata, a differenza del caso cliente-lupo dello scenario 1 dove restano solo le voci "e' morto/a di notte": vedi DUBBI 4).
- Tentativo precedente (scelta del cliente prima di aver completato "Chi ha questa carta" dei due titolari, con click ravvicinati): all'alba e' morta solo G02 e G01 (Mimo) e' sopravvissuta. Non riprodotto in modo pulito (probabile artefatto di click ravvicinati/doppio toggle dello script); vedi NON COPERTO.

## Console / stabilita'
Nessun errore ne' warning in console in tutti gli scenari; nessun softlock; nessun overflow orizzontale notato nei dump.

## BUG CERTI
Nessun bug certo trovato in questo batch.

## DUBBI (con proposta)
1. **Cartomante su Guardia/Guardia Mannara: "Avanti" e' abilitato anche senza rispondere alla domanda** "e' una Guardia o la Guardia Mannara?" (notte 1, mazzo scenario 2). Proposta: richiedere la risposta (o dichiarare esplicitamente "non so") prima di Avanti, come per gli altri passi con scelta obbligatoria.
2. **Guardia Mannara contata come "resto del villaggio" per la parita' dei lupi** (alba 3: 2 lupi vs Guardia Mannara + Cartomante => vittoria dei lupi), mentre il suo testo dice che vince se vincono i lupi e il banner non la nomina. Proposta: lasciare il conteggio (i "lupi veri" sono 5 ruoli) ma aggiungere al banner/Concludi una riga "La Guardia Mannara vince con i lupi" se in partita.
3. **"Concludi partita" svuota anche il mazzo** ("Nel mazzo (0)"): e' necessario ricomporre tutto il mazzo per rigiocare con gli stessi giocatori. Proposta: tenere il mazzo precedente preselezionato (o offrire "Stesso mazzo").
4. **Cortigiana con cliente lupo (non sbranato): nessuna voce di causa nel registro**, mentre col cliente sbranato c'e' "La Cortigiana ... muore: il suo cliente ... e' stato sbranato". Proposta: aggiungere "muore: il suo cliente G03 e' un lupo".
5. **Notte senza lupi vivi (vittoria villaggio gia' maturata al rogo)**: il passo Branco "Chiama comunque G01, G02 per il loro turno, anche se morti" obbliga a una notte intera prima del banner (coerente con "vittoria solo all'alba", ma lungo). Proposta: lasciare.
6. **Passo Guardie/Guardia Mannara**: l'app assegna a caso quale dei tre giocatori e' la Guardia Mannara (G04 in questa partita) senza che il narratore possa indicarlo; la Cartomante chiede poi al narratore il ruolo reale. Proposta: nel passo "Le Guardie si riconoscono" far selezionare chi e' la Guardia Mannara (o spiegarlo nel testo).

## NON COPERTO
- Mimo-Inquisitore con un titolare che interroga un lupo vero / un cattivo (solo il fallimento doppio su aura benevola).
- Mimo-Boia con rivelazione al rogo del Boia o Boia vero morto; Mimo-Cortigiana con clienti diversi (la visita e' unica e in branco).
- Guardia Mannara con la risposta "Guardia Mannara" della Cartomante; vittoria dei lupi con Guardia Mannara come unica "non lupo" decisiva (parita' limite).
- Selezione del cliente della Cortigiana prima di completare l'assegnazione dei due titolari (comportamento incoerente osservato una volta, non riprodotto).
- Partita con Borgomastro/Fantasma/Ladro fino alla vittoria; "Nuova Partita" a meta' partita senza Concludi.

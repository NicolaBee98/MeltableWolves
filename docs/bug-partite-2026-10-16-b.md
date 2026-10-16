# Batch di partite del 2026-10-16 (b): 115 coppie ancora senza evidenza "si" (elenco coppie3-1)

Chromium reale (Playwright, 390x844, dev server porta 5632, codice a aee5f52), nessuna modifica a `src/`. 8 partite (8-16 giocatori) con 4-6 ruoli "bersaglio" per mazzo, giocate dalla UI: assegnazione, notti, alba, voto, rogo, eventi speciali, Diario. I ruoli che restano "?" (Spilungone, Antico, Suocera, Scemo, Villico, Innocente, Boia, Alchimista) sono stati assegnati con un checkpoint di localStorage (`ruoloSlug` e `storiaRuoli` come li scrive l'app) subito prima del loro uso, e i loro eventi dedicati sono stati giocati dalla UI (rivelazione al rogo, giustizia del Boia, esplosione, rima, Innocente, Suocera, Antico, Spilungone). Le scelte "oggetto" del test (visite, morsi, pozioni, legami, resurrezioni, voti) sono tutte dalla UI. Refresh a meta' passo provato in varie fasi (Gallo, Bardo, alba). Console: nessun errore ne' warning. Nessun overflow orizzontale (controllato a fine di ogni partita).

**Esito: 115 coppie giocate, tutte con verdetto "si"**: 59 con interazione reale provata (morso/pozione/legame/resurrezione/avviso/aura/carta mostrata/eredita'), 56 con **assenza di interazione provata** in uno scenario mirato (i due ruoli sono presenti insieme, uno dei due viene colpito/usato nello stesso passo o nella stessa notte dell'altro, ne' avvisi ne' stati ne' Diario cambiano). Nessuna coppia lasciata "parziale". Decisioni gia' prese non riproposte. **1 BUG CERTO** (minore), nessun dubbio nuovo.

## BUG CERTI
1. **Avviso "Assegna la carta del Fantasma Onnisciente al primo morto" dopo un rogo senza morti, anche se non c'e' nessun morto.** Passi: mazzo con Fantasma e Antico (o Spilungone), notte 1 il branco non uccide (morso protetto/immune) o nessuno muore, giorno 1 si vota l'Antico e si dichiara il rogo ("sopravvive perdendo la prima vita", oppure Spilungone "la notte cala senza vittime"). Esito: sotto il riepilogo compare "⚠️ Assegna la carta del Fantasma Onnisciente al primo morto (menu "Eventi speciali")", ma in Eventi speciali non c'e' la voce "Assegna il Fantasma Onnisciente" (nessun morto). Riprodotto in P5 (Antico, nessun morto) e nel mazzo Spilungone+Fantasma (la voce c'era solo perche' una notte aveva ucciso qualcuno). Causa: `src/features/giorno/Votazione.jsx:514-519` mostra l'avviso con `morteConfermata && ruoliSelezionati.includes('fantasma-onnisciente') && !giocatori.some(eFantasmaOnnisciente)` senza il controllo `morti.length > 0` che invece ha `mostraFantasma` in `src/features/giorno/EventiSpeciali.jsx:195-199`. Proposta: aggiungere `&& giocatori.some((g) => !g.vivo)` (oppure la stessa condizione di `mostraFantasma`) all'avviso.

## DUBBI (con proposta)
Nessuno nuovo. Osservazioni di sola informazione (nessuna azione):
- Nel mazzo con Fantasma, dopo l'assegnazione il Medium che interroga il titolare vede la carta "in vita" (Alchimista), non "Fantasma Onnisciente" (P3): coerente con "vince secondo il ruolo che aveva in vita".
- Con il Cavaliere legato e il Chupacabra senza lupi in vita, l'immolazione e' proposta anche nel passo del Chupacabra (P8) come per il branco: coerente con la decisione.

## NON COPERTO
- Le coppie con Fantasma Onnisciente (con Veggente, Maga, Suocera, Villico, Lantico, Alchimista, Inquisitore): il Fantasma e' uno solo per partita, quindi solo una coppia per partita ha il titolare come "attore"; le altre sono provate come coesistenza (assenza di interazione). Non e' stato giocato il caso "titolare del Fantasma tra i bersagli dei poteri notturni" perche' un morto non e' bersagliabile (nessuna interazione costruibile).
- Il tasto Indietro del telefono e il pulsante "Indietro" non sono stati ripetuti in questa tornata (gia' coperti da 10-14/15). Refresh a meta' passo ripetuto solo in alcune fasi.
- Le coppie con il Mimo non erano nell'elenco.
- "Assenza di interazione": per i ruoli puramente passivi tra loro (Nano, Ubriaco, Eremita, Spilungone, Villico, Innocente, Scemo, Pastore) la prova e' che nessuno stato/avviso/voce del Diario cambia pur colpendo uno dei due nello stesso giorno/notte; non esiste un'azione che li faccia incontrare.

## SCENARI (riassunto dal registro di gioco)
### P1 (16 giocatori, 5 notti): Lupi G01 G02, Criceto G03, Nano G04, Ubriaco G05, Ambasciatore G06, Mezzosangue G07, Gallo G08, Guardia Mannara G09, Guardie G10 G11, Mucca G12; G13 Innocente, G14 Spilungone, G15 Antico, G16 Scemo (rivelati dalla UI)
N1 morso sul Nano: "il Nano non puo' essere sbranato". G1 Innocente si rivela; rogo G14: Spilungone si rivela, notte senza vittime. N2 Ubriaco sbranato: avviso stordimento; Gallo salta il giorno; N3 branco stordito. G3 rogo G15: Antico, maledizione, N4 "agiscono solo i poteri malvagi"; morso sul Mezzosangue: diventa lupo (alba e Diario ok). Scemo sbaglia la rima (alba 4, Diario ok). Rogo dell'Innocente gia' rivelato: dichiarabile. N5 morso sul Criceto: nessun effetto. Ok.
### P2 (13 giocatori, 3 notti + 2 varianti): Cucciolo G01, Capobranco G02, Nonna G03, Eremita G04, Pastore G05, Polpo G06, Bardo G07, Cavaliere G08, Untore G09; G10 Villico, G11 Spilungone, G12 Innocente, G13 Scemo (checkpoint)
N1 Cavaliere lega il Pastore, Untore unge il Polpo, branco sbrana il Villico. Alba "G06 e' stato unto": "Morte per unzione" G06 -> vicini G05 e G07 unti (testo corretto). Giorno 1: Innocente, rogo Spilungone (non muore). N2 morso sul Pastore: "Il Cavaliere si immola", Pastore salvo, nessun belato (vicino Eremita/Bardo). Giorno 2: Scemo muore di rima; rogo Nonna (il Cucciolo diventa lupo). N3 branco sbrana l'Untore. Giorno 3: rogo Innocente, "Il Bardo salta la notte" (poi Diario "inizia a suonare"). Varianti: Cavaliere legato alla Nonna e al Bardo, rogo del protetto: "si immola", protetto salvo. Ok.
### P3 (12 giocatori + Fantasma, 4 notti): Progenitore G01, Lupo G02, Ambasciatore G03, Figlia G04 (genitore G03), Fattucchiera G05, Maga G06, Medium G07, Veggente G08; G09 Alchimista, G10 Boia, G11 Suocera, G12 Villico (checkpoint)
N1 avviso "Non puo' inibire Boia: agisce di giorno"; Maga trasforma l'Ambasciatore (messaggio dall'ambasciatore comunque); il Progenitore trasforma il Villico sbranato. Giorno 1: Boia giustizia il Villico-lupo, Suocera Borgomastro, rogo Alchimista -> esplosione sul Lupo, Fantasma all'Alchimista. N2 Fattucchiera inibisce il Borgomastro Suocera, Medium vede "Alchimista", branco sbrana la Suocera (rielezione, Fattucchiera Borgomastro). N3 Medium vede "Suocera" (inibito: "potere inibito"), branco sbrana l'Ambasciatore: la Figlia diventa lupa, nessun messaggio. N4 Veggente: Figlia-lupa "malvagia", Progenitore "malvagia"; Medium sul Villico trasformato: "Villico"; vincono i lupi. Ok.
### P4 (15 giocatori, 3 notti + variante): Lupo G01, Eremita G02, Nano G03, Ambasciatore G04, Gallo G05, GM G06, Guardie G07 G08, Cartomante G09, Inquisitore G10, VM G11, Guaritore G12, Sciacallo G13, Strega G14, Suocera G15 (checkpoint)
N1 Inquisitore su Nano (perde il potere), Cartomante su Gallo, VM benevolo senza messaggio, Strega vitale sull'Ambasciatore e morso senza effetto. Rogo Inquisitore. N2 Guaritore resuscita l'Inquisitore (resta senza potere), Strega mortale sullo Sciacallo (morto: agisce comunque), Cartomante su Strega, branco sbrana l'Eremita. Rogo Nano. N3 Sciacallo morto resuscita il Nano, Cartomante su Guaritore, branco sbrana la Suocera. Variante: Inquisitore sul Gallo "benevola", Gallo sbranato: "salta il giorno" non offerto. Ok.
### P5 (8 giocatori, 3 notti + variante): Capobranco G01, Gallo G02, Apprendista G03, Paladino G04, Inquisitore G05, Antico G06 (checkpoint), Villici
N1 Paladino protegge l'Antico, morso senza effetto, Apprendista segue l'Inquisitore. Rogo Antico: sopravvive, maledizione; **BUG 1** (avviso Fantasma senza morti). N2 maledetta: Capobranco sbrana l'Antico (seconda vita): muore. Rogo Inquisitore: Apprendista eredita (passo "Vivi: G03, Morti: G05", puo' interrogare di nuovo), Fantasma all'Inquisitore. N3 Paladino protegge il Gallo; Gallo salta il giorno. Variante: maestro Paladino sbranato, erede protegge. Ok.
### P6 (8 giocatori, 4 notti): Lupo G01, Criceto G02, Berserker G03, Bardo G04, Cartomante G05, VM G06, Scemo G07, Villico G08
N1 Cartomante vede Berserker, VM indaga lo Scemo (benevola), morso sul Criceto Borgomastro senza effetto; rogo Criceto: rielezione. N2 branco sbrana la Cartomante, Bardo Borgomastro, Bardo salta la notte 3. N4 Berserker sbranato: avviso "il lupo piu' vicino morira'", muoiono entrambi, vince il Villaggio. Ok.
### P7 (8 giocatori, 2 notti): Ladro G01 (extra Nonna+Villico, sceglie Nonna), Lupo G02, Guardie G03 G04, Cortigiana G05, Pifferaio G06, Spilungone G07, Innocente G08
N1 Cortigiana visita lo Spilungone, Pifferaio ipnotizza Spilungone+Innocente, branco sbrana lo Spilungone: avviso "entrambi moriranno", alba entrambi morti. Innocente si rivela da ipnotizzato; rogo Nonna-Ladro. N2 Pifferaio sbranato: passo "Ipnotizzati" con Vivi/Morti, ok.
### P8 (14 giocatori, 5 notti): Lupo G01, Polpo G02, Mezzosangue G03, Cavaliere G04 (lega il Guaritore), Figlia G05 (genitore Untore), Sacerdote G06 (unisce Veggente+Villico), Mucca G07, Untore G08, Medium G09, Veggente G10, Guaritore G11, Sciacallo G12, Chupacabra G13, Villico G14
N1 Chupacabra uccide l'ultimo lupo, branco sbrana la Mucca, Untore unge la Figlia. Rogo Mezzosangue; N2 Medium vede "Mezzosangue", Guaritore resuscita la Mucca, Chupacabra uccide il Veggente: crepacuore del partner. Rogo Untore: la Figlia diventa lupa; N3 branco sbrana lo Sciacallo, Chupacabra uccide la lupa. Rogo Polpo; N4 Sciacallo morto resuscita il Polpo, Chupacabra sul Guaritore: "Il Cavaliere si immola". N5 Chupacabra uccide il Medium. Ok.

## MATRICE DELLE COPPIE (115)

nonna x villico: si, P2: notte 1 il branco con la Nonna sbrana il Villico (ruolo da checkpoint): muore
boia x fattucchiera: si, P3: la Fattucchiera sceglie il Boia: avviso "Non puo' inibire Boia: agisce di giorno" (nessuna condizione scritta); il Boia giustizia regolarmente
bardo x cavaliere: si, P2 variante: Cavaliere lega il Bardo, rogo del Bardo: "si immola al posto di G07", Bardo sopravvive, Diario corretto
mucca-mannara x scemo-del-villaggio: si, assenza di interazione provata: P1: la Mucca vede solo i lupi in notte 1; lo Scemo sbaglia la rima in alba 4 con la Mucca viva, nessun effetto incrociato
lupo-mannaro-progenitore x villico: si, P3: il Progenitore trasforma il Villico sbranato (resta vivo, diventa Lupo, nessun morto); poi il Boia lo giustizia
berserker x cartomante: si, P6: Cartomante vede la carta "Berserker"
lantico x paladino: si, P5: morso sull'Antico protetto dal Paladino: senza effetto, prima vita intatta
alchimista x medium: si, P3: Alchimista al rogo esplode su un lupo; notte 2 il Medium lo interroga: "Mostra la carta: Alchimista"
guardia-mannara x spilungone: si, assenza di interazione provata: P1: rogo dello Spilungone ("si rivela, la notte cala senza vittime") con la Guardia Mannara viva: nessun effetto su conteggi/vittoria
figlia-dei-lupi x untore: si, P8: Untore (genitore) bruciato: "G05 diventa Lupo Mannaro"; l'Untore l'aveva unta in notte 1
lupo-mannaro-capobranco x untore: si, P2: notte 3 il branco (Capobranco) sbrana l'Untore, nessuna unzione nuova
eremita x guardia-mannara: si, assenza di interazione provata: P4: Eremita sbranato in notte 2, GM invariata
guardia-mannara x lantico: si, assenza di interazione provata: P1: rogo dell'Antico (maledizione), notte 4 con soli poteri malvagi: la Guardia Mannara non ha passi notturni e non cambia nulla
fantasma-onnisciente x veggente: si, assenza di interazione provata: P3: Fantasma assegnato (rogo Alchimista), Veggente continua a indagare in notti 2-4 (messaggi e aure normali)
innocente x mucca-mannara: si, assenza di interazione provata: P1: l'Innocente si rivela e il rogo resta dichiarabile; la Mucca (prima notte) non e' coinvolta
ladro x nonna: si, P7: carte extra Nonna e Villico, il Ladro sceglie Nonna: passo Nonna con lui, branco con Nonna
pifferaio x spilungone: si, P7: Pifferaio ipnotizza lo Spilungone; sbranato muore ipnotizzato
boia x villico: si, P3: Boia giustizia il Villico trasformato in lupo ("Il Boia G10 giustizia G12")
bardo x spilungone: si, assenza di interazione provata: P2: Bardo salta la notte (giorno 3) con lo Spilungone vivo (rivelato giorno 1)
ambasciatore x lupo-mannaro: si, P4: morso sull'Ambasciatore protetto dalla Strega: "senza effetto", alba senza annunci
lupo-mannaro-capobranco x villico: si, P2: il branco con il Capobranco sbrana il Villico in notte 1
cucciolo-di-lupo-mannaro x spilungone: si, assenza di interazione provata: P2: rogo Spilungone con il Cucciolo vivo: il Cucciolo non matura (nessun lupo morto)
guardia x nano: si, P1: morso sul Nano con le Guardie vive: "il Nano non puo' essere sbranato", nessuna interazione con le Guardie
medium x suocera: si, P3: Medium interroga la Suocera morta: "Mostra la carta: Suocera"; inibito dalla Fattucchiera lo stesso passo mostra "potere inibito"
apprendista x inquisitore: si, P5: Inquisitore bruciato (aveva perso il potere): l'Apprendista eredita e interroga di nuovo ("no (aura benevola)"), passo "Vivi: G03 / Morti: G05"
medium x mezzosangue: si, P8: Medium interroga il Mezzosangue bruciato: carta "Mezzosangue"
innocente x villico: si, assenza di interazione provata: P2: Innocente si rivela in alba 1, Villico gia' sbranato: nessun legame
cavaliere x innocente: si, assenza di interazione provata: P2: Innocente si rivela e poi viene bruciato con il Cavaliere vivo legato a un altro: nessuna immolazione
eremita x lupo-mannaro: si, P4: il Lupo sbrana l'Eremita (notte 2): muore normalmente
guardia-mannara x suocera: si, assenza di interazione provata: P4: Suocera sbranata in notte 3 con la GM viva
polpo-mannaro x untore: si, P2: Untore unge il Polpo; "Morte per unzione" in alba 1: muore e unge i vicini G05/G07
guardia-mannara x nano: si, P1: morso sul Nano con la Guardia Mannara viva: nessun effetto, nessuna interazione
cavaliere x pastore: si, P2: notte 2 il branco sbrana il Pastore legato: "Il Cavaliere si immola al posto di G05", Pastore salvo
fantasma-onnisciente x maga: si, assenza di interazione provata: P3: Maga trasforma altri dopo l'assegnazione del Fantasma; poi bruciata senza riproporre il promemoria
fantasma-onnisciente x lantico: si, P5: rogo dell'Antico (prima vita, nessun morto) mostra comunque "Assegna la carta del Fantasma al primo morto": vedi BUG 1
cortigiana x spilungone: si, P7: Cortigiana visita lo Spilungone, branco lo sbrana: avviso "entrambi moriranno", alba entrambi morti
nano x suocera: si, assenza di interazione provata: P4: Suocera sbranata, Nano resuscitato dallo Sciacallo: nessun legame
ambasciatore x lupo-mannaro-progenitore: si, assenza di interazione provata: P3: notte 1 Progenitore trasforma e Veggente indaga benevolo: il messaggio dall'Ambasciatore arriva comunque
eremita x scemo-del-villaggio: si, assenza di interazione provata: P2: Scemo sbaglia la rima con l'Eremita vivo
boia x suocera: si, assenza di interazione provata: P3: Boia (dopo la giustizia) e Suocera (Borgomastro, sbranata) coesistono senza interferenze
ambasciatore x ubriaco: si, assenza di interazione provata: P1: Ubriaco sbranato (avviso stordimento, notte 3 stordita) con l'Ambasciatore vivo: nessun annuncio dell'Ambasciatore (serve il Veggente)
inquisitore x nano: si, P4: Inquisitore interroga il Nano: "no (aura benevola)", perde il potere (Diario)
medium x veggente: si, assenza di interazione provata: P3: Medium (carta dei morti) e Veggente (aure) agiscono nelle stesse notti 2-4: la Maga trasforma il Veggente e continua a indagare, il Medium inibito mostra "potere inibito" senza toccare il Veggente
ambasciatore x criceto-malvagio: si, assenza di interazione provata: P1: morso sul Criceto senza effetto con l'Ambasciatore vivo
lupo-mannaro-capobranco x scemo-del-villaggio: si, assenza di interazione provata: P2: Scemo muore di rima, Capobranco vivo: nessun effetto
ambasciatore x spilungone: si, assenza di interazione provata: P1: Spilungone al rogo con l'Ambasciatore vivo, nessun annuncio
alchimista x suocera: si, assenza di interazione provata: P3: Alchimista esplode con la Suocera viva (Borgomastro): nessun effetto sulla Suocera
sacerdote x veggente: si, P8: Veggente ucciso dal Chupacabra, il partner muore di crepacuore all'alba
cucciolo-di-lupo-mannaro x scemo-del-villaggio: si, assenza di interazione provata: P2: Scemo muore di rima, Cucciolo vivo: nessun effetto
bardo x berserker: si, P6: Bardo salta la notte 3 (Berserker salvo), notte 4 Berserker sbranato: avviso "G01 (il lupo piu' vicino) morira'", muoiono entrambi
ambasciatore x mucca-mannara: si, assenza di interazione provata: P1: la Mucca vede i lupi, l'Ambasciatore non e' un lupo e non compare
fantasma-onnisciente x inquisitore: si, P5: Fantasma assegnato all'Inquisitore bruciato (candidati Inquisitore e Antico morto di notte)
alchimista x fantasma-onnisciente: si, P3: primo morto al rogo e' l'Alchimista (esplode su un lupo): "G09 riceve la carta del Fantasma", il Medium lo vede ancora come Alchimista (ruolo in vita)
bardo x innocente: si, assenza di interazione provata: P2: rogo dell'Innocente (giorno 3) e subito "il Bardo salta la notte": due eventi dello stesso giorno indipendenti
nano x ubriaco: si, assenza di interazione provata: P1: notte 1 morso sul Nano (immune), notte 2 Ubriaco sbranato (stordimento): due regole di immunita'/stordimento indipendenti
eremita x pastore: si, P2: Pastore adiacente all'Eremita (G04) e a Bardo/Polpo: nessun belato (l'Eremita non e' un lupo), alba 2 senza annunci
gallo-mannaro x paladino: si, P5: Paladino protegge il Gallo, morso senza effetto, poi il Gallo salta il giorno
criceto-malvagio x scemo-del-villaggio: si, assenza di interazione provata: P1: Scemo muore di rima, morso sul Criceto senza effetto in notte 5
criceto-malvagio x spilungone: si, assenza di interazione provata: P1: rogo Spilungone senza morti, morso sul Criceto senza effetto
criceto-malvagio x innocente: si, assenza di interazione provata: P1: Innocente rivelato poi bruciato, morso sul Criceto senza effetto
innocente x spilungone: si, assenza di interazione provata: P1: Innocente (alba 1) e Spilungone (rogo 1) nello stesso giorno: due rivelazioni indipendenti, Diario corretto
gallo-mannaro x scemo-del-villaggio: si, P1: dopo "Il Gallo salta il giorno" (giorno 2, notte 3 stordita) l'evento Scemo e' ancora disponibile al giorno 3/alba 4 e funziona (Gallo non riappare)
guardia-mannara x innocente: si, assenza di interazione provata: P1: Innocente rivelato/bruciato con la Guardia Mannara viva
eremita x innocente: si, assenza di interazione provata: P2: Innocente rivelato con l'Eremita vivo
scemo-del-villaggio x veggente-mannaro: si, P6: il Veggente Mannaro indaga lo Scemo: aura benevola; poi lo Scemo sbaglia la rima
spilungone x ubriaco: si, assenza di interazione provata: P1: Spilungone rivelato (giorno 1) poi Ubriaco sbranato (notte 2): nessun legame
fantasma-onnisciente x suocera: si, assenza di interazione provata: P3: Suocera muore e si rivela dopo l'assegnazione del Fantasma, che non viene riproposta
apprendista x paladino: si, P5 variante: maestro Paladino sbranato, "G03 eredita il ruolo di Paladino", notte 2 passo Paladino ("Vivi: G03, Morti: G04") e protegge
figlia-dei-lupi x veggente: si, P3: il Veggente indaga la Figlia diventata lupa: "Aura malvagia"
berserker x scemo-del-villaggio: si, assenza di interazione provata: P6: Scemo muore di rima con il Berserker vivo, il lupo piu' vicino non e' toccato
cavaliere x nonna: si, P2 variante: Cavaliere lega la Nonna, rogo Nonna: "si immola al posto di G03", Nonna sopravvive
ambasciatore x figlia-dei-lupi: si, P3: genitore Ambasciatore sbranato: "G04 e' la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro"; nessun messaggio ambasciatore dopo
guardia x nonna: si, assenza di interazione provata: P7: Guardie si riconoscono tra loro, la Nonna non compare; Nonna bruciata al giorno 1
ambasciatore x maga: si, P3: Ambasciatore trasformato in maiale: il messaggio dall'Ambasciatore arriva comunque (alba 1)
ambasciatore x innocente: si, assenza di interazione provata: P1: Innocente si rivela con Ambasciatore vivo, nessun annuncio
gallo-mannaro x mezzosangue: si, assenza di interazione provata: P1: Mezzosangue sbranato in notte 4 (diventa lupo) dopo che il Gallo ha usato il potere: nessuna interferenza
guaritore x inquisitore: si, P4: Guaritore resuscita l'Inquisitore bruciato: resta senza potere ("Ha perso il proprio potere dopo un'indagine inutile")
innocente x pifferaio: si, P7: Innocente ipnotizzato si rivela (evento), resta ipnotizzato
fattucchiera x suocera: si, P3: la Fattucchiera inibisce la Suocera Borgomastro (condizione inibito scritta e tolta, Diario ok); poi sbranata
cartomante x guaritore: si, P4: Cartomante vede la carta "Guaritore" (notte 3)
eremita x suocera: si, assenza di interazione provata: P4: Eremita e Suocera morti in notti diverse, nessun effetto reciproco
polpo-mannaro x sciacallo-mannaro: si, P8: lo Sciacallo (morto) resuscita il Polpo bruciato
ambasciatore x strega: si, P4: pozione vitale sull'Ambasciatore, morso senza effetto, Diario "usa la pozione vitale su G04"
innocente x lupo-mannaro-capobranco: si, assenza di interazione provata: P2: Innocente rivelato/bruciato con il Capobranco vivo
bardo x polpo-mannaro: si, P2: il Polpo muore per unzione e unge il vicino Bardo (G07); poi il Bardo usa il potere regolarmente
cartomante x strega: si, P4: Cartomante vede la carta "Strega"
untore x villico: si, assenza di interazione provata: P2: Untore unge il Polpo, il Villico (sbranato notte 1) non e' coinvolto
lantico x nano: si, assenza di interazione provata: P1: rogo dell'Antico (maledizione) con il Nano vivo: il Nano non ha poteri notturni, resta immune al morso (notte 1/5)
cavaliere x chupacabra: si, P8: Chupacabra (nessun lupo vivo) caccia il protetto: "Il Cavaliere si immola ... (colpito dal Chupacabra)"
lupo-mannaro-progenitore x veggente: si, P3: il Veggente indaga il Progenitore: "Aura malvagia"
mezzosangue x nano: si, assenza di interazione provata: P1: notte 1 morso sul Nano (nessun effetto), notte 4 morso sul Mezzosangue (diventa lupo): due immunita'/regole distinte
borgomastro x fattucchiera: si, P3: Fattucchiera eletta Borgomastro (G05) poi inibisce altri: nessun conflitto, elezione nel Diario
lantico x mucca-mannara: si, assenza di interazione provata: P1: maledizione dell'Antico, la Mucca (solo prima notte) non e' toccata
nano x sciacallo-mannaro: si, P4: lo Sciacallo (morto per pozione mortale) resuscita il Nano bruciato, "G03 e' stato resuscitato"
guardia x mezzosangue: si, assenza di interazione provata: P1: Mezzosangue diventa lupo con le Guardie vive: nessun avviso/effetto sulle Guardie
bardo x borgomastro: si, P6: Bardo eletto Borgomastro, poi "Il Bardo salta la notte" (Diario)
eremita x lupo-mannaro-capobranco: si, assenza di interazione provata: P2: Eremita (aura malvagia solo per il Veggente, assente) non cambia le scelte del branco
gallo-mannaro x inquisitore: si, P4 variante: Inquisitore interroga il Gallo: "no (aura benevola)", perde il potere; il Gallo poi sbranato non offre piu' "salta il giorno"
guardia x ubriaco: si, assenza di interazione provata: P1: Ubriaco sbranato, Guardie vive: nessuna interazione
lantico x lupo-mannaro-capobranco: si, P5: morso protetto senza effetto (notte 1), notte 2 maledetta: Capobranco sbrana l'Antico, seconda vita, muore
sciacallo-mannaro x strega: si, P4: Strega mortale sullo Sciacallo; lo Sciacallo morto "agisce comunque" e resuscita
nonna x polpo-mannaro: si, assenza di interazione provata: P2: Polpo e Nonna nello stesso branco/mazzo: nessun Veggente, il Polpo non accieca nessuno; Polpo morto per unzione, Nonna poi al rogo
pastore x spilungone: si, assenza di interazione provata: P2: nessun belato con Spilungone vicino, Spilungone poi rivelato
innocente x pastore: si, assenza di interazione provata: P2: Innocente rivelato con Pastore vivo: nessun effetto
borgomastro x criceto-malvagio: si, P6: Criceto eletto Borgomastro, morso senza effetto; bruciato: rielezione richiesta
gallo-mannaro x guardia-mannara: si, assenza di interazione provata: P1: Gallo (gesto notte 1, salto del giorno) e Guardia Mannara (riconosce i colleghi) senza legami
borgomastro x suocera: si, P3: Suocera Borgomastro sbranata: "era il Borgomastro: il villaggio dovra' eleggerne uno nuovo", Suocera si rivela, rielezione
gallo-mannaro x mucca-mannara: si, assenza di interazione provata: P1: Gallo salta il giorno con la Mucca viva: nessun effetto
guaritore x mucca-mannara: si, P8: Guaritore resuscita la Mucca sbranata in notte 1
ambasciatore x veggente-mannaro: si, P4: il Veggente Mannaro indaga un benevolo con l'Ambasciatore vivo: nessun annuncio (solo per il Veggente)
cartomante x gallo-mannaro: si, P4: Cartomante vede "Gallo Mannaro"
fantasma-onnisciente x villico: si, P3: tra i candidati al Fantasma compare anche il Villico morto per giustizia del Boia (non rogo); assegnato all'Alchimista
mezzosangue x spilungone: si, assenza di interazione provata: P1: Spilungone rivelato, Mezzosangue poi sbranato: indipendenti
guardia x innocente: si, assenza di interazione provata: P1: Innocente rivelato, Guardie vive: nessuna interazione
chupacabra x medium: si, P8: il Chupacabra uccide il Medium (notte 5), Medium morto "agisce comunque" nei passi

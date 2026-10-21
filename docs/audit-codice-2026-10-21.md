# Audit del codice — duplicazioni, codice morto, ridondanze, ottimizzazioni — 2026-10-21

**Stato: proposta da approvare. Nessun file del codice è stato modificato.**

Metodo: quattro analisi indipendenti in parallelo (notte, dati/stato, UI giorno/alba/mazzo/libretto/log/giocatori, CSS/asset/dipendenze/tooling), lettura completa dei file, grep su `src/` e `scripts/` per ogni affermazione "nessun chiamante" (i test esclusi dai chiamanti). Ho poi ricontrollato a mano un campione delle segnalazioni (codice morto, duplicati md5, URL dei font, `impostaGiocatoriConCommit`, `reale = true`, `conPotereUsato`, `nightSteps`): tutte confermate.

Situazione di partenza: 62 file di test, **1005 test passano**. Bundle JS principale 359 KB (110 KB gzip). Le segnalazioni duplicate fra le quattro analisi sono state unite.

**Giudizio complessivo:** il codice è già abbastanza pulito. Tutte le classi CSS sono usate, ogni dipendenza ha un utilizzatore e non ci sono problemi di prestazioni che contino con 5–25 giocatori. Il guadagno reale sta in:
- circa 400 righe di JS e JSX copiate e incollate o morte;
- circa 0,5 MB di asset scaricati e messi in cache da ogni utente senza che servano.

Per approvare, indica gli ID (es. "ok B, C1–C6, E1–E3; no F") o interi blocchi.

---

## A. Possibili bug emersi durante l'analisi (fuori ambito, li segnalo)

| ID | Dove | Problema | Correzione proposta |
|---|---|---|---|
| A1 | `src/features/giorno/Votazione.jsx:647` | Il `<SezioneMorti>` della fase di voto non riceve `ignotiVillici`, che invece la copia nella fase di esito (`:545`) passa. Così in fase di voto un morto "?" non viene mai mostrato come Villico, anche quando potrebbe essere solo quello. Sembra una dimenticanza dovuta alla duplicazione (vedi C3). | Passare `ignotiVillici` (si risolve da solo con C3). |
| A2 | `index.html` (URL Google Fonts) e `src/index.css:243` | I pulsanti usano Nunito con peso 800, ma l'URL carica solo 400/600/700, quindi il browser ripiega su 700. Baloo 2 con peso 800 viene invece caricato ma nessuna regola lo usa. | URL `Baloo+2:wght@500;700&family=Nunito:wght@400;600;700;800`, oppure pulsanti a 700. |
| A3 | `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx:28-37` | Con il Sacerdote e nessun candidato compare un pulsante "Chiudi" che non fa nulla: l'unico chiamante passa `onSalta={() => {}}`. Stesso schema in `AzioneMimo.jsx:59`. | Togliere il pulsante e lasciare solo il messaggio (va aggiornato `SceltaDoppiaGiocatore.test.jsx:50`). |
| A4 | `src/features/giorno/GiornoPanel.jsx:154-158` | Il commento dice che "Annulla morte" non disfa le conseguenze a catena. È falso: `annullaMorte` in `usePartita.js:162+` le ripristina dallo snapshot, e `AlbaPanel.jsx:128` e il testo UI in `EventiSpeciali.jsx:468` dicono correttamente il contrario. | Correggere il commento. |

---

## B. Codice morto (rischio basso: si cancella, il comportamento non cambia)

| ID | Dove | Cosa | Righe |
|---|---|---|---|
| B1 | `src/data/nightSteps.js:117-181`, `:273` | Tutta la logica del passo "assegna-restanti". `RUOLI_ASSEGNA_RESTANTI` vale sempre `[]`, quindi il passo non viene mai inserito, e un test (`nightSteps.test.js:10-11`) verifica proprio che non esista. `RUOLI_RIVELAZIONE_GIORNO` e `RUOLI_RIVELAZIONE_ALLA_MORTE` non sono importati da nessuno. Nota: oggi questa logica servirebbe solo a "far ricomparire il passo da sola" se un giorno si aggiungesse un ruolo senza passo dedicato, una flessibilità mai usata. Vanno corretti anche i commenti che la citano (`nightSteps.js:9-11`, `MazzoBuilder.jsx:29`, `Votazione.jsx:27`). | ~50 |
| B2 | `src/features/notte/NightSequencer.jsx:645`, `:792-801` | `impostaGiocatoriConCommit` e il prop `impostaGiocatori` passato alle azioni: nessuna azione lo legge (`impostaGiocatori` resta necessario in `riapriDa`). | ~11 |
| B3 | `src/features/notte/azioni/AzioneRivelaRuolo.jsx:55` | `const reale = true` rende irraggiungibili i rami a `:96`, `:138` e `:19`, e anche l'import di `ruoloPerDisplay`. Il commento a `:132-133` contraddice il codice. | ~6 |
| B4 | `src/data/effettiNotte.js:265-269` | `conPotereUsato`: zero chiamanti, nemmeno nei test. È identica a `conPotere` (`eventiSpeciali.js:64`). | 5 |
| B5 | `src/data/eventiSpeciali.js:4-11` | `RIVELAZIONE_CONTESTUALE_AL_POTERE` con il suo commento: mai usata. | 8 |
| B6 | `src/data/roles.js:188-190` | `fazioneDi`: zero chiamanti (`nightSteps.js:213` fa la stessa cosa partendo dallo slug). | 3 |
| B7 | `src/features/notte/azioni/AzioneIndagine.jsx:14`, `azioni/index.js:87`, `AzioneMedium.jsx:11` | Prop `etichettaAttore` di AzioneIndagine: dichiarato e passato, mai letto (resta in AzioneRivelaRuolo, dove è usato). | 3 |
| B8 | `src/components/PulsanteTieni.jsx:12-15` | Funzione `annulla` mai usata (`ferma` fa la stessa cosa). | 4 |
| B9 | Import inutilizzati | `RuoloIcona` in `EventiSpeciali.jsx:3`, `eMimoCopiante` in `eventiSpeciali.js:1`, `ROLES` in `risoluzioneNotte.js:1`. | 3 |
| B10 | `export` superflui | `RUOLI_IMMUNI_AL_BRANCO` (`effettiNotte.js:10`) e `propagaMorti` (`usePartita.js:56`) sono usati solo nel proprio file. `DURATA_TIENI_MS` (`PulsanteTieni.jsx:3`) è esportato ma `src/test/tieni.js` ripete 1300 a mano: meglio importarlo lì. | 0 |
| B11 | `src/features/giorno/TimerSpareggio.jsx:8, 12-13` | `intervalRef` è letto solo dentro il proprio effect: basta una costante locale. | 2 |
| B12 | `src/features/mazzo/SfogliaMazzo.jsx:15-17` | La logica che riporta il focus su `prima` non può funzionare: chi apre Sfoglia viene smontato prima, e il ritorno del focus lo fa già `MazzoGalleria.jsx:20-25` (testato). | 3 |
| B13 | `src/features/giorno/EventiSpeciali.jsx:23, 43-87` | Flessibilità mai usata in `EventoUnGiocatore`/`EventoDueGiocatori`: `richiedeConferma` non viene mai passato, `escludiAttoreDaBersagli` è sempre `true`, `candidatiBersaglio` è sempre `vivi`, e c'è un fragment con un solo figlio. | ~8 |
| B14 | `src/data/scalePersonaggi.json` + `scripts/misura-personaggi.mjs:100-104` | I campi `spessore` e `fattore` non vengono mai letti e sono costanti su tutte le 70 voci. Si smette di scriverli e si rigenera il file (lo script è stato verificato: rigenera un file identico byte per byte). | 140 (JSON) |
| B15 | `src/index.css:286, 297-301, 1590` | Regole per `<textarea>`, che nessun componente usa. | ~7 |
| B16 | `src/index.css` (variabili) | `--surface-soft`, `--accent-soft` e `--warn-border` non sono mai lette. `--accent-contrast`, `--accent` e `--surface` sono ridichiarate con lo stesso valore di `:root` nei blocchi `data-fase`. `--font-logo` è uguale a `--font-heading` e il suo unico uso è ridondante. Le voci di palette `--pal-marrone/acqua/grigio` non sono usate: le terrei come documentazione. | ~19 |
| B17 | Commenti obsoleti | `nightSteps.js:150` (cita `autoAssegnaVillici`, oggi `autoAssegnaRuoliRimasti`); `assetRuoli.js:209` (cita `altezzaNaturalePersonaggio`, che non esiste); `AzioneCondizioneSingola.jsx:5` (`azionePatches`); `AssegnaRuolo.jsx:180` (`night-sequencer__avviso`); `NightSequencer.jsx:1046-1050` (funzione "Possibile azione" rimossa); `AzioneMimo.jsx:5-6` (elenco dei non imitabili incompleto); `usePartita.js:9-13`; `EventiSpeciali.jsx:150-151` (commento sopra la riga sbagliata); i commenti `eslint-disable-next-line` (7 punti), dato che ESLint non è configurato. | ~20 |

**Totale B: ~150 righe JS/CSS + 140 righe JSON.**

---

## C. Duplicazioni (rischio basso: si usa codice che già esiste)

| ID | Dove | Cosa | Proposta | Righe |
|---|---|---|---|---|
| C1 | `AzioneResuscita.jsx:61-78`, `AzioneLegame.jsx:53-68`, `AzioneCondizioneSingola.jsx:63-78`, `AzioneChupacabra.jsx:97-113`, `AzioneCortigiana.jsx:30-46`, `AzioneStrega.jsx:97-112` e `121-142`, `AzioneRivelaRuolo.jsx:222-236`, `Votazione.jsx:486-501` | 9 copie a mano del markup che `components/SceltaGiocatore` già produce. `AzioneMimo` lo usa già così. Non ci sono regole CSS né test sulle classi interne. | `<SceltaGiocatore … selezionatoEsternoId={x ?? null} mostraSalta={false} />`. Il `?? null` serve a mantenere `aria-pressed`. | ~95 |
| C2 | `GiornoPanel.jsx:45-62, 91-109, 142-145, 159-161` e `AlbaPanel.jsx:56-93, 131-133` | `dichiaraRivelazione`, `dichiaraElezioneBorgomastro`, `dichiaraScemoSbaglia`, `dichiaraMorteUnzione` e `dichiaraAnnullaMorte` sono copiate fra i due pannelli. Il round assoluto passato da App è lo stesso. | Spostarle in `giorno/annullaMorte.js`, accanto a `dichiaraColpo` e `dichiaraBoiaGiustizia`, che seguono già questo schema. | ~40 |
| C3 | `Votazione.jsx:527-551` e `:630-652` | Due blocchi `<EventiSpeciali>` + `<SezioneMorti>` identici, che cambiano solo per `contesto` e `candidatiRogo` (da qui nasce A1). | Un unico oggetto `eventiProps` condiviso. | ~15 |
| C4 | `MazzoBuilder.jsx:179-237` | Quattro rami che disegnano lo stesso pulsante chip "disponibile". | Un solo pulsante con `disabled` e `onClick` calcolati. | ~35 |
| C5 | `AzioneLadro.jsx:82, 150-171, 180-207, 216-226` | `entrambiLupi` duplica l'helper `ladroDeveScambiare` esportato dallo stesso file. Due `<select>` identici. Quattro pulsanti chip scritti a mano. | Usare l'helper, `[0, 1].map(…)` e una lista di carte mappata. | ~25 |
| C6 | `LogImpostazioniPopup.jsx:87-134` | Sei blocchi checkbox da 8 righe ciascuno. | Mappare un array `[valore, onCambia, testo]` (l'API dei prop non cambia). | ~30 |
| C7 | `primaVitaAntico` (`eventiSpeciali.js:91`) riscritto in linea | `risoluzioneNotte.js:92`, `effettiNotte.js:259` e `:391`, `annullaMorte.js:74`, `Votazione.jsx:234`, `EventiSpeciali.jsx:178` (gli ultimi due lo importano già). Anche la patch "l'Antico diventa Villico" è copiata in `effettiNotte.js:359-365` e `annullaMorte.js:74-80`. | Usare l'helper ed esportare `anticoDiventaVillico(g, giorno)`. | ~10 |
| C8 | Altri helper riscritti in linea | `mortoStanotte`: copia locale in `AzioneResuscita.jsx:22`. `eColpoLetale`: `AzioneBrancoLupi.jsx:77`, che già lo importa. `cavalieriDi`: `effettiNotte.js:112-114`, che già lo importa. `applicaPatchMap`: `AzioneRivelaRuolo.jsx:110, 167`, `AzioneBrancoLupi.jsx:228`. `nomeRuolo`: `AzioneCondizioneSingola.jsx:81`, `Votazione.jsx:33, 46`, e una copia locale in `AzioneRivelaRuolo.jsx:18-20`. `nomeDi`: `log.js:238, 263`. Ex-Antico: `Votazione.jsx:49` (= `ruoloIconaGiocatore`). "Aggiungi senza duplicati": `AzioneResuscita.jsx:52`, `AzioneAddolorata.jsx:116` (= `conPotere`). | Importare gli helper esistenti. | ~20 |
| C9 | `AzioneChupacabra.jsx:48-55`, `AzioneRivelaRuolo.jsx:73-80` | Annullamento a mano dell'uso della notte con `lastIndexOf` + `splice`. | `annullaUsoStanotte` (`effettiNotte.js:322`), come fa già `AzioneIndagine.jsx:55-56`. | ~8 |
| C10 | `mazzoCompleto.js:6, 20` | `COPIE` ripete `VARIANTI_PERSONAGGIO` (`assetRuoli.js:102-106`), e il percorso costruito a mano ripete `cartaFisicaPath`. | Riusare entrambi. | ~4 |
| C11 | `FAZIONI_ORDINE` in `MazzoBuilder.jsx:8`, `MazzoGalleria.jsx:6`, `mazzoCompleto.js:8`; mappa delle icone di fazione in `MazzoBuilder.jsx:18-23` e `Libretto.jsx:21-27` | Costanti definite più volte. | Esportarle una sola volta da `assetRuoli.js`. Le etichette restano diverse, è voluto. | ~12 |
| C12 | `AzioneInquisitore.jsx:77-91`, `AzioneIndagine.jsx:95-109` | Stesso "chip d'indagine colorato con l'esito". In Inquisitore inoltre `giaUsato` coincide con `Boolean(indagineStanotte)`. | Un piccolo `ChipsIndagine` condiviso e l'eliminazione di `giaUsato`. | ~12 |
| C13 | `AzioneChupacabra.jsx:29-34`, `AzioneBrancoLupi.jsx:136-141` | Effect "invia i log a `impostaEventiAvanti`" copiato. | Hook `useEventiAvanti` da 5 righe. | ~5 |
| C14 | `AzioneChupacabra.jsx:46-47` = `63-64`, `57-58` = `67-68`; `AssegnaRuolo.jsx:97/101` (stessa chiamata nei due rami) e `setAvviso(null)` ripetuto 4 volte | Righe ripetute dentro lo stesso file. | Una funzione locale e una sola chiamata. | ~10 |
| C15 | `index.css:952-1037` | 11 regole di colore dei chip con soli 4 contenuti diversi. Inoltre `.app` è spezzata in due blocchi (`:160`, `:179`), `.eventi-speciali__icona` ha due blocchi adiacenti (`:1425`, `:1431`) e `legend` (`:310`) ripete il font. | Selettori raggruppati con le stesse specificità, più l'unione dei blocchi. | ~25 |
| C16 | `Libretto.jsx:86-112` | `SezioneFazioni` e `SezioneCaratteristiche` sono la stessa lista "icona + testo". | Un unico `ListaIcone`. | ~10 |

**Totale C: ~355 righe.**

---

## D. Semplificazioni minori (rischio basso)

| ID | Dove | Cosa | Righe |
|---|---|---|---|
| D1 | `NightSequencer.jsx:887-890` e `911-914`; `:786-787, 798-799, 859-860, 917-918` | `vaiAvanti` e `passaAllaNotteSuccessiva` iniziano con le stesse 4 righe. La condizione `assegnazioneIncompleta \|\| sceltaObbligatoria \|\| ladroObbligato` compare 4 volte (a `:1152` il primo termine è sempre falso). La coppia `commitSelezioniRuolo(...)` + `setSelezioniRuolo({})` compare 4 volte. Proposta: una costante `avantiBloccato` e una funzione `confermaSelezioni()`. | ~12 |
| D2 | `NightSequencer.jsx` varie | `:91` ricalcola lo slug di `:84`. `:975-980` contiene un ternario annidato che si riduce a uno. `:1064` ha un `key` inutile. Gli spread condizionali di `:1075` e `:658` possono diventare prop normali. `:1023`: `step.mostraLupi &&` è ridondante. `:311` ricalcola `ciSonoSelezioniDaConfermare`. | ~10 |
| D3 | `App.jsx:74-81` | Il costruttore del messaggio "esclusi" è troppo generico: liste di al più un elemento, con rami irraggiungibili. Va sostituito con un `filter(Boolean)` e il testo resta identico, come verificano i test. | ~6 |
| D4 | `usePartita.js:200-202`, `useVotazione.js:36, 43, 58`, `nightSteps.js:4` | `impostaGiocatori` si limita a richiamare `setGiocatori`. `DEFAULT_STATO` viene riscritto a mano. `candidatiEsito ?? []` andrebbe validato una volta sola nel loader. `RUOLI_BRANCO_LUPI` viene ri-esportato da nightSteps invece che importato da `roles`. | ~6 |
| D5 | `src/features/giorno/EventiSpeciali.jsx` e i pannelli | `onSuoceraRivelazione` si limita a richiamare `onRivelazione('suocera', id)`. È passato attraverso 4 file. Vanno aggiornati i test `EventiSpeciali.test.jsx:20, 330-358`. | ~7 |
| D6 | `libretto.js:95-102` | L'elenco dei ruoli con aura malvagia è scritto a mano: va generato da `AURA_MALVAGIA.map(nomeRuolo)`, così non si disallinea. | ~4 |

**Totale D: ~45 righe.**

---

## E. Asset e prestazioni (quelle che contano davvero)

Tutto ciò che sta in `public/assets` viene scaricato e messo in cache dal service worker per **ogni** utente al primo avvio.

| ID | Cosa | Proposta | Risparmio | Rischio |
|---|---|---|---|---|
| E1 | `carte/Villico.svg`, `Guardia.svg` e `Lupo_Mannaro.svg` sono identici byte per byte a `*_1.svg` (verificato con md5). Li richiede solo `cartaPath()`, il cui unico chiamante è `MazzoGalleria.jsx:51`. | In MazzoGalleria usare `cartaFisicaPath(slug)`, poi eliminare `cartaPath` e i 3 file. | ~82 KB | basso |
| E2 | File mai referenziati: `carte/Riferimento_carta_vuota_1..4.svg` (4 file identici), `icone/icona_morte_teschio.svg`, `icone/icona_narratore_libro.svg`. Verificato generando tutti i 210 percorsi raggiungibili da `assetRuoli.js`. | Eliminarli, o spostarli fuori da `public/` se servono come materiale grafico. | ~7 KB | basso |
| E3 | Le icone dell'app finiscono nella precache due volte (`globPatterns` + `includeManifestIcons`, attivo di default; oggi `src/sw.js` aggira il problema con `new Set`). Le PNG da 1024, 512 e maskable non vengono mai mostrate nell'app: il browser le scarica da solo all'installazione. | `includeManifestIcons: false` più `globIgnores: ['**/icone/app/icon-*.png']` in `vite.config.js`. | ~184 KB | basso |
| E4 | Circa 12 SVG non sono mai passati da svgo: `illustrazioni/villaggio.svg` (189→79 KB), i tre `Riferimento_*` (~125→90 KB ciascuno), `icona_giorno.svg` (13,7→3,8 KB), `Titolo*.svg` (18,5→10 KB)… | svgo solo su questi file, poi un controllo visivo. Le carte dei ruoli sono già ottimizzate. | ~310 KB grezzi / ~75 KB gzip | medio (va guardato a occhio) |
| E5 | In `globPatterns` le voci `ico` e `woff2` non trovano nessun file: i font arrivano da Google a runtime e sono disponibili offline solo dopo il primo uso. | Togliere le due voci. In alternativa, ospitare i woff2 in locale, così i font funzionano offline fin dal primo avvio. È una funzionalità, non una pulizia: decidi tu. | — | basso |

**Prestazioni del codice:** non c'è nulla da cambiare. Gli O(n²) con `find` dentro `map`, il JSON.stringify per confronto in `NightSequencer.jsx:264` e i salvataggi su localStorage a ogni modifica costano meno di un millisecondo con 25 giocatori. Le immagini delle gallerie hanno già `loading="lazy"`, e i timer vengono puliti. Aggiungere memoizzazione sarebbe solo codice in più.

---

## F. Refactor a rischio medio (valuta tu se ne vale la pena)

| ID | Cosa | Perché medio | Righe |
|---|---|---|---|
| F1 | **Persistenza localStorage ripetuta in 7 hook** (`useFaseApp`, `useMazzo`, `useNotte`, `useVotazione`, `usePartita`, `useLog`, `useImpostazioni`). Tutti fanno lo stesso `try { JSON.parse(localStorage.getItem(k)) } catch {…}` più un `useEffect` di salvataggio; `useImpostazioni` da solo ha 7 `useState` e 7 effect identici. Proposta: `caricaLocale(chiave, predefinito, valida)` in `salvaLocale.js` e un hook `useStatoLocale`, così `useImpostazioni` passa da 115 a ~40 righe. | Il formato salvato sui telefoni deve restare leggibile; `useFaseApp` salva una stringa grezza, non JSON. | ~65 |
| F2 | **App.jsx inoltra a mano 14 campi di `useImpostazioni()`** a LogImpostazioniPopup (`App.jsx:45-60, 157-170`). Proposta: passare l'oggetto intero. | I test passano i prop uno per uno. | ~25 |
| F3 | **Conferma inline "Sicuro? Sì/Annulla" scritta 3 volte**: `ConcludiPartita.jsx`, `Votazione.jsx:594-615`, `PlayerTracker.jsx:86-109`. Proposta: un componente `ConfermaInline`. | Le classi CSS dei tre pulsanti differiscono e i test le controllano. | ~25 |
| F4 | **PlayerCard reimplementa il "tieni premuto"** (`PlayerCard.jsx:10-31, 50-70`) invece di usare `PulsanteTieni`. Prima serve un prop per nascondere "(tieni premuto)" e cambiare il colore. | CSS e test si basano su `transitionend`. | ~20 |
| F5 | **Pulizia dei partner in `removeGiocatore`** (`usePartita.js:115-124`), che ricalca `liberaPartnerDi` (`effettiNotte.js:300-307`). | Comportamento diverso sui partner morti: va deciso quale sia quello giusto. | ~8 |
| F6 | **Due effect che salvano entrambi lo stato del passo** (`NightSequencer.jsx:218-221` e `309-314`). | L'ordine degli effect potrebbe salvare per un attimo selezioni vecchie. | ~3 |
| F7 | **Codice di migrazione dei salvataggi vecchi** (`useMazzo.js:14-17`, `assegnazione.js:25-26`, `effettiNotte.js:214-217`, `normalizzaGiocatore`). | Toglierlo solo se sei certo che sui telefoni non ci siano salvataggi anteriori a metà ottobre. **Io lo terrei.** | ~10 |

---

## G. Igiene del repository (nessun impatto sull'app)

| ID | Cosa | Proposta |
|---|---|---|
| G1 | `.git` occupa 43 MB, completamente spacchettato (4546 oggetti sciolti, 0 pack). | `git gc` locale: sicuro, recupera circa 40 MB su disco. |
| G2 | La storia contiene ancora circa 60 MB di `asset_svg/` e del PDF (oggi ignorati da `.gitignore`), più 10 versioni di `docs/matrice-ruoli.html`. | Solo se la dimensione del clone ti interessa: `git filter-repo` più force-push. **Sconsigliato** senza un motivo concreto. |
| G3 | `NODE_OPTIONS=--experimental-global-webcrypto` nello script di build: inutile con Node 24 (quello che usi), necessario con il Node 18 di sistema (`/usr/bin/node`). | Lasciarlo, oppure toglierlo e aggiungere `"engines": {"node": ">=20"}` (Node 18 è fuori supporto). |
| G4 | `svgo` è tra le devDependencies ma non ha né script né configurazione. | Tenerlo (serve per E4) e aggiungere `"svgo": "svgo -r -f public/assets"`, così il passaggio si può ripetere. |
| G5 | `.vscode/settings.json` è tracciato ma contiene solo `"folder-color.pathColors": []`. `icone_libretto.csv` è in radice. | Togliere il primo. Il secondo spostarlo in `docs/` o lasciarlo dov'è (non è tracciato). |
| G6 | `docs/testi/testi-ui.json` è parzialmente superato: 34 stringhe su 900 non esistono più in `src/` e 27 file non sono coperti. `docs/testi-ui.md` contiene 2 correzioni fatte a mano che il JSON non ha. | Attenzione: **non rieseguire** `testi-ui.mjs esporta`, o quelle 2 correzioni vanno perse. Da decidere se riallineare il JSON. |

I documenti in `docs/` (bug-partite, audit, piani) sono scritti a mano: non propongo di cancellarli. Al massimo si possono spostare in `docs/archivio/`.

---

## Verificato e pulito (non c'è nulla da fare)

- Tutte le 150 classi di `index.css` sono usate. Le 6 generate dinamicamente (`chip--fazione-${…}`, `chip--${aura}`) sono state controllate sui valori reali di `roles.js`. Le due media query e tutti i selettori `[data-fase=…]` sono attivi.
- Tutte le dipendenze sono usate. Le due simulazioni in `src/test/setup.js` (`ResizeObserver`, `scrollTo`) servono ancora, e `globals: true` è necessario.
- Tutti gli import di `NightSequencer` sono usati e ogni chiave di `AZIONI_NOTTURNE` corrisponde a un passo. I prop condivisi passati a tutte le azioni (`varianteMedium`, `onCambiaQuantita`, …) hanno ciascuno almeno un lettore reale, quindi tenerli in un unico insieme è la scelta più semplice. L'unico morto è `impostaGiocatori` (B2).
- Gli script `matrice-ruoli.mjs` e `misura-personaggi.mjs` funzionano e rigenerano file identici a quelli presenti.
- `sw.js`, `main.jsx` e `index.html` non hanno nulla da togliere, a parte il font (A2) e i pattern (E3, E5).

---

## Riepilogo

| Blocco | Contenuto | Righe | Rischio |
|---|---|---|---|
| A | 4 possibili bug | ~5 | basso |
| B | Codice morto | ~150 + 140 JSON | basso |
| C | Duplicazioni | ~355 | basso |
| D | Semplificazioni minori | ~45 | basso |
| E | Asset/PWA | ~270 KB precache (+310 KB con svgo) | basso (E4 medio) |
| F | Refactor | ~155 | medio |
| G | Igiene repo | — | basso (G2 alto) |

**net: circa −550 righe con i soli blocchi a rischio basso (A–D), −0 dipendenze; circa −270 KB di precache (−580 KB con svgo).**

Procedura proposta dopo l'approvazione: un commit per blocco, con la suite di test completa (oggi 1005 verdi) e la build eseguite dopo ciascuno. Per E1–E4, un controllo visivo nell'app (galleria del mazzo, libretto, icone) prima del commit.

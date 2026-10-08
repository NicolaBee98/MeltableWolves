# Testi dell'interfaccia

Documento da modificare: cambia **solo** il testo dopo `TESTO:` di ogni voce e salva. Poi chiedimi di applicare le modifiche (comando: `node scripts/testi-ui.mjs applica --scrivi`).

Regole:
- Non modificare gli identificativi (`T0001`…) né le righe di contesto.
- I segnaposto tra graffe — come `${n}`, `${nome}` o `{giocatore.nome}` — vengono sostituiti dall'app con valori veri: lasciali dove servono e non cambiarne il contenuto (puoi spostarli nella frase).
- `⏎` indica un a capo dentro il testo.
- Il markup dei testi dei ruoli (`*corsivo*`, `**grassetto**`) funziona come nell'app.
- Alcune frasi sono spezzate in più voci ("parte 1 di 3"…): modifica ogni parte, tenendo conto che vengono mostrate una dopo l'altra (spazi iniziali/finali compresi).
- Alcune voci sono annidate in altre (una frase intera e le sue varianti): se cambi la frase intera, controlla anche le varianti.
- Per eliminare un testo scrivi `[[vuoto]]`; per lasciarlo com'è non toccarlo.

Totale voci: 900.

## Schermate generali (Home, Mazzo, Giocatori, Regolamento, Registro, impostazioni, avvisi)

### Installazione app

- **T0001** · titolo icona iOS (apple-mobile-web-app-title) · `index.html:14`
  TESTO: Meltable Wolves

- **T0003** · nome app nel manifest PWA · `vite.config.js:28`
  TESTO: Meltable Wolves — Narratore

- **T0004** · nome breve app nel manifest PWA · `vite.config.js:29`
  TESTO: Meltable Wolves

- **T0005** · descrizione app nel manifest PWA · `vite.config.js:30`
  TESTO: Meltable Wolves - Assistente per il Narratore

### Titolo scheda browser

- **T0002** · titolo della pagina (title) · `index.html:18`
  TESTO: Meltable Wolves — Narratore

### Intestazione

- **T0006** · testo alternativo del logo (Home) · `src/App.jsx:136`
  TESTO: Meltable Wolves

- **T0007** · testo alternativo del logo (altre schermate) · `src/App.jsx:138`
  TESTO: Meltable Wolves

### Mazzo

- **T0008** · pulsante indietro · `src/App.jsx:182`
  TESTO: ← Torna alla Home

- **T0009** · pulsante Avanti · `src/App.jsx:186`
  TESTO: Avanti

- **T0079** · titolo fazione Villaggio · `src/features/mazzo/MazzoBuilder.jsx:9`
  TESTO: Villaggio

- **T0080** · titolo fazione Lupi · `src/features/mazzo/MazzoBuilder.jsx:10`
  TESTO: Lupi

- **T0081** · titolo fazione Indipendenti · `src/features/mazzo/MazzoBuilder.jsx:11`
  TESTO: Indipendenti

- **T0082** · titolo fazione Variabili · `src/features/mazzo/MazzoBuilder.jsx:15`
  TESTO: Variabili

- **T0083** · chip numerata di ruolo moltiplicabile (Villico, Lupo Mannaro) · `src/features/mazzo/MazzoBuilder.jsx:77`
  TESTO: ${ruolo.nome} ${i + 1}

- **T0084** · chip numerata della Guardia · `src/features/mazzo/MazzoBuilder.jsx:86`
  TESTO: Guardia ${i + 1}

- **T0085** · titolo sezione ruoli nel mazzo (parte 1) · `src/features/mazzo/MazzoBuilder.jsx:97`
  TESTO: Nel mazzo (

- **T0086** · messaggio mazzo vuoto · `src/features/mazzo/MazzoBuilder.jsx:99`
  TESTO: Nessuna carta selezionata.

- **T0087** · etichetta accessibile gruppo ruoli scelti · `src/features/mazzo/MazzoBuilder.jsx:101`
  TESTO: Ruoli nel mazzo

- **T0088** · simbolo rimozione sulla chip (dopo il nome) · `src/features/mazzo/MazzoBuilder.jsx:116`
  TESTO: ✕

- **T0089** · nota Ladro (parte di una frase) · `src/features/mazzo/MazzoBuilder.jsx:134`
  TESTO: ℹ️ Il Ladro richiede inserire due carte in più nel mazzo rispetto al numero di giocatori.

- **T0090** · nota Borgomastro/Fantasma: parte 1 di 3 · `src/features/mazzo/MazzoBuilder.jsx:141`
  TESTO: ℹ️ Borgomastro e Fantasma Onnisciente sono "condizioni aggiuntive", non ruoli fissi che i giocatori possono avere

- **T0091** · nota Borgomastro/Fantasma: parte 2 di 3 (solo con Ladro) · `src/features/mazzo/MazzoBuilder.jsx:142`
  TESTO: [[vuoto]]

- **T0092** · nota Borgomastro/Fantasma: parte 3 di 3, punto finale · `src/features/mazzo/MazzoBuilder.jsx:142`
  TESTO: .

- **T0093** · etichetta accessibile gruppo ruoli disponibili · `src/features/mazzo/MazzoBuilder.jsx:162`
  TESTO: ${FAZIONE_LABEL[fazione]} disponibili

- **T0094** · suffisso Guardia Mannara disabilitata · `src/features/mazzo/MazzoBuilder.jsx:201`
  TESTO:  (richiede le Guardie)

- **T0095** · chip Guardie · `src/features/mazzo/MazzoBuilder.jsx:216`
  TESTO: Guardie

### Giocatori

- **T0010** · pulsante indietro · `src/App.jsx:194`
  TESTO: ← Torna al mazzo

- **T0011** · avviso conteggio giocatori: parte 1 (simbolo, prima della frase) · `src/App.jsx:206`
  TESTO: ⚠️

- **T0012** · avviso conteggio: parte 2, caso 1 giocatore richiesto · `src/App.jsx:206`
  TESTO: Serve 1 giocatore

- **T0013** · avviso conteggio: parte 2, caso più giocatori · `src/App.jsx:206`
  TESTO: Servono ${totaleRuoliMazzo} giocatori

- **T0014** · avviso conteggio: parte 3, dopo il numero richiesto · `src/App.jsx:206`
  TESTO: , ce ne sono

- **T0015** · avviso conteggio: parte 4, nota sui ruoli esclusi (se presenti) · `src/App.jsx:207`
  TESTO:  (${esclusi.join('; ')}, che non sono giocatori in più)

- **T0016** · avviso conteggio: parte 5, punto finale · `src/App.jsx:207`
  TESTO: .

- **T0017** · pulsante per iniziare la notte · `src/App.jsx:216`
  TESTO: È notte nel villaggio

- **T0018** · elenco esclusi: congiunzione tra le voci · `src/App.jsx:73`
  TESTO: ${voci.slice(0, -1).join(', ')} e ${voci.at(-1)}

- **T0019** · voce esclusi: carte extra del Ladro · `src/App.jsx:74`
  TESTO: le 2 carte extra del Ladro

- **T0020** · voce esclusi: Borgomastro · `src/App.jsx:75`
  TESTO: il Borgomastro

- **T0021** · voce esclusi: Fantasma Onnisciente · `src/App.jsx:75`
  TESTO: il Fantasma Onnisciente

- **T0022** · prefisso esclusi (carte, femminile) · `src/App.jsx:77`
  TESTO: escluse ${elenco(escluseCarte)}

- **T0023** · prefisso esclusi (ruoli, maschile) · `src/App.jsx:78`
  TESTO: esclusi ${elenco(escluseRuoli)}

- **T0100** · titolo elenco giocatori (parte 1) · `src/features/players/PlayerTracker.jsx:50`
  TESTO: Giocatori (

- **T0101** · istruzioni · `src/features/players/PlayerTracker.jsx:52`
  TESTO: Aggiungi i giocatori *nell'ordine in cui siedono al tavolo*. Tieni premuta la ✕ per eliminare, trascina una card per riordinare.

- **T0102** · conferma modifica a partita avviata: parte 1 di 5 · `src/features/players/PlayerTracker.jsx:57`
  TESTO: La partita è già avviata:

- **T0103** · conferma modifica: parte 2 di 5, verbo (aggiungere) · `src/features/players/PlayerTracker.jsx:57`
  TESTO: aggiungere

- **T0104** · conferma modifica: parte 2 di 5, verbo (rimuovere) · `src/features/players/PlayerTracker.jsx:57`
  TESTO: rimuovere

- **T0105** · conferma modifica: parte 5 di 5, resto della frase · `src/features/players/PlayerTracker.jsx:58`
  TESTO: può sfasare mazzo, ruoli e posti a sedere. Procedere?

- **T0106** · conferma modifica: pulsante di conferma · `src/features/players/PlayerTracker.jsx:60`
  TESTO: Sì, procedi

- **T0107** · conferma: pulsante Annulla · `src/features/players/PlayerTracker.jsx:63`
  TESTO: Annulla

- **T0108** · messaggio lista vuota · `src/features/players/PlayerTracker.jsx:68`
  TESTO: Nessun giocatore aggiunto.

- **T0109** · conferma eliminazione di un solo giocatore · `src/features/players/PlayerTracker.jsx:89`
  TESTO: Eliminare il giocatore?

- **T0110** · conferma eliminazione di tutti i giocatori · `src/features/players/PlayerTracker.jsx:89`
  TESTO: Eliminare tutti i ${giocatori.length} giocatori?

- **T0111** · conferma eliminazione: aggiunta se partita avviata · `src/features/players/PlayerTracker.jsx:89`
  TESTO:  La partita in corso verrà azzerata.

- **T0112** · conferma eliminazione: pulsante di conferma · `src/features/players/PlayerTracker.jsx:98`
  TESTO: Sì, elimina tutti

- **T0113** · conferma eliminazione: pulsante Annulla · `src/features/players/PlayerTracker.jsx:101`
  TESTO: Annulla

- **T0114** · pulsante Elimina tutti i giocatori · `src/features/players/PlayerTracker.jsx:106`
  TESTO: Elimina tutti i giocatori

- **T0115** · segnaposto campo nome · `src/features/players/AddPlayerForm.jsx:25`
  TESTO: Nome giocatore

- **T0116** · pulsante Aggiungi · `src/features/players/AddPlayerForm.jsx:32`
  TESTO: Aggiungi

- **T0117** · avviso nome duplicato · `src/features/players/AddPlayerForm.jsx:35`
  TESTO: ⚠️ C'è già un giocatore con questo nome: usane uno diverso.

- **T0118** · etichetta accessibile pulsante rimuovi giocatore · `src/features/players/PlayerCard.jsx:53`
  TESTO: Tieni premuto per rimuovere ${giocatore.nome}

- **T0119** · simbolo del pulsante rimuovi (nascosto ai lettori di schermo) · `src/features/players/PlayerCard.jsx:68`
  TESTO: ✕

### Home

- **T0024** · sottotitolo sotto il logo · `src/features/home/Home.jsx:4`
  TESTO: Assistente per il Narratore

- **T0025** · pulsante principale · `src/features/home/Home.jsx:6`
  TESTO: Nuova Partita

- **T0026** · pulsante Mazzo · `src/features/home/Home.jsx:10`
  TESTO: Mazzo

- **T0027** · pulsante Regolamento · `src/features/home/Home.jsx:13`
  TESTO: Regolamento

- **T0028** · pulsante Scarica offline · `src/features/home/Home.jsx:18`
  TESTO: Scarica offline

### Scarica offline

- **T0029** · pulsante indietro · `src/features/home/ScaricaOffline.jsx:17`
  TESTO: ← Torna alla Home

- **T0030** · titolo della schermata · `src/features/home/ScaricaOffline.jsx:19`
  TESTO: Scarica offline

- **T0031** · introduzione · `src/features/home/ScaricaOffline.jsx:20`
  TESTO: Aggiungi l'app al telefono e usala anche senza connessione.

- **T0032** · titolo sezione iPhone/iPad · `src/features/home/ScaricaOffline.jsx:23`
  TESTO: iPhone e iPad

- **T0033** · etichetta dispositivo rilevato (iPhone/iPad) · `src/features/home/ScaricaOffline.jsx:23`
  TESTO: (il tuo dispositivo)

- **T0034** · iOS passo 1 (parte 1 di 3) · `src/features/home/ScaricaOffline.jsx:25`
  TESTO: Apri l'app con

- **T0035** · iOS passo 1 (parte 2 di 3, in grassetto) · `src/features/home/ScaricaOffline.jsx:25`
  TESTO: Safari

- **T0036** · iOS passo 1 (parte 3 di 3) · `src/features/home/ScaricaOffline.jsx:25`
  TESTO: (con altri browser non funziona).

- **T0037** · iOS passo 2 (parte 1 di 3) · `src/features/home/ScaricaOffline.jsx:26`
  TESTO: Tocca

- **T0038** · iOS passo 2 (parte 2 di 3, in grassetto) · `src/features/home/ScaricaOffline.jsx:26`
  TESTO: Condividi

- **T0039** · iOS passo 2 (parte 3 di 3) · `src/features/home/ScaricaOffline.jsx:26`
  TESTO: (il quadrato con la freccia in su).

- **T0040** · iOS passo 3 (parte 1 di 4) · `src/features/home/ScaricaOffline.jsx:27`
  TESTO: Scegli

- **T0041** · iOS passo 3 (parte 2 di 4, in grassetto) · `src/features/home/ScaricaOffline.jsx:27`
  TESTO: Aggiungi alla schermata Home

- **T0042** · iOS passo 3 (parte 3 di 4) · `src/features/home/ScaricaOffline.jsx:27`
  TESTO: , poi

- **T0043** · iOS passo 3 (parte 4 di 4, in grassetto) · `src/features/home/ScaricaOffline.jsx:27`
  TESTO: Aggiungi

- **T0044** · iOS passo 4 (parte 1 di 4) · `src/features/home/ScaricaOffline.jsx:28`
  TESTO: Apri l'app dall'icona

- **T0045** · iOS passo 4 (parte 2 di 4, in grassetto) · `src/features/home/ScaricaOffline.jsx:28`
  TESTO: una volta online

- **T0046** · iOS passo 4 (parte 3 di 4) · `src/features/home/ScaricaOffline.jsx:28`
  TESTO: e attendi che si carichi del tutto.

- **T0047** · iOS passo 5 · `src/features/home/ScaricaOffline.jsx:29`
  TESTO: Da ora funziona anche offline.

- **T0048** · iOS nota aggiornamento · `src/features/home/ScaricaOffline.jsx:31`
  TESTO: Per aggiornarla: chiudi del tutto l'app (scorrila via dalle app aperte) e riaprila con la rete.

- **T0049** · titolo sezione Android · `src/features/home/ScaricaOffline.jsx:35`
  TESTO: Android

- **T0050** · etichetta dispositivo rilevato (Android) · `src/features/home/ScaricaOffline.jsx:35`
  TESTO: (il tuo dispositivo)

- **T0051** · Android passo 1 (parte 1 di 3) · `src/features/home/ScaricaOffline.jsx:37`
  TESTO: Apri l'app con

- **T0052** · Android passo 1 (parte 2 di 3, in grassetto) · `src/features/home/ScaricaOffline.jsx:37`
  TESTO: Chrome

- **T0053** · Android passo 1 (parte 3 di 3) · `src/features/home/ScaricaOffline.jsx:37`
  TESTO: .

- **T0054** · Android passo 2 (parte 1 di 4) · `src/features/home/ScaricaOffline.jsx:38`
  TESTO: Tocca il menu

- **T0055** · Android passo 2 (parte 2 di 4, in grassetto) · `src/features/home/ScaricaOffline.jsx:38`
  TESTO: ⋮

- **T0056** · Android passo 2 (parte 3 di 4) · `src/features/home/ScaricaOffline.jsx:38`
  TESTO: in alto a destra.

- **T0057** · Android passo 3 (parte 1 di 5) · `src/features/home/ScaricaOffline.jsx:39`
  TESTO: Scegli

- **T0058** · Android passo 3 (parte 2 di 5, in grassetto) · `src/features/home/ScaricaOffline.jsx:39`
  TESTO: Installa app

- **T0059** · Android passo 3 (parte 3 di 5) · `src/features/home/ScaricaOffline.jsx:39`
  TESTO: (o

- **T0060** · Android passo 3 (parte 4 di 5, in grassetto) · `src/features/home/ScaricaOffline.jsx:39`
  TESTO: Aggiungi a schermata Home

- **T0061** · Android passo 3 (parte 5 di 5) · `src/features/home/ScaricaOffline.jsx:39`
  TESTO: ) e conferma.

- **T0062** · Android passo 4 (parte 1 di 3) · `src/features/home/ScaricaOffline.jsx:40`
  TESTO: Apri l'app dall'icona

- **T0063** · Android passo 4 (parte 2 di 3, in grassetto) · `src/features/home/ScaricaOffline.jsx:40`
  TESTO: una volta online

- **T0064** · Android passo 4 (parte 3 di 3) · `src/features/home/ScaricaOffline.jsx:40`
  TESTO: e attendi che si carichi del tutto.

- **T0065** · Android passo 5 · `src/features/home/ScaricaOffline.jsx:41`
  TESTO: Da ora funziona anche offline.

- **T0066** · Android nota aggiornamento · `src/features/home/ScaricaOffline.jsx:43`
  TESTO: Per aggiornarla: chiudi del tutto l'app e riaprila con la rete.

- **T0067** · avviso finale sui dati locali · `src/features/home/ScaricaOffline.jsx:47`
  TESTO: [[vuoto]]

### Avvisi

- **T0068** · avviso mazzo: nessun lupo · `src/data/validaMazzo.js:25`
  TESTO: Nessun lupo mannaro nel mazzo.

- **T0069** · avviso mazzo: pochi lupi · `src/data/validaMazzo.js:28`
  TESTO: Pochi lupi mannari per ${ruoli.length} giocatori (consigliato circa 1 ogni ${RAPPORTO_LUPI_CONSIGLIATO}).

- **T0070** · avviso mazzo: troppi indipendenti · `src/data/validaMazzo.js:34`
  TESTO: Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.

- **T0071** · avviso mazzo: troppi ruoli notturni · `src/data/validaMazzo.js:39`
  TESTO: Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.

- **T0072** · avviso mazzo: Guardia Mannara senza Guardie · `src/data/validaMazzo.js:43`
  TESTO: Guardia Mannara richiede la presenza delle Guardie nel mazzo.

### Sfoglia il mazzo

- **T0073** · etichetta accessibile della finestra · `src/features/mazzo/SfogliaMazzo.jsx:28`
  TESTO: Sfoglia il mazzo

- **T0074** · pulsante chiudi · `src/features/mazzo/SfogliaMazzo.jsx:31`
  TESTO: ✕ Chiudi

- **T0075** · contatore carta (separatore tra numeri) · `src/features/mazzo/SfogliaMazzo.jsx:34`
  TESTO: /

- **T0076** · etichetta accessibile freccia indietro · `src/features/mazzo/SfogliaMazzo.jsx:46`
  TESTO: Carta precedente

- **T0077** · etichetta accessibile freccia avanti · `src/features/mazzo/SfogliaMazzo.jsx:63`
  TESTO: Carta successiva

- **T0078** · etichetta accessibile dello slider · `src/features/mazzo/SfogliaMazzo.jsx:76`
  TESTO: Scorri velocemente il mazzo

### Il mazzo (galleria)

- **T0096** · titolo fazione Sconosciuti · `src/features/mazzo/MazzoGalleria.jsx:11`
  TESTO: Sconosciuti

- **T0097** · pulsante indietro · `src/features/mazzo/MazzoGalleria.jsx:28`
  TESTO: ← Torna alla Home

- **T0098** · pulsante Sfoglia il mazzo · `src/features/mazzo/MazzoGalleria.jsx:32`
  TESTO: Sfoglia il mazzo

- **T0099** · titolo della schermata · `src/features/mazzo/MazzoGalleria.jsx:35`
  TESTO: Il mazzo

### Regolamento

- **T0120** · testo alternativo icona simbolo speciale · `src/features/libretto/Libretto.jsx:152`
  TESTO: simbolo speciale

- **T0121** · testo alternativo icona fazione · `src/features/libretto/Libretto.jsx:161`
  TESTO: fazione

- **T0122** · pulsante indietro · `src/features/libretto/Libretto.jsx:238`
  TESTO: ← Torna alla Home

- **T0123** · titolo del gioco · `src/features/libretto/Libretto.jsx:240`
  TESTO: Meltable Wolves

- **T0124** · sottotitolo · `src/features/libretto/Libretto.jsx:241`
  TESTO: Regolamento

- **T0125** · titolo di sezione confrontato nel codice (non mostrato qui, ma uguale al titolo in libretto.js) · `src/features/libretto/Libretto.jsx:271`
  TESTO: Riconoscimenti

### Registro

- **T0126** · nome fase: Notte · `src/features/log/LogPartita.jsx:5`
  TESTO: Notte

- **T0127** · nome fase: Alba · `src/features/log/LogPartita.jsx:5`
  TESTO: Alba

- **T0128** · nome fase: Giorno · `src/features/log/LogPartita.jsx:5`
  TESTO: Giorno

- **T0129** · nome fase: Rogo · `src/features/log/LogPartita.jsx:5`
  TESTO: Rogo

- **T0130** · messaggio registro vuoto · `src/features/log/LogPartita.jsx:32`
  TESTO: Nessun evento registrato finora.

- **T0131** · titolo del registro · `src/features/log/LogPartita.jsx:37`
  TESTO: Diario partita

- **T0132** · titolo gruppo notte+giorno (parte 1) · `src/features/log/LogPartita.jsx:40`
  TESTO: Round

- **T0133** · separatore dopo il nome fase (dentro il grassetto) · `src/features/log/LogPartita.jsx:48`
  TESTO: : 

### Impostazioni

- **T0134** · etichetta accessibile del pulsante ingranaggio · `src/features/log/LogImpostazioniPopup.jsx:46`
  TESTO: Diario e impostazioni

- **T0135** · etichetta accessibile della finestra · `src/features/log/LogImpostazioniPopup.jsx:56`
  TESTO: Diario e impostazioni

- **T0136** · etichetta accessibile del pulsante chiudi · `src/features/log/LogImpostazioniPopup.jsx:60`
  TESTO: Chiudi

- **T0137** · simbolo del pulsante chiudi · `src/features/log/LogImpostazioniPopup.jsx:61`
  TESTO: ✕

- **T0138** · conferma nuova partita · `src/features/log/LogImpostazioniPopup.jsx:65`
  TESTO: Iniziare una nuova partita? Ruoli, mazzo e diario della partita attuale saranno azzerati.

- **T0139** · conferma nuova partita: pulsante di conferma · `src/features/log/LogImpostazioniPopup.jsx:67`
  TESTO: Sì, ricomincia

- **T0140** · conferma nuova partita: pulsante Annulla · `src/features/log/LogImpostazioniPopup.jsx:70`
  TESTO: Annulla

- **T0141** · scheda Impostazioni partita · `src/features/log/LogImpostazioniPopup.jsx:77`
  TESTO: Impostazioni partita

- **T0142** · scheda Log partita · `src/features/log/LogImpostazioniPopup.jsx:80`
  TESTO: Diario

- **T0143** · opzione: ruoli in votazione · `src/features/log/LogImpostazioniPopup.jsx:93`
  TESTO: Mostra le icone dei ruoli durante la votazione

- **T0144** · opzione: varianti icona · `src/features/log/LogImpostazioniPopup.jsx:101`
  TESTO: Utilizza le varianti di icona per Lupi Mannari e Villici

- **T0145** · opzione: nome ruolo accanto al nome · `src/features/log/LogImpostazioniPopup.jsx:109`
  TESTO: Mostra il ruolo di un giocatore tra parentesi durante la votazione

- **T0146** · opzione: promemoria ruoli morti · `src/features/log/LogImpostazioniPopup.jsx:117`
  TESTO: Promemoria durante la notte per i ruoli morti che agirebbero

- **T0147** · opzione: variante Medium · `src/features/log/LogImpostazioniPopup.jsx:125`
  TESTO: Variante Medium: percepisce solo l'aura del defunto, non il ruolo esatto

- **T0148** · opzione: Addolorata eredita scelte · `src/features/log/LogImpostazioniPopup.jsx:133`
  TESTO: L'Addolorata eredita le scelte dei legami (maestro, protetto, genitore)

- **T0149** · campo durata timer · `src/features/log/LogImpostazioniPopup.jsx:136`
  TESTO: Durata timer spareggio (secondi)

- **T0150** · pulsante Nuova Partita · `src/features/log/LogImpostazioniPopup.jsx:145`
  TESTO: Nuova Partita

### Pulsanti comuni

- **T0151** · pulsante Concludi partita · `src/components/ConcludiPartita.jsx:10`
  TESTO: Concludi partita

- **T0152** · conferma concludi partita · `src/components/ConcludiPartita.jsx:16`
  TESTO: Concludere la partita e tornare alla Home?

- **T0153** · conferma concludi: pulsante di conferma · `src/components/ConcludiPartita.jsx:18`
  TESTO: Sì, concludi

- **T0154** · conferma concludi: pulsante Annulla · `src/components/ConcludiPartita.jsx:21`
  TESTO: Annulla

- **T0160** · indicazione sui pulsanti a pressione prolungata · `src/components/PulsanteTieni.jsx:63`
  TESTO: (tieni premuto)

- **T0161** · etichetta predefinita del pulsante Salta (nelle scelte giocatore) · `src/components/SceltaGiocatore.jsx:14`
  TESTO: Salta

- **T0162** · messaggio lista candidati vuota · `src/components/SceltaGiocatore.jsx:28`
  TESTO: Nessun bersaglio disponibile.

- **T0163** · pulsante Chiudi con lista vuota · `src/components/SceltaGiocatore.jsx:30`
  TESTO: Chiudi

- **T0164** · pulsante Conferma nelle scelte giocatore · `src/components/SceltaGiocatore.jsx:55`
  TESTO: Conferma

### Errore

- **T0155** · titolo (parte 1 di 2) · `src/components/ErrorBoundary.jsx:27`
  TESTO: Meltable

- **T0156** · titolo (parte 2 di 2) · `src/components/ErrorBoundary.jsx:28`
  TESTO: Wolves

- **T0157** · messaggio di errore · `src/components/ErrorBoundary.jsx:31`
  TESTO: Si è verificato un errore imprevisto.

- **T0158** · messaggio di recupero · `src/components/ErrorBoundary.jsx:32`
  TESTO: I dati della partita sono salvati: ricaricando la pagina si riprende da dove si era rimasti.

- **T0159** · pulsante Ricarica · `src/components/ErrorBoundary.jsx:34`
  TESTO: Ricarica

## Notte (passi, azioni, avvisi)

### Notte — promemoria legame

- **T0165** · promemoria legame Apprendista (frase intera) · `src/features/notte/NightSequencer.jsx:18`
  TESTO: ${nome} è il suo maestro

### Notte — comune

- **T0166** · promemoria legame Cavaliere (frase intera) · `src/features/notte/NightSequencer.jsx:21`
  TESTO: È pronto a sacrificarsi per ${nome}

- **T0167** · promemoria legame Figlia dei Lupi (frase intera) · `src/features/notte/NightSequencer.jsx:22`
  TESTO: ${nome} è il suo genitore

- **T0180** · domanda assegnazione lupi rimanenti · `src/features/notte/NightSequencer.jsx:561`
  TESTO: Seleziona i lupi mannari rimanenti.

- **T0181** · nome giocatore Mimo nel sottotitolo del passo · `src/features/notte/NightSequencer.jsx:602`
  TESTO: ${g.nome} (Mimo)

- **T0182** · sottotitolo passo: giocatore morto con teschio · `src/features/notte/NightSequencer.jsx:608`
  TESTO: ${mortiCoinvolti[0]} ☠️

- **T0183** · sottotitolo passo: etichetta Vivi (parte 1/2 con elenco nomi) · `src/features/notte/NightSequencer.jsx:612`
  TESTO: Vivi: 

- **T0184** · sottotitolo passo: etichetta Morti (parte 1/2 con elenco nomi) · `src/features/notte/NightSequencer.jsx:613`
  TESTO: Morti: 

- **T0185** · motivo Indietro non disponibile (dopo ricaricamento) · `src/features/notte/NightSequencer.jsx:973`
  TESTO: [[vuoto]]

- **T0186** · motivo Indietro non disponibile (primo passo) · `src/features/notte/NightSequencer.jsx:975`
  TESTO: [[vuoto]]

- **T0187** · motivo Indietro non disponibile (nulla da annullare) · `src/features/notte/NightSequencer.jsx:976`
  TESTO: Nulla da annullare in questo passo.

- **T0188** · pulsante Torna ai giocatori · `src/features/notte/NightSequencer.jsx:981`
  TESTO:  ← Torna ai giocatori 

- **T0189** · intestazione notte (passo), parte 1/2 · `src/features/notte/NightSequencer.jsx:985`
  TESTO: Notte 

- **T0190** · indicatore passo, parte 1/3 ("Passo " + numero) · `src/features/notte/NightSequencer.jsx:986`
  TESTO:  Passo 

- **T0191** · indicatore passo, parte 2/3 (" di " + totale) · `src/features/notte/NightSequencer.jsx:987`
  TESTO:  di 

- **T0195** · avviso maledizione de L'Antico · `src/features/notte/NightSequencer.jsx:996`
  TESTO:  🌑 Il villaggio è maledetto da L'Antico: questa notte agiscono solo i poteri malvagi. 

- **T0196** · testo passo informativo senza azione · `src/features/notte/NightSequencer.jsx:1047`
  TESTO: Nessuna azione richiesta

- **T0197** · promemoria legame, parte 1/3 (emoji) · `src/features/notte/NightSequencer.jsx:1051`
  TESTO:  🔗 

- **T0198** · promemoria legame, prefisso nome attore (con più attori) · `src/features/notte/NightSequencer.jsx:1052`
  TESTO: ${attore.nome}: 

- **T0199** · promemoria legame, parte 3/3 (punto finale) · `src/features/notte/NightSequencer.jsx:1053`
  TESTO: . 

- **T0210** · promemoria attori morti che agiscono (plurale), parte 2/3 · `src/features/notte/NightSequencer.jsx:1102`
  TESTO: sono morti, ma agiscono comunque

- **T0211** · promemoria attore morto che agisce (singolare), parte 2/3 · `src/features/notte/NightSequencer.jsx:1102`
  TESTO: è morto/a, ma agisce comunque

- **T0212** · aria-label gruppo scelta di un attore · `src/features/notte/NightSequencer.jsx:1107`
  TESTO: Scelta di ${attore.nome}

- **T0213** · etichetta Mimo accanto al nome attore · `src/features/notte/NightSequencer.jsx:1110`
  TESTO:  (Mimo)

- **T0214** · avviso assegnazione incompleta, parte 1/3 (emoji + "Seleziona ancora") · `src/features/notte/NightSequencer.jsx:1122`
  TESTO:  ⚠️ Seleziona ancora 

- **T0215** · avviso assegnazione incompleta, parte 2/3 (singolare) · `src/features/notte/NightSequencer.jsx:1124`
  TESTO: giocatore

- **T0216** · avviso assegnazione incompleta, parte 2/3 (plurale) · `src/features/notte/NightSequencer.jsx:1124`
  TESTO: giocatori

- **T0217** · avviso assegnazione incompleta, parte 3/3 · `src/features/notte/NightSequencer.jsx:1124`
  TESTO:  prima di continuare. 

- **T0218** · avviso scelta obbligatoria lupo del Berserker · `src/features/notte/NightSequencer.jsx:1128`
  TESTO: ⚠️ Scegli quale lupo muore lottando con il Berserker prima di continuare.

- **T0219** · pulsante Indietro · `src/features/notte/NightSequencer.jsx:1133`
  TESTO:  Indietro 

- **T0220** · pulsante ultimo passo (fine notte) · `src/features/notte/NightSequencer.jsx:1139`
  TESTO:  È giorno nel villaggio 

- **T0221** · pulsante Avanti · `src/features/notte/NightSequencer.jsx:1143`
  TESTO:  Avanti 

- **T0222** · motivo Indietro non disponibile (prefisso, poi il motivo) · `src/features/notte/NightSequencer.jsx:1148`
  TESTO: Indietro non disponibile: 

### Notte — registro eventi (Mimo)

- **T0168** · registro: Mimo senza carta scelta · `src/features/notte/NightSequencer.jsx:343`
  TESTO: Il Mimo ${mimo.nome} non ha scelto la carta da imitare: diventa Villico.

### Notte — saltata dal Bardo

- **T0169** · messaggio notte saltata (Bardo) · `src/features/notte/NightSequencer.jsx:406`
  TESTO: Questa notte non si svolge per i poteri del Bardo.

- **T0170** · messaggio notte saltata (generico) · `src/features/notte/NightSequencer.jsx:406`
  TESTO: Questa notte non si svolge.

- **T0171** · registro: gesto segreto del Bardo · `src/features/notte/NightSequencer.jsx:409`
  TESTO: ${bardo.nome} fa saltare la notte con il suo gesto segreto (Bardo).

- **T0172** · intestazione notte, parte 1/2 ("Notte " + numero) · `src/features/notte/NightSequencer.jsx:430`
  TESTO: Notte 

- **T0173** · nota sotto il messaggio notte saltata · `src/features/notte/NightSequencer.jsx:432`
  TESTO: «Indietro» annulla il gesto del Bardo.

- **T0174** · tooltip pulsante Indietro (notte saltata) · `src/features/notte/NightSequencer.jsx:434`
  TESTO: Annulla il gesto del Bardo

- **T0175** · pulsante Indietro (notte saltata) · `src/features/notte/NightSequencer.jsx:434`
  TESTO:  Indietro 

- **T0176** · pulsante Vai all'alba (notte saltata) · `src/features/notte/NightSequencer.jsx:437`
  TESTO: Vai all'alba

### Notte — nessun ruolo con azione

- **T0177** · intestazione notte (nessun ruolo con azione), parte 1/2 · `src/features/notte/NightSequencer.jsx:462`
  TESTO: Notte 

- **T0178** · messaggio nessun ruolo con azione notturna · `src/features/notte/NightSequencer.jsx:463`
  TESTO: Nessun ruolo con azione notturna nel mazzo attuale.

- **T0179** · pulsante Vai all'alba (nessun ruolo) · `src/features/notte/NightSequencer.jsx:464`
  TESTO: Vai all'alba

### Notte — passo (promemoria)

- **T0200** · promemoria carta non assegnata (carta in mano al narratore) · `src/features/notte/NightSequencer.jsx:1077`
  TESTO: Carta non assegnata a nessun giocatore: chiama comunque il ruolo.

- **T0201** · promemoria nessun giocatore assegnato al ruolo · `src/features/notte/NightSequencer.jsx:1078`
  TESTO: Nessun giocatore assegnato a questo ruolo per ora.

- **T0202** · avviso potere inibito, prefisso emoji · `src/features/notte/NightSequencer.jsx:1083`
  TESTO:  🚫 

- **T0203** · avviso Fattucchiera inibisce tutto il branco · `src/features/notte/NightSequencer.jsx:1085`
  TESTO: Tutti i lupi vivi sono inibiti dalla Fattucchiera: il branco non può sbranare questa notte.

- **T0204** · avviso Fattucchiera inibisce il potere · `src/features/notte/NightSequencer.jsx:1086`
  TESTO: Il potere è inibito questa notte dalla Fattucchiera: nessuna azione disponibile.

- **T0205** · promemoria chiamata morto, parte 1/3 (prima dei nomi) · `src/features/notte/NightSequencer.jsx:1091`
  TESTO:  ☠️ Chiama comunque 

- **T0206** · promemoria chiamata morti (plurale), parte 2/3 · `src/features/notte/NightSequencer.jsx:1093`
  TESTO: per il loro turno, anche se morti

- **T0207** · promemoria chiamata morto (singolare), parte 2/3 · `src/features/notte/NightSequencer.jsx:1093`
  TESTO: per il suo turno, anche se morto/a

- **T0208** · promemoria chiamata morto, parte 3/3 (punto finale) · `src/features/notte/NightSequencer.jsx:1093`
  TESTO: . 

- **T0209** · promemoria attore morto che agisce comunque, parte 1/3 (emoji) · `src/features/notte/NightSequencer.jsx:1100`
  TESTO:  ☠️ 

### Notte — assegnazione ruoli

- **T0223** · domanda predefinita assegnazione carta · `src/features/notte/AssegnaRuolo.jsx:28`
  TESTO: Chi ha questa carta?

- **T0224** · avviso troppi giocatori selezionati per il ruolo · `src/features/notte/AssegnaRuolo.jsx:105`
  TESTO: Puoi selezionare al massimo ${capacita} ${capacita === 1 ? 'giocatore' : 'giocatori'} per questo ruolo.

- **T0225** · etichetta selettore variante del ruolo · `src/features/notte/AssegnaRuolo.jsx:138`
  TESTO:  Che ruolo mostra la carta? 

- **T0226** · istruzione quanti giocatori selezionare ancora · `src/features/notte/AssegnaRuolo.jsx:154`
  TESTO: Seleziona ${capacita - selezionatiVisivi.length} ${capacita - selezionatiVisivi.length === 1 ? 'giocatore' : 'giocatori'} in più, poi premi Avanti.

- **T0227** · istruzione scelta ancora modificabile · `src/features/notte/AssegnaRuolo.jsx:155`
  TESTO: Puoi ancora cambiare la scelta finché non premi Avanti.

- **T0228** · nessun giocatore disponibile da assegnare · `src/features/notte/AssegnaRuolo.jsx:158`
  TESTO: Nessun giocatore disponibile da assegnare.

- **T0229** · aria-label gruppo chip assegnazione carta · `src/features/notte/AssegnaRuolo.jsx:160`
  TESTO: Chi ha questa carta

- **T0230** · prefisso avviso assegnazione (emoji) · `src/features/notte/AssegnaRuolo.jsx:176`
  TESTO: ⚠️ 

### Notte — Guaritore / Sciacallo Mannaro

- **T0231** · potere già usato (Guaritore/Sciacallo Mannaro) · `src/features/notte/azioni/AzioneResuscita.jsx:31`
  TESTO: Potere già utilizzato in questa partita.

- **T0232** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneResuscita.jsx:59`
  TESTO: Nessun bersaglio disponibile.

- **T0233** · titolo scelta resurrezione · `src/features/notte/azioni/AzioneResuscita.jsx:64`
  TESTO: Chi resuscitare

- **T0234** · aria-label gruppo chip resurrezione · `src/features/notte/azioni/AzioneResuscita.jsx:65`
  TESTO: Chi resuscitare

### Notte — Paladino

- **T0235** · etichetta scelta Paladino · `src/features/notte/azioni/index.js:26`
  TESTO: Chi proteggere

### Notte — Untore

- **T0236** · etichetta scelta Untore · `src/features/notte/azioni/index.js:30`
  TESTO: Chi ungere

### Notte — Fattucchiera

- **T0237** · etichetta scelta Fattucchiera · `src/features/notte/azioni/index.js:37`
  TESTO: Chi inibire

### Notte — Maga

- **T0238** · etichetta scelta Maga · `src/features/notte/azioni/index.js:41`
  TESTO: Chi trasformare

### Notte — Pifferaio

- **T0239** · etichetta scelta Pifferaio · `src/features/notte/azioni/index.js:49`
  TESTO: Chi ipnotizzare (due giocatori)

### Notte — Sacerdote

- **T0240** · etichetta scelta Sacerdote · `src/features/notte/azioni/index.js:57`
  TESTO: Chi unire (due giocatori)

### Notte — Apprendista

- **T0241** · etichetta scelta Apprendista · `src/features/notte/azioni/index.js:64`
  TESTO: Chi seguire come maestro

### Notte — Cavaliere

- **T0242** · etichetta scelta Cavaliere · `src/features/notte/azioni/index.js:65`
  TESTO: Per chi sacrificarsi

### Notte — Figlia dei Lupi

- **T0243** · etichetta scelta Figlia dei Lupi · `src/features/notte/azioni/index.js:66`
  TESTO: Chi scegliere come genitore

### Notte — Veggente Mannaro

- **T0244** · etichetta attore Veggente Mannaro · `src/features/notte/azioni/index.js:77`
  TESTO: Veggente Mannaro

### Notte — Cartomante

- **T0245** · etichetta attore Cartomante · `src/features/notte/azioni/index.js:81`
  TESTO: Cartomante

### Notte — Apprendista / Cavaliere / Figlia dei Lupi

- **T0246** · avviso legame mancante Apprendista (poi ": il legame andrà perso.") · `src/features/notte/azioni/AzioneLegame.jsx:4`
  TESTO: Non hai scelto il maestro

- **T0247** · avviso legame mancante Cavaliere · `src/features/notte/azioni/AzioneLegame.jsx:5`
  TESTO: Non hai scelto chi proteggere

- **T0248** · avviso legame mancante Figlia dei Lupi · `src/features/notte/azioni/AzioneLegame.jsx:6`
  TESTO: Non hai scelto il genitore

- **T0249** · legame ereditato già usato · `src/features/notte/azioni/AzioneLegame.jsx:46`
  TESTO: Ruolo ereditato: il legame è già stato usato, niente da scegliere.

- **T0250** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneLegame.jsx:50`
  TESTO: Nessun bersaglio disponibile.

- **T0251** · avviso legame mancante, prefisso emoji (parte 1/3) · `src/features/notte/azioni/AzioneLegame.jsx:70`
  TESTO: ⚠️ 

- **T0252** · avviso legame mancante, parte 3/3 · `src/features/notte/azioni/AzioneLegame.jsx:70`
  TESTO: : il legame andrà perso.

### Notte — Cortigiana

- **T0253** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneCortigiana.jsx:27`
  TESTO: Nessun bersaglio disponibile.

- **T0254** · titolo scelta Cortigiana · `src/features/notte/azioni/AzioneCortigiana.jsx:32`
  TESTO: Chi visita la Cortigiana

- **T0255** · aria-label gruppo chip Cortigiana · `src/features/notte/azioni/AzioneCortigiana.jsx:33`
  TESTO: Chi visita la Cortigiana

### Notte — scelta di due giocatori

- **T0256** · avviso troppi giocatori selezionati (scelta doppia) · `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx:20`
  TESTO: Puoi scegliere al massimo ${massimo} ${massimo === 1 ? 'giocatore' : 'giocatori'}: deseleziona qualcuno per cambiare la scelta.

- **T0257** · nessun bersaglio sufficiente per scelta doppia · `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx:31`
  TESTO: Servono almeno due bersagli disponibili.

- **T0258** · pulsante Chiudi · `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx:32`
  TESTO:  Chiudi 

- **T0259** · prefisso avviso scelta doppia (emoji) · `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx:55`
  TESTO: ⚠️ 

- **T0260** · prefisso avviso scelta doppia incompleta (emoji) · `src/features/notte/azioni/SceltaDoppiaGiocatore.jsx:57`
  TESTO: ⚠️ 

### Notte — Inquisitore

- **T0261** · Inquisitore ha perso il potere · `src/features/notte/azioni/AzioneInquisitore.jsx:30`
  TESTO: Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola.

- **T0262** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneInquisitore.jsx:76`
  TESTO: Nessun bersaglio disponibile.

- **T0263** · titolo scelta Inquisitore · `src/features/notte/azioni/AzioneInquisitore.jsx:81`
  TESTO: Chi interrogare

- **T0264** · aria-label gruppo chip Inquisitore · `src/features/notte/azioni/AzioneInquisitore.jsx:82`
  TESTO: Chi interrogare

- **T0265** · risposta all'Inquisitore, parte 1/2 · `src/features/notte/azioni/AzioneInquisitore.jsx:100`
  TESTO:  Rispondi all'Inquisitore: 

- **T0266** · risposta all'Inquisitore: aura malvagia · `src/features/notte/azioni/AzioneInquisitore.jsx:101`
  TESTO: sì (aura malvagia)

- **T0267** · risposta all'Inquisitore: aura benevola · `src/features/notte/azioni/AzioneInquisitore.jsx:101`
  TESTO: no (aura benevola)

- **T0268** · pulsante Salta Inquisitore · `src/features/notte/azioni/AzioneInquisitore.jsx:104`
  TESTO:  Salta 

### Notte — Paladino / Untore / Fattucchiera / Maga (scelta di un giocatore)

- **T0269** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneCondizioneSingola.jsx:43`
  TESTO: Nessun bersaglio disponibile.

### Notte — Chupacabra

- **T0270** · avviso Chupacabra: bersaglio non lupo · `src/features/notte/azioni/AzioneChupacabra.jsx:65`
  TESTO: ${bersaglio.nome} non è un lupo: la caccia del Chupacabra fallisce.

- **T0271** · avviso Chupacabra: bersaglio immune di notte · `src/features/notte/azioni/AzioneChupacabra.jsx:73`
  TESTO: ${avvisoImmuneNotte(bersaglio)}: la caccia non ha alcun effetto su ${bersaglio.nome}.

- **T0272** · avviso Chupacabra: bersaglio protetto · `src/features/notte/azioni/AzioneChupacabra.jsx:75`
  TESTO: ${bersaglio.nome} è protetto/a: la caccia non ha alcun effetto.

- **T0273** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneChupacabra.jsx:84`
  TESTO: Nessun bersaglio disponibile.

- **T0274** · titolo scelta Chupacabra · `src/features/notte/azioni/AzioneChupacabra.jsx:89`
  TESTO: Il Chupacabra caccia

- **T0275** · aria-label gruppo chip Chupacabra · `src/features/notte/azioni/AzioneChupacabra.jsx:90`
  TESTO: Il Chupacabra caccia

- **T0276** · prefisso avviso Chupacabra (emoji) · `src/features/notte/azioni/AzioneChupacabra.jsx:104`
  TESTO: ⚠️ 

- **T0277** · prefisso avviso effetti Chupacabra (emoji) · `src/features/notte/azioni/AzioneChupacabra.jsx:106`
  TESTO: ⚠️ 

### Notte — Branco dei Lupi

- **T0278** · registro: chi trasforma (Mimo del Progenitore) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:95`
  TESTO: ${attore.nome} (Mimo del Progenitore)

- **T0279** · registro: chi trasforma (Progenitore) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:95`
  TESTO: Il Progenitore ${attore.nome}

- **T0280** · registro: Progenitore trasforma in Lupo Mannaro · `src/features/notte/azioni/AzioneBrancoLupi.jsx:96`
  TESTO: ${chi} trasforma ${nome} in Lupo Mannaro.

- **T0281** · messaggio branco stordito dall'Ubriaco · `src/features/notte/azioni/AzioneBrancoLupi.jsx:161`
  TESTO: Il branco è ancora stordito dall'alcol dell'Ubriaco: questa notte non può cacciare.

- **T0282** · branco ha già sbranato, parte 1/3 · `src/features/notte/azioni/AzioneBrancoLupi.jsx:167`
  TESTO: Il branco ha già sbranato 

- **T0283** · branco ha già sbranato, parte 2/3 (plurale) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:167`
  TESTO: le sue vittime

- **T0284** · branco ha già sbranato, parte 2/3 (singolare) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:167`
  TESTO: una vittima

- **T0285** · branco ha già sbranato, parte 3/3 · `src/features/notte/azioni/AzioneBrancoLupi.jsx:167`
  TESTO:  questa notte.

- **T0286** · motivo morso senza effetto: Nano / Criceto Malvagio · `src/features/notte/azioni/AzioneBrancoLupi.jsx:226`
  TESTO: ${target.ruoloSlug === 'nano' ? 'il Nano' : 'il Criceto Malvagio'} non può essere sbranato

- **T0287** · motivo morso senza effetto: protetto · `src/features/notte/azioni/AzioneBrancoLupi.jsx:228`
  TESTO: è protetto/a

- **T0288** · motivo morso senza effetto: non sbranabile · `src/features/notte/azioni/AzioneBrancoLupi.jsx:229`
  TESTO: non è sbranabile

- **T0289** · avviso morso senza effetto · `src/features/notte/azioni/AzioneBrancoLupi.jsx:230`
  TESTO: Il morso non ha effetto su ${target.nome}: ${motivo}.

- **T0290** · aria-label scelta lupo che muore col Berserker · `src/features/notte/azioni/AzioneBrancoLupi.jsx:322`
  TESTO: Quale lupo uccide il Berserker

- **T0291** · domanda parità Berserker · `src/features/notte/azioni/AzioneBrancoLupi.jsx:323`
  TESTO: Il Berserker ha due lupi alla stessa distanza: quale muore lottando con lui?

- **T0292** · pulsante Annulla (cambia bersaglio) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:334`
  TESTO:  Annulla (cambia bersaglio) 

- **T0293** · titolo scelta branco · `src/features/notte/azioni/AzioneBrancoLupi.jsx:351`
  TESTO: Il branco sbrana

- **T0294** · avviso Vendetta del Cucciolo, parte 1/2 · `src/features/notte/azioni/AzioneBrancoLupi.jsx:353`
  TESTO:  Vendetta del Cucciolo: il branco sbrana due vittime questa notte (vittima

- **T0295** · avviso Vendetta del Cucciolo, parte 2/2 · `src/features/notte/azioni/AzioneBrancoLupi.jsx:355`
  TESTO:  di 2). 

- **T0296** · aria-label gruppo chip branco · `src/features/notte/azioni/AzioneBrancoLupi.jsx:358`
  TESTO: Il branco sbrana

- **T0297** · branco ha già sbranato le vittime (vendetta) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:371`
  TESTO: Il branco ha già sbranato le sue vittime questa notte.

- **T0298** · prefisso avviso esito branco (emoji) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:372`
  TESTO: ⚠️ 

- **T0299** · prefisso avviso morsi branco (emoji) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:374`
  TESTO: ⚠️ 

- **T0300** · avviso trasformazione in Lupo Mannaro, parte 1/2 (emoji) · `src/features/notte/azioni/AzioneBrancoLupi.jsx:377`
  TESTO:  [[vuoto]] 

- **T0301** · avviso trasformazione in Lupo Mannaro, parte 2/2 · `src/features/notte/azioni/AzioneBrancoLupi.jsx:378`
  TESTO:  verrà trasformato in Lupo Mannaro. 

- **T0302** · pulsante Progenitore: sbrana normalmente · `src/features/notte/azioni/AzioneBrancoLupi.jsx:390`
  TESTO: Sbrana normalmente

- **T0303** · pulsante Progenitore: trasforma in Lupo Mannaro · `src/features/notte/azioni/AzioneBrancoLupi.jsx:391`
  TESTO: Il Progenitore trasforma ${giocatori.find((g) => g.id === c.targetId)?.nome} in Lupo Mannaro

### Notte — Cartomante / Medium

- **T0304** · nome ruolo sconosciuto · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:10`
  TESTO: ruolo sconosciuto

- **T0305** · domanda Guardia / Guardia Mannara · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:124`
  TESTO: ${target?.nome} è una Guardia: la carta è una Guardia o la Guardia Mannara?

- **T0306** · domanda carta sconosciuta · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:125`
  TESTO: La carta di ${target?.nome} è ancora sconosciuta: quale ruolo mostra?

- **T0307** · aria-label gruppo chip ruolo rivelato · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:127`
  TESTO: Che ruolo era

- **T0308** · pulsante Annulla (cambia bersaglio) · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:146`
  TESTO:  Annulla (cambia bersaglio) 

- **T0309** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:154`
  TESTO: Nessun bersaglio disponibile.

- **T0310** · titolo scelta Medium · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:162`
  TESTO: Chi interrogare (defunto)

- **T0311** · titolo scelta Cartomante · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:162`
  TESTO: Chi indagare

- **T0312** · aria-label gruppo chip Medium · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:163`
  TESTO: Chi interrogare (defunto)

- **T0313** · aria-label gruppo chip Cartomante · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:163`
  TESTO: Chi indagare

- **T0314** · mostra carta, parte 1/3 · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:177`
  TESTO:  Mostra a 

- **T0315** · mostra carta, parte 2/3 · `src/features/notte/azioni/AzioneRivelaRuolo.jsx:178`
  TESTO:  la carta: 

### Notte — Pifferaio / Sacerdote (scelta di due giocatori)

- **T0316** · nessun giocatore da ipnotizzare · `src/features/notte/azioni/AzioneCondizioneDoppia.jsx:134`
  TESTO: Nessun giocatore da ipnotizzare: premi Avanti.

- **T0317** · avviso coppia innamorati incompleta · `src/features/notte/azioni/AzioneCondizioneDoppia.jsx:146`
  TESTO: Non hai scelto la coppia completa: gli innamorati non verranno legati.

### Notte — Mimo

- **T0318** · etichetta scelta Mimo · `src/features/notte/azioni/AzioneMimo.jsx:60`
  TESTO: Chi imitare

- **T0319** · avviso Mimo senza carta · `src/features/notte/azioni/AzioneMimo.jsx:67`
  TESTO: ⚠️ Senza una carta da imitare il Mimo diventerà Villico.

- **T0320** · Mimo imita, parte 1/3 · `src/features/notte/azioni/AzioneMimo.jsx:86`
  TESTO:  Il Mimo imita 

- **T0321** · Mimo imita, parte 2/3 · `src/features/notte/azioni/AzioneMimo.jsx:87`
  TESTO: : e assumerà il ruolo di 

- **T0322** · Mimo imita, parte 3/3 · `src/features/notte/azioni/AzioneMimo.jsx:87`
  TESTO: . 

- **T0323** · domanda carta del bersaglio del Mimo, parte 1/2 · `src/features/notte/azioni/AzioneMimo.jsx:110`
  TESTO: Che carta ha davvero 

- **T0324** · domanda carta del bersaglio del Mimo, parte 2/2 · `src/features/notte/azioni/AzioneMimo.jsx:110`
  TESTO: ?

- **T0325** · aria-label gruppo chip Mimo · `src/features/notte/azioni/AzioneMimo.jsx:111`
  TESTO: Che carta ha il bersaglio del Mimo

### Notte — Strega

- **T0326** · avviso Strega: pozione vitale su già protetto · `src/features/notte/azioni/AzioneStrega.jsx:66`
  TESTO: ${target.nome} era già protetto/a: la pozione non ha avuto alcun effetto.

- **T0327** · avviso Strega: pozione mortale su immune · `src/features/notte/azioni/AzioneStrega.jsx:93`
  TESTO: ${avvisoImmuneNotte(target)}: la pozione non ha alcun effetto su ${target.nome}.

- **T0328** · avviso Strega: pozione mortale senza effetto · `src/features/notte/azioni/AzioneStrega.jsx:94`
  TESTO: La pozione non ha avuto alcun effetto su ${target.nome}.

- **T0329** · titolo pozione vitale · `src/features/notte/azioni/AzioneStrega.jsx:103`
  TESTO: Pozione vitale

- **T0330** · pozione vitale già usata · `src/features/notte/azioni/AzioneStrega.jsx:105`
  TESTO: Pozione vitale già utilizzata in questa partita.

- **T0331** · titolo scelta pozione vitale · `src/features/notte/azioni/AzioneStrega.jsx:108`
  TESTO: Chi proteggere

- **T0332** · aria-label gruppo chip pozione vitale · `src/features/notte/azioni/AzioneStrega.jsx:109`
  TESTO: Chi proteggere

- **T0333** · prefisso avviso pozione vitale (emoji) · `src/features/notte/azioni/AzioneStrega.jsx:124`
  TESTO: ⚠️ 

- **T0334** · titolo pozione mortale · `src/features/notte/azioni/AzioneStrega.jsx:127`
  TESTO: Pozione mortale

- **T0335** · pozione mortale già usata · `src/features/notte/azioni/AzioneStrega.jsx:129`
  TESTO: Pozione mortale già utilizzata in questa partita.

- **T0336** · titolo scelta pozione mortale · `src/features/notte/azioni/AzioneStrega.jsx:132`
  TESTO: Chi uccidere

- **T0337** · aria-label gruppo chip pozione mortale · `src/features/notte/azioni/AzioneStrega.jsx:133`
  TESTO: Chi uccidere

- **T0338** · prefisso avviso pozione mortale (emoji) · `src/features/notte/azioni/AzioneStrega.jsx:154`
  TESTO: ⚠️ 

### Notte — Addolorata

- **T0339** · nessuna vittima al rogo · `src/features/notte/azioni/AzioneAddolorata.jsx:27`
  TESTO: Nessuna vittima al rogo questa notte: nessuna azione disponibile.

- **T0340** · suffisso nome attore Addolorata · `src/features/notte/azioni/AzioneAddolorata.jsx:61`
  TESTO:  (${attore.nome})

- **T0341** · Addolorata: potere già usato, parte 1/2 · `src/features/notte/azioni/AzioneAddolorata.jsx:64`
  TESTO: Potere già utilizzato in questa partita

- **T0342** · Addolorata: potere già usato, parte 2/2 · `src/features/notte/azioni/AzioneAddolorata.jsx:64`
  TESTO: .

- **T0343** · Addolorata: ruolo già scambiato, parte 1/3 · `src/features/notte/azioni/AzioneAddolorata.jsx:70`
  TESTO: Il ruolo di 

- **T0344** · Addolorata: ruolo già scambiato, parte 2/3 · `src/features/notte/azioni/AzioneAddolorata.jsx:70`
  TESTO:  è già stato scambiato da un'altra Addolorata

- **T0345** · Addolorata: ruolo già scambiato, parte 3/3 · `src/features/notte/azioni/AzioneAddolorata.jsx:70`
  TESTO: .

- **T0346** · domanda scambio Addolorata, parte 1/3 · `src/features/notte/azioni/AzioneAddolorata.jsx:113`
  TESTO: Scambiare il ruolo

- **T0347** · domanda scambio Addolorata, parte 2/3 · `src/features/notte/azioni/AzioneAddolorata.jsx:113`
  TESTO:  con quello di 

- **T0348** · domanda scambio Addolorata, parte 3/3 · `src/features/notte/azioni/AzioneAddolorata.jsx:113`
  TESTO:  (vittima del rogo)?

- **T0349** · avviso ruolo ignoto Addolorata, parte 1/2 · `src/features/notte/azioni/AzioneAddolorata.jsx:115`
  TESTO: ⚠️ Il ruolo di 

- **T0350** · avviso ruolo ignoto Addolorata, parte 2/2 · `src/features/notte/azioni/AzioneAddolorata.jsx:115`
  TESTO:  è ignoto: chi scambia diventa Villico.

- **T0351** · pulsante Annulla scambio · `src/features/notte/azioni/AzioneAddolorata.jsx:118`
  TESTO: Annulla scambio

- **T0352** · pulsante Scambia · `src/features/notte/azioni/AzioneAddolorata.jsx:118`
  TESTO: Scambia

### Notte — Ladro

- **T0353** · domanda carte scartate Ladro · `src/features/notte/azioni/AzioneLadro.jsx:119`
  TESTO: Quali due carte sono rimaste fuori dal mazzo, tra quelle non assegnate a nessuno?

- **T0354** · etichetta prima carta scartata · `src/features/notte/azioni/AzioneLadro.jsx:122`
  TESTO: Prima carta

- **T0355** · opzione vuota selettore prima carta · `src/features/notte/azioni/AzioneLadro.jsx:124`
  TESTO: — scegli —

- **T0356** · etichetta seconda carta scartata · `src/features/notte/azioni/AzioneLadro.jsx:133`
  TESTO: Seconda carta

- **T0357** · opzione vuota selettore seconda carta · `src/features/notte/azioni/AzioneLadro.jsx:135`
  TESTO: — scegli —

- **T0358** · Ladro guarda le carte, parte 1/3 · `src/features/notte/azioni/AzioneLadro.jsx:147`
  TESTO:  Il Ladro guarda le due carte rimaste: 

- **T0359** · Ladro guarda le carte, parte 2/3 · `src/features/notte/azioni/AzioneLadro.jsx:148`
  TESTO:  e 

- **T0360** · Ladro guarda le carte, parte 3/3 · `src/features/notte/azioni/AzioneLadro.jsx:148`
  TESTO: . 

- **T0361** · aria-label gruppo chip Ladro · `src/features/notte/azioni/AzioneLadro.jsx:150`
  TESTO: Cosa sceglie il Ladro

- **T0362** · pulsante Ladro resta Villico · `src/features/notte/azioni/AzioneLadro.jsx:173`
  TESTO:  Resta Villico 

- **T0363** · scelta del Mimo imitatore del Ladro, parte 1/2 · `src/features/notte/azioni/AzioneLadro.jsx:183`
  TESTO: Ora sceglie 

- **T0364** · scelta del Mimo imitatore del Ladro, parte 2/2 · `src/features/notte/azioni/AzioneLadro.jsx:183`
  TESTO:  (Mimo, imita il Ladro), tra le carte rimaste.

- **T0365** · aria-label gruppo chip Mimo imitatore del Ladro · `src/features/notte/azioni/AzioneLadro.jsx:184`
  TESTO: Cosa sceglie il Mimo

- **T0366** · chip Resta Villico (Mimo) · `src/features/notte/azioni/AzioneLadro.jsx:193`
  TESTO: Resta Villico

### Notte — Veggente / Veggente Mannaro

- **T0367** · etichetta attore predefinita Veggente · `src/features/notte/azioni/AzioneIndagine.jsx:15`
  TESTO: Veggente

- **T0368** · nessun bersaglio disponibile · `src/features/notte/azioni/AzioneIndagine.jsx:80`
  TESTO: Nessun bersaglio disponibile.

- **T0369** · titolo scelta Veggente (defunto) · `src/features/notte/azioni/AzioneIndagine.jsx:89`
  TESTO: Chi interrogare (defunto)

- **T0370** · titolo scelta Veggente · `src/features/notte/azioni/AzioneIndagine.jsx:89`
  TESTO: Chi indagare

- **T0371** · aria-label gruppo chip Veggente · `src/features/notte/azioni/AzioneIndagine.jsx:90`
  TESTO: Chi indagare

- **T0372** · avviso Polpo Mannaro, parte 1/4 · `src/features/notte/azioni/AzioneIndagine.jsx:108`
  TESTO: 🐙 Accecat

- **T0373** · avviso Polpo Mannaro, desinenza plurale (Accecati) · `src/features/notte/azioni/AzioneIndagine.jsx:108`
  TESTO: i

- **T0374** · avviso Polpo Mannaro, desinenza singolare (Accecato) · `src/features/notte/azioni/AzioneIndagine.jsx:108`
  TESTO: o

- **T0375** · avviso Polpo Mannaro, parte 3/4 · `src/features/notte/azioni/AzioneIndagine.jsx:108`
  TESTO:  dal Polpo Mannaro: 

- **T0376** · avviso Polpo Mannaro, punto finale · `src/features/notte/azioni/AzioneIndagine.jsx:108`
  TESTO: .

- **T0377** · avviso inibito dalla Fattucchiera, parte 1/3 · `src/features/notte/azioni/AzioneIndagine.jsx:111`
  TESTO: 🚫 Inibito dalla Fattucchiera: 

- **T0378** · avviso inibito dalla Fattucchiera, parte 3/3 · `src/features/notte/azioni/AzioneIndagine.jsx:111`
  TESTO:  (non riceve l'indagine).

- **T0379** · esito indagine, parte 1/2 ("Aura ") · `src/features/notte/azioni/AzioneIndagine.jsx:114`
  TESTO:  Aura 

- **T0380** · esito indagine: aura malvagia · `src/features/notte/azioni/AzioneIndagine.jsx:115`
  TESTO: malvagia

- **T0381** · esito indagine: aura benevola · `src/features/notte/azioni/AzioneIndagine.jsx:115`
  TESTO: benevola

### Notte — titolo del passo

- **T0382** · titolo del passo · `src/data/nightSteps.js:17`
  TESTO: Mimo

- **T0383** · titolo del passo · `src/data/nightSteps.js:18`
  TESTO: Ladro

- **T0384** · titolo del passo · `src/data/nightSteps.js:25`
  TESTO: Cucciolo di Lupo Mannaro

- **T0385** · titolo del passo · `src/data/nightSteps.js:26`
  TESTO: Lupo Mannaro Capobranco

- **T0386** · titolo del passo · `src/data/nightSteps.js:27`
  TESTO: Lupo Mannaro Progenitore

- **T0387** · titolo del passo · `src/data/nightSteps.js:28`
  TESTO: Nonna

- **T0388** · titolo del passo · `src/data/nightSteps.js:31`
  TESTO: Lupo Mannaro

- **T0389** · titolo del passo · `src/data/nightSteps.js:42`
  TESTO: Criceto Malvagio

- **T0390** · titolo del passo · `src/data/nightSteps.js:43`
  TESTO: Eremita

- **T0391** · titolo del passo · `src/data/nightSteps.js:44`
  TESTO: Nano

- **T0392** · titolo del passo · `src/data/nightSteps.js:45`
  TESTO: Pastore

- **T0393** · titolo del passo · `src/data/nightSteps.js:46`
  TESTO: Polpo Mannaro

- **T0394** · titolo del passo · `src/data/nightSteps.js:47`
  TESTO: Ubriaco

- **T0395** · titolo del passo · `src/data/nightSteps.js:48`
  TESTO: Ambasciatore

- **T0396** · titolo del passo · `src/data/nightSteps.js:49`
  TESTO: Berserker

- **T0397** · titolo del passo · `src/data/nightSteps.js:53`
  TESTO: Mezzosangue

- **T0398** · titolo del passo · `src/data/nightSteps.js:54`
  TESTO: Bardo 

- **T0399** · titolo del passo · `src/data/nightSteps.js:55`
  TESTO: Gallo Mannaro

- **T0400** · titolo del passo · `src/data/nightSteps.js:56`
  TESTO: Apprendista

- **T0401** · titolo del passo · `src/data/nightSteps.js:57`
  TESTO: Cavaliere

- **T0402** · titolo del passo · `src/data/nightSteps.js:58`
  TESTO: Figlia dei Lupi

- **T0403** · titolo del passo · `src/data/nightSteps.js:59`
  TESTO: Sacerdote

- **T0404** · titolo del passo · `src/data/nightSteps.js:61`
  TESTO: Innamorati (si riconoscono)

- **T0405** · titolo del passo · `src/data/nightSteps.js:66`
  TESTO: Guardie (si riconoscono)

- **T0406** · titolo del passo · `src/data/nightSteps.js:70`
  TESTO: Guardie (si riconoscono)

- **T0407** · titolo del passo · `src/data/nightSteps.js:71`
  TESTO: Mucca Mannara (riconosce il branco)

- **T0408** · titolo del passo · `src/data/nightSteps.js:74`
  TESTO: Fattucchiera

- **T0409** · titolo del passo · `src/data/nightSteps.js:75`
  TESTO: Addolorata

- **T0410** · titolo del passo · `src/data/nightSteps.js:76`
  TESTO: Cortigiana

- **T0411** · titolo del passo · `src/data/nightSteps.js:77`
  TESTO: Maga

- **T0412** · titolo del passo · `src/data/nightSteps.js:78`
  TESTO: Paladino

- **T0413** · titolo del passo · `src/data/nightSteps.js:79`
  TESTO: Pifferaio

- **T0414** · titolo del passo · `src/data/nightSteps.js:80`
  TESTO: Untore

- **T0415** · titolo del passo · `src/data/nightSteps.js:81`
  TESTO: Cartomante

- **T0416** · titolo del passo · `src/data/nightSteps.js:82`
  TESTO: Inquisitore

- **T0417** · titolo del passo · `src/data/nightSteps.js:83`
  TESTO: Medium

- **T0418** · titolo del passo · `src/data/nightSteps.js:84`
  TESTO: Veggente

- **T0419** · titolo del passo · `src/data/nightSteps.js:85`
  TESTO: Veggente Mannaro

- **T0420** · titolo del passo · `src/data/nightSteps.js:90`
  TESTO: Guaritore

- **T0421** · titolo del passo · `src/data/nightSteps.js:91`
  TESTO: Sciacallo Mannaro

- **T0422** · titolo del passo · `src/data/nightSteps.js:94`
  TESTO: Strega

- **T0423** · titolo del passo · `src/data/nightSteps.js:97`
  TESTO: Branco dei Lupi

- **T0424** · titolo del passo · `src/data/nightSteps.js:111`
  TESTO: Chupacabra

- **T0425** · titolo del passo · `src/data/nightSteps.js:112`
  TESTO: Ipnotizzati (dal Pifferaio)

- **T0426** · titolo del passo · `src/data/nightSteps.js:159`
  TESTO: Assegna i ruoli rimanenti

### Notte — avvisi dopo un colpo

- **T0427** · avviso immunità notturna Nano / Criceto Malvagio · `src/data/effettiNotte.js:27`
  TESTO: ${giocatore.ruoloSlug === 'nano' ? 'Il Nano' : 'Il Criceto Malvagio'} non può morire di notte

- **T0428** · avviso Cavaliere si immola (schermo) · `src/data/effettiNotte.js:113`
  TESTO: Il Cavaliere si immola al posto di ${target.nome}: muore ${nomi}, ${target.nome} si salva.

- **T0429** · registro Cavaliere si immola (log) · `src/data/effettiNotte.js:114`
  TESTO: ${target.nome} è stato colpito ${mortoDa === 'chupacabra' ? 'dal Chupacabra' : 'dal branco'} ma il Cavaliere ${nomi} si immola al suo posto.

- **T0430** · avviso Berserker sbranato con lupo (schermo) · `src/data/effettiNotte.js:122`
  TESTO: Se il Berserker sarà sbranato, ${lupi.join(', ')} (il lupo più vicino) morirà con lui.

- **T0431** · avviso Berserker sbranato senza lupi (schermo) · `src/data/effettiNotte.js:123`
  TESTO: Il Berserker sbranato: nessun lupo vivo da portare con sé.

- **T0432** · registro Berserker sbranato con lupo (log) · `src/data/effettiNotte.js:125`
  TESTO: Il Berserker ${target.nome} è stato sbranato e uccide lottando ${lupi.join(', ')}.

- **T0433** · registro Berserker sbranato senza lupi (log) · `src/data/effettiNotte.js:126`
  TESTO: Il Berserker ${target.nome} è stato sbranato (nessun lupo vivo da portare con sé).

- **T0434** · avviso Ubriaco sbranato (schermo) · `src/data/effettiNotte.js:133`
  TESTO: ${target.nome} è l'Ubriaco: il branco sarà stordito la prossima notte.

- **T0435** · registro Ubriaco sbranato (log) · `src/data/effettiNotte.js:134`
  TESTO: L'Ubriaco ${target.nome} è stato sbranato: il branco sarà stordito la prossima notte.

- **T0436** · avviso Mezzosangue sbranato (schermo) · `src/data/effettiNotte.js:140`
  TESTO: Il Mezzosangue sbranato non muore: ${target.nome} diventa Lupo Mannaro.

- **T0437** · registro Mezzosangue sbranato (log) · `src/data/effettiNotte.js:141`
  TESTO: Il Mezzosangue ${target.nome} è stato sbranato e diventa Lupo Mannaro.

- **T0438** · avviso cliente della Cortigiana sbranato (schermo) · `src/data/effettiNotte.js:149`
  TESTO: A casa di ${target.nome} c'è anche la Cortigiana ${c.nome}: entrambi moriranno.

- **T0439** · registro Cortigiana muore col cliente (log) · `src/data/effettiNotte.js:150`
  TESTO: La Cortigiana ${c.nome} muore: il suo cliente ${target.nome} è stato sbranato.

- **T0440** · avviso Cucciolo ucciso, vendetta (schermo) · `src/data/effettiNotte.js:159`
  TESTO: Il Cucciolo ${target.nome} è stato ucciso: il branco sbranerà due persone per vendetta.

- **T0441** · registro Cucciolo ucciso, vendetta (log) · `src/data/effettiNotte.js:160`
  TESTO: Il Cucciolo ${target.nome} è stato ucciso: scatta la vendetta del branco.

- **T0442** · avviso Cucciolo diventa adulto (schermo) · `src/data/effettiNotte.js:165`
  TESTO: Morto un lupo, il Cucciolo ${c.nome} diventa adulto: il branco non si vendicherà più.

- **T0443** · registro Cucciolo diventa adulto (log) · `src/data/effettiNotte.js:166`
  TESTO: Il Cucciolo ${c.nome} diventa adulto: è morto il lupo ${target.nome}.

### Notte — scelta di un giocatore

- **T0444** · etichetta predefinita pulsante Salta · `src/components/SceltaGiocatore.jsx:14`
  TESTO: Salta

- **T0445** · nessun bersaglio disponibile · `src/components/SceltaGiocatore.jsx:28`
  TESTO: Nessun bersaglio disponibile.

- **T0446** · pulsante Chiudi · `src/components/SceltaGiocatore.jsx:29`
  TESTO:  Chiudi 

- **T0447** · pulsante Conferma · `src/components/SceltaGiocatore.jsx:54`
  TESTO:  Conferma 

## Giorno, alba, rogo, eventi speciali, registro e vittorie

### Concludi partita

- **T0448** · Pulsante iniziale · `src/components/ConcludiPartita.jsx:10`
  TESTO: Concludi partita

- **T0449** · Domanda di conferma (prima dei pulsanti) · `src/components/ConcludiPartita.jsx:16`
  TESTO: Concludere la partita e tornare alla Home?

- **T0450** · Pulsante di conferma · `src/components/ConcludiPartita.jsx:18`
  TESTO: Sì, concludi

- **T0451** · Pulsante annulla · `src/components/ConcludiPartita.jsx:21`
  TESTO: Annulla

### Alba (annunci)

- **T0452** · Belati se un Pastore ha un Lupo vicino · `src/data/alba.js:13`
  TESTO: Si sentono dei belati.

- **T0453** · Messaggio dell'Ambasciatore · `src/data/alba.js:21`
  TESTO: È arrivato un messaggio dall'ambasciatore.

- **T0454** · Giocatore resuscitato · `src/data/alba.js:27`
  TESTO: ${g.nome} è stato resuscitato.

- **T0455** · Giocatore unto dall'Untore · `src/data/alba.js:34`
  TESTO: ${g.nome} è stato unto dall'Untore.

- **T0456** · Giocatore trasformato in maiale · `src/data/alba.js:37`
  TESTO: ${g.nome} è stato trasformato in maiale dalla Maga.

- **T0457** · Antico sbranato di notte · `src/data/alba.js:42`
  TESTO: ${g.nome} si è rivelato: è L'Antico, ha perso la prima vita ma sopravvive.

- **T0458** · Cavaliere immolato · `src/data/alba.js:46`
  TESTO: ${g.nome} si è rivelato: è il Cavaliere, e si è immolato al posto della vittima.

- **T0459** · Crepacuore del partner · `src/data/alba.js:53`
  TESTO: ${g.nome} è morto/a di crepacuore per la morte del partner.

- **T0460** · Mezzosangue sbranato · `src/data/alba.js:56`
  TESTO: Il Mezzosangue ${g.nome} è stato bersaglio dei lupi e diventa perciò Lupo Mannaro.

- **T0461** · Apprendista eredita il ruolo (frase intera, con maestro opzionale) · `src/data/alba.js:61`
  TESTO: ${g.nome} si rivela: è l'Apprendista${maestro ? ` di ${maestro}` : ''} ed eredita il ruolo di ${nomeRuolo(ruoloPerDisplay(g.ruoloSlug))}.

- **T0462** · Figlia dei Lupi diventa lupo · `src/data/alba.js:65`
  TESTO: ${g.nome} è la Figlia dei Lupi e rimasta orfana diventa Lupo Mannaro.

### Condizioni (nome, mostrato come alt/title in Votazione)

- **T0463** · Nome condizione Accecato · `src/data/conditions.js:2`
  TESTO: Accecato

### Condizioni (descrizione)

- **T0464** · Descrizione Accecato · `src/data/conditions.js:3`
  TESTO: Solo il Veggente può essere accecato dal Polpo Mannaro. Il narratore dirà sempre 'no' a ogni indagine, anche se il Veggente indaga un Lupo Mannaro.

- **T0466** · Descrizione Inibito · `src/data/conditions.js:5`
  TESTO: Il giocatore inibito dalla Fattucchiera non potrà compiere le proprie azioni notturne. Quando il giocatore viene svegliato di notte, il narratore fa un'X con le mani per indicare che il suo potere è stato inibito.

- **T0468** · Descrizione Innamorato · `src/data/conditions.js:7`
  TESTO: I due giocatori uniti dal Sacerdote diventano innamorati. Quando uno dei due muore, anche l'altro morirà per crepacuore. Un innamorato vince se è ancora in vita quando vince la sua fazione, oppure se gli innamorati sono gli unici giocatori rimasti.

- **T0470** · Descrizione Ipnotizzato · `src/data/conditions.js:9`
  TESTO: Un giocatore apprende di essere sotto ipnosi durante l'azione del Pifferaio. Non influisce sui poteri o sulle azioni del ruolo.

- **T0472** · Descrizione Maledetto · `src/data/conditions.js:11`
  TESTO: Si applica quando il villaggio manda al rogo L'Antico. La notte successiva il narratore non sveglia i ruoli buoni (villaggio) con potere attivo; i lupi e i ruoli malvagi o indipendenti agiscono normalmente. L'effetto non si applica ai poteri passivi.

- **T0474** · Descrizione Trasformato · `src/data/conditions.js:13`
  TESTO: All'alba il narratore annuncia quale giocatore è stato trasformato in maiale dalla Maga. Per il giorno successivo potrà esprimersi solo con grugniti e gesti. Non perde il diritto di voto.

- **T0476** · Descrizione Morto sul colpo · `src/data/conditions.js:15`
  TESTO: Un giocatore può morire sul colpo per l'esecuzione del Boia, l'unzione dell'Untore, o se lo Scemo del Villaggio sbaglia la rima. Se la morte avviene durante le votazioni, queste proseguono indisturbate.

- **T0478** · Descrizione Protetto · `src/data/conditions.js:17`
  TESTO: Il giocatore protetto dal Paladino o dalla pozione vitale della Strega non può morire quella notte per i morsi del branco o del Chupacabra. La protezione non blocca la pozione mortale né altri poteri.

- **T0480** · Descrizione Resuscitato · `src/data/conditions.js:19`
  TESTO: Se durante la notte il Guaritore o lo Sciacallo Mannaro usano i propri poteri, il giocatore torna in vita a tutti gli effetti.

- **T0482** · Descrizione Unto · `src/data/conditions.js:21`
  TESTO: All'alba il narratore annuncia chi è stato colpito dai poteri dell'Untore. Da quel momento il giocatore non potrà dire 'sì' né 'no'; se lo farà morirà all'istante, infettando il vicino alla sua destra e quello alla sua sinistra.

### Condizioni (nome)

- **T0465** · Nome condizione Inibito · `src/data/conditions.js:4`
  TESTO: Inibito

- **T0467** · Nome condizione Innamorato · `src/data/conditions.js:6`
  TESTO: Innamorato

- **T0469** · Nome condizione Ipnotizzato · `src/data/conditions.js:8`
  TESTO: Ipnotizzato

- **T0471** · Nome condizione Maledetto · `src/data/conditions.js:10`
  TESTO: Maledetto

- **T0473** · Nome condizione Trasformato · `src/data/conditions.js:12`
  TESTO: Trasformato

- **T0475** · Nome condizione Morto sul colpo · `src/data/conditions.js:14`
  TESTO: Morto sul colpo

- **T0477** · Nome condizione Protetto · `src/data/conditions.js:16`
  TESTO: Protetto

- **T0479** · Nome condizione Resuscitato · `src/data/conditions.js:18`
  TESTO: Resuscitato

- **T0481** · Nome condizione Unto · `src/data/conditions.js:20`
  TESTO: Unto

### Eventi speciali / Promemoria morte

- **T0483** · Vendetta del Cucciolo · `src/data/eventiSpeciali.js:106`
  TESTO: Vendetta del Cucciolo: i lupi sbraneranno due persone la prossima notte.

- **T0484** · Antico prima vita, villaggio maledetto · `src/data/eventiSpeciali.js:107`
  TESTO: L'Antico sopravvive (prima vita) ma il villaggio è maledetto: la notte i poteri del villaggio non si sveglieranno.

- **T0485** · Crepacuore già avvenuto del partner · `src/data/eventiSpeciali.js:134`
  TESTO: È morto anche ${g.nome} (crepacuore).

- **T0486** · Spilungone al primo rogo · `src/data/eventiSpeciali.js:140`
  TESTO: Lo Spilungone si rivela e non muore durante il rogo.

- **T0487** · Cavaliere immolato (versione al passato, fatto=true) · `src/data/eventiSpeciali.js:147`
  TESTO: Il Cavaliere ${g.nome} si è immolato al posto di ${t.nome}: ${t.nome} sopravvive.

- **T0488** · Cavaliere protegge (previsione, fatto=false) · `src/data/eventiSpeciali.js:147`
  TESTO: Il Cavaliere ${g.nome} lo protegge: si immola al suo posto.

- **T0489** · Antico partner sopravvive al crepacuore · `src/data/eventiSpeciali.js:157`
  TESTO: L'Antico ${p.nome} sopravvive al crepacuore (prima vita) ma il villaggio è maledetto: la notte i poteri del villaggio non si sveglieranno.

- **T0490** · Cavaliere si immola per il partner (crepacuore) · `src/data/eventiSpeciali.js:160`
  TESTO: Il Cavaliere ${protettoDa.map((g) => g.nome).join(', ')} si immola al posto di ${p.nome} (crepacuore).

- **T0491** · Morte del partner (crepacuore), versione al passato · `src/data/eventiSpeciali.js:163`
  TESTO: È morto anche ${p.nome} (crepacuore).

- **T0492** · Morte del partner (crepacuore), previsione · `src/data/eventiSpeciali.js:163`
  TESTO: Morirà anche ${p.nome} (crepacuore).

- **T0493** · Apprendista eredita (passato) · `src/data/eventiSpeciali.js:170`
  TESTO: L'Apprendista ${g.nome} ha ereditato il suo ruolo.

- **T0494** · Apprendista erediterà (previsione) · `src/data/eventiSpeciali.js:170`
  TESTO: L'Apprendista ${g.nome} erediterà il suo ruolo.

- **T0495** · Figlia dei Lupi diventata lupo (passato) · `src/data/eventiSpeciali.js:173`
  TESTO: La Figlia dei Lupi ${g.nome} è diventata Lupo Mannaro.

- **T0496** · Figlia dei Lupi diventa lupo (previsione) · `src/data/eventiSpeciali.js:173`
  TESTO: La Figlia dei Lupi ${g.nome} diventa Lupo Mannaro.

- **T0497** · Cucciolo adulto (passato) · `src/data/eventiSpeciali.js:177`
  TESTO: Morto un lupo: il Cucciolo è diventato Lupo Mannaro adulto.

- **T0498** · Cucciolo adulto (previsione) · `src/data/eventiSpeciali.js:177`
  TESTO: Morte di un lupo: il Cucciolo diventa Lupo Mannaro adulto.

- **T0499** · Alchimista esplode (previsione) · `src/data/eventiSpeciali.js:180`
  TESTO: L'Alchimista esplode e trascina con sé un altro giocatore.

### Registro (messaggi)

- **T0500** · Suffisso "(Mimo)" nel nome del giocatore · `src/data/log.js:6`
  TESTO: ${g.nome} (Mimo)

- **T0501** · Causa morte: di notte · `src/data/log.js:9`
  TESTO:  di notte

- **T0502** · Causa morte: al rogo · `src/data/log.js:10`
  TESTO:  al rogo

- **T0503** · Causa morte: sul colpo · `src/data/log.js:11`
  TESTO:  sul colpo

- **T0504** · Causa morte: crepacuore · `src/data/log.js:12`
  TESTO:  di crepacuore

- **T0505** · Causa morte: sacrificio del Cavaliere · `src/data/log.js:13`
  TESTO: : il Cavaliere si è rivelato e immolato al posto della vittima

- **T0506** · Morte sul colpo: Boia · `src/data/log.js:19`
  TESTO: : giustiziato/a dal Boia

- **T0507** · Morte sul colpo: Alchimista · `src/data/log.js:20`
  TESTO: : morto/a per l'esplosione dell'Alchimista

- **T0508** · Morte sul colpo: rima sbagliata · `src/data/log.js:21`
  TESTO: : ha sbagliato la rima (Scemo del Villaggio)

- **T0509** · Morte sul colpo: unzione · `src/data/log.js:22`
  TESTO:  per l'unzione

- **T0510** · Bardo salta la notte · `src/data/log.js:28`
  TESTO: ${nome} (Bardo) inizia a suonare: tutti restano svegli e la notte salta

- **T0511** · Gallo Mannaro salta il giorno · `src/data/log.js:29`
  TESTO: ${nome} (Gallo Mannaro) oggi non canta: tutti dormono e il giorno salta

- **T0512** · Cavaliere sceglie chi proteggere · `src/data/log.js:34`
  TESTO: Il Cavaliere ${nome} sceglie di proteggere ${t}

- **T0513** · Apprendista sceglie il maestro · `src/data/log.js:35`
  TESTO: L'Apprendista ${nome} sceglie ${t} come maestro

- **T0514** · Figlia dei Lupi sceglie · `src/data/log.js:36`
  TESTO: La Figlia dei Lupi ${nome} sceglie ${t} come suo genitore

- **T0515** · Boia giustizia · `src/data/log.js:74`
  TESTO: Il Boia ${nomeLog(boia)} giustizia ${giocatore.nome}

- **T0516** · Morte generica (${causa} è una delle etichette sopra) · `src/data/log.js:74`
  TESTO: ${nome} è morto/a${causa}

- **T0517** · Borgomastro morto · `src/data/log.js:78`
  TESTO: ${nome} era il Borgomastro: il villaggio dovrà eleggerne uno nuovo

- **T0518** · Resuscitato/a · `src/data/log.js:88`
  TESTO: ${nome} è stato/a resuscitato/a

- **T0519** · Tornato/a in vita · `src/data/log.js:88`
  TESTO: ${nome} è tornato/a in vita

- **T0520** · Chi resuscita: Guaritore (parte di una frase) · `src/data/log.js:97`
  TESTO: Il Guaritore

- **T0521** · Chi resuscita: Sciacallo Mannaro (parte di una frase) · `src/data/log.js:97`
  TESTO: Lo Sciacallo Mannaro

- **T0522** · Chi resuscita: fallback · `src/data/log.js:97`
  TESTO: Il Guaritore/Sciacallo

- **T0523** · Scelta di resuscitare (${chi} è una delle tre stringhe sopra) · `src/data/log.js:98`
  TESTO: ${chi} sceglie di resuscitare ${giocatore.nome}

- **T0524** · Antico rivelato · `src/data/log.js:108`
  TESTO: ${nome} si è rivelato/a: è L'Antico, perde la prima vita e sopravvive

- **T0525** · Villaggio maledetto · `src/data/log.js:112`
  TESTO: Il villaggio è maledetto: la notte successiva il villaggio non potrà usare i propri poteri

- **T0526** · Rivelazione diurna di un ruolo · `src/data/log.js:116`
  TESTO: ${nome} si è rivelato/a: è ${nomeRuolo(slug)}

- **T0527** · Borgomastro eletto · `src/data/log.js:120`
  TESTO: ${nome} è stato/a eletto/a Borgomastro

- **T0528** · Fantasma Onnisciente · `src/data/log.js:123`
  TESTO: ${nome} riceve la carta del Fantasma Onnisciente

- **T0529** · Sacerdote unisce due giocatori · `src/data/log.js:134`
  TESTO: Il Sacerdote unisce ${giocatore.nome} e ${partner.nome}: sono innamorati

- **T0530** · Condizione ottenuta (il valore è lo slug) · `src/data/log.js:141`
  TESTO: ${nome} ha ottenuto la condizione "${condizione}"

- **T0531** · Condizione persa (il valore è lo slug) · `src/data/log.js:146`
  TESTO: ${nome} ha perso la condizione "${condizione}"

- **T0532** · Gesto annullato (Gallo/Bardo): frase intera · `src/data/log.js:156`
  TESTO: ${nome}: gesto annullato (${potere === 'gallo-salta-giorno' ? 'Gallo' : 'Bardo'})

- **T0533** · Gesto annullato: Gallo (dentro la frase) · `src/data/log.js:156`
  TESTO: Gallo

- **T0534** · Gesto annullato: Bardo (dentro la frase) · `src/data/log.js:156`
  TESTO: Bardo

- **T0535** · Segnaposto per un bersaglio sconosciuto · `src/data/log.js:169`
  TESTO: ?

- **T0536** · Apprendista eredita il ruolo · `src/data/log.js:181`
  TESTO: ${nome} (Apprendista) eredita il ruolo di ${nomeRuolo(ruoloPerDisplay(giocatore.ruoloSlug))} dal maestro ${nomeTarget(l0.targetId)}

- **T0537** · Figlia dei Lupi si rivela · `src/data/log.js:185`
  TESTO: ${nome} (Figlia dei Lupi) si rivela e diventa Lupo Mannaro

- **T0538** · Ladro: carte scartate (suffisso) · `src/data/log.js:201`
  TESTO: : scarta ${scarto.map((r) => nomeRuolo(ruoloPerDisplay(r))).join(' e ')}

- **T0539** · Ladro: separatore tra le carte scartate (dentro il suffisso sopra) · `src/data/log.js:201`
  TESTO:  e 

- **T0540** · Mimo del Ladro come soggetto · `src/data/log.js:202`
  TESTO: ${giocatore.nome} (Mimo del Ladro)

- **T0541** · Ladro come soggetto · `src/data/log.js:202`
  TESTO: Il Ladro ${giocatore.nome}

- **T0542** · Ladro resta Villico · `src/data/log.js:208`
  TESTO: ${titolo} sceglie di restare Villico${scartate}

- **T0543** · Ladro sceglie un ruolo · `src/data/log.js:209`
  TESTO: ${titolo} sceglie ${nomeRuolo(scelta)}${scartate}

- **T0544** · Mimo imita un ruolo · `src/data/log.js:227`
  TESTO: Il Mimo ${giocatore.nome} imita ${nomeRuolo(ruoloPerDisplay(imitato))}${bersaglio ? ` (${bersaglio.nome})` : ''}

- **T0545** · Cambio di ruolo generico · `src/data/log.js:230`
  TESTO: ${nome} ha assunto il ruolo di ${nomeRuolo(dopoDisplay)}

### Vittoria

- **T0546** · Nessun giocatore in vita · `src/data/vittoria.js:18`
  TESTO: Non è rimasto nessun giocatore in vita: la partita termina senza vincitori.

- **T0547** · Pifferaio ha ipnotizzato tutti · `src/data/vittoria.js:53`
  TESTO: Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.

- **T0548** · Ultimo sopravvissuto · `src/data/vittoria.js:58`
  TESTO: Il ${ultimo.nome} è l'ultimo sopravvissuto: vince lui.

- **T0549** · Ultimi due sopravvissuti (team Mimo) · `src/data/vittoria.js:67`
  TESTO: ${squadra.nome} e Mimo-${squadra.nome} sono gli ultimi due sopravvissuti: vincono insieme.

- **T0550** · Innamorati superstiti · `src/data/vittoria.js:81`
  TESTO: Gli innamorati sono gli unici superstiti: vincono loro.

- **T0551** · Vittoria del Villaggio · `src/data/vittoria.js:88`
  TESTO: Non ci sono più Lupi Mannari in vita: vince il Villaggio.

- **T0552** · Criceti Malvagi (plurale, con Mimo) · `src/data/vittoria.js:100`
  TESTO: I Criceti Malvagi (con il Mimo) rubano la vittoria ai Lupi Mannari: vincono solo loro.

- **T0553** · Criceto Malvagio (singolare) · `src/data/vittoria.js:101`
  TESTO: Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui.

- **T0554** · Capobranco e Mimo-Capobranco · `src/data/vittoria.js:105`
  TESTO: Il Capobranco e il Mimo-Capobranco sono gli ultimi rimasti: la vittoria va ai Capibranco.

- **T0555** · Lupi e Mucca Mannara · `src/data/vittoria.js:108`
  TESTO: I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.

- **T0556** · Vittoria dei Lupi · `src/data/vittoria.js:110`
  TESTO: I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.

### Alba — morti

- **T0557** · Etichetta morto giustiziato dal Boia · `src/features/alba/AlbaPanel.jsx:16`
  TESTO: ${g.nome} (giustiziato/a dal Boia)

- **T0558** · Etichetta morto per crepacuore · `src/features/alba/AlbaPanel.jsx:17`
  TESTO: ${g.nome} (crepacuore)

- **T0560** · Nessun morto · `src/features/alba/AlbaPanel.jsx:118`
  TESTO: Nessuno è morto questa notte.

### Alba

- **T0559** · Titolo dell'Alba (segue il numero del round) · `src/features/alba/AlbaPanel.jsx:116`
  TESTO: Alba {round}

- **T0565** · Pulsante per andare al voto · `src/features/alba/AlbaPanel.jsx:158`
  TESTO: Vai al voto

### Alba — Antico sbranato

- **T0561** · Avviso Antico (dopo {g.nome}; frase su due righe) · `src/features/alba/AlbaPanel.jsx:136`
  TESTO:  è L'Antico: è stato sbranato e ha perso la prima vita. Si rivela al villaggio mostrando la sua carta.

- **T0562** · Pulsante di conferma (prima parte, segue il nome) · `src/features/alba/AlbaPanel.jsx:140`
  TESTO: Conferma la rivelazione di 

### Alba — vittoria

- **T0563** · Emoji davanti al messaggio di vittoria · `src/features/alba/AlbaPanel.jsx:148`
  TESTO: 🏆 

### Alba — avviso Borgomastro

- **T0564** · Avviso elezione Borgomastro (con emoji iniziale) · `src/features/alba/AlbaPanel.jsx:155`
  TESTO: ⚠️ Il villaggio deve eleggere un Borgomastro (menu "Eventi speciali").

### Eventi speciali

- **T0566** · Etichetta Annulla nei sotto-eventi (3 occorrenze) · `src/features/giorno/EventiSpeciali.jsx:32`
  TESTO: Annulla

- **T0567** · Etichetta Annulla nei sotto-eventi (3 occorrenze) · `src/features/giorno/EventiSpeciali.jsx:67`
  TESTO: Annulla

- **T0568** · Etichetta Annulla nei sotto-eventi (3 occorrenze) · `src/features/giorno/EventiSpeciali.jsx:82`
  TESTO: Annulla

- **T0569** · Pulsante Conferma nella conferma semplice · `src/features/giorno/EventiSpeciali.jsx:96`
  TESTO: Conferma

- **T0570** · Pulsante Annulla nella conferma semplice · `src/features/giorno/EventiSpeciali.jsx:99`
  TESTO: Annulla

- **T0573** · Voce menu: Antico · `src/features/giorno/EventiSpeciali.jsx:210`
  TESTO: L'Antico si rivela

- **T0574** · Voce menu: Boia · `src/features/giorno/EventiSpeciali.jsx:214`
  TESTO: Il Boia giustizia

- **T0575** · Voce menu: Alchimista · `src/features/giorno/EventiSpeciali.jsx:219`
  TESTO: L'Alchimista esplode

- **T0576** · Voce menu: Scemo · `src/features/giorno/EventiSpeciali.jsx:224`
  TESTO: Lo Scemo del Villaggio sbaglia la rima

- **T0577** · Voce menu: Innocente · `src/features/giorno/EventiSpeciali.jsx:228`
  TESTO: L'Innocente si rivela

- **T0578** · Voce menu: Unzione · `src/features/giorno/EventiSpeciali.jsx:230`
  TESTO: Morte per unzione

- **T0579** · Voce menu: Bardo · `src/features/giorno/EventiSpeciali.jsx:231`
  TESTO: Il Bardo salta la notte

- **T0580** · Voce menu: Gallo · `src/features/giorno/EventiSpeciali.jsx:234`
  TESTO: Il Gallo Mannaro salta il giorno

- **T0581** · Voce menu: Borgomastro · `src/features/giorno/EventiSpeciali.jsx:236`
  TESTO: Elezione Borgomastro

- **T0582** · Voce menu: Fantasma · `src/features/giorno/EventiSpeciali.jsx:237`
  TESTO: Assegna il Fantasma Onnisciente

- **T0583** · Voce menu: Suocera · `src/features/giorno/EventiSpeciali.jsx:238`
  TESTO: La Suocera si rivela

- **T0584** · Voce menu: Annulla morte · `src/features/giorno/EventiSpeciali.jsx:243`
  TESTO: Annulla morte giocatore

- **T0585** · Pulsante che apre il popup (accanto all'icona) · `src/features/giorno/EventiSpeciali.jsx:259`
  TESTO: Eventi speciali

- **T0586** · aria-label del popup · `src/features/giorno/EventiSpeciali.jsx:266`
  TESTO: Eventi speciali

- **T0587** · aria-label del pulsante di chiusura · `src/features/giorno/EventiSpeciali.jsx:270`
  TESTO: Chiudi

- **T0588** · Simbolo del pulsante di chiusura · `src/features/giorno/EventiSpeciali.jsx:271`
  TESTO: ✕

- **T0589** · Pulsante Chiudi del menu · `src/features/giorno/EventiSpeciali.jsx:281`
  TESTO: Chiudi

### Eventi speciali — Unzione

- **T0571** · Nessun vicino (dentro l'esito) · `src/features/giorno/EventiSpeciali.jsx:154`
  TESTO: nessuno

- **T0572** · Congiunzione tra i due vicini (dentro l'esito) · `src/features/giorno/EventiSpeciali.jsx:154`
  TESTO:  e 

- **T0598** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:318`
  TESTO: Chi è morto per l'unzione

- **T0599** · Messaggio introduttivo (stringa dentro {...} con apici escapati) · `src/features/giorno/EventiSpeciali.jsx:319`
  TESTO: Chi è morto/a per l'unzione (dicendo "sì" o "no"): l'unzione si trasmette ai due vicini vivi.

- **T0600** · Esito: sopravvive · `src/features/giorno/EventiSpeciali.jsx:323`
  TESTO: ${nome(id)} doveva morire per l'unzione ma sopravvive: l'unzione non si trasmette.

- **T0601** · Esito: morto · `src/features/giorno/EventiSpeciali.jsx:324`
  TESTO: ${nome(id)} è morto/a per l'unzione: l'unzione passa ai due vicini vivi, ${nomiVicini(id)}.

### Eventi speciali — Scemo

- **T0590** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:289`
  TESTO: Chi è lo Scemo del Villaggio

- **T0591** · Messaggio introduttivo · `src/features/giorno/EventiSpeciali.jsx:290`
  TESTO: La rima sbagliata rivela e uccide lo Scemo del Villaggio nello stesso istante.

- **T0592** · Esito (frase intera, con variante sopravvive/morto) · `src/features/giorno/EventiSpeciali.jsx:293`
  TESTO: ${nome(id)} si è rivelato/a: è lo Scemo del Villaggio, ha sbagliato la rima ${sopravvive(id) ? 'ma sopravvive.' : 'ed è morto/a.'}

- **T0593** · Variante dentro l'esito: sopravvive · `src/features/giorno/EventiSpeciali.jsx:293`
  TESTO: ma sopravvive.

- **T0594** · Variante dentro l'esito: morto · `src/features/giorno/EventiSpeciali.jsx:293`
  TESTO: ed è morto/a.

### Eventi speciali — Innocente

- **T0595** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:306`
  TESTO: Chi è l'Innocente

- **T0596** · Messaggio introduttivo · `src/features/giorno/EventiSpeciali.jsx:307`
  TESTO: L'Innocente mostra la propria carta al villaggio, dimostrando la sua innocenza.

- **T0597** · Esito · `src/features/giorno/EventiSpeciali.jsx:309`
  TESTO: ${nome(id)} si è rivelato/a: è l'Innocente.

### Eventi speciali — Antico

- **T0602** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:336`
  TESTO: Chi è L'Antico?

- **T0603** · Esito, prima parte (concatenata con la parte seguente) · `src/features/giorno/EventiSpeciali.jsx:339`
  TESTO: ${nome(id)} si è rivelato/a: è L'Antico, perde la prima vita e i suoi poteri.

- **T0604** · Esito, parte aggiuntiva se il villaggio è maledetto · `src/features/giorno/EventiSpeciali.jsx:342`
  TESTO:  Il villaggio è maledetto: la notte successiva i poteri del villaggio non si sveglieranno.

### Eventi speciali — Boia

- **T0605** · Etichetta primo passo · `src/features/giorno/EventiSpeciali.jsx:355`
  TESTO: Chi è il Boia

- **T0606** · Etichetta secondo passo · `src/features/giorno/EventiSpeciali.jsx:356`
  TESTO: Chi giustizia il Boia

- **T0607** · Esito (frase intera) · `src/features/giorno/EventiSpeciali.jsx:360`
  TESTO: ${nome(boiaId)} si è rivelato/a: è il Boia e giustizia ${nome(id)}${sopravvive(id) ? ', che però sopravvive.' : '.'}

- **T0608** · Variante dentro l'esito: sopravvive · `src/features/giorno/EventiSpeciali.jsx:360`
  TESTO: , che però sopravvive.

### Eventi speciali — Alchimista

- **T0609** · Etichetta primo passo · `src/features/giorno/EventiSpeciali.jsx:374`
  TESTO: Chi è l'Alchimista

- **T0610** · Etichetta secondo passo · `src/features/giorno/EventiSpeciali.jsx:375`
  TESTO: Chi trascina con sé l'Alchimista

- **T0611** · Esito: la vittima sopravvive · `src/features/giorno/EventiSpeciali.jsx:380`
  TESTO: ${nome(alchimistaId)} si è rivelato/a: è l'Alchimista ed esplode, ma ${nome(id)} sopravvive.

- **T0612** · Esito: la vittima muore · `src/features/giorno/EventiSpeciali.jsx:381`
  TESTO: ${nome(alchimistaId)} si è rivelato/a: è l'Alchimista ed esplode trascinando con sé ${nome(id)}.

### Eventi speciali — Bardo

- **T0613** · Messaggio di conferma · `src/features/giorno/EventiSpeciali.jsx:393`
  TESTO: Il Bardo esegue il gesto: la notte successiva tutti rimarranno svegli.

- **T0614** · Esito · `src/features/giorno/EventiSpeciali.jsx:394`
  TESTO: Il Bardo ha dato il segnale: la notte successiva sarà saltata.

### Eventi speciali — Gallo Mannaro

- **T0615** · Messaggio di conferma · `src/features/giorno/EventiSpeciali.jsx:401`
  TESTO: Il Gallo Mannaro non canta: si salta l'intero giorno, si passa direttamente alla notte.

- **T0616** · Esito · `src/features/giorno/EventiSpeciali.jsx:402`
  TESTO: Il Gallo Mannaro non ha cantato: il giorno è saltato.

### Eventi speciali — Borgomastro

- **T0617** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:410`
  TESTO: Chi sarà il nuovo Borgomastro?

- **T0618** · Esito · `src/features/giorno/EventiSpeciali.jsx:412`
  TESTO: ${nome(id)} è il nuovo Borgomastro: il suo voto vale doppio.

### Eventi speciali — Fantasma Onnisciente

- **T0619** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:421`
  TESTO: Chi riceve la carta

- **T0620** · Messaggio introduttivo · `src/features/giorno/EventiSpeciali.jsx:422`
  TESTO: Il primo morto sul rogo riceve la carta del Fantasma Onnisciente.

- **T0621** · Esito · `src/features/giorno/EventiSpeciali.jsx:424`
  TESTO: ${nome(id)} riceve la carta del Fantasma Onnisciente.

### Eventi speciali — Suocera

- **T0622** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:433`
  TESTO: Chi era la Suocera

- **T0623** · Messaggio introduttivo · `src/features/giorno/EventiSpeciali.jsx:434`
  TESTO: Per lei non c'è differenza tra la vita e la morte: si rivela solo ora, morendo.

- **T0624** · Esito · `src/features/giorno/EventiSpeciali.jsx:436`
  TESTO: ${nome(id)} si è rivelato/a: era la Suocera.

### Eventi speciali — Annulla morte

- **T0625** · Etichetta scelta giocatore · `src/features/giorno/EventiSpeciali.jsx:445`
  TESTO: Chi va riportato in vita

- **T0626** · Messaggio introduttivo · `src/features/giorno/EventiSpeciali.jsx:446`
  TESTO: Corregge una morte dichiarata per errore. Annulla anche le conseguenze già innescate (es. crepacuore del partner).

- **T0627** · Esito · `src/features/giorno/EventiSpeciali.jsx:447`
  TESTO: ${nome(id)} è tornato/a in vita.

### Eventi speciali — esito

- **T0628** · Pulsante Ok · `src/features/giorno/EventiSpeciali.jsx:457`
  TESTO: Ok

### Giorno — titolo

- **T0629** · Titolo fase: esito rogo · `src/features/giorno/GiornoPanel.jsx:169`
  TESTO: Rogo

- **T0630** · Titolo fase: giorno (segue il numero) · `src/features/giorno/GiornoPanel.jsx:169`
  TESTO: Giorno

- **T0631** · Numero del giorno accodato al titolo · `src/features/giorno/GiornoPanel.jsx:170`
  TESTO:  ${round - 1}

### Promemoria morte

- **T0632** · aria-label dell'elenco conseguenze · `src/features/giorno/PromemoriaMorte.jsx:6`
  TESTO: Conseguenze della morte

### Giorno — timer spareggio

- **T0633** · Timer scaduto · `src/features/giorno/TimerSpareggio.jsx:48`
  TESTO: Tempo scaduto

- **T0634** · Pulsante pausa · `src/features/giorno/TimerSpareggio.jsx:51`
  TESTO: Pausa

- **T0635** · Pulsante avvia · `src/features/giorno/TimerSpareggio.jsx:51`
  TESTO: Avvia

- **T0636** · Pulsante azzera · `src/features/giorno/TimerSpareggio.jsx:54`
  TESTO: Azzera

### Giorno — votazione/esito

- **T0637** · alt dell'icona ruolo quando non è ancora rivelato · `src/features/giorno/Votazione.jsx:40`
  TESTO: Ruolo non ancora rivelato

### Giorno — elenco morti

- **T0638** · Ruolo del giocatore tra parentesi, dopo il nome · `src/features/giorno/Votazione.jsx:49`
  TESTO:  (${ruolo.nome}${exAntico ? ', ex Antico' : ''})

- **T0639** · Parte dentro la parentesi: ex Antico · `src/features/giorno/Votazione.jsx:49`
  TESTO: , ex Antico

- **T0640** · Titolo sezione · `src/features/giorno/Votazione.jsx:60`
  TESTO: Morti

- **T0641** · alt icona Fantasma Onnisciente · `src/features/giorno/Votazione.jsx:80`
  TESTO: Fantasma Onnisciente

### Giorno — esito rogo

- **T0642** · Cavaliere si sacrifica (1/4, prima del nome del Cavaliere) · `src/features/giorno/Votazione.jsx:310`
  TESTO: Il Cavaliere 

- **T0643** · Cavaliere si sacrifica (2/4, dopo il nome del Cavaliere) · `src/features/giorno/Votazione.jsx:310`
  TESTO:  si sacrifica al posto di 

- **T0644** · Cavaliere si sacrifica (3/4, tra i due nomi) · `src/features/giorno/Votazione.jsx:310`
  TESTO: : 

- **T0645** · Cavaliere si sacrifica (4/4, finale) · `src/features/giorno/Votazione.jsx:310`
  TESTO:  sopravvive al rogo.

- **T0646** · Spilungone rivelato (dopo {nome}; frase su due righe) · `src/features/giorno/Votazione.jsx:323`
  TESTO:  rivela la propria carta: è lo Spilungone, troppo alto per qualsiasi patibolo. La notte cala senza vittime.

- **T0647** · Antico rivelato (dopo {nome}; frase su due righe) · `src/features/giorno/Votazione.jsx:332`
  TESTO:  rivela la propria carta: è L'Antico, ma sopravvive perdendo la sua prima vita. Il villaggio è maledetto: la notte successiva il villaggio non userà i suoi poteri.

- **T0648** · Alchimista esplode (1/2, dopo {nome}; segue la variante) · `src/features/giorno/Votazione.jsx:345`
  TESTO:  rivela la propria carta: è l'Alchimista

- **T0649** · Alchimista: la vittima sopravvive (2/2) · `src/features/giorno/Votazione.jsx:347`
  TESTO: ed esplode, ma ${vittima.nome} sopravvive.

- **T0650** · Alchimista: la vittima muore (2/2) · `src/features/giorno/Votazione.jsx:348`
  TESTO: e trascina con sé ${vittima?.nome} nell'aldilà con una grande esplosione pirotecnica.

- **T0652** · Conferma rivelazione: nome ruolo Spilungone (dentro la domanda) · `src/features/giorno/Votazione.jsx:380`
  TESTO: lo Spilungone

- **T0653** · Conferma rivelazione: nome ruolo Antico (dentro la domanda) · `src/features/giorno/Votazione.jsx:380`
  TESTO: L'Antico

- **T0654** · Conferma rivelazione (1/3, prima del nome) · `src/features/giorno/Votazione.jsx:384`
  TESTO: Confermi: 

- **T0655** · Conferma rivelazione (2/3, tra nome e ruolo) · `src/features/giorno/Votazione.jsx:384`
  TESTO:  è 

- **T0656** · Conferma rivelazione (3/3, dopo il ruolo) · `src/features/giorno/Votazione.jsx:384`
  TESTO: ?

- **T0657** · Pulsante Conferma · `src/features/giorno/Votazione.jsx:393`
  TESTO: Conferma

- **T0658** · Pulsante Annulla · `src/features/giorno/Votazione.jsx:396`
  TESTO: Annulla

- **T0659** · Pulsante dichiara morte sul rogo · `src/features/giorno/Votazione.jsx:405`
  TESTO: Dichiara morte sul rogo

- **T0660** · Pulsante Spilungone si rivela · `src/features/giorno/Votazione.jsx:409`
  TESTO: Si rivela: è lo Spilungone

- **T0661** · Pulsante Antico si rivela · `src/features/giorno/Votazione.jsx:414`
  TESTO: Si rivela: è L'Antico

- **T0662** · Pulsante Alchimista si rivela · `src/features/giorno/Votazione.jsx:419`
  TESTO: Si rivela: è l'Alchimista

- **T0663** · Avviso Cavaliere protegge presunto Alchimista (1/3, prima dei nomi dei Cavalieri) · `src/features/giorno/Votazione.jsx:424`
  TESTO: Il Cavaliere 

- **T0664** · Avviso Cavaliere protegge presunto Alchimista (2/3, tra i Cavalieri e il bersaglio) · `src/features/giorno/Votazione.jsx:424`
  TESTO:  protegge 

- **T0665** · Avviso Cavaliere protegge presunto Alchimista (3/3, finale) · `src/features/giorno/Votazione.jsx:424`
  TESTO: : se fosse l'Alchimista non esploderebbe, perché si immolerebbe il Cavaliere al suo posto.

- **T0666** · Vittima designata (singola, prima del nome) · `src/features/giorno/Votazione.jsx:451`
  TESTO: Vittima designata:

- **T0670** · Pulsante Torna al voto · `src/features/giorno/Votazione.jsx:508`
  TESTO: Torna al voto

- **T0671** · Avviso Fantasma Onnisciente · `src/features/giorno/Votazione.jsx:515`
  TESTO: ⚠️ Assegna la carta del Fantasma Onnisciente al primo morto (menu "Eventi speciali").

- **T0672** · Pulsante È notte nel villaggio (esito) · `src/features/giorno/Votazione.jsx:520`
  TESTO: È notte nel villaggio

### Giorno — esito rogo (Alchimista)

- **T0651** · Etichetta scelta della vittima · `src/features/giorno/Votazione.jsx:360`
  TESTO: Chi trascina con sé l'Alchimista

### Giorno — esito rogo (spareggio)

- **T0667** · Vittima designata dopo la conferma (prima del nome) · `src/features/giorno/Votazione.jsx:461`
  TESTO: Vittima designata:

### Giorno — spareggio

- **T0668** · Elenco dei contendenti (prima dell'elenco dei nomi) · `src/features/giorno/Votazione.jsx:470`
  TESTO: Spareggio tra: 

- **T0669** · aria-label del gruppo di scelta · `src/features/giorno/Votazione.jsx:484`
  TESTO: Chi muore nello spareggio

### Giorno — votazione

- **T0673** · alt icona Borgomastro · `src/features/giorno/Votazione.jsx:576`
  TESTO: Borgomastro: il suo voto vale doppio

- **T0674** · Singolare del conteggio voti · `src/features/giorno/Votazione.jsx:579`
  TESTO: voto

- **T0675** · Plurale del conteggio voti · `src/features/giorno/Votazione.jsx:579`
  TESTO: voti

- **T0676** · Pulsante -1 · `src/features/giorno/Votazione.jsx:581`
  TESTO: -1

- **T0677** · Pulsante +1 · `src/features/giorno/Votazione.jsx:584`
  TESTO: +1

- **T0678** · Conferma azzeramento voti (testo prima dei pulsanti) · `src/features/giorno/Votazione.jsx:591`
  TESTO: Azzerare tutti i voti?

- **T0679** · Pulsante Sì, ricomincia · `src/features/giorno/Votazione.jsx:600`
  TESTO: Sì, ricomincia

- **T0680** · Pulsante Annulla (azzeramento voti) · `src/features/giorno/Votazione.jsx:603`
  TESTO: Annulla

- **T0681** · Pulsante Ricomincia votazione · `src/features/giorno/Votazione.jsx:608`
  TESTO: Ricomincia votazione

- **T0682** · Nessuno in vita · `src/features/giorno/Votazione.jsx:613`
  TESTO: Non è rimasto nessuno in vita: nessun voto possibile.

- **T0683** · Pulsante È notte nel villaggio (nessuno in vita) · `src/features/giorno/Votazione.jsx:615`
  TESTO: È notte nel villaggio

- **T0684** · Pulsante Vai all'esito · `src/features/giorno/Votazione.jsx:621`
  TESTO: Vai all'esito

## Contenuti: ruoli, condizioni e testo del regolamento

### Ruolo: Addolorata

- **T0685** · nome del ruolo · `src/data/roles.js:2`
  TESTO: Addolorata

- **T0686** · testo delle regole del ruolo · `src/data/roles.js:3`
  TESTO: Ogni notte sceglie se scambiare permanentemente il proprio ruolo con quello della vittima del rogo del giorno precedente; può farlo solo una volta per partita. Se al rogo nessuno viene ucciso (es. *Spilungone*) non può utilizzare il proprio potere.

### Ruolo: Alchimista

- **T0687** · nome del ruolo · `src/data/roles.js:4`
  TESTO: Alchimista

- **T0688** · testo delle regole del ruolo · `src/data/roles.js:5`
  TESTO: Se viene messo al rogo dal villaggio si rivela e sceglie un’altra persona da portare con sé nell’aldilà con una grande esplosione pirotecnica. Se viene sbranato di notte non accade nulla.

### Ruolo: Ambasciatore

- **T0689** · nome del ruolo · `src/data/roles.js:6`
  TESTO: Ambasciatore

- **T0690** · testo delle regole del ruolo · `src/data/roles.js:7`
  TESTO: Finché è in vita, il narratore annuncerà all'alba se durante la notte precedente il veggente ha percepito un'aura benevola. Se l'ambasciatore è morto o il *Veggente* indaga un malvagio il narratore non farà nessun annuncio.

### Ruolo: Apprendista

- **T0691** · nome del ruolo · `src/data/roles.js:8`
  TESTO: Apprendista

- **T0692** · testo delle regole del ruolo · `src/data/roles.js:9`
  TESTO: La prima notte sceglie un maestro da seguire. Quando il maestro muore, l’apprendista si rivela e ne prende la carta, assumendone il ruolo.

### Ruolo: Bardo

- **T0693** · nome del ruolo · `src/data/roles.js:10`
  TESTO: Bardo

- **T0694** · testo delle regole del ruolo · `src/data/roles.js:11`
  TESTO: Grazie alla sua musica tiene sveglio tutto il villaggio, facendo saltare una notte. La prima notte mostra al narratore un gesto segreto. Dopo un rogo, solo una volta per partita, esegue il gesto segreto per attivare il proprio potere.

### Ruolo: Berserker

- **T0695** · nome del ruolo · `src/data/roles.js:12`
  TESTO: Berserker

- **T0696** · testo delle regole del ruolo · `src/data/roles.js:13`
  TESTO: Se questo feroce guerriero viene sbranato dal branco ucciderà lottando il lupo che si trova più vicino a lui. Il narratore all'alba comunicherà la morte di entrambi.

### Ruolo: Boia

- **T0697** · nome del ruolo · `src/data/roles.js:14`
  TESTO: Boia

- **T0698** · testo delle regole del ruolo · `src/data/roles.js:15`
  TESTO: Durante il giorno può giustiziare una persona al proprio grido di battaglia. È consigliabile utilizzare una formula ad effetto, ad esempio: "MUORI FARABUTTO!", oppure "PERISCI CANAGLIA!". Può usare il suo potere soltanto una volta per partita, rivelandosi.

### Ruolo: Borgomastro

- **T0699** · nome del ruolo · `src/data/roles.js:16`
  TESTO: Borgomastro

- **T0700** · testo delle regole del ruolo · `src/data/roles.js:17`
  TESTO: È il primo cittadino del villaggio, quindi il suo voto vale doppio, sia nelle votazioni che ai ballottaggi. All'alba del primo giorno il villaggio elegge il proprio *Borgomastro* consegnandogli la carta del ruolo scoperta (questo giocatore mantiene comunque il ruolo assegnatogli all'inizio della partita). Se viene ucciso, il villaggio dovrà eleggere un nuovo primo cittadino.\n\n**Variante:** All'inizio della partita questa carta viene distribuita casualmente con gli altri ruoli. Chi la riceve gioca con la carta scoperta.

### Ruolo: Cartomante

- **T0701** · nome del ruolo · `src/data/roles.js:18`
  TESTO: Cartomante

- **T0702** · testo delle regole del ruolo · `src/data/roles.js:19`
  TESTO: Ogni notte indica una persona in vita per scoprirne il ruolo (il narratore le mostrerà la carta di chi ha indicato). Utilizzabile come alternativa al *Veggente*.

### Ruolo: Cavaliere

- **T0703** · nome del ruolo · `src/data/roles.js:20`
  TESTO: Cavaliere

- **T0704** · testo delle regole del ruolo · `src/data/roles.js:21`
  TESTO: La prima notte sceglie una persona per la quale è disposto a sacrificarsi. Se questa persona viene sbranata di notte il *Cavaliere* muore al suo posto; se invece viene messa al rogo di giorno il *Cavaliere* rivela la propria carta immolandosi al suo posto.

### Ruolo: Chupacabra

- **T0705** · nome del ruolo · `src/data/roles.js:22`
  TESTO: Chupacabra

- **T0706** · testo delle regole del ruolo · `src/data/roles.js:23`
  TESTO: Ogni notte si sveglia e va a caccia cercando di sbranare un lupo: se lo trova lo uccide; se punta un altro abitante la sua caccia fallisce. Quando tutti i lupi sono stati uccisi inizierà a uccidere ogni notte un qualsiasi abitante. Vince se rimane l'ultimo sopravvissuto. Il villaggio non può vincere finché il *Chupacabra* è in vita.

### Ruolo: Cortigiana

- **T0707** · nome del ruolo · `src/data/roles.js:24`
  TESTO: Cortigiana

- **T0708** · testo delle regole del ruolo · `src/data/roles.js:25`
  TESTO: Ogni notte sceglie un cliente a cui fare visita. Durante la notte non può essere uccisa direttamente dai lupi, ma viene uccisa solo se fa visita ad un lupo mannaro o se il cliente scelto viene sbranato dal branco. Viene protetta dal *Paladino* solo quando il proprio cliente viene protetto. Subisce le altre condizioni (inibito, unto, ipnotizzato) normalmente.

### Ruolo: Criceto Malvagio

- **T0709** · nome del ruolo · `src/data/roles.js:26`
  TESTO: Criceto Malvagio

- **T0710** · testo delle regole del ruolo · `src/data/roles.js:27`
  TESTO: Non è un alleato dei lupi ma non può essere ucciso da loro di notte. Se i Lupi Mannari vincono, lui gli ruba la vittoria: diventa l'unico vincitore.

### Ruolo: Cucciolo di Lupo Mannaro

- **T0711** · nome del ruolo · `src/data/roles.js:28`
  TESTO: Cucciolo di Lupo Mannaro

- **T0712** · testo delle regole del ruolo · `src/data/roles.js:29`
  TESTO: Ogni notte si sveglia e uccide insieme al branco. Se viene ucciso, i lupi mannari sbranano due persone in una notte per la sua vendetta. Alla morte del primo lupo il cucciolo diventa adulto, perdendo questo potere.

### Ruolo: Eremita

- **T0713** · nome del ruolo · `src/data/roles.js:30`
  TESTO: Eremita

- **T0714** · testo delle regole del ruolo · `src/data/roles.js:31`
  TESTO: Nonostante si tratti di un normale villico, il *Veggente* leggendo la sua aura lo vedrà sempre malvagio.

### Ruolo: Fantasma Onnisciente

- **T0715** · nome del ruolo · `src/data/roles.js:32`
  TESTO: Fantasma Onnisciente

- **T0716** · testo delle regole del ruolo · `src/data/roles.js:33`
  TESTO: Questa carta non viene distribuita all'inizio del gioco ma viene consegnata al primo morto sul rogo della partita. Da allora questo giocatore potrà tenere gli occhi aperti la notte e ad ogni alba dire una lettera dell'alfabeto (non possono essere le iniziali dei giocatori). Perde inoltre il diritto di voto ai ballottaggi. Vince secondo il ruolo che aveva in vita.

### Ruolo: Fattucchiera

- **T0717** · nome del ruolo · `src/data/roles.js:34`
  TESTO: Fattucchiera

- **T0718** · testo delle regole del ruolo · `src/data/roles.js:35`
  TESTO: Infligge un sortilegio che blocca i poteri di una persona a sua scelta per una notte. (vedi **Inibito**)

### Ruolo: Figlia dei Lupi

- **T0719** · nome del ruolo · `src/data/roles.js:36`
  TESTO: Figlia dei Lupi

- **T0720** · testo delle regole del ruolo · `src/data/roles.js:37`
  TESTO: Durante la prima notte sceglie un genitore, che può essere di qualunque fazione; se questo muore lei diventa *Lupo Mannaro* e si sveglia con il resto del branco dalla notte seguente.

### Ruolo: Gallo Mannaro

- **T0721** · nome del ruolo · `src/data/roles.js:38`
  TESTO: Gallo Mannaro

- **T0722** · testo delle regole del ruolo · `src/data/roles.js:39`
  TESTO: Può decidere di non cantare lasciando tutti addormentati per un giorno intero, favorendo così i lupi mannari. La prima notte mostra al narratore un gesto segreto. All'alba, solo una volta per partita, esegue il gesto segreto per attivare il proprio potere.

### Ruolo: Guardia

- **T0723** · nome del ruolo · `src/data/roles.js:40`
  TESTO: Guardia

- **T0724** · testo delle regole del ruolo · `src/data/roles.js:41`
  TESTO: Durante la prima notte conosce il suo collega (o colleghi). Le *Guardie* sono perciò a conoscenza della loro reciproca onestà. Vanno sempre inserite nel mazzo in coppia.

### Ruolo: Guardia Mannara

- **T0725** · nome del ruolo · `src/data/roles.js:42`
  TESTO: Guardia Mannara

- **T0726** · testo delle regole del ruolo · `src/data/roles.js:43`
  TESTO: Durante la prima notte conosce i suoi colleghi. Segretamente patteggia per il branco e vince se vincono i lupi mannari. Va inserita nel mazzo solo se sono già presenti le *Guardie*.

### Ruolo: Guaritore

- **T0727** · nome del ruolo · `src/data/roles.js:44`
  TESTO: Guaritore

- **T0728** · testo delle regole del ruolo · `src/data/roles.js:45`
  TESTO: Grazie al suo potere può riportare in vita un defunto. Può utilizzare questo potere soltanto una volta per partita, sia da vivo che da morto. Può scegliere di usare il proprio potere anche verso sé stesso.

### Ruolo: Innocente

- **T0729** · nome del ruolo · `src/data/roles.js:46`
  TESTO: Innocente

- **T0730** · testo delle regole del ruolo · `src/data/roles.js:47`
  TESTO: È l’unico villico che, nel momento in cui il giocatore lo ritiene più opportuno, può dimostrare al villaggio la sua innocenza, mostrando la propria carta.

### Ruolo: Inquisitore

- **T0731** · nome del ruolo · `src/data/roles.js:48`
  TESTO: Inquisitore

- **T0732** · testo delle regole del ruolo · `src/data/roles.js:49`
  TESTO: Ogni notte ha la possibilità (ma non l’obbligo) di interrogare qualcuno di cui sospetta e sapere se il suo animo è malvagio. Se indaga inutilmente un personaggio con aura benevola perde permanentemente il suo potere.

### Ruolo: Ladro

- **T0733** · nome del ruolo · `src/data/roles.js:50`
  TESTO: Ladro

- **T0734** · testo delle regole del ruolo · `src/data/roles.js:51`
  TESTO: Nel creare il mazzo vanno aggiunte due carte extra. La prima notte il *Ladro* guarda le due carte rimaste e sceglie se assumere il ruolo di una di queste o diventare un semplice *Villico*. Se le due carte rappresentano entrambe *Lupi Mannari* è necessario scambiare la propria carta.

### Ruolo: L'Antico

- **T0735** · nome del ruolo · `src/data/roles.js:52`
  TESTO: L'Antico

- **T0736** · testo delle regole del ruolo · `src/data/roles.js:53`
  TESTO: È dotato di due vite. Se perde la sua prima vita al rogo, si rivela ed infligge una maledizione al villaggio bloccando per una notte i poteri notturni dei ruoli del villaggio (i lupi e i ruoli malvagi o indipendenti agiscono normalmente) (vedi **Maledetto**). Se invece perde la sua prima vita di notte, si rivela all'alba senza conseguenze. Continua poi a giocare come un normale *Villico*.

### Ruolo: Lupo Mannaro

- **T0737** · nome del ruolo · `src/data/roles.js:54`
  TESTO: Lupo Mannaro

- **T0738** · testo delle regole del ruolo · `src/data/roles.js:55`
  TESTO: Ogni notte si sveglia e insieme al suo branco sceglie una vittima da sbranare. I *Lupi Mannari* vincono se rimangono in numero pari o superiore al villaggio.

### Ruolo: Lupo Mannaro Capobranco

- **T0739** · nome del ruolo · `src/data/roles.js:56`
  TESTO: Lupo Mannaro Capobranco

- **T0740** · testo delle regole del ruolo · `src/data/roles.js:57`
  TESTO: Il suo obiettivo è rimanere l’ultimo giocatore in vita. Durante la notte caccia con gli altri lupi ma può scegliere di uccidere anche i suoi fratelli. Nel caso ci sia indecisione tra i lupi nella scelta della vittima ha lui l’ultima parola.

### Ruolo: Lupo Mannaro Progenitore

- **T0741** · nome del ruolo · `src/data/roles.js:58`
  TESTO: Lupo Mannaro Progenitore

- **T0742** · testo delle regole del ruolo · `src/data/roles.js:59`
  TESTO: Caccia con il branco dei lupi. Una sola volta per partita può decidere di trasformare in *Lupo Mannaro* la vittima del branco. Quando ciò avviene il narratore sveglierà segretamente la vittima permettendole di individuare gli altri lupi.

### Ruolo: Maga

- **T0743** · nome del ruolo · `src/data/roles.js:60`
  TESTO: Maga

- **T0744** · testo delle regole del ruolo · `src/data/roles.js:61`
  TESTO: Ogni notte lancia un incantesimo su una persona, trasformandola in maiale per una giornata. Il malcapitato dovrà parlare solo tramite grugniti fino al calar della notte (vedi **Trasformato**).

### Ruolo: Medium

- **T0745** · nome del ruolo · `src/data/roles.js:62`
  TESTO: Medium

- **T0746** · testo delle regole del ruolo · `src/data/roles.js:63`
  TESTO: Ogni notte può interrogare un membro del villaggio defunto in merito alla sua vita passata e scoprire quale fosse il suo “vecchio” ruolo guardandone la carta.\n\n**Variante**: Il Medium potrà percepire soltanto se il ruolo avesse aura benevola o malvagia

### Ruolo: Mezzosangue

- **T0747** · nome del ruolo · `src/data/roles.js:64`
  TESTO: Mezzosangue

- **T0748** · testo delle regole del ruolo · `src/data/roles.js:65`
  TESTO: A causa del suo sangue misto, se viene sbranato dai lupi non muore ma diventa Lupo Mannaro. Nel caso non venga mai sbranato rimane un normale Villico che vince assieme al villaggio.

### Ruolo: Mimo

- **T0749** · nome del ruolo · `src/data/roles.js:66`
  TESTO: Mimo

- **T0750** · testo delle regole del ruolo · `src/data/roles.js:67`
  TESTO: La prima notte sceglie un giocatore e ne imita il ruolo per tutta la partita. Se il ruolo scelto compie delle azioni di notte (*Lupo Mannaro, Veggente, Paladino* etc.) il *Mimo* si sveglia assieme ad esso e si accorda sull'agire.

### Ruolo: Mucca Mannara

- **T0751** · nome del ruolo · `src/data/roles.js:68`
  TESTO: Mucca Mannara

- **T0752** · testo delle regole del ruolo · `src/data/roles.js:69`
  TESTO: La prima notte si sveglia e identifica segretamente i membri del branco (tutti i lupi alzeranno il pollice). Vince assieme ai lupi mannari ma, essendo erbivora, non uccide e non partecipa alle cacce.

### Ruolo: Nano

- **T0753** · nome del ruolo · `src/data/roles.js:70`
  TESTO: Nano

- **T0754** · testo delle regole del ruolo · `src/data/roles.js:71`
  TESTO: Data la sua statura, non viene notato dai lupi durante la notte, quindi non può venire ucciso da loro. Può morire solo durante il rogo.

### Ruolo: Nonna

- **T0755** · nome del ruolo · `src/data/roles.js:72`
  TESTO: Nonna

- **T0756** · testo delle regole del ruolo · `src/data/roles.js:73`
  TESTO: Sotto le vesti si nasconde un lupo mannaro qualsiasi. Nonostante ciò il *Veggente*, leggendo la sua aura, lo vedrà sempre come benevolo.

### Ruolo: Paladino

- **T0757** · nome del ruolo · `src/data/roles.js:74`
  TESTO: Paladino

- **T0758** · testo delle regole del ruolo · `src/data/roles.js:75`
  TESTO: Ogni notte può scegliere qualcuno a cui offrire la sua protezione, impedendo che venga sbranato dai lupi mannari. Può proteggere anche se stesso. (vedi **Protetto**)

### Ruolo: Pastore

- **T0759** · nome del ruolo · `src/data/roles.js:76`
  TESTO: Pastore

- **T0760** · testo delle regole del ruolo · `src/data/roles.js:77`
  TESTO: Se il primo giocatore vivo alla sua destra o alla sua sinistra è un lupo mannaro le sue pecore si agiteranno ed all'alba il narratore annuncerà che si sentono dei belati.

### Ruolo: Pifferaio

- **T0761** · nome del ruolo · `src/data/roles.js:78`
  TESTO: Pifferaio

- **T0762** · testo delle regole del ruolo · `src/data/roles.js:79`
  TESTO: Ogni notte ipnotizza due persone. Quando tutti i giocatori in vita saranno ipnotizzati, egli avrà vinto il gioco. Gli ipnotizzati si identificano ogni notte (vedi **Ipnotizzato**).

### Ruolo: Polpo Mannaro

- **T0763** · nome del ruolo · `src/data/roles.js:80`
  TESTO: Polpo Mannaro

- **T0764** · testo delle regole del ruolo · `src/data/roles.js:81`
  TESTO: Quando il *Veggente* indaga l'aura del *Polpo Mannaro* viene **accecato**. Da allora fino alla morte del *Polpo*, il *Veggente* vedrà ognuno come benevolo. Il *Veggente Mannaro* non può essere accecato.

### Ruolo: Sacerdote

- **T0765** · nome del ruolo · `src/data/roles.js:82`
  TESTO: Sacerdote

- **T0766** · testo delle regole del ruolo · `src/data/roles.js:83`
  TESTO: La prima notte sceglie due persone, unendole con un sigillo d’amore; se uno dei due morirà, ucciso o mandato al rogo, anche l’altro/a lo seguirà nella tomba (vedi **Innamorato**).

### Ruolo: Scemo del Villaggio

- **T0767** · nome del ruolo · `src/data/roles.js:84`
  TESTO: Scemo del Villaggio

- **T0768** · testo delle regole del ruolo · `src/data/roles.js:85`
  TESTO: Un sortilegio questo ruolo opprime,\nPer esprimersi deve parlar per rime!\nMa se, ahimè, la sua rima fallisce\nLo sfortunato all'istante perisce!

### Ruolo: Sciacallo Mannaro

- **T0769** · nome del ruolo · `src/data/roles.js:86`
  TESTO: Sciacallo Mannaro

- **T0770** · testo delle regole del ruolo · `src/data/roles.js:87`
  TESTO: Ha il potere di far resuscitare, una volta per partita, un altro giocatore. Può utilizzare questo potere anche se lui stesso è morto. Non conosce chi sono i lupi mannari e non caccia con loro.

### Ruolo: Spilungone

- **T0771** · nome del ruolo · `src/data/roles.js:88`
  TESTO: Spilungone

- **T0772** · testo delle regole del ruolo · `src/data/roles.js:89`
  TESTO: Essendo troppo alto per qualsiasi patibolo, non può essere messo al rogo dal villaggio durante il giorno. Nel caso in cui sia il favorito al rogo, svela la propria carta e la notte cala senza vittime.

### Ruolo: Strega

- **T0773** · nome del ruolo · `src/data/roles.js:90`
  TESTO: Strega

- **T0774** · testo delle regole del ruolo · `src/data/roles.js:91`
  TESTO: Ha a disposizione due pozioni: una dose di pozione vitale (che protegge un giocatore dalla morte durante quella notte) e una dose di pozione mortale. Ogni notte si sveglia e può decidere se utilizzare o meno ciascuna delle due dosi.

### Ruolo: Suocera

- **T0775** · nome del ruolo · `src/data/roles.js:92`
  TESTO: Suocera

- **T0776** · testo delle regole del ruolo · `src/data/roles.js:93`
  TESTO: Per lei non c'è differenza tra la vita e la morte. Quando muore si rivela e può continuare a parlare durante il giorno. Non è considerata in vita per le condizioni di vittoria.

### Ruolo: Ubriaco

- **T0777** · nome del ruolo · `src/data/roles.js:94`
  TESTO: Ubriaco

- **T0778** · testo delle regole del ruolo · `src/data/roles.js:95`
  TESTO: Se muore sbranato dai lupi mannari, la gran quantità di alcol nel suo sangue li stordisce, impedendo loro di uccidere la notte successiva.

### Ruolo: Untore

- **T0779** · nome del ruolo · `src/data/roles.js:96`
  TESTO: Untore

- **T0780** · testo delle regole del ruolo · `src/data/roles.js:97`
  TESTO: Ogni notte unge una vittima, che per il giorno successivo non potrà dire né “sì” né “no”, altrimenti morirà trasmettendo l'unzione alle persone ai suoi fianchi (vedi **Unto**).

### Ruolo: Veggente

- **T0781** · nome del ruolo · `src/data/roles.js:98`
  TESTO: Veggente

- **T0782** · testo delle regole del ruolo · `src/data/roles.js:99`
  TESTO: Ogni notte può leggere l’aura di un altro componente del villaggio ancora in vita e può sapere se è dalla parte del villaggio o dalla parte dei lupi.

### Ruolo: Veggente Mannaro

- **T0783** · nome del ruolo · `src/data/roles.js:100`
  TESTO: Veggente Mannaro

- **T0784** · testo delle regole del ruolo · `src/data/roles.js:101`
  TESTO: Ogni notte può leggere l’aura di una persona in vita e sapere se è dalla parte del villaggio o dalla parte dei lupi. Pur non conoscendo il branco, patteggia per loro.

### Ruolo: Villico

- **T0785** · nome del ruolo · `src/data/roles.js:102`
  TESTO: Villico

- **T0786** · testo delle regole del ruolo · `src/data/roles.js:103`
  TESTO: Un umile contadino senza alcun potere. Il suo obiettivo è difendere il proprio villaggio dai lupi mannari, votando i cittadini sospetti di licantropia e mandandoli al rogo. Il villaggio vince se riesce ad uccidere tutti i lupi mannari.

### Condizione: Accecato

- **T0787** · nome della condizione · `src/data/conditions.js:2`
  TESTO: Accecato

- **T0788** · descrizione della condizione · `src/data/conditions.js:3`
  TESTO: Solo il Veggente può essere accecato dal Polpo Mannaro. Il narratore dirà sempre 'no' a ogni indagine, anche se il Veggente indaga un Lupo Mannaro.

### Condizione: Inibito

- **T0789** · nome della condizione · `src/data/conditions.js:4`
  TESTO: Inibito

- **T0790** · descrizione della condizione · `src/data/conditions.js:5`
  TESTO: Il giocatore inibito dalla Fattucchiera non potrà compiere le proprie azioni notturne. Quando il giocatore viene svegliato di notte, il narratore fa un'X con le mani per indicare che il suo potere è stato inibito.

### Condizione: Innamorato

- **T0791** · nome della condizione · `src/data/conditions.js:6`
  TESTO: Innamorato

- **T0792** · descrizione della condizione · `src/data/conditions.js:7`
  TESTO: I due giocatori uniti dal Sacerdote diventano innamorati. Quando uno dei due muore, anche l'altro morirà per crepacuore. Un innamorato vince se è ancora in vita quando vince la sua fazione, oppure se gli innamorati sono gli unici giocatori rimasti.

### Condizione: Ipnotizzato

- **T0793** · nome della condizione · `src/data/conditions.js:8`
  TESTO: Ipnotizzato

- **T0794** · descrizione della condizione · `src/data/conditions.js:9`
  TESTO: Un giocatore apprende di essere sotto ipnosi durante l'azione del Pifferaio. Non influisce sui poteri o sulle azioni del ruolo.

### Condizione: Maledetto

- **T0795** · nome della condizione · `src/data/conditions.js:10`
  TESTO: Maledetto

- **T0796** · descrizione della condizione · `src/data/conditions.js:11`
  TESTO: Si applica quando il villaggio manda al rogo L'Antico. La notte successiva il narratore non sveglia i ruoli buoni (villaggio) con potere attivo; i lupi e i ruoli malvagi o indipendenti agiscono normalmente. L'effetto non si applica ai poteri passivi.

### Condizione: Trasformato

- **T0797** · nome della condizione · `src/data/conditions.js:12`
  TESTO: Trasformato

- **T0798** · descrizione della condizione · `src/data/conditions.js:13`
  TESTO: All'alba il narratore annuncia quale giocatore è stato trasformato in maiale dalla Maga. Per il giorno successivo potrà esprimersi solo con grugniti e gesti. Non perde il diritto di voto.

### Condizione: Morto sul colpo

- **T0799** · nome della condizione · `src/data/conditions.js:14`
  TESTO: Morto sul colpo

- **T0800** · descrizione della condizione · `src/data/conditions.js:15`
  TESTO: Un giocatore può morire sul colpo per l'esecuzione del Boia, l'unzione dell'Untore, o se lo Scemo del Villaggio sbaglia la rima. Se la morte avviene durante le votazioni, queste proseguono indisturbate.

### Condizione: Protetto

- **T0801** · nome della condizione · `src/data/conditions.js:16`
  TESTO: Protetto

- **T0802** · descrizione della condizione · `src/data/conditions.js:17`
  TESTO: Il giocatore protetto dal Paladino o dalla pozione vitale della Strega non può morire quella notte per i morsi del branco o del Chupacabra. La protezione non blocca la pozione mortale né altri poteri.

### Condizione: Resuscitato

- **T0803** · nome della condizione · `src/data/conditions.js:18`
  TESTO: Resuscitato

- **T0804** · descrizione della condizione · `src/data/conditions.js:19`
  TESTO: Se durante la notte il Guaritore o lo Sciacallo Mannaro usano i propri poteri, il giocatore torna in vita a tutti gli effetti.

### Condizione: Unto

- **T0805** · nome della condizione · `src/data/conditions.js:20`
  TESTO: Unto

- **T0806** · descrizione della condizione · `src/data/conditions.js:21`
  TESTO: All'alba il narratore annuncia chi è stato colpito dai poteri dell'Untore. Da quel momento il giocatore non potrà dire 'sì' né 'no'; se lo farà morirà all'istante, infettando il vicino alla sua destra e quello alla sua sinistra.

### Regolamento — Contenuto

- **T0807** · titolo di sezione · `src/data/libretto.js:9`
  TESTO: Contenuto

- **T0808** · paragrafo · `src/data/libretto.js:10`
  TESTO: Questo gioco contiene:

- **T0809** · voce di elenco · `src/data/libretto.js:13`
  TESTO: 78 carte, di cui:

- **T0810** · sotto-voce di elenco · `src/data/libretto.js:14`
  TESTO: 15 Villici

- **T0811** · sotto-voce di elenco · `src/data/libretto.js:14`
  TESTO: 5 Lupi Mannari

- **T0812** · sotto-voce di elenco · `src/data/libretto.js:14`
  TESTO: 51 ruoli speciali

- **T0813** · sotto-voce di elenco · `src/data/libretto.js:14`
  TESTO: 3 carte Riassunto

- **T0814** · sotto-voce di elenco · `src/data/libretto.js:14`
  TESTO: 4 carte personalizzabili

- **T0815** · voce di elenco · `src/data/libretto.js:16`
  TESTO: Questo libretto

### Regolamento — Introduzione

- **T0816** · titolo di sezione · `src/data/libretto.js:20`
  TESTO: Introduzione

- **T0817** · paragrafo · `src/data/libretto.js:21`
  TESTO: *Fino a poco tempo fa, l'unica preoccupazione a Redcoon era sopportare i pettegolezzi della Suocera o le rime strampalate dello Scemo del Villaggio. Ora, però, i Lupi Mannari sono tra noi. Alla luce del sole ci si guarda con sospetto, tutti pronti a puntare il dito l'uno contro l'altro; ma di notte il sangue scorre tra maledizioni e oscure vendette. Prepara la tua arringa difensiva e non fidarti di nessuno: qui l'alba non è mai garantita, e il tuo vicino ha stranamente troppi peli sulle braccia...*

### Regolamento — Obiettivi

- **T0818** · titolo di sezione · `src/data/libretto.js:24`
  TESTO: Obiettivi

- **T0819** · paragrafo · `src/data/libretto.js:25`
  TESTO: Nel gioco ci sono due fazioni: quella dei **Lupi** e quella dei **Villici**. Lo scopo dei Lupi è di **eliminare** tutti i Villici. Viceversa quello dei Villici è di **bruciare sul rogo** tutti i Lupi.⏎All'inizio del gioco scegliete chi farà il **Narratore**, che non appartiene a nessuna fazione e gestisce solo la partita. Distribuite una carta coperta ad ogni altro giocatore (sarà il suo ruolo). I giocatori guardano segretamente la propria carta e la tengono coperta fino alla fine del gioco.

### Regolamento — È notte nel villaggio...

- **T0820** · titolo di sezione · `src/data/libretto.js:29`
  TESTO: È notte nel villaggio...

- **T0821** · paragrafo · `src/data/libretto.js:31`
  TESTO: Durante il gioco si alternano due fasi: la **notte** e il **giorno**.

- **T0822** · paragrafo · `src/data/libretto.js:31`
  TESTO: Di notte** **tutti (anche i morti!) **chiudono ****gli occhi** e il **narratore** chiama i singoli ruoli con abilità particolari, che si **svegliano** per svolgere le loro **azioni**; per ultimi si svegliano i *Lupi Mannari*, che **sbranano** un giocatore. Tutti i ruoli che agiscono di notte devono essere chiamati: se il personaggio è **morto** non potrà agire ma il narratore lascerà comunque un **momento di silenzio** per non far capire che quel personaggio non è più in gioco.

- **T0823** · paragrafo · `src/data/libretto.js:31`
  TESTO: **Di giorno** il narratore annuncia gli avvenimenti della notte (se e quali giocatori sono morti o sono stati colpiti dai poteri di altri ruoli), poi tutti gli abitanti del villaggio **discutono** **e condannano** al rogo una persona, sperando che sia un lupo mannaro.⏎Si inizia a votare dalla destra del morto (o, in assenza di morti, dalla destra del narratore) e si continua il giro in **senso antiorario**. La persona con più voti **muore sul rogo**.⏎In caso di **parità**, i due (o più) candidati al rogo hanno diritto a un'**arringa difensiva**, nella quale, in un tempo limitato e uguale per tutti, devono cercare di **convincere** i compaesani della loro innocenza; al termine delle arringhe il villaggio vota **per alzata di mano** chi tra i candidati mandare al rogo. Durante questo spareggio, in via del tutto eccezionale, **anche i morti possono votare**. Dopo il rogo, il narratore annuncia l'inizio di una **nuova ****notte**, e così via, fino a che una delle fazioni riesce a vincere. La vittoria è di **tutta la fazione** vincente (Lupi o Villici), inclusi i morti.

- **T0824** · titolo di sottosezione · `src/data/libretto.js:36`
  TESTO: I giocatori morti

- **T0825** · voce di elenco · `src/data/libretto.js:38`
  TESTO: Non possono più **parlare** o fare gesti espliciti per accusare altri personaggi

- **T0826** · voce di elenco · `src/data/libretto.js:39`
  TESTO: Non possono più **utilizzare i loro poteri** (a meno che non sia specificato nelle loro abilità)

- **T0827** · voce di elenco · `src/data/libretto.js:40`
  TESTO: Continuano a **chiudere gli occhi** di notte

- **T0828** · voce di elenco · `src/data/libretto.js:41`
  TESTO: Possono **votare**, ma solo per alzata di mano nel caso di uno spareggio tra due giocatori

- **T0829** · paragrafo · `src/data/libretto.js:47`
  TESTO: Nel corso del gioco **non** si può **rivelare** la propria carta, nemmeno quando si muore; sarebbe bene anche evitare di dire il proprio ruolo (es. "io sono il Veggente"), soprattutto se tutti o quasi tutti i giocatori hanno un ruolo speciale, per evitare che il gioco diventi una "**caccia al personaggio**" per capire i ruoli di tutti, nella quale si rischia di **svantaggiare** eccessivamente i Lupi.

- **T0830** · paragrafo · `src/data/libretto.js:48`
  TESTO: Per distinguere i personaggi morti da quelli vivi si utilizza la **posizione della carta**: se viene tenuta con il lato corto rivolto verso il giocatore significa che il personaggio è vivo. Quando un giocatore muore, invece, **ruota** la carta di 90 gradi.

### Regolamento — Comporre il mazzo

- **T0831** · titolo di sezione · `src/data/libretto.js:54`
  TESTO: Comporre il mazzo

- **T0832** · paragrafo · `src/data/libretto.js:55`
  TESTO: Un narratore esperto deve saper **combinare** tra loro i vari ruoli speciali per avere una partita **bilanciata** e **divertente**. Ecco alcuni consigli:

- **T0833** · voce di elenco · `src/data/libretto.js:57`
  TESTO: Per prima cosa inserite un *Lupo Mannaro* ogni cinque giocatori. Scegliete poi i ruoli speciali stando attenti a:

- **T0834** · voce di elenco · `src/data/libretto.js:58`
  TESTO: **Bilanciare** i ruoli a favore dei villici con ruoli a favore dei lupi.

- **T0835** · voce di elenco · `src/data/libretto.js:59`
  TESTO: Non introdurre troppe **fazioni indipendenti**

- **T0836** · voce di elenco · `src/data/libretto.js:60`
  TESTO: Non inserire troppi ruoli che **agiscono di ****notte**, per non allungare eccessivamente i tempi notturni

- **T0837** · voce di elenco · `src/data/libretto.js:61`
  TESTO: Utilizzare con parsimonia i **ruoli che uccidono** altri giocatori (in aggiunta ai lupi)

- **T0838** · voce di elenco · `src/data/libretto.js:62`
  TESTO: Utilizzare con parsimonia i **ruoli che rivelano**** ****sè stessi** alla morte o dopo un'azione

- **T0839** · voce di elenco · `src/data/libretto.js:63`
  TESTO: Evitare di inserire nello stesso mazzo **ruoli ****molto simili **tra loro

### Regolamento — Legenda

- **T0840** · titolo di sezione · `src/data/libretto.js:67`
  TESTO: Legenda

- **T0841** · paragrafo · `src/data/libretto.js:68`
  TESTO: Ogni ruolo fa parte di una determinata fazione:

- **T0842** · nome della fazione (Legenda) · `src/data/libretto.js:70`
  TESTO: Abitante del villaggio

- **T0843** · descrizione della fazione (Legenda) · `src/data/libretto.js:70`
  TESTO: vince se non ci sono più lupi mannari in vita

- **T0844** · nome della fazione (Legenda) · `src/data/libretto.js:71`
  TESTO: Alleato del Branco

- **T0845** · descrizione della fazione (Legenda) · `src/data/libretto.js:71`
  TESTO: vince quando il numero dei lupi mannari è pari o superiore a quello degli altri abitanti del villaggio

- **T0846** · nome della fazione (Legenda) · `src/data/libretto.js:72`
  TESTO: Indipendente

- **T0847** · descrizione della fazione (Legenda) · `src/data/libretto.js:72`
  TESTO: ciascuno di questi ruoli vince da solo secondo le proprie condizioni di vittoria specifiche

- **T0848** · nome della fazione (Legenda) · `src/data/libretto.js:73`
  TESTO: Sconosciuto

- **T0849** · descrizione della fazione (Legenda) · `src/data/libretto.js:73`
  TESTO: Il personaggio saprà a che fazione appartiene solo dopo l'inizio della partita

- **T0850** · nome della fazione (Legenda) · `src/data/libretto.js:74`
  TESTO: Voltagabbana

- **T0851** · descrizione della fazione (Legenda) · `src/data/libretto.js:74`
  TESTO: Il personaggio potrà cambiare fazione da abitante del villaggio a membro del branco durante la partita.

- **T0852** · paragrafo (dopo l'elenco) · `src/data/libretto.js:76`
  TESTO: Ciascun ruolo può inoltre avere le seguenti caratteristiche:

- **T0853** · descrizione della caratteristica (Legenda) · `src/data/libretto.js:78`
  TESTO: Questo ruolo ha il potere di uccidere

- **T0854** · descrizione della caratteristica (Legenda) · `src/data/libretto.js:79`
  TESTO: Questo ruolo ha poteri non mortali

- **T0855** · descrizione della caratteristica (Legenda) · `src/data/libretto.js:80`
  TESTO: Questo ruolo ha poteri passivi

- **T0856** · descrizione della caratteristica (Legenda) · `src/data/libretto.js:81`
  TESTO: Questo ruolo si sveglia solo la prima notte

- **T0857** · descrizione della caratteristica (Legenda) · `src/data/libretto.js:82`
  TESTO: Questo ruolo si sveglia tutte le notti

- **T0858** · descrizione della caratteristica (Legenda) · `src/data/libretto.js:83`
  TESTO: Questo ruolo potrebbe essere rivelato nel corso della partita

- **T0859** · descrizione della caratteristica (Legenda) · `src/data/libretto.js:84`
  TESTO: Questo ruolo richiede che il narratore possa toccare un giocatore o prendere una carta

### Regolamento — Ruoli

- **T0860** · titolo di sezione · `src/data/libretto.js:88`
  TESTO: Ruoli

- **T0861** · paragrafo · `src/data/libretto.js:90`
  TESTO: Di seguito sono indicati tutti i ruoli disponibili in ordine alfabetico.

### Regolamento — Aura

- **T0862** · titolo di sezione · `src/data/libretto.js:93`
  TESTO: Aura

- **T0863** · paragrafo · `src/data/libretto.js:94`
  TESTO: Alcuni ruoli (*Veggente, Veggente Mannaro, **Inquisitore*) hanno la possibilità di **indagare** l'animo nascosto di un altro giocatore. Quando di notte indicheranno una persona, il narratore farà "sì" con la testa se il ruolo è malvagio, "no" in ogni altro caso (aura **benevola**). I ruoli che hanno aura **malvagia** sono i seguenti:

- **T0864** · voce di elenco · `src/data/libretto.js:96`
  TESTO: Lupo Mannaro

- **T0865** · voce di elenco · `src/data/libretto.js:97`
  TESTO: Cucciolo di Lupo Mannaro

- **T0866** · voce di elenco · `src/data/libretto.js:98`
  TESTO: Lupo Mannaro Capobranco

- **T0867** · voce di elenco · `src/data/libretto.js:99`
  TESTO: Lupo Mannaro Progenitore

- **T0868** · voce di elenco · `src/data/libretto.js:100`
  TESTO: Chupacabra

- **T0869** · voce di elenco · `src/data/libretto.js:101`
  TESTO: Eremita

### Regolamento — Condizioni

- **T0870** · titolo di sezione · `src/data/libretto.js:105`
  TESTO: Condizioni

- **T0871** · paragrafo · `src/data/libretto.js:107`
  TESTO: Queste condizioni vengono assegnate ad un giocatore attraverso l'azione speciale di un secondo giocatore.

### Regolamento — Narrare una partita

- **T0872** · titolo di sezione · `src/data/libretto.js:110`
  TESTO: Narrare una partita

- **T0873** · paragrafo · `src/data/libretto.js:115`
  TESTO: Spesso le cose da tenere in considerazione durante una partita sono **tante**, soprattutto se si utilizzano molti ruoli. Può quindi essere utile avere sottomano **carta e penna**, in modo da segnare i ruoli di ogni giocatore, le vittime dei lupi e le altre condizioni particolari che i personaggi possono ricevere nel gioco.⏎Non temere, in caso di dubbi ricorda che la prima regola di Meltable Wolves è:⏎"**Il narratore ha sempre ragione**"!

- **T0874** · paragrafo · `src/data/libretto.js:118`
  TESTO: Dopo aver distribuito le carte personaggio, fai calare la notte ("*Tutti dormono, si sveglia...*").⏎**La prima notte** chiama i ruoli in quest'ordine:

- **T0875** · voce di elenco · `src/data/libretto.js:125`
  TESTO: Fai agire *Mimo* e poi il *Ladro*

- **T0876** · voce di elenco · `src/data/libretto.js:126`
  TESTO: Annota i ruoli con **potere passivo**: *Berserker, L.M. Capobranco, Criceto M., Cucciolo di L.M., Eremita, Mezzosangue, Nano, Nonna, Pastore, Polpo M., Ubriaco*

- **T0877** · voce di elenco · `src/data/libretto.js:127`
  TESTO: Memorizza i **gesti segreti** del *Bardo* e del *Gallo M.*

- **T0878** · voce di elenco · `src/data/libretto.js:128`
  TESTO: Fai agire chi **sceglie** altri personaggi: *Apprendista, Cavaliere, Figlia dei L., Sacerdote*

- **T0879** · voce di elenco · `src/data/libretto.js:129`
  TESTO: Infine chiama chi **individua** altri personaggi: *Guardie, Guardia M., Innamorati, Mucca M.*

- **T0880** · paragrafo · `src/data/libretto.js:135`
  TESTO: Prosegui svegliando i **ruoli dai poteri non mortali**, che agiscono **ogni notte**:

- **T0881** · voce di elenco · `src/data/libretto.js:138`
  TESTO: Per prima, se presente, la *Fattucchiera*

- **T0882** · voce di elenco · `src/data/libretto.js:139`
  TESTO: I ruoli che **scelgono** un giocatore: *Addolorata, Cortigiana, Maga, Paladino, Pifferaio, Untore*

- **T0883** · voce di elenco · `src/data/libretto.js:140`
  TESTO: Quelli che effettuano un'**indagine**: *Cartomante, Inquisitore, Medium, Veggente, Veggente Mannaro*

- **T0884** · voce di elenco · `src/data/libretto.js:141`
  TESTO: Infine quelli che possono **resuscitare** un giocatore: *Guaritore, Sciacallo Mannaro*

- **T0885** · paragrafo · `src/data/libretto.js:147`
  TESTO: Alla fine chiama i ruoli dai **poteri mortali**. Questi ruoli vanno chiamati **dopo** tutti gli altri, così da sapere già se qualche altro potere, come quello del *Paladino* o della *Cortigiana*, interferisce con l'uccisione:

- **T0886** · voce di elenco · `src/data/libretto.js:150`
  TESTO: La *Strega*

- **T0887** · voce di elenco · `src/data/libretto.js:151`
  TESTO: Il Branco dei Lupi: *Cucciolo di L.M., Lupo Mannaro, L.M. Capobranco, L.M. Progenitore* e *Nonna*

- **T0888** · voce di elenco · `src/data/libretto.js:152`
  TESTO: Il *Chupacabra*

- **T0889** · voce di elenco · `src/data/libretto.js:153`
  TESTO: Per ultimi, i giocatori **ipnotizzati** dal *Pifferaio*

- **T0890** · paragrafo (dopo l'elenco) · `src/data/libretto.js:158`
  TESTO: Ricorda di lasciare sempre un momento di **silenzio** per i personaggi morti, fingendo di chiamarli per non rivelare la loro assenza

- **T0891** · paragrafo (dopo l'elenco) · `src/data/libretto.js:159`
  TESTO: **Al mattino** devi annunciare al villaggio se durante la notte ci sono state uccisioni o altri fatti particolari (giocatori che sono stati resuscitati, unti, trasformati in maiali…). Puoi **esordire** con "*È giorno nel villaggio. Tutti si **svegliano, tranne…*", oppure "*È iniziato un nuovo **triste giorno nel villaggio! Gli abitanti si ritrovano **e notano subito l’assenza di…*". Questo è anche il momento in cui controllare ed annunciare se qualche fazione ha **vinto la partita**.⏎Se il *Gallo M.* ti mostra il suo gesto, fai calare nuovamente la notte; se è presente il *Pastore* e almeno uno dei giocatori vivi al suo fianco è un *Lupo*, fai sentire il belato delle pecore; se l'*Ambasciatore* è vivo ed il *Veggente* ha indagato un cittadino benevolo, annuncialo; se il precedente *Borgomastro* è morto, di' al villaggio di eleggerne uno nuovo.

- **T0892** · paragrafo (dopo l'elenco) · `src/data/libretto.js:161`
  TESTO: Lascia poi che il villaggio discuta i propri sospetti; quando ha terminato, annuncia la fase di **votazione**, dichiarando da quale giocatore inizia ("dalla destra del morto"). Quando tutti i giocatori hanno votato, se c'è una maggioranza netta, dichiara che il cittadino sarà mandato al **rogo**.

- **T0893** · paragrafo (dopo l'elenco) · `src/data/libretto.js:162`
  TESTO: In caso di **pareggio**, invita i giocatori che hanno ricevuto più voti a formulare un'arringa difensiva dando a ciascuno lo stesso tempo massimo; successivamente tutti i giocatori, anche i morti, votano per alzata di mano. In caso di **ulteriore ****pareggio** la vittima sarà decisa dal *Borgomastro *o sorteggiata dal narratore.⏎Nel frattempo, se si verificano le condizioni necessarie, conferma la **morte sul colpo** di eventuali personaggi (es. esecuzione del *Boia*, *Scemo del Villaggio*, Unto dall'*Untore*).

- **T0894** · paragrafo (dopo l'elenco) · `src/data/libretto.js:164`
  TESTO: Comunica infine la **morte sul rogo** della persona scelta dal villaggio (e dell'eventuale controparte innamorata). Solo se necessario, rivelane il ruolo e applicane l'effetto (es. *Alchimista, Antico, **Spilungone*). Il sole sta tramontando: se il *Bardo* ti mostra il suo gesto segreto, prosegui con un'altra giornata; in caso contrario, annuncia il calare della notte.

### Regolamento — Riconoscimenti

- **T0895** · titolo di sezione · `src/data/libretto.js:168`
  TESTO: Riconoscimenti

- **T0896** · paragrafo · `src/data/libretto.js:170`
  TESTO: Meltable Wolves™ è un gioco creato in occasione del 50° anno dalla fondazione del gruppo scout Cornedo 1, associazione a cui dobbiamo molte cose, tra cui l’averci fatto conoscere e la realizzazione di questo piccolo sogno. Il nome si deve al Noviziato omonimo dell’anno 2018/2019, il quale per primo ha ideato numerosi ruoli e la prima versione delle grafiche presenti in questo gioco. L’idea nasce dalla volontà di far conoscere uno dei giochi più amati dal nostro gruppo anche a chi non ci ha mai giocato, nonché introdurre nuovi ruoli e nuove varianti per chi il gioco già lo conosce ed ama.

- **T0897** · paragrafo · `src/data/libretto.js:171`
  TESTO: Ci auguriamo che Meltable Wolves vi diverta almeno quanto ha divertito noi realizzarlo!

### Mazzo — sfogliatore carte (ruolo con più copie)

- **T0898** · etichetta carta con copie · `src/data/mazzoCompleto.js:19`
  TESTO: ${ruolo.nome} (${i + 1}/${copie})

### Mazzo — sfogliatore carte

- **T0899** · etichetta carta di riferimento · `src/data/mazzoCompleto.js:24`
  TESTO: Narratore

- **T0900** · etichetta carta di riferimento · `src/data/mazzoCompleto.js:25`
  TESTO: Cala la notte

- **T0901** · etichetta carta di riferimento · `src/data/mazzoCompleto.js:26`
  TESTO: Si leva il giorno

- **T0902** · etichetta carta di riferimento · `src/data/mazzoCompleto.js:27`
  TESTO: La prima partita

- **T0903** · etichetta carta di riferimento · `src/data/mazzoCompleto.js:28`
  TESTO: Retro carta

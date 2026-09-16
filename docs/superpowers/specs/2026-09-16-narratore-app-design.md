# App narratore per Meltable Wolves — design

Data: 2026-09-16
Fonte regole: `Impaginazione libretto bozza 2.pdf` (regolamento ufficiale, 32 pagine)

## Contesto e obiettivo

Meltable Wolves è un gioco da tavolo fisico stile lupus/mafia (carte reali, ~50
ruoli speciali). Il narratore gestisce a mente: composizione del mazzo,
assegnazione ruoli, ordine di chiamata notturna (dipendente da quali ruoli
sono in gioco), stato vivo/morto e condizioni multiple per giocatore (es.
innamorato, protetto, ipnotizzato, unto), fase di voto diurna.

Obiettivo: un'app web che affianchi il narratore durante la partita fisica
(le carte restano reali, l'app non le sostituisce), riducendo il carico
mnemonico sulle parti più complesse: ordine di chiamata notturna e stato dei
giocatori.

## Vincoli

- Uso da un solo utente (il narratore), su mobile in primis. Nessuno schermo
  condiviso con i giocatori.
- Nessuna persistenza multi-sessione richiesta: basta reggere una partita in
  corso (con `localStorage` solo per sopravvivere a un refresh accidentale).
- Deve restare gratuita: nessun backend, nessun account, nessun database.
  Hosting statico gratuito (GitHub Pages / Cloudflare Pages / Netlify).
- Asset grafici ufficiali non disponibili ora (sono su un altro PC): si parte
  con placeholder, con un punto di sostituzione chiaro per non dover toccare
  codice quando arriveranno gli asset veri.

## Architettura

SPA client-side pura, Vite + React (o Svelte — scelta equivalente,
irrilevante ai fini del design). Nessun backend: tutto lo stato di partita
vive in memoria + `localStorage`. Build statica deployabile su qualunque
hosting gratuito.

Perché un framework e non solo HTML/JS: la app ha più viste collegate allo
stesso stato condiviso (giocatori, mazzo, notte in corso) con parecchi stati
per giocatore (vivo/morto + N condizioni). Gestirlo a mano con DOM vanilla
significherebbe reimplementare a mano il rendering reattivo che un framework
leggero dà gratis — non è complessità aggiunta, è la scelta più semplice che
regge il carico reale.

## Asset placeholder

Convenzione: `assets/roles/<slug-ruolo>.png`. Per ora si usano icone generiche
per fazione (lupo / villico / indipendente / voltagabbana) al posto delle
illustrazioni ufficiali. Quando arriveranno gli asset veri, si sostituiscono
i file in quella cartella senza toccare il codice.

## Modello dati

```
Ruolo:     { slug, nome, fazione, poteriIcone[], notturno: bool, testoRegole }
Giocatore: { id, nome, ruoloSlug, vivo: bool, condizioni: string[], note: string }
Mazzo:     { numGiocatori, ruoliSelezionati: slug[] }
Partita:   { mazzo, giocatori[], round, log[] }
```

## Macro-aree funzionali

1. **Catalogo ruoli** — dati strutturati dei ~50 ruoli (nome, fazione, icone
   poteri, testo regole) trascritti dal libretto. Base dati per tutto il
   resto.
2. **Creazione mazzo** — scelta numero giocatori + selezione ruoli, con
   validazione/suggerimenti secondo i consigli di bilanciamento del
   regolamento (1 lupo ogni 5 giocatori, non troppi ruoli notturni, non
   troppe fazioni indipendenti, ecc.).
3. **Tracker giocatori** *(primo MVP)* — lista giocatori come card mobile,
   toggle vivo/morto, condizioni attive, campo note libere.
4. **Sequencer fase notte** — dato il mazzo in gioco, propone solo i ruoli
   effettivamente presenti nell'ordine corretto di chiamata e applica gli
   effetti (morti, condizioni) al tracker.
5. **Fase giorno/votazione** — accuse, voto, gestione pareggio/arringa,
   applicazione morte per rogo e condizioni collegate (morto sul colpo,
   innamorato che segue in tomba, ecc.).
6. **Log partita** — cronologia round-by-round derivata dalle azioni già
   registrate nei passi precedenti (sola visualizzazione, nessun input
   nuovo).

## Roadmap

Ordine di sviluppo: 1 → 2 → 3 → 4 → 5 → 6, con il tracker (3) costruito
subito dopo il catalogo ruoli minimo necessario per popolarlo, così da avere
valore d'uso il prima possibile.

1. Scaffold progetto (Vite + React, deploy statico gratuito, primo commit).
2. Catalogo ruoli (dati + icone placeholder per fazione).
3. Tracker giocatori (MVP: lista, stato vivo/morto, condizioni, note).
4. Creazione mazzo (form + validazione bilanciamento).
5. Sequencer notte, diviso in tre sotto-passi per complessità:
   - **5a — Motore sequencer**: ordine di chiamata per notte (filtrato su
     mazzo + notte corrente + vivo/morto), avanzamento passo-passo, skip,
     passi informativi. Nessuna azione bersaglio-selezionabile.
   - **5b — Effetti automatici (prima fetta)**: selezione bersaglio +
     applicazione automatica per i ruoli con logica semplice: Paladino,
     Strega (2 pozioni), Branco dei Lupi, Chupacabra, Untore, Fattucchiera,
     Pifferaio, Maga, Sacerdote, Guaritore/Sciacallo Mannaro.
   - **5c — Ruoli con legami persistenti** (fatto): Apprendista, Cavaliere,
     Figlia dei Lupi (legano a un bersaglio la prima notte; la conseguenza si
     risolve quando il narratore passa alla notte successiva) e Cortigiana
     (visita un cliente ogni notte, con conseguenze legate alla sua sorte).
     Guardie/Guardia Mannara/Mucca Mannara non hanno richiesto lavoro
     aggiuntivo: si riconoscono a vicenda senza bersaglio, già coperti dal
     passo informativo del piano 5a. Addolorata resta fuori scope: il suo
     potere dipende da chi è stato mandato al rogo, dato che esisterà solo
     con la fase giorno/voto (passo 6).
6. Fase giorno/voto (fatto): conteggio voti con un pulsante +1/-1 per ogni
   giocatore vivo, rilevazione automatica di vittima singola o spareggio,
   timer a conto alla rovescia configurabile per l'arringa (la risoluzione
   dello spareggio resta a voce), dichiarazione di morte sul rogo, e
   dichiarazione di morte sul colpo (Boia, Untore, Scemo del Villaggio)
   sempre disponibile e indipendente dalla votazione. Addolorata potrebbe
   ora essere riconsiderata, dato che questo passo introduce la morte sul
   rogo — ma non è stata implementata in questo passo.
7. Log partita (vista cronologia, nessun nuovo input).

Ogni fase produce uno strumento già utilizzabile da solo, indipendentemente
dalle fasi successive.

## Fuori scope (per ora)

- Multi-dispositivo / schermo condiviso con i giocatori.
- Salvataggio/ripresa partite tra sessioni diverse o storico partite passate.
- Backend, account utente, sincronizzazione cloud.
- Asset grafici ufficiali (placeholder fino a nuovo avviso).

// Testo integrale del libretto originale (asset_svg/Impaginazione libretto_v2.svg),
// trascritto verbatim dagli elementi <text> del documento sorgente, formattazione
// grassetto/corsivo inclusa (sintassi **grassetto**/*corsivo*, vedi TestoFormattato).
// I ruoli (sezione RUOLI) e le condizioni (sezione CONDIZIONI) non sono duplicati
// qui: la pagina Libretto li legge direttamente da roles.js/conditions.js, unica
// fonte di verità già usata dal resto dell'app.
export const SEZIONI = [
  {
    titolo: 'Contenuto',
    paragrafi: [`Questo gioco contiene:`],
    lista: [
      {
        testo: `78 carte, di cui:`,
        sotto: [`15 Villici`, `5 Lupi Mannari`, `51 ruoli speciali`, `3 carte Riassunto`, `4 carte personalizzabili`],
      },
      `Questo libretto`,
    ],
  },
  {
    titolo: 'Introduzione',
    paragrafi: [`*Fino a poco tempo fa, l'unica preoccupazione a Redcoon era sopportare i pettegolezzi della Suocera o le rime strampalate dello Scemo del Villaggio. Ora, però, i Lupi Mannari sono tra noi. Alla luce del sole ci si guarda con sospetto, tutti pronti a puntare il dito l'uno contro l'altro; ma di notte il sangue scorre tra maledizioni e oscure vendette. Prepara la tua arringa difensiva e non fidarti di nessuno: qui l'alba non è mai garantita, e il tuo vicino ha stranamente troppi peli sulle braccia...*`],
  },
  {
    titolo: 'Obiettivi',
    paragrafi: [`Nel gioco ci sono due fazioni: quella dei **Lupi** e quella dei **Villici**. Lo scopo dei Lupi è di **eliminare** tutti i Villici. Viceversa quello dei Villici è di **bruciare sul rogo** tutti i Lupi.
All'inizio del gioco scegliete chi farà il **Narratore**, che non appartiene a nessuna fazione e gestisce solo la partita. Distribuite una carta coperta ad ogni altro giocatore (sarà il suo ruolo). I giocatori guardano segretamente la propria carta e la tengono coperta fino alla fine del gioco.`],
  },
  {
    titolo: "È notte nel villaggio...",
    personaggio: 'lupo-mannaro',
    paragrafi: [`Durante il gioco si alternano due fasi: la **notte** e il **giorno**.`, `Di notte** **tutti (anche i morti!) **chiudono ****gli occhi** e il **narratore** chiama i singoli ruoli con abilità particolari, che si **svegliano** per svolgere le loro **azioni**; per ultimi si svegliano i *Lupi Mannari*, che **sbranano** un giocatore. Tutti i ruoli che agiscono di notte devono essere chiamati: se il personaggio è **morto** non potrà agire ma il narratore lascerà comunque un **momento di silenzio** per non far capire che quel personaggio non è più in gioco.`, `**Di giorno** il narratore annuncia gli avvenimenti della notte (se e quali giocatori sono morti o sono stati colpiti dai poteri di altri ruoli), poi tutti gli abitanti del villaggio **discutono** **e condannano** al rogo una persona, sperando che sia un lupo mannaro.
Si inizia a votare dalla destra del morto (o, in assenza di morti, dalla destra del narratore) e si continua il giro in **senso antiorario**. La persona con più voti **muore sul rogo**.
In caso di **parità**, i due (o più) candidati al rogo hanno diritto a un'**arringa difensiva**, nella quale, in un tempo limitato e uguale per tutti, devono cercare di **convincere** i compaesani della loro innocenza; al termine delle arringhe il villaggio vota **per alzata di mano** chi tra i candidati mandare al rogo. Durante questo spareggio, in via del tutto eccezionale, **anche i morti possono votare**. Dopo il rogo, il narratore annuncia l'inizio di una **nuova ****notte**, e così via, fino a che una delle fazioni riesce a vincere. La vittoria è di **tutta la fazione** vincente (Lupi o Villici), inclusi i morti.`],
    sottosezioni: [
      {
        titolo: 'I giocatori morti',
        lista: [
      `Non possono più **parlare** o fare gesti espliciti per accusare altri personaggi`,
      `Non possono più **utilizzare i loro poteri** (a meno che non sia specificato nelle loro abilità)`,
      `Continuano a **chiudere gli occhi** di notte`,
      `Possono **votare**, ma solo per alzata di mano nel caso di uno spareggio tra due giocatori`,
    ],
      },
      {
        titolo: null,
        paragrafi: [`Nel corso del gioco **non** si può **rivelare** la propria carta, nemmeno quando si muore; sarebbe bene anche evitare di dire il proprio ruolo (es. "io sono il Veggente"), soprattutto se tutti o quasi tutti i giocatori hanno un ruolo speciale, per evitare che il gioco diventi una "**caccia al personaggio**" per capire i ruoli di tutti, nella quale si rischia di **svantaggiare** eccessivamente i Lupi.`],
      },
    ],
  },
  {
    titolo: 'Comporre il mazzo',
    paragrafi: [`Per distinguere i personaggi morti da quelli vivi si utilizza la **posizione della carta**: se viene tenuta con il lato corto rivolto verso il giocatore significa che il personaggio è vivo. Quando un giocatore muore, invece, **ruota** la carta di 90 gradi.`, `Un narratore esperto deve saper **combinare** tra loro i vari ruoli speciali per avere una partita **bilanciata** e **divertente**. Ecco alcuni consigli:`],
    lista: [
      `Per prima cosa inserite un *Lupo Mannaro* ogni cinque giocatori. Scegliete poi i ruoli speciali stando attenti a:`,
      `**Bilanciare** i ruoli a favore dei villici con ruoli a favore dei lupi.`,
      `Non introdurre troppe **fazioni indipendenti**`,
      `Non inserire troppi ruoli che **agiscono di ****notte**, per non allungare eccessivamente i tempi notturni`,
      `Utilizzare con parsimonia i **ruoli che uccidono** altri giocatori (in aggiunta ai lupi)`,
      `Utilizzare con parsimonia i **ruoli che rivelano**** ****sè stessi** alla morte o dopo un'azione`,
      `Evitare di inserire nello stesso mazzo **ruoli ****molto simili **tra loro`,
    ],
  },
  {
    titolo: 'Legenda',
    paragrafi: [`Ogni ruolo fa parte di una determinata fazione:`],
    fazioni: [
      { slug: 'villaggio', nome: `Abitante del villaggio`, descrizione: `vince se non ci sono più lupi mannari in vita` },
      { slug: 'lupi', nome: `Alleato del Branco`, descrizione: `vince quando il numero dei lupi mannari è pari o superiore a quello degli altri abitanti del villaggio` },
      { slug: 'indipendente', nome: `Indipendente`, descrizione: `ciascuno di questi ruoli vince da solo secondo le proprie condizioni di vittoria specifiche` },
      { slug: 'sconosciuto', nome: `Sconosciuto`, descrizione: `Il personaggio saprà a che fazione appartiene solo dopo l'inizio della partita` },
      { slug: 'voltagabbana', nome: `Voltagabbana`, descrizione: `Il personaggio potrà cambiare fazione da abitante del villaggio a membro del branco durante la partita.` },
    ],
    paragrafiDopo: [`Ciascun ruolo può inoltre avere le seguenti caratteristiche:`],
    caratteristiche: [
      { icona: 'icona_poteri_mortali', testo: `Questo ruolo ha il potere di uccidere` },
      { icona: 'icona_poteri_non_mortali', testo: `Questo ruolo ha poteri non mortali` },
      { icona: 'icona_potere_passivo', testo: `Questo ruolo ha poteri passivi` },
      { icona: 'icona_sveglio_solo_prima_notte', testo: `Questo ruolo si sveglia solo la prima notte` },
      { icona: 'icona_azione_tutte_le_notti', testo: `Questo ruolo si sveglia tutte le notti` },
      { icona: 'icona_rivelare_carta', testo: `Questo ruolo potrebbe essere rivelato nel corso della partita` },
      { icona: 'icona_necessario_toccare_giocatore', testo: `Questo ruolo richiede che il narratore possa toccare un giocatore o prendere una carta` },
    ],
  },
  {
    titolo: 'Ruoli',
    speciale: 'ruoli',
    paragrafi: [`Di seguito sono indicati tutti i ruoli disponibili in ordine alfabetico.`],
  },
  {
    titolo: 'Aura',
    paragrafi: [`Alcuni ruoli (*Veggente, Veggente Mannaro, **Inquisitore*) hanno la possibilità di **indagare** l'animo nascosto di un altro giocatore. Quando di notte indicheranno una persona, il narratore farà "sì" con la testa se il ruolo è malvagio, "no" in ogni altro caso (aura **benevola**). I ruoli che hanno aura **malvagia** sono i seguenti:`],
    lista: [
      `Lupo Mannaro`,
      `Cucciolo di Lupo Mannaro`,
      `Lupo Mannaro Capobranco`,
      `Lupo Mannaro Progenitore`,
      `Chupacabra`,
      `Eremita`,
    ],
  },
  {
    titolo: 'Condizioni',
    speciale: 'condizioni',
    paragrafi: [`Queste condizioni vengono assegnate ad un giocatore attraverso l'azione speciale di un secondo giocatore.`],
  },
  {
    titolo: 'Narrare una partita',
    personaggio: 'boia',
    paragrafi: [
      `Spesso le cose da tenere in considerazione durante una partita sono **tante**, soprattutto se si utilizzano molti ruoli. Può quindi essere utile avere sottomano **carta e penna**, in modo da segnare i ruoli di ogni giocatore, le vittime dei lupi e le altre condizioni particolari che i personaggi possono ricevere nel gioco.
Non temere, in caso di dubbi ricorda che la prima regola di Meltable Wolves è:
"**Il narratore ha sempre ragione**"!`,
      `Dopo aver distribuito le carte personaggio, fai calare la notte ("*Tutti dormono, si sveglia...*").
**La prima notte** chiama i ruoli in quest'ordine:`,
    ],
    sottosezioni: [
      {
        titolo: null,
        lista: [
          `Fai agire *Mimo* e poi il *Ladro*`,
          `Annota i ruoli con **potere passivo**: *Berserker, L.M. Capobranco, Criceto M., Cucciolo di L.M., Eremita, Mezzosangue, Nano, Nonna, Pastore, Polpo M., Ubriaco*`,
          `Memorizza i **gesti segreti** del *Bardo* e del *Gallo M.*`,
          `Fai agire chi **sceglie** altri personaggi: *Apprendista, Cavaliere, Figlia dei L., Sacerdote*`,
          `Infine chiama chi **individua** altri personaggi: *Guardie, Guardia M., Innamorati, Mucca M.*`,
        ],
      },
      {
        titolo: null,
        paragrafi: [
          `Prosegui svegliando i **ruoli dai poteri non mortali**, che agiscono **ogni notte**:`,
        ],
        lista: [
          `Per prima, se presente, la *Fattucchiera*`,
          `I ruoli che **scelgono** un giocatore: *Addolorata, Cortigiana, Maga, Paladino, Pifferaio, Untore*`,
          `Quelli che effettuano un'**indagine**: *Cartomante, Inquisitore, Medium, Veggente, Veggente Mannaro*`,
          `Infine quelli che possono **resuscitare** un giocatore: *Guaritore, Sciacallo Mannaro*`,
        ],
      },
      {
        titolo: null,
        paragrafi: [
          `Alla fine chiama i ruoli dai **poteri mortali**. Questi ruoli vanno chiamati **dopo** tutti gli altri, così da sapere già se qualche altro potere, come quello del *Paladino* o della *Cortigiana*, interferisce con l'uccisione:`,
        ],
        lista: [
          `La *Strega*`,
          `Il Branco dei Lupi: *Cucciolo di L.M., Lupo Mannaro, L.M. Capobranco, L.M. Progenitore* e *Nonna*`,
          `Il *Chupacabra*`,
          `Per ultimi, i giocatori **ipnotizzati** dal *Pifferaio*`,
        ],
      },
    ],
    paragrafiDopo: [
      `Ricorda di lasciare sempre un momento di **silenzio** per i personaggi morti, fingendo di chiamarli per non rivelare la loro assenza`,
      `**Al mattino** devi annunciare al villaggio se durante la notte ci sono state uccisioni o altri fatti particolari (giocatori che sono stati resuscitati, unti, trasformati in maiali…). Puoi **esordire** con "*È giorno nel villaggio. Tutti si **svegliano, tranne…*", oppure "*È iniziato un nuovo **triste giorno nel villaggio! Gli abitanti si ritrovano **e notano subito l’assenza di…*". Questo è anche il momento in cui controllare ed annunciare se qualche fazione ha **vinto la partita**.
Se il *Gallo M.* ti mostra il suo gesto, fai calare nuovamente la notte; se è presente il *Pastore* e almeno uno dei giocatori vivi al suo fianco è un *Lupo*, fai sentire il belato delle pecore; se l'*Ambasciatore* è vivo ed il *Veggente* ha indagato un cittadino benevolo, annuncialo; se il precedente *Borgomastro* è morto, di' al villaggio di eleggerne uno nuovo.`,
      `Lascia poi che il villaggio discuta i propri sospetti; quando ha terminato, annuncia la fase di **votazione**, dichiarando da quale giocatore inizia ("dalla destra del morto"). Quando tutti i giocatori hanno votato, se c'è una maggioranza netta, dichiara che il cittadino sarà mandato al **rogo**.`,
      `In caso di **pareggio**, invita i giocatori che hanno ricevuto più voti a formulare un'arringa difensiva dando a ciascuno lo stesso tempo massimo; successivamente tutti i giocatori, anche i morti, votano per alzata di mano. In caso di **ulteriore ****pareggio** la vittima sarà decisa dal *Borgomastro *o sorteggiata dal narratore.
Nel frattempo, se si verificano le condizioni necessarie, conferma la **morte sul colpo** di eventuali personaggi (es. esecuzione del *Boia*, *Scemo del Villaggio*, Unto dall'*Untore*).`,
      `Comunica infine la **morte sul rogo** della persona scelta dal villaggio (e dell'eventuale controparte innamorata). Solo se necessario, rivelane il ruolo e applicane l'effetto (es. *Alchimista, Antico, **Spilungone*). Il sole sta tramontando: se il *Bardo* ti mostra il suo gesto segreto, prosegui con un'altra giornata; in caso contrario, annuncia il calare della notte.`,
    ],
  },
  {
    titolo: 'Riconoscimenti',
    paragrafi: [
      `Meltable Wolves™ è un gioco creato in occasione del 50° anno dalla fondazione del gruppo scout Cornedo 1, associazione a cui dobbiamo molte cose, tra cui l’averci fatto conoscere e la realizzazione di questo piccolo sogno. Il nome si deve al Noviziato omonimo dell’anno 2018/2019, il quale per primo ha ideato numerosi ruoli e la prima versione delle grafiche presenti in questo gioco. L’idea nasce dalla volontà di far conoscere uno dei giochi più amati dal nostro gruppo anche a chi non ci ha mai giocato, nonché introdurre nuovi ruoli e nuove varianti per chi il gioco già lo conosce ed ama.`,
      `Ci auguriamo che Meltable Wolves vi diverta almeno quanto ha divertito noi realizzarlo!`,
    ],
  },
]

import { ruoliAssegnabili } from './assegnazione'
import { ROLES } from './roles'

export const RUOLI_BRANCO_LUPI = [
  'cucciolo-di-lupo-mannaro', 'lupo-mannaro', 'lupo-mannaro-capobranco',
  'lupo-mannaro-progenitore', 'nonna',
]

// Il Villico non ha alcuna azione o caratteristica da tracciare (pag. 5): non
// ha senso chiedere al narratore di individuarlo carta per carta come gli
// altri ruoli "senza step dedicato" (Ambasciatore, Berserker...). Resta
// nell'elenco assegnabile (così il passo "assegna i ruoli rimanenti" esiste
// ancora finché ci sono Villici da piazzare) ma va escluso dalla selezione
// manuale: chi resta senza ruolo a fine passo diventa Villico in automatico
// (vedi NightSequencer).
export const RUOLI_NON_ASSEGNABILI_MANUALMENTE = ['villico']

const STEPS_CON_RUOLO_DEDICATO = [
  // --- Solo prima notte, nell'ordine del regolamento (pag. 27) ---
  { id: 'mimo', titolo: 'Mimo', tipo: 'azione', primaNotteSolo: true, ruoli: ['mimo'] },
  { id: 'ladro', titolo: 'Ladro', tipo: 'azione', primaNotteSolo: true, ruoli: ['ladro'] },
  // Cucciolo, Capobranco, Progenitore e Nonna vanno identificati
  // singolarmente qui, insieme agli altri poteri passivi (pag. 27): così
  // quando più avanti il branco si riconosce collettivamente sono già tutti
  // assegnati e non ricompaiono tra le carte da smistare (niente più
  // selettore "che ruolo mostra la carta?" per la Nonna in mezzo ai Lupi
  // generici), e resta da assegnare solo il Lupo Mannaro "generico".
  { id: 'cucciolo-di-lupo-mannaro', titolo: 'Cucciolo di Lupo Mannaro', tipo: 'informativo', primaNotteSolo: true, ruoli: ['cucciolo-di-lupo-mannaro'] },
  { id: 'lupo-mannaro-capobranco', titolo: 'Lupo Mannaro Capobranco', tipo: 'informativo', primaNotteSolo: true, ruoli: ['lupo-mannaro-capobranco'] },
  { id: 'lupo-mannaro-progenitore', titolo: 'Lupo Mannaro Progenitore', tipo: 'informativo', primaNotteSolo: true, ruoli: ['lupo-mannaro-progenitore'] },
  { id: 'nonna', titolo: 'Nonna', tipo: 'informativo', primaNotteSolo: true, ruoli: ['nonna'] },
  { id: 'criceto-malvagio', titolo: 'Criceto Malvagio', tipo: 'informativo', primaNotteSolo: true, ruoli: ['criceto-malvagio'] },
  { id: 'eremita', titolo: 'Eremita', tipo: 'informativo', primaNotteSolo: true, ruoli: ['eremita'] },
  { id: 'nano', titolo: 'Nano', tipo: 'informativo', primaNotteSolo: true, ruoli: ['nano'] },
  { id: 'pastore', titolo: 'Pastore', tipo: 'informativo', primaNotteSolo: true, ruoli: ['pastore'] },
  { id: 'polpo-mannaro', titolo: 'Polpo Mannaro', tipo: 'informativo', primaNotteSolo: true, ruoli: ['polpo-mannaro'] },
  { id: 'ubriaco', titolo: 'Ubriaco', tipo: 'informativo', primaNotteSolo: true, ruoli: ['ubriaco'] },
  { id: 'ambasciatore', titolo: 'Ambasciatore', tipo: 'informativo', primaNotteSolo: true, ruoli: ['ambasciatore'] },
  { id: 'berserker', titolo: 'Berserker', tipo: 'informativo', primaNotteSolo: true, ruoli: ['berserker'] },
  // altrimenti finisce nel generico "Assegna i ruoli rimanenti" insieme al
  // Villico, con un titolo che non lo nomina nemmeno: come gli altri ruoli
  // passivi qui sopra merita un passo tutto suo, anche se non fa nulla
  { id: 'mezzosangue', titolo: 'Mezzosangue', tipo: 'informativo', primaNotteSolo: true, ruoli: ['mezzosangue'] },
  {
    id: 'identifica-branco',
    titolo: 'Il branco si riconosce',
    tipo: 'informativo',
    primaNotteSolo: true,
    ruoli: RUOLI_BRANCO_LUPI,
  },
  { id: 'bardo', titolo: 'Bardo (gesto segreto)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['bardo'] },
  { id: 'gallo-mannaro', titolo: 'Gallo Mannaro (gesto segreto)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['gallo-mannaro'] },
  { id: 'apprendista', titolo: 'Apprendista', tipo: 'azione', primaNotteSolo: true, ruoli: ['apprendista'] },
  { id: 'cavaliere', titolo: 'Cavaliere', tipo: 'azione', primaNotteSolo: true, ruoli: ['cavaliere'] },
  { id: 'figlia-dei-lupi', titolo: 'Figlia dei Lupi', tipo: 'azione', primaNotteSolo: true, ruoli: ['figlia-dei-lupi'] },
  { id: 'sacerdote', titolo: 'Sacerdote', tipo: 'azione', primaNotteSolo: true, ruoli: ['sacerdote'] },
  // subito dopo chi li crea (il Sacerdote), non dopo le Guardie
  { id: 'innamorati', titolo: 'Innamorati si riconoscono', tipo: 'informativo', primaNotteSolo: true, condizione: 'innamorato' },
  // se nel mazzo c'è anche la Guardia Mannara, la sua carta è indistinguibile
  // dalle altre (pag. 8): il passo qui sotto le riconosce già tutte insieme,
  // quindi questo va saltato per non avere due schede separate per lo stesso
  // riconoscimento (vedi escludiSeSelezionato)
  { id: 'guardia', titolo: 'Guardie (si riconoscono)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia'], escludiSeSelezionato: ['guardia-mannara'] },
  // la Guardia Mannara si sveglia insieme a TUTTE le Guardie (pag. 8): la sua
  // carta è indistinguibile dalla loro, quindi il narratore deve chiamarle
  // tutte insieme, senza sapere quale in realtà "tradisce" il branco
  { id: 'guardia-mannara', titolo: 'Le Guardie si riconoscono', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia-mannara', 'guardia'] },
  { id: 'mucca-mannara', titolo: 'Mucca Mannara (riconosce il branco)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['mucca-mannara'] },

  // --- Ogni notte, poteri non mortali (pag. 28) ---
  { id: 'fattucchiera', titolo: 'Fattucchiera', tipo: 'azione', primaNotteSolo: false, ruoli: ['fattucchiera'] },
  { id: 'addolorata', titolo: 'Addolorata', tipo: 'azione', primaNotteSolo: false, ruoli: ['addolorata'] },
  { id: 'cortigiana', titolo: 'Cortigiana', tipo: 'azione', primaNotteSolo: false, ruoli: ['cortigiana'] },
  { id: 'maga', titolo: 'Maga', tipo: 'azione', primaNotteSolo: false, ruoli: ['maga'] },
  { id: 'paladino', titolo: 'Paladino', tipo: 'azione', primaNotteSolo: false, ruoli: ['paladino'] },
  { id: 'pifferaio', titolo: 'Pifferaio', tipo: 'azione', primaNotteSolo: false, ruoli: ['pifferaio'] },
  { id: 'untore', titolo: 'Untore', tipo: 'azione', primaNotteSolo: false, ruoli: ['untore'] },
  { id: 'cartomante', titolo: 'Cartomante', tipo: 'azione', primaNotteSolo: false, ruoli: ['cartomante'] },
  { id: 'inquisitore', titolo: 'Inquisitore', tipo: 'azione', primaNotteSolo: false, ruoli: ['inquisitore'] },
  { id: 'medium', titolo: 'Medium', tipo: 'azione', primaNotteSolo: false, ruoli: ['medium'] },
  { id: 'veggente', titolo: 'Veggente', tipo: 'azione', primaNotteSolo: false, ruoli: ['veggente'] },
  { id: 'veggente-mannaro', titolo: 'Veggente Mannaro', tipo: 'azione', primaNotteSolo: false, ruoli: ['veggente-mannaro'] },
  // "può utilizzare questo potere soltanto una volta per partita, sia da
  // vivo che da morto" / "anche se lui stesso è morto" (pag. 21, 22): a
  // differenza di ogni altro ruolo, il passo va mostrato anche se il
  // titolare non è più vivo (vedi puoAgireDaMorto in NightSequencer)
  { id: 'guaritore', titolo: 'Guaritore', tipo: 'azione', primaNotteSolo: false, ruoli: ['guaritore'], puoAgireDaMorto: true },
  { id: 'sciacallo-mannaro', titolo: 'Sciacallo Mannaro', tipo: 'azione', primaNotteSolo: false, ruoli: ['sciacallo-mannaro'], puoAgireDaMorto: true },

  // --- Ogni notte, poteri mortali, per ultimi (pag. 28) ---
  { id: 'strega', titolo: 'Strega', tipo: 'azione', primaNotteSolo: false, ruoli: ['strega'] },
  {
    id: 'branco-lupi',
    titolo: 'Branco dei Lupi',
    tipo: 'azione',
    primaNotteSolo: false,
    // l'identità dei lupi si stabilisce solo nel passo "identifica-branco",
    // la prima notte: qui si sceglie soltanto la vittima, ogni notte
    assegnabile: false,
    ruoli: RUOLI_BRANCO_LUPI,
  },
  { id: 'chupacabra', titolo: 'Chupacabra', tipo: 'azione', primaNotteSolo: false, ruoli: ['chupacabra'] },
  { id: 'ipnotizzati', titolo: 'Sveglia gli ipnotizzati dal Pifferaio', tipo: 'informativo', primaNotteSolo: false, condizione: 'ipnotizzato' },
]

// Ruoli che si rivelano pubblicamente DI GIORNO, a un momento scelto dal
// narratore/giocatore (esecuzione del Boia, favorito al rogo per Spilungone
// o Alchimista, autorivelazione dell'Innocente, morte al rogo de L'Antico,
// rima sbagliata dello Scemo del Villaggio) o tramite elezione (Borgomastro):
// non vanno forzati in un passo notturno all'inizio, perché il narratore
// potrebbe non sapere ancora se/quando quel giocatore si rivelerà. Restano
// assegnabili in qualsiasi momento tramite il menu "Eventi speciali"
// (EventiSpeciali.jsx, evento "Rivelazione personaggio" o l'evento dedicato
// del ruolo).
export const RUOLI_RIVELAZIONE_GIORNO = [
  'boia', 'spilungone', 'alchimista', 'innocente', 'lantico', 'scemo-del-villaggio', 'borgomastro',
]

// Ruoli come Villico e Mezzosangue non hanno nessuna azione o
// riconoscimento notturno, quindi altrimenti non comparirebbero mai in
// nessun passo: non avrebbero mai occasione di essere assegnati a un
// giocatore. Questo passo raccoglie tutti i ruoli del mazzo che non sono
// già coperti da uno step dedicato (né sono di rivelazione diurna, vedi
// sopra), e li rende assegnabili come gli altri entro la fine della prima
// notte. Fantasma Onnisciente e Suocera sono le eccezioni volute: per
// regolamento (pag. 13, 21) le loro carte non vanno distribuite/assegnate
// all'inizio, restano "?" finché non muoiono — vedi RUOLI_RIVELAZIONE_ALLA_MORTE.
const RUOLI_CON_STEP_DEDICATO = new Set(STEPS_CON_RUOLO_DEDICATO.flatMap((s) => s.ruoli ?? []))
export const RUOLI_RIVELAZIONE_ALLA_MORTE = ['fantasma-onnisciente', 'suocera']
const RUOLI_SENZA_STEP_DEDICATO = ROLES.map((r) => r.slug).filter(
  (slug) =>
    !RUOLI_RIVELAZIONE_ALLA_MORTE.includes(slug) &&
    !RUOLI_RIVELAZIONE_GIORNO.includes(slug) &&
    !RUOLI_CON_STEP_DEDICATO.has(slug),
)

const PASSO_ASSEGNA_RESTANTI = {
  id: 'assegna-restanti',
  titolo: 'Assegna i ruoli rimanenti',
  tipo: 'informativo',
  primaNotteSolo: true,
  ruoli: RUOLI_SENZA_STEP_DEDICATO,
}

// va inserito subito dopo l'ultimo passo "solo prima notte" e prima di
// qualunque azione "ogni notte": i ruoli senza passo dedicato (a partire
// dal Villico) devono essere già assegnati quando le azioni che dipendono
// dal ruolo del bersaglio (es. il branco che sbrana) iniziano a chiamare
// giocatori per nome
const indiceUltimoPassoPrimaNotte = STEPS_CON_RUOLO_DEDICATO.reduce(
  (ultimo, step, indice) => (step.primaNotteSolo ? indice : ultimo),
  -1,
)

export const NIGHT_STEPS = [
  ...STEPS_CON_RUOLO_DEDICATO.slice(0, indiceUltimoPassoPrimaNotte + 1),
  PASSO_ASSEGNA_RESTANTI,
  ...STEPS_CON_RUOLO_DEDICATO.slice(indiceUltimoPassoPrimaNotte + 1),
]

// i ruoli "attivi" da considerare per i passi notturni non sono solo quelli
// scelti nel mazzo, ma anche quelli che un giocatore ha in questo momento
// senza che fossero nel mazzo originale (es. il Ladro che assume una delle
// sue due carte di scarto, pag. 15): altrimenti i passi di quel ruolo (es.
// l'indagine del Veggente) non comparirebbero mai per lui
export function ruoliAttivi(ruoliMazzo, giocatori) {
  return [...new Set([...ruoliMazzo, ...giocatori.map((g) => g.ruoloSlug).filter(Boolean)])]
}

// Campo condiviso da due meccaniche di regolamento con lo stesso effetto
// pratico: "questa notte nessun ruolo con potere attivo si sveglia".
// - Maledetto (pag. 25): quando il villaggio manda al rogo L'Antico.
// - Bardo (pag. 10): una volta per partita, dopo un rogo, fa saltare la notte.
// Impostato con il numero della notte in cui si applica (stesso schema di
// mortoNotte/brancoStorditoFinoA): scade da solo quando round lo supera,
// non richiede nessuna pulizia esplicita.
export function notteBloccata(giocatori, round) {
  return giocatori.some((g) => g.notteBloccataFinoA === round)
}

// L'Antico maledice SOLO i poteri "buoni" (villaggio), non l'intera notte
// come il Bardo (pag. 25): i lupi e gli altri ruoli malvagi (chupacabra,
// veggente mannaro...) continuano ad agire normalmente.
export function villaggioMaledetto(giocatori, round) {
  return giocatori.some((g) => g.villaggioMaledettoFinoA === round)
}

function passoBloccatoDallaMaledizione(step) {
  if (!step.ruoli) return false
  return step.ruoli.every((slug) => {
    const fazione = ROLES.find((r) => r.slug === slug)?.fazione
    return fazione !== 'lupi' && fazione !== 'indipendente'
  })
}

export function passiNotte(ruoliSelezionati, round, giocatori, quantita = {}, { promemoriaRuoliMorti = false } = {}) {
  const maledetto = villaggioMaledetto(giocatori, round)
  return NIGHT_STEPS.filter((step) => {
    if (step.primaNotteSolo && round > 1) return false
    if (maledetto && passoBloccatoDallaMaledizione(step)) return false
    if (step.escludiSeSelezionato?.some((slug) => ruoliSelezionati.includes(slug))) return false

    if (step.condizione) {
      return giocatori.some((giocatore) => giocatore.condizioni.includes(step.condizione))
    }

    return step.ruoli.some((slug) => {
      if (!ruoliSelezionati.includes(slug)) return false
      const daAssegnare = step.assegnabile !== false && ruoliAssegnabili([slug], giocatori, quantita).length > 0
      // Guaritore e Sciacallo Mannaro agiscono "anche da morti" (pag. 21,
      // 22): per loro basta che il titolare esista, vivo o no. Gli altri
      // ruoli con potere ricorrente restano nel giro anche da morti solo se
      // il promemoria è attivo (il narratore li richiama comunque, con la
      // sola icona del teschio, vedi NightSequencer).
      const titolare = giocatori.some(
        (g) =>
          g.ruoloSlug === slug &&
          (step.puoAgireDaMorto || g.vivo || (step.tipo === 'azione' && promemoriaRuoliMorti)),
      )
      return daAssegnare || titolare
    })
  })
}

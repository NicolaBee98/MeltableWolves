import { ruoliAssegnabili, mortoStanotte } from './assegnazione'
import { ROLES, RUOLI_BRANCO_LUPI } from './roles'

export { RUOLI_BRANCO_LUPI }

// Il Villico non ha alcuna azione o caratteristica da tracciare (pag. 5): non
// ha senso chiedere al narratore di individuarlo carta per carta come gli
// altri ruoli. Va escluso dalla selezione manuale: chi resta senza ruolo a
// fine prima notte diventa Villico in automatico (vedi
// autoAssegnaRuoliRimasti in NightSequencer).
export const RUOLI_NON_ASSEGNABILI_MANUALMENTE = ['villico']

// ogni ruolo con una carta distribuita all'inizio ha qui il suo passo (il
// Villico si assegna da solo a fine prima notte, i ruoli a rivelazione diurna
// o alla morte dagli Eventi speciali): lo verifica nightSteps.test.js
export const NIGHT_STEPS = [
  // --- Solo prima notte, nell'ordine del regolamento (pag. 27) ---
  { id: 'mimo', titolo: 'Mimo', tipo: 'azione', primaNotteSolo: true, ruoli: ['mimo'] },
  { id: 'ladro', titolo: 'Ladro', tipo: 'azione', primaNotteSolo: true, ruoli: ['ladro'] },
  // Cucciolo, Capobranco, Progenitore, Nonna e infine i Lupi Mannari
  // "generici" vanno assegnati singolarmente PRIMA che il branco si
  // riconosca collettivamente (pag. 27): il narratore sa chi ha quale carta
  // (le ha distribuite lui), ma quella decisione non va presa nello stesso
  // momento in cui i lupi aprono gli occhi insieme — lì non deve più
  // esserci nulla da scegliere, solo da mostrare.
  { id: 'cucciolo-di-lupo-mannaro', titolo: 'Cucciolo di Lupo Mannaro', tipo: 'informativo', primaNotteSolo: true, ruoli: ['cucciolo-di-lupo-mannaro'] },
  { id: 'lupo-mannaro-capobranco', titolo: 'Lupo Mannaro Capobranco', tipo: 'informativo', primaNotteSolo: true, ruoli: ['lupo-mannaro-capobranco'] },
  { id: 'lupo-mannaro-progenitore', titolo: 'Lupo Mannaro Progenitore', tipo: 'informativo', primaNotteSolo: true, ruoli: ['lupo-mannaro-progenitore'] },
  { id: 'nonna', titolo: 'Nonna', tipo: 'informativo', primaNotteSolo: true, ruoli: ['nonna'] },
  {
    id: 'lupo-mannaro',
    titolo: 'Lupo Mannaro',
    tipo: 'informativo',
    primaNotteSolo: true,
    ruoli: ['lupo-mannaro'],
    // le illustrazioni mostrano l'intero branco (Cucciolo/Capobranco/
    // Progenitore/Nonna già assegnati nei loro passi + i Lupi generici),
    // come nel passo "Branco dei Lupi": qui il branco comincia a riconoscersi,
    // non solo i Lupi "senza carta speciale" — ma resta assegnabile a mano
    // solo 'lupo-mannaro' (vedi ruoli sopra), gli altri sono già fissati
    ruoliMostraCoinvolti: RUOLI_BRANCO_LUPI,
  },
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
  { id: 'bardo', titolo: 'Bardo', indicazione: 'Il Bardo ti mostra il suo gesto segreto.', tipo: 'informativo', primaNotteSolo: true, ruoli: ['bardo'] },
  { id: 'gallo-mannaro', titolo: 'Gallo Mannaro', indicazione: 'Il Gallo Mannaro ti mostra il suo gesto segreto.', tipo: 'informativo', primaNotteSolo: true, ruoli: ['gallo-mannaro'] },
  { id: 'apprendista', titolo: 'Apprendista', tipo: 'azione', primaNotteSolo: true, ruoli: ['apprendista'] },
  { id: 'cavaliere', titolo: 'Cavaliere', tipo: 'azione', primaNotteSolo: true, ruoli: ['cavaliere'] },
  { id: 'figlia-dei-lupi', titolo: 'Figlia dei Lupi', tipo: 'azione', primaNotteSolo: true, ruoli: ['figlia-dei-lupi'] },
  { id: 'sacerdote', titolo: 'Sacerdote', tipo: 'azione', primaNotteSolo: true, ruoli: ['sacerdote'] },
  // subito dopo chi li crea (il Sacerdote), non dopo le Guardie
  { id: 'innamorati', titolo: 'Innamorati (si riconoscono)', tipo: 'informativo', primaNotteSolo: true, condizione: 'innamorato', iconaSlug: 'sacerdote' },
  // se nel mazzo c'è anche la Guardia Mannara, la sua carta è indistinguibile
  // dalle altre (pag. 8): il passo qui sotto le riconosce già tutte insieme,
  // quindi questo va saltato per non avere due schede separate per lo stesso
  // riconoscimento (vedi escludiSeSelezionato)
  { id: 'guardia', titolo: 'Guardie (si riconoscono)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia'], escludiSeSelezionato: ['guardia-mannara'] },
  // la Guardia Mannara si sveglia insieme a TUTTE le Guardie (pag. 8): la sua
  // carta è indistinguibile dalla loro, quindi il narratore deve chiamarle
  // tutte insieme, senza sapere quale in realtà "tradisce" il branco
  { id: 'guardia-mannara', titolo: 'Guardie (si riconoscono)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia-mannara', 'guardia'], iconaSlug: 'guardia', soloSeSelezionato: ['guardia-mannara'] },
  { id: 'mucca-mannara', titolo: 'Mucca Mannara (riconosce il branco)', indicazione: 'Tutti i lupi mannari alzano il pollice.', mostraLupi: true, tipo: 'informativo', primaNotteSolo: true, ruoli: ['mucca-mannara'] },

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
    // i lupi si svegliano e riconoscono qui, tutti insieme, nello stesso
    // momento in cui scelgono la vittima (non in un passo separato prima):
    // l'identità di ciascuno si è già stabilita nei rispettivi passi di
    // assegnazione qui sopra (Cucciolo, Capobranco, Progenitore, Nonna,
    // Lupo Mannaro), quindi qui non c'è nulla da scegliere su CHI è chi,
    // solo la vittima
    assegnabile: false,
    ruoli: RUOLI_BRANCO_LUPI,
    // icona del titolo (più ruoli nel passo: senza, sarebbe il punto interrogativo)
    iconaSlug: 'lupo-mannaro',
  },
  // agisceSeMortoStanotte: i morti si scoprono all'alba, quindi se il branco lo ha
  // appena sbranato il Chupacabra caccia comunque (e può portarsi dietro il lupo)
  { id: 'chupacabra', titolo: 'Chupacabra', tipo: 'azione', primaNotteSolo: false, ruoli: ['chupacabra'], agisceSeMortoStanotte: true },
  { id: 'ipnotizzati', titolo: 'Ipnotizzati (dal Pifferaio)', tipo: 'informativo', primaNotteSolo: false, condizione: 'ipnotizzato', iconaSlug: 'pifferaio' },
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

// carte che il narratore tiene in mano dopo la scelta del Ladro (le due
// scartate, meno quella presa da lui o dal Mimo che lo imita): nessun giocatore
// le ha, ma vanno svegliate lo stesso per non destare sospetti (pag. 15)
export function ruoliInMano(giocatori) {
  const prese = giocatori
    .filter((g) => (g.poteriUsati ?? []).includes('ladro-scelta') && (g.storiaRuoli ?? []).includes('ladro'))
    .map((g) => g.ruoloSlug)
  return [...new Set(giocatori.flatMap((g) => g.scartoLadro ?? []))].filter((slug) => !prese.includes(slug))
}

function passoEscluso(step, ruoliSelezionati, round, maledetto) {
  return (
    (step.primaNotteSolo && round > 1) ||
    (maledetto && passoBloccatoDallaMaledizione(step)) ||
    Boolean(step.escludiSeSelezionato?.some((slug) => ruoliSelezionati.includes(slug))) ||
    // passo che ha senso solo se c'è davvero quel ruolo (altrimenti duplicherebbe un altro passo)
    Boolean(step.soloSeSelezionato && !step.soloSeSelezionato.some((slug) => ruoliSelezionati.includes(slug)))
  )
}

// Passi che la notte avrà, stimati UNA volta all'ingresso (serve al "Passo X
// di N", che altrimenti crescerebbe man mano che i ruoli vengono assegnati):
// quelli già presenti più quelli che compariranno di sicuro dal mazzo (primo
// lupo, innamorati, ipnotizzati...). Dalla notte 2 i ruoli senza titolare vivo
// non si prevedono: passiNotte li esclude comunque.
const CREATORE_CONDIZIONE = { innamorato: 'sacerdote', ipnotizzato: 'pifferaio' }
export function passiAttesi(ruoliSelezionati, round, giocatori, quantita = {}, opzioni = {}) {
  const presenti = passiNotte(ruoliSelezionati, round, giocatori, quantita, opzioni)
  const maledetto = villaggioMaledetto(giocatori, round)
  return NIGHT_STEPS.filter((step) => {
    if (presenti.includes(step)) return true
    if (passoEscluso(step, ruoliSelezionati, round, maledetto)) return false
    if (step.condizione) {
      const creatore = CREATORE_CONDIZIONE[step.condizione]
      return Boolean(creatore) && ruoliSelezionati.includes(creatore) && (round === 1 || giocatori.some((g) => g.vivo && g.ruoloSlug === creatore))
    }
    return round === 1 && step.ruoli.some((slug) => ruoliSelezionati.includes(slug) && (quantita[slug] ?? 1) > 0)
  })
}

export function passiNotte(ruoliSelezionati, round, giocatori, quantita = {}, { promemoriaRuoliMorti = false } = {}) {
  const maledetto = villaggioMaledetto(giocatori, round)
  // non si filtra per ruoliSelezionati: chi costruisce l'elenco (App) tiene
  // solo i ruoli con quantità > 0, e una carta scartata dal Ladro ha quantità
  // 0 ma va chiamata lo stesso, ogni notte (altrimenti si capirebbe cosa ha il Ladro)
  const inMano = ruoliInMano(giocatori)
  return NIGHT_STEPS.filter((step) => {
    if (passoEscluso(step, ruoliSelezionati, round, maledetto)) return false

    if (step.condizione) {
      return giocatori.some((giocatore) => giocatore.condizioni.includes(step.condizione))
    }

    // carta scartata dal Ladro: il passo del ruolo compare comunque
    if (step.ruoli.some((slug) => inMano.includes(slug))) return true

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
          (step.puoAgireDaMorto || g.vivo || (step.agisceSeMortoStanotte && mortoStanotte(g, round)) || (step.tipo === 'azione' && promemoriaRuoliMorti)),
      )
      return daAssegnare || titolare
    })
  })
}

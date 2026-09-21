import { ruoliAssegnabili } from './assegnazione'
import { ROLES } from './roles'

export const RUOLI_BRANCO_LUPI = [
  'cucciolo-di-lupo-mannaro', 'lupo-mannaro', 'lupo-mannaro-capobranco',
  'lupo-mannaro-progenitore', 'nonna',
]

const STEPS_CON_RUOLO_DEDICATO = [
  // --- Solo prima notte, nell'ordine del regolamento (pag. 27) ---
  { id: 'mimo', titolo: 'Mimo', tipo: 'azione', primaNotteSolo: true, ruoli: ['mimo'] },
  { id: 'ladro', titolo: 'Ladro', tipo: 'azione', primaNotteSolo: true, ruoli: ['ladro'] },
  { id: 'criceto-malvagio', titolo: 'Criceto Malvagio', tipo: 'informativo', primaNotteSolo: true, ruoli: ['criceto-malvagio'] },
  { id: 'eremita', titolo: 'Eremita', tipo: 'informativo', primaNotteSolo: true, ruoli: ['eremita'] },
  { id: 'nano', titolo: 'Nano', tipo: 'informativo', primaNotteSolo: true, ruoli: ['nano'] },
  { id: 'pastore', titolo: 'Pastore', tipo: 'informativo', primaNotteSolo: true, ruoli: ['pastore'] },
  { id: 'polpo-mannaro', titolo: 'Polpo Mannaro', tipo: 'informativo', primaNotteSolo: true, ruoli: ['polpo-mannaro'] },
  { id: 'ubriaco', titolo: 'Ubriaco', tipo: 'informativo', primaNotteSolo: true, ruoli: ['ubriaco'] },
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
  { id: 'guardia', titolo: 'Guardie (si riconoscono)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia'] },
  { id: 'guardia-mannara', titolo: 'Guardia Mannara (riconosce le Guardie)', tipo: 'informativo', primaNotteSolo: true, ruoli: ['guardia-mannara'] },
  { id: 'innamorati', titolo: 'Innamorati si riconoscono', tipo: 'informativo', primaNotteSolo: true, condizione: 'innamorato' },
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
  { id: 'guaritore', titolo: 'Guaritore', tipo: 'azione', primaNotteSolo: false, ruoli: ['guaritore'] },
  { id: 'sciacallo-mannaro', titolo: 'Sciacallo Mannaro', tipo: 'azione', primaNotteSolo: false, ruoli: ['sciacallo-mannaro'] },

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

// Ruoli come Villico, Spilungone, Boia, Ambasciatore, ... non hanno nessuna
// azione o riconoscimento notturno, quindi altrimenti non comparirebbero mai
// in nessun passo: non avrebbero mai occasione di essere assegnati a un
// giocatore. Questo passo raccoglie tutti i ruoli del mazzo che non sono
// già coperti da uno step dedicato, e li rende assegnabili come gli altri
// entro la fine della prima notte. Il Fantasma Onnisciente è l'unica
// eccezione voluta: per regolamento (pag. 13) la sua carta non va
// distribuita all'inizio, va al primo giocatore che muore (non gestito da
// questa app: va assegnato a mano dal narratore quando succede).
const RUOLI_CON_STEP_DEDICATO = new Set(STEPS_CON_RUOLO_DEDICATO.flatMap((s) => s.ruoli ?? []))
const RUOLI_SENZA_STEP_DEDICATO = ROLES.map((r) => r.slug).filter(
  (slug) => slug !== 'fantasma-onnisciente' && !RUOLI_CON_STEP_DEDICATO.has(slug),
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

export function passiNotte(ruoliSelezionati, round, giocatori, quantita = {}) {
  return NIGHT_STEPS.filter((step) => {
    if (step.primaNotteSolo && round > 1) return false

    if (step.condizione) {
      return giocatori.some((giocatore) => giocatore.condizioni.includes(step.condizione))
    }

    return step.ruoli.some((slug) => {
      if (!ruoliSelezionati.includes(slug)) return false
      const daAssegnare = step.assegnabile !== false && ruoliAssegnabili([slug], giocatori, quantita).length > 0
      const titolareVivo = giocatori.some((g) => g.ruoloSlug === slug && g.vivo)
      return daAssegnare || titolareVivo
    })
  })
}

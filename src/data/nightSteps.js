export const NIGHT_STEPS = [
  // --- Solo prima notte, nell'ordine del regolamento (pag. 27) ---
  { id: 'mimo', titolo: 'Mimo', tipo: 'azione', primaNotteSolo: true, ruoli: ['mimo'] },
  { id: 'ladro', titolo: 'Ladro', tipo: 'azione', primaNotteSolo: true, ruoli: ['ladro'] },
  {
    id: 'potere-passivo',
    titolo: 'Promemoria: ruoli con potere passivo',
    tipo: 'informativo',
    primaNotteSolo: true,
    ruoli: [
      'lupo-mannaro-capobranco', 'criceto-malvagio', 'cucciolo-di-lupo-mannaro',
      'eremita', 'nano', 'nonna', 'pastore', 'polpo-mannaro', 'ubriaco',
    ],
  },
  {
    id: 'gesti-segreti',
    titolo: 'Promemoria: gesti segreti di Bardo e Gallo Mannaro',
    tipo: 'informativo',
    primaNotteSolo: true,
    ruoli: ['bardo', 'gallo-mannaro'],
  },
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
  { id: 'cartomante', titolo: 'Cartomante', tipo: 'informativo', primaNotteSolo: false, ruoli: ['cartomante'] },
  { id: 'inquisitore', titolo: 'Inquisitore', tipo: 'informativo', primaNotteSolo: false, ruoli: ['inquisitore'] },
  { id: 'medium', titolo: 'Medium', tipo: 'informativo', primaNotteSolo: false, ruoli: ['medium'] },
  { id: 'veggente', titolo: 'Veggente', tipo: 'informativo', primaNotteSolo: false, ruoli: ['veggente'] },
  { id: 'veggente-mannaro', titolo: 'Veggente Mannaro', tipo: 'informativo', primaNotteSolo: false, ruoli: ['veggente-mannaro'] },
  { id: 'guaritore', titolo: 'Guaritore', tipo: 'azione', primaNotteSolo: false, ruoli: ['guaritore'] },
  { id: 'sciacallo-mannaro', titolo: 'Sciacallo Mannaro', tipo: 'azione', primaNotteSolo: false, ruoli: ['sciacallo-mannaro'] },

  // --- Ogni notte, poteri mortali, per ultimi (pag. 28) ---
  { id: 'strega', titolo: 'Strega', tipo: 'azione', primaNotteSolo: false, ruoli: ['strega'] },
  {
    id: 'branco-lupi',
    titolo: 'Branco dei Lupi',
    tipo: 'azione',
    primaNotteSolo: false,
    ruoli: [
      'cucciolo-di-lupo-mannaro', 'lupo-mannaro', 'lupo-mannaro-capobranco',
      'lupo-mannaro-progenitore', 'nonna',
    ],
  },
  { id: 'chupacabra', titolo: 'Chupacabra', tipo: 'azione', primaNotteSolo: false, ruoli: ['chupacabra'] },
  { id: 'ipnotizzati', titolo: 'Sveglia gli ipnotizzati dal Pifferaio', tipo: 'informativo', primaNotteSolo: false, condizione: 'ipnotizzato' },
]

export function passiNotte(ruoliSelezionati, round, giocatori) {
  return NIGHT_STEPS.filter((step) => {
    if (step.primaNotteSolo && round > 1) return false

    if (step.condizione) {
      return giocatori.some((giocatore) => giocatore.condizioni.includes(step.condizione))
    }

    return step.ruoli.some((slug) => ruoliSelezionati.includes(slug))
  })
}

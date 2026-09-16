const AURA_MALVAGIA = [
  'lupo-mannaro',
  'cucciolo-di-lupo-mannaro',
  'lupo-mannaro-capobranco',
  'lupo-mannaro-progenitore',
  'chupacabra',
  'eremita',
]

export function auraDi(ruoloSlug) {
  return AURA_MALVAGIA.includes(ruoloSlug) ? 'malvagia' : 'benevola'
}

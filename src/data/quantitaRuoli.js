export const QUANTITA_RUOLI = {
  villico: { max: 12 },
  'lupo-mannaro': { max: 5 },
  guardia: { max: 2 },
}

export function maxQuantita(slug) {
  return QUANTITA_RUOLI[slug]?.max ?? 1
}

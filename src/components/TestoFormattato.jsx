// Il libretto originale usa grassetto/corsivo per enfasi; li preserviamo con
// una sintassi minima (***enfasi doppia***, **grassetto**, *corsivo*) invece
// di HTML grezzo nei dati, così libretto.js e roles.js restano testo semplice
// leggibile. Split non-greedy: l'ordine (*** poi ** poi *) evita che **bold**
// venga scambiato per due *corsivo* adiacenti.
const REGEX = /(\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*.+?\*)/g

export function TestoFormattato({ testo }) {
  const parti = testo.split(REGEX)
  return parti.map((parte, i) => {
    if (parte.startsWith('***') && parte.endsWith('***')) {
      return <strong key={i}><em>{parte.slice(3, -3)}</em></strong>
    }
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>
    }
    if (parte.startsWith('*') && parte.endsWith('*')) {
      return <em key={i}>{parte.slice(1, -1)}</em>
    }
    return parte
  })
}

import { conseguenzeMorte } from '../../data/eventiSpeciali'

// Promemoria delle conseguenze note della morte di `id` (crepacuore, legami...)
export function PromemoriaMorte({ giocatori, id }) {
  const righe = conseguenzeMorte(giocatori, id)
  if (righe.length === 0) return null
  return (
    <ul className="promemoria-morte" aria-label="Conseguenze della morte">
      {righe.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  )
}

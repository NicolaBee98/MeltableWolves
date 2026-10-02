import { conseguenzeMorte } from '../../data/eventiSpeciali'

export function RigheConseguenze({ righe }) {
  if (righe.length === 0) return null
  return (
    <ul className="promemoria-morte" aria-label="Conseguenze della morte">
      {righe.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  )
}

// Promemoria delle conseguenze note della morte di `id` (crepacuore, legami...)
export function PromemoriaMorte({ giocatori, id }) {
  return <RigheConseguenze righe={conseguenzeMorte(giocatori, id)} />
}

export function LogPartita({ eventi }) {
  if (eventi.length === 0) {
    return <p>Nessun evento registrato finora.</p>
  }

  return (
    <section className="log-partita">
      <h2>Registro partita</h2>
      <ul>
        {eventi.map((evento, indice) => (
          <li key={indice}>
            Notte {evento.round}: {evento.messaggio}
          </li>
        ))}
      </ul>
    </section>
  )
}

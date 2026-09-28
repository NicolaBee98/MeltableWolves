// eventi consecutivi con lo stesso round appartengono allo stesso ciclo
// notte+giorno (round si incrementa solo passando alla notte successiva,
// vedi useNotte/useLog): raggrupparli sotto un titolo solo li rende
// leggibili a colpo d'occhio, invece di ripetere "Notte N:" su ogni riga
function raggruppaPerNotte(eventi) {
  const gruppi = []
  for (const evento of eventi) {
    const ultimo = gruppi[gruppi.length - 1]
    if (ultimo?.round === evento.round) {
      ultimo.eventi.push(evento)
    } else {
      gruppi.push({ round: evento.round, eventi: [evento] })
    }
  }
  return gruppi
}

export function LogPartita({ eventi }) {
  if (eventi.length === 0) {
    return <p>Nessun evento registrato finora.</p>
  }

  return (
    <section className="log-partita">
      <h2>Registro partita</h2>
      {raggruppaPerNotte(eventi).map((gruppo) => (
        <div key={gruppo.round} className="log-partita__notte">
          <h3>Notte {gruppo.round}</h3>
          <ul>
            {gruppo.eventi.map((evento, indice) => (
              <li key={indice}>{evento.messaggio}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

import { iconaPath } from '../../data/assetRuoli'

// icona a sinistra di ogni riga, per riconoscere a colpo d'occhio la
// sotto-fase (notte/alba/giorno/rogo) senza dover leggere il testo
const NOME_FASE = { notte: 'Notte', alba: 'Alba', giorno: 'Giorno', rogo: 'Rogo' }
const ICONA_FASE = {
  notte: 'icona_notte',
  alba: 'icona_alba',
  giorno: 'icona_giorno',
  rogo: 'icona_rogo',
}

// eventi consecutivi con lo stesso round appartengono allo stesso ciclo
// notte+giorno (round si incrementa solo passando alla notte successiva,
// vedi useNotte/useLog): raggrupparli sotto un titolo solo li rende
// leggibili a colpo d'occhio, invece di ripetere "Notte N:" su ogni riga
function raggruppaPerGiorno(eventi) {
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
      <h2>Diario partita</h2>
      {raggruppaPerGiorno(eventi).map((gruppo) => (
        <div key={gruppo.round} className="log-partita__giorno">
          <h3>Round {gruppo.round}</h3>
          <ul>
            {gruppo.eventi.map((evento, indice) => (
              <li key={indice}>
                {ICONA_FASE[evento.fase] && (
                  <img src={iconaPath(ICONA_FASE[evento.fase])} alt="" aria-hidden="true" className="log-partita__icona-fase" />
                )}
                <span>
                  {NOME_FASE[evento.fase] && <strong>{NOME_FASE[evento.fase]}: </strong>}
                  {evento.messaggio}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

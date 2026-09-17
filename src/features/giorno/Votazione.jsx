import { risultatoVotazione } from '../../data/votazione'
import { TimerSpareggio } from './TimerSpareggio'
import { MorteImprovvisa } from './MorteImprovvisa'

export function Votazione({
  giocatori,
  voti,
  fase,
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  onRogo,
  onMorteImprovvisa,
  onProsegui,
}) {
  const vivi = giocatori.filter((g) => g.vivo)
  const { vincitori, maxVoti } = risultatoVotazione(voti, vivi.map((g) => g.id))

  if (fase === 'esito') {
    return (
      <section className="votazione votazione--esito">
        {vincitori.length === 1 ? (
          <div className="votazione__esito">
            <p>Vittima designata: {giocatori.find((g) => g.id === vincitori[0])?.nome}</p>
            <button type="button" onClick={() => onRogo(vincitori[0])}>
              Dichiara morte sul rogo
            </button>
          </div>
        ) : (
          <div className="votazione__spareggio">
            <p>Spareggio tra: {vincitori.map((id) => giocatori.find((g) => g.id === id)?.nome).join(', ')}</p>
            <TimerSpareggio />
          </div>
        )}
        <button type="button" onClick={tornaAlVoto}>
          Torna al voto
        </button>
        <button type="button" onClick={onProsegui}>
          Prosegui alla notte
        </button>
        <MorteImprovvisa giocatori={giocatori} onDichiara={onMorteImprovvisa} />
      </section>
    )
  }

  return (
    <section className="votazione">
      <ul>
        {vivi.map((g) => (
          <li key={g.id}>
            <span>{g.nome}</span>
            <span>{voti[g.id] ?? 0} voti</span>
            <button type="button" onClick={() => decrementaVoto(g.id)}>
              -1
            </button>
            <button type="button" onClick={() => incrementaVoto(g.id)}>
              +1
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={ricominciaVotazione}>
        Ricomincia votazione
      </button>
      {maxVoti > 0 && (
        <button type="button" onClick={vaiAEsito}>
          Vai all'esito
        </button>
      )}
    </section>
  )
}

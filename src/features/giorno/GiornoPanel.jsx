import { Votazione } from './Votazione'
import { MorteSulColpo } from './MorteSulColpo'

export function GiornoPanel({ giocatori, voti, incrementaVoto, decrementaVoto, ricominciaVotazione, aggiornaGiocatore, round }) {
  function dichiaraRogo(id) {
    aggiornaGiocatore(id, { vivo: false, causaMorte: 'rogo', mortoNotte: round })
  }

  function dichiaraColpo(id) {
    aggiornaGiocatore(id, { vivo: false, causaMorte: 'colpo' })
  }

  return (
    <section className="giorno-panel">
      <Votazione
        giocatori={giocatori}
        voti={voti}
        incrementaVoto={incrementaVoto}
        decrementaVoto={decrementaVoto}
        ricominciaVotazione={ricominciaVotazione}
        onRogo={dichiaraRogo}
      />
      <MorteSulColpo giocatori={giocatori} onDichiara={dichiaraColpo} />
    </section>
  )
}

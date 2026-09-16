import { Votazione } from './Votazione'
import { MorteSulColpo } from './MorteSulColpo'

export function GiornoPanel({ giocatori, voti, incrementaVoto, decrementaVoto, ricominciaVotazione, aggiornaGiocatore }) {
  function dichiaraMorte(id) {
    aggiornaGiocatore(id, { vivo: false })
  }

  return (
    <section className="giorno-panel">
      <Votazione
        giocatori={giocatori}
        voti={voti}
        incrementaVoto={incrementaVoto}
        decrementaVoto={decrementaVoto}
        ricominciaVotazione={ricominciaVotazione}
        onRogo={dichiaraMorte}
      />
      <MorteSulColpo giocatori={giocatori} onDichiara={dichiaraMorte} />
    </section>
  )
}

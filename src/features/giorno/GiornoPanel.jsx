import { Votazione } from './Votazione'

export function GiornoPanel({
  giocatori,
  voti,
  fase,
  candidatiEsito,
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  aggiornaGiocatore,
  round,
  onProsegui,
}) {
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
        fase={fase}
        candidatiEsito={candidatiEsito}
        incrementaVoto={incrementaVoto}
        decrementaVoto={decrementaVoto}
        ricominciaVotazione={ricominciaVotazione}
        vaiAEsito={vaiAEsito}
        tornaAlVoto={tornaAlVoto}
        onRogo={dichiaraRogo}
        onMorteImprovvisa={dichiaraColpo}
        onProsegui={onProsegui}
      />
    </section>
  )
}

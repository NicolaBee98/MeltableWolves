import { useState } from 'react'
import { risultatoVotazione } from '../../data/votazione'
import { CONDIZIONI } from '../../data/conditions'
import { ROLES } from '../../data/roles'
import { TimerSpareggio } from './TimerSpareggio'
import { EventiSpeciali } from './EventiSpeciali'

// emoji per ogni condizione attiva (significato completo in src/data/conditions.js)
const ICONE_CONDIZIONE = {
  accecato: '🙈',
  inibito: '🚫',
  innamorato: '❤️',
  ipnotizzato: '🌀',
  maledetto: '💀',
  trasformato: '🐷',
  'morto-sul-colpo': '⚡',
  protetto: '🛡️',
  resuscitato: '✨',
  unto: '🤐', // non può dire "sì" né "no"
}

// icona per fazione del ruolo, invece di 51 icone diverse una per ruolo
const ICONE_FAZIONE = {
  villaggio: '🧑‍🌾',
  lupi: '🐺',
  indipendente: '🃏',
  sconosciuto: '❓',
}

function BadgeCondizioni({ condizioni = [] }) {
  return condizioni.map((slug) => {
    const icona = ICONE_CONDIZIONE[slug]
    if (!icona) return null
    const nome = CONDIZIONI.find((c) => c.slug === slug)?.nome ?? slug
    return (
      <span key={slug} role="img" aria-label={nome} title={nome}>
        {icona}
      </span>
    )
  })
}

function BadgeRuolo({ ruoloSlug }) {
  if (!ruoloSlug) return null
  const ruolo = ROLES.find((r) => r.slug === ruoloSlug)
  if (!ruolo) return null
  const icona = ICONE_FAZIONE[ruolo.fazione] ?? '❔'
  return (
    <span role="img" aria-label={ruolo.nome} title={ruolo.nome}>
      {icona}
    </span>
  )
}

export function Votazione({
  giocatori,
  voti,
  fase,
  candidatiEsito = [],
  mostraRuoli = false,
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  onRogo,
  onMorteImprovvisa,
  onAnticoRivelazione,
  onRivelazione,
  onBoiaGiustizia,
  onAlchimistaEsplode,
  onBardoSaltaNotte,
  onElezioneBorgomastro,
  ruoliSelezionati,
  quantita,
  onProsegui,
}) {
  const vivi = giocatori.filter((g) => g.vivo)
  const [daConfermare, setDaConfermare] = useState(null)
  // Spilungone e L'Antico non muoiono mai al primo rogo: si rivelano e
  // basta (pag. 16, 21). Tracciati a parte perché non passano mai da onRogo.
  // ponytail: questo stato locale non si resetta tra un giorno e l'altro
  // (a differenza di voti/fase, che vivono nell'hook useVotazione): se lo
  // stesso personaggio venisse designato una seconda volta in una notte
  // successiva, l'esito resterebbe comunque corretto (nessuna vittima, o
  // per L'Antico normale morte da Villico) ma salterebbe il passo di
  // conferma. Da rivedere se capita davvero in una partita reale.
  const [spilungoneRivelatoId, setSpilungoneRivelatoId] = useState(null)
  const [anticoRivelatoId, setAnticoRivelatoId] = useState(null)

  if (fase === 'esito') {
    // l'esito si calcola sui candidati congelati al momento di "Vai all'esito",
    // non sui giocatori vivi correnti: altrimenti il rogo di un candidato
    // cambia il pool e può svuotare la lista dei designati (vedi bug: rogo
    // che porta a uno spareggio senza nessuno indicato)
    const { vincitori: designati } = risultatoVotazione(voti, candidatiEsito)
    const morteConfermata =
      designati.some((id) => giocatori.find((g) => g.id === id)?.vivo === false) ||
      spilungoneRivelatoId !== null ||
      anticoRivelatoId !== null

    function confermaMorte(id) {
      const target = giocatori.find((g) => g.id === id)
      if (target?.ruoloSlug === 'spilungone') {
        setSpilungoneRivelatoId(id)
      } else if (target?.ruoloSlug === 'lantico') {
        onAnticoRivelazione(id)
        setAnticoRivelatoId(id)
      } else {
        onRogo(id)
      }
      setDaConfermare(null)
    }

    function renderConferma(id) {
      const nome = giocatori.find((g) => g.id === id)?.nome
      return (
        <div className="votazione__conferma">
          <p>Confermi che {nome} è morto?</p>
          <button type="button" onClick={() => confermaMorte(id)}>
            Sì, è morto
          </button>
          <button type="button" onClick={() => setDaConfermare(null)}>
            Annulla
          </button>
        </div>
      )
    }

    function renderEsitoDesignato(id) {
      if (spilungoneRivelatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è lo Spilungone, troppo alto per il rogo. La notte cala senza
            vittime.
          </p>
        )
      }
      if (anticoRivelatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è L'Antico, ma sopravvive grazie alla sua prima vita e da ora
            gioca da Villico. Il villaggio è maledetto: la notte successiva nessun potere si sveglierà.
          </p>
        )
      }
      if (daConfermare === id) return renderConferma(id)
      if (!morteConfermata) {
        return (
          <button type="button" onClick={() => setDaConfermare(id)}>
            Dichiara morte sul rogo
          </button>
        )
      }
      return null
    }

    return (
      <section className="votazione votazione--esito">
        {designati.length === 1 ? (
          <div className="votazione__esito">
            <p>Vittima designata: {giocatori.find((g) => g.id === designati[0])?.nome}</p>
            {renderEsitoDesignato(designati[0])}
          </div>
        ) : (
          <div className="votazione__spareggio">
            <p>Spareggio tra: {designati.map((id) => giocatori.find((g) => g.id === id)?.nome).join(', ')}</p>
            <TimerSpareggio />
            {spilungoneRivelatoId !== null ? (
              renderEsitoDesignato(spilungoneRivelatoId)
            ) : anticoRivelatoId !== null ? (
              renderEsitoDesignato(anticoRivelatoId)
            ) : !morteConfermata ? (
              daConfermare ? (
                renderEsitoDesignato(daConfermare)
              ) : (
                <div className="scelta-giocatore__chips" role="group" aria-label="Chi muore nello spareggio">
                  {designati.map((id) => (
                    <button key={id} type="button" className="chip" onClick={() => setDaConfermare(id)}>
                      {giocatori.find((g) => g.id === id)?.nome}
                    </button>
                  ))}
                </div>
              )
            ) : null}
          </div>
        )}
        {/* una volta confermata la morte, il voto del giorno è chiuso: niente
            "Torna al voto" per evitare una seconda esecuzione lo stesso giorno */}
        {!morteConfermata && (
          <button type="button" onClick={tornaAlVoto}>
            Torna al voto
          </button>
        )}
        <button type="button" onClick={onProsegui} disabled={!morteConfermata}>
          Prosegui alla notte
        </button>
        <EventiSpeciali
          giocatori={giocatori}
          ruoliSelezionati={ruoliSelezionati}
          quantita={quantita}
          contesto="esito"
          onMorteImprovvisa={onMorteImprovvisa}
          onRivelazione={onRivelazione}
          onBoiaGiustizia={onBoiaGiustizia}
          onAlchimistaEsplode={onAlchimistaEsplode}
          onBardoSaltaNotte={onBardoSaltaNotte}
          onElezioneBorgomastro={onElezioneBorgomastro}
        />
      </section>
    )
  }

  const { maxVoti } = risultatoVotazione(voti, vivi.map((g) => g.id))

  return (
    <section className="votazione">
      <ul>
        {vivi.map((g) => (
          <li key={g.id}>
            <span>{g.nome}</span>
            <BadgeCondizioni condizioni={g.condizioni} />
            {mostraRuoli && <BadgeRuolo ruoloSlug={g.ruoloSlug} />}
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
        <button type="button" onClick={() => vaiAEsito(vivi.map((g) => g.id))}>
          Vai all'esito
        </button>
      )}
      <EventiSpeciali
        giocatori={giocatori}
        ruoliSelezionati={ruoliSelezionati}
        quantita={quantita}
        contesto="voto"
        onMorteImprovvisa={onMorteImprovvisa}
        onRivelazione={onRivelazione}
        onBoiaGiustizia={onBoiaGiustizia}
        onAlchimistaEsplode={onAlchimistaEsplode}
        onBardoSaltaNotte={onBardoSaltaNotte}
        onElezioneBorgomastro={onElezioneBorgomastro}
      />
    </section>
  )
}

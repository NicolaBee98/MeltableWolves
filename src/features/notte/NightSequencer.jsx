import { useEffect, useRef } from 'react'
import { passiNotte } from '../../data/nightSteps'
import { ruoliAssegnabili } from '../../data/assegnazione'
import { annunciAlba } from '../../data/alba'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviLegami, risolviCortigiana } from '../../data/risoluzioneNotte'
import { AssegnaRuolo } from './AssegnaRuolo'
import { MorteImprovvisa } from '../giorno/MorteImprovvisa'

export function NightSequencer({
  ruoliSelezionati,
  giocatori,
  aggiornaGiocatore,
  impostaGiocatori = () => {},
  quantita = {},
  registraEvento = () => {},
  onNotteConclusa = () => {},
  onMorteImprovvisa,
  round,
  stepIndex,
  avanti,
  indietro,
  nuovaNotte,
}) {
  const steps = passiNotte(ruoliSelezionati, round, giocatori, quantita)
  const indiceValido = steps.length > 0 ? Math.min(stepIndex, steps.length - 1) : 0

  // cronologia degli stati dei giocatori: lo stato dei giocatori
  // all'ingresso di ogni passo, per poter annullare l'azione del passo
  // precedente con "Indietro" (non persistita: non deve sopravvivere a un
  // refresh, e si azzera a ogni nuova notte)
  const cronologiaRef = useRef({})

  useEffect(() => {
    cronologiaRef.current = {}
  }, [round])

  useEffect(() => {
    cronologiaRef.current[indiceValido] = giocatori.map((g) => ({ ...g }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiceValido])

  function vaiIndietro() {
    const precedente = cronologiaRef.current[indiceValido - 1]
    if (precedente) {
      impostaGiocatori(precedente)
    }
    indietro()
  }

  if (steps.length === 0) {
    return <p>Nessun ruolo con azione notturna nel mazzo attuale.</p>
  }

  const step = steps[indiceValido]
  const ultimoPasso = indiceValido === steps.length - 1

  const giocatoriCoinvolti = step.condizione
    ? giocatori.filter((g) => g.condizioni.includes(step.condizione))
    : giocatori.filter((g) => step.ruoli.includes(g.ruoloSlug))

  const ruoliPendenti =
    step.ruoli && step.assegnabile !== false
      ? ruoliAssegnabili(
          step.ruoli.filter((slug) => ruoliSelezionati.includes(slug)),
          giocatori,
          quantita,
        )
      : []

  const azione = AZIONI_NOTTURNE[step.id]
  const qualcunoVivo = giocatoriCoinvolti.some((g) => g.vivo)
  const mostraAzione = step.tipo === 'azione' && azione && qualcunoVivo

  function passaAllaNotteSuccessiva() {
    giocatori.forEach((g) => {
      const condizioniRipulite = g.condizioni.filter((c) => c !== 'protetto' && c !== 'inibito')
      const cambiaCondizioni = condizioniRipulite.length !== g.condizioni.length
      const cambiaUsi = (g.usiNotte ?? []).length > 0
      if (cambiaCondizioni || cambiaUsi) {
        aggiornaGiocatore(g.id, {
          ...(cambiaCondizioni ? { condizioni: condizioniRipulite } : {}),
          ...(cambiaUsi ? { usiNotte: [] } : {}),
        })
      }
    })

    const patchRisoluzione = { ...risolviLegami(giocatori), ...risolviCortigiana(giocatori) }
    for (const [id, patch] of Object.entries(patchRisoluzione)) {
      aggiornaGiocatore(id, patch)
    }

    for (const messaggio of annunciAlba(giocatori, round)) {
      registraEvento(messaggio)
    }

    onNotteConclusa()
    nuovaNotte()
  }

  return (
    <section className="night-sequencer">
      <p className="night-sequencer__notte">Notte {round}</p>
      <p className="night-sequencer__passo">
        Passo {indiceValido + 1} di {steps.length}
      </p>
      <h2>
        {step.titolo}
        {giocatoriCoinvolti.length > 0 && ` (${giocatoriCoinvolti.map((g) => g.nome).join(', ')})`}
      </h2>
      <p className="night-sequencer__tipo">
        {step.tipo === 'informativo' ? 'Nessuna azione richiesta' : 'Possibile azione'}
      </p>

      {ruoliPendenti.length > 0 && (
        <AssegnaRuolo key={step.id} ruoli={ruoliPendenti} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />
      )}

      {giocatoriCoinvolti.length === 0 ? (
        <p>Nessun giocatore assegnato a questo ruolo per ora.</p>
      ) : (
        <ul>
          {giocatoriCoinvolti.map((g) => (
            <li key={g.id}>
              {g.nome}
              {g.vivo ? '' : ' (morto)'}
            </li>
          ))}
        </ul>
      )}

      {mostraAzione && (
        <azione.Componente giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={round} {...azione.props} />
      )}

      {ruoliPendenti.length > 0 && (
        <p className="night-sequencer__avviso">⚠️ Ruolo non ancora assegnato a nessun giocatore.</p>
      )}

      <div className="night-sequencer__nav">
        <button type="button" onClick={vaiIndietro} disabled={indiceValido === 0}>
          Indietro
        </button>
        {ultimoPasso ? (
          <button type="button" onClick={passaAllaNotteSuccessiva}>
            Notte successiva
          </button>
        ) : (
          <button type="button" onClick={() => avanti(steps.length)}>
            Avanti
          </button>
        )}
      </div>

      {onMorteImprovvisa && <MorteImprovvisa giocatori={giocatori} onDichiara={onMorteImprovvisa} />}
    </section>
  )
}

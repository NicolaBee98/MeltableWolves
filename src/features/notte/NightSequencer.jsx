import { useEffect, useRef, useState } from 'react'
import { passiNotte } from '../../data/nightSteps'
import { ruoliAssegnabili, contaAssegnati } from '../../data/assegnazione'
import { annunciAlba } from '../../data/alba'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviCortigiana } from '../../data/risoluzioneNotte'
import { AssegnaRuolo } from './AssegnaRuolo'

// il Mimo si sveglia assieme al ruolo che imita, quando quel ruolo agisce
// (pag. 18): puramente di presentazione, il narratore ricorda così di
// coinvolgerlo, il potere reale resta del titolare del ruolo imitato
function mimoDiQuestoPasso(giocatore, giocatori, step) {
  if (giocatore.legame?.tipo !== 'mimo') return false
  const bersaglio = giocatori.find((g) => g.id === giocatore.legame.targetId)
  return Boolean(bersaglio) && step.ruoli.includes(bersaglio.ruoloSlug)
}

export function NightSequencer({
  ruoliSelezionati,
  giocatori,
  aggiornaGiocatore,
  impostaGiocatori = () => {},
  quantita = {},
  scartoLadro = [],
  registraEvento = () => {},
  onNotteConclusa = () => {},
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
  // selezioni non ancora confermate per il passo corrente di assegnazione
  // ruolo: si accumulano mentre si spunta chi ha ogni variante di carta, e
  // si applicano tutte insieme solo quando si preme Avanti (mai un commit
  // per singolo click, così "Indietro" le scarta gratis senza toccare i giocatori)
  const [selezioniRuolo, setSelezioniRuolo] = useState({})

  useEffect(() => {
    cronologiaRef.current = {}
  }, [round])

  useEffect(() => {
    cronologiaRef.current[indiceValido] = giocatori.map((g) => ({ ...g }))
    setSelezioniRuolo({})
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
    : giocatori.filter((g) => step.ruoli.includes(g.ruoloSlug) || mimoDiQuestoPasso(g, giocatori, step))

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

  const capacitaPendente = ruoliPendenti.reduce(
    (somma, slug) => somma + ((quantita[slug] ?? 1) - contaAssegnati(giocatori, slug)),
    0,
  )
  const selezionatiPendenti = ruoliPendenti.reduce((somma, slug) => somma + (selezioniRuolo[slug]?.length ?? 0), 0)
  const personeDisponibili = giocatori.filter((g) => g.vivo && !g.ruoloSlug).length
  // non blocca "Avanti" se non ci sono abbastanza giocatori per completare
  // l'assegnazione: meglio lasciare un ruolo scoperto che bloccare la partita
  const assegnazioneIncompleta =
    ruoliPendenti.length > 0 && selezionatiPendenti < capacitaPendente && personeDisponibili >= capacitaPendente

  // applica le selezioni pendenti a una copia locale di giocatori, così la
  // logica successiva (pulizia condizioni, legami, annunci alba) vede già i
  // ruoli appena assegnati anche se lo stato reale si aggiorna in modo
  // asincrono tramite aggiornaGiocatore
  function conSelezioniRuoloApplicate(lista) {
    let risultato = lista
    for (const [slug, ids] of Object.entries(selezioniRuolo)) {
      for (const id of ids) {
        risultato = risultato.map((g) =>
          g.id === id ? { ...g, ruoloSlug: slug, storiaRuoli: [...(g.storiaRuoli ?? []), slug] } : g,
        )
      }
    }
    return risultato
  }

  function commitSelezioniRuolo(giocatoriConRuoli) {
    for (const [slug, ids] of Object.entries(selezioniRuolo)) {
      for (const id of ids) {
        const storiaRuoli = giocatoriConRuoli.find((g) => g.id === id)?.storiaRuoli ?? []
        aggiornaGiocatore(id, { ruoloSlug: slug, storiaRuoli })
      }
    }
  }

  const ciSonoSelezioniDaConfermare = Object.values(selezioniRuolo).some((ids) => ids.length > 0)

  // se c'erano selezioni pendenti, il primo click le conferma e basta:
  // resta sullo stesso passo, così se il ruolo appena assegnato ha
  // un'azione notturna (es. Veggente) la si può usare subito la stessa
  // notte invece di doverla saltare fino alla notte dopo
  function confermaSelezioniRestandoSulPasso() {
    commitSelezioniRuolo(conSelezioniRuoloApplicate(giocatori))
    setSelezioniRuolo({})
  }

  function vaiAvanti() {
    if (assegnazioneIncompleta) return
    if (ciSonoSelezioniDaConfermare) {
      confermaSelezioniRestandoSulPasso()
      return
    }
    avanti(steps.length)
  }

  function passaAllaNotteSuccessiva() {
    if (assegnazioneIncompleta) return
    if (ciSonoSelezioniDaConfermare) {
      confermaSelezioniRestandoSulPasso()
      return
    }
    // nessuna selezione pendente a questo punto: niente da committere,
    // "giocatori" riflette già lo stato corrente
    const giocatoriConRuoli = giocatori

    giocatoriConRuoli.forEach((g) => {
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

    // risolviLegami (Apprendista/Cavaliere/Figlia dei Lupi) è ora applicata
    // in modo generico da usePartita a ogni morte, notte o rogo che sia:
    // qui resta solo risolviCortigiana, che dipende specificamente
    // dall'esito della caccia di QUESTA notte.
    const patchRisoluzione = risolviCortigiana(giocatoriConRuoli)
    for (const [id, patch] of Object.entries(patchRisoluzione)) {
      aggiornaGiocatore(id, patch)
    }

    for (const messaggio of annunciAlba(giocatoriConRuoli, round)) {
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
        <AssegnaRuolo
          key={step.id}
          ruoli={ruoliPendenti}
          giocatori={giocatori}
          quantita={quantita}
          selezioni={selezioniRuolo}
          onCambiaSelezioni={setSelezioniRuolo}
        />
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
        <azione.Componente
          giocatori={giocatori}
          aggiornaGiocatore={aggiornaGiocatore}
          round={round}
          scartoLadro={scartoLadro}
          {...azione.props}
        />
      )}

      {assegnazioneIncompleta && (
        <p className="night-sequencer__avviso">
          ⚠️ Seleziona ancora {capacitaPendente - selezionatiPendenti}{' '}
          {capacitaPendente - selezionatiPendenti === 1 ? 'giocatore' : 'giocatori'} prima di continuare.
        </p>
      )}

      <div className="night-sequencer__nav">
        <button type="button" onClick={vaiIndietro} disabled={indiceValido === 0}>
          Indietro
        </button>
        {ultimoPasso ? (
          <button type="button" onClick={passaAllaNotteSuccessiva} disabled={assegnazioneIncompleta}>
            Notte successiva
          </button>
        ) : (
          <button type="button" onClick={vaiAvanti} disabled={assegnazioneIncompleta}>
            Avanti
          </button>
        )}
      </div>
    </section>
  )
}

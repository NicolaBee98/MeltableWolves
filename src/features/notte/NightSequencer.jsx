import { useEffect, useRef, useState } from 'react'
import { passiNotte, notteBloccata, villaggioMaledetto, RUOLI_NON_ASSEGNABILI_MANUALMENTE } from '../../data/nightSteps'
import { ruoliAssegnabili, contaAssegnati } from '../../data/assegnazione'
import { annunciAlba } from '../../data/alba'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviCortigiana } from '../../data/risoluzioneNotte'
import { AssegnaRuolo } from './AssegnaRuolo'
import { RuoloIcona, RuoloIllustrazione } from '../../components/RuoloIcona'
import { variantePerGiocatore, altezzaNaturalePersonaggio } from '../../data/assetRuoli'

// sottotitolo "Legato con..." per i ruoli con legame permanente stabilito
// la prima notte (pag. 9-10): una volta scelto il bersaglio non si può più
// cambiare, quindi vale la pena ricordarlo ogni volta che la carta si
// risveglia, non solo nel momento in cui viene stabilito
const ETICHETTA_LEGAME = {
  apprendista: 'è il suo maestro',
  cavaliere: 'è per lui che si sacrifica',
  'figlia-dei-lupi': 'è il suo genitore',
}

// il Mimo si sveglia assieme al ruolo che imita, quando quel ruolo agisce
// (pag. 18): puramente di presentazione, il narratore ricorda così di
// coinvolgerlo, il potere reale resta del titolare del ruolo imitato
function mimoDiQuestoPasso(giocatore, giocatori, step) {
  if (giocatore.legame?.tipo !== 'mimo') return false
  const bersaglio = giocatori.find((g) => g.id === giocatore.legame.targetId)
  return Boolean(bersaglio) && step.ruoli.includes(bersaglio.ruoloSlug)
}

// figura intera di ogni giocatore coinvolto in questo passo, fianco a
// fianco (sovrapposte): ogni notte, non solo quando il ruolo viene
// assegnato. Il Mimo mostra la propria illustrazione accanto a quella del
// ruolo imitato, invece di sparire dietro di essa (pag. 18: si sveglia
// insieme, non al posto del titolare). Tutte della stessa altezza (gli
// artwork non hanno tutti le stesse proporzioni): più personaggi ci sono,
// più piccoli e sovrapposti diventano, per restare su una riga sola invece
// di andare a capo.
function IllustrazioniCoinvolti({ giocatori, giocatoriCoinvolti }) {
  if (giocatoriCoinvolti.length === 0) return null
  const numeroImmagini = giocatoriCoinvolti.reduce((n, g) => n + (g.legame?.tipo === 'mimo' ? 2 : 1), 0)
  // altezza del personaggio più alto del gruppo: si restringe più ce ne
  // sono, per restare su una riga sola; gli altri si scalano dallo STESSO
  // fattore (vedi altezzaNaturalePersonaggio), non tutti alla stessa altezza
  const altezzaMassima = Math.max(70, Math.min(180, 480 / numeroImmagini))
  const naturaleMassima = Math.max(
    ...giocatoriCoinvolti.flatMap((g) => [
      altezzaNaturalePersonaggio(g.ruoloSlug),
      ...(g.legame?.tipo === 'mimo' ? [altezzaNaturalePersonaggio('mimo')] : []),
    ]),
  )
  const scala = altezzaMassima / naturaleMassima
  const sovrapposizione = numeroImmagini > 3 ? altezzaMassima * 0.4 : altezzaMassima * 0.15
  let indice = 0
  return (
    <div className="night-sequencer__illustrazioni">
      {giocatoriCoinvolti.map((g) => (
        <span key={g.id} className="night-sequencer__illustrazione-slot">
          {g.legame?.tipo === 'mimo' && (
            <RuoloIllustrazione
              slug="mimo"
              className="night-sequencer__illustrazione"
              style={{
                height: altezzaNaturalePersonaggio('mimo') * scala,
                marginLeft: indice++ > 0 ? `-${sovrapposizione}px` : 0,
              }}
            />
          )}
          <RuoloIllustrazione
            slug={g.ruoloSlug}
            variante={variantePerGiocatore(giocatori, g.id)}
            className="night-sequencer__illustrazione"
            style={{
              height: altezzaNaturalePersonaggio(g.ruoloSlug) * scala,
              marginLeft: indice++ > 0 ? `-${sovrapposizione}px` : 0,
            }}
          />
        </span>
      ))}
    </div>
  )
}

export function NightSequencer({
  ruoliSelezionati,
  giocatori,
  aggiornaGiocatore,
  impostaGiocatori = () => {},
  quantita = {},
  onCambiaQuantita = () => {},
  registraEvento = () => {},
  onNotteConclusa = () => {},
  round,
  stepIndex,
  avanti,
  indietro,
  nuovaNotte,
  promemoriaRuoliMorti = false,
  varianteMedium = false,
}) {
  // il Bardo (dopo un rogo) e la maledizione de L'Antico (pag. 10, 25) non
  // sopprimono solo i poteri attivi: bloccano la notte intera. Niente
  // passi, si passa dritti all'alba (che mostrerà correttamente "nessuno è
  // morto questa notte", visto che nessun potere ha potuto agire)
  const bloccata = notteBloccata(giocatori, round)
  const maledetto = villaggioMaledetto(giocatori, round)
  const steps = bloccata ? [] : passiNotte(ruoliSelezionati, round, giocatori, quantita, { promemoriaRuoliMorti })
  const indiceValido = steps.length > 0 ? Math.min(stepIndex, steps.length - 1) : 0

  // pila di stati precedenti per "Indietro": un elemento per passo visitato
  // (non per singola modifica). Se durante un passo capitano più modifiche
  // (es. il Ladro: identità + due carte di scarto + scelta finale), contano
  // come UN solo "prima" da ripristinare, non una per ciascuna — altrimenti
  // "Indietro" premuto lo stesso numero di volte che si crede necessario per
  // tornare "all'inizio del passo" in realtà annulla solo l'ultima modifica.
  // Così: se il passo corrente ha già almeno un'azione compiuta, il primo
  // "Indietro" annulla TUTTE le modifiche fatte in questo passo e resta sullo
  // stesso passo; se invece non ne ha ancora, il primo "Indietro" torna al
  // passo precedente mostrando le sue modifiche già fatte, e solo un
  // secondo "Indietro" le annulla (non persistito: non deve sopravvivere a
  // un refresh, e si azzera a ogni nuova notte)
  // stato (non ref): deve rientrare in un nuovo render subito, altrimenti
  // "disabled" sul pulsante Indietro resterebbe indietro di un render
  // rispetto al push appena fatto dall'effect qui sotto
  const [storico, setStorico] = useState([])
  const ultimoStatoRef = useRef({ stepIndex: indiceValido, giocatori })
  // true se per il passo corrente è già stata pushata una voce di storico:
  // le modifiche successive sullo STESSO passo aggiornano solo il
  // riferimento "corrente", senza aggiungerne altre
  const vocePushataPerPassoRef = useRef(false)

  useEffect(() => {
    setStorico([])
    ultimoStatoRef.current = { stepIndex: 0, giocatori }
    vocePushataPerPassoRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  useEffect(() => {
    const ultimo = ultimoStatoRef.current
    const passoCambiato = ultimo.stepIndex !== indiceValido
    if (passoCambiato) {
      setStorico((prev) => [...prev, ultimo])
      ultimoStatoRef.current = { stepIndex: indiceValido, giocatori }
      vocePushataPerPassoRef.current = false
    } else if (ultimo.giocatori !== giocatori) {
      if (!vocePushataPerPassoRef.current) {
        setStorico((prev) => [...prev, ultimo])
        vocePushataPerPassoRef.current = true
      }
      ultimoStatoRef.current = { stepIndex: indiceValido, giocatori }
    }
  }, [indiceValido, giocatori])

  // selezioni non ancora confermate per il passo corrente di assegnazione
  // ruolo: si accumulano mentre si spunta chi ha ogni variante di carta, e
  // si applicano tutte insieme solo quando si preme Avanti (mai un commit
  // per singolo click, così "Indietro" le scarta gratis senza toccare i giocatori)
  const [selezioniRuolo, setSelezioniRuolo] = useState({})

  useEffect(() => {
    setSelezioniRuolo({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiceValido])

  function vaiIndietro() {
    if (storico.length === 0) return
    const precedente = storico[storico.length - 1]
    setStorico(storico.slice(0, -1))
    ultimoStatoRef.current = precedente
    if (precedente.giocatori !== giocatori) {
      impostaGiocatori(precedente.giocatori)
    }
    if (precedente.stepIndex !== indiceValido) {
      indietro()
    }
  }

  if (bloccata) {
    const bardo = giocatori.find((g) => g.notteBloccataFinoA === round && g.ruoloSlug === 'bardo')
    const messaggio = bardo
      ? 'Questa notte non si svolge per i poteri del Bardo.'
      : 'Questa notte non si svolge: il villaggio è maledetto.'

    function vaiAllAlba() {
      registraEvento(bardo ? `${bardo.nome} fa saltare la notte con il suo gesto segreto (Bardo).` : messaggio)
      for (const evento of annunciAlba(giocatori, round)) {
        registraEvento(evento, 'alba')
      }
      onNotteConclusa()
      nuovaNotte()
    }

    return (
      <section className="night-sequencer">
        <p className="night-sequencer__notte">Notte {round}</p>
        <p>{messaggio}</p>
        <button type="button" onClick={vaiAllAlba}>
          Vai all'alba
        </button>
      </section>
    )
  }

  if (steps.length === 0) {
    return <p>Nessun ruolo con azione notturna nel mazzo attuale.</p>
  }

  const step = steps[indiceValido]
  const ultimoPasso = indiceValido === steps.length - 1

  // vista "come se" le selezioni di ruolo pendenti (non ancora confermate)
  // fossero già assegnate: così, quando un passo richiede sia "chi ha
  // questa carta" sia un'azione con bersaglio, i due picker restano visibili
  // e modificabili insieme invece che il primo sparire per far posto al
  // secondo (vedi conSelezioniRuoloApplicate più sotto e aggiornaGiocatoreConCommit)
  const giocatoriConPendenti = conSelezioniRuoloApplicate(giocatori)

  const giocatoriCoinvolti = step.condizione
    ? giocatoriConPendenti.filter((g) => g.condizioni.includes(step.condizione))
    : giocatoriConPendenti.filter(
        (g) => step.ruoli.includes(g.ruoloSlug) || mimoDiQuestoPasso(g, giocatoriConPendenti, step),
      )

  const ruoliPendenti =
    step.ruoli && step.assegnabile !== false
      ? ruoliAssegnabili(
          step.ruoli.filter(
            (slug) => ruoliSelezionati.includes(slug) && !RUOLI_NON_ASSEGNABILI_MANUALMENTE.includes(slug),
          ),
          giocatori,
          quantita,
        )
      : []

  const attoreConLegame = giocatoriCoinvolti.find((g) => g.legame && ETICHETTA_LEGAME[g.legame.tipo])
  const bersaglioLegame = attoreConLegame && giocatori.find((g) => g.id === attoreConLegame.legame.targetId)

  const azione = AZIONI_NOTTURNE[step.id]
  const titolareVivo = giocatoriCoinvolti.some((g) => g.vivo)
  // Guaritore e Sciacallo Mannaro agiscono "anche da morti" (vedi
  // puoAgireDaMorto in nightSteps.js): per loro basta che il ruolo sia
  // assegnato a qualcuno, vivo o no
  const qualcunoCoinvolto = step.puoAgireDaMorto ? giocatoriCoinvolti.length > 0 : titolareVivo
  // la Fattucchiera blocca il potere del bersaglio per la notte (vedi
  // Inibito): controllato qui, in un unico punto per tutte le azioni,
  // invece che in ognuna. Solo per i passi a titolare singolo/doppio noto
  // (step.ruoli.length === 1): il branco è un'azione collettiva, inibire
  // un solo lupo non ha senso bloccare l'intero attacco.
  const attoreInibito =
    step.ruoli?.length === 1 && giocatoriCoinvolti.some((g) => (g.condizioni ?? []).includes('inibito'))
  const mostraAzione = step.tipo === 'azione' && azione && qualcunoCoinvolto && !attoreInibito
  // titolare morto, potere ricorrente, non tra le eccezioni che agiscono da
  // morti: il passo compare comunque (promemoriaRuoliMorti l'ha lasciato
  // passare in passiNotte) solo per ricordare al narratore di chiamarlo, non
  // per svolgere un'azione vera
  const mostraPromemoriaMorto =
    step.tipo === 'azione' && azione && !step.puoAgireDaMorto && !titolareVivo && giocatoriCoinvolti.length > 0

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

  // passata all'azione al posto di aggiornaGiocatore: se il narratore
  // sceglie il bersaglio dell'azione mentre "chi ha questa carta" è ancora
  // solo una selezione pendente, questo la rende definitiva nello stesso
  // click, invece di richiedere un secondo giro su "Avanti"
  function aggiornaGiocatoreConCommit(id, patch) {
    if (ciSonoSelezioniDaConfermare) {
      commitSelezioniRuolo(conSelezioniRuoloApplicate(giocatori))
      setSelezioniRuolo({})
    }
    aggiornaGiocatore(id, patch)
  }

  // il Villico non si sceglie a mano (vedi RUOLI_NON_ASSEGNABILI_MANUALMENTE):
  // a fine notte, chi è rimasto senza ruolo lo diventa in automatico — ma
  // solo se ogni altro ruolo del mazzo è già stato assegnato a qualcuno. Se
  // restano ruoli "pendenti" (Spilungone, Suocera, Boia... qualunque carta
  // non ancora consegnata) i giocatori senza ruolo restano con il punto
  // interrogativo: l'app non sa davvero se sono Villici o tengono in mano
  // una di quelle carte, esattamente come il narratore col mazzo fisico.
  function autoAssegnaVillici() {
    const altriRuoliPendenti = ruoliSelezionati.some(
      (slug) => slug !== 'villico' && ruoliAssegnabili([slug], giocatori, quantita).length > 0,
    )
    if (altriRuoliPendenti) return

    giocatori
      .filter((g) => !g.ruoloSlug)
      .forEach((g) => {
        aggiornaGiocatore(g.id, { ruoloSlug: 'villico', storiaRuoli: [...(g.storiaRuoli ?? []), 'villico'] })
      })
  }

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
      // resta sul passo solo se ha un'azione da poter usare subito (es.
      // Veggente appena assegnato): un passo "informativo" (solo
      // riconoscimento, es. il branco) non ha nulla da fare qui, quindi
      // andrebbe avanti da solo invece di mostrare "Nessuna azione
      // richiesta" e richiedere un secondo click su Avanti
      if (step.tipo === 'azione') return
      avanti(steps.length)
      return
    }
    avanti(steps.length)
  }

  function passaAllaNotteSuccessiva() {
    if (assegnazioneIncompleta) return
    if (ciSonoSelezioniDaConfermare && step.tipo === 'azione') {
      confermaSelezioniRestandoSulPasso()
      return
    }
    if (ciSonoSelezioniDaConfermare) {
      confermaSelezioniRestandoSulPasso()
    }
    autoAssegnaVillici()
    // "giocatori" resta lo snapshot di questo render: le aggiornaGiocatore
    // appena lanciate da autoAssegnaVillici (setState funzionale) non si
    // riflettono qui in modo sincrono. Va bene solo perché risolviCortigiana
    // e la pulizia qui sotto non dipendono mai da un ruoloSlug appena
    // diventato 'villico' — se in futuro dovessero, andrebbe ricalcolato
    // esplicitamente chi è rimasto senza ruolo invece di riusare "giocatori".
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
    const patchRisoluzione = risolviCortigiana(giocatoriConRuoli, round)
    for (const [id, patch] of Object.entries(patchRisoluzione)) {
      aggiornaGiocatore(id, patch)
    }

    for (const messaggio of annunciAlba(giocatoriConRuoli, round)) {
      registraEvento(messaggio, 'alba')
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
      {maledetto && (
        <p className="night-sequencer__maledizione">
          🌑 Il villaggio è maledetto da L'Antico: questa notte agiscono solo i poteri malvagi.
        </p>
      )}
      <h2 className="night-sequencer__ruolo">
        {/* un solo ruolo possibile → la sua faccia; più ruoli raggruppati
            nello stesso passo (es. "assegna i ruoli rimanenti") → punto
            interrogativo, mostrare una faccia a caso tra tante sarebbe fuorviante */}
        <RuoloIcona slug={step.ruoli?.length === 1 ? step.ruoli[0] : undefined} size={32} />
        <span>
          {step.titolo}
          {giocatoriCoinvolti.length > 0 &&
            ` (${giocatoriCoinvolti.map((g) => (g.vivo ? g.nome : `${g.nome} ☠️`)).join(', ')})`}
        </span>
      </h2>
      {/* solo i titolari già confermati (non le selezioni ancora pendenti
          per un ruolo di QUESTO passo, che hanno già la propria
          illustrazione in AssegnaRuolo qui sotto — altrimenti comparirebbe
          due volte lo stesso personaggio) e solo i vivi (un titolare morto
          non deve comparire tra chi si sveglia). Un passo come "Il branco si
          riconosce" copre più ruoli insieme (i Lupi generici ancora da
          assegnare + Nonna/Progenitore/Cucciolo già assegnati nei loro passi
          dedicati): questi ultimi vanno comunque mostrati qui, il branco si
          vede al completo mentre si riconosce. */}
      <IllustrazioniCoinvolti
        giocatori={giocatori}
        giocatoriCoinvolti={giocatoriCoinvolti.filter((g) => g.vivo && !ruoliPendenti.includes(g.ruoloSlug))}
      />
      {ruoliPendenti.length === 0 && (
        <p className="night-sequencer__tipo">
          {step.tipo === 'informativo' ? 'Nessuna azione richiesta' : 'Possibile azione'}
        </p>
      )}

      {bersaglioLegame && (
        <p className="night-sequencer__legame">
          🔗 {bersaglioLegame.nome} {ETICHETTA_LEGAME[attoreConLegame.legame.tipo]}.
        </p>
      )}

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

      {ruoliPendenti.length === 0 && giocatoriCoinvolti.length === 0 && (
        <p>Nessun giocatore assegnato a questo ruolo per ora.</p>
      )}

      {attoreInibito && (
        <p className="night-sequencer__inibito">
          🚫 Il potere è inibito questa notte dalla Fattucchiera: nessuna azione disponibile.
        </p>
      )}

      {mostraPromemoriaMorto && (
        <p className="night-sequencer__promemoria-morto">
          ☠️ Chiama comunque {giocatoriCoinvolti.map((g) => g.nome).join(', ')} per il suo turno, anche se morto/a.
        </p>
      )}

      {mostraAzione && (
        <>
          {step.puoAgireDaMorto && !titolareVivo && (
            <p className="night-sequencer__promemoria-morto">
              ☠️ {giocatoriCoinvolti.map((g) => g.nome).join(', ')} è morto/a, ma agisce comunque.
            </p>
          )}
          <azione.Componente
            giocatori={giocatoriConPendenti}
            aggiornaGiocatore={aggiornaGiocatoreConCommit}
            round={round}
            ruoliSelezionati={ruoliSelezionati}
            quantita={quantita}
            onCambiaQuantita={onCambiaQuantita}
            varianteMedium={varianteMedium}
            {...azione.props}
          />
        </>
      )}

      {assegnazioneIncompleta && (
        <p className="night-sequencer__avviso">
          ⚠️ Seleziona ancora {capacitaPendente - selezionatiPendenti}{' '}
          {capacitaPendente - selezionatiPendenti === 1 ? 'giocatore' : 'giocatori'} prima di continuare.
        </p>
      )}

      <div className="night-sequencer__nav">
        <button type="button" onClick={vaiIndietro} disabled={storico.length === 0}>
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

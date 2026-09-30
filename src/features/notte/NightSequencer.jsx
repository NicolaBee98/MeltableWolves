import { useEffect, useRef, useState } from 'react'
import { passiNotte, notteBloccata, villaggioMaledetto, RUOLI_NON_ASSEGNABILI_MANUALMENTE } from '../../data/nightSteps'
import { ruoliAssegnabili, contaAssegnati, assegnaGuardiaMannaraCasuale } from '../../data/assegnazione'
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
  apprendista: (nome) => `${nome} è il suo maestro`,
  // frase con l'attore come soggetto, non "Tizio è per lui che si
  // sacrifica" (target-first, si leggeva macchinoso)
  cavaliere: (nome) => `È pronto a sacrificarsi per ${nome}`,
  'figlia-dei-lupi': (nome) => `${nome} è il suo genitore`,
}

// il Mimo si sveglia assieme al ruolo che imita, quando quel ruolo agisce
// (pag. 18): puramente di presentazione, il narratore ricorda così di
// coinvolgerlo, il potere reale resta del titolare del ruolo imitato
function mimoDiQuestoPasso(giocatore, giocatori, ruoliCoinvolti) {
  if (giocatore.legame?.tipo !== 'mimo') return false
  const bersaglio = giocatori.find((g) => g.id === giocatore.legame.targetId)
  return Boolean(bersaglio) && ruoliCoinvolti.includes(bersaglio.ruoloSlug)
}

// figura intera di ogni giocatore coinvolto in questo passo, fianco a
// fianco: ogni notte, non solo quando il ruolo viene assegnato. Un unico
// fattore di scala per TUTTI (mai diverso da uno all'altro, mai progressivo
// "ognuno più stretto del precedente"), calcolato sulla larghezza reale
// disponibile (il box della fase, misurata con ResizeObserver) così l'intero
// gruppo ci sta sempre su una riga sola, senza dover scorrere. Restano
// comunque scalati diversamente TRA loro in base ad altezzaNaturalePersonaggio
// (una Guardia, disegnata più bassa, resta più piccola di un Veggente, come
// nell'artwork originale) — quello non cambia mai, qualunque sia il fattore.
// Chi sta imitando (il Mimo) mostra SOLO la propria illustrazione, mai anche
// quella del ruolo copiato: visivamente resta se stesso/a, il ruolo reale è
// rappresentato dal vero titolare.
const ALTEZZA_MASSIMA_ILLUSTRAZIONE = 160
const ALTEZZA_MINIMA_ILLUSTRAZIONE = 50
// rapporto medio larghezza/altezza degli artwork di personaggi/ (misurato su
// un campione: Progenitore 0.75, Nonna 0.66, Capobranco 0.92, Lupo Mannaro
// 0.78): nessun dato di larghezza naturale è calibrato per-ruolo come lo è
// l'altezza, quindi si stima la larghezza totale della riga con questa media
const RAPPORTO_LARGHEZZA_ALTEZZA_MEDIO = 0.78

function IllustrazioniCoinvolti({ giocatori, giocatoriCoinvolti }) {
  const contenitoreRef = useRef(null)
  const [larghezzaDisponibile, setLarghezzaDisponibile] = useState(320)

  useEffect(() => {
    const elemento = contenitoreRef.current
    if (!elemento) return
    const osservatore = new ResizeObserver((entries) => {
      const larghezza = entries[0]?.contentRect.width
      if (larghezza) setLarghezzaDisponibile(larghezza)
    })
    osservatore.observe(elemento)
    return () => osservatore.disconnect()
  }, [])

  if (giocatoriCoinvolti.length === 0) return null
  const naturaleMassima = Math.max(
    ...giocatoriCoinvolti.map((g) => altezzaNaturalePersonaggio(g.legame?.tipo === 'mimo' ? 'mimo' : g.ruoloSlug)),
  )
  const numeroImmagini = giocatoriCoinvolti.length
  // una lieve sovrapposizione, solo se il gruppo è numeroso, come frazione
  // dell'altezza (non un valore assoluto): resta coerente qualunque sia
  // l'altezza finale calcolata
  const frazioneSovrapposizione = numeroImmagini > 4 ? 0.2 : 0
  // altezza che fa stare l'intera riga (N immagini, con l'eventuale
  // sovrapposizione) esattamente nella larghezza disponibile, invertendo la
  // formula della larghezza totale: altezza * rapporto * [1 + (N-1)*(1-frazioneSovrapposizione)]
  const divisore = RAPPORTO_LARGHEZZA_ALTEZZA_MEDIO * (1 + (numeroImmagini - 1) * (1 - frazioneSovrapposizione))
  const altezzaMassima = Math.min(
    ALTEZZA_MASSIMA_ILLUSTRAZIONE,
    Math.max(ALTEZZA_MINIMA_ILLUSTRAZIONE, larghezzaDisponibile / divisore),
  )
  const scala = altezzaMassima / naturaleMassima
  const sovrapposizione = altezzaMassima * frazioneSovrapposizione
  return (
    <div className="night-sequencer__illustrazioni" ref={contenitoreRef}>
      {giocatoriCoinvolti.map((g, indice) => {
        const eMimo = g.legame?.tipo === 'mimo'
        const slug = eMimo ? 'mimo' : g.ruoloSlug
        return (
          <span key={g.id} className="night-sequencer__illustrazione-slot">
            <RuoloIllustrazione
              slug={slug}
              variante={eMimo ? undefined : variantePerGiocatore(giocatori, g.id)}
              className="night-sequencer__illustrazione"
              style={{
                height: altezzaNaturalePersonaggio(slug) * scala,
                marginLeft: indice > 0 ? `-${sovrapposizione}px` : 0,
              }}
            />
          </span>
        )
      })}
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
  onTornaAiGiocatori,
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

  // stesso principio di selezioniRuolo, per il Mimo: "che carta ha davvero
  // il bersaglio" cambia il ruoloSlug del Mimo stesso, che farebbe sparire
  // subito il passo "mimo" dall'elenco (il suo unico ruolo coinvolto non
  // sarebbe più 'mimo'), facendo "saltare" la schermata al passo successivo
  // nel bel mezzo della scelta. Restando solo una scelta locale finché non
  // si preme Avanti, il passo non si tocca e la scelta resta modificabile.
  const [mimoRuoloScelto, setMimoRuoloScelto] = useState(null)

  useEffect(() => {
    setMimoRuoloScelto(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiceValido])

  function commitMimoSeSelezionato() {
    if (!mimoRuoloScelto) return
    const mimo = giocatori.find((g) => g.ruoloSlug === 'mimo')
    const target = mimo && giocatori.find((g) => g.id === mimo.legame?.targetId)
    if (mimo && target) {
      aggiornaGiocatore(mimo.id, { ruoloSlug: mimoRuoloScelto, storiaRuoli: [...(mimo.storiaRuoli ?? []), mimoRuoloScelto] })
      aggiornaGiocatore(target.id, {
        ruoloSlug: mimoRuoloScelto,
        storiaRuoli: [...(target.storiaRuoli ?? []), mimoRuoloScelto],
      })
    }
    setMimoRuoloScelto(null)
  }

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
    // nessun passo notturno per questo mazzo (es. solo Villici, o solo
    // ruoli a rivelazione diurna): non è un vicolo cieco, si passa
    // direttamente all'alba. Chi non ha ancora un ruolo diventa Villico
    // (vedi autoAssegnaRuoliRimasti più sotto, stessa logica): qui nessun
    // altro ruolo del mazzo può essere "in attesa", altrimenti passiNotte
    // avrebbe già generato un passo per assegnarlo.
    function vaiAllAlbaSenzaPassi() {
      autoAssegnaRuoliRimasti()
      for (const messaggio of annunciAlba(giocatori, round)) {
        registraEvento(messaggio, 'alba')
      }
      onNotteConclusa()
      nuovaNotte()
    }

    return (
      <section className="night-sequencer">
        <p className="night-sequencer__notte">Notte {round}</p>
        <p>Nessun ruolo con azione notturna nel mazzo attuale.</p>
        <button type="button" onClick={vaiAllAlbaSenzaPassi}>
          Vai all'alba
        </button>
      </section>
    )
  }

  const step = steps[indiceValido]
  const ultimoPasso = indiceValido === steps.length - 1

  // vista "come se" le selezioni di ruolo pendenti (non ancora confermate)
  // fossero già assegnate: così, quando un passo richiede sia "chi ha
  // questa carta" sia un'azione con bersaglio, i due picker restano visibili
  // e modificabili insieme invece che il primo sparire per far posto al
  // secondo (vedi conSelezioniRuoloApplicate più sotto e aggiornaGiocatoreConCommit)
  const giocatoriConPendenti = conSelezioniRuoloApplicate(giocatori)

  // di norma i coinvolti sono solo i ruoli di questo passo (step.ruoli); un
  // passo può allargare la vista con ruoliMostraCoinvolti (es. "Lupo
  // Mannaro": qui si assegnano solo i Lupi generici, ma si vede l'intero
  // branco già riconosciuto finora, come nel passo "Branco dei Lupi")
  const ruoliCoinvolti = step.ruoliMostraCoinvolti ?? step.ruoli
  const giocatoriCoinvolti = step.condizione
    ? giocatoriConPendenti.filter((g) => g.condizioni.includes(step.condizione))
    : giocatoriConPendenti.filter(
        (g) => ruoliCoinvolti.includes(g.ruoloSlug) || mimoDiQuestoPasso(g, giocatoriConPendenti, ruoliCoinvolti),
      )

  // i ruoli di questo passo che si assegnano a mano (indipendentemente dal
  // fatto che siano già tutti assegnati o no): usato per decidere SE
  // mostrare il picker "chi ha questa carta", che deve restare visibile per
  // tutta la durata del passo anche a selezione già confermata (vedi
  // AssegnaRuolo più sotto) — ruoliPendenti invece resta "solo ciò che manca
  // ancora", usato per capire quando bloccare "Avanti".
  // L'identità di chi ha una carta si fissa alla prima assegnazione: dalla
  // notte 2 in poi, se il ruolo è già interamente assegnato, il picker non
  // deve più comparire (altrimenti il narratore potrebbe "riassegnare" la
  // carta a qualcun altro ogni notte, e l'illustrazione del titolare
  // finirebbe duplicata, una volta da qui e una da IllustrazioniCoinvolti)
  const ruoliAssegnabiliStep =
    step.ruoli && step.assegnabile !== false
      ? step.ruoli.filter(
          (slug) =>
            ruoliSelezionati.includes(slug) &&
            !RUOLI_NON_ASSEGNABILI_MANUALMENTE.includes(slug) &&
            (round === 1 || ruoliAssegnabili([slug], giocatori, quantita).length > 0),
        )
      : []
  const ruoliPendenti = ruoliAssegnabili(ruoliAssegnabiliStep, giocatori, quantita)
  // "Seleziona i lupi mannari rimanenti" invece del generico "Chi ha questa
  // carta?" quando qui si vedono già altri lupi speciali riconosciuti (vedi
  // ruoliMostraCoinvolti sul passo 'lupo-mannaro'): la domanda di default
  // avrebbe poco senso davanti a un branco che si sta già mostrando al completo
  const altriLupiSpecialiGiaRiconosciuti =
    step.ruoliMostraCoinvolti?.length > 0 &&
    giocatoriCoinvolti.some((g) => step.ruoliMostraCoinvolti.includes(g.ruoloSlug) && !step.ruoli.includes(g.ruoloSlug))
  const domandaAssegnaRuolo = altriLupiSpecialiGiaRiconosciuti ? 'Seleziona i lupi mannari rimanenti.' : undefined
  // sottoinsieme di ruoliAssegnabiliStep con un solo titolare (reale o
  // ancora solo pendente, non confermato): è l'unico caso in cui
  // l'illustrazione di AssegnaRuolo qui sotto è esattamente la stessa
  // persona che comparirebbe in IllustrazioniCoinvolti (va quindi esclusa da
  // lì). Un ruolo con PIÙ titolari contemporanei (es. il Lupo Mannaro
  // "generico", più copie nel mazzo) resta invece visibile per intero in
  // IllustrazioniCoinvolti: lì AssegnaRuolo mostra solo UN ritratto generico,
  // non uno per persona (vedi anche variante/mimo/vivo, che solo
  // IllustrazioniCoinvolti sa rendere). Contati su giocatoriConPendenti, non
  // su contaAssegnati/storiaRuoli: altrimenti un secondo/terzo titolare
  // ancora solo selezionato (non confermato con Avanti) non farebbe uscire
  // il ruolo dalla modalità "singolo", e la sua illustrazione non
  // comparirebbe nella riga finché non si conferma. Con ruoliMostraCoinvolti
  // (es. "Lupo Mannaro", che mostra tutto il branco già riconosciuto)
  // AssegnaRuolo non mostra MAI la propria illustrazione (vedi
  // illustrazioneSeparata più sotto): niente da escludere qui, ognuno va
  // sempre mostrato nella riga collettiva, a partire dal primo selezionato.
  const ruoliAssegnabiliStepSingoli = step.ruoliMostraCoinvolti
    ? []
    : ruoliAssegnabiliStep.filter((slug) => giocatoriConPendenti.filter((g) => g.ruoloSlug === slug).length <= 1)

  // solo se il legame è ancora quello di QUESTO passo (step.ruoli.includes),
  // non un legame di un ruolo precedente rimasto per sbaglio sul giocatore
  // (es. Chupacabra che un tempo era Apprendista): altrimenti il promemoria
  // "è il suo maestro" comparirebbe su un passo che non c'entra nulla
  const attoreConLegame = giocatoriCoinvolti.find(
    (g) => g.legame && ETICHETTA_LEGAME[g.legame.tipo] && step.ruoli?.includes(g.legame.tipo),
  )
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
  // un solo lupo non ha senso bloccare l'intero attacco. Mai sul passo della
  // Fattucchiera stessa: nessun'altra azione applica 'inibito', quindi può
  // comparire sulla sua stessa titolare solo come residuo di un cambio di
  // "chi ha questa carta" (era stata scelta come bersaglio mentre la carta
  // era di qualcun altro) — un vero auto-blocco non esiste, il suo potere
  // non deve mai risultare inibito da lei stessa.
  const attoreInibito =
    step.id !== 'fattucchiera' &&
    step.ruoli?.length === 1 &&
    giocatoriCoinvolti.some((g) => (g.condizioni ?? []).includes('inibito'))
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
    // "le tre guardie" si scelgono come gruppo unico (vedi AssegnaRuolo):
    // appena il gruppo è completo, ne sceglie una a caso come traditrice,
    // senza mai chiederlo al narratore
    assegnaGuardiaMannaraCasuale(giocatoriConRuoli, aggiornaGiocatore, quantita)
  }

  const ciSonoSelezioniDaConfermare = Object.values(selezioniRuolo).some((ids) => ids.length > 0)

  // annulla per davvero un'assegnazione già confermata di questo stesso
  // passo (il narratore ha sbagliato/ripensato chi ha la carta, prima di
  // premere "Avanti"): tolto anche da storiaRuoli, altrimenti il ruolo
  // resterebbe per sempre "già assegnato" (contaAssegnati non lo riconta
  // mai) e non sarebbe più possibile darlo a qualcun altro
  function rimuoviAssegnazione(giocatoreId, ruoloSlug) {
    const g = giocatori.find((x) => x.id === giocatoreId)
    if (!g) return
    aggiornaGiocatore(giocatoreId, {
      ruoloSlug: undefined,
      storiaRuoli: (g.storiaRuoli ?? []).filter((s) => s !== ruoloSlug),
      // se questo ruolo aveva stabilito un legame (Apprendista/Cavaliere/
      // Figlia dei Lupi), toglierlo dal titolare: altrimenti riassegnando
      // più tardi lo stesso ruolo a un altro giocatore che RIPRENDE questo
      // stesso ruoloSlug (o se questo giocatore lo riprende lui stesso più
      // avanti) ricomparirebbe un legame mai davvero scelto questa volta
      ...(g.legame?.tipo === ruoloSlug ? { legame: undefined } : {}),
    })
  }

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
  // una di quelle carte, esattamente come il narratore col mazzo fisico —
  // A MENO CHE non resti in sospeso un SOLO altro ruolo, con ESATTAMENTE
  // tanti posti liberi quanti sono i giocatori ancora senza ruolo: lì non
  // c'è nessuna vera scelta da fare (nessun altro candidato possibile),
  // quindi non ha senso lasciarli misteriosi solo perché il narratore non è
  // ancora passato dal passo dedicato a quel ruolo.
  function autoAssegnaRuoliRimasti() {
    const senzaRuolo = giocatori.filter((g) => !g.ruoloSlug)
    if (senzaRuolo.length === 0) return

    const ruoliNonVillicoPendenti = ruoliSelezionati.filter(
      (slug) => slug !== 'villico' && ruoliAssegnabili([slug], giocatori, quantita).length > 0,
    )

    let ruoloDaAssegnare = 'villico'
    if (ruoliNonVillicoPendenti.length === 1) {
      const [slug] = ruoliNonVillicoPendenti
      const capacitaResidua = (quantita[slug] ?? 1) - contaAssegnati(giocatori, slug)
      if (capacitaResidua !== senzaRuolo.length) return
      ruoloDaAssegnare = slug
    } else if (ruoliNonVillicoPendenti.length > 1) {
      return
    }

    senzaRuolo.forEach((g) => {
      aggiornaGiocatore(g.id, { ruoloSlug: ruoloDaAssegnare, storiaRuoli: [...(g.storiaRuoli ?? []), ruoloDaAssegnare] })
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
    commitMimoSeSelezionato()
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
    commitMimoSeSelezionato()
    if (ciSonoSelezioniDaConfermare && step.tipo === 'azione') {
      confermaSelezioniRestandoSulPasso()
      return
    }
    if (ciSonoSelezioniDaConfermare) {
      confermaSelezioniRestandoSulPasso()
    }
    autoAssegnaRuoliRimasti()
    // "giocatori" resta lo snapshot di questo render: le aggiornaGiocatore
    // appena lanciate da autoAssegnaRuoliRimasti (setState funzionale) non si
    // riflettono qui in modo sincrono. Va bene solo perché risolviCortigiana
    // e la pulizia qui sotto non dipendono mai da un ruoloSlug appena
    // diventato 'villico' (o dall'unico altro ruolo rimasto) — se in futuro
    // dovessero, andrebbe ricalcolato esplicitamente chi è rimasto senza
    // ruolo invece di riusare "giocatori".
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

  // via di fuga per "ho dimenticato un giocatore": ha senso solo prima che
  // sia successo qualunque cosa questa partita (altrimenti si rischia di
  // rimuovere qualcuno con già un ruolo/condizioni assegnati a metà notte)
  const puoTornareAiGiocatori = onTornaAiGiocatori && round === 1 && indiceValido === 0 && storico.length === 0

  return (
    <section className="night-sequencer">
      {puoTornareAiGiocatori && (
        <button type="button" className="app__torna-indietro" onClick={onTornaAiGiocatori}>
          ← Torna ai giocatori
        </button>
      )}
      <p className="night-sequencer__notte">Notte {round}</p>
      <p className="night-sequencer__passo">
        Passo {indiceValido + 1} di {steps.length}
      </p>
      {maledetto && (
        <p className="night-sequencer__maledizione">
          🌑 Il villaggio è maledetto da L'Antico: questa notte agiscono solo i poteri malvagi.
        </p>
      )}
      {/* key su round+ID del passo (non l'indice posizionale!): forza un
          remount a ogni cambio di passo vero, così il fade+slide d'ingresso
          (CSS, vedi .night-sequencer__contenuto) riparte da solo ogni volta,
          senza doverlo gestire a mano. Un'azione può uccidere l'unico
          titolare di un passo precedente (es. il Chupacabra che sbrana
          l'unico Lupo Mannaro rimasto): quel passo (es. "branco-lupi") sparisce
          da steps e tutti gli indici successivi si accorciano, ma indiceValido
          resta lo STESSO passo (chupacabra), solo con un indice diverso —
          usare l'indice come key lo rimonterebbe per errore, perdendo lo
          stato locale dell'azione (bug reale osservato: la scelta del
          Chupacabra si "resettava" da sola dopo aver sbranato l'ultimo lupo,
          niente più possibilità di ripensare il bersaglio) */}
      <div key={`${round}-${step.id}`} className="night-sequencer__contenuto">
      <h2 className="night-sequencer__ruolo" aria-live="polite" aria-atomic="true">
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
      {/* mai i ruoli a titolare singolo che AssegnaRuolo gestisce in questo
          stesso passo (ruoliAssegnabiliStepSingoli, che sia il titolare già
          confermato o ancora da scegliere): quello ha già la propria
          illustrazione qui sotto, altrimenti comparirebbe due volte lo
          stesso personaggio — bug reale osservato ogni volta che un
          titolare arriva già assegnato (carta distribuita a inizio partita)
          su un passo ancora "assegnabile" (notte 1, o notte 2+ con posti
          liberi). Solo i vivi (un titolare morto non deve comparire tra chi
          si sveglia). Un passo come "Il branco si riconosce" (assegnabile:
          false, quindi fuori da ruoliAssegnabiliStep) o un ruolo con più
          titolari (es. Lupo Mannaro generico) mostra così comunque tutti i
          suoi titolari. */}
      <IllustrazioniCoinvolti
        giocatori={giocatori}
        giocatoriCoinvolti={giocatoriCoinvolti.filter((g) => g.vivo && !ruoliAssegnabiliStepSingoli.includes(g.ruoloSlug))}
      />
      {/* "Possibile azione" (quando il passo prevedeva potenzialmente
          un'azione ma non c'era nessun titolare in attesa di selezione) è
          stata rimossa: creava confusione lasciando intendere ci fosse
          qualcosa da fare in app, quando in realtà l'azione fisica del
          ruolo (se c'è) resta interamente in mano al narratore */}
      {ruoliAssegnabiliStep.length === 0 && step.tipo === 'informativo' && (
        <p className="night-sequencer__tipo">Nessuna azione richiesta</p>
      )}

      {bersaglioLegame && (
        <p className="night-sequencer__legame">🔗 {ETICHETTA_LEGAME[attoreConLegame.legame.tipo](bersaglioLegame.nome)}.</p>
      )}

      {ruoliAssegnabiliStep.length > 0 && (
        <AssegnaRuolo
          key={step.id}
          ruoli={ruoliAssegnabiliStep}
          giocatori={giocatori}
          quantita={quantita}
          selezioni={selezioniRuolo}
          onCambiaSelezioni={setSelezioniRuolo}
          onRimuovi={rimuoviAssegnazione}
          illustrazioneSeparata={!step.ruoliMostraCoinvolti}
          {...(domandaAssegnaRuolo ? { domanda: domandaAssegnaRuolo } : {})}
        />
      )}

      {ruoliAssegnabiliStep.length === 0 && giocatoriCoinvolti.length === 0 && (
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
            mimoRuoloScelto={mimoRuoloScelto}
            onScegliRuoloMimo={setMimoRuoloScelto}
            {...azione.props}
          />
        </>
      )}

      {assegnazioneIncompleta && (
        <p className="avviso">
          ⚠️ Seleziona ancora {capacitaPendente - selezionatiPendenti}{' '}
          {capacitaPendente - selezionatiPendenti === 1 ? 'giocatore' : 'giocatori'} prima di continuare.
        </p>
      )}
      </div>

      <div className="night-sequencer__nav">
        <button type="button" onClick={vaiIndietro} disabled={storico.length === 0}>
          Indietro
        </button>
        {ultimoPasso ? (
          <button type="button" onClick={passaAllaNotteSuccessiva} disabled={assegnazioneIncompleta}>
            È giorno nel villaggio
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

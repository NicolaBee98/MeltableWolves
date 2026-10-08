import { useEffect, useRef, useState } from 'react'
import { passiNotte, passiAttesi, ruoliInMano, notteBloccata, villaggioMaledetto, NIGHT_STEPS, RUOLI_NON_ASSEGNABILI_MANUALMENTE } from '../../data/nightSteps'
import { ruoloPerDisplay } from '../../data/roles'
import { ruoliAssegnabili, contaAssegnati, eMimoCopiante, assegnaGuardiaMannaraCasuale, conRuolo, mortoStanotte } from '../../data/assegnazione'
import { annunciAlba } from '../../data/alba'
import { AZIONI_NOTTURNE } from './azioni'
import { risolviCortigiana } from '../../data/risoluzioneNotte'
import { AssegnaRuolo } from './AssegnaRuolo'
import { PulsanteTieni } from '../../components/PulsanteTieni'
import { RuoloIcona, RuoloIllustrazione } from '../../components/RuoloIcona'
import { dimensioniPersonaggio, disponiFigure, variantePerGiocatore } from '../../data/assetRuoli'

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

// giocatori coinvolti in un passo, in base allo stato `lista`: di norma i
// titolari dei ruoli del passo (il Mimo che li copia ha lo stesso ruoloSlug), o chi ha la
// condizione per i passi "di gruppo" (innamorati, ipnotizzati)
function filtraCoinvolti(step, lista) {
  if (step.condizione) return lista.filter((g) => g.condizioni.includes(step.condizione))
  const ruoliCoinvolti = step.ruoliMostraCoinvolti ?? step.ruoli
  return lista.filter((g) => ruoliCoinvolti.includes(g.ruoloSlug))
}

// se il passo corrente non è più tra quelli calcolati (il suo titolare ha
// cambiato ruolo o è morto mentre il narratore ci era sopra: Ladro, Addolorata,
// Mimo...) lo si rimette al suo posto, nell'ordine di NIGHT_STEPS: la
// schermata resta visibile fino ad "Avanti"
function conPassoCorrente(steps, id) {
  if (!id || steps.some((s) => s.id === id)) return steps
  const passo = NIGHT_STEPS.find((s) => s.id === id)
  if (!passo) return steps
  const posizione = NIGHT_STEPS.indexOf(passo)
  const indice = steps.findIndex((s) => NIGHT_STEPS.indexOf(s) > posizione)
  return indice < 0 ? [...steps, passo] : [...steps.slice(0, indice), passo, ...steps.slice(indice)]
}

// dopo un ricaricamento lo stato è una copia deserializzata: il confronto per
// riferimento direbbe sempre "modificato"
const uguali = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b)

function quantitaUguali(a, b) {
  const chiavi = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...chiavi].every((k) => a[k] === b[k])
}

// figura intera di ogni giocatore coinvolto in questo passo, fianco a
// fianco: ogni notte, non solo quando il ruolo viene assegnato. Le figure
// hanno altezze diverse e proporzionate (stesso spessore di contorno, vedi
// dimensioniPersonaggio), allineate in basso, con un unico fattore di scala
// calcolato sulla larghezza reale disponibile (il box della fase, misurata
// con ResizeObserver): se in una riga non stanno abbastanza grandi si va a
// capo (disponiFigure), mai scorrimento orizzontale.
// Chi sta imitando (il Mimo) mostra SOLO la propria illustrazione, mai anche
// quella del ruolo copiato: visivamente resta se stesso/a, il ruolo reale è
// rappresentato dal vero titolare.

// una voce per giocatore: lo slug mostrato e la variante numerata (Villico_N,
// Guardia_N, Lupo_Mannaro_N: la posizione tra i giocatori con lo stesso ruolo,
// nell'ordine stabile di `giocatori`, che qui include le selezioni pendenti
// altrimenti i lupi appena scelti, ancora senza ruolo, ricadrebbero tutti sulla
// prima illustrazione). Chi ha ancora il ruolo nascosto (es. gli ipnotizzati
// dal Pifferaio) è mostrato come Villico comune, e passa al ruolo reale
// appena viene rivelato
// `nascosti` (ipnotizzati dal Pifferaio): SEMPRE Villici comuni (Villico_N), mai
// il ruolo reale, nemmeno se già assegnato o se è il Mimo
function vociIllustrazioni(giocatori, giocatoriCoinvolti, nascosti = false) {
  const idNascosti = nascosti ? new Set(giocatoriCoinvolti.map((g) => g.id)) : new Set()
  const visti = giocatori.map((x) => ({
    ...x,
    // il Mimo che copia non conta tra i titolari del ruolo copiato: la variante
    // (Lupo_Mannaro_N...) di chi ha davvero la carta non deve cambiare col Mimo
    ruoloSlug: idNascosti.has(x.id) ? 'villico' : eMimoCopiante(x) ? 'mimo' : (ruoloPerDisplay(x.ruoloSlug) ?? 'villico'),
  }))
  return giocatoriCoinvolti.map((g) => {
    const eMimo = eMimoCopiante(g) && !idNascosti.has(g.id)
    // la Guardia Mannara si mostra come Guardia (il narratore non sa chi è)
    return {
      id: g.id,
      slug: eMimo ? 'mimo' : idNascosti.has(g.id) ? 'villico' : (ruoloPerDisplay(g.ruoloSlug) ?? 'villico'),
      variante: eMimo ? undefined : variantePerGiocatore(visti, g.id),
    }
  })
}

// passi in cui ci si riconosce tra pari: la riga mostra subito TUTTE le
// figure attese dal mazzo (una per copia: Lupo_Mannaro_1..N, Guardia_1..N),
// senza legarle ai giocatori né dipendere da chi è stato già selezionato.
// La Guardia Mannara compare nel gruppo in coda, come figura a sé: essendo
// slegata dai giocatori non rivela chi è la traditrice (il narratore sa solo
// che nel mazzo c'è)
const PASSI_CON_FIGURE_ATTESE = ['lupo-mannaro', 'guardia', 'guardia-mannara']
function vociAttese(step, ruoliSelezionati, quantita, giocatori) {
  const slugs = [...(step.ruoliMostraCoinvolti ?? step.ruoli)].sort(
    (a, b) => (a === 'guardia-mannara') - (b === 'guardia-mannara'),
  )
  const voci = slugs
    .filter((slug) => ruoliSelezionati.includes(slug))
    .flatMap((slug) =>
      Array.from({ length: quantita[slug] ?? 1 }, (_, i) => ({ id: `${slug}-${i + 1}`, slug, variante: i + 1 })),
    )
  // il Mimo che copia uno di questi ruoli, una volta riconosciuto, è un
  // giocatore in più nel gruppo e si mostra come Mimo
  const mimi = giocatori
    .filter((g) => eMimoCopiante(g) && slugs.includes(g.ruoloSlug))
    .map((g) => ({ id: `mimo-${g.id}`, slug: 'mimo' }))
  return [...voci, ...mimi]
}

// `voci` (se presente) è la riga già decisa dal passo. `inTempoReale`: solo
// per i passi di gruppo (ipnotizzati), dove il ruolo può essere rivelato
// mentre si è sul passo. Altrimenti la riga si calcola UNA volta all'ingresso
// nel passo (il componente è rimontato a ogni passo/riapertura) e non segue
// più né le selezioni "chi ha questa carta" né le morti causate dall'azione
// stessa: si aggiorna solo con Avanti.
function IllustrazioniCoinvolti({ giocatori, giocatoriCoinvolti, voci: vociFisse, inTempoReale = false }) {
  const [congelate] = useState(() => vociFisse ?? vociIllustrazioni(giocatori, giocatoriCoinvolti, inTempoReale))
  const voci = vociFisse ?? (inTempoReale ? vociIllustrazioni(giocatori, giocatoriCoinvolti, true) : congelate)
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

  if (voci.length === 0) return null
  const dim = voci.map((v) => dimensioniPersonaggio(v.slug, v.variante))
  const { k, righe } = disponiFigure(dim, larghezzaDisponibile)
  return (
    <div className="night-sequencer__illustrazioni" ref={contenitoreRef}>
      {righe.map((riga) => (
        <div key={riga[0]} className="night-sequencer__illustrazioni-riga">
          {riga.map((i) => (
            <RuoloIllustrazione
              key={voci[i].id}
              slug={voci[i].slug}
              variante={voci[i].variante}
              className="night-sequencer__illustrazione"
              style={{ height: dim[i].altezza * k }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function NightSequencer({
  ruoliSelezionati,
  giocatori,
  aggiornaGiocatore,
  impostaGiocatori = () => {},
  annullaMorte = null,
  quantita = {},
  onCambiaQuantita = () => {},
  registraEvento = () => {},
  // registra nel log le modifiche confermate fin qui (le anteprime della notte
  // non si registrano da sole): opzionale
  confermaLog,
  // Indietro: toglie dal log le voci scritte all'Avanti del passo (opzionale)
  annullaLogPasso,
  onNotteConclusa = () => {},
  round,
  stepIndex,
  avanti,
  indietro,
  nuovaNotte,
  promemoriaRuoliMorti = false,
  varianteMedium = false,
  addolorataEreditaScelte = true,
  onTornaAiGiocatori,
  ingressoSalvato = null,
  salvaIngresso = () => {},
}) {
  // il Bardo (dopo un rogo) non sopprime solo i poteri attivi: blocca la
  // notte intera. Niente passi, si passa dritti all'alba (che mostrerà
  // correttamente "nessuno è morto questa notte", visto che nessun potere ha
  // potuto agire). La maledizione de L'Antico (pag. 25) è invece diversa:
  // blocca solo i poteri del villaggio, filtrati da passiNotte, e la notte si
  // svolge (vedi `maledetto` più sotto)
  const bloccata = notteBloccata(giocatori, round)
  const maledetto = villaggioMaledetto(giocatori, round)
  const stepsCalcolati = bloccata ? [] : passiNotte(ruoliSelezionati, round, giocatori, quantita, { promemoriaRuoliMorti })

  // "ingresso": il passo corrente ANCORATO ALL'ID (non alla posizione) più lo
  // stato com'era quando ci si è entrati. La lista dei passi si ricalcola a
  // ogni render e cambia durante la notte (un'azione uccide o cambia ruolo a
  // un titolare: Strega, Branco, Ladro, Addolorata, Mimo...): con un indice
  // posizionale la schermata saltava passi. stepIndex di App serve solo a
  // ripartire dopo un ricaricamento. Lo stato d'ingresso permette poi a
  // "Indietro" di riaprire un passo da zero, completamente modificabile.
  // { round, id, giocatori, quantita, titolari } (giocatori undefined = appena
  // avanzati, va ancora fotografato con lo stato già aggiornato)
  // dopo un ricaricamento a metà passo si riparte dall'ingresso salvato (se è
  // di questa notte): titolari e stato d'ingresso restano quelli veri, così
  // le azioni che cambiano il ruolo dell'attore (Ladro...) restano modificabili
  const [ingresso, setIngresso] = useState(() =>
    ingressoSalvato?.round === round && ingressoSalvato.giocatori ? ingressoSalvato : null,
  )
  useEffect(() => {
    if (ingresso?.giocatori) salvaIngresso(ingresso)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingresso])
  const idDaIndice = stepsCalcolati[Math.min(stepIndex, stepsCalcolati.length - 1)]?.id
  const idPasso = ingresso?.round === round ? ingresso.id : idDaIndice
  const steps = conPassoCorrente(stepsCalcolati, idPasso)
  const indiceValido = steps.length > 0 ? Math.max(0, steps.findIndex((s) => s.id === idPasso)) : 0
  const idStep = steps[indiceValido]?.id
  // numerazione stabile: `fatti` sono i passi lasciati con Avanti in questa notte
  // (indice contiguo, nessun numero saltato se un ruolo non è in gioco) e il
  // totale si stima UNA volta all'ingresso nella notte (vedi passiAttesi)
  const fatti = ingresso?.round === round ? (ingresso.fatti ?? []) : []

  if (idStep && (ingresso?.round !== round || ingresso.giocatori === undefined)) {
    // fotografia dello stato all'ingresso nel passo (set durante il render: React
    // lo rielabora subito, senza mostrare un frame con l'ingresso mancante).
    // `titolari`: chi c'era all'ingresso, così il passo resta coerente anche
    // se poi un titolare cambia ruolo (vedi giocatoriCoinvolti)
    setIngresso({
      round,
      id: idStep,
      giocatori,
      quantita,
      titolari: filtraCoinvolti(steps[indiceValido], giocatori).map((g) => g.id),
      fatti,
      totale:
        (ingresso?.round === round && ingresso.totale) ||
        passiAttesi(ruoliSelezionati, round, giocatori, quantita, { promemoriaRuoliMorti }).length,
    })
  }

  // pila di passi già lasciati con "Avanti" (ognuno con il suo stato
  // d'ingresso). "Indietro": se nel passo corrente è già stato modificato
  // qualcosa, annulla TUTTE le modifiche del passo e lo riapre da zero; se
  // invece è ancora intatto, torna al passo precedente RIAPRENDOLO da zero
  // (stato d'ingresso ripristinato: così ogni scelta è di nuovo modificabile,
  // senza stati locali o "già utilizzato" rimasti a metà). Non persistito: non
  // deve sopravvivere a un refresh, e si azzera a ogni nuova notte
  const [storico, setStorico] = useState([])
  // incrementato quando si riapre il passo: rimonta le azioni, azzerando il
  // loro stato locale (bersagli scelti, "già usato" catturato al montaggio...)
  const [versione, setVersione] = useState(0)
  const modificato =
    Boolean(ingresso?.giocatori) &&
    ingresso.round === round &&
    (!uguali(ingresso.giocatori, giocatori) || !quantitaUguali(ingresso.quantita, quantita))

  useEffect(() => {
    setStorico([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  // selezioni non ancora confermate per il passo corrente di assegnazione
  // ruolo: si accumulano mentre si spunta chi ha ogni variante di carta, e
  // si applicano tutte insieme solo quando si preme Avanti (mai un commit
  // per singolo click, così "Indietro" le scarta gratis senza toccare i giocatori)
  // (le selezioni pendenti si salvano insieme all'ingresso, vedi sotto: dopo
  // un ricaricamento a metà passo ripartono da lì)
  const pendentiSalvati =
    ingressoSalvato?.round === round && ingressoSalvato.id === idStep ? ingressoSalvato.pendenti : undefined
  // eventi dei morsi (Branco, Chupacabra) da registrare solo con "Avanti":
  // {chiave: [messaggi]}, impostati dalle azioni (vedi impostaEventiAvanti)
  const eventiAvanti = useRef({})
  const impostaEventiAvanti = (chiave, messaggi) => {
    eventiAvanti.current = { ...eventiAvanti.current, [chiave]: messaggi }
  }
  function registraEventiAvanti() {
    Object.values(eventiAvanti.current).flat().forEach((m) => registraEvento(m))
    eventiAvanti.current = {}
  }

  const [selezioniRuolo, setSelezioniRuolo] = useState(pendentiSalvati?.selezioniRuolo ?? {})

  // stesso principio di selezioniRuolo, per il Mimo: "che carta ha davvero
  // il bersaglio" cambia il ruoloSlug del Mimo stesso, che farebbe sparire
  // subito il passo "mimo" dall'elenco (il suo unico ruolo coinvolto non
  // sarebbe più 'mimo'). Restando solo una scelta locale finché non si preme
  // Avanti, la scelta resta modificabile.
  const [mimoRuoloScelto, setMimoRuoloScelto] = useState(pendentiSalvati?.mimoRuoloScelto ?? null)

  // all'ingresso in un nuovo passo (non per un semplice cambio di indice, né
  // al montaggio: lì restano le selezioni ripristinate dopo un ricaricamento)
  const idPassoPrecedente = useRef(idStep)
  useEffect(() => {
    if (idPassoPrecedente.current === idStep) return
    idPassoPrecedente.current = idStep
    setSelezioniRuolo({})
    setMimoRuoloScelto(null)
  }, [idStep])

  useEffect(() => {
    if (!ingresso?.giocatori || ingresso.round !== round || ingresso.id !== idStep) return
    const vuote = !Object.values(selezioniRuolo).some((ids) => ids.length > 0) && !mimoRuoloScelto
    salvaIngresso({ ...ingresso, pendenti: vuote ? undefined : { selezioniRuolo, mimoRuoloScelto } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selezioniRuolo, mimoRuoloScelto])

  // applica i commit pendenti di questo passo tramite `aggiorna` (di norma
  // aggiornaGiocatore, o il tracciatore di passaAllaNotteSuccessiva)
  // Dal passo del Mimo, con Avanti: il Mimo copia la carta del bersaglio (già
  // nota, o quella scelta qui, che va anche al bersaglio). Senza carta non
  // esiste un "Mimo ignoto": diventa Villico, fuori dai passi notturni
  function commitMimoSeSelezionato(lista = giocatori, aggiorna = aggiornaGiocatore) {
    const mimo = step.id === 'mimo' && lista.find((g) => g.ruoloSlug === 'mimo')
    setMimoRuoloScelto(null)
    if (!mimo) return
    const target = lista.find((g) => g.id === mimo.legame?.targetId)
    const slug = target && (target.ruoloSlug ?? mimoRuoloScelto)
    if (!slug) {
      aggiorna(mimo.id, { ruoloSlug: 'villico', storiaRuoli: conRuolo(mimo.storiaRuoli, 'villico'), legame: undefined })
      registraEvento(`Il Mimo ${mimo.nome} non ha scelto la carta da imitare: diventa Villico.`)
      return
    }
    aggiorna(mimo.id, { ruoloSlug: slug, storiaRuoli: conRuolo(mimo.storiaRuoli, slug) })
    if (!target.ruoloSlug) {
      aggiorna(target.id, { ruoloSlug: slug, storiaRuoli: conRuolo(target.storiaRuoli, slug) })
    }
  }

  // il Mimo segue sempre la carta ATTUALE del suo bersaglio: se il narratore
  // gliela cambia (o gliela toglie) dopo il passo del Mimo, cambia anche quella
  // copiata; senza carta il Mimo torna "da scegliere" (vedi vaiAlMimoSeDaScegliere)
  function riallineaMimoDi(targetId, slug, lista, aggiorna) {
    for (const m of lista) {
      const storia = m.storiaRuoli ?? []
      if (m.legame?.tipo !== 'mimo' || m.legame.targetId !== targetId || !storia.includes('mimo')) continue
      if (m.ruoloSlug === (slug ?? 'mimo')) continue
      const fino = storia.slice(0, storia.indexOf('mimo') + 1)
      aggiorna(m.id, { ruoloSlug: slug ?? 'mimo', storiaRuoli: conRuolo(fino, slug) })
    }
  }

  function ripristinaQuantita(da) {
    for (const slug of new Set([...Object.keys(da), ...Object.keys(quantita)])) {
      if (da[slug] !== quantita[slug]) onCambiaQuantita(slug, da[slug] ?? 1)
    }
  }

  // riporta lo stato (giocatori e quantità) a com'era all'ingresso del passo
  // `vecchio` e ne azzera ogni stato locale
  function riapriDa(vecchio) {
    if (vecchio.giocatori !== giocatori) impostaGiocatori(vecchio.giocatori)
    ripristinaQuantita(vecchio.quantita)
    setVersione((v) => v + 1)
    eventiAvanti.current = {}
    setSelezioniRuolo({})
    setMimoRuoloScelto(null)
  }

  function vaiIndietro() {
    // anche solo selezioni pendenti (non ancora scritte sui giocatori) si scartano
    if (modificato || (ingresso?.giocatori && (ciSonoSelezioniDaConfermare || mimoRuoloScelto))) {
      riapriDa(ingresso)
      return
    }
    if (storico.length === 0) return
    const precedente = storico[storico.length - 1]
    setStorico(storico.slice(0, -1))
    setIngresso(precedente)
    riapriDa(precedente)
    annullaLogPasso?.(`${precedente.round ?? round}-${precedente.id}`)
    indietro()
  }

  // lascia il passo corrente (ricordandone l'ingresso) per quello con id `id`
  function vaiAlPasso(id) {
    setStorico((prev) => [...prev, ingresso])
    setIngresso({ round, id, fatti: [...new Set([...fatti, step.id])].filter((x) => x !== id), totale: ingresso?.totale })
    avanti(steps.length)
  }

  if (bloccata) {
    const bardo = giocatori.find((g) => g.notteBloccataFinoA === round && g.ruoloSlug === 'bardo')
    const messaggio = bardo ? 'Questa notte non si svolge per i poteri del Bardo.' : 'Questa notte non si svolge.'

    function vaiAllAlba() {
      registraEvento(bardo ? `${bardo.nome} fa saltare la notte con il suo gesto segreto (Bardo).` : messaggio)
      for (const evento of annunciAlba(giocatori, round)) {
        registraEvento(evento, 'alba')
      }
      onNotteConclusa()
      nuovaNotte()
    }

    // via d'uscita se il gesto era un errore: toglie il blocco e il potere
    // consumato, la notte si svolge normalmente
    function annullaBardo() {
      for (const g of giocatori.filter((x) => x.notteBloccataFinoA === round)) {
        aggiornaGiocatore(g.id, {
          notteBloccataFinoA: undefined,
          poteriUsati: (g.poteriUsati ?? []).filter((p) => p !== 'bardo-salta-notte'),
        })
      }
    }

    return (
      <section className="night-sequencer">
        <p className="night-sequencer__notte">Notte {round}</p>
        <p>{messaggio}</p>
        {bardo && <p className="night-sequencer__tipo">«Indietro» annulla il gesto del Bardo.</p>}
        <div className="night-sequencer__nav">
          <button type="button" onClick={annullaBardo} title="Annulla il gesto del Bardo">
            Indietro
          </button>
          <PulsanteTieni onConferma={vaiAllAlba}>Vai all'alba</PulsanteTieni>
        </div>
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
      const [aggiorna, listaAggiornata] = creaTracciatore()
      autoAssegnaRuoliRimasti(giocatori, aggiorna)
      for (const messaggio of annunciAlba(listaAggiornata(), round)) {
        registraEvento(messaggio, 'alba')
      }
      onNotteConclusa()
      nuovaNotte()
    }

    return (
      <section className="night-sequencer">
        <p className="night-sequencer__notte">Notte {round}</p>
        <p>Nessun ruolo con azione notturna nel mazzo attuale.</p>
        <PulsanteTieni onConferma={vaiAllAlbaSenzaPassi}>Vai all'alba</PulsanteTieni>
      </section>
    )
  }

  const step = steps[indiceValido]

  // vista "come se" le selezioni di ruolo pendenti (non ancora confermate)
  // fossero già assegnate: così, quando un passo richiede sia "chi ha
  // questa carta" sia un'azione con bersaglio, i due picker restano visibili
  // e modificabili insieme invece che il primo sparire per far posto al
  // secondo (vedi conSelezioniRuoloApplicate più sotto e aggiornaGiocatoreConCommit)
  const giocatoriConPendenti = conSelezioniRuoloApplicate(giocatori)
  const ciSonoSelezioniDaConfermare = Object.values(selezioniRuolo).some((ids) => ids.length > 0)
  // i passi DOPO il commit delle selezioni pendenti: assegnare i lupi nel passo
  // "Lupo Mannaro" fa entrare in lista il Branco, che altrimenti (se quel passo
  // è l'ultimo) verrebbe saltato con "È giorno"
  const stepsDopoCommit = ciSonoSelezioniDaConfermare
    ? conPassoCorrente(passiNotte(ruoliSelezionati, round, giocatoriConPendenti, quantita, { promemoriaRuoliMorti }), idPasso)
    : steps
  const indiceDopoCommit = Math.max(0, stepsDopoCommit.findIndex((s) => s.id === step.id))
  const ultimoPasso = indiceDopoCommit === stepsDopoCommit.length - 1

  // di norma i coinvolti sono solo i ruoli di questo passo (step.ruoli); un
  // passo può allargare la vista con ruoliMostraCoinvolti (es. "Lupo
  // Mannaro": qui si assegnano solo i Lupi generici, ma si vede l'intero
  // branco già riconosciuto finora, come nel passo "Branco dei Lupi")
  // più chi era titolare all'ingresso nel passo e ha poi cambiato ruolo (il
  // Ladro che sceglie, l'Addolorata che scambia, il Mimo che copia): resta
  // coinvolto, e la sua azione resta sullo schermo, fino ad "Avanti"
  // vivo/morto dei coinvolti com'era all'ingresso nel passo: l'azione può
  // uccidere l'attore stesso (la Strega su se stessa...) ma la schermata, con
  // titolo, azione e messaggi, resta quella di prima fino ad "Avanti"
  const snapIngresso = ingresso?.id === step.id && ingresso.round === round ? ingresso.giocatori : undefined
  // un passo senza assegnazione di carte (il branco) non allarga i coinvolti
  // con chi lo diventa DURANTE il passo (Mezzosangue morso, lupo trasformato
  // dal Progenitore): quelli compaiono solo con Avanti
  const soloAllIngresso = step.assegnabile === false && snapIngresso && ingresso.titolari
  const coinvoltiCorrenti = new Set(
    filtraCoinvolti(step, giocatoriConPendenti)
      .filter((g) => !soloAllIngresso || ingresso.titolari.includes(g.id))
      .map((g) => g.id),
  )
  // legami e ruolo di Mimo com'erano all'ingresso: ciò che si sceglie in questo
  // passo (🔗, "(Mimo)") si vede dal prossimo risveglio, non prima di Avanti
  const alIngresso = (g) => snapIngresso?.find((x) => x.id === g.id) ?? g
  // anche chi ha ricevuto la carta del passo DOPO l'ingresso (il Ladro assegnato
  // qui e che poi sceglie un'altra carta): non era titolare all'ingresso, ma
  // la sua storiaRuoli ora contiene il ruolo del passo
  const assegnatiNelPasso = snapIngresso && !soloAllIngresso
    ? giocatoriConPendenti
        .filter((g) =>
          step.ruoli?.some(
            (s) =>
              (g.storiaRuoli ?? []).includes(s) &&
              !(snapIngresso.find((x) => x.id === g.id)?.storiaRuoli ?? []).includes(s),
          ),
        )
        .map((g) => g.id)
    : []
  const titolariIngresso =
    step.condizione || ingresso?.id !== step.id ? [] : [...new Set([...(ingresso.titolari ?? []), ...assegnatiNelPasso])]
  const giocatoriCoinvolti = giocatoriConPendenti.filter(
    (g) => coinvoltiCorrenti.has(g.id) || (titolariIngresso.includes(g.id) && g.ruoloSlug),
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
            // una carta tolta dal mazzo (es. scartata dal Ladro) non si
            // assegna a nessuno, nemmeno la prima notte
            (quantita[slug] ?? 1) > 0 &&
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
  // (il Mimo che copia un ruolo a legame lo tiene in `legameMimo`, oltre al suo `legame` di imitazione)
  const legamiPasso = giocatoriCoinvolti.flatMap((g) =>
    [alIngresso(g).legame, alIngresso(g).legameMimo]
      .filter((l) => l && ETICHETTA_LEGAME[l.tipo] && step.ruoli?.includes(l.tipo))
      .map((l) => ({ attore: g, legame: l, bersaglio: giocatori.find((x) => x.id === l.targetId) }))
      .filter((x) => x.bersaglio),
  )

  const azione = AZIONI_NOTTURNE[step.id]
  const vivoAIngresso = (g) => snapIngresso?.find((x) => x.id === g.id)?.vivo ?? g.vivo
  const titolareVivo = giocatoriCoinvolti.some(vivoAIngresso)
  // nomi dei coinvolti: sottotitolo sotto il titolo del passo. Uno solo: il
  // nome (con ☠️ se morto); più giocatori: righe "Vivi:" e "Morti:" (solo
  // quelle non vuote). Il Mimo che imita il ruolo resta riconoscibile
  const nomiCoinvolti = giocatoriCoinvolti.map((g) => g.nome).join(', ')
  const nomeSottotitolo = (g) => (alIngresso(g).legame?.tipo === 'mimo' ? `${g.nome} (Mimo)` : g.nome)
  const viviCoinvolti = giocatoriCoinvolti.filter(vivoAIngresso).map(nomeSottotitolo)
  const mortiCoinvolti = giocatoriCoinvolti.filter((g) => !vivoAIngresso(g)).map(nomeSottotitolo)
  const sottotitoloGiocatori =
    giocatoriCoinvolti.length === 0 ? null : giocatoriCoinvolti.length === 1 ? (
      <p className="night-sequencer__sottotitolo">
        {mortiCoinvolti.length > 0 ? `${mortiCoinvolti[0]} ☠️` : viviCoinvolti[0]}
      </p>
    ) : (
      <p className="night-sequencer__sottotitolo">
        {viviCoinvolti.length > 0 && <span>Vivi: {viviCoinvolti.join(', ')}</span>}
        {mortiCoinvolti.length > 0 && <span>Morti: {mortiCoinvolti.join(', ')}</span>}
      </p>
    )
  // carta tenuta in mano dal narratore (scartata dal Ladro), senza giocatore:
  // il passo compare comunque, per non destare sospetti
  const cartaInMano = giocatoriCoinvolti.length === 0 && step.ruoli?.some((s) => ruoliInMano(giocatori).includes(s))
  // Guaritore e Sciacallo Mannaro agiscono "anche da morti" (vedi
  // puoAgireDaMorto in nightSteps.js): per loro basta che il ruolo sia
  // assegnato a qualcuno, vivo o no
  const qualcunoCoinvolto = step.puoAgireDaMorto ? giocatoriCoinvolti.length > 0 : titolareVivo
  // la Fattucchiera blocca il potere del bersaglio per la notte (vedi
  // Inibito): controllato qui, in un unico punto per tutte le azioni,
  // invece che in ognuna. Solo per i passi a titolare singolo/doppio noto
  // (step.ruoli.length === 1) e per il branco: inibire un lupo del branco non
  // ferma la caccia degli altri, la blocca solo se TUTTI i lupi vivi sono
  // inibiti (di norma l'unico lupo rimasto). Mai sul passo della
  // Fattucchiera stessa: nessun'altra azione applica 'inibito', quindi può
  // comparire sulla sua stessa titolare solo come residuo di un cambio di
  // "chi ha questa carta" (era stata scelta come bersaglio mentre la carta
  // era di qualcun altro) — un vero auto-blocco non esiste, il suo potere
  // non deve mai risultare inibito da lei stessa.
  const eBranco = step.id === 'branco-lupi'
  const titolariBloccabili = eBranco ? giocatoriCoinvolti.filter(vivoAIngresso) : giocatoriCoinvolti
  const attoreInibito =
    step.id !== 'fattucchiera' &&
    (step.ruoli?.length === 1 || eBranco) &&
    titolariBloccabili.length > 0 && titolariBloccabili.every((g) => (g.condizioni ?? []).includes('inibito'))
  const mostraAzione = step.tipo === 'azione' && azione && qualcunoCoinvolto && !attoreInibito
  // azioni a scelta (azione.perAttore): titolare e Mimo che lo copia hanno lo
  // stesso ruoloSlug ma ognuno compie la PROPRIA scelta, indipendente (la
  // Fattucchiera blocca solo chi ha inibito, mai gli altri titolari)
  const attoriAzione = azione?.perAttore
    ? giocatoriConPendenti.filter(
        (g) =>
          g.ruoloSlug === azione.props.ruoloSlugAttore &&
          vivoAIngresso(g) &&
          (step.id === 'fattucchiera' || !(g.condizioni ?? []).includes('inibito')),
      )
    : []
  const renderAzione = (attoreId) => (
    <azione.Componente
      giocatori={giocatoriConPendenti}
      aggiornaGiocatore={aggiornaGiocatoreConCommit}
      impostaGiocatori={impostaGiocatoriConCommit}
      annullaMorte={annullaMorte}
      round={round}
      ruoliSelezionati={ruoliSelezionati}
      quantita={quantita}
      onCambiaQuantita={onCambiaQuantita}
      varianteMedium={varianteMedium}
      ereditaScelte={addolorataEreditaScelte}
      vivoAIngresso={vivoAIngresso}
      giocatoriIngresso={snapIngresso}
      mimoRuoloScelto={mimoRuoloScelto}
      onScegliRuoloMimo={setMimoRuoloScelto}
      impostaEventiAvanti={impostaEventiAvanti}
      {...(attoreId ? { attoreId } : {})}
      {...azione.props}
    />
  )

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
  const personeDisponibili = giocatori.filter((g) => (g.vivo || mortoStanotte(g, round)) && !g.ruoloSlug).length
  // non blocca "Avanti" se non ci sono abbastanza giocatori per completare
  // l'assegnazione: meglio lasciare un ruolo scoperto che bloccare la partita
  // col Ladro la carta Mimo può essere tra le due carte in più: il passo si
  // può lasciare senza assegnarla (sarà il Ladro a sceglierla, o nessuno)
  // scelta obbligatoria in sospeso (parità del Berserker, scritta sul giocatore:
  // sopravvive al ricaricamento): niente Avanti finché non si decide
  const sceltaObbligatoria = giocatori.some((g) => g.attesaLupoBerserker)
  const assegnazioneIncompleta =
    ruoliPendenti.length > 0 &&
    selezionatiPendenti < capacitaPendente &&
    personeDisponibili >= capacitaPendente &&
    !(step.id === 'mimo' && ruoliSelezionati.includes('ladro'))

  // applica le selezioni pendenti a una copia locale di giocatori, così la
  // logica successiva (pulizia condizioni, legami, annunci alba) vede già i
  // ruoli appena assegnati anche se lo stato reale si aggiorna in modo
  // asincrono tramite aggiornaGiocatore
  function conSelezioniRuoloApplicate(lista) {
    let risultato = lista
    for (const [slug, ids] of Object.entries(selezioniRuolo)) {
      for (const id of ids) {
        risultato = risultato.map((g) =>
          g.id === id ? { ...g, ruoloSlug: slug, storiaRuoli: conRuolo(g.storiaRuoli, slug) } : g,
        )
      }
    }
    return risultato
  }

  function commitSelezioniRuolo(giocatoriConRuoli, aggiorna = aggiornaGiocatore) {
    for (const [slug, ids] of Object.entries(selezioniRuolo)) {
      for (const id of ids) {
        const storiaRuoli = giocatoriConRuoli.find((g) => g.id === id)?.storiaRuoli ?? []
        aggiorna(id, { ruoloSlug: slug, storiaRuoli })
        riallineaMimoDi(id, slug, giocatoriConRuoli, aggiorna)
      }
    }
    // "le tre guardie" si scelgono come gruppo unico (vedi AssegnaRuolo):
    // appena il gruppo è completo, ne sceglie una a caso come traditrice,
    // senza mai chiederlo al narratore
    assegnaGuardiaMannaraCasuale(giocatoriConRuoli, aggiorna, quantita)
  }

  // annulla per davvero un'assegnazione già confermata di questo stesso
  // passo (il narratore ha sbagliato/ripensato chi ha la carta, prima di
  // premere "Avanti"): tolto anche da storiaRuoli, altrimenti il ruolo
  // resterebbe per sempre "già assegnato" (contaAssegnati non lo riconta
  // mai) e non sarebbe più possibile darlo a qualcun altro
  function rimuoviAssegnazione(giocatoreId, ruoloSlug) {
    const g = giocatori.find((x) => x.id === giocatoreId)
    if (!g) return
    // con lo snapshot d'ingresso del passo si disfa in un colpo tutto ciò che
    // l'azione del ruolo ha scritto da allora (poteriUsati, usiNotte,
    // ultimaIndagine, condizioni, legami, morti, quantità scartate): niente
    // residui su chi perde la carta, e chi la riceve non eredita un potere già
    // consumato. Restano gli altri titolari assegnati in questo passo (solo
    // i titolari d'ingresso, es. un Mimo che imita, tornano com'erano).
    if (ingresso?.id === step.id && ingresso.giocatori) {
      let quantitaDaRipristinare = ingresso.quantita
      for (const x of giocatori) {
        const snap = ingresso.giocatori.find((y) => y.id === x.id)
        if (!snap) continue
        let finale
        if (x.id === giocatoreId) {
          const storia = (snap.storiaRuoli ?? []).filter((s) => s !== ruoloSlug && !step.ruoli?.includes(s))
          // il Ladro che si era preso proprio questa carta (es. il Mimo) non resta
          // senza ruolo: torna Ladro, deve scegliere di nuovo e la carta che aveva
          // scartato rientra nel mazzo (il Mimo che lo imitava segue da riallineaMimoDi)
          const eraLadroCheHaScelto = storia.at(-1) === 'ladro' && (snap.poteriUsati ?? []).includes('ladro-scelta')
          finale = eraLadroCheHaScelto
            ? { ...snap, ruoloSlug: 'ladro', storiaRuoli: storia, poteriUsati: snap.poteriUsati.filter((p) => p !== 'ladro-scelta') }
            : { ...snap, ruoloSlug: undefined, storiaRuoli: storia }
          if (eraLadroCheHaScelto) {
            const rientrate = (snap.scartoLadro ?? []).filter((c) => c !== ruoloSlug)
            quantitaDaRipristinare = { ...quantitaDaRipristinare }
            for (const c of rientrate) quantitaDaRipristinare[c] = (quantitaDaRipristinare[c] ?? 0) + 1
          }
        } else {
          finale = (ingresso.titolari ?? []).includes(x.id) ? snap : { ...snap, ruoloSlug: x.ruoloSlug, storiaRuoli: x.storiaRuoli }
        }
        // i campi comparsi dopo l'ingresso (legame, ultimaIndagine...) vanno
        // esplicitamente a undefined: aggiornaGiocatore unisce, non sostituisce
        const azzera = Object.fromEntries(Object.keys(x).map((k) => [k, undefined]))
        aggiornaGiocatore(x.id, { ...azzera, ...finale })
      }
      ripristinaQuantita(quantitaDaRipristinare)
      riallineaMimoDi(giocatoreId, undefined, giocatori, aggiornaGiocatore)
      return
    }
    riallineaMimoDi(giocatoreId, undefined, giocatori, aggiornaGiocatore)
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

  // come aggiornaGiocatoreConCommit, per chi reimposta l'intera lista (le
  // azioni la ricevono già con le selezioni pendenti applicate: vanno
  // confermate e azzerate, altrimenti verrebbero riapplicate due volte)
  function impostaGiocatoriConCommit(nuovi) {
    impostaGiocatori(nuovi)
    if (ciSonoSelezioniDaConfermare) {
      commitSelezioniRuolo(conSelezioniRuoloApplicate(giocatori))
      setSelezioniRuolo({})
    }
  }

  // "giocatori" resta lo snapshot di questo render: le aggiornaGiocatore
  // lanciate dentro lo stesso click (setState funzionale) non si riflettono in
  // modo sincrono. Il tracciatore le applica anche a una copia locale, così
  // ciò che viene dopo (Villici automatici, Cortigiana, annunci dell'alba)
  // lavora sullo stato davvero aggiornato e non su quello vecchio
  function creaTracciatore() {
    let corrente = giocatori
    const aggiorna = (id, patch) => {
      aggiornaGiocatore(id, patch)
      corrente = corrente.map((g) => (g.id === id ? { ...g, ...patch } : g))
    }
    return [aggiorna, () => corrente]
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
  function autoAssegnaRuoliRimasti(lista, aggiorna) {
    // l'Apprendista che ha preso la carta ignota del maestro non è un Villico "in più"
    const senzaRuolo = lista.filter((g) => !g.ruoloSlug && !g.apprendistaRivelatoDa)
    if (senzaRuolo.length === 0) return

    const ruoliNonVillicoPendenti = ruoliSelezionati.filter(
      (slug) => slug !== 'villico' && ruoliAssegnabili([slug], lista, quantita).length > 0,
    )

    let ruoloDaAssegnare = 'villico'
    if (ruoliNonVillicoPendenti.length === 1) {
      const [slug] = ruoliNonVillicoPendenti
      const capacitaResidua = (quantita[slug] ?? 1) - contaAssegnati(lista, slug)
      if (capacitaResidua !== senzaRuolo.length) return
      ruoloDaAssegnare = slug
    } else if (ruoliNonVillicoPendenti.length > 1) {
      return
    }

    senzaRuolo.forEach((g) => {
      aggiorna(g.id, { ruoloSlug: ruoloDaAssegnare, storiaRuoli: conRuolo(g.storiaRuoli, ruoloDaAssegnare) })
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

  // il Ladro può aver scelto la carta Mimo (o il bersaglio del Mimo aver perso
  // la carta): chi è Mimo senza carta torna al passo del Mimo, già superato
  function vaiAlMimoSeDaScegliere() {
    if (round !== 1 || step.id === 'mimo' || !giocatori.some((g) => g.ruoloSlug === 'mimo')) return false
    vaiAlPasso('mimo')
    return true
  }

  function vaiAvanti() {
    if (assegnazioneIncompleta || sceltaObbligatoria) return
    confermaLog?.(`${round}-${idStep}`)
    if (!ciSonoSelezioniDaConfermare && vaiAlMimoSeDaScegliere()) return
    if (ciSonoSelezioniDaConfermare) {
      confermaSelezioniRestandoSulPasso()
      // il Mimo appena assegnato con la chip, senza carta da imitare, diventa
      // Villico adesso (dopo la conferma: altrimenti la conferma lo rimette Mimo)
      commitMimoSeSelezionato(giocatoriConPendenti)
      // resta sul passo solo se ha un'azione da poter usare subito (es.
      // Veggente appena assegnato): un passo "informativo" (solo
      // riconoscimento, es. il branco) non ha nulla da fare qui, quindi
      // andrebbe avanti da solo invece di mostrare "Nessuna azione
      // richiesta" e richiedere un secondo click su Avanti
      if (step.tipo === 'azione' && !mostraAzione && !attoreInibito) return
    } else {
      commitMimoSeSelezionato()
    }
    registraEventiAvanti()
    vaiAlPasso(stepsDopoCommit[indiceDopoCommit + 1].id)
  }

  function passaAllaNotteSuccessiva() {
    if (assegnazioneIncompleta || sceltaObbligatoria) return
    confermaLog?.(`${round}-${idStep}`)
    if (!ciSonoSelezioniDaConfermare && vaiAlMimoSeDaScegliere()) return
    const [aggiorna, listaAggiornata] = creaTracciatore()
    if (ciSonoSelezioniDaConfermare) {
      commitSelezioniRuolo(conSelezioniRuoloApplicate(listaAggiornata()), aggiorna)
      setSelezioniRuolo({})
      commitMimoSeSelezionato(listaAggiornata(), aggiorna)
      // un passo con un'azione resta sul passo: l'azione si può usare subito
      if (step.tipo === 'azione' && !mostraAzione && !attoreInibito) return
    } else {
      commitMimoSeSelezionato(giocatori, aggiorna)
    }
    registraEventiAvanti()
    autoAssegnaRuoliRimasti(listaAggiornata(), aggiorna)

    // risolviLegami (Apprendista/Cavaliere/Figlia dei Lupi) è ora applicata
    // in modo generico da usePartita a ogni morte, notte o rogo che sia:
    // qui resta solo risolviCortigiana, che dipende specificamente
    // dall'esito della caccia di QUESTA notte. Va prima della pulizia delle
    // condizioni: serve ancora sapere se il cliente era protetto.
    const patchRisoluzione = risolviCortigiana(listaAggiornata(), round)
    for (const [id, patch] of Object.entries(patchRisoluzione)) {
      aggiorna(id, patch)
    }

    listaAggiornata().forEach((g) => {
      const condizioniRipulite = g.condizioni.filter((c) => c !== 'protetto' && c !== 'inibito')
      const cambiaCondizioni = condizioniRipulite.length !== g.condizioni.length
      const cambiaUsi = (g.usiNotte ?? []).length > 0
      if (cambiaCondizioni || cambiaUsi || g.sceltaNotte) {
        aggiorna(g.id, {
          ...(cambiaCondizioni ? { condizioni: condizioniRipulite } : {}),
          ...(cambiaUsi ? { usiNotte: [] } : {}),
          ...(g.sceltaNotte ? { sceltaNotte: undefined } : {}),
        })
      }
    })

    for (const messaggio of annunciAlba(listaAggiornata(), round)) {
      registraEvento(messaggio, 'alba')
    }

    onNotteConclusa()
    nuovaNotte()
  }

  // via di fuga per "ho dimenticato un giocatore": ha senso solo prima che
  // sia successo qualunque cosa questa partita (altrimenti si rischia di
  // rimuovere qualcuno con già un ruolo/condizioni assegnati a metà notte).
  // `fatti` (passi lasciati con Avanti) è persistito: un ricaricamento non lo fa riapparire
  const puoTornareAiGiocatori =
    onTornaAiGiocatori && round === 1 && indiceValido === 0 && fatti.length === 0 && !modificato

  // il totale stimato all'ingresso può essere in eccesso (es. il Pifferaio non ha ipnotizzato
  // nessuno: niente passo "ipnotizzati"): sull'ultimo passo reale coincide con quello corrente
  const totalePassi =
    ultimoPasso && !assegnazioneIncompleta
      ? fatti.length + 1
      : Math.max(ingresso?.totale ?? 0, fatti.length + stepsDopoCommit.length - indiceDopoCommit)
  const indietroDisabilitato = storico.length === 0 && !modificato && !ciSonoSelezioniDaConfermare && !mimoRuoloScelto
  // il motivo si mostra a schermo (un tooltip non si vede sul touch)
  const motivoIndietro =
    fatti.length > 0 || indiceValido > 0
      ? ''
      : round > 1
        ? ''
        : 'Nulla da annullare in questo passo.'

  return (
    <section className="night-sequencer">
      {puoTornareAiGiocatori && (
        <button type="button" className="app__torna-indietro" onClick={onTornaAiGiocatori}>
          ← Torna ai giocatori
        </button>
      )}
      <p className="night-sequencer__notte">Notte {round}</p>
      <p className="night-sequencer__passo">
        Passo {fatti.length + 1} di {totalePassi}
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
      <div key={`${round}-${step.id}-${versione}`} className="night-sequencer__contenuto">
      <h2 className="night-sequencer__ruolo" aria-live="polite" aria-atomic="true">
        {/* un solo ruolo possibile → la sua faccia; più ruoli raggruppati
            nello stesso passo (es. "assegna i ruoli rimanenti") → punto
            interrogativo, mostrare una faccia a caso tra tante sarebbe fuorviante */}
        <RuoloIcona slug={step.ruoli?.length === 1 ? step.ruoli[0] : step.iconaSlug} size={32} />
        <span>{step.titolo}</span>
      </h2>
      {sottotitoloGiocatori}
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
        giocatori={giocatoriConPendenti}
        giocatoriCoinvolti={giocatoriCoinvolti.filter(
          (g) => vivoAIngresso(g) && !ruoliAssegnabiliStepSingoli.includes(g.ruoloSlug),
        )}
        voci={PASSI_CON_FIGURE_ATTESE.includes(step.id) ? vociAttese(step, ruoliSelezionati, quantita, giocatoriConPendenti) : undefined}
        inTempoReale={Boolean(step.condizione)}
      />
      {/* "Possibile azione" (quando il passo prevedeva potenzialmente
          un'azione ma non c'era nessun titolare in attesa di selezione) è
          stata rimossa: creava confusione lasciando intendere ci fosse
          qualcosa da fare in app, quando in realtà l'azione fisica del
          ruolo (se c'è) resta interamente in mano al narratore */}
      {ruoliAssegnabiliStep.length === 0 && step.tipo === 'informativo' && (
        <p className="night-sequencer__tipo">Nessuna azione richiesta</p>
      )}

      {legamiPasso.map(({ attore, legame, bersaglio }) => (
        <p key={attore.id + legame.tipo} className="night-sequencer__legame">
          🔗 {legamiPasso.length > 1 && `${attore.nome}: `}
          {ETICHETTA_LEGAME[legame.tipo](bersaglio.nome)}.
        </p>
      ))}

      {ruoliAssegnabiliStep.length > 0 && (
        <AssegnaRuolo
          key={step.id}
          ruoli={ruoliAssegnabiliStep}
          giocatori={giocatori}
          quantita={quantita}
          selezioni={selezioniRuolo}
          onCambiaSelezioni={setSelezioniRuolo}
          onRimuovi={rimuoviAssegnazione}
          titolariIngresso={titolariIngresso}
          vivoAIngresso={vivoAIngresso}
          round={round}
          illustrazioneSeparata={!step.ruoliMostraCoinvolti && !PASSI_CON_FIGURE_ATTESE.includes(step.id)}
          {...(domandaAssegnaRuolo ? { domanda: domandaAssegnaRuolo } : {})}
        />
      )}

      {ruoliAssegnabiliStep.length === 0 && giocatoriCoinvolti.length === 0 && (
        <p className={cartaInMano ? 'night-sequencer__promemoria-morto' : undefined}>
          {cartaInMano
            ? 'Carta non assegnata a nessun giocatore: chiama comunque il ruolo.'
            : 'Nessun giocatore assegnato a questo ruolo per ora.'}
        </p>
      )}

      {attoreInibito && (
        <p className="night-sequencer__inibito">
          🚫 {eBranco
            ? 'Tutti i lupi vivi sono inibiti dalla Fattucchiera: il branco non può sbranare questa notte.'
            : 'Il potere è inibito questa notte dalla Fattucchiera: nessuna azione disponibile.'}
        </p>
      )}

      {mostraPromemoriaMorto && (
        <p className="night-sequencer__promemoria-morto">
          ☠️ Chiama comunque {nomiCoinvolti}{' '}
          {giocatoriCoinvolti.length > 1 ? 'per il loro turno, anche se morti' : 'per il suo turno, anche se morto/a'}.
        </p>
      )}

      {mostraAzione && (
        <>
          {step.puoAgireDaMorto && !titolareVivo && (
            <p className="night-sequencer__promemoria-morto">
              ☠️ {nomiCoinvolti}{' '}
              {giocatoriCoinvolti.length > 1 ? 'sono morti, ma agiscono comunque' : 'è morto/a, ma agisce comunque'}.
            </p>
          )}
          {attoriAzione.length > 1 ? (
            attoriAzione.map((attore) => (
              <div key={attore.id} role="group" aria-label={`Scelta di ${attore.nome}`} className="night-sequencer__attore">
                <p>
                  <strong>{attore.nome}</strong>
                  {attore.legame?.tipo === 'mimo' && ' (Mimo)'}
                </p>
                {renderAzione(attore.id)}
              </div>
            ))
          ) : (
            renderAzione(attoriAzione[0]?.id)
          )}
        </>
      )}

      {assegnazioneIncompleta && (
        <p className="avviso">
          ⚠️ Seleziona ancora {capacitaPendente - selezionatiPendenti}{' '}
          {capacitaPendente - selezionatiPendenti === 1 ? 'giocatore' : 'giocatori'} prima di continuare.
        </p>
      )}
      {sceltaObbligatoria && (
        <p className="avviso">⚠️ Scegli quale lupo muore lottando con il Berserker prima di continuare.</p>
      )}
      </div>

      <div className="night-sequencer__nav">
        <button type="button" onClick={vaiIndietro} disabled={indietroDisabilitato}>
          Indietro
        </button>
        {/* con l'assegnazione ancora incompleta non si sa se i ruoli che si
            stanno assegnando faranno comparire altri passi (il Branco): niente "È giorno" */}
        {ultimoPasso && !assegnazioneIncompleta ? (
          <PulsanteTieni onConferma={passaAllaNotteSuccessiva} disabled={assegnazioneIncompleta || sceltaObbligatoria}>
            È giorno nel villaggio
          </PulsanteTieni>
        ) : (
          <button type="button" onClick={vaiAvanti} disabled={assegnazioneIncompleta || sceltaObbligatoria}>
            Avanti
          </button>
        )}
      </div>
      {indietroDisabilitato && motivoIndietro && <p className="night-sequencer__tipo">Indietro non disponibile: {motivoIndietro}</p>}
    </section>
  )
}

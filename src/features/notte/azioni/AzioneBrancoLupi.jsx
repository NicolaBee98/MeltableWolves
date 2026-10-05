import { useEffect, useState } from 'react'
import { risolviAttaccoBranco, berserkerLupiCandidati, avvisiColpo, RUOLI_NON_SELEZIONABILI_DAL_BRANCO } from '../../../data/effettiNotte'
import { annullaColpo, eColpoLetale } from './annullaColpo'
import { conRuolo, eMimoCopiante } from '../../../data/assegnazione'

const POTERE = 'branco-lupi-sbrana'
const POTERE_TRASFORMA = 'progenitore-trasforma'

// quante volte il branco ha già sbranato questa notte (0, o 1/2 con la
// vendetta del Cucciolo): si prende il massimo tra tutti i membri invece del
// primo trovato, per non dipendere dal fatto che segnaUsoBranco li tenga
// sempre tutti sincronizzati allo stesso conteggio
function usiStanotte(giocatori, ruoli) {
  const conteggi = giocatori
    .filter((g) => ruoli.includes(g.ruoloSlug))
    .map((g) => (g.usiNotte ?? []).filter((u) => u === POTERE).length)
  return conteggi.length > 0 ? Math.max(...conteggi) : 0
}

// toglie `n` occorrenze (le ultime) del potere dagli usi della notte
function senzaUltimiUsi(usi, n) {
  const copia = [...usi]
  for (let i = 0; i < n; i++) {
    const idx = copia.lastIndexOf(POTERE)
    if (idx >= 0) copia.splice(idx, 1)
  }
  return copia
}

// Dopo un ricaricamento a metà passo lo stato locale dei colpi è perso: si
// ricostruisce dai giocatori confrontati con lo snapshot d'ingresso nel passo
// (chi è morto per il morso, chi è diventato lupo, il Progenitore che ha usato il
// potere). Gli effetti collaterali (Berserker, crepacuore...) si attribuiscono al
// colpo del Berserker, o al primo. Come annullaMorte senza snapshot, disfare un
// colpo ricostruito ripristina i campi toccati senza la catena in memoria.
const CAMPI_NON_DEL_COLPO = ['usiNotte', 'vendettaCucciolo', 'attesaLupoBerserker']
function colpiDaStato(ingresso, giocatori, ruoli) {
  if (!ingresso || usiStanotte(giocatori, ruoli) === 0) return []
  const modifiche = giocatori.flatMap((g) => {
    const prima = ingresso.find((x) => x.id === g.id)
    if (!prima) return []
    const campi = [...new Set([...Object.keys(prima), ...Object.keys(g)])].filter(
      (k) => !CAMPI_NON_DEL_COLPO.includes(k) && JSON.stringify(prima[k]) !== JSON.stringify(g[k]),
    )
    if (campi.length === 0) return []
    return [{ id: g.id, prima, ora: g, campi }]
  })
  const eMorso = (m) =>
    (m.prima.vivo && !m.ora.vivo && m.ora.mortoDa === 'branco') ||
    (m.ora.anticoSbranatoNotte !== undefined && m.prima.anticoSbranatoNotte === undefined) ||
    (m.campi.includes('ruoloSlug') && m.ora.ruoloSlug === 'lupo-mannaro')
  const bersagli = modifiche.filter(eMorso)
  if (bersagli.length === 0) return []
  const trasforma = (m) =>
    m.campi.includes('ruoloSlug') &&
    modifiche.some((x) => !(x.prima.poteriUsati ?? []).includes(POTERE_TRASFORMA) && (x.ora.poteriUsati ?? []).includes(POTERE_TRASFORMA))
  const colpi = bersagli.slice(0, 2).map((m, i) => ({
    targetId: m.id,
    tipo: trasforma(m) ? 'trasforma' : 'sbrana',
    originali: {},
    letali: [],
    consumaVendetta: i >= 1,
    avvisi: [],
    patches: {},
  }))
  const colpoDi = (m) =>
    colpi.find((c) => c.targetId === m.id) ?? colpi.find((c) => c.targetId === bersagli.find((b) => b.prima.ruoloSlug === 'berserker')?.id) ?? colpi[0]
  for (const m of modifiche) {
    const colpo = m.campi.includes('poteriUsati') && !colpi.some((c) => c.targetId === m.id) ? (colpi.find((c) => c.tipo === 'trasforma') ?? colpoDi(m)) : colpoDi(m)
    const patch = Object.fromEntries(m.campi.map((k) => [k, m.ora[k]]))
    colpo.originali[m.id] = Object.fromEntries(m.campi.map((k) => [k, m.prima[k]]))
    colpo.patches[m.id] = patch
    if (patch.vivo === false || patch.anticoSbranatoNotte !== undefined) colpo.letali.push(m.id)
  }
  for (const c of colpi) {
    c.avvisi = c.tipo === 'trasforma' ? avvisoTrasforma(ingresso, c.targetId, chiTrasforma(ingresso)) : avvisiColpo(ingresso, c.targetId, c.patches, 'branco')
  }
  return colpi
}

// Il Progenitore e il Mimo che lo copia hanno un potere di trasformazione CIASCUNO
// (uso separato, `progenitore-trasforma` sul proprio giocatore): trasforma chi non
// l'ha ancora usato, il Progenitore vero prima del Mimo
function chiTrasforma(lista) {
  return lista
    .filter((g) => g.ruoloSlug === 'lupo-mannaro-progenitore' && g.vivo && !(g.poteriUsati ?? []).includes(POTERE_TRASFORMA))
    .sort((a, b) => eMimoCopiante(a) - eMimoCopiante(b))[0]
}

// solo per il registro (nessun testo a schermo: lo dice già "verrà trasformato")
function avvisoTrasforma(lista, targetId, attore) {
  const nome = lista.find((g) => g.id === targetId)?.nome
  if (!attore || !nome) return []
  const chi = eMimoCopiante(attore) ? `${attore.nome} (Mimo del Progenitore)` : `Il Progenitore ${attore.nome}`
  return [{ log: `${chi} trasforma ${nome} in Lupo Mannaro.` }]
}

export function AzioneBrancoLupi({ giocatori, giocatoriIngresso, aggiornaGiocatore, annullaMorte, round, ruoli = [], vivoAIngresso = (g) => g.vivo, impostaEventiAvanti }) {
  // parità del Berserker in attesa della scelta del narratore: scritta sul
  // Berserker (attesaLupoBerserker: {indice}) invece che in uno stato locale, così
  // sopravvive a un ricaricamento e NightSequencer può bloccare Avanti finché
  // non si sceglie
  const inParita = giocatori.find((g) => g.attesaLupoBerserker)
  const attesaLupo = inParita ? { targetId: inParita.id, indice: inParita.attesaLupoBerserker.indice ?? undefined } : null
  const setAttesaLupo = (valore) => {
    if (inParita) aggiornaGiocatore(inParita.id, { attesaLupoBerserker: undefined })
    if (valore) aggiornaGiocatore(valore.targetId, { attesaLupoBerserker: { indice: valore.indice ?? null } })
  }
  const bersaglioInAttesaDiLupo = attesaLupo?.targetId
  // i colpi di questa notte (uno solo, o due con la vendetta del Cucciolo),
  // in ordine: restano TUTTI modificabili finché non si preme "Avanti".
  // Ognuno registra ESATTAMENTE i campi toccati, sul valore che avevano PRIMA,
  // così si può deselezionare (click sulla chip premuta) o cambiare
  // bersaglio disfacendolo del tutto (morte con la sua catena inclusa). Le
  // chip restano sempre tutte visibili e cliccabili: il Progenitore è un
  // pulsante unico sotto di loro che agisce sull'ultimo bersaglio scelto.
  // { targetId, tipo: 'sbrana'|'trasforma', originali, letali, consumaVendetta }
  const [colpi, setColpi] = useState(() => colpiDaStato(giocatoriIngresso, giocatori, ruoli))
  // stato com'era all'ingresso nel passo (dopo un refresh `giocatori` ha già i morsi)
  const iniziali = giocatoriIngresso ?? giocatori
  // feedback sull'ultimo morso: perché non ha avuto effetto, o cosa comporta
  const [esito, setEsito] = useState(null)
  // effetti speciali dei morsi (Berserker, Mezzosangue, Cavaliere, Cortigiana...):
  // spiegati qui sotto, nel registro solo con "Avanti" (vedi impostaEventiAvanti)
  const avvisiMorsi = colpi.flatMap((c) => c.avvisi ?? [])
  const logMorsi = avvisiMorsi.map((a) => a.log).join('\n')
  useEffect(() => {
    impostaEventiAvanti?.('branco', logMorsi ? logMorsi.split('\n') : [])
    return () => impostaEventiAvanti?.('branco', [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logMorsi])
  // vendetta già attiva prima di cominciare (Cucciolo morto in precedenza):
  // se invece l'ha fatta scattare il primo colpo, disfarlo la disattiva
  const [vendettaIniziale] = useState(() => iniziali.some((g) => ruoli.includes(g.ruoloSlug) && g.vendettaCucciolo))
  // il bersaglio appena sbranato resta in lista (anche se non più vivo),
  // altrimenti la sua chip sparirebbe subito dopo il click invece di
  // restare visibile e cliccabile (vedi AzioneChupacabra)
  const vivi = giocatori.filter(
    (g) => (vivoAIngresso(g) || colpi.some((c) => c.targetId === g.id)) && !RUOLI_NON_SELEZIONABILI_DAL_BRANCO.includes(g.ruoloSlug),
  )
  const storditi = giocatori.some(
    (g) => ruoli.includes(g.ruoloSlug) && g.brancoStorditoFinoA !== undefined && g.brancoStorditoFinoA === round,
  )
  // il flag viene consumato dalla seconda vittima: la vendetta resta attiva
  // finché quel colpo c'è (così si può ancora cambiarlo)
  const vendettaAttiva =
    giocatori.some((g) => ruoli.includes(g.ruoloSlug) && g.vendettaCucciolo) || colpi.some((c) => c.consumaVendetta)
  const limite = vendettaAttiva ? 2 : 1
  const usi = usiStanotte(giocatori, ruoli)
  // snapshot all'ingresso nel passo: usarla dal vivo farebbe sparire il
  // pulsante di trasformazione nello stesso istante in cui lo si preme
  // (il potere risulterebbe "già usato" a trasformazione appena applicata),
  // impedendo di tornare indietro con "Sbrana normalmente" prima di Avanti.
  // Chi trasforma è il titolare (Progenitore o Mimo) che non ha ancora usato il suo potere.
  const [progenitoreId] = useState(() => chiTrasforma(iniziali)?.id)
  const progenitore = giocatori.find((g) => g.id === progenitoreId)
  const progenitorePuoTrasformare = Boolean(progenitoreId)

  if (storditi) {
    return <p>Il branco è ancora stordito dall'alcol dell'Ubriaco: questa notte non può cacciare.</p>
  }

  // senza traccia di colpi (es. già dati prima che questo passo esistesse)
  // non c'è nulla da annullare: il branco ha già sbranato
  if (usi >= limite && colpi.length === 0) {
    return <p>Il branco ha già sbranato {usi >= 2 ? 'le sue vittime' : 'una vittima'} questa notte.</p>
  }

  function segnaUsoBranco(consumaVendetta) {
    giocatori
      .filter((g) => ruoli.includes(g.ruoloSlug))
      .forEach((g) => {
        aggiornaGiocatore(g.id, {
          usiNotte: [...(g.usiNotte ?? []), POTERE],
          ...(consumaVendetta ? { vendettaCucciolo: false } : {}),
        })
      })
  }

  // Lupo Mannaro Progenitore: una sola volta per partita, invece di sbranare
  // la vittima scelta dal branco può trasformarla in Lupo Mannaro (pag. 15).
  // `lista`: i giocatori senza gli effetti del colpo che si sta sostituendo (vedi baseDi)
  function patchTrasforma(targetId, lista) {
    const target = lista.find((g) => g.id === targetId)
    const prog = lista.find((g) => g.id === progenitore?.id)
    if (!target || !prog) return {}
    return {
      [target.id]: { ruoloSlug: 'lupo-mannaro', storiaRuoli: conRuolo(target.storiaRuoli, 'lupo-mannaro') },
      [prog.id]: { poteriUsati: [...(prog.poteriUsati ?? []), POTERE_TRASFORMA] },
    }
  }

  function calcolaPatch(tipo, targetId, berserkerLupoSceltoId, lista) {
    return tipo === 'trasforma'
      ? patchTrasforma(targetId, lista)
      : risolviAttaccoBranco(lista, targetId, round, ruoli, berserkerLupoSceltoId)
  }

  // i giocatori com'erano PRIMA del colpo `indice` (ruolo originale compreso):
  // trasformare e sbranare sono alternative, quindi passando dall'una all'altra
  // il bersaglio va valutato per quello che era, non per quello che è diventato
  function baseDi(indice) {
    const colpo = colpi[indice]
    if (!colpo) return giocatori
    return giocatori.map((g) => (colpo.originali[g.id] ? { ...g, ...colpo.originali[g.id] } : g))
  }
  // disfa gli effetti di un colpo (non gli usi): le morti con annullaMorte
  // (catena inclusa), gli altri campi ripristinando i valori di prima
  function disfaEffetti(colpo) {
    for (const [id, originali] of Object.entries(colpo.originali)) {
      if (colpo.letali.includes(id)) annullaColpo(id, aggiornaGiocatore, annullaMorte)
      else aggiornaGiocatore(id, originali)
    }
    if (colpo.consumaVendetta) {
      giocatori.filter((g) => ruoli.includes(g.ruoloSlug)).forEach((g) => aggiornaGiocatore(g.id, { vendettaCucciolo: true }))
    }
  }

  function descriviEsito(targetId, patches, lista) {
    const target = lista.find((g) => g.id === targetId)
    if (!target) return null
    if (Object.keys(patches).length === 0) {
      const motivo =
        target.ruoloSlug === 'criceto-malvagio' || target.ruoloSlug === 'nano'
          ? `${target.ruoloSlug === 'nano' ? 'il Nano' : 'il Criceto Malvagio'} non può essere sbranato`
          : target.condizioni.includes('protetto')
            ? 'è protetto/a'
            : 'non è sbranabile'
      return `Il morso non ha effetto su ${target.nome}: ${motivo}.`
    }
    return null
  }

  // deselezione: toglie il colpo i. Se la vendetta l'aveva fatta scattare il
  // primo colpo (Cucciolo sbranato), disfarlo la disattiva e porta via anche
  // le vittime successive, che senza vendetta non ci sarebbero
  function deseleziona(i) {
    const tolti = !vendettaIniziale && i === 0 ? colpi : [colpi[i]]
    ;[...tolti].reverse().forEach(disfaEffetti)
    const n = tolti.length
    giocatori
      .filter((g) => ruoli.includes(g.ruoloSlug))
      .forEach((g) => aggiornaGiocatore(g.id, { usiNotte: senzaUltimiUsi(g.usiNotte ?? [], n) }))
    setColpi(colpi.filter((c) => !tolti.includes(c)))
    setEsito(null)
  }

  // `sostituisce`: rimpiazza un colpo invece di aggiungerne uno (il conteggio
  // degli usi non cambia): `true` = l'ultimo, o l'indice del colpo da sostituire
  function applica(tipo, targetId, berserkerLupoSceltoId, sostituisce = colpi.length >= limite) {
    const indice = sostituisce === false ? colpi.length : sostituisce === true ? colpi.length - 1 : sostituisce
    const base = sostituisce === false ? giocatori : baseDi(indice)
    // prima di scrivere la morte: lo snapshot per annullaMorte non deve contenere la scelta in sospeso
    setAttesaLupo(null)
    if (sostituisce !== false) disfaEffetti(colpi[indice])
    const consumaVendetta = vendettaAttiva && indice >= 1
    const patches = calcolaPatch(tipo, targetId, berserkerLupoSceltoId, base)
    const originali = {}
    const letali = []
    for (const [id, patch] of Object.entries(patches)) {
      const attuale = base.find((g) => g.id === id)
      originali[id] = Object.fromEntries(Object.keys(patch).map((campo) => [campo, attuale?.[campo]]))
      if (eColpoLetale(patch)) letali.push(id)
      aggiornaGiocatore(id, patch)
    }
    setEsito(descriviEsito(targetId, patches, base))
    const avvisi = tipo === 'trasforma' ? avvisoTrasforma(base, targetId, progenitore) : avvisiColpo(base, targetId, patches, 'branco')
    const nuovo = { targetId, tipo, originali, letali, consumaVendetta, avvisi }
    // sostituendo un colpo non l'ultimo (con la vendetta il Cucciolo ucciso dal
    // primo morso attiva il secondo): il resto resta com'è
    setColpi(sostituisce === false ? [...colpi, nuovo] : colpi.map((c, i) => (i === indice ? nuovo : c)))
    if (sostituisce === false) segnaUsoBranco(consumaVendetta)
    else if (consumaVendetta) {
      giocatori.filter((g) => ruoli.includes(g.ruoloSlug)).forEach((g) => aggiornaGiocatore(g.id, { vendettaCucciolo: false }))
    }
  }

  // Berserker: se i lupi vivi più vicini sono due (parità di distanza a
  // destra e sinistra), il narratore sceglie quale muore per la vendetta,
  // invece di lasciarlo decidere in automatico (pag. 10)
  // `indice`: colpo che questo morso sostituisce (di norma nessuno, o l'ultimo
  // se il limite è raggiunto). Il bersaglio si valuta coi giocatori com'erano
  // prima di quel colpo (vedi baseDi), non con il ruolo già trasformato.
  function procediConAttacco(targetId, indice = colpi.length >= limite ? colpi.length - 1 : undefined) {
    const lista = indice === undefined ? giocatori : baseDi(indice)
    const target = lista.find((g) => g.id === targetId)
    const candidatiLupo = target?.ruoloSlug === 'berserker' ? berserkerLupiCandidati(lista, targetId) : []
    if (candidatiLupo.length > 1) {
      setAttesaLupo({ targetId, indice })
      return
    }
    applica('sbrana', targetId, undefined, indice ?? false)
  }

  // click su una chip: se è già tra i colpi si deseleziona, altrimenti si
  // sbrana (il Progenitore è un'opzione separata, sul pulsante qui sotto)
  function confermaScelta(targetId) {
    const i = colpi.findIndex((c) => c.targetId === targetId)
    if (i >= 0) deseleziona(i)
    else procediConAttacco(targetId)
  }

  // il pulsante del Progenitore è un interruttore su una vittima (con la
  // vendetta del Cucciolo ce ne sono due: sceglie quale trasformare, l'altra
  // resta sbranata): trasforma invece di sbranare, o torna a sbranare
  // (gestendo di nuovo l'eventuale parità del Berserker). Mai entrambe le cose
  // sullo stesso bersaglio: l'una disfa l'altra.
  function toggleTrasformazione(i) {
    const colpo = colpi[i]
    if (colpo.tipo === 'trasforma') procediConAttacco(colpo.targetId, i)
    else applica('trasforma', colpo.targetId, undefined, i)
  }

  if (attesaLupo) {
    // nell'ordine dei giocatori al tavolo, non in quello di distanza
    const candidatiLupo = berserkerLupiCandidati(
      attesaLupo.indice === undefined ? giocatori : baseDi(attesaLupo.indice),
      bersaglioInAttesaDiLupo,
    ).sort((a, b) => giocatori.findIndex((g) => g.id === a.id) - giocatori.findIndex((g) => g.id === b.id))
    return (
      <div className="scelta-giocatore__chips" role="group" aria-label="Quale lupo uccide il Berserker">
        <p>Il Berserker ha due lupi alla stessa distanza: quale muore lottando con lui?</p>
        {candidatiLupo.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            onClick={() => applica('sbrana', bersaglioInAttesaDiLupo, g.id, attesaLupo.indice ?? false)}
          >
            {g.nome}
          </button>
        ))}
        <button type="button" onClick={() => setAttesaLupo(null)}>
          Annulla (cambia bersaglio)
        </button>
      </div>
    )
  }

  // il potere si usa una volta sola: finché una vittima è trasformata, solo il suo pulsante
  const trasformabili = colpi
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.tipo === 'trasforma' || !colpi.some((x) => x.tipo === 'trasforma'))

  return (
    <div className="scelta-giocatore">
      <p>Il branco sbrana</p>
      {vendettaAttiva && (
        <p className="avviso">
          🐺 Vendetta del Cucciolo: il branco sbrana due vittime questa notte (vittima{' '}
          {Math.min(colpi.length + 1, 2)} di 2).
        </p>
      )}
      <div className="scelta-giocatore__chips" role="group" aria-label="Il branco sbrana">
        {vivi.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`chip${colpi.some((c) => c.targetId === g.id && c.tipo === 'trasforma') ? ' chip--trasformato' : ''}`}
            aria-pressed={colpi.some((c) => c.targetId === g.id)}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
      {vendettaAttiva && colpi.length >= 2 && <p>Il branco ha già sbranato le sue vittime questa notte.</p>}
      {esito && <p className="avviso">⚠️ {esito}</p>}
      {avvisiMorsi.filter((a) => a.testo).map((a) => (
        <p key={a.testo} className="avviso">⚠️ {a.testo}</p>
      ))}
      {colpi.filter((c) => c.tipo === 'trasforma').map((c) => (
        <p key={c.targetId} className="avviso">
          🐺 {giocatori.find((g) => g.id === c.targetId)?.nome} verrà trasformato in Lupo Mannaro.
        </p>
      ))}
      {progenitorePuoTrasformare &&
        trasformabili.map(({ c, i }) => (
          <button
            key={c.targetId}
            type="button"
            // "Sbrana normalmente" è un'uscita, non lo stato attivo: non va evidenziato
            onClick={() => toggleTrasformazione(i)}
          >
            {c.tipo === 'trasforma'
              ? 'Sbrana normalmente'
              : `Il Progenitore trasforma ${giocatori.find((g) => g.id === c.targetId)?.nome} in Lupo Mannaro`}
          </button>
        ))}
    </div>
  )
}

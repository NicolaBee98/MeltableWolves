import { useState } from 'react'
import { risolviAttaccoBranco, berserkerLupiCandidati, RUOLI_NON_SELEZIONABILI_DAL_BRANCO } from '../../../data/effettiNotte'
import { annullaColpo, eColpoLetale } from './annullaColpo'

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

export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore, annullaMorte, round, ruoli = [], vivoAIngresso = (g) => g.vivo }) {
  // { targetId, sostituisce }: parità del Berserker in attesa della scelta del narratore
  const [attesaLupo, setAttesaLupo] = useState(null)
  const bersaglioInAttesaDiLupo = attesaLupo?.targetId
  // i colpi di questa notte (uno solo, o due con la vendetta del Cucciolo),
  // in ordine: restano TUTTI modificabili finché non si preme "Avanti".
  // Ognuno registra ESATTAMENTE i campi toccati, sul valore che avevano PRIMA,
  // così si può deselezionare (click sulla chip premuta) o cambiare
  // bersaglio disfacendolo del tutto (morte con la sua catena inclusa). Le
  // chip restano sempre tutte visibili e cliccabili: il Progenitore è un
  // pulsante unico sotto di loro che agisce sull'ultimo bersaglio scelto.
  // { targetId, tipo: 'sbrana'|'trasforma', originali, letali, consumaVendetta }
  const [colpi, setColpi] = useState([])
  // feedback sull'ultimo morso: perché non ha avuto effetto, o cosa comporta
  const [esito, setEsito] = useState(null)
  // vendetta già attiva prima di cominciare (Cucciolo morto in precedenza):
  // se invece l'ha fatta scattare il primo colpo, disfarlo la disattiva
  const [vendettaIniziale] = useState(() => giocatori.some((g) => ruoli.includes(g.ruoloSlug) && g.vendettaCucciolo))
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
  const progenitore = giocatori.find((g) => g.ruoloSlug === 'lupo-mannaro-progenitore' && g.vivo)
  // snapshot all'ingresso nel passo: usarla dal vivo farebbe sparire il
  // pulsante di trasformazione nello stesso istante in cui lo si preme
  // (il potere risulterebbe "già usato" a trasformazione appena applicata),
  // impedendo di tornare indietro con "Sbrana normalmente" prima di Avanti
  const [progenitorePuoTrasformare] = useState(
    () => Boolean(progenitore) && !(progenitore.poteriUsati ?? []).includes(POTERE_TRASFORMA),
  )

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
  function patchTrasforma(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !progenitore) return {}
    return {
      [target.id]: { ruoloSlug: 'lupo-mannaro', storiaRuoli: [...(target.storiaRuoli ?? []), 'lupo-mannaro'] },
      [progenitore.id]: { poteriUsati: [...(progenitore.poteriUsati ?? []), POTERE_TRASFORMA] },
    }
  }

  function calcolaPatch(tipo, targetId, berserkerLupoSceltoId) {
    return tipo === 'trasforma'
      ? patchTrasforma(targetId)
      : risolviAttaccoBranco(giocatori, targetId, round, ruoli, berserkerLupoSceltoId)
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

  function descriviEsito(targetId, patches) {
    const target = giocatori.find((g) => g.id === targetId)
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
    if (target.ruoloSlug === 'ubriaco' && patches[target.id]?.vivo === false) {
      return `${target.nome} è l'Ubriaco: il branco sarà stordito la prossima notte.`
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

  // `sostituisce`: rimpiazza l'ultimo colpo invece di aggiungerne uno (il
  // conteggio degli usi non cambia)
  function applica(tipo, targetId, berserkerLupoSceltoId, sostituisce = colpi.length >= limite) {
    const restano = sostituisce ? colpi.slice(0, -1) : colpi
    if (sostituisce) disfaEffetti(colpi[colpi.length - 1])
    const consumaVendetta = vendettaAttiva && restano.length + 1 >= 2
    const patches = calcolaPatch(tipo, targetId, berserkerLupoSceltoId)
    const originali = {}
    const letali = []
    for (const [id, patch] of Object.entries(patches)) {
      const attuale = giocatori.find((g) => g.id === id)
      originali[id] = Object.fromEntries(Object.keys(patch).map((campo) => [campo, attuale?.[campo]]))
      if (eColpoLetale(patch)) letali.push(id)
      aggiornaGiocatore(id, patch)
    }
    setEsito(descriviEsito(targetId, patches))
    setColpi([...restano, { targetId, tipo, originali, letali, consumaVendetta }])
    if (!sostituisce) segnaUsoBranco(consumaVendetta)
    else if (consumaVendetta) {
      giocatori.filter((g) => ruoli.includes(g.ruoloSlug)).forEach((g) => aggiornaGiocatore(g.id, { vendettaCucciolo: false }))
    }
    setAttesaLupo(null)
  }

  // Berserker: se i lupi vivi più vicini sono due (parità di distanza a
  // destra e sinistra), il narratore sceglie quale muore per la vendetta,
  // invece di lasciarlo decidere in automatico (pag. 10)
  function procediConAttacco(targetId, sostituisce) {
    const target = giocatori.find((g) => g.id === targetId)
    const candidatiLupo = target?.ruoloSlug === 'berserker' ? berserkerLupiCandidati(giocatori, targetId) : []
    if (candidatiLupo.length > 1) {
      setAttesaLupo({ targetId, sostituisce })
      return
    }
    applica('sbrana', targetId, undefined, sostituisce)
  }

  // click su una chip: se è già tra i colpi si deseleziona, altrimenti si
  // sbrana (il Progenitore è un'opzione separata, sul pulsante qui sotto)
  function confermaScelta(targetId) {
    const i = colpi.findIndex((c) => c.targetId === targetId)
    if (i >= 0) deseleziona(i)
    else procediConAttacco(targetId)
  }

  // il pulsante del Progenitore è un interruttore sull'ultimo bersaglio:
  // trasforma invece di sbranare, o torna a sbranare (gestendo di nuovo
  // l'eventuale parità del Berserker se il bersaglio lo richiede)
  function toggleTrasformazione() {
    const ultimo = colpi[colpi.length - 1]
    if (!ultimo) return
    if (ultimo.tipo === 'trasforma') procediConAttacco(ultimo.targetId, true)
    else applica('trasforma', ultimo.targetId, undefined, true)
  }

  if (attesaLupo) {
    const candidatiLupo = berserkerLupiCandidati(giocatori, bersaglioInAttesaDiLupo)
    return (
      <div className="scelta-giocatore__chips" role="group" aria-label="Quale lupo uccide il Berserker">
        <p>Il Berserker ha due lupi alla stessa distanza: quale muore lottando con lui?</p>
        {candidatiLupo.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            onClick={() => applica('sbrana', bersaglioInAttesaDiLupo, g.id, attesaLupo.sostituisce)}
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

  const ultimoColpo = colpi[colpi.length - 1]
  const bersaglioCorrente = ultimoColpo && giocatori.find((g) => g.id === ultimoColpo.targetId)

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
      {progenitorePuoTrasformare && bersaglioCorrente && (
        <button
          type="button"
          className={ultimoColpo.tipo === 'trasforma' ? 'chip--trasformato' : ''}
          aria-pressed={ultimoColpo.tipo === 'trasforma'}
          onClick={toggleTrasformazione}
        >
          {ultimoColpo.tipo === 'trasforma'
            ? 'Sbrana normalmente'
            : `Il Progenitore trasforma ${bersaglioCorrente.nome} in Lupo Mannaro`}
        </button>
      )}
    </div>
  )
}

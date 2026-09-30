import { useState } from 'react'
import { risolviAttaccoBranco, berserkerLupiCandidati, RUOLI_IMMUNI_AL_BRANCO } from '../../../data/effettiNotte'

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

export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore, round, ruoli = [] }) {
  const [bersaglioInAttesaDiLupo, setBersaglioInAttesaDiLupo] = useState(null)
  // il colpo (col caso comune, un solo bersaglio possibile) resta
  // modificabile finché non si preme "Avanti", come ogni altra azione con
  // effetti reali (vedi AzioneChupacabra): registra ESATTAMENTE i campi
  // toccati dal colpo, sul valore che avevano PRIMA, così cambiare
  // bersaglio (o passare da "sbrana" a "trasforma" e viceversa) può
  // annullarli tutti prima di applicare il nuovo. Le chip restano sempre
  // tutte visibili e cliccabili (mai sovrascritte da una schermata separata,
  // come chiesto): il Progenitore è un pulsante unico sotto di loro che
  // agisce sul bersaglio già scelto, non un fork che le nasconde.
  const [colpoAttivo, setColpoAttivo] = useState(null) // { targetId, tipo: 'sbrana'|'trasforma', originali }
  // il bersaglio appena sbranato resta in lista (anche se non più vivo),
  // altrimenti la sua chip sparirebbe subito dopo il click invece di
  // restare visibile e cliccabile (vedi AzioneChupacabra)
  const vivi = giocatori.filter(
    (g) => (g.vivo || g.id === colpoAttivo?.targetId) && !RUOLI_IMMUNI_AL_BRANCO.includes(g.ruoloSlug),
  )
  const storditi = giocatori.some(
    (g) => ruoli.includes(g.ruoloSlug) && g.brancoStorditoFinoA !== undefined && g.brancoStorditoFinoA === round,
  )
  const vendettaAttiva = giocatori.some((g) => ruoli.includes(g.ruoloSlug) && g.vendettaCucciolo)
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

  // con la vendetta del Cucciolo attiva (fino a due vittime distinte).
  // annullare un colpo per rifarne un altro rischierebbe di disallineare il
  // conteggio delle due sbranate, quindi lì un colpo resta definitivo. Nel
  // caso comune (un solo colpo possibile) invece di bloccare del tutto,
  // resta modificabile finché abbiamo la traccia per annullarlo (colpoAttivo);
  // se non ce l'abbiamo (es. era già stato dato prima che questo passo
  // esistesse) il colpo resta comunque definitivo, non essendoci nulla da annullare
  if (usi >= limite && (vendettaAttiva || !colpoAttivo)) {
    return <p>Il branco ha già sbranato {limite === 2 ? 'le sue vittime' : 'una vittima'} questa notte.</p>
  }

  function segnaUsoBranco() {
    giocatori
      .filter((g) => ruoli.includes(g.ruoloSlug))
      .forEach((g) => {
        const nuoviUsi = [...(g.usiNotte ?? []), POTERE]
        const haRaggiuntoLimite = nuoviUsi.filter((u) => u === POTERE).length >= limite
        aggiornaGiocatore(g.id, {
          usiNotte: nuoviUsi,
          ...(haRaggiuntoLimite && vendettaAttiva ? { vendettaCucciolo: false } : {}),
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

  function applica(tipo, targetId, berserkerLupoSceltoId) {
    // annulla il colpo precedente (se ancora annullabile) ripristinando
    // esattamente i campi che aveva toccato, prima di applicarne uno nuovo
    if (colpoAttivo) {
      for (const [id, originali] of Object.entries(colpoAttivo.originali)) {
        aggiornaGiocatore(id, originali)
      }
    }
    const patches = calcolaPatch(tipo, targetId, berserkerLupoSceltoId)
    const originali = {}
    for (const [id, patch] of Object.entries(patches)) {
      const attuale = giocatori.find((g) => g.id === id)
      originali[id] = Object.fromEntries(Object.keys(patch).map((campo) => [campo, attuale?.[campo]]))
      aggiornaGiocatore(id, patch)
    }
    if (!vendettaAttiva) {
      setColpoAttivo({ targetId, tipo, originali })
    }
    // conta come nuovo uso solo la vendetta (ogni colpo è definitivo, quindi
    // ognuno va contato) o il primissimo colpo nel caso comune: sostituire
    // un colpo già annullabile (colpoAttivo) non deve incrementare di nuovo
    if (vendettaAttiva || !colpoAttivo) {
      segnaUsoBranco()
    }
    setBersaglioInAttesaDiLupo(null)
  }

  // Berserker: se i lupi vivi più vicini sono due (parità di distanza a
  // destra e sinistra), il narratore sceglie quale muore per la vendetta,
  // invece di lasciarlo decidere in automatico (pag. 10)
  function procediConAttacco(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    const candidatiLupo = target?.ruoloSlug === 'berserker' ? berserkerLupiCandidati(giocatori, targetId) : []
    if (candidatiLupo.length > 1) {
      setBersaglioInAttesaDiLupo(targetId)
      return
    }
    applica('sbrana', targetId)
  }

  // scegliere una chip sbrana sempre normalmente: il Progenitore è
  // un'opzione separata che si applica DOPO, sul bersaglio già scelto
  // (pulsante qui sotto), non un fork che sostituisce le chip
  function confermaScelta(targetId) {
    if (targetId === colpoAttivo?.targetId) return
    procediConAttacco(targetId)
  }

  // il pulsante del Progenitore è un interruttore sul bersaglio corrente:
  // trasforma invece di sbranare, o torna a sbranare (gestendo di nuovo
  // l'eventuale parità del Berserker se il bersaglio lo richiede)
  function toggleTrasformazione() {
    if (!colpoAttivo) return
    if (colpoAttivo.tipo === 'trasforma') {
      procediConAttacco(colpoAttivo.targetId)
    } else {
      applica('trasforma', colpoAttivo.targetId)
    }
  }

  if (bersaglioInAttesaDiLupo) {
    const candidatiLupo = berserkerLupiCandidati(giocatori, bersaglioInAttesaDiLupo)
    return (
      <div className="scelta-giocatore__chips" role="group" aria-label="Quale lupo uccide il Berserker">
        <p>Il Berserker ha due lupi alla stessa distanza: quale muore lottando con lui?</p>
        {candidatiLupo.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            onClick={() => applica('sbrana', bersaglioInAttesaDiLupo, g.id)}
          >
            {g.nome}
          </button>
        ))}
        <button type="button" onClick={() => setBersaglioInAttesaDiLupo(null)}>
          Annulla (cambia bersaglio)
        </button>
      </div>
    )
  }

  const bersaglioCorrente = colpoAttivo && giocatori.find((g) => g.id === colpoAttivo.targetId)

  return (
    <div className="scelta-giocatore">
      <p>Il branco sbrana</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Il branco sbrana">
        {vivi.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`chip${colpoAttivo?.targetId === g.id && colpoAttivo.tipo === 'trasforma' ? ' chip--trasformato' : ''}`}
            aria-pressed={colpoAttivo?.targetId === g.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
      {progenitorePuoTrasformare && bersaglioCorrente && (
        <button
          type="button"
          className={colpoAttivo.tipo === 'trasforma' ? 'chip--trasformato' : ''}
          aria-pressed={colpoAttivo.tipo === 'trasforma'}
          onClick={toggleTrasformazione}
        >
          {colpoAttivo.tipo === 'trasforma'
            ? 'Sbrana normalmente'
            : `Il Progenitore trasforma ${bersaglioCorrente.nome} in Lupo Mannaro`}
        </button>
      )}
    </div>
  )
}

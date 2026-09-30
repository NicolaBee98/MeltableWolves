import { useState } from 'react'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
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
  const [bersaglioInAttesaDiTrasformazione, setBersaglioInAttesaDiTrasformazione] = useState(null)
  // il colpo (col caso comune, un solo bersaglio possibile) resta
  // modificabile finché non si preme "Avanti", come ogni altra azione con
  // effetti reali (vedi AzioneChupacabra): registra ESATTAMENTE i campi
  // toccati dal colpo, sul valore che avevano PRIMA, così cambiare
  // bersaglio può annullarli tutti (non solo la morte diretta: Berserker,
  // Ubriaco, Mezzosangue possono toccarne altri) prima di applicare il nuovo
  const [colpoAttivo, setColpoAttivo] = useState(null) // { targetId, originali: { [id]: {...campi} } }
  const vivi = giocatori.filter((g) => g.vivo && !RUOLI_IMMUNI_AL_BRANCO.includes(g.ruoloSlug))
  const storditi = giocatori.some(
    (g) => ruoli.includes(g.ruoloSlug) && g.brancoStorditoFinoA !== undefined && g.brancoStorditoFinoA === round,
  )
  const vendettaAttiva = giocatori.some((g) => ruoli.includes(g.ruoloSlug) && g.vendettaCucciolo)
  const limite = vendettaAttiva ? 2 : 1
  const usi = usiStanotte(giocatori, ruoli)
  const progenitore = giocatori.find((g) => g.ruoloSlug === 'lupo-mannaro-progenitore' && g.vivo)
  const progenitorePuoTrasformare = Boolean(progenitore) && !(progenitore.poteriUsati ?? []).includes(POTERE_TRASFORMA)

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

  function finalizza(targetId, berserkerLupoSceltoId) {
    // annulla il colpo precedente (se ancora annullabile) ripristinando
    // esattamente i campi che aveva toccato, prima di applicarne uno nuovo
    if (colpoAttivo) {
      for (const [id, originali] of Object.entries(colpoAttivo.originali)) {
        aggiornaGiocatore(id, originali)
      }
    }
    const patches = risolviAttaccoBranco(giocatori, targetId, round, ruoli, berserkerLupoSceltoId)
    const originali = {}
    for (const [id, patch] of Object.entries(patches)) {
      const attuale = giocatori.find((g) => g.id === id)
      originali[id] = Object.fromEntries(Object.keys(patch).map((campo) => [campo, attuale?.[campo]]))
      aggiornaGiocatore(id, patch)
    }
    if (!vendettaAttiva) {
      setColpoAttivo({ targetId, originali })
    }
    // conta come nuovo uso solo la vendetta (ogni colpo è definitivo, quindi
    // ognuno va contato) o il primissimo colpo nel caso comune: sostituire
    // un colpo già annullabile (colpoAttivo) non deve incrementare di nuovo
    if (vendettaAttiva || !colpoAttivo) {
      segnaUsoBranco()
    }
    setBersaglioInAttesaDiLupo(null)
  }

  // Lupo Mannaro Progenitore: una sola volta per partita, invece di sbranare
  // la vittima scelta dal branco può trasformarla in Lupo Mannaro (pag. 15).
  // Il narratore la sveglia in privato e le fa riconoscere il branco.
  function trasforma(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (target && progenitore) {
      aggiornaGiocatore(target.id, {
        ruoloSlug: 'lupo-mannaro',
        storiaRuoli: [...(target.storiaRuoli ?? []), 'lupo-mannaro'],
      })
      aggiornaGiocatore(progenitore.id, {
        poteriUsati: [...(progenitore.poteriUsati ?? []), POTERE_TRASFORMA],
      })
    }
    segnaUsoBranco()
    setBersaglioInAttesaDiTrasformazione(null)
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
    finalizza(targetId)
  }

  function confermaScelta(targetId) {
    if (targetId === colpoAttivo?.targetId) return
    if (progenitorePuoTrasformare) {
      setBersaglioInAttesaDiTrasformazione(targetId)
      return
    }
    procediConAttacco(targetId)
  }

  if (bersaglioInAttesaDiTrasformazione) {
    const nome = giocatori.find((g) => g.id === bersaglioInAttesaDiTrasformazione)?.nome
    return (
      <div className="azione-branco-lupi__progenitore">
        <p>Il Progenitore può trasformare {nome} in Lupo Mannaro invece di sbranarla, una sola volta per partita.</p>
        <button type="button" onClick={() => trasforma(bersaglioInAttesaDiTrasformazione)}>
          Il Progenitore la trasforma in Lupo Mannaro
        </button>
        <button
          type="button"
          onClick={() => {
            const targetId = bersaglioInAttesaDiTrasformazione
            setBersaglioInAttesaDiTrasformazione(null)
            procediConAttacco(targetId)
          }}
        >
          Sbrana normalmente
        </button>
        <button type="button" onClick={() => setBersaglioInAttesaDiTrasformazione(null)}>
          Annulla (cambia bersaglio)
        </button>
      </div>
    )
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
            onClick={() => finalizza(bersaglioInAttesaDiLupo, g.id)}
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

  return (
    <SceltaGiocatore
      candidati={vivi}
      onConferma={confermaScelta}
      onSalta={() => {}}
      etichetta="Il branco sbrana"
      mostraSalta={false}
    />
  )
}

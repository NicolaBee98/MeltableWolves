import { useState } from 'react'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { risolviAttaccoBranco, berserkerLupiCandidati } from '../../../data/effettiNotte'

const POTERE = 'branco-lupi-sbrana'
const POTERE_TRASFORMA = 'progenitore-trasforma'
const RUOLI_IMMUNI = ['cortigiana', 'nano', 'criceto-malvagio']

function usiStanotte(giocatori, ruoli) {
  const portatore = giocatori.find((g) => ruoli.includes(g.ruoloSlug))
  return (portatore?.usiNotte ?? []).filter((u) => u === POTERE).length
}

export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore, round, ruoli = [] }) {
  const [bersaglioInAttesaDiLupo, setBersaglioInAttesaDiLupo] = useState(null)
  const [bersaglioInAttesaDiTrasformazione, setBersaglioInAttesaDiTrasformazione] = useState(null)
  const vivi = giocatori.filter((g) => g.vivo && !RUOLI_IMMUNI.includes(g.ruoloSlug))
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

  if (usi >= limite) {
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
    const patches = risolviAttaccoBranco(giocatori, targetId, round, ruoli, berserkerLupoSceltoId)
    for (const [id, patch] of Object.entries(patches)) {
      aggiornaGiocatore(id, patch)
    }
    segnaUsoBranco()
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

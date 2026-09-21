import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { risolviAttaccoBranco } from '../../../data/effettiNotte'

const POTERE = 'branco-lupi-sbrana'
const RUOLI_IMMUNI = ['cortigiana', 'nano', 'criceto-malvagio']

function usiStanotte(giocatori, ruoli) {
  const portatore = giocatori.find((g) => ruoli.includes(g.ruoloSlug))
  return (portatore?.usiNotte ?? []).filter((u) => u === POTERE).length
}

export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore, round, ruoli = [] }) {
  const vivi = giocatori.filter((g) => g.vivo && !RUOLI_IMMUNI.includes(g.ruoloSlug))
  const storditi = giocatori.some(
    (g) => ruoli.includes(g.ruoloSlug) && g.brancoStorditoFinoA !== undefined && g.brancoStorditoFinoA === round,
  )
  const vendettaAttiva = giocatori.some((g) => ruoli.includes(g.ruoloSlug) && g.vendettaCucciolo)
  const limite = vendettaAttiva ? 2 : 1
  const usi = usiStanotte(giocatori, ruoli)

  if (storditi) {
    return <p>Il branco è ancora stordito dall'alcol dell'Ubriaco: questa notte non può cacciare.</p>
  }

  if (usi >= limite) {
    return <p>Il branco ha già sbranato {limite === 2 ? 'le sue vittime' : 'una vittima'} questa notte.</p>
  }

  function confermaScelta(targetId) {
    const patches = risolviAttaccoBranco(giocatori, targetId, round, ruoli)
    for (const [id, patch] of Object.entries(patches)) {
      aggiornaGiocatore(id, patch)
    }

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

import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { auraDi } from '../../../data/aura'
import { usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

const RUOLI = ['inquisitore']
const POTERE_PERSO = 'inquisitore-potere-perso'
const POTERE_NOTTE = 'inquisitore-indagine'

export function AzioneInquisitore({ giocatori, aggiornaGiocatore, round }) {
  const inquisitore = giocatori.find((g) => g.ruoloSlug === 'inquisitore')
  const poteriUsati = inquisitore?.poteriUsati ?? []
  const potereEsaurito = poteriUsati.includes(POTERE_PERSO)
  const candidati = giocatori.filter((g) => g.vivo && g.id !== inquisitore?.id)
  const indagineStanotte = inquisitore?.ultimaIndagine?.notte === round ? inquisitore.ultimaIndagine : null

  if (potereEsaurito) {
    return <p>Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola.</p>
  }

  if (usatoStanotte(giocatori, RUOLI, POTERE_NOTTE)) {
    return (
      <div className="azione-indagine">
        <p>Potere già utilizzato questa notte.</p>
        {indagineStanotte && (
          <p className="azione-indagine__esito">
            Rispondi all'Inquisitore: {indagineStanotte.esito === 'malvagia' ? 'è un lupo 🐺' : 'non è un lupo 🕊️'}
          </p>
        )}
      </div>
    )
  }

  function confermaScelta(targetId) {
    if (inquisitore) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        const esito = auraDi(target.ruoloSlug)
        const patch = { ultimaIndagine: { targetId, esito, notte: round } }
        // "se indaga inutilmente un personaggio con aura positiva perde
        // permanentemente il suo potere" (pag. 15)
        if (esito === 'benevola') {
          patch.poteriUsati = [...poteriUsati, POTERE_PERSO]
        }
        aggiornaGiocatore(inquisitore.id, patch)
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE_NOTTE)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE_NOTTE)
  }

  return (
    <SceltaGiocatore
      candidati={candidati}
      onConferma={confermaScelta}
      onSalta={salta}
      etichetta="Chi interrogare"
      mostraSalta
    />
  )
}

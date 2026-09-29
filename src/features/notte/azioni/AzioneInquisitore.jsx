import { auraDi } from '../../../data/aura'
import { useState } from 'react'
import { segnaUsoStanotte, aggiornaTuttiConRuolo } from '../../../data/effettiNotte'

const RUOLI = ['inquisitore']
const POTERE_PERSO = 'inquisitore-potere-perso'
const POTERE_NOTTE = 'inquisitore-indagine'

// stesso principio di AzioneIndagine (Veggente): la chip resta modificabile
// finché non si preme "Avanti". La perdita del potere dopo un'indagine su
// aura benevola è però permanente (per l'intera partita, non solo stanotte):
// va quindi catturata una sola volta al montaggio del passo, altrimenti un
// primo click su un bersaglio benevolo (ancora solo pendente) bloccherebbe
// subito la possibilità di ripensarci e scegliere qualcun altro.
export function AzioneInquisitore({ giocatori, aggiornaGiocatore, round }) {
  const inquisitore = giocatori.find((g) => g.ruoloSlug === 'inquisitore')
  const [potereEsauritoAllIngresso] = useState(() => (inquisitore?.poteriUsati ?? []).includes(POTERE_PERSO))
  const candidati = giocatori.filter((g) => g.vivo && g.id !== inquisitore?.id)
  const indagineStanotte = inquisitore?.ultimaIndagine?.notte === round ? inquisitore.ultimaIndagine : null
  const giaUsato = Boolean(indagineStanotte)

  if (potereEsauritoAllIngresso) {
    return <p>Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola.</p>
  }

  // true se un click PRECEDENTE di questa stessa notte (non ancora "Avanti",
  // quindi ancora ripensabile) ha già segnato il potere perso: serve per
  // sapere se un ripensamento successivo deve esplicitamente toglierlo
  // (altrimenti resterebbe scritto da un click precedente sullo stesso passo)
  const [poterePersoInQuestoPasso, setPoterePersoInQuestoPasso] = useState(false)

  function confermaScelta(targetId) {
    if (inquisitore) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        const esito = auraDi(target.ruoloSlug)
        const perso = esito === 'benevola'
        aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'inquisitore', (g) => ({
          ultimaIndagine: { targetId, esito, notte: round },
          // "se indaga inutilmente un personaggio con aura positiva perde
          // permanentemente il suo potere" (pag. 15). Il campo poteriUsati
          // si tocca solo quando serve (aggiungerlo o toglierlo), non ad
          // ogni click: altrimenti un'indagine su aura malvagia scriverebbe
          // comunque un poteriUsati invariato, inutilmente.
          ...(perso
            ? { poteriUsati: [...(g.poteriUsati ?? []).filter((p) => p !== POTERE_PERSO), POTERE_PERSO] }
            : poterePersoInQuestoPasso
              ? { poteriUsati: (g.poteriUsati ?? []).filter((p) => p !== POTERE_PERSO) }
              : {}),
        }))
        setPoterePersoInQuestoPasso(perso)
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE_NOTTE)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE_NOTTE)
  }

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="azione-indagine">
      <p>Chi interrogare</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Chi interrogare">
        {candidati.map((g) => {
          const indagato = giaUsato && indagineStanotte?.targetId === g.id
          const classeEsito = indagato ? `chip--${indagineStanotte.esito === 'malvagia' ? 'malvagia' : 'benevola'}` : ''
          return (
            <button
              key={g.id}
              type="button"
              className={`chip ${classeEsito}`.trim()}
              aria-pressed={indagato}
              onClick={() => confermaScelta(g.id)}
            >
              {g.nome}
            </button>
          )
        })}
      </div>
      {giaUsato && indagineStanotte && (
        <p className="azione-indagine__etichetta-esito">
          Rispondi all'Inquisitore: {indagineStanotte.esito === 'malvagia' ? 'è un lupo 🐺' : 'non è un lupo 🕊️'}
        </p>
      )}
      <button type="button" onClick={salta}>
        Salta
      </button>
    </div>
  )
}


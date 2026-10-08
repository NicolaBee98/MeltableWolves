import { auraDi } from '../../../data/aura'
import { useState } from 'react'
const POTERE_PERSO = 'inquisitore-potere-perso'
const POTERE_NOTTE = 'inquisitore-indagine'

// stesso principio di AzioneIndagine (Veggente): la chip resta modificabile
// finché non si preme "Avanti". La perdita del potere dopo un'indagine su
// aura benevola è però permanente (per l'intera partita, non solo stanotte):
// va quindi catturata una sola volta al montaggio del passo, altrimenti un
// primo click su un bersaglio benevolo (ancora solo pendente) bloccherebbe
// subito la possibilità di ripensarci e scegliere qualcun altro.
// Inquisitore e Mimo-Inquisitore sono due attori indipendenti (perAttore): ognuno
// ha la propria indagine e il proprio potere, che può fallire (e perdersi) una
// volta per ciascuno.
export function AzioneInquisitore({ giocatori, aggiornaGiocatore, round, attoreId, vivoAIngresso = (g) => g.vivo }) {
  const inquisitore = attoreId ? giocatori.find((g) => g.id === attoreId) : giocatori.find((g) => g.ruoloSlug === 'inquisitore')
  const [potereEsauritoAllIngresso] = useState(() => (inquisitore?.poteriUsati ?? []).includes(POTERE_PERSO))
  const candidati = giocatori.filter((g) => vivoAIngresso(g) && g.id !== inquisitore?.id)
  const indagineStanotte = inquisitore?.ultimaIndagine?.notte === round ? inquisitore.ultimaIndagine : null
  const giaUsato = Boolean(indagineStanotte)

  // (prima del return anticipato: gli hook non vanno dopo un return)
  // true se un click PRECEDENTE di questa stessa notte (non ancora "Avanti",
  // quindi ancora ripensabile) ha già segnato il potere perso: serve per
  // sapere se un ripensamento successivo deve esplicitamente toglierlo
  // (altrimenti resterebbe scritto da un click precedente sullo stesso passo)
  const [poterePersoInQuestoPasso, setPoterePersoInQuestoPasso] = useState(false)

  if (potereEsauritoAllIngresso) {
    return <p>Ha perso il proprio potere dopo un'indagine inutile su un'aura benevola.</p>
  }

  function confermaScelta(targetId) {
    if (!inquisitore) return
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const esito = auraDi(target.ruoloSlug)
    const perso = esito === 'benevola'
    const poteri = inquisitore.poteriUsati ?? []
    aggiornaGiocatore(inquisitore.id, {
      ultimaIndagine: { targetId, esito, notte: round },
      // "se indaga inutilmente un personaggio con aura positiva perde
      // permanentemente il suo potere" (pag. 15). Il campo poteriUsati
      // si tocca solo quando serve (aggiungerlo o toglierlo), non ad
      // ogni click: altrimenti un'indagine su aura malvagia scriverebbe
      // comunque un poteriUsati invariato, inutilmente.
      ...(perso
        ? { poteriUsati: [...poteri.filter((p) => p !== POTERE_PERSO), POTERE_PERSO] }
        : poterePersoInQuestoPasso
          ? { poteriUsati: poteri.filter((p) => p !== POTERE_PERSO) }
          : {}),
    })
    aggiornaGiocatore(inquisitore.id, { usiNotte: [...(inquisitore.usiNotte ?? []).filter((p) => p !== POTERE_NOTTE), POTERE_NOTTE] })
    setPoterePersoInQuestoPasso(perso)
  }

  // toglie l'indagine di questa notte (e la perdita del potere che ne era
  // derivata) con un'unica patch; `saltata` segna invece la notte come usata
  function azzeraIndagine(saltata) {
    if (!inquisitore) return
    aggiornaGiocatore(inquisitore.id, {
      ultimaIndagine: undefined,
      poteriUsati: (inquisitore.poteriUsati ?? []).filter((p) => p !== POTERE_PERSO),
      usiNotte: [...(inquisitore.usiNotte ?? []).filter((p) => p !== POTERE_NOTTE), ...(saltata ? [POTERE_NOTTE] : [])],
    })
    setPoterePersoInQuestoPasso(false)
  }

  // click sulla chip già scelta: annulla l'indagine, il potere torna intatto
  const annullaScelta = () => azzeraIndagine(false)

  // "Salta" dopo un'indagine già fatta non deve lasciarla scritta
  const salta = () => azzeraIndagine(true)

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
              onClick={() => (indagato ? annullaScelta() : confermaScelta(g.id))}
            >
              {g.nome}
            </button>
          )
        })}
      </div>
      {giaUsato && indagineStanotte && (
        <p className="azione-indagine__etichetta-esito">
          Rispondi all'Inquisitore: {indagineStanotte.esito === 'malvagia' ? 'sì (aura malvagia)' : 'no (aura benevola)'}
        </p>
      )}
      <button type="button" onClick={salta}>
        Salta
      </button>
    </div>
  )
}


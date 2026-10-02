import { useState } from 'react'

// Il bersaglio NON torna in vita subito: resta morto per il resto della notte
// (non agisce nei passi successivi) e viene solo marcato `resuscitaAllAlba`;
// rinasce all'Alba, quando il narratore annuncia la resurrezione (AlbaPanel).
//
// come la pozione della Strega: potere unico per l'intera partita, quindi
// "già usato" va catturato una sola volta al montaggio del passo (non ad
// ogni render), altrimenti un click pendente in questa stessa notte
// nasconderebbe subito le chip impedendo di ripensare il bersaglio.
export function AzioneResuscita({ giocatori, aggiornaGiocatore, potereSlug, ruoloSlugAttore, round }) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const [giaUsato] = useState(() => (attore?.poteriUsati ?? []).includes(potereSlug))
  // il bersaglio marcato per la resurrezione di questa notte
  const [target, setTarget] = useState(null)
  // sia il Guaritore sia lo Sciacallo Mannaro possono resuscitare se stessi.
  // Chi è già marcato per la resurrezione (dall'altro potere)
  // non è più un bersaglio, a meno che non sia la scelta corrente.
  const morti = giocatori.filter((g) => (!g.vivo && !g.resuscitaAllAlba) || g.id === target)

  if (giaUsato) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  // annullare la scelta toglie solo il marcatore: il bersaglio non è mai
  // tornato in vita, quindi nessuna catena di morte da rilanciare
  function togliMarcatore(id) {
    aggiornaGiocatore(id, { resuscitaAllAlba: undefined })
  }

  function confermaScelta(targetId) {
    if (!attore) return
    if (targetId === target) {
      // deselezione: il potere si rilascia (come la Strega)
      togliMarcatore(target)
      aggiornaGiocatore(attore.id, { poteriUsati: (attore.poteriUsati ?? []).filter((p) => p !== potereSlug) })
      setTarget(null)
      return
    }
    if (target) togliMarcatore(target)
    setTarget(targetId)
    aggiornaGiocatore(targetId, { resuscitaAllAlba: round })
    const poteriUsatiAttore = attore.poteriUsati ?? []
    if (!poteriUsatiAttore.includes(potereSlug)) {
      aggiornaGiocatore(attore.id, { poteriUsati: [...poteriUsatiAttore, potereSlug] })
    }
  }

  if (morti.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <p>Chi resuscitare</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Chi resuscitare">
        {morti.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={target === g.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
    </div>
  )
}

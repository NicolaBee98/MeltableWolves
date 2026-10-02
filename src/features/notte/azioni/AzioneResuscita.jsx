import { useState } from 'react'
import { resuscitaPatch } from '../../../data/effettiNotte'

// come la pozione della Strega: potere unico per l'intera partita, quindi
// "già usato" va catturato una sola volta al montaggio del passo (non ad
// ogni render), altrimenti un click pendente in questa stessa notte
// nasconderebbe subito le chip impedendo di ripensare il bersaglio.
export function AzioneResuscita({ giocatori, aggiornaGiocatore, impostaGiocatori, potereSlug, ruoloSlugAttore, round }) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const [giaUsato] = useState(() => (attore?.poteriUsati ?? []).includes(potereSlug))
  // { id, originale }: il giocatore com'era PRIMA di resuscitarlo, per poterlo
  // riportare esattamente allo stato di morto se si cambia bersaglio
  const [scelto, setScelto] = useState(null)
  const target = scelto?.id
  // sia il Guaritore sia lo Sciacallo Mannaro possono resuscitare se stessi.
  // Il bersaglio appena resuscitato resta comunque in lista anche se non è
  // più morto, altrimenti la sua chip sparirebbe subito dopo il click.
  const morti = giocatori.filter((g) => !g.vivo || g.id === target)

  if (giaUsato) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  // annullare una resurrezione NON è una nuova morte: passando da
  // aggiornaGiocatore({vivo:false}) rilancerebbe la catena (vendetta del
  // Cucciolo, crepacuore...) già avvenuta alla morte vera. Si reimposta
  // quindi direttamente lo stato di prima.
  function ripristinaMorto({ id, originale }) {
    if (impostaGiocatori) {
      impostaGiocatori(giocatori.map((g) => (g.id === id ? { ...g, ...originale } : g)))
    } else {
      aggiornaGiocatore(id, { ...originale, vivo: false })
    }
  }

  function confermaScelta(targetId) {
    if (!attore) return
    if (targetId === target) {
      // deselezione: torna morto e il potere si rilascia (come la Strega)
      ripristinaMorto(scelto)
      aggiornaGiocatore(attore.id, { poteriUsati: (attore.poteriUsati ?? []).filter((p) => p !== potereSlug) })
      setScelto(null)
      return
    }
    if (scelto) ripristinaMorto(scelto)
    const nuovoBersaglio = giocatori.find((g) => g.id === targetId)
    const patch = nuovoBersaglio && resuscitaPatch(nuovoBersaglio, round)
    // solo i campi toccati dalla resurrezione, coi valori di prima
    setScelto({
      id: targetId,
      originale: Object.fromEntries(Object.keys(patch ?? {}).map((campo) => [campo, nuovoBersaglio[campo]])),
    })
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
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

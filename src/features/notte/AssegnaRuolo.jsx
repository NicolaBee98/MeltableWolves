import { useState } from 'react'
import { ROLES } from '../../data/roles'

export function AssegnaRuolo({ ruoli, giocatori, aggiornaGiocatore }) {
  const opzioni = ruoli.map((slug) => ROLES.find((r) => r.slug === slug)).filter(Boolean)
  const [ruoloScelto, setRuoloScelto] = useState(opzioni[0]?.slug ?? '')
  const candidati = giocatori.filter((g) => g.vivo && !g.ruoloSlug)

  if (opzioni.length === 0) return null

  function assegna(giocatoreId) {
    aggiornaGiocatore(giocatoreId, { ruoloSlug: ruoloScelto })
  }

  return (
    <div className="assegna-ruolo">
      {opzioni.length > 1 && (
        <label>
          Che ruolo mostra la carta?
          <select value={ruoloScelto} onChange={(event) => setRuoloScelto(event.target.value)}>
            {opzioni.map((ruolo) => (
              <option key={ruolo.slug} value={ruolo.slug}>
                {ruolo.nome}
              </option>
            ))}
          </select>
        </label>
      )}
      <p>Chi ha questa carta? Clicca per assegnare.</p>
      {candidati.length === 0 ? (
        <p>Nessun giocatore disponibile da assegnare.</p>
      ) : (
        <ul>
          {candidati.map((g) => (
            <li key={g.id}>
              <button type="button" onClick={() => assegna(g.id)}>
                {g.nome}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

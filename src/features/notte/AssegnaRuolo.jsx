import { useState } from 'react'
import { ROLES } from '../../data/roles'

export function AssegnaRuolo({ ruoli, giocatori, aggiornaGiocatore }) {
  const opzioni = ruoli.map((slug) => ROLES.find((r) => r.slug === slug)).filter(Boolean)
  const [selezionato, setSelezionato] = useState(opzioni[0]?.slug ?? '')
  // se la variante scelta esaurisce la quantità nel mazzo, "opzioni" si
  // restringe: senza questo fallback il narratore potrebbe continuare ad
  // assegnare una variante già esaurita (rimasta selezionata da uno stato non aggiornato)
  const ruoloScelto = opzioni.some((r) => r.slug === selezionato) ? selezionato : opzioni[0]?.slug ?? ''
  const candidati = giocatori.filter((g) => g.vivo && !g.ruoloSlug)

  if (opzioni.length === 0) return null

  function assegna(giocatoreId) {
    const giocatore = giocatori.find((g) => g.id === giocatoreId)
    const storiaRuoli = giocatore?.storiaRuoli ?? []
    aggiornaGiocatore(giocatoreId, { ruoloSlug: ruoloScelto, storiaRuoli: [...storiaRuoli, ruoloScelto] })
  }

  return (
    <div className="assegna-ruolo">
      {opzioni.length > 1 && (
        <label>
          Che ruolo mostra la carta?
          <select value={ruoloScelto} onChange={(event) => setSelezionato(event.target.value)}>
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

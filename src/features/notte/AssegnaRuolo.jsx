import { useState } from 'react'
import { ROLES } from '../../data/roles'
import { ruoliAssegnabili, contaAssegnati } from '../../data/assegnazione'
import { RuoloIllustrazione } from '../../components/RuoloIcona'

export function AssegnaRuolo({ ruoli, giocatori, quantita = {}, selezioni, onCambiaSelezioni }) {
  const [avviso, setAvviso] = useState(null)
  const opzioni = ruoliAssegnabili(ruoli, giocatori, quantita)
    .map((slug) => ROLES.find((r) => r.slug === slug))
    .filter(Boolean)
  const [selezionato, setSelezionato] = useState(opzioni[0]?.slug ?? '')
  // se la variante scelta esaurisce la quantità nel mazzo, "opzioni" si
  // restringe: senza questo fallback il narratore potrebbe continuare ad
  // assegnare una variante già esaurita (rimasta selezionata da uno stato non aggiornato)
  const ruoloScelto = opzioni.some((r) => r.slug === selezionato) ? selezionato : opzioni[0]?.slug ?? ''

  if (opzioni.length === 0) return null

  const capacita = (quantita[ruoloScelto] ?? 1) - contaAssegnati(giocatori, ruoloScelto)
  const pendenti = selezioni[ruoloScelto] ?? []
  const tuttiIPendenti = Object.values(selezioni).flat()
  const candidati = giocatori.filter(
    (g) => g.vivo && !g.ruoloSlug && (pendenti.includes(g.id) || !tuttiIPendenti.includes(g.id)),
  )

  function cambiaVariante(slug) {
    setSelezionato(slug)
    setAvviso(null)
  }

  function toggle(giocatoreId) {
    if (pendenti.includes(giocatoreId)) {
      onCambiaSelezioni({ ...selezioni, [ruoloScelto]: pendenti.filter((id) => id !== giocatoreId) })
      setAvviso(null)
      return
    }
    if (pendenti.length >= capacita) {
      setAvviso(`Puoi selezionare al massimo ${capacita} ${capacita === 1 ? 'giocatore' : 'giocatori'} per questo ruolo.`)
      return
    }
    onCambiaSelezioni({ ...selezioni, [ruoloScelto]: [...pendenti, giocatoreId] })
    setAvviso(null)
  }

  return (
    <div className="assegna-ruolo">
      <RuoloIllustrazione slug={ruoloScelto} className="assegna-ruolo__illustrazione" />
      {opzioni.length > 1 && (
        <label>
          Che ruolo mostra la carta?
          <select value={ruoloScelto} onChange={(event) => cambiaVariante(event.target.value)}>
            {opzioni.map((ruolo) => (
              <option key={ruolo.slug} value={ruolo.slug}>
                {ruolo.nome}
              </option>
            ))}
          </select>
        </label>
      )}
      <p>
        Chi ha questa carta? Seleziona {capacita - pendenti.length} {capacita - pendenti.length === 1 ? 'giocatore' : 'giocatori'} in più, poi premi Avanti.
      </p>
      {avviso && <p className="assegna-ruolo__avviso">⚠️ {avviso}</p>}
      {candidati.length === 0 ? (
        <p>Nessun giocatore disponibile da assegnare.</p>
      ) : (
        <div className="scelta-giocatore__chips" role="group" aria-label="Chi ha questa carta">
          {candidati.map((g) => (
            <button
              key={g.id}
              type="button"
              className="chip"
              aria-pressed={pendenti.includes(g.id)}
              onClick={() => toggle(g.id)}
            >
              {g.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

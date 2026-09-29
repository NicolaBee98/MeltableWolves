import { useState } from 'react'
import { ROLES } from '../../data/roles'
import { RuoloIllustrazione } from '../../components/RuoloIcona'

// `ruoli` sono TUTTI i ruoli assegnabili a mano di questo passo, non solo
// quelli ancora scoperti: il picker resta visibile per l'intera durata del
// passo, anche a scelta già confermata, così il narratore può sempre
// ripensarci finché non preme "Avanti" (mai un menù che sparisce da solo).
export function AssegnaRuolo({ ruoli, giocatori, quantita = {}, selezioni, onCambiaSelezioni, onRimuovi }) {
  const [avviso, setAvviso] = useState(null)
  const opzioni = ruoli.map((slug) => ROLES.find((r) => r.slug === slug)).filter(Boolean)
  const [selezionato, setSelezionato] = useState(opzioni[0]?.slug ?? '')
  const ruoloScelto = opzioni.some((r) => r.slug === selezionato) ? selezionato : opzioni[0]?.slug ?? ''

  if (opzioni.length === 0) return null

  const capacita = quantita[ruoloScelto] ?? 1
  const pendenti = selezioni[ruoloScelto] ?? []
  const tuttiIPendenti = Object.values(selezioni).flat()
  // titolari REALI (già scritti su giocatori), non solo pendenti: senza
  // questi la chip di chi ha già la carta sparirebbe non appena confermata
  const titolari = giocatori.filter((g) => g.ruoloSlug === ruoloScelto)
  const selezionatiVisivi = [...pendenti, ...titolari.map((g) => g.id)]
  const candidati = giocatori.filter(
    (g) => g.vivo && (titolari.some((t) => t.id === g.id) || (!g.ruoloSlug && (pendenti.includes(g.id) || !tuttiIPendenti.includes(g.id)))),
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
    if (titolari.some((t) => t.id === giocatoreId)) {
      // deseleziona una scelta già confermata: annulla davvero l'assegnazione
      onRimuovi(giocatoreId, ruoloScelto)
      setAvviso(null)
      return
    }
    if (selezionatiVisivi.length >= capacita) {
      if (capacita === 1) {
        // un solo titolare possibile: un nuovo click sostituisce il
        // precedente invece di richiedere prima una deselezione esplicita
        const precedente = selezionatiVisivi[0]
        if (pendenti.includes(precedente)) {
          onCambiaSelezioni({ ...selezioni, [ruoloScelto]: [giocatoreId] })
        } else {
          onRimuovi(precedente, ruoloScelto)
          onCambiaSelezioni({ ...selezioni, [ruoloScelto]: [giocatoreId] })
        }
        setAvviso(null)
        return
      }
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
        Chi ha questa carta?{' '}
        {selezionatiVisivi.length < capacita
          ? `Seleziona ${capacita - selezionatiVisivi.length} ${capacita - selezionatiVisivi.length === 1 ? 'giocatore' : 'giocatori'} in più, poi premi Avanti.`
          : 'Puoi ancora cambiare la scelta finché non premi Avanti.'}
      </p>
      {candidati.length === 0 ? (
        <p>Nessun giocatore disponibile da assegnare.</p>
      ) : (
        <div className="scelta-giocatore__chips" role="group" aria-label="Chi ha questa carta">
          {candidati.map((g) => (
            <button
              key={g.id}
              type="button"
              className="chip"
              aria-pressed={selezionatiVisivi.includes(g.id)}
              onClick={() => toggle(g.id)}
            >
              {g.nome}
            </button>
          ))}
        </div>
      )}
      {/* sempre subito dopo le chip che l'hanno generato, mai sopra: stessa
          posizione in tutta l'app (vedi anche night-sequencer__avviso) */}
      {avviso && <p className="avviso">⚠️ {avviso}</p>}
    </div>
  )
}

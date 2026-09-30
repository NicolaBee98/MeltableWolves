import { useState } from 'react'
import { ROLES } from '../../data/roles'
import { RuoloIllustrazione } from '../../components/RuoloIcona'

// Guardia e Guardia Mannara sono la stessa carta agli occhi del narratore
// (pag. 8): "non è noto chi tra le Guardie patteggi per il branco", quindi
// si scelgono come UN unico gruppo ("le tre guardie"), mai indicando chi in
// particolare è la traditrice — niente selettore "che ruolo mostra la
// carta?" per loro. Chi diventa Guardia Mannara lo decide l'app a caso
// appena il gruppo è al completo (vedi assegnaGuardiaMannaraCasuale).
const GRUPPO_GUARDIE = ['guardia', 'guardia-mannara']

// `ruoli` sono TUTTI i ruoli assegnabili a mano di questo passo, non solo
// quelli ancora scoperti: il picker resta visibile per l'intera durata del
// passo, anche a scelta già confermata, così il narratore può sempre
// ripensarci finché non preme "Avanti" (mai un menù che sparisce da solo).
export function AssegnaRuolo({
  ruoli,
  giocatori,
  quantita = {},
  selezioni,
  onCambiaSelezioni,
  onRimuovi,
  domanda = 'Chi ha questa carta?',
}) {
  const [avviso, setAvviso] = useState(null)
  const modalitaGuardie = ruoli.length > 1 && ruoli.every((s) => GRUPPO_GUARDIE.includes(s))
  const opzioni = modalitaGuardie
    ? [ROLES.find((r) => r.slug === 'guardia')].filter(Boolean)
    : ruoli.map((slug) => ROLES.find((r) => r.slug === slug)).filter(Boolean)
  const [selezionato, setSelezionato] = useState(opzioni[0]?.slug ?? '')
  const ruoloScelto = opzioni.some((r) => r.slug === selezionato) ? selezionato : opzioni[0]?.slug ?? ''
  // il gruppo di slug "reali" coperti da questa scheda: solo ruoloScelto in
  // modalità normale, entrambi in modalità guardie
  const gruppoRuoli = modalitaGuardie ? GRUPPO_GUARDIE : [ruoloScelto]
  // le selezioni pendenti finiscono sempre sotto 'guardia' (placeholder):
  // quale diventerà davvero non si sceglie qui, vedi sopra
  const chiavePendenti = modalitaGuardie ? 'guardia' : ruoloScelto

  if (opzioni.length === 0) return null

  const capacita = gruppoRuoli.reduce((somma, slug) => somma + (quantita[slug] ?? 1), 0)
  const pendenti = selezioni[chiavePendenti] ?? []
  const tuttiIPendenti = Object.values(selezioni).flat()
  // titolari REALI (già scritti su giocatori), non solo pendenti: senza
  // questi la chip di chi ha già la carta sparirebbe non appena confermata
  const titolari = giocatori.filter((g) => gruppoRuoli.includes(g.ruoloSlug))
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
      onCambiaSelezioni({ ...selezioni, [chiavePendenti]: pendenti.filter((id) => id !== giocatoreId) })
      setAvviso(null)
      return
    }
    const titolare = titolari.find((t) => t.id === giocatoreId)
    if (titolare) {
      // deseleziona una scelta già confermata: annulla davvero l'assegnazione
      // (per il gruppo guardie, qualunque sia il suo slug reale/nascosto)
      onRimuovi(giocatoreId, titolare.ruoloSlug)
      setAvviso(null)
      return
    }
    if (selezionatiVisivi.length >= capacita) {
      if (capacita === 1) {
        // un solo titolare possibile: un nuovo click sostituisce il
        // precedente invece di richiedere prima una deselezione esplicita
        const precedente = selezionatiVisivi[0]
        if (pendenti.includes(precedente)) {
          onCambiaSelezioni({ ...selezioni, [chiavePendenti]: [giocatoreId] })
        } else {
          const precedenteTitolare = titolari.find((t) => t.id === precedente)
          onRimuovi(precedente, precedenteTitolare?.ruoloSlug ?? ruoloScelto)
          onCambiaSelezioni({ ...selezioni, [chiavePendenti]: [giocatoreId] })
        }
        setAvviso(null)
        return
      }
      setAvviso(`Puoi selezionare al massimo ${capacita} ${capacita === 1 ? 'giocatore' : 'giocatori'} per questo ruolo.`)
      return
    }
    onCambiaSelezioni({ ...selezioni, [chiavePendenti]: [...pendenti, giocatoreId] })
    setAvviso(null)
  }

  return (
    <div className="assegna-ruolo">
      <RuoloIllustrazione slug={ruoloScelto} className="assegna-ruolo__illustrazione" />
      {!modalitaGuardie && opzioni.length > 1 && (
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
        {domanda}{' '}
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

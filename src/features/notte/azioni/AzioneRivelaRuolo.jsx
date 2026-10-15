import { useState } from 'react'
import { ROLES, ruoloPerDisplay } from '../../../data/roles'
import { segnaUsoStanotte, aggiornaTuttiConRuolo } from '../../../data/effettiNotte'
import { ruoliAssegnabili, guardiaIncerta, distinguiGuardia, conRuolo, cartaInMano } from '../../../data/assegnazione'
import { cartaFisicaPath, variantePerGiocatore } from '../../../data/assetRuoli'
import { CartaSchermoIntero } from '../../../components/CartaSchermoIntero'

// Carte non proponibili per un bersaglio ignoto: il Borgomastro è un titolo
// (non una carta fisica) e la Cartomante sta già guardando la carta di un
// altro. Il Medium non serve: ruoliAssegnabili conta già le sue copie.
// Tutte le altre carte ancora assegnabili vanno bene, anche Alchimista, Boia,
// Scemo, Innocente, Suocera e Fantasma: i loro eventi dedicati funzionano
// anche per chi ha già quel ruoloSlug (vedi candidatiRivelazione).
const NON_CARTE_PROPONIBILI = ['borgomastro', 'cartomante']

// `reale`: chi guarda la carta fisica (Cartomante e Medium) vede la carta vera, quindi
// per loro la Guardia Mannara non è mascherata da Guardia (come invece nel resto dell'app)
function nomeRuolo(ruoloSlug, reale = false) {
  return ROLES.find((r) => r.slug === (reale ? ruoloSlug : ruoloPerDisplay(ruoloSlug)))?.nome ?? 'ruolo sconosciuto'
}


// Usato da Cartomante (bersaglio vivo, "alternativa al Veggente" ma rivela
// il ruolo intero) e Medium (bersaglio morto, il "vecchio ruolo").
export function AzioneRivelaRuolo({
  giocatori,
  aggiornaGiocatore,
  round,
  ruoloSlugAttore,
  etichettaAttore,
  bersaglio,
  ruoliSelezionati = [],
  quantita = {},
  vivoAIngresso = (g) => g.vivo,
}) {
  // se il bersaglio non ha ancora un ruolo noto all'app (nessuno step
  // dedicato l'ha ancora assegnato), il narratore vede comunque la carta
  // fisica: gliela si chiede per assegnarla subito, invece di registrare
  // "ruolo sconosciuto" — il potere fa guadagnare informazioni anche a lui
  const [targetInAttesaDiRuolo, setTargetInAttesaDiRuolo] = useState(null)
  // carta scelta per un bersaglio ignoto (o per distinguere la Guardia
  // Mannara): { id, prima, ruoloSlug } dove `prima` è {id: {ruoloSlug,
  // storiaRuoli, guardiaDistinta}} dei giocatori toccati. Resta modificabile
  // fino ad Avanti, quindi si tiene com'era per disfarla
  const [assegnato, setAssegnato] = useState(null)
  // il bersaglio è una Guardia da distinguere dalla Mannara (non un ruolo ignoto)
  const [guardiaTarget, setGuardiaTarget] = useState(false)
  // carta mostrata a schermo intero al giocatore interrogato (facoltativo)
  const [cartaAperta, setCartaAperta] = useState(false)
  // sia la Cartomante sia il Medium guardano la carta FISICA: vedono (e fanno distinguere
  // al narratore) la Guardia Mannara, che per il resto dell'app resta mascherata da Guardia
  const reale = true
  const ruoli = [ruoloSlugAttore]
  const potere = `${ruoloSlugAttore}-indagine`
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => (bersaglio === 'morto' ? !vivoAIngresso(g) : vivoAIngresso(g) && g.id !== attore?.id))
  const indagineStanotte = attore?.ultimaIndagine?.notte === round ? attore.ultimaIndagine : null

  function registraIndagine(targetId, ruoloRivelato) {
    if (attore) {
      aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlugAttore, {
        ultimaIndagine: { targetId, ruoloRivelato, notte: round },
      })
    }
    // cambiare bersaglio non è un nuovo uso
    if (!indagineStanotte) segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  // toglie l'indagine di stanotte e il suo uso: si torna a "nessuna scelta"
  function liberaIndagine() {
    aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlugAttore, (g) => {
      const usi = [...(g.usiNotte ?? [])]
      const idx = usi.lastIndexOf(potere)
      if (idx >= 0) usi.splice(idx, 1)
      return { ultimaIndagine: null, usiNotte: usi }
    })
  }

  // disfa la carta scritta sul bersaglio ignoto (ruolo e storia come prima)
  function disfaAssegnazione() {
    if (!assegnato) return
    for (const [id, stato] of Object.entries(assegnato.prima)) aggiornaGiocatore(id, stato)
    liberaIndagine()
    setAssegnato(null)
  }

  function confermaScelta(targetId) {
    if (indagineStanotte?.targetId === targetId) return liberaIndagine()
    const target = giocatori.find((g) => g.id === targetId)
    // bersaglio ignoto, o una Guardia che potrebbe essere la Mannara (solo
    // per la Cartomante): il narratore dice quale carta vede
    if (target && (!target.ruoloSlug || (reale && guardiaIncerta(target, ruoliSelezionati, quantita)))) {
      setGuardiaTarget(Boolean(target.ruoloSlug))
      setTargetInAttesaDiRuolo(targetId)
      return
    }
    registraIndagine(targetId, target && cartaInMano(target))
  }

  // la carta si può cambiare (altra chip) o deselezionare (stessa chip)
  function confermaRuoloVisto(ruoloSlug) {
    if (assegnato?.ruoloSlug === ruoloSlug) return disfaAssegnazione()
    // stato com'era prima di qualunque scelta fatta qui (anche la precedente)
    const prima = { ...assegnato?.prima }
    const originali = giocatori.map((g) => (prima[g.id] ? { ...g, ...prima[g.id] } : g))
    const target = originali.find((g) => g.id === targetInAttesaDiRuolo)
    const patch = guardiaTarget
      ? distinguiGuardia(originali, target.id, ruoloSlug)
      : { [target.id]: { ruoloSlug, storiaRuoli: conRuolo(target.storiaRuoli, ruoloSlug) } }
    for (const id of Object.keys(patch)) {
      const g = originali.find((x) => x.id === id)
      prima[id] ??= { ruoloSlug: g.ruoloSlug, storiaRuoli: g.storiaRuoli ?? [], guardiaDistinta: g.guardiaDistinta }
    }
    // chi era stato toccato dalla scelta precedente e non da questa torna com'era
    for (const [id, stato] of Object.entries(prima)) aggiornaGiocatore(id, { ...stato, ...patch[id] })
    registraIndagine(target.id, ruoloSlug)
    setAssegnato({ id: target.id, prima, ruoloSlug })
  }

  // la carta fisica da mostrare: la Cartomante vede quella vera (anche la Guardia
  // Mannara), il Medium la stessa maschera del resto dell'app
  // (se la variante del Medium è cambiata a passo aperto l'indagine ha solo l'esito: si ricava dal bersaglio)
  const bersaglioIndagato = giocatori.find((g) => g.id === indagineStanotte?.targetId)
  const ruoloCarta = indagineStanotte?.ruoloRivelato ?? bersaglioIndagato?.ruoloSlug
  const cartaMostrata = ruoloCarta
    ? cartaFisicaPath(reale ? ruoloCarta : ruoloPerDisplay(ruoloCarta), bersaglioIndagato?.ruoloSlug === ruoloCarta ? variantePerGiocatore(giocatori, bersaglioIndagato.id) : undefined)
    : null

  // etichetta + pulsante carta: visibili appena c'è una carta, anche mentre si sceglie
  const esito = indagineStanotte && (
    <>
      <p className="azione-indagine__etichetta-esito">
        Mostra a {etichettaAttore} la carta: {nomeRuolo(ruoloCarta, reale)}
      </p>
      {cartaMostrata && (
        <button type="button" onClick={() => setCartaAperta(true)}>
          Mostra carta
        </button>
      )}
      {cartaAperta && cartaMostrata && (
        <CartaSchermoIntero
          src={cartaMostrata}
          etichetta={`Carta: ${nomeRuolo(ruoloCarta, reale)}`}
          onChiudi={() => setCartaAperta(false)}
        />
      )}
    </>
  )

  if (targetInAttesaDiRuolo) {
    const target = giocatori.find((g) => g.id === targetInAttesaDiRuolo)
    // le chip si calcolano sullo stato di prima della scelta, altrimenti la carta
    // scelta uscirebbe dalla lista e le chip si riordinerebbero
    const prima = assegnato?.prima ?? {}
    const giocatoriPrima = giocatori.map((g) => (prima[g.id] ? { ...g, ...prima[g.id] } : g))
    // qui, a differenza dell'assegnazione automatica di inizio notte, anche
    // il Villico va offerto: il narratore vede la carta fisica in mano, può
    // benissimo essere quella
    const opzioni = guardiaTarget
      ? ['guardia', 'guardia-mannara']
      : ruoliAssegnabili(
          ruoliSelezionati.filter((slug) => !NON_CARTE_PROPONIBILI.includes(slug)),
          giocatoriPrima,
          quantita,
        )
    return (
      <div className="azione-indagine">
        <p>
          {guardiaTarget
            ? `${target?.nome} è una Guardia: la carta è una Guardia o la Guardia Mannara?`
            : `La carta di ${target?.nome} è ancora sconosciuta: quale ruolo mostra?`}
        </p>
        <div className="scelta-giocatore__chips" role="group" aria-label="Che ruolo era">
          {opzioni.map((slug) => (
            <button
              key={slug}
              type="button"
              className="chip"
              aria-pressed={assegnato?.ruoloSlug === slug}
              onClick={() => confermaRuoloVisto(slug)}
            >
              {nomeRuolo(slug, reale)}
            </button>
          ))}
        </div>
        {assegnato && esito}
        <button
          type="button"
          onClick={() => {
            disfaAssegnazione()
            setTargetInAttesaDiRuolo(null)
          }}
        >
          Annulla (cambia bersaglio)
        </button>
      </div>
    )
  }

  if (candidati.length === 0) {
    return <p>{bersaglio === 'morto' ? 'Nessun defunto: chiamalo comunque.' : 'Nessun giocatore da scegliere.'}</p>
  }

  // come il Veggente: la chip resta modificabile finché non si preme
  // "Avanti" e, se già premuta, si deseleziona. Anche la carta scelta per un
  // bersaglio ignoto (qui sopra) si cambia o si toglie, senza residui.
  return (
    <div className="azione-indagine">
      <p>{bersaglio === 'morto' ? 'Chi interrogare (defunto)' : 'Chi indagare'}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label={bersaglio === 'morto' ? 'Chi interrogare (defunto)' : 'Chi indagare'}>
        {candidati.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={indagineStanotte?.targetId === g.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
      {esito}
    </div>
  )
}

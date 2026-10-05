import { MARCATORE_LEGAME_EREDITATO } from '../../../data/risoluzioneNotte'

const AVVISO_LEGAME = {
  apprendista: 'Non hai scelto il maestro',
  cavaliere: 'Non hai scelto chi proteggere',
  'figlia-dei-lupi': 'Non hai scelto il genitore',
}

// la chip scelta resta sempre modificabile finché non si preme "Avanti"
// (principio generale): il legame è permanente per tutta la partita una
// volta stabilito (pag. 9-10), ma finché siamo nel passo di questa notte il
// narratore può ancora ripensarci, come per ogni altra azione — niente più
// testo statico "Legame già stabilito" che nasconde le chip.
export function AzioneLegame({ giocatori, aggiornaGiocatore, ruoloSlugAttore, tipoLegame, etichetta, attoreId, vivoAIngresso = (g) => g.vivo }) {
  // `attoreId`: quale titolare agisce (titolare e Mimo hanno ognuno il proprio legame)
  const attore = attoreId ? giocatori.find((g) => g.id === attoreId) : giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  // il Mimo ha già `legame` occupato dal legame con chi imita ('mimo'): il
  // legame del ruolo copiato sta in `legameMimo` (letto da risolviLegami)
  const campo = attore?.legame?.tipo === 'mimo' ? 'legameMimo' : 'legame'
  // Cavaliere e Mimo-Cavaliere si sacrificano per due persone DIVERSE: chi è già
  // protetto dall'altro non è tra i candidati
  const giaProtetti =
    tipoLegame === 'cavaliere'
      ? giocatori
          .filter((g) => g.id !== attore?.id)
          .flatMap((g) => [g.legame, g.legameMimo])
          .filter((l) => l?.tipo === 'cavaliere')
          .map((l) => l.targetId)
      : []
  const candidati = giocatori.filter((g) => vivoAIngresso(g) && g.id !== attore?.id && !giaProtetti.includes(g.id))
  // solo se il legame è di QUESTO tipo: chi interpreta l'attore può essere
  // cambiato prima di Avanti (vedi rimuoviAssegnazione in NightSequencer),
  // ma se il giocatore appena tolto da questo ruolo aveva già un legame di
  // un ruolo precedente (es. un altro Apprendista con un altro maestro), non
  // va scambiato per il legame di questo attore
  const bersaglioAttuale = attore?.[campo]?.tipo === tipoLegame ? attore[campo].targetId : undefined

  function confermaScelta(targetId) {
    if (!attore) return
    // click sulla chip già scelta: annulla il legame
    aggiornaGiocatore(attore.id, { [campo]: targetId === bersaglioAttuale ? undefined : { tipo: tipoLegame, targetId } })
  }

  // ruolo ereditato (Apprendista): il legame è già "scarico", niente da scegliere
  if (attore?.poteriUsati?.includes(MARCATORE_LEGAME_EREDITATO) && !attore[campo]) {
    return <p>Ruolo ereditato: il legame è già stato usato, niente da scegliere.</p>
  }

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <p>{etichetta}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label={etichetta}>
        {candidati.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={bersaglioAttuale === g.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
      {/* non bloccante: il narratore può voler lasciare Avanti senza scelta */}
      {!bersaglioAttuale && <p className="avviso">⚠️ {AVVISO_LEGAME[tipoLegame]}: il legame andrà perso.</p>}
    </div>
  )
}

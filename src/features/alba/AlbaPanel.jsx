import { useEffect } from 'react'
import { annunciAlba } from '../../data/alba'
import { ConcludiPartita } from '../../components/ConcludiPartita'
import { condizioniVittoria } from '../../data/vittoria'
import { resuscitaPatch } from '../../data/effettiNotte'
import { conRuolo } from '../../data/assegnazione'
import { conPotereDisponibile, conPotere } from '../../data/eventiSpeciali'
import { EventiSpeciali } from '../giorno/EventiSpeciali'
import { annullaMorteCompleta, dichiaraAnticoSbranato, dichiaraBoiaGiustizia } from '../giorno/annullaMorte'

// solo le morti notturne (poteri mortali o inconvenienti): rogo e morte
// improvvisa sono decessi diurni e non vanno mostrati all'alba
const CAUSE_MORTE_NOTTURNE = ['notte', 'crepacuore', 'sacrificio']

function etichettaMorto(g) {
  if (g.mortoDa === 'boia' && g.causaMorte === 'colpo') return `${g.nome} (giustiziato/a dal Boia)`
  return g.causaMorte === 'crepacuore' && g.mortoNotte === undefined ? `${g.nome} (crepacuore)` : g.nome
}

export function AlbaPanel({
  giocatori,
  round,
  aggiornaGiocatore,
  annullaMorte,
  ruoliSelezionati = [],
  quantita = {},
  onVaiAlVoto,
  onGalloSaltaGiorno = () => {},
  onConcludiPartita = () => {},
}) {
  // chi è stato resuscitato nella notte (Guaritore, Sciacallo Mannaro) è
  // rimasto morto fino ad ora: rinasce da solo all'apertura dell'Alba (vedi
  // l'effetto qui sotto), il promemoria è in annunciAlba
  const daResuscitare = giocatori.filter((g) => !g.vivo && g.resuscitaAllAlba === round)
  // chi sta per essere resuscitato non si annuncia anche come morto stanotte
  const morti = giocatori.filter(
    (g) =>
      !g.vivo &&
      ((g.mortoNotte === round && CAUSE_MORTE_NOTTURNE.includes(g.causaMorte) && g.resuscitaAllAlba !== round) ||
        // giustiziato dal Boia già all'alba: morto nel giorno che segue
        (g.causaMorte === 'colpo' && g.mortoDa === 'boia' && g.mortoGiorno === round + 1) ||
        // il partner di chi è stato giustiziato all'alba muore di crepacuore nello stesso istante
        (g.causaMorte === 'crepacuore' && g.mortoGiorno === round + 1 && g.mortoNotte === undefined)),
  )
  const annunci = annunciAlba(giocatori, round)
  const vittoria = condizioniVittoria(giocatori, quantita)
  // copre sia "non è mai stato eletto" (pag. 11: si elegge all'alba del
  // primo giorno) sia "il Borgomastro in carica è morto": in entrambi i
  // casi nessun giocatore vivo ha il titolo, e serve eleggerne uno tramite
  // "Eventi speciali"
  const borgomastroDaEleggere =
    ruoliSelezionati.includes('borgomastro') && !giocatori.some((g) => g.eBorgomastro && g.vivo)

  // assegna l'identità di un ruolo a rivelazione diurna solo quando si
  // rivela davvero (vedi nightSteps.js), non preventivamente a inizio partita
  function dichiaraRivelazione(ruoloSlug, id) {
    const target = giocatori.find((g) => g.id === id)
    if (ruoloSlug === 'lantico' && target && !target.vivo) {
      dichiaraAnticoSbranato(id, giocatori, aggiornaGiocatore, annullaMorte)
      return
    }
    // il Mimo-Suocera ha già lo slug: si segna solo che si è rivelato
    if (ruoloSlug === 'suocera' && target?.ruoloSlug === 'suocera') {
      aggiornaGiocatore(id, { poteriUsati: conPotere(target.poteriUsati, 'suocera-rivelata') })
      return
    }
    aggiornaGiocatore(id, {
      ruoloSlug,
      storiaRuoli: conRuolo(target?.storiaRuoli, ruoloSlug),
      // l'Innocente (anche il Mimo che lo copia) si rivela una volta sola
      ...(ruoloSlug === 'innocente' && { poteriUsati: conPotere(target?.poteriUsati, 'innocente-rivelato') }),
    })
  }

  function dichiaraElezioneBorgomastro(id) {
    giocatori.filter((g) => g.eBorgomastro).forEach((g) => aggiornaGiocatore(g.id, { eBorgomastro: false }))
    aggiornaGiocatore(id, { eBorgomastro: true })
  }

  function dichiaraGalloSaltaGiorno() {
    const gallo = conPotereDisponibile(giocatori, 'gallo-mannaro', 'gallo-salta-giorno')
    if (gallo) aggiornaGiocatore(gallo.id, { poteriUsati: conPotere(gallo.poteriUsati, 'gallo-salta-giorno') })
    onGalloSaltaGiorno()
  }

  // L'Antico sbranato di notte ha perso la prima vita ma sopravvive: all'alba
  // si rivela e da qui gioca da Villico (una sola vita, nessun potere).
  // Resta `anticoSbranatoNotte`: l'annuncio dell'alba continua a comparire
  const anticiDaRivelare = giocatori.filter(
    (g) => g.vivo && g.ruoloSlug === 'lantico' && g.anticoSbranatoNotte === round,
  )

  function dichiaraAnticoRivelato(id) {
    const antico = giocatori.find((g) => g.id === id)
    aggiornaGiocatore(id, { ruoloSlug: 'villico', storiaRuoli: [...(antico?.storiaRuoli ?? []), 'villico'] })
  }

  // idempotente (StrictMode, refresh): tolto il marcatore daResuscitare è
  // vuoto, e resuscitaPatch non fa nulla su un giocatore già vivo
  useEffect(() => {
    for (const g of daResuscitare) {
      const patch = resuscitaPatch(g, round)
      if (patch) aggiornaGiocatore(g.id, { ...patch, resuscitaAllAlba: undefined, mortoGiorno: undefined })
    }
  }, [daResuscitare, round, aggiornaGiocatore])

  // corregge una morte dichiarata per errore (anche la sua catena: crepacuore,
  // Cucciolo, Apprendista...): qui serve per un decesso notturno visto solo
  // all'alba
  function dichiaraAnnullaMorte(id) {
    annullaMorteCompleta(id, giocatori, aggiornaGiocatore, annullaMorte)
  }

  return (
    <section className="alba-panel">
      <h2 className="titolo-fase">Alba {round}</h2>
      {morti.length === 0 ? (
        <p>Nessuno è morto questa notte.</p>
      ) : (
        <ul className="alba-panel__morti">
          {morti.map((g) => (
            <li key={g.id}>{etichettaMorto(g)}</li>
          ))}
        </ul>
      )}
      {annunci.length > 0 && (
        <ul className="alba-panel__annunci">
          {annunci.map((testo) => (
            <li key={testo}>{testo}</li>
          ))}
        </ul>
      )}
      {anticiDaRivelare.map((g) => (
        <div key={g.id} className="alba-panel__antico">
          <p>
            {g.nome} è L'Antico: è stato sbranato e ha perso la prima vita. Si rivela al villaggio mostrando la sua carta.
          </p>
          <button type="button" onClick={() => dichiaraAnticoRivelato(g.id)}>
            Conferma la rivelazione di {g.nome}
          </button>
        </div>
      ))}
      {vittoria.length > 0 && (
        <>
          <ul className="alba-panel__vittoria">
            {vittoria.map((testo) => (
              <li key={testo}>🏆 {testo}</li>
            ))}
          </ul>
          <ConcludiPartita onConcludi={onConcludiPartita} />
        </>
      )}
      {borgomastroDaEleggere && (
        <p className="avviso">⚠️ Il villaggio deve eleggere un Borgomastro (menu "Eventi speciali").</p>
      )}
      <button type="button" onClick={onVaiAlVoto}>
        Vai al voto
      </button>
      <EventiSpeciali
        giocatori={giocatori}
        ruoliSelezionati={ruoliSelezionati}
        quantita={quantita}
        contesto="alba"
        round={round}
        onRivelazione={dichiaraRivelazione}
        // il Boia può giustiziare anche all'alba: la morte conta nel giorno che segue
        onBoiaGiustizia={(boiaId, id) => dichiaraBoiaGiustizia(boiaId, id, giocatori, aggiornaGiocatore, round + 1)}
        onElezioneBorgomastro={dichiaraElezioneBorgomastro}
        onGalloSaltaGiorno={dichiaraGalloSaltaGiorno}
        // la Suocera resta "?" per tutta la partita finché non muore (pag.
        // 21, può capitare anche di notte): è a tutti gli effetti una
        // rivelazione diurna a ruolo fisso, riusa lo stesso handler
        onSuoceraRivelazione={(id) => dichiaraRivelazione('suocera', id)}
        onAnnullaMorte={dichiaraAnnullaMorte}
      />
    </section>
  )
}

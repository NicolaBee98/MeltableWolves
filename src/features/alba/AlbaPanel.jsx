import { annunciAlba } from '../../data/alba'
import { condizioniVittoria } from '../../data/vittoria'
import { EventiSpeciali } from '../giorno/EventiSpeciali'

// solo le morti notturne (poteri mortali o inconvenienti): rogo e morte
// improvvisa sono decessi diurni e non vanno mostrati all'alba
const CAUSE_MORTE_NOTTURNE = ['notte', 'crepacuore', 'sacrificio']

export function AlbaPanel({
  giocatori,
  round,
  aggiornaGiocatore,
  ruoliSelezionati = [],
  quantita = {},
  onVaiAlVoto,
  onGalloSaltaGiorno = () => {},
}) {
  const morti = giocatori.filter(
    (g) => !g.vivo && g.mortoNotte === round && CAUSE_MORTE_NOTTURNE.includes(g.causaMorte),
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
    aggiornaGiocatore(id, { ruoloSlug, storiaRuoli: [...(target?.storiaRuoli ?? []), ruoloSlug] })
  }

  function dichiaraElezioneBorgomastro(id) {
    giocatori.filter((g) => g.eBorgomastro).forEach((g) => aggiornaGiocatore(g.id, { eBorgomastro: false }))
    aggiornaGiocatore(id, { eBorgomastro: true })
  }

  function dichiaraGalloSaltaGiorno() {
    const gallo = giocatori.find((g) => g.ruoloSlug === 'gallo-mannaro' && g.vivo)
    if (gallo) aggiornaGiocatore(gallo.id, { poteriUsati: [...(gallo.poteriUsati ?? []), 'gallo-salta-giorno'] })
    onGalloSaltaGiorno()
  }

  // la Suocera resta "?" per tutta la partita finché non muore (pag. 21):
  // può capitare anche di notte, quindi va rivelabile già all'alba
  function dichiaraSuoceraRivelazione(id) {
    const target = giocatori.find((g) => g.id === id)
    aggiornaGiocatore(id, { ruoloSlug: 'suocera', storiaRuoli: [...(target?.storiaRuoli ?? []), 'suocera'] })
  }

  return (
    <section className="alba-panel">
      <h2>Alba</h2>
      {morti.length === 0 ? (
        <p>Nessuno è morto questa notte.</p>
      ) : (
        <ul className="alba-panel__morti">
          {morti.map((g) => (
            <li key={g.id}>{g.nome}</li>
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
      {vittoria.length > 0 && (
        <ul className="alba-panel__vittoria">
          {vittoria.map((testo) => (
            <li key={testo}>🏆 {testo}</li>
          ))}
        </ul>
      )}
      {borgomastroDaEleggere && (
        <p className="alba-panel__promemoria">
          ⚠️ Il villaggio deve eleggere un Borgomastro (menu "Eventi speciali").
        </p>
      )}
      <button type="button" onClick={onVaiAlVoto}>
        Vai al voto
      </button>
      <EventiSpeciali
        giocatori={giocatori}
        ruoliSelezionati={ruoliSelezionati}
        quantita={quantita}
        contesto="alba"
        onRivelazione={dichiaraRivelazione}
        onElezioneBorgomastro={dichiaraElezioneBorgomastro}
        onGalloSaltaGiorno={dichiaraGalloSaltaGiorno}
        onSuoceraRivelazione={dichiaraSuoceraRivelazione}
      />
    </section>
  )
}

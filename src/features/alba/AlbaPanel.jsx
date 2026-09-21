import { annunciAlba } from '../../data/alba'
import { condizioniVittoria } from '../../data/vittoria'
import { EventiSpeciali } from '../giorno/EventiSpeciali'

// solo le morti notturne (poteri mortali o inconvenienti): rogo e morte
// improvvisa sono decessi diurni e non vanno mostrati all'alba
const CAUSE_MORTE_NOTTURNE = ['notte', 'crepacuore']

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
  const vittoria = condizioniVittoria(giocatori)

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
      />
    </section>
  )
}

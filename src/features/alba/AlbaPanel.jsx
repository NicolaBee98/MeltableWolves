import { annunciAlba } from '../../data/alba'
import { condizioniVittoria } from '../../data/vittoria'

// solo le morti notturne (poteri mortali o inconvenienti): rogo e morte
// improvvisa sono decessi diurni e non vanno mostrati all'alba
const CAUSE_MORTE_NOTTURNE = ['notte', 'crepacuore']

export function AlbaPanel({ giocatori, round, onVaiAlVoto }) {
  const morti = giocatori.filter(
    (g) => !g.vivo && g.mortoNotte === round && CAUSE_MORTE_NOTTURNE.includes(g.causaMorte),
  )
  const annunci = annunciAlba(giocatori, round)
  const vittoria = condizioniVittoria(giocatori)

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
    </section>
  )
}

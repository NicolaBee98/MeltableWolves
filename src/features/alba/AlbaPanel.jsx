import { annunciAlba } from '../../data/alba'

export function AlbaPanel({ giocatori, round, onVaiAlVoto }) {
  const morti = giocatori.filter((g) => !g.vivo && g.mortoNotte === round)
  const annunci = annunciAlba(giocatori, round)

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
      <button type="button" onClick={onVaiAlVoto}>
        Vai al voto
      </button>
    </section>
  )
}

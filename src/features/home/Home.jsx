export function Home({ onNuovaPartita, onApriLibretto, onApriMazzo }) {
  return (
    <section className="home">
      <p className="home__tagline">Assistente per il Narratore</p>
      <button type="button" className="home__cta" onClick={onNuovaPartita}>
        Nuova Partita
      </button>
      <button type="button" onClick={onApriLibretto}>
        Regolamento
      </button>
      <button type="button" onClick={onApriMazzo}>
        Mazzo
      </button>
    </section>
  )
}

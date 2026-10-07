export function Home({ onNuovaPartita, onApriLibretto, onApriMazzo, onApriOffline }) {
  return (
    <section className="home">
      <p className="home__tagline">Assistente per il Narratore</p>
      <button type="button" className="home__cta" onClick={onNuovaPartita}>
        Nuova Partita
      </button>
      <div className="home__riga">
        <button type="button" onClick={onApriMazzo}>
          Mazzo
        </button>
        <button type="button" onClick={onApriLibretto}>
          Regolamento
        </button>
      </div>
      <button type="button" className="home__offline" onClick={onApriOffline}>
        <img src="/assets/icone/ui/freccia.svg" alt="" aria-hidden="true" className="home__offline-icona" />
        Scarica offline
      </button>
    </section>
  )
}

export function Home({ onNuovaPartita }) {
  return (
    <section className="home">
      <button type="button" onClick={onNuovaPartita}>
        Nuova Partita
      </button>
      <button type="button" disabled title="Prossimamente">
        Regolamento
      </button>
      <button type="button" disabled title="Prossimamente">
        Mazzo
      </button>
      <button type="button" className="home__impostazioni" disabled title="Prossimamente" aria-label="Impostazioni">
        ⚙️
      </button>
    </section>
  )
}

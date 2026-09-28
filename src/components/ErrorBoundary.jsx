import { Component } from 'react'

// Un errore di rendering in un punto qualsiasi dell'app manderebbe
// altrimenti tutto a schermo bianco nel mezzo di una partita dal vivo,
// senza nessun modo di recuperare se non capire da soli di dover
// ricaricare. Lo stato della partita è già salvato in localStorage a ogni
// modifica (vedi le varie useX in src/state/), quindi un semplice reload
// basta a riprendere da dove si era rimasti: qui serve solo mostrarlo
// chiaramente invece di una pagina bianca.
export class ErrorBoundary extends Component {
  state = { errore: null }

  static getDerivedStateFromError(errore) {
    return { errore }
  }

  componentDidCatch(errore, info) {
    console.error('Errore non gestito:', errore, info)
  }

  render() {
    if (!this.state.errore) return this.props.children

    return (
      <main className="app app--home">
        <h1 className="app__titolo">
          <span className="app__titolo-meltable">Meltable</span>
          <span className="app__titolo-wolves">Wolves</span>
        </h1>
        <section className="errore-app">
          <p>Si è verificato un errore imprevisto.</p>
          <p>I dati della partita sono salvati: ricaricando la pagina si riprende da dove si era rimasti.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Ricarica
          </button>
        </section>
      </main>
    )
  }
}

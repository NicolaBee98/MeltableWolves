import { useState } from 'react'

// Wrapper di test: tiene i giocatori in uno stato reale (le azioni scrivono la
// scelta di stanotte sul giocatore, non in useState). Un refresh a metà passo si
// simula passando in `iniziali` i giocatori già con la scelta scritta.
export function ConStato({ Azione, iniziali, onAggiorna, ...props }) {
  const [giocatori, setGiocatori] = useState(iniziali)
  return (
    <Azione
      {...props}
      giocatori={giocatori}
      // come il ripiego di usePartita senza snapshot: semplice resurrezione
      annullaMorte={(id) => {
        props.annullaMorte?.(id)
        setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoDa: undefined } : g)))
      }}
      aggiornaGiocatore={(id, patch) => {
        onAggiorna?.(id, patch)
        setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
      }}
    />
  )
}

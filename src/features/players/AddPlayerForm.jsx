import { useState } from 'react'

// nomiEsistenti: due giocatori con lo stesso nome sono indistinguibili nelle
// scelte (chip, log): si blocca l'aggiunta con un avviso, senza altro
export function AddPlayerForm({ onAdd, nomiEsistenti = [] }) {
  const [nome, setNome] = useState('')
  const [duplicato, setDuplicato] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    const pulito = nome.trim()
    if (!pulito) return
    if (nomiEsistenti.some((n) => n.trim().toLowerCase() === pulito.toLowerCase())) {
      setDuplicato(true)
      return
    }
    onAdd(pulito)
    setNome('')
  }

  return (
    <form onSubmit={handleSubmit} className="add-player-form">
      <input
        type="text"
        placeholder="Nome giocatore"
        value={nome}
        onChange={(event) => {
          setNome(event.target.value)
          setDuplicato(false)
        }}
      />
      <button type="submit">Aggiungi</button>
      {duplicato && (
        <p className="avviso" role="alert">
          ⚠️ C'è già un giocatore con questo nome: usane uno diverso (es. aggiungi l'iniziale del cognome).
        </p>
      )}
    </form>
  )
}

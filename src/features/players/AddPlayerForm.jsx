import { useState } from 'react'

export function AddPlayerForm({ onAdd }) {
  const [nome, setNome] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!nome.trim()) return
    onAdd(nome.trim())
    setNome('')
  }

  return (
    <form onSubmit={handleSubmit} className="add-player-form">
      <input
        type="text"
        placeholder="Nome giocatore"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
      />
      <button type="submit">Aggiungi</button>
    </form>
  )
}

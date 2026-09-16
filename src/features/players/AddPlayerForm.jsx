import { useState } from 'react'

export function AddPlayerForm({ roles, onAdd }) {
  const [nome, setNome] = useState('')
  const [ruoloSlug, setRuoloSlug] = useState(roles[0]?.slug ?? '')

  function handleSubmit(event) {
    event.preventDefault()
    if (!nome.trim()) return
    onAdd(nome.trim(), ruoloSlug)
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
      <select value={ruoloSlug} onChange={(event) => setRuoloSlug(event.target.value)}>
        {roles.map((ruolo) => (
          <option key={ruolo.slug} value={ruolo.slug}>
            {ruolo.nome}
          </option>
        ))}
      </select>
      <button type="submit">Aggiungi</button>
    </form>
  )
}

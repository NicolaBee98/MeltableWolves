export function risultatoVotazione(voti, candidatiIds) {
  const maxVoti = Math.max(0, ...candidatiIds.map((id) => voti[id] ?? 0))
  if (maxVoti === 0) return { vincitori: [], maxVoti: 0 }

  const vincitori = candidatiIds.filter((id) => (voti[id] ?? 0) === maxVoti)
  return { vincitori, maxVoti }
}

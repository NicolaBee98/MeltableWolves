const ETICHETTA_CAUSA = { notte: ' di notte', rogo: ' al rogo', colpo: ' sul colpo' }

export function rilevaEventi(precedenti, correnti, round) {
  const eventi = []
  const mappaPrecedenti = new Map(precedenti.map((g) => [g.id, g]))

  for (const giocatore of correnti) {
    const prima = mappaPrecedenti.get(giocatore.id)
    if (!prima) continue

    if (prima.vivo && !giocatore.vivo) {
      eventi.push({ round, messaggio: `${giocatore.nome} è morto/a${ETICHETTA_CAUSA[giocatore.causaMorte] ?? ''}` })
    }
    if (!prima.vivo && giocatore.vivo) {
      eventi.push({ round, messaggio: `${giocatore.nome} è tornato/a in vita` })
    }

    const condizioniPrima = prima.condizioni ?? []
    const condizioniDopo = giocatore.condizioni ?? []
    for (const condizione of condizioniDopo) {
      if (!condizioniPrima.includes(condizione)) {
        eventi.push({ round, messaggio: `${giocatore.nome} ha ottenuto la condizione "${condizione}"` })
      }
    }
    for (const condizione of condizioniPrima) {
      if (!condizioniDopo.includes(condizione)) {
        eventi.push({ round, messaggio: `${giocatore.nome} ha perso la condizione "${condizione}"` })
      }
    }

    if (prima.ruoloSlug !== giocatore.ruoloSlug) {
      eventi.push({ round, messaggio: `${giocatore.nome} ha assunto il ruolo di ${giocatore.ruoloSlug}` })
    }
  }

  return eventi
}

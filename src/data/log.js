const ETICHETTA_CAUSA = {
  notte: ' di notte',
  rogo: ' al rogo',
  colpo: ' sul colpo',
  crepacuore: ' di crepacuore',
  sacrificio: ': il Cavaliere si è rivelato e immolato al posto della vittima',
}

// "fase" (notte/alba/giorno/rogo) è la sotto-fase del giorno di gioco a cui
// appartiene l'evento (per l'icona nel registro, vedi LogPartita.jsx): quella
// passata dal chiamante (App.jsx, dedotta dalla schermata su cui si trova il
// narratore quando lo stato è cambiato), tranne una morte al rogo che è
// sempre "rogo" a prescindere da dove/quando viene registrata.
export function rilevaEventi(precedenti, correnti, round, fase) {
  const eventi = []
  const mappaPrecedenti = new Map(precedenti.map((g) => [g.id, g]))

  for (const giocatore of correnti) {
    const prima = mappaPrecedenti.get(giocatore.id)
    if (!prima) continue

    if (prima.vivo && !giocatore.vivo) {
      const faseMorte = giocatore.causaMorte === 'rogo' ? 'rogo' : fase
      eventi.push({
        round,
        fase: faseMorte,
        messaggio: `${giocatore.nome} è morto/a${ETICHETTA_CAUSA[giocatore.causaMorte] ?? ''}`,
      })
    }
    if (!prima.vivo && giocatore.vivo) {
      eventi.push({ round, fase, messaggio: `${giocatore.nome} è tornato/a in vita` })
    }

    const condizioniPrima = prima.condizioni ?? []
    const condizioniDopo = giocatore.condizioni ?? []
    for (const condizione of condizioniDopo) {
      if (!condizioniPrima.includes(condizione)) {
        eventi.push({ round, fase, messaggio: `${giocatore.nome} ha ottenuto la condizione "${condizione}"` })
      }
    }
    for (const condizione of condizioniPrima) {
      if (!condizioniDopo.includes(condizione)) {
        eventi.push({ round, fase, messaggio: `${giocatore.nome} ha perso la condizione "${condizione}"` })
      }
    }

    if (prima.ruoloSlug !== giocatore.ruoloSlug) {
      eventi.push({ round, fase, messaggio: `${giocatore.nome} ha assunto il ruolo di ${giocatore.ruoloSlug}` })
    }
  }

  return eventi
}

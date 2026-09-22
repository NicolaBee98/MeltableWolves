import { Votazione } from './Votazione'

export function GiornoPanel({
  giocatori,
  voti,
  fase,
  candidatiEsito,
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  aggiornaGiocatore,
  ruoliSelezionati,
  quantita,
  round,
  onProsegui,
  mostraRuoli,
  variantiFaccia,
  mostraNomeRuolo,
  durataTimer,
}) {
  function dichiaraRogo(id) {
    aggiornaGiocatore(id, { vivo: false, causaMorte: 'rogo', mortoNotte: round })
  }

  function dichiaraColpo(id) {
    aggiornaGiocatore(id, { vivo: false, causaMorte: 'colpo' })
  }

  // L'Antico perde la sua prima vita al rogo: si rivela, sopravvive come un
  // normale Villico e maledice il villaggio per la notte successiva (pag. 16, 25)
  function dichiaraAnticoRivelazione(id) {
    const target = giocatori.find((g) => g.id === id)
    aggiornaGiocatore(id, {
      ruoloSlug: 'villico',
      storiaRuoli: [...(target?.storiaRuoli ?? []), 'villico'],
      notteBloccataFinoA: round,
    })
  }

  // assegna l'identità di un ruolo a rivelazione diurna solo quando si
  // rivela davvero (vedi nightSteps.js), non preventivamente a inizio partita
  function dichiaraRivelazione(ruoloSlug, id) {
    const target = giocatori.find((g) => g.id === id)
    aggiornaGiocatore(id, { ruoloSlug, storiaRuoli: [...(target?.storiaRuoli ?? []), ruoloSlug] })
  }

  function dichiaraBoiaGiustizia(vittimaId) {
    const boia = giocatori.find((g) => g.ruoloSlug === 'boia' && g.vivo)
    if (boia) aggiornaGiocatore(boia.id, { poteriUsati: [...(boia.poteriUsati ?? []), 'boia-giustizia'] })
    aggiornaGiocatore(vittimaId, { vivo: false, causaMorte: 'colpo' })
  }

  // l'Alchimista si rivela ed esplode nel momento stesso in cui viene messo
  // al rogo (pag. 5): questo evento dichiara la sua morte per rogo, non un
  // "Dichiara morte sul rogo" separato in Votazione
  function dichiaraAlchimistaEsplode(alchimistaId, vittimaId) {
    const alchimista = giocatori.find((g) => g.id === alchimistaId)
    aggiornaGiocatore(alchimistaId, {
      ruoloSlug: 'alchimista',
      storiaRuoli: [...(alchimista?.storiaRuoli ?? []), 'alchimista'],
      vivo: false,
      causaMorte: 'rogo',
      poteriUsati: [...(alchimista?.poteriUsati ?? []), 'alchimista-esplosione'],
    })
    aggiornaGiocatore(vittimaId, { vivo: false, causaMorte: 'colpo' })
  }

  function dichiaraBardoSaltaNotte() {
    const bardo = giocatori.find((g) => g.ruoloSlug === 'bardo' && g.vivo)
    if (!bardo) return
    aggiornaGiocatore(bardo.id, {
      poteriUsati: [...(bardo.poteriUsati ?? []), 'bardo-salta-notte'],
      notteBloccataFinoA: round,
    })
  }

  function dichiaraElezioneBorgomastro(id) {
    giocatori.filter((g) => g.eBorgomastro).forEach((g) => aggiornaGiocatore(g.id, { eBorgomastro: false }))
    aggiornaGiocatore(id, { eBorgomastro: true })
  }

  return (
    <section className="giorno-panel">
      <Votazione
        giocatori={giocatori}
        voti={voti}
        fase={fase}
        candidatiEsito={candidatiEsito}
        incrementaVoto={incrementaVoto}
        decrementaVoto={decrementaVoto}
        ricominciaVotazione={ricominciaVotazione}
        vaiAEsito={vaiAEsito}
        tornaAlVoto={tornaAlVoto}
        onRogo={dichiaraRogo}
        onMorteImprovvisa={dichiaraColpo}
        onAnticoRivelazione={dichiaraAnticoRivelazione}
        onRivelazione={dichiaraRivelazione}
        onBoiaGiustizia={dichiaraBoiaGiustizia}
        onAlchimistaEsplode={dichiaraAlchimistaEsplode}
        onBardoSaltaNotte={dichiaraBardoSaltaNotte}
        onElezioneBorgomastro={dichiaraElezioneBorgomastro}
        ruoliSelezionati={ruoliSelezionati}
        quantita={quantita}
        onProsegui={onProsegui}
        mostraRuoli={mostraRuoli}
        variantiFaccia={variantiFaccia}
        mostraNomeRuolo={mostraNomeRuolo}
        durataTimer={durataTimer}
      />
    </section>
  )
}

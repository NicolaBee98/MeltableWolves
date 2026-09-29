import { Votazione } from './Votazione'
import { propagaUnzione } from '../../data/effettiNotte'

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
  onConcludiPartita,
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

  // sbagliare la rima rivela e uccide lo Scemo del Villaggio nello stesso
  // istante (pag. 20): stessa logica del Boia/Alchimista, identità mai
  // assegnata in anticipo
  function dichiaraScemoSbaglia(id) {
    const target = giocatori.find((g) => g.id === id)
    aggiornaGiocatore(id, {
      ruoloSlug: 'scemo-del-villaggio',
      storiaRuoli: [...(target?.storiaRuoli ?? []), 'scemo-del-villaggio'],
      vivo: false,
      causaMorte: 'colpo',
    })
  }

  // l'Unto che dice "sì" o "no" muore sul colpo e trasmette l'unzione ai
  // vivi ai suoi due fianchi (pag. 22)
  function dichiaraMorteUnzione(id) {
    dichiaraColpo(id)
    for (const [vicinoId, patch] of Object.entries(propagaUnzione(giocatori, id))) {
      aggiornaGiocatore(vicinoId, patch)
    }
  }

  // L'Antico perde la sua prima vita al rogo: si rivela, sopravvive come un
  // normale Villico e maledice il villaggio per la notte successiva (pag.
  // 16, 25) — ma la maledizione blocca solo i poteri "buoni" (vedi
  // villaggioMaledetto in nightSteps.js), a differenza del Bardo che salta
  // la notte per intero: campo separato da notteBloccataFinoA
  // per un L'Antico non ancora assegnato in app (rivelato solo ora, al
  // rogo), il chiamante passa storiaRuoli precedente da qui e non da un
  // secondo aggiornaGiocatore separato (vedi onRivelazione in Votazione.jsx):
  // due aggiornaGiocatore in sequenza sulla stessa persona leggerebbero
  // entrambi la stessa "giocatori" non ancora aggiornata, e il secondo
  // sovrascriverebbe storiaRuoli perdendo il 'lantico' appena scritto dal
  // primo — lasciandolo per sempre "non assegnato" (rivelabile di nuovo,
  // e ancora tra le carte ignote proposte dalla Cartomante)
  function dichiaraAnticoRivelazione(id) {
    const target = giocatori.find((g) => g.id === id)
    const storiaPrecedente = target?.storiaRuoli ?? []
    aggiornaGiocatore(id, {
      ruoloSlug: 'villico',
      storiaRuoli: storiaPrecedente.includes('lantico')
        ? [...storiaPrecedente, 'villico']
        : [...storiaPrecedente, 'lantico', 'villico'],
      villaggioMaledettoFinoA: round,
    })
  }

  // assegna l'identità di un ruolo a rivelazione diurna solo quando si
  // rivela davvero (vedi nightSteps.js), non preventivamente a inizio partita
  function dichiaraRivelazione(ruoloSlug, id) {
    const target = giocatori.find((g) => g.id === id)
    aggiornaGiocatore(id, { ruoloSlug, storiaRuoli: [...(target?.storiaRuoli ?? []), ruoloSlug] })
  }

  // il Boia si rivela solo giustiziando (pag. 8): stessa logica dell'Alchimista
  function dichiaraBoiaGiustizia(boiaId, vittimaId) {
    const boia = giocatori.find((g) => g.id === boiaId)
    aggiornaGiocatore(boiaId, {
      ruoloSlug: 'boia',
      storiaRuoli: [...(boia?.storiaRuoli ?? []), 'boia'],
      poteriUsati: [...(boia?.poteriUsati ?? []), 'boia-giustizia'],
    })
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

  // il Fantasma Onnisciente non è distribuito a inizio partita: la sua
  // carta va consegnata al primo morto sul rogo (pag. 13). Un'unica carta
  // in gioco, quindi si assegna una sola volta.
  function dichiaraFantasmaOnnisciente(id) {
    aggiornaGiocatore(id, { eFantasmaOnnisciente: true })
  }

  // corregge una morte dichiarata per errore (un tap sbagliato durante il
  // rogo o un evento speciale, il momento più pubblico e frenetico della
  // partita): resta viva/o, senza però disfare a catena le conseguenze già
  // innescate da quella morte (crepacuore del partner, eredità
  // dell'Apprendista...) — quelle restano da sistemare a mano dal narratore.
  function dichiaraAnnullaMorte(id) {
    aggiornaGiocatore(id, { vivo: true, causaMorte: undefined, mortoNotte: undefined })
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
        onAnticoRivelazione={dichiaraAnticoRivelazione}
        onRivelazione={dichiaraRivelazione}
        onBoiaGiustizia={dichiaraBoiaGiustizia}
        onAlchimistaEsplode={dichiaraAlchimistaEsplode}
        onScemoSbaglia={dichiaraScemoSbaglia}
        onMorteUnzione={dichiaraMorteUnzione}
        onBardoSaltaNotte={dichiaraBardoSaltaNotte}
        onElezioneBorgomastro={dichiaraElezioneBorgomastro}
        onFantasmaOnnisciente={dichiaraFantasmaOnnisciente}
        onSuoceraRivelazione={(id) => dichiaraRivelazione('suocera', id)}
        onAnnullaMorte={dichiaraAnnullaMorte}
        ruoliSelezionati={ruoliSelezionati}
        quantita={quantita}
        onProsegui={onProsegui}
        onConcludiPartita={onConcludiPartita}
        mostraRuoli={mostraRuoli}
        variantiFaccia={variantiFaccia}
        mostraNomeRuolo={mostraNomeRuolo}
        durataTimer={durataTimer}
      />
    </section>
  )
}

import { Votazione } from './Votazione'
import { propagaUnzione } from '../../data/effettiNotte'
import { conRuolo } from '../../data/assegnazione'
import { conPotereDisponibile, conPotere, cavalieriDi } from '../../data/eventiSpeciali'
import {
  annullaMorteCompleta,
  dichiaraAnticoSbranato,
  dichiaraColpo as colpo,
  dichiaraBoiaGiustizia as boiaGiustizia,
} from './annullaMorte'

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
  annullaMorte,
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

  // morte sul colpo di oggi: l'Antico non muore alla prima vita (vedi annullaMorte.js)
  function dichiaraColpo(id, extra) {
    return colpo(id, giocatori, aggiornaGiocatore, round, extra)
  }

  // sbagliare la rima rivela e uccide lo Scemo del Villaggio nello stesso
  // istante (pag. 20): stessa logica del Boia/Alchimista, identità mai
  // assegnata in anticipo
  function dichiaraScemoSbaglia(id) {
    const target = giocatori.find((g) => g.id === id)
    dichiaraColpo(id, {
      ruoloSlug: 'scemo-del-villaggio',
      mortoDa: 'scemo',
      storiaRuoli: conRuolo(target?.storiaRuoli, 'scemo-del-villaggio'),
    })
  }

  // l'Unto che dice "sì" o "no" muore sul colpo e trasmette l'unzione ai
  // vivi ai suoi due fianchi (pag. 22). Se un Cavaliere lo salva non muore:
  // l'unzione non si trasmette
  function dichiaraMorteUnzione(id) {
    if (!dichiaraColpo(id, { mortoDa: 'unzione' }) || cavalieriDi(giocatori, id).length > 0) return
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
    if (ruoloSlug === 'lantico' && target && !target.vivo) {
      dichiaraAnticoSbranato(id, giocatori, aggiornaGiocatore, annullaMorte)
      return
    }
    // il Mimo-Suocera ha già lo slug: si segna solo che si è rivelato
    if (ruoloSlug === 'suocera' && target?.ruoloSlug === 'suocera') {
      aggiornaGiocatore(id, { poteriUsati: conPotere(target.poteriUsati, 'suocera-rivelata') })
      return
    }
    aggiornaGiocatore(id, {
      ruoloSlug,
      storiaRuoli: conRuolo(target?.storiaRuoli, ruoloSlug),
      // l'Innocente (anche il Mimo che lo copia) si rivela una volta sola
      ...(ruoloSlug === 'innocente' && { poteriUsati: conPotere(target?.poteriUsati, 'innocente-rivelato') }),
      // lo Spilungone non muore al primo rogo: il marcatore (con il giorno) resta
      // anche dopo un reload, così l'esito del rogo si ricostruisce dallo stato
      ...(ruoloSlug === 'spilungone' && { spilungoneRivelatoRound: round }),
    })
  }

  function dichiaraBoiaGiustizia(boiaId, vittimaId) {
    boiaGiustizia(boiaId, vittimaId, giocatori, aggiornaGiocatore, round)
  }

  // l'Alchimista si rivela ed esplode nel momento stesso in cui viene messo
  // al rogo (pag. 5): questo evento dichiara la sua morte per rogo, non un
  // "Dichiara morte sul rogo" separato in Votazione. mortoNotte come per
  // dichiaraRogo: l'Alchimista bruciato è la vittima del rogo (Addolorata); chi
  // trascina con sé muore sul colpo, non al rogo.
  function dichiaraAlchimistaEsplode(alchimistaId, vittimaId) {
    const alchimista = giocatori.find((g) => g.id === alchimistaId)
    aggiornaGiocatore(alchimistaId, {
      ruoloSlug: 'alchimista',
      storiaRuoli: conRuolo(alchimista?.storiaRuoli, 'alchimista'),
      vivo: false,
      causaMorte: 'rogo',
      mortoNotte: round,
      poteriUsati: conPotere(alchimista?.poteriUsati, 'alchimista-esplosione'),
    })
    dichiaraColpo(vittimaId, { mortoDa: 'alchimista' })
  }

  function dichiaraBardoSaltaNotte() {
    const bardo = conPotereDisponibile(giocatori, 'bardo', 'bardo-salta-notte')
    if (!bardo) return
    aggiornaGiocatore(bardo.id, {
      poteriUsati: conPotere(bardo.poteriUsati, 'bardo-salta-notte'),
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
    annullaMorteCompleta(id, giocatori, aggiornaGiocatore, annullaMorte)
  }

  return (
    <section className="giorno-panel">
      {/* round = notte successiva: il giorno N si numera round-1 (come l'alba) */}
      <h2 className="titolo-fase">
        {fase === 'esito' ? 'Rogo' : 'Giorno'}
        {round !== undefined && ` ${round - 1}`}
      </h2>
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
        round={round}
        mostraRuoli={mostraRuoli}
        variantiFaccia={variantiFaccia}
        mostraNomeRuolo={mostraNomeRuolo}
        durataTimer={durataTimer}
      />
    </section>
  )
}

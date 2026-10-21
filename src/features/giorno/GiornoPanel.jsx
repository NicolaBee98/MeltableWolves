import { Votazione } from './Votazione'
import { conRuolo } from '../../data/assegnazione'
import { conPotereDisponibile, conPotere } from '../../data/eventiSpeciali'
import {
  annullaMorteCompleta,
  dichiaraColpo,
  dichiaraBoiaGiustizia,
  dichiaraRivelazione,
  dichiaraElezioneBorgomastro,
  dichiaraScemoSbaglia,
  dichiaraMorteUnzione,
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
    dichiaraColpo(vittimaId, giocatori, aggiornaGiocatore, round, { mortoDa: 'alchimista' })
  }

  function dichiaraBardoSaltaNotte() {
    const bardo = conPotereDisponibile(giocatori, 'bardo', 'bardo-salta-notte')
    if (!bardo) return
    aggiornaGiocatore(bardo.id, {
      poteriUsati: conPotere(bardo.poteriUsati, 'bardo-salta-notte'),
      notteBloccataFinoA: round,
    })
  }

  // il Fantasma Onnisciente non è distribuito a inizio partita: la sua
  // carta va consegnata al primo morto sul rogo (pag. 13). Un'unica carta
  // in gioco, quindi si assegna una sola volta.
  function dichiaraFantasmaOnnisciente(id) {
    aggiornaGiocatore(id, { eFantasmaOnnisciente: true })
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
        onRivelazione={(ruoloSlug, id) => dichiaraRivelazione(ruoloSlug, id, giocatori, aggiornaGiocatore, round, annullaMorte)}
        onBoiaGiustizia={(boiaId, id) => dichiaraBoiaGiustizia(boiaId, id, giocatori, aggiornaGiocatore, round)}
        onAlchimistaEsplode={dichiaraAlchimistaEsplode}
        onScemoSbaglia={(id) => dichiaraScemoSbaglia(id, giocatori, aggiornaGiocatore, round)}
        onMorteUnzione={(id) => dichiaraMorteUnzione(id, giocatori, aggiornaGiocatore, round)}
        onBardoSaltaNotte={dichiaraBardoSaltaNotte}
        onElezioneBorgomastro={(id) => dichiaraElezioneBorgomastro(id, giocatori, aggiornaGiocatore)}
        onFantasmaOnnisciente={dichiaraFantasmaOnnisciente}
        // corregge una morte dichiarata per errore (un tap sbagliato durante il
        // rogo o un evento speciale): annullaMorte di usePartita ripristina
        // anche le conseguenze a catena dallo snapshot preso alla morte
        onAnnullaMorte={(id) => annullaMorteCompleta(id, giocatori, aggiornaGiocatore, annullaMorte)}
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

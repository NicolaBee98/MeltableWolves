import { useEffect } from 'react'
import { Home } from './features/home/Home'
import { ScaricaOffline } from './features/home/ScaricaOffline'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { MazzoGalleria } from './features/mazzo/MazzoGalleria'
import { Libretto } from './features/libretto/Libretto'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { AlbaPanel } from './features/alba/AlbaPanel'
import { GiornoPanel } from './features/giorno/GiornoPanel'
import { LogImpostazioniPopup } from './features/log/LogImpostazioniPopup'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'
import { useVotazione } from './state/useVotazione'
import { useNotte } from './state/useNotte'
import { useLog } from './state/useLog'
import { useFaseApp } from './state/useFaseApp'
import { useImpostazioni } from './state/useImpostazioni'
import { daRipulireCambioNotte } from './data/effettiNotte'
import { ruoliAttivi } from './data/nightSteps'

export default function App() {
  const [faseApp, setFaseApp] = useFaseApp()
  const { quantita, setQuantita, resetMazzo, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, removeGiocatore, aggiornaGiocatore, annullaMorte, resetPartita, svuotaGiocatori, impostaGiocatori } =
    usePartita()
  const { voti, fase, candidatiEsito, incrementaVoto, decrementaVoto, ricominciaVotazione, vaiAEsito, tornaAlVoto, rimuoviGiocatoreDaVotazione } =
    useVotazione()
  const notte = useNotte()
  // sotto-fase del registro (icona in LogPartita.jsx): quella delle
  // schermate 'notte'/'alba'/'giorno' rispecchia 1:1 la fase dell'app;
  // altrove (home, mazzo, giocatori...) non ci sono eventi di partita da
  // rilevare, il valore di default non ha effetto
  const faseLog = ['notte', 'alba', 'giorno'].includes(faseApp) ? faseApp : 'notte'
  const { eventi, aggiungiEvento, resetLog, sopprimiProssimoConfronto, confermaLog, annullaLogPasso } = useLog(giocatori, notte.round, faseLog)
  // cambiando schermata si riparte dall'alto (altrimenti resta lo scroll
  // della schermata precedente)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [faseApp])
  const {
    mostraRuoliInVotazione,
    setMostraRuoliInVotazione,
    variantiFaccia,
    setVariantiFaccia,
    mostraNomeRuolo,
    setMostraNomeRuolo,
    durataTimer,
    setDurataTimer,
    promemoriaRuoliMorti,
    setPromemoriaRuoliMorti,
    varianteMedium,
    setVarianteMedium,
    addolorataEreditaScelte,
    setAddolorataEreditaScelte,
  } = useImpostazioni()

  // con il Ladro il mazzo fisico ha 2 carte in più dei giocatori (pag. 15):
  // il conteggio atteso dei giocatori va ridotto di conseguenza, quelle due
  // carte non sono destinate a nessuno. Borgomastro e Fantasma Onnisciente
  // non aggiungono invece nessun giocatore in più: il Borgomastro è un
  // titolo assegnato per elezione sopra un ruolo già distribuito (pag. 13),
  // il Fantasma Onnisciente si riceve solo alla morte al posto della
  // propria vecchia carta (pag. 13) — la loro "carta" nel mazzo non conta
  // come una casella giocatore a sé.
  const totaleRuoliMazzo =
    Object.values(quantita).reduce((somma, n) => somma + n, 0) -
    (quantita.ladro > 0 ? 2 : 0) -
    (quantita.borgomastro > 0 ? 1 : 0) -
    (quantita['fantasma-onnisciente'] > 0 ? 1 : 0)
  // cosa è stato sottratto dal conteggio, solo per i ruoli davvero nel mazzo:
  // "escluse" le carte (femminile), "esclusi" i ruoli, ognuno con la sua "e" finale
  const elenco = (voci) => (voci.length > 1 ? `${voci.slice(0, -1).join(', ')} e ${voci.at(-1)}` : voci[0])
  const escluseCarte = quantita.ladro > 0 ? ['le 2 carte extra del Ladro'] : []
  const escluseRuoli = [quantita.borgomastro > 0 && 'il Borgomastro', quantita['fantasma-onnisciente'] > 0 && 'il Fantasma Onnisciente'].filter(Boolean)
  const esclusi = [
    escluseCarte.length > 0 && `escluse ${elenco(escluseCarte)}`,
    escluseRuoli.length > 0 && `esclusi ${elenco(escluseRuoli)}`,
  ].filter(Boolean)
  const ruoliSelezionati = ruoliAttivi(
    ruoliInMazzo.map((r) => r.slug),
    giocatori,
  )

  function proseguiAllaNotte() {
    daRipulireCambioNotte(giocatori).forEach(({ id, condizioni }) => aggiornaGiocatore(id, { condizioni }))
    ricominciaVotazione()
    setFaseApp('notte')
  }

  // azzera tutto ciò che è proprio della singola partita (ruoli, vivo/morto,
  // condizioni, notte, votazione, log, mazzo) tenendo i nomi dei giocatori:
  // lo stesso gruppo gioca più partite di fila, per cambiarlo c'è "Elimina
  // tutti i giocatori". Usata sia dalla Home sia dalle Impostazioni.
  // `conservaMazzo`: chi rigioca con le stesse persone ritrova la stessa composizione del mazzo
  function azzeraPartita({ conservaMazzo = false } = {}) {
    resetPartita()
    if (!conservaMazzo) resetMazzo()
    notte.resetNotte()
    ricominciaVotazione()
    resetLog()
  }

  // Nuova Partita dalle Impostazioni: azzera davvero tutto, mazzo compreso
  function nuovaPartita() {
    azzeraPartita()
    setFaseApp('home')
  }

  // "Concludi partita": si può rigiocare con le stesse persone e lo stesso mazzo
  function concludiPartita() {
    azzeraPartita({ conservaMazzo: true })
    setFaseApp('home')
  }

  function iniziaNuovaPartitaDaHome() {
    azzeraPartita({ conservaMazzo: true })
    setFaseApp('mazzo')
  }

  // "Elimina tutti" riparte da zero con persone diverse: oltre ai
  // giocatori va azzerato anche il resto della partita in corso
  function eliminaTuttiIGiocatori() {
    svuotaGiocatori()
    notte.resetNotte()
    ricominciaVotazione()
    resetLog()
  }

  function rimuoviGiocatore(id) {
    removeGiocatore(id)
    rimuoviGiocatoreDaVotazione(id)
  }

  // partita già avviata: oltre la prima notte, o almeno un ruolo assegnato
  // (round parte da 1: da solo non dice nulla)
  const partitaAvviata = notte.round > 1 || notte.stepIndex > 0 || giocatori.some((g) => g.ruoloSlug)

  return (
    <main className={`app${faseApp === 'home' ? ' app--home' : ''}`} data-fase={faseApp}>
      <header className="app__header">
        <h1 className="app__titolo">
          {faseApp === 'home' ? (
            <img src="/assets/titolo/Titolo.svg" alt="Meltable Wolves" className="app__logo app__logo--home" />
          ) : (
            <img src="/assets/titolo/Titolo_in_linea.svg" alt="Meltable Wolves" className="app__logo app__logo--inline" />
          )}
        </h1>

        {faseApp !== 'mazzo-galleria' && faseApp !== 'libretto' && faseApp !== 'offline' && (
          <LogImpostazioniPopup
            eventi={eventi}
            onNuovaPartita={nuovaPartita}
            mostraRuoliInVotazione={mostraRuoliInVotazione}
            onCambiaMostraRuoliInVotazione={setMostraRuoliInVotazione}
            variantiFaccia={variantiFaccia}
            onCambiaVariantiFaccia={setVariantiFaccia}
            mostraNomeRuolo={mostraNomeRuolo}
            onCambiaMostraNomeRuolo={setMostraNomeRuolo}
            durataTimer={durataTimer}
            onCambiaDurataTimer={setDurataTimer}
            promemoriaRuoliMorti={promemoriaRuoliMorti}
            onCambiaPromemoriaRuoliMorti={setPromemoriaRuoliMorti}
            varianteMedium={varianteMedium}
            onCambiaVarianteMedium={setVarianteMedium}
            addolorataEreditaScelte={addolorataEreditaScelte}
            onCambiaAddolorataEreditaScelte={setAddolorataEreditaScelte}
          />
        )}
      </header>

      {faseApp === 'home' && (
        <Home
          onNuovaPartita={iniziaNuovaPartitaDaHome}
          onApriLibretto={() => setFaseApp('libretto')}
          onApriMazzo={() => setFaseApp('mazzo-galleria')}
          onApriOffline={() => setFaseApp('offline')}
        />
      )}

      {faseApp === 'offline' && <ScaricaOffline onTornaAllaHome={() => setFaseApp('home')} />}

      {faseApp === 'mazzo-galleria' && <MazzoGalleria onTornaAllaHome={() => setFaseApp('home')} />}

      {faseApp === 'libretto' && <Libretto onTornaAllaHome={() => setFaseApp('home')} />}

      {faseApp === 'mazzo' && (
        <section>
          <button type="button" className="app__torna-indietro" onClick={() => setFaseApp('home')}>
            ← Torna alla Home
          </button>
          <MazzoBuilder quantita={quantita} setQuantita={setQuantita} />
          <button type="button" className="mazzo-fase__avanti" onClick={() => setFaseApp('giocatori')}>
            Avanti
          </button>
        </section>
      )}

      {faseApp === 'giocatori' && (
        <section>
          <button type="button" className="app__torna-indietro" onClick={() => setFaseApp('mazzo')}>
            ← Torna al mazzo
          </button>
          <PlayerTracker
            giocatori={giocatori}
            addGiocatore={addGiocatore}
            removeGiocatore={rimuoviGiocatore}
            onRiordina={impostaGiocatori}
            onEliminaTutti={eliminaTuttiIGiocatori}
            partitaAvviata={partitaAvviata}
          />
          {giocatori.length !== totaleRuoliMazzo && (
            <p className="avviso">
              ⚠️ {totaleRuoliMazzo === 1 ? 'Serve 1 giocatore' : `Servono ${totaleRuoliMazzo} giocatori`}, ce ne sono {giocatori.length}
              {esclusi.length > 0 && ` (${esclusi.join('; ')}, che non sono giocatori in più)`}.
            </p>
          )}
          <button
            type="button"
            className="giocatori-fase__prosegui"
            disabled={giocatori.length !== totaleRuoliMazzo}
            onClick={() => setFaseApp('notte')}
          >
            Inizia la notte
          </button>
        </section>
      )}

      {faseApp === 'notte' && (
        <NightSequencer
          ruoliSelezionati={ruoliSelezionati}
          giocatori={giocatori}
          aggiornaGiocatore={aggiornaGiocatore}
          impostaGiocatori={(g) => {
            sopprimiProssimoConfronto()
            impostaGiocatori(g)
          }}
          annullaMorte={annullaMorte}
          quantita={quantita}
          onCambiaQuantita={setQuantita}
          registraEvento={aggiungiEvento}
          confermaLog={confermaLog}
          annullaLogPasso={annullaLogPasso}
          round={notte.round}
          stepIndex={notte.stepIndex}
          avanti={notte.avanti}
          indietro={notte.indietro}
          nuovaNotte={notte.nuovaNotte}
          onNotteConclusa={() => setFaseApp('alba')}
          ingressoSalvato={notte.ingressoSalvato}
          salvaIngresso={notte.salvaIngresso}
          promemoriaRuoliMorti={promemoriaRuoliMorti}
          varianteMedium={varianteMedium}
          addolorataEreditaScelte={addolorataEreditaScelte}
          onTornaAiGiocatori={() => {
            // l'ingresso salvato ha la vecchia lista di giocatori: da scartare
            notte.salvaIngresso(undefined)
            setFaseApp('giocatori')
          }}
        />
      )}

      {faseApp === 'alba' && (
        <AlbaPanel
          giocatori={giocatori}
          round={notte.round - 1}
          aggiornaGiocatore={aggiornaGiocatore}
          annullaMorte={annullaMorte}
          ruoliSelezionati={ruoliSelezionati}
          quantita={quantita}
          onVaiAlVoto={() => {
            setFaseApp('giorno')
          }}
          onGalloSaltaGiorno={proseguiAllaNotte}
          onConcludiPartita={concludiPartita}
        />
      )}

      {faseApp === 'giorno' && (
        <GiornoPanel
          giocatori={giocatori}
          voti={voti}
          fase={fase}
          candidatiEsito={candidatiEsito}
          incrementaVoto={incrementaVoto}
          decrementaVoto={decrementaVoto}
          ricominciaVotazione={ricominciaVotazione}
          vaiAEsito={vaiAEsito}
          tornaAlVoto={tornaAlVoto}
          aggiornaGiocatore={aggiornaGiocatore}
          annullaMorte={annullaMorte}
          ruoliSelezionati={ruoliSelezionati}
          quantita={quantita}
          round={notte.round}
          onProsegui={proseguiAllaNotte}
          mostraRuoli={mostraRuoliInVotazione}
          variantiFaccia={variantiFaccia}
          mostraNomeRuolo={mostraNomeRuolo}
          durataTimer={durataTimer}
        />
      )}
    </main>
  )
}

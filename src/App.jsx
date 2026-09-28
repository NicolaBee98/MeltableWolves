import { Home } from './features/home/Home'
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
  const { giocatori, addGiocatore, removeGiocatore, aggiornaGiocatore, resetPartita, svuotaGiocatori, impostaGiocatori } =
    usePartita()
  const { voti, fase, candidatiEsito, incrementaVoto, decrementaVoto, ricominciaVotazione, vaiAEsito, tornaAlVoto } =
    useVotazione()
  const notte = useNotte()
  // sotto-fase del registro (icona in LogPartita.jsx): quella delle
  // schermate 'notte'/'alba'/'giorno' rispecchia 1:1 la fase dell'app;
  // altrove (home, mazzo, giocatori...) non ci sono eventi di partita da
  // rilevare, il valore di default non ha effetto
  const faseLog = ['notte', 'alba', 'giorno'].includes(faseApp) ? faseApp : 'notte'
  const { eventi, aggiungiEvento, resetLog } = useLog(giocatori, notte.round, faseLog)
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
  } = useImpostazioni()

  // con il Ladro il mazzo fisico ha 2 carte in più dei giocatori (pag. 15):
  // il conteggio atteso dei giocatori va ridotto di conseguenza, quelle due
  // carte non sono destinate a nessuno
  const totaleRuoliMazzo = Object.values(quantita).reduce((somma, n) => somma + n, 0) - (quantita.ladro > 0 ? 2 : 0)
  const ruoliSelezionati = ruoliAttivi(
    ruoliInMazzo.map((r) => r.slug),
    giocatori,
  )

  function proseguiAllaNotte() {
    daRipulireCambioNotte(giocatori).forEach(({ id, condizioni }) => aggiornaGiocatore(id, { condizioni }))
    ricominciaVotazione()
    setFaseApp('notte')
  }

  function nuovaPartita() {
    resetPartita()
    resetMazzo()
    notte.resetNotte()
    ricominciaVotazione()
    resetLog()
    setFaseApp('home')
  }

  return (
    <main className={`app${faseApp === 'home' ? ' app--home' : ''}`} data-fase={faseApp}>
      <h1 className="app__titolo">
        <span className="app__titolo-meltable">Meltable</span>
        <span className="app__titolo-wolves">Wolves</span>
      </h1>

      {faseApp !== 'mazzo-galleria' && faseApp !== 'libretto' && (
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
        />
      )}

      {faseApp === 'home' && (
        <Home
          onNuovaPartita={() => setFaseApp('mazzo')}
          onApriLibretto={() => setFaseApp('libretto')}
          onApriMazzo={() => setFaseApp('mazzo-galleria')}
        />
      )}

      {faseApp === 'mazzo-galleria' && <MazzoGalleria onTornaAllaHome={() => setFaseApp('home')} />}

      {faseApp === 'libretto' && <Libretto onTornaAllaHome={() => setFaseApp('home')} />}

      {faseApp === 'mazzo' && (
        <section>
          <MazzoBuilder quantita={quantita} setQuantita={setQuantita} />
          <button type="button" onClick={() => setFaseApp('giocatori')}>
            Continua
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
            removeGiocatore={removeGiocatore}
            onRiordina={impostaGiocatori}
            onEliminaTutti={svuotaGiocatori}
          />
          {giocatori.length !== totaleRuoliMazzo && (
            <p className="app__avviso">
              ⚠️ Hai {giocatori.length} giocatori per {totaleRuoliMazzo} ruoli nel mazzo.
            </p>
          )}
          <button type="button" className="giocatori-fase__prosegui" onClick={() => setFaseApp('notte')}>
            Inizia la notte
          </button>
        </section>
      )}

      {faseApp === 'notte' && (
        <NightSequencer
          ruoliSelezionati={ruoliSelezionati}
          giocatori={giocatori}
          aggiornaGiocatore={aggiornaGiocatore}
          impostaGiocatori={impostaGiocatori}
          quantita={quantita}
          onCambiaQuantita={setQuantita}
          registraEvento={aggiungiEvento}
          round={notte.round}
          stepIndex={notte.stepIndex}
          avanti={notte.avanti}
          indietro={notte.indietro}
          nuovaNotte={notte.nuovaNotte}
          onNotteConclusa={() => setFaseApp('alba')}
          promemoriaRuoliMorti={promemoriaRuoliMorti}
          varianteMedium={varianteMedium}
          onTornaAiGiocatori={() => setFaseApp('giocatori')}
        />
      )}

      {faseApp === 'alba' && (
        <AlbaPanel
          giocatori={giocatori}
          round={notte.round - 1}
          aggiornaGiocatore={aggiornaGiocatore}
          ruoliSelezionati={ruoliSelezionati}
          quantita={quantita}
          onVaiAlVoto={() => setFaseApp('giorno')}
          onGalloSaltaGiorno={proseguiAllaNotte}
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

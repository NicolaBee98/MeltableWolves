import { Home } from './features/home/Home'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
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

export default function App() {
  const [faseApp, setFaseApp] = useFaseApp()
  const { quantita, setQuantita, resetMazzo, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, removeGiocatore, aggiornaGiocatore, resetPartita, impostaGiocatori } = usePartita()
  const { voti, fase, candidatiEsito, incrementaVoto, decrementaVoto, ricominciaVotazione, vaiAEsito, tornaAlVoto } =
    useVotazione()
  const notte = useNotte()
  const { eventi, aggiungiEvento, resetLog } = useLog(giocatori, notte.round)

  const totaleRuoliMazzo = Object.values(quantita).reduce((somma, n) => somma + n, 0)

  function proseguiAllaNotte() {
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
    <main className={`app${faseApp === 'home' ? ' app--home' : ''}`}>
      <h1 className="app__titolo">
        <span className="app__titolo-meltable">Meltable</span>
        <span className="app__titolo-wolves">Wolves</span>
      </h1>

      {faseApp !== 'home' && <LogImpostazioniPopup eventi={eventi} onNuovaPartita={nuovaPartita} />}

      {faseApp === 'home' && <Home onNuovaPartita={() => setFaseApp('mazzo')} />}

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
          <PlayerTracker giocatori={giocatori} addGiocatore={addGiocatore} removeGiocatore={removeGiocatore} />
          {giocatori.length !== totaleRuoliMazzo && (
            <p className="app__avviso">
              ⚠️ Hai {giocatori.length} giocatori per {totaleRuoliMazzo} ruoli nel mazzo.
            </p>
          )}
          <button type="button" onClick={() => setFaseApp('notte')}>
            Inizia la notte
          </button>
        </section>
      )}

      {faseApp === 'notte' && (
        <NightSequencer
          ruoliSelezionati={ruoliInMazzo.map((r) => r.slug)}
          giocatori={giocatori}
          aggiornaGiocatore={aggiornaGiocatore}
          impostaGiocatori={impostaGiocatori}
          quantita={quantita}
          registraEvento={aggiungiEvento}
          round={notte.round}
          stepIndex={notte.stepIndex}
          avanti={notte.avanti}
          indietro={notte.indietro}
          nuovaNotte={notte.nuovaNotte}
          onNotteConclusa={() => setFaseApp('alba')}
        />
      )}

      {faseApp === 'alba' && (
        <AlbaPanel
          giocatori={giocatori}
          round={notte.round - 1}
          onVaiAlVoto={() => setFaseApp('giorno')}
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
          round={notte.round}
          onProsegui={proseguiAllaNotte}
        />
      )}
    </main>
  )
}

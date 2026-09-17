import { useState } from 'react'
import { Home } from './features/home/Home'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { AlbaPanel } from './features/alba/AlbaPanel'
import { GiornoPanel } from './features/giorno/GiornoPanel'
import { LogPartita } from './features/log/LogPartita'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'
import { useVotazione } from './state/useVotazione'
import { useNotte } from './state/useNotte'
import { useLog } from './state/useLog'
import { useFaseApp } from './state/useFaseApp'

export default function App() {
  const [faseApp, setFaseApp] = useFaseApp()
  const [mostraRegistro, setMostraRegistro] = useState(false)
  const { numGiocatori, quantita, setNumGiocatori, setQuantita, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore } = usePartita()
  const { voti, fase, incrementaVoto, decrementaVoto, ricominciaVotazione, vaiAEsito, tornaAlVoto } = useVotazione()
  const notte = useNotte()
  const { eventi, aggiungiEvento } = useLog(giocatori, notte.round)

  function proseguiAllaNotte() {
    ricominciaVotazione()
    setFaseApp('notte')
  }

  return (
    <main className="app">
      <h1>Meltable Wolves — Narratore</h1>

      {faseApp !== 'home' && (
        <button type="button" className="app__registro-toggle" onClick={() => setMostraRegistro((prev) => !prev)}>
          Registro
        </button>
      )}

      {mostraRegistro ? (
        <LogPartita eventi={eventi} />
      ) : (
        <>
          {faseApp === 'home' && <Home onNuovaPartita={() => setFaseApp('mazzo')} />}

          {faseApp === 'mazzo' && (
            <section>
              <MazzoBuilder
                numGiocatori={numGiocatori}
                quantita={quantita}
                setNumGiocatori={setNumGiocatori}
                setQuantita={setQuantita}
              />
              <button type="button" onClick={() => setFaseApp('giocatori')}>
                Continua
              </button>
            </section>
          )}

          {faseApp === 'giocatori' && (
            <section>
              <PlayerTracker
                giocatori={giocatori}
                addGiocatore={addGiocatore}
                toggleVivo={toggleVivo}
                setCondizioni={setCondizioni}
                setNote={setNote}
              />
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
            <AlbaPanel giocatori={giocatori} round={notte.round - 1} onVaiAlVoto={() => setFaseApp('giorno')} />
          )}

          {faseApp === 'giorno' && (
            <GiornoPanel
              giocatori={giocatori}
              voti={voti}
              fase={fase}
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
        </>
      )}
    </main>
  )
}

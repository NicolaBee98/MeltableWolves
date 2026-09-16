import { useState } from 'react'
import { MazzoBuilder } from './features/mazzo/MazzoBuilder'
import { PlayerTracker } from './features/players/PlayerTracker'
import { NightSequencer } from './features/notte/NightSequencer'
import { GiornoPanel } from './features/giorno/GiornoPanel'
import { LogPartita } from './features/log/LogPartita'
import { useMazzo } from './state/useMazzo'
import { usePartita } from './state/usePartita'
import { useVotazione } from './state/useVotazione'
import { useNotte } from './state/useNotte'
import { useLog } from './state/useLog'

export default function App() {
  const [tab, setTab] = useState('mazzo')
  const { numGiocatori, quantita, setNumGiocatori, setQuantita, ruoliInMazzo } = useMazzo()
  const { giocatori, addGiocatore, toggleVivo, setCondizioni, setNote, aggiornaGiocatore } = usePartita()
  const { voti, incrementaVoto, decrementaVoto, ricominciaVotazione } = useVotazione()
  const notte = useNotte()
  const eventi = useLog(giocatori, notte.round)

  return (
    <main className="app">
      <h1>Meltable Wolves — Narratore</h1>
      <nav className="app__tabs">
        <button type="button" aria-pressed={tab === 'mazzo'} onClick={() => setTab('mazzo')}>
          Mazzo
        </button>
        <button type="button" aria-pressed={tab === 'giocatori'} onClick={() => setTab('giocatori')}>
          Giocatori
        </button>
        <button type="button" aria-pressed={tab === 'notte'} onClick={() => setTab('notte')}>
          Notte
        </button>
        <button type="button" aria-pressed={tab === 'giorno'} onClick={() => setTab('giorno')}>
          Giorno
        </button>
        <button type="button" aria-pressed={tab === 'registro'} onClick={() => setTab('registro')}>
          Registro
        </button>
      </nav>
      {tab === 'mazzo' && (
        <MazzoBuilder
          numGiocatori={numGiocatori}
          quantita={quantita}
          setNumGiocatori={setNumGiocatori}
          setQuantita={setQuantita}
        />
      )}
      {tab === 'giocatori' && (
        <PlayerTracker
          giocatori={giocatori}
          addGiocatore={addGiocatore}
          toggleVivo={toggleVivo}
          setCondizioni={setCondizioni}
          setNote={setNote}
        />
      )}
      {tab === 'notte' && (
        <NightSequencer
          ruoliSelezionati={ruoliInMazzo.map((r) => r.slug)}
          giocatori={giocatori}
          aggiornaGiocatore={aggiornaGiocatore}
          quantita={quantita}
          round={notte.round}
          stepIndex={notte.stepIndex}
          avanti={notte.avanti}
          indietro={notte.indietro}
          nuovaNotte={notte.nuovaNotte}
        />
      )}
      {tab === 'giorno' && (
        <GiornoPanel
          giocatori={giocatori}
          voti={voti}
          incrementaVoto={incrementaVoto}
          decrementaVoto={decrementaVoto}
          ricominciaVotazione={ricominciaVotazione}
          aggiornaGiocatore={aggiornaGiocatore}
          round={notte.round}
        />
      )}
      {tab === 'registro' && <LogPartita eventi={eventi} />}
    </main>
  )
}

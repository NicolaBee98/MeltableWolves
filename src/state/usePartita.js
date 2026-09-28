import { useEffect, useState } from 'react'
import { applicaCrepacuore, rimuoviAccecamentoSeMortoPolpo, maturaCucciolo, attivaVendettaCucciolo } from '../data/effettiNotte'
import { risolviLegami, applicaPatchMap } from '../data/risoluzioneNotte'
import { RUOLI_BRANCO_LUPI } from '../data/nightSteps'

const STORAGE_KEY = 'meltable-wolves-partita'

// normalizza i giocatori caricati da localStorage: dati salvati da uno
// schema precedente (o modificati a mano) potrebbero non avere questi campi
// array, e il resto del codice li usa sempre senza controllare (es.
// `giocatore.condizioni.includes(...)`) — un solo punto di guardia qui
// invece di sparsi `?? []` in ogni funzione che li legge
function normalizzaGiocatore(giocatore) {
  return {
    ...giocatore,
    condizioni: giocatore.condizioni ?? [],
    poteriUsati: giocatore.poteriUsati ?? [],
    usiNotte: giocatore.usiNotte ?? [],
    storiaRuoli: giocatore.storiaRuoli ?? [],
  }
}

function loadGiocatori() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const giocatori = raw ? JSON.parse(raw) : []
    return giocatori.map(normalizzaGiocatore)
  } catch {
    return []
  }
}

// scheda "pulita" di un giocatore, senza nessuno stato di partita: usata
// sia per aggiungerne uno nuovo sia per riportare un giocatore esistente
// a inizio partita mantenendone solo il nome (vedi resetPartita)
function nuovoGiocatore(nome, id = crypto.randomUUID()) {
  return {
    id,
    nome,
    ruoloSlug: undefined,
    vivo: true,
    condizioni: [],
    poteriUsati: [],
    usiNotte: [],
    storiaRuoli: [],
  }
}

export function usePartita() {
  const [giocatori, setGiocatori] = useState(loadGiocatori)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(giocatori))
  }, [giocatori])

  function addGiocatore(nome) {
    setGiocatori((prev) => [...prev, nuovoGiocatore(nome)])
  }

  function removeGiocatore(id) {
    setGiocatori((prev) => prev.filter((g) => g.id !== id))
  }

  function aggiornaGiocatore(id, patch) {
    setGiocatori((prev) => {
      let aggiornati = prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
      if (patch.vivo === false) {
        // reazioni a catena a una morte, ovunque avvenga (notte o rogo): il
        // partner innamorato, l'accecamento del Veggente legato al Polpo
        // Mannaro, e i legami di Apprendista/Cavaliere/Figlia dei Lupi.
        // Vanno risolte qui e non solo a fine notte, altrimenti una morte
        // al rogo le rimanda all'intera notte successiva (vedi audit).
        aggiornati = applicaCrepacuore(aggiornati, id)
        aggiornati = rimuoviAccecamentoSeMortoPolpo(aggiornati, id)
        aggiornati = maturaCucciolo(aggiornati, id)
        aggiornati = attivaVendettaCucciolo(aggiornati, id, RUOLI_BRANCO_LUPI)
        aggiornati = applicaPatchMap(aggiornati, risolviLegami(aggiornati))
      }
      return aggiornati
    })
  }

  // un narratore fa spesso più partite di fila con lo stesso gruppo: tiene
  // i nomi (evita di doverli riscrivere ogni volta), azzera solo lo stato
  // della partita appena conclusa (ruolo, condizioni, vivo/morto...).
  // "Elimina tutti" (svuotaGiocatori) resta il modo esplicito per ripartire
  // da zero con persone diverse.
  function resetPartita() {
    setGiocatori((prev) => prev.map((g) => nuovoGiocatore(g.nome, g.id)))
  }

  function svuotaGiocatori() {
    setGiocatori([])
  }

  function impostaGiocatori(nuovi) {
    setGiocatori(nuovi)
  }

  return {
    giocatori,
    addGiocatore,
    removeGiocatore,
    aggiornaGiocatore,
    resetPartita,
    svuotaGiocatori,
    impostaGiocatori,
  }
}

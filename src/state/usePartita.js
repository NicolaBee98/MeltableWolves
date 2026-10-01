import { useEffect, useRef, useState } from 'react'
import { applicaCrepacuore, rimuoviAccecamentoSeMortoPolpo, maturaCucciolo, attivaVendettaCucciolo } from '../data/effettiNotte'
import { risolviLegami, applicaPatchMap } from '../data/risoluzioneNotte'
import { RUOLI_BRANCO_LUPI } from '../data/nightSteps'
import { salvaLocale } from './salvaLocale'

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
    return (Array.isArray(giocatori) ? giocatori : []).map(normalizzaGiocatore)
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

// Reazioni a catena alle morti, ovunque avvengano (notte o rogo): partner
// innamorato, accecamento del Veggente legato al Polpo, maturazione del
// Cucciolo, vendetta del Cucciolo, legami di Apprendista/Cavaliere/Figlia.
// Si ripete fino a punto fisso, così anche le morti prodotte dalla catena
// stessa (crepacuore, sacrificio del Cavaliere) innescano le loro reazioni.
// `giaProcessati`: id dei morti le cui reazioni sono già state applicate.
export function propagaMorti(giocatori, giaProcessati) {
  let aggiornati = giocatori
  const processati = new Set(giaProcessati)
  for (;;) {
    // i legami per primi: il Cavaliere che salva il bersaglio lo rende vivo
    // PRIMA che crepacuore/vendetta/... reagiscano a una morte mai avvenuta
    const dopoLegami = applicaPatchMap(aggiornati, risolviLegami(aggiornati))
    const cambiato = dopoLegami.some((g, i) => g !== aggiornati[i])
    aggiornati = dopoLegami

    const nuoviMorti = aggiornati.filter((g) => !g.vivo && !processati.has(g.id)).map((g) => g.id)
    for (const morto of nuoviMorti) {
      processati.add(morto)
      aggiornati = applicaCrepacuore(aggiornati, morto)
      aggiornati = rimuoviAccecamentoSeMortoPolpo(aggiornati, morto)
      aggiornati = maturaCucciolo(aggiornati, morto)
      aggiornati = attivaVendettaCucciolo(aggiornati, morto, RUOLI_BRANCO_LUPI)
    }
    if (!cambiato && nuoviMorti.length === 0) return aggiornati
  }
}

export function usePartita() {
  const [giocatori, setGiocatori] = useState(loadGiocatori)
  // {id: {prima, dopo}}: stato dell'intera lista prima e subito dopo una
  // morte (catena inclusa), per poterla annullare con annullaMorte. Vive
  // solo in memoria: dopo un ricaricamento la pagina ripiega su una semplice
  // resurrezione senza disfare la catena.
  const snapshotMorti = useRef({})

  useEffect(() => {
    salvaLocale(STORAGE_KEY, JSON.stringify(giocatori))
  }, [giocatori])

  function addGiocatore(nome) {
    setGiocatori((prev) => [...prev, nuovoGiocatore(nome)])
  }

  // ripulisce i riferimenti al giocatore rimosso: legami pendenti verso di
  // lui, e la condizione "innamorato" del partner rimasto orfano
  function removeGiocatore(id) {
    setGiocatori((prev) => {
      const rimosso = prev.find((g) => g.id === id)
      const resto = prev.filter((g) => g.id !== id)
      const eraInnamorato = rimosso?.condizioni?.includes('innamorato')
      return resto.map((g) => {
        let aggiornato = g
        if (g.legame?.targetId === id) aggiornato = { ...aggiornato, legame: null }
        if (eraInnamorato && g.condizioni.includes('innamorato')) {
          aggiornato = { ...aggiornato, condizioni: g.condizioni.filter((c) => c !== 'innamorato') }
        }
        return aggiornato
      })
    })
  }

  function aggiornaGiocatore(id, patch) {
    setGiocatori((prev) => {
      let aggiornati = prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
      // anticoSbranatoNotte: la prima vita persa dell'Antico è annullabile
      // come una morte (vedi uccidiPatch)
      const eMorte = patch.vivo === false
      if (eMorte) {
        const giaMorti = prev.filter((g) => !g.vivo && g.id !== id).map((g) => g.id)
        aggiornati = propagaMorti(aggiornati, giaMorti)
      }
      if (eMorte || patch.anticoSbranatoNotte !== undefined) {
        snapshotMorti.current[id] = { prima: prev, dopo: aggiornati }
      }
      return aggiornati
    })
  }

  // Annulla la morte di `id` (rogo, Strega, Chupacabra, Resuscita, errore del
  // narratore) disfacendo anche la catena: ripristina ogni giocatore toccato
  // dalla morte (partner di crepacuore, Cucciolo maturato/vendetta, accecamento,
  // Apprendista, Cavaliere, ruolo originale dell'Antico...) allo stato di
  // prima, salvo chi nel frattempo è stato modificato da altro.
  function annullaMorte(id) {
    setGiocatori((prev) => {
      const snap = snapshotMorti.current[id]
      delete snapshotMorti.current[id]
      if (!snap) {
        return prev.map((g) =>
          g.id === id ? { ...g, vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoDa: undefined } : g,
        )
      }
      return prev.map((g) => {
        const prima = snap.prima.find((p) => p.id === g.id)
        const dopo = snap.dopo.find((p) => p.id === g.id)
        return prima && (g.id === id || g === dopo) ? prima : g
      })
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
    annullaMorte,
    resetPartita,
    svuotaGiocatori,
    impostaGiocatori,
  }
}

import { useEffect } from 'react'

// patch che toglie la vita (o la prima vita de L'Antico): da annullare con
// annullaMorte, non con un semplice vivo:true, per disfare anche la catena
// (crepacuore, Cucciolo, accecamento, Apprendista, Cavaliere...)
export function eColpoLetale(patch) {
  return patch?.vivo === false || patch?.anticoSbranatoNotte !== undefined
}

// annullaMorte è quello di usePartita (snapshot della catena); senza, ripiega
// su una semplice resurrezione del solo giocatore colpito
export function annullaColpo(id, aggiornaGiocatore, annullaMorte) {
  if (annullaMorte) {
    annullaMorte(id)
    return
  }
  aggiornaGiocatore(id, {
    vivo: true,
    causaMorte: undefined,
    mortoNotte: undefined,
    mortoDa: undefined,
    anticoSbranatoNotte: undefined,
  })
}

// righe che un'azione mette nel registro solo con "Avanti" (vedi
// impostaEventiAvanti in NightSequencer): si aggiornano a ogni cambio di
// scelta e si tolgono quando l'azione si smonta
export function useEventiAvanti(impostaEventiAvanti, chiave, righe) {
  const testo = righe.join('\n')
  useEffect(() => {
    impostaEventiAvanti?.(chiave, testo ? testo.split('\n') : [])
    return () => impostaEventiAvanti?.(chiave, [])
  }, [testo])
}

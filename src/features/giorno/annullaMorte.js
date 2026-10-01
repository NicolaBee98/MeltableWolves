// patch che riporta in vita un giocatore la cui morte era stata dichiarata
// per errore (un tap sbagliato durante il rogo o un evento speciale).
// Condivisa da GiornoPanel e AlbaPanel. Oltre a vivo/causa/notte ripristina
// ciò che la morte aveva già scritto sul giocatore stesso: la carta del
// Fantasma Onnisciente, il potere "una tantum" speso nel morire (Alchimista,
// Boia) e l'identità dello Scemo del Villaggio, che si rivela solo morendo.
// Le conseguenze su altri giocatori (crepacuore del partner, eredità
// dell'Apprendista...) le disfa annullaMorte di usePartita, se disponibile.
export function patchAnnullaMorte(giocatore) {
  const patch = { vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoDa: undefined }
  if (!giocatore) return patch
  if (giocatore.eFantasmaOnnisciente) patch.eFantasmaOnnisciente = false
  const poteri = giocatore.poteriUsati ?? []
  if (poteri.some((p) => p === 'boia-giustizia' || p === 'alchimista-esplosione')) {
    patch.poteriUsati = poteri.filter((p) => p !== 'boia-giustizia' && p !== 'alchimista-esplosione')
  }
  if (giocatore.ruoloSlug === 'scemo-del-villaggio') {
    patch.ruoloSlug = undefined
    patch.storiaRuoli = (giocatore.storiaRuoli ?? []).filter((r) => r !== 'scemo-del-villaggio')
  }
  return patch
}

// annullaMorte (usePartita, opzionale) disfa la catena dalla snapshot; poi
// si applica comunque la patch sul giocatore stesso (idempotente).
export function annullaMorteCompleta(id, giocatori, aggiornaGiocatore, annullaMorte) {
  annullaMorte?.(id)
  aggiornaGiocatore(id, patchAnnullaMorte(giocatori.find((g) => g.id === id)))
}

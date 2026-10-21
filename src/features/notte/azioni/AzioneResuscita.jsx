import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { mortoStanotte } from '../../../data/assegnazione'
import { conPotere } from '../../../data/eventiSpeciali'

// Il bersaglio NON torna in vita subito: resta morto per il resto della notte
// (non agisce nei passi successivi) e viene solo marcato `resuscitaAllAlba`;
// rinasce all'Alba, quando il narratore annuncia la resurrezione (AlbaPanel).
//
// come la pozione della Strega: potere unico per l'intera partita. Il bersaglio
// di stanotte è scritto sull'attore (sceltaNotte, ripulita all'alba): "già
// usato" vale solo senza una scelta di stanotte, altrimenti un click pendente
// (o un refresh a metà passo) nasconderebbe le chip impedendo di ripensarla.
// Guaritore/Sciacallo e il Mimo che li copia hanno un potere unico ciascuno
// (perAttore): `attoreId` indica quale dei due agisce.
export function AzioneResuscita({ giocatori, aggiornaGiocatore, potereSlug, ruoloSlugAttore, round, attoreId, vivoAIngresso = (g) => g.vivo }) {
  const attore = attoreId ? giocatori.find((g) => g.id === attoreId) : giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  // il bersaglio marcato per la resurrezione di questa notte
  const target = attore?.sceltaNotte?.[potereSlug] ?? null
  const giaUsato = (attore?.poteriUsati ?? []).includes(potereSlug) && !target
  // sia il Guaritore sia lo Sciacallo Mannaro possono resuscitare se stessi.
  // Chi è già marcato per la resurrezione (dall'altro potere)
  // non è più un bersaglio, a meno che non sia la scelta corrente.
  // I morti di QUESTA notte (non da rogo: quello è del giorno prima) non sono
  // candidati: la resurrezione si annuncia all'alba e chi resuscita non può
  // sapere che sono morti stanotte
  // il Fantasma Onnisciente non può essere resuscitato
  const morti = giocatori.filter(
    (g) => (!vivoAIngresso(g) && !g.resuscitaAllAlba && !mortoStanotte(g, round) && !g.eFantasmaOnnisciente) || g.id === target,
  )

  if (giaUsato) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  // annullare la scelta toglie solo il marcatore: il bersaglio non è mai
  // tornato in vita, quindi nessuna catena di morte da rilanciare
  function togliMarcatore(id) {
    aggiornaGiocatore(id, { resuscitaAllAlba: undefined })
  }

  function confermaScelta(targetId) {
    if (!attore) return
    if (targetId === target) {
      // deselezione: il potere si rilascia (come la Strega)
      togliMarcatore(target)
      aggiornaGiocatore(attore.id, {
        poteriUsati: (attore.poteriUsati ?? []).filter((p) => p !== potereSlug),
        sceltaNotte: { ...attore.sceltaNotte, [potereSlug]: undefined },
      })
      return
    }
    if (target) togliMarcatore(target)
    aggiornaGiocatore(targetId, { resuscitaAllAlba: round })
    aggiornaGiocatore(attore.id, {
      poteriUsati: conPotere(attore.poteriUsati, potereSlug),
      sceltaNotte: { ...attore.sceltaNotte, [potereSlug]: targetId },
    })
  }

  if (morti.length === 0) {
    return <p>Nessun defunto: chiamalo comunque.</p>
  }

  return (
    <SceltaGiocatore
      candidati={morti}
      etichetta="Chi resuscitare"
      selezionatoEsternoId={target ?? null}
      onConferma={confermaScelta}
      mostraSalta={false}
    />
  )
}

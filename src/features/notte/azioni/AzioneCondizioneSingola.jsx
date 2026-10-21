import { segnaUsoStanotte, annullaUsoStanotte } from '../../../data/effettiNotte'
import { nomeRuolo } from '../../../data/roles'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'

// la chip scelta resta sempre modificabile finché non si preme "Avanti"
// (principio generale di tutte le azioni notturne): niente più
// "Potere già utilizzato questa notte" che nasconde le chip subito dopo il
// primo click, il narratore può ripensarci fino a quando non avanza.
export function AzioneCondizioneSingola({
  giocatori,
  aggiornaGiocatore,
  condizione,
  etichetta,
  ruoloSlugAttore,
  escludiAttore = false,
  // {slug: motivo}: ruoli su cui la condizione non ha effetto (avviso non bloccante,
  // la condizione non viene scritta); {slug: {motivo, primaNotte: true}} vale solo alla prima notte
  nonApplicabili = {},
  round = 1,
  vivoAIngresso = (g) => g.vivo,
}) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const vivi = giocatori.filter((g) => vivoAIngresso(g) && (!escludiAttore || g.id !== attore?.id))
  // chi ha già questa condizione (assegnata da questa stessa azione stanotte,
  // vedi pulizia a fine notte in NightSequencer) è il bersaglio scelto finora
  // chi non può subire la condizione la tiene in `sceltaNotte` dell'attore (ripulita a fine notte)
  const sceltoSenzaCondizione = attore?.sceltaNotte?.[ruoloSlugAttore]
  const scelto = vivi.find((g) => g.condizioni.includes(condizione)) ?? vivi.find((g) => g.id === sceltoSenzaCondizione)
  const motivoDi = (g) => {
    const m = nonApplicabili[g?.ruoloSlug]
    return m && (!m.primaNotte || round === 1) ? m.motivo ?? m : null
  }
  const motivoScelto = motivoDi(scelto)
  const salvaSceltaSenzaCondizione = (v) =>
    attore && aggiornaGiocatore(attore.id, { sceltaNotte: { ...attore.sceltaNotte, [ruoloSlugAttore]: v } })

  function confermaScelta(targetId) {
    // click sulla chip già scelta: toglie la condizione e il potere torna non usato
    if (targetId === scelto?.id) {
      if (scelto.condizioni.includes(condizione)) aggiornaGiocatore(targetId, { condizioni: scelto.condizioni.filter((c) => c !== condizione) })
      if (sceltoSenzaCondizione) salvaSceltaSenzaCondizione(undefined)
      annullaUsoStanotte(giocatori, aggiornaGiocatore, [ruoloSlugAttore], ruoloSlugAttore)
      return
    }
    // sposta la condizione: la toglie a chiunque altro la avesse presa in
    // un click precedente di questa stessa notte, e la aggiunge al nuovo
    // bersaglio, cosi la scelta resta sempre un singolo bersaglio alla volta
    giocatori
      .filter((g) => g.condizioni.includes(condizione) && g.id !== targetId)
      .forEach((g) => aggiornaGiocatore(g.id, { condizioni: g.condizioni.filter((c) => c !== condizione) }))
    const target = giocatori.find((g) => g.id === targetId)
    if (sceltoSenzaCondizione) salvaSceltaSenzaCondizione(undefined)
    if (motivoDi(target)) salvaSceltaSenzaCondizione(targetId)
    else if (target && !target.condizioni.includes(condizione)) {
      aggiornaGiocatore(targetId, { condizioni: [...target.condizioni, condizione] })
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, [ruoloSlugAttore], ruoloSlugAttore)
  }

  if (vivi.length === 0) {
    return <p>Nessun giocatore da scegliere.</p>
  }

  return (
    <>
      <SceltaGiocatore
        candidati={vivi}
        etichetta={etichetta}
        selezionatoEsternoId={scelto?.id ?? null}
        onConferma={confermaScelta}
        mostraSalta={false}
      />
      {motivoScelto && (
        <p className="avviso">
          ⚠️ Non può inibire {nomeRuolo(scelto.ruoloSlug)}: {motivoScelto}.
        </p>
      )}
    </>
  )
}

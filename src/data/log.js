import { nomeRuolo, ruoloPerDisplay } from './roles'
import { eMimoCopiante } from './assegnazione'

// il Mimo che copia un ruolo agisce da giocatore a sé: nel registro lo si
// distingue dal titolare con "(Mimo)"
const nomeLog = (g) => (eMimoCopiante(g) ? `${g.nome} (Mimo)` : g.nome)

const ETICHETTA_CAUSA = {
  notte: ' di notte',
  rogo: ' al rogo',
  colpo: ' sul colpo',
  crepacuore: ' di crepacuore',
  sacrificio: ': il Cavaliere si è rivelato e immolato al posto della vittima',
}

// ruoli che si rivelano solo di giorno/all'alba (vedi eventiSpeciali.js): il
// registro li annota quando entrano in storiaRuoli fuori dalla notte (di
// notte lo stesso campo si scrive anche per un Ladro o un Mimo, non è una
// rivelazione). L'Antico ha un testo suo (prima vita).
const RUOLI_RIVELAZIONE_DIURNA = ['boia', 'alchimista', 'scemo-del-villaggio', 'innocente', 'spilungone', 'suocera']

// "fase" (notte/alba/giorno/rogo) è la sotto-fase del giorno di gioco a cui
// appartiene l'evento (per l'icona nel registro, vedi LogPartita.jsx): quella
// passata dal chiamante (App.jsx, dedotta dalla schermata su cui si trova il
// narratore quando lo stato è cambiato), tranne una morte al rogo che è
// sempre "rogo" a prescindere da dove/quando viene registrata.
export function rilevaEventi(precedenti, correnti, round, fase) {
  const eventi = []
  const mappaPrecedenti = new Map(precedenti.map((g) => [g.id, g]))

  for (const giocatore of correnti) {
    const prima = mappaPrecedenti.get(giocatore.id)
    if (!prima) continue
    const nome = nomeLog(giocatore)

    if (prima.vivo && !giocatore.vivo) {
      const faseMorte = giocatore.causaMorte === 'rogo' ? 'rogo' : fase
      eventi.push({
        round,
        fase: faseMorte,
        messaggio: `${nome} è morto/a${ETICHETTA_CAUSA[giocatore.causaMorte] ?? ''}`,
      })
    }
    if (!prima.vivo && giocatore.vivo) {
      eventi.push({ round, fase, messaggio: `${nome} è tornato/a in vita` })
    }

    // rivelazioni diurne, elezione del Borgomastro, Fantasma Onnisciente
    const storiaPrima = prima.storiaRuoli ?? []
    const nuoviInStoria = (giocatore.storiaRuoli ?? []).filter((r) => !storiaPrima.includes(r))
    const anticoRivelato =
      (fase !== 'notte' && nuoviInStoria.includes('lantico')) ||
      (prima.ruoloSlug === 'lantico' && giocatore.ruoloSlug === 'villico')
    if (anticoRivelato) {
      eventi.push({ round, fase, messaggio: `${nome} si è rivelato/a: è L'Antico, perde la prima vita e gioca da Villico` })
    }
    if (fase !== 'notte') {
      for (const slug of nuoviInStoria.filter((r) => RUOLI_RIVELAZIONE_DIURNA.includes(r))) {
        eventi.push({ round, fase, messaggio: `${nome} si è rivelato/a: è ${nomeRuolo(slug)}` })
      }
    }
    if (!prima.eBorgomastro && giocatore.eBorgomastro) {
      eventi.push({ round, fase, messaggio: `${nome} è stato/a eletto/a Borgomastro` })
    }
    if (!prima.eFantasmaOnnisciente && giocatore.eFantasmaOnnisciente) {
      eventi.push({ round, fase, messaggio: `${nome} riceve la carta del Fantasma Onnisciente` })
    }

    const condizioniPrima = prima.condizioni ?? []
    const condizioniDopo = giocatore.condizioni ?? []
    for (const condizione of condizioniDopo) {
      if (!condizioniPrima.includes(condizione)) {
        eventi.push({ round, fase, messaggio: `${nome} ha ottenuto la condizione "${condizione}"` })
      }
    }
    for (const condizione of condizioniPrima) {
      if (!condizioniDopo.includes(condizione)) {
        eventi.push({ round, fase, messaggio: `${nome} ha perso la condizione "${condizione}"` })
      }
    }

    // niente log per la prima assegnazione (undefined → ruolo) né per
    // guardia → guardia-mannara: il narratore non sa chi è la traditrice
    const dopoDisplay = ruoloPerDisplay(giocatore.ruoloSlug)
    if (!anticoRivelato && prima.ruoloSlug && giocatore.ruoloSlug && ruoloPerDisplay(prima.ruoloSlug) !== dopoDisplay) {
      // Mimo che sceglie chi imitare: "chi imita chi" (mai la Guardia Mannara: dopoDisplay)
      const bersaglio = giocatore.legame?.tipo === 'mimo' && correnti.find((g) => g.id === giocatore.legame.targetId)
      eventi.push({
        round,
        fase,
        messaggio:
          prima.ruoloSlug === 'mimo' && eMimoCopiante(giocatore)
            ? `Il Mimo ${giocatore.nome} imita ${nomeRuolo(dopoDisplay)}${bersaglio ? ` (${bersaglio.nome})` : ''}`
            : `${nome} ha assunto il ruolo di ${nomeRuolo(dopoDisplay)}`,
      })
    }
  }

  return eventi
}

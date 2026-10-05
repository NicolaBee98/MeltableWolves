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

// morti "sul colpo" (causaMorte 'colpo'): la causa sta in mortoDa
// (vedi giorno/annullaMorte.js e GiornoPanel)
const ETICHETTA_MORTE_DA = {
  boia: ': giustiziato/a dal Boia',
  alchimista: ": morto/a per l'esplosione dell'Alchimista",
  scemo: ': ha sbagliato la rima (Scemo del Villaggio)',
  unzione: " per l'unzione",
}

// poteri "una tantum" dichiarati a voce dal narratore (nessun altro campo
// dice chi li ha usati): voce di registro alla prima comparsa in poteriUsati
const POTERI_DICHIARATI = {
  'bardo-salta-notte': (nome) => `${nome} fa il gesto del Bardo: la notte successiva salta`,
  'gallo-salta-giorno': (nome) => `${nome} fa cantare il Gallo Mannaro: il giorno salta`,
}

// legami scelti di notte (Cavaliere, Apprendista, Figlia dei Lupi)
const LEGAME_SCELTO = {
  cavaliere: (nome, t) => `Il Cavaliere ${nome} sceglie di proteggere ${t}`,
  apprendista: (nome, t) => `L'Apprendista ${nome} sceglie ${t} come maestro`,
  'figlia-dei-lupi': (nome, t) => `La Figlia dei Lupi ${nome} sceglie ${t}`,
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
  // la scelta del Mimo del Ladro viene dopo quella del Ladro, qualunque sia l'ordine dei giocatori
  const eventiMimoLadro = []
  const mappaPrecedenti = new Map(precedenti.map((g) => [g.id, g]))

  for (const giocatore of correnti) {
    const prima = mappaPrecedenti.get(giocatore.id)
    if (!prima) continue
    const nome = nomeLog(giocatore)

    if (prima.vivo && !giocatore.vivo) {
      const faseMorte = giocatore.causaMorte === 'rogo' ? 'rogo' : fase
      const causa =
        giocatore.causaMorte === 'colpo' && ETICHETTA_MORTE_DA[giocatore.mortoDa]
          ? ETICHETTA_MORTE_DA[giocatore.mortoDa]
          : (ETICHETTA_CAUSA[giocatore.causaMorte] ?? '')
      const boia = giocatore.mortoDa === 'boia' && correnti.find((g) => g.id === giocatore.giustiziatoDa)
      // il crepacuore notturno è già negli annunci dell'alba ("è morto/a di
      // crepacuore per la morte del partner"): niente doppione dalla notte
      if (!(giocatore.causaMorte === 'crepacuore' && fase === 'notte')) {
        eventi.push({
          round,
          fase: faseMorte,
          messaggio: boia ? `Il Boia ${nomeLog(boia)} giustizia ${giocatore.nome}` : `${nome} è morto/a${causa}`,
        })
      }
      if (prima.eBorgomastro) {
        eventi.push({ round, fase: faseMorte, messaggio: `${nome} era il Borgomastro: il villaggio dovrà eleggerne uno nuovo` })
      }
    }
    // resurrezione (Guaritore/Sciacallo): una sola voce, che assorbe anche la
    // condizione "resuscitato" scritta insieme (vedi sotto)
    const condizioniDopoRes = giocatore.condizioni ?? []
    const resuscitato = !prima.vivo && giocatore.vivo && condizioniDopoRes.includes('resuscitato') && !(prima.condizioni ?? []).includes('resuscitato')
    // l'Antico che sopravvive (rivelato dopo la "morte") ha un testo suo: non è "tornato in vita"
    const anticoSopravvive = !prima.vivo && giocatore.vivo && (giocatore.storiaRuoli ?? []).includes('lantico') && !(prima.storiaRuoli ?? []).includes('lantico')
    if (!prima.vivo && giocatore.vivo && !anticoSopravvive) {
      eventi.push({ round, fase, messaggio: resuscitato ? `${nome} è stato/a resuscitato/a` : `${nome} è tornato/a in vita` })
    }
    // scelta del Guaritore / dello Sciacallo Mannaro (la resurrezione avviene all'alba)
    if (giocatore.resuscitaAllAlba !== undefined && prima.resuscitaAllAlba === undefined) {
      const potere = correnti.flatMap((a) =>
        ['guaritore-resuscita', 'sciacallo-mannaro-resuscita']
          .filter((p) => (a.poteriUsati ?? []).includes(p) && !(mappaPrecedenti.get(a.id)?.poteriUsati ?? []).includes(p))
          .map((p) => ({ a, p })),
      )[0]
      const chi = potere ? `${potere.p.startsWith('guaritore') ? 'Il Guaritore' : 'Lo Sciacallo Mannaro'} ${nomeLog(potere.a)}` : 'Il Guaritore/Sciacallo'
      eventi.push({ round, fase, messaggio: `${chi} sceglie di resuscitare ${giocatore.nome}` })
    }

    // rivelazioni diurne, elezione del Borgomastro, Fantasma Onnisciente
    const storiaPrima = prima.storiaRuoli ?? []
    const nuoviInStoria = (giocatore.storiaRuoli ?? []).filter((r) => !storiaPrima.includes(r))
    const anticoRivelato =
      (fase !== 'notte' && nuoviInStoria.includes('lantico')) ||
      (prima.ruoloSlug === 'lantico' && giocatore.ruoloSlug === 'villico')
    if (anticoRivelato) {
      eventi.push({ round, fase, messaggio: `${nome} si è rivelato/a: è L'Antico, perde la prima vita e sopravvive (ora Villico)` })
    }
    // l'Antico che perde la prima vita di giorno maledice il villaggio
    if (giocatore.villaggioMaledettoFinoA !== undefined && giocatore.villaggioMaledettoFinoA !== prima.villaggioMaledettoFinoA) {
      eventi.push({ round, fase, messaggio: 'Il villaggio è maledetto: la notte successiva i poteri del villaggio non si sveglieranno' })
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
    // Sacerdote: una voce per coppia (dal giocatore con id minore), al posto
    // delle due condizioni "innamorato"
    const partnerNuovi = (giocatore.innamoratiCon ?? []).filter((id) => !(prima.innamoratiCon ?? []).includes(id))
    for (const id of partnerNuovi) {
      const partner = correnti.find((g) => g.id === id)
      if (partner && giocatore.id < id) {
        eventi.push({ round, fase, messaggio: `Il Sacerdote unisce ${giocatore.nome} e ${partner.nome}: sono innamorati` })
      }
    }
    for (const condizione of condizioniDopo) {
      if (condizione === 'innamorato' && partnerNuovi.length > 0) continue
      if (condizione === 'resuscitato' && resuscitato) continue
      if (!condizioniPrima.includes(condizione)) {
        eventi.push({ round, fase, messaggio: `${nome} ha ottenuto la condizione "${condizione}"` })
      }
    }
    for (const condizione of condizioniPrima) {
      if (!condizioniDopo.includes(condizione)) {
        eventi.push({ round, fase, messaggio: `${nome} ha perso la condizione "${condizione}"` })
      }
    }

    for (const [potere, testo] of Object.entries(POTERI_DICHIARATI)) {
      const eraUsato = (prima.poteriUsati ?? []).includes(potere)
      const eUsato = (giocatore.poteriUsati ?? []).includes(potere)
      // il Gallo si dichiara all'alba ma salta il giorno: l'etichetta è "Giorno"
      const faseVoce = potere === 'gallo-salta-giorno' ? 'giorno' : fase
      if (!eraUsato && eUsato) eventi.push({ round, fase: faseVoce, messaggio: testo(nome) })
      if (eraUsato && !eUsato) eventi.push({ round, fase, messaggio: `${nome}: gesto annullato (${potere === 'gallo-salta-giorno' ? 'Gallo' : 'Bardo'})` })
    }

    // legami: scelta (Cavaliere/Apprendista/Figlia) e, quando decadono con un
    // cambio di carta, rivelazione (l'Apprendista eredita, la Figlia diventa lupo)
    // di notte questi tre esiti hanno già la loro voce negli annunci dell'alba
    // (annunciAlba, registrati da NightSequencer): niente doppione dal diff
    const coperto = (campo) => fase === 'notte' && giocatore[campo] !== undefined && giocatore[campo] !== prima[campo]
    const trasformatoMezzosangue = coperto('trasformatoNotte')
    let ereditato = false
    for (const campo of ['legame', 'legameMimo']) {
      const l0 = prima[campo]
      const l1 = giocatore[campo]
      const nomeTarget = (id) => correnti.find((g) => g.id === id)?.nome ?? '?'
      // (un legame ereditato di altro tipo, es. l'Apprendista che prende il Cavaliere
      // col suo protetto, non è una scelta nuova)
      if (l1 && LEGAME_SCELTO[l1.tipo] && l1.targetId !== l0?.targetId && (!l0 || l0.tipo === l1.tipo)) {
        eventi.push({ round, fase, messaggio: LEGAME_SCELTO[l1.tipo](nome, nomeTarget(l1.targetId)) })
      }
      if ((!l1 || l1.tipo !== l0?.tipo) && l0 && prima.ruoloSlug !== giocatore.ruoloSlug && giocatore.ruoloSlug) {
        if (l0.tipo === 'apprendista') {
          ereditato = true
          if (!coperto('ereditaNotte')) eventi.push({
            round,
            fase,
            messaggio: `${nome} (Apprendista) eredita il ruolo di ${nomeRuolo(ruoloPerDisplay(giocatore.ruoloSlug))} dal maestro ${nomeTarget(l0.targetId)}`,
          })
        } else if (l0.tipo === 'figlia-dei-lupi') {
          ereditato = true
          if (!coperto('figliaLupoNotte')) eventi.push({ round, fase, messaggio: `${nome} (Figlia dei Lupi) si rivela e diventa Lupo Mannaro` })
        }
      }
    }

    // Ladro: la scelta tra le due carte extra (scartoLadro) è il vero evento,
    // non il cambio di ruolo che ne consegue
    const storiaDopo = giocatore.storiaRuoli ?? []
    const haScelto = !(prima.poteriUsati ?? []).includes('ladro-scelta') && (giocatore.poteriUsati ?? []).includes('ladro-scelta')
    let ladroSceglie = false
    if (haScelto && storiaDopo.includes('ladro')) {
      ladroSceglie = true
      const scelta = ruoloPerDisplay(giocatore.ruoloSlug)
      // il Mimo del Ladro sceglie tra le carte rimaste: non scarta nulla
      const eMimoDelLadro = eMimoCopiante(giocatore)
      const scarto = eMimoDelLadro ? [] : (giocatore.scartoLadro ?? []).filter((r) => r !== giocatore.ruoloSlug)
      const scartate = scarto.length ? `: scarta ${scarto.map((r) => nomeRuolo(ruoloPerDisplay(r))).join(' e ')}` : ''
      const titolo = eMimoDelLadro ? `${giocatore.nome} (Mimo del Ladro)` : `Il Ladro ${giocatore.nome}`
      ;(eMimoDelLadro ? eventiMimoLadro : eventi).push({
        round,
        fase,
        messaggio:
          scelta === 'villico'
            ? `${titolo} sceglie di restare Villico${scartate}`
            : `${titolo} sceglie ${nomeRuolo(scelta)}${scartate}`,
      })
    }

    // niente log per la prima assegnazione (undefined → ruolo) né per
    // guardia → guardia-mannara: il narratore non sa chi è la traditrice
    const dopoDisplay = ruoloPerDisplay(giocatore.ruoloSlug)
    if (!anticoRivelato && prima.ruoloSlug && giocatore.ruoloSlug && ruoloPerDisplay(prima.ruoloSlug) !== dopoDisplay) {
      const eImitazione = prima.ruoloSlug === 'mimo' && eMimoCopiante(giocatore)
      if (eImitazione) {
        // "chi imita chi": il ruolo imitato è quello subito dopo 'mimo' nella
        // storia, non quello finale (se il Mimo copia il Ladro, che poi
        // sceglie). Mai la Guardia Mannara: ruoloPerDisplay.
        const imitato = storiaDopo[storiaDopo.indexOf('mimo') + 1] ?? giocatore.ruoloSlug
        const bersaglio = giocatore.legame?.tipo === 'mimo' && correnti.find((g) => g.id === giocatore.legame.targetId)
        eventi.push({
          round,
          fase,
          messaggio: `Il Mimo ${giocatore.nome} imita ${nomeRuolo(ruoloPerDisplay(imitato))}${bersaglio ? ` (${bersaglio.nome})` : ''}`,
        })
      } else if (!ereditato && !ladroSceglie && !trasformatoMezzosangue) {
        eventi.push({ round, fase, messaggio: `${nome} ha assunto il ruolo di ${nomeRuolo(dopoDisplay)}` })
      }
    }
  }

  return [...eventi, ...eventiMimoLadro]
}

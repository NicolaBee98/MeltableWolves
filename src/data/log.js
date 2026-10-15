import { nomeRuolo, ruoloPerDisplay } from './roles'
import { eMimoCopiante } from './assegnazione'

// il Mimo che copia un ruolo agisce da giocatore a sé: nel registro lo si
// distingue dal titolare con "(Mimo)"
const nomeDi = (lista, id) => lista.find((g) => g.id === id)?.nome ?? '?'
export const nomeLog = (g) => (eMimoCopiante(g) ? `${g.nome} (Mimo)` : g.nome)

const ETICHETTA_CAUSA = {
  notte: ' di notte',
  rogo: ' al rogo',
  colpo: ' sul colpo',
  crepacuore: ' di crepacuore',
}

// morti "sul colpo" (causaMorte 'colpo'): la causa sta in mortoDa
// (vedi giorno/annullaMorte.js e GiornoPanel)
const ETICHETTA_MORTE_DA = {
  boia: ' giustiziato/a dal Boia',
  alchimista: " per l'esplosione dell'Alchimista",
  scemo: ' per aver sbagliato la rima (Scemo del Villaggio)',
  unzione: " per l'unzione",
}

// poteri "una tantum" dichiarati a voce dal narratore (nessun altro campo
// dice chi li ha usati): voce di registro alla prima comparsa in poteriUsati
export const POTERI_DICHIARATI = {
  'bardo-salta-notte': (nome) => `Il Bardo ${nome} inizia a suonare: tutti restano svegli e la notte salta`,
  'gallo-salta-giorno': (nome) => `Il Gallo Mannaro ${nome} oggi non canta: tutti dormono e il giorno salta`,
}

// legami scelti di notte (Cavaliere, Apprendista, Figlia dei Lupi)
const LEGAME_SCELTO = {
  cavaliere: (nome, t) => `Il Cavaliere ${nome} sceglie di proteggere ${t}`,
  apprendista: (nome, t) => `L'Apprendista ${nome} sceglie ${t} come maestro`,
  'figlia-dei-lupi': (nome, t) => `La Figlia dei Lupi ${nome} sceglie ${t} come suo genitore`,
}

// legame arrivato con la carta (Addolorata/Apprendista/Mimo che prendono il
// ruolo): non è una scelta del nuovo titolare
const LEGAME_EREDITATO = {
  cavaliere: (nome, t) => `${nome} eredita il legame: protegge ${t}`,
  apprendista: (nome, t) => `${nome} eredita il legame: ha ${t} come maestro`,
  'figlia-dei-lupi': (nome, t) => `${nome} eredita il legame: ha ${t} come genitore`,
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

  // il narratore non segue protetto/unto (durano una notte, rumore): nessuna voce
  const CONDIZIONI_MUTE = ['protetto', 'unto']

  for (const giocatore of correnti) {
    const prima = mappaPrecedenti.get(giocatore.id)
    if (!prima) continue
    const nome = nomeLog(giocatore)

    if (prima.vivo && !giocatore.vivo) {
      const faseMorte = giocatore.causaMorte === 'rogo' ? 'rogo' : fase
      // causa prima dell'effetto: morti dirette (1), poi il crepacuore che ne segue (2)
      const tier = giocatore.causaMorte === 'crepacuore' ? 2 : 1
      const causa =
        giocatore.causaMorte === 'colpo' && ETICHETTA_MORTE_DA[giocatore.mortoDa]
          ? ETICHETTA_MORTE_DA[giocatore.mortoDa]
          : (ETICHETTA_CAUSA[giocatore.causaMorte] ?? '')
      const boia = giocatore.mortoDa === 'boia' && correnti.find((g) => g.id === giocatore.giustiziatoDa)
      const protetto = [prima.legame, prima.legameMimo].find((l) => l?.tipo === 'cavaliere')
      const cliente = giocatore.ruoloSlug === 'cortigiana' && correnti.find((g) => g.id === prima.visitaNotturna)
      let messaggio = boia ? `Il Boia ${nomeLog(boia)} giustizia ${giocatore.nome}` : `${nome} è morto/a${causa}`
      if (giocatore.causaMorte === 'sacrificio') {
        messaggio = protetto
          ? `Il Cavaliere ${nome} si immola al posto di ${nomeDi(correnti, protetto.targetId)} e muore`
          : `Il Cavaliere ${nome} si immola al posto della vittima e muore`
      } else if (giocatore.causaMorte === 'notte' && giocatore.mortoDa === 'cliente-sbranato') {
        // sbranato dal branco, "ucciso" se a colpire il cliente è altro (Chupacabra)
        const verbo = cliente?.mortoDa === 'chupacabra' ? 'ucciso' : 'sbranato'
        messaggio = `La Cortigiana ${nome} muore: il suo cliente${cliente ? ` ${cliente.nome}` : ''} è stato ${verbo}.`
      } else if (giocatore.causaMorte === 'notte' && giocatore.mortoDa === 'cliente-lupo') {
        messaggio = `La Cortigiana ${nome} muore: il suo cliente${cliente ? ` ${cliente.nome}` : ''} era un lupo.`
      } else if (giocatore.causaMorte === 'notte' && giocatore.mortoDa === 'cliente-visitato') {
        // il cliente non è morto (protetto, Antico, trasformato...) ma i lupi erano a casa sua
        messaggio = `La Cortigiana ${nome} muore: i lupi hanno visitato il suo cliente${cliente ? ` ${cliente.nome}` : ''}.`
      }
      // il crepacuore notturno è già negli annunci dell'alba ("è morto/a di
      // crepacuore per la morte del partner"): niente doppione dalla notte
      if (!(giocatore.causaMorte === 'crepacuore' && fase === 'notte')) {
        eventi.push({ round, fase: faseMorte, messaggio, tier })
      }
      if (prima.eBorgomastro) {
        eventi.push({ round, fase: faseMorte, messaggio: `${nome} era il Borgomastro: il villaggio dovrà eleggerne uno nuovo`, tier })
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

    // pozioni della Strega: il bersaglio non è registrato nello stato, lo si
    // ricava dall'effetto (protetto / morto per la Strega) nello stesso confronto
    for (const [potere, tipo] of [['strega-pozione-vitale', 'vitale'], ['strega-pozione-mortale', 'mortale']]) {
      if ((prima.poteriUsati ?? []).includes(potere) || !(giocatore.poteriUsati ?? []).includes(potere)) continue
      const bersaglio = correnti.find((g) => {
        const p = mappaPrecedenti.get(g.id)
        return tipo === 'vitale'
          ? p && (g.condizioni ?? []).includes('protetto') && !(p.condizioni ?? []).includes('protetto')
          : p?.vivo && !g.vivo && g.mortoDa === 'strega'
      })
      eventi.push({ round, fase, messaggio: `La Strega ${nome} usa la pozione ${tipo}${bersaglio ? ` su ${bersaglio.nome}` : ''}` })
    }

    // indagine dell'Inquisitore (il bersaglio e l'esito stanno in ultimaIndagine)
    const ind = giocatore.ultimaIndagine
    const indPrima = prima.ultimaIndagine
    if (giocatore.ruoloSlug === 'inquisitore' && ind && (ind.notte !== indPrima?.notte || ind.targetId !== indPrima?.targetId)) {
      const esito = ind.esito === 'malvagia' ? 'sì (aura malvagia)' : 'no (aura benevola)'
      eventi.push({ round, fase, messaggio: `L'Inquisitore ${nome} interroga ${nomeDi(correnti, ind.targetId)}: ${esito}` })
    }
    if (!(prima.poteriUsati ?? []).includes('inquisitore-potere-perso') && (giocatore.poteriUsati ?? []).includes('inquisitore-potere-perso')) {
      eventi.push({ round, fase, messaggio: `L'Inquisitore ${nome} perde il potere dopo un'indagine inutile` })
    }

    // rivelazioni diurne, elezione del Borgomastro, Fantasma Onnisciente
    const storiaPrima = prima.storiaRuoli ?? []
    const nuoviInStoria = (giocatore.storiaRuoli ?? []).filter((r) => !storiaPrima.includes(r))
    const anticoRivelato =
      (fase !== 'notte' && nuoviInStoria.includes('lantico')) ||
      (prima.ruoloSlug === 'lantico' && giocatore.ruoloSlug === 'villico')
    if (anticoRivelato) {
      eventi.push({ round, fase, messaggio: `${nome} si è rivelato/a: è L'Antico, perde la prima vita e sopravvive` })
    }
    // l'Antico che perde la prima vita di giorno maledice il villaggio
    if (giocatore.villaggioMaledettoFinoA !== undefined && giocatore.villaggioMaledettoFinoA !== prima.villaggioMaledettoFinoA) {
      eventi.push({ round, fase, messaggio: 'Il villaggio è maledetto: la notte successiva il villaggio non potrà usare i propri poteri' })
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
      if (CONDIZIONI_MUTE.includes(condizione)) continue
      if (!condizioniPrima.includes(condizione)) {
        eventi.push({ round, fase, messaggio: `${nome} ha ottenuto la condizione "${condizione}"` })
      }
    }
    for (const condizione of condizioniPrima) {
      if (CONDIZIONI_MUTE.includes(condizione)) continue
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
    // Apprendista con maestro a ruolo ignoto: si rivela e prende la carta ignota
    if (giocatore.apprendistaRivelatoDa && giocatore.apprendistaRivelatoDa !== prima.apprendistaRivelatoDa && !coperto('ereditaNotte')) {
      const maestro = correnti.find((g) => g.id === giocatore.apprendistaRivelatoDa)?.nome ?? '?'
      eventi.push({ round, fase, messaggio: `L'Apprendista ${nome} si rivela e prende la carta del maestro ${maestro} (ruolo ancora ignoto)`, tier: 3 })
    }
    let ereditato = false
    // scambio dell'Addolorata (stanotte): ha una voce propria, i due "ruolo
    // assunto" e l'"eredita" del morto che riceve la carta sarebbero falsi
    const scambioAttore = giocatore.scambioAddolorata && !prima.scambioAddolorata ? giocatore.scambioAddolorata : null
    const scambiataVittima = correnti.some(
      (a) => a.scambioAddolorata?.vittimaId === giocatore.id && !mappaPrecedenti.get(a.id)?.scambioAddolorata,
    )
    if (scambioAttore) {
      const v = correnti.find((g) => g.id === scambioAttore.vittimaId)
      const morto = v ? ` (morto${ETICHETTA_CAUSA[v.causaMorte] ?? ''})` : ''
      eventi.push({
        round,
        fase,
        messaggio: `L'Addolorata ${nome} scambia la carta con ${v?.nome ?? '?'}${morto}: ora è ${nomeRuolo(ruoloPerDisplay(giocatore.ruoloSlug))} e ${v?.nome ?? '?'} ha la carta Addolorata`,
        tier: 3,
      })
    }
    // le voci di legame vanno dopo "ha assunto il ruolo di …" (vedi in fondo)
    const voceLegame = []
    for (const campo of ['legame', 'legameMimo']) {
      const l0 = prima[campo]
      const l1 = giocatore[campo]
      const nomeTarget = (id) => correnti.find((g) => g.id === id)?.nome ?? '?'
      // (un legame ereditato di altro tipo, es. l'Apprendista che prende il Cavaliere
      // col suo protetto, non è una scelta nuova)
      if (l1 && LEGAME_SCELTO[l1.tipo] && l1.targetId !== l0?.targetId && (!l0 || l0.tipo === l1.tipo || l0.tipo === 'apprendista')) {
        // legame nuovo insieme a un cambio di carta: arriva con il ruolo, non è una scelta
        // (anche l'Apprendista che eredita: il suo legame di maestro è sostituito)
        const arrivatoConRuolo = (!l0 || l0.tipo === 'apprendista') && prima.ruoloSlug && prima.ruoloSlug !== giocatore.ruoloSlug
        voceLegame.push({ round, fase, messaggio: (arrivatoConRuolo ? LEGAME_EREDITATO : LEGAME_SCELTO)[l1.tipo](nome, nomeTarget(l1.targetId)), ...(arrivatoConRuolo && { tier: 3 }) })
      }
      if (!scambiataVittima && (!l1 || l1.tipo !== l0?.tipo) && l0 && prima.ruoloSlug !== giocatore.ruoloSlug && giocatore.ruoloSlug) {
        if (l0.tipo === 'apprendista') {
          ereditato = true
          if (!coperto('ereditaNotte')) eventi.push({
            round,
            fase,
            messaggio: `L'Apprendista ${nome} eredita il ruolo di ${nomeRuolo(ruoloPerDisplay(giocatore.ruoloSlug))} dal maestro ${nomeTarget(l0.targetId)}`,
            tier: 3,
          })
        } else if (l0.tipo === 'figlia-dei-lupi') {
          ereditato = true
          if (!coperto('figliaLupoNotte')) eventi.push({ round, fase, messaggio: `La Figlia dei Lupi ${nome} si rivela e diventa Lupo Mannaro`, tier: 3 })
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
        // Mimo senza carta scelta (nessun legame): ha già la voce "non ha scelto…"
        if (giocatore.legame?.tipo === 'mimo' || giocatore.ruoloSlug !== 'villico') eventi.push({
          round,
          fase,
          messaggio: `Il Mimo ${giocatore.nome} imita ${nomeRuolo(ruoloPerDisplay(imitato))}${bersaglio ? ` (${bersaglio.nome})` : ''}`,
        })
      } else if (!ereditato && !ladroSceglie && !trasformatoMezzosangue && !scambioAttore && !scambiataVittima) {
        // tier 3: spesso è l'effetto di una morte (Cucciolo cresciuto) e va dopo di essa
        eventi.push({ round, fase, messaggio: `${nome} ha assunto il ruolo di ${nomeRuolo(dopoDisplay)}`, tier: 3 })
      }
    }
    eventi.push(...voceLegame)
  }

  // causa prima dell'effetto; a parità l'ordine resta quello di rilevamento
  return [...eventi.sort((a, b) => (a.tier ?? 0) - (b.tier ?? 0)).map(({ tier, ...e }) => e), ...eventiMimoLadro]
}

// Voci scritte da fonti diverse per lo stesso fatto (confronto di stati, effetti
// della notte, annunci dell'alba): le unisce in una sola.
// `assorbe(a, b)`: la voce a rende superflua la voce b (stesso giro).
const COLPITO = /^(.+) è stato colpito (dal branco|dal Chupacabra) ma il Cavaliere (.+) si immola al suo posto\.$/
function normalizza(m) {
  const c = m.match(COLPITO)
  return c ? `Il Cavaliere ${c[3]} si immola al posto di ${c[1]} e muore (colpito ${c[2]}).` : m
}
function assorbe(a, b) {
  const mezzo = a.match(/^Il Mezzosangue (.+) è stato sbranato e diventa Lupo Mannaro\.$/)
  if (mezzo) return b === `Il Mezzosangue ${mezzo[1]} è stato bersaglio dei lupi e diventa perciò Lupo Mannaro.`
  const cort = a.match(/^La Cortigiana (.+) muore: il suo cliente (.+) è stato (?:ucciso|sbranato)\.$/)
  if (cort) return b === a || b === `La Cortigiana ${cort[1]} muore: il suo cliente ${cort[2]} è stato sbranato.`
  const cav = a.match(/^Il Cavaliere (.+) si immola al posto di .+ e muore/)
  if (cav) {
    return (
      b === `${cav[1]} si è rivelato: è il Cavaliere, e si è immolato al posto della vittima.` ||
      (a.includes(' (colpito ') && a.startsWith(`${b} (colpito `))
    )
  }
  // il Progenitore ha già la sua voce (dal Branco): niente "ha assunto il ruolo di Lupo Mannaro"
  const prog = a.match(/^.+ trasforma (.+) in Lupo Mannaro\.$/)
  if (prog) return b === `${prog[1]} ha assunto il ruolo di Lupo Mannaro`
  return false
}
export function unisciVoci(prev, nuovi) {
  const lista = [...prev]
  for (const nuovo of nuovi) {
    const e = { ...nuovo, messaggio: normalizza(nuovo.messaggio) }
    const stessoGiro = (x) => x.round === e.round
    if (lista.some((x) => stessoGiro(x) && assorbe(x.messaggio, e.messaggio))) continue
    const i = lista.findIndex((x) => stessoGiro(x) && assorbe(e.messaggio, x.messaggio))
    if (i === -1) lista.push(e)
    else {
      // la voce nuova prende il posto della vecchia (e assorbe anche le altre)
      lista[i] = e
      for (let j = lista.length - 1; j >= 0; j--) if (j !== i && stessoGiro(lista[j]) && assorbe(e.messaggio, lista[j].messaggio)) lista.splice(j, 1)
    }
  }
  return lista
}

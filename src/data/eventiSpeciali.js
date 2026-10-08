import { ruoliAssegnabili, eMimoCopiante } from './assegnazione'
import { RUOLI_RIVELAZIONE_ALLA_MORTE } from './nightSteps'
import { eLupo } from './roles'

// Ruoli con un evento tutto loro: Alchimista/Boia/Scemo del
// Villaggio perché la rivelazione diurna coincide con l'uso stesso del
// potere (si rivelano "facendo" l'azione, non prima); l'Innocente perché,
// pur non avendo un'azione a sé (è solo "mostra la carta"), è comunque
// un'iniziativa che il giocatore prende quando vuole — un pulsante dedicato
// evita il doppio passaggio "Rivelazione personaggio" -> unica opzione
// disponibile.
export const RIVELAZIONE_CONTESTUALE_AL_POTERE = ['alchimista', 'boia', 'scemo-del-villaggio', 'innocente']

// Ruoli che non sono mai una carta segreta in mano a un giocatore vivo, in
// nessun momento della partita: Fantasma Onnisciente/Suocera si ricevono
// solo alla morte, il Borgomastro è un titolo elettivo sopra un ruolo già
// posseduto, e i 4 di RIVELAZIONE_CONTESTUALE_AL_POTERE qui sopra si
// rivelano solo tramite il loro evento dedicato. Nessuno dei sette può
// quindi essere la risposta a "che ruolo/carta ha davvero questo
// giocatore?" — usata sia dal Mimo (AzioneMimo.jsx, quando copia
// un'identità ancora ignota) sia dalla Cartomante/Medium (AzioneRivelaRuolo.jsx):
// se uno di questi finisse comunque assegnato per errore da lì, quel
// giocatore diventerebbe per sempre irraggiungibile dal proprio evento
// dedicato (es. un Alchimista "copiato" che non può più far esplodere se
// stesso, pur restando bersaglio valido per l'esplosione di un altro).
export const RUOLI_NON_CARTA_SEGRETA = [...RUOLI_RIVELAZIONE_ALLA_MORTE, 'borgomastro', ...RIVELAZIONE_CONTESTUALE_AL_POTERE]

// Alchimista, Boia, Scemo del Villaggio e Innocente non hanno mai
// un'identità assegnata prima: si rivelano solo tramite il loro evento
// dedicato (rogo/esplosione, giustizia, rima sbagliata, o la semplice
// dichiarazione dell'Innocente — pag. 5, 8, 20). Il titolare è un vivo senza
// ruolo, finché il mazzo li prevede e nessuno li ha già usati (ruoliAssegnabili
// conta su storiaRuoli, mai sottratto). Il Mimo che li copia ha già lo slug ed
// è un attore a sé, con il proprio potere (poteriUsati per giocatore): resta
// candidato finché non l'ha speso. Lo Scemo muore rivelandosi, quindi non ha
// potere da spendere.
const POTERE_RIVELAZIONE = {
  boia: 'boia-giustizia',
  alchimista: 'alchimista-esplosione',
  innocente: 'innocente-rivelato',
}

export function candidatiRivelazione(slug, ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes(slug)) return []
  const titolare = ruoliAssegnabili([slug], giocatori, quantita).length > 0
  return giocatori.filter(
    (g) =>
      g.vivo &&
      ((titolare && !g.ruoloSlug) ||
        // ruolo già noto e potere non ancora speso: Mimo copiante, ma anche
        // chi l'ha preso dal Ladro o ereditato dall'Apprendista
        (g.ruoloSlug === slug && !(g.poteriUsati ?? []).includes(POTERE_RIVELAZIONE[slug]))),
  )
}

export function rivelazioneContestualeDisponibile(slug, ruoliSelezionati, giocatori, quantita) {
  if (!ruoliSelezionati.includes(slug)) return false
  return (
    ruoliAssegnabili([slug], giocatori, quantita).length > 0 ||
    candidatiRivelazione(slug, ruoliSelezionati, giocatori, quantita).length > 0
  )
}

// Bardo e Gallo Mannaro: non si distingue se a usare il potere sia il titolare
// o il Mimo che lo copia (tenerne traccia spetta al narratore). Regola: il
// potere è disponibile se almeno un titolare è vivo e almeno uno non l'ha
// ancora speso. Ritorna il titolare su cui segnare l'uso (il primo vivo non
// ancora usato, altrimenti il primo non usato), o undefined se non disponibile.
export function conPotereDisponibile(giocatori, slug, potere) {
  const titolari = giocatori.filter((g) => g.ruoloSlug === slug)
  const nonUsato = (g) => !(g.poteriUsati ?? []).includes(potere)
  if (!titolari.some((g) => g.vivo)) return undefined
  return titolari.find((g) => g.vivo && nonUsato(g)) ?? titolari.find(nonUsato)
}

// aggiunge un potere a poteriUsati senza duplicati (es. Alchimista che si ricarica
// alla resurrezione e poi riesplode: una sola voce per potere)
export const conPotere = (poteri, potere) => ((poteri ?? []).includes(potere) ? poteri : [...(poteri ?? []), potere])

export function bardoDisponibile(giocatori) {
  return Boolean(conPotereDisponibile(giocatori, 'bardo', 'bardo-salta-notte'))
}

export function galloDisponibile(giocatori) {
  return Boolean(conPotereDisponibile(giocatori, 'gallo-mannaro', 'gallo-salta-giorno'))
}

// "Se viene ucciso, il villaggio dovrà eleggere un nuovo primo cittadino"
// (roles.js): l'elezione è un evento one-shot finché il Borgomastro in
// carica è vivo, si ripropone solo dopo la sua morte
export function borgomastroDisponibile(ruoliSelezionati, giocatori) {
  if (!ruoliSelezionati.includes('borgomastro')) return false
  return !giocatori.some((g) => g.eBorgomastro && g.vivo)
}

// Cavalieri vivi (anche il Mimo-Cavaliere) legati a `id`: se `id` muore (rogo,
// colpo, crepacuore...) si immolano al suo posto e lui sopravvive
export function cavalieriDi(giocatori, id) {
  return giocatori.filter(
    (g) => g.vivo && g.id !== id && ['legame', 'legameMimo'].some((c) => g[c]?.tipo === 'cavaliere' && g[c].targetId === id),
  )
}

// L'Antico alla prima vita non muore: sopravvive (da Villico) e, di giorno, maledice il villaggio
export const primaVitaAntico = (g) => g.ruoloSlug === 'lantico' && g.anticoSbranatoNotte === undefined
const TESTO_VENDETTA = 'Vendetta del Cucciolo: i lupi sbraneranno due persone la prossima notte.'
const TESTO_ANTICO = "L'Antico sopravvive (prima vita) ma il villaggio è maledetto: la notte i poteri del villaggio non si sveglieranno."

// Promemoria per il narratore: conseguenze note della morte sul colpo / al
// rogo di `id` (stringhe già pronte). Se è ancora vivo sono previsioni; se è
// già morto resta solo il crepacuore dei partner, il resto è già applicato.
// `fatto`: stesse righe al passato, per il riepilogo dopo la conferma.
// Le conseguenze di seconda generazione (la morte del Cavaliere che si
// immola, il crepacuore del partner...) si ottengono ricorsivamente; `visti`
// evita i giri tra coppie e Cavalieri.
export function conseguenzeMorte(giocatori, id, fatto = false) {
  return [...new Set(conseguenze(giocatori, id, fatto, new Set()))]
}

function conseguenze(giocatori, id, fatto, visti) {
  const t = giocatori.find((g) => g.id === id)
  if (!t) return []
  const primo = visti.size === 0
  visti.add(id)
  const partner = (t.condizioni ?? []).includes('innamorato')
    ? t.innamoratiCon?.length
      ? t.innamoratiCon.map((x) => giocatori.find((g) => g.id === x)).filter(Boolean)
      : giocatori.filter((g) => g.id !== id && (g.condizioni ?? []).includes('innamorato'))
    : []
  if (!t.vivo) {
    // a morte già applicata restano il crepacuore dei partner e la vendetta del
    // Cucciolo (marcatore vendettaInnescata): così si ricostruiscono dopo un reload
    return [
      ...partner.filter((g) => g.causaMorte === 'crepacuore').map((g) => `È morto anche ${g.nome} (crepacuore).`),
      ...(t.vendettaInnescata && t.ruoloSlug === 'cucciolo-di-lupo-mannaro' ? [TESTO_VENDETTA] : []),
    ]
  }
  // non muoiono (prima vita dell'Antico, primo rogo dello Spilungone): nessuna conseguenza a catena
  if (primaVitaAntico(t)) return [TESTO_ANTICO]
  if (primo && t.ruoloSlug === 'spilungone' && t.spilungoneRivelatoRound === undefined) return ['Lo Spilungone si rivela e non muore durante il rogo.']

  // il Cavaliere salva `t` da qualunque morte: nessuna delle conseguenze dirette
  // avviene, ma la morte del Cavaliere ha le sue
  const cavalieri = cavalieriDi(giocatori, id)
  if (cavalieri.length > 0) {
    const out = cavalieri.map((g) =>
      fatto ? `Il Cavaliere ${g.nome} si è immolato al posto di ${t.nome}: ${t.nome} sopravvive.` : `Il Cavaliere ${g.nome} lo protegge: si immola al suo posto.`,
    )
    cavalieri.forEach((g) => out.push(...conseguenze(giocatori, g.id, fatto, visti)))
    return out
  }

  const out = []
  for (const p of partner.filter((g) => g.vivo && !visti.has(g.id))) {
    const protettoDa = cavalieriDi(giocatori, p.id)
    if (primaVitaAntico(p)) {
      out.push(`L'Antico ${p.nome} sopravvive al crepacuore (prima vita) ma il villaggio è maledetto: la notte i poteri del villaggio non si sveglieranno.`)
    } else if (protettoDa.length > 0) {
      visti.add(p.id)
      out.push(`Il Cavaliere ${protettoDa.map((g) => g.nome).join(', ')} si immola al posto di ${p.nome} (crepacuore).`)
      protettoDa.forEach((g) => out.push(...conseguenze(giocatori, g.id, fatto, visti)))
    } else {
      out.push(fatto ? `È morto anche ${p.nome} (crepacuore).` : `Morirà anche ${p.nome} (crepacuore).`)
      out.push(...conseguenze(giocatori, p.id, fatto, visti))
    }
  }
  const legati = (tipo) =>
    giocatori.filter((g) => g.vivo && ['legame', 'legameMimo'].some((c) => g[c]?.tipo === tipo && g[c].targetId === id))
  legati('apprendista').forEach((g) =>
    out.push(fatto ? `L'Apprendista ${g.nome} ha ereditato il suo ruolo.` : `L'Apprendista ${g.nome} erediterà il suo ruolo.`),
  )
  legati('figlia-dei-lupi').forEach((g) =>
    out.push(fatto ? `La Figlia dei Lupi ${g.nome} è diventata Lupo Mannaro.` : `La Figlia dei Lupi ${g.nome} diventa Lupo Mannaro.`),
  )
  if (t.ruoloSlug === 'cucciolo-di-lupo-mannaro' && !giocatori.some((g) => g.vendettaInnescata)) out.push(TESTO_VENDETTA)
  else if (eLupo(t.ruoloSlug) && giocatori.some((g) => g.vivo && g.ruoloSlug === 'cucciolo-di-lupo-mannaro'))
    out.push(fatto ? 'Morto un lupo: il Cucciolo è diventato Lupo Mannaro adulto.' : 'Morte di un lupo: il Cucciolo diventa Lupo Mannaro adulto.')
  // l'esplosione si dichiara solo al rogo (la scelta della vittima la riepiloga l'evento)
  // (solo se il potere è disponibile: l'Alchimista resuscitato lo riottiene, vedi resuscitaPatch)
  if (primo && !fatto && t.ruoloSlug === 'alchimista' && !(t.poteriUsati ?? []).includes('alchimista-esplosione')) out.push("L'Alchimista esplode e trascina con sé un altro giocatore.")
  return out
}

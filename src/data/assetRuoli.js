import scale from './scalePersonaggi.json'

// Nome file (senza estensione) per ciascun ruolo, dentro public/assets/facce
// e public/assets/personaggi. Tabella esplicita invece di una trasformazione
// automatica dello slug: alcuni file usano preposizioni minuscole
// ("Cucciolo_di_Lupo_Mannaro", "Figlia_dei_Lupi", "Scemo_del_Villaggio") e
// "lantico" diventa "LAntico", quindi una regola generica sbaglierebbe.
export const FILE_RUOLI = {
  addolorata: 'Addolorata',
  alchimista: 'Alchimista',
  ambasciatore: 'Ambasciatore',
  apprendista: 'Apprendista',
  bardo: 'Bardo',
  berserker: 'Berserker',
  boia: 'Boia',
  borgomastro: 'Borgomastro',
  cartomante: 'Cartomante',
  cavaliere: 'Cavaliere',
  chupacabra: 'Chupacabra',
  cortigiana: 'Cortigiana',
  'criceto-malvagio': 'Criceto_Malvagio',
  'cucciolo-di-lupo-mannaro': 'Cucciolo_di_Lupo_Mannaro',
  eremita: 'Eremita',
  'fantasma-onnisciente': 'Fantasma_Onnisciente',
  fattucchiera: 'Fattucchiera',
  'figlia-dei-lupi': 'Figlia_dei_Lupi',
  'gallo-mannaro': 'Gallo_Mannaro',
  guardia: 'Guardia',
  'guardia-mannara': 'Guardia_Mannara',
  guaritore: 'Guaritore',
  innocente: 'Innocente',
  inquisitore: 'Inquisitore',
  ladro: 'Ladro',
  lantico: 'LAntico',
  'lupo-mannaro': 'Lupo_Mannaro',
  'lupo-mannaro-capobranco': 'Lupo_Mannaro_Capobranco',
  'lupo-mannaro-progenitore': 'Lupo_Mannaro_Progenitore',
  maga: 'Maga',
  medium: 'Medium',
  mezzosangue: 'Mezzosangue',
  mimo: 'Mimo',
  'mucca-mannara': 'Mucca_Mannara',
  nano: 'Nano',
  nonna: 'Nonna',
  paladino: 'Paladino',
  pastore: 'Pastore',
  pifferaio: 'Pifferaio',
  'polpo-mannaro': 'Polpo_Mannaro',
  sacerdote: 'Sacerdote',
  'scemo-del-villaggio': 'Scemo_del_Villaggio',
  'sciacallo-mannaro': 'Sciacallo_Mannaro',
  spilungone: 'Spilungone',
  strega: 'Strega',
  suocera: 'Suocera',
  ubriaco: 'Ubriaco',
  untore: 'Untore',
  veggente: 'Veggente',
  'veggente-mannaro': 'Veggente_Mannaro',
  villico: 'Villico',
}

// facce/villico_varianti e facce/lupo_mannaro_varianti: facce diverse per i
// ruoli che nel mazzo hanno più copie, così due Villici in lista non sono
// indistinguibili. `variante` è la posizione (1-based) di quel giocatore tra
// tutti quelli con lo stesso ruolo; scicla se supera il numero di facce disegnate.
const VARIANTI_FACCIA = {
  villico: { cartella: 'villico_varianti', prefisso: 'villico', totale: 7 },
  'lupo-mannaro': { cartella: 'lupo_mannaro_varianti', prefisso: 'lupo_mannaro', totale: 4 },
}

// facce/: un file per ruolo, senza suffisso numerico (a meno che non si passi
// `variante` per un ruolo con più copie, vedi sopra)
export function faccePath(slug, variante) {
  const varianti = VARIANTI_FACCIA[slug]
  if (varianti && variante) {
    const n = ((variante - 1) % varianti.totale) + 1
    return `/assets/facce/${varianti.cartella}/${varianti.prefisso}_${n}.svg`
  }
  const file = FILE_RUOLI[slug]
  if (!file) return null
  return `/assets/facce/${file}.svg`
}

// Quale variante di faccia mostrare per questo giocatore: la sua posizione
// (1-based) tra tutti i giocatori con lo stesso ruolo, nell'ordine stabile
// dell'array `giocatori` (non filtrato/riordinato), così la faccia di un
// dato giocatore non cambia da un render all'altro solo perché qualcun
// altro con lo stesso ruolo è morto o è stato rimosso dalla lista visibile.
export function variantePerGiocatore(giocatori, giocatoreId) {
  const target = giocatori.find((g) => g.id === giocatoreId)
  if (!target?.ruoloSlug) return undefined
  const stessoRuolo = giocatori.filter((g) => g.ruoloSlug === target.ruoloSlug)
  return stessoRuolo.findIndex((g) => g.id === giocatoreId) + 1
}

// personaggi/: alcuni ruoli hanno più illustrazioni (varianti fisiche dello
// stesso ruolo, es. Villico_1..15, Lupo_Mannaro_1..5, Guardia_1..2). Senza
// `variante` si usa sempre la prima, come illustrazione rappresentativa del
// ruolo; passando `variante` (1-based, cicla se supera il totale) si sceglie
// quella di un giocatore specifico, così più titolari dello stesso ruolo
// mostrati insieme (es. il branco) non hanno tutti la stessa immagine.
const VARIANTI_PERSONAGGIO = {
  villico: 15,
  'lupo-mannaro': 5,
  guardia: 2,
}
export function personaggioPath(slug, variante) {
  const file = FILE_RUOLI[slug]
  if (!file) return null
  const totale = VARIANTI_PERSONAGGIO[slug]
  const suffisso = totale ? `_${variante ? ((variante - 1) % totale) + 1 : 1}` : ''
  return `/assets/personaggi/${file}${suffisso}.svg`
}

// Dimensioni (unità viewBox) di un personaggio con il contorno già portato
// allo stesso spessore di tutti gli altri: generate da
// scripts/misura-personaggi.mjs. Mostrando ogni figura con altezza = altezza *
// k (k unico per l'intera riga) le figure sono proporzionate fra loro: Spilungone
// più alto, Nano più basso, ecc.
export function dimensioniPersonaggio(slug, variante) {
  const src = personaggioPath(slug, variante)
  // ruolo senza personaggio: ritorna comunque misure plausibili
  return scale[src?.split('/').pop().replace('.svg', '')] ?? scale.Villico_1
}

// altezza a schermo (px) della figura più alta in assoluto, e conseguente
// px per unità viewBox massimi: valgono anche per una figura sola
const ALTEZZA_MASSIMA_PX = 200
const ALTEZZA_PIU_ALTA = Math.max(...Object.values(scale).map((d) => d.altezza))
export const PX_PER_UNITA_MAX = ALTEZZA_MASSIMA_PX / ALTEZZA_PIU_ALTA

// Dispone le figure (in ordine) su una o più righe, con un unico fattore k
// (px per unità viewBox) uguale per tutte, in modo che nessuna riga superi la
// larghezza `larghezza` (niente scroll orizzontale). Si usa il minor numero di
// righe per cui la figura più alta resta almeno `altezzaMinima` px: figure più
// grandi possibile, ma sempre tutte visibili e leggibili.
// `dim`: [{ larghezza, altezza }]. Ritorna { k, righe: [[indice, ...], ...] }.
export function disponiFigure(dim, larghezza, { altezzaMinima = 90 } = {}) {
  const altMax = Math.max(...dim.map((d) => d.altezza))
  const tot = dim.reduce((a, d) => a + d.larghezza, 0)
  let esito
  for (let r = 1; r <= dim.length; r++) {
    // riempie le righe in ordine, chiudendo ognuna quando passa la sua quota
    const righe = [[]]
    let cum = 0
    dim.forEach((d, i) => {
      if (righe.length < r && cum + d.larghezza / 2 > (tot / r) * righe.length) righe.push([])
      righe.at(-1).push(i)
      cum += d.larghezza
    })
    const larghMax = Math.max(...righe.map((riga) => riga.reduce((a, i) => a + dim[i].larghezza, 0)))
    const k = Math.min(larghezza / larghMax, PX_PER_UNITA_MAX)
    esito = { k, righe }
    if (k * altMax >= altezzaMinima) break
  }
  return esito
}

// carte/: la carta stampata così com'è (bordo, nome, illustrazione, testo
// abilità), un file rappresentativo per ruolo anche quando il mazzo reale ne
// contiene più copie fisiche (es. Villico).
export function cartaPath(slug) {
  const file = FILE_RUOLI[slug]
  if (!file) return null
  return `/assets/carte/${file}.svg`
}

// condizioni/: uno slug (src/data/conditions.js) -> un file
export function condizionePath(slug) {
  return `/assets/condizioni/${slug}.svg`
}

// icone/: badge unico per i pochi ruoli che nel libretto hanno un proprio
// simbolo invece di condividere quello della fazione (vedi Legenda).
export const FAZIONE_RUOLO_ICONA = {
  chupacabra: 'icona_fazione_chupacabra',
  'criceto-malvagio': 'icona_fazione_criceto_malvagio',
  pifferaio: 'icona_fazione_pifferaio',
  'lupo-mannaro-capobranco': 'icona_fazione_lupo_mannaro_capobranco',
  'fantasma-onnisciente': 'icona_morte_lapide',
  'figlia-dei-lupi': 'icona_voltagabbana',
  mezzosangue: 'icona_voltagabbana',
}

export function iconaPath(nomeFile) {
  return `/assets/icone/${nomeFile}.svg`
}

// riconoscimenti/: i personaggini dei quattro autori originali, per chiudere
// la sezione Riconoscimenti del libretto digitale con la stessa immagine
// usata nella versione stampata.
export function personaggioRiconoscimentoPath(nome) {
  return `/assets/personaggi/riconoscimenti/${nome}.svg`
}

// altezza nel disegno originale (viewBox), stessa unità per tutti e
// quattro: Diletta è disegnata più bassa delle altre, la stessa logica di
// altezzaNaturalePersonaggio la mantiene proporzionalmente più piccola
// invece di forzarla alla stessa altezza delle altre tre
const ALTEZZE_NATURALI_RICONOSCIMENTI = { diletta: 22.6, filippo: 24.1, nicola: 23.7, remo: 25.2 }
export function altezzaNaturaleRiconoscimento(nome) {
  return ALTEZZE_NATURALI_RICONOSCIMENTI[nome] ?? Math.max(...Object.values(ALTEZZE_NATURALI_RICONOSCIMENTI))
}

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

// Altezza del personaggio nel disegno originale (viewBox dell'SVG in
// personaggi/, stessa unità per tutti i file): usata per scalare le
// illustrazioni mostrate fianco a fianco (branco, Mimo+imitato...) tutte
// con lo STESSO fattore, invece che tutte alla stessa altezza in pixel —
// altrimenti una Guardia (disegnata più bassa) risulterebbe grande quanto
// un Veggente invece che più piccola, come nell'artwork originale.
const ALTEZZE_NATURALI_PERSONAGGIO = {
  addolorata: 57.0, alchimista: 60.5, ambasciatore: 61.8, apprendista: 60.1, bardo: 76.3,
  berserker: 77.6, boia: 62.1, borgomastro: 67.8, cartomante: 63.6, cavaliere: 84.2,
  chupacabra: 73.9, cortigiana: 62.8, 'criceto-malvagio': 37.2, 'cucciolo-di-lupo-mannaro': 49.8,
  eremita: 58.8, 'fantasma-onnisciente': 53.6, fattucchiera: 69.0, 'figlia-dei-lupi': 52.4,
  'gallo-mannaro': 72.0, guardia: 60.0, 'guardia-mannara': 57.5, guaritore: 68.0, innocente: 58.1,
  inquisitore: 68.5, ladro: 60.8, lantico: 65.5, 'lupo-mannaro': 59.1, 'lupo-mannaro-capobranco': 66.9,
  'lupo-mannaro-progenitore': 67.5, maga: 75.3, medium: 64.9, mezzosangue: 54.9, mimo: 60.8,
  'mucca-mannara': 65.1, nano: 65.3, nonna: 66.9, paladino: 56.0, pastore: 60.0, pifferaio: 70.9,
  'polpo-mannaro': 66.0, sacerdote: 73.5, 'scemo-del-villaggio': 70.3, 'sciacallo-mannaro': 63.9,
  spilungone: 88.3, strega: 78.0, suocera: 64.1, ubriaco: 76.5, untore: 67.7, veggente: 60.9,
  'veggente-mannaro': 60.6, villico: 52.7,
}
// media delle altezze note, per gli slug senza artwork "personaggio" dedicato
const ALTEZZA_NATURALE_MEDIA =
  Object.values(ALTEZZE_NATURALI_PERSONAGGIO).reduce((s, v) => s + v, 0) /
  Object.values(ALTEZZE_NATURALI_PERSONAGGIO).length
export function altezzaNaturalePersonaggio(slug) {
  return ALTEZZE_NATURALI_PERSONAGGIO[slug] ?? ALTEZZA_NATURALE_MEDIA
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
}

const ICONE_PNG = new Set(['icona_rogo', 'icona_alba', 'icona_giorno'])
export function iconaPath(nomeFile) {
  const ext = ICONE_PNG.has(nomeFile) ? 'png' : 'svg'
  return `/assets/icone/${nomeFile}.${ext}`
}

// riconoscimenti/: i personaggini dei quattro autori originali, per chiudere
// la sezione Riconoscimenti del libretto digitale con la stessa immagine
// usata nella versione stampata.
export function personaggioRiconoscimentoPath(nome) {
  return `/assets/personaggi/riconoscimenti/${nome}.svg`
}

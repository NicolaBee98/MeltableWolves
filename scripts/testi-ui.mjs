// Strumento per rivedere i testi dell'interfaccia in un unico documento.
//
//   node scripts/testi-ui.mjs esporta           (ri)genera docs/testi-ui.md da docs/testi/testi-ui.json
//   node scripts/testi-ui.mjs applica           anteprima delle modifiche fatte in docs/testi-ui.md
//   node scripts/testi-ui.mjs applica --scrivi  applica le modifiche al codice e aggiorna il json
//
// Il json conserva, per ogni testo, il file, la riga e la sottostringa ESATTA
// del sorgente (`originale`). Il documento markdown mostra il testo come lo
// leggerebbe l'utente (`mostrato`) e si modifica solo la riga "TESTO:".
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const JSON_PATH = path.join(radice, 'docs/testi/testi-ui.json')
const MD_PATH = path.join(radice, 'docs/testi-ui.md')
const PARTI = ['generale', 'notte', 'giorno', 'contenuti']
const TITOLI = {
  generale: 'Schermate generali (Home, Mazzo, Giocatori, Regolamento, Registro, impostazioni, avvisi)',
  notte: 'Notte (passi, azioni, avvisi)',
  giorno: 'Giorno, alba, rogo, eventi speciali, registro e vittorie',
  contenuti: 'Contenuti: ruoli, condizioni e testo del regolamento',
}

// --- conversione fra testo nel sorgente e testo mostrato nel documento -----
const NL = '⏎'

export function mostra(originale, delim) {
  let t = originale
  if (delim === "'") t = t.replace(/\\'/g, "'")
  else if (delim === '"') t = t.replace(/\\"/g, '"')
  else if (delim === '`') t = t.replace(/\\`/g, '`')
  // a capo: nel JSX il testo va a capo con rientri (si comprimono in uno spazio)
  t = delim === 'jsx' ? t.replace(/\s*\n\s*/g, ' ') : t.replace(/\n/g, NL)
  return t
}

export function codifica(testo, delim) {
  let t = testo.replace(new RegExp(NL, 'g'), '\n')
  if (delim === "'") t = t.replace(/(?<!\\)'/g, "\\'").replace(/\n/g, '\\n')
  else if (delim === '"') t = t.replace(/(?<!\\)"/g, '\\"').replace(/\n/g, '\\n')
  else if (delim === '`') t = t.replace(/(?<!\\)`/g, '\\`')
  return t
}

function segnaposto(testo, delim) {
  const rx = delim === 'jsx' ? /\{[^}]*\}/g : /\$\{[^}]*\}|\{[^}]*\}/g
  return (testo.match(rx) ?? []).sort()
}

// --- esportazione markdown ----------------------------------------------------
function esporta() {
  const voci = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
  const righe = [
    '# Testi dell\'interfaccia',
    '',
    'Documento da modificare: cambia **solo** il testo dopo `TESTO:` di ogni voce e salva. Poi chiedimi di applicare le modifiche (comando: `node scripts/testi-ui.mjs applica --scrivi`).',
    '',
    'Regole:',
    '- Non modificare gli identificativi (`T0001`…) né le righe di contesto.',
    '- I segnaposto tra graffe — come `${n}`, `${nome}` o `{giocatore.nome}` — vengono sostituiti dall\'app con valori veri: lasciali dove servono e non cambiarne il contenuto (puoi spostarli nella frase).',
    '- `⏎` indica un a capo dentro il testo.',
    '- Il markup dei testi dei ruoli (`*corsivo*`, `**grassetto**`) funziona come nell\'app.',
    '- Alcune frasi sono spezzate in più voci ("parte 1 di 3"…): modifica ogni parte, tenendo conto che vengono mostrate una dopo l\'altra (spazi iniziali/finali compresi).',
    '- Alcune voci sono annidate in altre (una frase intera e le sue varianti): se cambi la frase intera, controlla anche le varianti.',
    '- Per eliminare un testo scrivi `[[vuoto]]`; per lasciarlo com\'è non toccarlo.',
    '',
    `Totale voci: ${voci.length}.`,
    '',
  ]
  for (const parte of PARTI) {
    const gruppo = voci.filter((v) => v.parte === parte)
    righe.push(`## ${TITOLI[parte]}`, '')
    // voci raggruppate per schermata (nell'ordine in cui compaiono la prima volta)
    const perSchermata = new Map()
    for (const v of gruppo) {
      if (!perSchermata.has(v.schermata)) perSchermata.set(v.schermata, [])
      perSchermata.get(v.schermata).push(v)
    }
    for (const [schermata, lista] of perSchermata) {
      righe.push(`### ${schermata}`, '')
      for (const v of lista) {
        righe.push(`- **${v.id}** · ${v.contesto} · \`${v.file}:${v.riga}\``)
        righe.push(`  TESTO: ${v.mostrato}`)
        righe.push('')
      }
    }
  }
  fs.writeFileSync(MD_PATH, righe.join('\n'))
  console.log(`scritto docs/testi-ui.md (${voci.length} voci)`)
}

// --- applicazione delle modifiche -----------------------------------------
function leggiMd() {
  const testo = fs.readFileSync(MD_PATH, 'utf8')
  const mappa = new Map()
  let id = null
  for (const riga of testo.split('\n')) {
    const m = riga.match(/^- \*\*(T\d{4})\*\*/)
    if (m) id = m[1]
    else if (id && riga.startsWith('  TESTO: ')) {
      mappa.set(id, riga.slice('  TESTO: '.length))
      id = null
    } else if (id && riga.startsWith('  TESTO:')) {
      mappa.set(id, '')
      id = null
    }
  }
  return mappa
}

function rigaDi(sorgente, indice) {
  let n = 1
  for (let i = 0; i < indice; i++) if (sorgente[i] === '\n') n++
  return n
}

function occorrenzaVicina(sorgente, cercato, riga) {
  let migliore = -1
  let distanza = Infinity
  for (let i = sorgente.indexOf(cercato); i !== -1; i = sorgente.indexOf(cercato, i + 1)) {
    const d = Math.abs(rigaDi(sorgente, i) - riga)
    if (d < distanza) {
      distanza = d
      migliore = i
    }
  }
  return migliore
}

function applica(scrivi) {
  const voci = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
  const md = leggiMd()
  const modifiche = []
  const problemi = []
  for (const v of voci) {
    if (!md.has(v.id)) {
      problemi.push(`${v.id}: voce mancante nel documento`)
      continue
    }
    let nuovo = md.get(v.id)
    if (nuovo === v.mostrato) continue
    if (nuovo.trim() === '[[vuoto]]') nuovo = ''
    // i segnaposto devono restare gli stessi
    const a = segnaposto(v.mostrato, v.delimitatore).join('\u0000')
    const b = segnaposto(nuovo, v.delimitatore).join('\u0000')
    if (a !== b) {
      problemi.push(`${v.id}: i segnaposto sono cambiati (${segnaposto(v.mostrato, v.delimitatore).join(' ')} → ${segnaposto(nuovo, v.delimitatore).join(' ')}): modifica ignorata`)
      continue
    }
    if (v.delimitatore === 'jsx' && /[<>]/.test(nuovo)) {
      problemi.push(`${v.id}: i caratteri < e > non sono ammessi nel testo JSX: modifica ignorata`)
      continue
    }
    modifiche.push({ v, nuovo, nuovoSorgente: codifica(nuovo, v.delimitatore) })
  }

  const perFile = new Map()
  for (const m of modifiche) {
    if (!perFile.has(m.v.file)) perFile.set(m.v.file, [])
    perFile.get(m.v.file).push(m)
  }
  const applicate = []
  for (const [file, lista] of perFile) {
    const percorso = path.join(radice, file)
    let sorgente = fs.readFileSync(percorso, 'utf8')
    const edit = []
    for (const m of lista) {
      const i = occorrenzaVicina(sorgente, m.v.originale, m.v.riga)
      if (i === -1) {
        problemi.push(`${m.v.id}: testo non trovato in ${file} (il file è cambiato?): modifica ignorata`)
        continue
      }
      edit.push({ ...m, i, fine: i + m.v.originale.length })
    }
    edit.sort((x, y) => y.i - x.i)
    let limite = Infinity
    for (const e of edit) {
      if (e.fine > limite) {
        problemi.push(`${e.v.id}: si sovrappone a un'altra voce modificata: modifica ignorata (modifica la frase intera oppure le varianti, non entrambe)`)
        continue
      }
      sorgente = sorgente.slice(0, e.i) + e.nuovoSorgente + sorgente.slice(e.fine)
      limite = e.i
      applicate.push(e)
    }
    if (scrivi && edit.length) fs.writeFileSync(percorso, sorgente)
  }

  console.log(`${applicate.length} modifiche ${scrivi ? 'applicate' : 'applicabili (anteprima)'}`)
  for (const e of applicate) {
    console.log(`  ${e.v.id} ${e.v.file}:${e.v.riga}\n    - ${e.v.mostrato}\n    + ${e.nuovo}`)
  }
  if (problemi.length) {
    console.log(`\n${problemi.length} problemi:`)
    for (const p of problemi) console.log(`  ${p}`)
  }

  if (scrivi && applicate.length) {
    for (const e of applicate) {
      e.v.originale = e.nuovoSorgente
      e.v.mostrato = e.nuovo
    }
    // riallinea le righe nei file toccati (le righe possono slittare)
    for (const file of new Set(applicate.map((e) => e.v.file))) {
      const sorgente = fs.readFileSync(path.join(radice, file), 'utf8')
      for (const v of voci.filter((x) => x.file === file)) {
        const i = occorrenzaVicina(sorgente, v.originale, v.riga)
        if (i !== -1) v.riga = rigaDi(sorgente, i)
      }
    }
    fs.writeFileSync(JSON_PATH, JSON.stringify(voci, null, 1))
    esporta()
    console.log('\nFatto. Ora esegui i test (npx vitest run): alcuni test controllano i testi e vanno aggiornati.')
  }
}

const [comando, opzione] = process.argv.slice(2)
if (comando === 'esporta') esporta()
else if (comando === 'applica') applica(opzione === '--scrivi')
else console.log('uso: node scripts/testi-ui.mjs esporta|applica [--scrivi]')

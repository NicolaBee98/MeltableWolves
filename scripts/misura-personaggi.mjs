#!/usr/bin/env node
// Misura lo spessore del contorno (colore inchiostro #19xxxx) di ogni SVG in
// public/assets/personaggi e genera src/data/scalePersonaggi.json: per ogni
// file, il fattore che porta il contorno allo STESSO spessore a schermo di un
// riferimento, e larghezza/altezza già moltiplicate per quel fattore (unità
// viewBox). Se il contorno ha lo stesso spessore, le figure sono proporzionate.
// Uso: node scripts/misura-personaggi.mjs
// ponytail: parser XML minimo (tag, transform scale/matrix/rotate, <use>);
// niente skew nel calcolo della scala: basta sqrt(|det|) della parte lineare.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const radice = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cartella = path.join(radice, 'public/assets/personaggi')
const RIFERIMENTO = 0.321 * 1.58766 // spessore (unità viewBox) della stragrande maggioranza dei file

function parse(xml) {
  const radiceNodo = { tag: 'root', attrs: {}, figli: [] }
  const pila = [radiceNodo]
  for (const m of xml.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g)) {
    const [, chiude, tag, attrStr, autochiude] = m
    if (chiude) { pila.pop(); continue }
    const attrs = {}
    for (const a of attrStr.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]] = a[2]
    const nodo = { tag, attrs, figli: [] }
    pila.at(-1).figli.push(nodo)
    if (!autochiude) pila.push(nodo)
  }
  return radiceNodo
}

// fattore di scala (radice del determinante) di un attributo transform
function scalaTransform(t) {
  if (!t) return 1
  let s = 1
  for (const m of t.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const n = m[2].split(/[\s,]+/).filter(Boolean).map(Number)
    if (m[1] === 'scale') s *= Math.sqrt(Math.abs(n[0] * (n[1] ?? n[0])))
    else if (m[1] === 'matrix') s *= Math.sqrt(Math.abs(n[0] * n[3] - n[1] * n[2]))
  }
  return s
}

function stile(attrs) {
  const o = {}
  for (const d of (attrs.style ?? '').split(';')) {
    const [k, v] = d.split(':')
    if (k && v) o[k.trim()] = v.trim()
  }
  return o
}

function misura(svg) {
  const albero = parse(svg)
  const perId = {}
  ;(function indicizza(n) {
    if (n.attrs.id) perId[n.attrs.id] = n
    n.figli.forEach(indicizza)
  })(albero)
  const spessori = []
  function visita(n, scala, ereditato, dentroDefs) {
    if (n.tag === 'defs' && !dentroDefs) return
    const st = { ...ereditato, ...stile(n.attrs) }
    if (n.attrs.stroke) st.stroke = n.attrs.stroke
    if (n.attrs['stroke-width']) st['stroke-width'] = n.attrs['stroke-width']
    const s = scala * scalaTransform(n.attrs.transform)
    if (n.tag === 'use') {
      const riferito = perId[(n.attrs.href ?? n.attrs['xlink:href'] ?? '').replace('#', '')]
      if (riferito) visita(riferito, s, st, true)
      return
    }
    if (n.tag === 'path' && /^#19/i.test(st.stroke ?? '') && st['stroke-width']) {
      spessori.push(parseFloat(st['stroke-width']) * s)
    }
    n.figli.forEach((f) => visita(f, s, st, dentroDefs))
  }
  visita(albero, 1, {}, false)
  return spessori
}

const mediana = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
const risultato = {}
const senzaContorno = []
for (const f of fs.readdirSync(cartella).filter((f) => f.endsWith('.svg')).sort()) {
  const svg = fs.readFileSync(path.join(cartella, f), 'utf8')
  const vb = svg.match(/viewBox="([^"]*)"/)[1].trim().split(/\s+/).map(Number)
  const spessori = misura(svg)
  let spessore = spessori.length ? mediana(spessori) : null
  if (spessore == null) senzaContorno.push(f)
  risultato[f.replace('.svg', '')] = { vbL: vb[2], vbA: vb[3], spessore, n: spessori.length }
}
const mediano = mediana(Object.values(risultato).filter((r) => r.spessore).map((r) => r.spessore))
const tabella = {}
for (const [nome, r] of Object.entries(risultato)) {
  const fattore = (r.spessore ?? mediano) / RIFERIMENTO
  // più il contorno è spesso (a parità di viewBox), più la figura va rimpicciolita
  const f = 1 / fattore
  tabella[nome] = {
    spessore: +(r.spessore ?? mediano).toFixed(4),
    fattore: +f.toFixed(4),
    larghezza: +(r.vbL * f).toFixed(2),
    altezza: +(r.vbA * f).toFixed(2),
  }
}
fs.writeFileSync(path.join(radice, 'src/data/scalePersonaggi.json'), JSON.stringify(tabella, null, 1) + '\n')
console.log(`mediana spessore ${mediano.toFixed(3)} (riferimento ${RIFERIMENTO.toFixed(3)})`)
if (senzaContorno.length) console.log('senza contorno (usata la mediana):', senzaContorno.join(', '))
for (const [nome, t] of Object.entries(tabella)) console.log(nome.padEnd(30), t.spessore, t.fattore, t.altezza)

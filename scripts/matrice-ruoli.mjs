#!/usr/bin/env node
// Genera docs/matrice-ruoli.html (autonomo: CSS, JS e dati inline) da docs/matrice-ruoli.json.
// Uso: node scripts/matrice-ruoli.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs')
const dati = JSON.parse(fs.readFileSync(path.join(docs, 'matrice-ruoli.json'), 'utf8'))

const FAZIONI = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']
const ETICHETTA_FAZIONE = { villaggio: 'Villaggio', lupi: 'Lupi', indipendente: 'Indipendenti', sconosciuto: 'Sconosciuti' }
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// ruoli raggruppati per fazione, alfabetici dentro il gruppo
const ruoli = [...dati.ruoli].sort(
  (a, b) => FAZIONI.indexOf(a.fazione) - FAZIONI.indexOf(b.fazione) || a.nome.localeCompare(b.nome, 'it'),
)
const idx = Object.fromEntries(ruoli.map((r, i) => [r.slug, i]))
const key = (a, b) => (idx[a] <= idx[b] ? `${a}|${b}` : `${b}|${a}`)
const celle = new Map(dati.celle.map((c) => [key(c.a, c.b), c]))

// classe colore: vuota = non valutata; par = grigio; ok = verde; warn = arancio; bad = rosso
function classe(c) {
  if (!c || c.valutata === 'no') return 'no'
  if (c.valutata === 'parziale') return 'par'
  if (c.problemi.some((p) => p.stato !== 'risolto')) return 'bad'
  return c.problemi.length ? 'warn' : 'ok'
}
const SIMBOLO = { no: '', par: '·', ok: '✓', warn: '!', bad: '‼' }
const NOME_CLASSE = { no: 'non valutata', par: 'parziale', ok: 'valutata, nessun problema', warn: 'valutata, problemi risolti', bad: 'valutata, problemi aperti o dubbi' }

const n = ruoli.length
const stat = { si: 0, par: 0, ok: 0, warn: 0, bad: 0 }
const perRuolo = ruoli.map(() => ({ val: 0 }))
let totale = 0
for (let i = 0; i < n; i++) {
  for (let j = i; j < n; j++) {
    totale++
    const c = celle.get(key(ruoli[i].slug, ruoli[j].slug))
    const k = classe(c)
    if (k === 'no') continue
    if (k === 'par') stat.par++
    else { stat.si++; stat[k]++ }
    perRuolo[i].val++
    if (i !== j) perRuolo[j].val++
  }
}
const valutate = stat.si + stat.par

// ---- tabella
let thead = '<tr><th class="corner g1" rowspan="2"></th>'
for (const f of FAZIONI) {
  const k = ruoli.filter((r) => r.fazione === f).length
  if (k) thead += `<th class="grp f-${f}" colspan="${k}">${ETICHETTA_FAZIONE[f]}</th>`
}
thead += '</tr><tr>'
ruoli.forEach((r, j) => {
  thead += `<th class="col f-${r.fazione}" data-j="${j}" scope="col"><span>${esc(r.nome)}</span></th>`
})
thead += '</tr>'
let tbody = ''
ruoli.forEach((r, i) => {
  tbody += `<tr data-i="${i}"><th class="row f-${r.fazione}" data-i="${i}" scope="row">${esc(r.nome)}</th>`
  ruoli.forEach((s, j) => {
    const c = celle.get(key(r.slug, s.slug))
    const k = classe(c)
    const attr = k === 'no' ? '' : ` tabindex="0" role="button" aria-label="${esc(r.nome)} e ${esc(s.nome)}: ${NOME_CLASSE[k]}"`
    tbody += `<td class="c ${k}${i === j ? ' diag' : ''}" data-i="${i}" data-j="${j}"${attr}>${SIMBOLO[k]}</td>`
  })
  tbody += '</tr>'
})

// dati per il pannello (solo celle non vuote)
const pannello = {}
for (const c of dati.celle) {
  if (c.valutata === 'no' && !c.problemi.length) continue
  pannello[key(c.a, c.b)] = { v: c.valutata, k: classe(c), p: c.problemi, f: c.fonti }
}
const json = JSON.stringify({ ruoli: ruoli.map((r) => [r.slug, r.nome, r.fazione]), celle: pannello }).replace(/</g, '\\u003c')
const pct = ((valutate / totale) * 100).toFixed(1)

const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Matrice interazioni tra ruoli</title>
<style>
:root{
  --bg:#f6f5f2; --fg:#1d1d1f; --muted:#5c5c63; --card:#fff; --line:#cfcdc6;
  --no:#fff; --par:#d4d4d8; --par-fg:#3f3f46;
  --ok:#2e8b57; --ok-fg:#fff; --warn:#f59e0b; --warn-fg:#2b1a00; --bad:#c62828; --bad-fg:#fff;
  --f-villaggio:#2563eb; --f-lupi:#b91c1c; --f-indipendente:#7e22ce; --f-sconosciuto:#52525b;
  --sel:#111;
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#16171a; --fg:#ececf0; --muted:#a1a1aa; --card:#212328; --line:#3a3c43;
    --no:#1c1d21; --par:#52525b; --par-fg:#f4f4f5;
    --ok:#3fb27f; --ok-fg:#04210f; --warn:#f2a93b; --warn-fg:#2b1a00; --bad:#ef5350; --bad-fg:#2a0505;
    --f-villaggio:#60a5fa; --f-lupi:#f87171; --f-indipendente:#c084fc; --f-sconosciuto:#a1a1aa;
    --sel:#fff;
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
header{padding:12px 16px 4px}
h1{font-size:1.25rem;margin:0 0 4px}
.sub{color:var(--muted);margin:0 0 8px;font-size:.9rem}
.stats{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 8px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:6px 10px;min-width:120px}
.stat b{display:block;font-size:1.15rem}
.stat span{color:var(--muted);font-size:.8rem}
.bar{height:8px;background:var(--par);border-radius:4px;overflow:hidden;margin:0 16px 8px}
.bar i{display:block;height:100%;background:var(--ok)}
.tools{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:0 16px 8px}
.tools select{font:inherit;padding:4px 8px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg)}
.legend{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.8rem;color:var(--muted)}
.legend span{display:inline-flex;align-items:center;gap:4px}
.sw{display:inline-block;width:14px;height:14px;border:1px solid var(--line);border-radius:3px}
.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;padding:0 16px 220px}
@media (min-width:900px){.layout{grid-template-columns:minmax(0,1fr) 340px;padding-bottom:16px}}
.wrap{overflow:auto;max-height:calc(100vh - 230px);min-height:340px;border:1px solid var(--line);border-radius:8px;background:var(--card)}
table{border-collapse:separate;border-spacing:0;font-size:12px}
th,td{padding:0}
.corner{position:sticky;left:0;top:0;z-index:5;background:var(--card);min-width:128px}
.grp{position:sticky;top:0;z-index:3;height:22px;background:var(--card);color:var(--fg);font-size:11px;text-align:center;border-bottom:3px solid;white-space:nowrap}
.col{position:sticky;top:22px;z-index:3;background:var(--card);height:132px;width:26px;min-width:26px;vertical-align:bottom;border-bottom:1px solid var(--line);cursor:default}
.col span{display:inline-block;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;padding:4px 0;font-weight:500}
.row{position:sticky;left:0;z-index:2;background:var(--card);text-align:left;white-space:nowrap;padding:0 8px;min-width:128px;border-right:1px solid var(--line);font-weight:500;height:26px}
.f-villaggio{border-color:var(--f-villaggio)}.f-lupi{border-color:var(--f-lupi)}.f-indipendente{border-color:var(--f-indipendente)}.f-sconosciuto{border-color:var(--f-sconosciuto)}
.grp.f-villaggio,.col.f-villaggio,.row.f-villaggio{--fc:var(--f-villaggio)}
.grp.f-lupi,.col.f-lupi,.row.f-lupi{--fc:var(--f-lupi)}
.grp.f-indipendente,.col.f-indipendente,.row.f-indipendente{--fc:var(--f-indipendente)}
.grp.f-sconosciuto,.col.f-sconosciuto,.row.f-sconosciuto{--fc:var(--f-sconosciuto)}
.col{box-shadow:inset 0 3px 0 var(--fc)}
.row{box-shadow:inset 4px 0 0 var(--fc)}
.col span,.row,.grp{color:var(--fg)}
.grp{color:var(--fc)}
.c{width:26px;min-width:26px;height:26px;text-align:center;border:1px solid var(--line);border-width:0 1px 1px 0;font-weight:700;line-height:24px;cursor:default}
.c.no{background:var(--no)}
.c.par{background:var(--par);color:var(--par-fg);cursor:pointer}
.c.ok{background:var(--ok);color:var(--ok-fg);cursor:pointer}
.c.warn{background:var(--warn);color:var(--warn-fg);cursor:pointer}
.c.bad{background:var(--bad);color:var(--bad-fg);cursor:pointer}
.c.diag.no{background:repeating-linear-gradient(45deg,var(--no),var(--no) 4px,var(--par) 4px,var(--par) 5px)}
.c:focus-visible,.c.sel{outline:3px solid var(--sel);outline-offset:-3px}
.dim{opacity:.22}
.hl{opacity:1}
aside{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;overflow:auto}
@media (min-width:900px){aside{position:sticky;top:8px;max-height:calc(100vh - 24px)}}
@media (max-width:899px){aside{position:fixed;left:0;right:0;bottom:0;max-height:42vh;border-radius:12px 12px 0 0;z-index:10;box-shadow:0 -4px 16px rgba(0,0,0,.25)}}
aside h2{font-size:1rem;margin:0 0 4px}
aside h3{font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:10px 0 4px}
aside ul{margin:0;padding-left:18px}
aside li{margin:3px 0}
.tag{display:inline-block;font-size:.7rem;font-weight:700;border-radius:4px;padding:0 5px;margin-right:4px;color:#fff}
.tag.risolto{background:#2e8b57}.tag.aperto{background:#c62828}.tag.dubbio{background:#b45309}
@media (prefers-color-scheme: dark){.tag.risolto{background:#3fb27f;color:#04210f}.tag.aperto{background:#ef5350;color:#2a0505}.tag.dubbio{background:#f2a93b;color:#2b1a00}}
.muted{color:var(--muted)}
.src{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.78rem;word-break:break-all}
</style>
</head>
<body>
<header>
<h1>Matrice delle interazioni tra ruoli</h1>
<p class="sub">Quali coppie di ruoli sono state valutate (test, audit, partite di prova) e con quali problemi. La diagonale &egrave; il ruolo da solo. Aggiornare con <code>node scripts/matrice-ruoli.mjs</code>.</p>
</header>
<div class="stats">
  <div class="stat"><b>${valutate} / ${totale}</b><span>coppie valutate (${pct}%)</span></div>
  <div class="stat"><b>${stat.si}</b><span>valutate esplicitamente</span></div>
  <div class="stat"><b>${stat.par}</b><span>toccate di passaggio</span></div>
  <div class="stat"><b>${stat.bad}</b><span>con problemi aperti o dubbi</span></div>
  <div class="stat"><b>${totale - valutate}</b><span>non valutate</span></div>
</div>
<div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
<div class="tools">
  <label>Filtra per ruolo: <select id="filtro"><option value="">(tutti)</option>${ruoli.map((r, i) => `<option value="${i}">${esc(r.nome)} (${perRuolo[i].val}/${n})</option>`).join('')}</select></label>
  <div class="legend">
    <span><i class="sw" style="background:var(--no)"></i>non valutata</span>
    <span><i class="sw" style="background:var(--par)"></i>parziale</span>
    <span><i class="sw" style="background:var(--ok)"></i>valutata, ok</span>
    <span><i class="sw" style="background:var(--warn)"></i>problemi risolti</span>
    <span><i class="sw" style="background:var(--bad)"></i>problemi aperti / dubbi</span>
  </div>
</div>
<div class="layout">
<div class="wrap" id="wrap"><table id="m"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>
<aside id="pan" aria-live="polite"><p class="muted">Passa sopra una cella (o toccala) per vedere problemi e fonti. Le celle vuote non sono mai state valutate.</p></aside>
</div>
<script id="dati" type="application/json">${json}</script>
<script>
(function(){
  var D=JSON.parse(document.getElementById('dati').textContent), R=D.ruoli, C=D.celle;
  var pan=document.getElementById('pan'), tab=document.getElementById('m'), sel=null, pinned=false;
  var NOME={no:'non valutata',par:'parziale (toccata di passaggio)',ok:'valutata, nessun problema',warn:'valutata, problemi risolti',bad:'valutata, problemi aperti o dubbi'};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function key(i,j){var a=R[i][0],b=R[j][0];return i<=j?a+'|'+b:b+'|'+a}
  function mostra(i,j){
    var c=C[key(i,j)], t=(i===j)?esc(R[i][1])+' (da solo)':esc(R[i][1])+' &times; '+esc(R[j][1]);
    var h='<h2>'+t+'</h2>';
    if(!c){pan.innerHTML=h+'<p class="muted">Non valutata: nessun test, audit o partita di prova documentato per questa coppia.</p>';return}
    h+='<p>'+NOME[c.k]+'</p>';
    if(c.p.length){h+='<h3>Problemi e dubbi</h3><ul>'+c.p.map(function(p){return '<li><span class="tag '+p.stato+'">'+p.stato+'</span>'+esc(p.testo)+'</li>'}).join('')+'</ul>'}
    else h+='<p class="muted">Nessun problema noto.</p>';
    if(c.f.length)h+='<h3>Fonti</h3><ul>'+c.f.map(function(f){return '<li class="src">'+esc(f)+'</li>'}).join('')+'</ul>';
    pan.innerHTML=h;
  }
  function cella(e){var t=e.target.closest('td.c');return t&&!t.classList.contains('no')?t:null}
  tab.addEventListener('mouseover',function(e){if(pinned)return;var t=cella(e);if(t)mostra(+t.dataset.i,+t.dataset.j)});
  tab.addEventListener('click',function(e){
    var t=e.target.closest('td.c'); if(!t)return;
    if(sel)sel.classList.remove('sel');
    if(t.classList.contains('no')){pinned=false;sel=null;mostra(+t.dataset.i,+t.dataset.j);return}
    sel=t;t.classList.add('sel');pinned=true;mostra(+t.dataset.i,+t.dataset.j);
  });
  tab.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&cella(e)){e.preventDefault();cella(e).click()}});
  // filtro per ruolo: evidenzia riga e colonna, attenua il resto, elenca le coppie non valutate
  document.getElementById('filtro').addEventListener('change',function(){
    var v=this.value, all=tab.querySelectorAll('td.c,th.row,th.col');
    all.forEach(function(x){x.classList.remove('dim')});
    pinned=false;
    if(v===''){pan.innerHTML='<p class="muted">Passa sopra una cella (o toccala) per vedere problemi e fonti.</p>';return}
    v=+v;
    tab.querySelectorAll('td.c').forEach(function(x){if(+x.dataset.i!==v&&+x.dataset.j!==v)x.classList.add('dim')});
    tab.querySelectorAll('th.row').forEach(function(x){if(+x.dataset.i!==v)x.classList.add('dim')});
    tab.querySelectorAll('th.col').forEach(function(x){if(+x.dataset.j!==v)x.classList.add('dim')});
    var no=[];for(var j=0;j<R.length;j++){if(!C[key(v,j)])no.push(R[j][1])}
    pan.innerHTML='<h2>'+esc(R[v][1])+'</h2><p>Non valutato con '+no.length+' ruoli su '+R.length+'.</p>'+(no.length?'<h3>Coppie non valutate</h3><p>'+no.map(esc).join(', ')+'</p>':'');
    var th=tab.querySelector('th.row[data-i="'+v+'"]');if(th&&th.scrollIntoView)th.scrollIntoView({block:'center'});
  });
})();
</script>
</body>
</html>
`
fs.writeFileSync(path.join(docs, 'matrice-ruoli.html'), html)
console.log(`matrice-ruoli.html: ${n} ruoli, ${totale} coppie, valutate ${valutate} (si ${stat.si}, parziale ${stat.par}), problemi aperti/dubbi ${stat.bad}`)

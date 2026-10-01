/// <reference lib="webworker" />

// Service Worker scritto a mano (Cache API nativa) invece di affidarsi al
// motore di precache automatico di Workbox: stesso risultato (l'app e i
// suoi asset restano disponibili senza connessione dopo il primo
// caricamento), ma con una logica semplice e ispezionabile in poche righe.
// `self.__WB_MANIFEST` è un segnaposto: vite-plugin-pwa (strategia
// "injectManifest", vedi vite.config.js) lo sostituisce a ogni build con
// l'elenco reale dei file generati, ciascuno con la propria revisione/hash.
const VOCI = self.__WB_MANIFEST
// nome versionato: hash dell'elenco file+revisioni del build, cambia a ogni
// build che cambia anche un solo file (poi activate cancella le cache vecchie)
let hash = 0
for (const c of JSON.stringify(VOCI)) hash = (hash * 31 + c.charCodeAt(0)) | 0
const CACHE_NAME = `meltable-wolves-${(hash >>> 0).toString(36)}`
// '/' oltre ai file del build: è l'URL di start_url, cioè quello che apre la PWA
const URL_DA_PRECARICARE = ['/', ...VOCI.map((voce) => voce.url)]

// niente self.skipWaiting(): una nuova versione resta in attesa e si attiva
// al prossimo avvio dell'app (tutte le schede chiuse), così un aggiornamento
// non interrompe né ricarica una partita in corso (vedi registerType 'prompt')

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URL_DA_PRECARICARE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // le versioni precedenti di questa stessa app (build più vecchie)
    // vanno ripulite, altrimenti la cache cresce a ogni aggiornamento
    caches
      .keys()
      .then((nomi) => Promise.all(nomi.filter((nome) => nome !== CACHE_NAME).map((nome) => caches.delete(nome))))
      .then(() => self.clients.claim()),
  )
})

// "cache, con aggiornamento in cache per la prossima volta": risponde subito
// con quello che c'è già (compresi i font di Google, non precaricati ma
// salvati qui la prima volta che vengono richiesti), e nel frattempo tiene
// la cache aggiornata con l'ultima risposta valida dalla rete.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const rete = fetch(event.request).then((risposta) => {
        // le risposte opache (font di Google cross-origin senza CORS) non
        // hanno .ok ma sono comunque cacheabili
        if (risposta.ok || risposta.type === 'opaque') {
          const copia = risposta.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia))
        }
        return risposta
      })
      if (cached) {
        rete.catch(() => {}) // aggiornamento in background: offline è normale
        return cached
      }
      // offline senza copia in cache: per una navigazione si ripiega sulla
      // shell dell'app, altrimenti un errore di rete vero (mai undefined,
      // che farebbe fallire respondWith)
      return rete.catch(async () => {
        if (event.request.mode === 'navigate') {
          const shell = (await caches.match('/index.html')) ?? (await caches.match('/'))
          if (shell) return shell
        }
        return Response.error()
      })
    }),
  )
})

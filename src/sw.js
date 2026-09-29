/// <reference lib="webworker" />

// Service Worker scritto a mano (Cache API nativa) invece di affidarsi al
// motore di precache automatico di Workbox: stesso risultato (l'app e i
// suoi asset restano disponibili senza connessione dopo il primo
// caricamento), ma con una logica semplice e ispezionabile in poche righe.
// `self.__WB_MANIFEST` è un segnaposto: vite-plugin-pwa (strategia
// "injectManifest", vedi vite.config.js) lo sostituisce a ogni build con
// l'elenco reale dei file generati, ciascuno con la propria revisione/hash.
const CACHE_NAME = 'meltable-wolves-v1'
const URL_DA_PRECARICARE = self.__WB_MANIFEST.map((voce) => voce.url)

self.skipWaiting()

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
      const rete = fetch(event.request)
        .then((risposta) => {
          if (risposta.ok) {
            const copia = risposta.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia))
          }
          return risposta
        })
        .catch(() => cached)
      return cached ?? rete
    }),
  )
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // rende l'app installabile e utilizzabile offline (nessuna connessione
    // al tavolo da gioco): il Service Worker (src/sw.js, scritto a mano)
    // mette in cache tutti gli asset del build al primo caricamento —
    // compresi tutti gli assets/ pubblici (facce, illustrazioni, icone),
    // visto che durante una partita può servire in qualunque momento un
    // ruolo qualsiasi — e i font di Google al primo utilizzo.
    // "injectManifest" invece di "generateSW": costruiamo la logica del SW
    // noi stessi (poche righe, ispezionabili), il plugin si limita a
    // iniettare l'elenco dei file del build al posto di self.__WB_MANIFEST.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // 'prompt' + nessun onNeedRefresh in main.jsx: la nuova versione si
      // attiva al prossimo avvio, senza reload forzato a metà partita
      registerType: 'prompt',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      manifest: {
        name: 'Meltable Wolves — Narratore',
        short_name: 'Meltable Wolves',
        description: 'Meltable Wolves - Assistente per il Narratore',
        start_url: '/',
        display: 'standalone',
        background_color: '#8ca6c6',
        theme_color: '#1b2036',
        icons: [
          { src: '/assets/icone/app/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/assets/icone/app/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // faccia più piccola (zona sicura ~80%) per le maschere adattive di Android
          { src: '/assets/icone/app/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/assets/icone/app/icon-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    // i test d'integrazione di App montano l'intera app: con la suite in parallelo superano i 5s di default
    testTimeout: 20000,
  },
})

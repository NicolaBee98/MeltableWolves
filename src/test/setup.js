import '@testing-library/jest-dom/vitest'

// jsdom non implementa ResizeObserver: stub minimo, sufficiente per i
// componenti che lo usano solo per adattare un layout alla larghezza reale
// (nei test quella dimensione non conta, i pixel non sono significativi)
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom non implementa window.scrollTo (App lo usa al cambio schermata)
window.scrollTo = () => {}

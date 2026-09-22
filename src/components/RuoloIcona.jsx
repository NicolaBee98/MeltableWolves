import { faccePath, personaggioPath } from '../data/assetRuoli'

const ICONA_SCONOSCIUTO = '/assets/icone/icona_ruolo_sconosciuto.svg'

// Icona-faccia di un ruolo (piccola, in liste/chip). Di norma decorativa
// (alt vuoto + aria-hidden) perché il nome del ruolo è già testo accanto a
// lei; passare `alt` la rende invece l'unico veicolo testuale di quella
// informazione (es. badge ruolo in Votazione, dove il nome del ruolo non
// compare altrimenti).
//
// Senza uno slug valido (giocatore non ancora assegnato, passo notturno che
// copre più ruoli insieme) mostra il punto interrogativo invece di sparire:
// il narratore sa così che lì c'è un'identità che il gioco non rivela ancora,
// non un buco nell'interfaccia.
export function RuoloIcona({ slug, variante, size = 28, className = '', alt }) {
  const src = faccePath(slug, variante) ?? ICONA_SCONOSCIUTO
  const decorativa = alt === undefined
  return (
    <img
      src={src}
      alt={alt ?? ''}
      aria-hidden={decorativa ? 'true' : undefined}
      className={`ruolo-icona ${className}`.trim()}
      width={size}
      height={size}
      loading="lazy"
    />
  )
}

// Illustrazione a figura intera di un ruolo, per i momenti scenici
// (assegnazione carta, rivelazione). Anche questa decorativa: il testo che
// la accompagna dice già di quale ruolo si tratta.
export function RuoloIllustrazione({ slug, className = '' }) {
  const src = personaggioPath(slug)
  if (!src) return null
  return <img src={src} alt="" aria-hidden="true" className={`ruolo-illustrazione ${className}`.trim()} loading="lazy" />
}

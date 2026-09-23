import { AzioneRivelaRuolo } from './AzioneRivelaRuolo'
import { AzioneIndagine } from './AzioneIndagine'

// "Variante: il Medium potrà percepire soltanto se il ruolo avesse aura
// benevola o malvagia" (testoRegole in roles.js): attivabile dalle
// impostazioni. Senza variante scopre il ruolo esatto del defunto
// (AzioneRivelaRuolo); con la variante attiva funziona come il Veggente,
// ma su un bersaglio morto (AzioneIndagine con bersaglio: 'morto').
export function AzioneMedium({ varianteMedium, ...props }) {
  return varianteMedium ? (
    <AzioneIndagine {...props} ruoloSlugAttore="medium" etichettaAttore="Medium" bersaglio="morto" />
  ) : (
    <AzioneRivelaRuolo {...props} ruoloSlugAttore="medium" etichettaAttore="Medium" bersaglio="morto" />
  )
}

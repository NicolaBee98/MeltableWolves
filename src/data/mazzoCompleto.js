import { ROLES } from './roles'
import { FILE_RUOLI } from './assetRuoli'

// Quante copie fisiche di ciascun ruolo ci sono nel mazzo reale (78 carte
// ruolo, pag. 3 del libretto: 15 Villici, 5 Lupi Mannari, gli altri 51 unici).
const COPIE = { villico: 15, 'lupo-mannaro': 5, guardia: 2 }

const FAZIONI_ORDINE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']

// Il "vero mazzo" per lo sfogliatore a schermo intero: una voce per ogni
// carta fisica (non una per ruolo, come nella galleria), nello stesso ordine
// per fazione della galleria, più le carte di riferimento/vuote in coda.
export const MAZZO_COMPLETO = [
  ...FAZIONI_ORDINE.flatMap((fazione) =>
    ROLES.filter((r) => r.fazione === fazione).flatMap((ruolo) => {
      const file = FILE_RUOLI[ruolo.slug]
      const copie = COPIE[ruolo.slug] ?? 1
      return Array.from({ length: copie }, (_, i) => ({
        etichetta: copie > 1 ? `${ruolo.nome} (${i + 1}/${copie})` : ruolo.nome,
        path: copie > 1 ? `/assets/carte/${file}_${i + 1}.svg` : `/assets/carte/${file}.svg`,
      }))
    }),
  ),
  { etichetta: 'Narratore', path: '/assets/carte/Riferimento_Narratore.svg' },
  { etichetta: 'Cala la notte', path: '/assets/carte/Riferimento_Cala_la_notte.svg' },
  { etichetta: 'Si leva il giorno', path: '/assets/carte/Riferimento_E_giorno.svg' },
  { etichetta: 'La prima partita', path: '/assets/carte/Riferimento_Prima_partita.svg' },
  { etichetta: 'Retro carta', path: '/assets/carte/Retro_carta.svg' },
]

import { AzioneCondizioneSingola } from './AzioneCondizioneSingola'
import { AzioneCondizioneDoppia } from './AzioneCondizioneDoppia'
import { AzioneBrancoLupi } from './AzioneBrancoLupi'
import { AzioneChupacabra } from './AzioneChupacabra'
import { AzioneResuscita } from './AzioneResuscita'
import { AzioneStrega } from './AzioneStrega'
import { AzioneLegame } from './AzioneLegame'
import { AzioneCortigiana } from './AzioneCortigiana'
import { AzioneAddolorata } from './AzioneAddolorata'
import { AzioneIndagine } from './AzioneIndagine'
import { AzioneRivelaRuolo } from './AzioneRivelaRuolo'
import { AzioneInquisitore } from './AzioneInquisitore'
import { RUOLI_BRANCO_LUPI } from '../../../data/nightSteps'

export const AZIONI_NOTTURNE = {
  paladino: {
    Componente: AzioneCondizioneSingola,
    props: { condizione: 'protetto', etichetta: 'Chi proteggere', ruoloSlugAttore: 'paladino' },
  },
  untore: {
    Componente: AzioneCondizioneSingola,
    props: { condizione: 'unto', etichetta: 'Chi ungere', ruoloSlugAttore: 'untore' },
  },
  fattucchiera: {
    Componente: AzioneCondizioneSingola,
    props: { condizione: 'inibito', etichetta: 'Chi inibire', ruoloSlugAttore: 'fattucchiera' },
  },
  maga: {
    Componente: AzioneCondizioneSingola,
    props: { condizione: 'trasformato', etichetta: 'Chi trasformare', ruoloSlugAttore: 'maga' },
  },
  pifferaio: {
    Componente: AzioneCondizioneDoppia,
    props: { condizione: 'ipnotizzato', etichetta: 'Chi ipnotizzare (due giocatori)', ruoloSlugAttore: 'pifferaio' },
  },
  sacerdote: {
    Componente: AzioneCondizioneDoppia,
    props: { condizione: 'innamorato', etichetta: 'Chi unire (due giocatori)', ruoloSlugAttore: 'sacerdote' },
  },
  'branco-lupi': { Componente: AzioneBrancoLupi, props: { ruoli: RUOLI_BRANCO_LUPI } },
  chupacabra: { Componente: AzioneChupacabra, props: {} },
  guaritore: { Componente: AzioneResuscita, props: { potereSlug: 'guaritore-resuscita', ruoloSlugAttore: 'guaritore' } },
  'sciacallo-mannaro': { Componente: AzioneResuscita, props: { potereSlug: 'sciacallo-mannaro-resuscita', ruoloSlugAttore: 'sciacallo-mannaro' } },
  strega: { Componente: AzioneStrega, props: {} },
  apprendista: { Componente: AzioneLegame, props: { ruoloSlugAttore: 'apprendista', tipoLegame: 'apprendista', etichetta: 'Chi seguire come maestro' } },
  cavaliere: { Componente: AzioneLegame, props: { ruoloSlugAttore: 'cavaliere', tipoLegame: 'cavaliere', etichetta: 'Per chi sacrificarsi' } },
  'figlia-dei-lupi': { Componente: AzioneLegame, props: { ruoloSlugAttore: 'figlia-dei-lupi', tipoLegame: 'figlia-dei-lupi', etichetta: 'Chi scegliere come genitore' } },
  cortigiana: { Componente: AzioneCortigiana, props: {} },
  addolorata: { Componente: AzioneAddolorata, props: {} },
  veggente: { Componente: AzioneIndagine, props: {} },
  'veggente-mannaro': {
    Componente: AzioneIndagine,
    props: { ruoloSlugAttore: 'veggente-mannaro', etichettaAttore: 'Veggente Mannaro' },
  },
  cartomante: {
    Componente: AzioneRivelaRuolo,
    props: { ruoloSlugAttore: 'cartomante', etichettaAttore: 'Cartomante', bersaglio: 'vivo' },
  },
  medium: {
    Componente: AzioneRivelaRuolo,
    props: { ruoloSlugAttore: 'medium', etichettaAttore: 'Medium', bersaglio: 'morto' },
  },
  inquisitore: { Componente: AzioneInquisitore, props: {} },
}

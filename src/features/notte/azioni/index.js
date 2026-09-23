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
import { AzioneLadro } from './AzioneLadro'
import { AzioneMimo } from './AzioneMimo'
import { AzioneMedium } from './AzioneMedium'
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
    // inibire se stessa è un paradosso (bloccherebbe l'azione che la sta
    // già bloccando): unico ruolo tra quelli con AzioneCondizioneSingola a
    // escludersi dai propri bersagli
    props: { condizione: 'inibito', etichetta: 'Chi inibire', ruoloSlugAttore: 'fattucchiera', escludiAttore: true },
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
  // il Mimo assume letteralmente il ruoloSlug del bersaglio (vedi
  // AzioneMimo.jsx): niente reazione a parte alla sua morte, risolviLegami
  // ignora il tipo 'mimo', il legame resta per tutta la partita solo per
  // ricordare chi stava imitando.
  mimo: { Componente: AzioneMimo, props: {} },
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
  medium: { Componente: AzioneMedium, props: {} },
  inquisitore: { Componente: AzioneInquisitore, props: {} },
  ladro: { Componente: AzioneLadro, props: {} },
}

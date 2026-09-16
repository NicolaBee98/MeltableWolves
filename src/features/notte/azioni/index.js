import { AzioneCondizioneSingola } from './AzioneCondizioneSingola'
import { AzioneCondizioneDoppia } from './AzioneCondizioneDoppia'
import { AzioneBrancoLupi } from './AzioneBrancoLupi'
import { AzioneChupacabra } from './AzioneChupacabra'
import { AzioneResuscita } from './AzioneResuscita'
import { AzioneStrega } from './AzioneStrega'

export const AZIONI_NOTTURNE = {
  paladino: { Componente: AzioneCondizioneSingola, props: { condizione: 'protetto', etichetta: 'Chi proteggere' } },
  untore: { Componente: AzioneCondizioneSingola, props: { condizione: 'unto', etichetta: 'Chi ungere' } },
  fattucchiera: { Componente: AzioneCondizioneSingola, props: { condizione: 'inibito', etichetta: 'Chi inibire' } },
  maga: { Componente: AzioneCondizioneSingola, props: { condizione: 'trasformato', etichetta: 'Chi trasformare' } },
  pifferaio: { Componente: AzioneCondizioneDoppia, props: { condizione: 'ipnotizzato', etichetta: 'Chi ipnotizzare (due giocatori)' } },
  sacerdote: { Componente: AzioneCondizioneDoppia, props: { condizione: 'innamorato', etichetta: 'Chi unire (due giocatori)' } },
  'branco-lupi': { Componente: AzioneBrancoLupi, props: {} },
  chupacabra: { Componente: AzioneChupacabra, props: {} },
  guaritore: { Componente: AzioneResuscita, props: { potereSlug: 'guaritore-resuscita', ruoloSlugAttore: 'guaritore' } },
  'sciacallo-mannaro': { Componente: AzioneResuscita, props: { potereSlug: 'sciacallo-mannaro-resuscita', ruoloSlugAttore: 'sciacallo-mannaro' } },
  strega: { Componente: AzioneStrega, props: {} },
}

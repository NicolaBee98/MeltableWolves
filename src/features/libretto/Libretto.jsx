import { SEZIONI } from '../../data/libretto'
import { ROLES, CARATTERISTICHE_RUOLI, CARATTERISTICA_ICONA } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { RuoloIcona } from '../../components/RuoloIcona'
import { TestoFormattato } from '../../components/TestoFormattato'
import {
  condizionePath,
  iconaPath,
  personaggioPath,
  personaggioRiconoscimentoPath,
  altezzaNaturaleRiconoscimento,
  FAZIONE_RUOLO_ICONA,
} from '../../data/assetRuoli'

// altezza a schermo del più alto dei quattro (Remo); gli altri si scalano
// dallo stesso fattore, vedi altezzaNaturaleRiconoscimento
const ALTEZZA_RICONOSCIMENTO_MASSIMA = 140
const SCALA_RICONOSCIMENTO = ALTEZZA_RICONOSCIMENTO_MASSIMA / altezzaNaturaleRiconoscimento('remo')

const FAZIONE_ICONA = {
  villaggio: 'icona_fazione_villaggio',
  lupi: 'icona_fazione_branco',
  indipendente: 'icona_fazione_indipendente',
  sconosciuto: 'icona_ruolo_sconosciuto_cerchiato',
  voltagabbana: 'icona_voltagabbana',
}

const PERSONAGGINI_RICONOSCIMENTI = ['diletta', 'remo', 'filippo', 'nicola']

// contenuto statico (mai riordinato): la chiave per indice è sicura e evita
// collisioni tra voci con lo stesso prefisso (successe con slice(0, 40))
function Paragrafi({ paragrafi }) {
  return paragrafi?.map((testo, i) => (
    <p key={i}>
      <TestoFormattato testo={testo} />
    </p>
  ))
}

// alcuni testi (es. la Variante del Borgomastro) hanno un "\n" interno che
// segna un secondo paragrafo, non solo un a-capo visivo
function TestoMultiParagrafo({ testo }) {
  return testo.split('\n').map((para, i) => (
    <p key={i}>
      <TestoFormattato testo={para} />
    </p>
  ))
}

// una voce può essere una stringa semplice, oppure { testo, sotto } per un
// secondo livello di elenco puntato annidato (es. "78 carte, di cui: ...")
function Lista({ voci }) {
  if (!voci) return null
  return (
    <ul>
      {voci.map((voce, i) => {
        const testo = typeof voce === 'string' ? voce : voce.testo
        const sotto = typeof voce === 'string' ? null : voce.sotto
        return (
          <li key={i}>
            <TestoFormattato testo={testo} />
            {sotto && (
              <ul>
                {sotto.map((sottoVoce, j) => (
                  <li key={j}>
                    <TestoFormattato testo={sottoVoce} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function SezioneFazioni({ fazioni }) {
  return (
    <ul className="libretto__fazioni">
      {fazioni.map((f) => (
        <li key={f.slug}>
          {FAZIONE_ICONA[f.slug] && <img src={iconaPath(FAZIONE_ICONA[f.slug])} alt="" aria-hidden="true" className="libretto__icona" />}
          <span>
            <strong>{f.nome}:</strong> {f.descrizione}
          </span>
        </li>
      ))}
    </ul>
  )
}

function SezioneCaratteristiche({ caratteristiche }) {
  return (
    <ul className="libretto__fazioni">
      {caratteristiche.map((c) => (
        <li key={c.testo}>
          {c.icona && <img src={iconaPath(c.icona)} alt="" aria-hidden="true" className="libretto__icona" />}
          <span>{c.testo}</span>
        </li>
      ))}
    </ul>
  )
}

function BadgeCaratteristiche({ slug }) {
  const chiavi = CARATTERISTICHE_RUOLI[slug] ?? []
  return chiavi.map((chiave) => (
    <img
      key={chiave}
      src={iconaPath(CARATTERISTICA_ICONA[chiave])}
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
      className="libretto__icona"
    />
  ))
}

function SezioneRuoli() {
  return (
    <dl className="libretto__ruoli">
      {[...ROLES]
        .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
        .map((ruolo) => (
          <div key={ruolo.slug} className="libretto__ruolo">
            <dt>
              <RuoloIcona slug={ruolo.slug} size={32} />
              <span className="libretto__ruolo-nome">{ruolo.nome}</span>
              {/* le icone di uno stesso ruolo (simbolo speciale + poteri)
                  restano a contatto tra loro su un'unica riga, invece di
                  distribuirsi con lo stesso gap del resto di dt e poter
                  andare a capo singolarmente */}
              <span className="libretto__badge-poteri">
                {/* un ruolo con un proprio simbolo speciale (Chupacabra,
                    Criceto Malvagio, Pifferaio, Capobranco, Figlia dei
                    Lupi, Mezzosangue...) mostra SOLO quello, non anche
                    l'icona generica della fazione: il simbolo speciale è
                    già la sua fazione, più precisa */}
                {FAZIONE_RUOLO_ICONA[ruolo.slug] ? (
                  <img
                    src={iconaPath(FAZIONE_RUOLO_ICONA[ruolo.slug])}
                    alt="simbolo speciale"
                    width={22}
                    height={22}
                    className="libretto__icona"
                  />
                ) : (
                  FAZIONE_ICONA[ruolo.fazione] && (
                    <img
                      src={iconaPath(FAZIONE_ICONA[ruolo.fazione])}
                      alt="fazione"
                      width={22}
                      height={22}
                      className="libretto__icona"
                    />
                  )
                )}
                <BadgeCaratteristiche slug={ruolo.slug} />
              </span>
            </dt>
            <dd>
              <TestoMultiParagrafo testo={ruolo.testoRegole} />
            </dd>
          </div>
        ))}
    </dl>
  )
}

// personaggio "immerso" nel testo della sezione (il testo vi scorre attorno),
// al posto di icone puramente decorative senza legame con l'ambientazione
function SezionePersonaggio({ slug }) {
  if (!slug) return null
  return <img src={personaggioPath(slug)} alt="" aria-hidden="true" className="libretto__personaggio-testo" />
}

// illustrazione di scena (più larga che alta, es. villaggio.svg): a banner
// sotto il titolo della sezione, non immersa nel testo come un personaggio
function SezioneIllustrazione({ src }) {
  if (!src) return null
  return <img src={src} alt="" aria-hidden="true" className="libretto__illustrazione" />
}

// i quattro personaggini degli autori originali, in fondo ai Riconoscimenti;
// il nome (preso dal nome del file) è testo HTML, non più disegnato dentro
// l'SVG come nella versione precedente dell'illustrazione
function SezionePersonaggini() {
  return (
    <div className="libretto__personaggini">
      {PERSONAGGINI_RICONOSCIMENTI.map((nome) => (
        <figure key={nome} className="libretto__personaggino-figura">
          <img
            src={personaggioRiconoscimentoPath(nome)}
            alt=""
            aria-hidden="true"
            className="libretto__personaggino"
            style={{ height: altezzaNaturaleRiconoscimento(nome) * SCALA_RICONOSCIMENTO }}
          />
          <figcaption>{nome[0].toUpperCase() + nome.slice(1)}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function SezioneCondizioni() {
  return (
    <dl className="libretto__ruoli">
      {CONDIZIONI.map((c) => (
        <div key={c.slug} className="libretto__ruolo">
          <dt>
            <img src={condizionePath(c.slug)} alt="" aria-hidden="true" width={32} height={32} className="ruolo-icona" />
            {c.nome}
          </dt>
          <dd>
            <TestoFormattato testo={c.descrizione} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Libretto({ onTornaAllaHome }) {
  return (
    <article className="libretto">
      <button type="button" onClick={onTornaAllaHome} className="libretto__indietro">
        ← Home
      </button>
      <h2 className="libretto__titolo-gioco">Meltable Wolves</h2>
      <p className="libretto__sottotitolo">Regolamento</p>

      {SEZIONI.map((sezione) => (
        <section key={sezione.titolo} className="libretto__sezione">
          <h3>{sezione.titolo}</h3>
          <SezionePersonaggio slug={sezione.personaggio} />
          <SezioneIllustrazione src={sezione.immagine} />
          <Paragrafi paragrafi={sezione.paragrafi} />
          <Lista voci={sezione.lista} />
          {sezione.fazioni && <SezioneFazioni fazioni={sezione.fazioni} />}
          {sezione.sottosezioni?.map((sotto, i) => (
            <div key={i} className="libretto__sottosezione">
              {sotto.titolo && <h4>{sotto.titolo}</h4>}
              <Paragrafi paragrafi={sotto.paragrafi} />
              <Lista voci={sotto.lista} />
            </div>
          ))}
          <Paragrafi paragrafi={sezione.paragrafiDopo} />
          {sezione.caratteristiche && <SezioneCaratteristiche caratteristiche={sezione.caratteristiche} />}
          {sezione.speciale === 'ruoli' && <SezioneRuoli />}
          {sezione.speciale === 'condizioni' && <SezioneCondizioni />}
          {sezione.titolo === 'Riconoscimenti' && <SezionePersonaggini />}
        </section>
      ))}
    </article>
  )
}

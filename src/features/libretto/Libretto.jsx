import { SEZIONI } from '../../data/libretto'
import { ROLES, CARATTERISTICHE_RUOLI, CARATTERISTICA_ICONA } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { RuoloIcona } from '../../components/RuoloIcona'
import { TestoFormattato } from '../../components/TestoFormattato'
import { condizionePath, iconaPath, personaggioRiconoscimentoPath, FAZIONE_RUOLO_ICONA } from '../../data/assetRuoli'

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
              {ruolo.nome}
              {FAZIONE_RUOLO_ICONA[ruolo.slug] && (
                <img
                  src={iconaPath(FAZIONE_RUOLO_ICONA[ruolo.slug])}
                  alt="simbolo speciale"
                  width={22}
                  height={22}
                  className="libretto__icona"
                />
              )}
              <BadgeCaratteristiche slug={ruolo.slug} />
            </dt>
            <dd>
              <TestoMultiParagrafo testo={ruolo.testoRegole} />
            </dd>
          </div>
        ))}
    </dl>
  )
}

// immagini decorative per spezzare il testo (icone/: nome file senza
// prefisso di cartella, vedi iconaPath)
function SezioneImmagini({ nomi }) {
  if (!nomi) return null
  return (
    <div className="libretto__immagini">
      {nomi.map((nome) => (
        <img key={nome} src={iconaPath(nome)} alt="" aria-hidden="true" className="libretto__immagine" />
      ))}
    </div>
  )
}

// i quattro personaggini degli autori originali, in fondo ai Riconoscimenti
function SezionePersonaggini() {
  return (
    <div className="libretto__personaggini">
      {PERSONAGGINI_RICONOSCIMENTI.map((nome) => (
        <img
          key={nome}
          src={personaggioRiconoscimentoPath(nome)}
          alt=""
          aria-hidden="true"
          className="libretto__personaggino"
        />
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
          <SezioneImmagini nomi={sezione.immagini} />
          {sezione.titolo === 'Riconoscimenti' && <SezionePersonaggini />}
        </section>
      ))}
    </article>
  )
}

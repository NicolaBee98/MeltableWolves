import { useState } from 'react'
import { risultatoVotazione } from '../../data/votazione'
import { CONDIZIONI } from '../../data/conditions'
import { ROLES, ruoloPerDisplay, ruoloIconaGiocatore } from '../../data/roles'
import { ruoliAssegnabili } from '../../data/assegnazione'
import { TimerSpareggio } from './TimerSpareggio'
import { EventiSpeciali } from './EventiSpeciali'
import { PromemoriaMorte } from './PromemoriaMorte'
import { SceltaGiocatore } from '../../components/SceltaGiocatore'
import { RuoloIcona } from '../../components/RuoloIcona'
import { condizionePath, variantePerGiocatore } from '../../data/assetRuoli'
import { condizioniVittoria } from '../../data/vittoria'

function BadgeCondizioni({ condizioni = [] }) {
  return condizioni.map((slug) => {
    const nome = CONDIZIONI.find((c) => c.slug === slug)?.nome ?? slug
    return (
      <img key={slug} src={condizionePath(slug)} alt={nome} title={nome} className="votazione__icona-condizione" />
    )
  })
}

// mostra la faccia del ruolo (invece di un'icona di fazione generica): ha
// senso solo perché già protetto da mostraRuoli, quindi il narratore l'ha
// scelto di proposito per la sua partita
// senza ruoloSlug il giocatore è probabilmente uno dei ruoli a rivelazione
// diurna non ancora rivelati (RUOLI_RIVELAZIONE_GIORNO): mostra comunque il
// punto interrogativo invece di sparire, per segnalare "identità non nota
// ancora" e non "nessuna informazione qui"
function BadgeRuolo({ giocatore, variante }) {
  const slugVisibile = ruoloIconaGiocatore(giocatore)
  const ruolo = ROLES.find((r) => r.slug === slugVisibile)
  return (
    <RuoloIcona
      slug={slugVisibile}
      variante={variante}
      size={24}
      className="votazione__icona-ruolo"
      alt={ruolo?.nome ?? 'Ruolo non ancora rivelato'}
    />
  )
}

function nomeRuoloTraParentesi(ruoloSlug) {
  const ruolo = ROLES.find((r) => r.slug === ruoloPerDisplay(ruoloSlug))
  return ruolo ? ` (${ruolo.nome})` : ''
}

// elenco di tutti i morti della partita (non solo di questo giorno/notte),
// per tenerne traccia durante le votazioni successive
function SezioneMorti({ giocatori, mostraRuoli, variantiFaccia, mostraNomeRuolo }) {
  const morti = giocatori.filter((g) => !g.vivo)
  if (morti.length === 0) return null

  return (
    <div className="votazione__morti">
      <h3>Morti</h3>
      <ul>
        {morti.map((g) => (
          <li key={g.id}>
            {mostraRuoli && (
              <BadgeRuolo
                giocatore={g}
                variante={variantiFaccia ? variantePerGiocatore(giocatori, g.id) : undefined}
              />
            )}
            <span>
              {g.nome}
              {mostraRuoli && mostraNomeRuolo && nomeRuoloTraParentesi(g.ruoloSlug)}
            </span>
            {g.eFantasmaOnnisciente && (
              <RuoloIcona
                slug="fantasma-onnisciente"
                size={24}
                className="votazione__icona-condizione"
                alt="Fantasma Onnisciente"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Votazione({
  giocatori,
  voti,
  fase,
  candidatiEsito = [],
  mostraRuoli = false,
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  onRogo,
  onAnticoRivelazione,
  onRivelazione,
  onBoiaGiustizia,
  onAlchimistaEsplode,
  onScemoSbaglia,
  onMorteUnzione,
  onBardoSaltaNotte,
  onElezioneBorgomastro,
  onFantasmaOnnisciente,
  onSuoceraRivelazione,
  onAnnullaMorte,
  ruoliSelezionati = [],
  quantita = {},
  onProsegui,
  onConcludiPartita = () => {},
  round,
  variantiFaccia = true,
  mostraNomeRuolo = false,
  durataTimer = 60,
}) {
  const vivi = giocatori.filter((g) => g.vivo)
  // Spilungone e L'Antico non muoiono mai al primo rogo: si rivelano e
  // basta (pag. 16, 21). Tracciati a parte perché non passano mai da onRogo.
  // ponytail: questo stato locale non si resetta tra un giorno e l'altro
  // (a differenza di voti/fase, che vivono nell'hook useVotazione): se lo
  // stesso personaggio venisse designato una seconda volta in una notte
  // successiva, l'esito resterebbe comunque corretto (nessuna vittima, o
  // per L'Antico normale morte da Villico) ma salterebbe il passo di
  // conferma. Da rivedere se capita davvero in una partita reale.
  const [spilungoneRivelatoId, setSpilungoneRivelatoId] = useState(null)
  const [anticoRivelatoStato, setAnticoRivelatoId] = useState(null)
  // l'Alchimista ha bisogno di un secondo click (chi trascina con sé
  // nell'esplosione, pag. 5): attesaVittimaId mentre si sceglie, poi
  // l'esito finale una volta scelta la vittima
  const [alchimistaInAttesaVittimaId, setAlchimistaInAttesaVittimaId] = useState(null)
  const [alchimistaEsploso, setAlchimistaEsploso] = useState(null)
  // spareggio: la chip resta selezionabile/cambiabile finché non si preme
  // "Dichiara morte sul rogo", invece di decidere già al click della chip
  const [designatoSpareggio, setDesignatoSpareggio] = useState(null)
  const [confermaRicomincia, setConfermaRicomincia] = useState(false)

  // la scelta dello spareggio vale solo per il voto che l'ha generata: se si
  // torna al voto (o si ricomincia) e i voti cambiano, non deve restare
  // selezionato un vecchio candidato
  function tornaAlVotoPulito() {
    setDesignatoSpareggio(null)
    tornaAlVoto()
  }

  const vittoria = condizioniVittoria(giocatori, quantita)
  // partita già finita (es. Boia/Scemo hanno ucciso l'ultimo lupo durante il
  // voto) o nessun vivo rimasto: il narratore deve poter concludere subito,
  // senza dover prima completare un rogo che non serve più
  const bannerVittoria =
    vittoria.length > 0 ? (
      <>
        <ul className="alba-panel__vittoria">
          {vittoria.map((testo) => (
            <li key={testo}>🏆 {testo}</li>
          ))}
        </ul>
        <button type="button" onClick={onConcludiPartita}>
          Concludi partita
        </button>
      </>
    ) : vivi.length === 0 ? (
      <>
        <p>Non è rimasto nessuno in vita.</p>
        <button type="button" onClick={onConcludiPartita}>
          Concludi partita
        </button>
      </>
    ) : null

  if (fase === 'esito') {
    // l'esito si calcola sui candidati congelati al momento di "Vai all'esito",
    // non sui giocatori vivi correnti: altrimenti il rogo di un candidato
    // cambia il pool e può svuotare la lista dei designati (vedi bug: rogo
    // che porta a uno spareggio senza nessuno indicato)
    const { vincitori: designati } = risultatoVotazione(voti, candidatiEsito)
    // L'Antico sopravvissuto si deduce anche dallo stato già scritto sul
    // giocatore (villaggioMaledettoFinoA di questo giorno), così dopo un
    // reload l'esito risulta ancora confermato
    const anticoRivelatoId =
      anticoRivelatoStato ??
      designati.find((id) => round !== undefined && giocatori.find((g) => g.id === id)?.villaggioMaledettoFinoA === round) ??
      null
    // il Cavaliere legato al designato si è immolato al suo posto (vedi
    // risolviLegami): il designato è tornato vivo e il Cavaliere risulta
    // morto per 'sacrificio' in questo giorno
    const cavaliereImmolato =
      round === undefined
        ? undefined
        : giocatori.find((g) => !g.vivo && g.causaMorte === 'sacrificio' && g.mortoNotte === round)
    const protettoImmolatoId = cavaliereImmolato
      ? designati.find((id) => giocatori.find((g) => g.id === id)?.vivo)
      : undefined
    const designatoSpareggioValido = designati.includes(designatoSpareggio) ? designatoSpareggio : null
    const morteConfermata =
      designati.some((id) => giocatori.find((g) => g.id === id)?.vivo === false) ||
      spilungoneRivelatoId !== null ||
      anticoRivelatoId !== null ||
      alchimistaEsploso !== null ||
      protettoImmolatoId !== undefined

    // Spilungone, L'Antico e Alchimista sono ruoli a rivelazione diurna
    // (pag. 5, 13): la loro identità non è quasi mai già nota all'app
    // quando arrivano al rogo (si rivelano proprio in quel momento, non
    // prima). Se il mazzo li prevede e nessuno li ha ancora assunti, il
    // narratore deve poterli rivelare qui invece di doverli assegnare in
    // anticipo da "Eventi speciali" (altrimenti morirebbero come un
    // designato qualsiasi).
    function rivelabileOra(slug) {
      return ruoliSelezionati?.includes(slug) && ruoliAssegnabili([slug], giocatori, quantita).length > 0
    }

    // un solo click: la scelta del bersaglio (candidato singolo o chip dello
    // spareggio) è già di per sé una decisione inequivocabile, una conferma
    // successiva sarebbe un secondo click ridondante
    function confermaMorte(id) {
      const target = giocatori.find((g) => g.id === id)
      if (target?.ruoloSlug === 'spilungone') {
        setSpilungoneRivelatoId(id)
      } else if (target?.ruoloSlug === 'lantico' && target.anticoSbranatoNotte === undefined) {
        // già sbranato di notte (anticoSbranatoNotte definito) ha perso la sua
        // prima vita: al rogo muore come chiunque altro, senza maledizione
        onAnticoRivelazione(id)
        setAnticoRivelatoId(id)
      } else if (target?.ruoloSlug === 'alchimista') {
        setAlchimistaInAttesaVittimaId(id)
      } else {
        onRogo(id)
      }
    }

    // come sopra, ma per un ruolo non ancora assegnato in app: lo rivela
    // (registrandolo come qualunque altra rivelazione diurna) e applica
    // subito lo stesso esito speciale
    function rivelaEDesigna(id, ruoloSlug) {
      if (ruoloSlug === 'alchimista') {
        setAlchimistaInAttesaVittimaId(id)
        return
      }
      if (ruoloSlug === 'spilungone') {
        onRivelazione(ruoloSlug, id)
        setSpilungoneRivelatoId(id)
      } else {
        // non onRivelazione + onAnticoRivelazione: due aggiornaGiocatore in
        // sequenza sulla stessa persona si perderebbero a vicenda lo
        // storiaRuoli (vedi commento in dichiaraAnticoRivelazione), quindi
        // qui è quest'ultimo da solo a registrare anche il 'lantico' mai
        // assegnato prima
        onAnticoRivelazione(id)
        setAnticoRivelatoId(id)
      }
    }

    // secondo passo dell'Alchimista: chi trascina con sé nell'esplosione.
    // onAlchimistaEsplode registra da solo sia la rivelazione/morte
    // dell'Alchimista sia quella della vittima (vedi GiornoPanel).
    function confermaVittimaAlchimista(alchimistaId, vittimaId) {
      onAlchimistaEsplode(alchimistaId, vittimaId)
      setAlchimistaEsploso({ alchimistaId, vittimaId })
      setAlchimistaInAttesaVittimaId(null)
    }

    function renderEsitoDesignato(id) {
      if (protettoImmolatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            Il Cavaliere {cavaliereImmolato.nome} rivela la propria carta e si è immolato al posto di {nome}:{' '}
            {nome} sopravvive al rogo.
          </p>
        )
      }
      if (spilungoneRivelatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è lo Spilungone, troppo alto per il rogo. La notte cala senza
            vittime.
          </p>
        )
      }
      if (anticoRivelatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è L'Antico, ma sopravvive grazie alla sua prima vita e da ora
            gioca da Villico. Il villaggio è maledetto: la notte successiva nessun potere si sveglierà.
          </p>
        )
      }
      if (alchimistaEsploso?.alchimistaId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        const nomeVittima = giocatori.find((g) => g.id === alchimistaEsploso.vittimaId)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è l'Alchimista e trascina con sé {nomeVittima} nell'aldilà con
            una grande esplosione pirotecnica.
          </p>
        )
      }
      if (alchimistaInAttesaVittimaId === id) {
        const bersagli = vivi.filter((g) => g.id !== id)
        return (
          <div className="votazione__designato-azioni">
            <SceltaGiocatore
              candidati={bersagli}
              etichetta="Chi trascina con sé l'Alchimista"
              onConferma={(vittimaId) => confermaVittimaAlchimista(id, vittimaId)}
              mostraSalta={false}
              richiedeConferma
              dettaglioSelezione={(vittimaId) => <PromemoriaMorte giocatori={giocatori} id={vittimaId} />}
            />
          </div>
        )
      }
      if (!morteConfermata) {
        const target = giocatori.find((g) => g.id === id)
        const puoEssereSpilungone = rivelabileOra('spilungone') && !target?.ruoloSlug
        const puoEssereLantico = rivelabileOra('lantico') && !target?.ruoloSlug
        const puoEssereAlchimista = rivelabileOra('alchimista') && !target?.ruoloSlug
        return (
          <div className="votazione__designato-azioni">
            <PromemoriaMorte giocatori={giocatori} id={id} />
            <button type="button" onClick={() => confermaMorte(id)}>
              Dichiara morte sul rogo
            </button>
            {puoEssereSpilungone && (
              <button type="button" onClick={() => rivelaEDesigna(id, 'spilungone')}>
                Si rivela: è lo Spilungone
              </button>
            )}
            {puoEssereLantico && (
              <button type="button" onClick={() => rivelaEDesigna(id, 'lantico')}>
                Si rivela: è L'Antico
              </button>
            )}
            {puoEssereAlchimista && (
              <button type="button" onClick={() => rivelaEDesigna(id, 'alchimista')}>
                Si rivela: è l'Alchimista
              </button>
            )}
          </div>
        )
      }
      // morte confermata: resta il promemoria del crepacuore del partner
      return <PromemoriaMorte giocatori={giocatori} id={id} />
    }

    // chi tra i candidati allo spareggio è stato effettivamente designato:
    // serve per il messaggio "Vittima designata" una volta risolto, uguale
    // a quello (già esistente) mostrato quando non c'è spareggio
    const vittimaSpareggioId =
      designatoSpareggioValido ??
      spilungoneRivelatoId ??
      anticoRivelatoId ??
      alchimistaEsploso?.alchimistaId ??
      protettoImmolatoId ??
      null

    return (
      <section className="votazione votazione--esito">
        {designati.length === 1 ? (
          <div className="votazione__esito">
            <p>
              Vittima designata:{' '}
              <span className="votazione__nome-designato">{giocatori.find((g) => g.id === designati[0])?.nome}</span>
            </p>
            {renderEsitoDesignato(designati[0])}
          </div>
        ) : (
          <div className="votazione__spareggio">
            {morteConfermata ? (
              <>
                <p>
                  Vittima designata:{' '}
                  <span className="votazione__nome-designato">
                    {giocatori.find((g) => g.id === vittimaSpareggioId)?.nome}
                  </span>
                </p>
                {giocatori.find((g) => g.id === vittimaSpareggioId)?.vivo === false && (
                  <PromemoriaMorte giocatori={giocatori} id={vittimaSpareggioId} />
                )}
              </>
            ) : (
              <>
                <p>Spareggio tra: {designati.map((id) => giocatori.find((g) => g.id === id)?.nome).join(', ')}</p>
                <div className="votazione__timer-box">
                  <TimerSpareggio durataSecondi={durataTimer} />
                </div>
              </>
            )}
            {spilungoneRivelatoId !== null ? (
              renderEsitoDesignato(spilungoneRivelatoId)
            ) : anticoRivelatoId !== null ? (
              renderEsitoDesignato(anticoRivelatoId)
            ) : protettoImmolatoId !== undefined ? (
              renderEsitoDesignato(protettoImmolatoId)
            ) : !morteConfermata ? (
              <div className="votazione__scelta-box">
                <div className="scelta-giocatore__chips" role="group" aria-label="Chi muore nello spareggio">
                  {designati.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="chip"
                      aria-pressed={designatoSpareggioValido === id}
                      onClick={() => setDesignatoSpareggio(id)}
                    >
                      {giocatori.find((g) => g.id === id)?.nome}
                    </button>
                  ))}
                </div>
                {/* via d'uscita se il tavolo non decide: il narratore sorteggia
                    tra i candidati (resta comunque cambiabile prima di confermare) */}
                <button
                  type="button"
                  onClick={() => setDesignatoSpareggio(designati[Math.floor(Math.random() * designati.length)])}
                >
                  Sorteggia tra i candidati
                </button>
                {designatoSpareggioValido && renderEsitoDesignato(designatoSpareggioValido)}
              </div>
            ) : null}
          </div>
        )}
        {/* una volta confermata la morte, il voto del giorno è chiuso: niente
            "Torna al voto" per evitare una seconda esecuzione lo stesso giorno */}
        {!morteConfermata && (
          <button type="button" onClick={tornaAlVotoPulito}>
            Torna al voto
          </button>
        )}
        {bannerVittoria}
        {morteConfermata && (
          <button type="button" onClick={onProsegui}>
            È notte nel villaggio
          </button>
        )}
        <EventiSpeciali
          giocatori={giocatori}
          ruoliSelezionati={ruoliSelezionati}
          quantita={quantita}
          contesto="esito"
          round={round === undefined ? undefined : round - 1}
          candidatiRogo={designati}
          onScemoSbaglia={onScemoSbaglia}
          onMorteUnzione={onMorteUnzione}
          onRivelazione={onRivelazione}
          onBoiaGiustizia={onBoiaGiustizia}
          onAlchimistaEsplode={onAlchimistaEsplode}
          onBardoSaltaNotte={onBardoSaltaNotte}
          onElezioneBorgomastro={onElezioneBorgomastro}
          onFantasmaOnnisciente={onFantasmaOnnisciente}
          onSuoceraRivelazione={onSuoceraRivelazione}
          onAnnullaMorte={onAnnullaMorte}
        />
        <SezioneMorti
          giocatori={giocatori}
          mostraRuoli={mostraRuoli}
          variantiFaccia={variantiFaccia}
          mostraNomeRuolo={mostraNomeRuolo}
        />
      </section>
    )
  }

  const { maxVoti } = risultatoVotazione(voti, vivi.map((g) => g.id))

  return (
    <section className="votazione">
      <ul>
        {vivi.map((g) => (
          <li key={g.id}>
            {mostraRuoli && (
              <BadgeRuolo
                giocatore={g}
                variante={variantiFaccia ? variantePerGiocatore(giocatori, g.id) : undefined}
              />
            )}
            <span className="votazione__nome">
              {g.nome}
              {mostraRuoli && mostraNomeRuolo && nomeRuoloTraParentesi(g.ruoloSlug)}
            </span>
            <BadgeCondizioni condizioni={g.condizioni} />
            {g.eBorgomastro && (
              <RuoloIcona
                slug="borgomastro"
                size={24}
                className="votazione__icona-condizione"
                alt="Borgomastro: il suo voto vale doppio"
              />
            )}
            <span className="votazione__voti">{voti[g.id] ?? 0} voti</span>
            <button type="button" onClick={() => decrementaVoto(g.id)}>
              -1
            </button>
            <button type="button" onClick={() => incrementaVoto(g.id)}>
              +1
            </button>
          </li>
        ))}
      </ul>
      {confermaRicomincia ? (
        <p className="votazione__conferma">
          Azzerare tutti i voti?{' '}
          <button
            type="button"
            onClick={() => {
              setDesignatoSpareggio(null)
              setConfermaRicomincia(false)
              ricominciaVotazione()
            }}
          >
            Sì, ricomincia
          </button>{' '}
          <button type="button" onClick={() => setConfermaRicomincia(false)}>
            Annulla
          </button>
        </p>
      ) : (
        <button type="button" onClick={() => setConfermaRicomincia(true)}>
          Ricomincia votazione
        </button>
      )}
      {bannerVittoria}
      {maxVoti > 0 && (
        <button type="button" onClick={() => vaiAEsito(vivi.map((g) => g.id))}>
          Vai all'esito
        </button>
      )}
      <EventiSpeciali
        giocatori={giocatori}
        ruoliSelezionati={ruoliSelezionati}
        quantita={quantita}
        contesto="voto"
        round={round === undefined ? undefined : round - 1}
        onScemoSbaglia={onScemoSbaglia}
        onMorteUnzione={onMorteUnzione}
        onRivelazione={onRivelazione}
        onBoiaGiustizia={onBoiaGiustizia}
        onAlchimistaEsplode={onAlchimistaEsplode}
        onBardoSaltaNotte={onBardoSaltaNotte}
        onElezioneBorgomastro={onElezioneBorgomastro}
        onFantasmaOnnisciente={onFantasmaOnnisciente}
        onSuoceraRivelazione={onSuoceraRivelazione}
        onAnnullaMorte={onAnnullaMorte}
      />
      <SezioneMorti
        giocatori={giocatori}
        mostraRuoli={mostraRuoli}
        variantiFaccia={variantiFaccia}
        mostraNomeRuolo={mostraNomeRuolo}
      />
    </section>
  )
}

import { useState } from 'react'
import { risultatoVotazione } from '../../data/votazione'
import { CONDIZIONI } from '../../data/conditions'
import { ROLES, ruoloPerDisplay, ruoloIconaGiocatore } from '../../data/roles'
import { ruoliAssegnabili, ignotiSonoVillici } from '../../data/assegnazione'
import { TimerSpareggio } from './TimerSpareggio'
import { EventiSpeciali } from './EventiSpeciali'
import { PromemoriaMorte, RigheConseguenze } from './PromemoriaMorte'
import { conseguenzeMorte, cavalieriDi, primaVitaAntico } from '../../data/eventiSpeciali'
import { SceltaGiocatore } from '../../components/SceltaGiocatore'
import { RuoloIcona } from '../../components/RuoloIcona'
import { condizionePath, variantePerGiocatore } from '../../data/assetRuoli'

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
// ignotiVillici: tutte le altre carte sono già uscite, il "?" può essere solo Villico
function BadgeRuolo({ giocatore, variante, ignotiVillici }) {
  const slugVisibile = ruoloIconaGiocatore(giocatore) ?? (ignotiVillici ? 'villico' : undefined)
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

function nomeRuoloTraParentesi(giocatore) {
  const ruolo = ROLES.find((r) => r.slug === ruoloPerDisplay(giocatore.ruoloSlug))
  // l'ex-Antico (ora Villico) conserva il segno della prima vita persa
  const exAntico = giocatore.ruoloSlug === 'villico' && (giocatore.storiaRuoli ?? []).includes('lantico')
  return ruolo ? ` (${ruolo.nome}${exAntico ? ', ex Antico' : ''})` : ''
}

// elenco di tutti i morti della partita (non solo di questo giorno/notte),
// per tenerne traccia durante le votazioni successive
function SezioneMorti({ giocatori, mostraRuoli, variantiFaccia, mostraNomeRuolo, ignotiVillici }) {
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
                ignotiVillici={ignotiVillici}
                giocatore={g}
                variante={variantiFaccia ? variantePerGiocatore(giocatori, g.id) : undefined}
              />
            )}
            <span>
              {g.nome}
              {mostraRuoli && mostraNomeRuolo && nomeRuoloTraParentesi(g)}
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
  round,
  variantiFaccia = true,
  mostraNomeRuolo = false,
  durataTimer = 60,
}) {
  const vivi = giocatori.filter((g) => g.vivo)
  const ignotiVillici = ignotiSonoVillici(giocatori, quantita)
  // Spilungone e L'Antico non muoiono mai al primo rogo: si rivelano e
  // basta (pag. 16, 21). Tracciati a parte perché non passano mai da onRogo.
  // ponytail: questo stato locale non si resetta tra un giorno e l'altro
  // (a differenza di voti/fase, che vivono nell'hook useVotazione): se lo
  // stesso personaggio venisse designato una seconda volta in una notte
  // successiva, l'esito resterebbe comunque corretto (nessuna vittima, o
  // per L'Antico normale morte da Villico) ma salterebbe il passo di
  // conferma. Da rivedere se capita davvero in una partita reale.
  const [spilungoneRivelatoStato, setSpilungoneRivelatoId] = useState(null)
  const [anticoRivelatoStato, setAnticoRivelatoId] = useState(null)
  // l'Alchimista ha bisogno di un secondo click (chi trascina con sé
  // nell'esplosione, pag. 5): attesaVittimaId mentre si sceglie, poi
  // l'esito finale una volta scelta la vittima
  const [alchimistaInAttesaVittimaId, setAlchimistaInAttesaVittimaId] = useState(null)
  const [alchimistaEsplosoStato, setAlchimistaEsploso] = useState(null)
  // spareggio: la chip resta selezionabile/cambiabile finché non si preme
  // "Dichiara morte sul rogo", invece di decidere già al click della chip
  const [designatoSpareggio, setDesignatoSpareggio] = useState(null)
  const [confermaRicomincia, setConfermaRicomincia] = useState(false)
  // "Si rivela: è lo Spilungone/L'Antico" non si applica al primo click: prima
  // una conferma esplicita (come per le scelte degli Eventi speciali)
  const [rivelazioneInConferma, setRivelazioneInConferma] = useState(null)
  // riepilogo (al passato) delle conseguenze della morte appena dichiarata,
  // calcolato prima di applicarla: dopo la conferma l'anteprima sparirebbe
  const [riepilogoMorte, setRiepilogoMorte] = useState({})

  // la scelta dello spareggio vale solo per il voto che l'ha generata: se si
  // torna al voto (o si ricomincia) e i voti cambiano, non deve restare
  // selezionato un vecchio candidato
  function tornaAlVotoPulito() {
    setDesignatoSpareggio(null)
    tornaAlVoto()
  }

  // la vittoria si verifica solo all'alba (AlbaPanel): durante il giorno si
  // prosegue fino alla notte. Unica eccezione per non bloccare il narratore:
  // nessuno in vita, quindi nessun voto possibile.
  const nessunoInVita = vivi.length === 0

  if (fase === 'esito') {
    // l'esito si calcola sui candidati congelati al momento di "Vai all'esito",
    // non sui giocatori vivi correnti: altrimenti il rogo di un candidato
    // cambia il pool e può svuotare la lista dei designati (vedi bug: rogo
    // che porta a uno spareggio senza nessuno indicato)
    const { vincitori: designati } = risultatoVotazione(voti, candidatiEsito)
    // L'Antico sopravvissuto si deduce anche dallo stato già scritto sul
    // giocatore (villaggioMaledettoFinoA di questo giorno), così dopo un
    // reload l'esito risulta ancora confermato
    // (come lo Spilungone: marcatore spilungoneRivelatoRound di questo giorno)
    const spilungoneRivelatoId =
      spilungoneRivelatoStato ??
      designati.find((id) => round !== undefined && giocatori.find((g) => g.id === id)?.spilungoneRivelatoRound === round) ??
      null
    const anticoRivelatoId =
      anticoRivelatoStato ??
      designati.find((id) => round !== undefined && giocatori.find((g) => g.id === id)?.villaggioMaledettoFinoA === round) ??
      null
    // il Cavaliere legato al designato si è immolato al suo posto (vedi
    // risolviLegami): il designato è tornato vivo e il Cavaliere porta il
    // marcatore sacrificioRogoRound di questo giorno (mortoNotte resta vuoto)
    const cavaliereImmolato =
      round === undefined
        ? undefined
        : giocatori.find((g) => !g.vivo && g.causaMorte === 'sacrificio' && (g.sacrificioDa ?? 'rogo') === 'rogo' && g.sacrificioRogoRound === round)
    const protettoImmolatoId = cavaliereImmolato
      ? designati.find((id) => giocatori.find((g) => g.id === id)?.vivo)
      : undefined
    // dopo un reload: l'Alchimista bruciato oggi e chi ha trascinato con sé
    // (morto sul colpo per l'esplosione, mortoDa 'alchimista') si deducono dallo stato
    const alchimistaBruciatoId = designati.find((id) => {
      const g = giocatori.find((x) => x.id === id)
      return round !== undefined && g && !g.vivo && g.ruoloSlug === 'alchimista' && g.causaMorte === 'rogo' && g.mortoNotte === round
    })
    const vittimaEsplosione = giocatori.find((g) => !g.vivo && g.causaMorte === 'colpo' && g.mortoDa === 'alchimista' && g.mortoGiorno === round)
    const alchimistaEsploso =
      alchimistaEsplosoStato ??
      (alchimistaBruciatoId && vittimaEsplosione ? { alchimistaId: alchimistaBruciatoId, vittimaId: vittimaEsplosione.id, salvo: false } : null)
    // il condannato di oggi (rogo di questo giorno) per "Vittima designata" dopo un reload nello spareggio
    const condannatoDedottoId = designati.find((id) => {
      const g = giocatori.find((x) => x.id === id)
      return round !== undefined && g && !g.vivo && g.causaMorte === 'rogo' && g.mortoNotte === round
    })
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
    const potereAlchimista = (g) => !(g.poteriUsati ?? []).includes('alchimista-esplosione')
    function rivelabileOra(slug) {
      return ruoliSelezionati?.includes(slug) && ruoliAssegnabili([slug], giocatori, quantita).length > 0
    }

    // un solo click: la scelta del bersaglio (candidato singolo o chip dello
    // spareggio) è già di per sé una decisione inequivocabile, una conferma
    // successiva sarebbe un secondo click ridondante
    function confermaMorte(id) {
      const target = giocatori.find((g) => g.id === id)
      if (target?.ruoloSlug === 'spilungone' && target.spilungoneRivelatoRound === undefined) {
        // solo il primo rogo: il marcatore (onRivelazione) ricostruisce l'esito dopo un reload
        onRivelazione('spilungone', id)
        setSpilungoneRivelatoId(id)
      } else if (target?.ruoloSlug === 'lantico' && target.anticoSbranatoNotte === undefined) {
        // già sbranato di notte (anticoSbranatoNotte definito) ha perso la sua
        // prima vita: al rogo muore come chiunque altro, senza maledizione
        onAnticoRivelazione(id)
        setAnticoRivelatoId(id)
      } else if (target?.ruoloSlug === 'alchimista' && potereAlchimista(target) && cavalieriDi(giocatori, id).length === 0) {
        // con un Cavaliere che lo salva non muore al rogo, quindi non esplode;
        // con il potere già speso (non ricaricato) muore come chiunque altro
        setAlchimistaInAttesaVittimaId(id)
      } else {
        setRiepilogoMorte((r) => ({ ...r, [id]: conseguenzeMorte(giocatori, id, true) }))
        onRogo(id)
      }
    }

    // morte confermata: riepilogo salvato al click (o, dopo un reload, solo il
    // crepacuore dei partner che si deduce dallo stato)
    // le righe congelate al click possono essere superate (es. l'Antico rivelato
    // dopo la morte riporta in vita il partner): si scartano quelle sul crepacuore
    // di chi ora è vivo. `con`: altre morti da riepilogare dallo stato (Alchimista)
    function riepilogoDi(id, con = []) {
      const vivoOra = (nome) => giocatori.some((g) => g.vivo && g.nome === nome)
      const righe = (
        riepilogoMorte[id]?.length
          ? riepilogoMorte[id]
          : [...new Set([id, ...con].flatMap((x) => conseguenzeMorte(giocatori, x)))]
      ).filter((r) => !vivoOra(r.match(/^È morto anche (.+) \(crepacuore\)\.$/)?.[1]))
      return <RigheConseguenze righe={righe} />
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
      // riepilogo salvato prima: dopo il Conferma l'anteprima sparirebbe
      // (anche le conseguenze della morte dell'Alchimista stesso)
      setRiepilogoMorte((r) => ({
        ...r,
        [vittimaId]: [...new Set([...conseguenzeMorte(giocatori, alchimistaId, true), ...conseguenzeMorte(giocatori, vittimaId, true)])],
      }))
      onAlchimistaEsplode(alchimistaId, vittimaId)
      // la vittima non muore se un Cavaliere si immola o è l'Antico alla prima vita
      const vittima = giocatori.find((g) => g.id === vittimaId)
      const salvo = cavalieriDi(giocatori, vittimaId).length > 0 || primaVitaAntico(vittima)
      setAlchimistaEsploso({ alchimistaId, vittimaId, salvo })
      setAlchimistaInAttesaVittimaId(null)
    }

    function renderEsitoDesignato(id) {
      if (protettoImmolatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <>
            <p>
              Il Cavaliere {cavaliereImmolato.nome} si sacrifica al posto di {nome}: {nome} sopravvive al rogo.
            </p>
            {/* conseguenze della morte del Cavaliere (crepacuore, eredità...), non la riga già detta sopra */}
            <RigheConseguenze
              righe={(riepilogoMorte[id] ?? []).filter((r) => !r.startsWith(`Il Cavaliere ${cavaliereImmolato.nome} si è immolato`))}
            />
          </>
        )
      }
      if (spilungoneRivelatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è lo Spilungone, troppo alto per qualsiasi patibolo. La notte cala senza vittime.
          </p>
        )
      }
      if (anticoRivelatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è L'Antico, ma sopravvive perdendo la sua prima vita. Il villaggio è maledetto: la notte successiva il villaggio non userà i suoi poteri.
          </p>
        )
      }
      if (alchimistaEsploso?.alchimistaId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        const vittima = giocatori.find((g) => g.id === alchimistaEsploso.vittimaId)
        // la vittima può essere tornata in vita dopo: era l'Antico, rivelato poi
        const salvo = alchimistaEsploso.salvo || (vittima?.vivo && (vittima.storiaRuoli ?? []).includes('lantico'))
        return (
          <>
            <p>
              {nome} rivela la propria carta: è l'Alchimista{' '}
              {salvo
                ? `ed esplode, ma ${vittima.nome} sopravvive.`
                : `e trascina con sé ${vittima?.nome} nell'aldilà con una grande esplosione pirotecnica.`}
            </p>
            {riepilogoDi(alchimistaEsploso.vittimaId, [id])}
          </>
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
        const protettori = cavalieriDi(giocatori, id)
        // anche un Alchimista già noto (Mimo, resuscitato) con il potere (ri)caricato
        const alchimistaPossibile =
          (rivelabileOra('alchimista') && !target?.ruoloSlug) || (target?.ruoloSlug === 'alchimista' && potereAlchimista(target))
        // con un Cavaliere che lo salva l'Alchimista non muore al rogo: niente esplosione
        const puoEssereAlchimista = alchimistaPossibile && protettori.length === 0
        if (rivelazioneInConferma?.id === id) {
          const nomeRuolo = rivelazioneInConferma.slug === 'spilungone' ? 'lo Spilungone' : "L'Antico"
          return (
            <div className="votazione__designato-azioni">
              <p>
                Confermi: {target?.nome} è {nomeRuolo}?
              </p>
              <button
                type="button"
                onClick={() => {
                  setRivelazioneInConferma(null)
                  rivelaEDesigna(id, rivelazioneInConferma.slug)
                }}
              >
                Conferma
              </button>
              <button type="button" onClick={() => setRivelazioneInConferma(null)}>
                Annulla
              </button>
            </div>
          )
        }
        return (
          <div className="votazione__designato-azioni">
            <PromemoriaMorte giocatori={giocatori} id={id} />
            <button type="button" onClick={() => confermaMorte(id)}>
              Dichiara morte sul rogo
            </button>
            {puoEssereSpilungone && (
              <button type="button" onClick={() => setRivelazioneInConferma({ id, slug: 'spilungone' })}>
                Si rivela: è lo Spilungone
              </button>
            )}
            {puoEssereLantico && (
              <button type="button" onClick={() => setRivelazioneInConferma({ id, slug: 'lantico' })}>
                Si rivela: è L'Antico
              </button>
            )}
            {puoEssereAlchimista && (
              <button type="button" onClick={() => rivelaEDesigna(id, 'alchimista')}>
                Si rivela: è l'Alchimista
              </button>
            )}
            {alchimistaPossibile && protettori.length > 0 && (
              <p className="avviso">
                Il Cavaliere {protettori.map((c) => c.nome).join(', ')} protegge {target?.nome}: se fosse l'Alchimista non esploderebbe, perché si immolerebbe il Cavaliere al suo posto.
              </p>
            )}
          </div>
        )
      }
      return riepilogoDi(id)
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
      condannatoDedottoId ??
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
                {giocatori.find((g) => g.id === vittimaSpareggioId)?.vivo === false && riepilogoDi(vittimaSpareggioId)}
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
                      onClick={() => {
                        setDesignatoSpareggio(id)
                      }}
                    >
                      {giocatori.find((g) => g.id === id)?.nome}
                    </button>
                  ))}
                </div>
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
        {morteConfermata &&
          ruoliSelezionati?.includes('fantasma-onnisciente') &&
          !giocatori.some((g) => g.eFantasmaOnnisciente) && (
            <p className="avviso">
              ⚠️ Assegna la carta del Fantasma Onnisciente al primo morto (menu "Eventi speciali").
            </p>
          )}
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
          ignotiVillici={ignotiVillici}
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
                ignotiVillici={ignotiVillici}
                giocatore={g}
                variante={variantiFaccia ? variantePerGiocatore(giocatori, g.id) : undefined}
              />
            )}
            <span className="votazione__nome">
              {g.nome}
              {mostraRuoli && mostraNomeRuolo && nomeRuoloTraParentesi(g)}
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
            <span className="votazione__voti">{voti[g.id] ?? 0} {(voti[g.id] ?? 0) === 1 ? 'voto' : 'voti'}</span>
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
      {nessunoInVita && (
        <>
          <p>Non è rimasto nessuno in vita: nessun voto possibile.</p>
          <button type="button" onClick={onProsegui}>
            È notte nel villaggio
          </button>
        </>
      )}
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

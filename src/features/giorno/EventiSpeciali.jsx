import { useState } from 'react'
import { SceltaGiocatore } from '../../components/SceltaGiocatore'
import { RuoloIcona } from '../../components/RuoloIcona'
import { PromemoriaMorte } from './PromemoriaMorte'
import { useDialogA11y } from '../../components/useDialogA11y'
import { ruoliAssegnabili, eMimoCopiante } from '../../data/assegnazione'
import {
  candidatiRivelazione,
  rivelazioneContestualeDisponibile,
  bardoDisponibile,
  galloDisponibile,
  borgomastroDisponibile,
} from '../../data/eventiSpeciali'

// Forma più comune: si sceglie un solo giocatore, si dichiara l'esito, si
// chiude. Usata da Scemo del Villaggio, Morte per unzione, Elezione
// Borgomastro, Fantasma Onnisciente.
function EventoUnGiocatore({ candidati, etichetta, messaggio, onConferma, onAnnulla, richiedeConferma = true, dettaglio }) {
  return (
    <>
      {messaggio && <p>{messaggio}</p>}
      <SceltaGiocatore
        candidati={candidati}
        onConferma={onConferma}
        onSalta={onAnnulla}
        etichetta={etichetta}
        etichettaSalta="Annulla"
        richiedeConferma={richiedeConferma}
        dettaglioSelezione={dettaglio}
      />
    </>
  )
}

// Forma a due passi: prima "chi è" (l'identità non è mai nota in anticipo,
// quindi si sceglie solo tra chi non ha ancora un ruolo assegnato), poi
// "chi subisce l'azione" (un giocatore qualunque). Usata da Boia e Alchimista.
function EventoDueGiocatori({
  candidatiAttore,
  candidatiBersaglio,
  etichettaAttore,
  etichettaBersaglio,
  escludiAttoreDaBersagli = false,
  onConferma,
  onAnnulla,
  richiedeConferma = true,
  dettaglio,
}) {
  const [attoreId, setAttoreId] = useState(null)

  if (!attoreId) {
    return (
      <>
        <SceltaGiocatore
          candidati={candidatiAttore}
          onConferma={setAttoreId}
          onSalta={onAnnulla}
          etichetta={etichettaAttore}
          etichettaSalta="Annulla"
          richiedeConferma={richiedeConferma}
        />
      </>
    )
  }

  const bersagli = escludiAttoreDaBersagli ? candidatiBersaglio.filter((g) => g.id !== attoreId) : candidatiBersaglio
  return (
    <SceltaGiocatore
      candidati={bersagli}
      onConferma={(id) => onConferma(attoreId, id)}
      onSalta={onAnnulla}
      etichetta={etichettaBersaglio}
      etichettaSalta="Annulla"
      richiedeConferma={richiedeConferma}
      dettaglioSelezione={dettaglio}
    />
  )
}

// Eventi che sono solo una dichiarazione, senza un giocatore da scegliere
// (Bardo, Gallo Mannaro).
function EventoConferma({ messaggio, onConferma, onAnnulla }) {
  return (
    <div className="eventi-speciali__conferma">
      <p>{messaggio}</p>
      <button type="button" onClick={onConferma}>
        Conferma
      </button>
      <button type="button" onClick={onAnnulla}>
        Annulla
      </button>
    </div>
  )
}

// Menu unico per gli eventi che il narratore dichiara "a mano", non
// derivabili automaticamente dallo stato: morte sul colpo (Boia, Untore,
// Scemo del Villaggio), rivelazione di un personaggio a scoperta diurna
// (assegna l'identità solo quando il giocatore si rivela davvero, non
// prima — vedi nightSteps.js), ed eventi specifici di alcuni ruoli.
// `contesto` filtra quali eventi ha senso proporre: 'alba' (elezione del
// Borgomastro, gesto del Gallo Mannaro), 'voto' o 'esito' (il resto della
// votazione). Il Bardo è ristretto a 'esito' perché agisce "dopo un rogo"
// (pag. 10): usarlo prima, durante il voto, lascerebbe il narratore senza
// modo di arrivare alla notte (nessun rogo confermato = nessun "Prosegui
// alla notte" disponibile).
export function EventiSpeciali({
  giocatori,
  ruoliSelezionati,
  quantita,
  contesto,
  round,
  candidatiRogo,
  onRivelazione,
  onBoiaGiustizia,
  onAlchimistaEsplode,
  onScemoSbaglia,
  onMorteUnzione,
  onBardoSaltaNotte,
  onGalloSaltaGiorno,
  onElezioneBorgomastro,
  onFantasmaOnnisciente,
  onSuoceraRivelazione,
  onAnnullaMorte,
}) {
  const [evento, setEvento] = useState(null)
  const vivi = giocatori.filter((g) => g.vivo)
  const nonAssegnati = giocatori.filter((g) => g.vivo && !g.ruoloSlug)
  const unti = giocatori.filter((g) => g.vivo && (g.condizioni ?? []).includes('unto'))
  const morti = giocatori.filter((g) => !g.vivo)
  const mortiSenzaRuoloNoto = morti.filter((g) => !g.ruoloSlug)
  // L'Antico si rivela solo alla morte e, se non è al rogo (lì si rivela dal
  // chip del designato in Votazione), perde solo la prima vita: torna in vita
  // da Villico (vedi dichiaraAnticoSbranato). `round` = notte appena conclusa
  // (all'alba, o di giorno la notte che precede). Candidati, qualunque causa
  // e a prescindere da chi l'ha uccisa: morti di quella notte (lupi, Strega,
  // Chupacabra, Cucciolo/Berserker, crepacuore) o morti sul colpo nel giorno in
  // corso (Boia, Scemo, unzione, esplosione: `mortoGiorno`), con ruolo ignoto
  // o già 'lantico' ma non ancora rivelato.
  const anticoAssegnabile = ruoliSelezionati.includes('lantico') && ruoliAssegnabili(['lantico'], giocatori, quantita).length > 0
  const candidatiAntico = morti.filter(
    (g) =>
      ((['notte', 'crepacuore'].includes(g.causaMorte) && g.mortoNotte === round) ||
        (g.causaMorte === 'colpo' && g.mortoGiorno === round + 1)) &&
      ((!g.ruoloSlug && anticoAssegnabile) || (g.ruoloSlug === 'lantico' && g.anticoSbranatoNotte === undefined)),
  )
  // Alchimista (come lo Spilungone, che si rivela solo dal chip del designato
  // in Votazione) esplode solo al rogo: attore = solo il condannato di oggi
  // Attori: i vivi senza ruolo (titolare) più il Mimo che ha copiato quel ruolo
  // e non l'ha ancora usato (potere indipendente, vedi candidatiRivelazione)
  const attori = (slug) => candidatiRivelazione(slug, ruoliSelezionati, giocatori, quantita)
  const candidatiAlchimista = attori('alchimista').filter((g) => !candidatiRogo || candidatiRogo.includes(g.id))

  const inGiorno = contesto === 'voto' || contesto === 'esito'
  // carta unica, mai distribuita all'inizio: va consegnata al primo morto
  // sul rogo (pag. 13), quindi solo finché nessuno la tiene già
  const mostraFantasma =
    inGiorno &&
    ruoliSelezionati.includes('fantasma-onnisciente') &&
    !giocatori.some((g) => g.eFantasmaOnnisciente) &&
    morti.length > 0
  // resta "?" per tutta la partita finché non muore (pag. 21), di notte o
  // al rogo: disponibile in ogni contesto (alba/voto/esito), non solo di giorno
  const mostraSuocera =
    ruoliSelezionati.includes('suocera') &&
    // il Mimo che copia la Suocera non conta: il titolare resta da rivelare
    !giocatori.some((g) => g.ruoloSlug === 'suocera' && !eMimoCopiante(g)) &&
    mortiSenzaRuoloNoto.length > 0

  const menuEventi = [
    candidatiAntico.length > 0 && { key: 'antico', etichetta: "L'Antico si rivela" },
    // il Boia e l'Innocente si rivelano anche all'alba, non solo di giorno
    rivelazioneContestualeDisponibile('boia', ruoliSelezionati, giocatori, quantita) && {
      key: 'boia',
      etichetta: 'Il Boia giustizia',
    },
    contesto === 'esito' &&
      rivelazioneContestualeDisponibile('alchimista', ruoliSelezionati, giocatori, quantita) && {
        key: 'alchimista',
        etichetta: "L'Alchimista esplode",
      },
    inGiorno &&
      rivelazioneContestualeDisponibile('scemo-del-villaggio', ruoliSelezionati, giocatori, quantita) && {
        key: 'scemo',
        etichetta: 'Lo Scemo del Villaggio sbaglia la rima',
      },
    rivelazioneContestualeDisponibile('innocente', ruoliSelezionati, giocatori, quantita) && {
      key: 'innocente',
      etichetta: "L'Innocente si rivela",
    },
    inGiorno && unti.length > 0 && { key: 'unzione', etichetta: 'Morte per unzione' },
    contesto === 'esito' && bardoDisponibile(giocatori) && { key: 'bardo', etichetta: 'Il Bardo salta la notte' },
    contesto === 'alba' && galloDisponibile(giocatori) && {
      key: 'gallo',
      etichetta: 'Il Gallo Mannaro salta il giorno',
    },
    borgomastroDisponibile(ruoliSelezionati, giocatori) && { key: 'borgomastro', etichetta: 'Elezione Borgomastro' },
    mostraFantasma && { key: 'fantasma', etichetta: 'Assegna il Fantasma Onnisciente' },
    mostraSuocera && { key: 'suocera', etichetta: 'La Suocera si rivela' },
    // corregge un tap sbagliato durante il momento più concitato della
    // partita (un'esecuzione): disponibile in ogni contesto, come la
    // Suocera, non solo di giorno — un decesso notturno può essere notato
    // solo all'alba
    morti.length > 0 && { key: 'annulla-morte', etichetta: 'Annulla morte giocatore' },
  ].filter(Boolean)

  function chiudi() {
    setEvento(null)
  }

  const { dialogRef, triggerRef } = useDialogA11y(Boolean(evento), chiudi)

  if (menuEventi.length === 0) return null

  return (
    <div className="eventi-speciali">
      <button type="button" ref={triggerRef} className="eventi-speciali__icona" onClick={() => setEvento('menu')}>
        🎭 Eventi speciali
      </button>
      {evento && (
        <div
          className="eventi-speciali__popup"
          role="dialog"
          aria-modal="true"
          aria-label="Eventi speciali"
          ref={dialogRef}
          tabIndex={-1}
        >
          <button type="button" className="eventi-speciali__chiudi" onClick={chiudi} aria-label="Chiudi">
            ✕
          </button>
          {evento === 'menu' && (
            <div className="eventi-speciali__lista">
              {menuEventi.map(({ key, etichetta }) => (
                <button key={key} type="button" onClick={() => setEvento(key)}>
                  {etichetta}
                </button>
              ))}
              <button type="button" onClick={chiudi}>
                Chiudi
              </button>
            </div>
          )}

          {evento === 'scemo' && (
            <EventoUnGiocatore
              candidati={attori('scemo-del-villaggio')}
              etichetta="Chi è lo Scemo del Villaggio"
              messaggio="La rima sbagliata rivela e uccide lo Scemo del Villaggio nello stesso istante."
              onConferma={(id) => {
                onScemoSbaglia(id)
                chiudi()
              }}
              dettaglio={(id) => <PromemoriaMorte giocatori={giocatori} id={id} />}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'innocente' && (
            <EventoUnGiocatore
              candidati={attori('innocente')}
              etichetta="Chi è l'Innocente"
              messaggio="L'Innocente mostra la propria carta al villaggio, dimostrando la sua innocenza."
              onConferma={(id) => {
                onRivelazione('innocente', id)
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'unzione' && (
            <EventoUnGiocatore
              candidati={unti}
              etichetta="Chi è morto per l'unzione"
              messaggio={'Chi è morto/a per l\'unzione (ha detto "sì" o "no"): l\'unzione si trasmette ai due vicini vivi.'}
              onConferma={(id) => {
                onMorteUnzione(id)
                chiudi()
              }}
                            onAnnulla={chiudi}
            />
          )}

          {evento === 'antico' && (
            <EventoUnGiocatore
              candidati={candidatiAntico}
              etichetta="Chi è L'Antico?"
              onConferma={(id) => {
                onRivelazione('lantico', id)
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'boia' && (
            <EventoDueGiocatori
              candidatiAttore={attori('boia')}
              candidatiBersaglio={vivi}
              etichettaAttore="Chi è il Boia"
              etichettaBersaglio="Chi giustizia il Boia"
              onConferma={(boiaId, id) => {
                onBoiaGiustizia(boiaId, id)
                chiudi()
              }}
              dettaglio={(id) => <PromemoriaMorte giocatori={giocatori} id={id} />}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'alchimista' && (
            <EventoDueGiocatori
              candidatiAttore={candidatiAlchimista}
              candidatiBersaglio={vivi}
              etichettaAttore="Chi è l'Alchimista"
              etichettaBersaglio="Chi trascina con sé l'Alchimista"
              escludiAttoreDaBersagli
              onConferma={(alchimistaId, id) => {
                onAlchimistaEsplode(alchimistaId, id)
                chiudi()
              }}
              dettaglio={(id) => <PromemoriaMorte giocatori={giocatori} id={id} />}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'bardo' && (
            <EventoConferma
              messaggio="Il Bardo esegue il gesto: la notte successiva nessun potere si sveglierà."
              onConferma={() => {
                onBardoSaltaNotte()
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'gallo' && (
            <EventoConferma
              messaggio="Il Gallo Mannaro non canta: si salta l'intero giorno, si passa direttamente alla notte."
              onConferma={() => {
                onGalloSaltaGiorno()
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'borgomastro' && (
            <EventoUnGiocatore
              candidati={vivi}
              etichetta="Chi eleggete Borgomastro?"
              onConferma={(id) => {
                onElezioneBorgomastro(id)
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'fantasma' && (
            <EventoUnGiocatore
              candidati={morti}
              etichetta="Chi riceve la carta"
              messaggio="Il primo morto sul rogo riceve la carta del Fantasma Onnisciente."
              onConferma={(id) => {
                onFantasmaOnnisciente(id)
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'suocera' && (
            <EventoUnGiocatore
              candidati={mortiSenzaRuoloNoto}
              etichetta="Chi era la Suocera"
              messaggio="Per lei non c'è differenza tra la vita e la morte: si rivela solo ora, morendo."
              onConferma={(id) => {
                onSuoceraRivelazione(id)
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}

          {evento === 'annulla-morte' && (
            <EventoUnGiocatore
              candidati={morti}
              etichetta="Chi va riportato in vita"
              messaggio="Corregge una morte dichiarata per errore. Annulla anche le conseguenze già innescate (es. crepacuore del partner)."
              onConferma={(id) => {
                onAnnullaMorte(id)
                chiudi()
              }}
              onAnnulla={chiudi}
            />
          )}
        </div>
      )}
    </div>
  )
}

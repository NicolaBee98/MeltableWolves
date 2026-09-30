import { useState } from 'react'
import { SceltaGiocatore } from '../../components/SceltaGiocatore'
import { RuoloIcona, RuoloIllustrazione } from '../../components/RuoloIcona'
import { useDialogA11y } from '../../components/useDialogA11y'
import { nomeRuolo } from '../../data/roles'
import {
  ruoliRivelabili,
  rivelazioneContestualeDisponibile,
  bardoDisponibile,
  galloDisponibile,
  borgomastroDisponibile,
} from '../../data/eventiSpeciali'

// Forma più comune: si sceglie un solo giocatore, si dichiara l'esito, si
// chiude. Usata da Scemo del Villaggio, Morte per unzione, Elezione
// Borgomastro, Fantasma Onnisciente.
function EventoUnGiocatore({ ruoloSlug, candidati, etichetta, messaggio, onConferma, onAnnulla, richiedeConferma = false }) {
  return (
    <>
      {ruoloSlug && <RuoloIllustrazione slug={ruoloSlug} className="eventi-speciali__illustrazione" />}
      {messaggio && <p>{messaggio}</p>}
      <SceltaGiocatore
        candidati={candidati}
        onConferma={onConferma}
        onSalta={onAnnulla}
        etichetta={etichetta}
        etichettaSalta="Annulla"
        richiedeConferma={richiedeConferma}
      />
    </>
  )
}

// Forma a due passi: prima "chi è" (l'identità non è mai nota in anticipo,
// quindi si sceglie solo tra chi non ha ancora un ruolo assegnato), poi
// "chi subisce l'azione" (un giocatore qualunque). Usata da Boia e Alchimista.
function EventoDueGiocatori({
  ruoloSlug,
  candidatiAttore,
  candidatiBersaglio,
  etichettaAttore,
  etichettaBersaglio,
  escludiAttoreDaBersagli = false,
  onConferma,
  onAnnulla,
  richiedeConferma = false,
}) {
  const [attoreId, setAttoreId] = useState(null)

  if (!attoreId) {
    return (
      <>
        {ruoloSlug && <RuoloIllustrazione slug={ruoloSlug} className="eventi-speciali__illustrazione" />}
        <SceltaGiocatore
          candidati={candidatiAttore}
          onConferma={setAttoreId}
          onSalta={onAnnulla}
          etichetta={etichettaAttore}
          etichettaSalta="Annulla"
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
  const [ruoloRivelazione, setRuoloRivelazione] = useState(null)
  const vivi = giocatori.filter((g) => g.vivo)
  const nonAssegnati = giocatori.filter((g) => g.vivo && !g.ruoloSlug)
  const unti = giocatori.filter((g) => g.vivo && (g.condizioni ?? []).includes('unto'))
  const morti = giocatori.filter((g) => !g.vivo)
  const mortiSenzaRuoloNoto = morti.filter((g) => !g.ruoloSlug)

  const inGiorno = contesto === 'voto' || contesto === 'esito'
  const rivelabili = ruoliRivelabili(ruoliSelezionati, giocatori, quantita)
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
    !giocatori.some((g) => g.ruoloSlug === 'suocera') &&
    mortiSenzaRuoloNoto.length > 0

  const menuEventi = [
    rivelabili.length > 0 && { key: 'rivelazione', etichetta: 'Rivelazione personaggio' },
    inGiorno &&
      rivelazioneContestualeDisponibile('boia', ruoliSelezionati, giocatori, quantita) && {
        key: 'boia',
        etichetta: 'Il Boia giustizia',
      },
    inGiorno &&
      rivelazioneContestualeDisponibile('alchimista', ruoliSelezionati, giocatori, quantita) && {
        key: 'alchimista',
        etichetta: "L'Alchimista esplode",
      },
    inGiorno &&
      rivelazioneContestualeDisponibile('scemo-del-villaggio', ruoliSelezionati, giocatori, quantita) && {
        key: 'scemo',
        etichetta: 'Lo Scemo del Villaggio sbaglia la rima',
      },
    inGiorno &&
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
    setRuoloRivelazione(null)
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
              ruoloSlug="scemo-del-villaggio"
              candidati={nonAssegnati}
              etichetta="Chi è lo Scemo del Villaggio"
              messaggio="La rima sbagliata rivela e uccide lo Scemo del Villaggio nello stesso istante."
              onConferma={(id) => {
                onScemoSbaglia(id)
                chiudi()
              }}
              onAnnulla={chiudi}
              richiedeConferma
            />
          )}

          {evento === 'innocente' && (
            <EventoUnGiocatore
              ruoloSlug="innocente"
              candidati={nonAssegnati}
              etichetta="Chi è l'Innocente"
              messaggio="L'Innocente mostra la propria carta al villaggio, dimostrando la sua innocenza."
              onConferma={(id) => {
                onRivelazione('innocente', id)
                chiudi()
              }}
              onAnnulla={chiudi}
              richiedeConferma
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
              richiedeConferma
            />
          )}

          {evento === 'rivelazione' &&
            (!ruoloRivelazione ? (
              <>
                <p>Che ruolo si rivela?</p>
                <div className="scelta-giocatore__chips" role="group" aria-label="Che ruolo si rivela">
                  {rivelabili.map((slug) => (
                    <button key={slug} type="button" className="chip" onClick={() => setRuoloRivelazione(slug)}>
                      <RuoloIcona slug={slug} size={22} />
                      {nomeRuolo(slug)}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={chiudi}>
                  Annulla
                </button>
              </>
            ) : (
              <>
                <RuoloIllustrazione slug={ruoloRivelazione} className="eventi-speciali__illustrazione" />
                <SceltaGiocatore
                  candidati={nonAssegnati}
                  onConferma={(id) => {
                    onRivelazione(ruoloRivelazione, id)
                    chiudi()
                  }}
                  onSalta={() => setRuoloRivelazione(null)}
                  etichetta={`Chi è ${nomeRuolo(ruoloRivelazione)}?`}
                  richiedeConferma
                />
              </>
            ))}

          {evento === 'boia' && (
            <EventoDueGiocatori
              ruoloSlug="boia"
              candidatiAttore={nonAssegnati}
              candidatiBersaglio={vivi}
              etichettaAttore="Chi è il Boia"
              etichettaBersaglio="Chi giustizia il Boia"
              onConferma={(boiaId, id) => {
                onBoiaGiustizia(boiaId, id)
                chiudi()
              }}
              onAnnulla={chiudi}
              richiedeConferma
            />
          )}

          {evento === 'alchimista' && (
            <EventoDueGiocatori
              ruoloSlug="alchimista"
              candidatiAttore={nonAssegnati}
              candidatiBersaglio={vivi}
              etichettaAttore="Chi è l'Alchimista"
              etichettaBersaglio="Chi trascina con sé l'Alchimista"
              escludiAttoreDaBersagli
              onConferma={(alchimistaId, id) => {
                onAlchimistaEsplode(alchimistaId, id)
                chiudi()
              }}
              onAnnulla={chiudi}
              richiedeConferma
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
              richiedeConferma
            />
          )}

          {evento === 'fantasma' && (
            <EventoUnGiocatore
              ruoloSlug="fantasma-onnisciente"
              candidati={morti}
              etichetta="Chi riceve la carta"
              messaggio="Il primo morto sul rogo riceve la carta del Fantasma Onnisciente."
              onConferma={(id) => {
                onFantasmaOnnisciente(id)
                chiudi()
              }}
              onAnnulla={chiudi}
              richiedeConferma
            />
          )}

          {evento === 'suocera' && (
            <EventoUnGiocatore
              ruoloSlug="suocera"
              candidati={mortiSenzaRuoloNoto}
              etichetta="Chi era la Suocera"
              messaggio="Per lei non c'è differenza tra la vita e la morte: si rivela solo ora, morendo."
              onConferma={(id) => {
                onSuoceraRivelazione(id)
                chiudi()
              }}
              onAnnulla={chiudi}
              richiedeConferma
            />
          )}

          {evento === 'annulla-morte' && (
            <EventoUnGiocatore
              candidati={morti}
              etichetta="Chi va riportato in vita"
              messaggio="Corregge una morte dichiarata per errore. Non annulla da sola eventuali conseguenze già innescate (es. crepacuore del partner): quelle vanno sistemate a mano."
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

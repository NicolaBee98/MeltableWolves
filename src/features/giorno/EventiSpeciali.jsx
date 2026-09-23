import { useState } from 'react'
import { SceltaGiocatore } from '../../components/SceltaGiocatore'
import { RuoloIcona, RuoloIllustrazione } from '../../components/RuoloIcona'
import { ROLES } from '../../data/roles'
import {
  ruoliRivelabili,
  boiaDisponibile,
  alchimistaDisponibile,
  scemoDisponibile,
  bardoDisponibile,
  galloDisponibile,
  borgomastroDisponibile,
} from '../../data/eventiSpeciali'

function nomeRuolo(slug) {
  return ROLES.find((r) => r.slug === slug)?.nome ?? slug
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
}) {
  const [evento, setEvento] = useState(null)
  const [ruoloRivelazione, setRuoloRivelazione] = useState(null)
  const [alchimistaId, setAlchimistaId] = useState(null)
  const [boiaId, setBoiaId] = useState(null)
  const vivi = giocatori.filter((g) => g.vivo)
  const nonAssegnati = giocatori.filter((g) => g.vivo && !g.ruoloSlug)
  const unti = giocatori.filter((g) => g.vivo && (g.condizioni ?? []).includes('unto'))
  const morti = giocatori.filter((g) => !g.vivo)

  const inGiorno = contesto === 'voto' || contesto === 'esito'
  const rivelabili = ruoliRivelabili(ruoliSelezionati, giocatori, quantita)
  const mostraRivelazione = rivelabili.length > 0
  const mostraBoia = inGiorno && boiaDisponibile(ruoliSelezionati, giocatori, quantita)
  const mostraAlchimista = inGiorno && alchimistaDisponibile(ruoliSelezionati, giocatori, quantita)
  const mostraScemo = inGiorno && scemoDisponibile(ruoliSelezionati, giocatori, quantita)
  const mostraUnzione = inGiorno && unti.length > 0
  const mostraBardo = contesto === 'esito' && bardoDisponibile(giocatori)
  const mostraGallo = contesto === 'alba' && galloDisponibile(giocatori)
  const mostraBorgomastro = borgomastroDisponibile(ruoliSelezionati, giocatori)
  // carta unica, mai distribuita all'inizio: va consegnata al primo morto
  // sul rogo (pag. 13), quindi solo finché nessuno la tiene già
  const mostraFantasma =
    inGiorno &&
    ruoliSelezionati.includes('fantasma-onnisciente') &&
    !giocatori.some((g) => g.eFantasmaOnnisciente) &&
    morti.length > 0

  const nessunEvento =
    !mostraRivelazione &&
    !mostraBoia &&
    !mostraAlchimista &&
    !mostraScemo &&
    !mostraUnzione &&
    !mostraBardo &&
    !mostraGallo &&
    !mostraBorgomastro &&
    !mostraFantasma

  function chiudi() {
    setEvento(null)
    setRuoloRivelazione(null)
    setAlchimistaId(null)
    setBoiaId(null)
  }

  if (nessunEvento) return null

  return (
    <div className="eventi-speciali">
      <button type="button" className="eventi-speciali__icona" onClick={() => setEvento('menu')}>
        🎭 Eventi speciali
      </button>
      {evento && (
        <div className="eventi-speciali__popup" role="dialog" aria-label="Eventi speciali">
          {evento === 'menu' && (
            <div className="eventi-speciali__lista">
              {mostraRivelazione && (
                <button type="button" onClick={() => setEvento('rivelazione')}>
                  Rivelazione personaggio
                </button>
              )}
              {mostraBoia && (
                <button type="button" onClick={() => setEvento('boia')}>
                  Il Boia giustizia
                </button>
              )}
              {mostraAlchimista && (
                <button type="button" onClick={() => setEvento('alchimista')}>
                  L'Alchimista esplode
                </button>
              )}
              {mostraScemo && (
                <button type="button" onClick={() => setEvento('scemo')}>
                  Lo Scemo del Villaggio sbaglia la rima
                </button>
              )}
              {mostraUnzione && (
                <button type="button" onClick={() => setEvento('unzione')}>
                  Morte per unzione
                </button>
              )}
              {mostraBardo && (
                <button type="button" onClick={() => setEvento('bardo')}>
                  Il Bardo salta la notte
                </button>
              )}
              {mostraGallo && (
                <button type="button" onClick={() => setEvento('gallo')}>
                  Il Gallo Mannaro salta il giorno
                </button>
              )}
              {mostraBorgomastro && (
                <button type="button" onClick={() => setEvento('borgomastro')}>
                  Elezione Borgomastro
                </button>
              )}
              {mostraFantasma && (
                <button type="button" onClick={() => setEvento('fantasma')}>
                  Assegna il Fantasma Onnisciente
                </button>
              )}
              <button type="button" onClick={chiudi}>
                Chiudi
              </button>
            </div>
          )}

          {evento === 'scemo' && (
            <>
              <p>La rima sbagliata rivela e uccide lo Scemo del Villaggio nello stesso istante.</p>
              <SceltaGiocatore
                candidati={nonAssegnati}
                onConferma={(id) => {
                  onScemoSbaglia(id)
                  chiudi()
                }}
                onSalta={chiudi}
                etichetta="Chi è lo Scemo del Villaggio"
                mostraSalta={false}
              />
            </>
          )}

          {evento === 'unzione' && (
            <>
              <p>Chi è morto/a per l'unzione (ha detto "sì" o "no"): l'unzione si trasmette ai due vicini vivi.</p>
              <SceltaGiocatore
                candidati={unti}
                onConferma={(id) => {
                  onMorteUnzione(id)
                  chiudi()
                }}
                onSalta={chiudi}
                etichetta="Chi è morto per l'unzione"
                mostraSalta={false}
              />
            </>
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
                />
              </>
            ))}

          {evento === 'boia' &&
            (!boiaId ? (
              <SceltaGiocatore
                candidati={vivi}
                onConferma={setBoiaId}
                onSalta={chiudi}
                etichetta="Chi è il Boia"
                mostraSalta={false}
              />
            ) : (
              <SceltaGiocatore
                candidati={vivi.filter((g) => g.id !== boiaId)}
                onConferma={(id) => {
                  onBoiaGiustizia(boiaId, id)
                  chiudi()
                }}
                onSalta={chiudi}
                etichetta="Chi giustizia il Boia"
                mostraSalta={false}
              />
            ))}

          {evento === 'alchimista' &&
            (!alchimistaId ? (
              <SceltaGiocatore
                candidati={vivi}
                onConferma={setAlchimistaId}
                onSalta={chiudi}
                etichetta="Chi è l'Alchimista"
                mostraSalta={false}
              />
            ) : (
              <SceltaGiocatore
                candidati={vivi.filter((g) => g.id !== alchimistaId)}
                onConferma={(id) => {
                  onAlchimistaEsplode(alchimistaId, id)
                  chiudi()
                }}
                onSalta={chiudi}
                etichetta="Chi trascina con sé l'Alchimista"
                mostraSalta={false}
              />
            ))}

          {evento === 'bardo' && (
            <div className="eventi-speciali__conferma">
              <p>Il Bardo esegue il gesto: la notte successiva nessun potere si sveglierà.</p>
              <button
                type="button"
                onClick={() => {
                  onBardoSaltaNotte()
                  chiudi()
                }}
              >
                Conferma
              </button>
              <button type="button" onClick={chiudi}>
                Annulla
              </button>
            </div>
          )}

          {evento === 'gallo' && (
            <div className="eventi-speciali__conferma">
              <p>Il Gallo Mannaro non canta: si salta l'intero giorno, si passa direttamente alla notte.</p>
              <button
                type="button"
                onClick={() => {
                  onGalloSaltaGiorno()
                  chiudi()
                }}
              >
                Conferma
              </button>
              <button type="button" onClick={chiudi}>
                Annulla
              </button>
            </div>
          )}

          {evento === 'borgomastro' && (
            <SceltaGiocatore
              candidati={vivi}
              onConferma={(id) => {
                onElezioneBorgomastro(id)
                chiudi()
              }}
              onSalta={chiudi}
              etichetta="Chi eleggete Borgomastro?"
              mostraSalta={false}
            />
          )}

          {evento === 'fantasma' && (
            <>
              <p>Il primo morto sul rogo riceve la carta del Fantasma Onnisciente.</p>
              <SceltaGiocatore
                candidati={morti}
                onConferma={(id) => {
                  onFantasmaOnnisciente(id)
                  chiudi()
                }}
                onSalta={chiudi}
                etichetta="Chi riceve la carta"
                mostraSalta={false}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

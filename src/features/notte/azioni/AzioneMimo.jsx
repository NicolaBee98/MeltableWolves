import { nomeRuolo } from '../../../data/roles'
import { ruoliAssegnabili } from '../../../data/assegnazione'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { RUOLI_NON_CARTA_SEGRETA } from '../../../data/eventiSpeciali'

// "La prima notte sceglie un giocatore e ne imita il ruolo per tutta la
// partita" (pag. 18): il Mimo agisce molto presto, spesso prima che il
// bersaglio abbia già un ruolo assegnato in app. Il narratore, che conosce
// la carta fisica del bersaglio, la sceglie qui: da quel momento il Mimo ha
// letteralmente quel ruoloSlug (non un'imitazione a parte), quindi si
// sveglia da solo insieme a lui, senza una seconda azione separata.
//
// La scelta della carta resta solo LOCALE (mimoRuoloScelto/onScegliRuoloMimo,
// stato in NightSequencer) finché non si preme "Avanti": applicarla subito
// cambierebbe il ruoloSlug del Mimo nello stesso istante, e siccome questo
// passo esiste solo finché qualcuno ha ruoloSlug 'mimo', sparirebbe da solo a
// metà scelta, facendo "saltare" la schermata al passo successivo (bug reale
// osservato: si sceglie la carta e la schermata mostra già quella del ruolo
// copiato). Restando una scelta locale, il passo non si tocca e resta
// modificabile come ogni altra azione.
export function AzioneMimo({
  giocatori,
  aggiornaGiocatore,
  ruoliSelezionati = [],
  quantita = {},
  mimoRuoloScelto,
  onScegliRuoloMimo,
}) {
  const mimo = giocatori.find((g) => g.ruoloSlug === 'mimo')
  if (!mimo) return null

  if (!mimo.legame) {
    const candidati = giocatori.filter((g) => g.vivo && g.id !== mimo.id)
    return (
      <SceltaGiocatore
        candidati={candidati}
        onConferma={(targetId) => aggiornaGiocatore(mimo.id, { legame: { tipo: 'mimo', targetId } })}
        onSalta={() => {}}
        etichetta="Chi imitare"
        mostraSalta={false}
      />
    )
  }

  const target = giocatori.find((g) => g.id === mimo.legame.targetId)

  // scegliere "chi imitare" applica subito il legame (non tocca il
  // ruoloSlug del Mimo, quindi non fa sparire questo passo come farebbe la
  // scelta della carta, vedi sopra): resta comunque un'uscita per cambiare
  // bersaglio, come ogni altro passo a due fasi di questo file (Berserker,
  // Progenitore, Cartomante/Medium)
  function annullaBersaglio() {
    onScegliRuoloMimo(null)
    aggiornaGiocatore(mimo.id, { legame: undefined })
  }

  // il bersaglio ha già un ruolo noto in app (assegnato altrove, non da
  // questa scelta): niente da chiedere qui, il Mimo lo scoprirà/adotterà
  // quando quel ruolo si sveglierà (vedi mimoDiQuestoPasso in NightSequencer)
  if (target?.ruoloSlug) {
    return (
      <div className="azione-mimo">
        <p>
          Il Mimo imita {target.nome}: ha assunto il ruolo di {nomeRuolo(target.ruoloSlug)}.
        </p>
        <button type="button" onClick={annullaBersaglio}>
          Annulla (cambia bersaglio)
        </button>
      </div>
    )
  }

  // il bersaglio non ha ancora un ruolo noto in app: il narratore guarda la
  // sua carta fisica e la comunica qui. "villico" è sempre proponibile anche
  // se non compare esplicitamente nel mazzo (vedi RUOLI_NON_ASSEGNABILI_MANUALMENTE)
  const opzioni = [
    ...new Set([
      ...ruoliAssegnabili(
        ruoliSelezionati.filter((slug) => slug !== 'mimo' && !RUOLI_NON_CARTA_SEGRETA.includes(slug)),
        giocatori,
        quantita,
      ),
      'villico',
    ]),
  ]

  return (
    <div className="azione-mimo">
      <p>Che carta ha davvero {target?.nome}?</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Che carta ha il bersaglio del Mimo">
        {opzioni.map((slug) => (
          <button
            key={slug}
            type="button"
            className="chip"
            aria-pressed={mimoRuoloScelto === slug}
            onClick={() => onScegliRuoloMimo(slug)}
          >
            {nomeRuolo(slug)}
          </button>
        ))}
      </div>
      <button type="button" onClick={annullaBersaglio}>
        Annulla (cambia bersaglio)
      </button>
    </div>
  )
}

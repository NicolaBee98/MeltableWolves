import { nomeRuolo, ruoloPerDisplay } from '../../../data/roles'
import { ruoliAssegnabili } from '../../../data/assegnazione'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'

// il Mimo non può copiare sé stesso, il Borgomastro (un titolo dato dal voto)
// né il Fantasma Onnisciente; tutte le altre carte del mazzo ancora non
// assegnate sì (anche Boia, Alchimista, Scemo, Innocente, Suocera) e la
// Guardia Mannara è una carta distinta: il Mimo guarda la carta vera
const NON_IMITABILI = ['mimo', 'borgomastro', 'fantasma-onnisciente']

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
  vivoAIngresso = (g) => g.vivo,
  mimoRuoloScelto,
  onScegliRuoloMimo = () => {},
}) {
  const mimo = giocatori.find((g) => g.ruoloSlug === 'mimo')
  if (!mimo) return null

  const candidati = giocatori.filter((g) => vivoAIngresso(g) && g.id !== mimo.id)
  const target = giocatori.find((g) => g.id === mimo.legame?.targetId)

  // scegliere "chi imitare" applica subito il legame (non tocca il
  // ruoloSlug del Mimo, quindi non fa sparire questo passo come farebbe la
  // scelta della carta, vedi sotto). Cliccare di nuovo la chip del bersaglio
  // lo deseleziona e annulla tutto (carta compresa)
  function annullaBersaglio() {
    onScegliRuoloMimo(null)
    aggiornaGiocatore(mimo.id, { legame: undefined })
  }

  const sceltaBersaglio = (
    <SceltaGiocatore
      candidati={candidati}
      selezionatoEsternoId={mimo.legame?.targetId ?? null}
      onConferma={(targetId) =>
        targetId === mimo.legame?.targetId
          ? annullaBersaglio()
          : (onScegliRuoloMimo(null), aggiornaGiocatore(mimo.id, { legame: { tipo: 'mimo', targetId } }))
      }
      onSalta={() => {}}
      etichetta="Chi imitare"
      mostraSalta={false}
    />
  )

  // senza carta il Mimo non esiste: con Avanti diventa Villico (vedi commitMimoSeSelezionato)
  const avvisoVillico = (
    <p className="avviso">⚠️ Senza una carta da imitare il Mimo diventerà Villico.</p>
  )

  if (!mimo.legame) {
    return (
      <div className="azione-mimo">
        {sceltaBersaglio}
        {avvisoVillico}
      </div>
    )
  }

  // il bersaglio ha già un ruolo noto in app (assegnato altrove, non da
  // questa scelta): niente da chiedere qui, con Avanti il Mimo lo copia
  // (vedi commitMimoSeSelezionato in NightSequencer)
  if (target?.ruoloSlug) {
    return (
      <div className="azione-mimo">
        {sceltaBersaglio}
        <p>
          Il Mimo imita {target.nome}: con Avanti assumerà il ruolo di {nomeRuolo(ruoloPerDisplay(target.ruoloSlug))}.
        </p>
      </div>
    )
  }

  // il bersaglio non ha ancora un ruolo noto in app: il narratore guarda la
  // sua carta fisica e la comunica qui. "villico" è sempre proponibile anche
  // se non compare esplicitamente nel mazzo (vedi RUOLI_NON_ASSEGNABILI_MANUALMENTE)
  const opzioni = [
    ...new Set([
      ...ruoliAssegnabili(
        ruoliSelezionati.filter((slug) => !NON_IMITABILI.includes(slug)),
        giocatori,
        quantita,
      ),
      'villico',
    ]),
  ]

  return (
    <div className="azione-mimo">
      {sceltaBersaglio}
      <p>Che carta ha davvero {target?.nome}?</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Che carta ha il bersaglio del Mimo">
        {opzioni.map((slug) => (
          <button
            key={slug}
            type="button"
            className="chip"
            aria-pressed={mimoRuoloScelto === slug}
            onClick={() => onScegliRuoloMimo(mimoRuoloScelto === slug ? null : slug)}
          >
            {nomeRuolo(slug)}
          </button>
        ))}
      </div>
      {!mimoRuoloScelto && avvisoVillico}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { eLupo } from '../../../data/roles'
import { uccidiPatch, avvisiColpo, segnaUsoStanotte, avvisoImmuneNotte, RUOLI_IMMUNI_ALLA_NOTTE } from '../../../data/effettiNotte'
import { annullaColpo } from './annullaColpo'

const RUOLI = ['chupacabra']
const POTERE = 'chupacabra-caccia'

// come la pozione mortale della Strega: la chip scelta resta modificabile
// finché non si preme "Avanti". Il Chupacabra agisce dopo il branco dei
// lupi (vedi nightSteps.js): nessun altro potere mortale tocca ancora il suo
// bersaglio a questo punto della notte, quindi annullare la morte data a un
// click precedente per ripensare il bersaglio è sicuro.
export function AzioneChupacabra({ giocatori, aggiornaGiocatore, annullaMorte, round, vivoAIngresso = (g) => g.vivo, impostaEventiAvanti }) {
  const chupacabra = giocatori.find((g) => g.ruoloSlug === 'chupacabra')
  // la scelta di stanotte vive sul Chupacabra (sceltaNotte, ripulita all'alba),
  // non in uno stato locale: dopo un refresh a metà passo resta visibile e
  // modificabile, e cambiare bersaglio ripristina ancora il precedente
  const scelta = chupacabra?.sceltaNotte?.chupacabra
  const target = scelta?.targetId ?? null
  const colpito = Boolean(scelta?.colpito)
  const salvaScelta = (valore) => {
    if (chupacabra) aggiornaGiocatore(chupacabra.id, { sceltaNotte: { ...chupacabra.sceltaNotte, chupacabra: valore } })
  }
  const [avviso, setAvviso] = useState(null)
  // effetti speciali della morte del bersaglio (Cortigiana, Cucciolo, Cavaliere):
  // spiegati qui sotto, nel registro solo con "Avanti" (vedi impostaEventiAvanti)
  const [avvisiEffetti, setAvvisiEffetti] = useState([])
  const logEffetti = avvisiEffetti.map((a) => a.log).join('\n')
  useEffect(() => {
    impostaEventiAvanti?.('chupacabra', logEffetti ? logEffetti.split('\n') : [])
    return () => impostaEventiAvanti?.('chupacabra', [])
  }, [logEffetti])
  // il bersaglio appena colpito resta in lista anche se non è più vivo,
  // altrimenti la sua chip sparirebbe subito dopo il click
  const candidati = giocatori.filter(
    (g) => (vivoAIngresso(g) || g.id === target) && g.id !== chupacabra?.id,
  )
  // calcolato con il bersaglio ancora tra i vivi: se il colpo ha appena
  // ucciso l'ultimo lupo, cambiare bersaglio non deve poter uccidere un non-lupo
  const nessunLupoVivo = !candidati.some((g) => eLupo(g.ruoloSlug))

  // deselezione (click sulla chip premuta): niente bersaglio, uso del potere tolto
  function deseleziona() {
    if (colpito) annullaColpo(target, aggiornaGiocatore, annullaMorte)
    if (target) aggiornaGiocatore(target, { visitatoDaiLupi: undefined })
    giocatori
      .filter((g) => RUOLI.includes(g.ruoloSlug))
      .forEach((g) => {
        const usi = [...(g.usiNotte ?? [])]
        const idx = usi.lastIndexOf(POTERE)
        if (idx >= 0) usi.splice(idx, 1)
        aggiornaGiocatore(g.id, { usiNotte: usi })
      })
    salvaScelta(undefined)
    setAvviso(null)
    setAvvisiEffetti([])
  }

  function confermaScelta(targetId) {
    if (targetId === target) return deseleziona()
    if (target && colpito) annullaColpo(target, aggiornaGiocatore, annullaMorte)
    if (target) aggiornaGiocatore(target, { visitatoDaiLupi: undefined })
    const eraScelto = Boolean(target)
    let colpitoOra = false
    setAvviso(null)
    setAvvisiEffetti([])
    const bersaglio = giocatori.find((g) => g.id === targetId)
    if (bersaglio) {
      if (!eLupo(bersaglio.ruoloSlug) && !nessunLupoVivo) {
        setAvviso(`${bersaglio.nome} non è un lupo: la caccia del Chupacabra fallisce.`)
      } else {
        const patch = uccidiPatch(bersaglio, round, { mortoDa: 'chupacabra' })
        // la Cortigiana a casa del bersaglio muore anche se lui si salva (vedi risolviCortigiana)
        const conVisita = { ...patch, visitatoDaiLupi: round }
        aggiornaGiocatore(targetId, conVisita)
        setAvvisiEffetti(avvisiColpo(giocatori, targetId, { [targetId]: conVisita }, 'chupacabra'))
        if (patch) {
          colpitoOra = true
        } else if (RUOLI_IMMUNI_ALLA_NOTTE.includes(bersaglio.ruoloSlug)) {
          setAvviso(`${avvisoImmuneNotte(bersaglio)}: la caccia non ha alcun effetto su ${bersaglio.nome}.`)
        } else {
          setAvviso(`${bersaglio.nome} è protetto/a: la caccia non ha alcun effetto.`)
        }
      }
    }
    salvaScelta({ targetId, colpito: colpitoOra })
    // cambiare bersaglio non è un nuovo uso
    if (!eraScelto) segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  if (candidati.length === 0) {
    return <p>Nessun giocatore da scegliere.</p>
  }

  return (
    <div className="scelta-giocatore">
      <p>Il Chupacabra caccia</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Il Chupacabra caccia">
        {candidati
          .map((g) => (
            <button
              key={g.id}
              type="button"
              className="chip"
              aria-pressed={target === g.id}
              onClick={() => confermaScelta(g.id)}
            >
              {g.nome}
            </button>
          ))}
      </div>
      {avviso && <p className="avviso">⚠️ {avviso}</p>}
      {avvisiEffetti.map((a) => (
        <p key={a.testo} className="avviso">⚠️ {a.testo}</p>
      ))}
    </div>
  )
}

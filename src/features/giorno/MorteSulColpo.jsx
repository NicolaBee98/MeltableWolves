import { SceltaGiocatore } from '../../components/SceltaGiocatore'

export function MorteSulColpo({ giocatori, onDichiara }) {
  const vivi = giocatori.filter((g) => g.vivo)

  return (
    <section className="morte-sul-colpo">
      <h3>Morte sul colpo</h3>
      <p>Per esecuzione del Boia, unzione dell'Untore, o rima sbagliata dello Scemo del Villaggio.</p>
      <SceltaGiocatore
        candidati={vivi}
        onConferma={onDichiara}
        onSalta={() => {}}
        etichetta="Chi dichiarare morto sul colpo"
      />
    </section>
  )
}

// istruzioni per installare la PWA e usarla senza rete; evidenzia il
// sistema rilevato dallo userAgent ma mostra sempre entrambe le sezioni
// (iPadOS recente si presenta come Mac: lo si riconosce dal touch)
function sistemaRilevato() {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return null
}

export function ScaricaOffline({ onTornaAllaHome }) {
  const sistema = sistemaRilevato()
  const classe = (id) => `scarica-offline__sezione${sistema === id ? ' scarica-offline__sezione--tuo' : ''}`
  return (
    <section className="scarica-offline">
      <button type="button" onClick={onTornaAllaHome} className="torna-alla-home">
        ← Torna alla Home
      </button>
      <h2>Scarica offline</h2>
      <p>Aggiungi l'app al telefono e usala anche senza connessione.</p>

      <div className={classe('ios')} data-sistema="ios">
        <h3>iPhone e iPad {sistema === 'ios' && <span className="scarica-offline__tuo">(il tuo dispositivo)</span>}</h3>
        <ol>
          <li>Apri l'app con <strong>Safari</strong> (con altri browser non funziona).</li>
          <li>Tocca <strong>Condividi</strong> (il quadrato con la freccia in su).</li>
          <li>Scegli <strong>Aggiungi alla schermata Home</strong>, poi <strong>Aggiungi</strong>.</li>
          <li>Apri l'app dall'icona <strong>una volta online</strong> e attendi che si carichi del tutto.</li>
          <li>Da ora funziona anche offline.</li>
        </ol>
        <p>Per aggiornarla: chiudi del tutto l'app (scorrila via dalle app aperte) e riaprila con la rete.</p>
      </div>

      <div className={classe('android')} data-sistema="android">
        <h3>Android {sistema === 'android' && <span className="scarica-offline__tuo">(il tuo dispositivo)</span>}</h3>
        <ol>
          <li>Apri l'app con <strong>Chrome</strong>.</li>
          <li>Tocca il menu <strong>⋮</strong> in alto a destra.</li>
          <li>Scegli <strong>Installa app</strong> (o <strong>Aggiungi a schermata Home</strong>) e conferma.</li>
          <li>Apri l'app dall'icona <strong>una volta online</strong> e attendi che si carichi del tutto.</li>
          <li>Da ora funziona anche offline.</li>
        </ol>
        <p>Per aggiornarla: chiudi del tutto l'app e riaprila con la rete.</p>
      </div>

      <p className="avviso">
        I dati della partita restano solo su questo dispositivo, senza sincronizzazione: usa sempre lo stesso telefono.
        Cancellare i dati del sito dal browser azzera la partita.
      </p>
    </section>
  )
}

import { renderHook, act } from '@testing-library/react'
import { usePartita } from './usePartita'
import { resuscitaPatch } from '../data/effettiNotte'
import { ruoliAssegnabili } from '../data/assegnazione'

beforeEach(() => {
  localStorage.clear()
})

test('carica dati salvati da uno schema precedente senza condizioni/poteriUsati/usiNotte/storiaRuoli senza andare in crash', () => {
  localStorage.setItem(
    'meltable-wolves-partita',
    JSON.stringify([{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true }]),
  )

  const { result } = renderHook(() => usePartita())

  expect(result.current.giocatori[0]).toMatchObject({
    condizioni: [],
    poteriUsati: [],
    usiNotte: [],
    storiaRuoli: [],
  })
})

test('addGiocatore aggiunge un giocatore vivo senza ruolo assegnato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori).toHaveLength(1)
  expect(result.current.giocatori[0]).toMatchObject({
    nome: 'Anna',
    ruoloSlug: undefined,
    vivo: true,
    condizioni: [],
  })
})

test('removeGiocatore rimuove il giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
    result.current.addGiocatore('Marco')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.removeGiocatore(id)
  })

  expect(result.current.giocatori).toHaveLength(1)
  expect(result.current.giocatori[0].nome).toBe('Marco')
})

test('lo stato persiste in localStorage tra due montaggi dell\'hook', () => {
  const { result, unmount } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  unmount()

  const { result: result2 } = renderHook(() => usePartita())
  expect(result2.current.giocatori).toHaveLength(1)
  expect(result2.current.giocatori[0].nome).toBe('Anna')
})

test('resetPartita tiene i nomi (stesso gruppo, nuova partita) ma azzera ruolo, condizioni e stato di vita', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
    result.current.addGiocatore('Marco')
  })
  act(() => {
    result.current.aggiornaGiocatore(result.current.giocatori[0].id, {
      ruoloSlug: 'veggente',
      vivo: false,
      causaMorte: 'rogo',
      condizioni: ['inibito'],
    })
  })

  act(() => {
    result.current.resetPartita()
  })

  expect(result.current.giocatori.map((g) => g.nome)).toEqual(['Anna', 'Marco'])
  expect(result.current.giocatori[0]).toMatchObject({
    ruoloSlug: undefined,
    vivo: true,
    condizioni: [],
  })
})

test('svuotaGiocatori elimina tutti i giocatori (per ripartire con persone diverse)', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  act(() => {
    result.current.svuotaGiocatori()
  })

  expect(result.current.giocatori).toEqual([])
})

test('addGiocatore inizializza poteriUsati vuoto', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori[0].poteriUsati).toEqual([])
})

test('addGiocatore inizializza storiaRuoli vuoto', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori[0].storiaRuoli).toEqual([])
})

test('aggiornaGiocatore applica una patch parziale al giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.aggiornaGiocatore(id, { vivo: false, poteriUsati: ['guaritore-resuscita'] })
  })

  expect(result.current.giocatori[0].vivo).toBe(false)
  expect(result.current.giocatori[0].poteriUsati).toEqual(['guaritore-resuscita'])
})

test('aggiornaGiocatore(vivo:false) fa morire di crepacuore anche il partner innamorato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
    result.current.addGiocatore('Marco')
  })
  const [anna, marco] = result.current.giocatori

  act(() => {
    result.current.aggiornaGiocatore(anna.id, { condizioni: ['innamorato'] })
    result.current.aggiornaGiocatore(marco.id, { condizioni: ['innamorato'] })
  })

  act(() => {
    result.current.aggiornaGiocatore(anna.id, { vivo: false, causaMorte: 'rogo' })
  })

  const marcoDopo = result.current.giocatori.find((g) => g.id === marco.id)
  expect(marcoDopo).toMatchObject({ vivo: false, causaMorte: 'crepacuore' })
})

test('aggiornaGiocatore(vivo:false) fa ereditare subito il ruolo del maestro morto (Apprendista), anche se muore di rogo', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Sara')
    result.current.addGiocatore('Marco')
  })
  const [sara, marco] = result.current.giocatori

  act(() => {
    result.current.aggiornaGiocatore(sara.id, {
      ruoloSlug: 'apprendista',
      legame: { tipo: 'apprendista', targetId: marco.id },
    })
    result.current.aggiornaGiocatore(marco.id, { ruoloSlug: 'veggente' })
  })

  act(() => {
    result.current.aggiornaGiocatore(marco.id, { vivo: false, causaMorte: 'rogo' })
  })

  const saraDopo = result.current.giocatori.find((g) => g.id === sara.id)
  expect(saraDopo).toMatchObject({ ruoloSlug: 'veggente', legame: null })
})

test('aggiornaGiocatore(vivo:false) rimuove "accecato" dal Veggente quando muore il Polpo Mannaro', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Elena')
    result.current.addGiocatore('Polpo')
  })
  const [veggente, polpo] = result.current.giocatori

  act(() => {
    result.current.aggiornaGiocatore(veggente.id, { ruoloSlug: 'veggente', condizioni: ['accecato'] })
    result.current.aggiornaGiocatore(polpo.id, { ruoloSlug: 'polpo-mannaro' })
  })

  act(() => {
    result.current.aggiornaGiocatore(polpo.id, { vivo: false, causaMorte: 'rogo' })
  })

  const veggenteDopo = result.current.giocatori.find((g) => g.id === veggente.id)
  expect(veggenteDopo.condizioni).not.toContain('accecato')
})

test('aggiornaGiocatore(vivo:false) su un lupo fa maturare il Cucciolo in Lupo Mannaro semplice, senza far "riapparire" la sua vecchia carta tra i ruoli ancora da scoprire', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Cucciolo')
    result.current.addGiocatore('Lupo')
  })
  const [cucciolo, lupo] = result.current.giocatori

  act(() => {
    result.current.aggiornaGiocatore(cucciolo.id, {
      ruoloSlug: 'cucciolo-di-lupo-mannaro',
      storiaRuoli: ['cucciolo-di-lupo-mannaro'],
    })
    result.current.aggiornaGiocatore(lupo.id, { ruoloSlug: 'lupo-mannaro', storiaRuoli: ['lupo-mannaro'] })
  })

  act(() => {
    result.current.aggiornaGiocatore(lupo.id, { vivo: false, causaMorte: 'notte', mortoNotte: 2 })
  })

  const cucciolomaturato = result.current.giocatori.find((g) => g.id === cucciolo.id)
  expect(cucciolomaturato.ruoloSlug).toBe('lupo-mannaro')
  // la storia non dimentica MAI la vecchia carta (contaAssegnati non la
  // riconta più come "da assegnare"), altrimenti il Cartomante la
  // riproporrebbe come ruolo ancora incognito per qualcun altro
  expect(cucciolomaturato.storiaRuoli).toEqual(
    expect.arrayContaining(['cucciolo-di-lupo-mannaro', 'lupo-mannaro']),
  )
  expect(ruoliAssegnabili(['cucciolo-di-lupo-mannaro'], result.current.giocatori, { 'cucciolo-di-lupo-mannaro': 1 })).toEqual(
    [],
  )
})

test('aggiornaGiocatore può assegnare il ruolo a un giocatore già esistente', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.aggiornaGiocatore(id, { ruoloSlug: 'paladino' })
  })

  expect(result.current.giocatori[0].ruoloSlug).toBe('paladino')
})

const mk = (id, extra = {}) => ({ id, nome: id, vivo: true, condizioni: [], poteriUsati: [], usiNotte: [], storiaRuoli: [], ...extra })
function montaCon(giocatori) {
  localStorage.setItem('meltable-wolves-partita', JSON.stringify(giocatori))
  return renderHook(() => usePartita())
}

test('catena fino a punto fisso: il Cavaliere sacrificato per crepacuore innesca la sua vendetta/eredità', () => {
  // A innamorata di B; B ha un Apprendista legato. Muore A -> crepacuore di B -> l'Apprendista eredita il ruolo di B
  const { result } = montaCon([
    mk('A', { ruoloSlug: 'villico', condizioni: ['innamorato'] }),
    mk('B', { ruoloSlug: 'veggente', condizioni: ['innamorato'] }),
    mk('C', { ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: 'B' } }),
  ])
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'rogo' }))
  expect(result.current.giocatori.find((g) => g.id === 'B').vivo).toBe(false)
  expect(result.current.giocatori.find((g) => g.id === 'C')).toMatchObject({ ruoloSlug: 'veggente', legame: null })
})

test('crepacuore di un lupo innesca la maturazione del Cucciolo', () => {
  const { result } = montaCon([
    mk('A', { ruoloSlug: 'villico', condizioni: ['innamorato'] }),
    mk('B', { ruoloSlug: 'lupo-mannaro', condizioni: ['innamorato'] }),
    mk('C', { ruoloSlug: 'cucciolo-di-lupo-mannaro' }),
  ])
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'rogo' }))
  expect(result.current.giocatori.find((g) => g.id === 'C').ruoloSlug).toBe('lupo-mannaro')
})

test('annullaMorte disfa crepacuore, maturazione e ruolo ereditato', () => {
  const { result } = montaCon([
    mk('A', { ruoloSlug: 'lupo-mannaro', condizioni: ['innamorato'] }),
    mk('B', { ruoloSlug: 'villico', condizioni: ['innamorato'] }),
    mk('C', { ruoloSlug: 'cucciolo-di-lupo-mannaro' }),
    mk('D', { ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: 'A' } }),
  ])
  const prima = result.current.giocatori
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'notte', mortoNotte: 1 }))
  expect(result.current.giocatori.find((g) => g.id === 'B').vivo).toBe(false)
  act(() => result.current.annullaMorte('A'))
  expect(result.current.giocatori).toEqual(prima)
})

test('annullaMorte toglie all\'Apprendista i poteri usati ereditati dal maestro', () => {
  const { result } = montaCon([
    mk('A', { ruoloSlug: 'guaritore', poteriUsati: ['guaritore-resuscita'] }),
    mk('D', { ruoloSlug: 'apprendista', poteriUsati: [], legame: { tipo: 'apprendista', targetId: 'A' } }),
  ])
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'notte', mortoNotte: 1 }))
  expect(result.current.giocatori.find((g) => g.id === 'D').poteriUsati).toEqual(['guaritore-resuscita'])
  act(() => result.current.annullaMorte('A'))
  expect(result.current.giocatori.find((g) => g.id === 'D').ruoloSlug).toBe('apprendista')
  expect(result.current.giocatori.find((g) => g.id === 'D').poteriUsati).toEqual([])
})

test('annullaMorte senza snapshot (dopo ricaricamento) rimette almeno vivo e pulisce la causa', () => {
  const { result } = montaCon([mk('A', { vivo: false, causaMorte: 'notte', mortoNotte: 1, mortoDa: 'branco' })])
  act(() => result.current.annullaMorte('A'))
  expect(result.current.giocatori[0]).toMatchObject({ vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoDa: undefined })
})

test('annullaMorte ripristina il ruolo originale dell\'Antico dopo il flag anticoSbranatoNotte', () => {
  const { result } = montaCon([mk('A', { ruoloSlug: 'lantico', storiaRuoli: ['lantico'] })])
  act(() => result.current.aggiornaGiocatore('A', { vivo: true, anticoSbranatoNotte: 1 }))
  expect(result.current.giocatori[0].anticoSbranatoNotte).toBe(1)
  act(() => result.current.annullaMorte('A'))
  expect(result.current.giocatori[0].anticoSbranatoNotte).toBeUndefined()
})

test('Cavaliere salva dal rogo senza far morire di crepacuore il partner', () => {
  const { result } = montaCon([
    mk('K', { ruoloSlug: 'cavaliere', legame: { tipo: 'cavaliere', targetId: 'X' } }),
    mk('X', { ruoloSlug: 'villico', condizioni: ['innamorato'] }),
    mk('Y', { ruoloSlug: 'villico', condizioni: ['innamorato'] }),
  ])
  act(() => result.current.aggiornaGiocatore('X', { vivo: false, causaMorte: 'rogo', mortoNotte: 3 }))
  const g = (id) => result.current.giocatori.find((p) => p.id === id)
  expect(g('X').vivo).toBe(true)
  expect(g('Y').vivo).toBe(true)
  expect(g('K')).toMatchObject({ vivo: false, causaMorte: 'sacrificio', mortoNotte: undefined })
})

test('removeGiocatore ripulisce legami pendenti e il partner innamorato orfano', () => {
  const { result } = montaCon([
    mk('A', { condizioni: ['innamorato'] }),
    mk('B', { condizioni: ['innamorato', 'unto'], legame: { tipo: 'apprendista', targetId: 'A' } }),
  ])
  act(() => result.current.removeGiocatore('A'))
  expect(result.current.giocatori).toHaveLength(1)
  expect(result.current.giocatori[0]).toMatchObject({ legame: null, condizioni: ['unto'] })
})

test('un localStorage che lancia non manda in crash il salvataggio', () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota')
  })
  const { result } = renderHook(() => usePartita())
  expect(() => act(() => result.current.addGiocatore('Anna'))).not.toThrow()
  spy.mockRestore()
})

// l'uso del potere viene scritto DOPO la morte: non deve impedire di disfare la catena
test('annullaMorte disfa il crepacuore di un lupo innamorato anche se l\'attore ha scritto usiNotte dopo la morte', () => {
  const { result } = montaCon([
    mk('A', { ruoloSlug: 'villico', condizioni: ['innamorato'] }),
    mk('L', { ruoloSlug: 'lupo-mannaro', condizioni: ['innamorato'], usiNotte: [] }),
  ])
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'notte', mortoNotte: 1 }))
  act(() => result.current.aggiornaGiocatore('L', { usiNotte: ['branco-lupi-sbrana'] }))
  expect(result.current.giocatori.find((g) => g.id === 'L').vivo).toBe(false)
  act(() => result.current.annullaMorte('A'))
  const l = result.current.giocatori.find((g) => g.id === 'L')
  expect(l.vivo).toBe(true)
  expect(result.current.giocatori.find((g) => g.id === 'A').vivo).toBe(true)
  // l'uso resta com'era: lo toglie chi annulla, non annullaMorte
  expect(l.usiNotte).toEqual(['branco-lupi-sbrana'])
})

test('annullaMorte rimette Cucciolo e lupo del Berserker anche dopo la scrittura di usiNotte', () => {
  const { result } = montaCon([
    mk('B', { ruoloSlug: 'berserker' }),
    mk('L', { ruoloSlug: 'lupo-mannaro', usiNotte: [] }),
    mk('C', { ruoloSlug: 'cucciolo-di-lupo-mannaro' }),
  ])
  act(() => {
    result.current.aggiornaGiocatore('B', { vivo: false, causaMorte: 'notte', mortoNotte: 1 })
    result.current.aggiornaGiocatore('L', { vivo: false, causaMorte: 'notte', mortoNotte: 1 })
  })
  act(() => result.current.aggiornaGiocatore('L', { usiNotte: ['branco-lupi-sbrana'] }))
  expect(result.current.giocatori.find((g) => g.id === 'C').ruoloSlug).toBe('lupo-mannaro')
  act(() => result.current.annullaMorte('L'))
  expect(result.current.giocatori.find((g) => g.id === 'L').vivo).toBe(true)
  expect(result.current.giocatori.find((g) => g.id === 'C').ruoloSlug).toBe('cucciolo-di-lupo-mannaro')
})

test('annullaMorte: la Strega innamorata che avvelena il partner (poteriUsati scritti dopo) torna viva', () => {
  const { result } = montaCon([
    mk('S', { ruoloSlug: 'strega', condizioni: ['innamorato'], poteriUsati: [] }),
    mk('P', { ruoloSlug: 'villico', condizioni: ['innamorato'] }),
  ])
  act(() => result.current.aggiornaGiocatore('P', { vivo: false, causaMorte: 'notte', mortoNotte: 1 }))
  act(() => result.current.aggiornaGiocatore('S', { poteriUsati: ['strega-pozione-mortale'] }))
  expect(result.current.giocatori.find((g) => g.id === 'S').vivo).toBe(false)
  act(() => result.current.annullaMorte('P'))
  const s = result.current.giocatori.find((g) => g.id === 'S')
  expect(s.vivo).toBe(true)
  expect(s.poteriUsati).toEqual(['strega-pozione-mortale'])
})

test('due coppie di innamorati: la morte di uno trascina solo il suo partner e annullaMorte lo disfa', () => {
  const { result } = montaCon([
    mk('A', { condizioni: ['innamorato'], innamoratiCon: ['B'] }),
    mk('B', { condizioni: ['innamorato'], innamoratiCon: ['A'] }),
    mk('C', { condizioni: ['innamorato'], innamoratiCon: ['D'] }),
    mk('D', { condizioni: ['innamorato'], innamoratiCon: ['C'] }),
  ])
  const prima = result.current.giocatori
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'notte', mortoNotte: 1 }))
  expect(result.current.giocatori.filter((g) => !g.vivo).map((g) => g.id)).toEqual(['A', 'B'])
  act(() => result.current.annullaMorte('A'))
  expect(result.current.giocatori).toEqual(prima)
})

test('annullaMorte di un Mimo-Scemo non ne cambia il ruolo copiato', () => {
  const { result } = montaCon([mk('A', { ruoloSlug: 'scemo-del-villaggio', storiaRuoli: ['mimo', 'scemo-del-villaggio'] })])
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'rogo' }))
  act(() => result.current.annullaMorte('A'))
  expect(result.current.giocatori[0]).toMatchObject({ vivo: true, ruoloSlug: 'scemo-del-villaggio' })
})

test('la vendetta del Cucciolo parte una sola volta: i due Cuccioli (Mimo incluso) morti insieme', () => {
  const { result } = montaCon([
    mk('A', { ruoloSlug: 'cucciolo-di-lupo-mannaro' }),
    mk('B', { ruoloSlug: 'cucciolo-di-lupo-mannaro' }),
    mk('C', { ruoloSlug: 'lupo-mannaro' }),
  ])
  act(() => result.current.aggiornaGiocatore('A', { vivo: false, causaMorte: 'rogo' }))
  expect(result.current.giocatori.find((g) => g.id === 'C').vendettaCucciolo).toBe(true)
  // il primo lupo morto ha fatto maturare il secondo Cucciolo: nessuna seconda vendetta
  expect(result.current.giocatori.find((g) => g.id === 'B').ruoloSlug).toBe('lupo-mannaro')
})

// voce 3 del 2026-10-05: maestro morto con ruolo ignoto (es. Suocera): l'Apprendista
// aspetta, e quando il ruolo diventa noto eredita
test('Apprendista con maestro morto senza ruolo noto resta in attesa, poi eredita quando il ruolo del maestro viene rivelato', () => {
  localStorage.setItem(
    'meltable-wolves-partita',
    JSON.stringify([
      mk('S', { ruoloSlug: 'apprendista', storiaRuoli: ['apprendista'], legame: { tipo: 'apprendista', targetId: 'M' } }),
      mk('M'),
    ]),
  )
  const { result } = renderHook(() => usePartita())
  const sara = () => result.current.giocatori.find((g) => g.id === 'S')

  act(() => result.current.aggiornaGiocatore('M', { vivo: false, causaMorte: 'notte', mortoNotte: 1 }))
  expect(sara()).toMatchObject({ ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: 'M' } })

  act(() => result.current.aggiornaGiocatore('M', { ruoloSlug: 'suocera', storiaRuoli: ['suocera'] }))
  expect(sara()).toMatchObject({ ruoloSlug: 'suocera', legame: null })
})

test('resuscitare un innamorato lo libera e libera il partner vivo; annullare una morte no', () => {
  localStorage.setItem(
    'meltable-wolves-partita',
    JSON.stringify([
      { id: 'a', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: ['innamorato'], innamoratiCon: ['b'] },
      { id: 'b', nome: 'Bea', ruoloSlug: 'lantico', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['a'] },
    ]),
  )
  const { result } = renderHook(() => usePartita())

  act(() => result.current.aggiornaGiocatore('a', { vivo: true })) // annulla morte: resta innamorata
  expect(result.current.giocatori[1].condizioni).toContain('innamorato')

  act(() => result.current.aggiornaGiocatore('a', { vivo: false }))
  act(() => result.current.aggiornaGiocatore('a', resuscitaPatch(result.current.giocatori[0], 2)))
  expect(result.current.giocatori[0].condizioni).not.toContain('innamorato')
  expect(result.current.giocatori[1]).toMatchObject({ condizioni: [], innamoratiCon: [] })
})

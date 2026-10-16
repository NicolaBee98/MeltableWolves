import { describe, expect, test } from 'vitest'
import { disponiFigure, dimensioniPersonaggio, PX_PER_UNITA_MAX } from './assetRuoli'

const lupi = (n) => Array.from({ length: n }, (_, i) => dimensioniPersonaggio('lupo-mannaro', i + 1))

describe('disponiFigure', () => {
  test('nessuna riga supera la larghezza, per qualsiasi numero di figure e a 328px', () => {
    for (const n of [1, 3, 5, 8, 12]) {
      const dim = lupi(n)
      const { k, righe } = disponiFigure(dim, 328)
      expect(righe.flat()).toEqual(dim.map((_, i) => i))
      for (const riga of righe) {
        expect(riga.reduce((a, i) => a + dim[i].larghezza * k, 0)).toBeLessThanOrEqual(328 + 0.01)
      }
      expect(k).toBeLessThanOrEqual(PX_PER_UNITA_MAX)
    }
  })

  test('con molti lupi va a capo invece di rimpicciolire troppo; con pochi resta su una riga', () => {
    expect(disponiFigure(lupi(3), 328).righe).toHaveLength(1)
    const { k, righe } = disponiFigure(lupi(12), 328)
    expect(righe.length).toBeGreaterThan(1)
    expect(Math.max(...lupi(12).map((d) => d.altezza)) * k).toBeGreaterThanOrEqual(80)
  })

  test('Spilungone più alto del Nano alla stessa scala', () => {
    expect(dimensioniPersonaggio('spilungone').altezza).toBeGreaterThan(dimensioniPersonaggio('nano').altezza)
  })
})

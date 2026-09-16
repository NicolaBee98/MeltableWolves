import { ROLES } from './roles'
import { CONDIZIONI } from './conditions'

const FAZIONI_VALIDE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']

test('ROLES ha 51 ruoli con campi validi e slug unici', () => {
  expect(ROLES).toHaveLength(51)

  const slugs = new Set()
  for (const ruolo of ROLES) {
    expect(typeof ruolo.slug).toBe('string')
    expect(ruolo.slug.length).toBeGreaterThan(0)
    expect(slugs.has(ruolo.slug)).toBe(false)
    slugs.add(ruolo.slug)

    expect(typeof ruolo.nome).toBe('string')
    expect(ruolo.nome.length).toBeGreaterThan(0)
    expect(FAZIONI_VALIDE).toContain(ruolo.fazione)
    expect(typeof ruolo.notturno).toBe('boolean')
    expect(typeof ruolo.testoRegole).toBe('string')
    expect(ruolo.testoRegole.length).toBeGreaterThan(0)
  }
})

test('CONDIZIONI ha slug unici e campi validi', () => {
  const slugs = new Set()
  for (const condizione of CONDIZIONI) {
    expect(typeof condizione.slug).toBe('string')
    expect(slugs.has(condizione.slug)).toBe(false)
    slugs.add(condizione.slug)
    expect(typeof condizione.nome).toBe('string')
    expect(typeof condizione.descrizione).toBe('string')
  }
  expect(CONDIZIONI.length).toBeGreaterThanOrEqual(10)
})

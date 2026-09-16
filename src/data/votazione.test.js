import { risultatoVotazione } from './votazione'

test('nessun vincitore se tutti i voti sono a zero', () => {
  expect(risultatoVotazione({}, ['1', '2'])).toEqual({ vincitori: [], maxVoti: 0 })
})

test('un solo vincitore con il massimo dei voti', () => {
  expect(risultatoVotazione({ 1: 3, 2: 1 }, ['1', '2'])).toEqual({ vincitori: ['1'], maxVoti: 3 })
})

test('più vincitori in caso di parità', () => {
  expect(risultatoVotazione({ 1: 2, 2: 2, 3: 1 }, ['1', '2', '3'])).toEqual({ vincitori: ['1', '2'], maxVoti: 2 })
})

test('ignora candidati non presenti nella lista', () => {
  expect(risultatoVotazione({ 1: 5, 9: 100 }, ['1', '2'])).toEqual({ vincitori: ['1'], maxVoti: 5 })
})

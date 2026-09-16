import { render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('renders app heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /meltable wolves/i })).toBeInTheDocument()
})

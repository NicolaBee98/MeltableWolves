import { act, fireEvent } from '@testing-library/react'
import { DURATA_TIENI_MS } from '../components/PulsanteTieni'

// tiene premuto un PulsanteTieni fino al riempimento completo (timer finti,
// così i test non aspettano davvero)
export function tieni(bottone) {
  vi.useFakeTimers()
  try {
    fireEvent.pointerDown(bottone)
    act(() => {
      vi.advanceTimersByTime(DURATA_TIENI_MS + 100)
    })
  } finally {
    vi.useRealTimers()
  }
}

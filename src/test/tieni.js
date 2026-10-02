import { act, fireEvent } from '@testing-library/react'

// tiene premuto un PulsanteTieni fino al riempimento completo (timer finti,
// così i test non aspettano davvero 1,2 s)
export function tieni(bottone) {
  vi.useFakeTimers()
  try {
    fireEvent.pointerDown(bottone)
    act(() => {
      vi.advanceTimersByTime(1300)
    })
  } finally {
    vi.useRealTimers()
  }
}

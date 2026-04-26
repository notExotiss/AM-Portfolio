'use client'

import { useEffect, useState } from 'react'

const COMPACT_BREAKPOINT = 1024

export function useCompactLayout(breakpoint = COMPACT_BREAKPOINT) {
  const [state, setState] = useState({
    compactLayout: false,
    layoutReady: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const smallViewport = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const syncLayout = () => {
      const nextCompactLayout =
        window.innerWidth < breakpoint || coarsePointer.matches

      setState((current) => {
        if (
          current.compactLayout === nextCompactLayout &&
          current.layoutReady
        ) {
          return current
        }

        return {
          compactLayout: nextCompactLayout,
          layoutReady: true,
        }
      })
    }

    syncLayout()

    coarsePointer.addEventListener('change', syncLayout)
    smallViewport.addEventListener('change', syncLayout)
    window.addEventListener('resize', syncLayout, { passive: true })

    return () => {
      coarsePointer.removeEventListener('change', syncLayout)
      smallViewport.removeEventListener('change', syncLayout)
      window.removeEventListener('resize', syncLayout)
    }
  }, [breakpoint])

  return state
}

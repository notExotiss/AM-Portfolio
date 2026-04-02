import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useLayoutEffect, useEffect } from 'react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export { gsap, ScrollTrigger }

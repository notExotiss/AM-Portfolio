'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

type CursorMode = 'default' | 'interactive'

export default function InteractiveCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const trail1Ref = useRef<HTMLDivElement>(null)
  const trail2Ref = useRef<HTMLDivElement>(null)
  const trail3Ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<CursorMode>('default')
  const [isPressed, setIsPressed] = useState(false)

  const scale = useMemo(() => {
    if (mode === 'interactive') {
      return 2
    }

    return isPressed ? 0.84 : 1
  }, [isPressed, mode])

  useEffect(() => {
    const media =
      typeof window !== 'undefined'
        ? window.matchMedia('(pointer: fine)')
        : null

    const syncEnabled = () => setEnabled(Boolean(media?.matches))
    syncEnabled()
    media?.addEventListener('change', syncEnabled)

    return () => {
      media?.removeEventListener('change', syncEnabled)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !ringRef.current || !dotRef.current) {
      document.body.classList.remove('custom-cursor-enabled')
      return
    }

    document.body.classList.add('custom-cursor-enabled')

    const ring = ringRef.current
    const dot = dotRef.current
    const t1 = trail1Ref.current
    const t2 = trail2Ref.current
    const t3 = trail3Ref.current

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.16, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.16, ease: 'power3.out' })
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })

    /* trail quickTo — increasingly delayed */
    const t1X = t1 ? gsap.quickTo(t1, 'x', { duration: 0.28, ease: 'power3.out' }) : null
    const t1Y = t1 ? gsap.quickTo(t1, 'y', { duration: 0.28, ease: 'power3.out' }) : null
    const t2X = t2 ? gsap.quickTo(t2, 'x', { duration: 0.4, ease: 'power3.out' }) : null
    const t2Y = t2 ? gsap.quickTo(t2, 'y', { duration: 0.4, ease: 'power3.out' }) : null
    const t3X = t3 ? gsap.quickTo(t3, 'x', { duration: 0.55, ease: 'power3.out' }) : null
    const t3Y = t3 ? gsap.quickTo(t3, 'y', { duration: 0.55, ease: 'power3.out' }) : null

    const resolveMode = (target: EventTarget | null) => {
      const element = target instanceof HTMLElement ? target : null
      const interactive = element?.closest<HTMLElement>(
        '[data-cursor="hover"], a, button, [role="button"]'
      )
      setMode(interactive ? 'interactive' : 'default')
    }

    const handlePointerMove = (event: PointerEvent) => {
      ringX(event.clientX)
      ringY(event.clientY)
      dotX(event.clientX)
      dotY(event.clientY)
      t1X?.(event.clientX)
      t1Y?.(event.clientY)
      t2X?.(event.clientX)
      t2Y?.(event.clientY)
      t3X?.(event.clientX)
      t3Y?.(event.clientY)
    }

    const handlePointerDown = () => setIsPressed(true)
    const handlePointerUp = () => setIsPressed(false)
    const handlePointerOver = (event: PointerEvent) => resolveMode(event.target)
    const handlePointerOut = (event: PointerEvent) => resolveMode(event.relatedTarget)

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointerover', handlePointerOver)
    document.addEventListener('pointerout', handlePointerOut)

    return () => {
      document.body.classList.remove('custom-cursor-enabled')
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointerover', handlePointerOver)
      document.removeEventListener('pointerout', handlePointerOut)
    }
  }, [enabled])

  useEffect(() => {
    if (!ringRef.current || !dotRef.current) {
      return
    }

    gsap.to(ringRef.current, {
      scale,
      opacity: mode === 'interactive' ? 0.6 : 0.82,
      borderColor: mode === 'interactive' ? 'rgba(143,229,255,0.5)' : 'rgba(251,245,234,0.66)',
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)',
    })

    gsap.to(dotRef.current, {
      scale: isPressed ? 0.72 : 1,
      opacity: mode === 'interactive' ? 0.92 : 1,
      duration: 0.12,
      ease: 'power2.out',
    })

    /* trails fade during interactive mode */
    const trails = [trail1Ref.current, trail2Ref.current, trail3Ref.current]
    trails.forEach((t) => {
      if (!t) return
      gsap.to(t, {
        scale: mode === 'interactive' ? 1.8 : 1,
        opacity: mode === 'interactive' ? 0.15 : 0.25,
        duration: 0.3,
        ease: 'power2.out',
      })
    })
  }, [isPressed, mode, scale])

  if (!enabled) {
    return null
  }

  return (
    <>
      {/* Trail rings — ghost effect on fast movement */}
      <div
        ref={trail3Ref}
        aria-hidden="true"
        data-html2canvas-ignore="true"
        className="pointer-events-none fixed left-0 top-0 z-[101] h-5 w-5 rounded-full border border-[rgba(251,245,234,0.12)] mix-blend-difference will-change-transform"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={trail2Ref}
        aria-hidden="true"
        data-html2canvas-ignore="true"
        className="pointer-events-none fixed left-0 top-0 z-[102] h-4 w-4 rounded-full border border-[rgba(251,245,234,0.18)] mix-blend-difference will-change-transform"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={trail1Ref}
        aria-hidden="true"
        data-html2canvas-ignore="true"
        className="pointer-events-none fixed left-0 top-0 z-[103] h-5 w-5 rounded-full border border-[rgba(251,245,234,0.28)] mix-blend-difference will-change-transform"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      {/* Main ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        data-html2canvas-ignore="true"
        className="pointer-events-none fixed left-0 top-0 z-[104] h-7 w-7 rounded-full border border-[rgba(251,245,234,0.66)] mix-blend-difference will-change-transform"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        data-html2canvas-ignore="true"
        className="pointer-events-none fixed left-0 top-0 z-[105] h-[0.36rem] w-[0.36rem] rounded-full bg-[#fbf5ea] mix-blend-difference will-change-transform"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  )
}

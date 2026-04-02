'use client'

import React, { type MutableRefObject, useRef } from 'react'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

type Props = {
  enabled: boolean
  pointerRef?: MutableRefObject<{ x: number; y: number }>
  progressRef?: MutableRefObject<number>
}

export default function HeroObjectScene({ enabled, pointerRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerGlowRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !containerRef.current || !pointerRef) return

    const container = containerRef.current
    const innerGlow = innerGlowRef.current

    let rafId: number

    const tick = () => {
      const px = pointerRef.current.x
      const py = pointerRef.current.y

      /* shift the inner glow toward the pointer */
      const shiftX = (px - 0.5) * 30
      const shiftY = (py - 0.5) * 30

      if (innerGlow) {
        gsap.to(innerGlow, {
          x: shiftX,
          y: shiftY,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      /* tilt the whole container subtly */
      gsap.to(container, {
        rotateY: (px - 0.5) * 8,
        rotateX: -(py - 0.5) * 8,
        duration: 1,
        ease: 'power3.out',
        overwrite: 'auto',
      })

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafId)
  }, [enabled, pointerRef])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
    >
      {/* outer soft glow */}
      <div className="absolute inset-[15%] rounded-full bg-gradient-radial from-[var(--accent-cool)]/10 via-transparent to-transparent animate-[pulse-glow_4s_ease-in-out_infinite]" />

      {/* mid ring */}
      <div className="absolute inset-[22%] rounded-full border border-white/[0.06] animate-[pulse-glow_5s_ease-in-out_infinite_0.5s]" />

      {/* inner reactive glow */}
      <div
        ref={innerGlowRef}
        className="absolute inset-[30%] rounded-full will-change-transform"
        style={{
          background:
            'radial-gradient(circle at 40% 35%, rgba(143,229,255,0.2), transparent 50%), radial-gradient(circle at 65% 60%, rgba(255,138,91,0.15), transparent 50%)',
          filter: 'blur(20px)',
        }}
      />

      {/* center bright core */}
      <div
        className="absolute inset-[40%] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.12), transparent 60%)',
          filter: 'blur(8px)',
          animation: 'pulse-glow 3s ease-in-out infinite 1s',
        }}
      />
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import About from './about'
import AboutBackdrop from './about-backdrop'
import Hero from './hero'
import { useIsomorphicLayoutEffect } from '@/lib/gsap'

type HeroAboutTransitionProps = Readonly<{
  compactLayout?: boolean
  interactiveReady?: boolean
}>

export default function HeroAboutTransition({
  compactLayout = false,
  interactiveReady = false,
}: HeroAboutTransitionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const aboutWrapRef = useRef<HTMLDivElement>(null)
  const [compactRevealReady, setCompactRevealReady] = useState(!compactLayout)
  const [metrics, setMetrics] = useState({
    anchorTopPx: 0,
    overlapPx: 0,
    referenceHeightPx: 0,
  })

  useEffect(() => {
    setCompactRevealReady(!compactLayout)
  }, [compactLayout])

  useIsomorphicLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const aboutWrap = aboutWrapRef.current
    const heroSection = wrapper?.querySelector<HTMLElement>('#home')

    if (!wrapper || !aboutWrap || !heroSection) {
      return
    }

    const getOverlapPx = () => {
      if (compactLayout) {
        if (!compactRevealReady) {
          return 0
        }

        return Math.round(window.visualViewport?.height ?? window.innerHeight)
      }

      return Math.round(window.innerHeight)
    }

    const updateMetrics = () => {
      const overlapPx = getOverlapPx()
      const nextMetrics = {
        anchorTopPx: Math.max(0, heroSection.offsetHeight - overlapPx),
        overlapPx,
        referenceHeightPx: aboutWrap.offsetHeight,
      }

      setMetrics((current) => {
        if (
          current.anchorTopPx === nextMetrics.anchorTopPx &&
          current.overlapPx === nextMetrics.overlapPx &&
          current.referenceHeightPx === nextMetrics.referenceHeightPx
        ) {
          return current
        }

        return nextMetrics
      })
    }

    updateMetrics()

    const resizeObserver = new ResizeObserver(updateMetrics)
    const visualViewport = window.visualViewport

    resizeObserver.observe(wrapper)
    resizeObserver.observe(heroSection)
    resizeObserver.observe(aboutWrap)
    window.addEventListener('resize', updateMetrics)
    visualViewport?.addEventListener('resize', updateMetrics)
    visualViewport?.addEventListener('scroll', updateMetrics)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateMetrics)
      visualViewport?.removeEventListener('resize', updateMetrics)
      visualViewport?.removeEventListener('scroll', updateMetrics)
    }
  }, [compactLayout, compactRevealReady])

  return (
    <div ref={wrapperRef} className="relative isolate">
      {metrics.referenceHeightPx > 0 ? (
        <AboutBackdrop
          anchorTopPx={metrics.anchorTopPx}
          referenceHeightPx={metrics.referenceHeightPx}
        />
      ) : null}

      <div
        className={`relative z-20 ${
          compactLayout ? '' : 'pointer-events-none'
        }`}
      >
        <Hero
          compactLayout={compactLayout}
          interactiveReady={interactiveReady}
          onCompactRevealReady={
            compactLayout ? setCompactRevealReady : undefined
          }
          sharedBackdrop
        />
      </div>

      <div
        ref={aboutWrapRef}
        className="relative z-10"
        style={{
          marginTop: metrics.overlapPx ? `-${metrics.overlapPx}px` : undefined,
        }}
      >
        <About sharedBackdrop={metrics.overlapPx > 0} />
      </div>
    </div>
  )
}

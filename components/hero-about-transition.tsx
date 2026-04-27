'use client'

import { useRef, useState } from 'react'
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
  const [metrics, setMetrics] = useState({
    anchorTopPx: 0,
    overlapPx: 0,
    referenceHeightPx: 0,
  })

  useIsomorphicLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const aboutWrap = aboutWrapRef.current
    const heroSection = wrapper?.querySelector<HTMLElement>('#home')

    if (!wrapper || !aboutWrap || !heroSection) {
      return
    }

    const updateMetrics = () => {
      const overlapPx = Math.round(window.innerHeight)
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

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateMetrics)
      visualViewport?.removeEventListener('resize', updateMetrics)
    }
  }, [compactLayout])

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
        <Hero compactLayout={compactLayout} interactiveReady={interactiveReady} sharedBackdrop />
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

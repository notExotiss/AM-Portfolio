'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Contact from '@/components/contact'
import HeroAboutTransition from '@/components/hero-about-transition'
import InteractiveCursor from '@/components/interactive-cursor'
import Loading from '@/components/loading'
import Portfolio from '@/components/portfolio'
import { ResumeModal } from '@/components/resume-modal'
import { useCompactLayout } from '@/lib/use-compact-layout'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Aarit Malhotra',
  jobTitle: 'High School Developer',
  url: 'https://aaritmalhotra.vercel.app',
  sameAs: [
    'https://github.com/notExotiss',
    'https://www.linkedin.com/in/aarit-malhotra-b5198b171/',
    'http://instagram.com/aaritmalhotra09',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Edison',
    addressRegion: 'NJ',
    addressCountry: 'US',
  },
  knowsAbout: [
    'Full-stack development',
    'React',
    'Next.js',
    'TypeScript',
    'Frontend motion design',
    'Product UI',
  ],
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [loaderDone, setLoaderDone] = useState(false)
  const [heroInteractive, setHeroInteractive] = useState(false)
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const { compactLayout, layoutReady } = useCompactLayout()

  useEffect(() => {
    setHydrated(true)
    if (typeof globalThis !== 'undefined') {
      globalThis.history.scrollRestoration = 'manual'
      globalThis.scrollTo(0, 0)
    }

    const fontPromise =
      typeof document !== 'undefined' && 'fonts' in document
        ? document.fonts.ready
        : Promise.resolve()

    fontPromise.finally(() => {
      setFontsReady(true)
    })
  }, [])

  useEffect(() => {
    if (!loaderDone) {
      setHeroInteractive(false)
      return
    }

    const timeout = window.setTimeout(() => {
      setHeroInteractive(true)
    }, 220)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [loaderDone])

  useEffect(() => {
    const openResume = () => setResumeModalOpen(true)

    document.addEventListener(
      'open-resume',
      openResume as EventListenerOrEventListenerObject
    )

    return () => {
      document.removeEventListener(
        'open-resume',
        openResume as EventListenerOrEventListenerObject
      )
    }
  }, [])

  const readyForLoader = hydrated && fontsReady && layoutReady
  const showLoader = !loaderDone

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div data-page-capture="true">
        <div className="site-background" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <InteractiveCursor />

        <main
          className="relative overflow-x-clip"
          style={{
            opacity: hydrated ? 1 : 0,
            pointerEvents: loaderDone ? 'auto' : 'none',
          }}
        >
          <HeroAboutTransition
            interactiveReady={heroInteractive}
            compactLayout={compactLayout}
          />
          <Portfolio compactLayout={compactLayout} />
          <Contact />
        </main>
      </div>

      <AnimatePresence initial={false}>
        {showLoader ? (
          <Loading
            compactLayout={compactLayout}
            ready={readyForLoader}
            onComplete={() => setLoaderDone(true)}
          />
        ) : null}
      </AnimatePresence>

      <ResumeModal open={resumeModalOpen} onOpenChange={setResumeModalOpen} />
    </>
  )
}

'use client'

import { useRef } from 'react'
import { scrollToSection } from '@/lib/scroll-to-section'
import RollingText from './rolling-text'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-footer-reveal]',
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
          },
        }
      )
    }, footer)

    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden border-t border-white/8 px-6 py-6 sm:py-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_50%_0%,rgba(143,229,255,0.12),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/8" />
      <div className="pointer-events-none absolute left-[-18%] top-0 h-px w-[34%] bg-gradient-to-r from-transparent via-[rgba(143,229,255,0.75)] to-transparent opacity-60 animate-[project-sweep_14s_ease-in-out_infinite]" />

      <div className="section-frame relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          data-footer-reveal
          className="text-sm font-mono tracking-wide text-[#a9a191]"
        >
          &copy; {new Date().getFullYear()}{' '}
          <span className="group inline-flex" data-cursor="hover">
            <RollingText text="Aarit Malhotra" />
          </span>
        </p>

        <div
          data-footer-reveal
          className="flex items-center gap-5 text-sm text-[#a9a191]"
        >
          <span className="group inline-flex font-mono tracking-wide" data-cursor="hover">
            <RollingText text="Made in Edison, NJ" />
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <button
            type="button"
            data-cursor="hover"
            onClick={() => {
              scrollToSection('#home')
            }}
            className="group inline-flex font-mono tracking-wide hover:text-white transition-colors duration-300"
          >
            <RollingText text="Run it back" />
          </button>
        </div>
      </div>
    </footer>
  )
}

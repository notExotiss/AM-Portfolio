'use client'

import { useRef } from 'react'
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
      className="relative border-t border-white/10 py-10 px-6"
    >
      <div className="section-frame flex flex-col md:flex-row items-center justify-between gap-6">
        <p
          data-footer-reveal
          className="text-[#a9a191] text-sm font-mono tracking-wide"
        >
          &copy; {new Date().getFullYear()}{' '}
          <span className="group inline-flex" data-cursor="hover">
            <RollingText text="Aarit Malhotra" />
          </span>
        </p>

        <div
          data-footer-reveal
          className="flex items-center gap-6 text-[#a9a191] text-sm"
        >
          <span className="group inline-flex font-mono tracking-wide" data-cursor="hover">
            <RollingText text="Edison, NJ" />
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <a
            href="#home"
            data-cursor="hover"
            className="group inline-flex font-mono tracking-wide hover:text-white transition-colors duration-300"
          >
            <RollingText text="Back to top" />
          </a>
        </div>
      </div>
    </footer>
  )
}

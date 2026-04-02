'use client'

import { useRef, useCallback } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ArrowUpRight, Github, Instagram, Linkedin } from 'lucide-react'
import RollingText from './rolling-text'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

const socialLinks = [
  {
    href: 'https://github.com/notExotiss/',
    icon: Github,
    label: 'GitHub',
  },
  {
    href: 'https://www.linkedin.com/in/aarit-malhotra-b5198b171/',
    icon: Linkedin,
    label: 'LinkedIn',
  },
  {
    href: 'http://instagram.com/aaritmalhotra09',
    icon: Instagram,
    label: 'Instagram',
  },
]

/* floating accent particles for the contact bg */
const CONTACT_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  size: 2 + Math.random() * 3,
  duration: 10 + Math.random() * 15,
  delay: Math.random() * -10,
}))

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const socialRefs = useRef<(HTMLAnchorElement | null)[]>([])

  /* ── springy magnetic hover on social links ── */
  const handleMagnetic = useCallback(
    (e: ReactPointerEvent<HTMLAnchorElement>, idx: number) => {
      const el = socialRefs.current[idx]
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * 0.25
      const dy = (e.clientY - cy) * 0.25
      gsap.to(el, { x: dx, y: dy, scale: 1.08, duration: 0.4, ease: 'power3.out' })
    },
    []
  )

  const resetMagnetic = useCallback((idx: number) => {
    const el = socialRefs.current[idx]
    if (!el) return
    gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
  }, [])

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const ctx = gsap.context(() => {
      /* ── staggered reveal with bounce ── */
      gsap.fromTo(
        '[data-contact-reveal]',
        {
          y: 60,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.08,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: section,
            start: 'top 74%',
          },
        }
      )

      /* ── panel parallax ── */
      gsap.to('[data-contact-panel]', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      /* ── title parallax (Lando style) ── */
      gsap.to('[data-contact-title]', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      })

      /* ── floating particles ── */
      const particles = gsap.utils.toArray<HTMLElement>('[data-contact-particle]')
      particles.forEach((p: HTMLElement, i: number) => {
        gsap.to(p, {
          y: `random(-25, 25)`,
          x: `random(-15, 15)`,
          duration: 5 + i * 0.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.3,
        })
      })

      /* ── grid lines parallax ── */
      gsap.to('[data-contact-grid]', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="contact-stage relative overflow-hidden scroll-mt-28 pb-16 pt-22 sm:pb-20 sm:pt-24"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,12,0.16),rgba(6,8,12,0.02)_24%,rgba(6,8,12,0.54)),radial-gradient(circle_at_18%_22%,rgba(103,221,255,0.12),transparent_18%),radial-gradient(circle_at_82%_74%,rgba(255,138,91,0.14),transparent_24%)]" />
      <div data-contact-grid className="contact-grid-lines" aria-hidden="true" />

      {/* floating accent particles */}
      {CONTACT_PARTICLES.map((p) => (
        <div
          key={`contact-particle-${p.id}`}
          data-contact-particle
          className="absolute rounded-full pointer-events-none z-[1]"
          aria-hidden="true"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 2 === 0 ? 'var(--accent-cool)' : 'var(--accent-warm)',
            opacity: 0.2,
            filter: 'blur(1px)',
            animation: `float-soft-a ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      <div className="section-frame relative z-10">
        <div
          data-contact-panel
          className="cutout-stage border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,18,0.94),rgba(7,9,14,0.98))] px-6 py-8 sm:px-8 sm:py-10 xl:px-10"
          style={{
            clipPath:
              'polygon(0 0, calc(100% - 60px) 0, 100% 54px, 100% 100%, 0 100%)',
          }}
        >
          <div className="grid gap-10 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
            <div>
              <p
                data-contact-reveal
                className="eyebrow mb-5 text-[var(--accent-cool)]"
              >
                Contact
              </p>
              <h2
                data-contact-reveal
                data-contact-title
                className="max-w-[8ch] text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] tracking-[-0.07em] text-[#f7f2e8]"
              >
                Want to build something fun, useful, or both?
              </h2>
              <p
                data-contact-reveal
                className="mt-6 max-w-[39rem] text-base leading-relaxed text-[#ddd6ca] sm:text-lg"
              >
                If you want to talk about a project, competition idea, design
                pass, or something weird on the web, send me a message. I like
                building things that actually have some personality.
              </p>

              <div
                data-contact-reveal
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
              >
                <a
                  href="mailto:iamaaritmalhotra@gmail.com"
                  data-cursor="hover"
                  data-cursor-label="email"
                  className="interactive-hit group primary-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                >
                  <RollingText text="Email me" />
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </a>
                <button
                  type="button"
                  data-cursor="hover"
                  data-cursor-label="resume"
                  onClick={() => {
                    document.dispatchEvent(new CustomEvent('open-resume'))
                  }}
                  className="interactive-hit group ghost-button inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold"
                >
                  <RollingText text="Open resume" />
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div
                  data-contact-reveal
                  className="cutout-stage border border-white/10 bg-white/[0.035] px-5 py-5"
                  style={{
                    clipPath:
                      'polygon(0 0, calc(100% - 36px) 0, 100% 32px, 100% 100%, 0 100%)',
                  }}
                >
                  <p className="eyebrow mb-3 text-[var(--accent-warm)]">Email</p>
                  <a
                    href="mailto:iamaaritmalhotra@gmail.com"
                    data-cursor="hover"
                    data-cursor-label="write"
                    className="text-[1.08rem] leading-relaxed text-[#f7f2e8] hover:text-[var(--accent-cool)] transition-colors duration-300"
                  >
                    iamaaritmalhotra@gmail.com
                  </a>
                </div>

                <div
                  data-contact-reveal
                  className="cutout-stage border border-white/10 bg-white/[0.035] px-5 py-5"
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 34px), calc(100% - 44px) 100%, 0 100%)',
                  }}
                >
                  <p className="eyebrow mb-3 text-[var(--accent-gold)]">Based in</p>
                  <p className="text-[1.08rem] leading-relaxed text-[#f7f2e8]">
                    Edison, New Jersey
                  </p>
                </div>
              </div>

              <div
                data-contact-reveal
                className="cutout-stage border border-white/10 bg-white/[0.035] px-5 py-5"
                style={{
                  clipPath:
                    'polygon(0 0, calc(100% - 42px) 0, 100% 36px, 100% 100%, 0 100%)',
                }}
              >
                <p className="eyebrow mb-4 text-[var(--accent-cool)]">Elsewhere</p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, idx) => (
                    <a
                      key={social.label}
                      ref={(el) => { socialRefs.current[idx] = el }}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      data-cursor-label={social.label.toLowerCase()}
                      onPointerMove={(e) => handleMagnetic(e, idx)}
                      onPointerLeave={() => resetMagnetic(idx)}
                      className="interactive-hit group ghost-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[#ddd6ca] will-change-transform"
                    >
                      <social.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                      <RollingText text={social.label} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

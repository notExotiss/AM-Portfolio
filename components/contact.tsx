'use client'

import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Github, Instagram, Linkedin } from 'lucide-react'
import { scrollToSection } from '@/lib/scroll-to-section'
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

const CONTACT_PARTICLES = Array.from({ length: 12 }, (_, id) => ({
  id,
  x: 8 + ((id * 17) % 84),
  y: 12 + ((id * 19) % 70),
  size: 2 + ((id * 5) % 4),
  duration: 11 + id * 0.9,
  delay: id * -0.7,
}))

const contactRevealViewport = {
  once: true,
  amount: 0.22,
} as const

const contactRevealTransition = {
  duration: 0.85,
  ease: [0.22, 1, 0.36, 1] as const,
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const socialRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const handleMagnetic = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>, idx: number) => {
      const element = socialRefs.current[idx]

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (event.clientX - centerX) * 0.25
      const deltaY = (event.clientY - centerY) * 0.25

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        scale: 1.08,
        duration: 0.4,
        ease: 'power3.out',
      })
    },
    []
  )

  const resetMagnetic = useCallback((idx: number) => {
    const element = socialRefs.current[idx]

    if (!element) {
      return
    }

    gsap.to(element, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'elastic.out(1, 0.4)',
    })
  }, [])

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current

    if (!section) {
      return
    }

    const context = gsap.context(() => {
      const compactMotion = window.matchMedia(
        '(max-width: 1023px), (pointer: coarse)'
      ).matches

      if (!compactMotion) {
        gsap.to('[data-contact-shell]', {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.35,
          },
        })

        gsap.to('[data-contact-title-wrap]', {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.4,
          },
        })

        gsap.to('[data-contact-beam]', {
          xPercent: 10,
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.35,
          },
        })
      }

      const particles = gsap.utils.toArray<HTMLElement>(
        '[data-contact-particle]'
      )

      if (!compactMotion) {
        particles.forEach((particle, index) => {
          gsap.to(particle, {
            y: 'random(-25, 25)',
            x: 'random(-15, 15)',
            duration: 5 + index * 0.7,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.25,
          })
        })

        gsap.to('[data-contact-grid]', {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.35,
          },
        })
      }
    }, section)

    return () => {
      context.revert()
    }
  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="contact-stage relative overflow-hidden scroll-mt-28 pb-8 pt-16 sm:pb-10 sm:pt-20"
    >
      <div className="absolute inset-0 [mask-image:linear-gradient(180deg,transparent_0%,black_20%,black_100%)] bg-[linear-gradient(180deg,rgba(6,8,12,0),rgba(6,8,12,0.08)_12%,rgba(6,8,12,0.32)_34%,rgba(6,8,12,0.72)_62%,rgba(6,8,12,0.9)_100%),radial-gradient(circle_at_16%_34%,rgba(103,221,255,0.1),transparent_22%),radial-gradient(circle_at_84%_78%,rgba(255,138,91,0.12),transparent_24%)]" />
      <div
        data-contact-grid
        className="contact-grid-lines [mask-image:linear-gradient(180deg,transparent_0%,black_24%,black_100%)]"
        aria-hidden="true"
      />

      {CONTACT_PARTICLES.map((particle) => (
        <div
          key={`contact-particle-${particle.id}`}
          data-contact-particle
          className="pointer-events-none absolute z-[1] rounded-full"
          aria-hidden="true"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background:
              particle.id % 2 === 0
                ? 'var(--accent-cool)'
                : 'var(--accent-warm)',
            opacity: 0.2,
            filter: 'blur(1px)',
            animation: `float-soft-a ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}

      <div className="section-frame relative z-10">
        <div
          data-contact-shell
          className="cutout-stage relative border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,18,0.94),rgba(7,9,14,0.98))] shadow-[0_32px_90px_rgba(0,0,0,0.34)]"
          style={{
            clipPath:
              'polygon(0 0, calc(100% - 72px) 0, 100% 62px, 100% 100%, 0 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-70 bg-[linear-gradient(90deg,rgba(103,221,255,0.014),transparent_24%,transparent_74%,rgba(255,138,91,0.014))]" />
          <div
            data-contact-beam
            className="pointer-events-none absolute right-[-12%] top-[-3rem] h-56 w-[34rem] rotate-[-12deg] bg-[radial-gradient(circle_at_center,rgba(143,229,255,0.16),transparent_55%),linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] opacity-50 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative px-6 py-8 sm:px-8 sm:py-10 xl:px-12 xl:py-12">
            <div className="grid gap-12 xl:grid-cols-[minmax(0,1.18fr)_minmax(22rem,0.82fr)] xl:items-end xl:gap-16">
              <motion.div
                data-contact-title-wrap
                className="relative max-w-[58rem] xl:pb-2"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={contactRevealViewport}
                transition={contactRevealTransition}
              >
                <p className="eyebrow mb-5 text-[var(--accent-cool)]">Contact</p>

                <motion.h2
                  className="max-w-[10ch] text-[clamp(3.3rem,6.2vw,6.2rem)] leading-[0.9] tracking-[-0.078em] text-[#f7f2e8]"
                  initial={{ opacity: 0, y: 46 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={contactRevealViewport}
                  transition={{
                    ...contactRevealTransition,
                    duration: 1,
                    delay: 0.08,
                  }}
                >
                  Want to build something fun, useful, or both?
                </motion.h2>
              </motion.div>

              <motion.div
                className="max-w-[26rem] xl:justify-self-end xl:pb-3"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={contactRevealViewport}
                transition={{
                  ...contactRevealTransition,
                  delay: 0.12,
                }}
              >
                <p className="text-[1.04rem] leading-relaxed text-[#ddd6ca] sm:text-[1.15rem]">
                  If you want to talk about a project, competition idea, design
                  pass, or something weird on the web, send me a message. I like
                  building things that actually have some personality.
                </p>

                <motion.div
                  className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={contactRevealViewport}
                  transition={{
                    ...contactRevealTransition,
                    duration: 0.72,
                    delay: 0.2,
                  }}
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
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="mt-10 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
              initial={{ opacity: 0.2, scaleX: 0.72 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={contactRevealViewport}
              transition={{
                ...contactRevealTransition,
                duration: 0.7,
                delay: 0.14,
              }}
              style={{ transformOrigin: 'center' }}
            />

            <div className="mt-7 grid gap-6 border-y border-white/8 py-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(15rem,0.72fr)_minmax(0,1.08fr)] xl:gap-8">
              <motion.div
                className="xl:border-r xl:border-white/8 xl:pr-8"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={contactRevealViewport}
                transition={{
                  ...contactRevealTransition,
                  duration: 0.78,
                  delay: 0.08,
                }}
              >
                <p className="eyebrow mb-3 text-[var(--accent-cool)]">
                  Email
                </p>

                <a
                  href="mailto:iamaaritmalhotra@gmail.com"
                  data-cursor="hover"
                  data-cursor-label="write"
                  className="group inline-flex max-w-full items-center gap-3 text-[1.08rem] leading-relaxed text-[#f7f2e8] transition-colors duration-300 hover:text-[var(--accent-cool)]"
                >
                  <span className="break-all">iamaaritmalhotra@gmail.com</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </motion.div>

              <motion.div
                className="xl:border-r xl:border-white/8 xl:px-8"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={contactRevealViewport}
                transition={{
                  ...contactRevealTransition,
                  duration: 0.78,
                  delay: 0.14,
                }}
              >
                <p className="eyebrow mb-3 text-[var(--accent-gold)]">
                  Based in
                </p>

                <p className="text-[1.08rem] leading-relaxed text-[#f7f2e8]">
                  Edison, New Jersey
                </p>
              </motion.div>

              <motion.div
                className="xl:pl-8"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={contactRevealViewport}
                transition={{
                  ...contactRevealTransition,
                  duration: 0.78,
                  delay: 0.2,
                }}
              >
                <p className="eyebrow mb-4 text-[var(--accent-warm)]">
                  Elsewhere
                </p>

                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, idx) => (
                    <a
                      key={social.label}
                      ref={(element) => {
                        socialRefs.current[idx] = element
                      }}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      data-cursor-label={social.label.toLowerCase()}
                      onPointerMove={(event) => handleMagnetic(event, idx)}
                      onPointerLeave={() => resetMagnetic(idx)}
                      className="interactive-hit group ghost-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[#ddd6ca] will-change-transform"
                    >
                      <social.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                      <RollingText text={social.label} />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="mt-4 flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <motion.div
                className="text-sm font-mono tracking-wide text-[#a9a191]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={contactRevealViewport}
                transition={{
                  ...contactRevealTransition,
                  duration: 0.68,
                  delay: 0.08,
                }}
              >
                &copy; {new Date().getFullYear()}{' '}
                <span className="group inline-flex" data-cursor="hover">
                  <RollingText text="Aarit Malhotra" />
                </span>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-4 text-sm text-[#a9a191]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={contactRevealViewport}
                transition={{
                  ...contactRevealTransition,
                  duration: 0.68,
                  delay: 0.14,
                }}
              >
                <span
                  className="group inline-flex font-mono tracking-wide"
                  data-cursor="hover"
                >
                  <RollingText text="Edison, NJ" />
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => {
                    scrollToSection('#home')
                  }}
                  className="group inline-flex font-mono tracking-wide transition-colors duration-300 hover:text-white"
                >
                  <RollingText text="Back to top" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

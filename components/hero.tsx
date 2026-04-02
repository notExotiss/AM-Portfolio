'use client'

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ArrowRight, Download } from 'lucide-react'
import HeroObjectScene from './hero-object-scene'
import RollingText from './rolling-text'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

type PointerState = {
  x: number
  y: number
}

type Particle = {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  depth: number
  blur: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.45,
    duration: 12 + Math.random() * 20,
    delay: Math.random() * -20,
    depth: 0.2 + Math.random() * 0.8,
    blur: Math.random() > 0.7 ? 1 + Math.random() * 2 : 0,
  }))
}

export default function Hero({
  interactiveReady = false,
}: Readonly<{
  interactiveReady?: boolean
}>) {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const objectShellRef = useRef<HTMLDivElement>(null)
  const sweepOneRef = useRef<HTMLDivElement>(null)
  const sweepTwoRef = useRef<HTMLDivElement>(null)
  const titleOneRef = useRef<HTMLDivElement>(null)
  const titleTwoRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const btnPrimaryRef = useRef<HTMLAnchorElement>(null)
  const btnSecondaryRef = useRef<HTMLButtonElement>(null)
  const particleFieldRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<PointerState>({ x: 0.5, y: 0.48 })
  const progressRef = useRef(0)
  const quickSettersRef = useRef<{
    pointerX?: (value: number) => void
    pointerY?: (value: number) => void
    glowX?: (value: number) => void
    glowY?: (value: number) => void
  }>({})

  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(generateParticles(45))
  }, [])

  const handleMagnetic = useCallback(
    (e: ReactPointerEvent<HTMLElement>, ref: React.RefObject<HTMLElement | null>) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * 0.3
      const dy = (e.clientY - cy) * 0.3
      gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' })
    },
    []
  )

  const resetMagnetic = useCallback(
    (ref: React.RefObject<HTMLElement | null>) => {
      if (!ref.current) return
      gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    },
    []
  )

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const objectShell = objectShellRef.current

    if (!section || !copy || !objectShell) {
      return
    }

    quickSettersRef.current = {
      pointerX: gsap.quickTo(section, '--pointer-x', {
        duration: 0.42,
        ease: 'power3.out',
      }),
      pointerY: gsap.quickTo(section, '--pointer-y', {
        duration: 0.42,
        ease: 'power3.out',
      }),
      glowX: gsap.quickTo(section, '--glow-x', {
        duration: 0.68,
        ease: 'power3.out',
      }),
      glowY: gsap.quickTo(section, '--glow-y', {
        duration: 0.68,
        ease: 'power3.out',
      }),
    }

    const ctx = gsap.context(() => {
      const orbitItems = gsap.utils.toArray<HTMLElement>('[data-hero-orbit]')
      const bandItems = gsap.utils.toArray<HTMLElement>('[data-hero-band]')
      const routeItems = gsap.utils.toArray<SVGPathElement>('[data-hero-route-line]')
      const grid = gsap.utils.toArray<HTMLElement>('[data-hero-grid]')

      if (sweepOneRef.current) {
        gsap.to(sweepOneRef.current, {
          xPercent: 24,
          duration: 6.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      if (sweepTwoRef.current) {
        gsap.to(sweepTwoRef.current, {
          xPercent: -18,
          duration: 5.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      orbitItems.forEach((item, index) => {
        gsap.to(item, {
          rotate: index % 2 === 0 ? 360 : -360,
          transformOrigin: '50% 50%',
          duration: 40 + index * 9,
          ease: 'none',
          repeat: -1,
        })
      })

      bandItems.forEach((item, index) => {
        gsap.to(item, {
          xPercent: index % 2 === 0 ? 30 : -28,
          duration: 12 + index * 1.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })

      routeItems.forEach((item, index) => {
        gsap.fromTo(
          item,
          { strokeDashoffset: index % 2 === 0 ? 0 : -160 },
          {
            strokeDashoffset: index % 2 === 0 ? -160 : 0,
            duration: 11 + index * 2.5,
            ease: 'none',
            repeat: -1,
          }
        )
      })

      gsap.to(progressRef, {
        current: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      if (titleOneRef.current) {
        gsap.to(titleOneRef.current, {
          yPercent: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      }

      if (titleTwoRef.current) {
        gsap.to(titleTwoRef.current, {
          yPercent: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      }

      if (subtitleRef.current) {
        gsap.to(subtitleRef.current, {
          yPercent: 30,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '40% top',
            scrub: 0.8,
          },
        })
      }

      gsap.to('[data-hero-eyebrow]', {
        yPercent: -60,
        autoAlpha: 0,
        filter: 'blur(8px)',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '35% top',
          scrub: 0.5,
        },
      })

      gsap.to('[data-hero-buttons]', {
        yPercent: 80,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '30% top',
          scrub: 0.6,
        },
      })

      if (particleFieldRef.current) {
        gsap.to(particleFieldRef.current, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
      }

      gsap.to(objectShell, {
        yPercent: -35,
        scale: 0.85,
        rotate: 15,
        autoAlpha: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      gsap.to(grid, {
        yPercent: -18,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.to('[data-hero-backdrop]', {
        backgroundPositionY: '80%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  const updatePointer = (x: number, y: number) => {
    pointerRef.current = { x, y }
    quickSettersRef.current.pointerX?.(x * 100)
    quickSettersRef.current.pointerY?.(y * 100)
    quickSettersRef.current.glowX?.(36 + x * 28)
    quickSettersRef.current.glowY?.(30 + y * 24)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = sectionRef.current?.getBoundingClientRect()
    if (!bounds) {
      return
    }

    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    updatePointer(x, y)
  }

  const handlePointerLeave = () => {
    updatePointer(0.5, 0.48)
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="hero-scene relative min-h-[140svh] sm:min-h-[160svh] md:min-h-[180svh] scroll-mt-28"
      style={
        {
          ['--pointer-x' as string]: 50,
          ['--pointer-y' as string]: 48,
          ['--glow-x' as string]: 50,
          ['--glow-y' as string]: 42,
        } as CSSProperties
      }
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="hero-paper absolute inset-0" />
        <div data-hero-backdrop className="hero-scene-backdrop absolute inset-0" />
        <div className="hero-scene-topography absolute inset-0 opacity-40 mix-blend-overlay" />
        <div data-hero-grid className="hero-track-grid absolute inset-0 opacity-[0.25]" />

        <div
          className="absolute inset-0 pointer-events-none z-[3] opacity-60"
          style={{
            background:
              'radial-gradient(circle 600px at calc(var(--glow-x) * 1%) calc(var(--glow-y) * 1%), rgba(103,221,255,0.06), transparent)',
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none z-[3] opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 800px 500px at 75% 65%, rgba(255,138,91,0.05), transparent)',
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="h-[min(70vw,50rem)] w-[min(70vw,50rem)] rounded-full border border-dashed border-white/[0.04]"
            style={{ animation: 'spin 90s linear infinite' }}
          />
        </div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="h-[min(50vw,36rem)] w-[min(50vw,36rem)] rounded-full border border-white/[0.03]"
            style={{ animation: 'spin 120s linear infinite reverse' }}
          />
        </div>

        <div
          ref={particleFieldRef}
          className="absolute inset-0 pointer-events-none z-[5]"
          aria-hidden="true"
        >
          {particles.map((p) => {
            const colors = ['var(--accent-cool)', 'var(--accent-warm)', '#fbf5ea']
            return (
              <div
                key={`particle-${p.id}`}
                data-hero-particle
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: p.opacity,
                  background: colors[p.id % 3],
                  filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
                  animation: `float-soft-a ${p.duration}s ease-in-out ${p.delay}s infinite`,
                  willChange: 'transform',
                }}
              />
            )
          })}
        </div>

        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-[0.7]"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
        >
          <path
            data-hero-route-line
            d="M-220 176 C 74 54, 346 68, 612 172 S 1188 336, 1820 114"
            className="hero-route-line"
            fill="none"
            strokeDasharray="12 10"
            strokeLinecap="round"
            strokeWidth={1.15}
            stroke="rgba(143, 229, 255, 0.24)"
          />
          <path
            data-hero-route-line
            d="M-240 664 C 88 548, 402 728, 760 662 S 1264 512, 1820 642"
            className="hero-route-line"
            fill="none"
            strokeDasharray="12 10"
            strokeLinecap="round"
            strokeWidth={1.15}
            stroke="rgba(255, 138, 91, 0.22)"
          />
          <path
            data-hero-route-line
            d="M42 -84 C 212 124, 296 364, 238 986"
            className="hero-route-line"
            fill="none"
            strokeDasharray="12 10"
            strokeLinecap="round"
            strokeWidth={1.05}
            stroke="rgba(251, 245, 234, 0.12)"
          />
          <path
            data-hero-route-line
            d="M1542 -96 C 1376 116, 1280 372, 1348 988"
            className="hero-route-line"
            fill="none"
            strokeDasharray="12 10"
            strokeLinecap="round"
            strokeWidth={1.05}
            stroke="rgba(251, 245, 234, 0.12)"
          />
        </svg>

        <div
          ref={objectShellRef}
          className="hero-object-shell absolute left-1/2 top-[52%] z-10 h-[min(65vh,45rem)] w-[min(55rem,85vw)] -translate-x-1/2 -translate-y-1/2 mix-blend-screen opacity-90"
        >
          <div className="hero-object-core absolute inset-0 mix-blend-color-dodge" />
          <div
            data-hero-orbit
            className="hero-orbit-ring hero-orbit-ring--outer absolute inset-[2%]"
          />
          <div
            data-hero-orbit
            className="hero-orbit-ring hero-orbit-ring--inner absolute inset-[12%]"
          />
          <div
            ref={sweepOneRef}
            className="hero-sweep hero-sweep--warm absolute left-[-18%] top-[24%] h-[18%] w-[68%]"
          />
          <div
            ref={sweepTwoRef}
            className="hero-sweep hero-sweep--cool absolute right-[-15%] top-[56%] h-[16%] w-[62%]"
          />
          <div
            data-hero-band
            className="hero-band hero-band--top absolute left-[-10%] top-[15%] h-[8%] w-[62%]"
          />
          <div
            data-hero-band
            className="hero-band hero-band--bottom absolute right-[-10%] top-[72%] h-[7%] w-[58%]"
          />
          <HeroObjectScene
            enabled={interactiveReady}
            pointerRef={pointerRef}
            progressRef={progressRef}
          />
        </div>

        <div className="section-frame relative z-30 flex h-[100svh] items-center justify-center pointer-events-none">
          <div
            ref={copyRef}
            className="hero-copy flex w-full flex-col items-center justify-center text-center pointer-events-auto"
          >
            <div className="mb-6 flex w-full justify-center md:mb-10" data-hero-eyebrow>
              <p className="eyebrow hero-eyebrow font-medium tracking-[0.3em] text-white/50">
                Edison, NJ // High School Developer
              </p>
            </div>

            <div className="relative z-20 flex w-full flex-col items-center">
              <div ref={titleOneRef} className="flex w-full justify-center will-change-transform">
                <h1
                  className="font-display py-10 text-[clamp(4.5rem,12vw,13rem)] font-extrabold leading-[0.85] tracking-[-0.04em] text-white drop-shadow-2xl -my-10"
                  style={{ textShadow: '0 20px 80px rgba(0,0,0,0.8)' }}
                >
                  Hey!
                </h1>
              </div>
              <div ref={titleTwoRef} className="mt-1 flex w-full justify-center will-change-transform">
                <h1
                  className="font-display py-10 text-[clamp(2.5rem,8vw,9.5rem)] font-extrabold italic leading-[0.88] tracking-[-0.03em] text-white/90 drop-shadow-lg -my-10"
                  style={{ textShadow: '0 10px 40px rgba(0,0,0,0.6)' }}
                >
                  I&apos;m Aarit.
                </h1>
              </div>
            </div>

            <div ref={subtitleRef} className="mt-8 max-w-2xl px-4 will-change-transform md:mt-12">
              <p
                className="mx-auto text-base font-light leading-relaxed text-[#eee9dc]/70 sm:text-lg md:text-xl"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}
              >
                I love coding polished web experiences, exploring crazy ideas, and
                turning late-night experiments into reality.
              </p>
            </div>

            <div
              data-hero-fade
              data-hero-buttons
              className="relative z-40 mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row md:mt-14"
            >
              <a
                ref={btnPrimaryRef}
                href="#portfolio"
                data-cursor="hover"
                onPointerMove={(e) => handleMagnetic(e, btnPrimaryRef)}
                onPointerLeave={() => resetMagnetic(btnPrimaryRef)}
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-[0.95rem] font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-shadow duration-500 hover:shadow-[0_0_80px_rgba(255,255,255,0.35)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <RollingText text="View Selected Work" />
                <ArrowRight className="relative z-10 h-4 w-4 -rotate-45 transition-transform duration-500 will-change-transform group-hover:rotate-0" />
              </a>
              <button
                ref={btnSecondaryRef}
                type="button"
                data-cursor="hover"
                onPointerMove={(e) => handleMagnetic(e, btnSecondaryRef)}
                onPointerLeave={() => resetMagnetic(btnSecondaryRef)}
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('open-resume'))
                }}
                className="group relative inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[0.95rem] font-semibold text-white backdrop-blur-md transition-all duration-500 hover:border-white/40 hover:bg-white/10"
              >
                <RollingText text="Download Resume" />
                <Download className="relative z-10 h-4 w-4 transition-transform duration-500 will-change-transform group-hover:-translate-y-1 group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

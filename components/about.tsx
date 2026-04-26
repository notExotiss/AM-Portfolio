'use client'

import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import AboutFlowLines from './about-flow-lines'
import AboutSurface from './about-surface'
import RollingText from './rolling-text'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const skills = [
  'Python',
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'HTML',
  'CSS',
  'Tailwind',
  'Java',
  'Firebase',
  'Git',
  'Three.js',
]

export default function About({
  sharedBackdrop = false,
  sectionId = 'about',
  staticPreview = false,
}: Readonly<{
  sharedBackdrop?: boolean
  sectionId?: string
  staticPreview?: boolean
}>) {
  const sectionRef = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (staticPreview) {
      return
    }

    const section = sectionRef.current
    if (!section) {
      return
    }

    const ctx = gsap.context(() => {
      const revealItems = gsap.utils.toArray<HTMLElement>('[data-about-reveal]')
      const panels = gsap.utils.toArray<HTMLElement>('[data-about-panel]')
      const compactMotion = window.matchMedia(
        '(max-width: 1023px), (pointer: coarse)'
      ).matches

      gsap.fromTo(
        revealItems,
        {
          y: 60,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
          },
        }
      )

      panels.forEach((panel, index) => {
        gsap.fromTo(
          panel,
          {
            y: 80,
            autoAlpha: 0,
            rotate: index % 2 === 0 ? -2 : 2,
            scale: 0.95,
          },
          {
            y: 0,
            autoAlpha: 1,
            rotate: 0,
            scale: 1,
            duration: 1.2,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: panel,
              start: 'top 82%',
            },
          }
        )

        if (!compactMotion) {
          gsap.to(panel, {
            yPercent: index % 2 === 0 ? -4 : -8,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              fastScrollEnd: true,
              scrub: 0.42,
            },
          })
        }
      })

      if (!compactMotion) {
        gsap.to('[data-about-title]', {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.34,
          },
        })
      }

      if (!sharedBackdrop && !compactMotion) {
        const flowLines = gsap.utils.toArray<SVGPathElement>('[data-flow-line]')
        flowLines.forEach((line, index) => {
          const lineLength = line.getTotalLength()
          gsap.set(line, {
            strokeDasharray: lineLength,
            strokeDashoffset: lineLength,
          })
          gsap.to(line, {
            strokeDashoffset: 0,
            duration: 3 + index * 0.5,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 20%',
              fastScrollEnd: true,
              scrub: 0.55,
            },
          })
        })
      }

      const skillChips = gsap.utils.toArray<HTMLElement>('[data-skill-chip]')
      gsap.fromTo(
        skillChips,
        { y: 20, autoAlpha: 0, scale: 0.9 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: skillChips[0]?.parentElement,
            start: 'top 85%',
          },
        }
      )
    }, section)

    return () => {
      ctx.revert()
    }
  }, [sharedBackdrop, staticPreview])

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      aria-hidden={staticPreview || undefined}
      className={cn(
        'about-stage relative overflow-visible scroll-mt-28 pt-16 pb-24 sm:pt-20 sm:pb-28 lg:py-32',
        sharedBackdrop ? 'about-stage--shared' : 'paper-stage'
      )}
    >
      {!sharedBackdrop ? (
        <>
          <AboutSurface />
          <AboutFlowLines />
        </>
      ) : null}

      <div className="section-frame relative z-10">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="max-w-[34rem]">
            <h2
              data-about-reveal
              data-about-title
              className="section-title max-w-[7ch] text-[#101318]"
            >
              About me
            </h2>
            <p
              data-about-reveal
              className="mt-6 max-w-[26rem] text-base leading-relaxed text-[#101318]/66 sm:text-lg"
            >
              I like the part where code starts feeling like a real thing people
              can touch, move through, and remember.
            </p>

            <button
              type="button"
              data-about-reveal
              data-cursor="hover"
              data-cursor-label="resume"
              onClick={() => {
                document.dispatchEvent(new CustomEvent('open-resume'))
              }}
              className="interactive-hit group primary-button mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              <RollingText text="View Resume" />
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div
            data-about-panel
            className="about-panel about-panel--body cutout-stage border border-[#101318]/10 bg-[rgba(255,255,255,0.28)] p-6 sm:p-8 lg:p-10"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 60px) 0, 100% 48px, 100% 100%, 0 100%)',
            }}
          >
            <div className="grid gap-6 text-[1.02rem] leading-relaxed text-[#171a20]/88 sm:text-[1.12rem]">
              <p>
                Hey, I&apos;m a high school student who loves coding and building
                cool stuff. I&apos;m currently a sophomore at John P. Stevens High
                School, and when I&apos;m not in class, I&apos;m usually working on
                projects, competing in programming contests, or tinkering with
                new tech.
              </p>
              <p>
                I started coding with C a few years ago and got hooked pretty
                fast. Since then I&apos;ve been learning web development, working
                with React and Next.js, and building projects that solve real
                problems instead of just sitting in a repo.
              </p>
              <p>
                I&apos;m also co-founding the Woodrow Wilson Math Competition, and
                I built the platform that helps run it for 400+ students. When
                I&apos;m not coding, I&apos;m around robotics, math competitions,
                volleyball, running, and art. I like figuring things out and
                seeing something I built actually work.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <div
            data-about-panel
            className="about-panel about-panel--dark cutout-stage border border-[#101318]/10 bg-[#101318] p-6 text-[#f7f2e8] sm:p-8"
            style={{
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 54px), calc(100% - 72px) 100%, 0 100%)',
            }}
          >
            <p className="eyebrow mb-4 text-white/48">Education</p>
            <h3 className="text-[2.2rem] leading-[0.95] tracking-[-0.05em]">
              John P. Stevens High School
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/72 sm:text-base">
              Edison, NJ | Class of 2028
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#f7f2e8] sm:text-base">
              Unweighted GPA: 4.0
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/58 sm:text-base">
              Honors/AP: English 2-H, Pre-Calculus H, AP US History, AP Biology,
              AP Chemistry, AP CSP, AP CSA
            </p>
          </div>

          <div
            data-about-panel
            className="about-panel cutout-stage border border-[#101318]/12 bg-[rgba(255,255,255,0.62)] p-6 sm:p-8"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 48px) 0, 100% 40px, 100% 100%, 0 100%)',
            }}
          >
            <p className="mb-5 font-mono text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#101318]">
              My Tech Stack
            </p>

            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  data-skill-chip
                  className="group cursor-default rounded-full border border-[#101318]/14 bg-white/92 px-4 py-2 font-mono text-[0.74rem] uppercase tracking-[0.12em] text-[#101318] shadow-[0_6px_18px_rgba(16,19,24,0.25)] transition-all duration-300 hover:scale-110 hover:border-[#101318] hover:bg-[#101318] hover:text-white hover:shadow-[0_4px_20px_rgba(16,19,24,0.15)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

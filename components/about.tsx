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
  previewMode = false,
  disableEntryAnimations = false,
}: Readonly<{
  sharedBackdrop?: boolean
  sectionId?: string
  staticPreview?: boolean
  previewMode?: boolean
  disableEntryAnimations?: boolean
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
      const skillChips = gsap.utils.toArray<HTMLElement>('[data-skill-chip]')
      const compactMotion = window.matchMedia(
        '(max-width: 1023px), (pointer: coarse)'
      ).matches
      const entrylessMode =
        sharedBackdrop || compactMotion || disableEntryAnimations

      if (entrylessMode) {
        gsap.set(revealItems, {
          y: 0,
          autoAlpha: 1,
          clearProps: 'transform',
        })
        gsap.set(panels, {
          y: 0,
          autoAlpha: 1,
          rotate: 0,
          scale: 1,
          clearProps: 'transform',
        })
        gsap.set(skillChips, {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          clearProps: 'transform',
        })
        return
      }

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
  }, [disableEntryAnimations, sharedBackdrop, staticPreview])

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      aria-hidden={staticPreview || undefined}
      className={cn(
        'about-stage relative pt-16 sm:pt-20',
        previewMode
          ? 'h-full min-h-full overflow-hidden pb-0'
          : 'overflow-visible scroll-mt-28 pb-24 sm:pb-28 lg:py-32',
        sharedBackdrop ? 'about-stage--shared' : 'paper-stage',
        staticPreview && 'pointer-events-none select-none'
      )}
    >
      {!sharedBackdrop ? (
        <>
          <AboutSurface />
          <AboutFlowLines />
        </>
      ) : null}

      <div className="section-frame relative z-10">
        {previewMode ? (
          <div className="grid h-full min-h-full gap-6 pt-4 sm:pt-8">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="flex min-h-[11rem] items-end">
                <div className="h-24 w-[min(58vw,16rem)] rounded-[2.2rem] bg-[radial-gradient(circle_at_30%_30%,rgba(103,221,255,0.18),rgba(255,255,255,0.9)_68%,rgba(255,255,255,0.95))] opacity-90 shadow-[0_24px_80px_rgba(255,255,255,0.18)]" />
              </div>

              <div
                className="cutout-stage min-h-[15rem] border border-[#101318]/10 bg-[rgba(255,255,255,0.42)]"
                style={{
                  clipPath:
                    'polygon(0 0, calc(100% - 60px) 0, 100% 48px, 100% 100%, 0 100%)',
                }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
              <div
                className="cutout-stage min-h-[11rem] border border-[#101318]/10 bg-[#101318]"
                style={{
                  clipPath:
                    'polygon(0 0, 100% 0, 100% calc(100% - 54px), calc(100% - 72px) 100%, 0 100%)',
                }}
              />

              <div
                className="cutout-stage min-h-[11rem] border border-[#101318]/12 bg-[rgba(255,255,255,0.62)]"
                style={{
                  clipPath:
                    'polygon(0 0, calc(100% - 48px) 0, 100% 40px, 100% 100%, 0 100%)',
                }}
              />
            </div>
          </div>
        ) : (
          <>
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
                  Mostly I just like building stuff and seeing if it actually
                  works.
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
                    Hey, I&apos;m Aarit. I&apos;m a sophomore at John P.
                    Stevens, and I spend most of my time on code, math, and
                    robotics, plus whatever random project I&apos;ve talked
                    myself into that week.
                  </p>
                  <p>
                    I first got into tech back in elementary school, mostly
                    because I was hell bent on playing Minecraft on this
                    ancient Chromebook I had. It barely ran anything, so I
                    started digging around, ended up swapping it over to
                    Linux, and pretty much went down the rabbit hole from
                    there.
                  </p>
                  <p>
                    Now I build websites, mess around with robots, and write
                    a lot of code I&apos;ll probably rewrite next week. I also
                    co-founded the Woodrow Wilson Math Competition and built
                    the platform we use to run it for 400+ kids.
                  </p>
                  <p>
                    Outside of that I&apos;m usually tinkering with something
                    new, reading, or trying to figure out why my latest idea
                    isn&apos;t working yet.
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
          </>
        )}
      </div>
    </section>
  )
}

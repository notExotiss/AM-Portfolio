'use client'

import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import AboutSurface from './about-surface'
import AboutFlowLines from './about-flow-lines'
import RollingText from './rolling-text'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

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
  'Shadcn',
  'Three.js',
]

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const ctx = gsap.context(() => {
      const revealItems = gsap.utils.toArray<HTMLElement>('[data-about-reveal]')
      const panels = gsap.utils.toArray<HTMLElement>('[data-about-panel]')

      /* ── staggered reveal with back ease ── */
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

      /* ── bouncy panel pop-in ── */
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

        /* ── scroll-driven parallax on each panel ── */
        gsap.to(panel, {
          yPercent: index % 2 === 0 ? -6 : -12,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      })

      /* ── section title parallax (Lando Norris style) ── */
      gsap.to('[data-about-title]', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      })

      /* ── organic flowing lines (SVG paths) ── */
      const flowLines = gsap.utils.toArray<SVGPathElement>('[data-flow-line]')
      flowLines.forEach((line, i) => {
        const len = line.getTotalLength()
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(line, {
          strokeDashoffset: 0,
          duration: 3 + i * 0.5,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
          },
        })
      })

      /* ── Background lines are handled by <AboutFlowLines /> now ── */

      /* ── skill chip stagger reveal ── */
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
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="about-stage paper-stage relative overflow-hidden scroll-mt-28 py-28 sm:py-32"
    >
      <AboutSurface />
      <AboutFlowLines />

      <div className="section-frame relative z-10">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="max-w-[34rem]">
            <p
              data-about-reveal
              className="eyebrow mb-5 text-[#101318]/52"
            >
              Profile
            </p>
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

          {/* ── Skills Panel — static only ── */}
          <div
            data-about-panel
            className="about-panel cutout-stage border border-[#101318]/10 bg-[rgba(255,255,255,0.34)] p-6 sm:p-8"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 48px) 0, 100% 40px, 100% 100%, 0 100%)',
            }}
          >
            <p className="eyebrow mb-5 text-[#101318] font-bold">My Tech Stack</p>

            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  data-skill-chip
                  className="group rounded-full border border-[#101318]/10 bg-white/70 px-4 py-2 font-mono text-[0.74rem] uppercase tracking-[0.12em] text-[#101318] transition-all duration-300 hover:bg-[#101318] hover:text-white hover:border-[#101318] hover:scale-110 hover:shadow-[0_4px_20px_rgba(16,19,24,0.15)] cursor-default"
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

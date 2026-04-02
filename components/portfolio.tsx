'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Github, Play } from 'lucide-react'
import Image from 'next/image'
import RollingText from './rolling-text'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

type Project = {
  id: number
  number: string
  title: string
  category: string
  summary: string
  detail: string
  role: string
  tech: string[]
  accent: string
  glow: string
  images: { url: string; note: string }[]
  links: {
    website?: string
    github?: string
    youtube?: string
  }
}

const projects: Project[] = [
  {
    id: 1,
    number: '01',
    title: 'Woodrow Wilson Math Competition',
    category: 'Platform / Event Infrastructure',
    summary:
      "Built the public site and support workflow for Edison's district math competition.",
    detail:
      'This had to stay clear for students, parents, and volunteers at the same time, especially once registration, communication, and scoring all had to work together.',
    role: 'Design, frontend implementation, and operational tooling',
    tech: ['HTML', 'CSS', 'JavaScript', 'Excel'],
    accent: '#67ddff',
    glow: 'rgba(103,221,255,0.12)',
    images: [
      {
        url: '/project1-1.png',
        note: 'Homepage with competition information and registration.',
      },
      {
        url: '/project1-2.png',
        note: 'Scoring sheet and operational support workflow.',
      },
      {
        url: '/project1-3.jpg',
        note: 'In-person event with participants and volunteers.',
      },
    ],
    links: {
      website: 'https://wwmc.online/',
      github: 'https://github.com/notExotiss/WWMC',
    },
  },
  {
    id: 2,
    number: '02',
    title: 'A.M. Tutoring',
    category: 'Product / Dashboard System',
    summary:
      'Built a tutoring platform with student flows, admin tools, tests, and a more product-like visual system.',
    detail:
      'The interesting part was making sign-in, dashboards, testing, and admin tools all feel like one product instead of separate screens stitched together.',
    role: 'Product direction, frontend architecture, and UI systems',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    accent: '#ff8a5b',
    glow: 'rgba(255,138,91,0.12)',
    images: [
      {
        url: '/project2-1.png',
        note: 'Landing page and brand system for the tutoring platform.',
      },
      {
        url: '/project2-2.png',
        note: 'Admin surface for managing students and tutoring workflows.',
      },
      {
        url: '/project2-3.png',
        note: 'Test creation and scoring interface.',
      },
      {
        url: '/project2-4.png',
        note: 'Student dashboard with academic progress tracking.',
      },
      {
        url: '/project2-5.png',
        note: 'Test-taking flow with timing, scoring, and focus states.',
      },
    ],
    links: {
      website: 'https://am-tutoring.vercel.app/',
      github: 'https://github.com/notExotiss/am-tutoring',
    },
  },
  {
    id: 3,
    number: '03',
    title: 'AgriSense',
    category: 'Data-rich Dashboard',
    summary:
      'Built an agriculture dashboard around maps, field data, and planning tools.',
    detail:
      'AgriSense pushed me into denser information design. The hard part was turning sensor data, NDVI analysis, and planning tools into something that still felt readable.',
    role: 'Frontend implementation and information design',
    tech: ['React', 'Firebase', 'JavaScript', 'Satellite APIs', 'Arduino'],
    accent: '#ffd28f',
    glow: 'rgba(255,210,143,0.12)',
    images: [
      {
        url: '/project4-1.png',
        note: 'Dashboard for NDVI-based monitoring and field planning.',
      },
      {
        url: '/project4-2.png',
        note: 'Map and analysis workflow for plot-level review.',
      },
    ],
    links: {
      website: 'https://brightbite-81e92.web.app/dashboard',
      github: 'https://github.com/notExotiss/AgriSense',
      youtube: 'https://www.youtube.com/watch?v=kbmHF0GeT-0',
    },
  },
  {
    id: 4,
    number: '04',
    title: 'Back In Time',
    category: 'Game Design / Motion',
    summary:
      'Made a time-travel platformer prototype for FBLA with both 2D and 3D experiments.',
    detail:
      'This project taught me a lot about pacing, environment design, and the way motion changes how a mechanic feels before you even explain it.',
    role: 'Gameplay systems, environment design, and iteration',
    tech: ['C#', 'Unity', 'Aseprite', 'Photoshop'],
    accent: '#67ddff',
    glow: 'rgba(103,221,255,0.12)',
    images: [
      {
        url: '/project5-1.png',
        note: '2D gameplay environment and level flow.',
      },
      {
        url: '/project5-2.png',
        note: '3D gameplay experiment built around the same idea.',
      },
      {
        url: '/project5-3.png',
        note: 'Unity scene building and environment iteration.',
      },
      {
        url: '/project5-4.png',
        note: 'Code and production workflow behind the prototype.',
      },
    ],
    links: {
      website: 'https://fblabit.itch.io/backintime',
    },
  },
]

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-3">
      {project.links.github ? (
        <a
          href={project.links.github}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          data-cursor-label="github"
          className="interactive-hit group ghost-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
        >
          <Github className="h-4 w-4" />
          <RollingText text="GitHub" />
        </a>
      ) : null}
      {project.links.website ? (
        <a
          href={project.links.website}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          data-cursor-label="visit"
          className="interactive-hit group primary-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
        >
          <ArrowUpRight className="h-4 w-4" />
          <RollingText text="Visit project" />
        </a>
      ) : null}
      {project.links.youtube ? (
        <a
          href={project.links.youtube}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          data-cursor-label="demo"
          className="interactive-hit group ghost-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
        >
          <Play className="h-4 w-4" />
          <RollingText text="Demo" />
        </a>
      ) : null}
    </div>
  )
}

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepRefs = useRef<Array<HTMLElement | null>>([])
  const stageRef = useRef<HTMLDivElement>(null)
  const stageMetaRef = useRef<HTMLDivElement>(null)

  const [selectedId, setSelectedId] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? projects[0],
    [selectedId]
  )

  const activeImage =
    selectedProject.images[
      Math.min(selectedImageIndex, selectedProject.images.length - 1)
    ]

  useEffect(() => {
    setSelectedImageIndex(0)
  }, [selectedId])

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const nodes = stepRefs.current.filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    )

    if (!section || !stage || !nodes.length) {
      return
    }

    const ctx = gsap.context(() => {
      /* ── bouncy heading reveal ── */
      gsap.fromTo(
        '[data-work-heading]',
        {
          y: 60,
          autoAlpha: 0,
          scale: 0.95,
        },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: section,
            start: 'top 74%',
          },
        }
      )

      /* ── stage parallax ── */
      gsap.to(stage, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      /* ── project panels — bounce in with rotation + parallax ── */
      nodes.forEach((node, index) => {
        const projectId = projects[index]?.id
        const panel = node.querySelector<HTMLElement>('[data-project-panel]')

        if (projectId) {
          gsap.timeline({
            scrollTrigger: {
              trigger: node,
              start: 'top center+=8%',
              end: 'bottom center',
              onEnter: () => setSelectedId(projectId),
              onEnterBack: () => setSelectedId(projectId),
            },
          })
        }

        if (panel) {
          gsap.fromTo(
            panel,
            {
              y: 70,
              autoAlpha: 0,
              rotate: index % 2 === 0 ? -1.5 : 1.5,
              scale: 0.96,
            },
            {
              y: 0,
              autoAlpha: 1,
              rotate: 0,
              scale: 1,
              duration: 1.1,
              ease: 'back.out(1.6)',
              scrollTrigger: {
                trigger: node,
                start: 'top 80%',
              },
            }
          )

          /* scroll-driven parallax per panel */
          gsap.to(panel, {
            yPercent: index % 2 === 0 ? -5 : -9,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          })
        }

        /* ── tech chip stagger per project ── */
        const chips = node.querySelectorAll<HTMLElement>('[data-tech-chip]')
        if (chips.length) {
          gsap.fromTo(
            chips,
            { y: 14, autoAlpha: 0, scale: 0.9 },
            {
              y: 0,
              autoAlpha: 1,
              scale: 1,
              duration: 0.5,
              stagger: 0.04,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: node,
                start: 'top 75%',
              },
            }
          )
        }
      })

      /* ── floating background particles ── */
      const bgParticles = gsap.utils.toArray<HTMLElement>('[data-portfolio-particle]')
      bgParticles.forEach((el, i) => {
        gsap.to(el, {
          y: `random(-30, 30)`,
          x: `random(-15, 15)`,
          duration: 6 + i * 0.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.5,
        })
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (selectedProject.images.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setSelectedImageIndex((current) => (current + 1) % selectedProject.images.length)
    }, 2500)

    return () => window.clearInterval(interval)
  }, [selectedProject])

  useEffect(() => {
    if (stageRef.current) {
      gsap.fromTo(
        stageRef.current,
        {
          scale: 0.985,
          y: 18,
        },
        {
          scale: 1,
          y: 0,
          duration: 0.42,
          ease: 'power3.out',
        }
      )
    }

    if (stageMetaRef.current) {
      gsap.fromTo(
        stageMetaRef.current.querySelectorAll('[data-stage-meta]'),
        {
          y: 16,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.44,
          stagger: 0.04,
          ease: 'power3.out',
        }
      )
    }
  }, [selectedId, selectedImageIndex])

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="relative overflow-x-clip scroll-mt-28 pb-20 pt-20 sm:pb-24"
    >
      <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(5,7,13,0.96),rgba(5,7,13,0.5),transparent)]" />
      <div className="absolute inset-y-0 left-[4%] w-[26%] bg-[radial-gradient(circle_at_24%_22%,rgba(103,221,255,0.08),transparent_26%)]" />
      <div className="absolute inset-y-0 right-[2%] w-[32%] bg-[radial-gradient(circle_at_72%_22%,rgba(255,138,91,0.08),transparent_26%)]" />

      {/* Floating background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => {
          // Psycho-pseudo random without hydration mismatch
          const width = 2 + ((i * 13) % 4)
          const left = 8 + ((i * 27) % 84)
          const top = 5 + ((i * 41) % 90)
          const isBlurred = (i * 17) % 10 > 6
          
          return (
            <div
              key={`port-particle-${i}`}
              data-portfolio-particle
              className="absolute rounded-full"
              style={{
                width: `${width}px`,
                height: `${width}px`,
                left: `${left}%`,
                top: `${top}%`,
                background: i % 3 === 0 ? 'rgba(103,221,255,0.15)' : i % 3 === 1 ? 'rgba(255,138,91,0.12)' : 'rgba(255,255,255,0.08)',
                filter: `blur(${isBlurred ? 1 : 0}px)`,
              }}
            />
          )
        })}
      </div>

      <div className="section-frame relative z-10">
        <div className="scene-divider pb-8">
          <p
            data-work-heading
            className="eyebrow mb-4 text-[var(--accent-cool)]"
          >
            Selected Work
          </p>
          <h2 className="text-[clamp(3rem,6vw,6.2rem)] leading-[0.92] tracking-[-0.065em] text-[#f7f2e8]">
            <span data-work-heading className="inline-block">
              Portfolio
            </span>
          </h2>
        </div>
      </div>

      <div className="section-frame relative z-10 mt-8 grid items-start gap-12 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="lg:sticky lg:top-28 lg:self-start lg:h-[calc(100vh-8rem)]">
          <div ref={stageRef} className="flex h-full flex-col justify-start pt-2 lg:pr-6">
            <div className="project-stage relative aspect-[1.18] overflow-hidden rounded-[2.3rem]">
              <div className="project-stage-sweep" aria-hidden="true" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${selectedProject.id}-${activeImage.url}`}
                  className="absolute inset-0 project-stage-frame"
                  initial={{ opacity: 0, y: 22, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 1.015 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,19,0.98),rgba(7,10,16,0.98))]" />
                  <Image
                    src={activeImage.url}
                    alt={activeImage.note}
                    fill
                    priority={selectedProject.id === projects[0].id && selectedImageIndex === 0}
                    sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 40vw, (min-width: 768px) 88vw, 100vw"
                    className="object-contain p-4 sm:p-5"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-x-6 bottom-5 h-1 rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${((selectedImageIndex + 1) / selectedProject.images.length) * 100}%`,
                    background: selectedProject.accent,
                  }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div
              ref={stageMetaRef}
              className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start"
            >
              <div className="space-y-4">
                <p
                  data-stage-meta
                  className="text-sm leading-relaxed text-[#d7d0c4] sm:text-base"
                >
                  {activeImage.note}
                </p>
                <p
                  data-stage-meta
                  className="font-mono text-[0.76rem] uppercase tracking-[0.18em]"
                  style={{ color: selectedProject.accent }}
                >
                  {selectedProject.role}
                </p>
                <div data-stage-meta className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((item) => (
                    <span
                      key={`${selectedProject.id}-${item}`}
                      data-tech-chip
                      className="skill-chip rounded-full px-3 py-1.5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div data-stage-meta>
                  <ProjectLinks project={selectedProject} />
                </div>
              </div>

              <div data-stage-meta className="lg:max-w-[12rem]">
                <p className="eyebrow mb-3 text-[#d0d9e5]">Frames</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.images.map((image, index) => (
                    <button
                      key={`${selectedProject.id}-${image.url}-${index}`}
                      type="button"
                      data-cursor="hover"
                      data-cursor-label={`${index + 1}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        index === selectedImageIndex
                          ? 'text-[#0d1116]'
                          : 'border border-white/12 text-[#d0c9be] hover:border-white/24 hover:text-[#f2ede4]'
                      }`}
                      style={
                        index === selectedImageIndex
                          ? { backgroundColor: selectedProject.accent }
                          : undefined
                      }
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {projects.map((project, index) => {
            const isSelected = selectedProject.id === project.id

            return (
              <article
                key={project.id}
                ref={(node) => {
                  stepRefs.current[index] = node
                }}
                data-project-id={project.id}
                className="scene-rule flex min-h-[88vh] items-center pb-12 pt-12 last:pb-0"
                onMouseEnter={() => setSelectedId(project.id)}
                onFocusCapture={() => setSelectedId(project.id)}
              >
                <button
                  type="button"
                  data-cursor="hover"
                  data-cursor-label={project.number}
                  onClick={() => {
                    const target = stepRefs.current[index]
                    if (target) {
                      target.scrollIntoView({
                        block: 'center',
                        inline: 'nearest',
                      })
                    }
                    setSelectedId(project.id)
                  }}
                  className="group block w-full text-left"
                >
                  <div
                    data-project-panel
                    className={`cutout-stage relative overflow-hidden border px-6 py-7 transition-colors sm:px-8 sm:py-8 ${
                      isSelected
                        ? 'border-white/16 bg-white/[0.045]'
                        : 'border-white/8 bg-white/[0.015]'
                    }`}
                    style={{
                      clipPath:
                        index % 2 === 0
                          ? 'polygon(0 0, calc(100% - 46px) 0, 100% 44px, 100% 100%, 0 100%)'
                          : 'polygon(0 0, 100% 0, 100% calc(100% - 44px), calc(100% - 56px) 100%, 0 100%)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-y-5 left-0 w-[4px] rounded-full"
                      animate={{
                        opacity: isSelected ? 1 : 0,
                        scaleY: isSelected ? 1 : 0.24,
                      }}
                      style={{ backgroundColor: project.accent }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    />
                    <div className="grid gap-6 xl:grid-cols-[auto_1fr_auto] xl:items-start">
                      <span
                        className="font-mono text-[1.4rem] leading-none tracking-[0.14em]"
                        style={{
                          color: isSelected ? project.accent : 'rgba(255,255,255,0.28)',
                        }}
                      >
                        {project.number}
                      </span>

                      <div>
                        <p
                          className="mb-3 text-[0.72rem] uppercase tracking-[0.28em]"
                          style={{ color: isSelected ? project.accent : '#8da1bb' }}
                        >
                          {project.category}
                        </p>
                        <motion.h3
                          className={`max-w-[13ch] text-[clamp(2.8rem,5vw,5rem)] leading-[0.92] tracking-[-0.065em] transition-colors duration-200 ${
                            isSelected ? 'text-[#f2ede4]' : 'text-white/42'
                          }`}
                          animate={{ x: isSelected ? 22 : 0 }}
                          transition={{ duration: 0.28, ease: 'easeOut' }}
                        >
                          {project.title}
                        </motion.h3>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#ddd6cb] transition-colors duration-200 group-hover:text-[#f0e8dc] sm:text-lg">
                          {project.summary}
                        </p>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                          {project.detail}
                        </p>
                        <p className="mt-5 font-mono text-[0.76rem] uppercase tracking-[0.18em] text-[#bcb4a9]">
                          {project.tech.join(' / ')}
                        </p>
                      </div>

                      <motion.div
                        className="hidden xl:flex"
                        animate={{ x: isSelected ? 0 : -8, opacity: isSelected ? 1 : 0.46 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-full border"
                          style={{
                            borderColor: isSelected
                              ? project.accent
                              : 'rgba(255,255,255,0.12)',
                            color: isSelected ? project.accent : 'rgba(255,255,255,0.42)',
                          }}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </button>
              </article>
            )
          })}
        </div>
      </div>

      <div className="section-frame mt-16 grid gap-6 xl:hidden">
        {projects.map((project, index) => (
          <motion.article
            key={project.id}
            className="scene-rule pb-8"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.42, delay: index * 0.05 }}
          >
            <div
              className="project-stage relative aspect-[1.42] overflow-hidden rounded-[1.8rem]"
              style={{
                background: `radial-gradient(circle_at_78%_18%, ${project.glow}, transparent 24%), linear-gradient(180deg, #090b0e, #0d1116)`,
              }}
            >
              <Image
                src={project.images[0].url}
                alt={project.images[0].note}
                fill
                sizes="(max-width: 1279px) 100vw, 0px"
                priority={index === 0}
                className="object-contain p-3"
              />
            </div>

            <div className="mt-5 flex items-start justify-between gap-3">
              <div>
                <p
                  className="mb-2 text-[0.72rem] uppercase tracking-[0.28em]"
                  style={{ color: project.accent }}
                >
                  {project.category}
                </p>
                <h3 className="max-w-[12ch] text-[2.45rem] leading-[0.95] tracking-[-0.06em] text-[#f2ede4]">
                  {project.title}
                </h3>
              </div>
              <span className="font-mono text-[1.1rem] tracking-[0.18em] text-white/28">
                {project.number}
              </span>
            </div>

            <p className="mt-4 text-base leading-relaxed text-[#ddd6cb]">
              {project.summary}
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {project.detail}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#d7d0c4]">
              {project.images[0].note}
            </p>
            <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#bcb4a9]">
              {project.tech.join(' / ')}
            </p>
            <div className="mt-5">
              <ProjectLinks project={project} />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

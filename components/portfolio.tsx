'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Github, Play } from 'lucide-react'
import Image from 'next/image'
import RollingText from './rolling-text'
import { ScrollTrigger, gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

const portfolioRevealViewport = {
  once: true,
  amount: 0.2,
} as const

const portfolioRevealTransition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1] as const,
}

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
    category: 'Competition Platform',
    summary:
      "Built the public site and support workflow for Edison's district math competition.",
    detail:
      'I designed it so students, parents, and volunteers could all find what they needed quickly, even once registration and scoring were in the mix.',
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
    category: 'Tutoring Platform',
    summary:
      'Built a tutoring platform with sign-in, testing, dashboards, and admin tools.',
    detail:
      'The challenge was making the student and admin flows feel like one product instead of a pile of separate tools.',
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
    category: 'Agriculture Dashboard',
    summary:
      'Built an agriculture dashboard for field maps, NDVI analysis, and planning.',
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
    category: 'Platformer Prototype',
    summary:
      'Built a time-travel platformer prototype for FBLA in both 2D and 3D.',
    detail:
      'I used it to explore pacing, level feel, and how motion changes the way a mechanic reads before you explain it.',
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

function ProjectLinks({
  project,
  iconOnly = false,
  compact = false,
  className = '',
}: {
  project: Project
  iconOnly?: boolean
  compact?: boolean
  className?: string
}) {
  const items = [
    project.links.github
      ? {
          href: project.links.github,
          label: 'GitHub',
          cursor: 'github',
          icon: <Github className="h-4 w-4" />,
        }
      : null,
    project.links.website
      ? {
          href: project.links.website,
          label: 'Visit site',
          cursor: 'visit',
          icon: <ArrowUpRight className="h-4 w-4" />,
        }
      : null,
    project.links.youtube
      ? {
          href: project.links.youtube,
          label: 'Demo',
          cursor: 'demo',
          icon: <Play className="h-4 w-4" />,
        }
      : null,
  ].filter(
    (
      item
    ): item is { href: string; label: string; cursor: string; icon: JSX.Element } =>
      item !== null
  )

  return (
    <div
      className={
        iconOnly
          ? `flex flex-wrap items-center gap-2 ${className}`.trim()
          : `flex flex-wrap gap-3 ${className}`.trim()
      }
    >
      {items.map((item) =>
        iconOnly ? (
          <a
            key={`${project.id}-${item.label}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            title={item.label}
            data-cursor="hover"
            data-cursor-label={item.cursor}
            className="interactive-hit inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#090d13]/88 text-[#f2ede4] transition-colors hover:border-white/24 hover:bg-white/[0.08]"
          >
            {item.icon}
          </a>
        ) : (
          <a
            key={`${project.id}-${item.label}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            data-cursor-label={item.cursor}
            className={
              compact
                ? 'interactive-hit group inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#090d13]/88 px-3 py-2 text-xs font-medium text-[#f2ede4] transition-colors hover:border-white/24 hover:bg-white/[0.08]'
                : `interactive-hit group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm ${
                    item.label === 'Visit site'
                      ? 'primary-button font-semibold'
                      : 'ghost-button font-medium'
                  }`
            }
          >
            {item.icon}
            <RollingText text={item.label} />
          </a>
        )
      )}
    </div>
  )
}

function ProjectFrameSelector({
  project,
  selectedImageIndex,
  onSelect,
  interactive = true,
  compact = false,
  className = '',
}: {
  project: Project
  selectedImageIndex: number
  onSelect: (index: number) => void
  interactive?: boolean
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={`flex flex-wrap items-center ${
        compact ? 'justify-end gap-2' : 'gap-2'
      } ${className}`.trim()}
    >
        {project.images.map((image, index) => (
          interactive ? (
            <button
              key={`${project.id}-${image.url}-${index}`}
              type="button"
              aria-label={`Show frame ${index + 1}`}
              title={`Frame ${index + 1}`}
              data-cursor="hover"
              data-cursor-label={`${index + 1}`}
              onClick={() => onSelect(index)}
              className={`flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                compact ? 'h-9 w-9' : 'h-10 w-10'
              } ${
                index === selectedImageIndex
                  ? 'text-[#0d1116]'
                  : 'border border-white/12 text-[#d0c9be] hover:border-white/24 hover:text-[#f2ede4]'
              }`}
              style={
                index === selectedImageIndex
                  ? { backgroundColor: project.accent }
                  : undefined
              }
            >
              {index + 1}
            </button>
          ) : (
            <span
              key={`${project.id}-${image.url}-${index}`}
              aria-hidden="true"
              className={`flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                compact ? 'h-9 w-9' : 'h-10 w-10'
              } ${
                index === selectedImageIndex
                  ? 'text-[#0d1116]'
                  : 'border border-white/12 text-[#d0c9be]'
              }`}
              style={
                index === selectedImageIndex
                  ? { backgroundColor: project.accent }
                  : undefined
              }
            >
              {index + 1}
            </span>
          )
        ))}
    </div>
  )
}

export default function Portfolio({
  compactLayout = false,
}: Readonly<{
  compactLayout?: boolean
}>) {
  const sectionRef = useRef<HTMLElement>(null)
  const stepRefs = useRef<Array<HTMLElement | null>>([])
  const stageWrapperRef = useRef<HTMLDivElement>(null)

  const [selectedId, setSelectedId] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [desktopStageWidth, setDesktopStageWidth] = useState<number | null>(null)

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

  useEffect(() => {
    const stageWrapper = stageWrapperRef.current

    if (!stageWrapper || compactLayout) {
      setDesktopStageWidth(null)
      return
    }

    const aspectRatio = 1.18

    const updateLayout = () => {
      if (compactLayout || window.innerWidth < 1024) {
        setDesktopStageWidth(null)
        return
      }

      const wrapperWidth = stageWrapper.getBoundingClientRect().width
      const targetStageHeight = Math.max(
        460,
        Math.min(525, window.innerHeight - 170)
      )
      const targetStageWidth = Math.min(
        wrapperWidth,
        targetStageHeight * aspectRatio,
        620
      )

      setDesktopStageWidth(targetStageWidth)
    }

    updateLayout()

    const observer = new ResizeObserver(() => {
      updateLayout()
    })

    observer.observe(stageWrapper)
    window.addEventListener('resize', updateLayout)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateLayout)
    }
  }, [compactLayout])

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current
    const nodes = stepRefs.current.filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    )

    if (!section || !nodes.length || compactLayout) {
      return
    }

    const ctx = gsap.context(() => {
      const syncSelectedFromScroll = () => {
        const anchor = window.innerHeight * 0.48
        let nextId = projects[0]?.id ?? 1
        let minDistance = Number.POSITIVE_INFINITY

        nodes.forEach((node, index) => {
          const rect = node.getBoundingClientRect()
          const projectId = projects[index]?.id

          if (!projectId || rect.bottom <= 0 || rect.top >= window.innerHeight) {
            return
          }

          const center = rect.top + rect.height / 2
          const distance = Math.abs(center - anchor)

          if (distance < minDistance) {
            minDistance = distance
            nextId = projectId
          }
        })

        setSelectedId((current) => (current === nextId ? current : nextId))
      }

      const activeProjectTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: syncSelectedFromScroll,
        onRefresh: syncSelectedFromScroll,
      })

      syncSelectedFromScroll()
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

      /* ── project panels — bounce in with rotation + parallax ── */
      nodes.forEach((node) => {

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
  }, [compactLayout])

  useEffect(() => {
    if (compactLayout || selectedProject.images.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setSelectedImageIndex((current) => (current + 1) % selectedProject.images.length)
    }, 2500)

    return () => window.clearInterval(interval)
  }, [compactLayout, selectedProject])

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="relative overflow-x-clip scroll-mt-28 pb-10 pt-16 sm:pb-14 sm:pt-18"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.96),rgba(5,7,13,0.8)_10%,rgba(5,7,13,0.38)_30%,transparent_52%),radial-gradient(circle_at_16%_18%,rgba(103,221,255,0.08),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(255,138,91,0.07),transparent_26%),radial-gradient(circle_at_50%_72%,rgba(255,255,255,0.03),transparent_30%)]" />
      <div className="absolute inset-0 opacity-70 [mask-image:linear-gradient(180deg,black_0%,black_72%,transparent_100%)] bg-[linear-gradient(90deg,rgba(103,221,255,0.012),transparent_18%,transparent_78%,rgba(255,138,91,0.012))]" />

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
        <motion.div
          className="scene-divider pb-8"
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={portfolioRevealViewport}
          transition={portfolioRevealTransition}
        >
          <p
            data-work-heading
            className="eyebrow mb-4 text-[var(--accent-cool)]"
          />
          <h2 className="text-[clamp(3rem,6vw,6.2rem)] leading-[0.92] tracking-[-0.065em] text-[#f7f2e8]">
            <span className="inline-block">My Portfolio</span>
          </h2>
        </motion.div>
      </div>

      {!compactLayout ? (
        <div className="section-frame relative z-10 mt-6 hidden items-start gap-10 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="relative py-8 lg:pr-4 lg:pt-10">
              <div
                ref={stageWrapperRef}
                className="relative mx-auto w-full max-w-[620px]"
              >
                <div
                  className="project-stage relative mx-auto aspect-[1.18] overflow-hidden rounded-[2.3rem]"
                  style={
                    desktopStageWidth
                      ? {
                          width: `${desktopStageWidth}px`,
                        }
                      : undefined
                  }
                >
                  <div className="project-stage-sweep" aria-hidden="true" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,19,0.98),rgba(7,10,16,0.98))]" />
                  <div className="absolute inset-x-5 top-5 bottom-[7.9rem] overflow-hidden rounded-[1.4rem] bg-[#0b1018]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${selectedProject.id}-${activeImage.url}`}
                        className="absolute inset-0 project-stage-frame"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
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
                  </div>

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

                  <div className="absolute inset-x-6 bottom-10 hidden gap-3 lg:flex lg:flex-col">
                    <p className="max-w-[72%] text-sm leading-snug text-[#e7dece]">
                      {activeImage.note}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <ProjectLinks project={selectedProject} compact />
                      </div>
                      <div className="ml-auto">
                        <ProjectFrameSelector
                          project={selectedProject}
                          selectedImageIndex={selectedImageIndex}
                          onSelect={setSelectedImageIndex}
                          interactive={false}
                          compact
                          className="shrink-0"
                        />
                      </div>
                    </div>
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
                  className="scene-rule flex min-h-[74vh] items-start pb-10 pt-10 lg:min-h-[36rem] lg:items-start lg:pb-0 lg:pt-10"
                >
                  <div className="group block w-full text-left">
                    <motion.div
                      data-project-panel
                      className={`cutout-stage relative min-h-[24.75rem] overflow-hidden border px-6 py-6 transition-colors sm:px-8 sm:py-6 lg:min-h-[25.75rem] ${
                        isSelected
                          ? 'border-white/16 bg-white/[0.045]'
                          : 'border-white/8 bg-white/[0.015]'
                      }`}
                      style={{
                        visibility: 'visible',
                        clipPath:
                          index % 2 === 0
                            ? 'polygon(0 0, calc(100% - 46px) 0, 100% 44px, 100% 100%, 0 100%)'
                            : 'polygon(0 0, 100% 0, 100% calc(100% - 44px), calc(100% - 56px) 100%, 0 100%)',
                      }}
                      initial={{
                        opacity: 0,
                        y: 36,
                        visibility: 'visible',
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        visibility: 'visible',
                      }}
                      viewport={{ once: true, amount: 0.24 }}
                      transition={{
                        ...portfolioRevealTransition,
                        duration: 0.82,
                        delay: index * 0.04,
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
                      <div className="grid h-full gap-5 xl:grid-cols-[auto_1fr] xl:items-stretch">
                        <span
                          className="font-mono text-[1.4rem] leading-none tracking-[0.14em]"
                          style={{
                            color: isSelected ? project.accent : 'rgba(255,255,255,0.28)',
                          }}
                        >
                          {project.number}
                        </span>

                        <div className="flex h-full min-h-0 flex-col justify-between gap-8">
                          <div className="space-y-4">
                            <p
                              className="text-[0.72rem] uppercase tracking-[0.28em]"
                              style={{ color: isSelected ? project.accent : '#8da1bb' }}
                            >
                              {project.category}
                            </p>
                            <h3
                              className={`max-w-[13ch] text-[clamp(2.8rem,5vw,5rem)] leading-[0.92] tracking-[-0.065em] transition-colors duration-200 ${
                                isSelected ? 'text-[#f2ede4]' : 'text-white/42'
                              }`}
                            >
                              {project.title}
                            </h3>
                            <p className="max-w-2xl text-base leading-relaxed text-[#ddd6cb] transition-colors duration-200 sm:text-lg">
                              {project.summary}
                            </p>
                          </div>
                          <p
                            data-tech-chip
                            className="border-t border-white/7 pt-5 font-mono text-[0.76rem] uppercase tracking-[0.18em] text-[#bcb4a9]"
                          >
                            {project.tech.join(' / ')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}

      {compactLayout ? (
        <div className="section-frame mt-12 grid gap-6 lg:hidden">
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
                <div className="absolute inset-x-3 top-3 bottom-[4.85rem] overflow-hidden rounded-[1.15rem] bg-[#0b1018]">
                  <Image
                    src={project.images[0].url}
                    alt={project.images[0].note}
                    fill
                    sizes="(max-width: 1279px) 100vw, 0px"
                    priority={index === 0}
                    className="object-contain p-3"
                  />
                </div>
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                  <ProjectLinks project={project} compact />
                </div>
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
              <p className="mt-4 text-sm leading-relaxed text-[#d7d0c4]">
                {project.images[0].note}
              </p>
              <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#bcb4a9]">
                {project.tech.join(' / ')}
              </p>
            </motion.article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

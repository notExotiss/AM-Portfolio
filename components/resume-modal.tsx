'use client'

import { motion } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { Download, X } from 'lucide-react'

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

const experience = [
  {
    title: 'WWMC (Woodrow Wilson Math Competition)',
    role: 'Co-Founder',
    dates: 'June 2023 - Present',
    body: 'Founded first-ever district wide math competition for Edison, NJ. Attracted over 400+ participants and led 70+ volunteers. Raised $4000+ for local charities.',
  },
  {
    title: 'JPS Robotics Programming Member',
    role: '',
    dates: '2023 - Present',
    body: 'Programmed semi-autonomous robots using JAVA for regional competitions, focusing on precision control and sensor integration.',
  },
]

const awards = [
  {
    title: 'USA Computing Olympiad',
    body: 'Top 10% Scorer',
  },
  {
    title: 'FBLA Nationals',
    body: "5th place in FBLA Nationals '23 for Exploring Technology and 2nd place in FBLA Nationals '24 for Video Game Challenge",
  },
  {
    title: 'AMC 10 / AIME Qualification',
    body: 'Top 7% Scorer',
  },
]

export function ResumeModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[78] bg-black/84 backdrop-blur-xl" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[79] max-h-[88vh] w-[min(96vw,1080px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,10,16,0.995),rgba(5,7,11,0.995))] p-5 shadow-[0_40px_140px_rgba(0,0,0,0.54)] sm:p-7">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),radial-gradient(circle_at_16%_18%,rgba(103,221,255,0.08),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,138,91,0.08),transparent_18%)] bg-[size:28px_28px,28px_28px,100%_100%,100%_100%] opacity-60"
            />
            <div className="scene-divider mb-7 flex items-start justify-between gap-4 pb-5">
              <div>
                <p className="eyebrow mb-4">Resume</p>
                <Dialog.Title className="text-[clamp(2.8rem,6vw,5rem)] leading-[0.9] tracking-[-0.07em] text-[#f7f2e8]">
                  Aarit Malhotra
                </Dialog.Title>
                <Dialog.Description className="mt-3 text-base leading-relaxed text-[#d9d1c4] sm:text-lg">
                  High School Developer and Student
                </Dialog.Description>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/Aarit Malhotra - Resume.pdf"
                  download
                  data-cursor="hover"
                  data-cursor-label="download"
                  className="interactive-hit primary-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    data-cursor="hover"
                    data-cursor-label="close"
                    className="ghost-button rounded-full p-2.5 text-muted-foreground hover:text-foreground"
                    aria-label="Close resume modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="scene-divider mb-7 pb-5 text-sm leading-relaxed text-[#e0d9cd] sm:text-base">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span>John P. Stevens High School</span>
                <span className="text-white/24">|</span>
                <span>(848) 209-0996</span>
                <span className="text-white/24">|</span>
                <span>3017942@edison.k12.nj.us</span>
                <span className="text-white/24">|</span>
                <span>iamaaritmalhotra@gmail.com</span>
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-7">
                <section className="scene-divider pb-6">
                  <p className="eyebrow mb-4">Education</p>
                  <h3 className="text-[1.9rem] leading-none text-[#f7f2e8]">
                    John P. Stevens High School
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#d9d1c4] sm:text-base">
                    Edison, NJ | Class of 2028
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#f7f2e8] sm:text-base">
                    Unweighted GPA: 4.0
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Honors/AP: English 2-H, Pre-Calculus H, AP US History, AP Biology,
                    AP Chemistry, AP CSP, AP CSA
                  </p>
                </section>

                <section className="scene-divider pb-6">
                  <p className="eyebrow mb-4">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="skill-chip rounded-full px-3 py-1.5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-7">
                <section className="scene-divider pb-6">
                  <p className="eyebrow mb-4">Experience</p>
                  <div className="space-y-6">
                    {experience.map((item) => (
                      <div
                        key={item.title}
                        className="scene-divider pb-5 last:pb-0 last:[&::after]:hidden"
                      >
                        <h4 className="text-xl text-[#f7f2e8]">{item.title}</h4>
                        {item.role ? (
                          <p className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-[#67ddff]">
                            {item.role}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-[#c7bfb2]">{item.dates}</p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="eyebrow mb-4">Academic Competitions &amp; Awards</p>
                  <div className="space-y-5">
                    {awards.map((item) => (
                      <div
                        key={item.title}
                        className="scene-divider pb-4 last:pb-0 last:[&::after]:hidden"
                      >
                        <h4 className="text-lg text-[#f7f2e8]">{item.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

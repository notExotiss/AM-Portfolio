'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { GraduationCap, FileText } from 'lucide-react'
import Tilt from 'react-parallax-tilt'
import Image from 'next/image'
import { ResumeModal } from './resume-modal'

// Tech stack with local SVG paths
const techStack = [
  { name: 'Python', icon: '/python.svg' },
  { name: 'TypeScript', icon: '/typescript.svg' },
  { name: 'JavaScript', icon: '/javascript.svg' },
  { name: 'React', icon: '/react.svg' },
  { name: 'Next.js', icon: '/nextjs.svg' },
  { name: 'HTML', icon: '/html.svg' },
  { name: 'CSS', icon: '/css.svg' },
  { name: 'Tailwind', icon: '/tailwind.svg' },
  { name: 'Java', icon: '/java.svg' },
  { name: 'Firebase', icon: '/firebase.svg' },
  { name: 'Git', icon: '/git.svg' },
  { name: 'Shadcn', icon: '/shadcn.svg' },
  { name: 'Three.js', icon: '/threejs.svg' },
]

export default function About() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const containerRef = useRef<HTMLDivElement>(null)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-50, 50])

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative min-h-screen py-24 flex items-center"
    >
      {/* Enhanced Parallax Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y, opacity }}
      >
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="pattern-grid opacity-10" />
      </motion.div>

      <div ref={ref} className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-20 text-left font-[var(--font-titillium)] tracking-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              backgroundImage: 'linear-gradient(135deg, #3b82f6, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            About Me
          </motion.h2>

          {/* About Text Content - Asymmetric layout */}
          <div className="grid md:grid-cols-[1.5fr_1fr] gap-12 lg:gap-16 mb-16 md:mb-24 items-start">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ y: parallaxY }}
            >
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed font-[var(--font-space-grotesk)]">
                Hey! I&apos;m a high school student who loves coding and building cool stuff. I&apos;m currently a sophomore 
                at John P. Stevens High School, and when I&apos;m not in class, you&apos;ll find me working on projects, 
                competing in programming contests, or tinkering with new technologies.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed font-[var(--font-space-grotesk)]">
                I started coding with C a few years ago and got hooked. Since then, I&apos;ve been learning 
                web development, working with React and Next.js, and building projects that solve real problems. 
                I&apos;m also co-founding the Woodrow Wilson Math Competition (WWMC), where I built the platform 
                that helps run competitions for 400+ students!
              </p>
              <p className="text-lg md:text-xl text-muted-foreground/70 leading-relaxed font-[var(--font-space-grotesk)]">
                When I&apos;m not coding, I&apos;m involved in robotics, math competitions, and other school activities. 
                I love the challenge of solving problems and the satisfaction of seeing something I built actually 
                work. Always learning, always building, always curious!
              </p>
              <motion.button
                onClick={() => setIsResumeModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition-all group font-[var(--font-space-grotesk)] font-medium mt-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <FileText size={18} />
                <span>View Resume</span>
              </motion.button>
            </motion.div>

            {/* Education Section - Right side */}
            <motion.div
              className="sticky top-24"
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold font-[var(--font-titillium)] tracking-tight">Education</h3>
              </div>
              <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                <div className="p-6 md:p-8 glass-card rounded-3xl hover:border-primary/50 transition-all relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <h4 className="text-xl md:text-2xl font-bold mb-3 font-[var(--font-titillium)] tracking-tight">John P. Stevens High School</h4>
                    <p className="text-muted-foreground/80 mb-2 font-[var(--font-space-grotesk)]">Edison, NJ | Class of 2028</p>
                    <p className="mb-3 font-[var(--font-space-grotesk)] font-medium">Unweighted GPA: 4.0</p>
                    <p className="text-muted-foreground/70 font-[var(--font-space-grotesk)] leading-relaxed">
                      Honors/AP: English 2-H, Pre-Calculus H, AP US History, AP Biology, 
                      AP Chemistry, AP CSP, AP CSA
                    </p>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>

{/* Tech Stack Section */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.8, delay: 0.5 }}
  className="mb-16 md:mb-24"
>
  <h3 className="text-3xl md:text-4xl font-bold mb-6 font-[var(--font-titillium)] tracking-tight">My Tech Stack</h3>
  <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
    {techStack.map((tech, index) => (
      <motion.div
        key={tech.name}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.5 + index * 0.05 }}
      >
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05}>
          <div className="aspect-square glass-card rounded-xl hover:border-primary/50 transition-all relative overflow-hidden group cursor-pointer flex items-center justify-center">
            {/* Hover Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-1 md:gap-2 w-full h-full p-1.5 md:p-2">
              {/* Icon Container - Smaller on mobile */}
              <div className="relative w-6 h-6 md:w-12 md:h-12 flex items-center justify-center">
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              {/* Text - Smaller on mobile */}
              <span className="text-[10px] md:text-sm font-semibold font-[var(--font-space-grotesk)] text-center leading-tight">
                {tech.name}
              </span>
            </div>
          </div>
        </Tilt>
      </motion.div>
    ))}
  </div>
</motion.div>
        </motion.div>
      </div>
      <ResumeModal open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen} />
    </section>
  )
}
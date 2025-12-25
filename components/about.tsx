'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Code, Rocket, Users, Award, Sparkles, GraduationCap } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

const skills = [
  { name: 'Python', years: '2021 - Present', icon: Code, color: 'from-yellow-500 to-orange-500' },
  { name: 'TypeScript', years: '2023 - Present', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { name: 'React', years: '2023 - Present', icon: Code, color: 'from-cyan-500 to-blue-500' },
  { name: 'Next.js', years: '2023 - Present', icon: Code, color: 'from-gray-800 to-gray-900' },
  { name: 'Java', years: '2022 - Present', icon: Code, color: 'from-orange-500 to-red-500' },
]

const achievements = [
  { icon: Award, title: 'USA Computing Olympiad', desc: 'Top 10% Scorer', gradient: 'from-yellow-500 to-orange-500' },
  { icon: Award, title: 'FBLA Nationals', desc: 'Top 5 Finalist (2023, 2024)', gradient: 'from-blue-500 to-purple-500' },
  { icon: Award, title: 'AMC 10 / AIME', desc: 'Top 7% Scorer', gradient: 'from-green-500 to-emerald-500' },
  { icon: Users, title: 'WWMC', desc: 'Co-Founder, 400+ participants', gradient: 'from-red-500 to-pink-500' },
]

export default function About() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const containerRef = useRef<HTMLDivElement>(null)
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
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-12 text-center font-[var(--font-titillium)]"
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

          {/* About Text Content */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y: parallaxY }}
          >
            <div className="glass-card rounded-2xl p-8">
                          <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-[var(--font-ubuntu)] font-normal">
                            Hey! I'm a high school student who loves coding and building cool stuff. I'm currently a junior 
                            at John P. Stevens High School, and when I'm not in class, you'll find me working on projects, 
                            competing in programming contests, or tinkering with new technologies.
                          </p>
                          <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-[var(--font-ubuntu)] font-normal">
                            I started coding with Python a few years ago and got hooked. Since then, I've been learning 
                            web development, working with React and Next.js, and building projects that solve real problems. 
                            I'm also co-founding the Woodrow Wilson Math Competition (WWMC), where I built the platform 
                            that helps run competitions for 400+ students!
                          </p>
                          <p className="text-lg text-muted-foreground leading-relaxed font-[var(--font-ubuntu)] font-normal">
                            When I'm not coding, I'm involved in robotics, math competitions, and other school activities. 
                            I love the challenge of solving problems and the satisfaction of seeing something I built actually 
                            work. Always learning, always building, always curious!
                          </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

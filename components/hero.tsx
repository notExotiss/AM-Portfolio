'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, Github, Linkedin, Instagram } from 'lucide-react'
import FontCycler from './font-cycler'

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontCycleComplete, setFontCycleComplete] = useState(false)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const parallaxY = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Content */}
      <motion.div
        className="container mx-auto px-6 relative z-10"
        style={{ opacity, y: parallaxY }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="text-6xl md:text-8xl font-bold">
              <FontCycler text="Hey!" onComplete={() => setFontCycleComplete(true)} />
                <br /> 
              <FontCycler text="I'm Aarit" onComplete={() => setFontCycleComplete(true)} />
            </div>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-3 max-w-3xl font-medium font-[var(--font-space-grotesk)] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, -50]) }}
          >
            High School Student & Developer
          </motion.p>
          <motion.p
            className="text-base md:text-lg text-muted-foreground/60 mb-6 max-w-2xl font-[var(--font-space-grotesk)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, -50]) }}
          >
            Based in Edison, NJ
          </motion.p>

          <motion.p
            className="text-base md:text-lg text-muted-foreground/80 mb-10 max-w-xl font-[var(--font-space-grotesk)] leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, -30]) }}
          >
            Exploring technology, building projects, and learning every day
          </motion.p>

          {/* Social Links */}
          <motion.div
            className="flex gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { icon: Github, href: 'https://github.com/notExotiss/', label: 'GitHub', color: 'from-gray-600 to-gray-800' },
              { icon: Linkedin, href: 'https://www.linkedin.com/in/aarit-malhotra-b5198b171/', label: 'LinkedIn', color: 'from-blue-500 to-blue-700' },
              { icon: Instagram, href: 'http://instagram.com/aaritmalhotra09', label: 'Instagram', color: 'from-pink-500 to-purple-500' },
            ].map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-4 rounded-2xl glass-card hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                aria-label={`Visit ${social.label} profile`}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <social.icon size={24} className="relative z-10" aria-hidden="true" />
                </motion.div>
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-30 blur-xl`}
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1.5 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                />
              </motion.a>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.a
            href="#about"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            aria-label="Scroll to About section"
          >
            <span className="text-sm font-medium font-[var(--font-space-grotesk)]">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown size={24} className="group-hover:text-primary transition-colors" aria-hidden="true" />
            </motion.div>
          </motion.a>
        </div>
      </motion.div>
    </section>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Loading from '@/components/loading'
import Navigation from '@/components/navigation'
import InteractiveCursor from '@/components/interactive-cursor'
import Background3D from '@/components/background-3d'
import Hero from '@/components/hero'
import About from '@/components/about'
import Portfolio from '@/components/portfolio'
import Contact from '@/components/contact'
import Footer from '@/components/footer'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const mainRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ['start start', 'end end'],
  })

  // Global parallax transforms - reduced intensity to prevent background showing
  const parallax1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const parallax2 = useTransform(scrollYProgress, [0, 1], [0, 80])
  const parallax3 = useTransform(scrollYProgress, [0, 1], [0, -60])
  const parallax4 = useTransform(scrollYProgress, [0, 1], [0, 50])
  const parallax5 = useTransform(scrollYProgress, [0, 1], [0, -70])
  const parallax6 = useTransform(scrollYProgress, [0, 1], [0, 40])
  const parallax7 = useTransform(scrollYProgress, [0, 1], [0, -90])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <main ref={mainRef} className="min-h-screen relative overflow-x-hidden" style={{ overflowY: 'hidden' }}>
      {/* Enhanced Continuous Background with Global Parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden" style={{ 
        minHeight: '200vh', // Ensure background covers even when parallax moves elements
        background: '#0a0a0a' // Match background color to prevent black showing
      }}>
        {/* Animated gradient layers - smooth radial gradients only */}
        <motion.div
          className="absolute inset-0"
          style={{ y: parallax2 }}
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.2) 0%, transparent 70%), radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 70%), radial-gradient(circle at 60% 70%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
              'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 70%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 70%), radial-gradient(circle at 60% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 70%), radial-gradient(circle at 40% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 70%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 70%), radial-gradient(circle at 70% 30%, rgba(239, 68, 68, 0.15) 0%, transparent 70%), radial-gradient(circle at 10% 40%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Moving orbs - sleek background elements with enhanced parallax */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl"
          style={{ y: parallax1 }}
          animate={{
            x: [0, 150, -50, 0],
            y: [0, 100, -30, 0],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/25 rounded-full blur-3xl"
          style={{ y: parallax2 }}
          animate={{
            x: [0, -150, 50, 0],
            y: [0, -100, 30, 0],
            scale: [1, 1.5, 0.8, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          style={{ y: parallax3 }}
          animate={{
            scale: [1, 1.6, 0.9, 1],
            rotate: [0, 360, 720],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {/* Additional sleek background elements with more parallax */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-2xl"
          style={{ y: parallax4 }}
          animate={{
            scale: [1, 1.3, 0.95, 1],
            x: [0, 50, -20, 0],
            y: [0, 30, -15, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-orange-500/15 rounded-full blur-2xl"
          style={{ y: parallax5 }}
          animate={{
            scale: [1, 1.4, 0.9, 1],
            x: [0, -60, 25, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
        {/* Additional background elements */}
        <motion.div
          className="absolute top-2/3 right-1/5 w-56 h-56 bg-pink-500/12 rounded-full blur-2xl"
          style={{ y: parallax6 }}
          animate={{
            scale: [1, 1.5, 0.85, 1],
            rotate: [0, 180, 360],
            x: [0, 40, -20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/5 right-2/3 w-48 h-48 bg-indigo-500/12 rounded-full blur-xl"
          style={{ y: parallax7 }}
          animate={{
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        {/* More solid color blocks */}
        <motion.div
          className="absolute top-1/6 left-2/3 w-40 h-40 bg-emerald-500/10 rounded-lg blur-xl"
          style={{ y: parallax4 }}
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-1/6 left-1/5 w-36 h-36 bg-yellow-500/10 rounded-lg blur-xl"
          style={{ y: parallax5 }}
          animate={{
            rotate: [360, 270, 180, 90, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {/* Additional color splashes */}
        <motion.div
          className="absolute top-3/4 left-1/6 w-44 h-44 bg-rose-500/8 rounded-full blur-2xl"
          style={{ y: parallax6 }}
          animate={{
            scale: [1, 1.25, 0.95, 1],
            x: [0, 35, -15, 0],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />
        <motion.div
          className="absolute bottom-1/5 right-1/6 w-52 h-52 bg-teal-500/10 rounded-full blur-2xl"
          style={{ y: parallax7 }}
          animate={{
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: 'linear',
            delay: 2.5,
          }}
        />
        
        {/* Geometric shapes and lines */}
        <motion.svg
          className="absolute inset-0 w-full h-full opacity-5"
          style={{ y: parallax1 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* Diagonal lines */}
          <motion.line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            animate={{
              strokeDasharray: [0, 2000, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.line
            x1="100%"
            y1="0"
            x2="0"
            y2="100%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            animate={{
              strokeDasharray: [0, 2000, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
              delay: 5,
            }}
          />
        </motion.svg>

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-1/6 left-1/6 w-32 h-32 border-2 border-primary/20 rounded-lg"
          style={{ y: parallax2, rotate: 45 }}
          animate={{
            rotate: [45, 135, 45],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/6 right-1/6 w-24 h-24 border-2 border-accent/20 rounded-full"
          style={{ y: parallax3 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-3/4 left-1/2 w-16 h-16 border-2 border-purple-500/20"
          style={{ y: parallax4, rotate: 45 }}
          animate={{
            rotate: [45, 225, 45],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Animated grid pattern overlay */}
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 100px 100px, 50px 50px, 50px 50px',
            backgroundPosition: '0 0, 0 0, 25px 25px, 25px 25px',
          }}
          animate={{
            backgroundPosition: [
              '0 0, 0 0, 25px 25px, 25px 25px',
              '100px 100px, 100px 100px, 75px 75px, 75px 75px',
              '0 0, 0 0, 25px 25px, 25px 25px',
            ],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Hexagonal pattern */}
        <motion.div
          className="absolute top-1/2 right-1/4 w-40 h-40 opacity-10"
          style={{ y: parallax1 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.polygon
              points="50,5 90,25 90,75 50,95 10,75 10,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>
        </motion.div>

        {/* Wave patterns */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-64 opacity-5"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.1))',
            clipPath: 'polygon(0 50%, 100% 30%, 100% 100%, 0% 100%)',
          }}
          animate={{
            clipPath: [
              'polygon(0 50%, 100% 30%, 100% 100%, 0% 100%)',
              'polygon(0 40%, 100% 50%, 100% 100%, 0% 100%)',
              'polygon(0 50%, 100% 30%, 100% 100%, 0% 100%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="pattern-grid opacity-10 w-full h-full" />
        <Background3D />
      </div>

      <InteractiveCursor />
      <Navigation />
      <Hero />
      <About />
      <Portfolio />
      <Contact />
      <Footer />
    </main>
  )
}

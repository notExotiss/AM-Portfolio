'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'

// Portfolio projects
const projects = [
  {
    id: 1,
    number: '01',
    title: 'Woodrow Wilson Math Competition',
    description: 'Development / Design',
    tech: ['HTML', 'CSS', 'JavaScript', 'Excel'],
    images: [
      { url: '/project1-1.png', note: 'Homepage with competition information and registration' },
      { url: '/project1-2.png', note: 'Participant dashboard showing scores and rankings' },
      { url: '/project1-3.png', note: 'Admin panel for managing competitions and volunteers' },
    ],
    gradient: 'from-blue-500 to-cyan-500',
    color: '#3b82f6',
  },
  {
    id: 2,
    number: '02',
    title: 'Robotics Control System',
    description: 'iOS Development / Product Design',
    tech: ['Java', 'Robotics'],
    images: [
      { url: '/project2-1.jpg', note: 'Robot control interface with sensor integration' },
      { url: '/project2-2.jpg', note: 'Autonomous navigation system in action' },
    ],
    gradient: 'from-red-500 to-pink-500',
    color: '#ef4444',
  },
  {
    id: 3,
    number: '03',
    title: 'Fullstack Web Application',
    description: 'Frontend Development',
    tech: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    images: [
      { url: '/project3-1.jpg', note: 'Main dashboard with interactive components' },
      { url: '/project3-2.jpg', note: 'User authentication and profile management' },
    ],
    gradient: 'from-purple-500 to-indigo-500',
    color: '#8b5cf6',
  },
]

export default function Portfolio() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-40, 40])
  
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const cursorImageRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })

  // Auto-scroll images in modal
  useEffect(() => {
    if (selectedProject && selectedProject.images.length > 1) {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === selectedProject.images.length - 1 ? 0 : prev + 1
        )
      }, 3000)
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [selectedProject])

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
    }
    globalThis.addEventListener('mousemove', handleMouseMove)
    return () => globalThis.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Cursor following with very slow, smooth movement - continuous animation
  const animationFrameRef = useRef<number | null>(null)
  const currentPositionRef = useRef({ x: 0, y: 0 })
  const previousHoveredIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Only start/stop animation when hover state actually changes (null <-> id)
    const wasHovering = previousHoveredIdRef.current !== null
    const isHovering = hoveredId !== null
    
    if (!isHovering && wasHovering) {
      // Stopping hover - clean up animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      previousHoveredIdRef.current = null
      return
    }

    if (isHovering && !wasHovering && cursorImageRef.current) {
      // Starting hover - initialize position and start animation
      currentPositionRef.current.x = mousePositionRef.current.x
      currentPositionRef.current.y = mousePositionRef.current.y
      cursorImageRef.current.style.left = `${currentPositionRef.current.x}px`
      cursorImageRef.current.style.top = `${currentPositionRef.current.y}px`
      cursorImageRef.current.style.transform = 'translate(-50%, -50%)'
    }

    previousHoveredIdRef.current = hoveredId

    // Continuous animation loop - doesn't restart when switching projects
    const animate = () => {
      if (!hoveredId || !cursorImageRef.current) {
        animationFrameRef.current = null
        return
      }
      
      // Very slow interpolation for smooth, flowing feel (0.03)
      currentPositionRef.current.x += (mousePositionRef.current.x - currentPositionRef.current.x) * 0.03
      currentPositionRef.current.y += (mousePositionRef.current.y - currentPositionRef.current.y) * 0.03
      
      cursorImageRef.current.style.left = `${currentPositionRef.current.x}px`
      cursorImageRef.current.style.top = `${currentPositionRef.current.y}px`
      cursorImageRef.current.style.transform = 'translate(-50%, -50%)'
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation only if not already running
    if (isHovering && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [hoveredId])

  const hoveredProject = projects.find(p => p.id === hoveredId)

  return (
    <>
                <section
                  id="portfolio"
                  ref={containerRef}
                  className="relative min-h-screen py-24"
      >
        <div ref={ref} className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            style={{ y: parallaxY }}
          >
            <motion.h2
              className="text-5xl md:text-6xl font-bold mb-20 text-center font-[var(--font-titillium)]"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              style={{
                backgroundImage: 'linear-gradient(135deg, #3b82f6, #ef4444, #8b5cf6, #f59e0b)',
                backgroundSize: '300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 5s ease infinite',
              }}
            >
              Portfolio
            </motion.h2>

            {/* List-style Portfolio */}
            <div className="space-y-0">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => {
                    setHoveredId(project.id)
                  }}
                  onMouseLeave={() => {
                    setHoveredId(null)
                  }}
                  onClick={() => {
                    setSelectedProject(project)
                    setCurrentImageIndex(0)
                  }}
                  className="group cursor-none"
                  data-portfolio-item
                >
                  <motion.div
                    className="flex items-center justify-between py-6 border-b border-border/50 hover:border-primary/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Left side - Number and Title */}
                    <div className="flex items-center gap-8">
                      <motion.span
                        className="text-sm text-muted-foreground font-mono w-8 font-[var(--font-dm-mono)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                      >
                        {project.number}
                      </motion.span>
                      <motion.h3
                        className="text-2xl md:text-3xl font-semibold font-[var(--font-titillium)]"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                      >
                        <motion.span
                          className="block"
                          animate={{
                            color: hoveredId === project.id ? '#3b82f6' : 'rgb(255, 255, 255)',
                          }}
                          transition={{
                            duration: 0.6,
                            ease: 'easeInOut',
                          }}
                        >
                          {project.title}
                        </motion.span>
                      </motion.h3>
                    </div>

                    {/* Right side - Description */}
                    <motion.span
                      className="text-sm text-muted-foreground hidden md:block font-[var(--font-inter)]"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.15 }}
                    >
                      {project.description}
                    </motion.span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cursor-following Image - box stays, content fades */}
      {hoveredProject && (
        <motion.div
          ref={cursorImageRef}
          className="fixed pointer-events-none z-[10000] w-80 h-48 rounded-xl overflow-hidden border-2 border-primary/50 shadow-2xl glass-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
          }}
          style={{
            willChange: 'transform, left, top',
          }}
        >
          <AnimatePresence mode="wait">
            {hoveredProject.images[0] && (
              <motion.div 
                key={hoveredProject.id}
                className="w-full h-full relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.15, 
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <Image
                  src={hoveredProject.images[0].url}
                  alt={hoveredProject.title}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                <motion.div 
                  className="absolute bottom-2 left-2 right-2 text-xs text-white/80 font-[var(--font-ubuntu)] truncate bg-black/40 backdrop-blur-sm px-2 py-1 rounded"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: 'easeOut',
                  }}
                >
                  {hoveredProject.title}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Project Detail Modal */}
      <Dialog.Root open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/95 backdrop-blur-md z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl max-h-[95vh] glass-card rounded-2xl z-50 overflow-hidden shadow-2xl">
            {selectedProject && (
              <motion.div
                className="relative flex h-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Main Image Area - Left Side */}
                <div className="flex-1 relative bg-secondary overflow-hidden">
                  <AnimatePresence mode="wait">
                    {selectedProject.images[currentImageIndex] && (
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Image
                          src={selectedProject.images[currentImageIndex].url}
                          alt={selectedProject.images[currentImageIndex].note}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 70vw"
                          priority
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Close Button */}
                  <Dialog.Close asChild>
                    <motion.button
                      className="absolute top-4 right-4 p-3 rounded-full glass-card hover:border-primary transition-all group z-10"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} className="group-hover:text-primary transition-colors" />
                    </motion.button>
                  </Dialog.Close>
                </div>

                {/* Sidebar - Right Side */}
                <div className="w-80 glass-card border-l border-border/50 flex flex-col">
                  {/* Project Info */}
                  <div className="p-6 border-b border-border/50">
                    <h3 className="text-2xl font-bold mb-2 font-[var(--font-titillium)]">{selectedProject.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 font-[var(--font-ubuntu)]">{selectedProject.description}</p>
                    
                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedProject.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs bg-secondary/50 backdrop-blur-sm rounded-full border border-border/50 font-[var(--font-dm-mono)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Image Thumbnails Sidebar */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedProject.images.map((image, index) => (
                      <motion.button
                        key={`${selectedProject.id}-thumb-${image.url}-${index}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-full aspect-video rounded-lg overflow-hidden border-2 transition-all relative group backdrop-blur-sm ${
                          index === currentImageIndex
                            ? 'border-primary scale-105'
                            : 'border-border/50 hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Image
                          src={image.url}
                          alt={image.note}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 320px"
                        />
                        {index === currentImageIndex && (
                          <motion.div
                            className="absolute inset-0 bg-primary/20"
                            layoutId="selectedImage"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Current Image Note */}
                  <div className="p-4 border-t border-border/50 bg-secondary/30 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground font-[var(--font-ubuntu)]">
                      <strong className="text-foreground font-[var(--font-titillium)]">Note:</strong> {selectedProject.images[currentImageIndex]?.note}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

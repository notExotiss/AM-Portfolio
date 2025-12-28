'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { X, Code2, ExternalLink } from 'lucide-react'
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
      { url: '/project1-2.png', note: 'Excel sheet with scoring system' },
      { url: '/project1-3.jpg', note: 'In-person event with participants and volunteers' },
    ],
    gradient: 'from-blue-500 to-cyan-500',
    color: '#3b82f6',
    links: {
      website: 'https://wwmc.online/',
      github: 'https://github.com/notExotiss/WWMC',
    },
  },
  {
    id: 2,
    number: '02',
    title: 'A.M. Tutoring',
    description: 'UI/UX Design / Fullstack Development',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    images: [
      { url: '/project2-1.png', note: 'Personalized SAT prep tutoring website homepage' },
      { url: '/project2-2.png', note: 'Admin panel for managing tutors and students' },
      { url: '/project2-3.png', note: 'Test creation interface with question bank and scoring' },
      { url: '/project2-4.png', note: 'Student dashboard for viewing courses and progress' },
      { url: '/project2-5.png', note: 'Test taking interface with timer and score tracking' }
    ],
    gradient: 'from-blue-500 to-cyan-500',
    color: '#3b82f6',
    links: {
      website: 'https://am-tutoring.vercel.app/',
      github: 'https://github.com/notExotiss/am-tutoring',
    },
  },
  {
    id: 3,
    number: '03',
    title: 'AgriSense',
    description: 'Congressional App Challenge / Fullstack',
    tech: ['React', 'Firebase', 'JavaScript', 'Satellite APIs', 'Arduino'],
    images: [
      { url: '/project4-1.png', note: 'AgriSense dashboard with NDVI vegetation health analysis' },
      { url: '/project4-2.png', note: 'NDVI plot analysis and satellite imagery mapping' },
    ],
    gradient: 'from-green-500 to-emerald-500',
    color: '#10b981',
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
    description: 'FBLA Video Game Challenge / Game Development',
    tech: ['C#', 'Unity', 'Aseprite', 'Photoshop'],
    images: [
      { url: '/project5-1.png', note: '2D platformer gameplay screenshot' },
      { url: '/project5-2.png', note: '3D platformer gameplay screenshot' },
      { url: '/project5-3.png', note: 'Unity editor and scene management' },
      { url: '/project5-3.png', note: 'Code implementation and debugging' },


    ],
    gradient: 'from-orange-500 to-red-500',
    color: '#f97316',
    links: {
      website: 'https://fblabit.itch.io/backintime',
      github: '',
    },
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
  const [hoverImageIndex, setHoverImageIndex] = useState(0)
  const [mobileProjectImageIndices, setMobileProjectImageIndices] = useState<Record<number, number>>({})
  const [isMobile, setIsMobile] = useState(false)
  const cursorImageRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hoverImageIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mobileImageIntervalRefs = useRef<Record<number, NodeJS.Timeout>>({})
  const mousePositionRef = useRef({ x: 0, y: 0 })

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll images in modal
  useEffect(() => {
    if (selectedProject && selectedProject.images.length > 1) {
      const imagesLength = selectedProject.images.length
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === imagesLength - 1 ? 0 : prev + 1
        )
      }, 3000)
    } else {
      setCurrentImageIndex(0)
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
    }
  }, [selectedProject])

  // Auto-scroll images in hover preview (desktop only)
  useEffect(() => {
    if (hoveredId && !isMobile) {
      const project = projects.find(p => p.id === hoveredId)
      if (project && project.images.length > 1) {
        setHoverImageIndex(0)
        hoverImageIntervalRef.current = setInterval(() => {
          setHoverImageIndex((prev) => 
            prev === project.images.length - 1 ? 0 : prev + 1
          )
        }, 2000)
      } else {
        setHoverImageIndex(0)
      }
    } else {
      setHoverImageIndex(0)
    }

    return () => {
      if (hoverImageIntervalRef.current) {
        clearInterval(hoverImageIntervalRef.current)
      }
    }
  }, [hoveredId, isMobile])

// Auto-scroll images for mobile portfolio items
useEffect(() => {
  // Only run if on mobile and the portfolio section is in view
  if (!isMobile || !inView) return;

  const intervals: Record<number, NodeJS.Timeout> = {};

  projects.forEach((project) => {
    if (project.images.length > 1) {
      intervals[project.id] = setInterval(() => {
        setMobileProjectImageIndices((prev) => ({
          ...prev,
          [project.id]: ((prev[project.id] || 0) + 1) % project.images.length,
        }));
      }, 3000);
    }
  });

  // Cleanup: clear all intervals when component unmounts or view changes
  return () => {
    Object.values(intervals).forEach((interval) => clearInterval(interval));
  };
}, [isMobile, inView]); // Removed mobileProjectImageIndices from dependencies

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
      
      // Faster interpolation for more responsive movement (0.12)
      currentPositionRef.current.x += (mousePositionRef.current.x - currentPositionRef.current.x) * 0.12
      currentPositionRef.current.y += (mousePositionRef.current.y - currentPositionRef.current.y) * 0.12
      
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
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-20 md:mb-24 text-left font-[var(--font-titillium)] tracking-tight"
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
              {projects.map((project, index) => {
                const currentImageIdx = mobileProjectImageIndices[project.id] || 0
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onMouseEnter={() => {
                      if (!isMobile) {
                        setHoveredId(project.id)
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isMobile) {
                        setHoveredId(null)
                      }
                    }}
                    onClick={() => {
                      if (!isMobile) {
                        setSelectedProject(project)
                        setCurrentImageIndex(0)
                      }
                    }}
                    className="group"
                    data-portfolio-item
                  >
                    {/* Desktop: Simple list item */}
                    <motion.div
                      className="hidden md:flex items-center justify-between py-8 border-b border-border/30 hover:border-primary/50 transition-colors"
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
                          className="text-2xl md:text-3xl lg:text-4xl font-bold font-[var(--font-titillium)] tracking-tight"
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
                        className="text-sm md:text-base text-muted-foreground/80 font-[var(--font-space-grotesk)]"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.15 }}
                      >
                        {project.description}
                      </motion.span>
                    </motion.div>

                    {/* Mobile: Full card with images and info */}
                    <motion.div
                      className="md:hidden mb-10 glass-card rounded-3xl overflow-hidden border border-border/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {/* Image carousel */}
                      <div className="relative w-full aspect-video bg-secondary">
                        <AnimatePresence mode="wait">
                          {project.images[currentImageIdx] && (
                            <motion.div
                              key={`${project.id}-mobile-${currentImageIdx}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              className="absolute inset-0"
                            >
                              <Image
                                src={project.images[currentImageIdx].url}
                                alt={project.images[currentImageIdx].note}
                                fill
                                className="object-cover"
                                sizes="100vw"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {/* Image indicators */}
                        {project.images.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {project.images.map((img) => (
                              <div
                                key={`${project.id}-indicator-${img.url}`}
                                className={`h-1.5 rounded-full transition-all ${
                                  project.images.indexOf(img) === currentImageIdx ? 'w-8 bg-primary' : 'w-1.5 bg-white/30'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Project Info */}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs text-muted-foreground/60 font-mono font-[var(--font-dm-mono)]">{project.number}</span>
                          <h3 className="text-2xl font-bold font-[var(--font-titillium)] tracking-tight">{project.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground/80 mb-5 font-[var(--font-space-grotesk)] leading-relaxed">{project.description}</p>
                        
                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {project.tech.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1.5 text-xs bg-secondary/50 backdrop-blur-sm rounded-full border border-border/30 font-[var(--font-space-grotesk)] font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Links */}
                        {(project.links?.website || project.links?.github) && (
                          <div className="flex gap-3">
                            {project.links.github && (
                              <motion.a
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/50 active:border-primary/50 transition-all"
                                whileTap={{ scale: 0.95 }}
                              >
                                <Code2 size={18} className="text-muted-foreground" />
                                <span className="text-sm font-[var(--font-ubuntu)] text-muted-foreground">GitHub</span>
                              </motion.a>
                            )}
                            {project.links.website && (() => {
                              try {
                                const websiteUrl = new URL(project.links.website)
                                const hostname = websiteUrl.hostname.replace('www.', '')
                                return (
                                  <motion.a
                                    href={project.links.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/50 active:border-primary/50 transition-all relative"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <div className="relative w-5 h-5 flex items-center justify-center">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                                        alt="Website favicon"
                                        className="w-4 h-4"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = 'none'
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-[var(--font-ubuntu)] text-muted-foreground">Website</span>
                                  </motion.a>
                                )
                              } catch {
                                return null
                              }
                            })()}
                          </div>
                        )}

                        {/* Image note */}
                        {project.images[currentImageIdx] && (
                          <p className="text-xs text-muted-foreground/70 mt-5 font-[var(--font-space-grotesk)] leading-relaxed">
                            {project.images[currentImageIdx].note}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cursor-following Image - box stays, content fades (desktop only) */}
      {hoveredProject && !isMobile && (
        <motion.div
          ref={cursorImageRef}
          className="fixed pointer-events-none z-[10000] w-80 h-48 rounded-3xl overflow-hidden border-2 border-primary/50 shadow-2xl glass-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            opacity: { duration: 0.15 },
            scale: { duration: 0.15 },
          }}
          style={{
            willChange: 'transform, left, top',
          }}
        >
          <AnimatePresence mode="wait">
            {hoveredProject.images[hoverImageIndex] && (
              <motion.div 
                key={`${hoveredProject.id}-${hoverImageIndex}`}
                className="w-full h-full relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.2, 
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <Image
                  src={hoveredProject.images[hoverImageIndex].url}
                  alt={hoveredProject.images[hoverImageIndex].note || hoveredProject.title}
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
                    duration: 0.2, 
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

      {/* Project Detail Modal (desktop only) */}
      {!isMobile && (
      <Dialog.Root open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/95 backdrop-blur-md z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-7xl h-[90vh] max-h-[90vh] glass-card rounded-3xl z-50 overflow-hidden shadow-2xl flex flex-col">
            {selectedProject && (
              <motion.div
                className="relative flex flex-col md:flex-row h-full min-h-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Main Image Area - Left Side */}
                <div className="flex-1 relative bg-secondary overflow-hidden min-h-0 flex flex-col">
                  <div className="relative flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                      {selectedProject.images[currentImageIndex] && (() => {
                        const currentImage = selectedProject.images[currentImageIndex]
                        return (
                          <motion.div
                            key={`${selectedProject.id}-img-${currentImageIndex}-${currentImage.url}`}
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="absolute inset-0 flex items-center justify-center p-4"
                          >
                            <Image
                              key={`img-${selectedProject.id}-${currentImageIndex}-${currentImage.url}`}
                              src={currentImage.url}
                              alt={currentImage.note}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 70vw"
                              priority={currentImageIndex === 0}
                            />
                          </motion.div>
                        )
                      })()}
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

                  {/* Current Image Note - Moved below image */}
                  <div className="p-4 border-t border-border/30 bg-secondary/30 backdrop-blur-sm flex-shrink-0">
                    <p className="text-sm text-muted-foreground/70 font-[var(--font-space-grotesk)] leading-relaxed">
                      <strong className="text-foreground font-[var(--font-space-grotesk)] font-semibold">Note:</strong> {selectedProject.images[currentImageIndex]?.note}
                    </p>
                  </div>
                </div>

                {/* Sidebar - Right Side */}
                <div className="w-full md:w-80 glass-card border-t md:border-t-0 md:border-l border-border/30 flex flex-col flex-shrink-0 max-h-full min-h-0">
                  {/* Project Info */}
                  <div className="p-4 md:p-6 border-b border-border/30 flex-shrink-0 overflow-y-auto">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 font-[var(--font-titillium)] tracking-tight">{selectedProject.title}</h3>
                    <p className="text-muted-foreground/80 text-sm mb-4 font-[var(--font-space-grotesk)] leading-relaxed">{selectedProject.description}</p>
                    
                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedProject.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 text-xs bg-secondary/50 backdrop-blur-sm rounded-full border border-border/30 font-[var(--font-space-grotesk)] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Project Links */}
                    {(selectedProject.links?.website || selectedProject.links?.github) && (
                      <div className="flex flex-wrap gap-3">
                        {selectedProject.links.github && (
                          <motion.a
                            href={selectedProject.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/30 hover:border-primary/50 hover:bg-secondary transition-all group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Code2 size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-[var(--font-space-grotesk)] text-muted-foreground/80 group-hover:text-primary transition-colors font-medium">GitHub</span>
                          </motion.a>
                        )}
                        {selectedProject.links.website && (() => {
                          try {
                            const websiteUrl = new URL(selectedProject.links.website)
                            const hostname = websiteUrl.hostname.replace('www.', '')
                            return (
                              <motion.a
                                href={selectedProject.links.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/30 hover:border-primary/50 hover:bg-secondary transition-all group relative"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className="relative w-5 h-5 flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                                    alt="Website favicon"
                                    className="w-4 h-4"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-[var(--font-space-grotesk)] text-muted-foreground/80 group-hover:text-primary transition-colors font-medium">Website</span>
                              </motion.a>
                            )
                          } catch {
                            return (
                              <motion.a
                                href={selectedProject.links.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/30 hover:border-primary/50 hover:bg-secondary transition-all group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-[var(--font-space-grotesk)] text-muted-foreground/80 group-hover:text-primary transition-colors font-medium">Website</span>
                              </motion.a>
                            )
                          }
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Image Thumbnails Sidebar */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {selectedProject.images.map((image, index) => (
                      <motion.button
                        key={`${selectedProject.id}-thumb-${image.url}-${index}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-full aspect-video rounded-2xl overflow-hidden border-2 transition-all relative group backdrop-blur-sm ${
                          index === currentImageIndex
                            ? 'border-primary scale-105'
                            : 'border-border/30 hover:border-primary/50'
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
                </div>
              </motion.div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      )}
    </>
  )
}

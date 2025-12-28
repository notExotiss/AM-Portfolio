'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function InteractiveCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [cursorVariant, setCursorVariant] = useState('default')
  const [isMobile, setIsMobile] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Much tighter spring for immediate response
  const springConfig = { damping: 35, stiffness: 2000, mass: 0.1 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Don't set up cursor on mobile
    if (isMobile) return
    
    let rafId: number
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother, frame-synced updates
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        cursorX.set(e.clientX)
        cursorY.set(e.clientY)
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button')) {
        setIsHovering(true)
        setCursorVariant('hover')
      } else {
        setIsHovering(false)
        setCursorVariant('default')
      }
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
      setCursorVariant('default')
    }

    // Add hover detection for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], .cursor-pointer')
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter as EventListener)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter as EventListener)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [cursorX, cursorY, isMobile])

  // Hide cursor on portfolio hover
  const isPortfolioHover = cursorVariant === 'hidden'
  
  // Hide cursor when hovering over portfolio items
  useEffect(() => {
    const portfolioItems = document.querySelectorAll('[data-portfolio-item]')
    const handlePortfolioEnter = () => {
      setIsHovering(true)
      setCursorVariant('hidden')
    }
    const handlePortfolioLeave = () => {
      setIsHovering(false)
      setCursorVariant('default')
    }
    
    portfolioItems.forEach((item) => {
      item.addEventListener('mouseenter', handlePortfolioEnter)
      item.addEventListener('mouseleave', handlePortfolioLeave)
    })
    
    return () => {
      portfolioItems.forEach((item) => {
        item.removeEventListener('mouseenter', handlePortfolioEnter)
        item.removeEventListener('mouseleave', handlePortfolioLeave)
      })
    }
  }, [])

  // Don't render cursor on mobile
  if (isMobile) return null

  return (
    <>
      {/* Main cursor dot */}
      {!isPortfolioHover && (
        <motion.div
          className="fixed top-0 left-0 w-3 h-3 rounded-full bg-primary pointer-events-none z-[9999] mix-blend-difference"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
      )}

      {/* Outer ring */}
      {!isPortfolioHover && (
        <motion.div
          className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-primary/50 pointer-events-none z-[9998]"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale: isHovering ? 2 : isClicking ? 0.8 : 1,
            opacity: isHovering ? 0.8 : isClicking ? 0.6 : 0.4,
          }}
          transition={{
            type: 'tween',
            duration: 0.2,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Hover effect ring */}
      {isHovering && !isPortfolioHover && (
        <motion.div
          className="fixed top-0 left-0 w-20 h-20 rounded-full border-2 border-primary pointer-events-none z-[9997]"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Click ripple effect */}
      {isClicking && !isPortfolioHover && (
        <motion.div
          className="fixed top-0 left-0 w-16 h-16 rounded-full border-2 border-primary pointer-events-none z-[9996]"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Trailing particles */}
      {!isPortfolioHover && (
        <div className="fixed top-0 left-0 pointer-events-none z-[9995]">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: '-50%',
                translateY: '-50%',
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}

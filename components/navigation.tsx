'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { ResumeModal } from './resume-modal'

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Resume', href: '#resume', isModal: true },
  { name: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0
      setIsScrolled(scrollY > 50)
    }
    // Set initial state
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToSection = (href: string, isModal?: boolean) => {
    if (isModal) {
      setIsResumeModalOpen(true)
      setIsMobileMenuOpen(false)
      return
    }
    const element = document.querySelector(href)
    if (element) {
      const yOffset = -80 // Offset for fixed navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-center md:justify-center">
        {/* Desktop Navigation - Rounded container around links with liquid glass */}
        <motion.div
          className={`hidden md:flex items-center gap-8 px-8 py-4 rounded-full transition-all duration-300 pointer-events-auto ${
            isScrolled ? 'glass-nav' : 'bg-transparent'
          }`}
          animate={{
            background: isScrolled 
              ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.6) 0%, rgba(17, 17, 17, 0.7) 50%, rgba(10, 10, 10, 0.6) 100%)' 
              : 'transparent',
            backdropFilter: isScrolled ? 'blur(50px) saturate(200%) brightness(1.1)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(50px) saturate(200%) brightness(1.1)' : 'none',
            border: isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
            boxShadow: isScrolled 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : 'none',
          }}
        >
          {navItems.map((item, index) => (
            <motion.button
              key={item.name}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(item.href, item.isModal)
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              aria-label={`Navigate to ${item.name} section`}
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </motion.button>
          ))}
        </motion.div>

        {/* Mobile Menu Button - Right aligned */}
        <motion.button
          className="md:hidden text-foreground px-4 py-2 rounded-full transition-all duration-300 pointer-events-auto ml-auto focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          animate={{
            background: isScrolled 
              ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.6) 0%, rgba(17, 17, 17, 0.7) 50%, rgba(10, 10, 10, 0.6) 100%)' 
              : 'transparent',
            backdropFilter: isScrolled ? 'blur(50px) saturate(200%) brightness(1.1)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(50px) saturate(200%) brightness(1.1)' : 'none',
            border: isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
            boxShadow: isScrolled 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : 'none',
          }}
        >
          {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
          <motion.div
              className="md:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border pointer-events-auto z-40"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex flex-col gap-4 flex-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault()
                    setIsMobileMenuOpen(false)
                        scrollToSection(item.href, item.isModal)
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
                  aria-label={`Navigate to ${item.name} section`}
                >
                  {item.name}
                </button>
              ))}
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors ml-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="Close navigation menu"
                >
                  <X size={24} className="text-foreground" aria-hidden="true" />
                </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      <ResumeModal open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen} />
    </motion.nav>
  )
}

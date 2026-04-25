'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { scrollToSection } from '@/lib/scroll-to-section'
import RollingText from './rolling-text'
import { ResumeModal } from './resume-modal'

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Work', href: '#portfolio' },
  { name: 'Resume', href: '#resume', isModal: true },
  { name: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('#home')

  const sectionIds = useMemo(
    () => navItems.filter((item) => !item.isModal).map((item) => item.href),
    []
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32)

      const midpoint = window.scrollY + window.innerHeight * 0.42
      for (const id of [...sectionIds].reverse()) {
        const element = document.querySelector(id)
        if (!(element instanceof HTMLElement)) {
          continue
        }

        const top = element.getBoundingClientRect().top + window.scrollY
        if (midpoint >= top) {
          setActiveSection(id)
          break
        }
      }
    }

    const openResume = () => setIsResumeModalOpen(true)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener(
      'open-resume',
      openResume as EventListenerOrEventListenerObject
    )

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener(
        'open-resume',
        openResume as EventListenerOrEventListenerObject
      )
    }
  }, [sectionIds])

  const handleModalClick = (isModal?: boolean) => {
    if (isModal) {
      setIsResumeModalOpen(true)
      setIsMobileMenuOpen(false)
    }
  }

  const handleSectionClick = (sectionId: string) => {
    if (!scrollToSection(sectionId)) {
      return
    }

    setActiveSection(sectionId)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-x-0 top-5 z-[70] hidden justify-center px-4 md:flex"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
      >
        <div
          className={`nav-shell pointer-events-auto flex w-fit items-center gap-1 rounded-full px-2 py-2 transition-all duration-200 ${
            isScrolled ? 'shadow-[0_22px_70px_rgba(0,0,0,0.24)]' : ''
          }`}
        >
          {navItems.map((item) => {
            const isActive = !item.isModal && activeSection === item.href

            return (
              item.isModal ? (
                <button
                  key={item.name}
                  type="button"
                  data-cursor="hover"
                  data-cursor-label={item.name.toLowerCase()}
                  onClick={() => handleModalClick(item.isModal)}
                  className="interactive-hit group relative inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-[#d0cabd] transition-colors hover:text-[#f7f2e8]"
                >
                  <span className="relative z-10">
                    <RollingText text={item.name} />
                  </span>
                </button>
              ) : (
                <button
                  key={item.name}
                  type="button"
                  data-cursor="hover"
                  data-cursor-label={item.name.toLowerCase()}
                  onClick={() => handleSectionClick(item.href)}
                  className={`interactive-hit group relative inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#f7f2e8]'
                      : 'text-[#d0cabd] hover:text-[#f7f2e8]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(143,229,255,0.12),rgba(255,138,91,0.08))]"
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    />
                  ) : null}
                  <span className="relative z-10">
                    <RollingText text={item.name} />
                  </span>
                </button>
              )
            )
          })}
        </div>
      </motion.div>

      <motion.div
        className="fixed right-4 top-4 z-[70] md:hidden"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
      >
        <button
          type="button"
          className="nav-shell inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[#f7f2e8]"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Menu
        </button>
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            className="fixed inset-0 z-[68] bg-black/72 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="pixel-frame absolute inset-x-4 top-20 rounded-[2rem] p-5"
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <div className="scene-divider mb-5 flex items-center justify-between pb-4">
                <div>
                  <p className="eyebrow mb-2">Navigation</p>
                  <p className="text-sm text-muted-foreground">
                    Home, about, work, resume, and contact.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ghost-button rounded-full p-2"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3">
                {navItems.map((item) => (
                  item.isModal ? (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleModalClick(item.isModal)}
                      className="soft-panel rounded-[1.4rem] px-4 py-4 text-left text-[#f5efe6]"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSectionClick(item.href)}
                      className="soft-panel rounded-[1.4rem] px-4 py-4 text-left text-[#f5efe6]"
                    >
                      {item.name}
                    </button>
                  )
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ResumeModal open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen} />
    </>
  )
}

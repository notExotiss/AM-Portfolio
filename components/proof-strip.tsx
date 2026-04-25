'use client'

import React, { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'
import { scrollToSection } from '@/lib/scroll-to-section'

const proofItems = [
  {
    label: 'WWMC Reach',
    value: 400,
    suffix: '+',
    detail: 'Participants supported through the district competition platform',
  },
  {
    label: 'Shipped Work',
    value: 4,
    suffix: '',
    detail: 'Product-style builds and experiments worth showing publicly',
  },
  {
    label: 'Focus',
    value: 100,
    suffix: '%',
    detail: 'Interaction systems, case-study polish, and motion tone',
  },
  {
    label: 'FBLA',
    value: 2,
    suffix: 'X',
    detail: 'National placements across 2023 and 2024',
  },
]

export default function ProofStrip() {
  const sectionRef = useRef<HTMLElement>(null)
  const numbersRef = useRef<(HTMLSpanElement | null)[]>([])

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Split text or reveal lines
      const revealItems = gsap.utils.toArray<HTMLElement>('[data-proof-reveal]')
      
      gsap.fromTo(
        revealItems,
        { y: 60, autoAlpha: 0, rotateX: 10 },
        {
          y: 0,
          autoAlpha: 1,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          },
        }
      )

      // Number counter animation
      numbersRef.current.forEach((el, index) => {
        if (!el) return
        const targetValue = proofItems[index].value
        
        gsap.fromTo(
          el,
          { innerHTML: 0 },
          {
            innerHTML: targetValue,
            duration: 2 + index * 0.2,
            ease: 'expo.out',
            snap: { innerHTML: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
            onUpdate: function () {
              // Ensure we don't end up with decimals
              el.innerHTML = Math.round(Number(this.targets()[0].innerHTML)).toString()
            },
          }
        )
      })

      // Parallax effect on the background shapes
      gsap.to('[data-proof-shape]', {
        yPercent: -20,
        rotate: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32 lg:py-40 overflow-hidden bg-[#0a0a0c]"
    >
      {/* Background Graphic Elements */}
      <div 
        data-proof-shape
        className="absolute top-10 right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-white/[0.02] to-white/0 blur-2xl pointer-events-none"
      />
      <div 
        className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="section-frame relative z-10 px-4 sm:px-8 mx-auto max-w-7xl">
        <div className="grid gap-16 lg:gap-24 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="max-w-xl">
            <p 
              data-proof-reveal 
              className="text-white/40 uppercase tracking-[0.2em] text-xs font-semibold mb-6 flex items-center gap-4"
            >
              <span className="w-8 h-px bg-white/40"></span>
              Proof of Work
            </p>
            <h2 
              data-proof-reveal 
              className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] text-white tracking-[-0.04em] mb-8"
              style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
            >
              Less filler. <br/>
              <span className="italic text-white/70">More action.</span>
            </h2>
            <p 
              data-proof-reveal 
              className="text-base sm:text-lg leading-relaxed text-white/50 font-light"
            >
              I care about visual identity, but the point is still the same:
              the site should make it obvious that the work has structure,
              users, stakes, and follow-through behind it. Real impact requires real execution.
            </p>
            
            <div data-proof-reveal className="mt-10">
              <button
                type="button"
                onClick={() => {
                  scrollToSection('#contact')
                }}
                className="group inline-flex items-center gap-3 text-white text-sm uppercase tracking-widest font-medium hover:text-white/80 transition-colors"
                data-cursor="hover"
              >
                Let&apos;s Work Together
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 sm:gap-y-16">
            {proofItems.map((item, index) => (
              <div
                key={item.label}
                data-proof-reveal
                className="relative group border-l border-white/10 pl-6 lg:pl-8 py-2"
              >
                {/* Decorative highlight on hover */}
                <div className="absolute left-[-1px] top-0 w-[2px] h-0 bg-white group-hover:h-full transition-all duration-700 ease-out" />
                
                <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.15em] mb-4">
                  {item.label}
                </p>
                
                <div className="flex items-baseline gap-1 mb-3">
                  <span 
                    ref={(el) => {
                      numbersRef.current[index] = el
                    }}
                    className="font-display font-extrabold text-[clamp(3.5rem,7vw,5rem)] leading-none text-white tracking-[-0.03em]"
                  >
                    0
                  </span>
                  <span className="font-display font-medium text-2xl sm:text-3xl text-white/60">
                    {item.suffix}
                  </span>
                </div>
                
                <p className="text-sm sm:text-base leading-relaxed text-white/50 font-light max-w-[16rem]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

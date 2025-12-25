'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const fonts = [
  'Impact, "Arial Black", sans-serif', // Bold/Gothic
  '"Times New Roman", Times, serif', // Classic serif
  '"Comic Sans MS", "Comic Sans", cursive', // Comic Sans
  '"Courier New", Courier, monospace', // Monospace
  'Georgia, serif', // Elegant serif
  'Verdana, Geneva, sans-serif', // Clean sans
  '"Trebuchet MS", sans-serif', // Modern sans
  'Arial, sans-serif', // Standard
  '"Lucida Console", Monaco, monospace', // Console
  'Palatino, "Palatino Linotype", serif', // Classic
  'Tahoma, Geneva, sans-serif', // Compact
  '"Century Gothic", sans-serif', // Gothic
  '"Brush Script MT", cursive', // Script
  '"Papyrus", fantasy', // Fantasy
  '"Bauhaus 93", sans-serif', // Display
  '"Copperplate", fantasy', // Fantasy
  '"Garamond", serif', // Classic serif
  '"Book Antiqua", serif', // Antique
  '"Franklin Gothic Medium", sans-serif', // Gothic
  '"Goudy Old Style", serif', // Old style
  '"Lucida Sans Unicode", sans-serif', // Unicode
  '"MS Sans Serif", sans-serif', // System
  '"MS Serif", serif', // System serif
  'var(--font-inter), sans-serif', // Inter
  'var(--font-ubuntu), sans-serif', // Ubuntu
  'var(--font-titillium), sans-serif', // Titillium
  'var(--font-dm-mono), monospace', // DM Mono
]

export default function FontCycler({ 
  text, 
  onComplete 
}: Readonly<{ 
  text: string
  onComplete: () => void 
}>) {
  const [charStates, setCharStates] = useState<Array<{ font: string; offset: number }>>([])

  useEffect(() => {
    // Initialize each character with a random font and offset
    const initialStates = text.split('').map(() => ({
      font: fonts[Math.floor(Math.random() * fonts.length)],
      offset: (Math.random() - 0.5) * 15,
    }))
    setCharStates(initialStates)

    // Call onComplete after initial setup (so hero knows cycler is ready)
    setTimeout(() => {
      onComplete()
    }, 100)

    const updateInterval = 90 // Update every 120ms for smoother cycling

    const interval = setInterval(() => {
      // Continuously cycle fonts for each character
      setCharStates((prev) => {
        if (prev.length === 0) return prev
        
        return prev.map((char) => {
          // Each character changes font independently with lower probability for smoother transitions
          if (Math.random() < 0.3) { // 30% chance to change font each update
            return {
              font: fonts[Math.floor(Math.random() * fonts.length)],
              offset: (Math.random() - 0.5) * 12, // Reduced offset range
            }
          }
          // Occasionally adjust offset even if font doesn't change
          if (Math.random() < 0.2) {
            return {
              ...char,
              offset: (Math.random() - 0.5) * 12, // Reduced offset range
            }
          }
          return char
        })
      })
    }, updateInterval)

    return () => clearInterval(interval)
  }, [text, onComplete])

  if (charStates.length === 0) {
    // Show text with white color while loading
    return (
      <div className="inline-block text-white">
        {text}
      </div>
    )
  }

  return (
    <div className="inline-block">
      {text.split('').map((char, index) => {
        const charState = charStates[index]
        if (!charState) {
          return <span key={index} className="inline-block text-white">{char === ' ' ? '\u00A0' : char}</span>
        }
        
        return (
          <motion.span
            key={index}
            style={{
              fontFamily: charState.font,
              display: 'inline-block',
              color: '#ffffff',
            }}
            animate={{
              transform: `translateY(${charState.offset}px)`,
            }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1], // Custom easing for smoother motion
            }}
            className="inline-block text-white"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        )
      })}
    </div>
  )
}

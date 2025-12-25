'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Loading() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="relative">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-primary via-accent to-primary blur-2xl"
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        />
        
        <motion.div
          className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 blur-xl"
          animate={{ 
            scale: [1.5, 1, 1.5],
            rotate: [360, 180, 0],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: 0.5
          }}
        />

        {/* Center content */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            className="text-3xl font-bold"
            style={{
              backgroundImage: 'linear-gradient(135deg, #3b82f6, #ef4444, #8b5cf6, #f59e0b)',
              backgroundSize: '300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 2s ease infinite',
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            AM
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-secondary rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundSize: '200%',
              animation: 'gradient-shift 1s ease infinite',
            }}
          />
        </div>

        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [
                Math.cos((i * Math.PI * 2) / 8) * 40,
                Math.cos((i * Math.PI * 2) / 8) * 60,
                Math.cos((i * Math.PI * 2) / 8) * 40,
              ],
              y: [
                Math.sin((i * Math.PI * 2) / 8) * 40,
                Math.sin((i * Math.PI * 2) / 8) * 60,
                Math.sin((i * Math.PI * 2) / 8) * 40,
              ],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

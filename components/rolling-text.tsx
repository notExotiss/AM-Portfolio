'use client'

import React from 'react'

/**
 * Per-character rolling text that uses the `.rolling-char` CSS system
 * in globals.css for a staggered character-by-character hover animation.
 * Falls back gracefully — always readable even before hover.
 */
export default function RollingText({ text }: { text: string }) {
  return (
    <span className="inline-flex relative" aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="rolling-char"
          data-char={char === ' ' ? '\u00A0' : char}
          style={{ ['--roll-delay' as string]: `${i * 28}ms` }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

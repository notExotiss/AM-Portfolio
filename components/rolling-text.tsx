'use client'

import React from 'react'

export default function RollingText({ text }: { text: string }) {
  return (
    <span className="rolling-text" aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="rolling-char"
          style={
            {
              ['--roll-delay' as string]: `${i * 26}ms`,
              ['--roll-lift' as string]:
                ['-0.34em', '-0.44em', '-0.52em', '-0.4em', '-0.48em'][i % 5],
              ['--roll-drop' as string]:
                ['0.06em', '0.11em', '0.08em', '0.13em', '0.07em'][i % 5],
              ['--roll-tilt' as string]:
                ['-5deg', '7deg', '-9deg', '5deg', '-7deg'][i % 5],
              ['--roll-rebound-tilt' as string]:
                ['2deg', '-3deg', '4deg', '-2deg', '3deg'][i % 5],
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          <span className="rolling-char-face">{char === ' ' ? '\u00A0' : char}</span>
        </span>
      ))}
    </span>
  )
}

'use client'

import type { CSSProperties } from 'react'
import AboutFlowLines from './about-flow-lines'
import AboutSurface from './about-surface'
import { cn } from '@/lib/utils'

type AboutBackdropProps = Readonly<{
  className?: string
  style?: CSSProperties
  anchorTopPx?: number
  referenceHeightPx?: number
}>

export default function AboutBackdrop({
  className,
  style,
  anchorTopPx,
  referenceHeightPx,
}: AboutBackdropProps) {
  if (
    typeof anchorTopPx !== 'number' ||
    typeof referenceHeightPx !== 'number' ||
    referenceHeightPx <= 0
  ) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'about-stage paper-stage pointer-events-none overflow-hidden',
          className
        )}
        style={{
          inset: 0,
          position: 'absolute',
          ...style,
        }}
      >
        <AboutSurface />
        <AboutFlowLines className="absolute inset-0" />
      </div>
    )
  }

  const coolCoreY = anchorTopPx + referenceHeightPx * 0.16
  const warmCoreY = anchorTopPx + referenceHeightPx * 0.18
  const coolWashY = anchorTopPx + referenceHeightPx * 0.72
  const warmWashY = anchorTopPx + referenceHeightPx * 0.24
  const coolTintY = anchorTopPx + referenceHeightPx * 0.76
  const warmTintY = anchorTopPx + referenceHeightPx * 0.24

  return (
    <div
      aria-hidden="true"
      className={cn(
        'hero-about-transition-surface pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
      style={style}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 14% ${coolCoreY}px, rgba(191, 221, 229, 0.72), transparent 18%),
            radial-gradient(circle at 84% ${warmCoreY}px, rgba(251, 210, 200, 0.38), transparent 20%),
            linear-gradient(135deg, #f2ede7 0%, #e7eceb 42%, #efe0d6 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          animation: 'ambient-shift 20s ease-in-out infinite',
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800' fill='none'%3E%3Cpath d='M-70 144C70 26 238 14 326 108C414 202 582 212 694 110C806 8 992 2 1180 110' stroke='%23101318' stroke-opacity='0.08'/%3E%3Cpath d='M-84 390C50 286 204 282 304 360C404 438 572 456 706 356C840 256 1040 246 1228 360' stroke='%23101318' stroke-opacity='0.06'/%3E%3Cpath d='M-74 654C48 560 214 552 320 620C426 688 598 694 736 610C874 526 1060 524 1230 622' stroke='%23101318' stroke-opacity='0.05'/%3E%3C/svg%3E"),
            linear-gradient(rgba(16, 17, 20, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 17, 20, 0.05) 1px, transparent 1px)
          `,
          backgroundPosition: `center ${anchorTopPx}px, 0 0, 0 0`,
          backgroundRepeat: 'no-repeat, repeat, repeat',
          backgroundSize: `100% ${referenceHeightPx}px, 96px 96px, 96px 96px`,
          maskImage: `radial-gradient(circle at 50% ${anchorTopPx + referenceHeightPx * 0.5}px, black 34%, transparent 92%)`,
          opacity: 0.34,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 18% ${coolWashY}px, rgba(133, 196, 213, 0.12), transparent 20%),
            radial-gradient(circle at 76% ${warmWashY}px, rgba(255, 205, 188, 0.12), transparent 18%),
            repeating-linear-gradient(
              135deg,
              transparent 0 72px,
              rgba(16, 17, 20, 0.04) 72px 73px,
              transparent 73px 146px
            )
          `,
          opacity: 0.38,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 24% ${coolTintY}px, rgba(110, 167, 183, 0.14), transparent 20%),
            radial-gradient(circle at 78% ${warmTintY}px, rgba(235, 178, 160, 0.14), transparent 18%)
          `,
        }}
      />
      <AboutSurface />
      <AboutFlowLines
        className="absolute inset-0"
        anchorTopPx={anchorTopPx}
        referenceHeightPx={referenceHeightPx}
      />
    </div>
  )
}

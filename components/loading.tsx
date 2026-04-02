'use client'

import * as htmlToImage from 'html-to-image'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type LoadingProps = {
  ready: boolean
  onComplete?: () => void
}

type SnapshotBuffer = {
  data: Uint8ClampedArray
  width: number
  height: number
  scrollX: number
  scrollY: number
}

const averageColor = (
  snapshot: SnapshotBuffer,
  startX: number,
  startY: number,
  width: number,
  height: number
) => {
  let red = 0
  let green = 0
  let blue = 0
  let count = 0

  const endX = Math.min(startX + width, snapshot.width)
  const endY = Math.min(startY + height, snapshot.height)

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const index = (y * snapshot.width + x) * 4
      red += snapshot.data[index]
      green += snapshot.data[index + 1]
      blue += snapshot.data[index + 2]
      count += 1
    }
  }

  if (!count) {
    return [0, 0, 0] as const
  }

  return [
    Math.trunc(red / count),
    Math.trunc(green / count),
    Math.trunc(blue / count),
  ] as const
}

const buildPixelSizes = () => {
  return [128, 96, 72, 52, 38, 28, 20, 14, 10, 7, 5, 3, 2, 1]
}

export default function Loading({ ready, onComplete }: Readonly<LoadingProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const completeTimeoutRef = useRef<number>()
  const [fadeOut, setFadeOut] = useState(false)
  const [snapshotCanvas, setSnapshotCanvas] = useState<HTMLCanvasElement | null>(null)
  const [snapshotBuffer, setSnapshotBuffer] = useState<SnapshotBuffer | null>(null)

  useEffect(() => {
    if (!ready || snapshotCanvas) {
      return
    }

    let cancelled = false

    const capture = async () => {
      /* Wait extra frames so all components mount and render fully */
      await new Promise<void>((resolve) => {
        let frameCount = 0
        const waitFrames = () => {
          frameCount++
          if (frameCount >= 6) {
            resolve()
          } else {
            globalThis.requestAnimationFrame(waitFrames)
          }
        }
        globalThis.requestAnimationFrame(waitFrames)
      })

      /* Extra delay to let GSAP initial states, fonts and images settle */
      await document.fonts.ready
      await new Promise<void>((resolve) => {
        globalThis.setTimeout(() => resolve(), 150)
      })

      // Target main instead of body to avoid capturing browser scrollbars natively
      const target = document.querySelector('[data-page-capture]') as HTMLElement || document.body
      const dpr = globalThis.devicePixelRatio || 1
      const initScrollX = globalThis.scrollX
      const initScrollY = globalThis.scrollY

      // Fix SVH collapsing inside SVG foreignObject by enforcing explicit physical pixels
      const vhElements = document.querySelectorAll('.min-h-\\[100svh\\], .min-h-screen, .h-screen, .h-\\[100svh\\]')
      const originalStyles: Array<{ el: HTMLElement; h: string }> = []
      
      vhElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        originalStyles.push({ el: htmlEl, h: htmlEl.style.minHeight })
        htmlEl.style.minHeight = `${globalThis.innerHeight}px`
      })

      // Ensure we preserve the exact scroll layout without tweaking body overflow,
      // which would otherwise cause a ~17px layer shift discrepancy.

      try {
        const viewportWidth = document.documentElement.clientWidth
        const viewportHeight = globalThis.innerHeight
        
        const snapshot = await htmlToImage.toCanvas(target, {
          width: viewportWidth,
          height: viewportHeight,
          canvasWidth: viewportWidth * dpr,
          canvasHeight: viewportHeight * dpr,
          pixelRatio: dpr,
          backgroundColor: '#05070d',
          filter: (node: HTMLElement) => {
            if (!node?.dataset) return true
            return !('loaderRoot' in node.dataset || 'html2canvasIgnore' in node.dataset)
          },
        })

        if (cancelled) {
          return
        }

        const context = snapshot.getContext('2d', { willReadFrequently: true })
        if (!context) {
          onComplete?.()
          return
        }

        const imageData = context.getImageData(0, 0, snapshot.width, snapshot.height)
        setSnapshotCanvas(snapshot)
        setSnapshotBuffer({
          data: imageData.data,
          width: snapshot.width,
          height: snapshot.height,
          scrollX: initScrollX,
          scrollY: initScrollY,
        })
      } catch {
        onComplete?.()
      } finally {
        originalStyles.forEach(({ el, h }) => {
          el.style.minHeight = h
        })
      }
    }

    capture()

    return () => {
      cancelled = true
    }
  }, [onComplete, ready, snapshotCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !snapshotCanvas || !snapshotBuffer) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      onComplete?.()
      return
    }

    const dpr = globalThis.devicePixelRatio || 1
    const width = document.documentElement.clientWidth
    const height = globalThis.innerHeight
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = width * dpr
    canvas.height = height * dpr
    
    // Scale the context so our CSS-pixel coordinate math still works, 
    // but the actual canvas buffer has high-DPI physical pixels.
    context.scale(dpr, dpr)

    const pixelSizes = buildPixelSizes()
    let stepIndex = 0
    let stepStart: number | null = null
    const stepDurations = pixelSizes.map((size, index) => {
      if (size >= 80) return 200
      if (size >= 30) return 160
      if (index >= pixelSizes.length - 3) return 120
      return 110
    })

    const drawPixelated = (pixelSize: number) => {
      context.clearRect(0, 0, width, height)

      const sourceX = Math.max(0, snapshotBuffer.scrollX * dpr)
      const sourceY = Math.max(0, snapshotBuffer.scrollY * dpr)

      if (pixelSize <= 1) {
        context.drawImage(
          snapshotCanvas,
          sourceX,
          sourceY,
          width * dpr,
          height * dpr,
          0,
          0,
          width,
          height
        )
        return
      }

      const cols = Math.ceil(width / pixelSize)
      const rows = Math.ceil(height / pixelSize)

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const pixelX = col * pixelSize
          const pixelY = row * pixelSize
          const sampleX = Math.floor(sourceX + (pixelX / width) * (width * dpr))
          const sampleY = Math.floor(sourceY + (pixelY / height) * (height * dpr))
          const sampleWidth = Math.max(1, Math.floor((pixelSize / width) * (width * dpr)))
          const sampleHeight = Math.max(1, Math.floor((pixelSize / height) * (height * dpr)))

          const [red, green, blue] = averageColor(
            snapshotBuffer,
            sampleX,
            sampleY,
            sampleWidth,
            sampleHeight
          )

          context.fillStyle = `rgb(${red},${green},${blue})`
          context.fillRect(pixelX, pixelY, pixelSize + 1, pixelSize + 1)
        }
      }
    }

    const animate = (timestamp: number) => {
      stepStart ??= timestamp

      drawPixelated(pixelSizes[stepIndex])

      if (timestamp - stepStart >= stepDurations[stepIndex]) {
        stepIndex += 1
        stepStart = timestamp

        if (stepIndex >= pixelSizes.length) {
          setFadeOut(true)
          completeTimeoutRef.current = globalThis.setTimeout(() => {
            onComplete?.()
          }, 400) as unknown as number
          return
        }
      }

      animationFrameRef.current = globalThis.requestAnimationFrame(animate)
    }

    animationFrameRef.current = globalThis.requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        globalThis.cancelAnimationFrame(animationFrameRef.current)
      }
      if (completeTimeoutRef.current) {
        globalThis.clearTimeout(completeTimeoutRef.current)
      }
    }
  }, [onComplete, snapshotBuffer, snapshotCanvas])

  return (
    <motion.div
      data-loader-root="true"
      data-html2canvas-ignore="true"
      className="pointer-events-none fixed inset-0 z-[110] bg-[#05070d]"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute left-0 top-0 block [image-rendering:pixelated]"
      />
    </motion.div>
  )
}

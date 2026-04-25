'use client'

import html2canvas from 'html2canvas'
import * as htmlToImage from 'html-to-image'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type LoadingProps = {
  compactLayout: boolean
  ready: boolean
  onComplete?: () => void
}

type LoaderFrame = {
  buffer: SnapshotBuffer
  canvas: HTMLCanvasElement
}

type SnapshotBuffer = {
  data: Uint8ClampedArray
  width: number
  height: number
  scrollX: number
  scrollY: number
}

const CAPTURE_TIMEOUT_MS = {
  compact: 1400,
  desktop: 2400,
} as const

const waitForCaptureWindow = async (compactLayout: boolean) => {
  await new Promise<void>((resolve) => {
    let frameCount = 0
    const waitFrames = () => {
      frameCount += 1
      if (frameCount >= (compactLayout ? 2 : 3)) {
        resolve()
      } else {
        globalThis.requestAnimationFrame(waitFrames)
      }
    }
    globalThis.requestAnimationFrame(waitFrames)
  })

  if ('fonts' in document) {
    await document.fonts.ready
  }
}

const captureWithHtmlToImage = async ({
  compactLayout,
  dpr,
  target,
  viewportHeight,
  viewportWidth,
}: {
  compactLayout: boolean
  dpr: number
  target: HTMLElement
  viewportHeight: number
  viewportWidth: number
}) => {
  return Promise.race([
    htmlToImage
      .toCanvas(target, {
        width: viewportWidth,
        height: viewportHeight,
        canvasWidth: Math.max(1, Math.round(viewportWidth * dpr)),
        canvasHeight: Math.max(1, Math.round(viewportHeight * dpr)),
        pixelRatio: dpr,
        backgroundColor: '#05070d',
        cacheBust: true,
        includeQueryParams: true,
        filter: (node: HTMLElement) => {
          if (!node?.dataset) {
            return true
          }
          return !(
            'loaderRoot' in node.dataset || 'html2canvasIgnore' in node.dataset
          )
        },
      })
      .catch(() => null),
    new Promise<null>((resolve) => {
      globalThis.setTimeout(
        () => resolve(null),
        compactLayout ? CAPTURE_TIMEOUT_MS.compact : CAPTURE_TIMEOUT_MS.desktop
      )
    }),
  ])
}

const captureWithHtml2Canvas = async ({
  compactLayout,
  dpr,
  scrollX,
  scrollY,
  target,
  viewportHeight,
  viewportWidth,
}: {
  compactLayout: boolean
  dpr: number
  scrollX: number
  scrollY: number
  target: HTMLElement
  viewportHeight: number
  viewportWidth: number
}) => {
  return Promise.race([
    html2canvas(target, {
      allowTaint: true,
      backgroundColor: '#05070d',
      foreignObjectRendering: false,
      height: viewportHeight,
      ignoreElements: (node) =>
        node instanceof HTMLElement &&
        ('loaderRoot' in node.dataset || 'html2canvasIgnore' in node.dataset),
      logging: false,
      removeContainer: true,
      scale: dpr,
      scrollX,
      scrollY,
      useCORS: true,
      width: viewportWidth,
      windowHeight: viewportHeight,
      windowWidth: viewportWidth,
      x: scrollX,
      y: scrollY,
    }).catch(() => null),
    new Promise<null>((resolve) => {
      globalThis.setTimeout(
        () => resolve(null),
        compactLayout ? CAPTURE_TIMEOUT_MS.compact : CAPTURE_TIMEOUT_MS.desktop
      )
    }),
  ])
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

const getCaptureDpr = (compactLayout: boolean) => {
  const dpr = globalThis.devicePixelRatio || 1
  return Math.min(dpr, compactLayout ? 1.35 : 2)
}

const getLoaderPixelSizes = (compactLayout: boolean) => {
  return compactLayout
    ? [96, 72, 52, 38, 28, 20, 14, 10, 7, 5, 3, 2, 1]
    : buildPixelSizes()
}

const createFrameFromCanvas = (
  canvas: HTMLCanvasElement,
  scrollX: number,
  scrollY: number
) => {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    return null
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  return {
    canvas,
    buffer: {
      data: imageData.data,
      width: canvas.width,
      height: canvas.height,
      scrollX,
      scrollY,
    },
  } satisfies LoaderFrame
}

const configureCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr: number
) => {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    return null
  }

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = false

  return context
}

const renderFrameToCanvas = ({
  context,
  dpr,
  frame,
  height,
  pixelSize,
  width,
}: {
  context: CanvasRenderingContext2D
  dpr: number
  frame: LoaderFrame
  height: number
  pixelSize: number
  width: number
}) => {
  context.clearRect(0, 0, width, height)

  const sourceX = Math.max(0, Math.floor(frame.buffer.scrollX * dpr))
  const sourceY = Math.max(0, Math.floor(frame.buffer.scrollY * dpr))

  if (pixelSize <= 1) {
    context.drawImage(
      frame.canvas,
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
      const sampleWidth = Math.max(
        1,
        Math.floor((pixelSize / width) * (width * dpr))
      )
      const sampleHeight = Math.max(
        1,
        Math.floor((pixelSize / height) * (height * dpr))
      )

      const [red, green, blue] = averageColor(
        frame.buffer,
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

export default function Loading({
  compactLayout,
  ready,
  onComplete,
}: Readonly<LoadingProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const completeTimeoutRef = useRef<number>()
  const [fadeOut, setFadeOut] = useState(false)
  const [resolvedFrame, setResolvedFrame] = useState<LoaderFrame | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('loader-active')

    return () => {
      document.documentElement.classList.remove('loader-active')
      document.documentElement.classList.remove('loader-capture')
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const width = document.documentElement.clientWidth
    const height = globalThis.innerHeight
    const dpr = getCaptureDpr(compactLayout)
    const context = configureCanvas(canvas, width, height, dpr)

    if (!context) {
      return
    }

    context.clearRect(0, 0, width, height)
  }, [compactLayout])

  useEffect(() => {
    if (!ready || resolvedFrame) {
      return
    }

    let cancelled = false

    const capture = async () => {
      document.documentElement.classList.add('loader-capture')
      await waitForCaptureWindow(compactLayout)

      const target =
        (document.querySelector('[data-page-capture]') as HTMLElement) ??
        document.body
      const dpr = getCaptureDpr(compactLayout)
      const initScrollX = globalThis.scrollX
      const initScrollY = globalThis.scrollY

      const vhElements = document.querySelectorAll(
        '.min-h-\\[100svh\\], .min-h-screen, .h-screen, .h-\\[100svh\\]'
      )
      const originalStyles: Array<{ el: HTMLElement; h: string }> = []

      vhElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        originalStyles.push({ el: htmlEl, h: htmlEl.style.minHeight })
        htmlEl.style.minHeight = `${globalThis.innerHeight}px`
      })

      try {
        const viewportWidth = document.documentElement.clientWidth
        const viewportHeight = globalThis.innerHeight
        const captureStrategies = compactLayout
          ? [
              () =>
                captureWithHtml2Canvas({
                  compactLayout,
                  dpr,
                  scrollX: initScrollX,
                  scrollY: initScrollY,
                  target,
                  viewportHeight,
                  viewportWidth,
                }),
              () =>
                captureWithHtmlToImage({
                  compactLayout,
                  dpr,
                  target,
                  viewportHeight,
                  viewportWidth,
                }),
            ]
          : [
              () =>
                captureWithHtmlToImage({
                  compactLayout,
                  dpr,
                  target,
                  viewportHeight,
                  viewportWidth,
                }),
              () =>
                captureWithHtml2Canvas({
                  compactLayout,
                  dpr,
                  scrollX: initScrollX,
                  scrollY: initScrollY,
                  target,
                  viewportHeight,
                  viewportWidth,
                }),
            ]

        let snapshot: HTMLCanvasElement | null = null

        for (const captureFrame of captureStrategies) {
          snapshot = await captureFrame()
          if (snapshot || cancelled) {
            break
          }
          await waitForCaptureWindow(compactLayout)
        }

        if (cancelled) {
          return
        }

        if (!snapshot) {
          onComplete?.()
          return
        }

        const frame = createFrameFromCanvas(snapshot, initScrollX, initScrollY)
        if (!frame) {
          onComplete?.()
          return
        }

        setResolvedFrame(frame)
      } catch {
        if (cancelled) {
          return
        }

        onComplete?.()
      } finally {
        document.documentElement.classList.remove('loader-capture')
        originalStyles.forEach(({ el, h }) => {
          el.style.minHeight = h
        })
      }
    }

    capture()

    return () => {
      cancelled = true
    }
  }, [compactLayout, onComplete, ready, resolvedFrame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !resolvedFrame) {
      return
    }

    const dpr = getCaptureDpr(compactLayout)
    const width = document.documentElement.clientWidth
    const height = globalThis.innerHeight
    const context = configureCanvas(canvas, width, height, dpr)
    if (!context) {
      onComplete?.()
      return
    }

    const pixelSizes = getLoaderPixelSizes(compactLayout)
    let stepIndex = 0
    let stepStart: number | null = null
    const stepDurations = pixelSizes.map((size, index) => {
      if (size >= 80) return compactLayout ? 160 : 200
      if (size >= 30) return compactLayout ? 130 : 160
      if (index >= pixelSizes.length - 3) return compactLayout ? 95 : 120
      return 110
    })

    const animate = (timestamp: number) => {
      stepStart ??= timestamp

      renderFrameToCanvas({
        context,
        dpr,
        frame: resolvedFrame,
        height,
        pixelSize: pixelSizes[stepIndex],
        width,
      })

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
  }, [compactLayout, onComplete, resolvedFrame])

  return (
    <motion.div
      data-loader-root="true"
      data-html2canvas-ignore="true"
      className="pointer-events-none fixed inset-0 z-[110] bg-[#05070d]"
      style={{
        backgroundColor: '#05070d',
        inset: 0,
        pointerEvents: 'none',
        position: 'fixed',
        zIndex: 110,
      }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute left-0 top-0 block [image-rendering:pixelated]"
        style={{
          height: '100%',
          imageRendering: 'pixelated',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      />
    </motion.div>
  )
}

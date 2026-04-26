'use client'

import html2canvas from 'html2canvas'
import * as htmlToImage from 'html-to-image'
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { ArrowRight, FileText } from 'lucide-react'
import { scrollToSection } from '@/lib/scroll-to-section'
import AboutBackdrop from './about-backdrop'
import HeroObjectScene from './hero-object-scene'
import RollingText from './rolling-text'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

type PointerState = {
  x: number
  y: number
}

type Particle = {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  depth: number
  blur: number
}

type Point = {
  x: number
  y: number
}

type DecayPatch = {
  id: string
  centerX: number
  centerY: number
  radiusX: number
  radiusY: number
  enterStart: number
  enterEnd: number
  bloomStart: number
  bloomScale: number
  fillScale: number
  driftX: number
  driftY: number
  spreadX: number
  spreadY: number
  seed: number
}

const HERO_SNAPSHOT_TIMEOUT_MS = 1200

const decayPatches: DecayPatch[] = [
  {
    id: 'north-west',
    centerX: 14,
    centerY: 21,
    radiusX: 4.2,
    radiusY: 5.6,
    enterStart: 0.04,
    enterEnd: 0.11,
    bloomStart: 0.6,
    bloomScale: 2.45,
    fillScale: 5.4,
    driftX: -1.15,
    driftY: -0.6,
    spreadX: -18,
    spreadY: -10,
    seed: 0.8,
  },
  {
    id: 'north-east',
    centerX: 78,
    centerY: 19,
    radiusX: 4.4,
    radiusY: 5.4,
    enterStart: 0.08,
    enterEnd: 0.17,
    bloomStart: 0.62,
    bloomScale: 2.55,
    fillScale: 5.5,
    driftX: 1.05,
    driftY: -0.55,
    spreadX: 17,
    spreadY: -10,
    seed: 1.9,
  },
  {
    id: 'upper-core',
    centerX: 49,
    centerY: 37,
    radiusX: 5.1,
    radiusY: 4.7,
    enterStart: 0.18,
    enterEnd: 0.29,
    bloomStart: 0.66,
    bloomScale: 2.35,
    fillScale: 5.2,
    driftX: -0.35,
    driftY: 0.5,
    spreadX: 2,
    spreadY: -4,
    seed: 3.2,
  },
  {
    id: 'lower-west',
    centerX: 20,
    centerY: 63,
    radiusX: 5,
    radiusY: 6.1,
    enterStart: 0.33,
    enterEnd: 0.46,
    bloomStart: 0.68,
    bloomScale: 2.75,
    fillScale: 5.8,
    driftX: -0.9,
    driftY: 0.72,
    spreadX: -16,
    spreadY: 9,
    seed: 4.9,
  },
  {
    id: 'mid-right',
    centerX: 76,
    centerY: 55,
    radiusX: 5.2,
    radiusY: 5.6,
    enterStart: 0.46,
    enterEnd: 0.59,
    bloomStart: 0.71,
    bloomScale: 2.85,
    fillScale: 5.9,
    driftX: 0.82,
    driftY: -0.4,
    spreadX: 16,
    spreadY: 6,
    seed: 6.2,
  },
  {
    id: 'south-core',
    centerX: 49,
    centerY: 81,
    radiusX: 6,
    radiusY: 5.4,
    enterStart: 0.61,
    enterEnd: 0.74,
    bloomStart: 0.75,
    bloomScale: 3.05,
    fillScale: 6.4,
    driftX: -0.18,
    driftY: 1.05,
    spreadX: 0,
    spreadY: 18,
    seed: 7.5,
  },
]

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const smoothstep = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start), 0, 1)
  return t * t * (3 - 2 * t)
}

function smoothLoopPoints(points: Point[]) {
  if (points.length < 3) {
    return points
  }

  return points.map((_, index) => {
    const previous = points[(index - 1 + points.length) % points.length]
    const current = points[index]
    const next = points[(index + 1) % points.length]

    return {
      x: previous.x * 0.2 + current.x * 0.6 + next.x * 0.2,
      y: previous.y * 0.2 + current.y * 0.6 + next.y * 0.2,
    }
  })
}

function buildClosedSoftPath(points: Point[], reverse = false) {
  if (points.length < 3) {
    return ''
  }

  const orderedPoints = reverse ? [...points].reverse() : points
  const midpoints = orderedPoints.map((point, index) => {
    const next = orderedPoints[(index + 1) % orderedPoints.length]
    return {
      x: (point.x + next.x) / 2,
      y: (point.y + next.y) / 2,
    }
  })

  let path = `M ${midpoints[midpoints.length - 1].x.toFixed(2)} ${midpoints[midpoints.length - 1].y.toFixed(2)}`

  for (let index = 0; index < orderedPoints.length; index += 1) {
    const current = orderedPoints[index]
    const midpoint = midpoints[index]

    path += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)}, ${midpoint.x.toFixed(2)} ${midpoint.y.toFixed(2)}`
  }

  return `${path} Z`
}

function buildPatchPath(
  patch: DecayPatch,
  progress: number,
  time: number,
  detailScale = 1,
  expansionBoost = 1,
  simplify = false
) {
  const appear = smoothstep(patch.enterStart - 0.015, patch.enterEnd + 0.03, progress)

  if (appear <= 0.001) {
    return []
  }

  const settle = smoothstep(patch.enterStart + 0.015, 0.52, progress)
  const bloom = smoothstep(patch.bloomStart + 0.02, 0.86, progress)
  const spread = smoothstep(0.82, 0.992, progress)
  const scale =
    0.015 +
    appear * 0.64 +
    settle * 0.8 +
    bloom * patch.bloomScale +
    spread * patch.fillScale
  const expandedScale = scale * expansionBoost

  const centerDrift = 0.1 + appear * 0.22 + bloom * 0.36 + spread * 0.44
  const centerX =
    patch.centerX +
    Math.sin(time * 0.41 + patch.seed * 1.08) * patch.driftX * centerDrift +
    Math.cos(time * 0.27 + patch.seed * 0.74) * 0.28 +
    bloom * patch.spreadX * 0.22 +
    spread * patch.spreadX
  const centerY =
    patch.centerY +
    Math.cos(time * 0.37 + patch.seed * 0.92) * patch.driftY * centerDrift +
    Math.sin(time * 0.23 + patch.seed * 1.36) * 0.24 +
    bloom * patch.spreadY * 0.22 +
    spread * patch.spreadY

  const radiusPulse =
    1 +
    Math.sin(time * 0.33 + patch.seed * 1.7) * 0.03 +
    Math.cos(time * 0.25 + patch.seed * 0.8) * 0.02
  const radiusX = patch.radiusX * expandedScale * radiusPulse
  const radiusY = patch.radiusY * expandedScale * radiusPulse
  const rotation = Math.sin(time * 0.22 + patch.seed * 0.82) * 0.08
  const seedUnitA = Math.sin(patch.seed * 1.37) * 0.5 + 0.5
  const seedUnitB = Math.cos(patch.seed * 0.91) * 0.5 + 0.5
  const detailInfluence = 0.58 + Math.min(detailScale, 1) * 0.42
  const pointCount = simplify
    ? Math.max(10, Math.round((12 + seedUnitA * 4) * detailScale))
    : Math.max(12, Math.round((20 + seedUnitA * 8) * detailScale))
  const chaos = simplify
    ? (0.022 + appear * 0.018 + bloom * 0.025 + spread * 0.03) *
      detailInfluence
    : (0.07 + appear * 0.05 + bloom * 0.07 + spread * 0.1) * detailInfluence
  const tearAngle =
    Math.atan2(patch.spreadY || 0.001, patch.spreadX || 0.001) +
    Math.sin(time * 0.09 + patch.seed) * (simplify ? 0.03 : 0.08)
  const tearStrength = simplify
    ? 0
    : (0.18 + appear * 0.08 + bloom * 0.12 + spread * 0.18) *
      (0.82 + Math.min(Math.hypot(patch.spreadX, patch.spreadY) / 18, 0.9))
  const asymmetry = simplify ? 0.08 + seedUnitB * 0.1 : 0.16 + seedUnitB * 0.22
  const lobeFrequencyA = simplify ? 1.35 + seedUnitA * 0.55 : 1.7 + seedUnitA * 1.4
  const lobeFrequencyB = simplify ? 2.2 + seedUnitB * 0.8 : 3.1 + seedUnitB * 2.1
  const lobeFrequencyC = simplify ? 3.2 + seedUnitA * 0.7 : 5.4 + seedUnitA * 1.6
  const rawPoints: Point[] = []

  for (let index = 0; index < pointCount; index += 1) {
    const angle = (index / pointCount) * Math.PI * 2
    const forward = Math.max(Math.cos(angle - tearAngle), 0)
    const backward = Math.max(Math.cos(angle - tearAngle - Math.PI), 0)
    const tear = Math.pow(forward, 2.4) * tearStrength
    const compression = Math.pow(backward, 1.8) * tearStrength * 0.22
    const lobeA =
      Math.sin(angle * lobeFrequencyA + time * 0.66 + patch.seed * 1.2) *
      chaos *
      1.06
    const lobeB =
      Math.cos(angle * lobeFrequencyB - time * 0.42 + patch.seed * 0.9) *
      chaos *
      0.82
    const lobeC =
      Math.sin(angle * lobeFrequencyC + time * 0.29 + patch.seed * 1.86) *
      chaos *
      0.44
    const microTear =
      Math.sin(angle * (7.2 + seedUnitB * 1.4) - time * 0.17 + patch.seed * 1.4) *
      chaos *
      (simplify ? 0.04 : 0.14)
    const pulse =
      Math.sin(time * 0.53 + patch.seed * 2.2) * 0.024 +
      Math.cos(time * 0.29 + patch.seed * 1.1) * 0.012
    const contourScale = clamp(
      simplify
        ? 1 + lobeA * 0.42 + lobeB * 0.24 + lobeC * 0.12 + microTear + pulse
        : 1 + lobeA + lobeB * 0.68 + lobeC + microTear + tear - compression + pulse,
      simplify ? 0.8 : 0.58,
      simplify ? 1.22 : 1.9
    )
    const sideBias =
      Math.sin(angle - tearAngle + Math.PI / 2) * asymmetry * (simplify ? 0.6 : 1)
    const xRadius = radiusX * contourScale * (1 + sideBias * (simplify ? 0.08 : 0.18))
    const yRadius = radiusY * contourScale * (1 - sideBias * (simplify ? 0.06 : 0.14))
    const angleOffset =
      angle +
      rotation +
      Math.sin(time * 0.23 + patch.seed) * (simplify ? 0.02 : 0.05) +
      Math.sin(angle * 2.6 + time * 0.14 + patch.seed) * chaos * (simplify ? 0.018 : 0.04)

    rawPoints.push({
      x: clamp(centerX + Math.cos(angleOffset) * xRadius, -180, 280),
      y: clamp(centerY + Math.sin(angleOffset) * yRadius, -180, 280),
    })
  }

  return smoothLoopPoints(rawPoints)
}

function buildHeroMaskPath(
  progress: number,
  time: number,
  detailScale = 1,
  expansionBoost = 1,
  simplify = false
) {
  return decayPatches
    .map((patch) =>
      buildClosedSoftPath(
        buildPatchPath(
          patch,
          progress,
          time,
          detailScale,
          expansionBoost,
          simplify
        ),
        true
      )
    )
    .filter(Boolean)
    .join(' ')
}

function traceClosedSoftPathOnCanvas(
  context: CanvasRenderingContext2D,
  points: Point[],
  reverse = false
) {
  if (points.length < 3) {
    return
  }

  const orderedPoints = reverse ? [...points].reverse() : points
  const midpoints = orderedPoints.map((point, index) => {
    const next = orderedPoints[(index + 1) % orderedPoints.length]
    return {
      x: (point.x + next.x) / 2,
      y: (point.y + next.y) / 2,
    }
  })

  context.moveTo(midpoints[midpoints.length - 1].x, midpoints[midpoints.length - 1].y)

  for (let index = 0; index < orderedPoints.length; index += 1) {
    const current = orderedPoints[index]
    const midpoint = midpoints[index]
    context.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y)
  }

  context.closePath()
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.45,
    duration: 12 + Math.random() * 20,
    delay: Math.random() * -20,
    depth: 0.2 + Math.random() * 0.8,
    blur: Math.random() > 0.7 ? 1 + Math.random() * 2 : 0,
  }))
}

const waitForHeroCaptureWindow = async () => {
  await new Promise<void>((resolve) => {
    let frameCount = 0

    const waitFrames = () => {
      frameCount += 1
      if (frameCount >= 2) {
        resolve()
        return
      }

      globalThis.requestAnimationFrame(waitFrames)
    }

    globalThis.requestAnimationFrame(waitFrames)
  })

  if ('fonts' in document) {
    await document.fonts.ready
  }
}

const getHeroSnapshotDpr = (compactLayout: boolean) => {
  const dpr = globalThis.devicePixelRatio || 1
  return Math.min(dpr, compactLayout ? 1 : 1.3)
}

const captureHeroWithHtmlToImage = async ({
  dpr,
  target,
  viewportHeight,
  viewportWidth,
}: {
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

          return !('heroSnapshotOverlay' in node.dataset)
        },
      })
      .catch(() => null),
    new Promise<null>((resolve) => {
      globalThis.setTimeout(() => resolve(null), HERO_SNAPSHOT_TIMEOUT_MS)
    }),
  ])
}

const captureHeroWithHtml2Canvas = async ({
  dpr,
  target,
  viewportHeight,
  viewportWidth,
}: {
  dpr: number
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
        node instanceof HTMLElement && 'heroSnapshotOverlay' in node.dataset,
      logging: false,
      removeContainer: true,
      scale: dpr,
      useCORS: true,
      width: viewportWidth,
      windowHeight: viewportHeight,
      windowWidth: viewportWidth,
    }).catch(() => null),
    new Promise<null>((resolve) => {
      globalThis.setTimeout(() => resolve(null), HERO_SNAPSHOT_TIMEOUT_MS)
    }),
  ])
}

export default function Hero({
  compactLayout = false,
  interactiveReady = false,
  onCompactRevealReady,
  sharedBackdrop = false,
}: Readonly<{
  compactLayout?: boolean
  interactiveReady?: boolean
  onCompactRevealReady?: (ready: boolean) => void
  sharedBackdrop?: boolean
}>) {
  const sectionRef = useRef<HTMLElement>(null)
  const captureRootRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const compactRevealCanvasRef = useRef<HTMLCanvasElement>(null)
  const compactSnapshotSourceRef = useRef<HTMLCanvasElement | null>(null)
  const objectShellRef = useRef<HTMLDivElement>(null)
  const sweepOneRef = useRef<HTMLDivElement>(null)
  const sweepTwoRef = useRef<HTMLDivElement>(null)
  const titleOneRef = useRef<HTMLDivElement>(null)
  const titleTwoRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const btnPrimaryRef = useRef<HTMLButtonElement>(null)
  const btnSecondaryRef = useRef<HTMLButtonElement>(null)
  const particleFieldRef = useRef<HTMLDivElement>(null)
  const maskPathRef = useRef<SVGPathElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const visualStackRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<PointerState>({ x: 0.5, y: 0.48 })
  const progressRef = useRef(0)
  const quickSettersRef = useRef<{
    pointerX?: (value: number) => void
    pointerY?: (value: number) => void
    glowX?: (value: number) => void
    glowY?: (value: number) => void
  }>({})
  const maskId = useId().replace(/:/g, '-')
  const maskFilterId = `${maskId}-merge`

  const [compactSnapshotReady, setCompactSnapshotReady] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [compactViewportHeight, setCompactViewportHeight] = useState(0)

  useEffect(() => {
    setParticles(generateParticles(compactLayout ? 10 : 45))
  }, [compactLayout])

  useEffect(() => {
    if (!compactLayout) {
      setCompactViewportHeight(0)
      return
    }

    const syncViewportHeight = () => {
      setCompactViewportHeight(
        Math.round(window.visualViewport?.height ?? window.innerHeight)
      )
    }

    const visualViewport = window.visualViewport
    syncViewportHeight()
    window.addEventListener('resize', syncViewportHeight)
    window.addEventListener('orientationchange', syncViewportHeight)
    visualViewport?.addEventListener('resize', syncViewportHeight)
    visualViewport?.addEventListener('scroll', syncViewportHeight)

    return () => {
      window.removeEventListener('resize', syncViewportHeight)
      window.removeEventListener('orientationchange', syncViewportHeight)
      visualViewport?.removeEventListener('resize', syncViewportHeight)
      visualViewport?.removeEventListener('scroll', syncViewportHeight)
    }
  }, [compactLayout])

  useEffect(() => {
    if (!compactLayout) {
      compactSnapshotSourceRef.current = null
      setCompactSnapshotReady(false)
      onCompactRevealReady?.(true)
      return
    }

    let cancelled = false
    let captureRafId = 0

    const captureSnapshot = async () => {
      const target = captureRootRef.current
      if (!target) {
        return
      }

      onCompactRevealReady?.(false)
      target.style.removeProperty('opacity')
      target.style.removeProperty('visibility')
      setCompactSnapshotReady(false)
      document.documentElement.classList.add('loader-capture')

      try {
        await waitForHeroCaptureWindow()

        if (cancelled) {
          return
        }

        const rect = target.getBoundingClientRect()
        const viewportWidth = Math.max(
          1,
          Math.round(window.visualViewport?.width ?? rect.width)
        )
        const viewportHeight = Math.max(
          1,
          Math.round(window.visualViewport?.height ?? rect.height)
        )
        const dpr = getHeroSnapshotDpr(compactLayout)

        const strategies = [
          () =>
            captureHeroWithHtml2Canvas({
              dpr,
              target,
              viewportHeight,
              viewportWidth,
            }),
          () =>
            captureHeroWithHtmlToImage({
              dpr,
              target,
              viewportHeight,
              viewportWidth,
            }),
        ]

        let snapshotCanvas: HTMLCanvasElement | null = null
        for (const captureFrame of strategies) {
          snapshotCanvas = await captureFrame()
          if (snapshotCanvas || cancelled) {
            break
          }
        }

        if (cancelled) {
          return
        }

        if (!snapshotCanvas) {
          compactSnapshotSourceRef.current = null
          onCompactRevealReady?.(false)
          return
        }

        compactSnapshotSourceRef.current = snapshotCanvas
        setCompactSnapshotReady(true)
        onCompactRevealReady?.(true)
      } finally {
        document.documentElement.classList.remove('loader-capture')
      }
    }

    const queueCapture = () => {
      if (captureRafId) {
        window.cancelAnimationFrame(captureRafId)
      }

      captureRafId = window.requestAnimationFrame(() => {
        captureRafId = 0
        captureSnapshot()
      })
    }

    queueCapture()

    const visualViewport = window.visualViewport
    window.addEventListener('orientationchange', queueCapture)
    visualViewport?.addEventListener('resize', queueCapture)

    return () => {
      cancelled = true
      compactSnapshotSourceRef.current = null
      setCompactSnapshotReady(false)
      onCompactRevealReady?.(false)
      document.documentElement.classList.remove('loader-capture')
      window.removeEventListener('orientationchange', queueCapture)
      visualViewport?.removeEventListener('resize', queueCapture)
      if (captureRafId) {
        window.cancelAnimationFrame(captureRafId)
      }
    }
  }, [compactLayout, onCompactRevealReady, sharedBackdrop])

  const handleMagnetic = useCallback(
    (event: ReactPointerEvent<HTMLElement>, ref: React.RefObject<HTMLElement | null>) => {
      const element = ref.current
      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (event.clientX - centerX) * 0.3
      const deltaY = (event.clientY - centerY) * 0.3

      gsap.to(element, { x: deltaX, y: deltaY, duration: 0.4, ease: 'power3.out' })
    },
    []
  )

  const resetMagnetic = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    if (!ref.current) {
      return
    }

    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
  }, [])

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current

    if (!section || !interactiveReady) {
      return
    }

    const ctx = gsap.context(() => {
      const orbitItems = gsap.utils.toArray<HTMLElement>('[data-hero-orbit]')
      const bandItems = gsap.utils.toArray<HTMLElement>('[data-hero-band]')
      const routeItems = gsap.utils.toArray<SVGPathElement>('[data-hero-route-line]')

      if (compactLayout) {
        return
      }

      if (sweepOneRef.current) {
        gsap.to(sweepOneRef.current, {
          xPercent: 24,
          duration: 6.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      if (sweepTwoRef.current) {
        gsap.to(sweepTwoRef.current, {
          xPercent: -18,
          duration: 5.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      orbitItems.forEach((item, index) => {
        gsap.to(item, {
          rotate: index % 2 === 0 ? 360 : -360,
          transformOrigin: '50% 50%',
          duration: 40 + index * 9,
          ease: 'none',
          repeat: -1,
        })
      })

      bandItems.forEach((item, index) => {
        gsap.to(item, {
          xPercent: index % 2 === 0 ? 30 : -28,
          duration: 12 + index * 1.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })

      routeItems.forEach((item, index) => {
        gsap.fromTo(
          item,
          { strokeDashoffset: index % 2 === 0 ? 0 : -160 },
          {
            strokeDashoffset: index % 2 === 0 ? -160 : 0,
            duration: 11 + index * 2.5,
            ease: 'none',
            repeat: -1,
          }
        )
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [compactLayout, interactiveReady])

  useIsomorphicLayoutEffect(() => {
    const captureRoot = captureRootRef.current
    const compactRevealCanvas = compactRevealCanvasRef.current
    const compactSnapshotSource = compactSnapshotSourceRef.current
    const section = sectionRef.current
    const copy = copyRef.current
    const objectShell = objectShellRef.current
    const shell = shellRef.current
    const visualStack = visualStackRef.current

    if (
      !captureRoot ||
      !section ||
      !copy ||
      !objectShell ||
      !shell ||
      !visualStack
    ) {
      return
    }

    quickSettersRef.current = {
      pointerX: gsap.quickTo(section, '--pointer-x', {
        duration: 0.42,
        ease: 'power3.out',
      }),
      pointerY: gsap.quickTo(section, '--pointer-y', {
        duration: 0.42,
        ease: 'power3.out',
      }),
      glowX: gsap.quickTo(section, '--glow-x', {
        duration: 0.68,
        ease: 'power3.out',
      }),
      glowY: gsap.quickTo(section, '--glow-y', {
        duration: 0.68,
        ease: 'power3.out',
      }),
    }

    let previousDesktopPath = ''
    const syncDesktopRevealPath = (path: string) => {
      if (path !== previousDesktopPath) {
        maskPathRef.current?.setAttribute('d', path)
        previousDesktopPath = path
      }
    }

    const updateVisualMask = (path: string) => {
      if (!captureRoot) {
        return
      }

      const nextMaskImage = path ? `url(#${maskId})` : 'none'
      captureRoot.style.maskImage = nextMaskImage
      captureRoot.style.maskPosition = 'center'
      captureRoot.style.maskRepeat = 'no-repeat'
      captureRoot.style.maskSize = '100% 100%'
      captureRoot.style.webkitMaskImage = nextMaskImage
      captureRoot.style.webkitMaskPosition = 'center'
      captureRoot.style.webkitMaskRepeat = 'no-repeat'
      captureRoot.style.webkitMaskSize = '100% 100%'
    }

    let previousCompactDrawKey = ''
    const drawCompactRevealFrame = (revealProgress: number) => {
      if (!compactRevealCanvas || !compactSnapshotSource) {
        return false
      }

      const viewportWidth = Math.max(
        1,
        Math.round(window.visualViewport?.width ?? window.innerWidth)
      )
      const viewportHeight = Math.max(
        1,
        Math.round(window.visualViewport?.height ?? window.innerHeight)
      )
      const dpr = getHeroSnapshotDpr(true)
      const pixelWidth = Math.max(1, Math.round(viewportWidth * dpr))
      const pixelHeight = Math.max(1, Math.round(viewportHeight * dpr))
      const drawKey = `${pixelWidth}:${pixelHeight}:${revealProgress.toFixed(3)}`

      if (drawKey === previousCompactDrawKey) {
        return true
      }

      previousCompactDrawKey = drawKey

      if (
        compactRevealCanvas.width !== pixelWidth ||
        compactRevealCanvas.height !== pixelHeight
      ) {
        compactRevealCanvas.width = pixelWidth
        compactRevealCanvas.height = pixelHeight
      }

      compactRevealCanvas.style.width = `${viewportWidth}px`
      compactRevealCanvas.style.height = `${viewportHeight}px`

      const context = compactRevealCanvas.getContext('2d')
      if (!context) {
        return false
      }

      context.save()
      context.setTransform(pixelWidth / 100, 0, 0, pixelHeight / 100, 0, 0)
      context.clearRect(0, 0, 100, 100)
      context.globalCompositeOperation = 'source-over'
      context.drawImage(compactSnapshotSource, 0, 0, 100, 100)
      context.globalCompositeOperation = 'destination-out'
      context.beginPath()

      decayPatches.forEach((patch) => {
        const points = buildPatchPath(patch, revealProgress, revealProgress * 6.2)
        traceClosedSoftPathOnCanvas(context, points, true)
      })

      context.fillStyle = '#000'
      context.fill()
      context.restore()

      return true
    }

    const resetCompactRevealState = (clearCanvas = false) => {
      captureRoot?.style.removeProperty('opacity')
      captureRoot?.style.removeProperty('visibility')
      captureRoot?.style.removeProperty('mask-image')
      captureRoot?.style.removeProperty('mask-position')
      captureRoot?.style.removeProperty('mask-repeat')
      captureRoot?.style.removeProperty('mask-size')
      captureRoot?.style.removeProperty('-webkit-mask-image')
      captureRoot?.style.removeProperty('-webkit-mask-position')
      captureRoot?.style.removeProperty('-webkit-mask-repeat')
      captureRoot?.style.removeProperty('-webkit-mask-size')
      if (compactRevealCanvas) {
        compactRevealCanvas.style.opacity = '0'
        compactRevealCanvas.style.visibility = 'hidden'
        if (clearCanvas) {
          const context = compactRevealCanvas.getContext('2d')
          if (context) {
            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, compactRevealCanvas.width, compactRevealCanvas.height)
          }
          previousCompactDrawKey = ''
        }
      }
    }

    const updateMobileRevealState = () => {
      copy.style.opacity = ''
      copy.style.transform = ''
      objectShell.style.opacity = ''
      shell.style.opacity = '1'
      visualStack.style.opacity = '1'
      visualStack.style.visibility = 'visible'

      if (!compactSnapshotReady || !compactRevealCanvas || !compactSnapshotSource) {
        resetCompactRevealState(true)
        return
      }

      const revealProgress = clamp(progressRef.current * 1.18, 0, 1)
      const overlayStart = Math.max(0.024, decayPatches[0].enterStart - 0.01)
      const overlayVisible = revealProgress > overlayStart
      const overlayOpacity = overlayVisible
        ? 1 - smoothstep(0.986, 0.998, revealProgress)
        : 0

      if (captureRoot) {
        captureRoot.style.opacity = overlayVisible ? '0' : '1'
        captureRoot.style.visibility = overlayVisible ? 'hidden' : 'visible'
      }

      compactRevealCanvas.style.opacity = overlayOpacity.toFixed(4)
      compactRevealCanvas.style.visibility =
        overlayOpacity <= 0.002 ? 'hidden' : 'visible'
      drawCompactRevealFrame(revealProgress)
    }

    const updateRevealState = () => {
      if (compactLayout) {
        updateMobileRevealState()
        return
      }

      copy.style.opacity = ''
      copy.style.transform = ''
      objectShell.style.opacity = ''
      resetCompactRevealState()

      const revealProgress = clamp(progressRef.current * 1.18, 0, 1)
      if (!maskPathRef.current) {
        return
      }

      const path = buildHeroMaskPath(revealProgress, revealProgress * 6.2)
      const stackOpacity = 1 - smoothstep(0.986, 0.998, revealProgress)

      shell.style.opacity = '1'
      captureRoot.style.opacity = stackOpacity.toFixed(4)
      captureRoot.style.visibility = stackOpacity <= 0.002 ? 'hidden' : 'visible'
      updateVisualMask(path)

      syncDesktopRevealPath(path)
    }

    updateRevealState()

    const getRevealDistance = () => {
      const viewportHeight = compactLayout
        ? Math.round(window.visualViewport?.height ?? window.innerHeight)
        : window.innerHeight
      const availableScroll = section.offsetHeight - viewportHeight

      if (compactLayout) {
        return availableScroll
      }

      return Math.max(
        Math.min(availableScroll, viewportHeight * 0.5),
        viewportHeight * 0.28
      )
    }

    let compactRafId = 0
    let removeCompactListeners = () => {}
    if (compactLayout) {
      const syncCompactReveal = () => {
        compactRafId = 0
        const revealDistance = getRevealDistance()
        const sectionTop = section.getBoundingClientRect().top + window.scrollY
        progressRef.current = clamp((window.scrollY - sectionTop) / revealDistance, 0, 1)
        updateMobileRevealState()
      }

      const requestCompactSync = () => {
        if (compactRafId !== 0) {
          return
        }

        compactRafId = window.requestAnimationFrame(syncCompactReveal)
      }

      requestCompactSync()
      window.addEventListener('scroll', requestCompactSync, { passive: true })
      window.addEventListener('resize', requestCompactSync)

      removeCompactListeners = () => {
        window.removeEventListener('scroll', requestCompactSync)
        window.removeEventListener('resize', requestCompactSync)
        if (compactRafId !== 0) {
          window.cancelAnimationFrame(compactRafId)
        }
      }
    }

    const ctx = gsap.context(() => {
      const routeItems = gsap.utils.toArray<SVGPathElement>('[data-hero-route-line]')
      const grid = gsap.utils.toArray<HTMLElement>('[data-hero-grid]')
      const motionScale = compactLayout ? 0.72 : 1

      if (!compactLayout) {
        gsap.to(progressRef, {
          current: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getRevealDistance()}`,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            scrub: 0.32,
            onUpdate: updateRevealState,
          },
        })
      }

      if (!compactLayout && titleOneRef.current) {
        gsap.to(titleOneRef.current, {
          yPercent: -48 * motionScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.38,
          },
        })
      }

      if (!compactLayout && titleTwoRef.current) {
        gsap.to(titleTwoRef.current, {
          yPercent: -26 * motionScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.38,
          },
        })
      }

      if (!compactLayout && subtitleRef.current) {
        gsap.to(subtitleRef.current, {
          yPercent: 14 * motionScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.44,
          },
        })
      }

      if (!compactLayout) {
        gsap.to('[data-hero-eyebrow]', {
          yPercent: -18 * motionScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.36,
          },
        })

        gsap.to('[data-hero-buttons]', {
          yPercent: 22 * motionScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.4,
          },
        })
      }

      if (!compactLayout && particleFieldRef.current) {
        gsap.to(particleFieldRef.current, {
          yPercent: -15 * motionScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.48,
          },
        })
      }

      if (!compactLayout) {
        gsap.to(objectShell, {
          yPercent: -14 * motionScale,
          scale: 0.92,
          rotate: 4 * motionScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.44,
          },
        })

        gsap.to(grid, {
          yPercent: -10 * motionScale,
          autoAlpha: 0.1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.42,
          },
        })

        gsap.to(copy, {
          yPercent: -10 * motionScale,
          scale: 0.985,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.42,
          },
        })

        gsap.to(routeItems, {
          autoAlpha: 0.28,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: '56% top',
            end: 'bottom top',
            fastScrollEnd: true,
            scrub: 0.4,
          },
        })
      }
    }, section)

    return () => {
      removeCompactListeners()
      resetCompactRevealState(true)
      ctx.revert()
    }
  }, [compactLayout, compactSnapshotReady, compactViewportHeight, maskId, sharedBackdrop])

  const updatePointer = (x: number, y: number) => {
    pointerRef.current = { x, y }
    quickSettersRef.current.pointerX?.(x * 100)
    quickSettersRef.current.pointerY?.(y * 100)
    quickSettersRef.current.glowX?.(36 + x * 28)
    quickSettersRef.current.glowY?.(30 + y * 24)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = sectionRef.current?.getBoundingClientRect()
    if (!bounds) {
      return
    }

    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    updatePointer(x, y)
  }

  const handlePointerLeave = () => {
    updatePointer(0.5, 0.48)
  }

  const compactSectionMinHeight =
    compactLayout && compactViewportHeight
      ? `${Math.round(compactViewportHeight * 2)}px`
      : undefined
  const compactStickyHeight =
    compactLayout && compactViewportHeight
      ? `${compactViewportHeight}px`
      : undefined
  return (
    <section
      id="home"
      ref={sectionRef}
      onPointerMove={compactLayout ? undefined : handlePointerMove}
      onPointerLeave={compactLayout ? undefined : handlePointerLeave}
      className={`hero-scene relative z-10 scroll-mt-28 ${
        compactLayout ? 'pointer-events-auto ' : 'pointer-events-none '
      }${
        compactLayout ? 'min-h-0' : 'min-h-[136svh] sm:min-h-[142svh] md:min-h-[148svh]'
      }`}
      style={
        {
          ['--pointer-x' as string]: 50,
          ['--pointer-y' as string]: 48,
          ['--glow-x' as string]: 50,
          ['--glow-y' as string]: 42,
          minHeight: compactSectionMinHeight,
        } as CSSProperties
      }
    >
      <div
        className={`sticky top-0 overflow-hidden relative ${
          compactLayout ? 'pointer-events-auto ' : 'pointer-events-none '
        }${
          compactLayout ? '' : 'h-[100svh]'
        }`}
        style={compactStickyHeight ? { height: compactStickyHeight } : undefined}
      >
        {!sharedBackdrop ? (
          <div className="absolute inset-0 overflow-hidden z-0">
            <AboutBackdrop className="z-0" />
          </div>
        ) : null}

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0"
          focusable="false"
        >
          <defs>
            <filter
              id={maskFilterId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feMorphology
                in="SourceGraphic"
                operator="dilate"
                radius={compactLayout ? 0.0095 : 0.0075}
                result="expanded"
              />
              <feGaussianBlur
                in="expanded"
                stdDeviation={compactLayout ? 0.013 : 0.01}
                result="softened"
              />
              <feColorMatrix
                in="softened"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 56 -16
                "
                result="merged"
              />
              <feMorphology
                in="merged"
                operator="dilate"
                radius={compactLayout ? 0.0056 : 0.0044}
                result="sealed"
              />
            </filter>
            <mask
              id={maskId}
              maskUnits="objectBoundingBox"
              maskContentUnits="objectBoundingBox"
            >
              <rect width="1" height="1" fill="white" />
              <g filter={`url(#${maskFilterId})`}>
                <path
                  ref={maskPathRef}
                  fill="black"
                  transform="scale(0.01 0.01)"
                />
              </g>
            </mask>
          </defs>
        </svg>

        {compactLayout ? (
          <canvas
            ref={compactRevealCanvasRef}
            data-hero-snapshot-overlay="true"
            data-html2canvas-ignore="true"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-40 h-full w-full"
            style={{
              opacity: 0,
              visibility: 'hidden',
              contain: 'paint',
              transform: 'translateZ(0)',
              willChange: 'opacity',
            }}
          />
        ) : null}

        <div ref={captureRootRef} className="absolute inset-0">
          <div
            ref={visualStackRef}
            className="absolute inset-0"
          >
            <div
              ref={shellRef}
              className="hero-cutout-shell pointer-events-none absolute inset-0 z-10"
            >
              <div className="hero-paper absolute inset-0 z-[1]" />
              <div className="hero-scene-backdrop absolute inset-0 z-[1]" />
              <div
                data-hero-grid
                className="hero-track-grid absolute inset-0 z-[1] opacity-[0.25]"
              />
              <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none z-[3] opacity-60"
                  style={{
                    background:
                      'radial-gradient(circle 600px at calc(var(--glow-x) * 1%) calc(var(--glow-y) * 1%), rgba(103,221,255,0.06), transparent)',
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none z-[3] opacity-40"
                  style={{
                    background:
                      'radial-gradient(ellipse 800px 500px at 75% 65%, rgba(255,138,91,0.05), transparent)',
                  }}
                />

                <div
                  className="absolute top-1/2 left-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <div
                    className="h-[min(70vw,50rem)] w-[min(70vw,50rem)] rounded-full border border-dashed border-white/[0.04]"
                    style={{
                      animationName: 'spin',
                      animationDuration: '90s',
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                      animationPlayState:
                        compactLayout || !interactiveReady ? 'paused' : 'running',
                    }}
                  />
                </div>
                <div
                  className="absolute top-1/2 left-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <div
                    className="h-[min(50vw,36rem)] w-[min(50vw,36rem)] rounded-full border border-white/[0.03]"
                    style={{
                      animationName: 'spin',
                      animationDuration: '120s',
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                      animationDirection: 'reverse',
                      animationPlayState:
                        compactLayout || !interactiveReady ? 'paused' : 'running',
                    }}
                  />
                </div>

                <div
                  ref={particleFieldRef}
                  className="absolute inset-0 z-[5] pointer-events-none"
                  aria-hidden="true"
                >
                  {particles.map((particle) => {
                    const colors = ['var(--accent-cool)', 'var(--accent-warm)', '#fbf5ea']
                    return (
                      <div
                        key={`particle-${particle.id}`}
                        data-hero-particle
                        className="absolute rounded-full"
                        style={{
                          left: `${particle.x}%`,
                          top: `${particle.y}%`,
                          width: `${particle.size}px`,
                          height: `${particle.size}px`,
                          opacity: particle.opacity,
                          background: colors[particle.id % 3],
                          filter: particle.blur > 0 ? `blur(${particle.blur}px)` : undefined,
                          animationName: 'float-soft-a',
                          animationDuration: `${particle.duration}s`,
                          animationTimingFunction: 'ease-in-out',
                          animationDelay: `${particle.delay}s`,
                          animationIterationCount: 'infinite',
                          animationPlayState:
                            compactLayout || !interactiveReady ? 'paused' : 'running',
                          willChange: 'transform',
                        }}
                      />
                    )
                  })}
                </div>

                <svg
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full opacity-[0.7]"
                  viewBox="0 0 1600 900"
                  preserveAspectRatio="none"
                >
                  <path
                    data-hero-route-line
                    d="M-220 176 C 74 54, 346 68, 612 172 S 1188 336, 1820 114"
                    className="hero-route-line"
                    fill="none"
                    strokeDasharray="12 10"
                    strokeLinecap="round"
                    strokeWidth={1.15}
                    stroke="rgba(143, 229, 255, 0.24)"
                  />
                  <path
                    data-hero-route-line
                    d="M-240 664 C 88 548, 402 728, 760 662 S 1264 512, 1820 642"
                    className="hero-route-line"
                    fill="none"
                    strokeDasharray="12 10"
                    strokeLinecap="round"
                    strokeWidth={1.15}
                    stroke="rgba(255, 138, 91, 0.22)"
                  />
                  <path
                    data-hero-route-line
                    d="M42 -84 C 212 124, 296 364, 238 986"
                    className="hero-route-line"
                    fill="none"
                    strokeDasharray="12 10"
                    strokeLinecap="round"
                    strokeWidth={1.05}
                    stroke="rgba(251, 245, 234, 0.12)"
                  />
                  <path
                    data-hero-route-line
                    d="M1542 -96 C 1376 116, 1280 372, 1348 988"
                    className="hero-route-line"
                    fill="none"
                    strokeDasharray="12 10"
                    strokeLinecap="round"
                    strokeWidth={1.05}
                    stroke="rgba(251, 245, 234, 0.12)"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div
            ref={objectShellRef}
            className={`hero-object-shell absolute left-1/2 top-[52%] z-10 -translate-x-1/2 -translate-y-1/2 mix-blend-screen opacity-90 ${
              compactLayout
                ? 'h-[min(46vh,20rem)] w-[min(78vw,20rem)] sm:h-[min(50vh,24rem)] sm:w-[min(72vw,24rem)] md:h-[min(58vh,30rem)] md:w-[min(58vw,30rem)]'
                : 'h-[min(65vh,45rem)] w-[min(55rem,85vw)]'
            }`}
          >
            <div className="hero-object-core absolute inset-0 mix-blend-color-dodge" />
            <div
              data-hero-orbit
              className="hero-orbit-ring hero-orbit-ring--outer absolute inset-[2%]"
            />
            <div
              data-hero-orbit
              className="hero-orbit-ring hero-orbit-ring--inner absolute inset-[12%]"
            />
            <div
              ref={sweepOneRef}
              className="hero-sweep hero-sweep--warm absolute left-[-18%] top-[24%] h-[18%] w-[68%]"
            />
            <div
              ref={sweepTwoRef}
              className="hero-sweep hero-sweep--cool absolute right-[-15%] top-[56%] h-[16%] w-[62%]"
            />
            <div
              data-hero-band
              className="hero-band hero-band--top absolute left-[-10%] top-[15%] h-[8%] w-[62%]"
            />
            <div
              data-hero-band
              className="hero-band hero-band--bottom absolute right-[-10%] top-[72%] h-[7%] w-[58%]"
            />
            <HeroObjectScene
              enabled={interactiveReady && !compactLayout}
              pointerRef={pointerRef}
              progressRef={progressRef}
            />
          </div>

          <div className="section-frame relative z-30 flex h-[100svh] items-center justify-center pointer-events-none">
            <div
              ref={copyRef}
              className="hero-copy pointer-events-none flex w-full flex-col items-center justify-center text-center"
            >
              <div className="mb-6 flex w-full justify-center md:mb-10" data-hero-eyebrow>
                <p className="eyebrow hero-eyebrow font-medium tracking-[0.3em] text-white/50">
                  Edison, NJ // High School Developer
                </p>
              </div>

              <div className="relative z-20 flex w-full flex-col items-center">
                <div ref={titleOneRef} className="flex w-full justify-center will-change-transform">
                  <h1
                    className="-my-10 py-10 font-display text-[clamp(4.5rem,12vw,13rem)] font-extrabold leading-[0.85] tracking-[-0.04em] text-white drop-shadow-2xl"
                    style={{ textShadow: '0 20px 80px rgba(0,0,0,0.8)' }}
                  >
                    Hey!
                  </h1>
                </div>
                <div ref={titleTwoRef} className="mt-1 flex w-full justify-center will-change-transform">
                  <h1
                    className="-my-10 py-10 font-display text-[clamp(2.5rem,8vw,9.5rem)] font-extrabold italic leading-[0.88] tracking-[-0.03em] text-white/90 drop-shadow-lg"
                    style={{ textShadow: '0 10px 40px rgba(0,0,0,0.6)' }}
                  >
                    I&apos;m Aarit.
                  </h1>
                </div>
              </div>

              <div ref={subtitleRef} className="mt-8 max-w-2xl px-4 will-change-transform md:mt-12">
                <p
                  className="mx-auto text-base font-light leading-relaxed text-[#eee9dc]/70 sm:text-lg md:text-xl"
                  style={{ textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}
                >
                  I love coding polished web experiences, exploring crazy ideas, and
                  turning late-night experiments into reality.
                </p>
              </div>

              <div
                data-hero-buttons
                className="pointer-events-auto relative z-40 mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row md:mt-14"
              >
                <button
                  ref={btnPrimaryRef}
                  type="button"
                  data-cursor="hover"
                  onClick={() => {
                    scrollToSection('#portfolio', { offset: 0 })
                  }}
                  onPointerMove={(event) => handleMagnetic(event, btnPrimaryRef)}
                  onPointerLeave={() => resetMagnetic(btnPrimaryRef)}
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-[0.95rem] font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-shadow duration-500 hover:shadow-[0_0_80px_rgba(255,255,255,0.35)]"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <RollingText text="View Selected Work" />
                  <ArrowRight className="relative z-10 h-4 w-4 -rotate-45 transition-transform duration-500 will-change-transform group-hover:rotate-0" />
                </button>
                <button
                  ref={btnSecondaryRef}
                  type="button"
                  data-cursor="hover"
                  onPointerMove={(event) => handleMagnetic(event, btnSecondaryRef)}
                  onPointerLeave={() => resetMagnetic(btnSecondaryRef)}
                  onClick={() => {
                    document.dispatchEvent(new CustomEvent('open-resume'))
                  }}
                  className="group relative inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[0.95rem] font-semibold text-white backdrop-blur-md transition-all duration-500 hover:border-white/40 hover:bg-white/10"
                >
                  <RollingText text="Open Resume" />
                  <FileText className="relative z-10 h-4 w-4 transition-transform duration-500 will-change-transform group-hover:-translate-y-1 group-hover:scale-110" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import {
  IBM_Plex_Mono,
  Silkscreen,
  Space_Grotesk,
  Syne,
} from 'next/font/google'
import MotionProvider from '@/components/motion-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const display = Syne({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
})

const sans = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const pixel = Silkscreen({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pixel',
})

const siteUrl = 'https://aaritmalhotra.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Aarit's Portfolio",
  description:
    'Portfolio of Aarit Malhotra, a high school developer from Edison, NJ building full-stack projects with a strong frontend eye for motion, feel, and detail.',
  keywords: [
    'Aarit Malhotra',
    'high school developer',
    'frontend portfolio',
    'Next.js',
    'React',
    'TypeScript',
    'Framer Motion',
  ],
  authors: [{ name: 'Aarit Malhotra' }],
  creator: 'Aarit Malhotra',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Aarit Malhotra | High School Developer',
    description:
      'Interactive portfolio, project case studies, and motion-heavy frontend work by Aarit Malhotra.',
    siteName: 'Aarit Malhotra',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Aarit Malhotra portfolio preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aarit Malhotra | High School Developer',
    description:
      'Interactive portfolio, project case studies, and motion-heavy frontend work by Aarit Malhotra.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${pixel.variable} dark`}
      style={{ backgroundColor: '#05070d' }}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        style={{ backgroundColor: '#05070d', color: '#fbf5ea' }}
      >
        <MotionProvider>
          {children}
          <Analytics />
          <Toaster />
        </MotionProvider>
      </body>
    </html>
  )
}

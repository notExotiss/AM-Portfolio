import type { Metadata } from 'next'
import { Inter, Ubuntu, Titillium_Web, DM_Mono, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-ubuntu',
});

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ['200', '300', '400', '600', '700', '900'],
  variable: '--font-titillium',
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Aarit Malhotra - Portfolio | High School Student & Developer',
  description: 'Portfolio of Aarit Malhotra – high school student and developer. Explore projects, resume, and contact information. Specializing in web development, React, Next.js, and modern technologies.',
  keywords: ['Aarit Malhotra', 'portfolio', 'developer', 'web development', 'React', 'Next.js', 'high school student', 'Edison NJ'],
  authors: [{ name: 'Aarit Malhotra' }],
  creator: 'Aarit Malhotra',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aaritmalhotra.vercel.app',
    title: 'Aarit Malhotra - Portfolio | High School Student & Developer',
    description: 'Portfolio of Aarit Malhotra – high school student and developer. Explore projects, resume, and contact information.',
    siteName: 'Aarit Malhotra Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aarit Malhotra - Portfolio | High School Student & Developer',
    description: 'Portfolio of Aarit Malhotra – high school student and developer. Explore projects, resume, and contact information.',
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
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} ${spaceGrotesk.variable} ${inter.variable} ${ubuntu.variable} ${titillium.variable} ${dmMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}

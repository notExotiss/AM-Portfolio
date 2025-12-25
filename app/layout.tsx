import type { Metadata } from 'next'
import { Inter, Ubuntu, Titillium_Web, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
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

export const metadata: Metadata = {
  title: 'Aarit\'s Portfolio',
  description: 'High School Student & Developer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${ubuntu.className} ${inter.variable} ${ubuntu.variable} ${titillium.variable} ${dmMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}

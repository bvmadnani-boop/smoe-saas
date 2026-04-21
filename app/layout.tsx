import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VIZIA — Intelligence pour l\'Enseignement Supérieur',
  description: 'La première plateforme de pilotage par IA conçue pour les leaders de l\'enseignement supérieur. De l\'accréditation à l\'employabilité.',
  keywords: 'enseignement supérieur, pilotage, IA, accréditation, ISO 21001, qualité, employabilité',
  openGraph: {
    title: 'VIZIA — Dirigez. VIZIA s\'occupe du reste.',
    description: 'Plateforme de pilotage par IA pour l\'enseignement supérieur.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

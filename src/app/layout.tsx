import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tank Battle - 8-Bit Multiplayer',
  description: 'A fun online multiplayer 8-bit tank game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-game-bg text-white">
        {children}
      </body>
    </html>
  )
}

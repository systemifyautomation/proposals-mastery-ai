import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Proposals Mastery AI - Upwork Proposal Generator',
  description: 'Create winning Upwork proposals with AI-powered templates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

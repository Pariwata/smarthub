import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartHub - Regulation Review',
  description: 'Review and confirm Claude-generated regulation libraries',
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

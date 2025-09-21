import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/src/services/auth-context'

export const metadata: Metadata = {
  title: 'SuperAnalyst - AI-Powered Pro Equity Research',
  description: 'Professional equity research powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}


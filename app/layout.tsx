import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 防止redi脚本重复加载
              if (typeof window !== 'undefined') {
                window.__REDI_LOADED__ = window.__REDI_LOADED__ || false;
                if (window.__REDI_LOADED__) {
                  console.warn('[REDI] Script already loaded, skipping duplicate load');
                } else {
                  window.__REDI_LOADED__ = true;
                }
              }
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}


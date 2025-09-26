import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { locales, type Locale } from '../services/i18n'
import GoogleAnalytics from '../../components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SuperAnalyst.pro - AI Market Intelligence& Equity Research Platform That Automating 80% of Research Grunt Work',
  description: 'Powered by most advanced deep research LLM and powerful database, SuperAnalyst.pro delivers comprehensive equity reports on global markets, empowering analysts to build their thesis and make smarter decisions, faster.',
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  return (
    <html lang={params.locale}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📈</text></svg>" />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-HS935K4G8C'} />
        {children}
      </body>
    </html>
  )
} 
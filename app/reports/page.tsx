import { Metadata } from 'next'
import Link from 'next/link'
import { getAllReports } from '@/lib/reports'
import { Calendar, Building2, FileText, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Investment Research Reports | SuperAnalyst Pro',
  description: 'Comprehensive equity research reports and investment analysis by SuperAnalyst Pro. Access detailed company profiles, valuation analysis, and market insights.',
  keywords: [
    'investment research',
    'equity research',
    'stock analysis',
    'financial analysis',
    'company reports',
    'valuation analysis',
    'DCF analysis',
    'fundamental analysis',
    'SuperAnalyst Pro'
  ],
  openGraph: {
    title: 'Investment Research Reports | SuperAnalyst Pro',
    description: 'Comprehensive equity research reports and investment analysis by SuperAnalyst Pro.',
    type: 'website',
    siteName: 'SuperAnalyst Pro'
  }
}

export default async function ReportsPage() {
  const reports = await getAllReports()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Investment Research Reports",
    "description": "Comprehensive equity research reports and investment analysis by SuperAnalyst Pro",
    "url": "https://superanalyst.pro/reports",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": reports.map((report, index) => ({
        "@type": "Article",
        "position": index + 1,
        "headline": report.title,
        "description": report.summary,
        "author": {
          "@type": "Organization",
          "name": "SuperAnalyst Pro Research Team"
        },
        "datePublished": report.date,
        "url": `https://superanalyst.pro/reports/${report.id}`
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Investment Research Reports
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive equity research and investment analysis by our team of financial experts. 
                Access detailed company profiles, valuation models, and market insights.
              </p>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports available</h3>
              <p className="text-gray-600">Check back soon for new research reports.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">
                          {report.company} ({report.symbol})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(report.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {report.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {report.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/reports/${report.id}`}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <span>Read Report</span>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <FileText className="w-3 h-3" />
                        <span>PDF Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Get Access to Premium Research
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Unlock detailed valuation models, investment recommendations, 
                and exclusive market insights with SuperAnalyst Pro.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://superanalyst.pro"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </a>
                <a
                  href="https://superanalyst.pro/pricing"
                  className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

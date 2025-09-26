
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllReports, type Report } from '@/app/services/reports'
import { Calendar, Building2, FileText, ExternalLink, ArrowLeft } from 'lucide-react'
import { useAuthContext } from '@/app/services/auth-context'
import { supabase } from '@/app/services/database/supabase-client'

interface ReportsPageProps {
  params: {
    locale: string
  }
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const { locale } = params
  const { user } = useAuthContext()
  const [reports, setReports] = useState<Report[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取报告数据
        const reportsData = await getAllReports()
        setReports(reportsData)

        // 如果用户已登录，获取用户数据
        if (user?.id) {
          const { data, error } = await supabase
            .from('users')
            .select(`
              *,
              subscription_tiers!subscription_id(
                id,
                name,
                monthly_report_limit,
                price_monthly,
                features
              )
            `)
            .eq('id', user.id)
            .single()
          
          if (data && !error) {
            setUserData(data)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  // 检查用户是否为免费用户
  const isFreeUser = () => {
    if (!userData) return true
    const subscriptionTier = userData?.subscription_tiers?.name?.toLowerCase()
    const subscriptionType = userData?.subscription_type
    return !subscriptionTier && !subscriptionType
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Investment Research Reports",
    "description": "Comprehensive equity research reports and investment analysis by SuperAnalyst Pro",
    "url": "https://superanalyst.pro/reports",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": reports.map((report: Report, index: number) => ({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    )
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}`}
                  className="flex items-center text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {locale === 'zh' ? '返回首页' : 'Back to Home'}
                </Link>
                <h1 className="text-xl font-semibold text-slate-900">
                  {locale === 'zh' ? '投资研究报告' : 'Investment Research Reports'}
                </h1>
              </div>
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
              {reports.map((report: Report) => (
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

        {/* CTA Section - Only show for free users */}
        {isFreeUser() && (
          <div className="bg-blue-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {locale === 'zh' ? '获取高级研究报告访问权限' : 'Get Access to Premium Research'}
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  {locale === 'zh' 
                    ? '解锁详细的估值模型、投资建议和独家市场洞察，使用SuperAnalyst Pro。'
                    : 'Unlock detailed valuation models, investment recommendations, and exclusive market insights with SuperAnalyst Pro.'
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href={`/${locale}/subscription`}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    {locale === 'zh' ? '立即开始' : 'Get Started'}
                  </Link>
                  <Link
                    href={`/${locale}/subscription`}
                    className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    {locale === 'zh' ? '了解更多' : 'Learn More'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

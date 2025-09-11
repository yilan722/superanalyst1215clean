'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Lock, Eye, Download, ExternalLink, Calendar, Building2 } from 'lucide-react'
import { type Locale } from '@/lib/i18n'
import { getTranslation } from '@/lib/translations'

interface SharePageProps {
  params: {
    reportId: string
    locale: Locale
  }
}

interface ReportData {
  id: string
  title: string
  company: string
  symbol: string
  date: string
  summary: string
  pdfPath: string
  isPublic: boolean
  sections?: {
    [key: string]: {
      content: string
      isLocked: boolean
    }
  }
}

export default function SharePage({ params }: SharePageProps) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const { locale } = params

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch('/api/todays-report-preview')
        const data = await response.json()
        
        if (data) {
          setReport(data)
        }
      } catch (error) {
        console.error('Error fetching report:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [])

  const handleDownload = async () => {
    if (!report) return
    
    try {
      const response = await fetch(`/api/todays-report-pdf?id=${report.id}&public=true`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleRegister = () => {
    // 重定向到主站注册页面
    window.open('https://superanalyst.pro', '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">
            {locale === 'zh' ? '报告未找到' : 'Report Not Found'}
          </h1>
          <p>
            {locale === 'zh' ? '此报告不再可用。' : 'This report is no longer available.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SuperAnalyst Pro</h1>
                <p className="text-sm text-slate-400">Professional Equity Research</p>
              </div>
            </div>
            <button
              onClick={handleRegister}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              {locale === 'zh' ? '获取完整访问权限' : 'Get Full Access'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 border-b border-amber-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {report.title}
                </h1>
                <div className="flex items-center space-x-4 text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{report.company} ({report.symbol})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.date).toLocaleDateString('en-US')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-amber-600">
                <Lock className="w-5 h-5" />
                <span className="font-medium">
                  {locale === 'zh' ? '预览版本' : 'Preview Version'}
                </span>
              </div>
            </div>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              {report.summary}
            </p>

            {/* Preview Sections */}
            {report.sections && (
              <div className="space-y-8">
                {Object.entries(report.sections).map(([sectionTitle, sectionData]) => (
                  <div key={sectionTitle} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900">
                        {sectionTitle}
                      </h3>
                      {sectionData.isLocked && (
                        <div className="flex items-center space-x-2 text-amber-600">
                          <Lock className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {locale === 'zh' ? '需要注册查看' : 'Registration Required'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {sectionData.isLocked ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Lock className="w-6 h-6 text-amber-600" />
                          <div>
                            <p className="text-amber-800 font-medium">
                              {locale === 'zh' ? '此部分需要注册后查看' : 'This section requires registration to view'}
                            </p>
                            <p className="text-amber-700 text-sm mt-1">
                              {locale === 'zh' 
                                ? '注册后可查看详细的估值分析、关键发现和全面的财务建模。'
                                : 'Register to view detailed valuation analysis, key findings, and comprehensive financial modeling.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                          {sectionData.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Access Control Section */}
          <div className="p-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">
                    {locale === 'zh' ? '解锁完整报告访问权限' : 'Unlock Full Report Access'}
                  </h3>
                  <p className="text-amber-800 mb-4">
                    {locale === 'zh' 
                      ? '这是预览版本。完整报告包括详细的估值分析、关键发现、风险评估和全面的财务建模。'
                      : 'This is a preview version. The complete report includes detailed valuation analysis, key findings, risk assessments, and comprehensive financial modeling.'
                    }
                  </p>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleRegister}
                      className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                    >
                      {locale === 'zh' ? '注册获取完整访问权限' : 'Register for Full Access'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-white text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                    >
                      {locale === 'zh' ? '下载预览版' : 'Download Preview'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">What's Included in Full Report</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Detailed DCF Valuation Analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Comparable Company Analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Investment Risk Assessment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Financial Modeling & Projections</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Why Choose SuperAnalyst Pro</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>AI-Powered Analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Real-Time Market Data</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Professional-Grade Reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Daily Market Insights</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Access Professional Equity Research?
              </h3>
              <p className="text-slate-300 mb-6">
                Join thousands of investors who trust SuperAnalyst Pro for their investment decisions.
              </p>
              <button
                onClick={handleRegister}
                className="px-8 py-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-lg"
              >
                Start Your Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

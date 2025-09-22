'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Locale } from '@/app/services/i18n'
import { useAuthContext } from '@/app/services/auth-context'
import { supabase } from '@/app/services/database/supabase-client'
import { FileText, Download, Eye, Calendar, Loader2, AlertCircle } from 'lucide-react'

interface ReportsPageProps {
  params: {
    locale: Locale
  }
}

interface Report {
  id: string
  title?: string
  stock_name: string
  stock_symbol: string
  created_at: string
  status?: string
  file_path?: string
  report_data?: string
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const { locale } = params
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuthContext()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 报告页面认证检查:', { user: authUser?.id, loading: authLoading })
    
    // 如果还在加载中，等待
    if (authLoading) {
      console.log('⏳ 认证状态加载中，等待...')
      return
    }
    
    // 如果加载完成但没有用户，重定向
    if (!authUser) {
      console.log('❌ 用户未认证，重定向到主页')
      router.push(`/${locale}`)
      return
    }
    
    // 用户已认证，获取数据
    console.log('✅ 用户已认证，获取报告数据')
    fetchReports()
  }, [authUser, authLoading, locale, router])

  const fetchReports = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔍 开始获取报告，用户ID:', authUser?.id)
      console.log('🚀 使用API路由获取报告数据 - 最新版本')
      
      // 使用API路由来获取报告，确保正确的认证
      const response = await fetch(`/api/reports?userId=${authUser?.id}`)
      const result = await response.json()
      
      console.log('📊 API响应结果:', result)

      if (result.error) {
        setError(result.error)
        console.error('Error fetching reports:', result.error)
        setReports([])
      } else {
        console.log('✅ 成功获取报告，数量:', result.data?.length || 0)
        setReports(result.data || [])
      }
    } catch (err) {
      setError(locale === 'zh' ? '加载报告失败' : 'Failed to load reports')
      console.error('Unexpected error fetching reports:', err)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case undefined:
      case null:
        return 'text-green-600 bg-green-100' // 默认显示为已完成状态
      default:
        return 'text-green-600 bg-green-100' // 其他情况也显示为已完成状态
    }
  }

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return locale === 'zh' ? '已完成' : 'Completed'
      case 'processing':
        return locale === 'zh' ? '处理中' : 'Processing'
      case 'failed':
        return locale === 'zh' ? '失败' : 'Failed'
      case undefined:
      case null:
        return locale === 'zh' ? '已完成' : 'Completed' // 默认显示为已完成
      default:
        return locale === 'zh' ? '已完成' : 'Completed' // 其他情况也显示为已完成
    }
  }

  const handleViewReport = (report: Report) => {
    if (report.file_path) {
      // Open report in new tab
      window.open(report.file_path, '_blank')
    } else if (report.report_data) {
      // If no file_path but has report_data, create a temporary HTML file
      const reportHtml = generateReportHtml(report)
      const blob = new Blob([reportHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } else {
      alert(locale === 'zh' ? '报告数据不存在' : 'Report data not found')
    }
  }

  const handleDownloadReport = (report: Report) => {
    if (report.file_path) {
      // Create download link for existing file
      const link = document.createElement('a')
      link.href = report.file_path
      link.download = `${report.stock_name}_${report.stock_symbol}_分析报告.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (report.report_data) {
      // Generate HTML file for download
      const reportHtml = generateReportHtml(report)
      const blob = new Blob([reportHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${report.stock_name}_${report.stock_symbol}_分析报告.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      alert(locale === 'zh' ? '报告数据不存在' : 'Report data not found')
    }
  }

  const generateReportHtml = (report: Report) => {
    let reportData
    try {
      reportData = typeof report.report_data === 'string' 
        ? JSON.parse(report.report_data) 
        : report.report_data
    } catch (error) {
      console.error('Error parsing report data:', error)
      return `<html><body><h1>Error parsing report data</h1></body></html>`
    }

    const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .fundamental-analysis, .business-segments, .growth-catalysts, .valuation-analysis { margin-bottom: 30px; }
        .metric-table table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .metric-table th, .metric-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .metric-table th { background-color: #f2f2f2; }
        .highlight-box { background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .neutral { color: #6c757d; }
        .recommendation-buy { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; }
        h1, h2, h3, h4, h5 { color: #333; }
    </style>
</head>
<body>
    <h1>${report.stock_name} (${report.stock_symbol}) 分析报告</h1>
    <p><strong>${locale === 'zh' ? '生成时间' : 'Generated'}:</strong> ${formatDate(report.created_at)}</p>
    <hr>
    ${reportData.fundamentalAnalysis || ''}
    ${reportData.businessSegments || ''}
    ${reportData.growthCatalysts || ''}
    ${reportData.valuationAnalysis || ''}
</body>
</html>`
    return html
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
        <p className="ml-3 text-slate-700">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 返回按钮和标题 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">
              {locale === 'zh' ? '返回' : 'Back'}
            </span>
          </button>
          <h1 className="text-3xl font-bold text-slate-800">
            {locale === 'zh' ? '报告中心' : 'Report Center'}
          </h1>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {locale === 'zh' ? '暂无报告' : 'No Reports Yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {locale === 'zh' ? '开始生成您的第一份AI分析报告' : 'Start generating your first AI analysis report'}
              </p>
              <button
                onClick={() => router.push(`/${locale}`)}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {locale === 'zh' ? '生成报告' : 'Generate Report'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {report.stock_name} ({report.stock_symbol})
                      </h3>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(report.created_at)}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={locale === 'zh' ? '查看报告' : 'View Report'}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={locale === 'zh' ? '下载报告' : 'Download Report'}
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

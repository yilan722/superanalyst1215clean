'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import useAuth from '@/lib/useAuth'
import { supabase } from '@/lib/supabase-client'
import { FileText, Download, Eye, Calendar, Loader2, AlertCircle } from 'lucide-react'

interface ReportsPageProps {
  params: {
    locale: Locale
  }
}

interface Report {
  id: string
  title: string
  created_at: string
  status: string
  file_path?: string
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const { locale } = params
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        router.push(`/${locale}`) // Redirect to home if not logged in
        return
      }
      fetchReports()
    }
  }, [authUser, authLoading, locale, router])

  const fetchReports = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', authUser?.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        console.error('Error fetching reports:', error)
        setReports([])
      } else {
        setReports(data || [])
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return locale === 'zh' ? '已完成' : 'Completed'
      case 'processing':
        return locale === 'zh' ? '处理中' : 'Processing'
      case 'failed':
        return locale === 'zh' ? '失败' : 'Failed'
      default:
        return locale === 'zh' ? '未知' : 'Unknown'
    }
  }

  const handleViewReport = (report: Report) => {
    if (report.file_path) {
      // Open report in new tab
      window.open(report.file_path, '_blank')
    } else {
      alert(locale === 'zh' ? '报告文件不存在' : 'Report file not found')
    }
  }

  const handleDownloadReport = (report: Report) => {
    if (report.file_path) {
      // Create download link
      const link = document.createElement('a')
      link.href = report.file_path
      link.download = `${report.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert(locale === 'zh' ? '报告文件不存在' : 'Report file not found')
    }
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
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          {locale === 'zh' ? '报告中心' : 'Report Center'}
        </h1>

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
                        {report.title}
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

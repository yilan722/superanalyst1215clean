import React, { useState, useEffect, useCallback } from 'react'
import { Download, Eye, Calendar, FileText, Trash2, RefreshCw } from 'lucide-react'
import { supabase } from '@/app/services/database/supabase-client'
import { useAuthContext } from '@/app/services/auth-context'

import type { Locale } from '@/app/services/i18n'

interface Report {
  id: string
  stock_symbol: string
  stock_name: string
  report_data: string
  created_at: string
}

interface ReportHistoryProps {
  locale: Locale
  isOpen: boolean
  onClose: () => void
}

export default function ReportHistory({ locale, isOpen, onClose }: ReportHistoryProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { user } = useAuthContext()

  // 简化的加载报告函数
  const loadReports = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ User not logged in, cannot load reports')
      return
    }
    
    setIsLoading(true)
    setLoadError(null)
    
    try {
      console.log('🔄 Starting to load reports, user ID:', user.id)
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading reports:', error)
        throw error
      }
      
      console.log('✅ Successfully loaded reports, count:', data?.length || 0)
      setReports(data || [])
      
    } catch (error) {
      console.error('❌ Failed to load reports:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setLoadError(`${locale === 'zh' ? '加载失败' : 'Load failed'}: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, locale])

  useEffect(() => {
    console.log('🔍 ReportHistory useEffect:', { isOpen, userId: user?.id })
    if (isOpen && user?.id) {
      console.log('🔄 Starting to load reports...')
      loadReports()
    } else if (isOpen && !user?.id) {
      console.log('⚠️ User not logged in, cannot load reports')
      setLoadError(locale === 'zh' ? '请先登录以查看报告历史' : 'Please login to view report history')
    }
  }, [isOpen, user?.id, loadReports, locale])

  const handleDownloadPDF = async (report: Report) => {
    try {
      const reportData = JSON.parse(report.report_data)
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          reportData,
          stockName: report.stock_name,
          stockSymbol: report.stock_symbol,
          locale: locale
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Get the HTML content
      const htmlContent = await response.text()
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups.')
      }
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
      
      // Show success message
      alert(locale === 'zh' ? '报告已准备打印，请使用浏览器的打印功能保存为PDF' : 'Report ready for printing. Please use browser print function to save as PDF')
    } catch (error) {
      console.error('Download error:', error)
      alert(locale === 'zh' ? '下载错误' : 'Download error')
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setReports(prev => prev.filter(report => report.id !== reportId))
      if (selectedReport?.id === reportId) {
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert(locale === 'zh' ? '删除错误' : 'Delete error')
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'zh' ? '报告历史' : 'Report History'}
            </h2>
            <div className="flex items-center space-x-3">
              {/* 手动刷新按钮 */}
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{locale === 'zh' ? '刷新' : 'Refresh'}</span>
              </button>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-120px)]">
            {/* Reports List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {locale === 'zh' ? '我的报告' : 'My Reports'}
                </h3>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">{locale === 'zh' ? '加载中...' : 'Loading...'}</span>
                  </div>
                ) : loadError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">❌ {loadError}</div>
                    <button
                      onClick={loadReports}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {locale === 'zh' ? '重试' : 'Retry'}
                    </button>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>{locale === 'zh' ? '暂无报告' : 'No reports yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedReport?.id === report.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleViewReport(report)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{report.stock_name}</h4>
                            <p className="text-sm text-gray-600">{report.stock_symbol}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadPDF(report)
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteReport(report.id)
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedReport ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedReport.stock_name} ({selectedReport.stock_symbol})
                      </h3>
                      <p className="text-sm text-gray-600">
                        {locale === 'zh' ? '生成时间' : 'Generated'}: {new Date(selectedReport.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                  </div>

                  <div 
                    className="prose max-w-none report-content"
                    dangerouslySetInnerHTML={{
                      __html: JSON.parse(selectedReport.report_data).fundamentalAnalysis || 'No content available'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>{locale === 'zh' ? '选择报告查看' : 'Select a report to view'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { FileText, Calendar, ChevronLeft, ChevronRight, Eye, Download, ExternalLink } from 'lucide-react'
import type { Locale } from '@/app/services/i18n'
import ReportShareButtons from './ReportShareButtons'

interface HistoricalReport {
  id: string
  title: string
  company: string
  symbol: string
  summary: string
  date: string
  pdfPath: string
  isPublic: boolean
  isPublicVersion?: boolean
  message?: string
  translations?: {
    en?: {
      title: string
      company: string
      summary: string
    }
  }
  fullContent?: {
    parsedContent?: {
      sections?: { [key: string]: string }
      charts?: any[]
      tables?: any[]
    }
  }
}

interface PaginatedHistoricalReportsProps {
  reports: HistoricalReport[]
  locale: Locale
  onReportClick: (report: HistoricalReport) => void
}

export default function PaginatedHistoricalReports({ 
  reports, 
  locale, 
  onReportClick 
}: PaginatedHistoricalReportsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const reportsPerPage = 10
  
  // 调试信息
  console.log('PaginatedHistoricalReports received reports:', reports.length, reports.map(r => r.id))
  
  // 计算总页数
  const totalPages = Math.ceil(reports.length / reportsPerPage)
  
  // 获取当前页的报告
  const getCurrentPageReports = () => {
    const startIndex = (currentPage - 1) * reportsPerPage
    const endIndex = startIndex + reportsPerPage
    return reports.slice(startIndex, endIndex)
  }
  
  // 重置到第一页当报告数据变化时
  useEffect(() => {
    setCurrentPage(1)
  }, [reports.length])
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleDownload = (e: React.MouseEvent, report: HistoricalReport) => {
    e.stopPropagation()
    if (report.pdfPath) {
      // 尝试从多个可能的路径下载PDF
      const possiblePaths = [
        `/reference-reports/${report.pdfPath}`,
        `/data/reference-reports/${report.pdfPath}`,
        `/api/download-pdf?id=${report.id}`,
        report.pdfPath.startsWith('http') ? report.pdfPath : `/reference-reports/${report.pdfPath}`
      ]
      
      // 首先尝试直接下载PDF文件
      const link = document.createElement('a')
      link.href = possiblePaths[0]
      link.download = report.pdfPath
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // 如果没有PDF路径，尝试通过API下载
      const link = document.createElement('a')
      link.href = `/api/download-pdf?id=${report.id}`
      link.download = `${report.symbol}-report.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
  
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p>{locale === 'zh' ? '暂无历史报告' : 'No historical reports available'}</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* 报告列表 */}
      <div className="space-y-3">
        {getCurrentPageReports().map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer group"
            onClick={() => onReportClick(report)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {locale === 'en' && report.translations?.en?.title ? report.translations.en.title : report.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {locale === 'en' && report.translations?.en?.company ? report.translations.en.company : report.company} ({report.symbol})
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{new Date(report.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              {locale === 'en' && report.translations?.en?.summary ? report.translations.en.summary : report.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <FileText className="w-3 h-3" />
                <span>PDF Report</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 完整报告链接 */}
                <a
                  href={`/en/reports/${report.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{locale === 'zh' ? '查看报告' : 'View Report'}</span>
                </a>
                
                {/* 分享按钮 */}
                <ReportShareButtons report={report} locale={locale} />
                
                {/* 下载按钮 */}
                <button
                  onClick={(e) => handleDownload(e, report)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>{locale === 'zh' ? '下载' : 'Download'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {locale === 'zh' 
              ? `显示第 ${(currentPage - 1) * reportsPerPage + 1} - ${Math.min(currentPage * reportsPerPage, reports.length)} 条，共 ${reports.length} 条报告`
              : `Showing ${(currentPage - 1) * reportsPerPage + 1} - ${Math.min(currentPage * reportsPerPage, reports.length)} of ${reports.length} reports`
            }
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{locale === 'zh' ? '上一页' : 'Previous'}</span>
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>{locale === 'zh' ? '下一页' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

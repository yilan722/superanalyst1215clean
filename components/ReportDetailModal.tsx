import React from 'react'
import { X, Calendar, Building2, FileText, Download } from 'lucide-react'
import type { Locale } from '@/app/services/i18n'

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

interface ReportDetailModalProps {
  report: HistoricalReport | null
  isOpen: boolean
  onClose: () => void
  locale: Locale
}

export default function ReportDetailModal({ 
  report, 
  isOpen, 
  onClose, 
  locale 
}: ReportDetailModalProps) {
  if (!isOpen || !report) return null

  const handleDownload = () => {
    if (report.pdfPath) {
      const link = document.createElement('a')
      link.href = `/reference-reports/${report.pdfPath}`
      link.download = report.pdfPath
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getDisplayTitle = () => {
    return locale === 'en' && report.translations?.en?.title 
      ? report.translations.en.title 
      : report.title
  }

  const getDisplayCompany = () => {
    return locale === 'en' && report.translations?.en?.company 
      ? report.translations.en.company 
      : report.company
  }

  const getDisplaySummary = () => {
    return locale === 'en' && report.translations?.en?.summary 
      ? report.translations.en.summary 
      : report.summary
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {getDisplayTitle()}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {getDisplayCompany()} ({report.symbol})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{locale === 'zh' ? '下载PDF' : 'Download PDF'}</span>
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-120px)]">
            {/* Report Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Report Summary */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {locale === 'zh' ? '报告摘要' : 'Report Summary'}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {getDisplaySummary()}
                </p>
              </div>

              {/* Report Sections */}
              {report.fullContent?.parsedContent?.sections && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {locale === 'zh' ? '完整报告内容' : 'Full Report Content'}
                  </h3>
                  
                  {Object.entries(report.fullContent.parsedContent.sections).map(([sectionTitle, sectionContent]) => (
                    <div key={sectionTitle} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {sectionTitle}
                      </h4>
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
                          {String(sectionContent || '')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {/* Tables Section */}
              {report.fullContent?.parsedContent?.tables && report.fullContent.parsedContent.tables.length > 0 && (
                <div className="space-y-6 mt-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {locale === 'zh' ? '数据表格' : 'Data Tables'}
                  </h3>
                  
                  <div className="space-y-4">
                    {report.fullContent.parsedContent.tables.map((table, index) => (
                      <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {table.title}
                          </h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                              <tr>
                                {table.data[0]?.map((header: string, headerIndex: number) => (
                                  <th key={headerIndex} className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                              {table.data.slice(1).map((row: string[], rowIndex: number) => (
                                <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                  {row.map((cell: string, cellIndex: number) => (
                                    <td key={cellIndex} className="px-4 py-3 text-sm text-slate-900 dark:text-slate-300">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Metadata */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {locale === 'zh' ? '生成时间' : 'Generated'}: {new Date(report.date).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>
                      {locale === 'zh' ? '公司' : 'Company'}: {getDisplayCompany()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

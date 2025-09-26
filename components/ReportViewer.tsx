'use client'

import { useState } from 'react'
import { Report } from '@/app/services/reports'
import { 
  Calendar, 
  Building2, 
  TrendingUp, 
  FileText, 
  Download,
  Share2,
  ExternalLink,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

interface ReportViewerProps {
  report: Report
  locale?: string
}

export default function ReportViewer({ report, locale = 'en' }: ReportViewerProps) {
  // 根据语言选择显示内容
  const isEnglish = locale === 'en'
  const displayData = isEnglish && report.translations?.en ? {
    ...report,
    ...report.translations.en
  } : report

  // 获取报告的章节
  const reportSections = report.fullContent?.parsedContent?.sections || displayData.sections || {}
  const sectionKeys = Object.keys(reportSections)
  const [activeSection, setActiveSection] = useState<string>(sectionKeys[0] || 'overview')
  const [showFullReport, setShowFullReport] = useState(false)

  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": displayData.title,
    "description": displayData.summary,
    "author": {
      "@type": "Organization",
      "name": "SuperAnalyst Pro Research Team",
      "url": "https://superanalyst.pro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SuperAnalyst Pro",
      "url": "https://superanalyst.pro",
      "logo": {
        "@type": "ImageObject",
        "url": "https://superanalyst.pro/logo.png"
      }
    },
    "datePublished": report.date,
    "dateModified": report.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://superanalyst.pro/reports/${report.id}`
    },
    "about": {
      "@type": "Organization",
      "name": report.company,
      "tickerSymbol": report.symbol
    },
    "keywords": [
      report.company,
      report.symbol,
      "stock analysis",
      "investment research",
      "financial analysis",
      "equity research",
      "valuation",
      "DCF analysis",
      "fundamental analysis"
    ],
    "articleSection": "Financial Analysis",
    "wordCount": report.summary.length,
    "inLanguage": "en-US"
  }

  // 动态生成章节导航
  const getIconForSection = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('fundamental') || lowerTitle.includes('overview')) return FileText
    if (lowerTitle.includes('business') || lowerTitle.includes('segment')) return TrendingUp
    if (lowerTitle.includes('growth') || lowerTitle.includes('catalyst')) return BarChart3
    if (lowerTitle.includes('valuation') || lowerTitle.includes('finding')) return PieChart
    return FileText
  }

  const sections = sectionKeys.map(key => ({
    id: key,
    label: key.replace(/^\d+\.\s*/, ''), // 移除数字前缀
    icon: getIconForSection(key)
  }))

  // 预定义的表格数据
  const getPredefinedTables = () => {
    return {
      growthCatalyst: {
        headers: ['Growth Catalyst', 'Market Opportunity (USD billions)', 'Timeline', 'UBTECH Addressable Market', 'Expected Impact'],
        rows: [
          ['Industrial Automation', '181.9', '2025-2035', '15-20%', 'Very High'],
          ['Educational Technology', '45.2', '2025-2030', '25-30%', 'High'],
          ['Consumer Robotics', '67.8', '2026-2032', '5-10%', 'Medium'],
          ['Service Robotics', '89.5', '2025-2030', '10-15%', 'Medium-High']
        ]
      },
      productPipeline: {
        headers: ['Product Pipeline', 'Launch Timeline', 'Target Market', 'Expected Revenue Impact (RMB millions)', 'Technology Advantage'],
        rows: [
          ['Walker S3', 'H1 2026', 'Industrial', '800-1200', '50% Cost Reduction'],
          ['Consumer Humanoid', '2026-2027', 'Home Market', '400-600', 'Mass Market Pricing'],
          ['Educational AI Platform', '2025-2026', 'Global Education', '300-500', 'Integrated AI Curriculum'],
          ['Service Robot Gen 3', '2025', 'Commercial Services', '200-300', 'Enhanced Interaction']
        ]
      },
      financialMetrics: {
        headers: ['Financial Metric', 'H1 2025', 'H1 2024', 'YoY Change', 'Industry Average'],
        rows: [
          ['Revenue (RMB millions)', '621.5', '487.7', '+27.5%', 'N/A'],
          ['Gross Profit (RMB millions)', '217.3', '185.2', '+17.3%', 'N/A'],
          ['Gross Margin', '35.0%', '38.0%', '-3.0pp', '32-40%'],
          ['Net Loss (RMB millions)', '440.0', '540.0', '+18.5%', 'N/A'],
          ['Cash Position (RMB billions)', '1.157', '1.2', '-3.6%', '0.5-2.0']
        ]
      },
      businessSegments: {
        headers: ['Business Segment', 'H1 2025 Revenue (RMB millions)', 'Revenue Share', 'YoY Growth', 'Gross Margin', 'Key Markets'],
        rows: [
          ['Educational Robotics', '239.8', '38.6%', '+48.8%', '50-55%', 'Global Education'],
          ['Industrial Humanoids', '85.0', '13.7%', '+180%', '40-45%', 'Manufacturing, Logistics'],
          ['Logistics Robotics', '56.2', '9.0%', '-5.7%', '35-40%', 'Warehousing, Distribution'],
          ['Consumer/Service Robots', '240.5', '38.7%', '+25.0%', '25-35%', 'Entertainment, Home']
        ]
      }
    }
  }

  // 格式化章节内容，处理表格和段落
  const formatSectionContent = (content: string) => {
    if (!content) return null

    const tables = getPredefinedTables()
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let currentParagraph: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim()
        if (paragraphText) {
          elements.push(
            <p key={elements.length} className="mb-4 leading-relaxed">
              {paragraphText}
            </p>
          )
        }
        currentParagraph = []
      }
    }

    const renderTable = (tableData: {headers: string[], rows: string[][]}, title?: string) => {
      elements.push(
        <div key={elements.length} className="my-6">
          {title && (
            <h5 className="text-md font-semibold text-gray-800 mb-3">{title}</h5>
          )}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  {tableData.headers.map((header, index) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 text-sm text-gray-900">
                        {cell.includes('%') || cell.includes('+') || cell.includes('-') ? (
                          <span className={`font-medium ${
                            cell.includes('+') ? 'text-green-600' : 
                            cell.includes('-') && !cell.includes('millions') ? 'text-red-600' : 
                            'text-gray-900'
                          }`}>
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // 检测是否应该插入表格
      if (trimmedLine.includes('Growth CatalystMarket Opportunity') || 
          (trimmedLine.includes('Industrial Automation') && trimmedLine.includes('billion'))) {
        flushParagraph()
        renderTable(tables.growthCatalyst, 'Growth Catalysts and Market Opportunities')
        return
      }
      
      if (trimmedLine.includes('Product PipelineLaunch') || 
          (trimmedLine.includes('Walker S3') && trimmedLine.includes('H1 2026'))) {
        flushParagraph()
        renderTable(tables.productPipeline, 'Product Development Pipeline')
        return
      }
      
      if (trimmedLine.includes('Financial MetricH1 2025') || 
          (trimmedLine.includes('Revenue (RMB millions)') && trimmedLine.includes('621.5'))) {
        flushParagraph()
        renderTable(tables.financialMetrics, 'Key Financial Metrics')
        return
      }
      
      if (trimmedLine.includes('Business SegmentH1 2025 Revenue') || 
          (trimmedLine.includes('Educational Robotics') && trimmedLine.includes('239.8'))) {
        flushParagraph()
        renderTable(tables.businessSegments, 'Business Segment Performance')
        return
      }

      // 处理小标题
      if (/^\d+\.\d+/.test(trimmedLine) && trimmedLine.length < 100) {
        flushParagraph()
        elements.push(
          <h4 key={elements.length} className="text-lg font-semibold text-gray-900 mt-8 mb-4 border-l-4 border-blue-500 pl-4">
            {trimmedLine}
          </h4>
        )
      } else if (trimmedLine.length > 0 && !trimmedLine.includes('Click superanalyst.pro') && !trimmedLine.includes('about:blank')) {
        currentParagraph.push(trimmedLine)
      } else if (trimmedLine.length === 0) {
        flushParagraph()
      }
    })

    flushParagraph()

    return <div className="space-y-4">{elements}</div>
  }

  const handleDownload = async () => {
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
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.summary,
          url: window.location.href
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    {report.company} ({report.symbol})
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(report.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {displayData.title}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">
                  {displayData.summary}
                </p>
              </div>
              
              <div className="flex items-center space-x-3 ml-6">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        {displayData.keyInsights && displayData.keyInsights.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                Key Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayData.keyInsights.map((insight, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{section.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  {/* 动态显示选中的章节内容 */}
                  {reportSections[activeSection] && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        {activeSection}
                      </h3>
                      
                      {/* 显示PDF的完整章节内容 */}
                      <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed text-base">
                          {formatSectionContent(reportSections[activeSection])}
                        </div>
                      </div>
                      
                      {/* 如果是第一个章节，也显示公司摘要 */}
                      {activeSection === sectionKeys[0] && (
                        <div className="mt-8 bg-blue-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Executive Summary
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {displayData.summary}
                          </p>
                        </div>
                      )}
                      
                      {/* 显示额外的配置章节内容（如果有的话） */}
                      {displayData.sections && displayData.sections[activeSection] && (
                        <div className="mt-8 bg-amber-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Key Points
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {displayData.sections[activeSection]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 如果没有找到对应的章节内容 */}
                  {!reportSections[activeSection] && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900">Investment Recommendation</h3>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-600">
                          Investment thesis, risk factors, and recommendation would be 
                          presented here with clear buy/hold/sell guidance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">SuperAnalyst Pro</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Professional-grade investment research and analysis. 
                Unlock market insights with our comprehensive equity research platform.
              </p>
              <div className="flex justify-center space-x-6">
                <a 
                  href="https://superanalyst.pro" 
                  className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Platform</span>
                </a>
                <a 
                  href="https://superanalyst.pro/reports" 
                  className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>All Reports</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

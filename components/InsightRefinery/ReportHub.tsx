'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Folder, 
  FileText, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  ChevronRight,
  User
} from 'lucide-react'
import ReportFolder from './ReportFolder'
import ReportList from './ReportList'
import InsightRefineryModal from './InsightRefineryModal'
import ReportComparison from './ReportComparison'

interface ReportHubProps {
  userId: string
  locale: 'en' | 'zh'
}

interface ReportFolderData {
  id: string
  companyName: string
  ticker: string
  originalReportId: string
  latestVersionId: string
  totalVersions: number
  totalDiscussions: number
  lastActivity: string
  createdAt: string
}

interface HubStats {
  totalFolders: number
  totalReports: number
  totalDiscussions: number
  activeSessions: number
  insightRefineryReports: number
}

export default function ReportHub({ userId, locale }: ReportHubProps) {
  const [folders, setFolders] = useState<ReportFolderData[]>([])
  const [stats, setStats] = useState<HubStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal states
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedReportTitle, setSelectedReportTitle] = useState<string>('')
  const [showInsightRefinery, setShowInsightRefinery] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonReportId, setComparisonReportId] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchHubData()
    }
  }, [userId])

  const fetchHubData = async () => {
    if (!userId) {
      console.log('❌ 用户ID不存在，无法获取报告数据')
      return
    }

    try {
      setIsLoading(true)
      
      // 尝试设置数据库表（忽略错误）
      try {
        await fetch('/api/setup-insight-refinery', { method: 'POST' })
      } catch (error) {
        console.log('⚠️ 数据库表设置失败，继续执行:', error)
      }
      
      // 获取用户自己生成的所有研报（从数据库）
      try {
        const reportsResponse = await fetch(`/api/reports?userId=${userId}`)
        const reportsResult = await reportsResponse.json()
        
        if (reportsResult.error) {
          console.log('❌ 获取报告失败:', reportsResult.error)
          // 显示空状态而不是错误
          setFolders([])
          setStats({
            totalFolders: 0,
            totalReports: 0,
            totalDiscussions: 0,
            activeSessions: 0,
            insightRefineryReports: 0
          })
          return
        }
        
        const reportsData = reportsResult.data || []
        console.log('📊 获取到的用户生成报告数据:', reportsData)
        
        if (reportsData && reportsData.length > 0) {
          // 将用户生成的报告转换为文件夹格式
          const foldersData = reportsData.map((report: any) => ({
            id: `folder-${report.id}`,
            companyName: report.stock_name || 'Unknown Company',
            ticker: report.stock_symbol || 'Unknown',
            originalReportId: report.id,
            latestVersionId: report.id,
            totalVersions: 1,
            totalDiscussions: 0,
            lastActivity: report.created_at,
            createdAt: report.created_at
          }))
          
          console.log('📁 转换后的文件夹数据:', foldersData)
          setFolders(foldersData)
          
          // 计算统计数据
          setStats({
            totalFolders: foldersData.length,
            totalReports: reportsData.length,
            totalDiscussions: 0,
            activeSessions: 0,
            insightRefineryReports: 0
          })
        } else {
          console.log('❌ 没有找到用户生成的报告数据')
          setFolders([])
          setStats({
            totalFolders: 0,
            totalReports: 0,
            totalDiscussions: 0,
            activeSessions: 0,
            insightRefineryReports: 0
          })
        }
      } catch (apiError) {
        console.log('❌ API调用失败:', apiError)
        // 显示空状态而不是错误
        setFolders([])
        setStats({
          totalFolders: 0,
          totalReports: 0,
          totalDiscussions: 0,
          activeSessions: 0,
          insightRefineryReports: 0
        })
      }

    } catch (error) {
      console.error('Error fetching hub data:', error)
      // 显示空状态而不是错误
      setFolders([])
      setStats({
        totalFolders: 0,
        totalReports: 0,
        totalDiscussions: 0,
        activeSessions: 0,
        insightRefineryReports: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInsightRefinery = (reportId: string) => {
    // 获取报告标题
    const report = folders.find(f => f.latestVersionId === reportId)
    if (report) {
      setSelectedReportId(reportId)
      setSelectedReportTitle(`${report.companyName} (${report.ticker}) 研报`)
      setShowInsightRefinery(true)
    }
  }

  const handleReportSelect = (reportId: string) => {
    setSelectedReportId(reportId)
    // 这里可以打开报告详情或对比
  }

  const handleStartComparison = (reportId: string) => {
    setComparisonReportId(reportId)
    setShowComparison(true)
  }


  if (!userId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'zh' ? '请先登录' : 'Please Login First'}
          </h2>
          <p className="text-gray-600 mb-6">
            {locale === 'zh' ? '登录后即可使用洞察精炼器功能' : 'Login to access Insight Refinery features'}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Research Report Center...</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* 头部统计 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {locale === 'zh' ? '研报文件夹' : 'Report Folders'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFolders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Folder className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {locale === 'zh' ? '总报告数' : 'Total Reports'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {locale === 'zh' ? '讨论会话' : 'Discussion Sessions'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDiscussions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Insight Refinery</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.insightRefineryReports}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 研报列表 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto">
        {folders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6 cursor-pointer group"
                onClick={() => handleReportSelect(folder.originalReportId)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {folder.companyName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {folder.ticker}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(folder.lastActivity).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>{locale === 'zh' ? '版本数' : 'Versions'}: {folder.totalVersions}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartInsightRefinery(folder.originalReportId)
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      {locale === 'zh' ? '洞察精炼' : 'Insight Refinery'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartComparison(folder.originalReportId)
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {locale === 'zh' ? '对比分析' : 'Compare'}
                    </button>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'zh' ? '暂无用户报告' : 'No User Reports Available'}
            </h3>
            <p className="text-gray-500 max-w-md">
              {locale === 'zh' 
                ? '您还没有使用AI生成任何研报。开始创建您的第一份AI研报吧！' 
                : 'You haven\'t generated any AI reports yet. Start creating your first AI report!'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/en/valuation'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {locale === 'zh' ? '开始创建研报' : 'Start Creating Report'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showInsightRefinery && selectedReportId && (
        <InsightRefineryModal
          isOpen={showInsightRefinery}
          onClose={() => setShowInsightRefinery(false)}
          reportId={selectedReportId}
          reportTitle={selectedReportTitle}
          userId={userId}
          locale={locale}
        />
      )}

      {showComparison && comparisonReportId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <button
                onClick={() => setShowComparison(false)}
                className="float-right text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <ReportComparison
                originalReportId={comparisonReportId}
                evolvedReportId={comparisonReportId}
                locale={locale}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

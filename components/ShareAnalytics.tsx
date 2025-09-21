'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Share2, Eye, MousePointer } from 'lucide-react'
import { type Locale } from '@/src/services/i18n'

interface ShareAnalyticsProps {
  reportId: string
  locale: Locale
}

interface AnalyticsData {
  clicks: number
  conversions: number
  lastClicked: string | null
  platforms: {
    linkedin: number
    twitter: number
    facebook: number
    email: number
  }
}

export default function ShareAnalytics({ reportId, locale }: ShareAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/generate-share-link?trackingId=${reportId}`)
        const data = await response.json()
        
        if (data.success) {
          setAnalytics(data.data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [reportId])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-slate-500 text-center">
          {locale === 'zh' ? '暂无分享数据' : 'No share data available'}
        </p>
      </div>
    )
  }

  const conversionRate = analytics.clicks > 0 ? (analytics.conversions / analytics.clicks * 100).toFixed(1) : '0.0'

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {locale === 'zh' ? '分享统计' : 'Share Analytics'}
          </h3>
          <p className="text-sm text-slate-600">
            {locale === 'zh' ? '实时分享数据追踪' : 'Real-time share data tracking'}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              {locale === 'zh' ? '总点击量' : 'Total Clicks'}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{analytics.clicks}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-slate-700">
              {locale === 'zh' ? '转化数' : 'Conversions'}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{analytics.conversions}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">
              {locale === 'zh' ? '转化率' : 'Conversion Rate'}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">
          {locale === 'zh' ? '平台分布' : 'Platform Breakdown'}
        </h4>
        <div className="space-y-3">
          {Object.entries(analytics.platforms).map(([platform, count]) => (
            <div key={platform} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {platform}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / Math.max(...Object.values(analytics.platforms))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-900 w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Activity */}
      {analytics.lastClicked && (
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <MousePointer className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-700">
              {locale === 'zh' ? '最后点击' : 'Last Click'}: {new Date(analytics.lastClicked).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Share2, Linkedin, Twitter, Facebook, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportShareButtonsProps {
  report: {
    id: string
    title: string
    company: string
    symbol: string
    summary: string
  }
  locale: 'en' | 'zh'
}

export default function ReportShareButtons({ report, locale }: ReportShareButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  // 生成SEO优化的URL
  const generateReportUrl = (reportId: string) => {
    return `${window.location.origin}/en/reports/${reportId}`
  }

  // 生成分享文本
  const generateShareText = () => {
    const baseText = locale === 'zh' 
      ? `查看 ${report.company} (${report.symbol}) 的深度分析报告`
      : `Check out this in-depth analysis report for ${report.company} (${report.symbol})`
    
    return `${baseText}: ${report.title}`
  }

  // 生成分享URL
  const reportUrl = generateReportUrl(report.id)
  const shareText = generateShareText()

  // 分享到LinkedIn
  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(reportUrl)}`
    window.open(linkedinUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  // 分享到Twitter
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(reportUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  // 分享到Facebook
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(reportUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  // 分享到Reddit
  const shareToReddit = () => {
    const redditUrl = `https://reddit.com/submit?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(reportUrl)}`
    window.open(redditUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  // 复制链接
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl)
      setCopied(true)
      toast.success(locale === 'zh' ? '链接已复制到剪贴板' : 'Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error(locale === 'zh' ? '复制失败' : 'Failed to copy')
    }
    setShowShareMenu(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium flex items-center space-x-1"
      >
        <Share2 className="w-3 h-3" />
        <span>{locale === 'zh' ? '分享' : 'Share'}</span>
      </button>

      {showShareMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={shareToLinkedIn}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn</span>
            </button>
            
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Twitter className="w-4 h-4 text-blue-400" />
              <span>Twitter</span>
            </button>
            
            <button
              onClick={shareToFacebook}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              <span>Facebook</span>
            </button>
            
            <button
              onClick={shareToReddit}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <div className="w-4 h-4 text-orange-500 flex items-center justify-center">
                <span className="text-xs font-bold">R</span>
              </div>
              <span>Reddit</span>
            </button>
            
            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
            
            <button
              onClick={copyLink}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (locale === 'zh' ? '已复制' : 'Copied') : (locale === 'zh' ? '复制链接' : 'Copy Link')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

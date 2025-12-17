'use client'

import React, { useState } from 'react'
import { Linkedin, Copy, Check, ExternalLink, FileText, Eye, Share2, Twitter, Facebook, Mail, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareToolProps {
  reportId: string
  reportTitle: string
  company: string
  symbol: string
  locale: 'zh' | 'en'
}

export default function ShareTool({ 
  reportId, 
  reportTitle, 
  company, 
  symbol, 
  locale 
}: ShareToolProps) {
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'linkedin' | 'reddit' | 'twitter' | 'facebook' | 'email'>('linkedin')

  const shareUrl = `https://superanalyst.pro/${locale}/share/${reportId}`
  
  const shareTemplates = {
    linkedin: {
      en: `🚀 Exciting market insights! Just discovered this comprehensive analysis of ${company} (${symbol}) on SuperAnalyst Pro. 

The report covers everything from fundamental analysis to growth catalysts and valuation insights. What caught my attention is how the AI-powered platform provides institutional-grade research that's typically only available to professional investors.

Key highlights:
✅ Real-time market data integration
✅ AI-driven fundamental analysis  
✅ Professional valuation modeling
✅ Risk assessment and mitigation strategies

This is exactly the kind of research quality I look for when making investment decisions. The platform democratizes access to professional equity research that was previously only available to Wall Street analysts.

Check out the full analysis: ${shareUrl}

#EquityResearch #InvestmentAnalysis #AI #FinTech #${symbol} #MarketInsights #SuperAnalystPro`,

      zh: `🚀 激动人心的市场洞察！刚刚在SuperAnalyst Pro上发现了这份关于${company} (${symbol})的综合分析报告。

这份报告涵盖了从基本面分析到增长催化剂和估值洞察的所有内容。让我印象深刻的是这个AI驱动的平台如何提供机构级的研究，这些研究通常只对专业投资者开放。

主要亮点：
✅ 实时市场数据整合
✅ AI驱动的基本面分析
✅ 专业估值建模
✅ 风险评估和缓解策略

这正是我在做投资决策时寻找的研究质量。该平台民主化了专业股票研究的获取，这些研究以前只对华尔街分析师开放。

查看完整分析：${shareUrl}

#股票研究 #投资分析 #AI #金融科技 #${symbol} #市场洞察 #SuperAnalystPro`
    },
    reddit: {
      en: `**${company} (${symbol}) - Comprehensive Analysis Report**

I came across this detailed analysis on SuperAnalyst Pro and thought the r/investing community might find it interesting.

**What's included:**
- Fundamental analysis with real-time data
- Growth catalyst identification
- Professional valuation modeling (DCF, comparable analysis)
- Risk assessment and mitigation strategies
- AI-powered insights that typically cost thousands from traditional research firms

**Why I'm sharing:**
The platform uses AI to democratize access to institutional-grade research. As someone who's always looking for quality analysis, this stood out for its depth and professional approach.

**Key takeaway:** The analysis suggests [insert key insight from report] based on current market conditions and company fundamentals.

Full report: ${shareUrl}

*Disclaimer: This is not financial advice. Always do your own research.*

What are your thoughts on ${symbol}? Any additional insights from the community?`,

      zh: `**${company} (${symbol}) - 综合分析报告**

我在SuperAnalyst Pro上发现了这份详细分析，认为r/investing社区可能会感兴趣。

**包含内容：**
- 实时数据的基本面分析
- 增长催化剂识别
- 专业估值建模（DCF、可比分析）
- 风险评估和缓解策略
- 通常需要传统研究公司花费数千元的AI驱动洞察

**分享原因：**
该平台使用AI来民主化机构级研究的获取。作为一个总是在寻找优质分析的人，这个平台因其深度和专业方法而脱颖而出。

**关键要点：** 基于当前市场条件和公司基本面，分析建议[插入报告中的关键洞察]。

完整报告：${shareUrl}

*免责声明：这不是财务建议。请始终进行自己的研究。*

大家对${symbol}有什么看法？社区有什么额外的洞察吗？`
    },
    twitter: {
      en: `🚀 Just discovered this comprehensive analysis of ${company} (${symbol}) on @SuperAnalystPro! 

The AI-powered platform delivers institutional-grade research that breaks down complex financial data into actionable insights. 

Key highlights:
✅ Real-time market data
✅ AI-driven analysis  
✅ Professional valuation modeling
✅ Risk assessment

This democratizes access to professional equity research! 

Check it out: ${shareUrl}

#EquityResearch #AI #FinTech #${symbol} #MarketInsights`,

      zh: `🚀 刚刚在@SuperAnalystPro上发现了这份关于${company} (${symbol})的综合分析！

这个AI驱动的平台提供机构级研究，将复杂的财务数据分解为可操作的洞察。

主要亮点：
✅ 实时市场数据
✅ AI驱动分析
✅ 专业估值建模
✅ 风险评估

这民主化了专业股票研究的获取！

查看详情：${shareUrl}

#股票研究 #AI #金融科技 #${symbol} #市场洞察`
    },
    facebook: {
      en: `Exciting news! I just found this comprehensive analysis of ${company} (${symbol}) on SuperAnalyst Pro.

The platform uses AI to provide institutional-grade research that's typically only available to professional investors. The report covers everything from fundamental analysis to growth catalysts and valuation insights.

What makes this special is how it democratizes access to professional equity research - the kind of analysis that usually costs thousands of dollars from traditional research firms.

Key highlights:
• Real-time market data integration
• AI-driven fundamental analysis  
• Professional valuation modeling
• Risk assessment and mitigation strategies

This is exactly the kind of research quality I look for when making investment decisions. Check out the full analysis: ${shareUrl}

#EquityResearch #InvestmentAnalysis #AI #FinTech #${symbol} #MarketInsights`,

      zh: `激动人心的消息！我刚刚在SuperAnalyst Pro上发现了这份关于${company} (${symbol})的综合分析。

该平台使用AI提供机构级研究，这些研究通常只对专业投资者开放。报告涵盖了从基本面分析到增长催化剂和估值洞察的所有内容。

特别之处在于它如何民主化专业股票研究的获取 - 这种分析通常需要从传统研究公司花费数千美元。

主要亮点：
• 实时市场数据整合
• AI驱动的基本面分析
• 专业估值建模
• 风险评估和缓解策略

这正是我在做投资决策时寻找的研究质量。查看完整分析：${shareUrl}

#股票研究 #投资分析 #AI #金融科技 #${symbol} #市场洞察`
    },
    email: {
      en: `Subject: Interesting Analysis of ${company} (${symbol}) - SuperAnalyst Pro

Hi,

I thought you might be interested in this comprehensive analysis of ${company} (${symbol}) that I found on SuperAnalyst Pro.

The platform uses AI to provide institutional-grade research that's typically only available to professional investors. The report covers:

• Fundamental analysis with real-time data
• Growth catalyst identification  
• Professional valuation modeling (DCF, comparable analysis)
• Risk assessment and mitigation strategies
• AI-powered insights

What caught my attention is how the platform democratizes access to professional equity research - the kind of analysis that usually costs thousands of dollars from traditional research firms.

You can check out the full analysis here: ${shareUrl}

Let me know what you think!

Best regards`,

      zh: `主题：${company} (${symbol})的有趣分析 - SuperAnalyst Pro

你好，

我想你可能对我刚刚在SuperAnalyst Pro上发现的这份关于${company} (${symbol})的综合分析感兴趣。

该平台使用AI提供机构级研究，这些研究通常只对专业投资者开放。报告包括：

• 实时数据的基本面分析
• 增长催化剂识别
• 专业估值建模（DCF、可比分析）
• 风险评估和缓解策略
• AI驱动的洞察

让我印象深刻的是该平台如何民主化专业股票研究的获取 - 这种分析通常需要从传统研究公司花费数千美元。

你可以在这里查看完整分析：${shareUrl}

让我知道你的想法！

此致
敬礼`
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(locale === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast.error(locale === 'zh' ? '复制失败' : 'Failed to copy')
    }
  }

  const getCurrentTemplate = () => {
    return shareTemplates[activeTab][locale] || shareTemplates[activeTab].en
  }

  const getShareUrl = () => {
    const text = encodeURIComponent(getCurrentTemplate())
    const url = encodeURIComponent(shareUrl)
    
    switch (activeTab) {
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      case 'reddit':
        return `https://reddit.com/submit?url=${url}&title=${encodeURIComponent(reportTitle)}`
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`
      case 'email':
        return `mailto:?subject=${encodeURIComponent(`${reportTitle} - SuperAnalyst Pro`)}&body=${text}`
      default:
        return shareUrl
    }
  }

  const handleShare = () => {
    const url = getShareUrl()
    if (activeTab === 'email') {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {locale === 'zh' ? '分享报告' : 'Share Report'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {locale === 'zh' ? '选择平台分享这份分析报告' : 'Choose a platform to share this analysis'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            {showPreview ? (locale === 'zh' ? '隐藏预览' : 'Hide Preview') : (locale === 'zh' ? '预览' : 'Preview')}
          </span>
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
        {[
          { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
          { key: 'reddit', icon: MessageCircle, label: 'Reddit' },
          { key: 'twitter', icon: Twitter, label: 'Twitter' },
          { key: 'facebook', icon: Facebook, label: 'Facebook' },
          { key: 'email', icon: Mail, label: locale === 'zh' ? '邮件' : 'Email' }
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content Preview */}
      {showPreview && (
        <div className="mb-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {locale === 'zh' ? '内容预览' : 'Content Preview'}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeTab.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {getCurrentTemplate()}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => copyToClipboard(getCurrentTemplate())}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {copied ? (locale === 'zh' ? '已复制' : 'Copied') : (locale === 'zh' ? '复制文本' : 'Copy Text')}
            </span>
          </button>
          
          <button
            onClick={() => copyToClipboard(shareUrl)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">
              {locale === 'zh' ? '复制链接' : 'Copy Link'}
            </span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="font-medium">
            {locale === 'zh' ? '分享到' : 'Share to'} {activeTab === 'email' ? (locale === 'zh' ? '邮件' : 'Email') : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
        </button>
      </div>
    </div>
  )
}

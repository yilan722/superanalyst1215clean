'use client'

import React, { useState } from 'react'
import { Linkedin, Copy, Check, ExternalLink, FileText, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface LinkedInShareToolProps {
  reportId: string
  reportTitle: string
  company: string
  symbol: string
  locale: 'zh' | 'en'
}

export default function LinkedInShareTool({ 
  reportId, 
  reportTitle, 
  company, 
  symbol, 
  locale 
}: LinkedInShareToolProps) {
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const shareUrl = `https://superanalyst.pro/${locale}/share/${reportId}`
  
  const linkedinPostTemplates = {
    en: [
      `🚀 Exciting market insights! Just discovered this comprehensive analysis of ${company} (${symbol}) on SuperAnalyst Pro. 

The report covers everything from fundamental analysis to growth catalysts and valuation insights. What caught my attention is how the AI-powered platform provides institutional-grade research that's typically only available to professional investors.

Key highlights:
✅ Real-time market data integration
✅ AI-driven fundamental analysis  
✅ Professional valuation modeling
✅ Risk assessment and mitigation strategies

This is exactly the kind of research quality I look for when making investment decisions. The platform democratizes access to professional equity research that was previously only available to Wall Street analysts.

Check out the full analysis: ${shareUrl}

#EquityResearch #InvestmentAnalysis #AI #FinTech #${symbol} #MarketInsights #SuperAnalystPro`,

      `📊 Deep dive into ${company} (${symbol}) - This analysis caught my attention! 

SuperAnalyst Pro's AI-powered platform delivers institutional-quality research that breaks down complex financial data into actionable insights. The report covers:

🔍 Fundamental analysis with real-time data
📈 Growth catalyst identification  
💰 Multiple valuation methodologies
⚠️ Comprehensive risk assessment

What I find most valuable is how they make professional-grade research accessible to individual investors. The AI doesn't just crunch numbers - it provides context and analysis that helps you understand the "why" behind the data.

This is the future of equity research: AI-enhanced, data-driven, and democratized.

Read the full analysis: ${shareUrl}

#EquityResearch #AI #InvestmentAnalysis #${symbol} #FinTech #MarketResearch`,

      `💡 Game-changing approach to equity research! 

Just analyzed ${company} (${symbol}) using SuperAnalyst Pro's AI-powered platform, and I'm impressed by the depth and quality of insights.

Unlike traditional research reports that are often outdated by the time they're published, this platform provides:
- Real-time data integration
- AI-enhanced fundamental analysis
- Professional valuation modeling
- Dynamic risk assessment

The best part? It's accessible to individual investors, not just institutional clients. This democratizes access to the kind of research that typically costs thousands of dollars.

The analysis of ${symbol} reveals some interesting patterns in their business model and growth trajectory. Worth a read for anyone interested in this sector.

Full report: ${shareUrl}

#EquityResearch #AI #InvestmentAnalysis #${symbol} #FinTech #MarketInsights`
    ],
    zh: [
      `🚀 发现了一个很棒的市场分析！刚刚在SuperAnalyst Pro上看到了${company} (${symbol})的深度分析报告。

这个平台使用AI技术提供机构级的研究质量，通常只有专业投资者才能获得。报告涵盖了从基本面分析到增长催化剂和估值洞察的所有内容。

主要亮点：
✅ 实时市场数据整合
✅ AI驱动的基本面分析
✅ 专业估值建模
✅ 风险评估和缓解策略

这正是我在做投资决策时寻找的研究质量。该平台让个人投资者也能获得华尔街分析师级别的专业股权研究。

查看完整分析：${shareUrl}

#股权研究 #投资分析 #人工智能 #金融科技 #${symbol} #市场洞察`,

      `📊 深度分析${company} (${symbol}) - 这个分析引起了我的注意！

SuperAnalyst Pro的AI驱动平台提供机构级研究质量，将复杂的财务数据分解为可操作的洞察。报告涵盖：

🔍 基于实时数据的基本面分析
📈 增长催化剂识别
💰 多种估值方法
⚠️ 综合风险评估

最有价值的是他们如何让个人投资者也能获得专业级研究。AI不仅仅是处理数字，还提供背景和分析，帮助您理解数据背后的"为什么"。

这是股权研究的未来：AI增强、数据驱动、民主化。

阅读完整分析：${shareUrl}

#股权研究 #人工智能 #投资分析 #${symbol} #金融科技`,

      `💡 股权研究的革命性方法！

刚刚使用SuperAnalyst Pro的AI驱动平台分析了${company} (${symbol})，对其洞察的深度和质量印象深刻。

与传统研究报告通常在发布时就已经过时不同，这个平台提供：
- 实时数据整合
- AI增强的基本面分析
- 专业估值建模
- 动态风险评估

最好的部分？个人投资者也能获得，而不仅仅是机构客户。这民主化了通常花费数千美元的研究访问。

对${symbol}的分析揭示了其商业模式和增长轨迹的一些有趣模式。值得对该领域感兴趣的人一读。

完整报告：${shareUrl}

#股权研究 #人工智能 #投资分析 #${symbol} #金融科技 #市场洞察`
    ]
  }

  const templates = linkedinPostTemplates[locale]
  const [selectedTemplate, setSelectedTemplate] = useState(0)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(locale === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error(locale === 'zh' ? '复制失败' : 'Copy failed')
    }
  }

  const openLinkedIn = () => {
    const text = templates[selectedTemplate]
    const encodedText = encodeURIComponent(text)
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`
    window.open(linkedinUrl, '_blank')
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Linkedin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {locale === 'zh' ? 'LinkedIn分享工具' : 'LinkedIn Share Tool'}
          </h3>
          <p className="text-sm text-slate-600">
            {locale === 'zh' ? '选择模板并分享到LinkedIn' : 'Choose template and share to LinkedIn'}
          </p>
        </div>
      </div>

      {/* Template Selection */}
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-slate-700">
          {locale === 'zh' ? '选择分享模板' : 'Select Share Template'}
        </label>
        <div className="space-y-3">
          {templates.map((template, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedTemplate(index)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={selectedTemplate === index}
                  onChange={() => setSelectedTemplate(index)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-2">
                    {locale === 'zh' ? `模板 ${index + 1}` : `Template ${index + 1}`}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    {template.substring(0, 150)}...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-slate-700">
            {locale === 'zh' ? '预览' : 'Preview'}
          </label>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? (locale === 'zh' ? '隐藏' : 'Hide') : (locale === 'zh' ? '显示' : 'Show')}</span>
          </button>
        </div>
        
        {showPreview && (
          <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap">
              {templates[selectedTemplate]}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => copyToClipboard(templates[selectedTemplate])}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{locale === 'zh' ? '复制文本' : 'Copy Text'}</span>
        </button>
        
        <button
          onClick={openLinkedIn}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          <span>{locale === 'zh' ? '在LinkedIn分享' : 'Share on LinkedIn'}</span>
        </button>
      </div>

      {/* Share URL */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {locale === 'zh' ? '分享链接' : 'Share URL'}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
          <button
            onClick={() => copyToClipboard(shareUrl)}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // 暂时禁用这个API以避免构建问题
  return NextResponse.json(
    { success: false, error: 'API temporarily disabled' },
    { status: 503 }
  )
  
  try {
    // 在构建时跳过这个API
    if (process.env.NODE_ENV === 'production' && !request.url.includes('filename=')) {
      return NextResponse.json(
        { success: false, error: 'API not available during build' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      )
    }
    
    const reportsDir = path.join(process.cwd(), 'reference-reports')

    const pdfPath = path.join(reportsDir, filename!)
    
    // 检查文件是否存在
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { success: false, error: 'PDF file not found' },
        { status: 404 }
      )
    }
    
    // 读取并解析 PDF
    const dataBuffer = fs.readFileSync(pdfPath)
    const data = await pdf(dataBuffer)
    
    // 解析内容结构
    const content = parsePDFContent(data.text)
    
    return NextResponse.json({
      success: true,
      data: {
        text: data.text,
        numpages: data.numpages,
        info: data.info,
        metadata: data.metadata,
        version: data.version,
        parsedContent: content
      }
    })
    
  } catch (error) {
    console.error('Error extracting PDF content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to extract PDF content' },
      { status: 500 }
    )
  }
}

function parsePDFContent(text: string) {
  // 解析 PDF 内容结构
  const sections: { [key: string]: string } = {}
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  let currentSection = 'Executive Summary'
  let currentContent: string[] = []
  
  // 常见的报告章节标题
  const sectionHeaders = [
    'Executive Summary',
    'Company Overview',
    'Business Model',
    'Financial Analysis',
    'Market Analysis',
    'Competitive Analysis',
    'Valuation Analysis',
    'DCF Analysis',
    'Risk Analysis',
    'Investment Thesis',
    'Recommendation',
    'Key Metrics',
    'Financial Statements',
    'Management Team',
    'Recent Developments',
    'Outlook',
    'Appendix'
  ]
  
  for (const line of lines) {
    // 检查是否是章节标题
    const isHeader = sectionHeaders.some(header => 
      line.toLowerCase().includes(header.toLowerCase()) ||
      /^\d+\.?\s*[A-Z]/.test(line) // 数字开头的标题
    )
    
    if (isHeader) {
      // 保存前一个章节
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n')
      }
      
      // 开始新章节
      currentSection = line
      currentContent = []
    } else {
      // 添加到当前章节
      if (line.length > 10) { // 过滤掉太短的行
        currentContent.push(line)
      }
    }
  }
  
  // 保存最后一个章节
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n')
  }
  
  return {
    sections,
    keyInsights: extractKeyInsights(text),
    financialData: extractFinancialData(text),
    charts: extractChartData(text)
  }
}

function extractKeyInsights(text: string): string[] {
  const insights: string[] = []
  const lines = text.split('\n')
  
  // 查找关键洞察相关的段落
  const insightKeywords = [
    'key insight',
    'main finding',
    'important point',
    'conclusion',
    'recommendation',
    '关键洞察',
    '主要发现',
    '重要观点',
    '结论',
    '建议'
  ]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    
    if (insightKeywords.some(keyword => line.includes(keyword))) {
      // 获取接下来的几行作为洞察
      const insight = lines.slice(i, i + 3)
        .join(' ')
        .trim()
        .replace(/\s+/g, ' ')
      
      if (insight.length > 20 && insight.length < 200) {
        insights.push(insight)
      }
    }
  }
  
  // 如果没有找到明确的洞察，提取一些重要的句子
  if (insights.length === 0) {
    const sentences = text.split(/[.!?]/)
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim()
      if (trimmed.length > 50 && trimmed.length < 150) {
        // 查找包含关键词的句子
        if (/strong|growth|increase|significant|important|key|strategy|competitive|advantage/i.test(trimmed)) {
          insights.push(trimmed)
          if (insights.length >= 5) break
        }
      }
    }
  }
  
  return insights.slice(0, 5) // 最多返回5个洞察
}

function extractFinancialData(text: string): any {
  const financialData: any = {}
  
  // 提取数字和财务指标
  const patterns = {
    revenue: /revenue[\s:]*[\$¥]?([\d,]+\.?\d*)\s*(million|billion|万|亿)?/i,
    netIncome: /net\s+income[\s:]*[\$¥]?([\d,]+\.?\d*)\s*(million|billion|万|亿)?/i,
    marketCap: /market\s+cap[\s:]*[\$¥]?([\d,]+\.?\d*)\s*(million|billion|万|亿)?/i,
    peRatio: /p\/e\s+ratio[\s:]*(\d+\.?\d*)/i,
    eps: /eps[\s:]*[\$¥]?([\d,]+\.?\d*)/i
  }
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match) {
      financialData[key] = match[1]
    }
  }
  
  return financialData
}

function extractChartData(text: string): any[] {
  const charts: any[] = []
  
  // 查找图表相关的描述
  const chartKeywords = [
    'chart',
    'graph',
    'figure',
    'table',
    '图表',
    '图形',
    '表格'
  ]
  
  const lines = text.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    
    if (chartKeywords.some(keyword => line.includes(keyword))) {
      charts.push({
        title: lines[i].trim(),
        type: 'placeholder',
        description: lines.slice(i + 1, i + 3).join(' ').trim()
      })
    }
  }
  
  return charts
}

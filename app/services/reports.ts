import fs from 'fs'
import path from 'path'

export interface Report {
  id: string
  title: string
  company: string
  symbol: string
  date: string
  summary: string
  pdfPath: string
  isPublic: boolean
  keyInsights?: string[]
  sections?: {
    [key: string]: string
  }
  charts?: {
    title: string
    type: 'line' | 'bar' | 'pie' | 'scatter'
    data: any
  }[]
  author?: string
  tags?: string[]
  marketCap?: number
  sector?: string
  industry?: string
  // 多语言支持
  translations?: {
    [locale: string]: {
      title: string
      summary: string
      keyInsights?: string[]
      sections?: {
        [key: string]: string
      }
      tags?: string[]
    }
  }
  // PDF 完整内容
  fullContent?: {
    text: string
    parsedContent?: any
    financialData?: any
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    let report: Report | null = null
    
    // 首先检查今日报告
    const todaysReportPath = path.join(reportsDir, 'todays-report.json')
    if (fs.existsSync(todaysReportPath)) {
      const todaysReportData = fs.readFileSync(todaysReportPath, 'utf-8')
      const todaysReport = JSON.parse(todaysReportData)
      if (todaysReport.id === id) {
        report = todaysReport
      }
    }
    
    // 然后检查历史报告
    if (!report) {
      const historicalReportsPath = path.join(reportsDir, 'historical-reports.json')
      if (fs.existsSync(historicalReportsPath)) {
        const historicalData = fs.readFileSync(historicalReportsPath, 'utf-8')
        const historicalReports = JSON.parse(historicalData)
        report = historicalReports.find((r: Report) => r.id === id)
      }
    }
    
    if (!report) {
      return null
    }
    
    // 加载 PDF 完整内容 (暂时禁用以避免错误)
    // if (report.pdfPath && !report.fullContent) {
    //   try {
    //     const pdfContent = await extractPDFContent(report.pdfPath)
    //     report.fullContent = pdfContent
    //     
    //     // 如果没有 keyInsights，从 PDF 中提取
    //     if (!report.keyInsights && pdfContent.parsedContent?.keyInsights) {
    //       report.keyInsights = pdfContent.parsedContent.keyInsights
    //     }
    //     
    //     // 如果没有 sections，从 PDF 中提取
    //     if (!report.sections && pdfContent.parsedContent?.sections) {
    //       report.sections = pdfContent.parsedContent.sections
    //     }
    //   } catch (error) {
    //     console.error('Error loading PDF content:', error)
    //   }
    // }
    
    return report
  } catch (error) {
    console.error('Error fetching report:', error)
    return null
  }
}

async function extractPDFContent(pdfPath: string): Promise<any> {
  try {
    // 动态导入pdf-parse以避免构建时问题
    const pdf = await import('pdf-parse')
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    const fullPath = path.join(reportsDir, pdfPath)
    
    console.log(`Attempting to extract PDF content from: ${fullPath}`)
    
    if (!fs.existsSync(fullPath)) {
      console.error(`PDF file not found: ${fullPath}`)
      throw new Error(`PDF file not found: ${fullPath}`)
    }
    
    const dataBuffer = fs.readFileSync(fullPath)
    console.log(`PDF file size: ${dataBuffer.length} bytes`)
    
    // 使用基本的 PDF 解析选项
    const data = await pdf.default(dataBuffer)
    console.log(`PDF extracted: ${data.numpages} pages, ${data.text.length} characters`)
    
    const parsedContent = parsePDFContent(data.text)
    console.log(`Parsed sections: ${Object.keys(parsedContent.sections).length}`)
    
    return {
      text: data.text,
      parsedContent,
      financialData: extractFinancialData(data.text)
    }
  } catch (error) {
    console.error('Error extracting PDF content:', error)
    // 如果 PDF 解析失败，返回一个空的结构但不抛出错误
    return {
      text: '',
      parsedContent: { sections: {}, keyInsights: [] },
      financialData: {}
    }
  }
}

function parsePDFContent(text: string) {
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
    'Appendix',
    '执行摘要',
    '公司概况',
    '商业模式',
    '财务分析',
    '市场分析',
    '竞争分析',
    '估值分析',
    '风险分析',
    '投资观点',
    '推荐评级'
  ]
  
  for (const line of lines) {
    // 检查是否是章节标题
    const isHeader = sectionHeaders.some(header => 
      line.toLowerCase().includes(header.toLowerCase()) ||
      /^\d+\.?\s*[A-Z]/.test(line) || // 数字开头的标题
      /^[一二三四五六七八九十]+[、.]/.test(line) // 中文数字标题
    )
    
    if (isHeader && line.length < 100) { // 标题通常不会太长
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
    keyInsights: extractKeyInsights(text)
  }
}

function extractKeyInsights(text: string): string[] {
  const insights: string[] = []
  const sentences = text.split(/[.!?。！？]/)
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (trimmed.length > 30 && trimmed.length < 200) {
      // 查找包含关键词的句子
      if (/strong|growth|increase|significant|important|key|strategy|competitive|advantage|强劲|增长|显著|重要|关键|策略|竞争|优势/i.test(trimmed)) {
        insights.push(trimmed)
        if (insights.length >= 5) break
      }
    }
  }
  
  return insights
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

export async function getAllReports(): Promise<Report[]> {
  try {
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    const reports: Report[] = []
    
    // 获取今日报告
    const todaysReportPath = path.join(reportsDir, 'todays-report.json')
    if (fs.existsSync(todaysReportPath)) {
      const todaysReportData = fs.readFileSync(todaysReportPath, 'utf-8')
      const todaysReport = JSON.parse(todaysReportData)
      reports.push(todaysReport)
    }
    
    // 获取历史报告
    const historicalReportsPath = path.join(reportsDir, 'historical-reports.json')
    if (fs.existsSync(historicalReportsPath)) {
      const historicalData = fs.readFileSync(historicalReportsPath, 'utf-8')
      const historicalReports = JSON.parse(historicalData)
      reports.push(...historicalReports)
    }
    
    return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error fetching all reports:', error)
    return []
  }
}

export function generateReportSlug(report: Report): string {
  const companySlug = report.company
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  return `${companySlug}-${report.symbol.toLowerCase()}-${report.date}`
}

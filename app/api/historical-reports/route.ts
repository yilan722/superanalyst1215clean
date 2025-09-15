import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface HistoricalReport {
  id: string
  title: string
  company: string
  symbol: string
  date: string
  summary: string
  pdfPath: string
  isPublic: boolean
}

// 获取历史报告列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public') === 'true'
    
    // 从文件系统读取历史报告配置
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    const configPath = path.join(reportsDir, 'historical-reports.json')
    
    let historicalReports: HistoricalReport[] = []
    
    // 检查配置文件是否存在
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8')
      historicalReports = JSON.parse(configData)
    }
    
    // 按日期降序排序（最新的在前）
    historicalReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // 如果是公开访问，返回简化版本
    if (isPublic) {
      const publicReports = historicalReports.map(report => ({
        ...report,
        isPublicVersion: true,
        message: 'Register to view full report with valuation analysis'
      }))
      
      return NextResponse.json({ 
        success: true, 
        data: publicReports 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: historicalReports 
    })
    
  } catch (error) {
    console.error('Error fetching historical reports:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical reports' },
      { status: 500 }
    )
  }
}

// 添加历史报告
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, company, symbol, summary, pdfPath } = body
    
    const newReport: HistoricalReport = {
      id: `${symbol.toLowerCase()}-${new Date().toISOString().split('T')[0]}`,
      title,
      company,
      symbol,
      date: new Date().toISOString().split('T')[0],
      summary,
      pdfPath,
      isPublic: true
    }
    
    // 读取现有历史报告
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    const configPath = path.join(reportsDir, 'historical-reports.json')
    
    let historicalReports: HistoricalReport[] = []
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8')
      historicalReports = JSON.parse(configData)
    }
    
    // 添加新报告到开头
    historicalReports.unshift(newReport)
    
    // 确保目录存在
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    // 保存更新后的历史报告
    fs.writeFileSync(configPath, JSON.stringify(historicalReports, null, 2))
    
    return NextResponse.json({ success: true, data: newReport })
    
  } catch (error) {
    console.error('Error adding historical report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add historical report' },
      { status: 500 }
    )
  }
}

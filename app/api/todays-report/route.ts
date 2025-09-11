import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface TodaysReport {
  id: string
  title: string
  company: string
  symbol: string
  date: string
  summary: string
  pdfPath: string
  isPublic: boolean
}

// 获取今日报告
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public') === 'true'
    
    // 从文件系统读取今日报告配置
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    const configPath = path.join(reportsDir, 'todays-report.json')
    
    let todaysReport: TodaysReport | null = null
    
    // 检查配置文件是否存在
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8')
      const config = JSON.parse(configData)
      todaysReport = config
    } else {
      // 默认报告配置 - 使用真实当前时间
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]
      const reportId = `coreweave-${todayString}`
      
      todaysReport = {
        id: reportId,
        title: 'CoreWeave, Inc. (CRWV) - In-Depth Company Profile',
        company: 'CoreWeave, Inc.',
        symbol: 'CRWV',
        date: todayString,
        summary: 'CoreWeave operates as a specialized cloud infrastructure provider focused exclusively on GPU-accelerated computing for artificial intelligence and high-performance workloads. The company has transformed from a cryptocurrency mining operation into an "AI Hyperscaler," providing infrastructure that supports compute workloads for enterprises, hyperscalers, and AI laboratories.',
        pdfPath: 'CoreWeave, Inc. (CRWV) - In-Depth Company Profile.pdf',
        isPublic: true
      }
    }
    
    if (!todaysReport) {
      return NextResponse.json(
        { success: false, error: 'No report available for today' },
        { status: 404 }
      )
    }
    
    // 如果是公开访问，返回简化版本（隐藏估值部分）
    if (isPublic) {
      return NextResponse.json({
        success: true,
        data: {
          ...todaysReport,
          isPublicVersion: true,
          message: 'Register to view full report with valuation analysis'
        }
      })
    }
    
    return NextResponse.json({ success: true, data: todaysReport })
    
  } catch (error) {
    console.error('Error fetching today\'s report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch today\'s report' },
      { status: 500 }
    )
  }
}

// 更新今日报告
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, company, symbol, summary, pdfPath } = body
    
    const todaysReport: TodaysReport = {
      id: `${symbol.toLowerCase()}-${new Date().toISOString().split('T')[0]}`,
      title,
      company,
      symbol,
      date: new Date().toISOString().split('T')[0],
      summary,
      pdfPath,
      isPublic: true
    }
    
    // 保存到配置文件
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    const configPath = path.join(reportsDir, 'todays-report.json')
    
    // 确保目录存在
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    fs.writeFileSync(configPath, JSON.stringify(todaysReport, null, 2))
    
    return NextResponse.json({ success: true, data: todaysReport })
    
  } catch (error) {
    console.error('Error updating today\'s report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update today\'s report' },
      { status: 500 }
    )
  }
}

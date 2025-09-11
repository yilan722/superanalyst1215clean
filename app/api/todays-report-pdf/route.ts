import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public') === 'true'
    const reportId = searchParams.get('id') || 'coreweave-2025-01-10'
    
    // 获取报告配置
    const reportsDir = path.join(process.cwd(), 'reference-reports')
    const configPath = path.join(reportsDir, 'todays-report.json')
    
    let reportConfig = null
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8')
      reportConfig = JSON.parse(configData)
    }
    
    // 默认配置
    if (!reportConfig) {
      reportConfig = {
        id: 'coreweave-2025-01-10',
        pdfPath: 'CoreWeave, Inc. (CRWV) - In-Depth Company Profile.pdf'
      }
    }
    
    const pdfPath = path.join(reportsDir, reportConfig.pdfPath)
    
    // 检查PDF文件是否存在
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { success: false, error: 'Report PDF not found' },
        { status: 404 }
      )
    }
    
    // 如果是公开访问，返回带水印的版本
    if (isPublic) {
      // 读取PDF文件
      const pdfBuffer = fs.readFileSync(pdfPath)
      
      // 这里可以添加水印逻辑，暂时返回原文件
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${reportConfig.title || 'todays-report'}.pdf"`,
          'X-Public-Access': 'true',
          'X-Registration-Required': 'true'
        }
      })
    }
    
    // 注册用户访问完整版本
    const pdfBuffer = fs.readFileSync(pdfPath)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${reportConfig.title || 'todays-report'}.pdf"`,
        'X-Public-Access': 'false'
      }
    })
    
  } catch (error) {
    console.error('Error serving PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to serve PDF' },
      { status: 500 }
    )
  }
}

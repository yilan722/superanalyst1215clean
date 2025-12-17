import { NextRequest, NextResponse } from 'next/server'
import { getAllReports } from '@/app/services/reports'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 开始获取所有公开报告...')
    
    // 使用服务端的getAllReports函数
    const reports = await getAllReports()
    
    console.log('✅ 成功获取报告，数量:', reports?.length || 0)
    
    return NextResponse.json({
      success: true,
      data: reports || [],
      count: reports?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 获取报告过程中发生错误:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { fetchDCFFinancialData } from '@/lib/tushare-financial-data'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('ticker')?.toUpperCase()

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 获取 ${ticker} 的DCF财务数据...`)

    // 获取完整的DCF财务数据
    const dcfData = await fetchDCFFinancialData(ticker)

    if (!dcfData) {
      return NextResponse.json(
        { error: 'Failed to fetch DCF financial data' },
        { status: 404 }
      )
    }

    console.log(`✅ 成功获取 ${ticker} 的DCF财务数据`)
    return NextResponse.json({
      success: true,
      data: dcfData
    })

  } catch (error) {
    console.error('DCF财务数据获取失败:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


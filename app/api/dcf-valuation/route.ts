import { NextRequest, NextResponse } from 'next/server'
import { fetchDCFFinancialData } from '@/lib/tushare-financial-data'
import { calculateDCFValuation, DEFAULT_DCF_PARAMS, DCFCalculationParams } from '@/lib/dcf-calculation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticker, params } = body

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🚀 开始生成 ${ticker} 的DCF估值...`)

    // 获取财务数据
    const financialData = await fetchDCFFinancialData(ticker)
    if (!financialData) {
      return NextResponse.json(
        { error: 'Failed to fetch financial data' },
        { status: 404 }
      )
    }

    // 使用提供的参数或默认参数
    const dcfParams: DCFCalculationParams = params || DEFAULT_DCF_PARAMS

    // 计算DCF估值
    const dcfValuation = calculateDCFValuation(financialData, dcfParams)

    console.log(`✅ 成功生成 ${ticker} 的DCF估值`)
    return NextResponse.json({
      success: true,
      data: dcfValuation
    })

  } catch (error) {
    console.error('DCF估值生成失败:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

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

    console.log(`🔍 获取 ${ticker} 的DCF估值...`)

    // 获取财务数据
    const financialData = await fetchDCFFinancialData(ticker)
    if (!financialData) {
      return NextResponse.json(
        { error: 'Failed to fetch financial data' },
        { status: 404 }
      )
    }

    // 使用默认参数计算DCF估值
    const dcfValuation = calculateDCFValuation(financialData, DEFAULT_DCF_PARAMS)

    console.log(`✅ 成功获取 ${ticker} 的DCF估值`)
    return NextResponse.json({
      success: true,
      data: dcfValuation
    })

  } catch (error) {
    console.error('DCF估值获取失败:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


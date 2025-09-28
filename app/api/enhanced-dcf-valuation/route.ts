import { NextRequest, NextResponse } from 'next/server'
import { fetchEnhancedDCFFinancialData } from '@/app/services/tushare-enhanced-data'
import { calculateEnhancedDCF, EnhancedDCFParams } from '@/app/services/enhanced-dcf-calculation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      ticker, 
      dcfStartValue,
      growthRate,
      discountRate,
      terminalRate,
      marginOfSafety,
      projectionYears = 5
    } = body

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 获取 ${ticker} 的增强DCF财务数据...`)
    
    // 获取财务数据
    const financialData = await fetchEnhancedDCFFinancialData(ticker)
    if (!financialData) {
      return NextResponse.json(
        { error: 'Failed to fetch financial data' },
        { status: 404 }
      )
    }

    // 构建DCF参数
    const dcfParams: EnhancedDCFParams = {
      dcfStartValue: dcfStartValue || 0,
      growthRate: growthRate || 0.10,
      discountRate: discountRate || 0.10,
      terminalRate: terminalRate || 0.03,
      marginOfSafety: marginOfSafety || 0.25,
      projectionYears: projectionYears || 5,
      debt: financialData.totalLiabilities || 0,
      cash: financialData.cashAndEquivalents || 0,
      minorityInterests: 0,
      sharesOutstanding: financialData.sharesOutstanding || 1
    }

    console.log(`📊 DCF参数:`, dcfParams)

    // 执行DCF计算
    const dcfResult = calculateEnhancedDCF(financialData, dcfParams)

    console.log(`✅ 成功计算 ${ticker} 的增强DCF估值`)
    
    return NextResponse.json({
      success: true,
      data: dcfResult
    })

  } catch (error) {
    console.error('增强DCF估值计算失败:', error)
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

    console.log(`🔍 获取 ${ticker} 的默认增强DCF估值...`)
    
    // 获取财务数据
    const financialData = await fetchEnhancedDCFFinancialData(ticker)
    if (!financialData) {
      return NextResponse.json(
        { error: 'Failed to fetch financial data' },
        { status: 404 }
      )
    }

    // 使用默认参数执行DCF计算
    const dcfResult = calculateEnhancedDCF(financialData)

    console.log(`✅ 成功计算 ${ticker} 的默认增强DCF估值`)
    
    return NextResponse.json({
      success: true,
      data: dcfResult
    })

  } catch (error) {
    console.error('默认增强DCF估值计算失败:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


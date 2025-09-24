import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('测试调用 StockTwits API...')
    
    const response = await fetch('http://localhost:3000/api/stocktwits-most-active')
    const data = await response.json()
    
    console.log('StockTwits API 响应:', {
      success: data.success,
      dataLength: data.data?.length,
      firstSymbol: data.data?.[0]?.symbol,
      symbols: data.data?.map((s: any) => s.symbol).slice(0, 5)
    })
    
    return NextResponse.json({
      success: true,
      stockTwitsData: data,
      message: '测试完成'
    })
    
  } catch (error) {
    console.error('测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

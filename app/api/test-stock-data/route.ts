import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'NVDA'
    
    console.log(`🔍 Testing real-time data for ${symbol}...`)
    
    // 使用Yahoo Finance API获取真实数据
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 Raw API response:', JSON.stringify(data, null, 2))
    
    const result = data.chart.result[0]
    
    if (!result || !result.meta) {
      return NextResponse.json({
        success: false,
        error: 'No data found in API response',
        rawData: data
      })
    }

    const meta = result.meta
    const currentPrice = meta.regularMarketPrice || meta.previousClose
    const previousClose = meta.chartPreviousClose || meta.previousClose
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100
    const volume = meta.regularMarketVolume || 0
    const marketCap = meta.marketCap || 0
    const peRatio = meta.trailingPE || 0

    // 获取公司名称
    const nameResponse = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&quotesCount=1&newsCount=0`
    )
    
    let companyName = symbol
    if (nameResponse.ok) {
      const nameData = await nameResponse.json()
      if (nameData.quotes && nameData.quotes[0]) {
        companyName = nameData.quotes[0].longName || nameData.quotes[0].shortName || symbol
      }
    }

    const stockData = {
      symbol,
      name: companyName,
      price: currentPrice,
      change,
      changePercent,
      volume,
      marketCap,
      peRatio,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Yahoo Finance API'
    }

    console.log('✅ Processed stock data:', stockData)

    return NextResponse.json({
      success: true,
      data: stockData,
      rawMeta: meta
    })

  } catch (error) {
    console.error('❌ Error testing stock data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

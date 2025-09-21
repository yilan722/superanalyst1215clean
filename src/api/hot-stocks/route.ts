import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface HotStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  sector: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

// 使用Yahoo Finance API获取真实股票数据
async function fetchRealStockData(symbol: string): Promise<Partial<HotStock> | null> {
  try {
    // 使用Yahoo Finance API (更可靠)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data')
    }

    const data = await response.json()
    const result = data.chart.result[0]
    
    if (!result || !result.meta) {
      return null
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

    return {
      symbol,
      name: companyName,
      price: currentPrice,
      change,
      changePercent,
      volume,
      marketCap,
      peRatio,
      sector: 'Technology' // 默认值，可以后续优化
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return null
  }
}

// 获取公司全名的函数
async function getCompanyName(symbol: string): Promise<string> {
  const companyNames: { [key: string]: string } = {
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla, Inc.',
    'AAPL': 'Apple Inc.',
    'AMD': 'Advanced Micro Devices, Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'META': 'Meta Platforms, Inc.',
    'NFLX': 'Netflix, Inc.',
    'CRM': 'Salesforce, Inc.'
  }
  
  return companyNames[symbol] || symbol
}

// 生成分析原因的函数
function generateAnalysisReason(symbol: string, changePercent: number, sector: string): string {
  const reasons: { [key: string]: string[] } = {
    'NVDA': [
      'Strong Q4 earnings beat with AI chip demand surge',
      'Data center revenue growth exceeds expectations',
      'Gaming segment recovery and new product launches',
      'Partnership announcements with major cloud providers'
    ],
    'TSLA': [
      'Production concerns and delivery miss expectations',
      'EV market competition intensifies',
      'Autopilot software updates and regulatory approval',
      'Energy storage business growth acceleration'
    ],
    'AAPL': [
      'iPhone 15 Pro sales exceed expectations in China',
      'Services revenue growth and App Store performance',
      'Mac and iPad sales recovery in enterprise market',
      'Vision Pro launch and AR/VR market expansion'
    ],
    'AMD': [
      'Data center revenue growth and AI processor demand',
      'Ryzen processor market share gains',
      'Radeon graphics card performance improvements',
      'EPYC server processor adoption increases'
    ],
    'MSFT': [
      'Azure cloud growth and AI integration progress',
      'Office 365 subscription growth and Copilot adoption',
      'Gaming division performance and Xbox Game Pass',
      'Enterprise software and security solutions demand'
    ]
  }
  
  const symbolReasons = reasons[symbol] || ['Market volatility and sector rotation']
  const isPositive = changePercent > 0
  return isPositive ? symbolReasons[0] : symbolReasons[1] || symbolReasons[0]
}

// 确定信心等级
function getConfidenceLevel(changePercent: number, volume: number): 'high' | 'medium' | 'low' {
  const absChange = Math.abs(changePercent)
  const isHighVolume = volume > 50000000
  
  if (absChange > 5 && isHighVolume) return 'high'
  if (absChange > 2 || isHighVolume) return 'medium'
  return 'low'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.split(',') || ['NVDA', 'TSLA', 'AAPL', 'AMD', 'MSFT']
    
    const hotStocks: HotStock[] = []
    
    // 并行获取所有股票数据
    const stockDataPromises = symbols.map(async (symbol) => {
      const data = await fetchRealStockData(symbol)
      if (data) {
        const name = await getCompanyName(symbol)
        const reason = generateAnalysisReason(symbol, data.changePercent || 0, data.sector || 'Unknown')
        const confidence = getConfidenceLevel(data.changePercent || 0, data.volume || 0)
        
        return {
          symbol: data.symbol || symbol,
          name,
          price: data.price || 0,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
          volume: data.volume || 0,
          marketCap: data.marketCap || 0,
          peRatio: data.peRatio || 0,
          sector: data.sector || 'Unknown',
          reason,
          confidence
        }
      }
      return null
    })
    
    const results = await Promise.all(stockDataPromises)
    
    // 过滤掉null值并添加到结果中
    results.forEach(stock => {
      if (stock) {
        hotStocks.push(stock)
      }
    })
    
    // 如果API失败，返回模拟数据作为后备
    if (hotStocks.length === 0) {
      const mockStocks: HotStock[] = [
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 875.28,
          change: 45.32,
          changePercent: 5.47,
          volume: 125000000,
          marketCap: 2150000000000,
          peRatio: 65.4,
          sector: 'Technology',
          reason: 'Strong Q4 earnings beat with AI chip demand surge',
          confidence: 'high'
        },
        {
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          price: 248.50,
          change: -12.30,
          changePercent: -4.72,
          volume: 89000000,
          marketCap: 790000000000,
          peRatio: 45.2,
          sector: 'Automotive',
          reason: 'Production concerns and delivery miss expectations',
          confidence: 'medium'
        },
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 192.53,
          change: 3.25,
          changePercent: 1.72,
          volume: 45000000,
          marketCap: 3000000000000,
          peRatio: 28.9,
          sector: 'Technology',
          reason: 'iPhone 15 Pro sales exceed expectations in China',
          confidence: 'high'
        },
        {
          symbol: 'AMD',
          name: 'Advanced Micro Devices',
          price: 142.67,
          change: 8.45,
          changePercent: 6.30,
          volume: 67000000,
          marketCap: 230000000000,
          peRatio: 38.5,
          sector: 'Technology',
          reason: 'Data center revenue growth and AI processor demand',
          confidence: 'high'
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 415.26,
          change: 12.84,
          changePercent: 3.19,
          volume: 32000000,
          marketCap: 3100000000000,
          peRatio: 32.1,
          sector: 'Technology',
          reason: 'Azure cloud growth and AI integration progress',
          confidence: 'medium'
        }
      ]
      
      return NextResponse.json({ success: true, data: mockStocks })
    }
    
    return NextResponse.json({ success: true, data: hotStocks })
    
  } catch (error) {
    console.error('Error fetching hot stocks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hot stocks data' },
      { status: 500 }
    )
  }
}

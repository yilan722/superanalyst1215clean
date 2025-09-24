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
  rank?: number
  high52Week?: number
  low52Week?: number
  isIndex?: boolean
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
    const currentPrice = meta.regularMarketPrice || 0
    const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice
    const change = currentPrice - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
    const volume = meta.regularMarketVolume || 0
    const marketCap = meta.marketCap || 0
    const peRatio = meta.trailingPE || 0
    const high52Week = meta.fiftyTwoWeekHigh || 0
    const low52Week = meta.fiftyTwoWeekLow || 0
    
    console.log(`获取 ${symbol} 数据: 当前价格=${currentPrice}, 前收盘价=${previousClose}, 涨跌幅=${changePercent.toFixed(2)}%, 52周高=${high52Week}, 52周低=${low52Week}`)

    // 获取公司名称和更多数据
    const nameResponse = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&quotesCount=1&newsCount=0`
    )
    
    let companyName = symbol
    let sector = 'Technology'
    if (nameResponse.ok) {
      const nameData = await nameResponse.json()
      if (nameData.quotes && nameData.quotes[0]) {
        companyName = nameData.quotes[0].longName || nameData.quotes[0].shortName || symbol
        sector = nameData.quotes[0].sector || 'Technology'
      }
    }

    // 对于 ETF，使用不同的市值计算方式
    let finalMarketCap = marketCap
    if (marketCap === 0 && (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('DIA'))) {
      // ETF 的市值通常用 AUM (Assets Under Management) 表示
      finalMarketCap = currentPrice * volume * 1000 // 粗略估算
    }

    return {
      symbol,
      name: companyName,
      price: currentPrice,
      change,
      changePercent,
      volume,
      marketCap: finalMarketCap,
      peRatio,
      sector,
      high52Week,
      low52Week
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
    const useStockTwits = searchParams.get('useStockTwits') !== 'false' // 默认使用 StockTwits
    const symbols = searchParams.get('symbols')?.split(',')
    
    // 如果指定了使用 StockTwits 或者没有指定 symbols
    if (useStockTwits && !symbols) {
      try {
        console.log('使用 StockTwits 数据...')

        // 调用 StockTwits API 获取完整数据
        const stockTwitsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/stocktwits-most-active`)
        const stockTwitsData = await stockTwitsResponse.json()

        if (stockTwitsData.success && stockTwitsData.data) {
          const hotStocks: HotStock[] = []

          // 处理 StockTwits 返回的数据，如果价格数据不完整则使用 yfinance
          for (const stockData of stockTwitsData.data) {
            if (stockData.symbol) {
              // 检查是否有完整的价格数据
              const priceData = stockData.priceData || {}
              const fundamentals = stockData.fundamentals || {}
              
              let finalData = {
                symbol: stockData.symbol,
                name: stockData.title || stockData.name || stockData.symbol,
                price: priceData.Last || 0,
                change: priceData.Change || 0,
                changePercent: priceData.PercentChange || 0,
                volume: priceData.Volume || 0,
                marketCap: fundamentals.marketCapitalization ? parseFloat(fundamentals.marketCapitalization) * 1000000000 : 0,
                peRatio: fundamentals.pERatio || 0,
                sector: fundamentals.sectorName || 'Unknown',
                rank: stockData.rank || 0,
                high52Week: fundamentals.highPriceLast52Weeks || 0,
                low52Week: fundamentals.lowPriceLast52Weeks || 0,
                isIndex: ['SPY', 'QQQ', 'DIA', 'IWM', 'ARKK'].includes(stockData.symbol)
              }
              
              // 如果价格数据不完整，使用 yfinance 补充
              if (finalData.price === 0 || finalData.volume === 0) {
                console.log(`StockTwits 数据不完整，使用 yfinance 补充 ${stockData.symbol}`)
                const yfinanceData = await fetchRealStockData(stockData.symbol)
                if (yfinanceData) {
                  finalData.price = yfinanceData.price || finalData.price
                  finalData.change = yfinanceData.change || finalData.change
                  finalData.changePercent = yfinanceData.changePercent || finalData.changePercent
                  finalData.volume = yfinanceData.volume || finalData.volume
                  finalData.marketCap = yfinanceData.marketCap || finalData.marketCap
                  finalData.peRatio = yfinanceData.peRatio || finalData.peRatio
                  finalData.sector = yfinanceData.sector || finalData.sector
                }
              }
              
              // 总是使用 yfinance 获取 52-week 数据
              if (finalData.high52Week === 0 || finalData.low52Week === 0) {
                console.log(`获取 ${stockData.symbol} 的 52-week 数据`)
                const yfinanceData = await fetchRealStockData(stockData.symbol)
                if (yfinanceData) {
                  finalData.high52Week = yfinanceData.high52Week || finalData.high52Week
                  finalData.low52Week = yfinanceData.low52Week || finalData.low52Week
                  // 如果还没有 market cap，也获取
                  if (finalData.marketCap === 0) {
                    finalData.marketCap = yfinanceData.marketCap || finalData.marketCap
                  }
                }
              }
              
              const reason = generateAnalysisReason(finalData.symbol, finalData.changePercent, finalData.sector)
              const confidence = getConfidenceLevel(finalData.changePercent, finalData.volume)

              hotStocks.push({
                ...finalData,
                reason,
                confidence
              })
            }
          }

          console.log(`成功获取 ${hotStocks.length} 只 StockTwits 股票数据`)
          return NextResponse.json({
            success: true,
            data: hotStocks,
            source: 'stocktwits'
          })
        } else {
          // 回退到硬编码列表，使用 StockTwits 的真实数据
          const stockTwitsData = [
            { symbol: 'SPY', name: 'SPDR S&P 500 ETF', rank: 1, isIndex: true },
            { symbol: 'OPEN', name: 'Opendoor Technologies Inc', rank: 2, isIndex: false },
            { symbol: 'HOLO', name: 'MicroCloud Hologram Inc', rank: 3, isIndex: false },
            { symbol: 'BBAI', name: 'BigBear.ai Holdings Inc', rank: 4, isIndex: false },
            { symbol: 'QQQ', name: 'Invesco QQQ Trust', rank: 5, isIndex: true },
            { symbol: 'NVDA', name: 'NVIDIA Corp', rank: 6, isIndex: false },
            { symbol: 'TSLA', name: 'Tesla Inc', rank: 7, isIndex: false },
            { symbol: 'DJT', name: 'Trump Media & Technology Group', rank: 8, isIndex: false },
            { symbol: 'ASST', name: 'Asset Entities Inc', rank: 9, isIndex: false },
            { symbol: 'MU', name: 'Micron Technology Inc', rank: 10, isIndex: false }
          ]
          
          const hotStocks: HotStock[] = []

          // 并行获取所有股票数据
          const stockDataPromises = stockTwitsData.map(async (stockInfo) => {
            const data = await fetchRealStockData(stockInfo.symbol)
            if (data) {
              const name = stockInfo.name
              const reason = generateAnalysisReason(stockInfo.symbol, data.changePercent || 0, data.sector || 'Unknown')
              const confidence = getConfidenceLevel(data.changePercent || 0, data.volume || 0)

              return {
                symbol: data.symbol || stockInfo.symbol,
                name,
                price: data.price || 0,
                change: data.change || 0,
                changePercent: data.changePercent || 0,
                volume: data.volume || 0,
                marketCap: data.marketCap || 0,
                peRatio: data.peRatio || 0,
                sector: data.sector || 'Unknown',
                reason,
                confidence,
                rank: stockInfo.rank,
                high52Week: 0, // 这些数据需要从 yfinance 获取
                low52Week: 0,
                isIndex: stockInfo.isIndex
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

          console.log(`成功获取 ${hotStocks.length} 只 StockTwits 股票数据（回退模式）`)
          return NextResponse.json({
            success: true,
            data: hotStocks,
            source: 'stocktwits-fallback'
          })
        }

      } catch (error) {
        console.error('StockTwits 数据处理失败:', error)
      }
    }
    
    // 回退到原始逻辑
    const finalSymbols = symbols || ['NVDA', 'TSLA', 'AAPL', 'AMD', 'MSFT']
    const hotStocks: HotStock[] = []
    
    // 并行获取所有股票数据
    const stockDataPromises = finalSymbols.map(async (symbol) => {
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
      
      return NextResponse.json({ success: true, data: mockStocks, source: 'mock' })
    }
    
    return NextResponse.json({ success: true, data: hotStocks, source: 'yahoo' })
    
  } catch (error) {
    console.error('Error fetching hot stocks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hot stocks data' },
      { status: 500 }
    )
  }
}

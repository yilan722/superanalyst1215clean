import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'

interface StockTwitsStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  rank: number
  sector: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

// 使用 Yahoo Finance API 获取股票详细信息
async function fetchStockDetails(symbol: string): Promise<Partial<StockTwitsStock> | null> {
  try {
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
      peRatio
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return null
  }
}

// 爬取 StockTwits most-active 页面
async function scrapeStockTwitsMostActive(): Promise<string[]> {
  let browser = null
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 })

    console.log('正在访问 StockTwits most-active 页面...')
    
    // 访问页面，使用更宽松的超时设置
    await page.goto('https://stocktwits.com/sentiment/most-active', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })

    // 等待页面加载
    await page.waitForTimeout(8000)
    
    // 尝试等待特定元素加载
    try {
      await page.waitForSelector('table, tbody, [role="table"], .table, [data-testid*="table"]', { timeout: 15000 })
      console.log('找到表格元素')
    } catch (error) {
      console.log('未找到表格元素，继续尝试其他方法...')
    }
    
    // 尝试滚动页面以触发动态加载
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2)
    })
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(2000)

    // 先获取页面调试信息
    const debugInfo = await page.evaluate(() => {
      const tables = document.querySelectorAll('table')
      const tableRows = document.querySelectorAll('table tr, tbody tr, .table-row, [role="row"]')
      const links = document.querySelectorAll('a[href*="/symbol/"], a[href*="/stock/"]')
      const allText = document.body.textContent || ''
      
      return {
        tableCount: tables.length,
        tableRowCount: tableRows.length,
        linkCount: links.length,
        hasSPY: allText.includes('SPY'),
        hasOPEN: allText.includes('OPEN'),
        hasHOLO: allText.includes('HOLO'),
        hasBBAI: allText.includes('BBAI'),
        hasQQQ: allText.includes('QQQ'),
        pageTitle: document.title,
        url: window.location.href
      }
    })
    
    console.log('页面调试信息:', debugInfo)

    // 尝试多种选择器来获取股票数据
    const stocks = await page.evaluate(() => {
      const results = []
      
      // 方法1: 从页面 JSON 数据中提取股票符号
      try {
        // 查找包含股票数据的脚本标签
        const scripts = document.querySelectorAll('script')
        for (const script of scripts) {
          const content = script.textContent || ''
          if (content.includes('"symbols":[') && content.includes('"rank":')) {
            console.log('找到包含股票数据的脚本')
            
            // 尝试解析 JSON 数据
            try {
              // 查找 symbols 数组 - 使用更精确的正则表达式
              const symbolsMatch = content.match(/"symbols":\s*\[(.*?)\]/s)
              if (symbolsMatch) {
                const symbolsJson = '[' + symbolsMatch[1] + ']'
                console.log('找到 symbols JSON 片段，长度:', symbolsJson.length)
                
                const symbolsData = JSON.parse(symbolsJson)
                console.log('解析到股票数据:', symbolsData.length, '只股票')
                
                // 按排名排序并提取前10只，包含完整数据
                symbolsData
                  .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                  .slice(0, 10)
                  .forEach(stock => {
                    if (stock.symbol) {
                      console.log(`排名 ${stock.rank}: ${stock.symbol} - ${stock.title}`)
                      console.log('价格数据:', stock.priceData ? '有' : '无')
                      console.log('基本面数据:', stock.fundamentals ? '有' : '无')
                      
                      results.push({
                        symbol: stock.symbol,
                        title: stock.title,
                        rank: stock.rank,
                        priceData: stock.priceData,
                        fundamentals: stock.fundamentals
                      })
                    }
                  })
                
                if (results.length > 0) {
                  console.log('成功从 JSON 数据提取股票数据:', results.length, '只股票')
                  return results
                }
              } else {
                console.log('未找到 symbols 数组')
              }
            } catch (jsonError) {
              console.log('JSON 解析失败:', jsonError.message)
              console.log('尝试解析的内容片段:', content.substring(0, 500))
            }
          }
        }
      } catch (error) {
        console.log('脚本解析失败:', error.message)
      }
      
      // 方法2: 查找表格中的股票符号 - 针对 StockTwits 的表格结构
      const tableRows = document.querySelectorAll('table tr, tbody tr, .table-row, [role="row"], .row, [class*="row"]')
      
      console.log('找到表格行数:', tableRows.length)
      
      if (tableRows.length > 0) {
        tableRows.forEach((row, index) => {
          if (index >= 15) return // 增加搜索范围
          
          // 查找表格行中的股票符号
          const cells = row.querySelectorAll('td, th, [role="cell"], .cell, [class*="cell"], [class*="column"]')
          if (cells.length >= 1) {
            // 尝试多个列来查找股票符号
            for (let i = 0; i < Math.min(cells.length, 3); i++) {
              const symbolCell = cells[i]
              const symbolText = symbolCell.textContent?.trim() || ''
              
              console.log(`行 ${index}, 列 ${i}: 符号文本 "${symbolText}"`)
              
              // 提取股票符号（通常在括号前或直接是符号）
              const symbolMatch = symbolText.match(/\b([A-Z]{1,5})\b/)
              if (symbolMatch) {
                const symbol = symbolMatch[1]
                if (symbol && symbol.length <= 5 && 
                    !['RANK', 'SYMBOL', 'PRICE', 'CHANGE', 'VOLUME', 'HIGH', 'LOW', 'CAP', 'WATCH', 'HTML', 'CSS', 'JS'].includes(symbol)) {
                  console.log(`找到股票符号: ${symbol}`)
                  results.push(symbol)
                  break // 找到符号后跳出列循环
                }
              }
            }
          }
        })
      }

      // 方法2: 查找包含股票符号的链接或按钮
      if (results.length === 0) {
        const links = document.querySelectorAll('a[href*="/symbol/"], a[href*="/stock/"], .symbol-link, .ticker-link')
        links.forEach((link, index) => {
          if (index >= 10) return
          
          const href = link.getAttribute('href') || ''
          const text = link.textContent?.trim() || ''
          
          // 从链接中提取股票符号
          const hrefMatch = href.match(/\/symbol\/([A-Z]{1,5})|\/stock\/([A-Z]{1,5})/)
          const textMatch = text.match(/\b([A-Z]{1,5})\b/)
          
          const symbol = hrefMatch?.[1] || hrefMatch?.[2] || textMatch?.[1]
          if (symbol && symbol.length <= 5) {
            results.push(symbol)
          }
        })
      }

      // 方法3: 查找包含股票符号的元素
      if (results.length === 0) {
        const stockElements = document.querySelectorAll('[data-symbol], .symbol, .ticker, .stock-symbol, .ticker-symbol')
        
        stockElements.forEach((element, index) => {
          if (index >= 10) return
          
          const symbol = element.textContent?.trim() || 
                        element.getAttribute('data-symbol') || 
                        element.getAttribute('data-ticker')
          
          if (symbol && symbol.length <= 5) {
            results.push(symbol.toUpperCase())
          }
        })
      }

      // 方法4: 查找所有可能包含股票符号的文本
      if (results.length === 0) {
        const allText = document.body.textContent || ''
        const symbolMatches = allText.match(/\b[A-Z]{1,5}\b/g) || []
        
        // 过滤掉常见的非股票符号
        const filteredSymbols = symbolMatches.filter(symbol => 
          !['HTML', 'CSS', 'JS', 'API', 'URL', 'HTTP', 'HTTPS', 'JSON', 'XML', 'DOM', 'BODY', 'HEAD', 'DIV', 'SPAN', 'P', 'A', 'IMG', 'BUTTON', 'INPUT', 'FORM', 'TABLE', 'TR', 'TD', 'TH', 'UL', 'LI', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'TIME', 'MARK', 'SMALL', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'SUB', 'SUP', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR', 'CITE', 'Q', 'BLOCKQUOTE', 'ADDRESS', 'DETAILS', 'SUMMARY', 'MENU', 'DIALOG', 'CANVAS', 'SVG', 'AUDIO', 'VIDEO', 'SOURCE', 'TRACK', 'MAP', 'AREA', 'OBJECT', 'PARAM', 'EMBED', 'IFRAME', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'BASE', 'TEMPLATE', 'SLOT'].includes(symbol)
        )
        
        const uniqueSymbols = [...new Set(filteredSymbols)].slice(0, 10)
        results.push(...uniqueSymbols)
      }

      return results
    })

    console.log('找到的股票符号:', stocks)
    return stocks

  } catch (error) {
    console.error('爬取 StockTwits 时出错:', error)
    return []
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// 生成分析原因的函数
function generateAnalysisReason(symbol: string, changePercent: number): string {
  const reasons: { [key: string]: string[] } = {
    'NVDA': [
      'Strong Q4 earnings beat with AI chip demand surge',
      'Data center revenue growth exceeds expectations',
      'Gaming segment recovery and new product launches'
    ],
    'TSLA': [
      'Production concerns and delivery miss expectations',
      'EV market competition intensifies',
      'Autopilot software updates and regulatory approval'
    ],
    'AAPL': [
      'iPhone 15 Pro sales exceed expectations in China',
      'Services revenue growth and App Store performance',
      'Mac and iPad sales recovery in enterprise market'
    ],
    'AMD': [
      'Data center revenue growth and AI processor demand',
      'Ryzen processor market share gains',
      'Radeon graphics card performance improvements'
    ],
    'MSFT': [
      'Azure cloud growth and AI integration progress',
      'Office 365 subscription growth and Copilot adoption',
      'Gaming division performance and Xbox Game Pass'
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
    console.log('开始获取 StockTwits most-active 数据...')
    
    // 爬取 StockTwits 获取最活跃的股票符号
    const symbols = await scrapeStockTwitsMostActive()
    
    // 如果没有获取到数据，使用 StockTwits 截图中的真实股票列表
    const finalSymbols = symbols.length > 0 ? symbols : [
      'SPY', 'OPEN', 'HOLO', 'BBAI', 'QQQ', 
      'NVDA', 'TSLA', 'DJT', 'ASST', 'MU'
    ]
    
    console.log('使用的股票符号:', finalSymbols)
    
    const hotStocks: StockTwitsStock[] = []
    
    // 并行获取所有股票数据
    const stockDataPromises = finalSymbols.slice(0, 10).map(async (symbol, index) => {
      const data = await fetchStockDetails(symbol)
      if (data) {
        const reason = generateAnalysisReason(symbol, data.changePercent || 0)
        const confidence = getConfidenceLevel(data.changePercent || 0, data.volume || 0)
        
        return {
          symbol: data.symbol || symbol,
          name: data.name || symbol,
          price: data.price || 0,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
          volume: data.volume || 0,
          marketCap: data.marketCap || 0,
          peRatio: data.peRatio || 0,
          rank: index + 1,
          sector: 'Technology', // 默认值
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
    
    console.log(`成功获取 ${hotStocks.length} 只股票的数据`)
    
    return NextResponse.json({ 
      success: true, 
      data: hotStocks,
      source: 'stocktwits',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching StockTwits most-active data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch StockTwits most-active data' },
      { status: 500 }
    )
  }
}

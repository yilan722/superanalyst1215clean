import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  let browser = null
  
  try {
    console.log('开始测试 StockTwits 页面访问...')
    
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
    
    // 访问页面
    await page.goto('https://stocktwits.com/sentiment/most-active', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })

    console.log('页面加载完成，等待内容...')
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // 获取页面基本信息
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.textContent?.substring(0, 500) || '',
        hasTable: document.querySelectorAll('table').length > 0,
        hasTbody: document.querySelectorAll('tbody').length > 0,
        hasRows: document.querySelectorAll('tr').length > 0,
        hasCells: document.querySelectorAll('td').length > 0,
        allText: document.body.textContent || ''
      }
    })
    
    console.log('页面信息:', pageInfo)
    
    // 查找股票符号
    const symbols = await page.evaluate(() => {
      const results = []
      const allText = document.body.textContent || ''
      
      // 查找常见的股票符号模式
      const symbolMatches = allText.match(/\b([A-Z]{1,5})\b/g) || []
      
      // 过滤掉常见的非股票符号
      const filteredSymbols = symbolMatches.filter(symbol => 
        !['HTML', 'CSS', 'JS', 'API', 'URL', 'HTTP', 'HTTPS', 'JSON', 'XML', 'DOM', 'BODY', 'HEAD', 'DIV', 'SPAN', 'P', 'A', 'IMG', 'BUTTON', 'INPUT', 'FORM', 'TABLE', 'TR', 'TD', 'TH', 'UL', 'LI', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'TIME', 'MARK', 'SMALL', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'SUB', 'SUP', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR', 'CITE', 'Q', 'BLOCKQUOTE', 'ADDRESS', 'DETAILS', 'SUMMARY', 'MENU', 'DIALOG', 'CANVAS', 'SVG', 'AUDIO', 'VIDEO', 'SOURCE', 'TRACK', 'MAP', 'AREA', 'OBJECT', 'PARAM', 'EMBED', 'IFRAME', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'BASE', 'TEMPLATE', 'SLOT', 'RANK', 'SYMBOL', 'PRICE', 'CHANGE', 'VOLUME', 'HIGH', 'LOW', 'CAP', 'WATCH'].includes(symbol)
      )
      
      // 去重并限制数量
      const uniqueSymbols = [...new Set(filteredSymbols)].slice(0, 20)
      
      return uniqueSymbols
    })
    
    console.log('找到的股票符号:', symbols)
    
    return NextResponse.json({
      success: true,
      pageInfo,
      symbols,
      message: 'StockTwits 页面访问测试完成'
    })
    
  } catch (error) {
    console.error('StockTwits 访问测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'StockTwits 页面访问失败'
    })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

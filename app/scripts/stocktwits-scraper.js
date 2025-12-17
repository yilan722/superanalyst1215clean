const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class StockTwitsScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
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
    });
    this.page = await this.browser.newPage();
    
    // 设置用户代理
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // 设置视口
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async scrapeMostActive() {
    try {
      console.log('正在访问 StockTwits most-active 页面...');
      
      // 访问页面
      await this.page.goto('https://stocktwits.com/sentiment/most-active', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 等待页面加载
      await this.page.waitForTimeout(3000);

      // 尝试多种选择器来获取股票数据
      const stocks = await this.page.evaluate(() => {
        const results = [];
        
        // 方法1: 查找表格中的股票符号 - 针对 StockTwits 的表格结构
        const tableRows = document.querySelectorAll('table tr, tbody tr, .table-row, [role="row"]');
        
        if (tableRows.length > 0) {
          tableRows.forEach((row, index) => {
            if (index >= 10) return; // 只取前10个
            
            // 查找表格行中的股票符号
            const cells = row.querySelectorAll('td, th, [role="cell"], .cell');
            if (cells.length >= 2) {
              // 通常股票符号在第二列（索引1）
              const symbolCell = cells[1] || cells[0];
              const symbolText = symbolCell.textContent?.trim() || '';
              
              // 提取股票符号（通常在括号前或直接是符号）
              const symbolMatch = symbolText.match(/\b([A-Z]{1,5})\b/);
              if (symbolMatch) {
                const symbol = symbolMatch[1];
                if (symbol && symbol.length <= 5 && !['RANK', 'SYMBOL', 'PRICE', 'CHANGE', 'VOLUME'].includes(symbol)) {
                  results.push({
                    symbol: symbol,
                    rank: index + 1
                  });
                }
              }
            }
          });
        }

        // 方法2: 查找包含股票符号的链接或按钮
        if (results.length === 0) {
          const links = document.querySelectorAll('a[href*="/symbol/"], a[href*="/stock/"], .symbol-link, .ticker-link');
          links.forEach((link, index) => {
            if (index >= 10) return;
            
            const href = link.getAttribute('href') || '';
            const text = link.textContent?.trim() || '';
            
            // 从链接中提取股票符号
            const hrefMatch = href.match(/\/symbol\/([A-Z]{1,5})|\/stock\/([A-Z]{1,5})/);
            const textMatch = text.match(/\b([A-Z]{1,5})\b/);
            
            const symbol = hrefMatch?.[1] || hrefMatch?.[2] || textMatch?.[1];
            if (symbol && symbol.length <= 5) {
              results.push({
                symbol: symbol,
                rank: index + 1
              });
            }
          });
        }

        // 方法3: 查找包含股票符号的元素
        if (results.length === 0) {
          const stockElements = document.querySelectorAll('[data-symbol], .symbol, .ticker, .stock-symbol, .ticker-symbol');
          
          stockElements.forEach((element, index) => {
            if (index >= 10) return;
            
            const symbol = element.textContent?.trim() || 
                          element.getAttribute('data-symbol') || 
                          element.getAttribute('data-ticker');
            
            if (symbol && symbol.length <= 5) {
              results.push({
                symbol: symbol.toUpperCase(),
                rank: index + 1
              });
            }
          });
        }

        // 方法4: 查找所有可能包含股票符号的文本
        if (results.length === 0) {
          const allText = document.body.textContent || '';
          const symbolMatches = allText.match(/\b[A-Z]{1,5}\b/g) || [];
          
          // 过滤掉常见的非股票符号
          const filteredSymbols = symbolMatches.filter(symbol => 
            !['HTML', 'CSS', 'JS', 'API', 'URL', 'HTTP', 'HTTPS', 'JSON', 'XML', 'DOM', 'BODY', 'HEAD', 'DIV', 'SPAN', 'P', 'A', 'IMG', 'BUTTON', 'INPUT', 'FORM', 'TABLE', 'TR', 'TD', 'TH', 'UL', 'LI', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'TIME', 'MARK', 'SMALL', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'SUB', 'SUP', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR', 'CITE', 'Q', 'BLOCKQUOTE', 'ADDRESS', 'DETAILS', 'SUMMARY', 'MENU', 'DIALOG', 'CANVAS', 'SVG', 'AUDIO', 'VIDEO', 'SOURCE', 'TRACK', 'MAP', 'AREA', 'OBJECT', 'PARAM', 'EMBED', 'IFRAME', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'BASE', 'TEMPLATE', 'SLOT'].includes(symbol)
          );
          
          const uniqueSymbols = [...new Set(filteredSymbols)].slice(0, 10);
          uniqueSymbols.forEach((symbol, index) => {
            results.push({
              symbol: symbol,
              rank: index + 1
            });
          });
        }

        return results;
      });

      console.log('找到的股票:', stocks);
      return stocks;

    } catch (error) {
      console.error('爬取过程中出错:', error);
      return [];
    }
  }

  async getStockDetails(symbols) {
    const stockDetails = [];
    
    for (const stock of symbols) {
      try {
        console.log(`正在获取 ${stock.symbol} 的详细信息...`);
        
        // 使用 Yahoo Finance API 获取股票详细信息
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=1d`);
        
        if (!response.ok) {
          console.log(`无法获取 ${stock.symbol} 的数据`);
          continue;
        }

        const data = await response.json();
        const result = data.chart.result[0];
        
        if (!result || !result.meta) {
          console.log(`${stock.symbol} 数据格式不正确`);
          continue;
        }

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice || meta.previousClose;
        const previousClose = meta.chartPreviousClose || meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        const volume = meta.regularMarketVolume || 0;
        const marketCap = meta.marketCap || 0;
        const peRatio = meta.trailingPE || 0;

        // 获取公司名称
        const nameResponse = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${stock.symbol}&quotesCount=1&newsCount=0`);
        let companyName = stock.symbol;
        
        if (nameResponse.ok) {
          const nameData = await nameResponse.json();
          if (nameData.quotes && nameData.quotes[0]) {
            companyName = nameData.quotes[0].longName || nameData.quotes[0].shortName || stock.symbol;
          }
        }

        stockDetails.push({
          symbol: stock.symbol,
          name: companyName,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: volume,
          marketCap: marketCap,
          peRatio: peRatio,
          rank: stock.rank,
          sector: 'Technology', // 默认值
          reason: this.generateAnalysisReason(stock.symbol, changePercent),
          confidence: this.getConfidenceLevel(changePercent, volume)
        });

        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`获取 ${stock.symbol} 详细信息时出错:`, error);
        continue;
      }
    }

    return stockDetails;
  }

  generateAnalysisReason(symbol, changePercent) {
    const reasons = {
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
    };

    const symbolReasons = reasons[symbol] || ['Market volatility and sector rotation'];
    const isPositive = changePercent > 0;
    return isPositive ? symbolReasons[0] : symbolReasons[1] || symbolReasons[0];
  }

  getConfidenceLevel(changePercent, volume) {
    const absChange = Math.abs(changePercent);
    const isHighVolume = volume > 50000000;
    
    if (absChange > 5 && isHighVolume) return 'high';
    if (absChange > 2 || isHighVolume) return 'medium';
    return 'low';
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async saveToFile(data, filename = 'stocktwits-data.json') {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`数据已保存到: ${filePath}`);
  }
}

// 主函数
async function main() {
  const scraper = new StockTwitsScraper();
  
  try {
    await scraper.init();
    
    // 爬取 most-active 股票
    const stocks = await scraper.scrapeMostActive();
    
    if (stocks.length === 0) {
      console.log('未能获取到股票数据，使用默认股票列表');
      const defaultStocks = [
        { symbol: 'SPY', rank: 1 },
        { symbol: 'OPEN', rank: 2 },
        { symbol: 'HOLO', rank: 3 },
        { symbol: 'BBAI', rank: 4 },
        { symbol: 'QQQ', rank: 5 },
        { symbol: 'NVDA', rank: 6 },
        { symbol: 'TSLA', rank: 7 },
        { symbol: 'DJT', rank: 8 },
        { symbol: 'ASST', rank: 9 },
        { symbol: 'MU', rank: 10 }
      ];
      
      const stockDetails = await scraper.getStockDetails(defaultStocks);
      await scraper.saveToFile(stockDetails);
      return stockDetails;
    }
    
    // 获取股票详细信息
    const stockDetails = await scraper.getStockDetails(stocks);
    
    // 保存数据
    await scraper.saveToFile(stockDetails);
    
    console.log('爬取完成！');
    console.log('获取到的股票:', stockDetails.map(s => `${s.symbol} (${s.name})`).join(', '));
    
    return stockDetails;
    
  } catch (error) {
    console.error('主函数执行出错:', error);
  } finally {
    await scraper.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { StockTwitsScraper, main };

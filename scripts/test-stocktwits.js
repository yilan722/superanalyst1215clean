const { StockTwitsScraper } = require('./stocktwits-scraper');

async function testStockTwitsScraper() {
  console.log('开始测试 StockTwits 爬虫...');
  
  const scraper = new StockTwitsScraper();
  
  try {
    await scraper.init();
    
    // 测试爬取 most-active 股票
    const stocks = await scraper.scrapeMostActive();
    console.log('爬取到的股票符号:', stocks);
    
    if (stocks.length > 0) {
      // 获取前5只股票的详细信息
      const top5Stocks = stocks.slice(0, 5);
      const stockDetails = await scraper.getStockDetails(top5Stocks);
      
      console.log('\n股票详细信息:');
      stockDetails.forEach((stock, index) => {
        console.log(`${index + 1}. ${stock.symbol} - ${stock.name}`);
        console.log(`   价格: $${stock.price.toFixed(2)}`);
        console.log(`   涨跌: ${stock.changePercent.toFixed(2)}%`);
        console.log(`   成交量: ${stock.volume.toLocaleString()}`);
        console.log(`   信心等级: ${stock.confidence}`);
        console.log(`   分析原因: ${stock.reason}`);
        console.log('');
      });
      
      // 保存数据
      await scraper.saveToFile(stockDetails, 'test-stocktwits-data.json');
    } else {
      console.log('未能获取到股票数据');
    }
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await scraper.close();
  }
}

// 运行测试
if (require.main === module) {
  testStockTwitsScraper().catch(console.error);
}

module.exports = { testStockTwitsScraper };

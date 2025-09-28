const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDailyAlphaBrief() {
  console.log('🧪 测试 Daily Alpha Brief 数据获取...\n');

  try {
    // 测试 hot-stocks API
    console.log('1. 测试 /api/hot-stocks API...');
    const hotStocksResponse = await fetch('http://localhost:3000/api/hot-stocks');
    const hotStocksData = await hotStocksResponse.json();
    
    if (hotStocksData.success) {
      console.log(`✅ 成功获取 ${hotStocksData.data.length} 只股票数据`);
      console.log(`📊 数据源: ${hotStocksData.source}`);
      console.log('📈 股票列表:');
      hotStocksData.data.forEach((stock, index) => {
        console.log(`   ${index + 1}. ${stock.symbol} - $${stock.price.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`);
      });
    } else {
      console.log('❌ 获取股票数据失败:', hotStocksData.error);
    }

    console.log('\n2. 测试 /api/stocktwits-most-active API...');
    const stockTwitsResponse = await fetch('http://localhost:3000/api/stocktwits-most-active');
    const stockTwitsData = await stockTwitsResponse.json();
    
    if (stockTwitsData.success) {
      console.log(`✅ StockTwits API 成功，获取 ${stockTwitsData.data.length} 只股票`);
      console.log(`📊 数据源: ${stockTwitsData.source}`);
    } else {
      console.log('❌ StockTwits API 失败:', stockTwitsData.error);
    }

    console.log('\n3. 验证数据一致性...');
    if (hotStocksData.success && stockTwitsData.success) {
      const hotStocksSymbols = hotStocksData.data.map(s => s.symbol).sort();
      const stockTwitsSymbols = stockTwitsData.data.map(s => s.symbol).sort();
      
      const isSame = JSON.stringify(hotStocksSymbols) === JSON.stringify(stockTwitsSymbols);
      console.log(`📋 股票列表是否一致: ${isSame ? '✅ 是' : '❌ 否'}`);
      
      if (!isSame) {
        console.log('Hot-stocks 股票:', hotStocksSymbols);
        console.log('StockTwits 股票:', stockTwitsSymbols);
      }
    }

    console.log('\n4. 检查数据质量...');
    if (hotStocksData.success) {
      const stocks = hotStocksData.data;
      const validPrices = stocks.filter(s => s.price > 0).length;
      const validChanges = stocks.filter(s => s.changePercent !== 0).length;
      const hasConfidence = stocks.filter(s => s.confidence).length;
      
      console.log(`💰 有效价格数据: ${validPrices}/${stocks.length}`);
      console.log(`📊 有效涨跌数据: ${validChanges}/${stocks.length}`);
      console.log(`🎯 信心等级数据: ${hasConfidence}/${stocks.length}`);
    }

    console.log('\n✅ 测试完成！');
    console.log('\n🌐 现在可以访问以下页面查看效果:');
    console.log('   - 主页 (Daily Alpha Brief): http://localhost:3000');
    console.log('   - 测试页面: http://localhost:3000/test-stocktwits');

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testDailyAlphaBrief().catch(console.error);
}

module.exports = { testDailyAlphaBrief };

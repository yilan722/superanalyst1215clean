// 使用Node.js内置fetch (Node 18+)

// NVDA股票数据
const nvdaStockData = {
  symbol: 'NVDA',
  name: 'NVIDIA Corporation',
  price: '$875.28',
  marketCap: '$2.15T',
  peRatio: '65.2',
  amount: '$45.2B'
};

// 测试用户ID (使用一个测试ID)
const testUserId = 'test-user-123';

async function testGenerateReportPerplexity() {
  console.log('🚀 测试 generate-report-perplexity API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/generate-report-perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserId}`,
      },
      body: JSON.stringify({
        stockData: nvdaStockData,
        userId: testUserId,
        locale: 'zh',
      }),
    });

    console.log('📊 Perplexity API 响应状态:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Perplexity API 错误:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('✅ Perplexity API 成功生成报告');
    console.log('📝 报告部分:', Object.keys(data));
    
    return {
      api: 'generate-report-perplexity',
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Perplexity API 测试失败:', error.message);
    return null;
  }
}

async function testGenerateReportExternal() {
  console.log('🚀 测试 generate-report-external API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/generate-report-external', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stockData: nvdaStockData,
        locale: 'zh',
      }),
    });

    console.log('📊 External API 响应状态:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ External API 错误:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('✅ External API 成功生成报告');
    console.log('📝 报告部分:', Object.keys(data));
    
    return {
      api: 'generate-report-external',
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ External API 测试失败:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🎯 开始测试 NVDA 报告生成...');
  console.log('📊 股票数据:', nvdaStockData);
  console.log('⏰ 开始时间:', new Date().toISOString());
  console.log('='.repeat(60));

  const results = [];

  // 测试 Perplexity API
  console.log('\n1️⃣ 测试 generate-report-perplexity API');
  console.log('-'.repeat(40));
  const perplexityResult = await testGenerateReportPerplexity();
  if (perplexityResult) {
    results.push(perplexityResult);
  }

  // 等待5秒
  console.log('\n⏳ 等待5秒...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 测试 External API
  console.log('\n2️⃣ 测试 generate-report-external API');
  console.log('-'.repeat(40));
  const externalResult = await testGenerateReportExternal();
  if (externalResult) {
    results.push(externalResult);
  }

  // 保存结果
  console.log('\n💾 保存测试结果...');
  const fs = require('fs');
  const resultsFile = `nvda-test-results-${Date.now()}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`✅ 结果已保存到: ${resultsFile}`);

  // 总结
  console.log('\n📊 测试总结');
  console.log('='.repeat(60));
  console.log(`✅ 成功测试: ${results.length}/2 个API`);
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.api}: ${result.timestamp}`);
    if (result.data) {
      console.log(`   - 报告部分: ${Object.keys(result.data).join(', ')}`);
    }
  });

  return results;
}

// 运行测试
runTests().catch(console.error);

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const HISTORICAL_REPORTS_PATH = path.join(DATA_DIR, 'historical-reports.json');
const TODAYS_REPORT_PATH = path.join(DATA_DIR, 'todays-report.json');

// 设置今日必读报告
function setTodaysReport(symbol) {
  console.log(`🔄 设置今日必读报告: ${symbol}`);
  
  try {
    // 读取历史报告数据
    if (!fs.existsSync(HISTORICAL_REPORTS_PATH)) {
      console.log('❌ 历史报告文件不存在');
      return;
    }
    
    const historicalData = fs.readFileSync(HISTORICAL_REPORTS_PATH, 'utf-8');
    const historicalReports = JSON.parse(historicalData);
    
    // 查找指定符号的报告
    const report = historicalReports.reports.find(r => 
      r.symbol.toLowerCase() === symbol.toLowerCase() || 
      r.id.includes(symbol.toLowerCase())
    );
    
    if (!report) {
      console.log(`❌ 未找到符号为 ${symbol} 的报告`);
      console.log('📋 可用的报告符号:');
      historicalReports.reports.forEach(r => {
        console.log(`  - ${r.symbol} (${r.id})`);
      });
      return;
    }
    
    console.log(`✅ 找到报告: ${report.company} (${report.symbol})`);
    
    // 将报告设置为今日必读
    fs.writeFileSync(
      TODAYS_REPORT_PATH,
      JSON.stringify(report, null, 2)
    );
    
    console.log(`🎉 今日必读报告已设置为: ${report.company} (${report.symbol})`);
    console.log(`📊 报告ID: ${report.id}`);
    console.log(`📁 保存到: ${TODAYS_REPORT_PATH}`);
    
  } catch (error) {
    console.error('❌ 设置今日必读报告失败:', error.message);
    process.exit(1);
  }
}

// 获取命令行参数
const symbol = process.argv[2];

if (!symbol) {
  console.log('❌ 请提供报告符号');
  console.log('📖 使用方法: node scripts/set-todays-report.js <SYMBOL>');
  console.log('📋 示例: node scripts/set-todays-report.js BKKT');
  process.exit(1);
}

setTodaysReport(symbol);

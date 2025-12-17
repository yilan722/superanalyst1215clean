const fs = require('fs');
const path = require('path');

// 读取当前的历史报告文件
const historicalReportsPath = './reference-reports/historical-reports.json';
const todaysReportPath = './data/todays-report.json';

async function updateHistoricalReports() {
  try {
    console.log('🔄 开始更新历史报告...');
    
    // 读取今日报告
    const todaysReportData = fs.readFileSync(todaysReportPath, 'utf8');
    const todaysReport = JSON.parse(todaysReportData);
    
    // 读取历史报告
    const historicalReportsData = fs.readFileSync(historicalReportsPath, 'utf8');
    const historicalReports = JSON.parse(historicalReportsData);
    
    // 查找是否已存在Bakkt报告
    const existingIndex = historicalReports.findIndex(report => report.id === 'bkkt-2025-10-03');
    
    if (existingIndex !== -1) {
      // 更新现有报告
      historicalReports[existingIndex] = todaysReport;
      console.log('✅ 更新了现有的Bakkt报告');
    } else {
      // 添加新报告
      historicalReports.push(todaysReport);
      console.log('✅ 添加了新的Bakkt报告');
    }
    
    // 写入更新后的历史报告
    fs.writeFileSync(historicalReportsPath, JSON.stringify(historicalReports, null, 2));
    
    console.log('✅ 历史报告更新成功！');
    console.log(`📊 历史报告总数: ${historicalReports.length}`);
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    console.error(error.stack);
  }
}

// 运行脚本
updateHistoricalReports();

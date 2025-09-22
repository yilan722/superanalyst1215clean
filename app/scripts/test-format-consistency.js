#!/usr/bin/env node

/**
 * 格式一致性测试脚本
 * 用于测试AI生成报告格式的一致性
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  // 测试次数
  testRuns: 3,
  
  // 测试间隔（毫秒）
  testInterval: 5000,
  
  // 测试股票数据
  testStockData: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: '$150.00',
    marketCap: '$2.5T',
    peRatio: '25.5',
    amount: '50M'
  },
  
  // 输出目录
  outputDir: 'test-reports'
};

/**
 * 生成测试报告
 * @param {number} runNumber - 测试运行次数
 * @returns {Promise<Object>} 报告内容
 */
async function generateTestReport(runNumber) {
  console.log(`🔄 生成测试报告 #${runNumber}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-report-perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-id'
      },
      body: JSON.stringify({
        stockData: TEST_CONFIG.testStockData,
        locale: 'zh'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reportData = await response.json();
    console.log(`✅ 测试报告 #${runNumber} 生成成功`);
    
    return reportData;
  } catch (error) {
    console.error(`❌ 测试报告 #${runNumber} 生成失败:`, error.message);
    return null;
  }
}

/**
 * 分析报告格式
 * @param {Object} report - 报告内容
 * @param {number} runNumber - 测试运行次数
 * @returns {Object} 分析结果
 */
function analyzeReportFormat(report, runNumber) {
  const analysis = {
    runNumber,
    sections: {},
    totalTables: 0,
    totalCharts: 0,
    formatConsistency: true,
    errors: [],
    warnings: []
  };

  const requiredSections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis'];
  
  for (const section of requiredSections) {
    if (!report[section]) {
      analysis.errors.push(`Missing section: ${section}`);
      analysis.formatConsistency = false;
      continue;
    }

    const content = report[section];
    const sectionAnalysis = {
      tableCount: 0,
      chartCount: 0,
      contentLength: 0,
      hasCorrectFormat: true
    };

    // 检查表格数量
    const tableMatches = content.match(/<table class="metric-table">/g);
    sectionAnalysis.tableCount = tableMatches ? tableMatches.length : 0;
    
    if (sectionAnalysis.tableCount !== 3) {
      analysis.errors.push(`${section}: Expected 3 tables, found ${sectionAnalysis.tableCount}`);
      analysis.formatConsistency = false;
    }

    // 检查图表数量
    const chartMatches = content.match(/<div class="chart-container">/g);
    sectionAnalysis.chartCount = chartMatches ? chartMatches.length : 0;
    
    if (sectionAnalysis.chartCount !== 3) {
      analysis.errors.push(`${section}: Expected 3 charts, found ${sectionAnalysis.chartCount}`);
      analysis.formatConsistency = false;
    }

    // 检查内容长度
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    sectionAnalysis.contentLength = textContent.length;
    
    if (sectionAnalysis.contentLength < 500) {
      analysis.warnings.push(`${section}: Content too short (${sectionAnalysis.contentLength}/500)`);
    }

    // 检查HTML格式
    if (!content.includes('<table class="metric-table">')) {
      analysis.errors.push(`${section}: Missing standard table format`);
      analysis.formatConsistency = false;
    }

    if (!content.includes('<div class="chart-container">')) {
      analysis.errors.push(`${section}: Missing standard chart format`);
      analysis.formatConsistency = false;
    }

    analysis.sections[section] = sectionAnalysis;
    analysis.totalTables += sectionAnalysis.tableCount;
    analysis.totalCharts += sectionAnalysis.chartCount;
  }

  return analysis;
}

/**
 * 比较多个报告的格式一致性
 * @param {Array} analyses - 分析结果数组
 * @returns {Object} 一致性分析结果
 */
function compareFormatConsistency(analyses) {
  const comparison = {
    consistent: true,
    differences: [],
    summary: {
      totalRuns: analyses.length,
      successfulRuns: analyses.filter(a => a.formatConsistency).length,
      averageTables: 0,
      averageCharts: 0,
      tableConsistency: true,
      chartConsistency: true
    }
  };

  if (analyses.length < 2) {
    return comparison;
  }

  // 计算平均值
  comparison.summary.averageTables = analyses.reduce((sum, a) => sum + a.totalTables, 0) / analyses.length;
  comparison.summary.averageCharts = analyses.reduce((sum, a) => sum + a.totalCharts, 0) / analyses.length;

  // 检查表格数量一致性
  const tableCounts = analyses.map(a => a.totalTables);
  const uniqueTableCounts = [...new Set(tableCounts)];
  if (uniqueTableCounts.length > 1) {
    comparison.consistent = false;
    comparison.tableConsistency = false;
    comparison.differences.push(`Table count inconsistency: ${uniqueTableCounts.join(', ')}`);
  }

  // 检查图表数量一致性
  const chartCounts = analyses.map(a => a.totalCharts);
  const uniqueChartCounts = [...new Set(chartCounts)];
  if (uniqueChartCounts.length > 1) {
    comparison.consistent = false;
    comparison.chartConsistency = false;
    comparison.differences.push(`Chart count inconsistency: ${uniqueChartCounts.join(', ')}`);
  }

  // 检查各部分格式一致性
  const sections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis'];
  for (const section of sections) {
    const sectionTableCounts = analyses.map(a => a.sections[section]?.tableCount || 0);
    const uniqueSectionTableCounts = [...new Set(sectionTableCounts)];
    if (uniqueSectionTableCounts.length > 1) {
      comparison.consistent = false;
      comparison.differences.push(`${section} table count inconsistency: ${uniqueSectionTableCounts.join(', ')}`);
    }

    const sectionChartCounts = analyses.map(a => a.sections[section]?.chartCount || 0);
    const uniqueSectionChartCounts = [...new Set(sectionChartCounts)];
    if (uniqueSectionChartCounts.length > 1) {
      comparison.consistent = false;
      comparison.differences.push(`${section} chart count inconsistency: ${uniqueSectionChartCounts.join(', ')}`);
    }
  }

  return comparison;
}

/**
 * 生成测试报告
 * @param {Array} analyses - 分析结果数组
 * @param {Object} comparison - 一致性分析结果
 */
function generateTestReport(analyses, comparison) {
  console.log('\n📊 格式一致性测试报告');
  console.log('='.repeat(60));
  
  console.log(`测试运行次数: ${comparison.summary.totalRuns}`);
  console.log(`成功运行次数: ${comparison.summary.successfulRuns}`);
  console.log(`平均表格数量: ${comparison.summary.averageTables.toFixed(1)}`);
  console.log(`平均图表数量: ${comparison.summary.averageCharts.toFixed(1)}`);
  
  if (comparison.consistent) {
    console.log('✅ 格式一致性测试通过！所有报告格式一致。');
  } else {
    console.log('❌ 格式一致性测试失败！发现格式不一致：');
    comparison.differences.forEach(diff => console.log(`  - ${diff}`));
  }

  console.log('\n📋 详细分析：');
  analyses.forEach((analysis, index) => {
    console.log(`\n运行 #${analysis.runNumber}:`);
    console.log(`  表格总数: ${analysis.totalTables}`);
    console.log(`  图表总数: ${analysis.totalCharts}`);
    console.log(`  格式正确: ${analysis.formatConsistency ? '✅' : '❌'}`);
    
    if (analysis.errors.length > 0) {
      console.log(`  错误: ${analysis.errors.join(', ')}`);
    }
    if (analysis.warnings.length > 0) {
      console.log(`  警告: ${analysis.warnings.join(', ')}`);
    }
  });

  // 保存测试结果
  const testResult = {
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG,
    analyses,
    comparison,
    summary: {
      consistent: comparison.consistent,
      totalRuns: comparison.summary.totalRuns,
      successfulRuns: comparison.summary.successfulRuns,
      averageTables: comparison.summary.averageTables,
      averageCharts: comparison.summary.averageCharts
    }
  };

  // 创建输出目录
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
  }

  // 保存测试结果
  const resultFile = path.join(TEST_CONFIG.outputDir, `consistency-test-${Date.now()}.json`);
  fs.writeFileSync(resultFile, JSON.stringify(testResult, null, 2));
  console.log(`\n💾 测试结果已保存到: ${resultFile}`);

  return comparison.consistent;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始格式一致性测试...');
  console.log(`测试配置: ${TEST_CONFIG.testRuns} 次运行，间隔 ${TEST_CONFIG.testInterval}ms`);
  
  const analyses = [];
  
  for (let i = 1; i <= TEST_CONFIG.testRuns; i++) {
    const report = await generateTestReport(i);
    
    if (report) {
      const analysis = analyzeReportFormat(report, i);
      analyses.push(analysis);
      
      // 保存单个报告
      if (!fs.existsSync(TEST_CONFIG.outputDir)) {
        fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
      }
      const reportFile = path.join(TEST_CONFIG.outputDir, `report-${i}-${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    }
    
    // 等待间隔
    if (i < TEST_CONFIG.testRuns) {
      console.log(`⏳ 等待 ${TEST_CONFIG.testInterval}ms...`);
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.testInterval));
    }
  }
  
  if (analyses.length === 0) {
    console.error('❌ 没有成功生成任何报告，测试失败');
    process.exit(1);
  }
  
  const comparison = compareFormatConsistency(analyses);
  const isConsistent = generateTestReport(analyses, comparison);
  
  process.exit(isConsistent ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  });
}

module.exports = { generateTestReport, analyzeReportFormat, compareFormatConsistency };

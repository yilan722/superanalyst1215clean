#!/usr/bin/env node

/**
 * 报告格式测试脚本
 * 用于验证生成的报告是否符合格式标准
 */

const fs = require('fs');
const path = require('path');

// 报告格式标准
const FORMAT_STANDARD = {
  requiredSections: ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis'],
  tablesPerSection: 3,
  chartsPerSection: 3,
  minContentLength: 500
};

/**
 * 测试报告格式
 * @param {Object} reportContent - 报告内容
 * @returns {Object} 测试结果
 */
function testReportFormat(reportContent) {
  const results = {
    passed: true,
    errors: [],
    warnings: [],
    details: {}
  };

  console.log('🔍 开始测试报告格式...');

  // 检查必需的四个部分
  for (const section of FORMAT_STANDARD.requiredSections) {
    if (!reportContent[section]) {
      results.passed = false;
      results.errors.push(`缺少必需的部分: ${section}`);
      continue;
    }

    const content = reportContent[section];
    const sectionResult = testSectionFormat(content, section);
    
    results.details[section] = sectionResult;
    
    if (!sectionResult.passed) {
      results.passed = false;
      results.errors.push(...sectionResult.errors);
    }
    
    results.warnings.push(...sectionResult.warnings);
  }

  return results;
}

/**
 * 测试单个部分的格式
 * @param {string} content - 部分内容
 * @param {string} sectionName - 部分名称
 * @returns {Object} 测试结果
 */
function testSectionFormat(content, sectionName) {
  const result = {
    passed: true,
    errors: [],
    warnings: [],
    tableCount: 0,
    chartCount: 0,
    contentLength: 0
  };

  // 检查表格数量
  const tableMatches = content.match(/<table class="metric-table">/g);
  result.tableCount = tableMatches ? tableMatches.length : 0;
  
  if (result.tableCount !== FORMAT_STANDARD.tablesPerSection) {
    result.passed = false;
    result.errors.push(`${sectionName}: 表格数量不正确 (${result.tableCount}/${FORMAT_STANDARD.tablesPerSection})`);
  }

  // 检查图表数量
  const chartMatches = content.match(/<div class="chart-container">/g);
  result.chartCount = chartMatches ? chartMatches.length : 0;
  
  if (result.chartCount !== FORMAT_STANDARD.chartsPerSection) {
    result.passed = false;
    result.errors.push(`${sectionName}: 图表数量不正确 (${result.chartCount}/${FORMAT_STANDARD.chartsPerSection})`);
  }

  // 检查内容长度
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  result.contentLength = textContent.length;
  
  if (result.contentLength < FORMAT_STANDARD.minContentLength) {
    result.warnings.push(`${sectionName}: 内容过短 (${result.contentLength}/${FORMAT_STANDARD.minContentLength})`);
  }

  // 检查HTML结构
  if (!content.includes('<table class="metric-table">')) {
    result.warnings.push(`${sectionName}: 缺少标准表格格式`);
  }

  if (!content.includes('<div class="chart-container">')) {
    result.warnings.push(`${sectionName}: 缺少标准图表格式`);
  }

  return result;
}

/**
 * 生成测试报告
 * @param {Object} results - 测试结果
 */
function generateTestReport(results) {
  console.log('\n📊 报告格式测试结果');
  console.log('='.repeat(50));
  
  if (results.passed) {
    console.log('✅ 所有测试通过！报告格式符合标准。');
  } else {
    console.log('❌ 测试失败！发现格式问题：');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️ 警告：');
    results.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  console.log('\n📋 详细信息：');
  Object.entries(results.details).forEach(([section, detail]) => {
    console.log(`\n${section}:`);
    console.log(`  表格数量: ${detail.tableCount}/${FORMAT_STANDARD.tablesPerSection}`);
    console.log(`  图表数量: ${detail.chartCount}/${FORMAT_STANDARD.chartsPerSection}`);
    console.log(`  内容长度: ${detail.contentLength}/${FORMAT_STANDARD.minContentLength}`);
  });

  return results.passed;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法: node test-report-format.js <report-file.json>');
    console.log('示例: node test-report-format.js sample-report.json');
    process.exit(1);
  }

  const reportFile = args[0];
  
  if (!fs.existsSync(reportFile)) {
    console.error(`❌ 文件不存在: ${reportFile}`);
    process.exit(1);
  }

  try {
    const reportContent = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    const results = testReportFormat(reportContent);
    const passed = generateTestReport(results);
    
    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { testReportFormat, testSectionFormat, FORMAT_STANDARD };

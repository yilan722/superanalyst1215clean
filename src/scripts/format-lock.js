#!/usr/bin/env node

/**
 * 格式锁定脚本
 * 用于锁定报告格式，防止意外的修改
 */

const fs = require('fs');
const path = require('path');

// 格式锁定的关键配置
const FORMAT_LOCK_CONFIG = {
  // 关键文件路径
  promptFile: 'app/api/generate-report-perplexity/route.ts',
  standardFile: 'REPORT_FORMAT_STANDARD.md',
  testFile: 'scripts/test-report-format.js',
  
  // 关键格式要求（这些值不能修改）
  lockedValues: {
    tablesPerSection: 3,
    chartsPerSection: 3,
    minContentLength: 500,
    requiredSections: ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
  },
  
  // 关键HTML格式（这些格式不能修改）
  lockedHtmlFormats: [
    '<table class="metric-table">',
    '<div class="chart-container">',
    'class="positive"',
    'class="negative"',
    'class="neutral"'
  ]
};

/**
 * 检查格式是否被锁定
 * @returns {Object} 检查结果
 */
function checkFormatLock() {
  const results = {
    locked: true,
    violations: [],
    warnings: []
  };

  console.log('🔒 检查格式锁定状态...');

  // 检查prompt文件中的关键值
  if (fs.existsSync(FORMAT_LOCK_CONFIG.promptFile)) {
    const promptContent = fs.readFileSync(FORMAT_LOCK_CONFIG.promptFile, 'utf8');
    
    // 检查表格数量要求
    if (!promptContent.includes('恰好3个数据表格')) {
      results.violations.push('表格数量要求被修改');
    }
    
    // 检查图表数量要求
    if (!promptContent.includes('还必须包含3个图表')) {
      results.violations.push('图表数量要求被修改');
    }
    
    // 检查HTML格式示例
    for (const format of FORMAT_LOCK_CONFIG.lockedHtmlFormats) {
      if (!promptContent.includes(format)) {
        results.violations.push(`HTML格式被修改: ${format}`);
      }
    }
  } else {
    results.violations.push('Prompt文件不存在');
  }

  // 检查标准文档是否存在
  if (!fs.existsSync(FORMAT_LOCK_CONFIG.standardFile)) {
    results.violations.push('格式标准文档不存在');
  }

  // 检查测试脚本是否存在
  if (!fs.existsSync(FORMAT_LOCK_CONFIG.testFile)) {
    results.violations.push('格式测试脚本不存在');
  }

  if (results.violations.length > 0) {
    results.locked = false;
  }

  return results;
}

/**
 * 修复格式违规
 * @param {Array} violations - 违规列表
 */
function fixFormatViolations(violations) {
  console.log('🔧 修复格式违规...');
  
  for (const violation of violations) {
    console.log(`  - 修复: ${violation}`);
  }
  
  // 这里可以添加自动修复逻辑
  console.log('⚠️ 需要手动修复格式违规');
}

/**
 * 生成锁定报告
 * @param {Object} results - 检查结果
 */
function generateLockReport(results) {
  console.log('\n🔒 格式锁定状态报告');
  console.log('='.repeat(50));
  
  if (results.locked) {
    console.log('✅ 格式已锁定，所有检查通过！');
  } else {
    console.log('❌ 格式锁定被破坏！发现违规：');
    results.violations.forEach(violation => console.log(`  - ${violation}`));
    
    console.log('\n🔧 建议修复措施：');
    console.log('  1. 恢复prompt文件中的格式要求');
    console.log('  2. 确保所有HTML格式示例完整');
    console.log('  3. 运行格式测试脚本验证');
    console.log('  4. 重新锁定格式');
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️ 警告：');
    results.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
}

/**
 * 创建格式锁定文件
 */
function createFormatLock() {
  const lockContent = {
    lockedAt: new Date().toISOString(),
    lockedBy: 'AI Assistant',
    version: '1.0',
    description: '报告格式已锁定，禁止修改',
    lockedValues: FORMAT_LOCK_CONFIG.lockedValues,
    lockedFiles: [
      FORMAT_LOCK_CONFIG.promptFile,
      FORMAT_LOCK_CONFIG.standardFile,
      FORMAT_LOCK_CONFIG.testFile
    ]
  };

  fs.writeFileSync('FORMAT_LOCK.json', JSON.stringify(lockContent, null, 2));
  console.log('✅ 格式锁定文件已创建');
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  switch (command) {
    case 'check':
      const results = checkFormatLock();
      generateLockReport(results);
      process.exit(results.locked ? 0 : 1);
      
    case 'lock':
      createFormatLock();
      console.log('🔒 格式已锁定');
      break;
      
    case 'fix':
      const checkResults = checkFormatLock();
      if (!checkResults.locked) {
        fixFormatViolations(checkResults.violations);
      }
      break;
      
    default:
      console.log('使用方法: node format-lock.js [check|lock|fix]');
      console.log('  check - 检查格式锁定状态');
      console.log('  lock  - 创建格式锁定');
      console.log('  fix   - 修复格式违规');
      process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { checkFormatLock, fixFormatViolations, createFormatLock };

#!/usr/bin/env node

/**
 * 格式监控脚本
 * 定期检查报告格式是否符合标准
 */

const fs = require('fs');
const path = require('path');
const { testReportFormat } = require('./test-report-format');
const { checkFormatLock } = require('./format-lock');

// 监控配置
const MONITOR_CONFIG = {
  // 检查间隔（毫秒）
  checkInterval: 5 * 60 * 1000, // 5分钟
  
  // 报告文件路径模式
  reportFilePattern: /.*report.*\.json$/,
  
  // 日志文件
  logFile: 'logs/format-monitor.log',
  
  // 告警阈值
  alertThresholds: {
    maxViolations: 3,
    maxWarnings: 10
  }
};

/**
 * 创建日志目录
 */
function createLogDirectory() {
  const logDir = path.dirname(MONITOR_CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * 写入日志
 * @param {string} message - 日志消息
 * @param {string} level - 日志级别
 */
function writeLog(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  createLogDirectory();
  fs.appendFileSync(MONITOR_CONFIG.logFile, logEntry);
  console.log(`[${level}] ${message}`);
}

/**
 * 扫描报告文件
 * @returns {Array} 报告文件列表
 */
function scanReportFiles() {
  const reportFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (MONITOR_CONFIG.reportFilePattern.test(item)) {
        reportFiles.push(fullPath);
      }
    }
  }
  
  // 扫描当前目录和子目录
  scanDirectory('.');
  
  return reportFiles;
}

/**
 * 检查单个报告文件
 * @param {string} filePath - 文件路径
 * @returns {Object} 检查结果
 */
function checkReportFile(filePath) {
  try {
    const reportContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const results = testReportFormat(reportContent);
    
    return {
      file: filePath,
      passed: results.passed,
      errors: results.errors,
      warnings: results.warnings,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      file: filePath,
      passed: false,
      errors: [`文件解析失败: ${error.message}`],
      warnings: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 检查格式锁定状态
 * @returns {Object} 锁定状态
 */
function checkFormatLockStatus() {
  try {
    return checkFormatLock();
  } catch (error) {
    return {
      locked: false,
      violations: [`锁定检查失败: ${error.message}`],
      warnings: []
    };
  }
}

/**
 * 生成监控报告
 * @param {Array} reportResults - 报告检查结果
 * @param {Object} lockStatus - 锁定状态
 */
function generateMonitorReport(reportResults, lockStatus) {
  const totalReports = reportResults.length;
  const passedReports = reportResults.filter(r => r.passed).length;
  const failedReports = totalReports - passedReports;
  
  const totalErrors = reportResults.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = reportResults.reduce((sum, r) => sum + r.warnings.length, 0);
  
  console.log('\n📊 格式监控报告');
  console.log('='.repeat(50));
  console.log(`总报告数: ${totalReports}`);
  console.log(`通过: ${passedReports}`);
  console.log(`失败: ${failedReports}`);
  console.log(`总错误: ${totalErrors}`);
  console.log(`总警告: ${totalWarnings}`);
  console.log(`格式锁定: ${lockStatus.locked ? '✅' : '❌'}`);
  
  if (failedReports > 0) {
    console.log('\n❌ 失败的报告:');
    reportResults.filter(r => !r.passed).forEach(result => {
      console.log(`  ${result.file}:`);
      result.errors.forEach(error => console.log(`    - ${error}`));
    });
  }
  
  if (!lockStatus.locked) {
    console.log('\n🔒 格式锁定问题:');
    lockStatus.violations.forEach(violation => console.log(`  - ${violation}`));
  }
  
  // 写入日志
  writeLog(`监控完成: ${passedReports}/${totalReports} 报告通过, ${totalErrors} 错误, ${totalWarnings} 警告`);
  
  // 检查告警阈值
  if (totalErrors > MONITOR_CONFIG.alertThresholds.maxViolations) {
    writeLog(`⚠️ 错误数量超过阈值: ${totalErrors} > ${MONITOR_CONFIG.alertThresholds.maxViolations}`, 'WARN');
  }
  
  if (totalWarnings > MONITOR_CONFIG.alertThresholds.maxWarnings) {
    writeLog(`⚠️ 警告数量超过阈值: ${totalWarnings} > ${MONITOR_CONFIG.alertThresholds.maxWarnings}`, 'WARN');
  }
  
  if (!lockStatus.locked) {
    writeLog(`🔒 格式锁定被破坏`, 'ERROR');
  }
}

/**
 * 执行监控检查
 */
function runMonitorCheck() {
  writeLog('开始格式监控检查...');
  
  // 检查格式锁定状态
  const lockStatus = checkFormatLockStatus();
  
  // 扫描并检查报告文件
  const reportFiles = scanReportFiles();
  writeLog(`发现 ${reportFiles.length} 个报告文件`);
  
  const reportResults = reportFiles.map(checkReportFile);
  
  // 生成监控报告
  generateMonitorReport(reportResults, lockStatus);
  
  writeLog('格式监控检查完成');
}

/**
 * 启动持续监控
 */
function startContinuousMonitoring() {
  writeLog('启动持续格式监控...');
  
  // 立即执行一次检查
  runMonitorCheck();
  
  // 设置定期检查
  setInterval(runMonitorCheck, MONITOR_CONFIG.checkInterval);
  
  writeLog(`监控已启动，检查间隔: ${MONITOR_CONFIG.checkInterval / 1000} 秒`);
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  switch (command) {
    case 'check':
      runMonitorCheck();
      break;
      
    case 'monitor':
      startContinuousMonitoring();
      break;
      
    case 'scan':
      const files = scanReportFiles();
      console.log('发现的报告文件:');
      files.forEach(file => console.log(`  ${file}`));
      break;
      
    default:
      console.log('使用方法: node format-monitor.js [check|monitor|scan]');
      console.log('  check   - 执行一次格式检查');
      console.log('  monitor - 启动持续监控');
      console.log('  scan    - 扫描报告文件');
      process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { runMonitorCheck, startContinuousMonitoring, scanReportFiles };

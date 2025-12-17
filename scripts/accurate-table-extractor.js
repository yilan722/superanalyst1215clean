const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// 精确的表格提取器 - 基于实际PDF格式
function extractAccurateTablesFromPDF(text, companyName) {
  console.log(`📊 开始从PDF中提取 ${companyName} 的精确表格数据...`);
  
  const tables = [];
  
  // 清理文本
  const cleanText = text
    .replace(/Click superanalyst\.pro for more professional research.*?(?=\n|$)/g, '')
    .replace(/\d+\/\d+\/\d+.*?(?=\n|$)/g, '')
    .replace(/about:blank.*?(?=\n|$)/g, '')
    .replace(/s u p e r a n a l y s t \. p r o.*?(?=\n|$)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // 1. 提取财务指标表格
  const financialTable = extractFinancialMetricsTable(cleanText, companyName);
  if (financialTable) {
    tables.push(financialTable);
  }

  // 2. 提取业绩指标表格
  const performanceTable = extractPerformanceMetricsTable(cleanText, companyName);
  if (performanceTable) {
    tables.push(performanceTable);
  }

  // 3. 提取交易和托管指标表格
  const tradingTable = extractTradingMetricsTable(cleanText, companyName);
  if (tradingTable) {
    tables.push(tradingTable);
  }

  // 4. 提取稳定币和AI指标表格
  const stablecoinTable = extractStablecoinMetricsTable(cleanText, companyName);
  if (stablecoinTable) {
    tables.push(stablecoinTable);
  }

  // 5. 提取地区分布表格
  const regionalTable = extractRegionalMetricsTable(cleanText, companyName);
  if (regionalTable) {
    tables.push(regionalTable);
  }

  // 6. 提取估值分析表格
  const valuationTable = extractValuationMetricsTable(cleanText, companyName);
  if (valuationTable) {
    tables.push(valuationTable);
  }

  console.log(`📊 总共提取了 ${tables.length} 个精确表格`);
  return tables;
}

// 提取财务指标表格
function extractFinancialMetricsTable(text, companyName) {
  // 查找包含Market Capitalization的行
  const marketCapLine = text.match(/Market Capitalization\$[\d,]+(?:\.\d+)?[BMK]?[\s\S]*?MarketBeat BKKT/);
  
  if (marketCapLine) {
    const line = marketCapLine[0];
    console.log('📊 找到财务指标行:', line);
    
    // 解析这一行数据
    const parts = line.split(/(\$\d+\.?\d*[BMK]?|N\/A|[\d.]+)/);
    const cells = parts.filter(part => part.trim().length > 0);
    
    if (cells.length >= 4) {
      const tableData = [
        ['Metric', 'Current Value', 'Previous Period', 'Industry Average', 'Data Source'],
        ['Market Capitalization', cells[1] || 'N/A', cells[2] || 'N/A', cells[3] || 'N/A', 'MarketBeat BKKT']
      ];
      
      // 查找其他财务指标行
      const otherLines = text.match(/Price-to-Earnings Ratio[\s\S]*?MarketBeat Financial Data|Trading Volume[\s\S]*?Quiver Quantitative|Beta Coefficient[\s\S]*?MarketBeat Risk Metrics|Debt-to-Equity Ratio[\s\S]*?NASDAQ Debt Elimination/g);
      
      if (otherLines) {
        otherLines.forEach(line => {
          const parts = line.split(/(\$\d+\.?\d*[BMK]?|N\/A|[\d.]+)/);
          const cells = parts.filter(part => part.trim().length > 0);
          if (cells.length >= 4) {
            tableData.push([
              cells[0].trim(),
              cells[1] || 'N/A',
              cells[2] || 'N/A',
              cells[3] || 'N/A',
              cells[4] || 'N/A'
            ]);
          }
        });
      }
      
      if (tableData.length > 1) {
        return {
          title: `${companyName} Financial Performance Metrics`,
          data: tableData,
          section: '1. 基本面分析',
          isRealData: true
        };
      }
    }
  }
  return null;
}

// 提取业绩指标表格
function extractPerformanceMetricsTable(text, companyName) {
  // 查找Performance Metrics表格
  const performanceMatch = text.match(/Performance MetricsQ2 2025Q1 2025YoY ChangeData Source[\s\S]*?Operating Expenses[\s\S]*?AInvest Operating Data/);
  
  if (performanceMatch) {
    const tableText = performanceMatch[0];
    console.log('📊 找到业绩指标表格:', tableText);
    
    const tableData = [
      ['Metric', 'Q2 2025', 'Q1 2025', 'YoY Change', 'Data Source']
    ];
    
    // 解析Revenue行
    const revenueMatch = tableText.match(/Revenue\$[\d,]+(?:\.\d+)?[BMK]?[\s\S]*?MarketBeat Earnings/);
    if (revenueMatch) {
      const parts = revenueMatch[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
      const cells = parts.filter(part => part.trim().length > 0);
      if (cells.length >= 4) {
        tableData.push(['Revenue', cells[1] || 'N/A', cells[2] || 'N/A', cells[3] || 'N/A', 'MarketBeat Earnings']);
      }
    }
    
    // 解析EPS行
    const epsMatch = tableText.match(/EPS[\s\S]*?MarketBeat EPS Data/);
    if (epsMatch) {
      const parts = epsMatch[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
      const cells = parts.filter(part => part.trim().length > 0);
      if (cells.length >= 4) {
        tableData.push(['EPS (Reported)', cells[1] || 'N/A', cells[2] || 'N/A', cells[3] || 'N/A', 'MarketBeat EPS Data']);
      }
    }
    
    // 解析Crypto Trading Volume行
    const tradingMatch = tableText.match(/Crypto Trading Volume[\s\S]*?AInvest Analysis/);
    if (tradingMatch) {
      const parts = tradingMatch[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
      const cells = parts.filter(part => part.trim().length > 0);
      if (cells.length >= 4) {
        tableData.push(['Crypto Trading Volume', cells[1] || 'N/A', cells[2] || 'N/A', cells[3] || 'N/A', 'AInvest Analysis']);
      }
    }
    
    // 解析Assets Under Custody行
    const custodyMatch = tableText.match(/Assets Under Custody[\s\S]*?AInvest Custody Data/);
    if (custodyMatch) {
      const parts = custodyMatch[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
      const cells = parts.filter(part => part.trim().length > 0);
      if (cells.length >= 4) {
        tableData.push(['Assets Under Custody', cells[1] || 'N/A', cells[2] || 'N/A', cells[3] || 'N/A', 'AInvest Custody Data']);
      }
    }
    
    // 解析Operating Expenses行
    const expensesMatch = tableText.match(/Operating Expenses[\s\S]*?AInvest Operating Data/);
    if (expensesMatch) {
      const parts = expensesMatch[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
      const cells = parts.filter(part => part.trim().length > 0);
      if (cells.length >= 4) {
        tableData.push(['Operating Expenses', cells[1] || 'N/A', cells[2] || 'N/A', cells[3] || 'N/A', 'AInvest Operating Data']);
      }
    }
    
    if (tableData.length > 1) {
      return {
        title: `${companyName} Performance Metrics`,
        data: tableData,
        section: '1. 基本面分析',
        isRealData: true
      };
    }
  }
  return null;
}

// 提取交易和托管指标表格
function extractTradingMetricsTable(text, companyName) {
  // 查找Trading & Custody Metrics表格
  const tradingMatch = text.match(/Trading & Custody MetricsQ2 2025Q1 2025YoY ChangeData Source[\s\S]*?Revenue per Transaction[\s\S]*?AInvest Revenue Analysis/);
  
  if (tradingMatch) {
    const tableText = tradingMatch[0];
    console.log('📊 找到交易和托管指标表格:', tableText);
    
    const tableData = [
      ['Metric', 'Q2 2025', 'Q1 2025', 'YoY Change', 'Data Source']
    ];
    
    // 解析各个指标行
    const metrics = [
      { pattern: /Trading Volume[\s\S]*?AInvest Trading Data/, name: 'Trading Volume' },
      { pattern: /Assets Under Custody[\s\S]*?AInvest Custody Metrics/, name: 'Assets Under Custody' },
      { pattern: /Average Trade Size[\s\S]*?AInvest Analysis/, name: 'Average Trade Size' },
      { pattern: /Institutional Accounts[\s\S]*?AInvest Account Data/, name: 'Institutional Accounts' },
      { pattern: /Revenue per Transaction[\s\S]*?AInvest Revenue Analysis/, name: 'Revenue per Transaction' }
    ];
    
    metrics.forEach(metric => {
      const match = tableText.match(metric.pattern);
      if (match) {
        const parts = match[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
        const cells = parts.filter(part => part.trim().length > 0);
        if (cells.length >= 4) {
          tableData.push([
            metric.name,
            cells[1] || 'N/A',
            cells[2] || 'N/A',
            cells[3] || 'N/A',
            cells[4] || 'N/A'
          ]);
        }
      }
    });
    
    if (tableData.length > 1) {
      return {
        title: `${companyName} Trading & Custody Metrics`,
        data: tableData,
        section: '2. 业务分析',
        isRealData: true
      };
    }
  }
  return null;
}

// 提取稳定币和AI指标表格
function extractStablecoinMetricsTable(text, companyName) {
  // 查找Stablecoin & AI Metrics表格
  const stablecoinMatch = text.match(/Stablecoin & AI MetricsQ3 2025Launch QuarterGrowth RateData Source[\s\S]*?Gross Margin[\s\S]*?AInvest Profitability/);
  
  if (stablecoinMatch) {
    const tableText = stablecoinMatch[0];
    console.log('📊 找到稳定币和AI指标表格:', tableText);
    
    const tableData = [
      ['Metric', 'Q3 2025', 'Launch Quarter', 'Growth Rate', 'Data Source']
    ];
    
    // 解析各个指标行
    const metrics = [
      { pattern: /Payment Volume[\s\S]*?AInvest Payment Data/, name: 'Payment Volume' },
      { pattern: /Average Transaction Fee[\s\S]*?AInvest Fee Analysis/, name: 'Average Transaction Fee' },
      { pattern: /Supported Countries[\s\S]*?AInvest Global Coverage/, name: 'Supported Countries' },
      { pattern: /Enterprise Clients[\s\S]*?AInvest Client Metrics/, name: 'Enterprise Clients' },
      { pattern: /Gross Margin[\s\S]*?AInvest Profitability/, name: 'Gross Margin' }
    ];
    
    metrics.forEach(metric => {
      const match = tableText.match(metric.pattern);
      if (match) {
        const parts = match[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
        const cells = parts.filter(part => part.trim().length > 0);
        if (cells.length >= 4) {
          tableData.push([
            metric.name,
            cells[1] || 'N/A',
            cells[2] || 'N/A',
            cells[3] || 'N/A',
            cells[4] || 'N/A'
          ]);
        }
      }
    });
    
    if (tableData.length > 1) {
      return {
        title: `${companyName} Stablecoin & AI Metrics`,
        data: tableData,
        section: '2. 业务分析',
        isRealData: true
      };
    }
  }
  return null;
}

// 提取地区分布表格
function extractRegionalMetricsTable(text, companyName) {
  // 查找Regional Distribution表格
  const regionalMatch = text.match(/Regional DistributionRevenue ShareTrading VolumeGrowth RateData Source[\s\S]*?Total International[\s\S]*?AInvest Consolidated/);
  
  if (regionalMatch) {
    const tableText = regionalMatch[0];
    console.log('📊 找到地区分布表格:', tableText);
    
    const tableData = [
      ['Region', 'Revenue Share', 'Trading Volume', 'Growth Rate', 'Data Source']
    ];
    
    // 解析各个地区行
    const regions = [
      { pattern: /United States[\s\S]*?AInvest Regional Data/, name: 'United States' },
      { pattern: /Japan[\s\S]*?Timothy Sykes Analysis/, name: 'Japan' },
      { pattern: /Other International[\s\S]*?AInvest International/, name: 'Other International' },
      { pattern: /Cross-Border Payments[\s\S]*?AInvest Payment Flows/, name: 'Cross-Border Payments' },
      { pattern: /Total International[\s\S]*?AInvest Consolidated/, name: 'Total International' }
    ];
    
    regions.forEach(region => {
      const match = tableText.match(region.pattern);
      if (match) {
        const parts = match[0].split(/(\d+\.?\d*%|\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
        const cells = parts.filter(part => part.trim().length > 0);
        if (cells.length >= 4) {
          tableData.push([
            region.name,
            cells[1] || 'N/A',
            cells[2] || 'N/A',
            cells[3] || 'N/A',
            cells[4] || 'N/A'
          ]);
        }
      }
    });
    
    if (tableData.length > 1) {
      return {
        title: `${companyName} Regional Distribution`,
        data: tableData,
        section: '2. 业务分析',
        isRealData: true
      };
    }
  }
  return null;
}

// 提取估值分析表格
function extractValuationMetricsTable(text, companyName) {
  // 查找DCF Key Assumptions表格
  const dcfMatch = text.match(/DCF Key Assumptions2025E2027E2030EData Source[\s\S]*?Terminal Growth Rate[\s\S]*?AInvest Terminal Analysis/);
  
  if (dcfMatch) {
    const tableText = dcfMatch[0];
    console.log('📊 找到DCF关键假设表格:', tableText);
    
    const tableData = [
      ['Metric', '2025E', '2027E', '2030E', 'Data Source']
    ];
    
    // 解析各个指标行
    const metrics = [
      { pattern: /Revenue[\s\S]*?AInvest Revenue Model/, name: 'Revenue' },
      { pattern: /Operating Margin[\s\S]*?AInvest Margin Analysis/, name: 'Operating Margin' },
      { pattern: /Free Cash Flow[\s\S]*?AInvest Cash Flow/, name: 'Free Cash Flow' },
      { pattern: /WACC[\s\S]*?MarketBeat Beta Analysis/, name: 'WACC' },
      { pattern: /Terminal Growth Rate[\s\S]*?AInvest Terminal Analysis/, name: 'Terminal Growth Rate' }
    ];
    
    metrics.forEach(metric => {
      const match = tableText.match(metric.pattern);
      if (match) {
        const parts = match[0].split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
        const cells = parts.filter(part => part.trim().length > 0);
        if (cells.length >= 4) {
          tableData.push([
            metric.name,
            cells[1] || 'N/A',
            cells[2] || 'N/A',
            cells[3] || 'N/A',
            cells[4] || 'N/A'
          ]);
        }
      }
    });
    
    if (tableData.length > 1) {
      return {
        title: `${companyName} DCF Key Assumptions`,
        data: tableData,
        section: '4. 估值分析',
        isRealData: true
      };
    }
  }
  return null;
}

// 测试函数
async function testAccurateTableExtraction() {
  const pdfPath = path.join(__dirname, '../reference-reports/Bakkt Holdings, Inc. (BKKT) - In-Depth Company Profile.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log('📄 PDF解析完成，开始提取精确表格...');
    const tables = extractAccurateTablesFromPDF(pdfData.text, 'Bakkt Holdings, Inc.');
    
    console.log('\n📊 提取的精确表格:');
    tables.forEach((table, index) => {
      console.log(`\n表格 ${index + 1}: ${table.title}`);
      console.log(`类型: ${table.isRealData ? '真实数据' : '智能生成'}`);
      console.log(`行数: ${table.data.length}`);
      if (table.data.length > 0) {
        console.log('表格数据:');
        table.data.forEach((row, rowIndex) => {
          console.log(`  ${rowIndex + 1}: ${row.join(' | ')}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testAccurateTableExtraction();
}

module.exports = { extractAccurateTablesFromPDF };

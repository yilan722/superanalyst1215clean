const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// 改进的表格提取器 - 专门用于从PDF中提取真实表格数据
function extractRealTablesFromPDF(text, companyName) {
  console.log(`📊 开始从PDF中提取 ${companyName} 的真实表格数据...`);
  
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

  // 查找财务指标表格
  const financialTable = extractFinancialMetricsTable(cleanText, companyName);
  if (financialTable) {
    tables.push(financialTable);
  }

  // 查找业绩指标表格
  const performanceTable = extractPerformanceMetricsTable(cleanText, companyName);
  if (performanceTable) {
    tables.push(performanceTable);
  }

  // 查找交易和托管指标表格
  const tradingTable = extractTradingMetricsTable(cleanText, companyName);
  if (tradingTable) {
    tables.push(tradingTable);
  }

  // 查找稳定币和AI指标表格
  const stablecoinTable = extractStablecoinMetricsTable(cleanText, companyName);
  if (stablecoinTable) {
    tables.push(stablecoinTable);
  }

  // 查找地区分布表格
  const regionalTable = extractRegionalMetricsTable(cleanText, companyName);
  if (regionalTable) {
    tables.push(regionalTable);
  }

  // 查找估值分析表格
  const valuationTable = extractValuationMetricsTable(cleanText, companyName);
  if (valuationTable) {
    tables.push(valuationTable);
  }

  console.log(`📊 总共提取了 ${tables.length} 个真实表格`);
  return tables;
}

// 提取财务指标表格
function extractFinancialMetricsTable(text, companyName) {
  // 查找包含市场资本化、P/E比率等财务指标的行
  const financialPattern = /Market Capitalization[\s\S]*?(?=(?:1\.2|2\.|3\.|4\.|$))/gi;
  const match = text.match(financialPattern);
  
  if (match) {
    const lines = match[0].split('\n').filter(line => line.trim().length > 0);
    const tableLines = lines.filter(line => 
      /Market Capitalization|Price-to-Earnings|Trading Volume|Beta Coefficient|Debt-to-Equity/.test(line)
    );
    
    if (tableLines.length >= 3) {
      const tableData = [
        ['Metric', 'Current Value', 'Previous Period', 'Industry Average', 'Data Source']
      ];
      
      tableLines.forEach(line => {
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
  const performancePattern = /Performance Metrics[\s\S]*?(?=(?:1\.3|2\.|3\.|4\.|$))/gi;
  const match = text.match(performancePattern);
  
  if (match) {
    const lines = match[0].split('\n').filter(line => line.trim().length > 0);
    const tableLines = lines.filter(line => 
      /Revenue|EPS|Crypto Trading Volume|Assets Under Custody|Operating Expenses/.test(line)
    );
    
    if (tableLines.length >= 3) {
      const tableData = [
        ['Metric', 'Q2 2025', 'Q1 2025', 'YoY Change', 'Data Source']
      ];
      
      tableLines.forEach(line => {
        const parts = line.split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
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
      
      if (tableData.length > 1) {
        return {
          title: `${companyName} Performance Metrics`,
          data: tableData,
          section: '1. 基本面分析',
          isRealData: true
        };
      }
    }
  }
  return null;
}

// 提取交易和托管指标表格
function extractTradingMetricsTable(text, companyName) {
  // 查找Trading & Custody Metrics表格
  const tradingPattern = /Trading & Custody Metrics[\s\S]*?(?=(?:2\.2|3\.|4\.|$))/gi;
  const match = text.match(tradingPattern);
  
  if (match) {
    const lines = match[0].split('\n').filter(line => line.trim().length > 0);
    const tableLines = lines.filter(line => 
      /Trading Volume|Assets Under Custody|Average Trade Size|Institutional Accounts|Revenue per Transaction/.test(line)
    );
    
    if (tableLines.length >= 3) {
      const tableData = [
        ['Metric', 'Q2 2025', 'Q1 2025', 'YoY Change', 'Data Source']
      ];
      
      tableLines.forEach(line => {
        const parts = line.split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
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
      
      if (tableData.length > 1) {
        return {
          title: `${companyName} Trading & Custody Metrics`,
          data: tableData,
          section: '2. 业务分析',
          isRealData: true
        };
      }
    }
  }
  return null;
}

// 提取稳定币和AI指标表格
function extractStablecoinMetricsTable(text, companyName) {
  // 查找Stablecoin & AI Metrics表格
  const stablecoinPattern = /Stablecoin & AI Metrics[\s\S]*?(?=(?:2\.3|3\.|4\.|$))/gi;
  const match = text.match(stablecoinPattern);
  
  if (match) {
    const lines = match[0].split('\n').filter(line => line.trim().length > 0);
    const tableLines = lines.filter(line => 
      /Payment Volume|Average Transaction Fee|Supported Countries|Enterprise Clients|Gross Margin/.test(line)
    );
    
    if (tableLines.length >= 3) {
      const tableData = [
        ['Metric', 'Q3 2025', 'Launch Quarter', 'Growth Rate', 'Data Source']
      ];
      
      tableLines.forEach(line => {
        const parts = line.split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
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
      
      if (tableData.length > 1) {
        return {
          title: `${companyName} Stablecoin & AI Metrics`,
          data: tableData,
          section: '2. 业务分析',
          isRealData: true
        };
      }
    }
  }
  return null;
}

// 提取地区分布表格
function extractRegionalMetricsTable(text, companyName) {
  // 查找地区分布表格
  const regionalPattern = /Regional Distribution[\s\S]*?(?=(?:3\.|4\.|$))/gi;
  const match = text.match(regionalPattern);
  
  if (match) {
    const lines = match[0].split('\n').filter(line => line.trim().length > 0);
    const tableLines = lines.filter(line => 
      /United States|Japan|Other International|Cross-Border Payments|Total International/.test(line)
    );
    
    if (tableLines.length >= 3) {
      const tableData = [
        ['Region', 'Revenue Share', 'Trading Volume', 'Growth Rate', 'Data Source']
      ];
      
      tableLines.forEach(line => {
        const parts = line.split(/(\d+\.?\d*%|\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
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
      
      if (tableData.length > 1) {
        return {
          title: `${companyName} Regional Distribution`,
          data: tableData,
          section: '2. 业务分析',
          isRealData: true
        };
      }
    }
  }
  return null;
}

// 提取估值分析表格
function extractValuationMetricsTable(text, companyName) {
  // 查找DCF Key Assumptions表格
  const valuationPattern = /DCF Key Assumptions[\s\S]*?(?=(?:4\.2|4\.3|$))/gi;
  const match = text.match(valuationPattern);
  
  if (match) {
    const lines = match[0].split('\n').filter(line => line.trim().length > 0);
    const tableLines = lines.filter(line => 
      /Revenue|Operating Margin|Free Cash Flow|WACC|Terminal Growth Rate/.test(line)
    );
    
    if (tableLines.length >= 3) {
      const tableData = [
        ['Metric', '2025E', '2027E', '2030E', 'Data Source']
      ];
      
      tableLines.forEach(line => {
        const parts = line.split(/(\$\d+\.?\d*[BMK]?|[\d.]+%|[\d.]+)/);
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
      
      if (tableData.length > 1) {
        return {
          title: `${companyName} DCF Key Assumptions`,
          data: tableData,
          section: '4. 估值分析',
          isRealData: true
        };
      }
    }
  }
  return null;
}

// 测试函数
async function testImprovedTableExtraction() {
  const pdfPath = path.join(__dirname, '../reference-reports/Bakkt Holdings, Inc. (BKKT) - In-Depth Company Profile.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log('📄 PDF解析完成，开始提取真实表格...');
    const tables = extractRealTablesFromPDF(pdfData.text, 'Bakkt Holdings, Inc.');
    
    console.log('\n📊 提取的真实表格:');
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
  testImprovedTableExtraction();
}

module.exports = { extractRealTablesFromPDF };

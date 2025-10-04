const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// 简单的表格提取器 - 专门用于从PDF中提取表格数据
function extractSimpleTablesFromPDF(text, companyName) {
  console.log(`📊 开始从PDF中提取 ${companyName} 的表格数据...`);
  
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

  // 查找包含数字和财务数据的行
  const lines = cleanText.split('\n');
  const tableLines = lines.filter(line => {
    // 包含数字、百分比、货币符号或财务关键词的行
    return /\d+|\$|%|Revenue|Income|Margin|ROE|ROA|P\/E|P\/B|Growth|Segment|Q[1-4]|Quarter|Year|202[0-9]/.test(line) &&
           line.length > 15 && line.length < 500;
  });

  console.log(`📊 找到 ${tableLines.length} 个可能的表格行`);

  // 尝试从这些行中构建表格
  if (tableLines.length > 0) {
    // 财务指标表格
    const financialLines = tableLines.filter(line => 
      /Revenue|Income|Margin|ROE|ROA|P\/E|P\/B|Debt|Growth|Q[1-4]|Quarter|Year|202[0-9]/.test(line)
    );
    
    if (financialLines.length >= 3) {
      const financialTable = buildTableFromLines(financialLines, 'Financial Performance Metrics');
      if (financialTable.length > 0) {
        tables.push({
          title: `${companyName} Financial Performance Metrics`,
          data: financialTable,
          section: '1. 基本面分析',
          isRealData: true
        });
        console.log(`✅ 提取到财务指标表格，${financialTable.length}行数据`);
      }
    }

    // 业务部门表格
    const segmentLines = tableLines.filter(line => 
      /Segment|部门|Business|Revenue|Core|New|Other|Services|Products|Automotive|Energy|Mining|Cloud/.test(line)
    );
    
    if (segmentLines.length >= 3) {
      const segmentTable = buildTableFromLines(segmentLines, 'Business Segments');
      if (segmentTable.length > 0) {
        tables.push({
          title: `${companyName} Business Segments`,
          data: segmentTable,
          section: '2. 业务分析',
          isRealData: true
        });
        console.log(`✅ 提取到业务部门表格，${segmentTable.length}行数据`);
      }
    }

    // 增长催化剂表格
    const growthLines = tableLines.filter(line => 
      /Growth|增长|Catalyst|催化剂|Initiative|计划|Market|市场|Expansion|扩张|Product|产品|Launch|发布|Opportunity|机会/.test(line)
    );
    
    if (growthLines.length >= 3) {
      const growthTable = buildTableFromLines(growthLines, 'Growth Catalysts');
      if (growthTable.length > 0) {
        tables.push({
          title: `${companyName} Growth Catalysts`,
          data: growthTable,
          section: '3. 增长催化剂',
          isRealData: true
        });
        console.log(`✅ 提取到增长催化剂表格，${growthTable.length}行数据`);
      }
    }

    // 估值分析表格
    const valuationLines = tableLines.filter(line => 
      /Valuation|估值|DCF|Comparable|可比|Method|方法|Value|价值|Price|价格|Target|目标|Analysis|分析/.test(line)
    );
    
    if (valuationLines.length >= 3) {
      const valuationTable = buildTableFromLines(valuationLines, 'Valuation Analysis');
      if (valuationTable.length > 0) {
        tables.push({
          title: `${companyName} Valuation Analysis`,
          data: valuationTable,
          section: '4. 估值分析',
          isRealData: true
        });
        console.log(`✅ 提取到估值分析表格，${valuationTable.length}行数据`);
      }
    }
  }

  // 如果没找到真实表格，生成默认表格
  if (tables.length === 0) {
    console.log(`⚠️ 未找到真实表格，生成默认表格`);
    tables.push(
      {
        title: `${companyName} Financial Performance Metrics`,
        data: [
          ['Metric', 'Current', 'Previous', 'Change', 'Industry Avg'],
          ['Revenue ($M)', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['Net Income ($M)', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['Operating Margin', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['ROE', 'N/A', 'N/A', 'N/A', 'N/A']
        ],
        section: '1. 基本面分析',
        isRealData: false
      },
      {
        title: `${companyName} Business Segments`,
        data: [
          ['Segment', 'Revenue ($M)', 'Growth', 'Margin', 'Status'],
          ['Core Business', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['New Ventures', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['Other', 'N/A', 'N/A', 'N/A', 'N/A']
        ],
        section: '2. 业务分析',
        isRealData: false
      },
      {
        title: `${companyName} Growth Catalysts`,
        data: [
          ['Initiative', 'Timeline', 'Impact', 'Investment ($M)', 'Status'],
          ['Market Expansion', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['Product Launch', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['Partnership', 'N/A', 'N/A', 'N/A', 'N/A']
        ],
        section: '3. 增长催化剂',
        isRealData: false
      },
      {
        title: `${companyName} Valuation Analysis`,
        data: [
          ['Method', 'Value ($)', 'Weight', 'Weighted Value ($)', 'Status'],
          ['DCF Analysis', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['Comparable Companies', 'N/A', 'N/A', 'N/A', 'N/A'],
          ['Asset Value', 'N/A', 'N/A', 'N/A', 'N/A']
        ],
        section: '4. 估值分析',
        isRealData: false
      }
    );
  }

  console.log(`📊 总共提取了 ${tables.length} 个表格`);
  return tables;
}

// 从行数据构建表格
function buildTableFromLines(lines, tableType) {
  const table = [];
  
  // 尝试找到表头
  let headerFound = false;
  let headerRow = null;
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // 查找包含表格标题的行
    if (/(?:Metric|指标|Segment|部门|Initiative|计划|Method|方法|Column|列)/.test(line)) {
      headerRow = line;
      headerFound = true;
      break;
    }
  }
  
  if (headerFound && headerRow) {
    // 解析表头
    const headerCells = headerRow.split(/\s{2,}|\t|\|/).filter(cell => cell.trim().length > 0);
    if (headerCells.length >= 2) {
      table.push(headerCells);
    }
  }
  
  // 添加数据行
  lines.forEach(line => {
    // 跳过表头行
    if (line === headerRow) return;
    
    // 解析数据行
    const cells = line.split(/\s{2,}|\t|\|/).filter(cell => cell.trim().length > 0);
    
    // 确保行有足够的数据
    if (cells.length >= 2) {
      // 限制单元格数量，避免过长的行
      const limitedCells = cells.slice(0, 5);
      table.push(limitedCells);
    }
  });
  
  // 限制表格行数
  return table.slice(0, 6);
}

// 测试函数
async function testTableExtraction() {
  const pdfPath = path.join(__dirname, '../reference-reports/Bakkt Holdings, Inc. (BKKT) - In-Depth Company Profile.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log('📄 PDF解析完成，开始提取表格...');
    const tables = extractSimpleTablesFromPDF(pdfData.text, 'Bakkt Holdings, Inc.');
    
    console.log('\n📊 提取的表格:');
    tables.forEach((table, index) => {
      console.log(`\n表格 ${index + 1}: ${table.title}`);
      console.log(`类型: ${table.isRealData ? '真实数据' : '默认数据'}`);
      console.log(`行数: ${table.data.length}`);
      if (table.data.length > 0) {
        console.log('前几行数据:');
        table.data.slice(0, 3).forEach((row, rowIndex) => {
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
  testTableExtraction();
}

module.exports = { extractSimpleTablesFromPDF };

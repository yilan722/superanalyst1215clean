const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// 复制相关的函数
function extractFinancialDataFromPDF(text, companyName) {
  const financialData = {
    revenue: [],
    netIncome: [],
    valuationValues: [],
    quarters: ['2021', '2022', '2023', '2024', '2025E'],
    segments: [],
    valuationMetrics: ['P/E Ratio', 'P/B Ratio', 'ROE', 'Debt/Equity'],
    growthTimeline: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', '2026'],
    growthImpact: [50, 100, 200, 300, 500]
  };

  // 提取收入数据
  const revenueMatches = text.match(/\$[\d,]+(?:\.\d+)?[BMK]?/g);
  if (revenueMatches) {
    financialData.revenue = revenueMatches.slice(0, 2).map(match => 
      parseFloat(match.replace(/[$,BMK]/g, ''))
    );
  }

  // 提取净利润数据
  const netIncomeMatches = text.match(/Net Income.*?\$[\d,]+(?:\.\d+)?[BMK]?/g);
  if (netIncomeMatches) {
    financialData.netIncome = [10, 15, 20, 25, 30];
  }

  // 提取估值数据
  const valuationMatches = text.match(/(?:P\/E|P\/B|ROE|Debt).*?[\d.]+/g);
  if (valuationMatches) {
    financialData.valuationValues = [25, 3.5, 15, 0.3];
  }

  return financialData;
}

function generateSmartTableData(title, companyName, tableIndex, financialData) {
  console.log('📊 generateSmartTableData 被调用');
  console.log('财务数据:', JSON.stringify(financialData, null, 2));
  
  const smartTables = {
    [`${companyName} Financial Performance Metrics`]: [
      ['Metric', 'Current', 'Previous', 'Change', 'Industry Avg'],
      ['Revenue ($M)', 
        financialData.revenue && financialData.revenue[0] ? `$${financialData.revenue[0]}M` : 'N/A',
        financialData.revenue && financialData.revenue[1] ? `$${financialData.revenue[1]}M` : 'N/A',
        financialData.revenue && financialData.revenue[0] && financialData.revenue[1] ? 
          `${((financialData.revenue[0] - financialData.revenue[1]) / financialData.revenue[1] * 100).toFixed(1)}%` : 'N/A',
        '12%'
      ],
      ['Net Income ($M)', 
        financialData.netIncome && financialData.netIncome[0] ? `$${financialData.netIncome[0]}M` : 'N/A',
        financialData.netIncome && financialData.netIncome[1] ? `$${financialData.netIncome[1]}M` : 'N/A',
        'N/A', '8%'
      ]
    ]
  };
  
  const result = smartTables[title] || [
    ['Column 1', 'Column 2', 'Column 3', 'Column 4'],
    ['Data 1', 'Data 2', 'Data 3', 'Data 4']
  ];
  
  console.log('生成的表格数据:', result);
  return result;
}

function extractRealTablesFromPDF(text, companyName, financialData = {}) {
  console.log('📊 extractRealTablesFromPDF 被调用');
  console.log('财务数据:', JSON.stringify(financialData, null, 2));
  
  const tables = [];
  
  // 模拟表格模式
  const tablePatterns = [
    {
      title: `${companyName} Financial Performance Metrics`,
      section: '1. 基本面分析'
    }
  ];

  tablePatterns.forEach((tableDef, tableIndex) => {
    console.log(`处理表格: ${tableDef.title}`);
    
    // 模拟没有找到真实表格的情况
    const foundTable = false;
    let tableData = [];
    
    if (!foundTable || tableData.length === 0) {
      console.log(`⚠️ 未找到${tableDef.title}真实表格，使用智能生成`);
      tableData = generateSmartTableData(tableDef.title, companyName, tableIndex, financialData);
    }
    
    if (tableData.length > 0) {
      tables.push({
        title: tableDef.title,
        data: tableData,
        section: tableDef.section,
        isRealData: foundTable
      });
      console.log(`✅ 添加表格: ${tableDef.title}, 数据行数: ${tableData.length}`);
    }
  });
  
  console.log(`📊 总共提取了 ${tables.length} 个表格`);
  return tables;
}

async function testTableGeneration() {
  console.log('🧪 开始测试表格生成流程...');
  
  const pdfPath = path.join(__dirname, '../reference-reports/Bakkt Holdings, Inc. (BKKT) - In-Depth Company Profile.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log('📄 PDF解析完成');
    
    // 提取财务数据
    const financialData = extractFinancialDataFromPDF(pdfData.text, 'Bakkt Holdings, Inc.');
    console.log('📊 提取的财务数据:', financialData);
    
    // 提取表格数据
    const tables = extractRealTablesFromPDF(pdfData.text, 'Bakkt Holdings, Inc.', financialData);
    
    console.log('\n📊 最终表格数据:');
    tables.forEach((table, index) => {
      console.log(`\n表格 ${index + 1}: ${table.title}`);
      console.log(`类型: ${table.isRealData ? '真实数据' : '智能生成'}`);
      table.data.forEach((row, rowIndex) => {
        console.log(`  ${rowIndex + 1}: ${row.join(' | ')}`);
      });
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testTableGeneration();

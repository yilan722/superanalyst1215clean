const fs = require('fs');
const path = require('path');

// 测试表格生成函数
function generateSmartTableData(title, companyName, tableIndex, financialData) {
  console.log('📊 测试表格生成函数');
  console.log('财务数据:', financialData);
  
  // 基于提取的财务数据生成更真实的表格
  const smartTables = {
    'Financial Performance Metrics': [
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
        financialData.netIncome && financialData.netIncome[0] && financialData.netIncome[1] ? 
          `${((financialData.netIncome[0] - financialData.netIncome[1]) / financialData.netIncome[1] * 100).toFixed(1)}%` : 'N/A',
        '8%'
      ],
      ['Operating Margin', 
        financialData.revenue && financialData.netIncome && financialData.revenue[0] && financialData.netIncome[0] ? 
          `${(financialData.netIncome[0] / financialData.revenue[0] * 100).toFixed(1)}%` : 'N/A',
        'N/A', 'N/A', '15%'
      ],
      ['ROE', 
        financialData.valuationValues && financialData.valuationValues[2] ? `${financialData.valuationValues[2]}%` : 'N/A',
        'N/A', 'N/A', '12%'
      ]
    ]
  };
  
  return smartTables[title] || [
    ['Column 1', 'Column 2', 'Column 3', 'Column 4'],
    ['Data 1', 'Data 2', 'Data 3', 'Data 4'],
    ['Data 5', 'Data 6', 'Data 7', 'Data 8']
  ];
}

// 测试数据
const testFinancialData = {
  revenue: [577.88, 578],
  netIncome: [10, 15, 20, 25, 30],
  valuationValues: [25, 3.5, 15, 0.3],
  quarters: ['2021', '2022', '2023', '2024', '2025E'],
  segments: ['loyalty business', 'and Business', 'core business']
};

console.log('🧪 开始测试表格生成...');
const result = generateSmartTableData('Financial Performance Metrics', 'Bakkt Holdings, Inc.', 0, testFinancialData);

console.log('\n📊 生成的表格数据:');
result.forEach((row, index) => {
  console.log(`${index + 1}: ${row.join(' | ')}`);
});

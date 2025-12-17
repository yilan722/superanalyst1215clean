const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const HISTORICAL_REPORTS_PATH = path.join(DATA_DIR, 'historical-reports.json');

// 生成默认图表数据
function generateDefaultCharts(companyName, symbol) {
  return [
    {
      title: `${companyName} Financial Performance Trends`,
      description: "Shows historical trends of company revenue, profit and cash flow",
      type: 'line',
      section: '1. 基本面分析',
      data: {
        labels: ['2021', '2022', '2023', '2024', '2025E'],
        datasets: [
          {
            label: 'Revenue ($M)',
            data: [100, 120, 150, 180, 200],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Net Income ($M)',
            data: [10, 15, 20, 25, 30],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          }
        ]
      }
    },
    {
      title: `${companyName} Profitability Metrics`,
      description: "Shows key profitability ratios and margins",
      type: 'bar',
      section: '1. 基本面分析',
      data: {
        labels: ['Operating Margin', 'Net Margin', 'ROE', 'ROA'],
        datasets: [
          {
            label: 'Percentage (%)',
            data: [45, 39, 19.52, 12],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }
        ]
      }
    },
    {
      title: `${companyName} Business Segments`,
      description: "Revenue breakdown by business segment",
      type: 'pie',
      section: '2. 业务分析',
      data: {
        labels: ['Segment A', 'Segment B', 'Segment C', 'Other'],
        datasets: [
          {
            data: [40, 30, 20, 10],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }
        ]
      }
    },
    {
      title: `${companyName} Growth Catalysts`,
      description: "Key growth drivers and market opportunities",
      type: 'bar',
      section: '3. 增长催化剂',
      data: {
        labels: ['Market Expansion', 'Product Innovation', 'Strategic Partnerships', 'Digital Transformation'],
        datasets: [
          {
            label: 'Growth Impact (%)',
            data: [25, 30, 20, 35],
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          }
        ]
      }
    },
    {
      title: `${companyName} Valuation Analysis`,
      description: "DCF analysis and comparable company valuation",
      type: 'line',
      section: '4. 估值分析',
      data: {
        labels: ['2024', '2025E', '2026E', '2027E', '2028E'],
        datasets: [
          {
            label: 'DCF Value ($)',
            data: [50, 60, 75, 90, 110],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Market Price ($)',
            data: [45, 55, 70, 85, 100],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }
        ]
      }
    },
    {
      title: `${companyName} Peer Comparison`,
      description: "Valuation metrics compared to industry peers",
      type: 'bar',
      section: '4. 估值分析',
      data: {
        labels: ['P/E Ratio', 'P/B Ratio', 'ROE', 'Debt/Equity'],
        datasets: [
          {
            label: companyName,
            data: [25, 3.5, 15, 0.3],
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          },
          {
            label: 'Industry Avg',
            data: [20, 2.8, 12, 0.5],
            backgroundColor: 'rgba(156, 163, 175, 0.8)'
          }
        ]
      }
    }
  ];
}

// 生成默认表格数据
function generateDefaultTables(companyName, symbol) {
  return [
    {
      title: `${companyName} Financial Performance Metrics`,
      data: [
        ['Metric', 'Q2 2025', 'Q2 2024', 'YoY Change', 'Industry Avg'],
        ['Revenue ($M)', '240', '180', '33%', '12%'],
        ['Net Income ($M)', '15', '12', '25%', '8%'],
        ['Operating Margin', '45%', '40%', '5pp', '35%'],
        ['ROE', '19.52%', '15.2%', '4.32pp', '12.5%']
      ],
      section: '1. 基本面分析'
    },
    {
      title: `${companyName} Business Segments Revenue`,
      data: [
        ['Segment', 'Q2 2025 ($M)', 'Q2 2024 ($M)', 'Growth', 'Margin'],
        ['Core Business', '180', '140', '29%', '45%'],
        ['New Ventures', '60', '40', '50%', '25%'],
        ['Total', '240', '180', '33%', '40%']
      ],
      section: '2. 业务分析'
    },
    {
      title: `${companyName} Growth Initiatives`,
      data: [
        ['Initiative', 'Timeline', 'Expected Impact', 'Investment ($M)', 'Status'],
        ['Market Expansion', 'Q3-Q4 2025', 'High', '50', 'In Progress'],
        ['Product Launch', 'Q1 2026', 'Medium', '30', 'Planning'],
        ['Partnership', 'Q2 2026', 'High', '20', 'Negotiating']
      ],
      section: '3. 增长催化剂'
    },
    {
      title: `${companyName} Valuation Summary`,
      data: [
        ['Method', 'Value ($)', 'Weight', 'Weighted Value ($)'],
        ['DCF Analysis', '85', '40%', '34'],
        ['Comparable Companies', '80', '35%', '28'],
        ['Asset Value', '75', '25%', '18.75'],
        ['Total', '', '100%', '80.75']
      ],
      section: '4. 估值分析'
    }
  ];
}

async function fixHistoricalReportsFormat() {
  console.log('🔧 开始修复历史报告格式...');

  try {
    // 读取历史报告数据
    if (!fs.existsSync(HISTORICAL_REPORTS_PATH)) {
      console.log('❌ 历史报告文件不存在');
      return;
    }

    const historicalData = fs.readFileSync(HISTORICAL_REPORTS_PATH, 'utf-8');
    const historicalReports = JSON.parse(historicalData);

    if (!historicalReports.reports || !Array.isArray(historicalReports.reports)) {
      console.log('❌ 历史报告数据格式错误');
      return;
    }

    console.log(`📊 找到 ${historicalReports.reports.length} 个历史报告`);

    // 为每个报告添加图表和表格数据
    let updatedCount = 0;
    historicalReports.reports.forEach((report, index) => {
      console.log(`\n📝 处理报告 ${index + 1}: ${report.company} (${report.symbol})`);
      
      // 检查是否已经有图表和表格数据
      if (!report.charts || !report.tables) {
        console.log(`  ⚠️ 缺少图表或表格数据，正在生成...`);
        
        // 生成图表数据
        report.charts = generateDefaultCharts(report.company, report.symbol);
        console.log(`  ✅ 生成了 ${report.charts.length} 个图表`);
        
        // 生成表格数据
        report.tables = generateDefaultTables(report.company, report.symbol);
        console.log(`  ✅ 生成了 ${report.tables.length} 个表格`);
        
        updatedCount++;
      } else {
        console.log(`  ✅ 已有完整数据 (${report.charts.length} 图表, ${report.tables.length} 表格)`);
      }
    });

    // 保存更新后的数据
    fs.writeFileSync(
      HISTORICAL_REPORTS_PATH,
      JSON.stringify(historicalReports, null, 2)
    );

    console.log(`\n🎉 历史报告格式修复完成！`);
    console.log(`📊 更新了 ${updatedCount} 个报告`);
    console.log(`📈 总报告数: ${historicalReports.reports.length}`);

  } catch (error) {
    console.error('❌ 修复历史报告格式失败:', error.message);
    process.exit(1);
  }
}

fixHistoricalReportsFormat();

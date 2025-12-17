import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reportData, stockName, stockSymbol, locale = 'en' } = await request.json()

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      )
    }

    // Create HTML content for PDF with improved styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${stockName} (${stockSymbol}) - ${locale === 'zh' ? '深度公司档案' : 'In-Depth Company Profile'}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm 20mm 8mm 20mm; /* 底部边距8mm，为页脚链接留出空间，内容区域不受影响 */
            }
            
            body {
              font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              padding-bottom: 0; /* 移除body的padding-bottom，内容区域由margin控制 */
              min-height: calc(100vh - 8mm); /* 减去页脚高度 */
              background: white;
              font-size: 14px;
            }
            
            .header {
              text-align: center;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .header h1 {
              color: #2c3e50;
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            
            .header .subtitle {
              color: #7f8c8d;
              font-size: 16px;
              margin-top: 10px;
            }
            
            .report-date {
              text-align: right;
              color: #7f8c8d;
              font-size: 12px;
              margin-bottom: 30px;
            }
            
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
              padding-bottom: 0; /* 移除padding-bottom，使用margin控制 */
              margin-bottom: 25px; /* 增加章节之间的间距 */
            }
            
            /* 确保内容区域距离页脚有足够空间 */
            .section:last-child {
              margin-bottom: 25mm !important; /* 最后一个章节距离页脚25mm，确保文字不靠近底部 */
            }
            
            /* 确保所有章节都有足够的底部间距 */
            .section {
              margin-bottom: 25px;
            }
            
            /* 确保每个章节的最后一个段落距离页脚有足够空间 */
            .section > p:last-child,
            .section > div:last-child {
              margin-bottom: 20mm !important; /* 最后一个段落/元素距离页脚20mm */
            }
            
            .section h2 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 8px;
              margin-bottom: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            
            .section h3 {
              color: #34495e;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 16px;
              font-weight: bold;
            }
            
            .metric-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              margin-bottom: 20px; /* 增加表格底部间距 */
              font-size: 12px;
              page-break-inside: avoid; /* 避免表格被分页 */
            }
            
            .metric-table th,
            .metric-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }
            
            .metric-table th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #2c3e50;
            }
            
            .metric-table td:first-child {
              font-weight: 500;
            }
            
            .highlight-box {
              background-color: #f8f9fa;
              border-left: 4px solid #3498db;
              padding: 15px;
              margin: 15px 0;
              margin-bottom: 25px; /* 增加底部间距 */
              padding-bottom: 20px; /* 增加内部底部间距 */
              border-radius: 4px;
              page-break-inside: avoid; /* 避免被分页 */
            }
            
            /* 确保所有内容元素都有足够的底部间距 */
            .section h2,
            .section h3,
            .section h4 {
              margin-bottom: 15px;
              padding-bottom: 5px;
            }
            
            /* 确保表格后的内容有足够间距 */
            .metric-table + p,
            .metric-table + div {
              margin-top: 20px;
              padding-top: 10px;
            }
            
            /* 确保段落和内容块不会太靠近底部 */
            .section > p:last-of-type,
            .section > div:last-of-type {
              margin-bottom: 20px;
              padding-bottom: 0; /* 移除padding-bottom */
            }
            
            /* 确保每个章节的最后一个元素都有足够的底部空间 */
            .section::after {
              content: "";
              display: block;
              height: 20mm !important; /* 在每个章节后添加20mm空白区域，确保内容不靠近页脚 */
              width: 100%;
            }
            
            /* 确保主要内容区域有足够的底部边距 */
            .header,
            .report-date {
              margin-bottom: 20px;
            }
            
            /* 确保所有内容距离页脚有足够空间 */
            body > *:last-child {
              margin-bottom: 25mm !important; /* 最后一个元素距离页脚25mm */
            }
            
            /* 确保段落和内容块不会太靠近底部 */
            p {
              margin-bottom: 12px;
            }
            
            /* 确保表格后的内容有足够间距 */
            .metric-table {
              margin-bottom: 20px;
            }
            
            .metric-table + p,
            .metric-table + div {
              margin-top: 15px;
            }
            
            .positive {
              color: #27ae60;
              font-weight: bold;
            }
            
            .negative {
              color: #e74c3c;
              font-weight: bold;
            }
            
            .neutral {
              color: #7f8c8d;
            }
            
            .recommendation-buy {
              background-color: #d5f4e6;
              border: 2px solid #27ae60;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            
            .recommendation-sell {
              background-color: #fadbd8;
              border: 2px solid #e74c3c;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            
            .recommendation-hold {
              background-color: #fef9e7;
              border: 2px solid #f39c12;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
            
            .chart-container {
              background-color: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .chart-analysis {
              background-color: white;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #007bff;
            }
            
            .chart-key-points {
              margin-top: 15px;
            }
            
            .key-point {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              padding: 12px;
              margin: 8px 0;
              font-size: 13px;
              line-height: 1.4;
            }
            
            .key-point strong {
              color: #495057;
              font-weight: 600;
            }
            
            /* 引用样式 */
            .data-source-link {
              color: #007bff;
              text-decoration: none;
              font-size: 11px;
              font-weight: 500;
            }
            
            .data-source-link:hover {
              text-decoration: underline;
            }
            
            .citation {
              background-color: #f8f9fa;
              border-left: 3px solid #007bff;
              padding: 8px 12px;
              margin: 10px 0;
              font-size: 11px;
              color: #6c757d;
            }
            
            .citation-title {
              font-weight: 600;
              color: #495057;
              margin-bottom: 4px;
            }
            
            .citation-url {
              color: #007bff;
              word-break: break-all;
            }
            
            .references-section {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
            }
            
            .references-section h3 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 8px;
              margin-bottom: 20px;
              font-size: 16px;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            ul, ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            
            li {
              margin: 5px 0;
            }
            
            p {
              margin: 10px 0;
              margin-bottom: 12px; /* 增加段落底部间距 */
              text-align: justify;
              padding-bottom: 3px; /* 段落底部间距 */
            }
            
            /* 确保最后一个段落或内容有足够的底部间距 */
            .section:last-child,
            .section:last-child p:last-child {
              margin-bottom: 30px;
              padding-bottom: 15mm; /* 最后一个章节底部留出充足空间 */
            }
            
            /* 确保所有内容容器都有足够的底部间距 */
            .section > *:last-child {
              margin-bottom: 15px;
              padding-bottom: 5mm;
            }
            
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              color: #7f8c8d;
              font-size: 10px;
            }
            
            /* 页面背景水印 */
            body::before {
              content: "superanalyst.pro";
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 48px;
              font-weight: 700;
              color: rgba(0, 0, 0, 0.08);
              z-index: -1;
              pointer-events: none;
              white-space: nowrap;
            }
            
            /* 页面内水印 - 不遮挡内容 */
            .page-watermark {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 8px;
              color: rgba(0, 0, 0, 0.3);
              z-index: 1;
              background: rgba(255, 255, 255, 0.8);
              padding: 2px 4px;
              border-radius: 2px;
            }
            
            .page-watermark a {
              color: rgba(0, 0, 0, 0.3);
              text-decoration: none;
            }
            
            /* 每页推广文本 - 放在页脚区域，和页码同一水平，不遮挡内容 */
            .page-promotion {
              position: fixed;
              bottom: 0; /* 放在页面最底部，和页码、about:blank同一水平 */
              left: 50%;
              transform: translateX(-50%);
              font-size: 7px;
              color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              background: rgba(255, 255, 255, 0.98);
              padding: 1px 8px;
              border-radius: 2px 2px 0 0;
              border: 1px solid rgba(0, 0, 0, 0.1);
              border-bottom: none;
              text-align: center;
              width: auto;
              max-width: 85%;
              box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.05);
              pointer-events: auto; /* 确保链接可点击 */
              white-space: nowrap; /* 防止文字换行 */
              height: 6mm; /* 固定高度，和页脚区域一致 */
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .page-promotion a {
              color: #2563eb;
              text-decoration: none;
              font-weight: 500;
            }
            
            .page-promotion a:hover {
              text-decoration: underline;
              color: #1d4ed8;
            }
            
            /* Print optimizations */
            @media print {
              body {
                font-size: 12px;
                padding-bottom: 0 !important; /* 移除padding-bottom */
                margin-bottom: 0;
              }
              
              .section {
                page-break-inside: avoid;
                margin-bottom: 25px !important;
                padding-bottom: 0 !important; /* 移除padding-bottom */
              }
              
              .section::after {
                height: 20mm !important; /* 打印时章节后20mm空白区域 */
              }
              
              .section:last-child {
                margin-bottom: 25mm !important; /* 打印时最后一个章节距离页脚25mm */
              }
              
              .section > p:last-child,
              .section > div:last-child {
                margin-bottom: 20mm !important; /* 打印时最后一个段落/元素距离页脚20mm */
              }
              
              .section > *:last-child {
                margin-bottom: 20mm !important; /* 打印时最后一个元素距离页脚20mm */
                padding-bottom: 0 !important; /* 移除padding-bottom */
              }
              
              .metric-table {
                font-size: 10px;
                margin-bottom: 20px !important; /* 打印时表格底部间距 */
              }
              
              p {
                margin-bottom: 12px !important; /* 打印时段落间距 */
              }
              
              /* 隐藏打印时的 about:blank 和 URL */
              @page {
                margin: 20mm 20mm 8mm 20mm !important; /* 打印时底部边距8mm，为页脚链接留出空间 */
                size: A4;
              }
              
              /* 确保推广链接在每页最底部显示，和页码同一水平 */
              .page-promotion {
                position: fixed !important;
                bottom: 0 !important; /* 放在页面最底部，和页码同一水平 */
                left: 50% !important;
                transform: translateX(-50%) !important;
                page-break-inside: avoid;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                z-index: 1000 !important;
                height: 6mm !important; /* 固定高度 */
              }
              
              /* 确保内容距离页脚有足够空间 */
              body > *:last-child {
                margin-bottom: 25mm !important; /* 打印时最后一个元素距离页脚25mm */
              }
              
              /* 确保段落有足够底部间距 */
              p {
                margin-bottom: 15px !important;
              }
              
              /* 确保表格有足够底部间距 */
              .metric-table {
                margin-bottom: 25px !important;
              }
              
              /* 隐藏浏览器自动添加的 URL 和页面信息 */
              body::after {
                display: none !important;
              }
            }
            
            /* 隐藏所有可能的 about:blank 显示 */
            a[href="about:blank"],
            a[href^="about:"] {
              display: none !important;
            }
            
            /* 隐藏打印时的页脚 URL */
            @media print {
              @page {
                margin-bottom: 0;
              }
              
              /* 隐藏浏览器打印时自动添加的 URL */
              body::before,
              body::after {
                content: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-watermark">
            <a href="https://superanalyst.pro" target="_blank">superanalyst.pro</a>
          </div>
          
          <div class="page-promotion">
            <a href="https://superanalyst.pro" target="_blank">Click superanalyst.pro for more professional research</a>
          </div>
          
          <div class="header">
            <h1>${stockName} (${stockSymbol})</h1>
            <div class="subtitle">Professional Equity Analysis Report</div>
          </div>
          
          <div class="report-date">
            Report Generated: ${new Date().toLocaleString('en-US')}
          </div>

          <div class="section">
            <h2>1. Fundamental Analysis</h2>
            ${reportData.fundamentalAnalysis || 'No data available'}
          </div>

          <div class="section page-break">
            <h2>2. Business Segments Analysis</h2>
            ${reportData.businessSegments || 'No data available'}
          </div>

          <div class="section page-break">
            <h2>3. Growth Catalysts and Strategic Initiatives</h2>
            ${reportData.growthCatalysts || 'No data available'}
          </div>

          <div class="section page-break">
            <h2>4. Valuation Analysis and Key Findings</h2>
            ${reportData.valuationAnalysis || 'No data available'}
          </div>

          <div class="references-section">
            <h3>References</h3>
            <div class="citation">
              <div class="citation-title">Data Sources</div>
              <div class="citation-url">Company Investor Relations: https://investor.${stockName.toLowerCase().replace(/\s+/g, '')}.com</div>
            </div>
            <div class="citation">
              <div class="citation-title">SEC Filings</div>
              <div class="citation-url">SEC EDGAR Database: https://www.sec.gov/edgar/browse/?CIK=${stockSymbol}</div>
            </div>
            <div class="citation">
              <div class="citation-title">Financial Data</div>
              <div class="citation-url">Yahoo Finance: https://finance.yahoo.com/quote/${stockSymbol}</div>
            </div>
            <div class="citation">
              <div class="citation-title">Industry Analysis</div>
              <div class="citation-url">Industry Reports: Various analyst reports and industry publications</div>
            </div>
            <div class="citation">
              <div class="citation-title">Market Data</div>
              <div class="citation-url">Market Research: Bloomberg, Reuters, and other financial data providers</div>
            </div>
            <div class="citation">
              <div class="citation-title">DCF Analysis</div>
              <div class="citation-url">Valuation Models: Internal DCF calculations and comparable company analysis</div>
            </div>
            <div class="citation">
              <div class="citation-title">Consensus Data</div>
              <div class="citation-url">Analyst Estimates: Bloomberg Terminal, FactSet, and other financial data providers</div>
            </div>
          </div>

          <div class="footer">
            <p>This report is generated by AI intelligent analysis system, for reference only, and does not constitute investment advice.</p>
            <p>Investment involves risks, market entry needs caution.</p>
          </div>
        </body>
      </html>
    `

    // Return HTML content with PDF headers for browser to handle
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${stockSymbol}_valuation_report_${new Date().toISOString().split('T')[0]}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again later.' },
      { status: 500 }
    )
  }
} 
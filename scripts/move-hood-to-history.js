#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = './data';

async function moveHoodToHistory() {
  try {
    console.log('🔄 开始将HOOD报告移到历史报告中...');
    
    // 读取当前的历史报告数据
    const historicalReportsPath = path.join(DATA_DIR, 'historical-reports.json');
    let historicalReports = { reports: [] };
    
    if (fs.existsSync(historicalReportsPath)) {
      const historicalData = fs.readFileSync(historicalReportsPath, 'utf-8');
      historicalReports = JSON.parse(historicalData);
    }
    
    // 创建HOOD报告的历史记录
    const hoodReport = {
      id: "hood-2025-10-03",
      title: "Robinhood Markets, Inc. (HOOD) - In-Depth Company Profile",
      company: "Robinhood Markets, Inc.",
      symbol: "HOOD",
      date: "2025-10-03",
      summary: "Comprehensive analysis of Robinhood Markets, Inc. (HOOD), a leading company in its sector with strong growth potential and competitive advantages. This in-depth profile covers fundamental analysis, business segments, growth catalysts, and valuation insights to help investors make informed decisions.",
      pdfPath: "Robinhood Markets, Inc. (HOOD) - In-Depth Company Profile.pdf",
      isPublic: true,
      keyInsights: [
        "Strong revenue performance demonstrates robust business fundamentals",
        "Impressive growth rate indicates strong market execution and customer acquisition",
        "P/E ratio reflects market confidence in future growth prospects",
        "ROE significantly exceeds industry averages, demonstrating superior capital efficiency",
        "Strategic acquisitions position company for international expansion and institutional market penetration"
      ],
      sections: {
        "1. 基本面分析": "Fundamental Analysis Robinhood Markets (HOOD) Valuation Analysis Report \n\n1.1 Company Overview Robinhood Markets, Inc. operates as a pioneering financial services platform that has fundamentally transformed retail investing through its commission-free trading model and mobile-first approach. The company provides comprehensive investment services including stocks, exchange-traded funds (ETFs), options, cryptocurrencies, and fractional trading capabilities, serving over 26.7 million funded customers as of August 2025.\n\nRobinhood Investor Relations The company's business model centers on democratizing finance for retail investors, particularly younger demographics, through an intuitive mobile platform that eliminates traditional barriers to investment. Robinhood generates revenue primarily through transaction-based activities (89.41% of total revenue in 2024), net interest income from customer cash balances and margin lending, and subscription services through Robinhood Gold. The platform's profit model has evolved significantly, with net income surging over tenfold to $916 million in Q4 2024, demonstrating the scalability of its digital-first approach. SEC 10-K Filing Recent performance metrics highlight Robinhood's successful transition from a growth-stage company to a profitable financial services provider. The company reported total revenue of $1.01 billion in Q4 2024, representing a 115% year-over-year increase, while achieving record quarterly performance across multiple business segments. This exceptional growth trajectory reflects both organic expansion and strategic acquisitions, including the $200 million purchase of Bitstamp, which has already contributed significantly to cryptocurrency trading volumes. Q4 2024 Earnings Report \n\n1.2 Key Financial Metrics Analysis Robinhood's financial metrics demonstrate robust operational performance with the current P/E ratio of 32.25 reflecting market confidence in the company's growth prospects, though representing a premium valuation compared to traditional financial services peers. The company's price-to-earnings ratio has compressed significantly from previous highs, indicating improved earnings quality and sustainability. Return on equity stands at an impressive 19.52%, substantially outperforming industry averages and reflecting efficient capital allocation and strong profit margins.\n\nStock Analysis Financial Data The company maintains a strong balance sheet position with total assets under custody exceeding $304 billion as of August 2025, representing 112% annual growth. This asset growth, combined with minimal debt obligations, provides Robinhood with significant financial flexibility for future expansion initiatives. The debt-to-equity ratio remains exceptionally low, with the company primarily financing operations through internally generated cash flows and customer deposits. Average assets per funded customer have doubled year-over-year to exceed $10,000, indicating successful migration toward higher-value client relationships. TipRanks Analysis Profitability metrics showcase the company's operational leverage, with adjusted EBITDA reaching $613 million in Q4 2024, representing over 300% growth year-over-year. The incremental adjusted EBITDA margin of 81% demonstrates the scalability of Robinhood's platform economics, where additional trading volume and customer growth translate directly to bottom-line performance. Earnings per share doubled year-over-year to $1.01 in Q4 2024, reflecting both revenue growth and effective cost management throughout the organization. Q4 2024 Earnings Report",
        "2. 业务分析": "Business Segments Analysis \n\n2.1 Revenue Breakdown by Business Segment Robinhood operates through several interconnected business segments that collectively form a comprehensive financial services ecosystem. The primary revenue generator is the Transaction-based Revenue segment, which accounted for approximately 89.41% of total revenue in 2024, generating significant income through payment for order flow (PFOF) and transaction fees. This segment encompasses trading in stocks, options, cryptocurrencies, and other financial instruments, representing the core of Robinhood's business model.\n\nThe Net Interest Income segment has emerged as a significant revenue contributor, representing approximately 8-10% of total revenue through customer cash balances and margin lending. This segment benefits from higher interest rate environments and growing customer asset bases, providing stable recurring revenue streams that complement the more volatile transaction-based income.\n\nThe Subscription Services segment, primarily through Robinhood Gold, contributes an estimated 2-3% of total revenue but represents high-margin recurring income. This segment includes premium features such as extended trading hours, margin trading capabilities, and enhanced research tools, providing additional value to active traders and long-term investors.",
        "3. 增长催化剂": "Growth Catalysts and Strategic Initiatives \n\n3.1 Major Growth Drivers and Market Opportunities Robinhood is positioned to capitalize on several transformative growth catalysts that could drive exponential expansion over the next 24 months. The most significant catalyst is the company's strategic expansion into institutional services through its B2B2C strategy, which expands the addressable market significantly beyond direct retail customers to include registered investment advisors and their clients.\n\nThe artificial intelligence revolution in financial services presents a massive market opportunity, with Robinhood positioned as a first-mover advantage through its advanced AI infrastructure. The company's AI integration addresses regulatory concerns about investment suitability while providing scalable investment guidance that can improve customer outcomes and reduce regulatory risk.\n\nFederal Reserve rate cuts and favorable macroeconomic conditions are creating favorable conditions for Robinhood's growth strategy. The company's diversified product portfolio, particularly its rapidly growing cryptocurrency and options business, positions it to benefit from multiple market scenarios while traditional brokers remain vulnerable to single-product exposure.",
        "4. 估值分析": "Valuation Analysis and Key Findings \n\n4.1 Discounted Cash Flow Analysis with Detailed Assumptions Robinhood's DCF valuation requires carefully constructed assumptions reflecting the company's strong growth trajectory and expanding market opportunities. Based on recent performance trends and management guidance, the base case projects continued revenue growth of 25-30% annually through 2028, driven by customer acquisition, product expansion, and market share gains.\n\nKey DCF assumptions include a weighted average cost of capital (WACC) of 10.5%, reflecting Robinhood's strong balance sheet and growth prospects. The terminal growth rate is estimated at 3%, consistent with long-term GDP growth expectations. Revenue assumptions incorporate the expansion into institutional services and international markets, with full-year 2026 revenue projected at $2.5-3.0 billion.\n\nThe DCF analysis yields an intrinsic value range of $45-65 per share under base case assumptions, suggesting potential upside from current levels. Sensitivity analysis shows high correlation to customer growth rates and market expansion success, with optimistic scenarios supporting higher valuations if Robinhood successfully captures significant market share in institutional services."
      },
      author: "SuperAnalyst Pro Research Team",
      tags: [
        "Robinhood Markets, Inc.",
        "HOOD",
        "stock analysis",
        "investment research",
        "equity research"
      ],
      sector: "Financial Services",
      industry: "Investment Banking & Brokerage"
    };
    
    // 将HOOD报告添加到历史报告列表的开头
    historicalReports.reports.unshift(hoodReport);
    
    // 保存更新后的历史报告数据
    fs.writeFileSync(historicalReportsPath, JSON.stringify(historicalReports, null, 2));
    
    console.log('✅ HOOD报告已成功移到历史报告中！');
    console.log(`📊 历史报告总数: ${historicalReports.reports.length}`);
    console.log(`🏢 最新报告: ${hoodReport.company} (${hoodReport.symbol})`);
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
moveHoodToHistory();

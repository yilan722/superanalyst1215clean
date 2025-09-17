'use client'

import React, { useState } from 'react'
import ValuationReport from '../../components/ValuationReport'
import { StockData, ValuationReportData } from '../../types'

export default function TestValuationPage() {
  const [stockData] = useState<StockData>({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.00,
    marketCap: 2500000000000, // 2.5T
    peRatio: 25.5,
    amount: 50000000, // 50M
    volume: 1000000,
    change: 2.5,
    changePercent: 1.69
  })

  const [reportData] = useState<ValuationReportData>({
    fundamentalAnalysis: `
      <h3>公司概览</h3>
      <p>Apple Inc. 是一家全球领先的科技公司...</p>
      
      <h3>核心财务指标</h3>
      <table class="metric-table">
        <thead>
          <tr>
            <th>指标</th>
            <th>2024年</th>
            <th>2023年</th>
            <th>变化</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>营业收入(亿美元)</td>
            <td>3,833</td>
            <td>3,661</td>
            <td class="positive">+4.7%</td>
          </tr>
          <tr>
            <td>净利润(亿美元)</td>
            <td>970</td>
            <td>998</td>
            <td class="negative">-2.8%</td>
          </tr>
        </tbody>
      </table>
    `,
    businessSegments: `
      <h3>业务板块分析</h3>
      <p>Apple的业务主要分为以下几个板块...</p>
      
      <table class="metric-table">
        <thead>
          <tr>
            <th>业务板块</th>
            <th>收入(亿美元)</th>
            <th>占比</th>
            <th>增长率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>iPhone</td>
            <td>2,000</td>
            <td>52.2%</td>
            <td class="positive">+3.2%</td>
          </tr>
          <tr>
            <td>Services</td>
            <td>850</td>
            <td>22.2%</td>
            <td class="positive">+14.1%</td>
          </tr>
        </tbody>
      </table>
    `,
    growthCatalysts: `
      <h3>增长催化剂</h3>
      <p>Apple未来的增长主要来自以下几个方面...</p>
      
      <table class="metric-table">
        <thead>
          <tr>
            <th>催化剂</th>
            <th>影响程度</th>
            <th>时间周期</th>
            <th>收入贡献</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>AI功能集成</td>
            <td>高</td>
            <td>2025-2026</td>
            <td>50-100亿美元</td>
          </tr>
          <tr>
            <td>服务业务扩张</td>
            <td>中</td>
            <td>持续</td>
            <td>20-30亿美元/年</td>
          </tr>
        </tbody>
      </table>
    `,
    valuationAnalysis: `
      <h3>DCF现金流折现分析</h3>
      <p>基于以下假设进行DCF估值分析...</p>
      
      <table class="metric-table">
        <thead>
          <tr>
            <th>DCF关键假设</th>
            <th>2025E</th>
            <th>2026E</th>
            <th>2027E</th>
            <th>长期增长率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>营业收入(亿美元)</td>
            <td>4,000</td>
            <td>4,200</td>
            <td>4,400</td>
            <td>3%</td>
          </tr>
          <tr>
            <td>营业利润率</td>
            <td>25%</td>
            <td>26%</td>
            <td>27%</td>
            <td>27%</td>
          </tr>
          <tr>
            <td>税率</td>
            <td>15%</td>
            <td>15%</td>
            <td>15%</td>
            <td>15%</td>
          </tr>
          <tr>
            <td>WACC</td>
            <td>9.5%</td>
            <td>9.5%</td>
            <td>9.5%</td>
            <td>9.5%</td>
          </tr>
          <tr>
            <td>自由现金流(亿美元)</td>
            <td>850</td>
            <td>950</td>
            <td>1,050</td>
            <td>稳定增长</td>
          </tr>
        </tbody>
      </table>
      
      <h3>可比公司估值分析</h3>
      <table class="metric-table">
        <thead>
          <tr>
            <th>可比公司</th>
            <th>市值(亿美元)</th>
            <th>2025E P/E</th>
            <th>业务相似度</th>
            <th>估值溢价/折价</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Microsoft</td>
            <td>3,200</td>
            <td>28.5x</td>
            <td>科技巨头</td>
            <td>溢价15%</td>
          </tr>
          <tr>
            <td>Google</td>
            <td>2,100</td>
            <td>22.3x</td>
            <td>科技平台</td>
            <td>折价10%</td>
          </tr>
          <tr>
            <td>Apple</td>
            <td>2,500</td>
            <td>25.8x</td>
            <td>基准</td>
            <td>基准</td>
          </tr>
        </tbody>
      </table>
      
      <h3>内在价值汇总</h3>
      <table class="metric-table">
        <thead>
          <tr>
            <th>估值方法</th>
            <th>每股价值(美元)</th>
            <th>权重</th>
            <th>加权价值(美元)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DCF估值</td>
            <td>180.00</td>
            <td>50%</td>
            <td>90.00</td>
          </tr>
          <tr>
            <td>相对估值</td>
            <td>175.00</td>
            <td>30%</td>
            <td>52.50</td>
          </tr>
          <tr>
            <td>资产价值</td>
            <td>160.00</td>
            <td>20%</td>
            <td>32.00</td>
          </tr>
          <tr class="highlight-box">
            <td><strong>综合估值</strong></td>
            <td><strong>174.50</strong></td>
            <td><strong>100%</strong></td>
            <td><strong>174.50</strong></td>
          </tr>
        </tbody>
      </table>
    `
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          估值报告测试页面 - 验证DCF表格显示
        </h1>
        
        <ValuationReport
          stockData={stockData}
          reportData={reportData}
          isLoading={false}
          locale="zh"
        />
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">调试信息</h3>
          <p className="text-sm text-yellow-700">
            如果DCF重新计算失败，请检查：
          </p>
          <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
            <li>确保开发服务器在正确的端口运行 (通常是3000)</li>
            <li>检查浏览器控制台的错误信息</li>
            <li>确保用户已登录并有有效的Authorization token</li>
            <li>检查API路由是否正确部署</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

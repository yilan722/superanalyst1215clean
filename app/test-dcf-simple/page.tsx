'use client'

import React, { useState } from 'react'
import ValuationReport from '../../components/ValuationReport'
import { StockData, ValuationReportData } from '../../types'

export default function TestDCFSimplePage() {
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
      
      <h3>DCF估值分析</h3>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>年份</th>
          <th>营业收入增长率</th>
          <th>营业利润率</th>
          <th>税率</th>
        </tr>
        <tr>
          <td>2025</td>
          <td>25%</td>
          <td>2%</td>
          <td>25%</td>
        </tr>
        <tr>
          <td>2026</td>
          <td>20%</td>
          <td>5%</td>
          <td>25%</td>
        </tr>
        <tr>
          <td>2027</td>
          <td>15%</td>
          <td>8%</td>
          <td>25%</td>
        </tr>
      </table>
      
      <h4>关键假设</h4>
      <ul>
        <li>WACC: 9.5%</li>
        <li>长期增长率: 3%</li>
        <li>终端倍数: 15.0x</li>
      </ul>
    `,
    businessSegments: '<h3>业务板块</h3><p>iPhone, Mac, iPad, Services...</p>',
    growthCatalysts: '<h3>增长催化剂</h3><p>AI技术, 服务收入增长...</p>',
    valuationAnalysis: `
      <h3>估值分析</h3>
      <p>基于DCF模型的估值分析...</p>
      
      <h4>DCF估值表</h4>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>项目</th>
          <th>2025</th>
          <th>2026</th>
          <th>2027</th>
        </tr>
        <tr>
          <td>营业收入 (亿美元)</td>
          <td>4,000</td>
          <td>4,800</td>
          <td>5,520</td>
        </tr>
        <tr>
          <td>营业利润 (亿美元)</td>
          <td>80</td>
          <td>240</td>
          <td>441.6</td>
        </tr>
        <tr>
          <td>净利润 (亿美元)</td>
          <td>60</td>
          <td>180</td>
          <td>331.2</td>
        </tr>
      </table>
    `
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          DCF参数编辑器测试页面
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg">
          <ValuationReport
            stockData={stockData}
            reportData={reportData}
            isLoading={false}
            locale="zh"
          />
        </div>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">测试说明</h3>
          <p className="text-sm text-yellow-700">
            此页面用于测试DCF参数编辑器功能。请确保：
          </p>
          <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
            <li>用户已登录（需要有效的用户ID）</li>
            <li>API路由正常工作</li>
            <li>DCF参数对比表格显示完整</li>
            <li>可以调整参数并重新计算DCF估值</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

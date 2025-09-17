'use client'

import React, { useState } from 'react'
import ValuationReport from '../../components/ValuationReport'
import { StockData, ValuationReportData } from '../../types'

export default function TestConsensusPage() {
  const [stockData] = useState<StockData>({
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.28,
    marketCap: 2150000000000, // 2.15T
    peRatio: 65.2,
    amount: 50000000, // 50M
    volume: 1000000,
    change: 12.5,
    changePercent: 1.45
  })

  const [reportData] = useState<ValuationReportData>({
    fundamentalAnalysis: `
      <h3>公司概览</h3>
      <p>NVIDIA Corporation 是全球领先的AI计算公司...</p>
    `,
    businessSegments: '<h3>业务板块</h3><p>数据中心, 游戏, 专业可视化, 汽车...</p>',
    growthCatalysts: '<h3>增长催化剂</h3><p>AI芯片需求, 数据中心扩张, 自动驾驶...</p>',
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
          <td>1,200</td>
          <td>1,920</td>
          <td>2,592</td>
        </tr>
        <tr>
          <td>营业利润 (亿美元)</td>
          <td>748.8</td>
          <td>1,152</td>
          <td>1,503.36</td>
        </tr>
      </table>
    `
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Consensus数据测试页面
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg">
          <ValuationReport
            stockData={stockData}
            reportData={reportData}
            isLoading={false}
            locale="zh"
          />
        </div>
        
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">测试说明</h3>
          <p className="text-sm text-green-700 mb-2">
            此页面用于测试consensus数据是否正确显示：
          </p>
          <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
            <li>页面加载时应该自动搜索NVIDIA的consensus数据</li>
            <li>DCF参数对比表格应该显示真实的consensus数据，而不是默认的2%, 5%, 8%</li>
            <li>Operating Margin应该显示NVIDIA的真实数据（约62.4%）</li>
            <li>WACC应该显示AI公司的典型值（约12.5%）</li>
            <li>所有参数都应该基于真实的分析师预期</li>
          </ul>
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">预期结果</h3>
          <p className="text-sm text-blue-700">
            如果功能正常，您应该看到：
          </p>
          <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
            <li>Original (Consensus)列显示真实的NVIDIA数据</li>
            <li>Operating Margin: 62.4%, 60%, 58% (而不是2%, 5%, 8%)</li>
            <li>WACC: 12.5% (而不是9.5%)</li>
            <li>Revenue Growth: 125%, 60%, 35% (而不是25%, 20%, 15%)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

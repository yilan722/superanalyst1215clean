'use client'

import React, { useState } from 'react'
import ValuationReport from '../../components/ValuationReport'
import { StockData, ValuationReportData } from '../../types'

export default function TestNVDADCFPage() {
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
          <td>125%</td>
          <td>62.4%</td>
          <td>15%</td>
        </tr>
        <tr>
          <td>2026</td>
          <td>60%</td>
          <td>60%</td>
          <td>15%</td>
        </tr>
        <tr>
          <td>2027</td>
          <td>35%</td>
          <td>58%</td>
          <td>15%</td>
        </tr>
      </table>
      
      <h4>关键假设</h4>
      <ul>
        <li>WACC: 12.5%</li>
        <li>长期增长率: 4%</li>
        <li>终端倍数: 18.0x</li>
      </ul>
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
        <tr>
          <td>净利润 (亿美元)</td>
          <td>636.48</td>
          <td>979.2</td>
          <td>1,277.86</td>
        </tr>
      </table>
      
      <h4>历史Operating Margin数据</h4>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>年份</th>
          <th>Operating Margin</th>
          <th>数据来源</th>
        </tr>
        <tr>
          <td>2021</td>
          <td>36.2%</td>
          <td>finbox</td>
        </tr>
        <tr>
          <td>2022</td>
          <td>38.3%</td>
          <td>finbox</td>
        </tr>
        <tr>
          <td>2023</td>
          <td>26.2%</td>
          <td>finbox</td>
        </tr>
        <tr>
          <td>2024</td>
          <td>60.95%</td>
          <td>marketscreener</td>
        </tr>
        <tr>
          <td>2025</td>
          <td>62.42%</td>
          <td>alphaquery</td>
        </tr>
      </table>
      
      <h4>未来一致预期</h4>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>年份</th>
          <th>预期Operating Margin</th>
          <th>分析师预期范围</th>
        </tr>
        <tr>
          <td>2026</td>
          <td>60%</td>
          <td>55%-65%</td>
        </tr>
        <tr>
          <td>2027</td>
          <td>60%+</td>
          <td>60%或更高</td>
        </tr>
      </table>
    `
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          NVIDIA DCF参数编辑器测试页面
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg">
          <ValuationReport
            stockData={stockData}
            reportData={reportData}
            isLoading={false}
            locale="zh"
          />
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">NVIDIA真实数据说明</h3>
          <p className="text-sm text-blue-700 mb-2">
            此页面包含NVIDIA的真实Operating Margin数据：
          </p>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li><strong>2025年营业利润率:</strong> 62.4% (真实数据)</li>
            <li><strong>2026年营业利润率:</strong> 60% (分析师一致预期)</li>
            <li><strong>2027年营业利润率:</strong> 58% (保守预期)</li>
            <li><strong>WACC:</strong> 12.5% (AI公司典型值)</li>
            <li><strong>长期增长率:</strong> 4% (成熟期增长率)</li>
            <li><strong>终端倍数:</strong> 18.0x (高增长公司倍数)</li>
          </ul>
        </div>
        
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">测试说明</h3>
          <p className="text-sm text-yellow-700">
            此页面用于测试DCF参数编辑器从报告内容中提取真实数据的功能。请检查：
          </p>
          <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
            <li>原始DCF参数对比表格是否显示NVIDIA的真实数据</li>
            <li>Operating Margin是否显示62.4%, 60%, 58%等真实值</li>
            <li>WACC是否显示12.5%而不是默认的9.5%</li>
            <li>参数提取功能是否正常工作</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

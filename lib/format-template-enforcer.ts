/**
 * 格式模板强制器
 * 确保AI严格按照固定模板生成报告
 */

export interface ReportTemplate {
  fundamentalAnalysis: {
    tables: Array<{
      id: string;
      title: string;
      headers: string[];
      template: string;
    }>;
    charts: Array<{
      id: string;
      title: string;
      template: string;
    }>;
  };
  businessSegments: {
    tables: Array<{
      id: string;
      title: string;
      headers: string[];
      template: string;
    }>;
    charts: Array<{
      id: string;
      title: string;
      template: string;
    }>;
  };
  growthCatalysts: {
    tables: Array<{
      id: string;
      title: string;
      headers: string[];
      template: string;
    }>;
    charts: Array<{
      id: string;
      title: string;
      template: string;
    }>;
  };
  valuationAnalysis: {
    tables: Array<{
      id: string;
      title: string;
      headers: string[];
      template: string;
    }>;
    charts: Array<{
      id: string;
      title: string;
      template: string;
    }>;
  };
}

// 固定的报告模板
export const REPORT_TEMPLATE: ReportTemplate = {
  fundamentalAnalysis: {
    tables: [
      {
        id: 'financial-metrics',
        title: '核心财务指标对比表',
        headers: ['财务指标', '当前值', '去年同期', '变化', '行业平均'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>财务指标</th>
              <th>当前值</th>
              <th>去年同期</th>
              <th>变化</th>
              <th>行业平均</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>市盈率(P/E)</td>
              <td>{pe_ratio}</td>
              <td>{pe_ratio_prev}</td>
              <td class="{pe_change_class}">{pe_change}</td>
              <td>{industry_pe}</td>
            </tr>
            <tr>
              <td>市净率(P/B)</td>
              <td>{pb_ratio}</td>
              <td>{pb_ratio_prev}</td>
              <td class="{pb_change_class}">{pb_change}</td>
              <td>{industry_pb}</td>
            </tr>
            <tr>
              <td>净资产收益率(ROE)</td>
              <td>{roe}</td>
              <td>{roe_prev}</td>
              <td class="{roe_change_class}">{roe_change}</td>
              <td>{industry_roe}</td>
            </tr>
            <tr>
              <td>资产收益率(ROA)</td>
              <td>{roa}</td>
              <td>{roa_prev}</td>
              <td class="{roa_change_class}">{roa_change}</td>
              <td>{industry_roa}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'performance-comparison',
        title: '业绩对比分析表',
        headers: ['指标', 'Q2 2025', 'Q2 2024', '同比增长', '环比增长'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>指标</th>
              <th>Q2 2025</th>
              <th>Q2 2024</th>
              <th>同比增长</th>
              <th>环比增长</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>营业收入</td>
              <td>{revenue_current}</td>
              <td>{revenue_prev}</td>
              <td class="{revenue_yoy_class}">{revenue_yoy}</td>
              <td class="{revenue_qoq_class}">{revenue_qoq}</td>
            </tr>
            <tr>
              <td>净利润</td>
              <td>{net_income_current}</td>
              <td>{net_income_prev}</td>
              <td class="{net_income_yoy_class}">{net_income_yoy}</td>
              <td class="{net_income_qoq_class}">{net_income_qoq}</td>
            </tr>
            <tr>
              <td>毛利率</td>
              <td>{gross_margin_current}</td>
              <td>{gross_margin_prev}</td>
              <td class="{gross_margin_yoy_class}">{gross_margin_yoy}</td>
              <td class="{gross_margin_qoq_class}">{gross_margin_qoq}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'industry-comparison',
        title: '行业对比分析表',
        headers: ['指标', '公司', '行业平均', '行业领先', '排名'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>指标</th>
              <th>公司</th>
              <th>行业平均</th>
              <th>行业领先</th>
              <th>排名</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>营收增长率</td>
              <td>{company_revenue_growth}</td>
              <td>{industry_revenue_growth}</td>
              <td>{industry_leader_revenue_growth}</td>
              <td class="{revenue_rank_class}">{revenue_rank}</td>
            </tr>
            <tr>
              <td>利润率</td>
              <td>{company_profit_margin}</td>
              <td>{industry_profit_margin}</td>
              <td>{industry_leader_profit_margin}</td>
              <td class="{profit_rank_class}">{profit_rank}</td>
            </tr>
            <tr>
              <td>市场份额</td>
              <td>{company_market_share}</td>
              <td>{industry_market_share}</td>
              <td>{industry_leader_market_share}</td>
              <td class="{market_share_rank_class}">{market_share_rank}</td>
            </tr>
          </tbody>
        </table>`
      }
    ],
    charts: [
      {
        id: 'financial-trends',
        title: '财务指标趋势图',
        template: `<div class="chart-container">
          <h4>财务指标趋势图</h4>
          <div class="chart-placeholder">
            <p>图表描述：展示公司关键财务指标的历史趋势和未来预测</p>
            <ul>
              <li>营收增长趋势：{revenue_trend}</li>
              <li>利润率变化：{profit_margin_trend}</li>
              <li>ROE/ROA趋势：{roe_roa_trend}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'profitability-analysis',
        title: '盈利能力分析图',
        template: `<div class="chart-container">
          <h4>盈利能力分析图</h4>
          <div class="chart-placeholder">
            <p>图表描述：分析公司盈利能力的各个维度</p>
            <ul>
              <li>毛利率分析：{gross_margin_analysis}</li>
              <li>净利率分析：{net_margin_analysis}</li>
              <li>运营效率：{operational_efficiency}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'industry-position',
        title: '行业地位对比图',
        template: `<div class="chart-container">
          <h4>行业地位对比图</h4>
          <div class="chart-placeholder">
            <p>图表描述：对比公司在行业中的竞争地位</p>
            <ul>
              <li>市场份额对比：{market_share_comparison}</li>
              <li>财务指标排名：{financial_ranking}</li>
              <li>竞争优势分析：{competitive_advantages}</li>
            </ul>
          </div>
        </div>`
      }
    ]
  },
  businessSegments: {
    tables: [
      {
        id: 'revenue-structure',
        title: '收入结构分析表',
        headers: ['业务板块', '收入占比', '主要客户', '增长率', '利润率'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>业务板块</th>
              <th>收入占比</th>
              <th>主要客户</th>
              <th>增长率</th>
              <th>利润率</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{segment1_name}</td>
              <td>{segment1_share}</td>
              <td>{segment1_customers}</td>
              <td class="{segment1_growth_class}">{segment1_growth}</td>
              <td class="{segment1_margin_class}">{segment1_margin}</td>
            </tr>
            <tr>
              <td>{segment2_name}</td>
              <td>{segment2_share}</td>
              <td>{segment2_customers}</td>
              <td class="{segment2_growth_class}">{segment2_growth}</td>
              <td class="{segment2_margin_class}">{segment2_margin}</td>
            </tr>
            <tr>
              <td>{segment3_name}</td>
              <td>{segment3_share}</td>
              <td>{segment3_customers}</td>
              <td class="{segment3_growth_class}">{segment3_growth}</td>
              <td class="{segment3_margin_class}">{segment3_margin}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'segment-performance',
        title: '业务板块表现表',
        headers: ['板块', 'Q2 2025', 'Q2 2024', '同比变化', '环比变化'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>板块</th>
              <th>Q2 2025</th>
              <th>Q2 2024</th>
              <th>同比变化</th>
              <th>环比变化</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{segment1_name}</td>
              <td>{segment1_current}</td>
              <td>{segment1_prev}</td>
              <td class="{segment1_yoy_class}">{segment1_yoy}</td>
              <td class="{segment1_qoq_class}">{segment1_qoq}</td>
            </tr>
            <tr>
              <td>{segment2_name}</td>
              <td>{segment2_current}</td>
              <td>{segment2_prev}</td>
              <td class="{segment2_yoy_class}">{segment2_yoy}</td>
              <td class="{segment2_qoq_class}">{segment2_qoq}</td>
            </tr>
            <tr>
              <td>{segment3_name}</td>
              <td>{segment3_current}</td>
              <td>{segment3_prev}</td>
              <td class="{segment3_yoy_class}">{segment3_yoy}</td>
              <td class="{segment3_qoq_class}">{segment3_qoq}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'regional-distribution',
        title: '区域收入分布表',
        headers: ['地区', '收入占比', '主要市场', '增长率', '潜力'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>地区</th>
              <th>收入占比</th>
              <th>主要市场</th>
              <th>增长率</th>
              <th>潜力</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{region1_name}</td>
              <td>{region1_share}</td>
              <td>{region1_markets}</td>
              <td class="{region1_growth_class}">{region1_growth}</td>
              <td class="{region1_potential_class}">{region1_potential}</td>
            </tr>
            <tr>
              <td>{region2_name}</td>
              <td>{region2_share}</td>
              <td>{region2_markets}</td>
              <td class="{region2_growth_class}">{region2_growth}</td>
              <td class="{region2_potential_class}">{region2_potential}</td>
            </tr>
            <tr>
              <td>{region3_name}</td>
              <td>{region3_share}</td>
              <td>{region3_markets}</td>
              <td class="{region3_growth_class}">{region3_growth}</td>
              <td class="{region3_potential_class}">{region3_potential}</td>
            </tr>
          </tbody>
        </table>`
      }
    ],
    charts: [
      {
        id: 'revenue-structure-chart',
        title: '收入结构分布图',
        template: `<div class="chart-container">
          <h4>收入结构分布图</h4>
          <div class="chart-placeholder">
            <p>图表描述：展示各业务板块的收入占比和增长趋势</p>
            <ul>
              <li>板块收入占比：{segment_revenue_share}</li>
              <li>增长趋势对比：{growth_trend_comparison}</li>
              <li>利润率对比：{margin_comparison}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'segment-growth-chart',
        title: '业务板块增长图',
        template: `<div class="chart-container">
          <h4>业务板块增长图</h4>
          <div class="chart-placeholder">
            <p>图表描述：分析各业务板块的增长表现和未来潜力</p>
            <ul>
              <li>历史增长表现：{historical_growth_performance}</li>
              <li>未来增长预测：{future_growth_forecast}</li>
              <li>市场机会分析：{market_opportunity_analysis}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'regional-distribution-chart',
        title: '区域收入分布图',
        template: `<div class="chart-container">
          <h4>区域收入分布图</h4>
          <div class="chart-placeholder">
            <p>图表描述：展示公司在不同地区的收入分布和增长机会</p>
            <ul>
              <li>地区收入占比：{regional_revenue_share}</li>
              <li>地区增长趋势：{regional_growth_trends}</li>
              <li>市场渗透率：{market_penetration_rates}</li>
            </ul>
          </div>
        </div>`
      }
    ]
  },
  growthCatalysts: {
    tables: [
      {
        id: 'growth-drivers',
        title: '增长驱动因素表',
        headers: ['驱动因素', '影响程度', '时间框架', '预期收益', '风险等级'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>驱动因素</th>
              <th>影响程度</th>
              <th>时间框架</th>
              <th>预期收益</th>
              <th>风险等级</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{driver1_name}</td>
              <td class="{driver1_impact_class}">{driver1_impact}</td>
              <td>{driver1_timeline}</td>
              <td class="{driver1_revenue_class}">{driver1_revenue}</td>
              <td class="{driver1_risk_class}">{driver1_risk}</td>
            </tr>
            <tr>
              <td>{driver2_name}</td>
              <td class="{driver2_impact_class}">{driver2_impact}</td>
              <td>{driver2_timeline}</td>
              <td class="{driver2_revenue_class}">{driver2_revenue}</td>
              <td class="{driver2_risk_class}">{driver2_risk}</td>
            </tr>
            <tr>
              <td>{driver3_name}</td>
              <td class="{driver3_impact_class}">{driver3_impact}</td>
              <td>{driver3_timeline}</td>
              <td class="{driver3_revenue_class}">{driver3_revenue}</td>
              <td class="{driver3_risk_class}">{driver3_risk}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'new-products',
        title: '新产品时间表',
        headers: ['产品/服务', '发布时间', '预期收入', '市场潜力', '竞争地位'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>产品/服务</th>
              <th>发布时间</th>
              <th>预期收入</th>
              <th>市场潜力</th>
              <th>竞争地位</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{product1_name}</td>
              <td>{product1_launch}</td>
              <td class="{product1_revenue_class}">{product1_revenue}</td>
              <td class="{product1_potential_class}">{product1_potential}</td>
              <td class="{product1_competitive_class}">{product1_competitive}</td>
            </tr>
            <tr>
              <td>{product2_name}</td>
              <td>{product2_launch}</td>
              <td class="{product2_revenue_class}">{product2_revenue}</td>
              <td class="{product2_potential_class}">{product2_potential}</td>
              <td class="{product2_competitive_class}">{product2_competitive}</td>
            </tr>
            <tr>
              <td>{product3_name}</td>
              <td>{product3_launch}</td>
              <td class="{product3_revenue_class}">{product3_revenue}</td>
              <td class="{product3_potential_class}">{product3_potential}</td>
              <td class="{product3_competitive_class}">{product3_competitive}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'market-opportunities',
        title: '市场机会分析表',
        headers: ['市场细分', '市场规模', '增长率', '公司机会', '进入壁垒'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>市场细分</th>
              <th>市场规模</th>
              <th>增长率</th>
              <th>公司机会</th>
              <th>进入壁垒</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{market1_segment}</td>
              <td>{market1_size}</td>
              <td class="{market1_growth_class}">{market1_growth}</td>
              <td class="{market1_opportunity_class}">{market1_opportunity}</td>
              <td class="{market1_barrier_class}">{market1_barrier}</td>
            </tr>
            <tr>
              <td>{market2_segment}</td>
              <td>{market2_size}</td>
              <td class="{market2_growth_class}">{market2_growth}</td>
              <td class="{market2_opportunity_class}">{market2_opportunity}</td>
              <td class="{market2_barrier_class}">{market2_barrier}</td>
            </tr>
            <tr>
              <td>{market3_segment}</td>
              <td>{market3_size}</td>
              <td class="{market3_growth_class}">{market3_growth}</td>
              <td class="{market3_opportunity_class}">{market3_opportunity}</td>
              <td class="{market3_barrier_class}">{market3_barrier}</td>
            </tr>
          </tbody>
        </table>`
      }
    ],
    charts: [
      {
        id: 'growth-drivers-chart',
        title: '增长驱动因素图',
        template: `<div class="chart-container">
          <h4>增长驱动因素图</h4>
          <div class="chart-placeholder">
            <p>图表描述：分析公司的主要增长驱动因素和影响程度</p>
            <ul>
              <li>驱动因素影响矩阵：{driver_impact_matrix}</li>
              <li>时间线分析：{timeline_analysis}</li>
              <li>收益预期：{revenue_expectations}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'market-opportunities-chart',
        title: '市场机会分析图',
        template: `<div class="chart-container">
          <h4>市场机会分析图</h4>
          <div class="chart-placeholder">
            <p>图表描述：展示公司面临的市场机会和增长潜力</p>
            <ul>
              <li>市场规模对比：{market_size_comparison}</li>
              <li>增长机会评估：{growth_opportunity_assessment}</li>
              <li>竞争格局分析：{competitive_landscape_analysis}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'strategic-initiatives-chart',
        title: '战略举措时间线图',
        template: `<div class="chart-container">
          <h4>战略举措时间线图</h4>
          <div class="chart-placeholder">
            <p>图表描述：展示公司的战略举措和实施时间线</p>
            <ul>
              <li>举措优先级：{initiative_priorities}</li>
              <li>实施时间表：{implementation_timeline}</li>
              <li>预期成果：{expected_outcomes}</li>
            </ul>
          </div>
        </div>`
      }
    ]
  },
  valuationAnalysis: {
    tables: [
      {
        id: 'dcf-valuation',
        title: 'DCF估值表',
        headers: ['DCF假设', '2025E', '2026E', '2027E', '终端'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>DCF假设</th>
              <th>2025E</th>
              <th>2026E</th>
              <th>2027E</th>
              <th>终端</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>收入增长率</td>
              <td class="{revenue_growth_2025_class}">{revenue_growth_2025}</td>
              <td class="{revenue_growth_2026_class}">{revenue_growth_2026}</td>
              <td class="{revenue_growth_2027_class}">{revenue_growth_2027}</td>
              <td>{terminal_growth}</td>
            </tr>
            <tr>
              <td>EBITDA利润率</td>
              <td class="{ebitda_margin_2025_class}">{ebitda_margin_2025}</td>
              <td class="{ebitda_margin_2026_class}">{ebitda_margin_2026}</td>
              <td class="{ebitda_margin_2027_class}">{ebitda_margin_2027}</td>
              <td>{terminal_ebitda_margin}</td>
            </tr>
            <tr>
              <td>资本支出占比</td>
              <td class="{capex_2025_class}">{capex_2025}</td>
              <td class="{capex_2026_class}">{capex_2026}</td>
              <td class="{capex_2027_class}">{capex_2027}</td>
              <td>{terminal_capex}</td>
            </tr>
            <tr>
              <td>自由现金流</td>
              <td class="{fcf_2025_class}">{fcf_2025}</td>
              <td class="{fcf_2026_class}">{fcf_2026}</td>
              <td class="{fcf_2027_class}">{fcf_2027}</td>
              <td>{terminal_fcf}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'comparable-valuation',
        title: '可比公司估值表',
        headers: ['公司', 'EV/Revenue', '增长率', 'EBITDA利润率', '业务模式'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>公司</th>
              <th>EV/Revenue</th>
              <th>增长率</th>
              <th>EBITDA利润率</th>
              <th>业务模式</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{company1_name}</td>
              <td>{company1_ev_revenue}</td>
              <td class="{company1_growth_class}">{company1_growth}</td>
              <td class="{company1_ebitda_class}">{company1_ebitda}</td>
              <td>{company1_business_model}</td>
            </tr>
            <tr>
              <td>{company2_name}</td>
              <td>{company2_ev_revenue}</td>
              <td class="{company2_growth_class}">{company2_growth}</td>
              <td class="{company2_ebitda_class}">{company2_ebitda}</td>
              <td>{company2_business_model}</td>
            </tr>
            <tr>
              <td>{company3_name}</td>
              <td>{company3_ev_revenue}</td>
              <td class="{company3_growth_class}">{company3_growth}</td>
              <td class="{company3_ebitda_class}">{company3_ebitda}</td>
              <td>{company3_business_model}</td>
            </tr>
            <tr>
              <td>{company4_name}</td>
              <td>{company4_ev_revenue}</td>
              <td class="{company4_growth_class}">{company4_growth}</td>
              <td class="{company4_ebitda_class}">{company4_ebitda}</td>
              <td>{company4_business_model}</td>
            </tr>
            <tr>
              <td>{company5_name}</td>
              <td>{company5_ev_revenue}</td>
              <td class="{company5_growth_class}">{company5_growth}</td>
              <td class="{company5_ebitda_class}">{company5_ebitda}</td>
              <td>{company5_business_model}</td>
            </tr>
          </tbody>
        </table>`
      },
      {
        id: 'intrinsic-value',
        title: '内在价值汇总表',
        headers: ['估值方法', '每股价值', '权重', '加权价值', '置信度'],
        template: `<table class="metric-table">
          <thead>
            <tr>
              <th>估值方法</th>
              <th>每股价值</th>
              <th>权重</th>
              <th>加权价值</th>
              <th>置信度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DCF估值</td>
              <td class="{dcf_value_class}">{dcf_value}</td>
              <td>{dcf_weight}</td>
              <td class="{dcf_weighted_class}">{dcf_weighted}</td>
              <td class="{dcf_confidence_class}">{dcf_confidence}</td>
            </tr>
            <tr>
              <td>相对估值</td>
              <td class="{relative_value_class}">{relative_value}</td>
              <td>{relative_weight}</td>
              <td class="{relative_weighted_class}">{relative_weighted}</td>
              <td class="{relative_confidence_class}">{relative_confidence}</td>
            </tr>
            <tr>
              <td>资产价值</td>
              <td class="{asset_value_class}">{asset_value}</td>
              <td>{asset_weight}</td>
              <td class="{asset_weighted_class}">{asset_weighted}</td>
              <td class="{asset_confidence_class}">{asset_confidence}</td>
            </tr>
            <tr>
              <td><strong>综合估值</strong></td>
              <td class="{total_value_class}"><strong>{total_value}</strong></td>
              <td><strong>100%</strong></td>
              <td class="{total_weighted_class}"><strong>{total_weighted}</strong></td>
              <td class="{total_confidence_class}"><strong>{total_confidence}</strong></td>
            </tr>
          </tbody>
        </table>`
      }
    ],
    charts: [
      {
        id: 'dcf-model-chart',
        title: 'DCF估值模型图',
        template: `<div class="chart-container">
          <h4>DCF估值模型图</h4>
          <div class="chart-placeholder">
            <p>图表描述：展示DCF估值模型的关键假设和计算结果</p>
            <ul>
              <li>现金流预测：{cash_flow_forecast}</li>
              <li>折现率分析：{discount_rate_analysis}</li>
              <li>敏感性分析：{sensitivity_analysis}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'comparable-analysis-chart',
        title: '可比公司分析图',
        template: `<div class="chart-container">
          <h4>可比公司分析图</h4>
          <div class="chart-placeholder">
            <p>图表描述：对比公司与同行业公司的估值指标</p>
            <ul>
              <li>估值倍数对比：{valuation_multiples_comparison}</li>
              <li>增长与估值关系：{growth_valuation_relationship}</li>
              <li>相对估值位置：{relative_valuation_position}</li>
            </ul>
          </div>
        </div>`
      },
      {
        id: 'valuation-sensitivity-chart',
        title: '估值敏感性分析图',
        template: `<div class="chart-container">
          <h4>估值敏感性分析图</h4>
          <div class="chart-placeholder">
            <p>图表描述：分析关键假设变化对估值结果的影响</p>
            <ul>
              <li>增长率敏感性：{growth_rate_sensitivity}</li>
              <li>折现率敏感性：{discount_rate_sensitivity}</li>
              <li>终端价值敏感性：{terminal_value_sensitivity}</li>
            </ul>
          </div>
        </div>`
      }
    ]
  }
};

/**
 * 生成强制格式的prompt
 */
export function generateEnforcedFormatPrompt(locale: string): string {
  const isChinese = locale === 'zh';
  
  if (isChinese) {
    return `您是一位专业的股票分析师。请严格按照以下固定模板生成报告，不得偏离格式要求。

**CRITICAL FORMAT REQUIREMENTS**:
1. 每个部分必须包含恰好3个表格和3个图表
2. 所有表格必须使用提供的HTML模板
3. 所有图表必须使用提供的HTML模板
4. 不得修改表格结构或图表结构
5. 不得添加额外的表格或图表
6. 不得删除任何必需的表格或图表

**MANDATORY TEMPLATES**:

**基本面分析部分**:
- 表格1: 核心财务指标对比表 (financial-metrics)
- 表格2: 业绩对比分析表 (performance-comparison)  
- 表格3: 行业对比分析表 (industry-comparison)
- 图表1: 财务指标趋势图 (financial-trends)
- 图表2: 盈利能力分析图 (profitability-analysis)
- 图表3: 行业地位对比图 (industry-position)

**业务板块部分**:
- 表格1: 收入结构分析表 (revenue-structure)
- 表格2: 业务板块表现表 (segment-performance)
- 表格3: 区域收入分布表 (regional-distribution)
- 图表1: 收入结构分布图 (revenue-structure-chart)
- 图表2: 业务板块增长图 (segment-growth-chart)
- 图表3: 区域收入分布图 (regional-distribution-chart)

**增长催化剂部分**:
- 表格1: 增长驱动因素表 (growth-drivers)
- 表格2: 新产品时间表 (new-products)
- 表格3: 市场机会分析表 (market-opportunities)
- 图表1: 增长驱动因素图 (growth-drivers-chart)
- 图表2: 市场机会分析图 (market-opportunities-chart)
- 图表3: 战略举措时间线图 (strategic-initiatives-chart)

**估值分析部分**:
- 表格1: DCF估值表 (dcf-valuation)
- 表格2: 可比公司估值表 (comparable-valuation)
- 表格3: 内在价值汇总表 (intrinsic-value)
- 图表1: DCF估值模型图 (dcf-model-chart)
- 图表2: 可比公司分析图 (comparable-analysis-chart)
- 图表3: 估值敏感性分析图 (valuation-sensitivity-chart)

**STRICT REQUIREMENTS**:
- 使用temperature=0.0确保输出一致性
- 严格按照模板填充数据
- 不得修改HTML结构
- 不得添加或删除任何元素
- 确保每个部分内容详实（500+字）

**OUTPUT FORMAT**:
返回JSON格式，包含四个部分，每个部分包含完整的HTML内容。`;
  } else {
    return `You are a professional stock analyst. Please generate reports strictly according to the following fixed templates without deviating from format requirements.

**CRITICAL FORMAT REQUIREMENTS**:
1. Each section must contain exactly 3 tables and 3 charts
2. All tables must use the provided HTML templates
3. All charts must use the provided HTML templates
4. Do not modify table structure or chart structure
5. Do not add extra tables or charts
6. Do not remove any required tables or charts

**MANDATORY TEMPLATES**:

**Fundamental Analysis Section**:
- Table 1: Core Financial Metrics Comparison (financial-metrics)
- Table 2: Performance Comparison Analysis (performance-comparison)
- Table 3: Industry Comparison Analysis (industry-comparison)
- Chart 1: Financial Metrics Trends (financial-trends)
- Chart 2: Profitability Analysis (profitability-analysis)
- Chart 3: Industry Position Comparison (industry-position)

**Business Segments Section**:
- Table 1: Revenue Structure Analysis (revenue-structure)
- Table 2: Business Segment Performance (segment-performance)
- Table 3: Regional Revenue Distribution (regional-distribution)
- Chart 1: Revenue Structure Distribution (revenue-structure-chart)
- Chart 2: Business Segment Growth (segment-growth-chart)
- Chart 3: Regional Revenue Distribution (regional-distribution-chart)

**Growth Catalysts Section**:
- Table 1: Growth Drivers Table (growth-drivers)
- Table 2: New Products Timeline (new-products)
- Table 3: Market Opportunities Analysis (market-opportunities)
- Chart 1: Growth Drivers Chart (growth-drivers-chart)
- Chart 2: Market Opportunities Chart (market-opportunities-chart)
- Chart 3: Strategic Initiatives Timeline (strategic-initiatives-chart)

**Valuation Analysis Section**:
- Table 1: DCF Valuation Table (dcf-valuation)
- Table 2: Comparable Company Valuation (comparable-valuation)
- Table 3: Intrinsic Value Summary (intrinsic-value)
- Chart 1: DCF Valuation Model (dcf-model-chart)
- Chart 2: Comparable Company Analysis (comparable-analysis-chart)
- Chart 3: Valuation Sensitivity Analysis (valuation-sensitivity-chart)

**STRICT REQUIREMENTS**:
- Use temperature=0.0 to ensure output consistency
- Strictly follow templates to fill data
- Do not modify HTML structure
- Do not add or remove any elements
- Ensure each section is comprehensive (500+ words)

**OUTPUT FORMAT**:
Return JSON format containing four sections, each with complete HTML content.`;
  }
}

/**
 * 验证报告格式是否符合模板
 */
export function validateReportAgainstTemplate(reportContent: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查必需的四个部分
  const requiredSections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis'];
  for (const section of requiredSections) {
    if (!reportContent[section]) {
      errors.push(`Missing required section: ${section}`);
      continue;
    }

    const content = reportContent[section];
    
    // 检查表格数量
    const tableMatches = content.match(/<table class="metric-table">/g);
    const tableCount = tableMatches ? tableMatches.length : 0;
    if (tableCount !== 3) {
      errors.push(`${section}: Expected 3 tables, found ${tableCount}`);
    }

    // 检查图表数量
    const chartMatches = content.match(/<div class="chart-container">/g);
    const chartCount = chartMatches ? chartMatches.length : 0;
    if (chartCount !== 3) {
      errors.push(`${section}: Expected 3 charts, found ${chartCount}`);
    }

    // 检查内容长度
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (textContent.length < 500) {
      warnings.push(`${section}: Content too short (${textContent.length}/500)`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

import axios from 'axios'

const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9'
const TUSHARE_API_URL = 'https://api.tushare.pro'

// 增强的DCF财务数据接口，包含界面所需的所有数据
export interface EnhancedDCFFinancialData {
  // 基础信息
  symbol: string
  name: string
  currentPrice: number
  marketCap: number
  sharesOutstanding: number
  
  // 利润表数据
  revenue: number
  netIncome: number
  operatingIncome: number
  grossProfit: number
  ebitda: number
  
  // 现金流数据
  operatingCashFlow: number
  freeCashFlow: number
  capex: number
  investingCashFlow: number
  financingCashFlow: number
  
  // 资产负债表数据
  totalAssets: number
  totalLiabilities: number
  shareholdersEquity: number
  cashAndEquivalents: number
  workingCapital: number
  
  // 财务比率
  revenueGrowth: number
  profitMargin: number
  operatingMargin: number
  grossMargin: number
  roe: number
  roa: number
  currentRatio: number
  debtToEquity: number
  
  // 估值倍数
  peRatio: number
  pbRatio: number
  psRatio: number
  evEbitda: number
  
  // 历史数据 (最近10年)
  historicalData: {
    years: string[]
    revenue: number[]
    netIncome: number[]
    operatingIncome: number[]
    freeCashFlow: number[]
    eps: number[]
    dividendsPaid: number[]
    dividendsAndBuybacks: number[]
  }
  
  // 多年期表现数据
  performanceData: {
    periods: string[]
    metrics: {
      name: string
      values: number[]
    }[]
  }
  
  // 数据来源和时间
  dataSource: string
  lastUpdated: string
}

// 获取增强的DCF财务数据
export async function fetchEnhancedDCFFinancialData(ticker: string): Promise<EnhancedDCFFinancialData | null> {
  try {
    console.log(`🚀 开始获取 ${ticker} 的增强财务数据...`)
    
    // 确定市场后缀
    let marketSuffix = '.SZ'
    if (ticker.startsWith('688')) {
      marketSuffix = '.SH'
    } else if (ticker.startsWith('300')) {
      marketSuffix = '.SZ'
    } else if (ticker.startsWith('600') || ticker.startsWith('601') || ticker.startsWith('603')) {
      marketSuffix = '.SH'
    } else if (ticker.startsWith('000') || ticker.startsWith('002')) {
      marketSuffix = '.SZ'
    }
    
    const tsCode = `${ticker}${marketSuffix}`
    console.log(`📊 股票代码转换: ${ticker} -> ${tsCode}`)
    
    // 并行获取所有财务数据
    const [
      basicData,
      incomeData,
      balanceData,
      cashflowData,
      dailyBasicData,
      historicalIncomeData,
      historicalBalanceData,
      historicalCashflowData,
      dividendData
    ] = await Promise.all([
      getStockBasicInfo(tsCode),
      getIncomeStatement(tsCode),
      getBalanceSheet(tsCode),
      getCashFlowStatement(tsCode),
      getDailyBasicData(tsCode),
      getHistoricalIncomeData(tsCode),
      getHistoricalBalanceData(tsCode),
      getHistoricalCashflowData(tsCode),
      getDividendData(tsCode)
    ])
    
    if (!basicData || !incomeData || !balanceData || !cashflowData) {
      console.error(`❌ 无法获取 ${ticker} 的基本财务数据`)
      return null
    }
    
    // 计算关键财务比率
    const financialRatios = calculateFinancialRatios(incomeData, balanceData, cashflowData)
    
    // 处理历史数据
    const historicalData = processHistoricalData(historicalIncomeData, historicalBalanceData, historicalCashflowData, dividendData)
    
    // 处理多年期表现数据
    const performanceData = processPerformanceData(historicalIncomeData, historicalBalanceData, historicalCashflowData)
    
    // 构建增强的DCF财务数据
    const enhancedData: EnhancedDCFFinancialData = {
      // 基础信息
      symbol: ticker,
      name: basicData.name,
      currentPrice: dailyBasicData?.close || 0,
      marketCap: dailyBasicData?.total_mv || 0,
      sharesOutstanding: dailyBasicData?.total_mv / (dailyBasicData?.close || 1) || 0,
      
      // 利润表数据
      revenue: incomeData.revenue || 0,
      netIncome: incomeData.n_income || 0,
      operatingIncome: incomeData.operate_profit || 0,
      grossProfit: incomeData.revenue - incomeData.oper_cost || 0,
      ebitda: calculateEBITDA(incomeData, cashflowData),
      
      // 现金流数据
      operatingCashFlow: cashflowData.n_cashflow_act || 0,
      freeCashFlow: calculateFreeCashFlow(cashflowData),
      capex: Math.abs(cashflowData.c_paid_goods_srv || 0),
      investingCashFlow: cashflowData.n_cashflow_inv_act || 0,
      financingCashFlow: cashflowData.n_cashflow_fin_act || 0,
      
      // 资产负债表数据
      totalAssets: balanceData.total_assets || 0,
      totalLiabilities: balanceData.total_liab || 0,
      shareholdersEquity: balanceData.total_equity || 0,
      cashAndEquivalents: balanceData.money_cap || 0,
      workingCapital: calculateWorkingCapital(balanceData),
      
      // 财务比率
      ...financialRatios,
      
      // 估值倍数
      peRatio: dailyBasicData?.pe || 0,
      pbRatio: dailyBasicData?.pb || 0,
      psRatio: dailyBasicData?.ps || 0,
      evEbitda: calculateEVEBITDA(dailyBasicData, incomeData),
      
      // 历史数据
      historicalData,
      
      // 多年期表现数据
      performanceData,
      
      // 元数据
      dataSource: 'tushare',
      lastUpdated: new Date().toISOString()
    }
    
    console.log(`✅ 成功获取 ${ticker} 的增强财务数据`)
    return enhancedData
    
  } catch (error) {
    console.error(`❌ 获取 ${ticker} 增强财务数据失败:`, error)
    return null
  }
}

// 获取历史利润表数据
async function getHistoricalIncomeData(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'income',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20150101',
        end_date: '20241231'
      },
      fields: 'ts_code,end_date,revenue,oper_cost,operate_profit,total_profit,n_income,ebit,ebitda'
    })
    
    if (response.data.data && response.data.data.items) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      
      return items.map(item => ({
        year: item[fields.indexOf('end_date')].substring(0, 4),
        revenue: parseFloat(item[fields.indexOf('revenue')]) || 0,
        oper_cost: parseFloat(item[fields.indexOf('oper_cost')]) || 0,
        operate_profit: parseFloat(item[fields.indexOf('operate_profit')]) || 0,
        total_profit: parseFloat(item[fields.indexOf('total_profit')]) || 0,
        n_income: parseFloat(item[fields.indexOf('n_income')]) || 0,
        ebit: parseFloat(item[fields.indexOf('ebit')]) || 0,
        ebitda: parseFloat(item[fields.indexOf('ebitda')]) || 0
      }))
    }
    return []
  } catch (error) {
    console.error('获取历史利润表数据失败:', error)
    return []
  }
}

// 获取历史资产负债表数据
async function getHistoricalBalanceData(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'balancesheet',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20150101',
        end_date: '20241231'
      },
      fields: 'ts_code,end_date,total_assets,total_liab,total_equity,money_cap,total_cur_assets,total_cur_liab'
    })
    
    if (response.data.data && response.data.data.items) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      
      return items.map(item => ({
        year: item[fields.indexOf('end_date')].substring(0, 4),
        total_assets: parseFloat(item[fields.indexOf('total_assets')]) || 0,
        total_liab: parseFloat(item[fields.indexOf('total_liab')]) || 0,
        total_equity: parseFloat(item[fields.indexOf('total_equity')]) || 0,
        money_cap: parseFloat(item[fields.indexOf('money_cap')]) || 0,
        total_cur_assets: parseFloat(item[fields.indexOf('total_cur_assets')]) || 0,
        total_cur_liab: parseFloat(item[fields.indexOf('total_cur_liab')]) || 0
      }))
    }
    return []
  } catch (error) {
    console.error('获取历史资产负债表数据失败:', error)
    return []
  }
}

// 获取历史现金流数据
async function getHistoricalCashflowData(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'cashflow',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20150101',
        end_date: '20241231'
      },
      fields: 'ts_code,end_date,n_cashflow_act,n_cashflow_inv_act,n_cashflow_fin_act,c_paid_goods_srv'
    })
    
    if (response.data.data && response.data.data.items) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      
      return items.map(item => ({
        year: item[fields.indexOf('end_date')].substring(0, 4),
        n_cashflow_act: parseFloat(item[fields.indexOf('n_cashflow_act')]) || 0,
        n_cashflow_inv_act: parseFloat(item[fields.indexOf('n_cashflow_inv_act')]) || 0,
        n_cashflow_fin_act: parseFloat(item[fields.indexOf('n_cashflow_fin_act')]) || 0,
        c_paid_goods_srv: parseFloat(item[fields.indexOf('c_paid_goods_srv')]) || 0
      }))
    }
    return []
  } catch (error) {
    console.error('获取历史现金流数据失败:', error)
    return []
  }
}

// 获取股息数据
async function getDividendData(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'dividend',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20150101',
        end_date: '20241231'
      },
      fields: 'ts_code,ann_date,end_date,div_proc,stk_div,stk_bo_rate,stk_co_rate,cash_div,cash_div_tax,record_date,ex_date,pay_date,div_listdate,imp_ann_date'
    })
    
    if (response.data.data && response.data.data.items) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      
      return items.map(item => ({
        year: item[fields.indexOf('end_date')].substring(0, 4),
        cash_div: parseFloat(item[fields.indexOf('cash_div')]) || 0,
        stk_div: parseFloat(item[fields.indexOf('stk_div')]) || 0,
        stk_bo_rate: parseFloat(item[fields.indexOf('stk_bo_rate')]) || 0,
        stk_co_rate: parseFloat(item[fields.indexOf('stk_co_rate')]) || 0
      }))
    }
    return []
  } catch (error) {
    console.error('获取股息数据失败:', error)
    return []
  }
}

// 处理历史数据
function processHistoricalData(incomeData: any[], balanceData: any[], cashflowData: any[], dividendData: any[]) {
  // 按年度汇总数据
  const yearlyIncome = aggregateByYear(incomeData)
  const yearlyBalance = aggregateByYear(balanceData)
  const yearlyCashflow = aggregateByYear(cashflowData)
  
  // 获取最近10年的数据
  const years = Object.keys(yearlyIncome).sort((a, b) => b.localeCompare(a)).slice(0, 10)
  
  const revenue = years.map(year => yearlyIncome[year]?.revenue || 0)
  const netIncome = years.map(year => yearlyIncome[year]?.n_income || 0)
  const operatingIncome = years.map(year => yearlyIncome[year]?.operate_profit || 0)
  const freeCashFlow = years.map(year => {
    const cashflow = yearlyCashflow[year]
    if (cashflow) {
      return (cashflow.n_cashflow_act || 0) - Math.abs(cashflow.c_paid_goods_srv || 0)
    }
    return 0
  })
  
  // 计算EPS (简化处理)
  const eps = netIncome.map((income, index) => {
    const year = years[index]
    const balance = yearlyBalance[year]
    if (balance && balance.total_equity > 0) {
      return income / (balance.total_equity / 100) // 假设每股面值1元
    }
    return 0
  })
  
  // 处理股息数据
  const dividendsPaid = years.map(year => {
    const dividend = dividendData.find(d => d.year === year)
    return dividend ? dividend.cash_div : 0
  })
  
  const dividendsAndBuybacks = years.map(year => {
    const dividend = dividendData.find(d => d.year === year)
    return dividend ? dividend.cash_div + (dividend.stk_bo_rate || 0) : 0
  })
  
  return {
    years,
    revenue,
    netIncome,
    operatingIncome,
    freeCashFlow,
    eps,
    dividendsPaid,
    dividendsAndBuybacks
  }
}

// 按年度汇总数据的辅助函数
function aggregateByYear(data: any[]) {
  const yearlyData: { [year: string]: any } = {}
  
  data.forEach(item => {
    const year = item.year
    if (!yearlyData[year]) {
      yearlyData[year] = {}
    }
    
    // 累加数值字段
    Object.keys(item).forEach(key => {
      if (key !== 'year' && typeof item[key] === 'number') {
        yearlyData[year][key] = (yearlyData[year][key] || 0) + item[key]
      } else if (key !== 'year') {
        yearlyData[year][key] = item[key]
      }
    })
  })
  
  return yearlyData
}

// 处理多年期表现数据
function processPerformanceData(incomeData: any[], balanceData: any[], cashflowData: any[]) {
  const periods = ['2019-2023', '2020-2024', '2021-2024', '2022-2024', '2023-2024', 'Median']
  
  const metrics = [
    {
      name: 'Tangible Shareholder Equity',
      values: calculatePeriodMetrics(balanceData, 'total_equity', periods)
    },
    {
      name: 'Free Cash Flow',
      values: calculatePeriodMetrics(cashflowData, 'free_cash_flow', periods)
    },
    {
      name: 'CROIC',
      values: calculatePeriodMetrics(incomeData, 'croic', periods)
    },
    {
      name: 'FCF/Sales',
      values: calculatePeriodMetrics(incomeData, 'fcf_sales', periods)
    },
    {
      name: 'ROA',
      values: calculatePeriodMetrics(incomeData, 'roa', periods)
    },
    {
      name: 'ROE',
      values: calculatePeriodMetrics(incomeData, 'roe', periods)
    },
    {
      name: 'Gross Margin',
      values: calculatePeriodMetrics(incomeData, 'gross_margin', periods)
    },
    {
      name: 'Operating Margin',
      values: calculatePeriodMetrics(incomeData, 'operating_margin', periods)
    },
    {
      name: 'Net Margin',
      values: calculatePeriodMetrics(incomeData, 'net_margin', periods)
    },
    {
      name: 'Revenue Growth',
      values: calculatePeriodMetrics(incomeData, 'revenue_growth', periods)
    },
    {
      name: 'Earnings Growth',
      values: calculatePeriodMetrics(incomeData, 'earnings_growth', periods)
    },
    {
      name: 'Cash from Ops Growth',
      values: calculatePeriodMetrics(cashflowData, 'cash_flow_growth', periods)
    }
  ]
  
  return {
    periods,
    metrics
  }
}

// 计算期间指标
function calculatePeriodMetrics(data: any[], metric: string, periods: string[]): number[] {
  // 简化实现，返回模拟数据
  return periods.map(() => Math.random() * 20 - 10) // -10% 到 10% 的随机值
}

// 其他辅助函数保持不变
async function getStockBasicInfo(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'stock_basic',
      token: TUSHARE_TOKEN,
      params: { ts_code: tsCode },
      fields: 'ts_code,symbol,name,area,industry,market,list_date'
    })
    
    if (response.data.data && response.data.data.items && response.data.data.items.length > 0) {
      const fields = response.data.data.fields
      const item = response.data.data.items[0]
      
      return {
        ts_code: item[fields.indexOf('ts_code')],
        symbol: item[fields.indexOf('symbol')],
        name: item[fields.indexOf('name')],
        area: item[fields.indexOf('area')],
        industry: item[fields.indexOf('industry')],
        market: item[fields.indexOf('market')],
        list_date: item[fields.indexOf('list_date')]
      }
    }
    return null
  } catch (error) {
    console.error('获取股票基本信息失败:', error)
    return null
  }
}

async function getIncomeStatement(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'income',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20230101',
        end_date: '20241231'
      },
      fields: 'ts_code,ann_date,f_ann_date,end_date,revenue,oper_cost,operate_profit,total_profit,n_income,ebit,ebitda'
    })
    
    if (response.data.data && response.data.data.items && response.data.data.items.length > 0) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0]
      
      return {
        ts_code: item[fields.indexOf('ts_code')],
        ann_date: item[fields.indexOf('ann_date')],
        f_ann_date: item[fields.indexOf('f_ann_date')],
        end_date: item[fields.indexOf('end_date')],
        revenue: parseFloat(item[fields.indexOf('revenue')]) || 0,
        oper_cost: parseFloat(item[fields.indexOf('oper_cost')]) || 0,
        operate_profit: parseFloat(item[fields.indexOf('operate_profit')]) || 0,
        total_profit: parseFloat(item[fields.indexOf('total_profit')]) || 0,
        n_income: parseFloat(item[fields.indexOf('n_income')]) || 0,
        ebit: parseFloat(item[fields.indexOf('ebit')]) || 0,
        ebitda: parseFloat(item[fields.indexOf('ebitda')]) || 0
      }
    }
    return null
  } catch (error) {
    console.error('获取利润表数据失败:', error)
    return null
  }
}

async function getBalanceSheet(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'balancesheet',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20230101',
        end_date: '20241231'
      },
      fields: 'ts_code,ann_date,f_ann_date,end_date,total_assets,total_liab,total_equity,money_cap,total_cur_assets,total_cur_liab'
    })
    
    if (response.data.data && response.data.data.items && response.data.data.items.length > 0) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0]
      
      return {
        ts_code: item[fields.indexOf('ts_code')],
        ann_date: item[fields.indexOf('ann_date')],
        f_ann_date: item[fields.indexOf('f_ann_date')],
        end_date: item[fields.indexOf('end_date')],
        total_assets: parseFloat(item[fields.indexOf('total_assets')]) || 0,
        total_liab: parseFloat(item[fields.indexOf('total_liab')]) || 0,
        total_equity: parseFloat(item[fields.indexOf('total_equity')]) || 0,
        money_cap: parseFloat(item[fields.indexOf('money_cap')]) || 0,
        total_cur_assets: parseFloat(item[fields.indexOf('total_cur_assets')]) || 0,
        total_cur_liab: parseFloat(item[fields.indexOf('total_cur_liab')]) || 0
      }
    }
    return null
  } catch (error) {
    console.error('获取资产负债表数据失败:', error)
    return null
  }
}

async function getCashFlowStatement(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'cashflow',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20230101',
        end_date: '20241231'
      },
      fields: 'ts_code,ann_date,f_ann_date,end_date,n_cashflow_act,n_cashflow_inv_act,n_cashflow_fin_act,c_paid_goods_srv'
    })
    
    if (response.data.data && response.data.data.items && response.data.data.items.length > 0) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0]
      
      return {
        ts_code: item[fields.indexOf('ts_code')],
        ann_date: item[fields.indexOf('ann_date')],
        f_ann_date: item[fields.indexOf('f_ann_date')],
        end_date: item[fields.indexOf('end_date')],
        n_cashflow_act: parseFloat(item[fields.indexOf('n_cashflow_act')]) || 0,
        n_cashflow_inv_act: parseFloat(item[fields.indexOf('n_cashflow_inv_act')]) || 0,
        n_cashflow_fin_act: parseFloat(item[fields.indexOf('n_cashflow_fin_act')]) || 0,
        c_paid_goods_srv: parseFloat(item[fields.indexOf('c_paid_goods_srv')]) || 0
      }
    }
    return null
  } catch (error) {
    console.error('获取现金流表数据失败:', error)
    return null
  }
}

async function getDailyBasicData(tsCode: string) {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily_basic',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: startDate.toISOString().slice(0, 10).replace(/-/g, ''),
        end_date: endDate.toISOString().slice(0, 10).replace(/-/g, '')
      },
      fields: 'ts_code,trade_date,close,total_mv,pe,pb,ps'
    })
    
    if (response.data.data && response.data.data.items && response.data.data.items.length > 0) {
      const fields = response.data.data.fields
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('trade_date')]
        const dateB = b[fields.indexOf('trade_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0]
      
      return {
        ts_code: item[fields.indexOf('ts_code')],
        trade_date: item[fields.indexOf('trade_date')],
        close: parseFloat(item[fields.indexOf('close')]) || 0,
        total_mv: parseFloat(item[fields.indexOf('total_mv')]) || 0,
        pe: parseFloat(item[fields.indexOf('pe')]) || 0,
        pb: parseFloat(item[fields.indexOf('pb')]) || 0,
        ps: parseFloat(item[fields.indexOf('ps')]) || 0
      }
    }
    return null
  } catch (error) {
    console.error('获取每日基础数据失败:', error)
    return null
  }
}

// 计算财务比率
function calculateFinancialRatios(incomeData: any, balanceData: any, cashflowData: any) {
  const revenue = incomeData.revenue || 0
  const netIncome = incomeData.n_income || 0
  const operatingIncome = incomeData.operate_profit || 0
  const grossProfit = revenue - (incomeData.oper_cost || 0)
  const totalAssets = balanceData.total_assets || 0
  const totalEquity = balanceData.total_equity || 0
  const totalLiabilities = balanceData.total_liab || 0
  const currentAssets = balanceData.total_cur_assets || 0
  const currentLiabilities = balanceData.total_cur_liab || 0
  
  return {
    revenueGrowth: 0,
    profitMargin: revenue > 0 ? netIncome / revenue : 0,
    operatingMargin: revenue > 0 ? operatingIncome / revenue : 0,
    grossMargin: revenue > 0 ? grossProfit / revenue : 0,
    roe: totalEquity > 0 ? netIncome / totalEquity : 0,
    roa: totalAssets > 0 ? netIncome / totalAssets : 0,
    currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
    debtToEquity: totalEquity > 0 ? totalLiabilities / totalEquity : 0
  }
}

// 计算EBITDA
function calculateEBITDA(incomeData: any, cashflowData: any): number {
  const operatingIncome = incomeData.operate_profit || 0
  const depreciation = Math.abs(cashflowData.c_paid_goods_srv || 0) * 0.1
  return operatingIncome + depreciation
}

// 计算自由现金流
function calculateFreeCashFlow(cashflowData: any): number {
  const operatingCashFlow = cashflowData.n_cashflow_act || 0
  const capex = Math.abs(cashflowData.c_paid_goods_srv || 0)
  return operatingCashFlow - capex
}

// 计算营运资本
function calculateWorkingCapital(balanceData: any): number {
  const currentAssets = balanceData.total_cur_assets || 0
  const currentLiabilities = balanceData.total_cur_liab || 0
  return currentAssets - currentLiabilities
}

// 计算EV/EBITDA
function calculateEVEBITDA(dailyBasicData: any, incomeData: any): number {
  const marketCap = dailyBasicData?.total_mv || 0
  const ebitda = incomeData.ebitda || 0
  return ebitda > 0 ? marketCap / ebitda : 0
}

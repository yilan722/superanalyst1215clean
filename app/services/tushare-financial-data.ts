import axios from 'axios'

const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9'
const TUSHARE_API_URL = 'https://api.tushare.pro'

// DCF估值所需的财务数据接口
export interface DCFFinancialData {
  // 基础信息
  symbol: string
  name: string
  currentPrice: number
  marketCap: number
  sharesOutstanding: number
  
  // 利润表数据
  revenue: number                    // 营业收入
  netIncome: number                  // 净利润
  operatingIncome: number            // 营业利润
  grossProfit: number                // 毛利润
  ebitda: number                     // EBITDA
  
  // 现金流数据
  operatingCashFlow: number          // 经营现金流
  freeCashFlow: number               // 自由现金流
  capex: number                      // 资本支出
  investingCashFlow: number          // 投资现金流
  financingCashFlow: number          // 筹资现金流
  
  // 资产负债表数据
  totalAssets: number                // 总资产
  totalLiabilities: number           // 总负债
  shareholdersEquity: number         // 股东权益
  cashAndEquivalents: number         // 现金及现金等价物
  workingCapital: number             // 营运资本
  
  // 财务比率
  revenueGrowth: number              // 收入增长率
  profitMargin: number               // 净利润率
  operatingMargin: number            // 营业利润率
  grossMargin: number                // 毛利率
  roe: number                        // 净资产收益率
  roa: number                        // 资产收益率
  currentRatio: number               // 流动比率
  debtToEquity: number               // 负债权益比
  
  // 估值倍数
  peRatio: number                    // 市盈率
  pbRatio: number                    // 市净率
  psRatio: number                    // 市销率
  evEbitda: number                   // EV/EBITDA
  
  // 历史数据 (最近5年)
  historicalRevenue: number[]        // 历史收入
  historicalNetIncome: number[]      // 历史净利润
  historicalCashFlow: number[]       // 历史现金流
  historicalGrowth: number[]         // 历史增长率
  
  // 数据来源和时间
  dataSource: string
  lastUpdated: string
}

// 获取完整的DCF财务数据
export async function fetchDCFFinancialData(ticker: string): Promise<DCFFinancialData | null> {
  try {
    console.log(`🚀 开始获取 ${ticker} 的完整财务数据...`)
    
    // 确定市场后缀
    // 科创板(688)使用.SH，创业板(300)使用.SZ，主板(000, 002)使用.SZ，沪市主板(600, 601, 603)使用.SH
    let marketSuffix = '.SZ' // 默认深市
    if (ticker.startsWith('688')) {
      marketSuffix = '.SH' // 科创板
    } else if (ticker.startsWith('300')) {
      marketSuffix = '.SZ' // 创业板
    } else if (ticker.startsWith('600') || ticker.startsWith('601') || ticker.startsWith('603')) {
      marketSuffix = '.SH' // 沪市主板
    } else if (ticker.startsWith('000') || ticker.startsWith('002')) {
      marketSuffix = '.SZ' // 深市主板
    }
    
    const tsCode = `${ticker}${marketSuffix}`
    console.log(`📊 股票代码转换: ${ticker} -> ${tsCode}`)
    
    // 并行获取所有财务数据
    const [
      basicData,
      incomeData,
      balanceData,
      cashflowData,
      dailyBasicData
    ] = await Promise.all([
      getStockBasicInfo(tsCode),
      getIncomeStatement(tsCode),
      getBalanceSheet(tsCode),
      getCashFlowStatement(tsCode),
      getDailyBasicData(tsCode)
    ])
    
    console.log(`📊 ${ticker} 数据获取结果:`, {
      basicData: !!basicData,
      incomeData: !!incomeData,
      balanceData: !!balanceData,
      cashflowData: !!cashflowData,
      dailyBasicData: !!dailyBasicData
    })
    
    if (!basicData) {
      console.error(`❌ 无法获取 ${ticker} 的基本信息`)
      return null
    }
    
    if (!incomeData) {
      console.error(`❌ 无法获取 ${ticker} 的利润表数据`)
      return null
    }
    
    if (!balanceData) {
      console.error(`❌ 无法获取 ${ticker} 的资产负债表数据`)
      return null
    }
    
    if (!cashflowData) {
      console.error(`❌ 无法获取 ${ticker} 的现金流表数据`)
      return null
    }
    
    // 计算关键财务比率
    const financialRatios = calculateFinancialRatios(incomeData, balanceData, cashflowData)
    
    // 获取历史数据
    const historicalData = await getHistoricalFinancialData(tsCode)
    
    // 构建DCF财务数据
    const dcfData: DCFFinancialData = {
      // 基础信息
      symbol: ticker,
      name: basicData.name,
      currentPrice: dailyBasicData?.close || 0,
      marketCap: dailyBasicData?.total_mv || 0,
      sharesOutstanding: (dailyBasicData?.total_mv || 0) / (dailyBasicData?.close || 1) || 0,
      
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
      ...historicalData,
      
      // 元数据
      dataSource: 'tushare',
      lastUpdated: new Date().toISOString()
    }
    
    console.log(`✅ 成功获取 ${ticker} 的DCF财务数据`)
    return dcfData
    
  } catch (error) {
    console.error(`❌ 获取 ${ticker} DCF财务数据失败:`, error)
    return null
  }
}

// 获取股票基本信息
async function getStockBasicInfo(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'stock_basic',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode
      },
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

// 获取利润表数据
async function getIncomeStatement(tsCode: string) {
  try {
    // 先获取最新的年报数据，不指定具体日期
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
      // 获取最新的数据（按end_date排序）
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0] // 取最新的数据
      
      console.log(`📊 利润表数据获取成功: ${tsCode}`, {
        end_date: item[fields.indexOf('end_date')],
        revenue: item[fields.indexOf('revenue')],
        n_income: item[fields.indexOf('n_income')]
      })
      
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
    console.log(`⚠️ 未找到利润表数据: ${tsCode}`)
    return null
  } catch (error) {
    console.error('获取利润表数据失败:', error)
    return null
  }
}

// 获取资产负债表数据
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
      // 获取最新的数据（按end_date排序）
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0] // 取最新的数据
      
      console.log(`📊 资产负债表数据获取成功: ${tsCode}`, {
        end_date: item[fields.indexOf('end_date')],
        total_assets: item[fields.indexOf('total_assets')],
        total_equity: item[fields.indexOf('total_equity')]
      })
      
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
    console.log(`⚠️ 未找到资产负债表数据: ${tsCode}`)
    return null
  } catch (error) {
    console.error('获取资产负债表数据失败:', error)
    return null
  }
}

// 获取现金流表数据
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
      // 获取最新的数据（按end_date排序）
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0] // 取最新的数据
      
      console.log(`📊 现金流表数据获取成功: ${tsCode}`, {
        end_date: item[fields.indexOf('end_date')],
        n_cashflow_act: item[fields.indexOf('n_cashflow_act')],
        c_paid_goods_srv: item[fields.indexOf('c_paid_goods_srv')]
      })
      
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
    console.log(`⚠️ 未找到现金流表数据: ${tsCode}`)
    return null
  } catch (error) {
    console.error('获取现金流表数据失败:', error)
    return null
  }
}

// 获取每日基础数据
async function getDailyBasicData(tsCode: string) {
  try {
    // 获取最近30天的数据，然后取最新的
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
      // 获取最新的数据（按trade_date排序）
      const items = response.data.data.items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('trade_date')]
        const dateB = b[fields.indexOf('trade_date')]
        return dateB.localeCompare(dateA)
      })
      const item = items[0] // 取最新的数据
      
      console.log(`📊 每日基础数据获取成功: ${tsCode}`, {
        trade_date: item[fields.indexOf('trade_date')],
        close: item[fields.indexOf('close')],
        total_mv: item[fields.indexOf('total_mv')]
      })
      
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
    console.log(`⚠️ 未找到每日基础数据: ${tsCode}`)
    return null
  } catch (error) {
    console.error('获取每日基础数据失败:', error)
    return null
  }
}

// 获取历史财务数据
async function getHistoricalFinancialData(tsCode: string) {
  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'income',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: '20200101',
        end_date: '20241231'
      },
      fields: 'ts_code,end_date,revenue,n_income'
    })
    
    if (response.data.data && response.data.data.items) {
      const fields = response.data.data.fields
      const items = response.data.data.items
      
      const historicalRevenue: number[] = []
      const historicalNetIncome: number[] = []
      const historicalCashFlow: number[] = []
      const historicalGrowth: number[] = []
      
      // 按年份排序并提取数据
      items.sort((a: any, b: any) => {
        const dateA = a[fields.indexOf('end_date')]
        const dateB = b[fields.indexOf('end_date')]
        return dateB.localeCompare(dateA)
      })
      
      for (let i = 0; i < Math.min(items.length, 5); i++) {
        const item = items[i]
        const revenue = parseFloat(item[fields.indexOf('revenue')]) || 0
        const netIncome = parseFloat(item[fields.indexOf('n_income')]) || 0
        
        historicalRevenue.push(revenue)
        historicalNetIncome.push(netIncome)
        historicalCashFlow.push(netIncome) // 简化处理
        
        // 计算增长率
        if (i > 0) {
          const prevRevenue = parseFloat(items[i-1][fields.indexOf('revenue')]) || 0
          const growth = prevRevenue > 0 ? (revenue - prevRevenue) / prevRevenue : 0
          historicalGrowth.push(growth)
        }
      }
      
      return {
        historicalRevenue,
        historicalNetIncome,
        historicalCashFlow,
        historicalGrowth
      }
    }
    
    return {
      historicalRevenue: [],
      historicalNetIncome: [],
      historicalCashFlow: [],
      historicalGrowth: []
    }
  } catch (error) {
    console.error('获取历史财务数据失败:', error)
    return {
      historicalRevenue: [],
      historicalNetIncome: [],
      historicalCashFlow: [],
      historicalGrowth: []
    }
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
    revenueGrowth: 0, // 需要历史数据计算
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
  // 简化计算：营业利润 + 折旧摊销
  const operatingIncome = incomeData.operate_profit || 0
  const depreciation = Math.abs(cashflowData.c_paid_goods_srv || 0) * 0.1 // 估算
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

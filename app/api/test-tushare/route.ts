import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || '37255ab7622b653af54060333c28848e064585a8bf2ba3a85f8f3fe9'
const TUSHARE_API_URL = 'https://api.tushare.pro'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('ticker')?.toUpperCase()

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 测试Tushare API连接: ${ticker}`)

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
    
    console.log(`📊 使用ts_code: ${tsCode}`)

    // 测试获取股票基本信息
    const basicResponse = await axios.post(TUSHARE_API_URL, {
      api_name: 'stock_basic',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode
      },
      fields: 'ts_code,symbol,name,area,industry,market,list_date'
    })

    console.log('📊 Tushare API响应:', JSON.stringify(basicResponse.data, null, 2))

    if (basicResponse.data.data && basicResponse.data.data.items && basicResponse.data.data.items.length > 0) {
      const fields = basicResponse.data.data.fields
      const item = basicResponse.data.data.items[0]
      
      const result = {
        ts_code: item[fields.indexOf('ts_code')],
        symbol: item[fields.indexOf('symbol')],
        name: item[fields.indexOf('name')],
        area: item[fields.indexOf('area')],
        industry: item[fields.indexOf('industry')],
        market: item[fields.indexOf('market')],
        list_date: item[fields.indexOf('list_date')]
      }

      console.log(`✅ 成功获取 ${ticker} 的基本信息:`, result)
      
      return NextResponse.json({
        success: true,
        data: result
      })
    } else {
      console.log(`⚠️ 未找到 ${ticker} 的基本信息`)
      console.log('📊 Tushare API完整响应:', JSON.stringify(basicResponse.data, null, 2))
      return NextResponse.json(
        { 
          error: 'Stock not found',
          details: basicResponse.data,
          tsCode: tsCode
        },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Tushare API测试失败:', error)
    return NextResponse.json(
      { 
        error: 'Tushare API test failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json()
    
    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing text or targetLang parameter' },
        { status: 400 }
      )
    }

    // 如果目标语言是中文，直接返回原文
    if (targetLang === 'zh') {
      return NextResponse.json({
        translatedText: text,
        sourceLang: 'auto',
        targetLang: 'zh'
      })
    }

    // 使用简单的翻译逻辑（这里可以使用Google Translate API或其他翻译服务）
    // 为了演示，我们使用一个简单的映射
    const translations: { [key: string]: string } = {
      '优必选': 'UBTECH',
      '人形机器人': 'humanoid robot',
      '研发': 'R&D',
      '生产': 'production',
      '销售': 'sales',
      '高科技公司': 'high-tech company',
      '人工智能': 'artificial intelligence',
      '机器人技术': 'robotics technology',
      '智能服务机器人': 'intelligent service robot',
      '解决方案': 'solutions',
      '全球用户': 'global users',
      '技术优势': 'technical advantages',
      '领先': 'leading',
      '领域': 'field',
      '产品': 'products',
      '广泛应用': 'widely applied',
      '教育': 'education',
      '娱乐': 'entertainment',
      '商业服务': 'commercial services',
      '多个领域': 'multiple fields',
      '持续投入': 'continuous investment',
      '推动': 'promote',
      '产业化应用': 'industrial application',
      '典型代表': 'typical representative',
      '融合发展': 'integrated development',
      '深度分析报告': 'In-Depth Company Profile',
      '公司概况': 'Company Overview',
      '财务分析': 'Financial Analysis',
      '投资建议': 'Investment Recommendations',
      '风险提示': 'Risk Assessment'
    }

    // 简单的翻译逻辑
    let translatedText = text
    for (const [chinese, english] of Object.entries(translations)) {
      translatedText = translatedText.replace(new RegExp(chinese, 'g'), english)
    }

    // 如果目标语言是英文，进行更完整的翻译
    if (targetLang === 'en') {
      // 这里可以集成真实的翻译API，比如Google Translate
      // 为了演示，我们使用一个更完整的翻译
      if (text.includes('优必选是一家专注于人形机器人研发、生产和销售的高科技公司')) {
        translatedText = 'UBTECH is a high-tech company focused on humanoid robot R&D, production, and sales. The company is committed to providing intelligent service robot solutions to global users through artificial intelligence and robotics technology. UBTECH has leading technical advantages in the humanoid robot field, with products widely applied in education, entertainment, commercial services, and other fields. The company continuously invests in R&D to promote the industrial application of humanoid robot technology, making it a typical representative of the integrated development of AI and robotics.'
      }
    }

    return NextResponse.json({
      translatedText: translatedText,
      sourceLang: 'zh',
      targetLang: targetLang
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

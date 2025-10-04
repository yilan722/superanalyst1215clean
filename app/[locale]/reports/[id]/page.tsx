import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReportViewer from '@/components/ReportViewer'
import { getReportById } from '@/app/services/reports'

interface ReportPageProps {
  params: {
    id: string
    locale: string
  }
}

// 生成静态元数据
export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const report = await getReportById(params.id)
  
  if (!report) {
    return {
      title: 'Report Not Found',
      description: 'The requested report could not be found.'
    }
  }

  // 根据语言选择内容
  const isEnglish = params.locale === 'en'
  const reportData = isEnglish && report.translations?.en ? report.translations.en : report
  
  // SEO优化的标题和描述
  const title = `${reportData.title} | SuperAnalyst Pro`
  const description = reportData.summary || `Comprehensive ${report.company} (${report.symbol}) stock analysis with fundamental analysis, business segments, growth catalysts, and valuation insights. Professional equity research report by SuperAnalyst Pro.`
  
  // 生成SEO友好的关键词
  const keywords = [
    report.company,
    report.symbol,
    `${report.company} stock analysis`,
    `${report.symbol} investment research`,
    `${report.company} financial analysis`,
    `${report.symbol} equity research`,
    `${report.company} valuation`,
    `${report.symbol} DCF analysis`,
    `${report.company} fundamental analysis`,
    `${report.symbol} stock report`,
    `${report.company} investment thesis`,
    `${report.symbol} financial metrics`,
    'stock analysis',
    'investment research',
    'financial analysis',
    'equity research',
    'valuation analysis',
    'DCF analysis',
    'fundamental analysis',
    'SuperAnalyst Pro',
    'professional research',
    'investment insights'
  ]
  
  return {
    title,
    description,
    keywords,
    authors: [{ name: 'SuperAnalyst Pro Research Team' }],
    creator: 'SuperAnalyst Pro',
    publisher: 'SuperAnalyst Pro',
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: report.date,
      authors: ['SuperAnalyst Pro Research Team'],
      siteName: 'SuperAnalyst Pro',
      images: [
        {
          url: `/api/report-og-image?id=${report.id}`,
          width: 1200,
          height: 630,
          alt: report.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/report-og-image?id=${report.id}`]
    },
    alternates: {
      canonical: `https://superanalyst.pro/reports/${report.id}`
    },
    // 添加结构化数据
    other: {
      'article:section': 'Financial Analysis',
      'article:tag': keywords.join(', '),
      'article:author': 'SuperAnalyst Pro Research Team',
      'article:published_time': report.date,
      'article:modified_time': new Date().toISOString(),
      'og:type': 'article',
      'og:site_name': 'SuperAnalyst Pro',
      'og:locale': params.locale === 'zh' ? 'zh_CN' : 'en_US',
      'twitter:site': '@SuperAnalystPro',
      'twitter:creator': '@SuperAnalystPro'
    }
  }
}

// 生成静态参数
export async function generateStaticParams() {
  // 这里可以预生成一些热门报告的静态路径
  return []
}

export default async function ReportPage({ params }: ReportPageProps) {
  const report = await getReportById(params.id)
  
  if (!report) {
    notFound()
  }

  // 生成JSON-LD结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report.title,
    "description": report.summary,
    "author": {
      "@type": "Organization",
      "name": "SuperAnalyst Pro Research Team",
      "url": "https://superanalyst.pro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SuperAnalyst Pro",
      "url": "https://superanalyst.pro",
      "logo": {
        "@type": "ImageObject",
        "url": "https://superanalyst.pro/logo.png"
      }
    },
    "datePublished": report.date,
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://superanalyst.pro/reports/${report.id}`
    },
    "about": {
      "@type": "Organization",
      "name": report.company,
      "tickerSymbol": report.symbol
    },
    "keywords": [
      report.company,
      report.symbol,
      "stock analysis",
      "investment research",
      "financial analysis",
      "equity research"
    ].join(", "),
    "articleSection": "Financial Analysis",
    "inLanguage": params.locale === 'zh' ? 'zh-CN' : 'en-US'
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReportViewer report={report} locale={params.locale} />
    </>
  )
}

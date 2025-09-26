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
  
  const title = `${reportData.title} | SuperAnalyst Pro`
  const description = reportData.summary || `In-depth analysis of ${report.company} (${report.symbol}) by SuperAnalyst Pro`
  
  return {
    title,
    description,
    keywords: [
      report.company,
      report.symbol,
      'stock analysis',
      'investment research',
      'financial analysis',
      'equity research',
      'valuation',
      'DCF analysis',
      'fundamental analysis',
      'SuperAnalyst Pro'
    ],
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

  return <ReportViewer report={report} locale={params.locale} />
}

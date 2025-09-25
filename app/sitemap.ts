import { MetadataRoute } from 'next'
import { getAllReports } from '@/lib/reports'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reports = await getAllReports()
  
  const reportUrls = reports.map((report) => ({
    url: `https://superanalyst.pro/reports/${report.id}`,
    lastModified: new Date(report.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  return [
    {
      url: 'https://superanalyst.pro',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://superanalyst.pro/reports',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...reportUrls,
  ]
}
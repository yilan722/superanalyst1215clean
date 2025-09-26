import { NextRequest, NextResponse } from 'next/server'
import { getReportById } from '@/app/services/reports'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return new NextResponse('Missing report ID', { status: 400 })
    }
    
    const report = await getReportById(id)
    if (!report) {
      return new NextResponse('Report not found', { status: 404 })
    }
    
    // 生成 SVG 图片
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <!-- Content -->
        <rect x="60" y="60" width="1080" height="510" fill="white" rx="12"/>
        
        <!-- Logo/Title -->
        <text x="100" y="140" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#1e40af">
          SuperAnalyst Pro
        </text>
        
        <!-- Report Title -->
        <text x="100" y="200" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1f2937">
          ${report.title.length > 60 ? report.title.substring(0, 60) + '...' : report.title}
        </text>
        
        <!-- Company Info -->
        <text x="100" y="250" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">
          ${report.company} (${report.symbol})
        </text>
        
        <!-- Summary -->
        <text x="100" y="300" font-family="Arial, sans-serif" font-size="16" fill="#374151">
          ${report.summary.length > 120 ? report.summary.substring(0, 120) + '...' : report.summary}
        </text>
        
        <!-- Date -->
        <text x="100" y="450" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
          ${new Date(report.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </text>
        
        <!-- URL -->
        <text x="100" y="480" font-family="Arial, sans-serif" font-size="14" fill="#3b82f6">
          superanalyst.pro/reports/${report.id}
        </text>
        
        <!-- Chart placeholder -->
        <rect x="700" y="150" width="400" height="300" fill="#f3f4f6" rx="8" stroke="#e5e7eb" stroke-width="2"/>
        <text x="900" y="300" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">
          Financial Analysis
        </text>
        <text x="900" y="330" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">
          Charts &amp; Insights
        </text>
      </svg>
    `
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

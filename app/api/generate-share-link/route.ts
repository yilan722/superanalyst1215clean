import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface ShareLinkRequest {
  reportId: string
  title: string
  company: string
  symbol: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'email'
  customMessage?: string
}

interface ShareLinkResponse {
  shareUrl: string
  shortUrl: string
  platform: string
  trackingId: string
  analytics: {
    clicks: number
    conversions: number
    lastClicked: string | null
  }
}

// 生成短链接
function generateShortUrl(reportId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://superanalyst.pro'
  return `${baseUrl}/s/${reportId}`
}

// 生成跟踪ID
function generateTrackingId(): string {
  return crypto.randomBytes(8).toString('hex')
}

// 生成平台特定的分享URL
function generatePlatformUrl(platform: string, shareUrl: string, title: string, customMessage?: string): string {
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedMessage = encodeURIComponent(customMessage || '')

  switch (platform) {
    case 'linkedin':
      const linkedinMessage = customMessage || `Check out this comprehensive analysis: ${title}`
      return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedinMessage)}`
    
    case 'twitter':
      const twitterMessage = customMessage || `🚀 ${title} - Comprehensive equity analysis on SuperAnalyst Pro`
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}&url=${encodedUrl}`
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    
    case 'email':
      const emailSubject = `Check out this analysis: ${title}`
      const emailBody = `I found this interesting analysis of ${title} on SuperAnalyst Pro:\n\n${shareUrl}\n\nBest regards`
      return `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    default:
      return shareUrl
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ShareLinkRequest = await request.json()
    const { reportId, title, company, symbol, platform, customMessage } = body

    if (!reportId || !title || !company || !symbol || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 生成分享URL
    const shareUrl = generateShortUrl(reportId)
    const platformUrl = generatePlatformUrl(platform, shareUrl, title, customMessage)
    const trackingId = generateTrackingId()

    // 这里可以添加数据库存储逻辑来跟踪分享数据
    // 暂时返回模拟数据
    const response: ShareLinkResponse = {
      shareUrl,
      shortUrl: shareUrl,
      platform,
      trackingId,
      analytics: {
        clicks: 0,
        conversions: 0,
        lastClicked: null
      }
    }

    return NextResponse.json({ success: true, data: response })

  } catch (error) {
    console.error('Error generating share link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate share link' },
      { status: 500 }
    )
  }
}

// 获取分享统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get('trackingId')

    if (!trackingId) {
      return NextResponse.json(
        { success: false, error: 'Tracking ID required' },
        { status: 400 }
      )
    }

    // 这里应该从数据库获取真实的统计数据
    // 暂时返回模拟数据
    const analytics = {
      clicks: Math.floor(Math.random() * 100),
      conversions: Math.floor(Math.random() * 10),
      lastClicked: new Date().toISOString(),
      platforms: {
        linkedin: Math.floor(Math.random() * 50),
        twitter: Math.floor(Math.random() * 30),
        facebook: Math.floor(Math.random() * 20),
        email: Math.floor(Math.random() * 15)
      }
    }

    return NextResponse.json({ success: true, data: analytics })

  } catch (error) {
    console.error('Error fetching share analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, FileText } from 'lucide-react'
import { type Locale } from '@/src/services/i18n'
import { getTranslation } from '@/src/services/translations'
import { useAuthContext } from '@/src/services/auth-context'

interface SuccessPageProps {
  params: {
    locale: Locale
  }
}

function PaymentSuccessContent({ params }: SuccessPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale } = params
  const { refreshUserData } = useAuthContext()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId) {
      // Verify the session with your backend
      verifySession(sessionId)
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSessionData(data)
      } else {
        console.error('Session verification failed:', data.error)
      }
    } catch (error) {
      console.error('Error verifying session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = async () => {
    // First refresh user data to get latest subscription info
    console.log('🔄 支付成功，刷新用户数据...')
    await refreshUserData()
    
    // Wait a moment for the refresh to complete
    setTimeout(() => {
      // Force a complete page refresh to update user state
      // This ensures the auth context is reinitialized with updated user data
      window.location.href = `/${locale}?refresh=${Date.now()}`
    }, 1000)
  }

  const handleViewReports = () => {
    router.push(`/${locale}/reports`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p>
            {locale === 'zh' ? '验证支付中...' : 'Verifying payment...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          {locale === 'zh' ? '支付成功！' : 'Payment Successful!'}
        </h1>
        
        <p className="text-slate-600 mb-6">
          {locale === 'zh' 
            ? '感谢您的订阅！您的账户已激活，现在可以开始使用所有功能。'
            : 'Thank you for your subscription! Your account has been activated and you can now access all features.'
          }
        </p>

        {/* Subscription Details */}
        {sessionData && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              {locale === 'zh' ? '订阅详情' : 'Subscription Details'}
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>
                <span className="font-medium">
                  {locale === 'zh' ? '计划：' : 'Plan: '}
                </span>
                {sessionData.planName}
              </p>
              <p>
                <span className="font-medium">
                  {locale === 'zh' ? '价格：' : 'Price: '}
                </span>
                ${sessionData.amount / 100} / {locale === 'zh' ? '月' : 'month'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewReports}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>
              {locale === 'zh' ? '查看报告历史' : 'View Report History'}
            </span>
          </button>

          <button
            onClick={handleContinue}
            className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>
              {locale === 'zh' ? '返回首页' : 'Return to Home'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-slate-500">
          <p>
            {locale === 'zh' 
              ? '如有任何问题，请联系我们的客服团队。'
              : 'If you have any questions, please contact our support team.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage({ params }: SuccessPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p>
            {params.locale === 'zh' ? '加载中...' : 'Loading...'}
          </p>
        </div>
      </div>
    }>
      <PaymentSuccessContent params={params} />
    </Suspense>
  )
}


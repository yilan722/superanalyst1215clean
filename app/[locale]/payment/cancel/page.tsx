'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { type Locale } from '@/src/services/i18n'

interface CancelPageProps {
  params: {
    locale: Locale
  }
}

export default function PaymentCancelPage({ params }: CancelPageProps) {
  const router = useRouter()
  const { locale } = params

  const handleRetry = () => {
    router.push(`/${locale}`)
  }

  const handleGoHome = () => {
    router.push(`/${locale}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          {locale === 'zh' ? '支付已取消' : 'Payment Cancelled'}
        </h1>
        
        <p className="text-slate-600 mb-6">
          {locale === 'zh' 
            ? '您的支付已被取消。如果您需要帮助或想要重试，请随时联系我们。'
            : 'Your payment has been cancelled. If you need help or would like to try again, please don\'t hesitate to contact us.'
          }
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              {locale === 'zh' ? '重试支付' : 'Try Again'}
            </span>
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {locale === 'zh' ? '返回首页' : 'Return to Home'}
            </span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-slate-500">
          <p>
            {locale === 'zh' 
              ? '如果您遇到任何技术问题，请联系我们的技术支持团队。'
              : 'If you encountered any technical issues, please contact our technical support team.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}


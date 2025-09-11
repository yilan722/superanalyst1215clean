'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import StripeCheckout from './StripeCheckout'
import { getTranslation } from '../lib/translations'
import { Locale } from '../lib/i18n'
import { supabase } from '../lib/supabase-client'

interface SubscriptionPlan {
  id: string
  name: string
  monthlyFee: number
  description: string
  features: string[]
  icon: React.ReactNode
}

interface StripeSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  locale: Locale
  selectedPlan: SubscriptionPlan | null
}

export default function StripeSubscriptionModal({ 
  isOpen, 
  onClose, 
  userId, 
  locale, 
  selectedPlan 
}: StripeSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStripeSuccess = () => {
    toast.success(
      locale === 'zh' 
        ? '支付成功！您的订阅已激活。' 
        : 'Payment successful! Your subscription has been activated.'
    )
    onClose()
  }

  const handleStripeError = (error: string) => {
    toast.error(error)
  }

  const handleStripeCancel = () => {
    onClose()
  }

  if (!isOpen || !selectedPlan) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {locale === 'zh' ? '完成支付' : 'Complete Payment'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {selectedPlan.name} - ${selectedPlan.monthlyFee}/month
            </p>
          </div>
          <button
            onClick={handleStripeCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              {selectedPlan.icon}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{selectedPlan.name}</h4>
              <p className="text-sm text-slate-600">{selectedPlan.description}</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${selectedPlan.monthlyFee}
            <span className="text-lg font-normal text-slate-600">
              /{locale === 'zh' ? '月' : 'month'}
            </span>
          </div>
        </div>

        {/* Stripe Checkout */}
        <StripeCheckout
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.monthlyFee}
          userId={userId}
          onSuccess={handleStripeSuccess}
          onError={handleStripeError}
          onCancel={handleStripeCancel}
          locale={locale}
        />

        <div className="mt-6 text-xs text-slate-500 text-center">
          <p>
            {locale === 'zh' 
              ? '安全支付，由Stripe提供支持'
              : 'Secure payment powered by Stripe'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
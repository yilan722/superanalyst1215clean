'use client'

import React, { useState } from 'react'
import { X, Check, CreditCard, Zap, Crown, Star, TrendingUp, Shield, Headphones, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import UserAgreementModal from './UserAgreementModal'
import StripeCheckout from './StripeCheckout'
import { getTranslation } from '../lib/translations'
import { Locale } from '../lib/i18n'
import { SUBSCRIPTION_PLANS } from '../lib/stripe-config'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  locale: Locale
}

export default function StripeSubscriptionModal({ isOpen, onClose, userId, locale }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)
  const [showStripePayment, setShowStripePayment] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState<any>(null)

  const plans = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    monthlyFee: plan.price,
    features: plan.features,
    reportLimit: plan.reportLimit,
    icon: plan.id === 'basic' ? <Zap className="w-6 h-6" /> : 
          plan.id === 'professional' ? <TrendingUp className="w-6 h-6" /> : 
          <Crown className="w-6 h-6" />,
    popular: plan.id === 'professional',
    bestValue: plan.id === 'business',
  }))

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = async (planId: string) => {
    if (!userId) {
      toast.error(getTranslation(locale, 'loginRequired'))
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan) {
      toast.error(getTranslation(locale, 'invalidPlan'))
      return
    }

    // Show agreement modal first
    setPendingPlanId(planId)
    setShowAgreement(true)
  }

  const handleAgreementConfirm = async () => {
    if (!pendingPlanId) return

    const plan = plans.find(p => p.id === pendingPlanId)
    if (!plan) {
      toast.error(getTranslation(locale, 'invalidPlan'))
      return
    }

    // Show Stripe payment interface
    setPaymentPlan(plan)
    setShowStripePayment(true)
    setShowAgreement(false)
    setPendingPlanId(null)
  }

  const handleStripeSuccess = () => {
    toast.success(
      locale === 'zh' 
        ? '支付成功！您的订阅已激活。' 
        : 'Payment successful! Your subscription has been activated.'
    )
    onClose()
    setShowStripePayment(false)
    setPaymentPlan(null)
  }

  const handleStripeError = (error: string) => {
    toast.error(error)
    setShowStripePayment(false)
    setPaymentPlan(null)
  }

  const handleStripeCancel = () => {
    setShowStripePayment(false)
    setPaymentPlan(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {getTranslation(locale, 'choosePlan')}
            </h2>
            <p className="text-slate-600 mt-1">
              {getTranslation(locale, 'choosePlanDescription')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${plan.popular ? 'ring-2 ring-amber-500' : ''}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {locale === 'zh' ? '最受欢迎' : 'Most Popular'}
                    </span>
                  </div>
                )}

                {/* Best Value Badge */}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {locale === 'zh' ? '最佳价值' : 'Best Value'}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-4">
                  <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-slate-600 text-sm mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-slate-900">
                    ${plan.monthlyFee}
                    <span className="text-lg font-normal text-slate-600">
                      /{locale === 'zh' ? '月' : 'month'}
                    </span>
                  </div>
                  {plan.reportLimit === -1 ? (
                    <p className="text-sm text-slate-600 mt-1">
                      {locale === 'zh' ? '无限报告' : 'Unlimited reports'}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 mt-1">
                      {plan.reportLimit} {locale === 'zh' ? '个报告/月' : 'reports/month'}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {selectedPlan === plan.id
                    ? (locale === 'zh' ? '已选择' : 'Selected')
                    : (locale === 'zh' ? '选择此计划' : 'Choose Plan')
                  }
                </button>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          {selectedPlan && (
            <div className="mt-8 text-center">
              <button
                onClick={() => handleSubscribe(selectedPlan)}
                className="bg-amber-600 text-white py-3 px-8 rounded-lg hover:bg-amber-700 transition-colors font-medium text-lg"
              >
                {locale === 'zh' ? '立即订阅' : 'Subscribe Now'}
              </button>
            </div>
          )}
        </div>

        {/* User Agreement Modal */}
        {showAgreement && (
          <UserAgreementModal
            isOpen={showAgreement}
            onClose={() => setShowAgreement(false)}
            onConfirm={handleAgreementConfirm}
            locale={locale}
          />
        )}

        {/* Stripe Payment Modal */}
        {showStripePayment && paymentPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {locale === 'zh' ? '完成支付' : 'Complete Payment'}
                </h3>
                <button
                  onClick={handleStripeCancel}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <StripeCheckout
                planId={paymentPlan.id}
                planName={paymentPlan.name}
                planPrice={paymentPlan.monthlyFee}
                userId={userId}
                locale={locale}
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                onCancel={handleStripeCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


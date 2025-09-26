'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, CreditCard, FileText, LogOut, ChevronDown, Settings, BarChart3 } from 'lucide-react'
import { useAuthContext } from '@/app/services/auth-context'

interface UserDropdownProps {
  userData: any
  locale: string
  onOpenAccount?: () => void
}

export default function UserDropdown({ userData, locale, onOpenAccount }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { signOut } = useAuthContext()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getSubscriptionStatus = () => {
    if (!userData?.subscription_type) {
      return {
        name: locale === 'zh' ? '免费用户' : 'Free User',
        color: 'text-slate-500',
        bgColor: 'bg-slate-100'
      }
    }

    switch (userData.subscription_type) {
      case 'basic':
        return {
          name: locale === 'zh' ? '基础会员' : 'Basic Member',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        }
      case 'professional':
        return {
          name: locale === 'zh' ? '专业会员' : 'Pro Member',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        }
      case 'business':
        return {
          name: locale === 'zh' ? '企业会员' : 'Business Member',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100'
        }
      default:
        return {
          name: locale === 'zh' ? '未知会员' : 'Unknown Member',
          color: 'text-slate-500',
          bgColor: 'bg-slate-100'
        }
    }
  }

  const subscriptionStatus = getSubscriptionStatus()

  const handleManageSubscription = () => {
    setIsOpen(false)
    router.push(`/${locale}/subscription`)
  }

  const handleReportHub = () => {
    setIsOpen(false)
    router.push(`/${locale}/reports`)
  }

  const handleAccount = () => {
    setIsOpen(false)
    router.push(`/${locale}/account`)
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push(`/${locale}`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!userData?.subscription_id) {
      alert(locale === 'zh' ? '没有找到订阅信息' : 'No subscription found')
      return
    }

    const confirmed = confirm(
      locale === 'zh' 
        ? '确定要取消订阅吗？取消后您将失去所有付费功能。' 
        : 'Are you sure you want to cancel your subscription? You will lose access to all paid features.'
    )

    if (!confirmed) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subscriptionId: userData.subscription_id
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(locale === 'zh' ? '订阅已成功取消' : 'Subscription cancelled successfully')
        // Refresh the page to update user data
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      alert(locale === 'zh' ? '取消订阅失败，请重试' : 'Failed to cancel subscription, please try again')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => onOpenAccount ? onOpenAccount() : setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-slate-800 transition-colors w-full"
        disabled={isLoading}
      >
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-3 h-3 text-white" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-300 truncate">
            {userData?.name || userData?.email || 'User'}
          </p>
          <p className={`text-xs truncate ${subscriptionStatus.color.replace('text-', 'text-slate-')}`}>
            {subscriptionStatus.name}
          </p>
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-slate-800 rounded-md shadow-lg border border-slate-700 py-1 z-50">
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">
                  {userData?.name || userData?.email || 'User'}
                </p>
                <p className={`text-xs truncate ${subscriptionStatus.color.replace('text-', 'text-slate-')}`}>
                  {subscriptionStatus.name}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleAccount}
              className="w-full flex items-center px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-3 h-3 mr-2" />
              {locale === 'zh' ? '我的账户' : 'My Account'}
            </button>

            <button
              onClick={handleManageSubscription}
              className="w-full flex items-center px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <CreditCard className="w-3 h-3 mr-2" />
              {locale === 'zh' ? '订阅管理' : 'Manage Subscription'}
            </button>

            <button
              onClick={handleReportHub}
              className="w-full flex items-center px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <BarChart3 className="w-3 h-3 mr-2" />
              {locale === 'zh' ? '报告中心' : 'Report Hub'}
            </button>

            <button
              onClick={handleReportHub}
              className="w-full flex items-center px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <FileText className="w-3 h-3 mr-2" />
              {locale === 'zh' ? '报告历史' : 'Report History'}
            </button>

            <div className="border-t border-slate-700 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/20 transition-colors"
              disabled={isLoading}
            >
              <LogOut className="w-3 h-3 mr-2" />
              {isLoading 
                ? (locale === 'zh' ? '登出中...' : 'Logging out...')
                : (locale === 'zh' ? '登出' : 'Logout')
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, CreditCard, FileText, LogOut, ChevronDown, Settings, BarChart3 } from 'lucide-react'
import { useAuthContext } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase-client'

interface HeaderUserDropdownProps {
  userData: any
  locale: string
}

export default function HeaderUserDropdown({ userData, locale }: HeaderUserDropdownProps) {
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
    console.log('🔗 跳转到订阅管理页面')
    setIsOpen(false)
    // 添加小延迟让认证状态同步
    setTimeout(() => {
      router.push(`/${locale}/subscription`)
    }, 100)
  }

  const handleReportHub = () => {
    console.log('🔗 跳转到报告中心页面')
    setIsOpen(false)
    // 添加小延迟让认证状态同步
    setTimeout(() => {
      router.push(`/${locale}/reports`)
    }, 100)
  }

  const handleAccount = () => {
    console.log('🔗 跳转到账户页面')
    setIsOpen(false)
    // 添加小延迟让认证状态同步
    setTimeout(() => {
      router.push(`/${locale}/account`)
    }, 100)
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        disabled={isLoading}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {userData?.name || userData?.email || 'User'}
          </p>
          <p className={`text-xs ${subscriptionStatus.color}`}>
            {subscriptionStatus.name}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData?.name || userData?.email || 'User'}
                </p>
                <p className={`text-xs ${subscriptionStatus.color}`}>
                  {subscriptionStatus.name}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleAccount}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              {locale === 'zh' ? '我的账户' : 'My Account'}
            </button>

            <button
              onClick={handleManageSubscription}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-3" />
              {locale === 'zh' ? '订阅管理' : 'Manage Subscription'}
            </button>

            <button
              onClick={handleReportHub}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              {locale === 'zh' ? '报告中心' : 'Report Hub'}
            </button>

            <button
              onClick={handleReportHub}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-4 h-4 mr-3" />
              {locale === 'zh' ? '报告历史' : 'Report History'}
            </button>

            {/* Cancel Subscription (only if user has active subscription) */}
            {userData?.subscription_type && userData?.subscription_type !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4 mr-3" />
                {isLoading 
                  ? (locale === 'zh' ? '取消中...' : 'Cancelling...')
                  : (locale === 'zh' ? '取消订阅' : 'Cancel Subscription')
                }
              </button>
            )}

            <div className="border-t border-gray-100 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-3" />
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

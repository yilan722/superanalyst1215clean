'use client'

import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuth from '../../lib/useAuth'
import { supabase } from '../../lib/supabase-client'
import toast from 'react-hot-toast'

export default function TestStripeFixPage() {
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const testStripeAPI = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('🧪 测试Stripe API...')
      
      // 获取当前会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('无法获取用户会话')
      }

      console.log('✅ 用户会话获取成功')

      // 测试创建checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId: 'basic',
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      })

      const result = await response.json()
      console.log('API响应:', result)

      if (!response.ok) {
        throw new Error(result.error || 'API调用失败')
      }

      setTestResult('✅ Stripe API测试成功！')
      toast.success('Stripe API测试成功')
      
      // 如果有URL，显示重定向按钮
      if (result.url) {
        setTestResult(prev => prev + `\n\n重定向URL: ${result.url}`)
      }

    } catch (error) {
      console.error('❌ Stripe API测试失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setTestResult(`❌ 测试失败: ${errorMessage}`)
      toast.error(`测试失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testUserData = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('🧪 测试用户数据获取...')
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('无法获取用户会话')
      }

      // 测试用户数据API
      const response = await fetch('/api/test-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()
      console.log('用户数据API响应:', result)

      if (!response.ok) {
        throw new Error(result.error || '用户数据API调用失败')
      }

      setTestResult('✅ 用户数据获取成功！\n\n' + JSON.stringify(result, null, 2))
      toast.success('用户数据获取成功')

    } catch (error) {
      console.error('❌ 用户数据获取失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setTestResult(`❌ 用户数据获取失败: ${errorMessage}`)
      toast.error(`用户数据获取失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p>需要登录才能测试Stripe支付功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Stripe支付修复测试</h1>
        
        {/* 当前用户信息 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">当前用户信息</h2>
          <div className="space-y-2">
            <p><strong>用户ID:</strong> {user.id}</p>
            <p><strong>邮箱:</strong> {user.email}</p>
            <p><strong>姓名:</strong> {user.name || '未设置'}</p>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">测试功能</h2>
          <div className="space-x-4">
            <button
              onClick={testUserData}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md"
            >
              {isLoading ? '测试中...' : '测试用户数据获取'}
            </button>
            
            <button
              onClick={testStripeAPI}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md"
            >
              {isLoading ? '测试中...' : '测试Stripe API'}
            </button>
          </div>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-700 p-4 rounded">
              {testResult}
            </pre>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <div className="space-y-2 text-sm">
            <p>1. <strong>测试用户数据获取</strong>：验证认证和用户数据查询是否正常</p>
            <p>2. <strong>测试Stripe API</strong>：验证Stripe checkout session创建是否正常</p>
            <p>3. 如果测试成功，说明Stripe支付功能已修复</p>
            <p>4. 如果测试失败，请查看控制台错误信息</p>
          </div>
        </div>
      </div>
    </div>
  )
}

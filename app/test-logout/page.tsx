'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'
import useAuth from '../../lib/useAuth'

export default function TestLogoutPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<{[key: string]: any}>({})
  const { forceSignOut } = useAuth()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
        }
        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }
    
    checkUser()
  }, [])

  const testLogout = async () => {
    try {
      console.log('🧪 开始测试登出...')
      
      // 测试1: 直接调用Supabase signOut
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('❌ Supabase signOut failed:', signOutError)
        setTestResults(prev => ({ ...prev, supabaseSignOut: { error: signOutError.message } }))
      } else {
        console.log('✅ Supabase signOut successful')
        setTestResults(prev => ({ ...prev, supabaseSignOut: { success: true } }))
      }
      
      // 测试2: 调用forceSignOut
      console.log('🧪 测试forceSignOut...')
      forceSignOut()
      setTestResults(prev => ({ ...prev, forceSignOut: { success: true } }))
      
      // 测试3: 检查用户状态
      setTimeout(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        console.log('🧪 登出后用户状态:', currentUser)
        setTestResults(prev => ({ ...prev, userAfterLogout: { user: currentUser } }))
        setUser(currentUser)
      }, 1000)
      
    } catch (error) {
      console.error('❌ 测试登出失败:', error)
      setTestResults(prev => ({ ...prev, error: error.message }))
    }
  }

  const testPayment = async () => {
    try {
      console.log('🧪 开始测试支付...')
      
      // 检查用户状态
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      console.log('🧪 支付测试 - 当前用户:', currentUser)
      
      if (!currentUser) {
        setTestResults(prev => ({ ...prev, paymentTest: { error: 'No user found' } }))
        return
      }
      
      // 测试创建checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          planId: 'basic',
          userId: currentUser.id
        })
      })
      
      const result = await response.json()
      console.log('🧪 支付测试结果:', result)
      setTestResults(prev => ({ ...prev, paymentTest: result }))
      
    } catch (error) {
      console.error('❌ 测试支付失败:', error)
      setTestResults(prev => ({ ...prev, paymentTest: { error: error.message } }))
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">登出和支付测试页面</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">当前用户状态</h2>
        <p>用户ID: {user?.id || '未登录'}</p>
        <p>邮箱: {user?.email || 'N/A'}</p>
        <p>登录状态: {user ? '已登录' : '未登录'}</p>
      </div>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={testLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          测试登出
        </button>
        
        <button
          onClick={testPayment}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          测试支付
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">测试结果</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>这个页面用于测试登出和支付功能是否正常工作。</p>
        <p>请打开浏览器控制台查看详细的调试信息。</p>
      </div>
    </div>
  )
}

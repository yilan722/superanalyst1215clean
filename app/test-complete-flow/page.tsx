'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../lib/useAuth'
import { supabase } from '../../lib/supabase-client'
import toast from 'react-hot-toast'
import SubscriptionModal from '../../components/SubscriptionModal'
import { Locale } from '../../lib/i18n'

export default function TestCompleteFlow() {
  const { user, loading, forceUpdate } = useAuth()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [testStep, setTestStep] = useState('')

  // 自动登录测试用户
  useEffect(() => {
    const autoLogin = async () => {
      if (!user && !loading) {
        setTestStep('正在自动登录...')
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'liuyilan72@outlook.com',
            password: 'test123'
          })
          
          if (error) {
            console.log('登录失败，尝试注册用户:', error.message)
            
            // 如果登录失败，尝试注册用户
            const { data: signupData, error: signupError } = await supabase.auth.signUp({
              email: 'liuyilan72@outlook.com',
              password: 'test123'
            })
            
            if (signupError) {
              setTestStep('注册失败: ' + signupError.message)
            } else {
              setTestStep('用户注册成功! 正在登录...')
              
              // 注册成功后再次尝试登录
              const { data: retryLoginData, error: retryLoginError } = await supabase.auth.signInWithPassword({
                email: 'liuyilan72@outlook.com',
                password: 'test123'
              })
              
              if (retryLoginError) {
                setTestStep('注册后登录失败: ' + retryLoginError.message)
              } else {
                setTestStep('登录成功!')
                forceUpdate()
              }
            }
          } else {
            setTestStep('登录成功!')
            forceUpdate()
          }
        } catch (error) {
          setTestStep('认证错误: ' + error)
        }
      }
    }

    autoLogin()
  }, [user, loading, forceUpdate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">{testStep}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            完整支付流程测试
          </h1>

          {/* 状态显示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">当前状态</h2>
            <p className="text-blue-800">用户: {user ? user.email : '未登录'}</p>
            <p className="text-blue-800">用户ID: {user ? user.id : 'N/A'}</p>
            <p className="text-blue-800">测试步骤: {testStep}</p>
          </div>

          {user ? (
            <>
              {/* 测试说明 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <h2 className="text-lg font-semibold text-green-900 mb-2">✅ 登录成功！现在可以测试支付流程</h2>
                <ol className="text-green-800 space-y-2">
                  <li>1. 点击下面的"打开订阅模态框"按钮</li>
                  <li>2. 选择一个付费计划（Basic Plan $49/月 或 Pro Plan $99/月）</li>
                  <li>3. 确认用户协议</li>
                  <li>4. 在支付页面输入优惠券码：<code className="bg-green-200 px-2 py-1 rounded">LIUYILAN45A</code></li>
                  <li>5. 点击应用优惠券，应该会显示折扣后的价格</li>
                  <li>6. 点击支付按钮，应该会跳转到Stripe支付页面</li>
                </ol>
              </div>

              {/* 测试按钮 */}
              <div className="text-center">
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  打开订阅模态框
                </button>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold text-red-900 mb-2">❌ 登录失败</h2>
              <p className="text-red-800">无法自动登录，请手动登录后测试</p>
              <p className="text-red-800 mt-2">错误信息: {testStep}</p>
            </div>
          )}

          {/* 订阅模态框 */}
          <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
            userId={user?.id || ''}
            locale="zh" as Locale
          />
        </div>
      </div>
    </div>
  )
}

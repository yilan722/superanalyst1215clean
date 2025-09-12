'use client'

import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuth from '../../lib/useAuth'
import { signIn, signUp, signOut } from '../../lib/supabase-auth'
import toast from 'react-hot-toast'

export default function TestAuthFixPage() {
  const { user, loading, forceSignOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleTestLogin = async () => {
    if (!email || !password) {
      toast.error('请输入邮箱和密码')
      return
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
        toast.success('登录成功！')
      } else {
        await signUp(email, password, name)
        toast.success('注册成功！')
      }
    } catch (error) {
      console.error('认证错误:', error)
      toast.error(error instanceof Error ? error.message : '认证失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      toast.success('登出成功！')
    } catch (error) {
      console.error('登出错误:', error)
      toast.error('登出失败，使用强制登出')
      forceSignOut()
    } finally {
      setIsLoading(false)
    }
  }

  const clearForm = () => {
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">认证系统测试页面</h1>
        
        {/* 当前状态 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">当前状态</h2>
          <div className="space-y-2">
            <p><strong>加载中:</strong> {loading ? '是' : '否'}</p>
            <p><strong>用户ID:</strong> {user?.id || '未登录'}</p>
            <p><strong>用户邮箱:</strong> {user?.email || '未登录'}</p>
            <p><strong>用户名称:</strong> {user?.name || '未登录'}</p>
          </div>
        </div>

        {/* 认证表单 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isLogin ? '登录测试' : '注册测试'}
          </h2>
          
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="输入姓名"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="输入邮箱"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="输入密码"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleTestLogin}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md"
              >
                {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </button>
              
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
              >
                {isLogin ? '切换到注册' : '切换到登录'}
              </button>
              
              <button
                onClick={clearForm}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
              >
                清空表单
              </button>
            </div>
          </div>
        </div>

        {/* 登出测试 */}
        {user && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">登出测试</h2>
            <button
              onClick={handleTestLogout}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-md"
            >
              {isLoading ? '登出中...' : '登出'}
            </button>
          </div>
        )}

        {/* 测试说明 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <div className="space-y-2 text-sm">
            <p>1. 测试注册新账号</p>
            <p>2. 测试登录</p>
            <p>3. 测试登出</p>
            <p>4. 测试登出后重新登录不同账号</p>
            <p>5. 检查状态是否正确更新</p>
          </div>
        </div>
      </div>
    </div>
  )
}


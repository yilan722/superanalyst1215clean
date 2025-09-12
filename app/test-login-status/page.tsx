'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'
import useAuth from '../../lib/useAuth'
import toast from 'react-hot-toast'

export default function TestLoginStatus() {
  const [directSession, setDirectSession] = useState<any>(null)
  const [useAuthUser, setUseAuthUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { user: authUser, loading: authLoading } = useAuth()

  useEffect(() => {
    const checkSessions = async () => {
      try {
        // 直接检查Supabase会话
        const { data: { session }, error } = await supabase.auth.getSession()
        setDirectSession(session)
        
        // 检查useAuth状态
        setUseAuthUser(authUser)
        
        console.log('🔍 直接会话检查:', { session, error })
        console.log('🔍 useAuth状态:', { authUser, authLoading })
        
      } catch (error) {
        console.error('❌ 会话检查错误:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSessions()
  }, [authUser, authLoading])

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'liuyilan72@outlook.com',
        password: 'test123'
      })
      
      if (error) {
        // 如果登录失败，尝试注册
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'liuyilan72@outlook.com',
          password: 'test123',
          options: {
            data: {
              name: 'Test User'
            }
          }
        })
        
        if (signUpError) {
          throw signUpError
        }
        
        toast.success('Account created! Please check your email.')
      } else {
        toast.success('Logged in successfully!')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed: ' + (error as any).message)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully!')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed: ' + (error as any).message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Login Status Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Direct Session Check */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Direct Supabase Session</h2>
            {directSession ? (
              <div className="space-y-2 text-green-400">
                <p><strong>Status:</strong> ✅ Logged In</p>
                <p><strong>User ID:</strong> {directSession.user.id}</p>
                <p><strong>Email:</strong> {directSession.user.email}</p>
                <p><strong>Created:</strong> {new Date(directSession.user.created_at).toLocaleString()}</p>
              </div>
            ) : (
              <div className="text-red-400">
                <p><strong>Status:</strong> ❌ Not Logged In</p>
              </div>
            )}
          </div>

          {/* useAuth Hook Check */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">useAuth Hook</h2>
            {authLoading ? (
              <div className="text-yellow-400">Loading...</div>
            ) : authUser ? (
              <div className="space-y-2 text-green-400">
                <p><strong>Status:</strong> ✅ User Found</p>
                <p><strong>User ID:</strong> {authUser.id}</p>
                <p><strong>Email:</strong> {authUser.email}</p>
                <p><strong>Name:</strong> {authUser.name || 'N/A'}</p>
              </div>
            ) : (
              <div className="text-red-400">
                <p><strong>Status:</strong> ❌ No User</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login as liuyilan72@outlook.com
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-6">
          <h3 className="text-yellow-400 font-semibold mb-2">Debug Info:</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Check browser console for detailed logs</p>
            <p>• If both show "Not Logged In", you need to login first</p>
            <p>• If only one shows logged in, there's a sync issue</p>
            <p>• After login, refresh the page to see updated status</p>
          </div>
        </div>
      </div>
    </div>
  )
}

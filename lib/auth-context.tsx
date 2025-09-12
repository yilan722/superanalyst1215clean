'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase-client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  forceUpdate: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [forceUpdateTrigger, setForceUpdateTrigger] = useState(0)

  const forceUpdate = () => {
    setForceUpdateTrigger(prev => prev + 1)
  }

  const refreshUserData = async () => {
    console.log('🔄 强制刷新用户数据...')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('❌ 刷新会话失败:', error)
        setUser(null)
      } else if (session?.user) {
        console.log('✅ 刷新会话成功:', session.user.id)
        setUser(session.user as User)
      } else {
        console.log('ℹ️ 刷新后没有会话')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ 刷新用户数据异常:', error)
      setUser(null)
    }
  }

  useEffect(() => {
    console.log('🔧 AuthProvider: 初始化认证状态')
    
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        console.log('🔍 正在获取初始会话...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('🔍 会话获取结果:', { session: !!session, user: session?.user?.id, error })
        
        if (error) {
          console.error('❌ 获取会话失败:', error)
          setUser(null)
        } else if (session?.user) {
          console.log('✅ 找到现有会话:', session.user.id)
          setUser(session.user as User)
        } else {
          console.log('ℹ️ 没有现有会话')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ 获取会话异常:', error)
        setUser(null)
      } finally {
        console.log('🔧 设置loading为false')
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 认证状态变化:', event, session?.user?.id, '当前用户状态:', user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ 用户登录:', session.user.id)
          setUser(session.user as User)
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 用户登出')
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 令牌刷新:', session.user.id)
          setUser(session.user as User)
        } else if (event === 'INITIAL_SESSION') {
          console.log('🔄 初始会话事件:', session?.user?.id)
          if (session?.user) {
            console.log('✅ 初始会话有用户，设置用户状态')
            setUser(session.user as User)
          } else {
            console.log('ℹ️ 初始会话无用户，清空用户状态')
            setUser(null)
          }
        }
        
        console.log('🔧 设置loading为false')
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [forceUpdateTrigger])

  const signOut = async () => {
    try {
      console.log('🚪 用户登出中...')
      await supabase.auth.signOut()
      setUser(null)
      console.log('✅ 登出成功')
    } catch (error) {
      console.error('❌ 登出失败:', error)
      // 即使失败也要清理状态
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    signOut,
    forceUpdate,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase-client'
import { setGlobalForceSignOut } from './supabase-auth'
import type { User } from './supabase-auth'

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // 调试开关，只在开发环境下启用
  const isDebug = process.env.NODE_ENV === 'development'
  
  // 调试日志函数
  const debugLog = (message: string, data?: any) => {
    if (isDebug) {
      console.log(message, data)
    }
  }

  useEffect(() => {
    // 防止重复初始化
    if (user !== null) {
      debugLog('🔄 useAuth已经初始化，跳过重复初始化')
      return
    }
    
    // 设置全局的forceSignOut函数
    debugLog('🔧 正在设置全局forceSignOut函数...')
    setGlobalForceSignOut(() => {
      debugLog('🔄 全局forceSignOut被调用')
      setUser(null)
      setLoading(false)
      
      // 清理本地存储
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        debugLog('🧹 全局forceSignOut：清理所有本地存储')
      }
      
      // 强制触发Supabase状态更新
      try {
        // 使用正确的方法清除会话
        supabase.auth.setSession({
          access_token: '',
          refresh_token: ''
        })
        debugLog('🔄 强制清除Supabase会话')
      } catch (error) {
        debugLog('⚠️ 清除Supabase会话失败:', error)
      }
      
      // 强制触发onAuthStateChange事件
      try {
        // 手动触发状态变化
        const event = new CustomEvent('supabase-auth-state-change', {
          detail: { event: 'SIGNED_OUT', session: null }
        })
        window.dispatchEvent(event)
        debugLog('🔄 手动触发认证状态变化事件')
      } catch (error) {
        debugLog('⚠️ 触发事件失败:', error)
      }
      
      debugLog('✅ 强制登出完成')
    })
    debugLog('✅ 全局forceSignOut函数已设置')
    
    // 获取当前会话
    const getInitialSession = async () => {
      try {
        // 先检查localStorage中是否有认证数据
        const authData = localStorage.getItem('supabase.auth.token')
        debugLog('🔍 localStorage中的认证数据:', authData ? '存在' : '不存在')
        
        // 如果localStorage有数据，先尝试解析
        if (authData) {
          try {
            const parsedAuthData = JSON.parse(authData)
            debugLog('🔍 解析的认证数据:', parsedAuthData)
            
            // 检查是否有有效的access_token
            if (parsedAuthData.currentSession?.access_token) {
              debugLog('🔍 发现access_token，尝试设置会话...')
              
              // 尝试设置会话
              const { data: { session }, error: setSessionError } = await supabase.auth.setSession({
                access_token: parsedAuthData.currentSession.access_token,
                refresh_token: parsedAuthData.currentSession.refresh_token
              })
              
              if (session?.user && !setSessionError) {
                debugLog('✅ 成功设置会话，用户:', session.user.id)
                setSession(session)
                const userProfile: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || null,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || session.user.created_at,
                  free_reports_used: 0,
                  paid_reports_used: 0,
                  subscription_id: null,
                  subscription_type: null,
                  subscription_start: null,
                  subscription_end: null,
                  monthly_report_limit: 0
                }
                setUser(userProfile)
                setLoading(false)
                return
              } else {
                debugLog('❌ 设置会话失败:', setSessionError)
              }
            }
          } catch (parseError) {
            debugLog('❌ 解析认证数据失败:', parseError)
          }
        }
        
        // 如果上面的方法失败，尝试标准方法
        const { data: { session }, error } = await supabase.auth.getSession()
        debugLog('🔍 Supabase session检查:', { session: session ? '存在' : '不存在', error })
        
        if (error) {
          console.error('❌ 获取初始会话失败:', error)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          debugLog('🔐 找到现有会话，用户:', session.user.id)
          setSession(session)
          // 创建符合User类型的用户对象
          const userProfile: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || null,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
            free_reports_used: 0,
            paid_reports_used: 0,
            subscription_id: null,
            subscription_type: null,
            subscription_start: null,
            subscription_end: null,
            monthly_report_limit: 0
          }
          setUser(userProfile)
        } else {
          debugLog('🔍 未找到现有会话')
          // 如果localStorage有数据但session为null，尝试刷新
          if (authData) {
            debugLog('🔄 尝试刷新会话...')
            try {
              const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
              if (refreshedSession?.user && !refreshError) {
                debugLog('✅ 会话刷新成功:', refreshedSession.user.id)
                setSession(refreshedSession)
                const userProfile: User = {
                  id: refreshedSession.user.id,
                  email: refreshedSession.user.email || '',
                  name: refreshedSession.user.user_metadata?.name || null,
                  created_at: refreshedSession.user.created_at,
                  updated_at: refreshedSession.user.updated_at || refreshedSession.user.created_at,
                  free_reports_used: 0,
                  paid_reports_used: 0,
                  subscription_id: null,
                  subscription_type: null,
                  subscription_start: null,
                  subscription_end: null,
                  monthly_report_limit: 0
                }
                setUser(userProfile)
              } else {
                debugLog('❌ 会话刷新失败:', refreshError)
              }
            } catch (refreshError) {
              debugLog('❌ 会话刷新异常:', refreshError)
            }
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ 获取初始会话异常:', error)
        setLoading(false)
      }
    }
    
    getInitialSession()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        debugLog(`🔄 认证状态变化: ${event} ${session?.user?.id || 'null'}`)
        
        // 只在状态真正变化时更新
        if (event === 'SIGNED_IN' && session?.user) {
          debugLog(`✅ 用户登录事件触发: ${session.user.id}`)
          setSession(session)
          // 创建符合User类型的用户对象
          const userProfile: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || null,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
            free_reports_used: 0,
            paid_reports_used: 0,
            subscription_id: null,
            subscription_type: null,
            subscription_start: null,
            subscription_end: null,
            monthly_report_limit: 0
          }
          setUser(userProfile)
        } else if (event === 'SIGNED_OUT') {
          debugLog('🚪 用户登出事件触发')
          setSession(null)
          setUser(null)
          setLoading(false)
          
          // 清理本地存储
          if (typeof window !== 'undefined') {
            localStorage.clear()
            sessionStorage.clear()
            debugLog('🧹 登出时清理本地存储')
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const currentUserId = (user as any)?.id
          const refreshedUserId = session.user.id
          
          if (currentUserId !== refreshedUserId) {
            debugLog(`🔄 令牌刷新，用户: ${session.user.id}`)
            setSession(session)
            // 创建符合User类型的用户对象
            const userProfile: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
              free_reports_used: 0,
              paid_reports_used: 0,
              subscription_id: null,
              subscription_type: null,
              subscription_start: null,
              subscription_end: null,
              monthly_report_limit: 0
            }
            setUser(userProfile)
          }
        }
        
        setLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 添加调试信息 - 只在开发环境输出
  if (process.env.NODE_ENV === 'development') {
    // 禁用重复的状态日志，只在真正需要时输出
    // console.log('🔍 useAuth hook 状态:', { 
    //   userId: user?.id, 
    //   loading, 
    //   event: 'return',
    //   userEmail: user?.email,
    //   userName: user?.name
    // })
  }
  
  // 强制登出函数 - 不依赖Supabase API
  const forceSignOut = () => {
    debugLog('🚪 强制登出...')
    
    // 立即清理状态
    setSession(null)
    setUser(null)
    setLoading(false)
    
    // 清理本地存储
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      debugLog('🧹 强制清理所有本地存储')
    }
    
    // 强制触发Supabase状态更新
    try {
      // 使用正确的方法清除会话
      supabase.auth.setSession({
        access_token: '',
        refresh_token: ''
      })
      debugLog('🔄 强制清除Supabase会话')
    } catch (error) {
      debugLog('⚠️ 清除Supabase会话失败:', error)
    }
    
    // 强制触发onAuthStateChange事件
    try {
      // 手动触发状态变化
      const event = new CustomEvent('supabase-auth-state-change', {
        detail: { event: 'SIGNED_OUT', session: null }
      })
      window.dispatchEvent(event)
      debugLog('🔄 手动触发认证状态变化事件')
    } catch (error) {
      debugLog('⚠️ 触发事件失败:', error)
    }
    
    debugLog('✅ 强制登出完成')
  }
  
  // 强制状态更新
  const forceUpdate = () => {
    debugLog('🔄 强制状态更新')
    setLoading(false)
  }
  
  // 立即重置loading
  const resetLoading = () => {
    debugLog('🔄 立即重置loading')
    setLoading(false)
  }
  
  // 强制设置用户状态
  const forceSetUser = (userId: string) => {
    debugLog('🔄 强制设置用户状态:', userId)
    const forcedUser: User = {
      id: userId,
      email: '',
      name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      free_reports_used: 0,
      paid_reports_used: 0,
      subscription_id: null,
      subscription_type: null,
      subscription_start: null,
      subscription_end: null,
      monthly_report_limit: 0
    }
    setUser(forcedUser)
    setLoading(false)
  }
  
  // 登出函数
  const signOut = async () => {
    try {
      debugLog('🚪 用户登出中...')
      
      // 先清理本地存储
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        debugLog('🧹 清理本地存储')
      }
      
      // 调用Supabase的signOut
      await supabase.auth.signOut()
      
      // 清理状态
      setSession(null)
      setUser(null)
      setLoading(false)
      debugLog('✅ 用户登出成功')
    } catch (error) {
      console.error('❌ 登出失败:', error)
      // 即使失败也要强制清理状态
      setSession(null)
      setUser(null)
      setLoading(false)
      debugLog('🧹 强制清理用户状态')
    }
  }
  
  return { user, session, loading, forceUpdate, resetLoading, forceSetUser, signOut, forceSignOut }
} 
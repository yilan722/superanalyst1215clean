'use client'

import React, { useState, useEffect } from 'react'
import useAuth from '../../lib/useAuth'
import ClientCouponInput from '../../components/ClientCouponInput'

export default function DebugCouponPage() {
  const { user, loading } = useAuth()
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp}: ${message}`
    console.log(logMessage)
    setLogs(prev => [...prev, logMessage])
  }

  useEffect(() => {
    addLog(`Component mounted - User: ${user?.id || 'null'}, Loading: ${loading}`)
  }, [])

  useEffect(() => {
    addLog(`Auth state changed - User: ${user?.id || 'null'}, Loading: ${loading}`)
  }, [user, loading])

  useEffect(() => {
    addLog(`Applied coupon changed: ${appliedCoupon ? JSON.stringify(appliedCoupon) : 'null'}`)
  }, [appliedCoupon])

  // 拦截所有可能的重定向
  useEffect(() => {
    const originalLocation = window.location.href
    addLog(`Original location: ${originalLocation}`)

    // 监听所有可能的重定向
    const originalAssign = window.location.assign
    const originalReplace = window.location.replace
    const originalReload = window.location.reload

    window.location.assign = function(url) {
      addLog(`❌ REDIRECT DETECTED - assign to: ${url}`)
      console.trace('Redirect trace:')
      return originalAssign.call(this, url)
    }

    window.location.replace = function(url) {
      addLog(`❌ REDIRECT DETECTED - replace to: ${url}`)
      console.trace('Redirect trace:')
      return originalReplace.call(this, url)
    }

    window.location.reload = function() {
      addLog(`❌ RELOAD DETECTED`)
      console.trace('Reload trace:')
      return originalReload.call(this)
    }

    // 监听href变化
    Object.defineProperty(window.location, 'href', {
      set: function(url) {
        addLog(`❌ HREF CHANGE DETECTED: ${url}`)
        console.trace('Href change trace:')
      },
      get: function() {
        return originalLocation
      }
    })

    return () => {
      window.location.assign = originalAssign
      window.location.replace = originalReplace
      window.location.reload = originalReload
    }
  }, [])

  const handleCouponApplied = (coupon: any) => {
    addLog(`🎯 Coupon applied: ${JSON.stringify(coupon)}`)
    setAppliedCoupon(coupon)
    
    // 检查是否有意外的状态变化
    setTimeout(() => {
      addLog(`🔍 Checking state after coupon - User: ${user?.id || 'null'}`)
      if (!user) {
        addLog(`❌ USER LOST AFTER COUPON APPLICATION!`)
      }
    }, 100)
  }

  const handleCouponRemoved = () => {
    addLog(`🎯 Coupon removed`)
    setAppliedCoupon(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Debug Coupon Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Panel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Current Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User:</strong> {user ? user.id : 'Not logged in'}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Applied Coupon:</strong> {appliedCoupon ? appliedCoupon.code : 'None'}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            </div>
          </div>

          {/* Coupon Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Test Coupon</h2>
            <ClientCouponInput
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              orderAmount={49}
              locale="en"
            />
          </div>
        </div>

        {/* Logs Panel */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded text-sm"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  )
}

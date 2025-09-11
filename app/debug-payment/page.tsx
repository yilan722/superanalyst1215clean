'use client'

import React, { useState } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function DebugPaymentPage() {
  const [debugResults, setDebugResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testPaymentFlow = async () => {
    setIsLoading(true)
    setError(null)
    setDebugResults(null)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('Please log in first')
        setIsLoading(false)
        return
      }

      console.log('🧪 Testing payment flow for user:', user.id)

      // Call debug API
      const response = await fetch('/api/debug-payment-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'basic'
        })
      })

      const result = await response.json()
      console.log('🧪 Debug results:', result)
      
      setDebugResults(result)
      
      if (result.success) {
        console.log('✅ Payment flow test successful!')
        console.log('Session URL:', result.url)
      } else {
        console.log('❌ Payment flow test failed')
      }
      
    } catch (err) {
      console.error('❌ Test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = (step: any) => {
    const statusColorMap: {[key: string]: string} = {
      'success': 'text-green-600',
      'error': 'text-red-600',
      'running': 'text-blue-600'
    }
    const statusColor = statusColorMap[step.status] || 'text-gray-600'

    const statusIconMap: {[key: string]: string} = {
      'success': '✅',
      'error': '❌',
      'running': '🔄'
    }
    const statusIcon = statusIconMap[step.status] || '⏳'

    return (
      <div key={step.step} className="mb-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{statusIcon}</span>
          <span className="font-semibold">Step {step.step}: {step.name}</span>
          <span className={`text-sm ${statusColor}`}>
            {step.status.toUpperCase()}
          </span>
        </div>
        
        {step.error && (
          <div className="text-red-600 text-sm mb-2">
            <strong>Error:</strong> {step.error}
          </div>
        )}
        
        {step.details && (
          <div className="text-sm text-gray-600">
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(step.details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">支付流程调试页面</h1>
      
      <div className="mb-6">
        <button
          onClick={testPaymentFlow}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '测试中...' : '开始测试支付流程'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>错误:</strong> {error}
        </div>
      )}

      {debugResults && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">调试结果</h2>
          
          {debugResults.debugSteps && debugResults.debugSteps.map(renderStep)}
          
          {debugResults.success && (
            <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-semibold mb-2">✅ 测试成功！</h3>
              <p>Session ID: {debugResults.sessionId}</p>
              <p>Session URL: <a href={debugResults.url} target="_blank" rel="noopener noreferrer" className="underline">{debugResults.url}</a></p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <p>这个页面用于逐步调试支付流程，帮助定位问题所在。</p>
        <p>请确保您已经登录，然后点击"开始测试支付流程"按钮。</p>
      </div>
    </div>
  )
}

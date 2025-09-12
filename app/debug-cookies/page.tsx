'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function DebugCookies() {
  const [cookies, setCookies] = useState<string>('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // 检查cookies
    const cookieString = document.cookie
    setCookies(cookieString)
    
    // 检查session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Client session check:', { session, error })
      setSession(session)
    }
    
    checkSession()
  }, [])

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/auth/test')
      const data = await response.json()
      console.log('API call result:', data)
      alert('API call result: ' + JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('API call error:', error)
      alert('API call error: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Cookie Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Browser Cookies</h2>
            <div className="bg-gray-700 p-4 rounded text-sm text-gray-300 font-mono">
              {cookies || 'No cookies found'}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Client Session</h2>
            {session ? (
              <div className="text-green-400">
                <p>✅ Session Found</p>
                <p>User ID: {session.user.id}</p>
                <p>Email: {session.user.email}</p>
              </div>
            ) : (
              <div className="text-red-400">
                <p>❌ No Session</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test API Call</h2>
          <button
            onClick={testApiCall}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test API Call
          </button>
        </div>
      </div>
    </div>
  )
}

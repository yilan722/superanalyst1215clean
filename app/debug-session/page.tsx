'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function DebugSession() {
  const [session, setSession] = useState<any>(null)
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check localStorage
        const supabaseAuth = localStorage.getItem('supabase.auth.token')
        const allLocalStorage = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            allLocalStorage[key] = localStorage.getItem(key)
          }
        }
        setLocalStorageData(allLocalStorage)

        // Check session
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check:', { session, error })
        setSession(session)
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'liuyilan72@outlook.com',
        password: 'test123'
      })
      
      if (error) {
        alert('Login failed: ' + error.message)
      } else {
        alert('Login successful!')
        window.location.reload()
      }
    } catch (error) {
      alert('Login error: ' + error)
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    alert('Storage cleared!')
    window.location.reload()
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Session Debug</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Session</h2>
            {session ? (
              <div className="text-green-400">
                <p>✅ Session Found</p>
                <p>User ID: {session.user.id}</p>
                <p>Email: {session.user.email}</p>
                <p>Access Token: {session.access_token ? 'Present' : 'Missing'}</p>
              </div>
            ) : (
              <div className="text-red-400">
                <p>❌ No Session</p>
                <button
                  onClick={login}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">LocalStorage Data</h2>
            <div className="bg-gray-700 p-4 rounded text-sm text-gray-300 max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(localStorageData, null, 2)}</pre>
            </div>
            <button
              onClick={clearStorage}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
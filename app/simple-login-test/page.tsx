'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function SimpleLoginTest() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check result:', { session, error })
        setSession(session)
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'liuyilan72@outlook.com',
        password: 'test123'
      })
      
      if (error) {
        console.error('Login error:', error)
        alert('Login failed: ' + error.message)
      } else {
        alert('Login successful!')
        window.location.reload()
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed: ' + (error as any).message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Simple Login Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Login Status:</h2>
          {session ? (
            <div className="text-green-400">
              <p>✅ Logged In</p>
              <p>User ID: {session.user.id}</p>
              <p>Email: {session.user.email}</p>
            </div>
          ) : (
            <div className="text-red-400">
              <p>❌ Not Logged In</p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Actions:</h2>
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login as liuyilan72@outlook.com
          </button>
        </div>
      </div>
    </div>
  )
}

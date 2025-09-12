'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'
import useAuth from '../../lib/useAuth'

export default function TestLoginSimple() {
  const { user, loading } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    checkSession()
  }, [])

  const login = async () => {
    setIsLoggingIn(true)
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
    } finally {
      setIsLoggingIn(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      alert('Logout successful!')
      window.location.reload()
    } catch (error) {
      alert('Logout error: ' + error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Simple Login Test</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Auth Status</h2>
            <div className="space-y-2">
              <p className="text-white">
                <span className="font-semibold">useAuth user:</span> {user ? `✅ ${user.email}` : '❌ Not logged in'}
              </p>
              <p className="text-white">
                <span className="font-semibold">Supabase session:</span> {session ? `✅ ${session.user.email}` : '❌ No session'}
              </p>
              <p className="text-white">
                <span className="font-semibold">Loading:</span> {loading ? '⏳ Yes' : '✅ No'}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <div className="space-x-4">
              {!user ? (
                <button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {user && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Test Coupon</h2>
              <p className="text-white mb-4">Now you can test the coupon functionality!</p>
              <a
                href="/"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Homepage
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

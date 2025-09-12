'use client'

import React from 'react'
import { type Locale } from '@/lib/i18n'
import useAuth from '@/lib/useAuth'

interface TestPageProps {
  params: {
    locale: Locale
  }
}

export default function TestPage({ params }: TestPageProps) {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="bg-white p-4 rounded-lg">
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>User: {user ? user.email : 'null'}</p>
        <p>User ID: {user?.id || 'null'}</p>
      </div>
    </div>
  )
}

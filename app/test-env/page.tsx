'use client'

import React from 'react'

export default function TestEnvPage() {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>
        
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Stripe Configuration</h2>
            <p>
              <strong>Publishable Key:</strong> {stripeKey ? '✅ Loaded' : '❌ Missing'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {stripeKey ? `Key: ${stripeKey.substring(0, 20)}...` : 'No key found'}
            </p>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">All Environment Variables</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                NODE_ENV: process.env.NODE_ENV,
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: stripeKey ? 'Present' : 'Missing',
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
                NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

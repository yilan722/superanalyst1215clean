'use client'

import React from 'react'
import ValuationAnalysis from '../../components/ValuationAnalysis'

export default function TestValuationFix() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Valuation Analysis Test</h1>
        <ValuationAnalysis 
          locale="en" 
          user={{ id: 'test-user', email: 'test@example.com' }}
        />
      </div>
    </div>
  )
}


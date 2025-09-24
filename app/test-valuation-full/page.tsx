'use client'

import ValuationAnalysis from '../../components/ValuationAnalysis'

export default function TestValuationFull() {
  return (
    <ValuationAnalysis 
      locale="en" 
      user={{ id: 'test-user', email: 'test@example.com' }}
    />
  )
}


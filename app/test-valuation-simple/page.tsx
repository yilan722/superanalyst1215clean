'use client'

import ValuationAnalysisSimple from '../../components/ValuationAnalysisSimple'

export default function TestValuationSimple() {
  return (
    <ValuationAnalysisSimple 
      locale="en" 
      user={{ id: 'test-user', email: 'test@example.com' }}
    />
  )
}


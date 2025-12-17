import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const todaysReportPath = path.join(process.cwd(), 'data', 'todays-report.json')
    
    if (!fs.existsSync(todaysReportPath)) {
      return NextResponse.json({ error: 'Todays report not found' }, { status: 404 })
    }
    
    const todaysReportData = fs.readFileSync(todaysReportPath, 'utf-8')
    const todaysReport = JSON.parse(todaysReportData)
    
    return NextResponse.json({ 
      success: true, 
      data: todaysReport 
    })
  } catch (error) {
    console.error('Error fetching todays report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
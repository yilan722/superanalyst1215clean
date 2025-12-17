'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap, 
  DollarSign, 
  Activity
} from 'lucide-react'
import { type Locale } from '../app/services/i18n'
import { getTranslation } from '../app/services/translations'

interface ReportDemoProps {
  locale: Locale
}

export default function ReportDemo({ locale }: ReportDemoProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null)

  // Complete Alphabet Inc. Report Data - Based on the actual report
  const demoReport = {
    stockSymbol: 'GOOG',
    stockName: 'Alphabet Inc',
    currentPrice: 309.32,
    priceChange: 0,
    priceChangePercent: 0,
    marketCap: 3800000000000, // Approximately $3.8T based on report
    peRatio: 31.7,
    psRatio: 9.8,
    reportDate: '2025/12/16 11:40:38',
    
    fundamentalAnalysis: {
      overview: "Alphabet Inc. (NASDAQ: GOOG/GOOGL) stands as a colossus in the global technology landscape, officially formed on October 2, 2015, through a strategic restructuring of Google Inc. Originally founded in September 1998 by Larry Page and Sergey Brin as a search engine project at Stanford University, the company has evolved from a single product entity into a diversified conglomerate. Headquartered in Mountain View, California, Alphabet operates in the interactive media, cloud computing, and artificial intelligence sectors. As of late 2025, Alphabet commands a dominant position in digital advertising and is a top-tier contender in the global AI arms race.",
      strengths: [
        "Dominant position in digital advertising with Google Search and YouTube",
        "Rapidly growing Google Cloud segment with 34% revenue growth",
        "$110.5 billion cash reserves providing strategic flexibility",
        "Strong operating margins of 30.5% with expanding Cloud profitability"
      ],
      financialHighlights: {
        revenue: 102300000000,
        netIncome: 35000000000,
        operatingMargin: 0.305,
        returnOnEquity: 0.20,
        adjustedEbitda: 31200000000,
        operatingCashFlow: 18500000000
      },
      quarterlyTrends: {
        revenueGrowth: 0.16,
        netIncomeChange: "+48% YoY growth driven by Cloud expansion and AI investments",
        ebitdaMargin: 0.305,
        cashPosition: 110500000000,
        customerAssets: 0
      },
      challenges: [
        "Regulatory scrutiny and potential DOJ antitrust actions",
        "AI competition from Microsoft and OpenAI partnership",
        "Search market share pressure from AI-powered alternatives",
        "Cloud segment margin expansion required to offset infrastructure costs"
      ],
      // Complete financial metrics table data
      financialMetrics: {
        q3_2025: {
          revenue: 102300000000,
          netIncome: 35000000000,
          adjustedEbitda: 31200000000,
          operatingCashFlow: 18500000000,
          revenueGrowth: 0.16,
          netIncomeChange: "+48% YoY growth driven by Cloud expansion",
          ebitdaMargin: 0.305,
          googleCloudRevenue: 15200000000,
          googleCloudGrowth: 0.34
        },
        balanceSheet: {
          cashAndEquivalents: 110500000000,
          totalAssets: 450000000000,
          totalLiabilities: 120000000000,
          debtObligations: 12500000000,
          netCash: 98000000000
        },
        keyRatios: {
          peRatio: 31.7,
          pbRatio: 8.5,
          roe: 0.20,
          roa: 0.12,
          debtToEquity: 0.03
        }
      }
    },

    businessSegments: [
      {
        name: "Google Services",
        revenue: 87000000000,
        growth: 0.12,
        margin: 0.85,
        description: "Includes Search, YouTube, Android, Chrome, and Hardware (Pixel/Nest). This segment generates revenue primarily through performance and brand advertising, capitalizing on Google's unparalleled user data and search intent signals.",
        details: {
          searchRevenue: 55000000000,
          youtubeRevenue: 18000000000,
          androidRevenue: 8000000000,
          otherServices: 6000000000,
          activeUsers: 3000000000
        }
      },
      {
        name: "Google Cloud",
        revenue: 15200000000,
        growth: 0.34,
        margin: 0.24,
        description: "Provides infrastructure (IaaS) and platform (PaaS) services to enterprises. This segment has transitioned from an investment phase to a profit generator, leveraging AI differentiation with operating income of $3.6B and margin of 23.7%.",
        details: {
          infrastructure: 9000000000,
          platform: 5000000000,
          aiServices: 1200000000,
          operatingIncome: 3600000000,
          operatingMargin: 0.237
        }
      },
      {
        name: "Other Bets",
        revenue: 1000000000,
        growth: 0.15,
        margin: -0.20,
        description: "Functions as a venture capital portfolio within the company, aiming to disrupt industries like transportation (Waymo) and healthcare (Verily).",
        details: {
          waymo: 400000000,
          verily: 300000000,
          otherBets: 300000000,
          totalLoss: 200000000
        }
      }
    ],

    detailedSegments: [
      {
        name: "Google Search",
        revenue: 55000000000,
        percentage: 0.54,
        growth: 0.10,
        description: "Core search advertising revenue, maintaining dominant market share despite AI competition",
        marketShare: 0.92
      },
      {
        name: "YouTube",
        revenue: 18000000000,
        percentage: 0.18,
        growth: 0.15,
        description: "Video advertising and YouTube Premium subscriptions, benefiting from strong engagement",
        activeUsers: 2500000000
      },
      {
        name: "Google Cloud",
        revenue: 15200000000,
        percentage: 0.15,
        growth: 0.34,
        description: "Rapidly growing cloud infrastructure and AI services, now profitable with 23.7% operating margin",
        operatingIncome: 3600000000
      },
      {
        name: "Other Services",
        revenue: 14100000000,
        percentage: 0.13,
        growth: 0.08,
        description: "Android, Chrome, Hardware (Pixel/Nest), and other diversified revenue streams"
      }
    ],

    // Complete revenue structure evolution table
    revenueStructure: {
      current: {
        googleServices: 0.85,
        googleCloud: 0.15
      },
      historical: {
        "2021": { services: 0.92, cloud: 0.08 },
        "2022": { services: 0.90, cloud: 0.10 },
        "2023": { services: 0.88, cloud: 0.12 },
        "2024": { services: 0.86, cloud: 0.14 },
        "2025": { services: 0.85, cloud: 0.15 }
      }
    },

    // Geographic revenue distribution
    geographicRevenue: {
      unitedStates: 0.45,
      europe: 0.25,
      asia: 0.20,
      other: 0.10
    },

    // Cloud performance analysis
    cloudPerformance: {
      revenue: 15200000000,
      growth: 0.34,
      operatingIncome: 3600000000,
      operatingMargin: 0.237,
      customers: 100000,
      enterpriseCustomers: 5000
    },

    // Search and advertising performance
    searchPerformance: {
      searchRevenue: 55000000000,
      youtubeRevenue: 18000000000,
      totalAdvertising: 73000000000,
      marketShare: 0.92,
      activeUsers: 3000000000
    },

    growthCatalysts: [
      {
        title: "AI Integration and Gemini Platform",
        description: "Alphabet's Gemini AI platform is creating new revenue opportunities across Search, Cloud, and enterprise services. The company's 'Native Multimodal' AI approach differentiates it from competitors.",
        impact: "High",
        timeline: "2025-2027",
        details: {
          aiRevenue: 5000000000,
          geminiAdoption: 100000,
          cloudAIGrowth: 0.50,
          searchAIIntegration: 0.25,
          enterpriseAI: 2000000000
        }
      },
      {
        title: "Google Cloud Accelerated Growth",
        description: "Google Cloud revenue grew 34% YoY in Q3 2025, reaching $15.2B with operating margin expanding to 23.7%. The segment has transitioned from investment phase to profit generator.",
        impact: "High",
        timeline: "2025-2027",
        details: {
          cloudRevenue: 15200000000,
          cloudGrowth: 0.34,
          operatingMargin: 0.237,
          targetRevenue: 30000000000,
          enterpriseCustomers: 5000
        }
      },
      {
        title: "YouTube Monetization Expansion",
        description: "YouTube continues to grow with strong engagement and expanding advertising formats. The platform benefits from creator economy growth and premium subscription adoption.",
        impact: "Medium-High",
        timeline: "2025-2027",
        details: {
          youtubeRevenue: 18000000000,
          growth: 0.15,
          activeUsers: 2500000000,
          premiumSubscribers: 80000000,
          shortsMonetization: 5000000000
        }
      },
      {
        title: "Search Market Dominance",
        description: "Google Search maintains 92% market share despite AI competition. The company's search intent signals and advertising technology remain unparalleled.",
        impact: "High",
        timeline: "Ongoing",
        details: {
          searchRevenue: 55000000000,
          marketShare: 0.92,
          searchQueries: 8.5e12,
          advertisingRevenue: 73000000000,
          clickThroughRate: 0.035
        }
      },
      {
        title: "Waymo and Other Bets Potential",
        description: "Waymo autonomous driving and other moonshot projects represent long-term optionality. While currently loss-making, successful commercialization could unlock significant value.",
        impact: "Medium",
        timeline: "2026-2030",
        details: {
          waymoValuation: 150000000000,
          autonomousMiles: 20000000,
          commercialDeployments: 5,
          otherBetsRevenue: 1000000000,
          totalBetsValue: 150000000000
        }
      }
    ],

    valuationAnalysis: {
      dcfValue: 365.00,
      targetPrice: 365.00,
      reasoning: "Alphabet represents a compelling investment opportunity with dominant search position, rapidly growing and profitable Cloud segment, and strong AI capabilities. The current price of $309.32 offers approximately 18% upside to fair value.",
      dcfScenarios: {
        base: 365.00,
        optimistic: 420.00,
        pessimistic: 240.00
      },
      comparableAnalysis: {
        peBased: 365.00,
        evEbitda: 365.00,
        psBased: 365.00
      },
      upsidePotential: {
        base: 0.18,
        optimistic: 0.36,
        pessimistic: -0.22
      },
      // Complete DCF analysis assumptions
      dcfAssumptions: {
        growthRate: {
          "2026": 0.13,
          "2027": 0.13,
          "2028": 0.12,
          "2029": 0.12,
          "2030": 0.12
        },
        terminalGrowth: 0.03,
        discountRate: 0.095,
        terminalMultiple: 18.0
      },
      // Sum of parts valuation
      sumOfParts: {
        coreSearchAds: 210.00,
        googleCloud: 65.00,
        youtube: 48.00,
        otherBets: 12.00,
        netCash: 8.00,
        total: 343.00
      },
      // Risk factors
      riskFactors: [
        "Regulatory scrutiny and potential DOJ antitrust actions",
        "AI competition from Microsoft and OpenAI",
        "Search market share pressure from AI alternatives",
        "Cloud margin expansion execution risk",
        "Macroeconomic impact on advertising spend"
      ]
    },

    // Comparable Company Analysis Table - Complete data from the report
    comparableCompanyAnalysis: [
      {
        company: "Alphabet (GOOG)",
        peRatio: 31.7,
        evEbitda: 24.8,
        psRatio: 9.8,
        revenueGrowth: 16
      },
      {
        company: "Microsoft (MSFT)",
        peRatio: 35.2,
        evEbitda: 24.0,
        psRatio: 13.5,
        revenueGrowth: 11
      },
      {
        company: "Apple (AAPL)",
        peRatio: 33.8,
        evEbitda: 25.0,
        psRatio: 8.9,
        revenueGrowth: 6
      },
      {
        company: "Amazon (AMZN)",
        peRatio: 42.1,
        evEbitda: 19.0,
        psRatio: 3.2,
        revenueGrowth: 11
      },
      {
        company: "Meta (META)",
        peRatio: 27.5,
        evEbitda: 18.0,
        psRatio: 7.5,
        revenueGrowth: 14
      }
    ],


  }

  const formatNumber = (num: number, withCurrency = true) => {
    if (num >= 1e9) {
      return `${withCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`
    } else if (num >= 1e6) {
      return `${withCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`
    } else if (num >= 1e3) {
      return `${withCurrency ? '$' : ''}${(num / 1e3).toFixed(2)}K`
    }
    return `${withCurrency ? '$' : ''}${num.toFixed(2)}`
  }

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'fundamental', label: 'Fundamental Analysis', icon: BarChart3 },
    { id: 'segments', label: 'Business Segments', icon: TrendingUp },
    { id: 'growth', label: 'Growth Catalysts', icon: Zap },
    { id: 'valuation', label: 'Valuation Analysis', icon: Target }
  ]

  // Start auto-scroll from overview (index 0) - 6 second interval
  const startAutoScroll = () => {
    if (autoScrollInterval) clearInterval(autoScrollInterval)
    
    const interval = setInterval(() => {
      setActiveSection((prev) => {
        const next = prev + 1
        return next >= sections.length ? 0 : next // Loop back to overview
      })
    }, 6000) // 6 second interval
    
    setAutoScrollInterval(interval)
  }

  // Stop auto-scroll
  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval)
      setAutoScrollInterval(null)
    }
  }

  // Handle section click - jump to specific section
  const handleSectionClick = (index: number) => {
    setActiveSection(index)
  }

  // Auto-scroll through sections every 2 seconds, starting from overview
  useEffect(() => {
    setActiveSection(0) // Start from overview
    startAutoScroll()
    
    return () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval)
      }
    }
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScrollInterval) {
      startAutoScroll()
    }
  }, [autoScrollInterval])

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-800/30"></div>
        
        {/* DEMO Banner */}
        <div className="relative z-20 w-full bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 py-3 sm:py-4 border-b border-blue-500/30">
          <div className="max-w-4xl mx-auto px-3 sm:px-6">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="animate-pulse">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-blue-100">
                🤖 AI-Powered Equity Research Suite Showcase
              </span>
              <div className="animate-pulse">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" />
              </div>
            </div>
            <div className="text-sm sm:text-base text-blue-200 mt-1 opacity-80 text-center">
              Experience institutional-level insights powered by our proprietary algorithms.
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-3 sm:px-6">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-6 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <span className="text-xs sm:text-sm font-medium">Analyze Now</span>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
              Report Date: {demoReport.reportDate}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              {demoReport.stockName}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-400 font-semibold mb-6 sm:mb-8">
              {demoReport.stockSymbol}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  ${demoReport.currentPrice}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Current Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {formatNumber(demoReport.marketCap)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Market Cap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {demoReport.peRatio}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">P/E Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {demoReport.psRatio}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">P/S Ratio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {sections.map((section, index) => (
                      <button
            key={section.id}
            onClick={() => handleSectionClick(index)}
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 text-sm sm:text-base ${
              activeSection === index
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            title={`Click to view ${section.label}`}
          >
              <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-8 sm:space-y-12">
          {/* Overview Section */}
          {activeSection === 0 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Company Overview</h2>
                <a href="https://investor.alphabetinc.com" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Alphabet Investor Relations
                </a>
              </div>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 sm:mb-8">
                {demoReport.fundamentalAnalysis.overview}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-3 sm:mb-4">Key Strengths</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {demoReport.fundamentalAnalysis.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-orange-400 mb-3 sm:mb-4">Key Challenges</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {demoReport.fundamentalAnalysis.challenges.map((challenge, idx) => (
                      <li key={idx} className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-300">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Fundamental Analysis Section */}
          {activeSection === 1 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Fundamental Analysis</h2>
                <a href="https://investor.alphabetinc.com/financials/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Alphabet Financial Reports
                </a>
              </div>
              
              {/* Q3 2025 Performance */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Q3 2025 Financial Performance</h3>
                  <a href="https://investor.alphabetinc.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Alphabet Q3 2025 Earnings
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.revenue)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Revenue</div>
                    <div className="text-xs text-green-400 mt-1">
                      +{formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.revenueGrowth)}
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.netIncome)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Net Income</div>
                    <div className="text-xs text-green-400 mt-1">
                      {demoReport.fundamentalAnalysis.financialMetrics.q3_2025.netIncomeChange}
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.adjustedEbitda)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Operating Income</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.ebitdaMargin)} margin
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.operatingCashFlow)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Free Cash Flow</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.googleCloudRevenue)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Google Cloud Revenue</div>
                    <div className="text-xs text-green-400 mt-1">
                      +{formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.q3_2025.googleCloudGrowth)} growth
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Sheet */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Balance Sheet Highlights</h3>
                  <a href="https://investor.alphabetinc.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Alphabet Q3 2025 Balance Sheet
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.balanceSheet.cashAndEquivalents)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Cash & Equivalents</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.balanceSheet.netCash)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Net Cash</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.balanceSheet.totalAssets)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Total Assets</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatNumber(demoReport.fundamentalAnalysis.financialMetrics.balanceSheet.debtObligations)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Total Debt</div>
                  </div>
                </div>
              </div>

              {/* Key Ratios */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Key Financial Ratios</h3>
                  <a href="https://finance.yahoo.com/quote/COIN/key-statistics" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Yahoo Finance Key Statistics
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {demoReport.fundamentalAnalysis.financialMetrics.keyRatios.peRatio}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">P/E Ratio</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {demoReport.fundamentalAnalysis.financialMetrics.keyRatios.pbRatio}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">P/B Ratio</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.keyRatios.roe)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">ROE</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.fundamentalAnalysis.financialMetrics.keyRatios.roa)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">ROA</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {demoReport.fundamentalAnalysis.financialMetrics.keyRatios.debtToEquity}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Debt/Equity</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Segments Section */}
          {activeSection === 2 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
              
              
              
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Business Segments Analysis</h2>
                <a href="https://investor.alphabetinc.com/business/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Alphabet Business Overview
                </a>
              </div>
              
              {/* Revenue Structure Evolution */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Revenue Structure Evolution</h3>
                  <a href="https://investor.alphabetinc.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Alphabet Quarterly Reports
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Year</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Google Services</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Google Cloud</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(demoReport.revenueStructure.historical).map(([year, data]) => (
                        <tr key={year} className="border-b border-white/10">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">{year}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(data.services)}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(data.cloud)}</td>
                        </tr>
                      ))}
                      <tr className="bg-white/5 font-semibold">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Current (2025)</td>
                        <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(demoReport.revenueStructure.current.googleServices)}</td>
                        <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(demoReport.revenueStructure.current.googleCloud)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Business Segments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {demoReport.businessSegments.map((segment, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                      <h4 className="text-lg sm:text-xl font-bold text-blue-400">{segment.name}</h4>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold text-white">{formatNumber(segment.revenue)}</p>
                        <p className="text-sm text-gray-400">Revenue</p>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">{segment.description}</p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-bold text-green-400">{formatPercentage(segment.growth)}</p>
                        <p className="text-xs text-gray-400">Growth Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-bold text-blue-400">{formatPercentage(segment.margin)}</p>
                        <p className="text-xs text-gray-400">Revenue Share</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Google Cloud Performance */}
              <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Google Cloud Performance</h3>
                  <a href="https://cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Google Cloud
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <h4 className="text-base sm:text-lg font-bold text-blue-400 mb-3 sm:mb-4">Cloud Revenue & Growth</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                          {formatNumber(demoReport.cloudPerformance.revenue)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Q3 2025 Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1 sm:mb-2">
                          {formatPercentage(demoReport.cloudPerformance.growth)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">YoY Growth</div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <div className="text-base sm:text-lg font-bold text-blue-400 mb-1">
                        {formatNumber(demoReport.cloudPerformance.operatingIncome)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Operating Income</div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-center">
                      <div className="text-base sm:text-lg font-bold text-white mb-1">
                        {formatPercentage(demoReport.cloudPerformance.operatingMargin)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Operating Margin</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <h4 className="text-base sm:text-lg font-bold text-blue-400 mb-3 sm:mb-4">Customer Base</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                          {formatNumber(demoReport.cloudPerformance.customers, false)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Total Customers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                          {formatNumber(demoReport.cloudPerformance.enterpriseCustomers, false)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Enterprise Customers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search & Advertising Performance */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Search & Advertising Performance</h3>
                  <a href="https://www.google.com/search/howsearchworks" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Google Search
                  </a>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.searchPerformance.searchRevenue)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Search Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.searchPerformance.youtubeRevenue)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">YouTube Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatNumber(demoReport.searchPerformance.totalAdvertising)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Total Advertising</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {formatPercentage(demoReport.searchPerformance.marketShare)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">Search Market Share</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Revenue Distribution */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Geographic Revenue Distribution</h3>
                  <a href="https://investor.coinbase.com/financials/quarterly-results/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Coinbase Geographic Revenue Data
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.unitedStates)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">United States</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.europe)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Europe</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.asia)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Asia</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.geographicRevenue.other)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Other</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Growth Catalysts Section */}
          {activeSection === 3 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
              
              
              
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Growth Catalysts</h2>
                <a href="https://investor.alphabetinc.com/events-and-presentations/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Alphabet Investor Presentations
                </a>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {demoReport.growthCatalysts.map((catalyst, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-2">{catalyst.title}</h3>
                        <p className="text-sm sm:text-base text-gray-300 mb-3">{catalyst.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          catalyst.impact === 'High' ? 'bg-green-500/20 text-green-400' :
                          catalyst.impact === 'Medium-High' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {catalyst.impact} Impact
                        </span>
                        <div className="text-xs sm:text-sm text-gray-400 mt-1">{catalyst.timeline}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {Object.entries(catalyst.details).map(([key, value]) => (
                        <div key={key} className="text-center bg-white/5 rounded-xl p-2 sm:p-3">
                          <div className="text-base sm:text-lg font-bold text-white mb-1">
                            {typeof value === 'number' ? formatNumber(value, false) : value}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valuation Analysis Section */}
          {activeSection === 4 && (
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10"
              
              
              
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Valuation Analysis</h2>
                <a href="https://www.bloomberg.com/quote/GOOG:US" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                  Source: Bloomberg Terminal Analysis
                </a>
              </div>
              
              {/* DCF Scenarios */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">DCF Valuation Scenarios</h3>
                  <a href="https://www.spglobal.com/marketintelligence/en/mi/research-analysis/equity-valuation-models.html" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: S&P Global Valuation Models
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.dcfScenarios.base}
                    </div>
                    <div className="text-base sm:text-lg text-blue-400 mb-2">Base Case</div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {formatPercentage(demoReport.valuationAnalysis.upsidePotential.base)} upside
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.dcfScenarios.optimistic}
                    </div>
                    <div className="text-base sm:text-lg text-green-400 mb-2">Optimistic</div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {formatPercentage(demoReport.valuationAnalysis.upsidePotential.optimistic)} upside
                    </div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.dcfScenarios.pessimistic}
                    </div>
                    <div className="text-base sm:text-lg text-red-400 mb-2">Pessimistic</div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {formatPercentage(demoReport.valuationAnalysis.upsidePotential.pessimistic)} downside
                    </div>
                  </div>
                </div>
              </div>

              {/* DCF Assumptions */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">DCF Analysis Assumptions</h3>
                  <a href="https://www.investopedia.com/terms/d/dcf.asp" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Financial Modeling Standards
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Year</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Growth Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(demoReport.valuationAnalysis.dcfAssumptions.growthRate).map(([year, rate]) => (
                        <tr key={year} className="border-b border-white/10">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">{year}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatPercentage(rate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-3 sm:mt-4">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.valuationAnalysis.dcfAssumptions.terminalGrowth)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Terminal Growth</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                      {formatPercentage(demoReport.valuationAnalysis.dcfAssumptions.discountRate)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Discount Rate</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                      {demoReport.valuationAnalysis.dcfAssumptions.terminalMultiple}x
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Terminal Multiple</div>
                  </div>
                </div>
              </div>

              {/* Sum of Parts Valuation */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Sum of Parts Valuation</h3>
                  <a href="https://www.investopedia.com/terms/s/sumofpartsvaluation.asp" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Sum of Parts Methodology
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.coreSearchAds}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Core Search & Ads</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.googleCloud}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Google Cloud</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.youtube}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">YouTube</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.otherBets}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Other Bets</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-xl p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.sumOfParts.netCash}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Net Cash</div>
                  </div>
                </div>
                <div className="text-center mt-4 sm:mt-6">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                    Total: ${demoReport.valuationAnalysis.sumOfParts.total}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Sum of Parts Valuation</div>
                </div>
              </div>

              {/* Comparable Company Analysis - Complete table from the report */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Comparable Company Analysis</h3>
                  <a href="https://www.bloomberg.com/markets/stocks/pe-ratio/americas" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Bloomberg Comparable Analysis
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Company</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">P/E Ratio</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">EV/EBITDA</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">P/S Ratio</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Revenue Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoReport.comparableCompanyAnalysis.map((company, idx) => (
                        <tr key={idx} className={`border-b border-white/10 ${
                          company.company.includes('GOOG') ? 'bg-blue-500/10' : ''
                        }`}>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">{company.company}</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.peRatio}x</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.evEbitda}x</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.psRatio}x</td>
                          <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{company.revenueGrowth}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Target Price Analysis */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400">Target Price Analysis</h3>
                  <a href="https://www.spglobal.com/marketintelligence/en/mi/research-analysis/equity-valuation-models.html" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: S&P Global Target Price Models
                  </a>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                      ${demoReport.valuationAnalysis.targetPrice}
                    </div>
                    <div className="text-base sm:text-lg text-blue-300">
                      Based on DCF and Comparable Analysis
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3">Valuation Methods</h4>
                      <ul className="space-y-1 sm:space-y-2">
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">DCF Model: ${demoReport.valuationAnalysis.dcfValue}</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Sum of Parts: ${demoReport.valuationAnalysis.sumOfParts.total}</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Comparable Analysis: ${demoReport.valuationAnalysis.comparableAnalysis.evEbitda}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-amber-400 mb-2 sm:mb-3">Data Sources</h4>
                      <ul className="space-y-1 sm:space-y-2">
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Financial Data: SEC Filings</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Market Data: Bloomberg Terminal</span>
                        </li>
                        <li className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm sm:text-base text-gray-300">Industry Analysis: S&P Global</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-red-400">Risk Factors</h3>
                  <a href="https://investor.alphabetinc.com/risk-factors/default.aspx" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                    Source: Alphabet Risk Factors
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {demoReport.valuationAnalysis.riskFactors.map((risk, idx) => (
                    <div key={idx} className="flex items-start space-x-2 sm:space-x-3 bg-white/5 rounded-xl p-3 sm:p-4">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-gray-300">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
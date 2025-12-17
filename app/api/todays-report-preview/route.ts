import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 返回Today's Must-Read报告的预览内容
    const previewContent = {
      id: "coreweave-2025-09-11",
      title: "CoreWeave, Inc. (CRWV) - In-Depth Company Profile",
      company: "CoreWeave, Inc.",
      symbol: "CRWV",
      date: "2025-09-11",
      summary: "CoreWeave operates as a specialized cloud infrastructure provider focused exclusively on GPU-accelerated computing for artificial intelligence and high-performance workloads. The company has transformed from a cryptocurrency mining operation into an \"AI Hyperscaler,\" providing infrastructure that supports compute workloads for enterprises, hyperscalers, and AI laboratories. CoreWeave's business model operates on a rental-based approach where customers pay for GPU compute resources on a per-hour basis, similar to traditional cloud providers but optimized specifically for AI and machine learning applications.",
      sections: {
        "1. Fundamental Analysis": {
          content: `CoreWeave's fundamental analysis reveals a company positioned at the intersection of AI infrastructure and cloud computing. The company's financial metrics demonstrate strong growth potential with revenue increasing significantly year-over-year. Key financial highlights include:

• Revenue Growth: CoreWeave has experienced substantial revenue growth driven by increasing demand for AI compute resources
• Market Position: The company operates in the rapidly expanding AI infrastructure market, estimated to reach $50+ billion by 2025
• Competitive Advantage: Specialized focus on GPU-accelerated computing provides differentiation from general-purpose cloud providers
• Customer Base: Serves a diverse range of customers from startups to large enterprises and hyperscalers

The company's business model benefits from the secular trend toward AI adoption across industries, with demand for GPU compute resources expected to continue growing exponentially.`,
          isLocked: false
        },
        "2. Business Segments Analysis": {
          content: `CoreWeave operates through a focused business model centered around GPU-accelerated cloud infrastructure:

Primary Business Segments:
• AI Infrastructure Services: CoreWeave's core offering provides on-demand access to high-performance GPU clusters for AI training and inference workloads
• Enterprise Solutions: Custom infrastructure solutions for large enterprises requiring dedicated AI compute resources
• Research & Development Support: Specialized compute resources for AI research institutions and laboratories

Revenue Streams:
• Pay-per-use Model: Customers pay for GPU compute resources on an hourly basis, similar to traditional cloud providers
• Reserved Capacity: Long-term contracts for customers requiring consistent access to compute resources
• Professional Services: Consulting and implementation services for AI infrastructure deployment

The company's segment focus allows for deep specialization in AI workloads, providing performance advantages over general-purpose cloud providers.`,
          isLocked: false
        },
        "3. Growth Catalysts and Strategic Initiatives": {
          content: `CoreWeave's growth strategy is built around several key catalysts and strategic initiatives:

Growth Catalysts:
• AI Market Expansion: The global AI market is expected to grow at a CAGR of 25%+ through 2030, driving demand for specialized infrastructure
• GPU Supply Constraints: Limited availability of high-end GPUs creates pricing power and competitive moats for existing infrastructure providers
• Enterprise AI Adoption: Increasing enterprise adoption of AI applications requires specialized compute infrastructure
• Research & Development: Growing investment in AI research across academic and corporate institutions

Strategic Initiatives:
• Infrastructure Expansion: CoreWeave is actively expanding its data center footprint to meet growing demand
• Technology Partnerships: Strategic partnerships with major cloud providers and AI companies
• Service Diversification: Development of additional services beyond basic compute, including AI model hosting and optimization
• Geographic Expansion: Plans to expand into new geographic markets to serve global customer base

The company's strategic positioning allows it to capitalize on multiple growth vectors simultaneously.`,
          isLocked: false
        },
        "4. Valuation Analysis and Key Findings": {
          content: `[LOCKED CONTENT - Register to view detailed valuation analysis, intrinsic value estimates, and comprehensive financial modeling]`,
          isLocked: true
        }
      }
    }

    return NextResponse.json(previewContent)
  } catch (error) {
    console.error('Error fetching preview content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview content' },
      { status: 500 }
    )
  }
}

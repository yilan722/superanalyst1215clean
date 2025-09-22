import { BaseDatabaseService } from './base-database-service'

export interface Report {
  id: string
  user_id: string
  stock_symbol: string
  stock_name: string
  report_data: string
  created_at: string
}

export interface ReportWithUser extends Report {
  users?: {
    id: string
    email: string
    name: string | null
  }
}

export class ReportService extends BaseDatabaseService {
  /**
   * Get all reports for a user
   */
  async getUserReports(userId: string): Promise<Report[]> {
    return this.fetchData<Report>(
      'reports',
      '*',
      { user_id: userId },
      { column: 'created_at', ascending: false }
    )
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId: string): Promise<Report | null> {
    return this.fetchSingle<Report>('reports', '*', { id: reportId })
  }

  /**
   * Create new report
   */
  async createReport(reportData: {
    user_id: string
    stock_symbol: string
    stock_name: string
    report_data: string
  }): Promise<Report> {
    return this.insertData<Report>('reports', reportData)
  }

  /**
   * Get reports with user information (admin only)
   */
  async getReportsWithUsers(): Promise<ReportWithUser[]> {
    try {
      const { data, error } = await this.supabase
        .from('reports')
        .select(`
          *,
          users!inner(
            id,
            email,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reports with users:', error)
        throw new Error(error.message)
      }

      return data as ReportWithUser[]
    } catch (error) {
      console.error('Unexpected error fetching reports with users:', error)
      throw error
    }
  }

  /**
   * Get reports by stock symbol
   */
  async getReportsByStock(stockSymbol: string): Promise<Report[]> {
    return this.fetchData<Report>(
      'reports',
      '*',
      { stock_symbol: stockSymbol },
      { column: 'created_at', ascending: false }
    )
  }

  /**
   * Get user's report count
   */
  async getUserReportCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) {
        console.error('Error getting user report count:', error)
        throw new Error(error.message)
      }

      return count || 0
    } catch (error) {
      console.error('Unexpected error getting user report count:', error)
      throw error
    }
  }

  /**
   * Delete report
   */
  async deleteReport(reportId: string): Promise<boolean> {
    return this.deleteData('reports', { id: reportId })
  }

  /**
   * Get recent reports (last 30 days)
   */
  async getRecentReports(userId?: string): Promise<Report[]> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    try {
      let query = this.supabase
        .from('reports')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching recent reports:', error)
        throw new Error(error.message)
      }

      return data as Report[]
    } catch (error) {
      console.error('Unexpected error fetching recent reports:', error)
      throw error
    }
  }
}

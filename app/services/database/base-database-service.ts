// 在客户端使用浏览器客户端，在服务器端使用标准客户端
import { createClient } from '@supabase/supabase-js'
import { supabase as browserSupabase } from './supabase-client'

// Base configuration with validation
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key]
  if (!value || typeof value !== 'string' || value.trim() === '') {
    if (defaultValue) {
      return defaultValue
    }
    throw new Error(`${key} is not set or is not a valid string`)
  }
  return value.trim()
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://decmecsshjqymhkykazg.supabase.co')
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0')

// 创建服务器端 Supabase 客户端（单例）
let serverSupabaseClient: any = null

// 获取正确的 Supabase 客户端
// 在客户端使用浏览器客户端（支持 SSR），在服务器端使用标准客户端
const getSupabaseClient = () => {
  // 在客户端（浏览器环境），使用浏览器客户端
  if (typeof window !== 'undefined') {
    return browserSupabase
  }
  
  // 在服务器端，创建标准客户端（单例模式）
  if (!serverSupabaseClient) {
    serverSupabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js/2.x'
        }
      }
    })
  }
  
  return serverSupabaseClient
}

/**
 * Base database service class with common operations
 */
export abstract class BaseDatabaseService {
  // 使用 getter 确保在运行时获取正确的客户端
  protected get supabase() {
    return getSupabaseClient()
  }

  /**
   * Generic method to fetch data from any table
   */
  protected async fetchData<T>(
    table: string,
    select: string = '*',
    filters?: Record<string, any>,
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<T[]> {
    try {
      let query = this.supabase.from(table).select(select)

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
      }

      const { data, error } = await query

      if (error) {
        console.error(`Error fetching data from ${table}:`, error)
        throw new Error(error.message)
      }

      return data as T[]
    } catch (error) {
      console.error(`Unexpected error fetching data from ${table}:`, error)
      throw error
    }
  }

  /**
   * Generic method to fetch single record
   */
  protected async fetchSingle<T>(
    table: string,
    select: string = '*',
    filters: Record<string, any>
  ): Promise<T | null> {
    try {
      let query = this.supabase.from(table).select(select)

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error(`Error fetching single record from ${table}:`, error)
        throw new Error(error.message)
      }

      return data as T
    } catch (error) {
      console.error(`Unexpected error fetching single record from ${table}:`, error)
      throw error
    }
  }

  /**
   * Generic method to insert data
   */
  protected async insertData<T>(
    table: string,
    data: Partial<T>
  ): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) {
        console.error(`Error inserting data into ${table}:`, error)
        throw new Error(error.message)
      }

      return result as T
    } catch (error) {
      console.error(`Unexpected error inserting data into ${table}:`, error)
      throw error
    }
  }

  /**
   * Generic method to update data
   */
  protected async updateData<T>(
    table: string,
    filters: Record<string, any>,
    updates: Partial<T>
  ): Promise<T> {
    try {
      let query = this.supabase.from(table).update(updates)

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      const { data, error } = await query.select().single()

      if (error) {
        console.error(`Error updating data in ${table}:`, error)
        throw new Error(error.message)
      }

      return data as T
    } catch (error) {
      console.error(`Unexpected error updating data in ${table}:`, error)
      throw error
    }
  }

  /**
   * Generic method to delete data
   */
  protected async deleteData(
    table: string,
    filters: Record<string, any>
  ): Promise<boolean> {
    try {
      let query = this.supabase.from(table).delete()

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      const { error } = await query

      if (error) {
        console.error(`Error deleting data from ${table}:`, error)
        throw new Error(error.message)
      }

      return true
    } catch (error) {
      console.error(`Unexpected error deleting data from ${table}:`, error)
      throw error
    }
  }
}

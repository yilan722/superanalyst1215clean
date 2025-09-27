import { createClient } from '@supabase/supabase-js'

// Server-side configuration with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Server-side database service class with service role access
 * This bypasses RLS policies and should only be used on the server side
 */
export abstract class ServerDatabaseService {
  protected supabase = supabase

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

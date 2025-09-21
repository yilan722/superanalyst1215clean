/**
 * User Profile Utilities
 * Ensures user profiles are created in the database when needed
 */

import { createApiSupabaseClient } from './supabase-server'

export interface UserProfile {
  id: string
  email: string
  name?: string | null
  created_at: string
  updated_at: string
  free_reports_used: number
  paid_reports_used: number
  monthly_report_limit: number
  subscription_id?: string | null
  subscription_type?: number | null
  subscription_start?: string | null
  subscription_end?: string | null
}

/**
 * Ensures a user profile exists in the database
 * Creates the profile if it doesn't exist
 */
export async function ensureUserProfile(
  request: Request,
  user: { id: string; email?: string; user_metadata?: any }
): Promise<UserProfile | null> {
  const supabase = createApiSupabaseClient(request)
  
  try {
    // First, try to get the existing user profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (existingProfile && !fetchError) {
      console.log('✅ User profile found:', user.id)
      return existingProfile as UserProfile
    }
    
    // If user doesn't exist, create the profile
    if (fetchError?.code === 'PGRST116') {
      console.log('📝 User profile not found, creating new profile for:', user.id)
      
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          free_reports_used: 0,
          paid_reports_used: 0,
          monthly_report_limit: 0
        })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Failed to create user profile:', createError)
        return null
      }
      
      console.log('✅ User profile created successfully:', user.id)
      return newProfile as UserProfile
    }
    
    // Other errors
    console.error('❌ Error fetching user profile:', fetchError)
    return null
    
  } catch (error) {
    console.error('❌ Exception in ensureUserProfile:', error)
    return null
  }
}

/**
 * Gets user profile with fallback creation
 */
export async function getUserProfile(
  request: Request,
  userId: string
): Promise<UserProfile | null> {
  const supabase = createApiSupabaseClient(request)
  
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('❌ Error fetching user profile:', error)
      return null
    }
    
    return profile as UserProfile
  } catch (error) {
    console.error('❌ Exception in getUserProfile:', error)
    return null
  }
}

/**
 * Updates user profile
 */
export async function updateUserProfile(
  request: Request,
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const supabase = createApiSupabaseClient(request)
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('❌ Error updating user profile:', error)
      return false
    }
    
    console.log('✅ User profile updated successfully:', userId)
    return true
  } catch (error) {
    console.error('❌ Exception in updateUserProfile:', error)
    return false
  }
}

/**
 * Checks if user has sufficient report quota
 */
export async function checkUserReportQuota(
  request: Request,
  userId: string
): Promise<{ canGenerate: boolean; remainingQuota: number; reason?: string }> {
  const profile = await getUserProfile(request, userId)
  
  if (!profile) {
    return {
      canGenerate: false,
      remainingQuota: 0,
      reason: 'User profile not found'
    }
  }
  
  // Check if user has an active subscription
  const hasActiveSubscription = profile.subscription_end && 
    new Date(profile.subscription_end) > new Date()
  
  if (hasActiveSubscription) {
    // For subscribed users, check monthly limit
    const usedThisMonth = profile.paid_reports_used
    const monthlyLimit = profile.monthly_report_limit
    
    if (monthlyLimit > 0 && usedThisMonth >= monthlyLimit) {
      return {
        canGenerate: false,
        remainingQuota: 0,
        reason: 'Monthly report limit reached'
      }
    }
    
    return {
      canGenerate: true,
      remainingQuota: monthlyLimit - usedThisMonth
    }
  } else {
    // For free users, check free report limit
    const usedFreeReports = profile.free_reports_used || 0
    const freeLimit = 1 // Users get 1 free report
    
    if (usedFreeReports >= freeLimit) {
      return {
        canGenerate: false,
        remainingQuota: 0,
        reason: 'No free report quota left'
      }
    }
    
    return {
      canGenerate: true,
      remainingQuota: freeLimit - usedFreeReports
    }
  }
}

/**
 * Increments user report usage
 */
export async function incrementUserReportUsage(
  request: Request,
  userId: string,
  isPaidReport: boolean = false
): Promise<boolean> {
  const supabase = createApiSupabaseClient(request)
  
  try {
    const updateField = isPaidReport ? 'paid_reports_used' : 'free_reports_used'
    
    const { error } = await supabase
      .from('users')
      .update({
        [updateField]: `${updateField} + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('❌ Error incrementing report usage:', error)
      return false
    }
    
    console.log('✅ Report usage incremented for user:', userId)
    return true
  } catch (error) {
    console.error('❌ Exception in incrementUserReportUsage:', error)
    return false
  }
}

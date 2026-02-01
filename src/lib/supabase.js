import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project credentials
// Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl.includes('supabase.co')
}

// Only create client if configured, otherwise provide a dummy object
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

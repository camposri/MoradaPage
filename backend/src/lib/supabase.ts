import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for SSR
export const createSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side client with service role key
export const createSupabaseServerClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface Property {
  id: string
  title: string
  description: string
  property_type: string
  price: number
  area: number
  bedrooms?: number
  bathrooms?: number
  location: string
  images: string[]
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: 'unread' | 'read'
  created_at: string
}

export interface Visit {
  id: string
  property_id: string
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  visit_date: string
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}
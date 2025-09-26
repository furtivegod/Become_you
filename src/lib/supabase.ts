import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  samcart_order_id: string
  amount: number
  currency: string
  status: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  order_id: string
  status: string
  created_at: string
  completed_at?: string
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface PlanOutput {
  id: string
  session_id: string
  plan_data: Record<string, unknown>
  created_at: string
}

export interface PdfJob {
  id: string
  session_id: string
  status: string
  pdf_url?: string
  created_at: string
  completed_at?: string
}
import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Legacy client for non-auth requests
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Client for auth-enabled requests in Client Components (using @supabase/ssr)
export const createAuthClient = () =>
    createBrowserClient(supabaseUrl, supabaseAnonKey)

import { createClient } from '@supabase/supabase-js'

// Tanda seru (!) di akhir digunakan untuk memberi tahu TypeScript bahwa nilai dari file .env pasti ada
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
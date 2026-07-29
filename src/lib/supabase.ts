import { createClient } from '@supabase/supabase-js'

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const supabaseUrl =
	import.meta.env.PROD && typeof window !== 'undefined'
		? `${window.location.origin}/supabase`
		: configuredSupabaseUrl

if (!configuredSupabaseUrl || !supabaseAnonKey) {
	console.warn('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

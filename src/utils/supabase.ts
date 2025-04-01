import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie } from '@tanstack/react-start/server'
import { trackSignIn } from './analytics'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const getSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const getSupabaseServerClient = () => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // @ts-ignore
      getAll() {
        return Object.entries(parseCookies()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookies: { name: string; value: string }[]) {
        cookies.forEach((cookie) => {
          setCookie(cookie.name, cookie.value)
        })
      },
    },
  })
}

export const signInAnonymously = async () => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInAnonymously();
  console.log('data', data);
  if (data?.user && !error) {
    trackSignIn(data.user.id, 'anonymous', { 
      isAnonymous: true,
      status: 'success'
    })
  }
  
  return { data, error }
}

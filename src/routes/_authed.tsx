import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Login } from '../components/Login'
import { getSupabaseServerClient } from '../utils/supabase'
import { BASE_URL } from '../utils/config'
export const loginFn = createServerFn()
  .handler(async () => {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${BASE_URL}/auth/callback`,
      },
    })

    if (error) {
      return {
        error: true,
        message: error.message,
      }
    }

    return data;
  })

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <Login />
    }

    throw error
  },
})

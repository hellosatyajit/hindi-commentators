import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Login } from '../components/Login'
import { getSupabaseServerClient } from '../utils/supabase'
import { BASE_URL } from '../utils/config'
import { resetUser } from '~/utils/analytics'
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

export const logoutFn = createServerFn().handler(async () => {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.auth.getUser()

  resetUser(data.user?.id);

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      error: true,
      message: error.message,
    }
  }

  throw redirect({
    href: '/',
  })
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

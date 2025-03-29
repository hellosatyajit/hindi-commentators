import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../utils/supabase'
import { trackSignIn } from '../utils/analytics'

// @ts-ignore
const authCallbackFn = createServerFn({ method: 'GET' }).handler(async ({ data: code }) => {
  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  // Track successful sign-in if we have user data
  if (data.user) {
    trackSignIn(data.user.id, 'google', { 
      email: data.user.email,
      name: data.user.user_metadata?.name
    });
  }

  return redirect({
    to: "/",
    throw: true,
  });
})

export const Route = createFileRoute('/auth/callback')({
  preload: false,
  loader: ({ location }) => {
    return authCallbackFn({ data: (location.search as { code: string }).code as unknown as undefined });
  },
})

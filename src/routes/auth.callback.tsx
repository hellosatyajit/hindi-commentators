import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../utils/supabase'

// @ts-ignore
const authCallbackFn = createServerFn({ method: 'GET' }).handler(async ({ data: code }) => {
  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return new Response(error.message, { status: 500 });
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

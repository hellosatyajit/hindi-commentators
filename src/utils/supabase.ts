import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { parseCookies, setCookie } from "@tanstack/react-start/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase credentials missing in browser environment");
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getSupabaseServerClient() {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      // @ts-ignore Wait till Supabase overload works
      getAll() {
        return Object.entries(parseCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies) {
        cookies.forEach((cookie) => {
          setCookie(cookie.name, cookie.value);
        });
      },
    },
  });
}

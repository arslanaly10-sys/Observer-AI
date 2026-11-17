import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./env";

/**
 * Server client for Server Components, Server Actions and Route Handlers. Create one per request.
 * Server Components can't write cookies; the proxy refreshes sessions, so that write is safely ignored here.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy handles the refresh.
        }
      },
    },
  });
}

/** The verified user id and email, or null. Always uses getClaims (signature-verified), never getSession. */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const c = data?.claims;
  return c?.sub ? { id: c.sub as string, email: (c.email as string | undefined) ?? "", supabase } : null;
}

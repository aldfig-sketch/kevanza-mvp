import { createClient, SupabaseClient } from '@supabase/supabase-js'

function requireSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase server configuration is incomplete')
  }

  return { url, anonKey }
}

/** Creates a request-scoped client so RLS sees the caller's access token. */
export function createRequestSupabaseClient(token: string): SupabaseClient {
  const { url, anonKey } = requireSupabaseConfig()
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}

export function createServiceSupabaseClient(): SupabaseClient {
  const { url } = requireSupabaseConfig()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.trim().split(/\s+/)
  return scheme?.toLowerCase() === 'bearer' && token ? token : null
}

export async function authenticateRequest(authorization?: string) {
  const token = getBearerToken(authorization)
  if (!token) return null

  const client = createRequestSupabaseClient(token)
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) return null

  return { client, user: data.user, token }
}

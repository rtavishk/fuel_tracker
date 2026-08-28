import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialized Supabase client
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL : '');
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY : '');

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('YOUR_SUPABASE_PROJECT_REF') ||
    supabaseUrl.includes('YOUR_PROJECT_REF') ||
    supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
  ) {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL : '');
  const key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY : '');
  return Boolean(
    url &&
    key &&
    !url.includes('YOUR_SUPABASE_PROJECT_REF') &&
    !url.includes('YOUR_PROJECT_REF') &&
    !key.includes('YOUR_SUPABASE_ANON_KEY')
  );
};

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.signInWithPassword({ email, password });
}

export async function resetPasswordForEmail(email: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');
  return client.auth.resetPasswordForEmail(email);
}


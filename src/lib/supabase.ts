import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-translogix-cluster.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Supabase Database Sync Helper:
 * Facilitates pulling & pushing trips, tractors, trailers, expenses, and invoices to Supabase.
 */
export async function syncEntityToSupabase<T extends { id: string }>(
  tableName: 'trips' | 'tractors' | 'trailers' | 'drivers' | 'expenses' | 'invoices' | 'customers',
  item: T
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    // Falls back gracefully to local reactive state
    return { success: true };
  }

  try {
    const { error } = await supabase.from(tableName).upsert(item);
    if (error) {
      console.warn(`Supabase upsert into ${tableName} notice:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

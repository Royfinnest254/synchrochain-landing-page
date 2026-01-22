import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create the client if credentials are available
// This prevents the app from crashing when env vars are not set
let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('Supabase credentials not configured. Waitlist features will be limited.');
}

// Export the client (may be null if not configured)
export const supabase = supabaseClient;

// Helper to check if Supabase is available
export const isSupabaseConfigured = (): boolean => {
    return supabaseClient !== null;
};

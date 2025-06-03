import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'prompt-management-app',
    },
  },
});

// Add error handling for failed requests
supabase.handleError = (error: any) => {
  console.error('Supabase Error:', error);
  if (error.message?.includes('Failed to fetch')) {
    console.error('Network Error: Unable to connect to Supabase');
  }
  throw error;
};
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" in the top right to set up your project.');
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
  // Add better error handling and retries
  db: {
    schema: 'public',
  },
});

// Verify connection
export const verifySupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('prompt_analytics').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    throw new Error('Unable to connect to Supabase. Please ensure you have clicked "Connect to Supabase" to set up your project.');
  }
};
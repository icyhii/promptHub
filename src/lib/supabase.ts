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

// Verify connection with better error messaging
export const verifySupabaseConnection = async () => {
  try {
    // Use a simpler query that's more likely to work - check auth status
    const { data, error } = await supabase.auth.getSession();
    
    // If we get here without throwing, the connection is working
    // We don't need to check for auth errors since we just want to verify connectivity
    if (error && error.message.includes('fetch')) {
      throw new Error('Network connection failed');
    }
    
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    
    // Check if it's a network/fetch error
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Unable to connect to Supabase. Please check your internet connection and ensure the Supabase URL is correct.');
    }
    
    throw new Error('Unable to connect to Supabase. Please ensure you have clicked "Connect to Supabase" to set up your project.');
  }
};
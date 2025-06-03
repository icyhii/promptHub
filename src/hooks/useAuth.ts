import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const {
    data: session,
    isLoading,
    error
  } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    staleTime: 1000 * 60 * 5, // Consider session data fresh for 5 minutes
  });

  return {
    session,
    user: session?.user,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
  };
}
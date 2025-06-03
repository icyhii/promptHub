import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface SearchFilters {
  categories?: string[];
  models?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  userContext?: {
    preferredCategories?: string[];
    preferredModels?: string[];
    recentSearches?: string[];
  };
}

export function useSearch({ query, filters, limit = 10, userContext }: SearchOptions) {
  return useQuery({
    queryKey: ['search', query, filters, limit],
    queryFn: async () => {
      const apiUrl = `${supabase.supabaseUrl}/functions/v1/semantic-search`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
          limit,
          userContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      return response.json();
    },
    enabled: query.length > 0,
  });
}
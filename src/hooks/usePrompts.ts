import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Prompt {
  id: string;
  title: string;
  body: string;
  tags: string[];
  metadata: Record<string, any>;
  creator_id: string;
  status: 'draft' | 'active' | 'deprecated';
  visibility: 'private' | 'public';
  created_at: string;
  updated_at: string;
  forked_from?: string;
  fork_version?: number;
}

interface SearchFilters {
  query?: string;
  categories?: string[];
  dateRange?: { start: Date; end: Date };
  models?: string[];
  complexity?: { min: number; max: number };
  sort?: {
    field: 'relevance' | 'date' | 'complexity';
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export function usePrompts(filters?: SearchFilters) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: prompts,
    isLoading,
    error
  } = useQuery({
    queryKey: ['prompts', filters, user?.id],
    queryFn: async () => {
      if (!user) return [];

      if (filters?.query || filters?.categories || filters?.dateRange || filters?.models || filters?.complexity) {
        const { data, error } = await supabase
          .rpc('search_prompts', {
            search_query: filters.query,
            categories: filters.categories,
            min_date: filters.dateRange?.start?.toISOString(),
            max_date: filters.dateRange?.end?.toISOString(),
            models: filters.models,
            min_complexity: filters.complexity?.min,
            max_complexity: filters.complexity?.max,
            sort_by: filters.sort?.field || 'relevance',
            sort_dir: filters.sort?.direction || 'desc',
            limit_val: filters.limit || 20,
            offset_val: ((filters.page || 1) - 1) * (filters.limit || 20),
            user_id: user.id
          });

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          creator:creator_id(id, email)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createPrompt = useMutation({
    mutationFn: async (newPrompt: Partial<Prompt>) => {
      if (!user) throw new Error('User must be authenticated to create prompts');

      const promptWithCreator = {
        ...newPrompt,
        creator_id: user.id
      };

      const { data, error } = await supabase
        .from('prompts')
        .insert(promptWithCreator)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    }
  });

  const forkPrompt = useMutation({
    mutationFn: async ({ promptId, title }: { promptId: string; title?: string }) => {
      if (!user) throw new Error('User must be authenticated to fork prompts');

      const { data, error } = await supabase
        .rpc('fork_prompt', {
          original_prompt_id: promptId,
          new_title: title,
          user_id: user.id
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    }
  });

  const updatePrompt = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Prompt> & { id: string }) => {
      if (!user) throw new Error('User must be authenticated to update prompts');

      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .eq('creator_id', user.id) // Ensure user owns the prompt
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompt', data.id] });
    }
  });

  const deletePrompt = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User must be authenticated to delete prompts');

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id); // Ensure user owns the prompt
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    }
  });

  return {
    prompts,
    isLoading,
    error,
    createPrompt,
    forkPrompt,
    updatePrompt,
    deletePrompt
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

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
  creator?: {
    email: string;
  };
}

interface SearchFilters {
  visibility?: 'public' | 'private';
  search?: string;
  category?: string;
  model?: string;
  sort?: {
    field: 'usage' | 'rating' | 'created_at';
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

      let query = supabase
        .from('prompts')
        .select(`
          *,
          creator:creator_id(email)
        `);

      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters?.search) {
        query = query.textSearch('title', filters.search);
      }

      if (filters?.sort) {
        query = query.order(filters.sort.field, {
          ascending: filters.sort.direction === 'asc'
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createPrompt = useMutation({
    mutationFn: async (newPrompt: Partial<Prompt>) => {
      if (!user) throw new Error('User must be authenticated');

      const promptData = {
        ...newPrompt,
        creator_id: user.id,
        status: newPrompt.status || 'draft',
        visibility: newPrompt.visibility || 'private'
      };

      const { data, error } = await supabase
        .from('prompts')
        .insert(promptData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    }
  });

  const updatePrompt = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Prompt> & { id: string }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .eq('creator_id', user.id)
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

  const forkPrompt = useMutation({
    mutationFn: async ({ promptId, title }: { promptId: string; title?: string }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data: originalPrompt, error: fetchError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('prompts')
        .insert({
          title: title || `${originalPrompt.title} (Fork)`,
          body: originalPrompt.body,
          tags: originalPrompt.tags,
          metadata: originalPrompt.metadata,
          creator_id: user.id,
          status: 'draft',
          visibility: 'private',
          forked_from: promptId,
          fork_version: 1
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success('Prompt forked successfully');
    }
  });

  return {
    prompts,
    isLoading,
    error,
    createPrompt,
    updatePrompt,
    forkPrompt
  };
}
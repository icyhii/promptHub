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
  creator?: {
    email: string;
  };
  analytics?: {
    views: number;
    unique_users: number;
    likes: number;
    shares: number;
    comments: number;
  }[];
  versions?: {
    version_number: number;
    created_at: string;
  }[];
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
          creator:creator_id(id, email),
          analytics:prompt_analytics(
            views,
            unique_users,
            likes,
            shares,
            comments
          ),
          versions:prompt_versions(
            version_number,
            created_at
          )
        `);

      // Apply filters
      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters?.search) {
        query = query.textSearch('title', filters.search);
      }

      if (filters?.category) {
        query = query.eq('metadata->category', filters.category);
      }

      if (filters?.model) {
        query = query.eq('metadata->model', filters.model);
      }

      // Apply sorting
      if (filters?.sort) {
        query = query.order(filters.sort.field, {
          ascending: filters.sort.direction === 'asc'
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters?.limit) {
        query = query
          .limit(filters.limit)
          .range(
            ((filters.page || 1) - 1) * filters.limit,
            (filters.page || 1) * filters.limit - 1
          );
      }

      const { data, error } = await query;
      
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
    onMutate: async (newPrompt) => {
      await queryClient.cancelQueries({ queryKey: ['prompts', filters, user?.id] });

      const previousPrompts = queryClient.getQueryData<Prompt[]>(['prompts', filters, user?.id]);

      if (previousPrompts) {
        queryClient.setQueryData<Prompt[]>(['prompts', filters, user?.id], [
          {
            ...newPrompt,
            id: 'temp-id',
            creator_id: user?.id || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Prompt,
          ...previousPrompts,
        ]);
      }

      return { previousPrompts };
    },
    onError: (err, newPrompt, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(['prompts', filters, user?.id], context.previousPrompts);
      }
      toast.error('Failed to create prompt');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts', filters, user?.id] });
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
    onMutate: async ({ promptId, title }) => {
      await queryClient.cancelQueries({ queryKey: ['prompts', filters, user?.id] });

      const previousPrompts = queryClient.getQueryData<Prompt[]>(['prompts', filters, user?.id]);
      const originalPrompt = previousPrompts?.find(p => p.id === promptId);

      if (previousPrompts && originalPrompt) {
        const optimisticFork = {
          ...originalPrompt,
          id: 'temp-fork-id',
          title: title || `${originalPrompt.title} (Fork)`,
          creator_id: user?.id || '',
          forked_from: promptId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<Prompt[]>(['prompts', filters, user?.id], [
          optimisticFork,
          ...previousPrompts,
        ]);
      }

      return { previousPrompts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(['prompts', filters, user?.id], context.previousPrompts);
      }
      toast.error('Failed to fork prompt');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts', filters, user?.id] });
    }
  });

  const updatePrompt = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Prompt> & { id: string }) => {
      if (!user) throw new Error('User must be authenticated to update prompts');

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
    onMutate: async (updatedPrompt) => {
      await queryClient.cancelQueries({ queryKey: ['prompts', filters, user?.id] });
      await queryClient.cancelQueries({ queryKey: ['prompt', updatedPrompt.id] });

      const previousPrompts = queryClient.getQueryData<Prompt[]>(['prompts', filters, user?.id]);
      const previousPrompt = queryClient.getQueryData<Prompt>(['prompt', updatedPrompt.id]);

      if (previousPrompts) {
        queryClient.setQueryData<Prompt[]>(
          ['prompts', filters, user?.id],
          previousPrompts.map(prompt =>
            prompt.id === updatedPrompt.id
              ? { ...prompt, ...updatedPrompt, updated_at: new Date().toISOString() }
              : prompt
          )
        );
      }

      if (previousPrompt) {
        queryClient.setQueryData<Prompt>(
          ['prompt', updatedPrompt.id],
          { ...previousPrompt, ...updatedPrompt, updated_at: new Date().toISOString() }
        );
      }

      return { previousPrompts, previousPrompt };
    },
    onError: (err, updatedPrompt, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(['prompts', filters, user?.id], context.previousPrompts);
      }
      if (context?.previousPrompt) {
        queryClient.setQueryData(['prompt', updatedPrompt.id], context.previousPrompt);
      }
      toast.error('Failed to update prompt');
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prompts', filters, user?.id] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['prompt', data.id] });
      }
    }
  });

  const deletePrompt = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User must be authenticated to delete prompts');

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id);
      
      if (error) throw error;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['prompts', filters, user?.id] });

      const previousPrompts = queryClient.getQueryData<Prompt[]>(['prompts', filters, user?.id]);

      if (previousPrompts) {
        queryClient.setQueryData<Prompt[]>(
          ['prompts', filters, user?.id],
          previousPrompts.filter(prompt => prompt.id !== deletedId)
        );
      }

      return { previousPrompts };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(['prompts', filters, user?.id], context.previousPrompts);
      }
      toast.error('Failed to delete prompt');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts', filters, user?.id] });
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
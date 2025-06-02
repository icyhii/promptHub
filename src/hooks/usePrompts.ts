import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

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
}

interface PromptFilters {
  status?: string;
  visibility?: string;
  tags?: string[];
  search?: string;
}

export function usePrompts(filters?: PromptFilters) {
  const queryClient = useQueryClient();

  const {
    data: prompts,
    isLoading,
    error
  } = useQuery({
    queryKey: ['prompts', filters],
    queryFn: async () => {
      let query = supabase
        .from('prompts')
        .select(`
          *,
          creator:creator_id(id, email),
          versions:prompt_versions(id, version_number, content, created_at)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createPrompt = useMutation({
    mutationFn: async (newPrompt: Partial<Prompt>) => {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User must be authenticated to create prompts');

      // Add the creator_id to the new prompt
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

  const updatePrompt = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Prompt> & { id: string }) => {
      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
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
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);
      
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
    updatePrompt,
    deletePrompt
  };
}

export function usePromptVersions(promptId: string) {
  return useQuery({
    queryKey: ['prompt-versions', promptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_id', promptId)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}
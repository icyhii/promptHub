import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface UserSettings {
  id: string;
  email: string;
  role: string;
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
      desktop?: boolean;
    };
    defaultModel?: string;
    apiKeys?: {
      name: string;
      key: string;
      createdAt: string;
    }[];
  };
  created_at: string;
  updated_at: string;
}

export function useUserSettings() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          api_keys:token_usage_logs(
            model,
            token_count,
            created_at
          ),
          notifications:user_engagement(
            action_type,
            created_at
          )
        `)
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserSettings;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings['preferences']>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update({
          preferences: {
            ...settings?.preferences,
            ...updates
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    }
  });

  const createApiKey = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const key = `pk_${Math.random().toString(36).substr(2, 9)}`;
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name,
          key,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    }
  });

  const deleteApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    createApiKey,
    deleteApiKey
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export function useTeam(teamId?: string) {
  const queryClient = useQueryClient();

  const {
    data: team,
    isLoading: isTeamLoading,
    error: teamError
  } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          owner:owner_id(*),
          members:team_members(
            user_id,
            role,
            user:user_id(*)
          )
        `)
        .eq('id', teamId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!teamId
  });

  const {
    data: userTeams,
    isLoading: isUserTeamsLoading,
    error: userTeamsError
  } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team:team_id(*),
          role
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const createTeam = useMutation({
    mutationFn: async (newTeam: Partial<Team>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(newTeam)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    }
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    }
  });

  const inviteMember = useMutation({
    mutationFn: async ({ teamId, email, role }: { teamId: string; email: string; role: TeamMember['role'] }) => {
      // In a real app, you'd typically send an invitation email here
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) throw userError;

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    }
  });

  const removeMember = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    }
  });

  return {
    team,
    userTeams,
    isLoading: isTeamLoading || isUserTeamsLoading,
    error: teamError || userTeamsError,
    createTeam,
    updateTeam,
    inviteMember,
    removeMember
  };
}
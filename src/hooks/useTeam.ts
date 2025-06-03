import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  settings: {
    logo_url?: string;
    description?: string;
    visibility: 'public' | 'private';
    archived: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  user: {
    email: string;
    profile?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamMember['role'];
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  expires_at: string;
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
          settings:team_settings(*),
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
          team:team_id(
            *,
            settings:team_settings(*)
          ),
          role
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const createTeam = useMutation({
    mutationFn: async ({ 
      name, 
      description, 
      visibility = 'private' 
    }: { 
      name: string; 
      description?: string; 
      visibility?: 'public' | 'private';
    }) => {
      const { data, error } = await supabase
        .rpc('create_team_with_settings', {
          team_name: name,
          team_description: description,
          team_visibility: visibility
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    }
  });

  const updateTeam = useMutation({
    mutationFn: async ({ 
      id,
      name,
      settings
    }: { 
      id: string;
      name?: string;
      settings?: Partial<Team['settings']>;
    }) => {
      const updates: Promise<any>[] = [];

      if (name) {
        updates.push(
          supabase
            .from('teams')
            .update({ name })
            .eq('id', id)
        );
      }

      if (settings) {
        updates.push(
          supabase
            .from('team_settings')
            .update(settings)
            .eq('team_id', id)
        );
      }

      const results = await Promise.all(updates);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;

      return { id, name, settings };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    }
  });

  const inviteMember = useMutation({
    mutationFn: async ({ 
      teamId, 
      email, 
      role 
    }: { 
      teamId: string; 
      email: string; 
      role: TeamMember['role'];
    }) => {
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString()
        });
      
      if (error) throw error;

      // In a real app, you'd send an invitation email here
      // For now, we'll just log the token
      console.log('Invitation token:', token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    }
  });

  const acceptInvitation = useMutation({
    mutationFn: async (token: string) => {
      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (inviteError) throw inviteError;
      if (!invitation) throw new Error('Invalid invitation');
      if (invitation.status !== 'pending') throw new Error('Invitation is no longer valid');
      if (new Date(invitation.expires_at) < new Date()) throw new Error('Invitation has expired');

      const { error: acceptError } = await supabase
        .from('team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: invitation.role
        });

      if (acceptError) throw acceptError;

      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    }
  });

  const removeMember = useMutation({
    mutationFn: async ({ 
      teamId, 
      userId 
    }: { 
      teamId: string; 
      userId: string;
    }) => {
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

  const updateMemberRole = useMutation({
    mutationFn: async ({ 
      teamId, 
      userId, 
      role 
    }: { 
      teamId: string; 
      userId: string; 
      role: TeamMember['role'];
    }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    }
  });

  const archiveTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('team_settings')
        .update({ archived: true })
        .eq('team_id', teamId);
      
      if (error) throw error;
    },
    onSuccess: (teamId) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
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
    acceptInvitation,
    removeMember,
    updateMemberRole,
    archiveTeam
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { diff_match_patch } from 'diff-match-patch';

const dmp = new diff_match_patch();

interface Version {
  id: string;
  prompt_id: string;
  version_number: number;
  content: any;
  change_log?: string;
  metadata: Record<string, any>;
  created_at: string;
  created_by: {
    email: string;
  };
  branch_id?: string;
  parent_version_id?: string;
  is_latest: boolean;
  performance_metrics: Record<string, any>;
}

interface Branch {
  id: string;
  name: string;
  type: 'main' | 'feature' | 'experiment';
  description?: string;
  created_at: string;
  created_by: {
    email: string;
  };
  base_version_id: string;
  is_active: boolean;
}

interface Review {
  id: string;
  version_id: string;
  reviewer_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  feedback?: string;
  quality_score?: number;
}

interface VersionDiff {
  additions: string[];
  deletions: string[];
  conflicts?: {
    ours: string[];
    theirs: string[];
    resolution?: string;
  }[];
}

export function useVersionControl(promptId?: string) {
  const queryClient = useQueryClient();

  const {
    data: versions,
    isLoading: versionsLoading,
    error: versionsError
  } = useQuery({
    queryKey: ['versions', promptId],
    queryFn: async () => {
      if (!promptId) return null;
      
      const { data, error } = await supabase
        .from('prompt_versions')
        .select(`
          *,
          created_by:created_by(email),
          reviews:prompt_reviews(*)
        `)
        .eq('prompt_id', promptId)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!promptId
  });

  const {
    data: branches,
    isLoading: branchesLoading,
    error: branchesError
  } = useQuery({
    queryKey: ['branches', promptId],
    queryFn: async () => {
      if (!promptId) return null;
      
      const { data, error } = await supabase
        .from('prompt_branches')
        .select(`
          *,
          created_by:created_by(email)
        `)
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!promptId
  });

  const createBranch = useMutation({
    mutationFn: async ({
      name,
      type,
      description
    }: {
      name: string;
      type: Branch['type'];
      description?: string;
    }) => {
      if (!promptId) throw new Error('Prompt ID is required');

      const { data, error } = await supabase
        .rpc('create_prompt_branch', {
          p_prompt_id: promptId,
          p_name: name,
          p_type: type,
          p_description: description
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', promptId] });
    }
  });

  const createVersion = useMutation({
    mutationFn: async ({
      content,
      changeLog,
      branchId
    }: {
      content: any;
      changeLog?: string;
      branchId?: string;
    }) => {
      if (!promptId) throw new Error('Prompt ID is required');

      const latestVersion = versions?.[0];
      const versionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

      const { data, error } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: promptId,
          version_number: versionNumber,
          content,
          change_log: changeLog,
          branch_id: branchId,
          parent_version_id: latestVersion?.id,
          is_latest: true
        })
        .select()
        .single();

      if (error) throw error;

      // Update previous version's is_latest flag
      if (latestVersion) {
        await supabase
          .from('prompt_versions')
          .update({ is_latest: false })
          .eq('id', latestVersion.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', promptId] });
    }
  });

  const submitReview = useMutation({
    mutationFn: async ({
      versionId,
      status,
      feedback,
      qualityScore
    }: {
      versionId: string;
      status: Review['status'];
      feedback?: string;
      qualityScore?: number;
    }) => {
      const { data, error } = await supabase
        .from('prompt_reviews')
        .insert({
          version_id: versionId,
          status,
          feedback,
          quality_score: qualityScore
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', promptId] });
    }
  });

  const mergeBranches = useMutation({
    mutationFn: async ({
      sourceBranchId,
      targetBranchId,
      strategy = 'auto'
    }: {
      sourceBranchId: string;
      targetBranchId: string;
      strategy?: 'auto' | 'manual';
    }) => {
      const { data, error } = await supabase
        .rpc('merge_prompt_branches', {
          p_source_branch_id: sourceBranchId,
          p_target_branch_id: targetBranchId,
          p_strategy: strategy
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', promptId] });
      queryClient.invalidateQueries({ queryKey: ['versions', promptId] });
    }
  });

  const calculateDiff = (oldContent: any, newContent: any): VersionDiff => {
    const diffs = dmp.diff_main(
      typeof oldContent === 'string' ? oldContent : JSON.stringify(oldContent),
      typeof newContent === 'string' ? newContent : JSON.stringify(newContent)
    );
    dmp.diff_cleanupSemantic(diffs);

    return {
      additions: diffs.filter(([type]) => type === 1).map(([, text]) => text),
      deletions: diffs.filter(([type]) => type === -1).map(([, text]) => text)
    };
  };

  return {
    versions,
    branches,
    isLoading: versionsLoading || branchesLoading,
    error: versionsError || branchesError,
    createBranch,
    createVersion,
    submitReview,
    mergeBranches,
    calculateDiff
  };
}
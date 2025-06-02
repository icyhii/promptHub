import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { usePrompts } from './usePrompts';
import { diff_match_patch } from 'diff-match-patch';

const dmp = new diff_match_patch();

interface Version {
  id: string;
  prompt_id: string;
  version_number: number;
  content: any;
  diff: any;
  description: string;
  notes?: string;
  tags: string[];
  created_by: string;
  created_at: string;
  restored_from_version?: number;
}

interface VersionDiff {
  additions: string[];
  deletions: string[];
  modifications: string[];
}

export function useVersionControl(promptId?: string) {
  const queryClient = useQueryClient();
  const { updatePrompt } = usePrompts();

  const {
    data: versions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['versions', promptId],
    queryFn: async () => {
      if (!promptId) return null;
      
      const { data, error } = await supabase
        .from('prompt_versions')
        .select(`
          *,
          created_by:created_by(email)
        `)
        .eq('prompt_id', promptId)
        .order('version_number', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!promptId
  });

  const createVersion = useMutation({
    mutationFn: async ({
      promptId,
      content,
      description,
      notes,
      tags
    }: {
      promptId: string;
      content: any;
      description: string;
      notes?: string;
      tags?: string[];
    }) => {
      const { data: previousVersion } = await supabase
        .from('prompt_versions')
        .select('content, version_number')
        .eq('prompt_id', promptId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      // Calculate diff if previous version exists
      const diff = previousVersion ? calculateDiff(previousVersion.content, content) : null;

      const { data, error } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: promptId,
          content,
          diff,
          description,
          notes,
          tags,
          version_number: previousVersion ? previousVersion.version_number + 1 : 1
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

  const restoreVersion = useMutation({
    mutationFn: async ({ version, description }: { version: Version; description: string }) => {
      // First, update the prompt content
      await updatePrompt.mutateAsync({
        id: version.prompt_id,
        ...version.content
      });

      // Then create a new version entry marking it as restored
      const { error } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: version.prompt_id,
          content: version.content,
          description,
          restored_from_version: version.version_number,
          version_number: (versions?.[0]?.version_number || 0) + 1
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', promptId] });
    }
  });

  const calculateDiff = (oldContent: any, newContent: any): VersionDiff => {
    const diffs = dmp.diff_main(JSON.stringify(oldContent), JSON.stringify(newContent));
    dmp.diff_cleanupSemantic(diffs);

    return {
      additions: diffs.filter(([type]) => type === 1).map(([, text]) => text),
      deletions: diffs.filter(([type]) => type === -1).map(([, text]) => text),
      modifications: diffs.filter(([type]) => type === 0).map(([, text]) => text)
    };
  };

  return {
    versions,
    isLoading,
    error,
    createVersion,
    restoreVersion,
    calculateDiff
  };
}
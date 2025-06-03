import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface ExportOptions {
  format: 'json' | 'csv';
  filters?: Record<string, any>;
  version?: string;
}

interface ImportOptions {
  format: 'json' | 'csv';
  file: File;
  options?: {
    validateOnly?: boolean;
    updateExisting?: boolean;
    importTags?: boolean;
    importMetadata?: boolean;
  };
}

export function useDataManagement() {
  const queryClient = useQueryClient();

  // Query exports
  const {
    data: exports,
    isLoading: exportsLoading,
    error: exportsError
  } = useQuery({
    queryKey: ['data-exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_exports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Query imports
  const {
    data: imports,
    isLoading: importsLoading,
    error: importsError
  } = useQuery({
    queryKey: ['data-imports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_imports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create export
  const createExport = useMutation({
    mutationFn: async (options: ExportOptions) => {
      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          format: options.format,
          filters: options.filters || {},
          version: options.version || '1.0.0',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger export processing
      await fetch(`${supabase.supabaseUrl}/functions/v1/process-export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ export_id: data.id })
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] });
    }
  });

  // Create import
  const createImport = useMutation({
    mutationFn: async ({ file, options }: ImportOptions) => {
      // Create import record
      const { data: importRecord, error: importError } = await supabase
        .from('data_imports')
        .insert({
          format: options.format,
          status: 'pending',
          metadata: { options }
        })
        .select()
        .single();

      if (importError) throw importError;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(`${importRecord.id}/${file.name}`, file);

      if (uploadError) throw uploadError;

      // Trigger import processing
      await fetch(`${supabase.supabaseUrl}/functions/v1/process-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ import_id: importRecord.id })
      });

      return importRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-imports'] });
    }
  });

  // Get export status
  const getExportStatus = async (exportId: string) => {
    const { data, error } = await supabase
      .from('data_exports')
      .select('*')
      .eq('id', exportId)
      .single();

    if (error) throw error;
    return data;
  };

  // Get import status
  const getImportStatus = async (importId: string) => {
    const { data, error } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (error) throw error;
    return data;
  };

  return {
    exports,
    imports,
    isLoading: exportsLoading || importsLoading,
    error: exportsError || importsError,
    createExport,
    createImport,
    getExportStatus,
    getImportStatus
  };
}
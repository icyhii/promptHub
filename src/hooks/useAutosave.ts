import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface UseAutosaveProps {
  onSave: () => Promise<any>;
  content: Record<string, any>;
  delay?: number;
}

export function useAutosave({ onSave, content, delay = 1000 }: UseAutosaveProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [debouncedContent] = useDebounce(content, delay);

  useEffect(() => {
    setSaveStatus('unsaved');
  }, [content]);

  useEffect(() => {
    const saveData = async () => {
      try {
        setSaveStatus('saving');
        await onSave();
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        console.error('Autosave failed:', error);
      }
    };

    if (JSON.stringify(debouncedContent) !== JSON.stringify(content)) {
      saveData();
    }
  }, [debouncedContent, content, onSave]);

  return { saveStatus };
}
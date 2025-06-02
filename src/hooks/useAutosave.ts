import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface UseAutosaveProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
}

export function useAutosave<T>({ data, onSave, delay = 1000 }: UseAutosaveProps<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [debouncedData] = useDebounce(data, delay);

  useEffect(() => {
    setSaveStatus('unsaved');
  }, [data]);

  useEffect(() => {
    const saveData = async () => {
      try {
        setSaveStatus('saving');
        await onSave(debouncedData);
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        console.error('Autosave failed:', error);
      }
    };

    if (debouncedData !== data) {
      saveData();
    }
  }, [debouncedData, data, onSave]);

  return { saveStatus };
}
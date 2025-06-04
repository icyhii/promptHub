import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import toast from 'react-hot-toast';

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  savedAt: string;
}

export function usePromptActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [savedPrompts, setSavedPrompts] = useLocalStorage<SavedPrompt[]>('saved_prompts', []);
  const [lastSavedContent, setLastSavedContent] = useState<string | null>(null);

  const savePrompt = async (title: string, content: string) => {
    try {
      setIsLoading(true);

      // Prevent duplicate saves
      if (content === lastSavedContent) {
        toast.error('This content has already been saved');
        return;
      }

      const newPrompt: SavedPrompt = {
        id: crypto.randomUUID(),
        title,
        content,
        savedAt: new Date().toISOString(),
      };

      setSavedPrompts([...savedPrompts, newPrompt]);
      setLastSavedContent(content);
      toast.success('Prompt saved successfully');
    } catch (error) {
      toast.error('Failed to save prompt');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const duplicatePrompt = async (title: string, content: string) => {
    try {
      setIsLoading(true);
      const newPrompt: SavedPrompt = {
        id: crypto.randomUUID(),
        title: `${title} (Copy)`,
        content,
        savedAt: new Date().toISOString(),
      };

      setSavedPrompts([...savedPrompts, newPrompt]);
      toast.success('Prompt duplicated successfully');
      return newPrompt;
    } catch (error) {
      toast.error('Failed to duplicate prompt');
      console.error('Duplicate error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sharePrompt = async (promptId: string, options: {
    method: 'link' | 'email' | 'social';
    permissions?: 'public' | 'private' | 'restricted';
  }) => {
    try {
      setIsLoading(true);
      const prompt = savedPrompts.find(p => p.id === promptId);
      if (!prompt) throw new Error('Prompt not found');

      const shareUrl = `${window.location.origin}/prompts/${promptId}`;

      switch (options.method) {
        case 'link':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard');
          break;

        case 'email':
          const emailUrl = `mailto:?subject=${encodeURIComponent(prompt.title)}&body=${encodeURIComponent(shareUrl)}`;
          window.open(emailUrl);
          break;

        case 'social':
          // Example for Twitter
          const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this prompt: ${prompt.title}`)}&url=${encodeURIComponent(shareUrl)}`;
          window.open(tweetUrl, '_blank');
          break;
      }

      return shareUrl;
    } catch (error) {
      toast.error('Failed to share prompt');
      console.error('Share error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    savedPrompts,
    isLoading,
    savePrompt,
    duplicatePrompt,
    sharePrompt,
  };
}
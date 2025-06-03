import { useState } from 'react';
import Button from '../common/Button';
import { GitFork } from 'lucide-react';
import { usePrompts } from '../../hooks/usePrompts';
import toast from 'react-hot-toast';

interface ForkPromptButtonProps {
  promptId: string;
  onSuccess?: () => void;
}

export default function ForkPromptButton({ promptId, onSuccess }: ForkPromptButtonProps) {
  const [isForking, setIsForking] = useState(false);
  const { forkPrompt } = usePrompts();

  const handleFork = async () => {
    try {
      setIsForking(true);
      await forkPrompt.mutateAsync({
        promptId,
        title: undefined // Let the backend generate the title
      });
      toast.success('Prompt forked successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to fork prompt');
      console.error('Fork error:', error);
    } finally {
      setIsForking(false);
    }
  };

  return (
    <Button
      onClick={handleFork}
      disabled={isForking}
      leftIcon={<GitFork size={16} />}
    >
      {isForking ? 'Forking...' : 'Fork Prompt'}
    </Button>
  );
}
import { useState } from 'react';
import Button from '../common/Button';
import { Save, Copy, Share, Link, Mail, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

interface PromptEditorActionsProps {
  promptId?: string;
  title: string;
  content: string;
  className?: string;
  onSavePrompt: () => Promise<string>;
  onDuplicatePrompt: () => Promise<void>;
  isLoading?: boolean;
}

export default function PromptEditorActions({
  promptId,
  title,
  content,
  className,
  onSavePrompt,
  onDuplicatePrompt,
  isLoading = false
}: PromptEditorActionsProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSavePrompt();
      toast.success('Prompt saved successfully');
    } catch (error) {
      toast.error('Failed to save prompt');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      await onDuplicatePrompt();
      toast.success('Prompt duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate prompt');
      console.error('Duplicate error:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleShare = async (method: 'link' | 'email' | 'social') => {
    try {
      setIsSharing(true);

      // If no promptId exists, save first
      let shareableId = promptId;
      if (!shareableId) {
        shareableId = await onSavePrompt();
      }

      const shareUrl = `${window.location.origin}/prompts/${shareableId}`;

      switch (method) {
        case 'link':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard');
          break;

        case 'email':
          const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`;
          window.open(emailUrl);
          break;

        case 'social':
          const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this prompt: ${title}`)}&url=${encodeURIComponent(shareUrl)}`;
          window.open(tweetUrl, '_blank');
          break;
      }

      setShowShareOptions(false);
    } catch (error) {
      toast.error('Failed to share prompt');
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleSave}
          isLoading={isLoading || isSaving}
          leftIcon={<Save size={16} />}
          variant="primary"
        >
          Save
        </Button>

        <Button
          onClick={handleDuplicate}
          isLoading={isLoading || isDuplicating}
          leftIcon={<Copy size={16} />}
          variant="outline"
        >
          Duplicate
        </Button>

        <div className="relative">
          <Button
            onClick={() => setShowShareOptions(!showShareOptions)}
            isLoading={isLoading || isSharing}
            leftIcon={<Share size={16} />}
            variant="outline"
          >
            Share
          </Button>

          {showShareOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleShare('link')}
                  role="menuitem"
                >
                  <Link size={16} className="mr-2" />
                  Copy Link
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleShare('email')}
                  role="menuitem"
                >
                  <Mail size={16} className="mr-2" />
                  Email
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleShare('social')}
                  role="menuitem"
                >
                  <Twitter size={16} className="mr-2" />
                  Twitter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
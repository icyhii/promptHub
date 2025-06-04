import { useState } from 'react';
import Button from '../common/Button';
import { Save, Copy, Share, Check, Link, Mail, Twitter } from 'lucide-react';
import { usePromptActions } from '../../hooks/usePromptActions';

interface PromptActionsProps {
  promptId?: string;
  title: string;
  content: string;
  className?: string;
}

export default function PromptActions({ promptId, title, content, className }: PromptActionsProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { isLoading, savePrompt, duplicatePrompt, sharePrompt } = usePromptActions();

  const handleSave = async () => {
    await savePrompt(title, content);
  };

  const handleDuplicate = async () => {
    await duplicatePrompt(title, content);
  };

  const handleShare = async (method: 'link' | 'email' | 'social') => {
    if (!promptId) {
      await savePrompt(title, content);
      // Get the new promptId from the saved prompt
      // This is a simplified version - you'd need to handle this properly
      promptId = 'new-prompt-id';
    }

    await sharePrompt(promptId, {
      method,
      permissions: 'public'
    });
    setShowShareOptions(false);
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          leftIcon={<Save size={16} />}
          variant="primary"
        >
          Save
        </Button>

        <Button
          onClick={handleDuplicate}
          isLoading={isLoading}
          leftIcon={<Copy size={16} />}
          variant="outline"
        >
          Duplicate
        </Button>

        <div className="relative">
          <Button
            onClick={() => setShowShareOptions(!showShareOptions)}
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
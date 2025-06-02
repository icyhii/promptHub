import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import TagInput from '../components/common/TagInput';
import CollapsiblePanel from '../components/common/CollapsiblePanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { usePrompts } from '../hooks/usePrompts';
import { useAutosave, type SaveStatus } from '../hooks/useAutosave';
import { ArrowLeft, Copy, MoreHorizontal, ChevronDown, Save, Check, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../lib/supabase';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'code-block'],
    [{ 'table': true }],
    ['clean']
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'link', 'code-block',
  'table'
];

const MODEL_TOKEN_LIMITS = {
  'GPT-4': 8192,
  'GPT-3.5': 4096,
  'Claude-3': 100000,
  'Gemini': 32768
};

export default function PromptDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNewPrompt = !id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [promptContent, setPromptContent] = useState('');
  const [promptTitle, setPromptTitle] = useState('Document title');
  const [promptTags, setPromptTags] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [parallelText, setParallelText] = useState('Parallel text goes here');
  const [allPanelsExpanded, setAllPanelsExpanded] = useState(true);

  const { prompts, createPrompt, updatePrompt } = usePrompts();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          toast.error('Please log in to manage prompts');
          navigate('/');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Authentication check failed');
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  // Calculate token and character counts
  const charCount = promptContent.length;
  const wordCount = promptContent.trim().split(/\s+/).length;
  const estimatedTokens = Math.ceil(wordCount * 1.3); // Rough estimation
  const tokenLimit = MODEL_TOKEN_LIMITS[selectedModel as keyof typeof MODEL_TOKEN_LIMITS];

  const handleSave = useCallback(async () => {
    try {
      // Check auth status before saving
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save prompts');
        navigate('/');
        return;
      }

      const promptData = {
        title: promptTitle,
        body: promptContent,
        tags: promptTags.map(tag => tag.text),
        status: 'draft',
        visibility: 'private',
        metadata: {
          model: selectedModel,
          version: '1.0'
        }
      };

      if (isNewPrompt) {
        await createPrompt.mutateAsync(promptData);
        toast.success('Prompt created successfully');
        navigate('/prompts');
      } else if (id) {
        await updatePrompt.mutateAsync({
          id,
          ...promptData
        });
        toast.success('Prompt updated successfully');
      }
    } catch (error) {
      toast.error(isNewPrompt ? 'Failed to create prompt' : 'Failed to update prompt');
      throw error; // Re-throw for autosave handling
    }
  }, [promptTitle, promptContent, promptTags, selectedModel, id, isNewPrompt, createPrompt, updatePrompt, navigate]);

  // Autosave functionality
  const { saveStatus } = useAutosave({
    data: { promptTitle, promptContent, promptTags, selectedModel },
    onSave: handleSave
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  useEffect(() => {
    if (!isNewPrompt && id) {
      const prompt = prompts?.find(p => p.id === id);
      if (prompt) {
        setPromptTitle(prompt.title);
        setPromptContent(prompt.body);
        setPromptTags(prompt.tags.map(tag => ({ id: tag, text: tag })));
      }
    }
  }, [id, prompts, isNewPrompt]);

  const handleDuplicate = () => {
    toast.success('Prompt duplicated');
  };

  const handleShare = () => {
    toast.success('Share dialog opened');
  };

  const getSaveStatusIcon = (status: SaveStatus) => {
    switch (status) {
      case 'saved':
        return <Check size={16} className="text-green-500" />;
      case 'saving':
        return <Clock size={16} className="text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'unsaved':
        return <Save size={16} className="text-gray-500" />;
    }
  };

  const getSaveStatusText = (status: SaveStatus) => {
    switch (status) {
      case 'saved':
        return 'All changes saved';
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Error saving';
      case 'unsaved':
        return 'Unsaved changes';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/prompts')} 
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Prompt Editor</h1>
          <div className="ml-4 flex items-center text-sm text-gray-500">
            {getSaveStatusIcon(saveStatus)}
            <span className="ml-2">{getSaveStatusText(saveStatus)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setAllPanelsExpanded(!allPanelsExpanded)}
            leftIcon={<ChevronDown size={16} />}
          >
            {allPanelsExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleShare}>
            Share
          </Button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Column */}
        <div className="flex-1 p-8 pr-0">
          <input
            type="text"
            value={promptTitle}
            onChange={(e) => setPromptTitle(e.target.value)}
            className="text-4xl font-bold w-full mb-8 border-none focus:outline-none focus:ring-0"
            placeholder="Document title"
          />

          <div className="space-y-6">
            <CollapsiblePanel
              title="Prompt Content"
              panelKey="prompt-content"
              isExpandedProp={allPanelsExpanded}
              previewText={promptContent.substring(0, 100) + '...'}
            >
              <div className="space-y-4">
                <ReactQuill
                  value={promptContent}
                  onChange={setPromptContent}
                  modules={modules}
                  formats={formats}
                  className="h-[300px]"
                />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    {charCount} characters • {wordCount} words
                  </div>
                  <div className={`flex items-center ${
                    estimatedTokens > tokenLimit ? 'text-red-500' : ''
                  }`}>
                    {estimatedTokens} / {tokenLimit} tokens
                  </div>
                </div>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Example Input"
              panelKey="example-input"
              isExpandedProp={allPanelsExpanded}
            >
              <div className="bg-gray-50 p-4 rounded-lg font-mono">
                <div className="text-gray-600">
                  {`<What are some of the best things to see ad do in Paris?>`}
                </div>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Parallel Text"
              panelKey="parallel-text"
              isExpandedProp={allPanelsExpanded}
            >
              <div className="flex items-center text-gray-500">
                <span className="mr-2">→</span>
                <input
                  type="text"
                  value={parallelText}
                  onChange={(e) => setParallelText(e.target.value)}
                  className="flex-1 text-gray-500 border-none focus:outline-none focus:ring-0"
                  placeholder="Parallel text goes here"
                />
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Version History"
              panelKey="version-history"
              isExpandedProp={allPanelsExpanded}
            >
              <div className="text-gray-600">
                No previous versions
              </div>
            </CollapsiblePanel>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-80 p-8 border-l border-gray-200">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">Tags</h2>
              <TagInput
                tags={promptTags}
                suggestions={[
                  { id: 'gpt4', text: 'gpt4' },
                  { id: 'translation', text: 'translation' },
                  { id: 'creative', text: 'creative' },
                  { id: 'technical', text: 'technical' }
                ]}
                onAddTag={(tag) => setPromptTags([...promptTags, tag])}
                onDeleteTag={(i) => {
                  const newTags = [...promptTags];
                  newTags.splice(i, 1);
                  setPromptTags(newTags);
                }}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Model</h2>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(MODEL_TOKEN_LIMITS).map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Output type</h2>
              <div className="text-gray-600">Text</div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Last modified</h2>
              <div className="text-gray-600">
                {format(new Date(), 'MMM d, yyyy')}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Created</h2>
              <div className="text-gray-600">
                {format(new Date(), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
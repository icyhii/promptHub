import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import TagInput from '../components/common/TagInput';
import CollapsiblePanel from '../components/common/CollapsiblePanel';
import VersionHistory from '../components/version/VersionHistory';
import PromptEditorActions from '../components/prompts/PromptEditorActions';
import { usePrompts } from '../hooks/usePrompts';
import { useVersionControl } from '../hooks/useVersionControl';
import { useAutosave, type SaveStatus } from '../hooks/useAutosave';
import { ArrowLeft, MoreHorizontal, ChevronDown, Save, Check, AlertCircle, Clock, GitBranch } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  
  const [promptContent, setPromptContent] = useState('');
  const [promptTitle, setPromptTitle] = useState('Document title');
  const [promptTags, setPromptTags] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [parallelText, setParallelText] = useState('Parallel text goes here');
  const [allPanelsExpanded, setAllPanelsExpanded] = useState(true);
  const [changeDescription, setChangeDescription] = useState('');
  const [activeBranch, setActiveBranch] = useState<string | null>(null);

  const { prompts, createPrompt, updatePrompt, forkPrompt } = usePrompts();
  const { createVersion, versions, branches } = useVersionControl(id);

  // Define handleSave before using it in useAutosave
  const handleSave = useCallback(async () => {
    try {
      if (!changeDescription) {
        toast.error('Please provide a description of your changes');
        return;
      }

      let promptId = id;
      
      // If it's a new prompt or we're creating a new version
      if (!promptId) {
        const newPrompt = await createPrompt.mutateAsync({
          title: promptTitle,
          body: promptContent,
          tags: promptTags.map(tag => tag.text),
          metadata: {
            model: selectedModel,
            parallelText,
          },
          status: 'draft',
          visibility: 'private'
        });
        promptId = newPrompt.id;
        navigate(`/prompts/${promptId}`);
      } else {
        await updatePrompt.mutateAsync({
          id: promptId,
          title: promptTitle,
          body: promptContent,
          tags: promptTags.map(tag => tag.text),
          metadata: {
            model: selectedModel,
            parallelText,
          }
        });
      }

      // Create a new version
      await createVersion.mutateAsync({
        content: {
          title: promptTitle,
          body: promptContent,
          tags: promptTags.map(tag => tag.text),
          model: selectedModel,
          parallelText
        },
        changeLog: changeDescription,
        branchId: activeBranch
      });

      return promptId;
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  }, [id, promptTitle, promptContent, promptTags, selectedModel, parallelText, changeDescription, activeBranch, createPrompt, updatePrompt, createVersion, navigate]);

  // Initialize autosave with the save handler
  const { saveStatus } = useAutosave({
    onSave: handleSave,
    content: {
      title: promptTitle,
      content: promptContent,
      tags: promptTags,
      model: selectedModel,
      parallelText
    }
  });

  // Calculate token and character counts
  const charCount = promptContent.length;
  const wordCount = promptContent.trim().split(/\s+/).length;
  const estimatedTokens = Math.ceil(wordCount * 1.3);
  const tokenLimit = MODEL_TOKEN_LIMITS[selectedModel as keyof typeof MODEL_TOKEN_LIMITS];

  const handleDuplicate = async () => {
    if (!id) {
      toast.error('Please save the prompt first');
      return;
    }

    await forkPrompt.mutateAsync({
      promptId: id,
      title: `${promptTitle} (Copy)`
    });
  };

  useEffect(() => {
    if (!isNewPrompt && id) {
      const prompt = prompts?.find(p => p.id === id);
      if (prompt) {
        setPromptTitle(prompt.title);
        setPromptContent(prompt.body);
        setPromptTags(prompt.tags.map(tag => ({ id: tag, text: tag })));
        setSelectedModel(prompt.metadata?.model || 'GPT-4');
        setParallelText(prompt.metadata?.parallelText || '');
      }
    }
  }, [id, prompts, isNewPrompt]);

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
          {activeBranch && (
            <div className="flex items-center text-sm text-gray-600 mr-4">
              <GitBranch size={16} className="mr-1" />
              <span>
                {branches?.find(b => b.id === activeBranch)?.name || 'Unknown Branch'}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setAllPanelsExpanded(!allPanelsExpanded)}
            leftIcon={<ChevronDown size={16} />}
          >
            {allPanelsExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <PromptEditorActions
            promptId={id}
            title={promptTitle}
            content={promptContent}
            onSavePrompt={handleSave}
            onDuplicatePrompt={handleDuplicate}
            isLoading={createPrompt.isLoading || updatePrompt.isLoading || forkPrompt.isLoading}
          />
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
              title="Change Description"
              panelKey="change-description"
              isExpandedProp={allPanelsExpanded}
            >
              <textarea
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Describe your changes..."
                className="w-full h-24 p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
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
              {versions && versions.length > 0 ? (
                <VersionHistory
                  promptId={id!}
                  onRestore={(version) => {
                    setPromptContent(version.content.body);
                    setPromptTitle(version.content.title);
                    setPromptTags(version.content.tags.map((tag: string) => ({ id: tag, text: tag })));
                    setSelectedModel(version.content.model);
                    setParallelText(version.content.parallelText);
                    toast.success('Version restored');
                  }}
                />
              ) : (
                <div className="text-gray-600">
                  No previous versions
                </div>
              )}
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
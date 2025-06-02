import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import TagBadge from '../components/common/TagBadge';
import CollapsiblePanel from '../components/common/CollapsiblePanel';
import { usePrompts } from '../hooks/usePrompts';
import { ArrowLeft, Copy, MoreHorizontal, ChevronDown } from 'lucide-react';
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

export default function PromptDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNewPrompt = !id;
  
  const [promptContent, setPromptContent] = useState('');
  const [promptTitle, setPromptTitle] = useState('Document title');
  const [promptTags, setPromptTags] = useState<string[]>(['translation', 'example']);
  const [selectedModel] = useState('GPT-4');
  const [parallelText, setParallelText] = useState('Parallel text goes here');
  const [allPanelsExpanded, setAllPanelsExpanded] = useState(true);

  const { prompts, createPrompt, updatePrompt } = usePrompts();

  useEffect(() => {
    if (!isNewPrompt && id) {
      const prompt = prompts?.find(p => p.id === id);
      if (prompt) {
        setPromptTitle(prompt.title);
        setPromptContent(prompt.body);
        setPromptTags(prompt.tags);
      }
    }
  }, [id, prompts, isNewPrompt]);

  const handleSave = async () => {
    try {
      if (isNewPrompt) {
        await createPrompt.mutateAsync({
          title: promptTitle,
          body: promptContent,
          tags: promptTags,
          status: 'draft',
          visibility: 'private',
          metadata: {
            model: selectedModel,
            version: '1.0'
          }
        });
        toast.success('Prompt created successfully');
        navigate('/prompts');
      } else if (id) {
        await updatePrompt.mutateAsync({
          id,
          title: promptTitle,
          body: promptContent,
          tags: promptTags,
          metadata: {
            model: selectedModel
          }
        });
        toast.success('Prompt updated successfully');
      }
    } catch (error) {
      toast.error(isNewPrompt ? 'Failed to create prompt' : 'Failed to update prompt');
    }
  };

  const handleDuplicate = () => {
    toast.success('Prompt duplicated');
  };

  const handleShare = () => {
    toast.success('Share dialog opened');
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
              <ReactQuill
                value={promptContent}
                onChange={setPromptContent}
                modules={modules}
                formats={formats}
                className="h-[300px] mb-12"
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
              <div className="flex flex-wrap gap-2">
                {promptTags.map(tag => (
                  <TagBadge key={tag} variant="gray">{tag}</TagBadge>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Model</h2>
              <div className="text-gray-600">{selectedModel}</div>
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
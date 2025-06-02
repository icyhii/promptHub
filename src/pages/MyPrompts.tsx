import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import TagBadge from '../components/common/TagBadge';
import EmptyState from '../components/common/EmptyState';
import { Plus, Filter, Download, UploadCloud, Tag, Search, Edit, Trash, Copy, Eye, FileText } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error loading prompts</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

function MyPromptsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const {
    prompts,
    isLoading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt
  } = usePrompts({
    status: selectedStatus || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    search: searchTerm || undefined
  });

  const availableTags = Array.from(
    new Set(prompts?.flatMap(prompt => prompt.tags) || [])
  ).sort();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePrompt.mutateAsync(id);
      toast.success('Prompt deleted successfully');
    } catch (error) {
      toast.error('Failed to delete prompt');
    }
  };

  const handleDuplicate = async (prompt: any) => {
    try {
      const { id, created_at, updated_at, ...promptData } = prompt;
      await createPrompt.mutateAsync({
        ...promptData,
        title: `${promptData.title} (Copy)`,
        status: 'draft'
      });
      toast.success('Prompt duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate prompt');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    throw error;
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-textPrimary">My Prompts</h1>
          <div className="flex space-x-3">
            <Button variant="outline" leftIcon={<UploadCloud size={16} />}>Import</Button>
            <Button variant="outline" leftIcon={<Download size={16} />}>Export</Button>
            <Button leftIcon={<Plus size={16} />}>New Prompt</Button>
          </div>
        </div>

        <EmptyState
          icon={<FileText size={32} />}
          title="Create Your First Prompt"
          description="Start building your prompt library by creating a new prompt or importing existing ones."
          primaryAction={{
            label: "Create New Prompt",
            onClick: () => {/* handle create */},
            icon: <Plus size={16} />
          }}
          secondaryAction={{
            label: "Import Prompts",
            onClick: () => {/* handle import */},
            icon: <UploadCloud size={16} />
          }}
          tips={[
            "Use templates to get started quickly",
            "Organize prompts with tags for easy access",
            "Share prompts with your team for collaboration"
          ]}
        />
      </div>
    );
  }

  const filteredPrompts = prompts?.filter(prompt => {
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => prompt.tags.includes(tag));
    
    const matchesModel = !selectedModel || prompt.metadata?.model === selectedModel;
    
    const matchesStatus = !selectedStatus || prompt.status === selectedStatus;
    
    return matchesSearch && matchesTags && matchesModel && matchesStatus;
  });

  if (filteredPrompts && filteredPrompts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-textPrimary">My Prompts</h1>
          <div className="flex space-x-3">
            <Button variant="outline" leftIcon={<UploadCloud size={16} />}>Import</Button>
            <Button variant="outline" leftIcon={<Download size={16} />}>Export</Button>
            <Button leftIcon={<Plus size={16} />}>New Prompt</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter size={16} className="mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-textSecondary mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutralGray-medium" />
                    <input
                      id="search"
                      type="text"
                      placeholder="Search prompts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-md bg-white border border-neutralGray text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <TagBadge 
                        key={tag}
                        size="md"
                        variant={selectedTags.includes(tag) ? 'blue' : 'gray'} 
                        onClick={() => toggleTag(tag)} 
                        className="cursor-pointer"
                      >
                        {tag}
                      </TagBadge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Model
                  </label>
                  <select
                    value={selectedModel || ''}
                    onChange={(e) => setSelectedModel(e.target.value || null)}
                    className="block w-full appearance-none bg-white border border-neutralGray text-textPrimary rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                  >
                    <option value="">All Models</option>
                    <option value="GPT-4">GPT-4</option>
                    <option value="Claude-3">Claude-3</option>
                    <option value="Gemini">Gemini</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus || ''}
                    onChange={(e) => setSelectedStatus(e.target.value || null)}
                    className="block w-full appearance-none bg-white border border-neutralGray text-textPrimary rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTags([]);
                    setSelectedModel(null);
                    setSelectedStatus(null);
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <EmptyState
              icon={<Search size={32} />}
              title="No Matching Prompts"
              description="Try adjusting your search terms or filters to find what you're looking for."
              primaryAction={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchTerm('');
                  setSelectedTags([]);
                  setSelectedModel(null);
                  setSelectedStatus(null);
                },
                icon: <Filter size={16} />
              }}
              tips={[
                "Check for typos in your search",
                "Try using fewer filters",
                "Search by prompt title or content"
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-textPrimary">My Prompts</h1>
        <div className="flex space-x-3">
          <Button variant="outline" leftIcon={<UploadCloud size={16} />}>Import</Button>
          <Button variant="outline" leftIcon={<Download size={16} />}>Export</Button>
          <Button leftIcon={<Plus size={16} />}>New Prompt</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter size={16} className="mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-textSecondary mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutralGray-medium" />
                  <input
                    id="search"
                    type="text"
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-white border border-neutralGray text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <TagBadge 
                      key={tag}
                      size="md"
                      variant={selectedTags.includes(tag) ? 'blue' : 'gray'} 
                      onClick={() => toggleTag(tag)} 
                      className="cursor-pointer"
                    >
                      {tag}
                    </TagBadge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Model
                </label>
                <select
                  value={selectedModel || ''}
                  onChange={(e) => setSelectedModel(e.target.value || null)}
                  className="block w-full appearance-none bg-white border border-neutralGray text-textPrimary rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                >
                  <option value="">All Models</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="Claude-3">Claude-3</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value || null)}
                  className="block w-full appearance-none bg-white border border-neutralGray text-textPrimary rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTags([]);
                  setSelectedModel(null);
                  setSelectedStatus(null);
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutralGray-light">
                    <th className="text-left py-3 px-6 text-xs font-medium text-textSecondary uppercase tracking-wider">Title</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-textSecondary uppercase tracking-wider">Model</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-textSecondary uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-textSecondary uppercase tracking-wider">Version</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-textSecondary uppercase tracking-wider">Modified</th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrompts && filteredPrompts.length > 0 ? (
                    filteredPrompts.map((prompt) => (
                      <tr key={prompt.id} className="hover:bg-neutralGray-light/40 border-b border-neutralGray-light last:border-0">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-textPrimary">
                              {prompt.title}
                            </div>
                            <div className="flex mt-1 space-x-1">
                              {prompt.tags.map((tag) => (
                                <TagBadge key={tag} variant="gray" size="sm">
                                  {tag}
                                </TagBadge>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-textSecondary">
                          {prompt.metadata?.model || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <TagBadge 
                            size="sm"
                            variant={
                              prompt.status === 'active' 
                                ? 'green' 
                                : prompt.status === 'draft' 
                                  ? 'blue' 
                                  : 'gray'
                            }
                          >
                            {prompt.status}
                          </TagBadge>
                        </td>
                        <td className="py-4 px-6 text-sm text-textSecondary">
                          v{prompt.metadata?.version || '1.0'}
                        </td>
                        <td className="py-4 px-6 text-sm text-textSecondary">
                          {formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="p-1 text-neutralGray-dark hover:text-accentBlue" 
                              title="View"
                              onClick={() => window.location.href = `/prompts/${prompt.id}`}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="p-1 text-neutralGray-dark hover:text-accentBlue" 
                              title="Edit"
                              onClick={() => window.location.href = `/prompts/${prompt.id}/edit`}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="p-1 text-neutralGray-dark hover:text-accentBlue" 
                              title="Duplicate"
                              onClick={() => handleDuplicate(prompt)}
                            >
                              <Copy size={16} />
                            </button>
                            <button 
                              className="p-1 text-accentRed hover:text-accentRed/80" 
                              title="Delete"
                              onClick={() => handleDelete(prompt.id)}
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-textSecondary">
                        <div className="flex flex-col items-center justify-center">
                          <Search size={24} className="mb-2 text-neutralGray-medium" />
                          <p>No prompts found matching your filters</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedTags([]);
                              setSelectedModel(null);
                              setSelectedStatus(null);
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MyPrompts() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <MyPromptsContent />
    </ErrorBoundary>
  );
}
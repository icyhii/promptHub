import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import TagBadge from '../components/common/TagBadge';
import { Plus, Filter, Download, UploadCloud, Tag, Search, Edit, Trash, Copy, Eye } from 'lucide-react';

export default function MyPrompts() {
  // Mock prompts data
  const [prompts, setPrompts] = useState([
    { 
      id: 1, 
      title: 'Customer Support Assistant', 
      tags: ['support', 'gpt-4'], 
      status: 'active',
      model: 'GPT-4',
      lastModified: '2 hours ago',
      version: '2.3',
      usage: 127
    },
    { 
      id: 2, 
      title: 'Creative Writing Prompt', 
      tags: ['creative', 'claude-3'], 
      status: 'active',
      model: 'Claude-3',
      lastModified: '1 day ago',
      version: '1.5',
      usage: 85
    },
    { 
      id: 3, 
      title: 'Data Analysis Helper', 
      tags: ['analysis', 'gemini'], 
      status: 'draft',
      model: 'Gemini',
      lastModified: '3 days ago',
      version: '0.9',
      usage: 204
    },
    { 
      id: 4, 
      title: 'Product Description Generator', 
      tags: ['marketing', 'gpt-4'], 
      status: 'active',
      model: 'GPT-4',
      lastModified: '1 week ago',
      version: '3.1',
      usage: 432
    },
    { 
      id: 5, 
      title: 'Email Response Template', 
      tags: ['communication', 'claude-3'], 
      status: 'deprecated',
      model: 'Claude-3',
      lastModified: '2 weeks ago',
      version: '1.0',
      usage: 956
    },
    { 
      id: 6, 
      title: 'Code Explainer', 
      tags: ['development', 'gpt-4'], 
      status: 'active',
      model: 'GPT-4',
      lastModified: '3 weeks ago',
      version: '2.0',
      usage: 782
    },
  ]);

  // Mock tags for filtering
  const availableTags = [
    'support', 'creative', 'analysis', 'marketing', 
    'communication', 'development', 'gpt-4', 'claude-3', 'gemini'
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Filter prompts based on search and filters
  const filteredPrompts = prompts.filter(prompt => {
    // Search term filter
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => prompt.tags.includes(tag));
    
    // Model filter
    const matchesModel = !selectedModel || prompt.model === selectedModel;
    
    // Status filter
    const matchesStatus = !selectedStatus || prompt.status === selectedStatus;
    
    return matchesSearch && matchesTags && matchesModel && matchesStatus;
  });

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter size={16} className="mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
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

              {/* Tags */}
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

              {/* Model */}
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

              {/* Status */}
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

              {/* Reset Filters */}
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

        {/* Prompts List */}
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
                  {filteredPrompts.length > 0 ? (
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
                          {prompt.model}
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
                          v{prompt.version}
                        </td>
                        <td className="py-4 px-6 text-sm text-textSecondary">
                          {prompt.lastModified}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button className="p-1 text-neutralGray-dark hover:text-accentBlue" title="View">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-neutralGray-dark hover:text-accentBlue" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-neutralGray-dark hover:text-accentBlue" title="Duplicate">
                              <Copy size={16} />
                            </button>
                            <button className="p-1 text-accentRed hover:text-accentRed/80" title="Delete">
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
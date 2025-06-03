import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import TagBadge from '../components/common/TagBadge';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, Star, Copy, MessageCircle, Tag, ThumbsUp, Download, Compass, Upload } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';
import { useAnalytics } from '../hooks/useAnalytics';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function CommunityLibrary() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { prompts, isLoading } = usePrompts({
    visibility: 'public',
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    model: selectedModel || undefined,
    sort: {
      field: selectedSort === 'popular' ? 'usage' : selectedSort === 'rating' ? 'rating' : 'created_at',
      direction: 'desc'
    },
    page,
    limit: pageSize
  });

  const { data: analytics } = useAnalytics(7);

  // Extract unique categories and models from prompts
  const categories = Array.from(new Set(prompts?.flatMap(p => p.metadata?.category || []) || []));
  const models = Array.from(new Set(prompts?.map(p => p.metadata?.model) || []));

  // Filter prompts based on search and filters
  const filteredPrompts = prompts?.filter(prompt => {
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || prompt.metadata?.category === selectedCategory;
    const matchesModel = !selectedModel || prompt.metadata?.model === selectedModel;
    
    return matchesSearch && matchesCategory && matchesModel;
  });

  const handleFork = async (promptId: string) => {
    try {
      // Call fork mutation from usePrompts hook
      await usePrompts().forkPrompt.mutateAsync({ promptId });
      toast.success('Prompt forked successfully');
    } catch (error) {
      toast.error('Failed to fork prompt');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!filteredPrompts?.length) {
    return (
      <EmptyState
        icon={<Compass size={32} />}
        title="No Prompts Found"
        description={
          searchTerm || selectedCategory || selectedModel
            ? "No prompts match your current search and filters. Try adjusting your criteria."
            : "Be the first to share a prompt with the community!"
        }
        primaryAction={{
          label: searchTerm || selectedCategory || selectedModel ? "Clear Filters" : "Share a Prompt",
          onClick: () => {
            if (searchTerm || selectedCategory || selectedModel) {
              setSearchTerm('');
              setSelectedCategory(null);
              setSelectedModel(null);
              setSelectedSort('popular');
            } else {
              navigate('/prompts/new');
            }
          },
          icon: searchTerm || selectedCategory || selectedModel ? <Filter size={16} /> : <Upload size={16} />
        }}
        tips={[
          "Browse different categories",
          "Try broader search terms",
          "Check out featured prompts"
        ]}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Library</h1>
        <Button 
          leftIcon={<Upload size={16} />}
          onClick={() => navigate('/prompts/new')}
        >
          Share Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
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
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search prompts..."
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-left text-sm ${
                        selectedCategory === category
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    >
                      <span>{category}</span>
                      <span className="text-xs text-gray-500">
                        {prompts?.filter(p => p.metadata?.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Models</h3>
                <div className="space-y-2">
                  {models.map(model => (
                    <button
                      key={model}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-left text-sm ${
                        selectedModel === model
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setSelectedModel(selectedModel === model ? null : model)}
                    >
                      <span>{model}</span>
                      <span className="text-xs text-gray-500">
                        {prompts?.filter(p => p.metadata?.model === model).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sort By</h3>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setSelectedModel(null);
                  setSelectedSort('popular');
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.topPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{prompt.title}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <ThumbsUp size={14} className="mr-1" />
                      <span>{prompt.engagement} interactions</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Prompts Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrompts.map(prompt => (
              <Card
                key={prompt.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/prompts/${prompt.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{prompt.title}</h3>
                    <div className="flex items-center text-yellow-500">
                      <Star size={16} className="fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {prompt.analytics?.[0]?.likes || 0}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {prompt.body}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {prompt.tags?.map(tag => (
                      <TagBadge key={tag} variant="gray" size="sm">{tag}</TagBadge>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      by <span className="font-medium text-gray-900 dark:text-white">
                        {prompt.creator?.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        <span>{prompt.analytics?.[0]?.comments || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Download size={14} className="mr-1" />
                        <span>{prompt.analytics?.[0]?.views || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Copy size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFork(prompt.id);
                      }}
                    >
                      Fork
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Download size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/prompts/${prompt.id}`);
                      }}
                    >
                      Use Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {filteredPrompts.length >= pageSize && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
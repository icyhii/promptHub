import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import TagBadge from '../components/common/TagBadge';
import { Search, Filter, Star, Copy, MessageCircle, Tag, ThumbsUp, Download } from 'lucide-react';

export default function CommunityLibrary() {
  // Mock data for community prompts
  const communityPrompts = [
    {
      id: 1,
      title: 'Ultimate Content Creator',
      description: 'Create engaging blog posts, social media content, and email newsletters with this versatile prompt.',
      author: 'Alex Chen',
      tags: ['content', 'marketing', 'gpt-4'],
      rating: 4.8,
      reviews: 126,
      downloads: 1250,
      model: 'GPT-4'
    },
    {
      id: 2,
      title: 'Structured Data Generator',
      description: 'Transform unstructured text into JSON, CSV, or other structured formats easily.',
      author: 'Taylor Kim',
      tags: ['data', 'conversion', 'claude-3'],
      rating: 4.6,
      reviews: 84,
      downloads: 870,
      model: 'Claude-3'
    },
    {
      id: 3,
      title: 'Code Explainer and Refactorer',
      description: 'Explain code snippets and get suggestions for improving code quality and performance.',
      author: 'Jordan Lee',
      tags: ['coding', 'development', 'gpt-4'],
      rating: 4.9,
      reviews: 203,
      downloads: 1840,
      model: 'GPT-4'
    },
    {
      id: 4,
      title: 'Customer Support Assistant',
      description: 'Generate helpful, empathetic responses to customer inquiries and complaints.',
      author: 'Casey Smith',
      tags: ['customer-service', 'support', 'gemini'],
      rating: 4.7,
      reviews: 56,
      downloads: 620,
      model: 'Gemini'
    },
    {
      id: 5,
      title: 'Research Paper Summarizer',
      description: 'Quickly extract key findings, methodologies, and conclusions from academic papers.',
      author: 'Riley Johnson',
      tags: ['academic', 'research', 'claude-3'],
      rating: 4.5,
      reviews: 37,
      downloads: 412,
      model: 'Claude-3'
    },
    {
      id: 6,
      title: 'Legal Document Analyzer',
      description: 'Extract important details and flagging areas of concern in contracts and legal documents.',
      author: 'Morgan Davis',
      tags: ['legal', 'analysis', 'gpt-4'],
      rating: 4.8,
      reviews: 42,
      downloads: 390,
      model: 'GPT-4'
    },
  ];

  // Mock categories
  const categories = [
    { id: 'content', name: 'Content Creation', count: 156 },
    { id: 'coding', name: 'Development', count: 93 },
    { id: 'data', name: 'Data Analysis', count: 78 },
    { id: 'support', name: 'Customer Service', count: 46 },
    { id: 'academic', name: 'Academic', count: 32 },
    { id: 'legal', name: 'Legal', count: 24 },
  ];

  // Mock models
  const models = [
    { id: 'gpt-4', name: 'GPT-4', count: 243 },
    { id: 'claude-3', name: 'Claude-3', count: 156 },
    { id: 'gemini', name: 'Gemini', count: 92 },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState('popular');

  // Filter prompts based on search and filters
  const filteredPrompts = communityPrompts.filter(prompt => {
    // Search term filter
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = !selectedCategory || prompt.tags.includes(selectedCategory);
    
    // Model filter
    const matchesModel = !selectedModel || prompt.model.toLowerCase() === selectedModel;
    
    return matchesSearch && matchesCategory && matchesModel;
  });

  // Sort prompts
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (selectedSort === 'popular') {
      return b.downloads - a.downloads;
    } else if (selectedSort === 'rating') {
      return b.rating - a.rating;
    } else if (selectedSort === 'recent') {
      // In a real app, we'd sort by date
      return b.id - a.id;
    }
    return 0;
  });

  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-textPrimary">Community Library</h1>
      </div>

      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutralGray-medium" />
        <input
          type="text"
          placeholder="Search prompts, categories, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2 rounded-md bg-white border border-neutralGray text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
        />
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
              {/* Categories */}
              <div>
                <h3 className="font-medium text-textPrimary mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-left text-sm ${
                        selectedCategory === category.id
                          ? 'bg-accentBlue/20 text-accentBlue'
                          : 'hover:bg-neutralGray-light/60 text-textSecondary'
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-textSecondary">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Models */}
              <div>
                <h3 className="font-medium text-textPrimary mb-2">Models</h3>
                <div className="space-y-2">
                  {models.map(model => (
                    <button
                      key={model.id}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-left text-sm ${
                        selectedModel === model.id
                          ? 'bg-accentBlue/20 text-accentBlue'
                          : 'hover:bg-neutralGray-light/60 text-textSecondary'
                      }`}
                      onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    >
                      <span>{model.name}</span>
                      <span className="text-xs text-textSecondary">{model.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <h3 className="font-medium text-textPrimary mb-2">Sort By</h3>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="block w-full appearance-none bg-white border border-neutralGray text-textPrimary rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>

              {/* Reset Filters */}
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
        </div>

        {/* Prompts Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {sortedPrompts.map(prompt => (
              <Card
                key={prompt.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPrompt(prompt.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-textPrimary">{prompt.title}</h3>
                    <div className="flex items-center text-accentBlue">
                      <Star size={16} className="fill-current" />
                      <span className="ml-1 text-sm font-medium">{prompt.rating}</span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-textSecondary line-clamp-2">
                    {prompt.description}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {prompt.tags.map(tag => (
                      <TagBadge key={tag} variant="gray">{tag}</TagBadge>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-textSecondary">
                      by <span className="font-medium text-textPrimary">{prompt.author}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-textSecondary">
                      <div className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        <span>{prompt.reviews}</span>
                      </div>
                      <div className="flex items-center">
                        <Download size={14} className="mr-1" />
                        <span>{prompt.downloads}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {sortedPrompts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-textPrimary">
              <Search size={40} className="mx-auto mb-4 text-neutralGray-medium" />
              <h3 className="text-lg font-medium text-textPrimary mb-1">No prompts found</h3>
              <p className="text-textSecondary mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setSelectedModel(null);
                  setSelectedSort('popular');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary">
                    {communityPrompts.find(p => p.id === selectedPrompt)?.title}
                  </h2>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-textSecondary mr-3">
                      by {communityPrompts.find(p => p.id === selectedPrompt)?.author}
                    </span>
                    <div className="flex items-center text-accentBlue">
                      <Star size={16} className="fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {communityPrompts.find(p => p.id === selectedPrompt)?.rating}
                      </span>
                      <span className="ml-1 text-sm text-textSecondary">
                        ({communityPrompts.find(p => p.id === selectedPrompt)?.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="text-neutralGray-medium hover:text-textPrimary"
                  onClick={() => setSelectedPrompt(null)}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-textPrimary">
                  {communityPrompts.find(p => p.id === selectedPrompt)?.description}
                </p>
              </div>
              
              <div className="mt-4 flex items-center">
                <Tag size={16} className="text-neutralGray-medium mr-2" />
                <div className="flex flex-wrap gap-1">
                  {communityPrompts.find(p => p.id === selectedPrompt)?.tags.map(tag => (
                    <TagBadge key={tag} variant="gray">{tag}</TagBadge>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-neutralGray-light/40 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-textPrimary">Prompt Content Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Copy size={14} />}
                  >
                    Copy
                  </Button>
                </div>
                <div className="bg-white border border-neutralGray-light rounded p-3 h-48 overflow-y-auto font-mono text-sm text-textPrimary">
                  {selectedPrompt === 1 && `You are a versatile content creator assistant.

Task: Help users create engaging, high-quality content for various platforms including blog posts, social media, and email newsletters.

Instructions:
1. Ask clarifying questions about the target audience, content purpose, and key message
2. Provide formatting appropriate to the chosen platform
3. Include attention-grabbing headlines/hooks
4. Structure content for readability (short paragraphs, bullets, headings)
5. Suggest relevant hashtags for social media posts

Style: Conversational, engaging, and adaptable to brand voice`}
                  
                  {selectedPrompt === 3 && `You are a code expert assistant specializing in explaining and refactoring code.

When explaining code:
1. Provide a high-level summary of what the code does
2. Break down complex functions into understandable components
3. Highlight potential issues or inefficiencies
4. Explain the purpose of important variables and functions
5. Identify the programming patterns being used

When refactoring:
1. Improve code readability
2. Enhance performance where possible
3. Follow language best practices
4. Maintain the original functionality
5. Add helpful comments

Always ask clarifying questions if the code's purpose is unclear.`}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutralGray-light/40 rounded-md">
                  <h3 className="font-medium text-textPrimary mb-3">Compatible With</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-accentBlue/20 flex items-center justify-center text-accentBlue mr-3">
                        🤖
                      </div>
                      <span className="text-textPrimary">
                        {communityPrompts.find(p => p.id === selectedPrompt)?.model}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-neutralGray-light/40 rounded-md">
                  <h3 className="font-medium text-textPrimary mb-3">Stats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-textSecondary">Downloads</span>
                      <span className="font-medium text-textPrimary">
                        {communityPrompts.find(p => p.id === selectedPrompt)?.downloads}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textSecondary">Added</span>
                      <span className="font-medium text-textPrimary">2 months ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textSecondary">Last updated</span>
                      <span className="font-medium text-textPrimary">2 weeks ago</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" leftIcon={<ThumbsUp size={16} />}>
                    Like
                  </Button>
                  <Button variant="outline" leftIcon={<MessageCircle size={16} />}>
                    Comment
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" leftIcon={<Copy size={16} />}>
                    Fork
                  </Button>
                  <Button leftIcon={<Download size={16} />}>
                    Save to My Prompts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
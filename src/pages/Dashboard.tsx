import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  Edit, 
  Star, 
  GitFork, 
  Clock, 
  TrendingUp, 
  Eye, 
  Play,
  ArrowRight,
  History,
  Users
} from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TagBadge from '../components/common/TagBadge';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error loading dashboard data</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

function DashboardContent() {
  const { prompts, isLoading } = usePrompts();
  const [activityFilter, setActivityFilter] = useState<string | null>(null);

  // Mock data for demonstration
  const lastPlaygroundSession = {
    prompt: {
      title: "Customer Support Assistant",
      timestamp: new Date(Date.now() - 3600000),
      status: "success",
      parameters: {
        temperature: 0.7,
        maxTokens: 500,
        model: "GPT-4"
      }
    }
  };

  const communityPrompts = [
    {
      id: 1,
      title: "Advanced Content Generator",
      author: "Sarah Chen",
      avatar: "SC",
      category: "Content",
      rating: 4.8,
      forks: 156,
      createdAt: new Date(Date.now() - 86400000)
    },
    // ... more community prompts
  ];

  const trendingPrompts = [
    {
      id: 1,
      title: "SEO Optimization Helper",
      engagement: 98,
      forks: 234,
      rating: 4.9
    },
    // ... more trending prompts
  ];

  const recentActivity = [
    {
      id: 1,
      type: "edit",
      promptId: "123",
      promptTitle: "Email Response Generator",
      timestamp: new Date(Date.now() - 1800000)
    },
    // ... more activity items
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const userPrompts = prompts?.filter(p => p.creator_id === 'current_user_id') || [];
  const recentPrompts = userPrompts
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Button leftIcon={<Edit size={16} />} onClick={() => window.location.href = '/prompts/new'}>
          New Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Prompts</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {userPrompts.length}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
                <Edit size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* More stat cards */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrompts.map(prompt => (
                <div key={prompt.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {prompt.title.length > 50 ? `${prompt.title.substring(0, 47)}...` : prompt.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {prompt.body.substring(0, 100)}...
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock size={14} className="mr-1" />
                      {formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Link to={`/prompts/${prompt.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Playground Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Working</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {lastPlaygroundSession.prompt.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  lastPlaygroundSession.prompt.status === 'success'
                    ? 'bg-success-100 text-success-800'
                    : 'bg-error-100 text-error-800'
                }`}>
                  {lastPlaygroundSession.prompt.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock size={14} className="mr-2" />
                  {formatDistanceToNow(lastPlaygroundSession.prompt.timestamp, { addSuffix: true })}
                </div>
                <div className="flex items-center">
                  <Play size={14} className="mr-2" />
                  Model: {lastPlaygroundSession.prompt.parameters.model}
                </div>
              </div>

              <Button className="w-full mt-4" leftIcon={<ArrowRight size={16} />}>
                Continue Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityPrompts.map(prompt => (
                <div key={prompt.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                      {prompt.avatar}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-white">{prompt.author}</p>
                      <TagBadge variant="blue" size="sm">{prompt.category}</TagBadge>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{prompt.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 fill-current mr-1" />
                      {prompt.rating}
                    </div>
                    <div className="flex items-center">
                      <GitFork size={14} className="mr-1" />
                      {prompt.forks}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDistanceToNow(prompt.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant={activityFilter === null ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter(null)}
                >
                  All
                </Button>
                <Button
                  variant={activityFilter === 'edit' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('edit')}
                >
                  Edits
                </Button>
                <Button
                  variant={activityFilter === 'run' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('run')}
                >
                  Executions
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity
                .filter(activity => !activityFilter || activity.type === activityFilter)
                .map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      {activity.type === 'edit' ? (
                        <Edit size={16} className="text-blue-500 mr-3" />
                      ) : (
                        <Play size={16} className="text-green-500 mr-3" />
                      )}
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {activity.type === 'edit' ? 'Edited' : 'Executed'}{' '}
                          <Link 
                            to={`/prompts/${activity.promptId}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {activity.promptTitle}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <DashboardContent />
    </ErrorBoundary>
  );
}
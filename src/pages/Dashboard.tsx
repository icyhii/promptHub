import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Users,
  Plus,
  ArrowUp,
  ArrowDown,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  DollarSign,
  Zap
} from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TagBadge from '../components/common/TagBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error loading dashboard data</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const { prompts, isLoading: isPromptsLoading } = usePrompts();
  const { data: analytics, isLoading: isAnalyticsLoading, refetch } = useAnalytics(7); // Last 7 days
  const { userTeams, isLoading: isTeamsLoading } = useTeam();
  const { user } = useAuth();
  const [activityFilter, setActivityFilter] = useState<string | null>(null);

  // Refetch analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isPromptsLoading || isAnalyticsLoading || isTeamsLoading) {
    return <LoadingSpinner />;
  }

  const userPrompts = prompts?.filter(p => p.creator_id === user?.id) || [];
  const recentPrompts = userPrompts
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const activeTeamMembers = userTeams?.reduce((total, team) => total + (team.team.members?.length || 0), 0) || 0;

  const getChangeIndicator = (current: number, previous: number) => {
    const percentChange = ((current - previous) / previous) * 100;
    const isIncrease = percentChange > 0;
    return {
      value: Math.abs(percentChange).toFixed(0),
      isIncrease,
      text: isIncrease ? 'increase' : 'decrease'
    };
  };

  // Calculate changes for metrics
  const currentPeriod = analytics?.historicalData.slice(-7) || [];
  const previousPeriod = analytics?.historicalData.slice(-14, -7) || [];
  
  const usageChange = getChangeIndicator(
    currentPeriod.reduce((sum, day) => sum + day.usage, 0),
    previousPeriod.reduce((sum, day) => sum + day.usage, 0)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Button 
          leftIcon={<Plus size={16} />} 
          onClick={() => navigate('/prompts/new')}
          className="bg-accentBlue hover:bg-accentBlue/90"
        >
          New Prompt
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usage</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {analytics?.totalUsage.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
                <BarChartIcon size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-sm flex items-center ${
                usageChange.isIncrease ? 'text-success-600' : 'text-error-600'
              }`}>
                {usageChange.isIncrease ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                <span>{usageChange.value}% {usageChange.text}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Usage</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {analytics?.tokensUsed.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-full text-accent-600 dark:text-accent-400">
                <Zap size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <ArrowDown size={16} className="mr-1" />
                <span>12% decrease</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Members</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {activeTeamMembers}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-full text-success-600 dark:text-success-400">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <ArrowUp size={16} className="mr-1" />
                <span>8% increase</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Cost</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  ${analytics?.estimatedCost.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-full text-warning-600 dark:text-warning-400">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <ArrowDown size={16} className="mr-1" />
                <span>5% decrease</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.historicalData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  formatter={(value: number) => [value.toLocaleString(), 'Usage']}
                />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorUsage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrompts.map(prompt => (
                <div 
                  key={prompt.id} 
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                >
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
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
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
                  Customer Support Assistant
                </h3>
                <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-800">
                  Success
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock size={14} className="mr-2" />
                  {formatDistanceToNow(new Date(Date.now() - 3600000), { addSuffix: true })}
                </div>
                <div className="flex items-center">
                  <Play size={14} className="mr-2" />
                  Model: GPT-4
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                leftIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/playground')}
              >
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
              {analytics?.topPrompts.map(prompt => (
                <div 
                  key={prompt.id} 
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                      {prompt.title[0]}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-white">Community</p>
                      <TagBadge variant="blue" size="sm">Featured</TagBadge>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{prompt.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 fill-current mr-1" />
                      {(prompt.engagement / 20).toFixed(1)}
                    </div>
                    <div className="flex items-center">
                      <GitFork size={14} className="mr-1" />
                      {prompt.usage}
                    </div>
                    <div className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {prompt.engagement}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-6"
              leftIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/community')}
            >
              Explore Community Library
            </Button>
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
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                  onClick={() => navigate('/prompts/1')}
                >
                  <div className="flex items-center">
                    {i % 2 === 0 ? (
                      <Edit size={16} className="text-blue-500 mr-3" />
                    ) : (
                      <Play size={16} className="text-green-500 mr-3" />
                    )}
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        {i % 2 === 0 ? 'Edited' : 'Executed'}{' '}
                        <Link 
                          to="/prompts/1"
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          Customer Support Assistant
                        </Link>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(Date.now() - i * 1800000), { addSuffix: true })}
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
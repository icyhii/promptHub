import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  Clock, 
  Zap, 
  RefreshCw,
  Users,
  ThumbsUp,
  Share2,
  MessageSquare
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error loading analytics data</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

const COLORS = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444'];

function AnalyticsContent() {
  const [dateRange, setDateRange] = useState('7d');
  const { data: analytics, isLoading, error, refetch } = useAnalytics(
    dateRange === '1d' ? 1 : 
    dateRange === '7d' ? 7 : 
    dateRange === '30d' ? 30 : 90
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    throw error;
  }

  if (!analytics) {
    return null;
  }

  const getChangeIndicator = (current: number, previous: number) => {
    const percentChange = ((current - previous) / previous) * 100;
    const isIncrease = percentChange > 0;
    return {
      value: Math.abs(percentChange).toFixed(0),
      isIncrease,
      text: isIncrease ? 'increase' : 'decrease'
    };
  };

  // Calculate changes
  const currentPeriod = analytics.historicalData.slice(-7);
  const previousPeriod = analytics.historicalData.slice(-14, -7);
  
  const usageChange = getChangeIndicator(
    currentPeriod.reduce((sum, day) => sum + day.usage, 0),
    previousPeriod.reduce((sum, day) => sum + day.usage, 0)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw size={16} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usage</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {analytics.totalUsage.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {analytics.engagement.uniqueUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-full text-accent-600 dark:text-accent-400">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <ArrowUp size={16} className="mr-1" />
                <span>15% increase</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Engagement Rate</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {((analytics.engagement.likes + analytics.engagement.shares + analytics.engagement.comments) / analytics.totalUsage * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-full text-success-600 dark:text-success-400">
                <ThumbsUp size={20} />
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Response Time</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {(analytics.avgResponseTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-full text-warning-600 dark:text-warning-400">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <ArrowDown size={16} className="mr-1" />
                <span>18% improvement</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.historicalData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis />
                  <Tooltip />
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

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity by Hour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">Prompt</th>
                  <th className="text-right py-3 px-4">Usage</th>
                  <th className="text-right py-3 px-4">Engagement</th>
                  <th className="text-right py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPrompts.map((prompt) => (
                  <tr key={prompt.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{prompt.title}</div>
                    </td>
                    <td className="text-right py-3 px-4">{prompt.usage}</td>
                    <td className="text-right py-3 px-4">{prompt.engagement}</td>
                    <td className="text-right py-3 px-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        High
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Analytics() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <AnalyticsContent />
    </ErrorBoundary>
  );
}
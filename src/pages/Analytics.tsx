import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { BarChart, LineChart, Calendar, ArrowUp, ArrowDown, DollarSign, Clock, Zap, RefreshCw } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../components/common/LoadingSpinner';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error loading analytics data</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

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

  const getChangeIndicator = (current: number, previous: number) => {
    const percentChange = ((current - previous) / previous) * 100;
    const isIncrease = percentChange > 0;
    return {
      value: Math.abs(percentChange).toFixed(0),
      isIncrease,
      text: isIncrease ? 'increase' : 'decrease'
    };
  };

  // Calculate changes based on historical data
  const currentPeriod = analytics?.historicalData.slice(-7);
  const previousPeriod = analytics?.historicalData.slice(-14, -7);
  
  const usageChange = getChangeIndicator(
    currentPeriod?.reduce((sum, day) => sum + day.usage, 0) || 0,
    previousPeriod?.reduce((sum, day) => sum + day.usage, 0) || 0
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
                  {analytics?.totalUsage.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
                <BarChart size={20} />
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tokens Used</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {(analytics?.tokensUsed / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-full text-accent-600 dark:text-accent-400">
                <Zap size={20} />
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Cost</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  ${analytics?.estimatedCost.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-full text-success-600 dark:text-success-400">
                <DollarSign size={20} />
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Response Time</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {(analytics?.avgResponseTime / 1000).toFixed(1)}s
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

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart size={16} className="mr-2" />
              Prompt Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between mt-6 px-2">
              {analytics?.historicalData.slice(-7).map((day, index) => (
                <div key={index} className="w-full max-w-[40px] flex flex-col items-center">
                  <div className="relative w-full h-full">
                    <div 
                      className="w-10 bg-primary-500 dark:bg-primary-600 rounded-t-md transition-all duration-500 ease-in-out hover:bg-primary-400"
                      style={{ 
                        height: `${(day.usage / Math.max(...analytics.historicalData.map(d => d.usage))) * 200}px` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart size={16} className="mr-2" />
              Token Usage Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-6 px-2 relative">
              <div className="absolute inset-0 flex items-center">
                <svg className="w-full h-[200px]" viewBox="0 0 700 200">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <line 
                      key={line}
                      x1="0" 
                      y1={50 * line} 
                      x2="700" 
                      y2={50 * line}
                      stroke="#e5e7eb" 
                      strokeWidth="1"
                      strokeDasharray={line > 0 ? "5,5" : "0"} 
                    />
                  ))}
                  
                  {analytics && (
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      points={analytics.historicalData.slice(-7).map((day, index) => {
                        const x = index * (700 / 6);
                        const maxTokens = Math.max(...analytics.historicalData.map(d => d.tokens));
                        const y = 200 - (day.tokens / maxTokens * 200);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  )}
                  
                  {analytics?.historicalData.slice(-7).map((day, index) => {
                    const x = index * (700 / 6);
                    const maxTokens = Math.max(...analytics.historicalData.map(d => d.tokens));
                    const y = 200 - (day.tokens / maxTokens * 200);
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                      />
                    );
                  })}
                </svg>
              </div>
              
              <div className="absolute bottom-0 inset-x-0 flex justify-between px-2">
                {analytics?.historicalData.slice(-7).map((day, index) => (
                  <span key={index} className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tokens</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Time</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.modelPerformance.map((model) => (
                <tr key={model.model} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">{model.model}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{model.usage}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    {(model.tokens / 1000).toFixed(1)}K
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    {(model.avgTime / 1000).toFixed(1)}s
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    ${model.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { BarChart, LineChart, Calendar, ArrowUp, ArrowDown, DollarSign, Clock, Zap, RefreshCw } from 'lucide-react';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7d');

  // Mock chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [320, 420, 380, 490, 550, 460, 520]
  };

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
          <Button variant="outline" leftIcon={<RefreshCw size={16} />}>
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
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">8,429</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
                <BarChart size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <ArrowUp size={16} className="mr-1" />
                <span>23% increase</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tokens Used</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">1.2M</p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-full text-accent-600 dark:text-accent-400">
                <Zap size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-error-600 flex items-center">
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
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">$42.80</p>
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
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">1.8s</p>
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
              {chartData.values.map((value, index) => (
                <div key={index} className="w-full max-w-[40px] flex flex-col items-center">
                  <div className="relative w-full h-full">
                    <div 
                      className="w-10 bg-primary-500 dark:bg-primary-600 rounded-t-md transition-all duration-500 ease-in-out hover:bg-primary-400"
                      style={{ height: `${(value / Math.max(...chartData.values)) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                    {chartData.labels[index]}
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
              {/* Line chart container */}
              <div className="absolute inset-0 flex items-center">
                <svg className="w-full h-[200px]" viewBox="0 0 700 200">
                  {/* Grid lines */}
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
                  
                  {/* Line chart */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={`0,${200 - (chartData.values[0] / Math.max(...chartData.values)) * 200} 
                             100,${200 - (chartData.values[1] / Math.max(...chartData.values)) * 200} 
                             200,${200 - (chartData.values[2] / Math.max(...chartData.values)) * 200} 
                             300,${200 - (chartData.values[3] / Math.max(...chartData.values)) * 200} 
                             400,${200 - (chartData.values[4] / Math.max(...chartData.values)) * 200} 
                             500,${200 - (chartData.values[5] / Math.max(...chartData.values)) * 200} 
                             600,${200 - (chartData.values[6] / Math.max(...chartData.values)) * 200}`}
                  />
                  
                  {/* Data points */}
                  {chartData.values.map((value, index) => (
                    <circle
                      key={index}
                      cx={index * 100}
                      cy={200 - (value / Math.max(...chartData.values)) * 200}
                      r="4"
                      fill="#3b82f6"
                    />
                  ))}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between px-2">
                {chartData.labels.map((label, index) => (
                  <span key={index} className="text-xs text-gray-500 dark:text-gray-400">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
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
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">GPT-4</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">5,248</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">782K</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">2.1s</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">$32.40</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">Claude-3</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">2,350</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">320K</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">1.5s</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">$8.20</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">Gemini</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">831</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">98K</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">1.8s</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">$2.20</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] relative flex items-center justify-center">
              {/* Simple pie chart */}
              <svg className="w-[200px] h-[200px]" viewBox="0 0 100 100">
                {/* GPT-4 slice (62%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent"
                  stroke="#3b82f6" 
                  strokeWidth="20" 
                  strokeDasharray={`${0.62 * 251.2} ${251.2}`} 
                  transform="rotate(-90 50 50)" 
                />
                
                {/* Claude-3 slice (28%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="#8b5cf6" 
                  strokeWidth="20" 
                  strokeDasharray={`${0.28 * 251.2} ${251.2}`} 
                  strokeDashoffset={`${-0.62 * 251.2}`} 
                  transform="rotate(-90 50 50)" 
                />
                
                {/* Gemini slice (10%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="#10b981" 
                  strokeWidth="20" 
                  strokeDasharray={`${0.10 * 251.2} ${251.2}`} 
                  strokeDashoffset={`${-(0.62 + 0.28) * 251.2}`} 
                  transform="rotate(-90 50 50)" 
                />
              </svg>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">GPT-4</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">62%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Claude-3</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">28%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Gemini</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/common/Card';
import Button from '../components/common/Button';
import { BarChart, Clock, Edit, Eye, Star, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  // Mock data for dashboard
  const recentPrompts = [
    { id: 1, title: 'Customer Support Assistant', tags: ['support', 'gpt-4'], lastModified: '2 hours ago', views: 127 },
    { id: 2, title: 'Creative Writing Prompt', tags: ['creative', 'claude-3'], lastModified: '1 day ago', views: 85 },
    { id: 3, title: 'Data Analysis Helper', tags: ['analysis', 'gemini'], lastModified: '3 days ago', views: 204 },
  ];

  const topPrompts = [
    { id: 1, title: 'Product Description Generator', rating: 4.9, usage: 1243 },
    { id: 2, title: 'Email Response Template', rating: 4.7, usage: 956 },
    { id: 3, title: 'Code Explainer', rating: 4.6, usage: 782 },
  ];

  const pendingReviews = [
    { id: 1, title: 'Social Media Post Generator', submittedBy: 'Alex Kim', submittedOn: '1 day ago' },
    { id: 2, title: 'Meeting Summary Creator', submittedBy: 'Jamie Chen', submittedOn: '2 days ago' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Button leftIcon={<Edit size={16} />}>New Prompt</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Prompts</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">42</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
                <Edit size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                <span>12% increase</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usage</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">8.2K</p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-full text-accent-600 dark:text-accent-400">
                <Eye size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                <span>23% increase</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Token Usage</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">1.4K</p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-full text-warning-600 dark:text-warning-400">
                <BarChart size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-error-600 flex items-center">
                <TrendingUp size={16} className="mr-1" className="transform rotate-180" />
                <span>5% decrease</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">7</p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-full text-success-600 dark:text-success-400">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-success-600 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                <span>2 new this month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Prompts</CardTitle>
          </CardHeader>
          <div className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modified</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                </tr>
              </thead>
              <tbody>
                {recentPrompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-gray-50 dark:hover:bg-gray-850">
                    <td className="py-3 px-6">
                      <a href="#" className="font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                        {prompt.title}
                      </a>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex space-x-1">
                        {prompt.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500 dark:text-gray-400">
                      {prompt.lastModified}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500 dark:text-gray-400 text-right">
                      {prompt.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {topPrompts.map((prompt) => (
                  <li key={prompt.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{prompt.title}</h4>
                      <div className="flex items-center mt-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{prompt.rating}</span>
                        <span className="text-sm text-gray-400 dark:text-gray-500 ml-3">
                          {prompt.usage} uses
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReviews.length > 0 ? (
                <ul className="space-y-4">
                  {pendingReviews.map((review) => (
                    <li key={review.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{review.title}</h4>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Submitted by {review.submittedBy} ({review.submittedOn})
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button variant="primary" size="sm">Approve</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No pending reviews</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
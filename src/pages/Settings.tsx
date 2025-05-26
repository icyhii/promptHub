import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  User, 
  Key, 
  Shield, 
  Globe, 
  Bell, 
  Palette, 
  CreditCard,
  Search,
  Save,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);

  // Mock user data
  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Admin',
  };

  // Mock API keys
  const apiKeys = [
    { id: 1, name: 'Production API Key', key: 'sk-1234567890abcdefghijklmnopqrstuvwxyz', createdAt: '2023-09-15' },
    { id: 2, name: 'Development API Key', key: 'sk-abcdefghijklmnopqrstuvwxyz1234567890', createdAt: '2023-10-22' },
  ];

  // Mock integration data
  const integrations = [
    { id: 'openai', name: 'OpenAI', connected: true, icon: '🤖' },
    { id: 'anthropic', name: 'Anthropic', connected: true, icon: '🧠' },
    { id: 'google', name: 'Google AI', connected: false, icon: '🔍' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'profile' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User size={16} className="mr-3" />
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'api' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('api')}
                  >
                    <Key size={16} className="mr-3" />
                    <span>API Keys</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'security' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('security')}
                  >
                    <Shield size={16} className="mr-3" />
                    <span>Security</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'integrations' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('integrations')}
                  >
                    <Globe size={16} className="mr-3" />
                    <span>Integrations</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'notifications' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell size={16} className="mr-3" />
                    <span>Notifications</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'appearance' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('appearance')}
                  >
                    <Palette size={16} className="mr-3" />
                    <span>Appearance</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'billing' 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('billing')}
                  >
                    <CreditCard size={16} className="mr-3" />
                    <span>Billing</span>
                  </button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="mb-4 md:mb-0 md:mr-6">
                    <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        defaultValue={userData.name}
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        defaultValue={userData.email}
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    defaultValue={userData.role}
                    className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    placeholder="Tell us about yourself"
                    className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <Button leftIcon={<Save size={16} />}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>API Keys</CardTitle>
                  <Button size="sm" leftIcon={<Plus size={14} />}>
                    Create New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  These API keys allow access to the PromptHub API. Be careful with these keys as they grant access to your account.
                </p>
                
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{apiKey.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Created on {apiKey.createdAt}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          leftIcon={showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                      
                      <div className="mt-3 flex items-center">
                        <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm flex-1 font-mono">
                          {showApiKey ? apiKey.key : apiKey.key.substring(0, 10) + '••••••••••••••••••••••••••'}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => navigator.clipboard.writeText(apiKey.key)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-850 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">API Documentation</h4>
                  <p className="mb-2">
                    Learn how to use our API by visiting our documentation portal.
                  </p>
                  <Button variant="outline" size="sm">View Documentation</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{integration.icon}</div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {integration.connected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={integration.connected ? 'outline' : 'primary'}
                        size="sm"
                      >
                        {integration.connected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Theme</h3>
                  <div className="flex space-x-4">
                    <button
                      className={`flex flex-col items-center px-6 py-4 rounded-lg border ${
                        theme === 'light' 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => theme !== 'light' && toggleTheme()}
                    >
                      <div className="w-16 h-16 rounded-md bg-white border border-gray-200 mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary-500"></div>
                      </div>
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    
                    <button
                      className={`flex flex-col items-center px-6 py-4 rounded-lg border ${
                        theme === 'dark' 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => theme !== 'dark' && toggleTheme()}
                    >
                      <div className="w-16 h-16 rounded-md bg-gray-900 border border-gray-700 mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary-500"></div>
                      </div>
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                    
                    <button
                      className="flex flex-col items-center px-6 py-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="w-16 h-16 rounded-md bg-gradient-to-r from-white to-gray-900 border border-gray-200 mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary-500"></div>
                      </div>
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Accent Color</h3>
                  <div className="flex space-x-4">
                    <button className="w-8 h-8 rounded-full bg-primary-500 ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-900"></button>
                    <button className="w-8 h-8 rounded-full bg-accent-500"></button>
                    <button className="w-8 h-8 rounded-full bg-success-500"></button>
                    <button className="w-8 h-8 rounded-full bg-warning-500"></button>
                    <button className="w-8 h-8 rounded-full bg-error-500"></button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sidebar Position</h3>
                  <div className="flex space-x-4">
                    <button className="px-4 py-2 rounded-md border border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-sm font-medium">
                      Left
                    </button>
                    <button className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm font-medium">
                      Right
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button leftIcon={<Save size={16} />}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Protect your account with 2FA</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add an extra layer of security to your account by requiring a code in addition to your password.
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 text-sm text-gray-500 dark:text-gray-400">Off</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Login Sessions</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-md flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Chrome on macOS • IP 192.168.1.1 • Active now
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400">
                        Current
                      </span>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-md flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Safari on iPhone</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          IP 192.168.1.2 • Last active 2 hours ago
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Log out</Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" size="sm">Log out of all sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
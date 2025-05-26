import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { Plus, Users, FileText, Clock, Shield, CheckCircle, UserPlus, Settings, MessageCircle } from 'lucide-react';

export default function Teams() {
  const [activeTeam, setActiveTeam] = useState('design');

  // Mock team data
  const teams = [
    { id: 'design', name: 'Design Team', members: 5, prompts: 12 },
    { id: 'marketing', name: 'Marketing Team', members: 4, prompts: 8 },
    { id: 'support', name: 'Customer Support', members: 3, prompts: 15 },
  ];

  // Mock team prompts
  const teamPrompts = [
    { 
      id: 1, 
      title: 'Brand Voice Guidelines', 
      creator: 'Alex Chen',
      status: 'approved', 
      lastUpdated: '2 days ago',
      comments: 3
    },
    { 
      id: 2, 
      title: 'Email Campaign Generator', 
      creator: 'Taylor Kim',
      status: 'pending', 
      lastUpdated: '1 day ago',
      comments: 5
    },
    { 
      id: 3, 
      title: 'Social Media Content Creator', 
      creator: 'Jordan Lee',
      status: 'draft', 
      lastUpdated: '4 hours ago',
      comments: 0
    },
    { 
      id: 4, 
      title: 'Product Description Template', 
      creator: 'Casey Smith',
      status: 'approved', 
      lastUpdated: '1 week ago',
      comments: 7
    },
  ];

  // Mock team members
  const teamMembers = [
    { 
      id: 1, 
      name: 'Alex Chen', 
      role: 'Team Lead',
      avatar: 'AC',
      color: 'bg-primary-500',
      lastActive: '5 min ago'
    },
    { 
      id: 2, 
      name: 'Taylor Kim', 
      role: 'Content Strategist',
      avatar: 'TK',
      color: 'bg-accent-500',
      lastActive: '2 hours ago'
    },
    { 
      id: 3, 
      name: 'Jordan Lee', 
      role: 'Designer',
      avatar: 'JL',
      color: 'bg-success-500',
      lastActive: '1 day ago'
    },
    { 
      id: 4, 
      name: 'Casey Smith', 
      role: 'Copywriter',
      avatar: 'CS',
      color: 'bg-warning-500',
      lastActive: 'Just now'
    },
    { 
      id: 5, 
      name: 'Riley Johnson', 
      role: 'Marketing Specialist',
      avatar: 'RJ',
      color: 'bg-error-500',
      lastActive: '3 hours ago'
    },
  ];

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams & Projects</h1>
        <Button leftIcon={<Plus size={16} />}>New Team</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users size={16} className="mr-2" />
                Your Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul>
                {teams.map((team) => (
                  <li key={team.id}>
                    <button
                      className={`flex items-center w-full px-4 py-3 border-l-2 ${
                        activeTeam === team.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setActiveTeam(team.id)}
                    >
                      <div className="flex-1 text-left">
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {team.members} members · {team.prompts} prompts
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
                <li>
                  <button className="flex items-center w-full px-4 py-3 text-left text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Plus size={16} className="mr-2" />
                    <span>Create New Team</span>
                  </button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Dashboard */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Team Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Design Team</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" leftIcon={<Settings size={14} />}>
                      Team Settings
                    </Button>
                    <Button size="sm" leftIcon={<UserPlus size={14} />}>
                      Invite Member
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 mr-3">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{teamMembers.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-full text-accent-600 dark:text-accent-400 mr-3">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Prompts</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{teamPrompts.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-full text-success-600 dark:text-success-400 mr-3">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {teamPrompts.filter(p => p.status === 'approved').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Prompts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <FileText size={16} className="mr-2" />
                    Team Prompts
                  </CardTitle>
                  <Button size="sm" leftIcon={<Plus size={14} />}>
                    New Prompt
                  </Button>
                </div>
              </CardHeader>
              <div className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prompt</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Creator</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comments</th>
                      <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPrompts.map((prompt) => (
                      <tr key={prompt.id} className="hover:bg-gray-50 dark:hover:bg-gray-850 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {prompt.title}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {prompt.creator}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(prompt.status)}`}>
                            {prompt.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {prompt.lastUpdated}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <MessageCircle size={14} className="text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">{prompt.comments}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button variant="outline" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users size={16} className="mr-2" />
                    Team Members
                  </CardTitle>
                  <Button size="sm" leftIcon={<UserPlus size={14} />}>
                    Invite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {teamMembers.map((member) => (
                    <li key={member.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white font-medium mr-3`}>
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mr-4 flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{member.lastActive}</span>
                        </div>
                        <Button variant="outline" size="sm" leftIcon={<Shield size={14} />}>
                          Permissions
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
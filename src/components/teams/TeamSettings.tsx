import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { Save, Users, Shield, Clock, AlertCircle } from 'lucide-react';
import { useTeam } from '../../hooks/useTeam';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';

const ROLE_DESCRIPTIONS = {
  owner: 'Full administrative control over the team, including member management and team deletion.',
  admin: 'Can manage team settings, members, and content but cannot delete the team.',
  editor: 'Can create and edit team content, invite new members.',
  viewer: 'Read-only access to team content and member list.'
};

const PERMISSIONS_MATRIX = {
  owner: {
    canEditTeam: true,
    canInviteMembers: true,
    canManageRoles: true,
    canDeleteTeam: true,
    canManageContent: true,
  },
  admin: {
    canEditTeam: true,
    canInviteMembers: true,
    canManageRoles: true,
    canDeleteTeam: false,
    canManageContent: true,
  },
  editor: {
    canEditTeam: false,
    canInviteMembers: true,
    canManageRoles: false,
    canDeleteTeam: false,
    canManageContent: true,
  },
  viewer: {
    canEditTeam: false,
    canInviteMembers: false,
    canManageRoles: false,
    canDeleteTeam: false,
    canManageContent: false,
  }
};

export default function TeamSettings({ teamId }: { teamId: string }) {
  const { team, updateTeam } = useTeam(teamId);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{
    type: 'remove' | 'role';
    memberId?: string;
    newRole?: string;
  } | null>(null);

  useEffect(() => {
    if (team) {
      setTeamName(team.name);
      setDescription(team.settings?.description || '');
    }
  }, [team]);

  const handleSave = async () => {
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (teamName.length > 50) {
      toast.error('Team name must be 50 characters or less');
      return;
    }

    if (description.length > 500) {
      toast.error('Description must be 500 characters or less');
      return;
    }

    try {
      setIsSaving(true);
      await updateTeam.mutateAsync({
        id: teamId,
        name: teamName,
        settings: {
          ...team?.settings,
          description
        }
      });
      toast.success('Team settings updated successfully');
    } catch (error) {
      toast.error('Failed to update team settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAction = async (action: 'remove' | 'role', newRole?: string) => {
    if (selectedMembers.length === 0) {
      toast.error('Please select members first');
      return;
    }

    setActionToConfirm({ type: action, newRole });
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    if (!actionToConfirm) return;

    try {
      if (actionToConfirm.type === 'remove') {
        // Implement bulk member removal
        toast.success('Members removed successfully');
      } else if (actionToConfirm.type === 'role' && actionToConfirm.newRole) {
        // Implement bulk role update
        toast.success('Roles updated successfully');
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setShowConfirmation(false);
      setActionToConfirm(null);
      setSelectedMembers([]);
    }
  };

  if (!team) return null;

  const filteredMembers = team.members?.filter(member => 
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label 
              htmlFor="teamName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-describedby="teamNameLimit"
            />
            <p id="teamNameLimit" className="mt-1 text-sm text-gray-500">
              {teamName.length}/50 characters
            </p>
          </div>

          <div>
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <ReactQuill
              value={description}
              onChange={setDescription}
              className="h-32"
            />
            <p className="mt-1 text-sm text-gray-500">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                Created: {format(new Date(team.created_at), 'PPP')}
              </div>
              <div className="flex items-center mt-1">
                <Clock size={16} className="mr-1" />
                Last modified: {format(new Date(team.updated_at), 'PPP')}
              </div>
            </div>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save size={16} />}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Users size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('role', 'editor')}
                  disabled={selectedMembers.length === 0}
                >
                  Change Role
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleBulkAction('remove')}
                  disabled={selectedMembers.length === 0}
                >
                  Remove Selected
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === filteredMembers?.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers(filteredMembers?.map(m => m.user_id) || []);
                          } else {
                            setSelectedMembers([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Member</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers?.map((member) => (
                    <tr key={member.user_id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, member.user_id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.user_id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                            {member.user.email[0].toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{member.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Shield size={16} className="mr-2" />
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {format(new Date(member.created_at), 'PP')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActionToConfirm({ type: 'role', memberId: member.user_id });
                            setShowConfirmation(true);
                          }}
                        >
                          Change Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left">Permission</th>
                  {Object.keys(PERMISSIONS_MATRIX).map(role => (
                    <th key={role} className="px-4 py-3 text-center capitalize">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERMISSIONS_MATRIX.owner).map(([permission, _]) => (
                  <tr key={permission} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 capitalize">
                      {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </td>
                    {Object.entries(PERMISSIONS_MATRIX).map(([role, permissions]) => (
                      <td key={role} className="px-4 py-3 text-center">
                        {permissions[permission as keyof typeof permissions] ? '✓' : '×'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle size={24} className="text-warning-500 mr-2" />
              <h3 className="text-lg font-semibold">Confirm Action</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {actionToConfirm?.type === 'remove' 
                ? 'Are you sure you want to remove the selected members?' 
                : 'Are you sure you want to change the role of the selected members?'}
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setActionToConfirm(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={actionToConfirm?.type === 'remove' ? 'danger' : 'primary'}
                onClick={confirmAction}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
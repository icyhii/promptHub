import { useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import Button from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { UserPlus, Shield, Clock, X, Check } from 'lucide-react';
import RoleSelect from './RoleSelect';
import toast from 'react-hot-toast';

interface TeamMembersProps {
  teamId: string;
}

export default function TeamMembers({ teamId }: TeamMembersProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');
  const { team, inviteMember, removeMember } = useTeam(teamId);

  const handleInvite = async () => {
    try {
      await inviteMember.mutateAsync({
        teamId,
        email: inviteEmail,
        role: selectedRole
      });
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      setShowInviteForm(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({ teamId, userId });
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    toast.success(`Role updated to ${newRole}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
        <Button
          size="sm"
          leftIcon={<UserPlus size={16} />}
          onClick={() => setShowInviteForm(true)}
        >
          Invite
        </Button>
      </div>

      {showInviteForm && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <RoleSelect
                  currentRole={selectedRole}
                  userId=""
                  teamId={teamId}
                  onRoleChange={(role) => setSelectedRole(role as 'editor' | 'viewer')}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<X size={16} />}
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Check size={16} />}
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                >
                  Send Invite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {team?.members?.map((member: any) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {member.user.email[0].toUpperCase()}
              </div>
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {member.user.email}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>Active</span>
                </div>
              </div>
              <div className="ml-4 w-48">
                <RoleSelect
                  currentRole={member.role}
                  userId={member.user_id}
                  teamId={teamId}
                  onRoleChange={(role) => handleRoleChange(member.user_id, role)}
                  disabled={member.role === 'owner'}
                />
              </div>
            </div>
            
            {member.role !== 'owner' && (
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => handleRemoveMember(member.user_id)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
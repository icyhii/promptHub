import { useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import Button from '../common/Button';
import { UserPlus, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMembersProps {
  teamId: string;
}

export default function TeamMembers({ teamId }: TeamMembersProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const { team, inviteMember, removeMember } = useTeam(teamId);

  const handleInvite = async () => {
    try {
      await inviteMember.mutateAsync({
        teamId,
        email: inviteEmail,
        role: 'member'
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
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex space-x-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              Send Invite
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {team?.members?.map((member: any) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {member.user.email[0].toUpperCase()}
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900 dark:text-white">
                  {member.user.email}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Shield size={14} />}
              >
                {member.role}
              </Button>
              {member.role !== 'owner' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.user_id)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
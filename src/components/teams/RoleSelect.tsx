import { useState, useRef, useEffect } from 'react';
import { Shield, ChevronDown, Check } from 'lucide-react';
import { useTeam } from '../../hooks/useTeam';
import Button from '../common/Button';

interface RoleSelectProps {
  currentRole: string;
  userId: string;
  teamId: string;
  onRoleChange: (role: string) => void;
  disabled?: boolean;
}

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    description: 'Full administrative control over the team, including member management and team deletion.',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    hoverColor: 'hover:bg-purple-100',
  },
  admin: {
    label: 'Admin',
    description: 'Can manage team settings, members, and content but cannot delete the team.',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    hoverColor: 'hover:bg-blue-100',
  },
  editor: {
    label: 'Editor',
    description: 'Can create and edit team content, invite new members.',
    color: 'text-green-600 bg-green-50 border-green-200',
    hoverColor: 'hover:bg-green-100',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to team content and member list.',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    hoverColor: 'hover:bg-gray-100',
  },
};

export default function RoleSelect({ currentRole, userId, teamId, onRoleChange, disabled = false }: RoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { updateMemberRole } = useTeam(teamId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: string) => {
    if (role === currentRole) {
      setIsOpen(false);
      return;
    }

    setSelectedRole(role);
    setShowConfirmation(true);
    setIsOpen(false);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedRole) return;

    try {
      await updateMemberRole.mutateAsync({
        teamId,
        userId,
        role: selectedRole as any
      });
      onRoleChange(selectedRole);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setShowConfirmation(false);
      setSelectedRole(null);
    }
  };

  const currentRoleConfig = ROLE_CONFIG[currentRole as keyof typeof ROLE_CONFIG];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md
            transition-colors duration-200 
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${currentRoleConfig.color}
          `}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Current role: ${currentRoleConfig.label}`}
        >
          <div className="flex items-center">
            <Shield size={16} className="mr-2" />
            <span className="font-medium">{currentRoleConfig.label}</span>
          </div>
          {!disabled && <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </button>

        {isOpen && (
          <div 
            className="absolute z-50 w-64 mt-2 bg-white border rounded-md shadow-lg"
            role="listbox"
          >
            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
              <button
                key={role}
                className={`
                  w-full px-4 py-2 text-left transition-colors
                  ${role === currentRole ? 'bg-gray-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => handleRoleSelect(role)}
                role="option"
                aria-selected={role === currentRole}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield size={16} className="mr-2" />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  {role === currentRole && <Check size={16} className="text-green-500" />}
                </div>
                <p className="mt-1 text-xs text-gray-500">{config.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Role Change</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to change this user's role to {ROLE_CONFIG[selectedRole as keyof typeof ROLE_CONFIG].label}?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedRole(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmRoleChange}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
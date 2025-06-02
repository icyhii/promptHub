import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { Plus, Users, FileText, Clock, Shield } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import TeamChat from '../components/teams/TeamChat';
import TeamMembers from '../components/teams/TeamMembers';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error loading team data</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

function TeamsContent() {
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const { userTeams, createTeam, isLoading } = useTeam();

  const handleCreateTeam = async () => {
    const teamName = prompt('Enter team name:');
    if (!teamName) return;

    try {
      await createTeam.mutateAsync({
        name: teamName,
      });
      toast.success('Team created successfully');
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams & Projects</h1>
        <Button leftIcon={<Plus size={16} />} onClick={handleCreateTeam}>
          New Team
        </Button>
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
                {userTeams?.map((teamMember) => (
                  <li key={teamMember.team.id}>
                    <button
                      className={`flex items-center w-full px-4 py-3 border-l-2 ${
                        activeTeam === teamMember.team.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setActiveTeam(teamMember.team.id)}
                    >
                      <div className="flex-1 text-left">
                        <p className="font-medium">{teamMember.team.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {teamMember.role}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Dashboard */}
        <div className="lg:col-span-3">
          {activeTeam ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="h-[600px]">
                  <TeamChat teamId={activeTeam} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent>
                  <TeamMembers teamId={activeTeam} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a Team
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a team from the sidebar or create a new one to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Teams() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <TeamsContent />
    </ErrorBoundary>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { History, ArrowLeft, ArrowRight, Check, X, Clock, User, GitBranch, GitMerge, GitPullRequest } from 'lucide-react';
import { format } from 'date-fns';
import { useVersionControl } from '../../hooks/useVersionControl';
import toast from 'react-hot-toast';

interface VersionHistoryProps {
  promptId: string;
  onRestore: (version: any) => void;
}

export default function VersionHistory({ promptId, onRestore }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  
  const {
    versions,
    branches,
    isLoading,
    createBranch,
    createVersion,
    submitReview,
    mergeBranches,
    calculateDiff
  } = useVersionControl(promptId);

  const handleCreateBranch = async () => {
    const name = prompt('Enter branch name:');
    if (!name) return;

    try {
      await createBranch.mutateAsync({
        name,
        type: 'feature',
        description: `Feature branch: ${name}`
      });
      toast.success('Branch created successfully');
    } catch (error) {
      toast.error('Failed to create branch');
    }
  };

  const handleMergeBranch = async (sourceBranchId: string, targetBranchId: string) => {
    try {
      await mergeBranches.mutateAsync({
        sourceBranchId,
        targetBranchId
      });
      toast.success('Branches merged successfully');
    } catch (error) {
      toast.error('Failed to merge branches');
    }
  };

  const handleSubmitReview = async (versionId: string, approved: boolean) => {
    try {
      await submitReview.mutateAsync({
        versionId,
        status: approved ? 'approved' : 'changes_requested',
        feedback: approved ? 'LGTM!' : 'Please address the following issues...'
      });
      toast.success(approved ? 'Changes approved' : 'Changes requested');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Branch Selection */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <GitBranch size={16} className="mr-2" />
              Branches
            </CardTitle>
            <Button
              size="sm"
              onClick={handleCreateBranch}
              leftIcon={<GitBranch size={14} />}
            >
              New Branch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {branches?.map(branch => (
              <div
                key={branch.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  activeBranch === branch.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <GitBranch size={16} className="mr-2" />
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-gray-500">
                      Created {format(new Date(branch.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveBranch(branch.id)}
                  >
                    Switch
                  </Button>
                  {branch.type !== 'main' && (
                    <Button
                      size="sm"
                      leftIcon={<GitMerge size={14} />}
                      onClick={() => handleMergeBranch(branch.id, branches[0].id)}
                    >
                      Merge to Main
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions?.map(version => (
              <div
                key={version.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">Version {version.version_number}</h3>
                      {version.branch_id && (
                        <div className="ml-2 flex items-center text-gray-500">
                          <GitBranch size={14} className="mr-1" />
                          <span className="text-sm">
                            {branches?.find(b => b.id === version.branch_id)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{version.change_log}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSubmitReview(version.id, true)}
                      leftIcon={<Check size={14} />}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSubmitReview(version.id, false)}
                      leftIcon={<X size={14} />}
                    >
                      Request Changes
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User size={14} className="mr-1" />
                    <span>{version.created_by.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>
                      {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>

                {version.reviews?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium mb-2">Reviews</h4>
                    <div className="space-y-2">
                      {version.reviews.map((review: any) => (
                        <div
                          key={review.id}
                          className={`text-sm p-2 rounded ${
                            review.status === 'approved'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {review.feedback}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
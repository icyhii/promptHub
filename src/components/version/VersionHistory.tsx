import { useState } from 'react';
import { useVersionControl } from '../../hooks/useVersionControl';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { History, ArrowLeft, ArrowRight, Check, X, Clock, User, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface VersionHistoryProps {
  promptId: string;
  onRestore: (version: any) => void;
}

export default function VersionHistory({ promptId, onRestore }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [showDiff, setShowDiff] = useState(false);
  const { versions, isLoading, restoreVersion } = useVersionControl(promptId);

  const handleRestore = async () => {
    if (!selectedVersion) return;

    const description = prompt('Please provide a description for this restoration:');
    if (!description) return;

    try {
      await restoreVersion.mutateAsync({
        version: selectedVersion,
        description
      });
      onRestore(selectedVersion);
      setSelectedVersion(null);
      toast.success('Version restored successfully');
    } catch (error) {
      toast.error('Failed to restore version');
      console.error('Failed to restore version:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
      </div>
    );
  }

  if (!versions?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <History className="mx-auto mb-4 h-12 w-12" />
        <p>No version history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedVersion ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedVersion(null)}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back to History
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDiff(!showDiff)}
              >
                {showDiff ? 'Show Content' : 'Show Changes'}
              </Button>
              <Button
                onClick={handleRestore}
                leftIcon={<Check size={16} />}
              >
                Restore This Version
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Version {selectedVersion.version_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>{selectedVersion.created_by.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>{format(new Date(selectedVersion.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedVersion.description}</p>
                </div>

                {selectedVersion.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-gray-600">{selectedVersion.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Changes</h4>
                  {showDiff && selectedVersion.diff ? (
                    <div className="mt-2 space-y-2">
                      {selectedVersion.diff.additions.map((addition: string, i: number) => (
                        <div key={i} className="bg-green-50 text-green-700 p-2 rounded">
                          <span className="font-mono">+ {addition}</span>
                        </div>
                      ))}
                      {selectedVersion.diff.deletions.map((deletion: string, i: number) => (
                        <div key={i} className="bg-red-50 text-red-700 p-2 rounded">
                          <span className="font-mono">- {deletion}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto">
                      {JSON.stringify(selectedVersion.content, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version: any) => (
            <div
              key={version.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedVersion(version)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">Version {version.version_number}</h3>
                    {version.restored_from_version && (
                      <div className="ml-2 flex items-center text-gray-500">
                        <GitBranch size={14} className="mr-1" />
                        <span className="text-sm">
                          Restored from v{version.restored_from_version}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{version.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-sm text-gray-500">
                    by {version.created_by.email}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
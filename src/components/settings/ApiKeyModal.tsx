import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ApiKeyModalProps {
  apiKey: string;
  onClose: () => void;
}

export default function ApiKeyModal({ apiKey, onClose }: ApiKeyModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <CardTitle className="flex items-center text-warning-600">
            <AlertTriangle size={20} className="mr-2" />
            Save Your API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-warning-50 border border-warning-200 rounded-md p-4 text-warning-700">
            <p className="text-sm font-medium">
              Make sure to copy your API key now. You won't be able to see it again!
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md font-mono text-sm break-all">
            {apiKey}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button onClick={onClose}>
              I've saved my API key
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Store this API key securely. If you lose it, you'll need to create a new one.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { Play, Copy, Save, Lightbulb, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { runPrompt, type PromptRunResponse } from '../lib/api';
import { ErrorBoundary } from 'react-error-boundary';
import toast from 'react-hot-toast';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error: {error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

function PlaygroundContent() {
  const [promptInput, setPromptInput] = useState(
    `Create a compelling product description for a new smartwatch that tracks health metrics and has a 7-day battery life. The target audience is fitness enthusiasts aged 25-40.`
  );
  
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [output, setOutput] = useState<PromptRunResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');

  const handleRunPrompt = async () => {
    try {
      setIsLoading(true);
      const response = await runPrompt({
        prompt: promptInput,
        model: selectedModel,
        parameters: {
          temperature,
          maxTokens
        }
      });
      
      setOutput(response);
      toast.success('Prompt executed successfully');
    } catch (error) {
      toast.error('Failed to execute prompt');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Playground</h1>
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'single' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('single')}
          >
            Single Prompt
          </Button>
          <Button 
            variant={activeTab === 'a-b' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('a-b')}
          >
            A/B Testing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button 
                className="w-full" 
                leftIcon={<Play size={16} />}
                onClick={handleRunPrompt}
                isLoading={isLoading}
              >
                {isLoading ? 'Running...' : 'Run Prompt'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full h-40 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Enter your prompt here..."
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Output</CardTitle>
              {output && (
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    leftIcon={<Copy size={14} />}
                    onClick={() => {
                      navigator.clipboard.writeText(output.text);
                      toast.success('Copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 min-h-[200px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generating output...</p>
                  </div>
                ) : output ? (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-line">{output.text}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>Model: {output.model}</div>
                      <div>Tokens: {output.tokens}</div>
                      <div>Time: {(output.duration_ms / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <Lightbulb size={24} className="mb-2" />
                    <p>Run the prompt to see output</p>
                  </div>
                )}
              </div>
              
              {output && (
                <div className="flex justify-center mt-4 space-x-2">
                  <Button size="sm" variant="outline" leftIcon={<ThumbsUp size={14} />}>Like</Button>
                  <Button size="sm" variant="outline" leftIcon={<ThumbsDown size={14} />}>Dislike</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Playground() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <PlaygroundContent />
    </ErrorBoundary>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { Play, Copy, Save, Lightbulb, RefreshCcw, ThumbsUp, ThumbsDown, ArrowLeftRight, Maximize2, Minimize2 } from 'lucide-react';
import { diff_match_patch } from 'diff-match-patch';
import { ErrorBoundary } from 'react-error-boundary';
import { usePlaygroundStore } from '../stores/playgroundStore';

const dmp = new diff_match_patch();

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-error-600 mb-4">Error: {error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

function PlaygroundContent() {
  const [activeTab, setActiveTab] = useState<'single' | 'a-b'>('single');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const {
    // Single prompt state
    promptInput,
    selectedModel,
    temperature,
    maxTokens,
    output,
    isLoading,
    
    // A/B testing state
    promptA,
    promptB,
    resultA,
    resultB,
    isLoadingA,
    isLoadingB,
    comparisonNotes,
    
    // Actions
    setPromptInput,
    setSelectedModel,
    setTemperature,
    setMaxTokens,
    setPromptA,
    setPromptB,
    setComparisonNotes,
    runSinglePrompt,
    runComparison,
    copyToSideB,
    reset
  } = usePlaygroundStore();

  const calculateDiff = (textA: string, textB: string) => {
    const diffs = dmp.diff_main(textA, textB);
    dmp.diff_cleanupSemantic(diffs);
    return diffs;
  };

  const saveComparison = () => {
    const comparison = {
      promptA,
      promptB,
      resultA,
      resultB,
      notes: comparisonNotes,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(comparison, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-comparison-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <Button
            variant="outline"
            onClick={() => setIsFullScreen(!isFullScreen)}
            leftIcon={isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          >
            {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {activeTab === 'single' ? (
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
                  onClick={runSinglePrompt}
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
                        <div>Time: {(output.executionTime / 1000).toFixed(2)}s</div>
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
      ) : (
        // A/B Testing Interface
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prompt A */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Prompt A</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowLeftRight size={14} />}
                    onClick={copyToSideB}
                  >
                    Copy to B
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={promptA.prompt}
                  onChange={(e) => setPromptA({ prompt: e.target.value })}
                  className="w-full h-40 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Enter prompt A..."
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model
                    </label>
                    <select
                      value={promptA.model}
                      onChange={(e) => setPromptA({ model: e.target.value })}
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
                      Temperature: {promptA.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={promptA.temperature}
                      onChange={(e) => setPromptA({ temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Tokens: {promptA.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={promptA.maxTokens}
                    onChange={(e) => setPromptA({ maxTokens: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {resultA && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-line">{resultA.text}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                      <div>Tokens: {resultA.tokens}</div>
                      <div>Time: {(resultA.executionTime / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prompt B */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt B</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={promptB.prompt}
                  onChange={(e) => setPromptB({ prompt: e.target.value })}
                  className="w-full h-40 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Enter prompt B..."
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model
                    </label>
                    <select
                      value={promptB.model}
                      onChange={(e) => setPromptB({ model: e.target.value })}
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
                      Temperature: {promptB.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={promptB.temperature}
                      onChange={(e) => setPromptB({ temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Tokens: {promptB.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={promptB.maxTokens}
                    onChange={(e) => setPromptB({ maxTokens: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {resultB && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-line">{resultB.text}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                      <div>Tokens: {resultB.tokens}</div>
                      <div>Time: {(resultB.executionTime / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Button
                    onClick={runComparison}
                    isLoading={isLoadingA || isLoadingB}
                    leftIcon={<Play size={16} />}
                  >
                    Run Comparison
                  </Button>
                  <Button
                    variant="outline"
                    onClick={saveComparison}
                    leftIcon={<Save size={16} />}
                    disabled={!resultA || !resultB}
                  >
                    Save Results
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  {(resultA && resultB) && (
                    <span>
                      Token Difference: {Math.abs(resultA.tokens - resultB.tokens)} |
                      Time Difference: {Math.abs(resultA.executionTime - resultB.executionTime) / 1000}s
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Results */}
          {resultA && resultB && (
            <Card>
              <CardHeader>
                <CardTitle>Comparison Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Differences
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    {calculateDiff(resultA.text, resultB.text).map((diff, i) => {
                      const [type, text] = diff;
                      const className = type === 1 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : type === -1
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : '';
                      return (
                        <span key={i} className={className}>
                          {text}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </h3>
                  <textarea
                    value={comparisonNotes}
                    onChange={(e) => setComparisonNotes(e.target.value)}
                    className="w-full h-32 p-3 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Add notes about the comparison..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prompt A Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{(resultA.executionTime / 1000).toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tokens Used:</span>
                        <span>{resultA.tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost (est.):</span>
                        <span>${((resultA.tokens / 1000) * 0.002).toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prompt B Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{(resultB.executionTime / 1000).toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tokens Used:</span>
                        <span>{resultB.tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost (est.):</span>
                        <span>${((resultB.tokens / 1000) * 0.002).toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
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
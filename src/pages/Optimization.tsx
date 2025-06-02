import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { LineChart, BarChart, CheckCircle, AlertTriangle, Play, Save, ArrowRight, Edit, Lightbulb, RefreshCw } from 'lucide-react';
import { optimizePrompt, type OptimizePromptResponse } from '../lib/api';
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

function OptimizationContent() {
  const [selectedPrompt, setSelectedPrompt] = useState('customer-support');
  const [optimizationGoals, setOptimizationGoals] = useState(['conciseness', 'factuality']);
  const [optimizationMethod, setOptimizationMethod] = useState('ai');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizePromptResponse | null>(null);

  // Mock data for prompt selection
  const prompts = [
    { id: 'customer-support', name: 'Customer Support Assistant' },
    { id: 'content-creation', name: 'Content Creation Guide' },
    { id: 'code-helper', name: 'Code Helper' },
  ];

  // Mock optimization goals
  const allGoals = [
    { id: 'conciseness', name: 'Conciseness', description: 'Make the prompt shorter without losing effectiveness' },
    { id: 'factuality', name: 'Factuality', description: 'Ensure the prompt produces factual outputs' },
    { id: 'adherence', name: 'Instruction Adherence', description: 'Improve how well AI follows the prompt instructions' },
    { id: 'creativity', name: 'Creativity', description: 'Enhance the creativity of generated outputs' },
    { id: 'consistency', name: 'Consistency', description: 'Produce more consistent outputs across runs' },
  ];

  // Original prompt content
  const [promptContent, setPromptContent] = useState(`You are a helpful customer support assistant for a software company.

Your tasks:
1. Answer questions about our product features
2. Provide troubleshooting steps
3. Escalate complex issues to human support
4. Be polite and professional at all times

When helping with troubleshooting, follow these steps:
- Ask for specific error messages
- Check if they've tried restarting
- Verify their software version
- Provide clear step-by-step instructions

DO NOT:
- Share internal company information
- Make promises about future features
- Process refunds or billing issues`);

  // Optimized prompt content (mock result)
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  const toggleGoal = (goalId: string) => {
    if (optimizationGoals.includes(goalId)) {
      setOptimizationGoals(optimizationGoals.filter(g => g !== goalId));
    } else {
      setOptimizationGoals([...optimizationGoals, goalId]);
    }
  };

  const runOptimization = async () => {
    try {
      setIsOptimizing(true);
      const response = await optimizePrompt({
        originalPrompt: promptContent,
        targetOutcome: optimizationGoals.join(','),
        constraints: ['maintain_tone', 'preserve_key_points']
      });
      
      setOptimizationResult(response);
      setOptimizedPrompt(response.optimizedPrompt);
      toast.success('Optimization completed successfully');
    } catch (error) {
      toast.error('Failed to optimize prompt');
      console.error('Error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Mock scores for visualization
  const scores = {
    original: {
      conciseness: 65,
      factuality: 80,
      adherence: 75,
      creativity: 40,
      consistency: 70
    },
    optimized: {
      conciseness: 90,
      factuality: 85,
      adherence: 85,
      creativity: 35,
      consistency: 85
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-500';
    if (score >= 60) return 'text-warning-500';
    return 'text-error-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={16} className="text-success-500" />;
    return <AlertTriangle size={16} className="text-warning-500" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Optimization</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimization Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Prompt to Optimize
              </label>
              <select
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                className="w-full p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {prompts.map(prompt => (
                  <option key={prompt.id} value={prompt.id}>{prompt.name}</option>
                ))}
              </select>
            </div>

            {/* Optimization Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Optimization Goals
              </label>
              <div className="space-y-2">
                {allGoals.map(goal => (
                  <div key={goal.id} className="flex items-center">
                    <button
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                        optimizationGoals.includes(goal.id) 
                          ? 'bg-primary-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          optimizationGoals.includes(goal.id) ? 'translate-x-5' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">{goal.name}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {goal.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Optimization Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    optimizationMethod === 'manual' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setOptimizationMethod('manual')}
                >
                  <div className="text-center">
                    <Edit size={20} className="mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="block font-medium text-gray-900 dark:text-white">Manual</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Edit yourself with suggestions
                    </span>
                  </div>
                </button>
                
                <button
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    optimizationMethod === 'ai' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setOptimizationMethod('ai')}
                >
                  <div className="text-center">
                    <Lightbulb size={20} className="mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="block font-medium text-gray-900 dark:text-white">AI-Powered</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Automatically optimize
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              leftIcon={<Play size={16} />}
              isLoading={isOptimizing}
              onClick={runOptimization}
              disabled={optimizationGoals.length === 0 || isOptimizing}
            >
              {isOptimizing ? 'Optimizing...' : 'Start Optimization'}
            </Button>
          </CardContent>
        </Card>

        {/* Current Prompt */}
        <Card>
          <CardHeader>
            <CardTitle>Current Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              className="w-full h-80 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Enter your prompt here..."
              disabled={isOptimizing}
            />
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {promptContent.length} characters | {promptContent.split(/\s+/).length} words
                </span>
              </div>
              <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section - Only show when optimization is complete */}
      {optimizationResult && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-6">Optimization Results</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimized Prompt */}
            <Card>
              <CardHeader>
                <CardTitle>Optimized Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={optimizedPrompt}
                  onChange={(e) => setOptimizedPrompt(e.target.value)}
                  className="w-full h-80 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {optimizedPrompt.length} characters | {optimizedPrompt.split(/\s+/).length} words
                    </span>
                  </div>
                  <Button leftIcon={<Save size={14} />}>
                    Save as New Version
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Score Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allGoals.map(goal => (
                    <div key={goal.id} className="bg-gray-50 dark:bg-gray-850 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 dark:text-white">{goal.name}</span>
                          {optimizationGoals.includes(goal.id) && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                              Target
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <span className={`font-bold ${getScoreColor(scores.original[goal.id as keyof typeof scores.original])}`}>
                              {scores.original[goal.id as keyof typeof scores.original]}
                            </span>
                            <ArrowRight size={14} className="mx-1 text-gray-400" />
                            <span className={`font-bold ${getScoreColor(scores.optimized[goal.id as keyof typeof scores.optimized])}`}>
                              {scores.optimized[goal.id as keyof typeof scores.optimized]}
                            </span>
                          </div>
                          {getScoreIcon(scores.optimized[goal.id as keyof typeof scores.optimized])}
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                          style={{ width: `${scores.optimized[goal.id as keyof typeof scores.optimized]}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Improvements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-success-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Reduced word count by 42% while preserving key instructions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-success-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Improved structure with clearer sections</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-success-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Added explicit numbering for better instruction following</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" leftIcon={<RefreshCw size={16} />}>
              Try Another Optimization
            </Button>
            <Button leftIcon={<ArrowRight size={16} />}>
              Test in Playground
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Optimization() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <OptimizationContent />
    </ErrorBoundary>
  );
}
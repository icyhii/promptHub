import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { 
  Wand, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  List, 
  FileText, 
  Settings, 
  Layout,
  RefreshCw
} from 'lucide-react';
import ReactQuill from 'react-quill';
import { marked } from 'marked';
import 'react-quill/dist/quill.snow.css';

interface AnalysisResult {
  score: number;
  suggestions: string[];
  category: 'structure' | 'clarity' | 'instructions' | 'context' | 'format' | 'constraints';
}

interface PromptEditorProps {
  initialPrompt?: string;
  onSave?: (prompt: string) => void;
  onAnalyze?: (analysis: AnalysisResult[]) => void;
}

export default function PromptEditor({ 
  initialPrompt = '', 
  onSave,
  onAnalyze 
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const categories = [
    { id: 'structure', label: 'Structure', icon: <Layout size={16} /> },
    { id: 'clarity', label: 'Clarity', icon: <FileText size={16} /> },
    { id: 'instructions', label: 'Instructions', icon: <List size={16} /> },
    { id: 'context', label: 'Context', icon: <Info size={16} /> },
    { id: 'format', label: 'Format', icon: <Layout size={16} /> },
    { id: 'constraints', label: 'Constraints', icon: <Settings size={16} /> },
  ];

  const analyzePrompt = async () => {
    setIsAnalyzing(true);
    try {
      // Mock analysis - replace with actual API call
      const mockAnalysis: AnalysisResult[] = [
        {
          category: 'structure',
          score: 0.7,
          suggestions: [
            'Consider using bullet points for better organization',
            'Add clear section headings',
            'Group related instructions together'
          ]
        },
        {
          category: 'clarity',
          score: 0.8,
          suggestions: [
            'Use more specific action verbs',
            'Remove ambiguous terms',
            'Define technical terms'
          ]
        },
        {
          category: 'instructions',
          score: 0.6,
          suggestions: [
            'Add step-by-step instructions',
            'Specify input requirements',
            'Include validation criteria'
          ]
        },
        {
          category: 'context',
          score: 0.5,
          suggestions: [
            'Provide more background information',
            'Specify target audience',
            'Add relevant examples'
          ]
        },
        {
          category: 'format',
          score: 0.9,
          suggestions: [
            'Specify desired output format',
            'Add formatting examples',
            'Include template structure'
          ]
        },
        {
          category: 'constraints',
          score: 0.7,
          suggestions: [
            'Define scope limitations',
            'Specify resource constraints',
            'Add error handling requirements'
          ]
        }
      ];

      setAnalysis(mockAnalysis);
      onAnalyze?.(mockAnalysis);

      // Generate improved prompt
      const improved = generateImprovedPrompt(prompt, mockAnalysis);
      setImprovedPrompt(improved);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateImprovedPrompt = (original: string, analysis: AnalysisResult[]): string => {
    // Mock improvement - replace with actual implementation
    return `# Improved Prompt

## Context & Background
[Add relevant background information here]

## Task Description
${original}

## Specific Requirements
- Requirement 1
- Requirement 2
- Requirement 3

## Expected Output Format
\`\`\`
{
  "key": "value",
  "results": []
}
\`\`\`

## Constraints & Limitations
- Maximum response length: 500 words
- Time limit: 30 seconds
- Resource constraints: [specify]

## Examples
1. Input example 1 -> Expected output 1
2. Input example 2 -> Expected output 2

## Additional Notes
- Note any edge cases
- Special considerations
- Error handling preferences`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle size={16} className="text-green-500" />;
    if (score >= 0.6) return <Info size={16} className="text-yellow-500" />;
    return <AlertCircle size={16} className="text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReactQuill
                value={prompt}
                onChange={setPrompt}
                className="h-64"
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'code-block'],
                    ['clean']
                  ]
                }}
              />
              
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-500">
                  {prompt.length} characters • {prompt.split(/\s+/).length} words
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowComparison(!showComparison)}
                    disabled={!improvedPrompt}
                  >
                    {showComparison ? 'Hide' : 'Show'} Comparison
                  </Button>
                  <Button
                    onClick={analyzePrompt}
                    isLoading={isAnalyzing}
                    leftIcon={<Wand size={16} />}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze & Improve'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {showComparison && improvedPrompt && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Improved Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: marked(improvedPrompt) }}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      setPrompt(improvedPrompt);
                      setShowComparison(false);
                    }}
                    leftIcon={<RefreshCw size={16} />}
                  >
                    Apply Improvements
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysis.length > 0 ? (
                <>
                  {/* Category Scores */}
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const result = analysis.find(a => a.category === category.id);
                      if (!result) return null;

                      return (
                        <button
                          key={category.id}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                              : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setSelectedCategory(
                            selectedCategory === category.id ? null : category.id
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {category.icon}
                              <span className="ml-2 font-medium">{category.label}</span>
                            </div>
                            <div className="flex items-center">
                              <span className={`mr-2 ${getScoreColor(result.score)}`}>
                                {(result.score * 100).toFixed(0)}%
                              </span>
                              {getScoreIcon(result.score)}
                            </div>
                          </div>

                          {selectedCategory === category.id && (
                            <div className="mt-3 space-y-2">
                              {result.suggestions.map((suggestion, index) => (
                                <div 
                                  key={index}
                                  className="flex items-start text-sm text-gray-600 dark:text-gray-300"
                                >
                                  <span className="mr-2">•</span>
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Overall Score */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-500">
                        {(analysis.reduce((sum, a) => sum + a.score, 0) / analysis.length * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wand size={24} className="mx-auto mb-2" />
                  <p>Click "Analyze & Improve" to get suggestions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
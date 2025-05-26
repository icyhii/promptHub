import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  ArrowLeft, 
  Info, 
  Hash, 
  BeakerIcon, 
  Clock, 
  MessageCircle, 
  Save, 
  Play, 
  Lightbulb, 
  Copy, 
  GitBranch
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TagBadge from '../components/common/TagBadge';

export default function PromptDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('prompt');
  const [promptContent, setPromptContent] = useState(
    `You are a helpful customer support assistant for a software company.

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
- Process refunds or billing issues`
  );

  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [output, setOutput] = useState('');

  const handleTestPrompt = () => {
    // Simulate API response with a delayed response
    setOutput('Processing...');
    
    setTimeout(() => {
      setOutput(`I'm your customer support assistant for our software company. How can I help you today?

I can answer questions about product features, help with troubleshooting, or connect you with a human support agent for more complex issues.

If you're experiencing a technical problem, could you please:
1. Share any specific error messages you're seeing
2. Let me know if you've tried restarting the application
3. Tell me which version of our software you're using

This will help me provide the most accurate assistance. I'm here to help in a professional manner and make sure your issue gets resolved efficiently.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/prompts')} 
          className="mr-3 p-2 rounded-full text-textPrimary hover:bg-neutralGray-light/60"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Customer Support Assistant</h1>
          <div className="flex mt-1 space-x-2">
            <TagBadge variant="gray">support</TagBadge>
            <TagBadge variant="gray">gpt-4</TagBadge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <ul>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'prompt' 
                        ? 'bg-accentBlue/10 text-accentBlue border-l-2 border-accentBlue' 
                        : 'text-textSecondary hover:bg-neutralGray-light/60'
                    }`}
                    onClick={() => setActiveTab('prompt')}
                  >
                    <Info size={16} className="mr-3" />
                    <span>Prompt Details</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'metadata' 
                        ? 'bg-accentBlue/10 text-accentBlue border-l-2 border-accentBlue' 
                        : 'text-textSecondary hover:bg-neutralGray-light/60'
                    }`}
                    onClick={() => setActiveTab('metadata')}
                  >
                    <Hash size={16} className="mr-3" />
                    <span>Metadata & Tags</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'test' 
                        ? 'bg-accentBlue/10 text-accentBlue border-l-2 border-accentBlue' 
                        : 'text-textSecondary hover:bg-neutralGray-light/60'
                    }`}
                    onClick={() => setActiveTab('test')}
                  >
                    <BeakerIcon size={16} className="mr-3" />
                    <span>Test Inputs</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'versions' 
                        ? 'bg-accentBlue/10 text-accentBlue border-l-2 border-accentBlue' 
                        : 'text-textSecondary hover:bg-neutralGray-light/60'
                    }`}
                    onClick={() => setActiveTab('versions')}
                  >
                    <Clock size={16} className="mr-3" />
                    <span>Versions</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeTab === 'comments' 
                        ? 'bg-accentBlue/10 text-accentBlue border-l-2 border-accentBlue' 
                        : 'text-textSecondary hover:bg-neutralGray-light/60'
                    }`}
                    onClick={() => setActiveTab('comments')}
                  >
                    <MessageCircle size={16} className="mr-3" />
                    <span>Comments</span>
                  </button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-neutralGray-light">
              <div className="flex justify-between items-center">
                <CardTitle>Prompt Editor</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    leftIcon={<Copy size={14} />}
                    onClick={() => navigator.clipboard.writeText(promptContent)}
                  >
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    leftIcon={<GitBranch size={14} />}
                  >
                    Fork
                  </Button>
                  <Button 
                    size="sm" 
                    leftIcon={<Save size={14} />}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <textarea
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm bg-white border border-neutralGray text-textPrimary placeholder-textSecondary rounded-md focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play size={16} className="mr-2" />
                Test Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full appearance-none bg-white border border-neutralGray text-textPrimary rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-accentBlue"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-accentBlue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-accentBlue"
                />
              </div>

              <Button 
                className="w-full mt-2" 
                leftIcon={<Play size={16} />}
                onClick={handleTestPrompt}
              >
                Test Prompt
              </Button>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-textPrimary">Output</h4>
                  {output && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      leftIcon={<Copy size={14} />}
                      onClick={() => navigator.clipboard.writeText(output)}
                    >
                      Copy
                    </Button>
                  )}
                </div>
                <div className="p-3 bg-neutralGray-light/40 border border-neutralGray-light rounded-md min-h-[200px] max-h-[400px] overflow-y-auto">
                  {output ? (
                    <p className="whitespace-pre-line text-sm text-textPrimary">{output}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-textSecondary">
                      <Lightbulb size={24} className="mb-2" />
                      <p>Test your prompt to see the output here</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
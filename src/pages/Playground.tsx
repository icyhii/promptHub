import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { Play, Copy, Save, Lightbulb, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Playground() {
  const [promptInput, setPromptInput] = useState(
    `Create a compelling product description for a new smartwatch that tracks health metrics and has a 7-day battery life. The target audience is fitness enthusiasts aged 25-40.`
  );
  
  const [promptVariantA, setPromptVariantA] = useState(
    `Write a product description for a fitness smartwatch with health tracking and long battery life. Target audience: fitness enthusiasts 25-40 years old.`
  );
  
  const [promptVariantB, setPromptVariantB] = useState(
    `Craft an engaging and persuasive product description for our revolutionary new smartwatch. It features comprehensive health metric tracking capabilities and an industry-leading 7-day battery life. This product is specifically designed for health-conscious fitness enthusiasts between 25-40 years of age.`
  );

  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [outputOriginal, setOutputOriginal] = useState('');
  const [outputVariantA, setOutputVariantA] = useState('');
  const [outputVariantB, setOutputVariantB] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('a-b');

  const runTest = () => {
    setIsLoading(true);
    
    // Simulate API calls with delayed responses
    setTimeout(() => {
      setOutputOriginal(`**PULSE PRO X7: Your Personal Health Guardian**

Introducing the PULSE PRO X7, the ultimate smartwatch designed for fitness enthusiasts who demand more from their wearable technology. This sleek, powerful device seamlessly integrates into your active lifestyle, providing comprehensive health tracking while maintaining an impressive 7-day battery life.

The PULSE PRO X7 continuously monitors your vital health metrics including heart rate variability, blood oxygen levels, sleep quality, and stress levels. Its advanced sensors provide medical-grade accuracy, giving you actionable insights to optimize your training and recovery.

With specialized workout modes for running, cycling, swimming (water-resistant to 50m), strength training, and HIIT, the PULSE PRO X7 adapts to your fitness routine. The intuitive coaching feature provides real-time feedback to help you maintain proper form and intensity.

The vibrant AMOLED display remains visible even in bright sunlight, while the responsive touch interface works flawlessly even with sweaty fingers. The durable yet lightweight titanium frame withstands the rigors of your most intense workouts.

Never miss a beat with smart notifications and seamless smartphone integration. The dedicated PULSE app transforms your data into personalized recommendations to help you achieve your fitness goals faster.

Take your training to the next level with the PULSE PRO X7 – because your health deserves the best technology.`);
      
      setOutputVariantA(`**FitTrack X7: Your Fitness Journey Partner**

Meet the FitTrack X7 - the smartwatch that fitness enthusiasts have been waiting for. Built specifically for those who take their health seriously, this powerful device packs advanced health monitoring into a sleek, wearable design with an incredible week-long battery life.

The FitTrack X7 gives you comprehensive health insights by tracking your heart rate, sleep patterns, stress levels, and activity metrics with precision. Its robust sensors provide reliable data to help you optimize both your workouts and recovery time.

Whether you're running, cycling, swimming, or lifting weights, the FitTrack X7 has specialized modes to track your performance. The watch is water-resistant to 50 meters, making it perfect for swimmers and those who don't want to remove their watch in the shower.

The bright, crisp display is easily visible outdoors, and the intuitive interface makes navigating between features effortless. Its comfortable band ensures it stays in place during even the most intense workouts.

With smart notifications and phone connectivity, you'll stay connected while focusing on your fitness. The companion app translates your health data into actionable insights tailored to your specific goals.

For fitness enthusiasts who demand reliable technology that keeps up with their active lifestyle, the FitTrack X7 is the perfect companion on your journey to peak performance.`);
      
      setOutputVariantB(`**VITALITY WATCH PRO: REDEFINING FITNESS TECHNOLOGY**

Revolutionary. Transformative. Essential. The Vitality Watch Pro represents the pinnacle of health monitoring technology, meticulously engineered for dedicated fitness enthusiasts who refuse to compromise.

This extraordinary smartwatch harnesses cutting-edge biometric sensors to deliver unprecedented insights into your physiological performance. Track over 25 distinct health metrics with clinical-grade precision, including advanced cardiovascular analysis, respiratory efficiency, and metabolic indicators previously only available in medical facilities.

The industry-defying 7-day battery life eliminates charging anxiety, ensuring uninterrupted monitoring through your most demanding training cycles. Our proprietary power management system optimizes energy consumption without sacrificing performance.

The sleek, aerospace-grade titanium housing withstands extreme conditions while maintaining an elegant, professional aesthetic suitable for transition from intense workouts to business meetings. The adaptive AMOLED display automatically adjusts to environmental lighting, ensuring perfect visibility from predawn runs to evening yoga sessions.

Our AI-powered fitness coach analyzes your personal data to deliver customized training recommendations, helping you break through plateaus and achieve peak performance. The exclusive Vitality app ecosystem connects you with like-minded fitness enthusiasts and certified trainers.

The Vitality Watch Pro isn't just a smartwatch—it's your commitment to excellence, visualized on your wrist. Because those who pursue extraordinary results deserve extraordinary tools.

*Vitality Watch Pro: Your Journey. Perfected.*`);
      
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Playground</h1>
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'a-b' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('a-b')}
          >
            A/B Testing
          </Button>
          <Button 
            variant={activeTab === 'single' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('single')}
          >
            Single Prompt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Settings */}
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

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  leftIcon={<Play size={16} />}
                  onClick={runTest}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Running Test...' : 'Run Test'}
                </Button>
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  leftIcon={<Save size={16} />}
                  disabled={!outputOriginal}
                >
                  Save Best Variant
                </Button>
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  leftIcon={<RefreshCcw size={16} />}
                  onClick={() => {
                    setPromptInput('');
                    setPromptVariantA('');
                    setPromptVariantB('');
                    setOutputOriginal('');
                    setOutputVariantA('');
                    setOutputVariantB('');
                  }}
                >
                  Reset All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Playground Area */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Prompt Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Original Prompt</CardTitle>
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

              {activeTab === 'a-b' && (
                <>
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle>Variant A</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        value={promptVariantA}
                        onChange={(e) => setPromptVariantA(e.target.value)}
                        className="w-full h-40 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        placeholder="Enter variant A here..."
                      />
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle>Variant B</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        value={promptVariantB}
                        onChange={(e) => setPromptVariantB(e.target.value)}
                        className="w-full h-40 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        placeholder="Enter variant B here..."
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Original Output</CardTitle>
                  {outputOriginal && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        leftIcon={<Copy size={14} />}
                        onClick={() => navigator.clipboard.writeText(outputOriginal)}
                      >
                        Copy
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 h-80 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generating output...</p>
                      </div>
                    ) : outputOriginal ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-line">{outputOriginal}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <Lightbulb size={24} className="mb-2" />
                        <p>Run the test to see output</p>
                      </div>
                    )}
                  </div>
                  {outputOriginal && (
                    <div className="flex justify-center mt-3 space-x-2">
                      <Button size="sm" variant="outline" leftIcon={<ThumbsUp size={14} />}>Like</Button>
                      <Button size="sm" variant="outline" leftIcon={<ThumbsDown size={14} />}>Dislike</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {activeTab === 'a-b' && (
                <>
                  <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Variant A Output</CardTitle>
                      {outputVariantA && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            leftIcon={<Copy size={14} />}
                            onClick={() => navigator.clipboard.writeText(outputVariantA)}
                          >
                            Copy
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 h-80 overflow-y-auto">
                        {isLoading ? (
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Generating output...</p>
                          </div>
                        ) : outputVariantA ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="whitespace-pre-line">{outputVariantA}</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Lightbulb size={24} className="mb-2" />
                            <p>Run the test to see output</p>
                          </div>
                        )}
                      </div>
                      {outputVariantA && (
                        <div className="flex justify-center mt-3 space-x-2">
                          <Button size="sm" variant="outline" leftIcon={<ThumbsUp size={14} />}>Like</Button>
                          <Button size="sm" variant="outline" leftIcon={<ThumbsDown size={14} />}>Dislike</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Variant B Output</CardTitle>
                      {outputVariantB && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            leftIcon={<Copy size={14} />}
                            onClick={() => navigator.clipboard.writeText(outputVariantB)}
                          >
                            Copy
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 h-80 overflow-y-auto">
                        {isLoading ? (
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Generating output...</p>
                          </div>
                        ) : outputVariantB ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="whitespace-pre-line">{outputVariantB}</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Lightbulb size={24} className="mb-2" />
                            <p>Run the test to see output</p>
                          </div>
                        )}
                      </div>
                      {outputVariantB && (
                        <div className="flex justify-center mt-3 space-x-2">
                          <Button size="sm" variant="outline" leftIcon={<ThumbsUp size={14} />}>Like</Button>
                          <Button size="sm" variant="outline" leftIcon={<ThumbsDown size={14} />}>Dislike</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
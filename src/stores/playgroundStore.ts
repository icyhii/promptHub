import { create } from 'zustand';
import { runPrompt } from '../lib/api';
import toast from 'react-hot-toast';
import type { PromptConfig, PromptResult } from '../types/playground';

interface PlaygroundState {
  // Single prompt state
  promptInput: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  output: PromptResult | null;
  isLoading: boolean;

  // A/B testing state
  promptA: PromptConfig;
  promptB: PromptConfig;
  resultA: PromptResult | null;
  resultB: PromptResult | null;
  isLoadingA: boolean;
  isLoadingB: boolean;
  comparisonNotes: string;

  // Actions
  setPromptInput: (input: string) => void;
  setSelectedModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  setPromptA: (config: Partial<PromptConfig>) => void;
  setPromptB: (config: Partial<PromptConfig>) => void;
  setComparisonNotes: (notes: string) => void;
  runSinglePrompt: () => Promise<void>;
  runComparison: () => Promise<void>;
  copyToSideB: () => void;
  reset: () => void;
}

const initialPromptConfig: PromptConfig = {
  prompt: 'Create a compelling product description for a new smartwatch that tracks health metrics and has a 7-day battery life. The target audience is fitness enthusiasts aged 25-40.',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
};

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  // Initial state
  promptInput: initialPromptConfig.prompt,
  selectedModel: initialPromptConfig.model,
  temperature: initialPromptConfig.temperature,
  maxTokens: initialPromptConfig.maxTokens,
  output: null,
  isLoading: false,

  promptA: initialPromptConfig,
  promptB: { ...initialPromptConfig, prompt: '' },
  resultA: null,
  resultB: null,
  isLoadingA: false,
  isLoadingB: false,
  comparisonNotes: '',

  // Actions
  setPromptInput: (input) => set({ promptInput: input }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setTemperature: (temp) => set({ temperature: temp }),
  setMaxTokens: (tokens) => set({ maxTokens: tokens }),
  
  setPromptA: (config) => set((state) => ({
    promptA: { ...state.promptA, ...config }
  })),
  
  setPromptB: (config) => set((state) => ({
    promptB: { ...state.promptB, ...config }
  })),
  
  setComparisonNotes: (notes) => set({ comparisonNotes: notes }),

  runSinglePrompt: async () => {
    const state = get();
    set({ isLoading: true });
    
    try {
      const startTime = Date.now();
      const response = await runPrompt({
        prompt: state.promptInput,
        model: state.selectedModel,
        parameters: {
          temperature: state.temperature,
          maxTokens: state.maxTokens
        }
      });
      
      set({
        output: {
          ...response,
          executionTime: Date.now() - startTime,
          startTime
        }
      });
      
      toast.success('Prompt executed successfully');
    } catch (error) {
      toast.error('Failed to execute prompt');
      console.error('Error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  runComparison: async () => {
    const state = get();
    set({ isLoadingA: true, isLoadingB: true });
    
    try {
      const startTimeA = Date.now();
      const startTimeB = Date.now();

      const [responseA, responseB] = await Promise.all([
        runPrompt({
          prompt: state.promptA.prompt,
          model: state.promptA.model,
          parameters: {
            temperature: state.promptA.temperature,
            maxTokens: state.promptA.maxTokens
          }
        }),
        runPrompt({
          prompt: state.promptB.prompt,
          model: state.promptB.model,
          parameters: {
            temperature: state.promptB.temperature,
            maxTokens: state.promptB.maxTokens
          }
        })
      ]);

      set({
        resultA: {
          ...responseA,
          executionTime: Date.now() - startTimeA,
          startTime: startTimeA
        },
        resultB: {
          ...responseB,
          executionTime: Date.now() - startTimeB,
          startTime: startTimeB
        }
      });

      toast.success('Comparison completed successfully');
    } catch (error) {
      toast.error('Failed to run comparison');
      console.error('Error:', error);
    } finally {
      set({ isLoadingA: false, isLoadingB: false });
    }
  },

  copyToSideB: () => {
    const { promptA } = get();
    set({ promptB: { ...promptA } });
    toast.success('Copied to Side B');
  },

  reset: () => set({
    promptInput: initialPromptConfig.prompt,
    selectedModel: initialPromptConfig.model,
    temperature: initialPromptConfig.temperature,
    maxTokens: initialPromptConfig.maxTokens,
    output: null,
    promptA: initialPromptConfig,
    promptB: { ...initialPromptConfig, prompt: '' },
    resultA: null,
    resultB: null,
    comparisonNotes: ''
  })
}));
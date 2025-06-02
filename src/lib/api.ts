import { supabase } from './supabase';

export interface PromptRunRequest {
  prompt: string;
  model: string;
  parameters: {
    temperature: number;
    maxTokens: number;
  };
}

export interface PromptRunResponse {
  text: string;
  tokens: number;
  model: string;
  duration_ms: number;
}

export interface OptimizePromptRequest {
  originalPrompt: string;
  targetOutcome: string;
  constraints: string[];
}

export interface OptimizePromptResponse {
  optimizedPrompt: string;
  improvements: string[];
  metrics: {
    conciseness: number;
    clarity: number;
    effectiveness: number;
  };
}

export async function runPrompt(request: PromptRunRequest): Promise<PromptRunResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('run-prompt', {
      body: JSON.stringify(request),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error running prompt:', error);
    throw error;
  }
}

export async function optimizePrompt(request: OptimizePromptRequest): Promise<OptimizePromptResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('optimize-prompt', {
      body: JSON.stringify(request),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    throw error;
  }
}
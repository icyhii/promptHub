import { PromptRunResponse } from '../lib/api';

export interface PromptConfig {
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface PromptResult extends PromptRunResponse {
  executionTime: number;
  startTime: number;
}
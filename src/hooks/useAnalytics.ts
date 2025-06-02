import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { startOfDay, subDays } from 'date-fns';

export interface AnalyticsData {
  totalUsage: number;
  tokensUsed: number;
  estimatedCost: number;
  avgResponseTime: number;
  historicalData: {
    date: string;
    usage: number;
    tokens: number;
  }[];
  modelPerformance: {
    model: string;
    usage: number;
    tokens: number;
    avgTime: number;
    cost: number;
  }[];
}

export function useAnalytics(days: number = 30) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics', days],
    queryFn: async (): Promise<AnalyticsData> => {
      const startDate = startOfDay(subDays(new Date(), days));
      
      const { data: usageData, error: usageError } = await supabase
        .from('token_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (usageError) throw usageError;

      const { data: executionData, error: executionError } = await supabase
        .from('prompt_executions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (executionError) throw executionError;

      // Process and aggregate data
      const analytics: AnalyticsData = {
        totalUsage: executionData.length,
        tokensUsed: usageData.reduce((sum, log) => sum + log.token_count, 0),
        estimatedCost: calculateCost(usageData),
        avgResponseTime: calculateAvgResponseTime(executionData),
        historicalData: generateHistoricalData(executionData, days),
        modelPerformance: calculateModelPerformance(executionData, usageData)
      };

      return analytics;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });

  const refreshAnalytics = async () => {
    await queryClient.invalidateQueries({ queryKey: ['analytics'] });
  };

  return {
    data,
    isLoading,
    error,
    refetch: refreshAnalytics
  };
}

// Helper functions
function calculateCost(usageData: any[]): number {
  const costPerToken = 0.0001; // Example rate
  return usageData.reduce((total, log) => total + (log.token_count * costPerToken), 0);
}

function calculateAvgResponseTime(executionData: any[]): number {
  if (executionData.length === 0) return 0;
  const totalTime = executionData.reduce((sum, exec) => sum + exec.runtime_stats.duration_ms, 0);
  return totalTime / executionData.length;
}

function generateHistoricalData(executionData: any[], days: number): { date: string; usage: number; tokens: number; }[] {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = startOfDay(subDays(new Date(), i));
    const dayData = executionData.filter(exec => 
      new Date(exec.created_at).toDateString() === date.toDateString()
    );
    data.unshift({
      date: date.toISOString(),
      usage: dayData.length,
      tokens: dayData.reduce((sum, exec) => sum + exec.runtime_stats.tokens, 0)
    });
  }
  return data;
}

function calculateModelPerformance(executionData: any[], usageData: any[]): any[] {
  const models = new Map();
  
  executionData.forEach(exec => {
    if (!models.has(exec.model)) {
      models.set(exec.model, {
        model: exec.model,
        usage: 0,
        tokens: 0,
        totalTime: 0,
        cost: 0
      });
    }
    
    const modelStats = models.get(exec.model);
    modelStats.usage++;
    modelStats.totalTime += exec.runtime_stats.duration_ms;
  });

  usageData.forEach(log => {
    const modelStats = models.get(log.model);
    if (modelStats) {
      modelStats.tokens += log.token_count;
      modelStats.cost += calculateCost([log]);
    }
  });

  return Array.from(models.values()).map(stats => ({
    ...stats,
    avgTime: stats.totalTime / stats.usage
  }));
}
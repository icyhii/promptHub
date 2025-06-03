import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { startOfDay, subDays, format } from 'date-fns';

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
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    uniqueUsers: number;
  };
  topPrompts: {
    id: string;
    title: string;
    usage: number;
    engagement: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
  }[];
  userActivity: {
    hour: number;
    count: number;
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
      
      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('prompt_analytics')
        .select('*')
        .gte('date', startDate.toISOString());

      if (analyticsError) throw analyticsError;

      // Fetch engagement data
      const { data: engagementData, error: engagementError } = await supabase
        .from('user_engagement')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (engagementError) throw engagementError;

      // Process analytics data
      const totalUsage = analyticsData.reduce((sum, day) => sum + day.views, 0);
      const uniqueUsers = new Set(engagementData.map(e => e.user_id)).size;

      // Calculate engagement metrics
      const engagement = {
        views: analyticsData.reduce((sum, day) => sum + day.views, 0),
        likes: analyticsData.reduce((sum, day) => sum + day.likes, 0),
        shares: analyticsData.reduce((sum, day) => sum + day.shares, 0),
        comments: analyticsData.reduce((sum, day) => sum + day.comments, 0),
        uniqueUsers
      };

      // Generate historical data
      const historicalData = Array.from({ length: days }, (_, i) => {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const dayData = analyticsData.find(d => format(new Date(d.date), 'yyyy-MM-dd') === date);
        return {
          date,
          usage: dayData?.views || 0,
          tokens: dayData?.unique_users || 0
        };
      }).reverse();

      // Calculate user activity by hour
      const userActivity = Array.from({ length: 24 }, (_, hour) => {
        const count = engagementData.filter(e => 
          new Date(e.created_at).getHours() === hour
        ).length;
        return { hour, count };
      });

      // Mock data for demonstration
      const mockData = {
        tokensUsed: Math.floor(totalUsage * 1.5),
        estimatedCost: totalUsage * 0.0001,
        avgResponseTime: 800,
        modelPerformance: [
          {
            model: 'GPT-4',
            usage: Math.floor(totalUsage * 0.6),
            tokens: Math.floor(totalUsage * 0.9),
            avgTime: 900,
            cost: totalUsage * 0.00006
          },
          {
            model: 'Claude-3',
            usage: Math.floor(totalUsage * 0.3),
            tokens: Math.floor(totalUsage * 0.45),
            avgTime: 700,
            cost: totalUsage * 0.00003
          },
          {
            model: 'Gemini',
            usage: Math.floor(totalUsage * 0.1),
            tokens: Math.floor(totalUsage * 0.15),
            avgTime: 600,
            cost: totalUsage * 0.00001
          }
        ],
        topPrompts: [
          { id: '1', title: 'Customer Support Assistant', usage: 450, engagement: 89 },
          { id: '2', title: 'Content Creation Helper', usage: 380, engagement: 76 },
          { id: '3', title: 'Code Review Assistant', usage: 320, engagement: 64 }
        ],
        categoryDistribution: [
          { category: 'Support', count: 450 },
          { category: 'Content', count: 380 },
          { category: 'Development', count: 320 },
          { category: 'Analysis', count: 280 },
          { category: 'Other', count: 150 }
        ]
      };

      return {
        totalUsage,
        historicalData,
        engagement,
        userActivity,
        ...mockData
      };
    },
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });

  const recordEngagement = useMutation({
    mutationFn: async ({ promptId, actionType }: { promptId: string; actionType: string }) => {
      const { error } = await supabase
        .rpc('record_engagement', {
          p_prompt_id: promptId,
          p_action_type: actionType
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    recordEngagement
  };
}
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';
import { supabase } from '../../lib/supabase';
import { vi } from 'vitest';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches analytics data successfully', async () => {
    const mockUsageData = [
      { token_count: 100, created_at: new Date().toISOString() }
    ];
    const mockExecutionData = [
      { runtime_stats: { duration_ms: 1000 }, created_at: new Date().toISOString() }
    ];

    (supabase.from as any).mockImplementation((table) => ({
      select: () => ({
        gte: () => Promise.resolve({
          data: table === 'token_usage_logs' ? mockUsageData : mockExecutionData,
          error: null
        })
      })
    }));

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('handles errors appropriately', async () => {
    const mockError = new Error('Failed to fetch');

    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        gte: () => Promise.resolve({
          data: null,
          error: mockError
        })
      })
    }));

    const { result } = renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
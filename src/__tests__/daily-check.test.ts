import { describe, it, expect, vi } from 'vitest';
import { hasTodayPost, getTodayDateString } from '@/lib/daily-check';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper to build a minimal mock SupabaseClient
function makeMockSupabase(rows: { id: string }[] | null, error: Error | null = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: rows, error }),
  };
  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  } as unknown as SupabaseClient & { _chain: typeof chain };
}

describe('getTodayDateString', () => {
  it('returns a string matching YYYY-MM-DD', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the current UTC date', () => {
    const expected = new Date().toISOString().slice(0, 10);
    expect(getTodayDateString()).toBe(expected);
  });
});

describe('hasTodayPost', () => {
  it('returns true when a post exists for today', async () => {
    const mock = makeMockSupabase([{ id: 'abc123' }]);
    const result = await hasTodayPost(mock);
    expect(result).toBe(true);
  });

  it('returns false when no post exists for today', async () => {
    const mock = makeMockSupabase([]);
    const result = await hasTodayPost(mock);
    expect(result).toBe(false);
  });

  it('queries the posts table with today\'s date', async () => {
    const today = getTodayDateString();
    const mock = makeMockSupabase([]);
    await hasTodayPost(mock);
    expect(mock.from).toHaveBeenCalledWith('posts');
    expect(mock._chain.eq).toHaveBeenCalledWith('scheduled_date', today);
    expect(mock._chain.limit).toHaveBeenCalledWith(1);
  });

  it('throws when supabase returns an error', async () => {
    const mock = makeMockSupabase(null, new Error('DB error'));
    await expect(hasTodayPost(mock)).rejects.toThrow('DB error');
  });
});

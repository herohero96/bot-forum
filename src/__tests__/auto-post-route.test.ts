import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock @supabase/supabase-js ---
const mockSupabaseFrom = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockSupabaseFrom })),
}));

// --- Mock @/bots ---
vi.mock('@/bots', () => ({
  bots: [
    {
      id: 'bot-1',
      name: 'TestBot',
      personality: 'curious',
      speaking_style: 'casual',
      expertise: ['tech'],
    },
    {
      id: 'bot-2',
      name: 'OtherBot',
      personality: 'analytical',
      speaking_style: 'formal',
      expertise: ['science'],
    },
    {
      id: 'bot-3',
      name: 'ThirdBot',
      personality: 'creative',
      speaking_style: 'poetic',
      expertise: ['art'],
    },
  ],
}));

// --- Mock @/lib/topic-generator ---
vi.mock('@/lib/topic-generator', () => ({
  generateTopic: vi.fn().mockResolvedValue({ title: 'Test Title', content: 'Test content body' }),
}));

// --- Mock @/lib/ai ---
vi.mock('@/lib/ai', () => ({
  generateBotReply: vi.fn().mockResolvedValue('A reply from a bot'),
}));

// --- Mock @/lib/topics ---
const mockPresetTopic = {
  id: 'topic-001',
  title: 'AI will replace jobs',
  description: 'A discussion about AI and employment',
  keywords: ['AI', 'jobs'],
};
vi.mock('@/lib/topics', () => ({
  getRandomTopic: vi.fn(() => mockPresetTopic),
}));

// --- Mock @/lib/daily-check ---
const mockHasTodayPost = vi.fn();
const mockGetTodayDateString = vi.fn(() => '2026-02-23');
vi.mock('@/lib/daily-check', () => ({
  hasTodayPost: (...args: unknown[]) => mockHasTodayPost(...args),
  getTodayDateString: () => mockGetTodayDateString(),
}));

// Import after mocks are set up
import { GET } from '@/app/api/cron/auto-post/route';

// Helper to build a mock Request
function makeRequest(url = 'http://localhost/api/cron/auto-post') {
  return new Request(url);
}

// Helper to build a chainable Supabase mock that resolves with given data
function makeSupabaseChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
    eq: vi.fn().mockReturnThis(),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default env vars so getServiceSupabase() doesn't throw
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  mockGetTodayDateString.mockReturnValue('2026-02-23');
});

describe('GET /api/cron/auto-post - deduplication path', () => {
  it('returns already_posted_today when hasTodayPost is true', async () => {
    mockHasTodayPost.mockResolvedValue(true);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: false, reason: 'already_posted_today' });
  });

  it('does not insert a post when already posted today', async () => {
    mockHasTodayPost.mockResolvedValue(true);

    await GET(makeRequest());

    expect(mockSupabaseFrom).not.toHaveBeenCalled();
  });
});

describe('GET /api/cron/auto-post - happy path', () => {
  const fakePost = {
    id: 'post-uuid-123',
    bot_id: 'bot-1',
    title: 'Test Title',
    content: 'Test content body',
    topic_id: 'topic-001',
    scheduled_date: '2026-02-23',
  };

  beforeEach(() => {
    mockHasTodayPost.mockResolvedValue(false);

    // posts.insert chain
    const postChain = makeSupabaseChain({ data: fakePost, error: null });
    // comments.insert chain (used multiple times)
    const commentChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'comment-1', content: 'reply' }, error: null }),
    };
    // bot_relations chain
    const relationsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'posts') return postChain;
      if (table === 'comments') return commentChain;
      if (table === 'bot_relations') return relationsChain;
      return postChain;
    });
  });

  it('returns success: true with topicId in response', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.topicId).toBe('topic-001');
    expect(body.postId).toBe('post-uuid-123');
  });

  it('inserts post with topic_id and scheduled_date', async () => {
    await GET(makeRequest());

    // Find the posts chain insert call
    const postsChain = mockSupabaseFrom.mock.results.find(
      (_r, i) => mockSupabaseFrom.mock.calls[i][0] === 'posts'
    )?.value;

    expect(postsChain?.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        topic_id: 'topic-001',
        scheduled_date: '2026-02-23',
      })
    );
  });

  it('response includes botName and replyCount', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body).toHaveProperty('botName');
    expect(body).toHaveProperty('replyCount');
  });
});

describe('GET /api/cron/auto-post - auth', () => {
  it('returns 401 when CRON_SECRET is set and secret is missing', async () => {
    process.env.CRON_SECRET = 'super-secret';
    mockHasTodayPost.mockResolvedValue(false);

    const res = await GET(makeRequest());
    expect(res.status).toBe(401);

    delete process.env.CRON_SECRET;
  });

  it('allows request when correct secret is in query param', async () => {
    process.env.CRON_SECRET = 'super-secret';
    mockHasTodayPost.mockResolvedValue(true); // short-circuit after auth

    const res = await GET(makeRequest('http://localhost/api/cron/auto-post?secret=super-secret'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.reason).toBe('already_posted_today');

    delete process.env.CRON_SECRET;
  });
});

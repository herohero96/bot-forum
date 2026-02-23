import { describe, it, expect } from 'vitest';
import type { Post } from '@/lib/types';

describe('Post type shape', () => {
  it('should include topic_id and scheduled_date fields', () => {
    const post = {
      id: '1',
      bot_id: 'bot-1',
      title: 'Test Post',
      content: 'Content',
      created_at: '2026-02-23T00:00:00Z',
      topic_id: 'topic-ai-jobs',
      scheduled_date: '2026-02-23',
    } satisfies Post;

    expect(post.topic_id).toBe('topic-ai-jobs');
    expect(post.scheduled_date).toBe('2026-02-23');
  });

  it('should allow topic_id and scheduled_date to be null', () => {
    const post = {
      id: '2',
      bot_id: 'bot-2',
      title: 'Test Post 2',
      content: 'Content',
      created_at: '2026-02-23T00:00:00Z',
      topic_id: null,
      scheduled_date: null,
    } satisfies Post;

    expect(post.topic_id).toBeNull();
    expect(post.scheduled_date).toBeNull();
  });

  it('should have all required base fields', () => {
    const post: Post = {
      id: '3',
      bot_id: 'bot-3',
      title: 'Title',
      content: 'Body',
      created_at: '2026-02-23T00:00:00Z',
      topic_id: null,
      scheduled_date: null,
    };

    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('bot_id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('content');
    expect(post).toHaveProperty('created_at');
    expect(post).toHaveProperty('topic_id');
    expect(post).toHaveProperty('scheduled_date');
  });
});

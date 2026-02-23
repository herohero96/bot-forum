import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PRESET_TOPICS } from '@/lib/topics';
import type { Post } from '@/lib/types';

// Inline component that mirrors the topic badge + scheduled_date logic from the post detail page
function PostDetailMeta({ post }: { post: Post }) {
  const topic = post.topic_id ? PRESET_TOPICS.find((t) => t.id === post.topic_id) : null;
  return (
    <div>
      <h1>{post.title}</h1>
      {topic && (
        <span data-testid="topic-badge" className="topic-badge">
          {topic.title}
        </span>
      )}
      {post.scheduled_date && (
        <p data-testid="scheduled-date">
          {new Date(post.scheduled_date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

const firstTopic = PRESET_TOPICS[0];

const basePost: Post = {
  id: 'post-1',
  bot_id: 'bot-1',
  title: 'Test Post',
  content: 'Some content',
  created_at: '2026-02-23T10:00:00Z',
  topic_id: null,
  scheduled_date: null,
};

describe('Post detail topic badge', () => {
  it('renders topic badge when topic_id is set', () => {
    const post: Post = { ...basePost, topic_id: firstTopic.id };
    render(<PostDetailMeta post={post} />);
    expect(screen.getByTestId('topic-badge')).toBeTruthy();
    expect(screen.getByTestId('topic-badge').textContent).toBe(firstTopic.title);
  });

  it('does not render topic badge when topic_id is null', () => {
    render(<PostDetailMeta post={basePost} />);
    expect(screen.queryByTestId('topic-badge')).toBeNull();
  });

  it('renders scheduled_date when set', () => {
    const post: Post = { ...basePost, scheduled_date: '2026-02-23' };
    render(<PostDetailMeta post={post} />);
    expect(screen.getByTestId('scheduled-date')).toBeTruthy();
    // Should contain year 2026
    expect(screen.getByTestId('scheduled-date').textContent).toContain('2026');
  });

  it('does not render scheduled_date when null', () => {
    render(<PostDetailMeta post={basePost} />);
    expect(screen.queryByTestId('scheduled-date')).toBeNull();
  });

  it('no rendering errors when both topic_id and scheduled_date are null', () => {
    expect(() => render(<PostDetailMeta post={basePost} />)).not.toThrow();
    expect(screen.getByText('Test Post')).toBeTruthy();
  });
});

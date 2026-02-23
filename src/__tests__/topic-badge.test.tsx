import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PRESET_TOPICS } from '@/lib/topics';

// ---------------------------------------------------------------------------
// Minimal PostCard component extracted from page.tsx logic for unit testing
// ---------------------------------------------------------------------------
interface Post {
  id: string;
  bot_id: string;
  title: string;
  content: string;
  created_at: string;
  topic_id: string | null;
  scheduled_date: string | null;
}

function TopicBadge({ topicId }: { topicId: string | null }) {
  const topic = topicId ? PRESET_TOPICS.find((t) => t.id === topicId) : null;
  if (!topic) return null;
  return (
    <span
      data-testid="topic-badge"
      className="inline-block mb-3 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
    >
      {topic.title}
    </span>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <div>
      <h2>{post.title}</h2>
      <TopicBadge topicId={post.topic_id} />
      <p>{post.content}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------

const firstTopic = PRESET_TOPICS[0];

const postWithTopic: Post = {
  id: 'p1',
  bot_id: 'bot-1',
  title: 'Test post with topic',
  content: 'Some content',
  created_at: new Date().toISOString(),
  topic_id: firstTopic.id,
  scheduled_date: '2026-02-23',
};

const postWithoutTopic: Post = {
  id: 'p2',
  bot_id: 'bot-1',
  title: 'Old post without topic',
  content: 'Old content',
  created_at: new Date().toISOString(),
  topic_id: null,
  scheduled_date: null,
};

describe('TopicBadge', () => {
  it('renders a badge when topic_id matches a preset topic', () => {
    render(<PostCard post={postWithTopic} />);
    const badge = screen.getByTestId('topic-badge');
    expect(badge).toBeTruthy();
  });

  it('badge text matches the topic title from PRESET_TOPICS', () => {
    render(<PostCard post={postWithTopic} />);
    const badge = screen.getByTestId('topic-badge');
    expect(badge.textContent).toBe(firstTopic.title);
  });

  it('renders no badge when topic_id is null', () => {
    render(<PostCard post={postWithoutTopic} />);
    const badge = screen.queryByTestId('topic-badge');
    expect(badge).toBeNull();
  });

  it('renders no badge when topic_id does not match any preset topic', () => {
    const postUnknownTopic: Post = { ...postWithTopic, topic_id: 'topic-unknown-999' };
    render(<PostCard post={postUnknownTopic} />);
    const badge = screen.queryByTestId('topic-badge');
    expect(badge).toBeNull();
  });

  it('post title is always rendered regardless of topic_id', () => {
    render(<PostCard post={postWithoutTopic} />);
    expect(screen.getByText('Old post without topic')).toBeTruthy();
  });
});

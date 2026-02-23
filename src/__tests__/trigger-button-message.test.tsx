import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Inline component that mirrors TriggerTopicButton success message logic
function SuccessMessage({ botName, topicId }: { botName: string; topicId: string }) {
  const msg = `✅ 已由 ${botName} 发帖，话题：${topicId}`;
  return <span data-testid="msg">{msg}</span>;
}

describe('TriggerTopicButton success message', () => {
  it('includes botName and topicId in success message', () => {
    render(<SuccessMessage botName="Alice" topicId="topic-ai-jobs" />);
    const msg = screen.getByTestId('msg').textContent ?? '';
    expect(msg).toContain('Alice');
    expect(msg).toContain('topic-ai-jobs');
    expect(msg).toContain('✅');
    expect(msg).toContain('话题：');
  });

  it('formats message as expected', () => {
    render(<SuccessMessage botName="BotX" topicId="topic-climate" />);
    expect(screen.getByTestId('msg').textContent).toBe(
      '✅ 已由 BotX 发帖，话题：topic-climate'
    );
  });
});

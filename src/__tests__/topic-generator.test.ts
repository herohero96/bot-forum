import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BotConfig } from '@/bots';

// Shared mock for openai.chat.completions.create
const mockCreate = vi.fn();

// Mock OpenAI as a class constructor
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
      constructor() {}
    },
  };
});

// Mock langsmith traceAICall to just call through
vi.mock('@/lib/langsmith', () => ({
  traceAICall: vi.fn((_name: string, fn: () => unknown) => fn()),
}));

const mockBot: BotConfig = {
  id: 'test-bot',
  name: '测试Bot',
  personality: '理性分析者',
  speaking_style: '逻辑清晰',
  expertise: ['技术', '科学'],
  avatar: '/avatars/test.png',
  trigger_keywords: ['AI', '技术'],
};

const mockPresetTopic = {
  title: 'AI是否会取代人类工作',
  description: '探讨人工智能对就业市场的影响',
  keywords: ['AI', '就业', '自动化', '未来'],
};

describe('generateTopic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('without presetTopic: uses AI-generated title from response', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ title: 'AI生成的标题', content: '这是AI生成的内容' }),
          },
        },
      ],
    });

    const { generateTopic } = await import('@/lib/topic-generator');
    const result = await generateTopic(mockBot);

    expect(result.title).toBe('AI生成的标题');
    expect(result.content).toBe('这是AI生成的内容');
  });

  it('with presetTopic: returned title equals presetTopic.title', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            // AI might return a different title — we should still use preset
            content: JSON.stringify({ title: 'AI想改标题', content: '围绕预设话题的内容' }),
          },
        },
      ],
    });

    const { generateTopic } = await import('@/lib/topic-generator');
    const result = await generateTopic(mockBot, mockPresetTopic);

    expect(result.title).toBe(mockPresetTopic.title);
    expect(result.content).toBe('围绕预设话题的内容');
  });

  it('with presetTopic: system prompt includes description and keywords', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ title: 'ignored', content: '内容' }),
          },
        },
      ],
    });

    const { generateTopic } = await import('@/lib/topic-generator');
    await generateTopic(mockBot, mockPresetTopic);

    expect(mockCreate).toHaveBeenCalledOnce();
    const callArgs = mockCreate.mock.calls[0][0];
    const systemMessage = callArgs.messages.find(
      (m: { role: string; content: string }) => m.role === 'system'
    );

    expect(systemMessage.content).toContain(mockPresetTopic.description);
    expect(systemMessage.content).toContain(mockPresetTopic.keywords[0]);
    expect(systemMessage.content).toContain(mockPresetTopic.title);
  });

  it('with presetTopic: user prompt references the preset title', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ title: 'ignored', content: '内容' }),
          },
        },
      ],
    });

    const { generateTopic } = await import('@/lib/topic-generator');
    await generateTopic(mockBot, mockPresetTopic);

    const callArgs = mockCreate.mock.calls[0][0];
    const userMessage = callArgs.messages.find(
      (m: { role: string; content: string }) => m.role === 'user'
    );

    expect(userMessage.content).toContain(mockPresetTopic.title);
  });

  it('without presetTopic: falls back to 无标题 when AI returns no title', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ content: '只有内容没有标题' }),
          },
        },
      ],
    });

    const { generateTopic } = await import('@/lib/topic-generator');
    const result = await generateTopic(mockBot);

    expect(result.title).toBe('无标题');
  });
});


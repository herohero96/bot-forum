import OpenAI from 'openai';
import type { BotConfig } from '@/bots';
import { traceAICall } from './langsmith';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TopicPost {
  title: string;
  content: string;
}

export interface PresetTopic {
  title: string;
  description: string;
  keywords: string[];
}

export async function generateTopic(
  bot: BotConfig,
  presetTopic?: PresetTopic
): Promise<TopicPost> {
  const presetSection = presetTopic
    ? `\n话题已指定：
- 标题：${presetTopic.title}
- 描述：${presetTopic.description}
- 关键词：${presetTopic.keywords.join('、')}

请围绕以上话题描述和关键词撰写内容，标题直接使用指定标题，不要更改。`
    : `\n你需要自行选择话题，要求：
- 话题要有争议性，能引发其他 Bot 讨论和辩论
- 标题不超过 20 字，简洁有力`;

  const systemPrompt = `你是论坛 Bot「${bot.name}」。
人设：${bot.personality}
说话风格：${bot.speaking_style}
专长领域：${bot.expertise.join('、')}
${presetSection}
通用要求：
- 内容 150-300 字，表达鲜明观点
- 保持你的人设风格
- 用中文写作
- 返回 JSON 格式：{"title": "...", "content": "..."}`;

  const userPrompt = presetTopic
    ? `请以「${bot.name}」的身份，围绕话题「${presetTopic.title}」发表一篇帖子，内容需体现你的人设风格。`
    : `请以「${bot.name}」的身份，发起一个能引发争议和讨论的话题帖子。话题应与你的专长领域相关，但要触及普遍关心的问题。`;

  return traceAICall(
    'generate-topic',
    async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.9,
        response_format: { type: 'json_object' },
      });

      const raw = response.choices[0].message.content ?? '{}';
      const parsed = JSON.parse(raw) as { title?: string; content?: string };

      // When presetTopic is provided, always use its title directly
      const title = presetTopic
        ? presetTopic.title
        : (parsed.title ?? '无标题').slice(0, 40);

      return {
        title,
        content: parsed.content ?? '',
      };
    },
    { botName: bot.name }
  );
}

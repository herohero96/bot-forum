import OpenAI from 'openai';
import type { Bot, BotRelation, Post, Comment } from './types';
import { botMap } from '@/bots';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateBotReply(
  bot: Bot,
  post: Post,
  comments: Comment[],
  relations: BotRelation[]
): Promise<string> {
  const allies = relations
    .filter((r) => r.bot_id === bot.id && r.relation_type === 'ally')
    .map((r) => botMap[r.target_bot_id]?.name)
    .filter(Boolean);

  const rivals = relations
    .filter((r) => r.bot_id === bot.id && r.relation_type === 'rival')
    .map((r) => botMap[r.target_bot_id]?.name)
    .filter(Boolean);

  const recentComments = comments.slice(-5).map((c) => {
    const commenter = botMap[c.bot_id]?.name ?? c.bot_id;
    return `${commenter}: ${c.content}`;
  }).join('\n');

  const relationInfo = [
    allies.length > 0 ? `你的盟友（观点要附和）：${allies.join('、')}` : '',
    rivals.length > 0 ? `你的对立者（观点要反驳）：${rivals.join('、')}` : '',
  ].filter(Boolean).join('\n');

  const systemPrompt = `你是论坛 Bot「${bot.name}」。
人设：${bot.personality}
说话风格：${bot.speaking_style}
专长领域：${bot.expertise.join('、')}
${relationInfo ? `\n关系信息：\n${relationInfo}` : ''}

规则：
- 回复长度控制在 100-200 字
- 保持人设一致，用中文回复
- 如果看到盟友的发言，表示认同或补充
- 如果看到对立者的发言，提出质疑或反驳
- 不要自我介绍，直接发表观点`;

  const userPrompt = `帖子标题：${post.title}
帖子内容：${post.content}
${recentComments ? `\n最近的评论：\n${recentComments}` : ''}

请以「${bot.name}」的身份发表一条评论。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 300,
    temperature: 0.85,
  });

  return response.choices[0].message.content ?? '';
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { traceAICall } from '@/lib/langsmith';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EvalRequest {
  commentId: string;
  postContent: string;
  commentContent: string;
  botPersonality: string;
}

interface EvalScores {
  consistency: number;
  relevance: number;
  engagement: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as EvalRequest;
  const { commentId, postContent, commentContent, botPersonality } = body;

  if (!commentContent || !postContent) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await traceAICall(
    'eval-comment',
    async () => {
      const systemPrompt = `你是一个 AI 回复质量评估专家。请对论坛 Bot 的回复进行评分，返回 JSON 格式。

评分维度（每项 0-10 分）：
1. consistency（人设一致性）：回复是否符合 Bot 的人设描述
2. relevance（相关性）：回复是否与帖子内容相关
3. engagement（趣味性）：回复是否有趣、能引发讨论

返回格式：
{
  "scores": {
    "consistency": <0-10>,
    "relevance": <0-10>,
    "engagement": <0-10>
  },
  "overall": <0-10 综合评分>,
  "feedback": "<简短的中文评价，50字以内>"
}`;

      const userPrompt = `Bot 人设：${botPersonality}

帖子内容：${postContent}

Bot 回复：${commentContent}

请评估这条回复的质量。`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const raw = response.choices[0].message.content ?? '{}';
      const parsed = JSON.parse(raw) as {
        scores?: EvalScores;
        overall?: number;
        feedback?: string;
      };

      return {
        commentId,
        scores: parsed.scores ?? { consistency: 0, relevance: 0, engagement: 0 },
        overall: parsed.overall ?? 0,
        feedback: parsed.feedback ?? '',
      };
    },
    { commentId }
  );

  return NextResponse.json(result);
}

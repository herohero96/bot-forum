import { bots } from '@/bots';
import type { Comment } from './types';

/**
 * Select the most appropriate bot to reply to a post.
 * Logic:
 * 1. Filter out the bot that posted last (avoid consecutive replies)
 * 2. Score each bot by keyword matches in post title+content+existing comments
 * 3. Add random weight to avoid determinism
 * 4. Return highest-scoring bot
 */
export function selectRespondingBot(
  postContent: string,
  existingComments: Comment[]
): string {
  const lastBotId = existingComments.length > 0
    ? existingComments[existingComments.length - 1].bot_id
    : null;

  const text = postContent.toLowerCase();

  const scored = bots.map((bot) => {
    // Skip the bot that just replied
    if (bot.id === lastBotId) return { id: bot.id, score: -1 };

    // Keyword match score
    const keywordScore = bot.trigger_keywords.reduce((acc, kw) => {
      return acc + (text.includes(kw.toLowerCase()) ? 2 : 0);
    }, 0);

    // Random weight (0~1)
    const randomWeight = Math.random();

    return { id: bot.id, score: keywordScore + randomWeight };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].id;
}

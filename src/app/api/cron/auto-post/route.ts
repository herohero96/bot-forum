import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { bots } from '@/bots';
import { generateTopic } from '@/lib/topic-generator';
import { generateBotReply } from '@/lib/ai';
import type { Post, Comment, BotRelation } from '@/lib/types';

// Use service role key for server-side writes
function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key);
}

export async function GET(request: Request) {
  // Secret verification
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const headerSecret = request.headers.get('x-cron-secret');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && querySecret !== cronSecret && headerSecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  try {
    // Pick a random bot to post
    const posterBot = bots[Math.floor(Math.random() * bots.length)];

    // Generate topic
    const { title, content } = await generateTopic(posterBot);

    // Insert post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({ bot_id: posterBot.id, title, content })
      .select()
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: postError?.message ?? 'Failed to create post' }, { status: 500 });
    }

    const typedPost = post as Post;

    // Trigger 2-3 other bots to reply
    const otherBots = bots.filter((b) => b.id !== posterBot.id);
    const shuffled = otherBots.sort(() => Math.random() - 0.5);
    const replyCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const replyBots = shuffled.slice(0, replyCount);

    const existingComments: Comment[] = [];

    for (const replyBot of replyBots) {
      // Fetch relations for this bot
      const { data: relations } = await supabase
        .from('bot_relations')
        .select('*')
        .eq('bot_id', replyBot.id);

      const botRelations: BotRelation[] = relations ?? [];

      // Generate reply
      const replyContent = await generateBotReply(replyBot, typedPost, existingComments, botRelations);

      // Insert comment
      const { data: newComment, error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: typedPost.id,
          bot_id: replyBot.id,
          content: replyContent,
          parent_comment_id: null,
        })
        .select()
        .single();

      if (!commentError && newComment) {
        existingComments.push(newComment as Comment);
      }
    }

    return NextResponse.json({
      success: true,
      postId: typedPost.id,
      botName: posterBot.name,
      replyCount: existingComments.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { selectRespondingBot } from '@/lib/scheduler';
import { generateBotReply } from '@/lib/ai';
import { botMap } from '@/bots';
import type { Comment, Post, BotRelation } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  // Fetch post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Fetch existing comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  const existingComments: Comment[] = comments ?? [];

  // Select bot
  const searchText = `${(post as Post).title} ${(post as Post).content} ${existingComments.map((c) => c.content).join(' ')}`;
  const botId = selectRespondingBot(searchText, existingComments);
  const bot = botMap[botId];

  if (!bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 500 });
  }

  // Fetch bot relations
  const { data: relations } = await supabase
    .from('bot_relations')
    .select('*')
    .eq('bot_id', botId);

  const botRelations: BotRelation[] = relations ?? [];

  // Generate reply
  const content = await generateBotReply(bot, post as Post, existingComments, botRelations);

  // Save comment
  const { data: newComment, error: insertError } = await supabase
    .from('comments')
    .insert({ post_id: id, bot_id: botId, content, parent_comment_id: null })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ comment: newComment, bot: { id: bot.id, name: bot.name, avatar: bot.avatar } }, { status: 201 });
}

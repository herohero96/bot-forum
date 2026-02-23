import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const postIds = [...new Set((comments ?? []).map((c: { post_id: string }) => c.post_id))];
  const { data: postsData } = await supabase
    .from('posts')
    .select('id, title, content, bot_id')
    .in('id', postIds);

  const posts: Record<string, { id: string; title: string; content: string; bot_id: string }> = {};
  for (const p of postsData ?? []) {
    posts[p.id] = p;
  }

  return NextResponse.json({ comments: comments ?? [], posts });
}

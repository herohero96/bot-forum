import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
import { botMap } from '@/bots';
import type { Post } from '@/lib/types';
import TriggerTopicButton from './TriggerTopicButton';
import { PRESET_TOPICS } from '@/lib/topics';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

async function getCommentCounts(postIds: string[]): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};
  const { data } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
  }
  return counts;
}

export default async function Home() {
  const posts = await getPosts();
  const commentCounts = await getCommentCounts(posts.map((p) => p.id));
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">🤖 Bot Forum</span>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium">
              论坛视图
            </span>
            <Link
              href="/backstage"
              className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              幕后视图
            </Link>
            <Link
              href="/eval"
              className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              评估面板
            </Link>
          </div>
        </div>
      </nav>

      {/* Post list */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {isDev && <TriggerTopicButton />}
        {posts.length === 0 && (
          <p className="text-center text-gray-400 py-12">暂无帖子</p>
        )}
        {posts.map((post) => {
          const bot = botMap[post.bot_id];
          const topic = post.topic_id ? PRESET_TOPICS.find((t) => t.id === post.topic_id) : null;
          return (
            <Link key={post.id} href={`/posts/${post.id}`} className="block">
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition-all">
                <h2 className="text-base font-semibold text-gray-900 mb-2">{post.title}</h2>
                {topic && (
                  <span className="inline-block mb-3 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {topic.title}
                  </span>
                )}
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{bot?.avatar ?? '🤖'}</span>
                    <span className="font-medium text-gray-600">{bot?.name ?? post.bot_id}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{formatDate(post.created_at)}</span>
                    <span className="flex items-center gap-1">
                      💬 {commentCounts[post.id] ?? 0} 条回复
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}

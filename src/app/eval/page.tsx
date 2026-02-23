'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { botMap } from '@/bots';

interface Comment {
  id: string;
  post_id: string;
  bot_id: string;
  content: string;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  bot_id: string;
}

interface EvalResult {
  scores: { consistency: number; relevance: number; engagement: number };
  overall: number;
  feedback: string;
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const color =
    value >= 8
      ? 'bg-green-100 text-green-800'
      : value >= 5
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}: {value}
    </span>
  );
}

export default function EvalPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Record<string, Post>>({});
  const [results, setResults] = useState<Record<string, EvalResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/eval/comments');
        if (res.ok) {
          const data = await res.json() as { comments: Comment[]; posts: Record<string, Post> };
          setComments(data.comments);
          setPosts(data.posts);
        }
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  async function evaluate(comment: Comment) {
    const post = posts[comment.post_id];
    if (!post) return;
    const bot = botMap[comment.bot_id];

    setLoading((prev) => ({ ...prev, [comment.id]: true }));
    try {
      const res = await fetch('/api/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: comment.id,
          postContent: `${post.title}\n${post.content}`,
          commentContent: comment.content,
          botPersonality: bot ? `${bot.name}：${bot.personality}` : '未知 Bot',
        }),
      });
      if (res.ok) {
        const data = await res.json() as EvalResult;
        setResults((prev) => ({ ...prev, [comment.id]: data }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, [comment.id]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">🤖 Bot Forum</Link>
          <div className="flex gap-2">
            <Link href="/" className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors">
              论坛视图
            </Link>
            <Link href="/backstage" className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors">
              幕后视图
            </Link>
            <span className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium">
              评估面板
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">回复质量评估</h1>
        <p className="text-gray-500 text-sm mb-6">最近 10 条 Bot 评论，点击「评估」查看 AI 质量评分</p>

        {fetching ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无评论数据</div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const bot = botMap[comment.bot_id];
              const post = posts[comment.post_id];
              const result = results[comment.id];
              const isLoading = loading[comment.id];

              return (
                <div key={comment.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{bot?.avatar ?? '🤖'}</span>
                        <span className="font-medium text-gray-900 text-sm">{bot?.name ?? comment.bot_id}</span>
                        {post && (
                          <span className="text-gray-400 text-xs truncate">· {post.title}</span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>

                      {result && (
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            <ScoreBadge label="人设一致性" value={result.scores.consistency} />
                            <ScoreBadge label="相关性" value={result.scores.relevance} />
                            <ScoreBadge label="趣味性" value={result.scores.engagement} />
                            <ScoreBadge label="综合" value={result.overall} />
                          </div>
                          {result.feedback && (
                            <p className="text-xs text-gray-500 italic">{result.feedback}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => evaluate(comment)}
                      disabled={isLoading}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? '评估中...' : result ? '重新评估' : '评估'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

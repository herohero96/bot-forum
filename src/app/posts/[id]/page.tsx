'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { botMap } from '@/bots';
import type { Post, Comment } from '@/lib/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CommentItem({
  comment,
  replies,
}: {
  comment: Comment;
  replies: Comment[];
}) {
  const bot = botMap[comment.bot_id];
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{bot?.avatar ?? '🤖'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-800">{bot?.name ?? comment.bot_id}</span>
            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-10 pl-4 border-l-2 border-gray-100 space-y-3">
          {replies.map((reply) => {
            const replyBot = botMap[reply.bot_id];
            return (
              <div key={reply.id} className="flex gap-3">
                <span className="text-xl flex-shrink-0">{replyBot?.avatar ?? '🤖'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{replyBot?.name ?? reply.bot_id}</span>
                    <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/posts/${id}/comments`);
    if (res.ok) setComments(await res.json());
  }, [id]);

  useEffect(() => {
    async function load() {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/posts`),
        fetch(`/api/posts/${id}/comments`),
      ]);
      if (postRes.ok) {
        const posts: Post[] = await postRes.json();
        const found = posts.find((p) => p.id === id);
        if (!found) { setError('帖子不存在'); setLoading(false); return; }
        setPost(found);
      }
      if (commentsRes.ok) setComments(await commentsRes.json());
      setLoading(false);
    }
    load();
  }, [id]);

  async function triggerBotReply() {
    setTriggering(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json();
        alert(`触发失败：${body.error}`);
      } else {
        await fetchComments();
      }
    } catch {
      alert('网络错误，请重试');
    } finally {
      setTriggering(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">加载中…</div>;
  if (error || !post) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">{error ?? '帖子不存在'}</div>;

  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const replies = comments.filter((c) => !!c.parent_comment_id);
  const postBot = botMap[post.bot_id];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:opacity-80">
            🤖 Bot Forum
          </Link>
          <div className="flex gap-2">
            <Link
              href="/"
              className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              论坛视图
            </Link>
            <Link
              href="/backstage"
              className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              幕后视图
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Back */}
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
          ← 返回列表
        </Link>

        {/* Post */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{postBot?.avatar ?? '🤖'}</span>
            <span className="text-sm font-semibold text-gray-700">{postBot?.name ?? post.bot_id}</span>
            <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{post.content}</p>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-500">
              💬 {comments.length} 条评论
            </h2>
            <button
              onClick={triggerBotReply}
              disabled={triggering}
              className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {triggering ? '生成中…' : '触发 Bot 回复'}
            </button>
          </div>
          <div className="space-y-6 divide-y divide-gray-100">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="pt-4 first:pt-0">
                <CommentItem
                  comment={comment}
                  replies={replies.filter((r) => r.parent_comment_id === comment.id)}
                />
              </div>
            ))}
            {topLevelComments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无评论，点击「触发 Bot 回复」开始讨论</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

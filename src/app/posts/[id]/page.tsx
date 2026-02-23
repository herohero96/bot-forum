import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockPosts, MockComment } from '@/lib/mockData';

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
  comment: MockComment;
  replies: MockComment[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{comment.botAvatar}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-800">{comment.botName}</span>
            <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-10 pl-4 border-l-2 border-gray-100 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <span className="text-xl flex-shrink-0">{reply.botAvatar}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800">{reply.botName}</span>
                  <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostPage({ params }: { params: { id: string } }) {
  const post = mockPosts.find((p) => p.id === params.id);
  if (!post) notFound();

  const topLevelComments = post.comments.filter((c) => !c.parentCommentId);
  const replies = post.comments.filter((c) => !!c.parentCommentId);

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
            <span className="text-2xl">{post.botAvatar}</span>
            <span className="text-sm font-semibold text-gray-700">{post.botName}</span>
            <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{post.content}</p>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-5">
            💬 {post.comments.length} 条评论
          </h2>
          <div className="space-y-6 divide-y divide-gray-100">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="pt-4 first:pt-0">
                <CommentItem
                  comment={comment}
                  replies={replies.filter((r) => r.parentCommentId === comment.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

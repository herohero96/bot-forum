import Link from 'next/link';
import { mockPosts } from '@/lib/mockData';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Home() {
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
          </div>
        </div>
      </nav>

      {/* Post list */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {mockPosts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="block">
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition-all">
              <h2 className="text-base font-semibold text-gray-900 mb-3">{post.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{post.botAvatar}</span>
                  <span className="font-medium text-gray-600">{post.botName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    💬 {post.comments.length} 条回复
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}

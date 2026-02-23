import Link from 'next/link';
import { bots } from '@/bots';

export default function BackstagePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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
            <span className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium">
              幕后视图
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">幕后视角</h1>
          <p className="text-sm text-gray-500 mt-1">认识论坛里的每一位 AI Bot</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{bot.avatar}</span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{bot.name}</h2>
                  <span className="text-xs text-gray-400">{bot.id}</span>
                </div>
              </div>

              {/* Personality */}
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{bot.personality}</p>

              {/* Expertise */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  专业方向
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bot.expertise.map((e) => (
                    <span
                      key={e}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Speaking style */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  说话风格
                </p>
                <p className="text-xs text-gray-500 italic">{bot.speaking_style}</p>
              </div>

              {/* Trigger keywords */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  触发关键词
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bot.trigger_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

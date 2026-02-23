'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TriggerTopicButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleClick() {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/cron/auto-post');
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ 已由 ${data.botName} 发帖`);
        router.refresh();
      } else {
        setMsg(`❌ ${data.error ?? '发帖失败'}`);
      }
    } catch {
      setMsg('❌ 请求失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '生成中…' : '触发新话题'}
      </button>
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
    </div>
  );
}

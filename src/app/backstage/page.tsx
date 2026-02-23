'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { bots } from '@/bots';
import { botRelations } from '@/bots/relations';

// Layout positions for 5 nodes in a pentagon
const positions: Record<string, { x: number; y: number }> = {
  'tech-guru':   { x: 300, y: 20 },
  'philosopher': { x: 560, y: 200 },
  'optimist':    { x: 460, y: 460 },
  'skeptic':     { x: 140, y: 460 },
  'storyteller': { x: 40,  y: 200 },
};

const initialNodes: Node[] = bots.map((bot) => ({
  id: bot.id,
  position: positions[bot.id] ?? { x: 200, y: 200 },
  data: { label: `${bot.avatar} ${bot.name}` },
  style: {
    background: '#1f2937',
    color: '#f9fafb',
    border: '2px solid #374151',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'grab',
  },
}));

const edgeStyleMap = {
  ally: {
    style: { stroke: '#22c55e', strokeWidth: 2 },
    animated: false,
  },
  rival: {
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6 3' },
    animated: false,
  },
  neutral: {
    style: { stroke: '#9ca3af', strokeWidth: 1 },
    animated: false,
  },
};

const initialEdges: Edge[] = botRelations.map((rel) => {
  const es = edgeStyleMap[rel.relation_type];
  return {
    id: rel.id,
    source: rel.bot_id,
    target: rel.target_bot_id,
    label: rel.relation_type,
    labelStyle: { fill: '#d1d5db', fontSize: 11 },
    labelBgStyle: { fill: '#111827', fillOpacity: 0.8 },
    ...es,
  };
});

export default function BackstagePage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:opacity-80">
            🤖 Bot Forum
          </Link>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleShare}
              className="px-4 py-1.5 rounded-full border border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              {copied ? '✅ 链接已复制' : '🔗 分享关系图'}
            </button>
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

      {/* React Flow — 60% height */}
      <div style={{ height: '60vh' }} className="w-full bg-gray-900">
        <div className="max-w-5xl mx-auto h-full px-4 py-4 flex flex-col">
          <div className="mb-2">
            <h1 className="text-lg font-bold text-white">Bot 关系图</h1>
            <p className="text-xs text-gray-400">
              <span className="text-green-400">■</span> 盟友 &nbsp;
              <span className="text-red-400">■</span> 对手 &nbsp;
              <span className="text-gray-400">■</span> 中立
            </p>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-gray-700">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-right"
            >
              <Background color="#374151" gap={20} />
              <Controls />
              <MiniMap
                nodeColor="#1f2937"
                maskColor="rgba(0,0,0,0.4)"
                style={{ background: '#111827' }}
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Bot cards — 40% */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bot 人设</h2>
          <p className="text-sm text-gray-500 mt-1">认识论坛里的每一位 AI Bot</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{bot.avatar}</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{bot.name}</h3>
                  <span className="text-xs text-gray-400">{bot.id}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">{bot.personality}</p>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">专业方向</p>
                <div className="flex flex-wrap gap-1.5">
                  {bot.expertise.map((e) => (
                    <span key={e} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{e}</span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">说话风格</p>
                <p className="text-xs text-gray-500 italic">{bot.speaking_style}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">触发关键词</p>
                <div className="flex flex-wrap gap-1.5">
                  {bot.trigger_keywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{kw}</span>
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

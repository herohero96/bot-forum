import { BotRelation } from '@/lib/types';

export const botRelations: BotRelation[] = [
  {
    id: 'rel-1',
    bot_id: 'tech-guru',
    target_bot_id: 'philosopher',
    relation_type: 'rival',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-2',
    bot_id: 'tech-guru',
    target_bot_id: 'optimist',
    relation_type: 'ally',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-3',
    bot_id: 'philosopher',
    target_bot_id: 'skeptic',
    relation_type: 'ally',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-4',
    bot_id: 'optimist',
    target_bot_id: 'skeptic',
    relation_type: 'rival',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-5',
    bot_id: 'storyteller',
    target_bot_id: 'optimist',
    relation_type: 'ally',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-6',
    bot_id: 'storyteller',
    target_bot_id: 'skeptic',
    relation_type: 'neutral',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-7',
    bot_id: 'tech-guru',
    target_bot_id: 'storyteller',
    relation_type: 'neutral',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-8',
    bot_id: 'philosopher',
    target_bot_id: 'optimist',
    relation_type: 'neutral',
    created_at: '2024-01-01T00:00:00Z',
  },
];

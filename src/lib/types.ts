export interface Bot {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  speaking_style: string;
  expertise: string[];
  trigger_keywords: string[];
}

export interface BotRelation {
  id: string;
  bot_id: string;
  target_bot_id: string;
  relation_type: 'ally' | 'rival' | 'neutral';
  created_at: string;
}

export interface Post {
  id: string;
  bot_id: string;
  title: string;
  content: string;
  created_at: string;
  topic_id: string | null;
  scheduled_date: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  bot_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
}

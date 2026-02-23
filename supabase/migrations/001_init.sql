-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum for bot relation types
create type relation_type as enum ('ally', 'rival', 'neutral');

-- bots table
create table if not exists bots (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  avatar_url text,
  personality text,
  speaking_style text,
  expertise text[],
  trigger_keywords text[],
  created_at timestamptz not null default now()
);

-- bot_relations table
create table if not exists bot_relations (
  id uuid primary key default uuid_generate_v4(),
  bot_id uuid not null references bots(id) on delete cascade,
  target_bot_id uuid not null references bots(id) on delete cascade,
  relation_type relation_type not null default 'neutral',
  created_at timestamptz not null default now()
);

-- posts table
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  bot_id uuid not null references bots(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- comments table
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  bot_id uuid not null references bots(id) on delete cascade,
  content text not null,
  parent_comment_id uuid references comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS: enable row level security on all tables
alter table bots enable row level security;
alter table bot_relations enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

-- RLS policies: public read
create policy "public read bots" on bots for select using (true);
create policy "public read bot_relations" on bot_relations for select using (true);
create policy "public read posts" on posts for select using (true);
create policy "public read comments" on comments for select using (true);

-- RLS policies: service role write (insert/update/delete)
create policy "service role write bots" on bots for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role write bot_relations" on bot_relations for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role write posts" on posts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role write comments" on comments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

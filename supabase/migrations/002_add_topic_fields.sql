-- Add topic_id and scheduled_date columns to posts table
ALTER TABLE posts ADD COLUMN topic_id TEXT;
ALTER TABLE posts ADD COLUMN scheduled_date DATE;
ALTER TABLE posts ADD CONSTRAINT posts_scheduled_date_unique UNIQUE (scheduled_date);

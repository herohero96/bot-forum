import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns today's UTC date as a YYYY-MM-DD string.
 */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns true if a post with scheduled_date = today already exists.
 */
export async function hasTodayPost(supabase: SupabaseClient): Promise<boolean> {
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .eq('scheduled_date', today)
    .limit(1);

  if (error) throw error;
  return Array.isArray(data) && data.length > 0;
}

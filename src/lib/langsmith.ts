import { traceable } from 'langsmith/traceable';

const hasLangSmith = !!process.env.LANGCHAIN_API_KEY;

/**
 * Wraps an AI call with LangSmith tracing.
 * Falls back to direct execution if LANGCHAIN_API_KEY is not configured.
 */
export async function traceAICall<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  if (!hasLangSmith) {
    return fn();
  }

  const traced = traceable(
    async () => {
      return fn();
    },
    {
      name,
      metadata,
      project_name: process.env.LANGCHAIN_PROJECT ?? 'bot-forum',
    }
  );

  return traced();
}

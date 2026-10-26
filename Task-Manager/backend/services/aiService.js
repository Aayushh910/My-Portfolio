/**
 * Service to generate concise and actionable task descriptions using Groq AI.
 * Uses Groq's high-speed OpenAI-compatible completions API with native fetch.
 */
class AIService {
  constructor() {
    this.defaultTimeoutMs = parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) || 15000;
  }

  /**
   * Generates a concise task description based on a title.
   * @param {string} title - The task title.
   * @returns {Promise<string>} The generated description.
   */
  async generateDescription(title) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      const error = new Error('Task title must be a non-empty string.');
      error.statusCode = 400;
      throw error;
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 300) {
      const error = new Error('Task title exceeds maximum allowed length of 300 characters.');
      error.statusCode = 400;
      throw error;
    }

    return this.generateWithGroq(trimmedTitle);
  }

  /**
   * Generates description via Groq Chat Completions API.
   * @param {string} title
   * @returns {Promise<string>}
   */
  async generateWithGroq(title) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || !apiKey.trim() || apiKey === 'your_groq_api_key_here') {
      const error = new Error(
        'Groq API key is not configured on the server. Please set GROQ_API_KEY in the backend environment.'
      );
      error.code = 'MISSING_API_KEY';
      error.statusCode = 500;
      throw error;
    }

    const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.defaultTimeoutMs);
    if (timer.unref) timer.unref();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.4,
          max_tokens: 250,
          messages: [
            {
              role: 'system',
              content:
                'You are an intelligent task management assistant. Generate a concise, practical, and actionable task description based on the provided task title. Return 1 to 3 direct sentences specifying the concrete steps or objective. Never include markdown code blocks, quotes, introductory phrases, or bullet points. Provide plain text only.',
            },
            {
              role: 'user',
              content: `Task Title: "${title}"\nGenerate a clear, professional, and actionable description for this task.`,
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        if (response.status === 401) {
          const error = new Error('Configured Groq API key is invalid.');
          error.statusCode = 500;
          throw error;
        }
        if (response.status === 429) {
          const error = new Error('Groq rate limit or quota exceeded. Please wait a moment and try again.');
          error.statusCode = 429;
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData?.error?.message || `Groq returned status ${response.status}`);
        error.statusCode = 502;
        throw error;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (!content) {
        const error = new Error('Groq returned an empty response.');
        error.statusCode = 502;
        throw error;
      }

      return content.replace(/^["']|["']$/g, '');
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        const error = new Error(`AI request timed out after ${this.defaultTimeoutMs / 1000} seconds.`);
        error.statusCode = 504;
        throw error;
      }
      if (err.statusCode) throw err;
      const error = new Error(`Groq AI provider error: ${err.message || 'Failed to connect to Groq.'}`);
      error.statusCode = 502;
      throw error;
    }
  }
}

export const aiService = new AIService();
export default aiService;

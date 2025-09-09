// AI Service Configuration (env-driven)
export const AI_CONFIG = {
  // Primary LLM endpoint (Rork toolkit)
  RORK_API_URL: 'https://toolkit.rork.com/text/llm/',

  // OpenAI fallback (key via env)
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',

  // Mapbox API Key (env)
  MAPBOX_API_KEY: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
};

// AI Service Types
export type AIService = 'rork' | 'openai';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  completion: string;
  service: AIService;
}

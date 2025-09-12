// AI Service Configuration (modern)
export const AI_CONFIG = {
  // OpenAI API (primary)
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',

  // Claude API (Anthropic)
  CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
  CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
};

// AI Service Types
export type AIService = 'openai' | 'claude';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  completion: string;
  service: AIService;
}

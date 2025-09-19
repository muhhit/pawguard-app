import { AI_CONFIG, AIMessage, AIResponse, AIService } from '@/constants/ai-config';
import { Platform } from 'react-native';

/**
 * Modern AI service with OpenAI and Claude support
 * Handles pet health analysis, lost pet descriptions, and community features
 * Production-ready with proper error handling and fallbacks
 */
export class AIServiceManager {
  private static async callOpenAI(messages: AIMessage[]): Promise<string> {
    console.log('🤖 Calling OpenAI API...');
    
    if (!AI_CONFIG.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  }

  private static async callClaude(messages: AIMessage[]): Promise<string> {
    console.log('🤖 Calling Claude API...');
    
    if (!AI_CONFIG.CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    // Convert messages for Claude format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(AI_CONFIG.CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: systemMessage?.content || '',
        messages: userMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.content?.[0]?.text) {
      throw new Error('Invalid response from Claude API');
    }

    return data.content[0].text;
  }

  /**
   * Get AI completion with automatic fallback between services
   */
  public static async getCompletion(
    messages: AIMessage[],
    preferredService: AIService = 'openai'
  ): Promise<AIResponse> {
    const services: AIService[] = preferredService === 'openai' 
      ? ['openai', 'claude'] 
      : ['claude', 'openai'];

    let lastError: Error | null = null;

    for (const service of services) {
      try {
        console.log(`🔄 Trying ${service} service...`);
        let completion: string;

        if (service === 'openai') {
          completion = await this.callOpenAI(messages);
        } else {
          completion = await this.callClaude(messages);
        }

        console.log(`✅ Success with ${service}`);
        return { completion, service };

      } catch (error) {
        console.warn(`❌ ${service} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    throw new Error(`All AI services failed. Last error: ${lastError?.message}`);
  }

  /**
   * Identify breed from a natural language description
   */
  public static async identifyBreed(description: string) {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a pet breed identification assistant. Answer in concise JSON where possible.'
      },
      {
        role: 'user',
        content: `Determine likely breed from this description. Return a short JSON with fields {"breed": string, "confidence": "high|medium|low", "alternativeBreeds"?: string[], "characteristics"?: string[]}. Description: ${description}`
      }
    ];
    return this.getCompletion(messages);
  }

  /**
   * Veterinary guidance for given symptoms
   */
  public static async getVeterinaryGuidance(symptoms: string) {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a veterinary AI assistant. Provide helpful, educational guidance. Always recommend consulting a veterinarian.'
      },
      {
        role: 'user',
        content: `Provide veterinary guidance for these symptoms: ${symptoms}. Include urgency keywords like EMERGENCY/URGENT/ROUTINE/INFORMATION in the text.`
      }
    ];
    return this.getCompletion(messages);
  }

  /**
   * Generate pet health analysis from symptoms
   */
  public static async analyzePetHealth(
    petType: string,
    symptoms: string[],
    petAge?: number
  ): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a veterinary AI assistant. Provide helpful, educational information about pet health. Always recommend consulting a real veterinarian for proper diagnosis and treatment.`
      },
      {
        role: 'user',
        content: `Analyze these symptoms for a ${petAge ? `${petAge}-year-old` : ''} ${petType}: ${symptoms.join(', ')}. Provide general guidance and recommend when to see a vet.`
      }
    ];

    const result = await this.getCompletion(messages);
    return result.completion;
  }

  /**
   * Generate compelling lost pet description
   */
  public static async generateLostPetDescription(
    petName: string,
    petType: string,
    breed: string,
    distinctiveFeatures: string[],
    lastSeenLocation: string
  ): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are helping create an urgent, compelling lost pet alert. Be concise, emotional, and include all important details that would help someone identify the pet.'
      },
      {
        role: 'user',
        content: `Create a lost pet alert for ${petName}, a ${breed} ${petType}. Distinctive features: ${distinctiveFeatures.join(', ')}. Last seen: ${lastSeenLocation}. Make it urgent and heartfelt.`
      }
    ];

    const result = await this.getCompletion(messages);
    return result.completion;
  }

  /**
   * Generate community engagement content
   */
  public static async generateCommunityPost(
    context: 'pet_found' | 'thanks' | 'update' | 'warning',
    details: string
  ): Promise<string> {
    const contextPrompts = {
      pet_found: 'Create a joyful post announcing a pet has been found and reunited',
      thanks: 'Create a heartfelt thank you post to the community for helping',
      update: 'Create an update post with new information about a search',
      warning: 'Create a safety warning for other pet owners'
    };

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You create engaging, community-focused social media posts for pet owners. Be warm, genuine, and encourage community participation.'
      },
      {
        role: 'user',
        content: `${contextPrompts[context]}. Details: ${details}`
      }
    ];

    const result = await this.getCompletion(messages);
    return result.completion;
  }

  /**
   * Automation stubs (no-op if backend not enabled)
   */
  public static async triggerLostPetAutomation(payload: {
    name: string;
    type: string;
    location: string;
    rewardAmount?: number;
    contact?: string;
    lastSeen?: string;
    ownerName?: string;
  }): Promise<void> {
    console.log('🔔 triggerLostPetAutomation', payload);
  }

  public static async triggerFoundPetAutomation(payload: {
    name: string;
    type: string;
    daysMissing?: number;
    foundLocation: string | { lat: number; lng: number };
    helperName?: string;
    ownerName?: string;
  }): Promise<void> {
    console.log('🎉 triggerFoundPetAutomation', payload);
  }
}

// Export convenience functions
export const analyzeSymptoms = AIServiceManager.analyzePetHealth;
export const generateAlert = AIServiceManager.generateLostPetDescription;
export const createCommunityPost = AIServiceManager.generateCommunityPost;

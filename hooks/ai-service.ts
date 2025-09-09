import { AI_CONFIG, AIMessage, AIResponse, AIService } from '@/constants/ai-config';
import { CONTENT_TEMPLATES, AUTOMATION_TRIGGERS } from '@/constants/ai-automation';
import { Platform } from 'react-native';

/**
 * Universal AI service with automation capabilities
 * Handles content generation, social media automation, and analytics
 * Falls back to OpenAI if Rork service fails
 */
export class AIServiceManager {
  private static async callRorkAPI(messages: AIMessage[]): Promise<string> {
    console.log('🤖 Calling Rork AI API...');
    
    const response = await fetch(AI_CONFIG.RORK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`Rork API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.completion) {
      throw new Error('Invalid response from Rork API');
    }

    return data.completion;
  }

  private static async callOpenAI(messages: AIMessage[]): Promise<string> {
    console.log('🤖 Calling OpenAI API...');
    
    const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  }

  /**
   * Get AI completion with automatic fallback
   * @param messages Array of messages for the AI
   * @param preferredService Which service to try first
   * @returns AI response with service info
   */
  static async getCompletion(
    messages: AIMessage[], 
    preferredService: AIService = 'rork'
  ): Promise<AIResponse> {
    const services: AIService[] = preferredService === 'rork' 
      ? ['rork', 'openai'] 
      : ['openai', 'rork'];

    let lastError: Error | null = null;

    for (const service of services) {
      try {
        let completion: string;
        
        if (service === 'rork') {
          completion = await this.callRorkAPI(messages);
        } else {
          completion = await this.callOpenAI(messages);
        }

        console.log(`✅ AI request successful using ${service}`);
        return { completion, service };
        
      } catch (error) {
        console.warn(`❌ ${service} API failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // If all services failed
    throw new Error(`All AI services failed. Last error: ${lastError?.message}`);
  }

  /**
   * Get veterinary guidance with safety rules
   */
  static async getVeterinaryGuidance(symptoms: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `CRITICAL SAFETY RULES:
1. Never provide specific medical diagnoses
2. Always recommend veterinary consultation
3. Classify urgency as: EMERGENCY/URGENT/ROUTINE/INFORMATION
4. Focus on general care and when to seek help
5. Be helpful but emphasize professional veterinary care

You are a pet health information assistant. Provide general guidance about pet symptoms while emphasizing the importance of professional veterinary care.`
      },
      {
        role: 'user',
        content: `Pet symptoms: ${symptoms}

Please provide general information about these symptoms and urgency level. End with: "This is for educational purposes only. Consult a veterinarian for proper diagnosis and treatment."`
      }
    ];

    return this.getCompletion(messages);
  }

  /**
   * Identify pet breed from description
   */
  static async identifyBreed(description: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a pet breed identification expert. Analyze the description and identify the most likely breed(s).

Rules:
1. Be specific but indicate uncertainty levels (high/medium/low confidence)
2. Provide alternative breeds if uncertain
3. Include key characteristics that led to your identification
4. If description is too vague, ask for more specific details
5. Focus on physical characteristics, temperament, and size

Respond in JSON format:
{
  "breed": "Primary breed name",
  "confidence": "high|medium|low",
  "alternativeBreeds": ["Alternative 1", "Alternative 2"],
  "characteristics": ["Key trait 1", "Key trait 2"]
}`
      },
      {
        role: 'user',
        content: `Identify the breed from this description: ${description}`
      }
    ];

    return this.getCompletion(messages);
  }

  /**
   * Generate pet care tips
   */
  static async getPetCareTips(petType: string, breed?: string, age?: string): Promise<AIResponse> {
    const petInfo = [petType, breed, age].filter(Boolean).join(', ');
    
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a pet care expert. Provide helpful, practical care tips for pets. Focus on daily care, health maintenance, and general wellbeing.'
      },
      {
        role: 'user',
        content: `Provide care tips for: ${petInfo}. Include feeding, exercise, grooming, and health monitoring advice.`
      }
    ];

    return this.getCompletion(messages);
  }

  /**
   * AUTOMATION CONTENT GENERATION
   */
  static async generateLostPetContent(petData: any, platform: string = 'instagram'): Promise<AIResponse> {
    const template = CONTENT_TEMPLATES.lostPetAlert;
    let baseContent = template.urgent
      .replace('{{pet_name}}', petData.name || 'Pet')
      .replace('{{breed}}', petData.breed || petData.type || 'Pet')
      .replace('{{area}}', petData.location || 'Local area')
      .replace('{{last_seen}}', petData.lastSeen || 'Recently')
      .replace('{{contact}}', petData.contact || 'Owner')
      .replace('{{reward_amount}}', petData.rewardAmount || '0');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `Create urgent but hopeful ${platform} content for a lost pet alert. Include relevant hashtags and call to action. Be empathetic and actionable.`
      },
      {
        role: 'user',
        content: `Enhance this lost pet alert for ${platform}: ${baseContent}`
      }
    ];

    return this.getCompletion(messages);
  }

  static async generateFoundPetContent(petData: any, platform: string = 'instagram'): Promise<AIResponse> {
    const template = CONTENT_TEMPLATES.foundPetSuccess;
    
    let baseContent = template.celebration
      .replace('{{pet_name}}', petData.name || 'Pet')
      .replace('{{days_missing}}', petData.daysMissing || '0')
      .replace('{{found_location}}', petData.foundLocation || 'safe location')
      .replace('{{helper_name}}', petData.helperName || 'a kind person');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `Create celebratory ${platform} content about a pet reunion. Be joyful, inspiring, and thank the community.`
      },
      {
        role: 'user',
        content: `Enhance this reunion story for ${platform}: ${baseContent}`
      }
    ];

    return this.getCompletion(messages);
  }

  static async generateEducationalContent(topic: string, platform: string = 'instagram'): Promise<AIResponse> {
    const tips = CONTENT_TEMPLATES.educationalContent.tips;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `Create educational pet safety content for ${platform}. Be informative, engaging, and actionable. Include practical tips.`
      },
      {
        role: 'user',
        content: `Create educational content about: ${topic}. Base it on this tip: ${randomTip}`
      }
    ];

    return this.getCompletion(messages);
  }

  /**
   * AUTOMATION TRIGGERS
   */
  static async triggerLostPetAutomation(petData: any): Promise<void> {
    console.log('🚨 Triggering lost pet automation for:', petData.name);
    
    try {
      // Generate content for different platforms
      const platforms = ['instagram', 'facebook', 'twitter'];
      
      for (const platform of platforms) {
        const content = await this.generateLostPetContent(petData, platform);
        console.log(`📱 Generated ${platform} content:`, content.completion.substring(0, 100) + '...');
        
        // In a real implementation, this would post to the actual platform
        await this.simulatePostToSocialMedia(platform, content.completion, petData);
      }
      
      // Simulate other automation actions
      await this.simulateNearbyNotifications(petData);
      await this.simulateWhatsAppBroadcast(petData);
      
    } catch (error) {
      console.error('❌ Lost pet automation failed:', error);
    }
  }

  static async triggerFoundPetAutomation(petData: any): Promise<void> {
    console.log('🎉 Triggering found pet automation for:', petData.name);
    
    try {
      // Generate success story content
      const content = await this.generateFoundPetContent(petData);
      console.log('📝 Generated success story:', content.completion.substring(0, 100) + '...');
      
      // Simulate posting success story
      await this.simulatePostToSocialMedia('instagram', content.completion, petData);
      
      // Simulate other actions
      await this.simulateOwnerNotification(petData);
      
    } catch (error) {
      console.error('❌ Found pet automation failed:', error);
    }
  }

  /**
   * SIMULATION METHODS (Replace with real integrations)
   */
  private static async simulatePostToSocialMedia(platform: string, content: string, petData: any): Promise<void> {
    console.log(`📱 [SIMULATED] Posting to ${platform}:`);
    console.log(`Content: ${content.substring(0, 150)}...`);
    console.log(`Pet: ${petData.name}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private static async simulateNearbyNotifications(petData: any): Promise<void> {
    console.log('📲 [SIMULATED] Sending push notifications to nearby users');
    console.log(`Radius: 5km around ${petData.location}`);
    console.log(`Pet: ${petData.name} - ${petData.type}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private static async simulateWhatsAppBroadcast(petData: any): Promise<void> {
    console.log('💬 [SIMULATED] Creating WhatsApp broadcast');
    console.log(`Message: URGENT - ${petData.name} missing in ${petData.location}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private static async simulateOwnerNotification(petData: any): Promise<void> {
    console.log('📧 [SIMULATED] Notifying pet owner');
    console.log(`Owner: ${petData.ownerName}`);
    console.log(`Message: Great news! ${petData.name} has been found!`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * CONTENT ANALYTICS
   */
  static getAutomationStats() {
    // In a real implementation, this would fetch from analytics service
    return {
      totalPosts: 156,
      platformBreakdown: {
        instagram: 45,
        facebook: 38,
        twitter: 42,
        whatsapp: 31
      },
      engagementRate: 0.067,
      reachToday: 12450,
      conversions: 8
    };
  }
}
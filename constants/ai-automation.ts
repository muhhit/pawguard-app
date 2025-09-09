// config/ai-automation.ts
export const AI_CONTENT_SYSTEM = {
  // VIDEO GENERATION PIPELINE
  tiktok: {
    tool: 'Synthesia / D-ID',
    workflow: {
      morning: 'Educational (AI voiceover)',
      afternoon: 'Mascot dance (motion capture)',
      evening: 'Emotional story (template)'
    },
    schedule: '3x daily via n8n',
    hooks: [
      'Lost pet found after X days',
      'Why dogs escape at dawn',
      'Breed-specific tips'
    ]
  },

  // INSTAGRAM AUTOMATION
  instagram: {
    reels: 'Canva API + Make.com',
    stories: 'Buffer auto-post',
    captions: 'GPT-4 with emotion triggers',
    hashtags: '#dogsofinstagram #catsofinstagram #kayıpköpek'
  },

  // WHATSAPP BROADCAST
  whatsapp: {
    api: 'WhatsApp Business Cloud',
    segments: ['TR', 'BR', 'IN'],
    templates: {
      lost: 'URGENT: {{pet_name}} missing in {{area}}',
      found: 'GOOD NEWS: Pet reunited!',
      daily: 'Safety tip of the day'
    }
  }
};

// n8n Workflow Configuration
export const N8N_WORKFLOWS = {
  contentCreation: {
    trigger: 'Daily 7 AM',
    nodes: [
      { type: 'OpenAI', action: 'Generate 10 video scripts' },
      { type: 'D-ID', action: 'Create AI presenter videos' },
      { type: 'Canva', action: 'Generate Instagram posts' },
      { type: 'Buffer', action: 'Schedule all content' }
    ]
  },
  
  engagementBot: {
    trigger: 'Every 30 mins',
    nodes: [
      { type: 'Reddit', action: 'Answer 5 questions' },
      { type: 'Facebook', action: 'Join new groups' },
      { type: 'Instagram', action: 'Like/comment pet posts' }
    ]
  },

  viralAlert: {
    trigger: 'On lost pet report',
    nodes: [
      { type: 'Mapbox', action: 'Get 10km radius users' },
      { type: 'OneSignal', action: 'Send push notification' },
      { type: 'WhatsApp', action: 'Broadcast to local groups' },
      { type: 'Twitter', action: 'Post with location' }
    ]
  }
};

// Content Templates for AI Generation
export const CONTENT_TEMPLATES = {
  lostPetAlert: {
    urgent: 'KAYIP: {{pet_name}} - {{breed}} - {{area}}\n{{description}}\nSon görülme: {{last_seen}}\nİletişim: {{contact}}',
    social: '🚨 KAYIP DOSTUMUZ {{pet_name}} 🚨\n📍 {{area}}\n⏰ {{last_seen}}\n#kayıpköpek #kayıpkedi #{{city}}',
    whatsapp: 'ACİL: {{area}} bölgesinde {{pet_name}} isimli {{breed}} kayboldu. Son görülme: {{last_seen}}. Görürseniz lütfen {{contact}} numarasını arayın.'
  },
  
  foundPetSuccess: {
    celebration: '🎉 MÜJDE! {{pet_name}} ailesine kavuştu! 🎉\n{{days_missing}} gün sonra {{found_location}} bölgesinde bulundu.\nTeşekkürler {{helper_name}}! 💕',
    story: '{{pet_name}} hikayesi: {{story_text}}\n\n#mutluson #kayıpköpek #başarıhikayesi'
  },
  
  educationalContent: {
    tips: [
      'Köpeğinizin kaçmasını önlemek için 5 altın kural',
      'Kediler neden kaybolur? Uzman veteriner açıklıyor',
      'Mikroçip nedir, neden önemlidir?',
      'Kayıp hayvan bulduğunuzda yapmanız gerekenler',
      'Evcil hayvan güvenliği için ev düzenlemesi'
    ],
    seasonal: {
      summer: 'Yaz aylarında evcil hayvan güvenliği',
      winter: 'Kış aylarında sokak hayvanlarına yardım',
      spring: 'İlkbahar çiftleşme döneminde dikkat edilecekler',
      autumn: 'Sonbahar hastalıklarından korunma'
    }
  }
};

// Automation Triggers
export const AUTOMATION_TRIGGERS = {
  newLostPet: {
    immediate: [
      'Send push notification to nearby users',
      'Post to local Facebook groups',
      'Create WhatsApp broadcast',
      'Generate social media posts'
    ],
    delayed: [
      { action: 'Reminder notification', delay: '24h' },
      { action: 'Expand search radius', delay: '48h' },
      { action: 'Contact local shelters', delay: '72h' }
    ]
  },
  
  petFound: {
    immediate: [
      'Notify pet owner',
      'Update all active alerts',
      'Generate success story content',
      'Send thank you to helper'
    ],
    followUp: [
      { action: 'Request testimonial', delay: '24h' },
      { action: 'Share success story', delay: '48h' }
    ]
  },
  
  userEngagement: {
    newUser: [
      'Welcome message sequence',
      'Pet registration reminder',
      'Community introduction'
    ],
    inactive: [
      { action: 'Re-engagement notification', delay: '7d' },
      { action: 'Local pet news update', delay: '14d' },
      { action: 'Success story share', delay: '21d' }
    ]
  }
};

// Analytics Events for Tracking
export const ANALYTICS_EVENTS = {
  content: {
    generated: 'ai_content_generated',
    posted: 'content_posted',
    engaged: 'content_engagement',
    viral: 'content_went_viral'
  },
  
  automation: {
    triggered: 'automation_triggered',
    completed: 'automation_completed',
    failed: 'automation_failed'
  },
  
  marketing: {
    campaign_started: 'marketing_campaign_started',
    conversion: 'marketing_conversion',
    cost_per_acquisition: 'marketing_cpa'
  }
};
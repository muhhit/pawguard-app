// config/feature-rollout.ts
export const LAUNCH_PHASES = {
  // PHASE 1: CORE MVP (Days 1-30)
  mvp: {
    features: [
      'Lost pet reporting',
      'Emergency broadcast (3km)',
      'Basic map view',
      'WhatsApp share',
      'Profile creation'
    ],
    metrics: {
      targetUsers: 1000,
      premiumConversion: '5%',
      dailyActive: '40%'
    }
  },

  // PHASE 2: SOCIAL LAYER (Days 31-60)
  social: {
    features: [
      'Invite-only events',
      'Dog compatibility matching',
      'Street feeding coordination',
      'Community chat (local only)',
      'Success story sharing'
    ],
    unlockCondition: '1000 users OR 50 premium',
    metrics: {
      eventParticipation: '30%',
      invitesSent: '2.5 per user',
      retention: '60% D30'
    }
  },

  // PHASE 3: AI FEATURES (Days 61-90)
  intelligence: {
    features: [
      'AI breed identification',
      'Lost pet prediction zones',
      'Automated social posts',
      'Smart matching algorithm',
      'Vet chat bot'
    ],
    requirement: 'Premium only initially',
    metrics: {
      aiUsage: '70% of premium',
      accuracy: '85% breed ID',
      conversionLift: '+40%'
    }
  },

  // PHASE 4: MONETIZATION (Days 91+)
  revenue: {
    features: [
      'Sponsored vet listings',
      'Pet insurance affiliate',
      'Premium event hosting',
      'NFT pet badges (Turkey only)',
      'Marketplace beta'
    ]
  }
};

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  // Core features (always enabled)
  PET_REPORTING: true,
  MAP_VIEW: true,
  EMERGENCY_BROADCAST: true,
  
  // Social features (conditional)
  DOG_MATCHING: false, // Enable after 1000 users
  COMMUNITY_EVENTS: false, // Enable after 1000 users
  FEEDING_COORDINATION: false, // Enable after 1000 users
  
  // AI features (premium only)
  BREED_IDENTIFICATION: false, // Premium feature
  PREDICTION_ZONES: false, // Premium feature
  VET_CHATBOT: false, // Premium feature
  
  // Revenue features
  SPONSORED_LISTINGS: false, // Enable after revenue phase
  INSURANCE_AFFILIATE: false, // Enable after revenue phase
  NFT_BADGES: false, // Turkey only, after revenue phase
  
  // New premium visual features
  BRANDIFY: true,
  PARALLAX_CARD: true,
  
  // Rescue coordination
  RESCUE_CHANNELS: true,
  CONTENT_REPORTS: true,
};

// User metrics thresholds
export const ROLLOUT_THRESHOLDS = {
  SOCIAL_FEATURES: {
    totalUsers: 1000,
    premiumUsers: 50,
    dailyActiveUsers: 400
  },
  AI_FEATURES: {
    premiumUsers: 100,
    monthlyRevenue: 5000 // USD
  },
  REVENUE_FEATURES: {
    totalUsers: 5000,
    monthlyRevenue: 10000 // USD
  }
};

// Geographic rollout (Turkey first, then expand)
export const GEO_ROLLOUT = {
  TURKEY: {
    enabled: true,
    features: ['ALL']
  },
  BRAZIL: {
    enabled: false, // Enable after Turkey success
    features: ['CORE_MVP']
  },
  INDIA: {
    enabled: false, // Enable after Brazil success
    features: ['CORE_MVP']
  }
};

// A/B test configurations
export const AB_TESTS = {
  ONBOARDING_FLOW: {
    variants: {
      A: 'Simple 3-step onboarding',
      B: 'Detailed 5-step onboarding with pet photos'
    },
    traffic: 50, // 50/50 split
    metric: 'completion_rate'
  },
  PREMIUM_PRICING: {
    variants: {
      A: '₺29.99/month',
      B: '₺39.99/month with 7-day trial'
    },
    traffic: 50,
    metric: 'conversion_rate'
  },
  MAP_STYLE: {
    variants: {
      A: 'Standard Google Maps',
      B: 'Dark mode with pet-friendly colors'
    },
    traffic: 30, // 70% standard, 30% dark
    metric: 'engagement_time'
  }
};

// Success metrics for each phase
export const SUCCESS_METRICS = {
  MVP: {
    userGrowth: '100 new users/week',
    retention: '40% D7, 20% D30',
    engagement: '3 sessions/week per user',
    conversion: '5% to premium'
  },
  SOCIAL: {
    eventParticipation: '30% of users join events',
    invitesSent: '2.5 invites per user',
    communityEngagement: '60% weekly active in chat',
    retention: '60% D30'
  },
  AI: {
    featureUsage: '70% of premium users use AI',
    accuracy: '85% breed identification',
    satisfaction: '4.5+ star rating',
    conversionLift: '+40% premium conversion'
  },
  REVENUE: {
    monthlyRevenue: '$10,000 MRR',
    ltv: '$120 average LTV',
    cac: '<$15 customer acquisition cost',
    churn: '<5% monthly churn'
  }
};

// Helper functions
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

export const canEnableSocialFeatures = (metrics: {
  totalUsers: number;
  premiumUsers: number;
  dailyActiveUsers: number;
}): boolean => {
  const threshold = ROLLOUT_THRESHOLDS.SOCIAL_FEATURES;
  return (
    metrics.totalUsers >= threshold.totalUsers ||
    metrics.premiumUsers >= threshold.premiumUsers
  );
};

export const canEnableAIFeatures = (metrics: {
  premiumUsers: number;
  monthlyRevenue: number;
}): boolean => {
  const threshold = ROLLOUT_THRESHOLDS.AI_FEATURES;
  return (
    metrics.premiumUsers >= threshold.premiumUsers &&
    metrics.monthlyRevenue >= threshold.monthlyRevenue
  );
};

export const getABTestVariant = (testName: keyof typeof AB_TESTS, userId: string): 'A' | 'B' => {
  // Simple hash-based assignment for consistent user experience
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const test = AB_TESTS[testName];
  return Math.abs(hash) % 100 < test.traffic ? 'B' : 'A';
};

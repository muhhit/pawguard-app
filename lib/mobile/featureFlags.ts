import { deviceTierDetector, DeviceTier } from './deviceTier';

export interface FeatureFlags {
  // Animasyon özellikleri
  enableAnimations: boolean;
  enableHeavyAnimations: boolean;
  enableSpringAnimations: boolean;
  enableParallaxEffects: boolean;
  
  // Performans özellikleri
  enableImageOptimization: boolean;
  enableListVirtualization: boolean;
  enableMapOptimization: boolean;
  
  // UI özellikleri
  enableGlassEffects: boolean;
  enableBlurEffects: boolean;
  enableShadowEffects: boolean;
  
  // Ağ özellikleri
  enableImagePreloading: boolean;
  enableOfflineMode: boolean;
  enableBackgroundSync: boolean;
}

class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: FeatureFlags | null = null;

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    if (this.flags) {
      return this.flags;
    }

    const deviceSpecs = await deviceTierDetector.getDeviceSpecs();
    
    // Cihaz katmanına göre özellik bayrakları
    switch (deviceSpecs.tier) {
      case DeviceTier.LOW:
        this.flags = {
          // Düşük katman: Minimal animasyonlar
          enableAnimations: true,
          enableHeavyAnimations: false,
          enableSpringAnimations: false,
          enableParallaxEffects: false,
          
          // Performans optimizasyonları zorunlu
          enableImageOptimization: true,
          enableListVirtualization: true,
          enableMapOptimization: true,
          
          // UI efektleri kapalı
          enableGlassEffects: false,
          enableBlurEffects: false,
          enableShadowEffects: false,
          
          // Ağ optimizasyonları
          enableImagePreloading: false,
          enableOfflineMode: true,
          enableBackgroundSync: false,
        };
        break;

      case DeviceTier.MID:
        this.flags = {
          // Orta katman: Dengeli özellikler
          enableAnimations: true,
          enableHeavyAnimations: false,
          enableSpringAnimations: true,
          enableParallaxEffects: false,
          
          // Performans optimizasyonları
          enableImageOptimization: true,
          enableListVirtualization: true,
          enableMapOptimization: false,
          
          // Sınırlı UI efektleri
          enableGlassEffects: true,
          enableBlurEffects: false,
          enableShadowEffects: true,
          
          // Ağ özellikleri
          enableImagePreloading: true,
          enableOfflineMode: true,
          enableBackgroundSync: true,
        };
        break;

      case DeviceTier.HIGH:
        this.flags = {
          // Yüksek katman: Tüm özellikler
          enableAnimations: true,
          enableHeavyAnimations: true,
          enableSpringAnimations: true,
          enableParallaxEffects: true,
          
          // Performans optimizasyonları opsiyonel
          enableImageOptimization: false,
          enableListVirtualization: false,
          enableMapOptimization: false,
          
          // Tüm UI efektleri
          enableGlassEffects: true,
          enableBlurEffects: true,
          enableShadowEffects: true,
          
          // Gelişmiş ağ özellikleri
          enableImagePreloading: true,
          enableOfflineMode: true,
          enableBackgroundSync: true,
        };
        break;
    }

    return this.flags;
  }

  // Belirli bir özelliği kontrol et
  async isFeatureEnabled(feature: keyof FeatureFlags): Promise<boolean> {
    const flags = await this.getFeatureFlags();
    return flags[feature];
  }

  // Animasyon özelliklerini toplu kontrol
  async getAnimationConfig() {
    const flags = await this.getFeatureFlags();
    return {
      enabled: flags.enableAnimations,
      heavy: flags.enableHeavyAnimations,
      spring: flags.enableSpringAnimations,
      parallax: flags.enableParallaxEffects,
    };
  }

  // Performans ayarlarını toplu kontrol
  async getPerformanceConfig() {
    const flags = await this.getFeatureFlags();
    return {
      imageOptimization: flags.enableImageOptimization,
      listVirtualization: flags.enableListVirtualization,
      mapOptimization: flags.enableMapOptimization,
    };
  }

  // UI efekt ayarlarını toplu kontrol
  async getUIEffectsConfig() {
    const flags = await this.getFeatureFlags();
    return {
      glass: flags.enableGlassEffects,
      blur: flags.enableBlurEffects,
      shadow: flags.enableShadowEffects,
    };
  }

  // Bayrakları manuel olarak güncelle (test/debug için)
  updateFlags(newFlags: Partial<FeatureFlags>) {
    if (this.flags) {
      this.flags = { ...this.flags, ...newFlags };
    }
  }

  // Bayrakları sıfırla (yeniden hesaplama için)
  resetFlags() {
    this.flags = null;
  }
}

export const featureFlagManager = FeatureFlagManager.getInstance();

// Kolay kullanım için export edilen fonksiyonlar
export const isFeatureEnabled = async (feature: keyof FeatureFlags): Promise<boolean> => {
  return await featureFlagManager.isFeatureEnabled(feature);
};

export const getAnimationConfig = async () => {
  return await featureFlagManager.getAnimationConfig();
};

export const getPerformanceConfig = async () => {
  return await featureFlagManager.getPerformanceConfig();
};

export const getUIEffectsConfig = async () => {
  return await featureFlagManager.getUIEffectsConfig();
};

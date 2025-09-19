import { Platform, Dimensions } from 'react-native';
import Constants from 'expo-constants';

export enum DeviceTier {
  LOW = 'low',
  MID = 'mid',
  HIGH = 'high'
}

export interface DeviceSpecs {
  tier: DeviceTier;
  ram: number;
  cores: number;
  screenSize: number;
  isLowEnd: boolean;
  canHandleAnimations: boolean;
  canHandleHeavyEffects: boolean;
}

class DeviceTierDetector {
  private static instance: DeviceTierDetector;
  private deviceSpecs: DeviceSpecs | null = null;

  static getInstance(): DeviceTierDetector {
    if (!DeviceTierDetector.instance) {
      DeviceTierDetector.instance = new DeviceTierDetector();
    }
    return DeviceTierDetector.instance;
  }

  async getDeviceSpecs(): Promise<DeviceSpecs> {
    if (this.deviceSpecs) {
      return this.deviceSpecs;
    }

    const { width, height } = Dimensions.get('window');
    const screenSize = Math.sqrt(width * width + height * height);
    
    let ram = 2; // Default fallback
    let cores = 4; // Default fallback

    // Expo Constants kullanarak cihaz bilgilerini al
    const deviceName = Constants.deviceName || '';
    const platform = Platform.OS;
    
    // RAM tahmini (gerçek değer alamadığımız için heuristik kullan)
    ram = this.estimateRAM(deviceName, platform);

    // iOS için özel tespit
    if (Platform.OS === 'ios') {
      const tier = this.detectiOSTier(deviceName, ram);
      
      this.deviceSpecs = {
        tier,
        ram,
        cores,
        screenSize,
        isLowEnd: tier === DeviceTier.LOW,
        canHandleAnimations: tier !== DeviceTier.LOW,
        canHandleHeavyEffects: tier === DeviceTier.HIGH
      };
    } else {
      // Android için tespit
      const apiLevel = Platform.Version as number;
      const tier = this.detectAndroidTier(apiLevel, ram, screenSize);
      
      this.deviceSpecs = {
        tier,
        ram,
        cores,
        screenSize,
        isLowEnd: tier === DeviceTier.LOW,
        canHandleAnimations: tier !== DeviceTier.LOW,
        canHandleHeavyEffects: tier === DeviceTier.HIGH
      };
    }

    return this.deviceSpecs;
  }

  private estimateRAM(deviceName: string, platform: string): number {
    // Cihaz adına göre RAM tahmini
    if (platform === 'ios') {
      if (deviceName.includes('iPhone 6') || deviceName.includes('iPhone SE (1st')) {
        return 1; // 1GB
      } else if (deviceName.includes('iPhone 7') || deviceName.includes('iPhone 8')) {
        return 2; // 2GB
      } else if (deviceName.includes('iPhone X') || deviceName.includes('iPhone 11')) {
        return 4; // 4GB
      } else if (deviceName.includes('iPhone 12') || deviceName.includes('iPhone 13')) {
        return 6; // 6GB
      } else {
        return 8; // Yeni modeller için 8GB+
      }
    } else {
      // Android için genel tahmin
      const { width, height } = Dimensions.get('window');
      const screenSize = Math.max(width, height);
      
      if (screenSize < 800) {
        return 2; // Küçük ekran = düşük RAM
      } else if (screenSize < 1000) {
        return 4; // Orta ekran = orta RAM
      } else {
        return 6; // Büyük ekran = yüksek RAM
      }
    }
  }

  private detectiOSTier(deviceName: string, ram: number): DeviceTier {
    // iPhone modelleri için tier tespiti
    const lowEndModels = ['iPhone 6', 'iPhone 6s', 'iPhone 7', 'iPhone SE (1st'];
    const midEndModels = ['iPhone 8', 'iPhone X', 'iPhone XR', 'iPhone 11'];
    
    const isLowEnd = lowEndModels.some(lowModel => deviceName.includes(lowModel));
    const isMidEnd = midEndModels.some(midModel => deviceName.includes(midModel));
    
    if (isLowEnd || ram < 3) {
      return DeviceTier.LOW;
    } else if (isMidEnd || ram < 6) {
      return DeviceTier.MID;
    } else {
      return DeviceTier.HIGH;
    }
  }

  private detectAndroidTier(apiLevel: number, ram: number, screenSize: number): DeviceTier {
    // Android için tier tespiti
    if (apiLevel < 23 || ram < 3) { // API 23 = Android 6.0
      return DeviceTier.LOW;
    } else if (apiLevel < 28 || ram < 6) { // API 28 = Android 9.0
      return DeviceTier.MID;
    } else {
      return DeviceTier.HIGH;
    }
  }

  // Performans testleri için yardımcı metodlar
  async shouldReduceAnimations(): Promise<boolean> {
    const specs = await this.getDeviceSpecs();
    return specs.isLowEnd || !specs.canHandleAnimations;
  }

  async shouldDisableHeavyEffects(): Promise<boolean> {
    const specs = await this.getDeviceSpecs();
    return !specs.canHandleHeavyEffects;
  }

  // Bellek kullanımı izleme
  getMemoryWarningThreshold(): number {
    return Platform.OS === 'ios' ? 0.8 : 0.85; // iOS daha katı
  }
}

export const deviceTierDetector = DeviceTierDetector.getInstance();

// Kolay kullanım için export edilen fonksiyonlar
export const getDeviceTier = async (): Promise<DeviceTier> => {
  const specs = await deviceTierDetector.getDeviceSpecs();
  return specs.tier;
};

export const isLowEndDevice = async (): Promise<boolean> => {
  return await deviceTierDetector.shouldReduceAnimations();
};

export const canHandleHeavyEffects = async (): Promise<boolean> => {
  const specs = await deviceTierDetector.getDeviceSpecs();
  return specs.canHandleHeavyEffects;
};

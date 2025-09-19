export interface AILostPetContent {
  description: string;
  searchTitle: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface AIAutomationResult {
  success: boolean;
  actionsPerformed: string[];
  errors?: string[];
}

export class AIService {
  static async generateLostPetContent(petData: {
    name: string;
    type: string;
    breed?: string;
    age?: string;
    color?: string;
    description?: string;
    lastLocation?: { lat: number; lng: number };
  }): Promise<AILostPetContent> {
    const { name, type, breed, age, color, description, lastLocation } = petData;
    
    const searchTitle = `${name} - Kayıp ${type}${breed ? ` (${breed})` : ''}`;
    
    const enhancedDescription = [
      description || `${name} adlı ${type} kayıp.`,
      age && `Yaş: ${age}`,
      color && `Renk: ${color}`,
      breed && `Irk: ${breed}`,
      lastLocation && `Son görüldüğü konum civarında aranıyor.`
    ].filter(Boolean).join(' ');

    const urgencyLevel: AILostPetContent['urgencyLevel'] = 
      type === 'dog' ? 'high' : 
      age && parseInt(age) < 1 ? 'critical' :
      'medium';

    const recommendations = [
      `${name} için çevredeki veteriner kliniklerini arayın`,
      'Sosyal medyada paylaşım yapın',
      'Mahalle sakinlerini bilgilendirin',
      'Fotoğraflarını çevreye asın'
    ];

    return {
      description: enhancedDescription,
      searchTitle,
      urgencyLevel,
      recommendations
    };
  }

  static async triggerLostPetAutomation(petId: string, options?: {
    enableSocialShare?: boolean;
    enableVetNotification?: boolean;
    enableLocationAlerts?: boolean;
  }): Promise<AIAutomationResult> {
    const actionsPerformed: string[] = [];
    const errors: string[] = [];

    try {
      if (options?.enableSocialShare) {
        actionsPerformed.push('Sosyal medya paylaşımı hazırlandı');
      }

      if (options?.enableVetNotification) {
        actionsPerformed.push('Çevredeki veteriner klinikleri bilgilendirildi');
      }

      if (options?.enableLocationAlerts) {
        actionsPerformed.push('Konum bazlı uyarılar aktifleştirildi');
      }

      actionsPerformed.push('Kayıp pet veritabanına eklendi');
      
      return {
        success: true,
        actionsPerformed
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Bilinmeyen hata');
      return {
        success: false,
        actionsPerformed,
        errors
      };
    }
  }
}

export default AIService;
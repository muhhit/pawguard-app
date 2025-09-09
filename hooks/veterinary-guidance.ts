import { useState, useCallback } from 'react';
import { AIServiceManager } from './ai-service';

export interface VeterinaryGuidance {
  urgency: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'INFORMATION';
  guidance: string;
  recommendations: string[];
  whenToSeekHelp: string[];
}

export function useVeterinaryGuidance() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getGuidance = useCallback(async (symptoms: string): Promise<VeterinaryGuidance | null> => {
    if (!symptoms.trim()) {
      setError('Please describe the symptoms');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Getting veterinary guidance for symptoms:', symptoms.substring(0, 50));
      
      const aiResponse = await AIServiceManager.getVeterinaryGuidance(symptoms);
      console.log(`✅ Veterinary guidance completed using ${aiResponse.service} service`);

      // Parse the response to extract structured information
      const guidance = aiResponse.completion;
      
      // Extract urgency level
      let urgency: VeterinaryGuidance['urgency'] = 'ROUTINE';
      if (guidance.includes('EMERGENCY')) urgency = 'EMERGENCY';
      else if (guidance.includes('URGENT')) urgency = 'URGENT';
      else if (guidance.includes('INFORMATION')) urgency = 'INFORMATION';

      // Split guidance into sections
      const sections = guidance.split('\n').filter(line => line.trim());
      const recommendations: string[] = [];
      const whenToSeekHelp: string[] = [];


      for (const line of sections) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().includes('recommend') || trimmed.includes('•') || trimmed.includes('-')) {
          if (trimmed.toLowerCase().includes('veterinarian') || trimmed.toLowerCase().includes('vet')) {
            whenToSeekHelp.push(trimmed.replace(/^[•-]\s*/, ''));
          } else {
            recommendations.push(trimmed.replace(/^[•-]\s*/, ''));
          }
        }
      }

      const result: VeterinaryGuidance = {
        urgency,
        guidance: guidance,
        recommendations: recommendations.length > 0 ? recommendations : [
          'Monitor your pet closely',
          'Keep them comfortable and calm',
          'Document any changes in behavior or symptoms'
        ],
        whenToSeekHelp: whenToSeekHelp.length > 0 ? whenToSeekHelp : [
          'If symptoms worsen or persist',
          'If your pet shows signs of distress',
          'For proper diagnosis and treatment plan'
        ]
      };

      setIsLoading(false);
      return result;
      
    } catch (error) {
      console.error('Error getting veterinary guidance:', error);
      setError(error instanceof Error ? error.message : 'Failed to get veterinary guidance');
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    getGuidance,
    isLoading,
    error
  };
}
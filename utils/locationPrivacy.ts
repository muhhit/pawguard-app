// Temporarily disabled due to encoding issues in React Native
// import { latLngToCell, cellToLatLng } from 'h3-js';

// Mock functions to replace h3-js temporarily
const latLngToCell = (lat: number, lng: number, resolution: number): string => {
  // Simple mock that creates a pseudo-h3 index based on lat/lng and resolution
  const precision = Math.pow(10, resolution - 7); // Adjust precision based on resolution
  const roundedLat = Math.round(lat * precision) / precision;
  const roundedLng = Math.round(lng * precision) / precision;
  return `${resolution}-${roundedLat}-${roundedLng}`;
};

const cellToLatLng = (h3Index: string): [number, number] => {
  // Parse the mock h3 index back to lat/lng
  const parts = h3Index.split('-');
  if (parts.length === 3) {
    return [parseFloat(parts[1]), parseFloat(parts[2])];
  }
  // Fallback to original coordinates if parsing fails
  return [0, 0];
};

type UserType = 'owner' | 'public' | 'finder';

interface LocationUpdate {
  h3Index: string;
  originalLat: number;
  originalLng: number;
  userType: UserType;
  timestamp: number;
  processAt: number;
}

interface ProcessedLocation {
  lat: number;
  lng: number;
  precision: 'exact' | 'medium' | 'fuzzy';
  isDelayed: boolean;
}

class LocationPrivacyManager {
  private delayedQueue: LocationUpdate[] = [];
  private processedLocations: Map<string, ProcessedLocation> = new Map();

  private readonly resolutions = {
    owner: 10,  // 65m precision - exact location
    finder: 9,  // 174m precision - medium precision for reward claimants
    public: 7   // 1.2km precision - neighborhood level
  };

  private readonly precisionLabels = {
    owner: 'exact' as const,
    finder: 'medium' as const,
    public: 'fuzzy' as const
  };

  processLocation(lat: number, lng: number, userType: UserType, petId?: string): ProcessedLocation {
    const resolution = this.resolutions[userType];
    const h3Index = latLngToCell(lat, lng, resolution);
    const precision = this.precisionLabels[userType];
    
    // For owners, return exact location immediately
    if (userType === 'owner') {
      const result = {
        lat,
        lng,
        precision,
        isDelayed: false
      };
      
      if (petId) {
        this.processedLocations.set(`${petId}-${userType}`, result);
      }
      
      return result;
    }

    // For non-owners, add delay and fuzzy location
    const delaySeconds = 300; // 5-minute delay
    const processAt = Date.now() + (delaySeconds * 1000);
    
    const locationUpdate: LocationUpdate = {
      h3Index,
      originalLat: lat,
      originalLng: lng,
      userType,
      timestamp: Date.now(),
      processAt
    };

    this.delayedQueue.push(locationUpdate);
    
    // Return fuzzy location from H3 index
    const [fuzzyLat, fuzzyLng] = cellToLatLng(h3Index);
    
    const result = {
      lat: fuzzyLat,
      lng: fuzzyLng,
      precision,
      isDelayed: true
    };
    
    if (petId) {
      this.processedLocations.set(`${petId}-${userType}`, result);
    }
    
    return result;
  }

  processDelayedUpdates(): LocationUpdate[] {
    const now = Date.now();
    const readyToProcess = this.delayedQueue.filter(update => update.processAt <= now);
    
    // Remove processed items from queue
    this.delayedQueue = this.delayedQueue.filter(update => update.processAt > now);
    
    return readyToProcess.map(update => {
      const [lat, lng] = cellToLatLng(update.h3Index);
      return {
        ...update,
        lat,
        lng
      } as LocationUpdate & { lat: number; lng: number };
    });
  }

  getLocationForUser(petId: string, userType: UserType, ownerLat: number, ownerLng: number): ProcessedLocation {
    const cacheKey = `${petId}-${userType}`;
    const cached = this.processedLocations.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return this.processLocation(ownerLat, ownerLng, userType, petId);
  }

  getPrecisionRadius(userType: UserType): number {
    // Approximate radius in meters for each resolution
    const radiusMap = {
      owner: 65,    // H3 resolution 10
      finder: 174,  // H3 resolution 9
      public: 1200  // H3 resolution 7
    };
    
    return radiusMap[userType];
  }

  clearCache(petId?: string): void {
    if (petId) {
      // Clear specific pet's cached locations
      const keysToDelete = Array.from(this.processedLocations.keys())
        .filter(key => key.startsWith(`${petId}-`));
      
      keysToDelete.forEach(key => this.processedLocations.delete(key));
    } else {
      // Clear all cached locations
      this.processedLocations.clear();
    }
  }

  getQueueSize(): number {
    return this.delayedQueue.length;
  }
}

// Singleton instance
export const locationPrivacyManager = new LocationPrivacyManager();

// Utility functions
export const processLocation = (lat: number, lng: number, userType: UserType, petId?: string) => {
  return locationPrivacyManager.processLocation(lat, lng, userType, petId);
};

export const getLocationForUser = (petId: string, userType: UserType, ownerLat: number, ownerLng: number) => {
  return locationPrivacyManager.getLocationForUser(petId, userType, ownerLat, ownerLng);
};

export const getPrecisionRadius = (userType: UserType) => {
  return locationPrivacyManager.getPrecisionRadius(userType);
};

export type { UserType, ProcessedLocation };
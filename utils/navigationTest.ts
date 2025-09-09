import { router } from 'expo-router';

export interface NavigationTestResult {
  route: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

export class NavigationTester {
  private static results: NavigationTestResult[] = [];

  static async testRoute(route: string): Promise<NavigationTestResult> {
    const result: NavigationTestResult = {
      route,
      success: false,
      timestamp: Date.now()
    };

    try {
      console.log(`Testing navigation to: ${route}`);
      
      // Test if route exists by attempting navigation
      router.push(route as any);
      
      // Wait a bit to see if navigation succeeds
      await new Promise(resolve => setTimeout(resolve, 100));
      
      result.success = true;
      console.log(`✅ Navigation to ${route} successful`);
    } catch (error: any) {
      result.success = false;
      result.error = error.message || 'Unknown navigation error';
      console.error(`❌ Navigation to ${route} failed:`, error);
    }

    this.results.push(result);
    return result;
  }

  static async testAllRoutes(): Promise<NavigationTestResult[]> {
    const routes = [
      // Tab routes
      '/(tabs)',
      '/(tabs)/index',
      '/(tabs)/report-pet',
      '/(tabs)/hero-board', 
      '/(tabs)/map',
      '/(tabs)/profile',
      '/(tabs)/tracking',
      '/(tabs)/health',
      '/(tabs)/settings',
      '/(tabs)/community',
      '/(tabs)/messaging',
      
      // Stack routes
      '/auth',
      '/add-pet',
      '/pet-details',
      '/safe-zones',
      '/reward-claims',
      '/ai-features',
      '/messaging',
      '/conversations',
      '/conversation',
      '/premium-subscription',
      '/gamified-profile',
      '/ai-pet-scanner',
      '/real-time-map-demo',
      '/success-stories',
      '/notification-demo',
      '/error-handling-demo',
      '/offline-mode-demo'
    ];

    console.log('🧪 Starting comprehensive navigation test...');
    
    const results: NavigationTestResult[] = [];
    
    for (const route of routes) {
      const result = await this.testRoute(route);
      results.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`\n📊 Navigation Test Results:`);
    console.log(`✅ Successful: ${successCount}/${routes.length}`);
    console.log(`❌ Failed: ${failureCount}/${routes.length}`);
    
    if (failureCount > 0) {
      console.log('\n❌ Failed Routes:');
      results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.route}: ${r.error}`));
    }

    return results;
  }

  static getResults(): NavigationTestResult[] {
    return [...this.results];
  }

  static clearResults(): void {
    this.results = [];
  }

  static async testParameterizedRoute(
    route: string, 
    params: Record<string, string>
  ): Promise<NavigationTestResult> {
    const result: NavigationTestResult = {
      route: `${route} with params: ${JSON.stringify(params)}`,
      success: false,
      timestamp: Date.now()
    };

    try {
      console.log(`Testing parameterized navigation to: ${route}`, params);
      
      router.push({
        pathname: route as any,
        params
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      result.success = true;
      console.log(`✅ Parameterized navigation to ${route} successful`);
    } catch (error: any) {
      result.success = false;
      result.error = error.message || 'Unknown navigation error';
      console.error(`❌ Parameterized navigation to ${route} failed:`, error);
    }

    this.results.push(result);
    return result;
  }

  static async testCommonNavigationPatterns(): Promise<void> {
    console.log('🧪 Testing common navigation patterns...');

    // Test pet details navigation
    await this.testParameterizedRoute('/pet-details', {
      petId: 'test-pet-1',
      petName: 'Test Pet',
      petBreed: 'Test Breed',
      distance: '1.5',
      reward: '500',
      status: 'normal'
    });

    // Test conversation navigation
    await this.testParameterizedRoute('/conversation', {
      name: 'Test User',
      type: 'pet_owner',
      petName: 'Test Pet',
      petId: 'test-pet-1'
    });

    // Test modal navigation
    await this.testRoute('/add-pet');
    await this.testRoute('/premium-subscription');

    console.log('✅ Common navigation patterns tested');
  }
}

// Export convenience functions
export const testNavigation = NavigationTester.testRoute;
export const testAllNavigation = NavigationTester.testAllRoutes;
export const testNavigationPatterns = NavigationTester.testCommonNavigationPatterns;
export const getNavigationResults = NavigationTester.getResults;
export const clearNavigationResults = NavigationTester.clearResults;
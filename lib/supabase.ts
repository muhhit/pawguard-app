import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw at import time to avoid hard crash in dev; consumers should handle missing config.
  console.warn('Supabase environment variables are not set. Using mock data/fallbacks.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        debug: __DEV__,
      },
    })
  : ({} as any);

// Test connection on initialization
if (__DEV__ && supabase && (supabase as any).auth) {
  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connection test successful. Current session:', data.session ? 'Active' : 'None');
      }

      // Test database connection by trying to query a simple table
      const { error: dbError, count } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (dbError) {
        console.error('❌ Database connection test failed:', dbError.message);
        if (dbError.message.includes('relation "users" does not exist')) {
          console.error('🔧 The "users" table does not exist in your database. Please create it first.');
        }
      } else {
        console.log('✅ Database connection successful. Users table has', count, 'records');
      }
    } catch (error) {
      console.error('❌ Connection test error:', error);
    }
  };
  
  testConnection();
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          location_privacy_level: 'strict' | 'moderate' | 'open';
          show_exact_to_finders: boolean;
          custom_fuzzing_radius: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          location_privacy_level?: 'strict' | 'moderate' | 'open';
          show_exact_to_finders?: boolean;
          custom_fuzzing_radius?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          location_privacy_level?: 'strict' | 'moderate' | 'open';
          show_exact_to_finders?: boolean;
          custom_fuzzing_radius?: number;
          created_at?: string;
        };
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          type: string;
          breed: string | null;
          ownership: 'owned' | 'street';
          last_location: any; // PostGIS point
          reward_amount: number;
          is_found: boolean;
          photos: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          type: string;
          breed?: string | null;
          ownership?: 'owned' | 'street';
          last_location?: any;
          reward_amount?: number;
          is_found?: boolean;
          photos?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          type?: string;
          breed?: string | null;
          ownership?: 'owned' | 'street';
          last_location?: any;
          reward_amount?: number;
          is_found?: boolean;
          photos?: string[];
          created_at?: string;
        };
      };
      sightings: {
        Row: {
          id: string;
          pet_id: string;
          reporter_id: string;
          location: any; // PostGIS point
          notes: string | null;
          photo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          reporter_id: string;
          location: any;
          notes?: string | null;
          photo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          reporter_id?: string;
          location?: any;
          notes?: string | null;
          photo?: string | null;
          created_at?: string;
        };
      };
      reward_claims: {
        Row: {
          id: string;
          pet_id: string;
          claimer_id: string;
          owner_id: string;
          amount: number;
          status: 'pending' | 'approved' | 'rejected' | 'paid';
          evidence_photo: string | null;
          evidence_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          claimer_id: string;
          owner_id: string;
          amount: number;
          status?: 'pending' | 'approved' | 'rejected' | 'paid';
          evidence_photo?: string | null;
          evidence_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          claimer_id?: string;
          owner_id?: string;
          amount?: number;
          status?: 'pending' | 'approved' | 'rejected' | 'paid';
          evidence_photo?: string | null;
          evidence_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_push_tokens: {
        Row: {
          id: string;
          user_id: string;
          push_token: string;
          device_type: 'ios' | 'android' | 'web';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          push_token: string;
          device_type: 'ios' | 'android' | 'web';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          push_token?: string;
          device_type?: 'ios' | 'android' | 'web';
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_broadcasts: {
        Row: {
          id: string;
          pet_id: string;
          location: any; // PostGIS point
          recipients_count: number;
          broadcast_type: 'emergency' | 'update' | 'found';
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          location: any;
          recipients_count: number;
          broadcast_type: 'emergency' | 'update' | 'found';
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          location?: any;
          recipients_count?: number;
          broadcast_type?: 'emergency' | 'update' | 'found';
          created_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referee_id: string;
          reward_status: 'pending' | 'fulfilled' | 'expired';
          referrer_reward_type: 'premium_months' | 'credits' | 'pet_id_tag';
          referrer_reward_value: number;
          referee_reward_type: 'premium_months' | 'credits' | 'pet_id_tag';
          referee_reward_value: number;
          created_at: string;
          fulfilled_at: string | null;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referee_id: string;
          reward_status?: 'pending' | 'fulfilled' | 'expired';
          referrer_reward_type: 'premium_months' | 'credits' | 'pet_id_tag';
          referrer_reward_value: number;
          referee_reward_type: 'premium_months' | 'credits' | 'pet_id_tag';
          referee_reward_value: number;
          created_at?: string;
          fulfilled_at?: string | null;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referee_id?: string;
          reward_status?: 'pending' | 'fulfilled' | 'expired';
          referrer_reward_type?: 'premium_months' | 'credits' | 'pet_id_tag';
          referrer_reward_value?: number;
          referee_reward_type?: 'premium_months' | 'credits' | 'pet_id_tag';
          referee_reward_value?: number;
          created_at?: string;
          fulfilled_at?: string | null;
        };
      };
    };
    Functions: {
      users_within_radius: {
        Args: {
          center_lat: number;
          center_lng: number;
          radius_miles: number;
        };
        Returns: {
          id: string;
          email: string;
          name: string | null;
        }[];
      };
    };
  };
};

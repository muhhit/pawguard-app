module.exports = ({ config }) => ({
  ...config,
  extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '',
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
      oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  },
  });


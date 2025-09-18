let SentryMod: any = null;
try {
   
  SentryMod = require('@sentry/react-native');
} catch {}

export function initMonitoring() {
  try {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (dsn && SentryMod?.init) {
      SentryMod.init({ dsn, enableAutoSessionTracking: true, sessionTrackingIntervalMillis: 30000 });
    }
  } catch {}
}

export const crashReporting = {
  captureException: (error: Error, extra?: any) => {
    try { console.error(error); SentryMod?.captureException?.(error, { extra }); } catch {}
  }
};


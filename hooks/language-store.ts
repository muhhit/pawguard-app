import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { translations, t as translateFunction } from '@/constants/translations';

type Language = 'tr' | 'en';
type Currency = 'TRY' | 'USD' | 'EUR';

type LanguageContextType = {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  isLoading: boolean;
};

const LANGUAGE_STORAGE_KEY = 'app_language';
const CURRENCY_STORAGE_KEY = 'app_currency';

// Currency configurations
const currencyConfig = {
  TRY: { symbol: '₺', name: 'Turkish Lira', code: 'TRY' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
} as const;

// English translations (basic set for demonstration)
const englishTranslations = {
  // Navigation & Tabs
  tabs: {
    home: '🏠 Home',
    reportPet: '🚨 Report Pet',
    heroes: '🏆 Heroes',
    profile: '👤 Profile',
  },
  
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    share: 'Share',
    close: 'Close',
    required: 'Required',
    optional: 'Optional',
  },
  
  // Settings
  settings: {
    title: 'Settings',
    account: 'Account',
    personalInfo: 'Personal Information',
    premiumMembership: 'Premium Membership',
    paymentMethods: 'Payment Methods',
    features: 'Features',
    aiFeatures: 'AI Features',
    rewardClaims: 'Reward Claims',
    referralProgram: 'Referral Program',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    alertRadius: 'Alert Radius',
    soundAlerts: 'Sound Alerts',
    privacy: 'Privacy',
    locationPrivacy: 'Location Privacy',
    showExactToFinders: 'Show Exact Location to Verified Finders',
    securitySettings: 'Security Settings',
    partnerships: 'Business Partnerships',
    redditStrategy: 'Reddit Strategy',
    veterinaryPartnerships: 'Veterinary Partnerships',
    support: 'Support',
    helpFaq: 'Help & FAQ',
    liveSupport: 'Live Support',
    feedback: 'Feedback',
    session: 'Session',
    signOut: 'Sign Out',
    language: 'Language',
    languageSelection: 'Language Selection',
    turkish: 'Türkçe',
    english: 'English',
    selectLanguage: 'Select your preferred language',
    currency: 'Currency',
    currencySelection: 'Currency Selection',
    selectCurrency: 'Select your preferred currency',
  },
  
  // Add more English translations as needed
  home: {
    title: 'Home',
    searchPlaceholder: '🔍 Search lost pets...',
    loginRequired: 'Login required',
  },
  
  // Currency
  currency: {
    title: 'Currency',
    selectCurrency: 'Select Currency',
    turkishLira: 'Turkish Lira (₺)',
    usDollar: 'US Dollar ($)',
    euro: 'Euro (€)',
  },
  
  reportPet: {
    title: 'Report Lost Pet',
    subtitle: 'Every minute matters - let\'s act fast',
  },
  
  heroBoard: {
    title: 'Hero Board',
    subtitle: 'Real heroes of our community',
  },
  
  profile: {
    title: 'Profile',
    myProfile: 'My Profile',
  },
};

export const [LanguageProvider, useLanguage] = createContextHook((): LanguageContextType => {
  const [language, setLanguageState] = useState<Language>('tr');
  const [currency, setCurrencyState] = useState<Currency>('TRY');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language and currency on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const [savedLanguage, savedCurrency] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
        AsyncStorage.getItem(CURRENCY_STORAGE_KEY)
      ]);
      
      if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as Language);
      }
      
      if (savedCurrency && (savedCurrency === 'TRY' || savedCurrency === 'USD' || savedCurrency === 'EUR')) {
        setCurrencyState(savedCurrency as Currency);
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
      
      // Auto-set currency based on language if not explicitly set
      if (lang === 'tr' && currency === 'USD') {
        setCurrency('TRY');
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, [currency]);

  const setCurrency = useCallback(async (curr: Currency) => {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, curr);
      setCurrencyState(curr);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    const config = currencyConfig[currency];
    const formattedAmount = amount.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    // Turkish Lira symbol comes after the number
    if (currency === 'TRY') {
      return `${formattedAmount}${config.symbol}`;
    }
    
    // Other currencies symbol comes before the number
    return `${config.symbol}${formattedAmount}`;
  }, [currency, language]);

  const getCurrencySymbol = useCallback((): string => {
    return currencyConfig[currency].symbol;
  }, [currency]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const currentTranslations = language === 'tr' ? translations : englishTranslations;
    
    const keys = key.split('.');
    let value: any = currentTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Turkish if English translation not found
        if (language === 'en') {
          return translateFunction(key, params);
        }
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    // Replace parameters in the string
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  }, [language]);

  return useMemo(() => ({
    language,
    currency,
    setLanguage,
    setCurrency,
    t,
    formatCurrency,
    getCurrencySymbol,
    isLoading,
  }), [language, currency, setLanguage, setCurrency, t, formatCurrency, getCurrencySymbol, isLoading]);
});
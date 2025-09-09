// Mapbox configuration
export const MAPBOX_API_KEY = 'pk.eyJ1Ijoib2ctIiwiYSI6ImNtZjRmbm40aDA0bzIybHNremg5ajRoanQifQ.3y-bv35IQB2WBRbN6eeB9Q';

// Glass Morphism Design System with Turkish Flag Inspired Colors
export const glassColors = {
  // Turkish Flag Inspired Palette
  turkish: {
    red: '#E30A17',
    redLight: '#FF4757',
    redDark: '#C0392B',
    white: '#FFFFFF',
    cream: '#FFF8DC',
    gold: '#FFD700',
  },
  
  // Warm Gradient Colors (Purple to Orange)
  gradients: {
    primary: ['#667EEA', '#764BA2', '#F093FB'],
    warm: ['#FF9A9E', '#FECFEF', '#FECFEF'],
    sunset: ['#FF6B6B', '#FFE66D', '#FF6B35'],
    turkish: ['#E30A17', '#FF4757', '#FFD700'],
    purple: ['#A8EDEA', '#FED6E3', '#D299C2'],
    ocean: ['#667EEA', '#764BA2', '#667EEA'],
  },
  
  // Glass Morphism Base Colors
  glass: {
    light: {
      primary: 'rgba(255, 255, 255, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.15)',
      tertiary: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      primary: 'rgba(0, 0, 0, 0.2)',
      secondary: 'rgba(0, 0, 0, 0.15)',
      tertiary: 'rgba(0, 0, 0, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
};

export default {
  light: {
    text: "#1E293B",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    tint: "#E30A17",
    tabIconDefault: "rgba(255, 255, 255, 0.6)",
    tabIconSelected: "#E30A17",
    card: "rgba(255, 255, 255, 0.2)",
    border: "rgba(255, 255, 255, 0.3)",
    muted: "rgba(255, 255, 255, 0.7)",
    glass: "rgba(255, 255, 255, 0.2)",
  },
  dark: {
    text: "#F1F5F9",
    background: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)",
    tint: "#FF4757",
    tabIconDefault: "rgba(255, 255, 255, 0.4)",
    tabIconSelected: "#FF4757",
    card: "rgba(0, 0, 0, 0.2)",
    border: "rgba(255, 255, 255, 0.2)",
    muted: "rgba(255, 255, 255, 0.6)",
    glass: "rgba(0, 0, 0, 0.2)",
  },
  primary: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#E30A17",
    600: "#C0392B",
    700: "#A93226",
  },
  secondary: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
  },
  accent: {
    50: "#F0F9FF",
    100: "#E0F2FE",
    500: "#667EEA",
    600: "#764BA2",
    700: "#5A67D8",
  },
  pawGuard: {
    light: {
      glass: 'rgba(255,255,255,0.2)',
      emergencyAlert: 'rgba(227,10,23,0.15)',
      foundPet: 'rgba(52,199,89,0.15)',
      profileCard: 'rgba(255,255,255,0.2)',
      heroCard: 'rgba(255,215,0,0.15)',
      reportCard: 'rgba(255,107,107,0.15)',
    },
    dark: {
      glass: 'rgba(0,0,0,0.2)',
      emergencyAlert: 'rgba(255,71,87,0.2)',
      foundPet: 'rgba(48,209,88,0.2)',
      profileCard: 'rgba(0,0,0,0.2)',
      heroCard: 'rgba(255,215,0,0.2)',
      reportCard: 'rgba(255,107,107,0.2)',
    }
  },
};
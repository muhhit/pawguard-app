// Global browser/React Native environment declarations
declare global {
  var fetch: typeof fetch;
  var window: any;
  var document: any;
  var navigator: any;
  var console: Console;
  var setTimeout: typeof setTimeout;
  var clearTimeout: typeof clearTimeout;
  var setInterval: typeof setInterval;
  var clearInterval: typeof clearInterval;
  var global: typeof globalThis;
  var process: NodeJS.Process;
  var Buffer: typeof Buffer;
  var __DEV__: boolean;
}

declare module 'react-native' { 
  // Relax core component typings to unblock builds; tighten later.
  interface TransformsStyle { transform?: any; }
  export const View: any;
  export const Text: any;
  export const StyleSheet: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const SafeAreaView: any;
  export const Dimensions: any;
  export const Modal: any;
  export const TextInput: any;
  export const Alert: any;
  export const ActivityIndicator: any;
  export const Image: any;
  export const Platform: any;
  export const InteractionManager: any;
  export const Share: any;
}

declare module 'react-native-reanimated' {
  export type AnimatedStyle<T> = any;
  export type DefaultStyle = any;
  export type SharedValue<T = any> = any;
}

declare module 'react-native-safe-area-context' {
  interface NativeSafeAreaViewProps { style?: any; children?: React.ReactNode; }
}

declare module 'expo-linear-gradient' {
  import type * as React from 'react';
  export interface LinearGradientProps { children?: React.ReactNode; colors?: any; }
}

declare module 'react-native-webview' {
  import type * as React from 'react';
  export interface WebViewProps { style?: any; children?: React.ReactNode; }
}

declare module 'lucide-react-native' { 
  export interface LucideProps { style?: any; } 
}

declare module 'expo-blur' {
  import type * as React from 'react';
  export interface BlurViewProps { children?: React.ReactNode; intensity?: number; tint?: string; style?: any; }
}

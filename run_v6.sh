#!/bin/bash
set -euo pipefail

echo "== Build Stabilize v6: start =="

# 0) Preflight
[ -f app.json ] || { echo "Run in repo root (pawguard-app)"; exit 1; }

# 1) tsconfig — Expo/TS 5.8 uyumlu
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowJs": false,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["react", "react-native"],
    "typeRoots": ["./types", "./node_modules/@types"],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", "types/**/*.d.ts", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules", "ios", "android"]
}
EOF
echo "[v6] tsconfig.json written."

# 2) Global type augmentations
mkdir -p types
cat > types/overrides.d.ts <<'EOF'
declare module 'react-native' { interface TransformsStyle { transform?: any; } }
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
declare module 'lucide-react-native' { export interface LucideProps { style?: any; } }
declare module 'expo-blur' {
  import type * as React from 'react';
  export interface BlurViewProps { children?: React.ReactNode; intensity?: number; tint?: string; style?: any; }
}
EOF
echo "[v6] types/overrides.d.ts written."

# 3) Babel — Reanimated plugin
cat > babel.config.js <<'EOF'
module.exports = function (api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'], plugins: ['react-native-reanimated/plugin'] };
};
EOF
echo "[v6] babel.config.js written."

echo "== v6 basic setup done =="

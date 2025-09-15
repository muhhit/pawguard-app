// ESLint Flat Config for Expo/React Native (ESLint v9+)
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  // Base Expo config (includes React/TS presets)
  ...compat.extends('eslint-config-expo'),
  // Workspace ignores to keep Cline context lean and avoid 431 issues
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      '.expo',
      '.eas',
      'vendor/**',
      'assets/**',
      'ios/**',
      'android/**',
      'spec_tasks/**'
    ],
  },
];


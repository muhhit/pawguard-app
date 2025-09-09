// Simple platform-specific map component resolver
// This completely avoids react-native-maps on web
const { Platform } = require('react-native');

if (Platform.OS === 'web') {
  // Web implementation - use our web MapView
  const MapViewWeb = require('./MapView.web.tsx').default;
  module.exports = MapViewWeb;
} else {
  // Native implementation - use our native MapView that handles react-native-maps internally
  const MapViewNative = require('./MapView.native.tsx').default;
  module.exports = MapViewNative;
}
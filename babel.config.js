module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
      // Required for expo-router
      'expo-router/babel',
      // Must be last for Reanimated v3
      'react-native-reanimated/plugin',
    ],
  };
};

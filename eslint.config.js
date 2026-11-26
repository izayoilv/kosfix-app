const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = defineConfig([
  ...expoConfig,
  prettier,
  { ignores: ['android/**', 'ios/**', 'dist/**', '.superpowers/**'] },
  {
    files: ['jest.setup.js', '**/__tests__/**/*.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      'import/first': 'off',
    },
  },
]);

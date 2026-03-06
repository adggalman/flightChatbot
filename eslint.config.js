const js = require('@eslint/js');

  module.exports = [
      js.configs.recommended,
      {
          languageOptions: {
              globals: {
                  require: 'readonly',
                  process: 'readonly',
                  console: 'readonly',
                  __dirname: 'readonly',
                  module: 'readonly',
              }
          },
          rules: {
              'no-unused-vars': 'warn',
              'no-undef': 'error',
              'no-console': 'off',
          }
      }
  ];
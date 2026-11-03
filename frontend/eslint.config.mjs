import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.es2022 }, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: { ...js.configs.recommended.rules, 'no-unused-vars': 'warn', 'no-case-declarations': 'off' },
  },
  { files: ['src/**/*.jsx'], rules: { 'no-unused-vars': 'off' } },
];

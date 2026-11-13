// eslint.config.mts
import tsParser from '@typescript-eslint/parser';
import { eslintPluginVitestCodingStyle } from 'eslint-plugin-vitest-coding-style';

export default [
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ...eslintPluginVitestCodingStyle.configs.recommended,
    files: ['**/*.test.{ts,mts,tsx}'],
  },
];

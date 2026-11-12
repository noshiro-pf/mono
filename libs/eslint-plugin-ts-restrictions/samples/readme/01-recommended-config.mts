// eslint.config.mts
import tsParser from '@typescript-eslint/parser';
import { eslintPluginTsRestrictions } from 'eslint-plugin-ts-restrictions';

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
  eslintPluginTsRestrictions.configs.recommended,
];

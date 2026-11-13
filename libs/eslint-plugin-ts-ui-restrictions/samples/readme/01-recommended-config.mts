// eslint.config.mts
import tsParser from '@typescript-eslint/parser';
import { eslintPluginTsUiRestrictions } from 'eslint-plugin-ts-ui-restrictions';

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
  eslintPluginTsUiRestrictions.configs.recommended,
];

import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: ['build/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForNodeJs(['src/**', 'scripts/**']),

  {
    files: ['src/fetch-event-list-of-user.mts'],
    rules: defineKnownRules({
      // `Temporal` is not available on Node 22, the runtime these functions
      // are deployed to (`scripts/build.mts`). Revisit when that moves.
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    files: ['scripts/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
] satisfies readonly FlatConfig[];

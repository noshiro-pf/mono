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
    files: ['src/**'],
    rules: defineKnownRules({
      // The parameters this rule objects to are discord.js's own classes —
      // `Message`, `MessageReaction`, `Client`. They carry methods that mutate
      // the object they are called on, so a readonly form of them is not
      // something this app can construct or pass along. Same reason
      // github-settings-as-code turns it off for the code that wraps octokit.
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }),
  },

  {
    files: ['src/utils/date-utils.mts'],
    rules: defineKnownRules({
      // `Temporal` is not available on Node 22, which is the floor this
      // repository declares in `engines`. Revisit when that floor moves.
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

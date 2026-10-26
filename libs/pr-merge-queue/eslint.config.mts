import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: [
      // test/dist_/ has its own tsconfig and type-checks the built dist/
      // output (see scripts/cmd/check-dist.mts).
      'test/dist_/**',
    ],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  eslintConfigForNodeJs(['src/**']),
  {
    files: ['src/**'],
    rules: defineKnownRules({
      // Pages, retries and the queue's steps are sequential by design: each
      // request depends on the last, and the queue lands one pull request at
      // a time.
      'no-await-in-loop': 'off',
      // `engines` names a Node.js that has `Temporal` only behind a flag
      // (`lib/time.mts`).
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    files: ['src/cmd/**'],
    rules: defineKnownRules({
      'import-x/no-internal-modules': 'off',
    }),
  },

  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

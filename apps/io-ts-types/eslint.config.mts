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

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    files: ['src/**/*.test.mts'],
    rules: defineKnownRules({
      // The rule's autofix rewrites `describe('Ymdhm', …)` to
      // `describe(Ymdhm, …)`, which assumes the identifier is callable. The
      // names these tests use are ts-fortress `Type` objects, so the rewrite
      // does not type-check.
      'vitest/prefer-describe-function-title': 'off',
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

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
] satisfies readonly FlatConfig[];

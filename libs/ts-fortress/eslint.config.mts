import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import {
  eslintPluginTsDataForge,
  type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';
import { repositoryRootPath } from './scripts/repository-root-path.mjs';

export default [
  {
    // Each workspace package under packages/ has its own flat config
    // (and its own tsconfig, which the typed linter needs).
    ignores: ['packages/**', 'agents/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: repositoryRootPath,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [repositoryRootPath],
  }),

  {
    rules: defineKnownRules({
      'import-x/no-unused-modules': 'off',
    }),
  },
  {
    plugins: { 'ts-data-forge': eslintPluginTsDataForge },
    rules: {
      'ts-data-forge/prefer-canonical-array-slicing': 'error',
      'ts-data-forge/prefer-arr-is-min-length-array': 'error',
      'ts-data-forge/prefer-arr-is-max-length-array': 'error',
      'ts-data-forge/prefer-arr-is-bounded-length-array': 'error',
      'ts-data-forge/prefer-arr-is-fixed-length-array': 'error',
      'ts-data-forge/prefer-arr-is-array': 'error',
      'ts-data-forge/prefer-arr-is-non-empty': 'error',
      'ts-data-forge/prefer-arr-sum': 'error',
      'ts-data-forge/prefer-as-int': 'error',
      'ts-data-forge/prefer-is-non-null-object': 'error',
      'ts-data-forge/prefer-range-for-loop': 'error',
      'ts-data-forge/prefer-is-record-and-has-key': 'error',
      'ts-data-forge/prefer-num-safe-parse-int': 'error',
      'ts-data-forge/prefer-num-safe-parse-float': 'error',
      'ts-data-forge/no-unnecessary-type-guard': ['error', { ignore: [] }],
      'ts-data-forge/prefer-comparison-over-nullish-guard': 'error',
    } satisfies EslintTsDataForgeRules,
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      // ts-repo-utils' API surface still references `Result` as an ambient
      // type. Until that is migrated to named imports, type narrowing of
      // its return values reports as `any` here.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    }),
  },
  {
    files: ['configs/**/*', '.markdownlint-cli2.mjs'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
    }),
  },
] satisfies readonly FlatConfig[];

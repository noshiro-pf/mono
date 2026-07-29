import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import {
  eslintPluginTsDataForge,
  type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';
import { repositoryRootPath } from '../../scripts/repository-root-path.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

export default [
  {
    ignores: [
      'docs/**',
      // test/dist_/ has its own tsconfig and type-checks the built dist/
      // output (see scripts/cmd/build.mts); it is excluded from the package
      // tsconfig, so the typed-linter cannot parse it.
      'test/dist_/**',
    ],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: workspaceRootPath,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [workspaceRootPath, repositoryRootPath],
  }),

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

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      'import-x/no-unused-modules': 'off',
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    files: ['test/**/*.mts', '**/*.test.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-fill-with-reference-type': 'off',
    }),
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
    }),
  },
  {
    files: ['configs/**/*'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
    }),
  },

  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': 'off',
    }),
  },

  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-internal-modules': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'functional/immutable-data': 'off',
    }),
  },
] satisfies readonly FlatConfig[];

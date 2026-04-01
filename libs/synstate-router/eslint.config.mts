import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTsDataForge,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  typescriptEslintRules,
  type FlatConfig,
} from 'eslint-config-typed';
import { projectRootPath } from '../../scripts/project-root-path.mjs';

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [import.meta.dirname, projectRootPath],
  }),

  eslintConfigForTsDataForge(),

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ...typescriptEslintRules['@typescript-eslint/no-shadow'][1],
          allow: ['Observable'],
        },
      ],
    }),
  },
  {
    files: ['test/**/*.mts', '**/*.test.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/expect-expect': 'off',
      'vitest/prefer-describe-function-title': 'off',
      'unicorn/consistent-function-scoping': 'off',
    }),
  },

  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': 'off',
      'import-x/export': 'off',
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
] satisfies readonly FlatConfig[];

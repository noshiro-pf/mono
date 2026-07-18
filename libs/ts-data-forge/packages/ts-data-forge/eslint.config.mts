import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTsDataForge,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import { projectRootPath } from '../../scripts/project-root-path.mjs';
import { restrictedImports } from './configs/eslint/rules/eslint-no-restricted-imports-option.mjs';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: ['.eslintrc.cjs', 'docs/**', 'agents/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir, projectRootPath],
  }),

  eslintConfigForTsDataForge(['samples/**', 'scripts/**', 'configs/**']),

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': [
        'error',
        ...restrictedImports,
      ],

      'unicorn/prefer-temporal': ['warn', {}], // todo
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
      // Tests often assert conditionally and may omit explicit expectations in helper-driven flows
      'vitest/no-conditional-expect': 'off',
      'vitest/expect-expect': 'off',
      'unicorn/consistent-function-scoping': 'off',
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

  {
    files: ['src/**'],
    rules: defineKnownRules({
      'unicorn/prefer-number-is-safe-integer': 'off',

      'import-x/no-unused-modules': [
        'error',
        {
          unusedExports: true,
          ignoreExports: ['src/entry-point.mts', 'src/types.mts'],
        },
      ],
    }),
  },
  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': 'off',
      'import-x/export': 'off',
      '@stylistic/padding-line-between-statements': 'off',
    }),
  },

  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-internal-modules': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'functional/immutable-data': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    }),
  },
] satisfies readonly FlatConfig[];

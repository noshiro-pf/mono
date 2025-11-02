import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: ['.eslintrc.cjs'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintConfigForVitest(),

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
    files: ['configs/**/*', '.markdownlint-cli2.mjs'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
    }),
  },

  {
    files: ['src/**'],
    rules: defineKnownRules({
      'import-x/no-unused-modules': [
        'error',
        { unusedExports: true, ignoreExports: ['src/entry-point.mts'] },
      ],
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
] satisfies FlatConfig[];

import {
  defineKnownRules,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: defineKnownRules({
      // Allow any in tests
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow console in tests
      'no-console': 'off',
    }),
  },
  {
    files: ['scripts/**/*.ts'],
    rules: defineKnownRules({
      // Allow console in scripts
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
    }),
  },
] satisfies FlatConfig[];

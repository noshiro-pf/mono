import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [import.meta.dirname],
  }),
  eslintConfigForNodeJs(),
  {
    rules: defineKnownRules({
      // Allow console in Node.js
      'no-console': 'off',
    }),
  },
] satisfies FlatConfig[];

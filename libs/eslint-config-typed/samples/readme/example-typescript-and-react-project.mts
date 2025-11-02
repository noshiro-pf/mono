import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  { ignores: ['**/dist/**', '**/build/**', '**/.next/**', 'public/**'] },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  ...eslintConfigForReact(['src/**']),
  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import/no-unassigned-import': 'off',
      'import/no-internal-modules': 'off',
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
    }),
  },
] satisfies FlatConfig[];

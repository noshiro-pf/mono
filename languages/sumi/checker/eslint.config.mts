import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintConfigForVitest(),

  eslintConfigForNodeJs(['scripts/**', 'configs/**', 'src/**', 'test/**']),
  {
    files: ['src/**', 'test/**'],
    rules: defineKnownRules({
      // TypeScript 7 ships its JavaScript API only under subpaths --
      // `typescript-native/unstable/sync` and `.../unstable/ast` -- and its
      // `exports` map declares each one. There is no root entry to import
      // instead (`.` is the version string).
      'import-x/no-internal-modules': 'off',
    }),
  },
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': 'off',
      '@stylistic/padding-line-between-statements': 'off',
    }),
  },
] satisfies readonly FlatConfig[];

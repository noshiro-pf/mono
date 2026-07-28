import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
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

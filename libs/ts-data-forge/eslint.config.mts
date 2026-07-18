import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTsDataForge,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { projectRootPath } from './scripts/project-root-path.mjs';

export default [
  {
    ignores: ['packages/**', 'agents/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: projectRootPath,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [projectRootPath],
  }),

  eslintConfigForTsDataForge(),

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
] satisfies readonly FlatConfig[];

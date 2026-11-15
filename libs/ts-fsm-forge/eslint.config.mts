import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

export default [
  {
    ignores: ['dist/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: workspaceRootPath,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [workspaceRootPath],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,

  eslintConfigForVitest(),

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
      // ts-repo-utils' API surface still references `Result` as an ambient
      // type, so narrowing its return values reports as `any` here.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    }),
  },
  {
    files: ['configs/**/*'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: ['dist/**'],
  },

  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,

  ...eslintConfigForReact(),

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
  {
    files: ['configs/**/*'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
    }),
  },
] satisfies readonly FlatConfig[];

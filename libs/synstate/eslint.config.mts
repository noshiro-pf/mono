import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { projectRootPath } from './scripts/project-root-path.mjs';

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: projectRootPath,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [projectRootPath],
  }),
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
] satisfies readonly FlatConfig[];

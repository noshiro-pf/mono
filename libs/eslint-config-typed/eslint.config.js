import {
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
} from 'eslint-config-typed';
import 'ts-repo-utils';

const thisDir = import.meta.dirname;

/** @returns {readonly import('eslint-config-typed').FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['**/dist/**'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  eslintFlatConfigForVitest(),

  {
    files: ['scripts/**', 'configs/**'],
    rules: {
      'no-await-in-loop': 'off',
      'import/no-unassigned-import': 'off',
      'import/no-internal-modules': 'off',
      'import/no-default-export': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },
  {
    files: ['src/types/rules/*.mts'],
    rules: { 'functional/readonly-type': ['error', 'keyword'] },
  },
  {
    files: [
      'src/plugins/total-functions/rules/**',
      'src/plugins/tree-shakable/rules/**',
    ],
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
];

export default defineConfig();

import {
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
} from 'eslint-config-typed';
import 'ts-repo-utils';

const thisDir = import.meta.dirname;

/** @returns {readonly import('eslint-config-typed').FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['eslint.config.js', 'dist', 'coverage'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  eslintFlatConfigForVitest(),

  {
    files: ['test/**/*.mts', '**/*.test.mts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      'unicorn/consistent-function-scoping': 'off',
    },
  },

  {
    files: ['scripts/**', 'configs/**'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import/no-unassigned-import': 'off',
      'import/no-internal-modules': 'off',
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },
  {
    files: ['samples/**/*'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'import/no-internal-modules': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'functional/immutable-data': 'off',
    },
  },
  {
    files: ['configs/**/*', '.markdownlint-cli2.mjs'],
    rules: {
      'import/no-default-export': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
];

export default defineConfig();

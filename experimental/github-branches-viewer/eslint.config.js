import {
  eslintFlatConfigForReact,
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: ['**/dist/**', '.vite/**', 'src/vite-env.d.ts', 'vite.config.js'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  eslintFlatConfigForVitest(),
  ...eslintFlatConfigForReact(),

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
];

import {
  eslintConfigForReact,
  eslintConfigForTestingLibrary,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';

export default [
  { ignores: ['**/dist/**', '**/coverage/**'] },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [import.meta.dirname],
  }),
  ...eslintConfigForReact(),
  eslintConfigForVitest(),
  eslintConfigForTestingLibrary(),
] satisfies readonly FlatConfig[];

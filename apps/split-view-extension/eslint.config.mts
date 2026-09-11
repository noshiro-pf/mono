import {
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';

const thisDir = import.meta.dirname;

export default [
  {
    // The Chrome Web Store package `pnpm run pack` stages: a copy of the built
    // output, which is not source and is not in any tsconfig.
    ignores: ['pack/**'],
  },

  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsDataForge.configs.recommended,

  ...eslintConfigForReact(),
] satisfies readonly FlatConfig[];

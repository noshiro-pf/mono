import {
  eslintConfigForPlaywright,
  eslintConfigForSynstateDom,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

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

  // Accessibility, reading synstate-dom's `constant(x)` as `x`.
  eslintConfigForSynstateDom(['src/**/*.tsx']),

  eslintPluginTsDataForge.configs.recommended,

  eslintConfigForPlaywright(['e2e/**']),

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

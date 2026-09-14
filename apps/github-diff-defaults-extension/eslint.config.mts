import {
  eslintConfigForBrowser,
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

  // `src/` is the content script and what it decides; it runs inside a page
  // someone else wrote. `scripts/` and `configs/` are Node, and are left out of
  // this deliberately: the globals the browser rules guard against — `name`,
  // `top`, `close`, `status` — are ordinary identifiers there.
  eslintConfigForBrowser(['src/**/*.mts']),
] satisfies readonly FlatConfig[];

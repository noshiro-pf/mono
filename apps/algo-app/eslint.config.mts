import {
  defineKnownRules,
  eslintConfigForPlaywright,
  eslintConfigForSynstateDom,
  eslintConfigForTypeScript,
  eslintImportsRules,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  // Accessibility, reading synstate-dom's `constant(x)` as `x`.
  eslintConfigForSynstateDom(['src/**/*.tsx']),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  {
    files: ['test/browser/**'],
    rules: defineKnownRules({
      // A browser test mounts a component from its directory's barrel, and
      // drives the page through `vitest/browser`.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            '**/src/*/index.mjs',
            'vitest/browser',
          ],
        },
      ],
    }),
  },

  eslintConfigForPlaywright(['e2e/**']),

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForSynstateDom,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [import.meta.dirname],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  // Accessibility, reading synstate-dom's `constant(x)` as `x`, for the
  // samples the pages show.
  eslintConfigForSynstateDom(['samples/**/*.tsx']),
  {
    files: ['samples/control-flow/05-portal.tsx'],
    rules: defineKnownRules({
      // The sample shows `Portal` with a `div` given the dialog role: a
      // `dialog` element opened with `showModal()` goes to the top layer and
      // needs no portal, and one opened with `open` is not modal. Turned off
      // here rather than on the line, so that the page shows the sample with no
      // directive in it.
      'synstate-dom-a11y/prefer-tag-over-role': 'off',
    }),
  },

  {
    ignores: ['.astro/**', 'src/content.config.ts', 'astro.config.mjs'],
  },

  eslintConfigForNodeJs(['scripts/**']),
  {
    files: ['scripts/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-internal-modules': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

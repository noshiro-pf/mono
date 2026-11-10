import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForSynstateDom,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
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

  // Accessibility, reading synstate-dom's `constant(x)` as `x`.
  eslintConfigForSynstateDom(['src/**/*.tsx', 'samples/**/*.tsx']),
  {
    files: ['src/**/*.tsx'],
    rules: defineKnownRules({
      // The markup is Blueprint's, element for element, so that
      // `visual-parity.test.tsx` compares it with Blueprint's own: its roles
      // on `div`s, its focus traps and backdrops that take clicks, and the
      // focus it moves into an overlay. The rules that read values (roles,
      // `aria-*`, `alt`, `href`) stay on.
      'synstate-dom-a11y/click-events-have-key-events': 'off',
      'synstate-dom-a11y/interactive-supports-focus': 'off',
      'synstate-dom-a11y/no-autofocus': 'off',
      'synstate-dom-a11y/no-noninteractive-tabindex': 'off',
      'synstate-dom-a11y/no-static-element-interactions': 'off',
      'synstate-dom-a11y/prefer-tag-over-role': 'off',
    }),
  },

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    // `local-noon.mts` is that arithmetic's one way to build a `Date`; it sits in
    // `internal/` so that the barrel does not publish it.
    files: ['src/date/**', 'src/internal/local-noon.mts'],
    rules: defineKnownRules({
      // `Temporal` is not in every browser the pickers run in, nor on Node
      // 22, which this repository's `engines` floor and the Node.js test
      // project run on. `Date` is used for the calendar arithmetic alone, at
      // noon, behind the 1-based `WallClock`.
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    files: ['test/**'],
    rules: defineKnownRules({
      // `samples.test.tsx` runs the README samples, which are modules of
      // their own rather than part of the package; `visual-parity.test.tsx`
      // loads Blueprint's style sheets, which are published as files, and
      // takes screenshots through `vitest/browser`.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            '**/samples/readme/*',
            '@blueprintjs/*/lib/css/*.css',
            'vitest/browser',
          ],
        },
      ],
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

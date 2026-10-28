import {
  defineKnownRules,
  eslintConfigForPlaywright,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

const thisDir = import.meta.dirname;

export default [
  {
    // The bundle `../event-schedule-app-functions` builds for Cloud Functions.
    ignores: ['functions-build/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  ...eslintConfigForReact(),

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // Most component files here export the component *and* the props type or
      // the styled parts that go with it. Splitting each of those in two to
      // satisfy Fast Refresh would make the app harder to read for no gain.
      'react-refresh/only-export-components': 'off',

      // `Temporal` is not available on Node 22, which is the floor this
      // repository declares in `engines`, and this app's calendar arithmetic
      // is the same `Date` arithmetic `apps/ts-fortress-types` turns the rule
      // off for. Revisit when that floor moves.
      'unicorn/prefer-temporal': 'off',
    }),
  },
  {
    // Firebase is reached only through `src/api/`, which builds the `Api` the
    // stores are handed — so a store's test can hand it a fake instead (#2094).
    // Types may still be imported anywhere.
    files: ['src/**'],
    ignores: ['src/api/**'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          patterns: [
            {
              group: ['firebase/*', '@firebase/*'],
              allowTypeImports: true,
              message:
                'Reach Firebase through the `Api` from src/api/, so that a test can hand a fake one in.',
            },
          ],
        }),
      ],
    }),
  },
  eslintConfigForPlaywright(['e2e/**']),

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

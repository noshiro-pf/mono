import { eslintConfigOffForSumiCheck } from '@sumi-lang/cli';
import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
  typescriptEslintRules,
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

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ...typescriptEslintRules['@typescript-eslint/no-shadow'][1],
          allow: ['Observable'],
        },
      ],
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            'zustand/vanilla',
            'jotai/vanilla',
            'jotai/vanilla/utils',
            'valtio/vanilla',
            'rxjs/fetch',
          ],
        },
      ],
    }),
  },
  {
    files: ['test/**/*.mts', '**/*.test.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      // Tests often assert conditionally and may omit explicit expectations in helper-driven flows
      'vitest/no-conditional-expect': 'off',
      'vitest/expect-expect': 'off',
      'unicorn/consistent-function-scoping': 'off',
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

  {
    files: ['src/**'],
    rules: defineKnownRules({
      'functional/no-class-inheritance': 'off',
    }),
  },

  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': 'off',
      'import-x/export': 'off',
    }),
  },

  ...eslintConfigForReact(['samples/**']),
  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'react-refresh/only-export-components': 'off',
      'react/button-has-type': 'off',
      'react/jsx-no-bind': 'off',
      'react-perf/jsx-no-new-function-as-prop': 'off',
      'react/no-array-index-key': 'off',
      // The samples show how synstate is used, in the plain React the reader
      // knows; memoizing every one of them would bury that under this
      // repository's component style.
      'react-coding-style/require-react-memo': 'off',
      'functional/immutable-data': 'off',
      'functional/no-let': 'off',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          whitelist: ['synstate-react-hooks', 'synstate-react-hooks-compat'],
        },
      ],
    }),
  },

  // Each sample's `createSearch` returns its library's own handle (an
  // observable, an atom, a store), whose inferred type is what the page shows;
  // spelled out, it would bury the code being compared.
  {
    files: ['samples/docs-site/async-comparison/**/01-search.*.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
    }),
  },

  // Solid's root export is its server build under Node, where nothing
  // reacts; the benchmark and the async comparison import the client build
  // through a shim (`solid-js-client.mts`, beside the files it serves), and a
  // bare import would measure, or test, a graph that never updates.
  {
    files: [
      'samples/docs-site/benchmark/**',
      'samples/docs-site/async-comparison/**',
    ],
    ignores: ['**/*.d.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          // `solid-js/store`, `solid-js/web` and the rest resolve to server
          // builds too. The shim's own deep import is exempted beside it, and
          // a type-only import is allowed, since it is erased.
          patterns: [
            {
              regex: String.raw`^solid-js(?:/|$)`,
              allowTypeImports: true,
              message:
                'Import Solid through the `solid-js-client.mjs` shim at the top of this sample directory, whose client build reacts under Node.',
            },
          ],
        }),
      ],
    }),
  },

  // src/ is what `pnpm run check:sumi` checks (tsconfig.sumi.json), so the
  // ESLint rules Sumi covers are turned off there and a diagnostic is
  // answered by its `@sumi-expect-error` marker alone (D-46). Last, to win
  // the merge.
  {
    ...eslintConfigOffForSumiCheck,
    files: ['src/**'],
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

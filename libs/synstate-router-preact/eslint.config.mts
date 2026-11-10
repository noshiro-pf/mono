import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForPreact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  mergeRestrictedImportsOptions,
  restrictedImportsOptionsForPreact,
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
    files: ['src/**/*.tsx', 'src/create-preact-router.mts', 'test/**/*.tsx'],
    rules: defineKnownRules({
      // Preact's prop and event types (`AnchorHTMLAttributes`,
      // `TargetedMouseEvent`) are not readonly, and nothing here can make them
      // so; a component does not mutate its props.
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }),
  },

  {
    files: ['test/**'],
    rules: defineKnownRules({
      // A route without params or search has `{}` for them, which the type
      // tests spell out.
      '@typescript-eslint/no-generated-empty-object-type': 'off',
      // A type test asserts with `expectType` alone.
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['assert', 'assert.*', 'expect', 'expectType'] },
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

  ...eslintConfigForPreact(['src/**', 'samples/**']),
  {
    files: ['src/**'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptionsForPreact, {
          paths: [
            {
              name: 'preact/compat',
              message:
                "importing preact/compat rewrites every element's props in the application that installs this package (onChange on a text input becomes onInput); use preact and preact/hooks.",
            },
          ],
        }),
      ],
    }),
  },
  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'react/jsx-no-bind': 'off',
      'react-perf/jsx-no-new-function-as-prop': 'off',
      'react-perf/jsx-no-new-object-as-prop': 'off',
      'react-perf/jsx-no-jsx-as-prop': 'off',
      'react/no-unstable-nested-components': 'off',
      // The samples show how the package is used, in the plain Preact the
      // reader knows; memoizing every one of them would bury that under this
      // repository's component style.
      'react-coding-style/require-react-memo': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

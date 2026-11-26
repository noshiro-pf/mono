import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
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
    files: ['test/**/*.mts'],
    rules: defineKnownRules({
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

  // What src/ imports from ts-data-forge at run time is in every bundle that
  // uses synstate-i18n. esbuild keeps an object such as `Arr` whole once a
  // module uses any member of it, when the object comes from the package root.
  // So src/ imports `Arr` as `import * as Arr from 'ts-data-forge/array'`,
  // which esbuild tree-shakes, and from the root only the standalone functions
  // below. The ts-data-forge rules' fixes still import from the package root,
  // so a fix that adds `Arr` is reported here; move that import to the subpath
  // by hand.
  {
    files: ['src/**'],
    ignores: ['src/**/*.test.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          paths: [
            {
              name: 'ts-data-forge',
              allowImportNames: ['hasKey', 'isNonNullObject'],
              allowTypeImports: true,
              message:
                "synstate-i18n src/ imports only standalone functions from the ts-data-forge root, and `Arr` from 'ts-data-forge/array'; see the comment in eslint.config.mts.",
            },
          ],
        }),
      ],
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];

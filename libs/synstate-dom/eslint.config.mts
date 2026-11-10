import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForSynstateDom,
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

  // Accessibility, reading `constant(x)` as `x`, for the README samples.
  eslintConfigForSynstateDom(['samples/**/*.tsx']),

  {
    rules: defineKnownRules({
      // The `JSX` namespace has to declare an `Element` type of its own.
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ...typescriptEslintRules['@typescript-eslint/no-shadow'][1],
          allow: ['Element'],
        },
      ],
      // The DOM nodes a mount creates and moves are mutable by nature, as the
      // elements the shared configuration already allows are.
      '@typescript-eslint/prefer-readonly-parameter-types': [
        'error',
        {
          ...typescriptEslintRules[
            '@typescript-eslint/prefer-readonly-parameter-types'
          ][1],
          allow: [
            ...typescriptEslintRules[
              '@typescript-eslint/prefer-readonly-parameter-types'
            ][1].allow,
            { from: 'lib', name: ['ChildNode', 'Comment', 'Node', 'Text'] },
          ],
        },
      ],
    }),
  },

  {
    files: ['test/**'],
    rules: defineKnownRules({
      // `samples.test.tsx` runs the README samples, which are modules of
      // their own rather than part of the package.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            '**/samples/readme/*',
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

  // What src/ imports from ts-data-forge at run time is in every bundle that
  // uses synstate-dom. esbuild keeps an object such as `Arr` whole
  // once a module uses any member of it, when the object comes from the
  // package root. So src/ imports `Arr` as
  // `import * as Arr from 'ts-data-forge/array'`, which tree-shakes, and from
  // the root only the names below, each standalone or (`Optional`, `Result`)
  // what synstate's own API is built on. Add a standalone function to the
  // list, never an object. Tests are bundled by nobody. The paths are merged
  // with eslint-config-typed's index-file pattern, which a block that sets the
  // rule would otherwise drop. The ts-data-forge rules' fixes still import
  // from the package root (#3093), so a fix that adds `Arr` or an object is
  // reported here; move that import to the subpath by hand.
  // test/eslint-config.test.mts checks that this is in effect.
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
              allowImportNames: [
                'Optional',
                'Result',
                'expectType',
                'hasKey',
                'isBoolean',
                'isNumber',
                'isRecord',
                'isString',
                'unknownToString',
              ],
              allowTypeImports: true,
              message:
                "synstate-dom src/ imports only standalone functions, `Optional` and `Result` from the ts-data-forge root, and `Arr` from 'ts-data-forge/array'; see the comment in eslint.config.mts.",
            },
          ],
        }),
      ],
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
